import { useState, useCallback, useEffect } from 'react';
import { MappingRow, MappingChange, MappingContext, SerializableMappingChange } from '../types';
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

const STORAGE_KEY = 'claude-mapping-data';
const CHANGES_STORAGE_KEY = 'claude-mapping-changes';
const AUTO_SAVE_DELAY = 2000; // 2 seconds

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
  
  // Auto-save state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedMappings = localStorage.getItem(STORAGE_KEY);
      const savedChanges = localStorage.getItem(CHANGES_STORAGE_KEY);
      
      if (savedMappings) {
        const parsedMappings = JSON.parse(savedMappings);
        // Convert date strings back to Date objects
        const mappingsWithDates = parsedMappings.map((mapping: any) => ({
          ...mapping,
          lastModified: new Date(mapping.lastModified)
        }));
        setMappings(mappingsWithDates);
      }
      
      if (savedChanges) {
        const parsedChanges = JSON.parse(savedChanges);
        const changesWithDates = parsedChanges.map((change: any) => ({
          ...change,
          timestamp: new Date(change.timestamp)
        }));
        setRecentChanges(changesWithDates);
      }
    } catch (error) {
      console.warn('Failed to load saved mapping data:', error);
    }
  }, []);



  // Trigger auto-save when data changes
  useEffect(() => {
    if (hasUnsavedChanges) {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
      
      const timeout = setTimeout(() => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings));
          localStorage.setItem(CHANGES_STORAGE_KEY, JSON.stringify(recentChanges));
          setHasUnsavedChanges(false);
          setLastSaved(new Date());
        } catch (error) {
          console.error('Failed to auto-save mapping data:', error);
        }
      }, AUTO_SAVE_DELAY);
      
      setAutoSaveTimeout(timeout);
      
      return () => {
        if (timeout) clearTimeout(timeout);
      };
    }
  }, [mappings, recentChanges, hasUnsavedChanges]);

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
    setMappings(prev => [...prev, ...newMappings]);
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
    
    return filtered;
  }, [mappings, statusFilter, searchTerm, confidenceFilter, sortField, sortDirection]);

  // Calculate context and stats
  const context = useMemo(() => {
    const baseContext = calculateMappingContext(mappings);
    
    // Extract session_id from any mapping metadata
    const sessionId = mappings.find(m => m.metadata?.sessionId)?.metadata?.sessionId;
    
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