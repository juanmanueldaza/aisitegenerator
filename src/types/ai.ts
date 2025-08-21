// AI provider shared types

export type AIRole = 'user' | 'assistant' | 'system';

export interface AIMessage {
  role: AIRole;
  content: string;
}

export interface ProviderOptions {
  model?: string; // e.g., 'gemini-2.5-flash'
  systemInstruction?: string;
  temperature?: number;
  thinkingBudgetTokens?: number; // optional thinking budget when supported
  // Optional provider hint for proxy/AI SDK backed requests
  // Examples: 'google' | 'openai' | 'anthropic' | 'cohere'
  provider?: string;
  // Optional external AbortSignal to support cancellation
  signal?: AbortSignal;
  // Optional callback invoked when a retry is scheduled by the provider
  onRetry?: (info: { attempt: number; delayMs: number; error: unknown }) => void;
}

export interface GenerateResult {
  text: string;
  finishReason?: string;
}

export interface StreamChunk {
  text: string;
}

export interface AIError extends Error {
  status?: number;
  code?: string;
}
