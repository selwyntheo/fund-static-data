export interface MappingRow {
  id: string;
  sourceCode: string;
  sourceDescription: string;
  targetCode: string;
  targetDescription: string;
  matchType: 'Exact' | 'Semantic' | 'Manual' | 'None';
  confidence: number;
  status: 'mapped' | 'unmapped' | 'pending' | 'rejected';
  notes: string;
  lastModified: Date;
  modifiedBy?: 'user' | 'claude';
  sourceType?: string;
  sourceCategory?: string;
  targetType?: string;
  metadata?: {
    fileName?: string;
    fileSize?: number;
    sessionId?: string;
    [key: string]: any;
  };
}

export interface MappingChange {
  rowId: string;
  field: keyof MappingRow;
  oldValue: any;
  newValue: any;
  timestamp: Date;
}

export interface SerializableMappingChange {
  rowId: string;
  field: keyof MappingRow;
  oldValue: any;
  newValue: any;
  timestamp: string;
}

export interface MappingContext {
  totalRows: number;
  mappedRows: number;
  unmappedRows: number;
  pendingRows: number;
  rejectedRows: number;
  averageConfidence: number;
  recentChanges: MappingChange[] | SerializableMappingChange[];
  fileMetadata?: FileMetadata;
  sessionId?: string;
}

export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  uploadDate: Date;
  totalRecords: number;
  sourceColumns: string[];
}

export interface MappingTemplate {
  id: string;
  name: string;
  description: string;
  sourceFormat: string;
  targetFormat: string;
  mappings: Partial<MappingRow>[];
  createdDate: Date;
  lastUsed: Date;
}

export interface ExportOptions {
  format: 'excel' | 'csv';
  includeUnmapped: boolean;
  includeNotes: boolean;
  includeConfidence: boolean;
  includeTimestamps: boolean;
}