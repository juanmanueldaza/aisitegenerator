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
