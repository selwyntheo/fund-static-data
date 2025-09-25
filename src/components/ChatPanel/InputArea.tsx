import React, { useState, useRef, KeyboardEvent } from 'react';
import { useDropzone } from 'react-dropzone';
import { Send, Upload, Paperclip, X } from 'lucide-react';

interface InputAreaProps {
  onSendMessage: (message: string) => void;
  onFileUpload: (files: File[]) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({
  onSendMessage,
  onFileUpload,
  isLoading = false,
  disabled = false,
}) => {
  const [message, setMessage] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim() && !disabled && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
      
      // Handle file uploads if any
      if (attachedFiles.length > 0) {
        onFileUpload(attachedFiles);
        setAttachedFiles([]);
      }
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    multiple: true,
    onDrop: (files) => {
      setAttachedFiles(prev => [...prev, ...files]);
    },
    noClick: true,
  });

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const openFileDialog = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls,.csv';
    input.multiple = true;
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      setAttachedFiles(prev => [...prev, ...files]);
    };
    input.click();
  };

  return (
    <div className="border-t bg-white">
      {/* File Attachments */}
      {attachedFiles.length > 0 && (
        <div className="p-3 border-b bg-gray-50">
          <div className="flex flex-wrap gap-2">
            {attachedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm"
              >
                <Paperclip size={14} className="mr-1" />
                <span className="truncate max-w-[150px]">{file.name}</span>
                <button
                  onClick={() => removeFile(index)}
                  className="ml-1 hover:bg-blue-200 rounded p-0.5"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drag and Drop Overlay */}
      <div
        {...getRootProps()}
        className={`relative ${isDragActive ? 'bg-blue-50' : ''}`}
      >
        <input {...getInputProps()} />
        
        {isDragActive && (
          <div className="absolute inset-0 bg-blue-500/10 border-2 border-dashed border-blue-500 rounded-lg flex items-center justify-center z-10">
            <div className="text-blue-600 text-center">
              <Upload size={32} className="mx-auto mb-2" />
              <p className="font-medium">Drop Excel/CSV files here</p>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-3">
          <div className="flex items-end space-x-2">
            {/* File Upload Button */}
            <button
              onClick={openFileDialog}
              disabled={disabled}
              className="flex-shrink-0 p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Attach files"
            >
              <Paperclip size={20} />
            </button>

            {/* Message Input */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={handleTextareaChange}
                onKeyPress={handleKeyPress}
                placeholder="Type your message... (Shift+Enter for new line)"
                disabled={disabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                style={{ minHeight: '40px', maxHeight: '150px' }}
              />
            </div>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!message.trim() || disabled || isLoading}
              className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
                message.trim() && !disabled && !isLoading
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              title="Send message"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-transparent"></div>
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>

          {/* Helper Text */}
          <div className="mt-2 text-xs text-gray-500">
            Supported file formats: Excel (.xlsx, .xls), CSV (.csv)
          </div>
        </div>
      </div>
    </div>
  );
};