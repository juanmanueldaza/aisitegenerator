import { describe, it, expect, beforeEach } from 'vitest';
import { useSiteStore } from './siteStore';

// Helper to reset store between tests
function resetStore() {
  const store = useSiteStore.getState();
  store.clear();
}

describe('siteStore', () => {
  beforeEach(() => {
    resetStore();
  });

  it('sets content and commits snapshots', () => {
    const store = useSiteStore.getState();
    expect(store.content).toBe('');
    store.setContent('hello');
    expect(useSiteStore.getState().content).toBe('hello');
    // no snapshot until commit
    expect(useSiteStore.getState().past.length).toBe(0);
    store.commit();
    expect(useSiteStore.getState().past.length).toBe(1);
  });

  it('append/replace/upsert assistant messages', () => {
    const store = useSiteStore.getState();
    // add user then streaming assistant
    store.appendMessage({ id: 'u1', role: 'user', content: 'hi', timestamp: Date.now() });
    store.upsertStreamingAssistant('A');
    expect(useSiteStore.getState().messages.at(-1)?.id).toBe('streaming');
    expect(useSiteStore.getState().messages.at(-1)?.content).toBe('A');
    // upsert should update the same message
    store.upsertStreamingAssistant('AB');
    expect(useSiteStore.getState().messages.at(-1)?.content).toBe('AB');
    // finalize by replacing last assistant
    store.replaceLastAssistantMessage('Final');
    // after finalization the placeholder id should be replaced with a unique id
    expect(useSiteStore.getState().messages.at(-1)?.id).not.toBe('streaming');
    expect(useSiteStore.getState().messages.at(-1)?.content).toBe('Final');
  });

  it('clearMessages only clears chat, not content/history', () => {
    const store = useSiteStore.getState();
    store.setContent('X');
    store.commit();
    store.appendMessage({ id: '1', role: 'user', content: 'hi', timestamp: Date.now() });
    expect(useSiteStore.getState().messages.length).toBe(1);
    store.clearMessages();
    expect(useSiteStore.getState().messages.length).toBe(0);
    expect(useSiteStore.getState().content).toBe('X');
    expect(useSiteStore.getState().past.length).toBe(1);
  });

  it('undo/redo navigates snapshots', () => {
    const store = useSiteStore.getState();
    store.setContent('one');
    store.commit();
    store.setContent('two');
    store.commit();
    expect(useSiteStore.getState().content).toBe('two');
    store.undo();
    expect(useSiteStore.getState().content).toBe('one');
    store.redo();
    expect(useSiteStore.getState().content).toBe('two');
  });
});
