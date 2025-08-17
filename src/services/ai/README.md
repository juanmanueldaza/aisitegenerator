AI Providers

- This folder contains AI provider clients. The initial implementation uses Google's Gemini models via `@google/generative-ai`.
- In development, the API key is read from localStorage under key `GEMINI_API_KEY`.
- Do not ship production builds that call the Gemini API directly from the browser. Use a server-side proxy that injects the key securely.
