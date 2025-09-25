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
import './index.css';

const App: React.FC = () => {
  const [editingRow, setEditingRow] = useState<MappingRow | null>(null);
  
  // Hooks
  const {
    mappings,
    filteredMappings,
    context,
    updateMapping,
    addMappings,
    bulkUpdateMappings,
    stats,
    hasUnsavedChanges,
    lastSaved,
    setStatusFilter,
    setSearchTerm,
    statusFilter,
    searchTerm,
  } = useMappingData();

  const {
    sendMessage,
    sendMappingRequest,
    processMappingFeedback,
    generateMappingSuggestions,
    mapAccounts,
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
  const handleSendMessage = useCallback(async (message: string) => {
    // Check if this is a mapping request
    const mappingKeywords = ['map', 'mapping', 'suggest', 'analyze', 'match'];
    const isMappingRequest = mappingKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );

    if (isMappingRequest && mappings.length > 0) {
      // Use mapping-specific request handler with current mappings as source accounts
      const extractedMappings = await sendMappingRequest(message, mappings, context);
      
      // Add any extracted mappings to the grid
      if (extractedMappings.length > 0) {
        addMappings(extractedMappings);
        console.log(`Added ${extractedMappings.length} mapping suggestions to the grid`);
      }
    } else {
      // Use regular chat
      await sendMessage(message, context);
    }
  }, [sendMessage, sendMappingRequest, context, mappings, addMappings]);

  const handleFileUpload = useCallback(async (files: File[]) => {
    try {
      const newMappings = await processFiles(files);
      if (newMappings.length > 0) {
        addMappings(newMappings);
        
        // Instead of auto-sending a message, just add a system notification
        // that file has been uploaded and is ready for analysis
        console.log(`Successfully uploaded ${files.length} file(s) containing ${newMappings.length} accounts. Ready for mapping analysis.`);
      }
    } catch (error) {
      console.error('File upload error:', error);
    }
  }, [processFiles, addMappings]);

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
    const unmappedRows = mappings.filter(row => row.status === 'unmapped');
    if (unmappedRows.length > 0) {
      await generateMappingSuggestions(unmappedRows);
    }
  }, [mappings, generateMappingSuggestions]);

  const handleAutoMapAccounts = useCallback(async () => {
    try {
      const sourceAccounts = mappings.filter(row => row.status === 'unmapped' || row.status === 'pending');
      
      if (sourceAccounts.length === 0) {
        await sendMessage("No unmapped accounts found to process.", context);
        return;
      }

      // For now, we'll use the test data as target accounts
      // In a real app, this would come from user selection or configuration
      const targetAccounts = []; // This should be populated with target account data

      const mappingResults = await mapAccounts(sourceAccounts, targetAccounts);
      
      // Apply the mapping results to the data
      mappingResults.forEach((result: any) => {
        const sourceRow = mappings.find(row => row.sourceCode === result.sourceCode);
        if (sourceRow) {
          updateMapping(sourceRow.id, {
            targetCode: result.targetCode,
            targetDescription: result.targetDescription,
            confidence: result.confidence,
            status: result.confidence >= 80 ? 'mapped' : 'pending',
            notes: result.reasoning
          });
        }
      });

      await sendMessage(`Successfully processed ${mappingResults.length} account mappings with confidence scores.`, context);
    } catch (error) {
      console.error('Auto-mapping error:', error);
      await sendMessage("Sorry, I encountered an error while processing the account mappings. Please try again.", context);
    }
  }, [mappings, mapAccounts, updateMapping, sendMessage, context]);

  const handleEditRow = useCallback((row: MappingRow) => {
    setEditingRow(row);
  }, []);

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
          <button
            onClick={handleRequestSuggestions}
            disabled={claudeLoading || mappings.filter(m => m.status === 'unmapped').length === 0}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Get AI Suggestions
          </button>
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
            isLoading={claudeLoading || fileProcessing}
            disabled={claudeLoading || fileProcessing}
          />
        }
        rightPanel={
          <MappingGrid
            data={filteredMappings}
            onRowChange={handleRowChange}
            onBulkAction={handleBulkAction}
            onExport={handleExport}
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