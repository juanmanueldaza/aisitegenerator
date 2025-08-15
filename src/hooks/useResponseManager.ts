import { useState, useCallback } from 'react';
import { GeminiResponse, SuggestionAction } from '../types/gemini';

interface UseResponseManagerOptions {
  onActionExecuted?: (action: SuggestionAction, response: GeminiResponse) => void;
  onError?: (error: Error) => void;
}

export const useResponseManager = (options: UseResponseManagerOptions = {}) => {
  const [responses, setResponses] = useState<GeminiResponse[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const addResponse = useCallback((response: GeminiResponse) => {
    setResponses(prev => [...prev, response]);
  }, []);

  const removeResponse = useCallback((responseId: string) => {
    setResponses(prev => prev.filter(r => r.id !== responseId));
  }, []);

  const clearResponses = useCallback(() => {
    setResponses([]);
  }, []);

  const executeAction = useCallback(async (action: SuggestionAction, response: GeminiResponse) => {
    try {
      setIsProcessing(true);

      switch (action.type) {
        case 'copy':
          await handleCopyAction(action);
          break;
        case 'apply':
          await handleApplyAction(action);
          break;
        case 'preview':
          await handlePreviewAction(action);
          break;
        case 'modify':
          await handleModifyAction(action);
          break;
        default:
          console.warn('Unknown action type:', action.type);
      }

      options.onActionExecuted?.(action, response);
    } catch (error) {
      console.error('Error executing action:', error);
      options.onError?.(error as Error);
    } finally {
      setIsProcessing(false);
    }
  }, [options]);

  const handleCopyAction = async (action: SuggestionAction) => {
    const { code } = action.payload;
    
    if (!code) {
      throw new Error('No code to copy');
    }

    try {
      await navigator.clipboard.writeText(code);
      console.log('Code copied to clipboard');
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  const handleApplyAction = async (action: SuggestionAction) => {
    // This would integrate with the site creation workflow
    // For now, we'll just log the action
    console.log('Applying suggestion:', action.payload);
    
    // In a real implementation, this might:
    // - Update the site content state
    // - Trigger a preview update
    // - Save changes to local storage
    // - Sync with the chat context
  };

  const handlePreviewAction = async (action: SuggestionAction) => {
    // This would trigger a preview of the code/content
    console.log('Previewing suggestion:', action.payload);
    
    // In a real implementation, this might:
    // - Open a preview modal
    // - Update the live preview
    // - Show a diff view
  };

  const handleModifyAction = async (action: SuggestionAction) => {
    // This would allow the user to modify the suggestion
    console.log('Modifying suggestion:', action.payload);
    
    // In a real implementation, this might:
    // - Open an editor with the suggestion
    // - Allow inline editing
    // - Save modifications
  };

  const createMockResponse = useCallback((type: GeminiResponse['type'], content: string): GeminiResponse => {
    return {
      id: `response-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content,
      timestamp: new Date(),
      type,
      metadata: type === 'suggestion' ? {
        actions: [
          {
            id: 'apply-suggestion',
            label: 'Apply Suggestion',
            type: 'apply',
            payload: { content }
          },
          {
            id: 'copy-suggestion',
            label: 'Copy to Clipboard',
            type: 'copy',
            payload: { code: content }
          }
        ]
      } : undefined
    };
  }, []);

  return {
    responses,
    isProcessing,
    addResponse,
    removeResponse,
    clearResponses,
    executeAction,
    createMockResponse
  };
};