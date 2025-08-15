export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  status: 'sending' | 'sent' | 'error';
  type: 'text' | 'code' | 'suggestion' | 'error' | 'system';
}

export interface ChatState {
  messages: Message[];
  isTyping: boolean;
  inputValue: string;
  conversationId: string;
}

export interface ChatContextType extends ChatState {
  sendMessage: (content: string, type?: Message['type']) => void;
  setInputValue: (value: string) => void;
  clearConversation: () => void;
  exportConversation: () => void;
  isLoading: boolean;
}

export interface MessageBubbleProps {
  message: Message;
  isLastMessage?: boolean;
}

export interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export interface TypingIndicatorProps {
  isVisible: boolean;
}

export interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
}