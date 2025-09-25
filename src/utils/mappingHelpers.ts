import { MappingRow, MappingContext, MappingChange } from '../types';

export const calculateMappingContext = (mappings: MappingRow[]): MappingContext => {
  const totalRows = mappings.length;
  const mappedRows = mappings.filter(row => row.status === 'mapped').length;
  const unmappedRows = mappings.filter(row => row.status === 'unmapped').length;
  const pendingRows = mappings.filter(row => row.status === 'pending').length;
  const rejectedRows = mappings.filter(row => row.status === 'rejected').length;

  const totalConfidence = mappings.reduce((sum, row) => sum + row.confidence, 0);
  const averageConfidence = totalRows > 0 ? totalConfidence / totalRows : 0;

  return {
    totalRows,
    mappedRows,
    unmappedRows,
    pendingRows,
    rejectedRows,
    averageConfidence,
    recentChanges: []
  };
};

export const generateMappingId = (): string => {
  return `mapping_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const createMappingChange = (
  rowId: string,
  field: keyof MappingRow,
  oldValue: any,
  newValue: any
): MappingChange => {
  return {
    rowId,
    field,
    oldValue,
    newValue,
    timestamp: new Date()
  };
};

export const filterMappingsByStatus = (
  mappings: MappingRow[],
  status: MappingRow['status'] | 'all'
): MappingRow[] => {
  if (status === 'all') return mappings;
  return mappings.filter(mapping => mapping.status === status);
};

export const filterMappingsByConfidence = (
  mappings: MappingRow[],
  minConfidence: number,
  maxConfidence: number = 100
): MappingRow[] => {
  return mappings.filter(mapping => 
    mapping.confidence >= minConfidence && mapping.confidence <= maxConfidence
  );
};

export const searchMappings = (
  mappings: MappingRow[],
  searchTerm: string
): MappingRow[] => {
  if (!searchTerm.trim()) return mappings;

  const term = searchTerm.toLowerCase().trim();
  return mappings.filter(mapping => 
    mapping.sourceCode.toLowerCase().includes(term) ||
    mapping.sourceDescription.toLowerCase().includes(term) ||
    mapping.targetCode.toLowerCase().includes(term) ||
    mapping.targetDescription.toLowerCase().includes(term) ||
    mapping.notes.toLowerCase().includes(term)
  );
};

export const sortMappings = (
  mappings: MappingRow[],
  field: keyof MappingRow,
  direction: 'asc' | 'desc' = 'asc'
): MappingRow[] => {
  return [...mappings].sort((a, b) => {
    const aValue = a[field];
    const bValue = b[field];

    let comparison = 0;
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.localeCompare(bValue);
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      comparison = aValue - bValue;
    } else if (aValue instanceof Date && bValue instanceof Date) {
      comparison = aValue.getTime() - bValue.getTime();
    } else {
      comparison = String(aValue).localeCompare(String(bValue));
    }

    return direction === 'desc' ? -comparison : comparison;
  });
};

export const getUnmappedRows = (mappings: MappingRow[]): MappingRow[] => {
  return mappings.filter(mapping => 
    mapping.status === 'unmapped' || !mapping.targetCode.trim()
  );
};

export const getMappingStats = (mappings: MappingRow[]) => {
  const total = mappings.length;
  const byStatus = mappings.reduce((acc, mapping) => {
    acc[mapping.status] = (acc[mapping.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byMatchType = mappings.reduce((acc, mapping) => {
    acc[mapping.matchType] = (acc[mapping.matchType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byConfidenceRange = mappings.reduce((acc, mapping) => {
    if (mapping.confidence >= 90) acc.high++;
    else if (mapping.confidence >= 70) acc.medium++;
    else if (mapping.confidence >= 50) acc.low++;
    else acc.veryLow++;
    return acc;
  }, { high: 0, medium: 0, low: 0, veryLow: 0 });

  const averageConfidence = total > 0 
    ? mappings.reduce((sum, mapping) => sum + mapping.confidence, 0) / total 
    : 0;

  return {
    total,
    byStatus,
    byMatchType,
    byConfidenceRange,
    averageConfidence: Math.round(averageConfidence * 100) / 100
  };
};

export const validateMappingRow = (row: Partial<MappingRow>): string[] => {
  const errors: string[] = [];

  if (!row.sourceCode?.trim()) {
    errors.push('Source code is required');
  }

  if (row.confidence !== undefined && (row.confidence < 0 || row.confidence > 100)) {
    errors.push('Confidence must be between 0 and 100');
  }

  if (row.status && !['mapped', 'unmapped', 'pending', 'rejected'].includes(row.status)) {
    errors.push('Invalid status value');
  }

  if (row.matchType && !['Exact', 'Semantic', 'Manual', 'None'].includes(row.matchType)) {
    errors.push('Invalid match type value');
  }

  return errors;
};

export const createDefaultMappingRow = (sourceCode: string, sourceDescription?: string): MappingRow => {
  return {
    id: generateMappingId(),
    sourceCode,
    sourceDescription: sourceDescription || '',
    targetCode: '',
    targetDescription: '',
    matchType: 'None',
    confidence: 0,
    status: 'unmapped',
    notes: '',
    lastModified: new Date(),
    modifiedBy: 'user'
  };
};