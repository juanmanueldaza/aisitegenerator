/**
 * Site Store Service Implementation
 * Concrete implementation of ISiteStore interface using Zustand
 * Follows Dependency Inversion Principle by depending on abstractions
 */

import type { ISiteStore, ChatMessage } from '../interfaces';
import { useSiteStore } from '@/store/siteStore';

/**
 * Site store service implementation
 * Wraps Zustand store to provide dependency injection compatible interface
 */
export class SiteStoreService implements ISiteStore {
  // State getters
  getContent(): string {
    return useSiteStore.getState().content;
  }

  getMessages(): ChatMessage[] {
    return useSiteStore.getState().messages;
  }

  getWizardStep(): 1 | 2 | 3 | 4 {
    return useSiteStore.getState().wizardStep;
  }

  getProjectName(): string {
    return useSiteStore.getState().projectName;
  }

  getOnboardingCompleted(): boolean {
    return useSiteStore.getState().onboardingCompleted;
  }

  // State setters
  setContent(content: string): void {
    useSiteStore.getState().setContent(content);
  }

  setMessages(messages: ChatMessage[]): void {
    useSiteStore.getState().setMessages(messages);
  }

  clearMessages(): void {
    useSiteStore.getState().clearMessages();
  }

  appendMessage(message: ChatMessage): void {
    useSiteStore.getState().appendMessage(message);
  }

  replaceLastAssistantMessage(content: string): void {
    useSiteStore.getState().replaceLastAssistantMessage(content);
  }

  upsertStreamingAssistant(content: string): void {
    useSiteStore.getState().upsertStreamingAssistant(content);
  }

  // Undo/redo operations
  commit(): void {
    useSiteStore.getState().commit();
  }

  undo(): void {
    useSiteStore.getState().undo();
  }

  redo(): void {
    useSiteStore.getState().redo();
  }

  clear(): void {
    useSiteStore.getState().clear();
  }

  // Onboarding operations
  setWizardStep(step: 1 | 2 | 3 | 4): void {
    useSiteStore.getState().setWizardStep(step);
  }

  setProjectName(name: string): void {
    useSiteStore.getState().setProjectName(name);
  }

  setOnboardingCompleted(completed: boolean): void {
    useSiteStore.getState().setOnboardingCompleted(completed);
  }
}
