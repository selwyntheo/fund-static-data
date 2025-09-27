import React, { useState, useCallback } from 'react';
import { TwoColumnLayout } from './components/Layout';
import { ChatInterface } from './components/ChatPanel';
import { MappingGrid, EditMappingModal } from './components/MappingPanel';
import { StatusIndicator } from './components/Common';
import { useClaudeAPI } from './hooks/useClaudeAPI';
import { useMappingData } from './hooks/useMappingData';
import { useFileProcessor } from './hooks/useFileProcessor';
import { exportToExcel, exportToCSV } from './utils/fileParser';
import { MappingRow } from './types';
import { Button } from '@mui/material';
import { Psychology } from '@mui/icons-material';
import './index.css';

const App: React.FC = () => {
  const [editingRow, setEditingRow] = useState<MappingRow | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showIntelligentRecommendation, setShowIntelligentRecommendation] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [waitingForMappings, setWaitingForMappings] = useState<boolean>(false);
  
  // Hooks
  const {
    mappings,
    filteredMappings,
    context,
    updateMapping,
    addMappings,
    bulkUpdateMappings,
    applySuggestions,
    stats,
    hasUnsavedChanges,
    lastSaved,
  } = useMappingData();

  // Debug: Track when filteredMappings changes
  React.useEffect(() => {
    console.log(`🔄 App.tsx - filteredMappings changed: ${filteredMappings.length} rows`);
  }, [filteredMappings]);

  const {
    sendMessage,
    sendMappingRequest,
    processMappingFeedback,
    generateMappingSuggestions,
    messages,
    isLoading: claudeLoading,
    error: claudeError,
    clearError: clearClaudeError,
  } = useClaudeAPI();

  const {
    processFiles,
    progress: fileProgress,
    isProcessing: fileProcessing,
    error: fileError,
    clearError: clearFileError,
  } = useFileProcessor();

  // Event handlers
  const handleSendMessage = useCallback(async (message: string, immediateSessionId?: string) => {
    console.log('🔍 handleSendMessage context debug:', {
      contextTotalRows: context.totalRows,
      mappingsLength: mappings.length,
      contextObject: context
    });
    
    // Create enhanced context with immediate session ID having highest priority
    const enhancedContext = {
      ...context,
      sessionId: immediateSessionId || currentSessionId || context.sessionId || undefined
    };
    
    console.log('🔧 Enhanced context:', { 
      immediateSessionId,
      currentSessionId, 
      originalSessionId: context.sessionId, 
      finalSessionId: enhancedContext.sessionId,
      enhancedContextTotalRows: enhancedContext.totalRows
    });
    
    // Check if this is a mapping request
    const mappingKeywords = ['map', 'mapping', 'suggest', 'analyze', 'match', 'create', 'generate', 'provide', 'give', 'show', 'eagle', 'account'];
    const isMappingRequest = mappingKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );

    console.log('🔍 Mapping request detection:', {
      message: message.substring(0, 100) + '...',
      isMappingRequest,
      mappingsLength: mappings.length,
      willUseMappingRequest: isMappingRequest
    });

    if (isMappingRequest) {
      // Use mapping-specific request handler with current mappings as source accounts
      const extractedMappings = await sendMappingRequest(message, mappings, enhancedContext);
      
      // Apply extracted mappings as suggestions to existing rows
      if (extractedMappings.length > 0) {
        console.log(`🚀 Applying ${extractedMappings.length} mapping suggestions to existing rows`);
        console.log(`📊 Before applying: ${mappings.length} total mappings, ${filteredMappings.length} filtered`);
        applySuggestions(extractedMappings);
        console.log(`✅ Applied ${extractedMappings.length} mapping suggestions to existing rows`);
        
        // Force a small delay to let React update, then check the state
        setTimeout(() => {
          console.log(`📊 After applying: ${mappings.length} total mappings, ${filteredMappings.length} filtered`);
        }, 100);
      } else {
        console.log('❌ No mappings extracted to apply as suggestions');
      }
    } else {
      // Use regular chat with enhanced context
      await sendMessage(message, enhancedContext);
    }
  }, [sendMessage, sendMappingRequest, context, mappings, applySuggestions, currentSessionId]);

  const handleFileUpload = useCallback(async (files: File[]): Promise<string | null> => {
    console.log('📁 App.handleFileUpload called with files:', files.map(f => ({ name: f.name, size: f.size })));
    
    try {
      const newMappings = await processFiles(files);
      console.log('📊 processFiles completed, mappings:', newMappings.length);
      
      if (newMappings.length > 0) {
        // Extract session ID from the first mapping and force update
        const sessionId = newMappings[0]?.metadata?.sessionId;
        console.log('🔍 Extracting session ID from new mappings:', { 
          newMappingsCount: newMappings.length,
          sessionId,
          firstMappingMetadata: newMappings[0]?.metadata 
        });
        
        if (sessionId) {
          setCurrentSessionId(sessionId);
          console.log('🔑 Stored session ID:', sessionId);
        } else {
          console.warn('❌ No session ID found in new mappings!');
        }
        
        addMappings(newMappings);
        
        // Show intelligent recommendation for IO to Eagle mapping
        const fileName = files[0]?.name || 'uploaded file';
        console.log('🎯 Setting intelligent recommendation:', { fileName, showIntelligentRecommendation: true });
        setUploadedFileName(fileName);
        setShowIntelligentRecommendation(true);
        
        // Instead of auto-sending a message, just add a system notification
        // that file has been uploaded and is ready for analysis
        console.log(`✅ Successfully uploaded ${files.length} file(s) containing ${newMappings.length} accounts. Ready for mapping analysis.`);
        
        // Wait for React state to update and verify session ID is stored
        console.log('⏳ Waiting for React state to update...');
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Force re-render to ensure currentSessionId is available
        console.log('🔄 Current session ID after delay:', currentSessionId);
        
        // Additional wait to ensure context updates
        await new Promise(resolve => setTimeout(resolve, 200));
        console.log('✅ Context update delay completed');
        
        return sessionId || null; // Return the session ID for immediate use
      }
    } catch (error) {
      console.error('❌ File upload error:', error);
      throw error; // Re-throw so InputArea can handle the error
    }
    
    return null;
  }, [processFiles, addMappings, setCurrentSessionId]);

  const handleRowChange = useCallback((rowId: string, changes: Partial<MappingRow>) => {
    updateMapping(rowId, changes);
    
    // Send feedback to Claude about the change
    const changeEntries = Object.entries(changes).filter(([_, value]) => value !== undefined);
    if (changeEntries.length > 0) {
      processMappingFeedback([{
        rowId,
        field: changeEntries[0][0] as keyof MappingRow,
        oldValue: '',
        newValue: changeEntries[0][1],
        timestamp: new Date()
      }]);
    }
  }, [updateMapping, processMappingFeedback]);

  const handleBulkAction = useCallback(async (action: string, selectedRows: MappingRow[]) => {
    const rowIds = selectedRows.map(row => row.id);
    
    switch (action) {
      case 'accept':
        bulkUpdateMappings(rowIds, { status: 'mapped' });
        break;
      case 'reject':
        bulkUpdateMappings(rowIds, { status: 'rejected' });
        break;
      default:
        console.warn('Unknown bulk action:', action);
    }

    // Notify Claude about bulk action
    const bulkMessage = `I performed a bulk ${action} action on ${selectedRows.length} mappings.`;
    await sendMessage(bulkMessage, context);
  }, [bulkUpdateMappings, sendMessage, context]);

  const handleExport = useCallback((format: 'excel' | 'csv') => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `account-mappings-${timestamp}.${format === 'excel' ? 'xlsx' : 'csv'}`;
    
    if (format === 'excel') {
      exportToExcel(mappings, filename);
    } else {
      exportToCSV(mappings, filename);
    }
  }, [mappings]);

  const handleRequestSuggestions = useCallback(async () => {
    const unmappedRows = mappings.filter(row => row.status === 'unmapped' || row.status === 'pending');
    console.log('🎯 Get AI Suggestions clicked:', {
      totalMappings: mappings.length,
      unmappedRows: unmappedRows.length,
      claudeLoading,
      allStatuses: mappings.map(m => m.status)
    });
    if (unmappedRows.length > 0) {
      await generateMappingSuggestions(unmappedRows);
    }
  }, [mappings, generateMappingSuggestions, claudeLoading]);

  // Debug: Log button disabled state
  React.useEffect(() => {
    const unmappedCount = mappings.filter(m => m.status === 'unmapped' || m.status === 'pending').length;
    const isDisabled = claudeLoading || unmappedCount === 0;
    console.log('🔘 Get AI Suggestions button state:', {
      claudeLoading,
      unmappedCount,
      totalMappings: mappings.length,
      statusBreakdown: {
        pending: mappings.filter(m => m.status === 'pending').length,
        unmapped: mappings.filter(m => m.status === 'unmapped').length,
        mapped: mappings.filter(m => m.status === 'mapped').length,
        rejected: mappings.filter(m => m.status === 'rejected').length,
      },
      isDisabled,
      buttonText: `Get AI Suggestions ${isDisabled ? '(DISABLED)' : '(ENABLED)'}`
    });
  }, [claudeLoading, mappings]);



  const handleEdit = useCallback((row: MappingRow) => {
    setEditingRow(row);
  }, []);

  const handleAcceptRecommendation = useCallback(async () => {
    console.log('🎯 User accepted intelligent recommendation for IO → Eagle mapping');
    console.log('📁 Processing pending files:', pendingFiles.length);
    
    setShowIntelligentRecommendation(false);
    
    // First, process the pending files to populate the mapping data
    if (pendingFiles.length > 0) {
      try {
        console.log('🔄 Processing files for recommendation...');
        setWaitingForMappings(true); // Set flag to wait for mappings
        const sessionId = await handleFileUpload(pendingFiles);
        console.log('✅ Files processed, waiting for mappings to populate. Session ID:', sessionId);
        setPendingFiles([]); // Clear pending files
        // The useEffect will trigger the mapping request when mappings are populated
        
      } catch (error) {
        console.error('❌ Failed to process files for recommendation:', error);
        setPendingFiles([]); // Clear pending files even on error
        setWaitingForMappings(false); // Reset flag on error
      }
    } else {
      console.warn('⚠️ No pending files to process for recommendation');
    }
  }, [uploadedFileName, handleSendMessage, pendingFiles, handleFileUpload]);

  const handleDismissRecommendation = useCallback(() => {
    console.log('❌ User dismissed intelligent recommendation');
    setShowIntelligentRecommendation(false);
  }, []);

  const handleShowIntelligentRecommendation = useCallback((fileName: string, files: File[]) => {
    console.log('🎯 Showing intelligent recommendation for file:', fileName, 'with files:', files.length);
    setUploadedFileName(fileName);
    setPendingFiles(files);
    setShowIntelligentRecommendation(true);
  }, []);

  // Debug: Log intelligent recommendation state
  React.useEffect(() => {
    console.log('💡 Intelligent recommendation state:', {
      showIntelligentRecommendation,
      uploadedFileName
    });
  }, [showIntelligentRecommendation, uploadedFileName]);

  // Watch for mappings updates after file upload to trigger mapping request
  React.useEffect(() => {
    if (waitingForMappings && mappings.length > 0) {
      console.log('🎯 Mappings populated, sending mapping request with', mappings.length, 'mappings');
      setWaitingForMappings(false);
      
      const mappingMessage = `Please analyze the uploaded ${uploadedFileName} file and map all IO accounting platform accounts to their corresponding Eagle platform accounts. 

Focus on:
1. Asset accounts mapping 
2. Liability accounts mapping
3. Equity accounts mapping  
4. Revenue accounts mapping
5. Expense accounts mapping

Provide detailed mappings with confidence scores and reasoning for each account mapping suggestion.`;

      handleSendMessage(mappingMessage, currentSessionId || undefined);
    }
  }, [waitingForMappings, mappings.length, uploadedFileName, handleSendMessage, currentSessionId]);

  const handleCloseEditModal = useCallback(() => {
    setEditingRow(null);
  }, []);

  const handleSaveEdit = useCallback((rowId: string, changes: Partial<MappingRow>) => {
    handleRowChange(rowId, changes);
    setEditingRow(null);
  }, [handleRowChange]);

  // Clear errors when component mounts
  React.useEffect(() => {
    if (claudeError) {
      const timer = setTimeout(clearClaudeError, 5000);
      return () => clearTimeout(timer);
    }
  }, [claudeError, clearClaudeError]);

  React.useEffect(() => {
    if (fileError) {
      const timer = setTimeout(clearFileError, 5000);
      return () => clearTimeout(timer);
    }
  }, [fileError, clearFileError]);

  return (
    <div className="h-screen bg-gray-100">
      {/* Status Bar */}
      <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-800">
            Claude Accounting Cross-Reference Mapping
          </h1>
          
          {/* Auto-save indicator */}
          {hasUnsavedChanges ? (
            <StatusIndicator status="pending" message="Saving..." size="sm" />
          ) : lastSaved ? (
            <StatusIndicator 
              status="success" 
              message={`Saved ${lastSaved.toLocaleTimeString()}`} 
              size="sm" 
            />
          ) : null}
        </div>

        <div className="flex items-center space-x-4">
          {/* Statistics */}
          <div className="text-sm text-gray-600">
            <span className="font-medium">{stats.total}</span> total mappings •{' '}
            <span className="text-green-600 font-medium">{stats.byStatus.mapped || 0}</span> mapped •{' '}
            <span className="text-gray-500 font-medium">{stats.byStatus.unmapped || 0}</span> unmapped
          </div>

          {/* Quick actions */}
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<Psychology />}
            onClick={handleRequestSuggestions}
            disabled={claudeLoading || mappings.filter(m => m.status === 'unmapped' || m.status === 'pending').length === 0}
            sx={{
              '&:hover': { 
                boxShadow: '0 4px 12px rgba(43, 156, 174, 0.3)',
              },
              '&:disabled': {
                backgroundColor: '#e0e0e0 !important',
                color: '#9e9e9e !important',
              },
              fontWeight: 600,
              fontSize: '0.875rem',
              textTransform: 'none',
              borderRadius: '8px',
              px: 3,
              py: 1,
            }}
          >
            Get AI Suggestions
          </Button>
        </div>
      </div>

      {/* Error notifications */}
      {claudeError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <strong>Claude API Error:</strong> {claudeError.message}
              </p>
            </div>
            <button
              onClick={clearClaudeError}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {fileError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <strong>File Processing Error:</strong> {fileError}
              </p>
            </div>
            <button
              onClick={clearFileError}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <TwoColumnLayout
        leftPanel={
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            onFileUpload={handleFileUpload}
            onShowIntelligentRecommendation={handleShowIntelligentRecommendation}
            isLoading={claudeLoading || fileProcessing}
            disabled={claudeLoading || fileProcessing}
            showIntelligentRecommendation={showIntelligentRecommendation}
            uploadedFileName={uploadedFileName}
            onAcceptRecommendation={handleAcceptRecommendation}
            onDismissRecommendation={handleDismissRecommendation}
          />
        }
        rightPanel={
          <MappingGrid
            data={filteredMappings}
            onRowChange={handleRowChange}
            onBulkAction={handleBulkAction}
            onExport={handleExport}
            onEdit={handleEdit}
            isLoading={fileProcessing}
          />
        }
        initialSplitPosition={40}
      />

      {/* Edit Modal */}
      <EditMappingModal
        row={editingRow}
        isOpen={!!editingRow}
        onClose={handleCloseEditModal}
        onSave={handleSaveEdit}
      />

      {/* File processing progress overlay */}
      {fileProgress && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Processing Files</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>{fileProgress.message}</span>
                <span>{fileProgress.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${fileProgress.progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;