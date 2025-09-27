import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Send, Upload, Paperclip, X } from 'lucide-react';

interface InputAreaProps {
  onSendMessage: (message: string, sessionId?: string) => void;
  onFileUpload: (files: File[]) => Promise<string | null>;
  onShowIntelligentRecommendation?: (fileName: string, files: File[]) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({
  onSendMessage,
  onFileUpload,
  onShowIntelligentRecommendation,
  isLoading = false,
  disabled = false,
}) => {
  const [message, setMessage] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  // Debug attachedFiles changes and trigger intelligent recommendation
  useEffect(() => {
    console.log('[InputArea] attachedFiles updated:', attachedFiles);
    console.log('[InputArea] hasFiles for button:', attachedFiles.length > 0);
    
    const canSend = (message.trim() || attachedFiles.length > 0) && !disabled && !isLoading;
    console.log('[InputArea] Send button state:', {
      hasMessage: !!message.trim(),
      hasFiles: attachedFiles.length > 0,
      disabled,
      isLoading,
      canSend
    });

    // Trigger intelligent recommendation when files are attached
    if (attachedFiles.length > 0 && onShowIntelligentRecommendation) {
      const fileName = attachedFiles[0]?.name || 'uploaded file';
      console.log('[InputArea] Triggering intelligent recommendation for:', fileName);
      onShowIntelligentRecommendation(fileName, attachedFiles);
    }
  }, [attachedFiles, message, disabled, isLoading, onShowIntelligentRecommendation]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    console.log('🚀 InputArea.handleSend called', { 
      hasMessage: !!message.trim(), 
      attachedFilesCount: attachedFiles.length,
      disabled, 
      isLoading 
    });
    
    // Check if we can send (either message or files)
    const canSend = (message.trim() || attachedFiles.length > 0) && !disabled && !isLoading;
    console.log('🔍 Can send check:', { canSend, messageLength: message.trim().length, filesCount: attachedFiles.length });
    
    if (canSend) {
      const messageToSend = message.trim();
      setMessage('');
      
      // Handle file uploads FIRST if any, then send message
      if (attachedFiles.length > 0) {
        try {
          console.log('🔄 Processing files before sending message...', attachedFiles.map(f => f.name));
          
          // Create file attachment info for chat history
          const fileInfo = attachedFiles.map(f => ({
            name: f.name,
            size: f.size,
            type: f.type
          }));
          
          // Upload files and wait for processing to complete
          const sessionId = await onFileUpload(attachedFiles);
          
          console.log('✅ Files processed, now sending message with session ID:', sessionId);
          
          // Send message with file attachment info included
          const attachmentText = '\n\n📎 Attachments:\n' + 
            fileInfo.map(f => `• ${f.name} (${(f.size / 1024).toFixed(1)}KB)`).join('\n');
          const messageWithFiles = messageToSend ? messageToSend + attachmentText : attachmentText.trim();
          
          onSendMessage(messageWithFiles, sessionId || undefined);
          setAttachedFiles([]); // Clear files after successful processing
        } catch (error) {
          console.error('❌ File upload failed:', error);
          setAttachedFiles([]); // Clear files even on error
          // Send message anyway if file upload fails (only if there was a message)
          if (messageToSend) {
            onSendMessage(messageToSend);
          }
        }
      } else {
        console.log('📤 No files attached, sending message immediately');
        // No files attached, send message immediately
        onSendMessage(messageToSend);
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
      console.log('[InputArea] Files dropped:', files);
      setAttachedFiles(prev => {
        const newFiles = [...prev, ...files];
        console.log('[InputArea] Updated attachedFiles:', newFiles);
        return newFiles;
      });
    },
    noClick: true,
  });

  const removeFile = (index: number) => {
    console.log('[InputArea] Removing file at index:', index);
    setAttachedFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index);
      console.log('[InputArea] Files after removal:', newFiles.map(f => f.name));
      return newFiles;
    });
  };

  const openFileDialog = () => {
    console.log('[InputArea] Opening file dialog');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls,.csv';
    input.multiple = true;
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      console.log('[InputArea] Files selected via dialog:', files);
      setAttachedFiles(prev => {
        const newFiles = [...prev, ...files];
        console.log('[InputArea] Updated attachedFiles via dialog:', newFiles);
        return newFiles;
      });
    };
    input.click();
  };

  return (
    <div className="border-t bg-white">
      {/* File Attachments */}
      {attachedFiles.length > 0 && (
        <div className="p-3 border-b bg-blue-50">
          <div className="flex flex-wrap gap-2 mb-2">
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
          <div className="text-sm text-blue-700 font-medium">
            📎 Files ready - Use the smart suggestion or send a message to process
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
              disabled={(!message.trim() && attachedFiles.length === 0) || disabled || isLoading}
              className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
                (message.trim() || attachedFiles.length > 0) && !disabled && !isLoading
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