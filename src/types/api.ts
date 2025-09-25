export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  mappingContext?: {
    affectedRows: string[];
    action: 'create' | 'update' | 'delete';
  };
  isLoading?: boolean;
}

export interface ClaudeAPIResponse {
  content: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
  stop_reason?: string;
  suggestions?: MappingSuggestion[];
}

export interface ClaudeAPIRequest {
  model: string;
  max_tokens: number;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  system?: string;
}

export interface MappingSuggestion {
  sourceId: string;
  suggestedTargetCode: string;
  suggestedTargetDescription: string;
  confidence: number;
  reasoning: string;
}

export interface UserFeedback {
  type: 'mapping_change' | 'bulk_action' | 'request_suggestion' | 'file_upload';
  data: {
    changedRows?: import('./mapping').MappingRow[];
    action?: string;
    context?: string;
  };
}

export interface APIError {
  message: string;
  code?: string;
  status?: number;
}