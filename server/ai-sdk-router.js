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

  // Try to obtain a Google API key from common dev header variants
  function extractDevGoogleKey(req) {
    const h = req.headers || {};
    // Normalize to string accessor (node lower-cases header names)
    const candidates = [
      h['x-google-api-key'],
      h['x-goog-api-key'],
      h['x-gemini-api-key'],
      h['x-api-key'],
    ].filter(Boolean);
    // Support Authorization: Bearer <key>
    const auth = typeof h.authorization === 'string' ? h.authorization.trim() : '';
    if (auth) {
      const m = auth.match(/^(?:Bearer|Api-Key|Key)\s+(.+)$/i);
      if (m && m[1]) candidates.unshift(m[1]);
    }
    // First non-empty string wins
    const key = candidates.find((v) => typeof v === 'string' && v.length > 0);
    return typeof key === 'string' ? String(key) : undefined;
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
      const devKeys = { ...process.env };
      // Allow dev override via header for local testing (support multiple header variants)
      const devHeaderKey = extractDevGoogleKey(req);
      if (devHeaderKey) devKeys.__DEV_GOOGLE_API_KEY__ = String(devHeaderKey);
      slog('generate:request', {
        reqId,
        provider: providerName,
        model: options.model || '(server-default)',
        hasDevHeader: Boolean(devHeaderKey),
        headerPreview: devHeaderKey ? mask(devHeaderKey) : undefined,
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
      const devKeys = { ...process.env };
      const devHeaderKey = extractDevGoogleKey(req);
      if (devHeaderKey) devKeys.__DEV_GOOGLE_API_KEY__ = String(devHeaderKey);
      slog('stream:request', {
        reqId,
        provider: providerName,
        model: options.model || '(server-default)',
        hasDevHeader: Boolean(devHeaderKey),
        headerPreview: devHeaderKey ? mask(devHeaderKey) : undefined,
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

  // POST /chat -> Conversational chat endpoint using AI SDK
  router.post(`${basePath}/chat`, async (req, res) => {
    try {
      const reqId = makeReqId();
      const started = Date.now();
      const { messages = [], provider, model, systemInstruction, temperature } = req.body || {};
      const providerName = provider || process.env.AI_DEFAULT_PROVIDER || 'google';
      const devKeys = { ...process.env };
      const devHeaderKey = extractDevGoogleKey(req);
      if (devHeaderKey) devKeys.__DEV_GOOGLE_API_KEY__ = String(devHeaderKey);
      slog('chat:request', {
        reqId,
        provider: providerName,
        model: model || '(server-default)',
        hasDevHeader: Boolean(devHeaderKey),
        headerPreview: devHeaderKey ? mask(devHeaderKey) : undefined,
        msgCount: Array.isArray(messages) ? messages.length : 0,
        lastMsgLen:
          (Array.isArray(messages) && messages[messages.length - 1]?.content?.length) || 0,
      });
      const { modelFactory, defaultModel } = await loadProvider(providerName, devKeys);

      const core = await import('ai').catch(() => null);
      if (!core) throw new Error("Package 'ai' not installed");
      const { generateText } = core;

      const modelName = model || defaultModel;
      const system = systemInstruction || undefined;
      const temp = typeof temperature === 'number' ? temperature : undefined;

      // Use the last message as the prompt for conversational context
      const last = messages[messages.length - 1];
      const prompt = last?.content || '';

      const result = await generateText({
        model: modelFactory(modelName),
        system,
        temperature: temp,
        prompt,
      });

      const payload = {
        id: reqId,
        role: 'assistant',
        content: result.text,
        finishReason: result.finishReason || 'FINISHED',
      };
      slog('chat:response_ok', {
        reqId,
        provider: providerName,
        model: modelName,
        ms: Date.now() - started,
        contentLen: payload.content ? payload.content.length : 0,
      });
      return res.json(payload);
    } catch (err) {
      const status = err?.status || 500;
      const msg = err?.message || 'AI SDK chat error';
      slog('chat:response_error', { status, error: msg });
      return res.status(status).send(String(msg));
    }
  });

  return router;
}

export default createAiSdkRouter;
