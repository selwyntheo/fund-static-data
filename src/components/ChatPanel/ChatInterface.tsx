import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../../types';
import { MessageBubble } from './MessageBubble';
import { InputArea } from './InputArea';
import { MessageSquare } from 'lucide-react';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onFileUpload: (files: File[]) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  onFileUpload,
  isLoading = false,
  disabled = false,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 select-text"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageSquare size={48} className="mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Welcome to Claude Mapping Assistant</h3>
            <p className="text-center text-sm max-w-md">
              Upload your accounting data files or start a conversation to get help with 
              cross-reference mapping between different accounting platforms.
            </p>
            <div className="mt-4 text-xs bg-blue-50 text-blue-700 px-3 py-2 rounded-lg">
              💡 Tip: Drag and drop Excel or CSV files directly into the chat
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <InputArea
        onSendMessage={onSendMessage}
        onFileUpload={onFileUpload}
        isLoading={isLoading}
        disabled={disabled}
      />
    </div>
  );
};