import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface SiteState {
  content: string; // editor content (markdown or HTML)
  messages: ChatMessage[];
  lastUpdatedAt?: number; // for basic conflict resolution / telemetry

  // Undo/redo stacks
  past: Array<Pick<SiteState, 'content' | 'messages'>>;
  future: Array<Pick<SiteState, 'content' | 'messages'>>;

  // Actions
  setContent: (content: string) => void;
  setMessages: (messages: ChatMessage[]) => void;
  clearMessages: () => void;
  appendMessage: (m: ChatMessage) => void;
  replaceLastAssistantMessage: (content: string) => void;
  upsertStreamingAssistant: (content: string) => void;
  commit: () => void; // push current to past and clear future
  undo: () => void;
  redo: () => void;
  clear: () => void;
}

export const useSiteStore = create<SiteState>()(
  persist(
    (set) => ({
      content: '',
      messages: [],
      past: [],
      future: [],
      lastUpdatedAt: undefined,

      setContent: (content: string) =>
        set(() => ({
          content,
          lastUpdatedAt: Date.now(),
          // caller should call commit() to snapshot
        })),

      setMessages: (messages: ChatMessage[]) =>
        set(() => ({ messages, lastUpdatedAt: Date.now() })),

      clearMessages: () => set({ messages: [], lastUpdatedAt: Date.now() }),

      appendMessage: (m: ChatMessage) =>
        set((state) => ({ messages: [...state.messages, m], lastUpdatedAt: Date.now() })),

      replaceLastAssistantMessage: (content: string) =>
        set((state) => {
          const idx = [...state.messages].reverse().findIndex((x) => x.role === 'assistant');
          if (idx === -1) return {};
          const i = state.messages.length - 1 - idx;
          const messages = state.messages.slice();
          messages[i] = { ...messages[i], content };
          return { messages, lastUpdatedAt: Date.now() };
        }),

      upsertStreamingAssistant: (content: string) =>
        set((state) => {
          const i = [...state.messages]
            .map((m, idx) => ({ m, idx }))
            .reverse()
            .find((x) => x.m.role === 'assistant' && x.m.id === 'streaming')?.idx;
          if (typeof i === 'number') {
            const messages = state.messages.slice();
            messages[i] = { ...messages[i], content } as ChatMessage;
            return { messages, lastUpdatedAt: Date.now() };
          }
          const streaming: ChatMessage = {
            id: 'streaming',
            role: 'assistant',
            content,
            timestamp: Date.now(),
          };
          const messages = [...state.messages, streaming];
          return { messages, lastUpdatedAt: Date.now() };
        }),

      commit: () =>
        set((state) => ({
          past: [...state.past, { content: state.content, messages: state.messages }],
          future: [],
          lastUpdatedAt: Date.now(),
        })),

      undo: () =>
        set((state) => {
          if (state.past.length === 0) return state;
          const past = state.past.slice(0, -1);
          const previous = past[past.length - 1] ?? { content: '', messages: [] };
          const future = [{ content: state.content, messages: state.messages }, ...state.future];
          return {
            ...state,
            content: previous.content,
            messages: previous.messages,
            past,
            future,
            lastUpdatedAt: Date.now(),
          };
        }),

      redo: () =>
        set((state) => {
          if (state.future.length === 0) return state;
          const next = state.future[0];
          const future = state.future.slice(1);
          const past = [...state.past, { content: state.content, messages: state.messages }];
          return {
            ...state,
            content: next.content,
            messages: next.messages,
            future,
            past,
            lastUpdatedAt: Date.now(),
          };
        }),

      clear: () =>
        set({ content: '', messages: [], past: [], future: [], lastUpdatedAt: Date.now() }),
    }),
    {
      name: 'site-state',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Only persist the minimal state necessary for continuity
      partialize: (state) => ({
        content: state.content,
        messages: state.messages,
        lastUpdatedAt: state.lastUpdatedAt,
      }),
    }
  )
);
