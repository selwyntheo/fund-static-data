import { useState, useCallback } from 'react';
import { 
  UploadProgress, 
  MappingRow 
} from '../types';

interface UseFileProcessorResult {
  processFiles: (files: File[]) => Promise<MappingRow[]>;
  progress: UploadProgress | null;
  isProcessing: boolean;
  error: string | null;
  clearError: () => void;
}

export const useFileProcessor = (): UseFileProcessorResult => {
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const updateProgress = (phase: UploadProgress['phase'], progress: number, message: string) => {
    setProgress({ phase, progress, message });
  };

  const processFiles = useCallback(async (files: File[]): Promise<MappingRow[]> => {
    console.log('[useFileProcessor] processFiles called with:', files.map(f => ({ name: f.name, size: f.size })));
    
    if (files.length === 0) {
      console.log('[useFileProcessor] No files provided, returning empty array');
      return [];
    }

    console.log('[useFileProcessor] Starting file processing');
    setIsProcessing(true);
    setError(null);
    
    try {
      const allMappings: MappingRow[] = [];
      console.log('[useFileProcessor] Initialized allMappings array');

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileNumber = i + 1;
        const totalFiles = files.length;

        // Upload phase
        updateProgress(
          'uploading', 
          (i / totalFiles) * 50, 
          `Uploading file ${fileNumber} of ${totalFiles}: ${file.name}`
        );

        // Create FormData for file upload
        const formData = new FormData();
        formData.append('file', file);

        // Upload to backend
        console.log(`[useFileProcessor] Uploading file ${fileNumber}/${totalFiles}: ${file.name}`);
        const response = await fetch('http://localhost:8000/upload-accounts', {
          method: 'POST',
          body: formData,
        });

        console.log(`[useFileProcessor] Upload response status: ${response.status}`);
        if (!response.ok) {
          const errorData = await response.json();
          console.error(`[useFileProcessor] Upload failed for ${file.name}:`, errorData);
          throw new Error(errorData.detail || `Upload failed for ${file.name}`);
        }

        const result = await response.json();
        console.log(`[useFileProcessor] Upload successful for ${file.name}, result:`, result);

        // Processing phase
        updateProgress(
          'processing', 
          50 + (i / totalFiles) * 50, 
          `Processing ${file.name} data...`
        );

        // Store session_id for later use with Claude
        const sessionId = result.session_id;
        
        // Convert backend AccountData to MappingRow format
        const mappingRows: MappingRow[] = result.accounts.map((account: any, index: number) => ({
          id: `${file.name}-${index}`,
          sourceCode: account.account_code,
          sourceDescription: account.account_description,
          sourceType: account.account_type,
          sourceCategory: account.account_category,
          targetCode: '',
          targetDescription: '',
          targetType: '',
          confidence: 0,
          matchType: 'None' as const,
          status: 'pending' as const,
          notes: `Imported from ${file.name}`,
          lastModified: new Date(),
          metadata: {
            fileName: file.name,
            fileSize: file.size,
            sessionId: sessionId,  // Store session ID for Claude context
            uploadedAt: new Date().toISOString(),
            ...account.metadata
          }
        }));

        allMappings.push(...mappingRows);

        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Complete
      updateProgress('complete', 100, `Successfully processed ${files.length} file(s)`);

      // Clear progress after a delay
      setTimeout(() => {
        setProgress(null);
      }, 2000);

      return allMappings;

    } catch (err: any) {
      console.error('File processing error:', err);
      setError(err.message || 'An error occurred while processing files');
      setProgress(null);
      return [];
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    processFiles,
    progress,
    isProcessing,
    error,
    clearError,
  };
};