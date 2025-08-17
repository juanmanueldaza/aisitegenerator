declare module '@google/generative-ai' {
  export class GoogleGenerativeAI {
    constructor(apiKey: string);
    getGenerativeModel(config: {
      model: string;
      systemInstruction?: string;
      thinking?: { budgetTokens?: number };
    }): Promise<{
      generateContent(input: unknown): Promise<{ response: { text: () => string } }>;
      startChat(opts: { history?: Array<{ role: string; parts: Array<{ text: string }> }> }): {
        sendMessage(input: unknown): Promise<{ response: { text: () => string } }>;
        sendMessageStream(input: unknown): Promise<{
          stream: AsyncIterable<{ text: () => string }>;
        }>;
      };
    }>;
  }
}
