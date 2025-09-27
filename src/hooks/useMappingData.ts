import { useState, useCallback } from 'react';
import { MappingRow, MappingChange, MappingContext } from '../types';
import { 
  calculateMappingContext, 
  createMappingChange, 
  filterMappingsByStatus,
  searchMappings,
  sortMappings,
  getMappingStats 
} from '../utils/mappingHelpers';

interface UseMappingDataResult {
  mappings: MappingRow[];
  filteredMappings: MappingRow[];
  context: MappingContext;
  recentChanges: MappingChange[];
  
  // Data operations
  addMappings: (newMappings: MappingRow[]) => void;
  updateMapping: (id: string, changes: Partial<MappingRow>) => void;
  deleteMapping: (id: string) => void;
  bulkUpdateMappings: (ids: string[], changes: Partial<MappingRow>) => void;
  applySuggestions: (suggestions: MappingRow[]) => void;
  clearMappings: () => void;
  
  // Filtering and searching
  setStatusFilter: (status: MappingRow['status'] | 'all') => void;
  setSearchTerm: (term: string) => void;
  setSortConfig: (field: keyof MappingRow, direction: 'asc' | 'desc') => void;
  setConfidenceRange: (min: number, max: number) => void;
  
  // State
  statusFilter: MappingRow['status'] | 'all';
  searchTerm: string;
  sortField: keyof MappingRow;
  sortDirection: 'asc' | 'desc';
  confidenceFilter: { min: number; max: number };
  
  // Statistics
  stats: ReturnType<typeof getMappingStats>;
  
  // Auto-save
  hasUnsavedChanges: boolean;
  lastSaved: Date | null;
}

// Mapping data is now session-only - no localStorage persistence

export const useMappingData = (): UseMappingDataResult => {
  // Core data
  const [mappings, setMappings] = useState<MappingRow[]>([]);
  const [recentChanges, setRecentChanges] = useState<MappingChange[]>([]);
  
  // Filtering and sorting state
  const [statusFilter, setStatusFilter] = useState<MappingRow['status'] | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof MappingRow>('sourceCode');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [confidenceFilter, setConfidenceFilter] = useState({ min: 0, max: 100 });
  
  // Session state (no persistence)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved] = useState<Date | null>(null); // Always null since no saving

  // Mapping data is no longer persisted - only exists during session



  // Auto-save removed - mapping data only exists during session

  // Add change to recent changes (keep last 50)
  const addChange = useCallback((change: MappingChange) => {
    setRecentChanges(prev => {
      const updated = [change, ...prev].slice(0, 50);
      return updated;
    });
    setHasUnsavedChanges(true);
  }, []);

  // Data operations
  const addMappings = useCallback((newMappings: MappingRow[]) => {
    console.log(`🎯 Adding ${newMappings.length} new mappings to grid`);
    setMappings(prev => {
      const updated = [...prev, ...newMappings];
      console.log(`📊 Total mappings: ${updated.length}`);
      return updated;
    });
    setHasUnsavedChanges(true);
  }, []);

  const updateMapping = useCallback((id: string, changes: Partial<MappingRow>) => {
    setMappings(prev => prev.map(mapping => {
      if (mapping.id === id) {
        const oldMapping = mapping;
        const updatedMapping = { 
          ...mapping, 
          ...changes, 
          lastModified: new Date(),
          modifiedBy: 'user' as const
        };
        
        // Record changes for each field that changed
        Object.entries(changes).forEach(([field, newValue]) => {
          const oldValue = oldMapping[field as keyof MappingRow];
          if (oldValue !== newValue) {
            addChange(createMappingChange(
              id, 
              field as keyof MappingRow, 
              oldValue, 
              newValue
            ));
          }
        });
        
        return updatedMapping;
      }
      return mapping;
    }));
    setHasUnsavedChanges(true);
  }, [addChange]);

  const deleteMapping = useCallback((id: string) => {
    setMappings(prev => {
      const mappingToDelete = prev.find(m => m.id === id);
      if (mappingToDelete) {
        addChange(createMappingChange(id, 'id', id, 'DELETED'));
      }
      return prev.filter(mapping => mapping.id !== id);
    });
    setHasUnsavedChanges(true);
  }, [addChange]);

  const bulkUpdateMappings = useCallback((ids: string[], changes: Partial<MappingRow>) => {
    ids.forEach(id => updateMapping(id, changes));
  }, [updateMapping]);

  const applySuggestions = useCallback((suggestions: MappingRow[]) => {
    console.log(`🎯 Applying ${suggestions.length} mapping suggestions to existing rows`);
    console.log('🔍 Current mappings state:', {
      totalMappings: mappings.length,
      statuses: mappings.map(m => ({ id: m.id, sourceCode: m.sourceCode, status: m.status })),
      unmappedCount: mappings.filter(m => m.status === 'unmapped' || m.status === 'pending').length
    });
    
    console.log('📋 Suggestions to apply:', suggestions.map(s => ({ 
      sourceCode: s.sourceCode, 
      targetCode: s.targetCode, 
      confidence: s.confidence 
    })));
    
    suggestions.forEach(suggestion => {
      // Find existing row by sourceCode
      const existingRow = mappings.find(row => 
        row.sourceCode === suggestion.sourceCode && 
        (row.status === 'unmapped' || row.status === 'pending')
      );
      
      if (existingRow) {
        console.log(`📝 Updating existing row ${existingRow.id} with suggestion:`, {
          sourceCode: suggestion.sourceCode,
          targetCode: suggestion.targetCode,
          confidence: suggestion.confidence
        });
        
        updateMapping(existingRow.id, {
          targetCode: suggestion.targetCode,
          targetDescription: suggestion.targetDescription,
          targetType: suggestion.targetType,
          confidence: suggestion.confidence,
          matchType: suggestion.matchType,
          status: 'mapped',
          notes: `${existingRow.notes ? existingRow.notes + '; ' : ''}Claude AI suggestion`,
          lastModified: new Date()
        });
      } else {
        console.log(`❌ No existing unmapped row found for sourceCode: ${suggestion.sourceCode}`);
        console.log('🔍 Available source codes in mappings:', mappings.map(m => m.sourceCode));
        console.log('🔍 Looking for sourceCode:', suggestion.sourceCode);
      }
    });
  }, [mappings, updateMapping]);

  const clearMappings = useCallback(() => {
    setMappings([]);
    setRecentChanges([]);
    setHasUnsavedChanges(true);
  }, []);

  // Sorting configuration
  const setSortConfig = useCallback((field: keyof MappingRow, direction: 'asc' | 'desc') => {
    setSortField(field);
    setSortDirection(direction);
  }, []);

  // Confidence filter configuration
  const setConfidenceRange = useCallback((min: number, max: number) => {
    setConfidenceFilter({ min, max });
  }, []);

  // Calculate filtered mappings
  const filteredMappings = useMemo(() => {
    let filtered = mappings;
    
    // Apply status filter
    filtered = filterMappingsByStatus(filtered, statusFilter);
    
    // Apply search
    filtered = searchMappings(filtered, searchTerm);
    
    // Apply confidence filter
    filtered = filtered.filter(mapping => 
      mapping.confidence >= confidenceFilter.min && 
      mapping.confidence <= confidenceFilter.max
    );
    
    // Apply sorting
    filtered = sortMappings(filtered, sortField, sortDirection);
    
    console.log(`🎯 Filtered ${mappings.length} mappings down to ${filtered.length} for display`);
    
    return filtered;
  }, [mappings, statusFilter, searchTerm, confidenceFilter, sortField, sortDirection]);

  // Calculate context and stats
  const context = useMemo(() => {
    const baseContext = calculateMappingContext(mappings);
    
    // Extract session_id from any mapping metadata
    const sessionId = mappings.find(m => m.metadata?.sessionId)?.metadata?.sessionId;
    
    // Debug logging
    console.log('🔍 useMappingData context building:', {
      mappingsCount: mappings.length,
      sessionId: sessionId,
      firstMapping: mappings[0],
      hasMappingsWithSessionId: mappings.some(m => m.metadata?.sessionId)
    });
    
    // Convert dates to strings for JSON serialization
    const serializableRecentChanges = recentChanges.slice(0, 10).map(change => ({
      ...change,
      timestamp: change.timestamp.toISOString()
    }));
    
    return {
      ...baseContext,
      recentChanges: serializableRecentChanges,
      sessionId: sessionId // Include session ID for Claude context
    };
  }, [mappings, recentChanges]);

  const stats = useMemo(() => getMappingStats(mappings), [mappings]);

  return {
    mappings,
    filteredMappings,
    context,
    recentChanges,
    
    // Data operations
    addMappings,
    updateMapping,
    deleteMapping,
    bulkUpdateMappings,
    applySuggestions,
    clearMappings,
    
    // Filtering and searching
    setStatusFilter,
    setSearchTerm,
    setSortConfig,
    setConfidenceRange,
    
    // State
    statusFilter,
    searchTerm,
    sortField,
    sortDirection,
    confidenceFilter,
    
    // Statistics
    stats,
    
    // Auto-save
    hasUnsavedChanges,
    lastSaved,
  };
};

// Need to import useMemo
import { useMemo } from 'react';