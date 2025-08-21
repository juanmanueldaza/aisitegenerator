# Vercel AI SDK Migration (Epic 2) — Architecture Notes

This document outlines the incremental migration approach to adopt Vercel AI SDK without breaking existing functionality.

## Goals

- Keep current Gemini and legacy proxy working.
- Introduce AI SDK server endpoints with minimal changes to the client.
- Enable multi-provider support via configuration.

## Components

- server/ai-sdk-router.js — Express router that exposes:
  - POST /api/ai-sdk/generate
  - POST /api/ai-sdk/stream
    These endpoints use the `ai` package with provider modules (`@ai-sdk/google`, `@ai-sdk/openai`, etc.). Provider is selected via `options.provider` or `AI_DEFAULT_PROVIDER` env.

- src/services/ai/proxyV2.ts — Client wrapper talking to /api/ai-sdk, same interface as existing providers.

- src/services/ai/index.ts — Provider selection order:
  1. AI_CONFIG.AI_SDK_PROXY_BASE_URL -> ProxyV2 (AI SDK)
  2. AI_CONFIG.PROXY_BASE_URL -> Legacy Proxy (Gemini)
  3. Local Gemini SDK with user API key

Configure in Vite env:

```
VITE_AI_SDK_PROXY_BASE_URL=/api/ai-sdk
# Optional fallback
VITE_AI_PROXY_BASE_URL=/api/ai
```

## Next Steps

- Install SDK packages: `ai`, `@ai-sdk/google` (and others as needed).
- Switch the frontend to pass `options.provider` and model names from a settings UI.
- Add cancellation support and streaming indicators in the chat UI.
