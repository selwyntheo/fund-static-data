import { useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { 
  ChatMessage, 
  MappingContext, 
  MappingChange,
  APIError,
  MappingRow
} from '../types';

interface ClaudeAPIHook {
  sendMessage: (message: string, context?: MappingContext) => Promise<void>;
  sendMappingRequest: (message: string, sourceAccounts?: any[], context?: MappingContext) => Promise<MappingRow[]>;
  processMappingFeedback: (changes: MappingChange[]) => Promise<void>;
  generateMappingSuggestions: (unmappedRows: any[]) => Promise<void>;
  mapAccounts: (sourceAccounts: any[], targetAccounts: any[]) => Promise<any[]>;
  messages: ChatMessage[];
  isLoading: boolean;
  error: APIError | null;
  clearError: () => void;
  clearMessages: () => void;
}

const BACKEND_API_URL = 'http://localhost:8000';

export const useClaudeAPI = (): ClaudeAPIHook => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<APIError | null>(null);
  const conversationRef = useRef<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const messageCounterRef = useRef(0);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    conversationRef.current = [];
  }, []);



  const callClaudeAPI = async (
    userMessage: string, 
    context?: MappingContext
  ): Promise<string> => {
    // Add user message to conversation history
    conversationRef.current.push({ role: 'user', content: userMessage });

    const requestData = {
      message: userMessage,
      context: context,
      conversation: [...conversationRef.current],
      session_id: context?.sessionId, // Include session ID if available
    };

    try {
      const response = await axios.post(
        `${BACKEND_API_URL}/chat`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 60000, // 60 second timeout for backend processing
        }
      );

      const content = response.data.response || response.data.content;
      
      // Add assistant response to conversation history
      conversationRef.current.push({ role: 'assistant', content });

      return content;
    } catch (err: any) {
      console.error('Claude API Error:', err);
      
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const message = err.response?.data?.error?.message || err.message;
        
        throw {
          message: `API Error (${status}): ${message}`,
          code: err.response?.data?.error?.type,
          status
        } as APIError;
      }
      
      throw { message: 'Failed to communicate with Claude API' } as APIError;
    }
  };

  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    messageCounterRef.current += 1;
    const newMessage: ChatMessage = {
      ...message,
      id: `${Date.now()}-${messageCounterRef.current}`,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  const updateMessage = (id: string, updates: Partial<ChatMessage>) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, ...updates } : msg
    ));
  };

  const sendMessage = useCallback(async (
    message: string, 
    context?: MappingContext
  ) => {
    if (!message.trim()) return;

    // Add user message
    addMessage({
      type: 'user',
      content: message,
    });

    // Add loading assistant message
    const assistantMessage = addMessage({
      type: 'assistant',
      content: '',
      isLoading: true,
    });

    setIsLoading(true);
    setError(null);

    try {
      const response = await callClaudeAPI(message, context);
      
      // Update assistant message with response
      updateMessage(assistantMessage.id, {
        content: response,
        isLoading: false,
      });
    } catch (err: any) {
      console.error('Send message error:', err);
      
      // Update assistant message with error
      updateMessage(assistantMessage.id, {
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        isLoading: false,
      });

      setError({
        message: err.message || 'Failed to send message',
        code: err.code,
        status: err.status,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Function to extract mapping data from Claude's response
  const extractMappingsFromResponse = (response: string, sourceAccounts: any[]): MappingRow[] => {
    const mappings: MappingRow[] = [];
    
    try {
      // Look for mapping patterns in the response
      const lines = response.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Pattern: "1. SOURCE_CODE -> TARGET_CODE (confidence%)"
        const mappingMatch = line.match(/^\d+\.\s*(.+?)\s*->\s*(.+?)\s*\((\d+)%?\)/);
        if (mappingMatch) {
          const [, source, target, confidence] = mappingMatch;
          const sourceCode = source.trim();
          const targetCode = target.trim();
          const confidenceScore = parseInt(confidence) || 70;
          
          // Find the source account from uploaded data
          const sourceAcc = sourceAccounts.find(acc => 
            (acc.account_code && acc.account_code === sourceCode) ||
            (acc.sourceCode && acc.sourceCode === sourceCode) ||
            (acc.account_code && sourceCode.includes(acc.account_code)) ||
            (acc.sourceCode && sourceCode.includes(acc.sourceCode))
          );
          
          // Look for reasoning in the next line
          let reasoning = '';
          if (i + 1 < lines.length && lines[i + 1].trim().toLowerCase().startsWith('reasoning:')) {
            reasoning = lines[i + 1].replace(/reasoning:\s*/i, '').trim();
          }
          
          if (sourceAcc) {
            mappings.push({
              id: `claude-mapping-${sourceAcc.id || sourceCode}-${Date.now()}`,
              sourceCode: sourceAcc.sourceCode || sourceAcc.account_code,
              sourceDescription: sourceAcc.sourceDescription || sourceAcc.account_description,
              sourceType: sourceAcc.sourceType || sourceAcc.account_type,
              sourceCategory: sourceAcc.sourceCategory || sourceAcc.account_category,
              targetCode: targetCode,
              targetDescription: `Claude suggested mapping`,
              targetType: '',
              confidence: confidenceScore,
              matchType: confidenceScore > 85 ? 'Exact' : confidenceScore > 70 ? 'Semantic' : 'Manual' as const,
              status: 'pending' as const,
              notes: reasoning || `Claude AI suggestion with ${confidenceScore}% confidence`,
              lastModified: new Date(),
              metadata: {
                ...sourceAcc.metadata,
                claudeSuggestion: true,
                claudeReasoning: reasoning,
                originalResponse: line
              }
            });
          } else {
            // Create a mapping even if we can't find the exact source account
            mappings.push({
              id: `claude-unknown-${sourceCode}-${Date.now()}`,
              sourceCode: sourceCode,
              sourceDescription: `Source account from Claude analysis`,
              sourceType: '',
              sourceCategory: '',
              targetCode: targetCode,
              targetDescription: `Claude suggested mapping`,
              targetType: '',
              confidence: confidenceScore,
              matchType: 'Manual' as const,
              status: 'pending' as const,
              notes: reasoning || `Claude AI suggestion with ${confidenceScore}% confidence`,
              lastModified: new Date(),
              metadata: {
                claudeSuggestion: true,
                claudeReasoning: reasoning,
                originalResponse: line
              }
            });
          }
        }
      }
      
      console.log(`Extracted ${mappings.length} mappings from Claude's response`);
      
    } catch (error) {
      console.warn('Error extracting mappings from response:', error);
    }
    
    return mappings;
  };

  const sendMappingRequest = useCallback(async (
    message: string, 
    sourceAccounts?: any[],
    context?: MappingContext
  ): Promise<MappingRow[]> => {
    if (!message.trim()) return [];

    // Add user message
    addMessage({
      type: 'user',
      content: message,
    });

    // Add loading assistant message
    const assistantMessage = addMessage({
      type: 'assistant',
      content: '',
      isLoading: true,
    });

    setIsLoading(true);
    setError(null);

    try {
      const response = await callClaudeAPI(message, context);
      
      // Update assistant message with response
      updateMessage(assistantMessage.id, {
        content: response,
        isLoading: false,
      });

      // Extract mapping data from the response
      // Use the provided source accounts for mapping extraction
      const extractedMappings = extractMappingsFromResponse(response, sourceAccounts || []);
      
      return extractedMappings;
    } catch (err: any) {
      console.error('Send mapping request error:', err);
      
      // Update assistant message with error
      updateMessage(assistantMessage.id, {
        content: 'Sorry, I encountered an error processing your mapping request. Please try again.',
        isLoading: false,
      });

      setError({
        message: err.message || 'Failed to send mapping request',
        code: err.code,
        status: err.status,
      });
      
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [callClaudeAPI, addMessage, updateMessage]);

  const processMappingFeedback = useCallback(async (changes: MappingChange[]) => {
    if (changes.length === 0) return;

    try {
      await axios.post(`${BACKEND_API_URL}/feedback`, {
        changes: changes,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Failed to send mapping feedback to backend:', err);
      // Don't show error to user for background feedback
    }
  }, []);

  const generateMappingSuggestions = useCallback(async (unmappedRows: any[]) => {
    if (unmappedRows.length === 0) return;

    // Use chat-based mapping instead of direct API call
    const mappingRequest = `Please analyze and suggest mappings for these ${unmappedRows.length} unmapped accounts:

${unmappedRows.slice(0, 10).map((row, index) => 
  `${index + 1}. ${row.sourceCode} - ${row.sourceDescription}${row.sourceType ? ` (${row.sourceType})` : ''}`
).join('\n')}

${unmappedRows.length > 10 ? `\n(Showing first 10 of ${unmappedRows.length} unmapped items)` : ''}

Please provide:
1. Suggested target account mappings
2. Confidence levels (0-100%)  
3. Reasoning for each mapping
4. Any potential concerns or alternatives

Use the uploaded account data to find the best matches.`;

    try {
      // Add user message for the mapping request
      addMessage({
        type: 'user',
        content: mappingRequest,
      });

      // Add loading assistant message
      const assistantMessage = addMessage({
        type: 'assistant',
        content: '',
        isLoading: true,
      });

      // Get mapping suggestions through chat
      const response = await callClaudeAPI(mappingRequest, undefined);
      
      // Update assistant message with response
      updateMessage(assistantMessage.id, {
        content: response,
        isLoading: false,
      });

    } catch (err) {
      console.error('Failed to generate mapping suggestions:', err);
      addMessage({
        type: 'assistant',
        content: 'Sorry, I encountered an error while generating mapping suggestions. Please try again.',
        isLoading: false,
      });
    }
  }, [callClaudeAPI, addMessage, updateMessage]);

  const mapAccounts = useCallback(async (sourceAccounts: any[], targetAccounts: any[]) => {
    // Use chat-based mapping instead of direct API call for better session context
    const mappingRequest = `Please map these source accounts to appropriate target accounts:

SOURCE ACCOUNTS:
${sourceAccounts.map((acc, i) => `${i + 1}. ${acc.account_code} - ${acc.account_description}`).join('\n')}

TARGET ACCOUNTS AVAILABLE:
${targetAccounts.map((acc, i) => `${i + 1}. ${acc.account_code} - ${acc.account_description}`).join('\n')}

Please provide structured mapping results with confidence scores and reasoning.`;

    try {
      await callClaudeAPI(mappingRequest, undefined);
      
      // For now, return empty array since this is primarily for chat-based interaction
      // The actual mapping will be displayed in the chat interface
      return [];
    } catch (err) {
      console.error('Failed to map accounts:', err);
      throw err;
    }
  }, [callClaudeAPI]);

  return {
    sendMessage,
    sendMappingRequest,
    processMappingFeedback,
    generateMappingSuggestions,
    mapAccounts,
    messages,
    isLoading,
    error,
    clearError,
    clearMessages,
  };
};

