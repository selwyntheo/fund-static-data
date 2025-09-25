import React from 'react';
import { ChatMessage } from '../../types';
import { User, Bot, Clock } from 'lucide-react';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.type === 'user';
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isUser ? 'ml-2' : 'mr-2'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser ? 'bg-blue-500 text-white' : 'bg-gray-600 text-white'
          }`}>
            {isUser ? <User size={16} /> : <Bot size={16} />}
          </div>
        </div>

        {/* Message Content */}
        <div className="flex-1">
          <div className={`rounded-lg px-4 py-2 ${
            isUser 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-800 border'
          }`}>
            {message.isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
                <span className="text-sm">Claude is thinking...</span>
              </div>
            ) : (
              <div className="whitespace-pre-wrap text-sm leading-relaxed select-text">
                {message.content}
              </div>
            )}
            
            {/* Mapping Context Indicator */}
            {message.mappingContext && (
              <div className={`mt-2 text-xs ${
                isUser ? 'text-blue-100' : 'text-gray-500'
              }`}>
                <div className="flex items-center space-x-1">
                  <span>📊</span>
                  <span>
                    {message.mappingContext.action} {message.mappingContext.affectedRows.length} row(s)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Timestamp */}
          <div className={`flex items-center mt-1 text-xs text-gray-500 ${
            isUser ? 'justify-end' : 'justify-start'
          }`}>
            <Clock size={12} className="mr-1" />
            <span>{formatTime(message.timestamp)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};