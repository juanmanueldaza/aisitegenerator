import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
const BASE_PATH = '/api/ai';
const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';

if (!API_KEY) {
  console.warn('[ai-proxy] No GEMINI_API_KEY provided. Set it to enable the proxy.');
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

function toHistory(messages) {
  const hist = [];
  if (!Array.isArray(messages)) return hist;
  for (const m of messages) {
    if (!m || !m.role || !m.content) continue;
    hist.push({ role: m.role, parts: [{ text: String(m.content) }] });
  }
  if (hist.length && hist[0].role !== 'user') {
    // Gemini needs the first to be 'user'
    hist.unshift({ role: 'user', parts: [{ text: '' }] });
  }
  return hist;
}

function getModel(client, options) {
  const modelName = options?.model || 'gemini-2.0-flash';
  const systemInstruction = options?.systemInstruction || undefined;
  return client.getGenerativeModel({ model: modelName, systemInstruction });
}

app.post(`${BASE_PATH}/generate`, async (req, res) => {
  try {
    if (!API_KEY) return res.status(500).send('Proxy not configured');
    const { messages = [], options = {} } = req.body || {};
    const client = new GoogleGenerativeAI(API_KEY);
    const model = getModel(client, options);
    const chat = model.startChat({ history: toHistory(messages) });
    const result = await chat.sendMessage(
      options?.prompt || messages[messages.length - 1]?.content || ''
    );
    const text = result.response.text();
    return res.json({
      text,
      finishReason: result.response.candidates?.[0]?.finishReason || 'FINISHED',
    });
  } catch (err) {
    const status = err?.status || 500;
    const msg = err?.message || 'Unknown proxy error';
    return res.status(status).send(msg);
  }
});

app.post(`${BASE_PATH}/stream`, async (req, res) => {
  try {
    if (!API_KEY) return res.status(500).send('Proxy not configured');
    const { messages = [], options = {} } = req.body || {};
    const client = new GoogleGenerativeAI(API_KEY);
    const model = getModel(client, options);
    const chat = model.startChat({ history: toHistory(messages) });
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Accel-Buffering', 'no');

    const result = await chat.sendMessageStream(
      options?.prompt || messages[messages.length - 1]?.content || ''
    );
    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) res.write(text + '\n');
    }
    res.end();
  } catch (err) {
    const status = err?.status || 500;
    const msg = err?.message || 'Unknown proxy error';
    if (!res.headersSent) res.status(status);
    res.end(String(msg));
  }
});

app.get(`${BASE_PATH}/health`, (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`[ai-proxy] listening on http://localhost:${PORT}${BASE_PATH}`);
});
