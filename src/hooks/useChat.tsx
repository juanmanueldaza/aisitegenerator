import { createContext, useContext, useReducer, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { ChatState, ChatContextType, Message } from '../types/chat';

// Initial state
const initialState: ChatState = {
  messages: [
    {
      id: '1',
      content: 'Hello! I\'m your AI assistant. I\'m here to help you create your website step by step. What kind of website would you like to build today?',
      role: 'assistant',
      timestamp: new Date(),
      status: 'sent',
      type: 'text'
    }
  ],
  isTyping: false,
  inputValue: '',
  conversationId: 'default'
};

// Action types
type ChatAction = 
  | { type: 'SEND_MESSAGE'; payload: { content: string; messageType?: Message['type'] } }
  | { type: 'RECEIVE_MESSAGE'; payload: Message }
  | { type: 'SET_TYPING'; payload: boolean }
  | { type: 'SET_INPUT_VALUE'; payload: string }
  | { type: 'UPDATE_MESSAGE_STATUS'; payload: { id: string; status: Message['status'] } }
  | { type: 'CLEAR_CONVERSATION' }
  | { type: 'LOAD_CONVERSATION'; payload: Message[] };

// Reducer
function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SEND_MESSAGE': {
      const newMessage: Message = {
        id: Date.now().toString(),
        content: action.payload.content,
        role: 'user',
        timestamp: new Date(),
        status: 'sending',
        type: action.payload.messageType || 'text'
      };
      return {
        ...state,
        messages: [...state.messages, newMessage],
        inputValue: '',
        isTyping: true
      };
    }
    case 'RECEIVE_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
        isTyping: false
      };
    case 'SET_TYPING':
      return {
        ...state,
        isTyping: action.payload
      };
    case 'SET_INPUT_VALUE':
      return {
        ...state,
        inputValue: action.payload
      };
    case 'UPDATE_MESSAGE_STATUS':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.id
            ? { ...msg, status: action.payload.status }
            : msg
        )
      };
    case 'CLEAR_CONVERSATION':
      return {
        ...initialState,
        conversationId: Date.now().toString()
      };
    case 'LOAD_CONVERSATION':
      return {
        ...state,
        messages: action.payload
      };
    default:
      return state;
  }
}

// Create context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Provider component
interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Simulate AI response (in real app, this would call the Gemini API)
  const simulateAIResponse = useCallback((_userMessage: string) => {
    setTimeout(() => {
      const responses = [
        "That's a great idea! Let me help you get started with that.",
        "I understand what you're looking for. Let's break this down into steps.",
        "Excellent choice! Here are some suggestions to make your website amazing.",
        "I can definitely help you with that. Let's start by planning the structure.",
        "Perfect! I'll guide you through creating exactly what you need."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        content: randomResponse,
        role: 'assistant',
        timestamp: new Date(),
        status: 'sent',
        type: 'text'
      };
      
      dispatch({ type: 'RECEIVE_MESSAGE', payload: aiMessage });
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
  }, []);

  const sendMessage = useCallback((content: string, type: Message['type'] = 'text') => {
    if (!content.trim()) return;
    
    dispatch({ type: 'SEND_MESSAGE', payload: { content, messageType: type } });
    
    // Update message status to sent after a brief delay
    setTimeout(() => {
      const messageId = Date.now().toString();
      dispatch({ type: 'UPDATE_MESSAGE_STATUS', payload: { id: messageId, status: 'sent' } });
    }, 500);
    
    // Simulate AI response
    simulateAIResponse(content);
  }, [simulateAIResponse]);

  const setInputValue = useCallback((value: string) => {
    dispatch({ type: 'SET_INPUT_VALUE', payload: value });
  }, []);

  const clearConversation = useCallback(() => {
    dispatch({ type: 'CLEAR_CONVERSATION' });
  }, []);

  const exportConversation = useCallback(() => {
    const conversationData = {
      id: state.conversationId,
      messages: state.messages,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(conversationData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${state.conversationId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [state.conversationId, state.messages]);

  const contextValue: ChatContextType = {
    ...state,
    sendMessage,
    setInputValue,
    clearConversation,
    exportConversation,
    isLoading: state.isTyping
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
}

// Hook to use chat context
export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}