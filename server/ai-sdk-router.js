import express from 'express';

function mask(value) {
  if (!value) return '(empty)';
  const v = String(value);
  if (v.length <= 7) return '*'.repeat(v.length);
  return `${v.slice(0, 4)}…${v.slice(-3)}`;
}

function makeReqId(prefix = 'aisdk') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function slog(evt, obj) {
  try {
    console.log('[AI-SERVER]', evt, JSON.stringify(obj));
  } catch {
    console.log('[AI-SERVER]', evt, obj);
  }
}

// Dynamic provider loader to avoid hard dependency until installed
async function loadProvider(provider, apiKeys) {
  const name = (provider || 'google').toLowerCase();
  switch (name) {
    case 'google': {
      const mod = await import('@ai-sdk/google').catch(() => null);
      if (!mod) throw new Error("Provider '@ai-sdk/google' not installed");
      const { createGoogleGenerativeAI } = mod;
      const key =
        apiKeys.__DEV_GOOGLE_API_KEY__ || apiKeys.GOOGLE_API_KEY || apiKeys.GEMINI_API_KEY || '';
      if (!key) {
        const src = apiKeys.__DEV_GOOGLE_API_KEY__
          ? '__DEV_GOOGLE_API_KEY__'
          : apiKeys.GOOGLE_API_KEY
            ? 'GOOGLE_API_KEY'
            : apiKeys.GEMINI_API_KEY
              ? 'GEMINI_API_KEY'
              : '(none)';
        console.warn('[AI-SERVER] google: missing API key. checked sources ->', src);
        console.warn(
          '[AI-SERVER] google: available keys in apiKeys:',
          Object.keys(apiKeys).filter((k) => k.includes('API') || k.includes('KEY'))
        );
        throw new Error('Missing GOOGLE_API_KEY/GEMINI_API_KEY');
      }

      console.log(
        '[AI-SERVER] google: using API key from source:',
        apiKeys.__DEV_GOOGLE_API_KEY__
          ? '__DEV_GOOGLE_API_KEY__'
          : apiKeys.GOOGLE_API_KEY
            ? 'GOOGLE_API_KEY'
            : apiKeys.GEMINI_API_KEY
              ? 'GEMINI_API_KEY'
              : 'unknown'
      );
      if (typeof createGoogleGenerativeAI !== 'function') {
        throw new Error("'createGoogleGenerativeAI' not available in '@ai-sdk/google'");
      }
      const googleClient = createGoogleGenerativeAI({ apiKey: key });
      return {
        modelFactory: (modelName) => googleClient(modelName),
        defaultModel: 'gemini-2.0-flash',
      };
    }
    case 'openai': {
      const mod = await import('@ai-sdk/openai').catch(() => null);
      if (!mod) throw new Error("Provider '@ai-sdk/openai' not installed");
      const { createOpenAI } = mod;
      const key = apiKeys.OPENAI_API_KEY || '';
      if (!key) {
        console.warn('[AI-SERVER] openai: missing OPENAI_API_KEY');
        throw new Error('Missing OPENAI_API_KEY');
      }
      if (typeof createOpenAI !== 'function') {
        throw new Error("'createOpenAI' not available in '@ai-sdk/openai'");
      }
      const openaiClient = createOpenAI({ apiKey: key });
      return { modelFactory: (modelName) => openaiClient(modelName), defaultModel: 'gpt-4o-mini' };
    }
    case 'anthropic': {
      const mod = await import('@ai-sdk/anthropic').catch(() => null);
      if (!mod) throw new Error("Provider '@ai-sdk/anthropic' not installed");
      const { createAnthropic } = mod;
      const key = apiKeys.ANTHROPIC_API_KEY || '';
      if (!key) {
        console.warn('[AI-SERVER] anthropic: missing ANTHROPIC_API_KEY');
        throw new Error('Missing ANTHROPIC_API_KEY');
      }
      if (typeof createAnthropic !== 'function') {
        throw new Error("'createAnthropic' not available in '@ai-sdk/anthropic'");
      }
      const anthropicClient = createAnthropic({ apiKey: key });
      return {
        modelFactory: (modelName) => anthropicClient(modelName),
        defaultModel: 'claude-3-5-sonnet-latest',
      };
    }
    case 'cohere': {
      const mod = await import('@ai-sdk/cohere').catch(() => null);
      if (!mod) throw new Error("Provider '@ai-sdk/cohere' not installed");
      const { createCohere } = mod;
      const key = apiKeys.COHERE_API_KEY || '';
      if (!key) {
        console.warn('[AI-SERVER] cohere: missing COHERE_API_KEY');
        throw new Error('Missing COHERE_API_KEY');
      }
      if (typeof createCohere !== 'function') {
        throw new Error("'createCohere' not available in '@ai-sdk/cohere'");
      }
      const cohereClient = createCohere({ apiKey: key });
      return {
        modelFactory: (modelName) => cohereClient(modelName),
        defaultModel: 'command-r-plus',
      };
    }
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

function toCoreMessages(messages = []) {
  return messages
    .filter((m) => m && m.role && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: m.content }));
}

export function createAiSdkRouter(basePath = '/api/ai-sdk') {
  const router = express.Router();

  // Try to obtain API keys from headers for all providers
  function extractApiKeysFromHeaders(req) {
    const h = req.headers || {};
    const apiKeys = { ...process.env };
    const { options = {}, apiKey } = req.body || {};
    const providerName = (options.provider || 'google').toLowerCase();

    // Extract API keys from headers for all supported providers
    const headerMappings = {
      'x-google-api-key': 'GOOGLE_API_KEY',
      'x-goog-api-key': 'GOOGLE_API_KEY',
      'x-gemini-api-key': 'GEMINI_API_KEY',
      'x-openai-api-key': 'OPENAI_API_KEY',
      'x-anthropic-api-key': 'ANTHROPIC_API_KEY',
      'x-cohere-api-key': 'COHERE_API_KEY',
      'x-api-key': null, // Generic key - map based on provider
    };

    // Check Authorization header for Bearer tokens
    const auth = typeof h.authorization === 'string' ? h.authorization.trim() : '';
    if (auth) {
      const m = auth.match(/^(?:Bearer|Api-Key|Key)\s+(.+)$/i);
      if (m && m[1]) {
        // For Bearer tokens, map to the current provider
        const providerKeyMap = {
          google: 'GOOGLE_API_KEY',
          openai: 'OPENAI_API_KEY',
          anthropic: 'ANTHROPIC_API_KEY',
          cohere: 'COHERE_API_KEY',
        };
        const envVar = providerKeyMap[providerName];
        if (envVar) {
          apiKeys[envVar] = m[1];
          if (envVar === 'GOOGLE_API_KEY') {
            apiKeys.GEMINI_API_KEY = m[1];
          }
        }
      }
    }

    // Extract from specific headers
    Object.entries(headerMappings).forEach(([header, envVar]) => {
      const value = h[header.toLowerCase()];
      if (value && typeof value === 'string' && value.length > 0) {
        if (envVar) {
          // Specific header mapping
          apiKeys[envVar] = value;
          if (envVar === 'GOOGLE_API_KEY') {
            apiKeys.GEMINI_API_KEY = value;
          }
        } else if (header === 'x-api-key') {
          // Generic x-api-key header - map based on provider
          const providerKeyMap = {
            google: 'GOOGLE_API_KEY',
            openai: 'OPENAI_API_KEY',
            anthropic: 'ANTHROPIC_API_KEY',
            cohere: 'COHERE_API_KEY',
          };
          const targetEnvVar = providerKeyMap[providerName];
          if (targetEnvVar) {
            apiKeys[targetEnvVar] = value;
            if (targetEnvVar === 'GOOGLE_API_KEY') {
              apiKeys.GEMINI_API_KEY = value;
            }
          }
        }
      }
    });

    // Check request body for apiKey (fallback for large headers)
    if (apiKey && typeof apiKey === 'string' && apiKey.length > 0) {
      const providerKeyMap = {
        google: 'GOOGLE_API_KEY',
        openai: 'OPENAI_API_KEY',
        anthropic: 'ANTHROPIC_API_KEY',
        cohere: 'COHERE_API_KEY',
      };
      const targetEnvVar = providerKeyMap[providerName];
      if (targetEnvVar && !apiKeys[targetEnvVar]) {
        // Only use if not already set from headers
        apiKeys[targetEnvVar] = apiKey;
        if (targetEnvVar === 'GOOGLE_API_KEY') {
          apiKeys.GEMINI_API_KEY = apiKey;
        }
      }
    }

    return apiKeys;
  }

  // Small helper to get default model for a provider without requiring API keys
  function defaultModelFor(p = 'google') {
    switch ((p || 'google').toLowerCase()) {
      case 'google':
        return 'gemini-2.0-flash';
      case 'openai':
        return 'gpt-4o-mini';
      case 'anthropic':
        return 'claude-3-5-sonnet-latest';
      case 'cohere':
        return 'command-r-plus';
      default:
        return 'gemini-2.0-flash';
    }
  }

  // POST /generate -> { text, finishReason }
  router.post(`${basePath}/generate`, async (req, res) => {
    try {
      const reqId = makeReqId();
      const started = Date.now();
      const { messages = [], options = {} } = req.body || {};
      const providerName = options.provider || process.env.AI_DEFAULT_PROVIDER || 'google';
      const devKeys = extractApiKeysFromHeaders(req);
      slog('generate:request', {
        reqId,
        provider: providerName,
        model: options.model || '(server-default)',
        hasDevHeaders: Object.keys(devKeys).some(
          (key) => key.includes('API') && devKeys[key] !== process.env[key]
        ),
        msgCount: Array.isArray(messages) ? messages.length : 0,
        lastMsgLen:
          (Array.isArray(messages) && messages[messages.length - 1]?.content?.length) || 0,
      });
      const { modelFactory, defaultModel } = await loadProvider(providerName, devKeys);

      // Lazy import core SDK
      const core = await import('ai').catch(() => null);
      if (!core) throw new Error("Package 'ai' not installed");
      const { generateText } = core;

      const modelName = options.model || defaultModel;
      const system = options.systemInstruction || undefined;
      const temperature = typeof options.temperature === 'number' ? options.temperature : undefined;

      // Prefer using the last message as prompt; optionally pass messages when supported
      const last = messages[messages.length - 1];
      const prompt = options.prompt || last?.content || '';

      const result = await generateText({
        model: modelFactory(modelName),
        system,
        temperature,
        prompt,
        // Note: generateText also supports messages in recent SDKs; we keep prompt for compatibility
      });

      const payload = { text: result.text, finishReason: result.finishReason || 'FINISHED' };
      slog('generate:response_ok', {
        reqId,
        provider: providerName,
        model: modelName,
        ms: Date.now() - started,
        textLen: payload.text ? payload.text.length : 0,
      });
      return res.json(payload);
    } catch (err) {
      const status = err?.status || 500;
      const msg = err?.message || 'AI SDK generate error';
      slog('generate:response_error', { status, error: msg });
      return res.status(status).send(String(msg));
    }
  });

  // POST /stream -> newline-delimited plain text chunks
  router.post(`${basePath}/stream`, async (req, res) => {
    try {
      const reqId = makeReqId();
      const started = Date.now();
      const { messages = [], options = {} } = req.body || {};
      const providerName = options.provider || process.env.AI_DEFAULT_PROVIDER || 'google';
      const devKeys = extractApiKeysFromHeaders(req);
      slog('stream:request', {
        reqId,
        provider: providerName,
        model: options.model || '(server-default)',
        hasDevHeaders: Object.keys(devKeys).some(
          (key) => key.includes('API') && devKeys[key] !== process.env[key]
        ),
        msgCount: Array.isArray(messages) ? messages.length : 0,
        lastMsgLen:
          (Array.isArray(messages) && messages[messages.length - 1]?.content?.length) || 0,
      });
      const { modelFactory, defaultModel } = await loadProvider(providerName, devKeys);

      const core = await import('ai').catch(() => null);
      if (!core) throw new Error("Package 'ai' not installed");
      const { streamText } = core;

      const modelName = options.model || defaultModel;
      const system = options.systemInstruction || undefined;
      const temperature = typeof options.temperature === 'number' ? options.temperature : undefined;
      const last = messages[messages.length - 1];
      const prompt = options.prompt || last?.content || '';

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Transfer-Encoding', 'chunked');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('X-Accel-Buffering', 'no');

      const result = await streamText({
        model: modelFactory(modelName),
        system,
        temperature,
        prompt,
      });

      let emitted = 0;
      for await (const chunk of result.textStream) {
        if (chunk) res.write(String(chunk) + '\n');
        if (chunk) emitted += String(chunk).length;
      }
      res.end();
      slog('stream:complete', {
        reqId,
        provider: providerName,
        model: modelName,
        ms: Date.now() - started,
        emitted,
      });
    } catch (err) {
      const status = err?.status || 500;
      const msg = err?.message || 'AI SDK stream error';
      if (!res.headersSent) res.status(status);
      slog('stream:response_error', { status, error: msg });
      res.end(String(msg));
    }
  });

  // Health endpoint
  router.get(`${basePath}/health`, (_req, res) => {
    res.json({ ok: true, sdk: true });
  });

  // Capability endpoint: which providers are enabled (installed + have API key)
  router.get(`${basePath}/providers`, async (_req, res) => {
    try {
      const names = ['google', 'openai', 'anthropic', 'cohere'];
      const providers = {};
      const keys = {
        google: Boolean(process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY),
        openai: Boolean(process.env.OPENAI_API_KEY),
        anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
        cohere: Boolean(process.env.COHERE_API_KEY),
      };
      for (const n of names) {
        try {
          // Only check module installation to avoid depending on keys for capability listing
          switch (n) {
            case 'google':
              await import('@ai-sdk/google');
              break;
            case 'openai':
              await import('@ai-sdk/openai');
              break;
            case 'anthropic':
              await import('@ai-sdk/anthropic');
              break;
            case 'cohere':
              await import('@ai-sdk/cohere');
              break;
          }
          providers[n] = true;
        } catch {
          providers[n] = false;
        }
      }
      const defProvider = (process.env.AI_DEFAULT_PROVIDER || 'google').toLowerCase();
      const defModel = defaultModelFor(defProvider);
      res.json({ ok: true, providers, keys, defaults: { provider: defProvider, model: defModel } });
    } catch (err) {
      res.status(500).json({ ok: false, error: err?.message || 'capability error' });
    }
  });

  // POST /stream -> Streaming chat endpoint using AI SDK
  router.post(`${basePath}/stream`, async (req, res) => {
    try {
      const reqId = makeReqId();
      const started = Date.now();
      const {
        messages = [],
        provider,
        model,
        systemInstruction,
        temperature,
        apiKey,
      } = req.body || {};
      const providerName = provider || process.env.AI_DEFAULT_PROVIDER || 'google';

      // Extract API keys from request body if provided
      const devKeys = extractApiKeysFromHeaders(req);
      if (apiKey) {
        // Override with API key from request body
        switch (providerName.toLowerCase()) {
          case 'google':
          case 'gemini':
            devKeys.GOOGLE_API_KEY = apiKey;
            devKeys.GEMINI_API_KEY = apiKey;
            break;
          case 'openai':
            devKeys.OPENAI_API_KEY = apiKey;
            break;
          case 'anthropic':
            devKeys.ANTHROPIC_API_KEY = apiKey;
            break;
          case 'cohere':
            devKeys.COHERE_API_KEY = apiKey;
            break;
        }
      }

      slog('stream:request', {
        reqId,
        provider: providerName,
        model: model || '(server-default)',
        msgCount: Array.isArray(messages) ? messages.length : 0,
      });

      const { modelFactory, defaultModel } = await loadProvider(providerName, devKeys);

      const core = await import('ai').catch(() => null);
      if (!core) throw new Error("Package 'ai' not installed");
      const { streamText } = core;

      const modelName = model || defaultModel;
      const system = systemInstruction || undefined;
      const temp = typeof temperature === 'number' ? temperature : undefined;

      // Convert messages format
      const formattedMessages = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const result = await streamText({
        model: modelFactory(modelName),
        system,
        temperature: temp,
        messages: formattedMessages,
      });

      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      for await (const chunk of result.textStream) {
        res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: chunk } }] })}\n\n`);
      }

      res.write('data: [DONE]\n\n');
      res.end();

      slog('stream:response_ok', {
        reqId,
        provider: providerName,
        model: modelName,
        ms: Date.now() - started,
      });
    } catch (err) {
      const status = err?.status || 500;
      const msg = err?.message || 'AI SDK stream error';
      slog('stream:response_error', { status, error: msg });
      return res.status(status).send(String(msg));
    }
  });

  // POST /generate -> Non-streaming generation endpoint
  router.post(`${basePath}/generate`, async (req, res) => {
    try {
      const reqId = makeReqId();
      const started = Date.now();
      const {
        messages = [],
        provider,
        model,
        systemInstruction,
        temperature,
        apiKey,
      } = req.body || {};
      const providerName = provider || process.env.AI_DEFAULT_PROVIDER || 'google';

      // Extract API keys from request body if provided
      const devKeys = extractApiKeysFromHeaders(req);
      if (apiKey) {
        // Debug: Log API key info (masked)
        console.log(
          `[AI-SERVER] Received API key for ${providerName}: length=${apiKey.length}, starts with=${apiKey.substring(0, 4)}..., ends with=...${apiKey.substring(apiKey.length - 4)}`
        );

        // Override with API key from request body
        switch (providerName.toLowerCase()) {
          case 'google':
          case 'gemini':
            devKeys.GOOGLE_API_KEY = apiKey;
            devKeys.GEMINI_API_KEY = apiKey;
            break;
          case 'openai':
            devKeys.OPENAI_API_KEY = apiKey;
            break;
          case 'anthropic':
            devKeys.ANTHROPIC_API_KEY = apiKey;
            break;
          case 'cohere':
            devKeys.COHERE_API_KEY = apiKey;
            break;
        }
      }

      slog('generate:request', {
        reqId,
        provider: providerName,
        model: model || '(server-default)',
        msgCount: Array.isArray(messages) ? messages.length : 0,
      });

      const { modelFactory, defaultModel } = await loadProvider(providerName, devKeys);

      const core = await import('ai').catch(() => null);
      if (!core) throw new Error("Package 'ai' not installed");
      const { generateText } = core;

      const modelName = model || defaultModel;
      const system = systemInstruction || undefined;
      const temp = typeof temperature === 'number' ? temperature : undefined;

      // Convert messages format and use the last message as prompt for simple generation
      const formattedMessages = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const result = await generateText({
        model: modelFactory(modelName),
        system,
        temperature: temp,
        messages: formattedMessages,
      });

      const payload = {
        id: reqId,
        text: result.text,
        finishReason: result.finishReason || 'FINISHED',
        usage: result.usage,
      };

      slog('generate:response_ok', {
        reqId,
        provider: providerName,
        model: modelName,
        ms: Date.now() - started,
        contentLen: payload.text ? payload.text.length : 0,
      });
      return res.json(payload);
    } catch (err) {
      const status = err?.status || 500;
      const msg = err?.message || 'AI SDK generate error';
      slog('generate:response_error', { status, error: msg });
      return res.status(status).send(String(msg));
    }
  });

  return router;
}

export default createAiSdkRouter;
