export const AI_PROVIDERS = ['google', 'openai', 'anthropic', 'cohere'] as const;
export type AIProviderName = (typeof AI_PROVIDERS)[number];

// Curated presets for quick selection in the UI
export const AI_MODEL_PRESETS: Record<AIProviderName, string[]> = {
  google: ['gemini-2.0-flash', 'gemini-2.0-pro', 'gemini-1.5-flash', 'gemini-1.5-pro'],
  openai: ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini', 'gpt-4.1'],
  anthropic: ['claude-3-5-sonnet-latest', 'claude-3-5-haiku-latest', 'claude-3-opus-latest'],
  cohere: ['command-r-plus', 'command-r', 'command'],
};

export const DEFAULT_MODEL_FOR: Record<AIProviderName, string> = {
  google: 'gemini-2.0-flash',
  openai: 'gpt-4o-mini',
  anthropic: 'claude-3-5-sonnet-latest',
  cohere: 'command-r-plus',
};

export function getDefaultModel(provider: string, fallback: string): string {
  const key = provider?.toLowerCase() as AIProviderName;
  return (DEFAULT_MODEL_FOR as Record<string, string>)[key] || fallback;
}

export function isModelValidForProvider(provider: string, model?: string): boolean {
  if (!model) return true;
  const v = model.toLowerCase();
  switch (provider?.toLowerCase()) {
    case 'google':
      return v.startsWith('gemini');
    case 'openai':
      return v.startsWith('gpt');
    case 'anthropic':
      return v.startsWith('claude');
    case 'cohere':
      return v.startsWith('command');
    default:
      return true;
  }
}
