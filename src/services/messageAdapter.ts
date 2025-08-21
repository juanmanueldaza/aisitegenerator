/**
 * Deep Chat Message System Integration
 *
 * This module provides the bridge between Deep Chat React and the existing
 * Zustand store system, ensuring seamless message persistence and state management.
 *
 * Epic 1, Issue #3: Message System Migration
 */

import type { ChatMessage } from '@/store/siteStore';

/**
 * Deep Chat message format (based on actual implementation)
 */
export interface DeepChatMessage {
  role: 'user' | 'ai';
  text?: string;
  content?: string;
  files?: DeepChatFile[];
  html?: string;
  timestamp?: number;
  _id?: string;
}

/**
 * Deep Chat file attachment format
 */
export interface DeepChatFile {
  name?: string;
  type?: string;
  size?: number;
  src?: string;
}

/**
 * Deep Chat message content for initialization
 */
export interface DeepChatMessageContent {
  role: 'user' | 'ai';
  text?: string;
  html?: string;
  files?: DeepChatFile[];
}

/**
 * Message conversion utilities between Deep Chat and Zustand store formats
 */
export class MessageAdapter {
  /**
   * Convert Zustand ChatMessage to Deep Chat MessageContent format
   * Used when initializing Deep Chat with existing conversation history
   */
  static toChatMessages(storeMessages: ChatMessage[]): DeepChatMessageContent[] {
    return storeMessages.map((msg) => {
      const baseMessage: DeepChatMessageContent = {
        role: msg.role === 'assistant' ? 'ai' : 'user',
        text: msg.content,
      };

      // Handle streaming messages (temporary IDs)
      if (msg.id === 'streaming') {
        return baseMessage;
      }

      return baseMessage;
    });
  }

  /**
   * Convert Deep Chat message to Zustand ChatMessage format
   * Used when persisting messages to the store
   */
  static toStoreMessage(deepChatMsg: DeepChatMessage): ChatMessage {
    // Generate ID if not provided
    const id = deepChatMsg._id || Date.now().toString();

    // Convert role (Deep Chat uses 'ai', Zustand uses 'assistant')
    const role = deepChatMsg.role === 'ai' ? 'assistant' : 'user';

    // Combine content from different possible sources
    let content = '';
    if (deepChatMsg.text) {
      content = deepChatMsg.text;
    } else if (deepChatMsg.html) {
      // If HTML content is provided, extract text or keep as-is
      content = deepChatMsg.html;
    }

    // Handle file attachments by creating a textual representation
    if (deepChatMsg.files && deepChatMsg.files.length > 0) {
      const fileDescriptions = deepChatMsg.files
        .map((file) => `[File: ${file.name || 'Unknown'} (${file.type || 'unknown type'})]`)
        .join('\n');

      content = content ? `${content}\n\n${fileDescriptions}` : fileDescriptions;
    }

    return {
      id,
      role,
      content,
      timestamp: deepChatMsg.timestamp || Date.now(),
    };
  }

  /**
   * Extract text content from various Deep Chat message formats
   */
  static extractTextContent(msg: DeepChatMessage): string {
    if (msg.text) return msg.text;
    if (msg.html) {
      // Simple HTML tag removal for plain text extraction
      return msg.html.replace(/<[^>]*>/g, '').trim();
    }
    return '';
  }

  /**
   * Check if a message contains file attachments
   */
  static hasFiles(msg: DeepChatMessage): boolean {
    return !!(msg.files && msg.files.length > 0);
  }

  /**
   * Generate a unique message ID
   */
  static generateId(): string {
    return Date.now().toString();
  }

  /**
   * Create a streaming placeholder message for real-time updates
   */
  static createStreamingMessage(content: string = ''): ChatMessage {
    return {
      id: 'streaming',
      role: 'assistant',
      content,
      timestamp: Date.now(),
    };
  }

  /**
   * Finalize a streaming message with proper ID
   */
  static finalizeStreamingMessage(content: string, originalId?: string): ChatMessage {
    const finalId = originalId && originalId !== 'streaming' ? originalId : Date.now().toString();

    return {
      id: finalId,
      role: 'assistant',
      content,
      timestamp: Date.now(),
    };
  }
}

/**
 * Message history management utilities
 */
export class MessageHistory {
  /**
   * Merge new messages with existing store messages, avoiding duplicates
   */
  static mergeMesages(storeMessages: ChatMessage[], newMessages: ChatMessage[]): ChatMessage[] {
    const existingIds = new Set(storeMessages.map((msg) => msg.id));
    const uniqueNewMessages = newMessages.filter((msg) => !existingIds.has(msg.id));

    return [...storeMessages, ...uniqueNewMessages];
  }

  /**
   * Clean up temporary/streaming messages from history
   */
  static cleanupStreamingMessages(messages: ChatMessage[]): ChatMessage[] {
    return messages.filter((msg) => msg.id !== 'streaming');
  }

  /**
   * Get the last N messages for context
   */
  static getRecentMessages(messages: ChatMessage[], count: number): ChatMessage[] {
    return messages.slice(-count);
  }

  /**
   * Find the last assistant message
   */
  static getLastAssistantMessage(messages: ChatMessage[]): ChatMessage | null {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') {
        return messages[i];
      }
    }
    return null;
  }

  /**
   * Check if the last message is from user (awaiting response)
   */
  static isAwaitingResponse(messages: ChatMessage[]): boolean {
    if (messages.length === 0) return false;
    return messages[messages.length - 1].role === 'user';
  }

  /**
   * Create conversation context for AI from message history
   */
  static createAIContext(
    messages: ChatMessage[],
    maxMessages: number = 10
  ): Array<{ role: 'user' | 'assistant'; content: string }> {
    return MessageHistory.getRecentMessages(messages, maxMessages).map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  }
}

/**
 * Message validation utilities
 */
export class MessageValidator {
  /**
   * Validate message content for safety and format
   */
  static validateContent(content: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!content || content.trim().length === 0) {
      errors.push('Message content cannot be empty');
    }

    if (content.length > 10000) {
      errors.push('Message content exceeds maximum length (10,000 characters)');
    }

    // Basic XSS prevention for HTML content
    if (content.includes('<script')) {
      errors.push('Script tags are not allowed in messages');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Sanitize message content
   */
  static sanitizeContent(content: string): string {
    return content
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/on\w+\s*=/gi, ''); // Remove event handlers
  }

  /**
   * Validate message file attachments
   */
  static validateFiles(files: DeepChatFile[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'text/plain',
      'application/pdf',
    ];

    for (const file of files) {
      if (file.size && file.size > maxFileSize) {
        errors.push(`File "${file.name}" exceeds maximum size (10MB)`);
      }

      if (file.type && !allowedTypes.includes(file.type)) {
        errors.push(`File type "${file.type}" is not allowed`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Error handling for message system integration
 */
export class MessageError extends Error {
  public code: 'VALIDATION_ERROR' | 'CONVERSION_ERROR' | 'STORAGE_ERROR' | 'SYNC_ERROR';
  public details?: unknown;

  constructor(
    message: string,
    code: 'VALIDATION_ERROR' | 'CONVERSION_ERROR' | 'STORAGE_ERROR' | 'SYNC_ERROR',
    details?: unknown
  ) {
    super(message);
    this.name = 'MessageError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Message system integration status and metrics
 */
export interface MessageSystemStatus {
  connected: boolean;
  totalMessages: number;
  lastMessageAt?: number;
  streamingActive: boolean;
  syncErrors: number;
}

export class MessageSystemMonitor {
  private static status: MessageSystemStatus = {
    connected: false,
    totalMessages: 0,
    streamingActive: false,
    syncErrors: 0,
  };

  static getStatus(): MessageSystemStatus {
    return { ...this.status };
  }

  static updateStatus(updates: Partial<MessageSystemStatus>): void {
    this.status = { ...this.status, ...updates };
  }

  static incrementMessages(): void {
    this.status.totalMessages++;
    this.status.lastMessageAt = Date.now();
  }

  static recordError(): void {
    this.status.syncErrors++;
  }

  static reset(): void {
    this.status = {
      connected: false,
      totalMessages: 0,
      streamingActive: false,
      syncErrors: 0,
    };
  }
}
