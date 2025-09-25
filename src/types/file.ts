export interface FileProcessingResult {
  data: Array<Record<string, any>>;
  headers: string[];
  totalRows: number;
  errors: string[];
  warnings: string[];
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  detectedColumns: {
    sourceCode?: string;
    sourceDescription?: string;
    targetCode?: string;
    targetDescription?: string;
  };
}

export interface UploadProgress {
  phase: 'uploading' | 'parsing' | 'validating' | 'processing' | 'complete';
  progress: number;
  message: string;
}