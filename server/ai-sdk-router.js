import express from 'express';

// Dynamic provider loader to avoid hard dependency until installed
async function loadProvider(provider, apiKeys) {
  const name = (provider || 'google').toLowerCase();
  switch (name) {
    case 'google': {
      const mod = await import('@ai-sdk/google').catch(() => null);
      if (!mod) throw new Error("Provider '@ai-sdk/google' not installed");
      const { google } = mod;
      const key = apiKeys.GOOGLE_API_KEY || apiKeys.GEMINI_API_KEY || '';
      if (!key) throw new Error('Missing GOOGLE_API_KEY/GEMINI_API_KEY');
      return { modelFactory: google({ apiKey: key }), defaultModel: 'gemini-2.0-flash' };
    }
    case 'openai': {
      const mod = await import('@ai-sdk/openai').catch(() => null);
      if (!mod) throw new Error("Provider '@ai-sdk/openai' not installed");
      const { openai } = mod;
      const key = apiKeys.OPENAI_API_KEY || '';
      if (!key) throw new Error('Missing OPENAI_API_KEY');
      return { modelFactory: openai({ apiKey: key }), defaultModel: 'gpt-4o-mini' };
    }
    case 'anthropic': {
      const mod = await import('@ai-sdk/anthropic').catch(() => null);
      if (!mod) throw new Error("Provider '@ai-sdk/anthropic' not installed");
      const { anthropic } = mod;
      const key = apiKeys.ANTHROPIC_API_KEY || '';
      if (!key) throw new Error('Missing ANTHROPIC_API_KEY');
      return { modelFactory: anthropic({ apiKey: key }), defaultModel: 'claude-3-5-sonnet-latest' };
    }
    case 'cohere': {
      const mod = await import('@ai-sdk/cohere').catch(() => null);
      if (!mod) throw new Error("Provider '@ai-sdk/cohere' not installed");
      const { cohere } = mod;
      const key = apiKeys.COHERE_API_KEY || '';
      if (!key) throw new Error('Missing COHERE_API_KEY');
      return { modelFactory: cohere({ apiKey: key }), defaultModel: 'command-r-plus' };
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

  // POST /generate -> { text, finishReason }
  router.post(`${basePath}/generate`, async (req, res) => {
    try {
      const { messages = [], options = {} } = req.body || {};
      const providerName = options.provider || process.env.AI_DEFAULT_PROVIDER || 'google';
      const { modelFactory, defaultModel } = await loadProvider(providerName, process.env);

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

      return res.json({ text: result.text, finishReason: result.finishReason || 'FINISHED' });
    } catch (err) {
      const status = err?.status || 500;
      const msg = err?.message || 'AI SDK generate error';
      return res.status(status).send(String(msg));
    }
  });

  // POST /stream -> newline-delimited plain text chunks
  router.post(`${basePath}/stream`, async (req, res) => {
    try {
      const { messages = [], options = {} } = req.body || {};
      const providerName = options.provider || process.env.AI_DEFAULT_PROVIDER || 'google';
      const { modelFactory, defaultModel } = await loadProvider(providerName, process.env);

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

      for await (const chunk of result.textStream) {
        if (chunk) res.write(String(chunk) + '\n');
      }
      res.end();
    } catch (err) {
      const status = err?.status || 500;
      const msg = err?.message || 'AI SDK stream error';
      if (!res.headersSent) res.status(status);
      res.end(String(msg));
    }
  });

  // Health endpoint
  router.get(`${basePath}/health`, (_req, res) => {
    res.json({ ok: true, sdk: true });
  });

  return router;
}

export default createAiSdkRouter;
