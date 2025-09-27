import { useState, useCallback } from 'react';
import axios from 'axios';

interface GroundTruthMapping {
  Source_Account_Code: string;
  Source_Description: string;
  Target_Account_Code: string;
  Target_Description: string;
  Mapping_Confidence: number;
  Mapping_Type: string;
  Notes: string;
}

interface GroundTruthResponse {
  mappings: GroundTruthMapping[];
  total: number;
  message: string;
}

interface SearchGroundTruthResponse extends GroundTruthResponse {
  search_term: string;
  filters_applied: {
    mapping_type: string;
    min_confidence: number;
  };
}

interface UseGroundTruthMappingsResult {
  getGroundTruthMappings: () => Promise<GroundTruthResponse>;
  searchGroundTruthMappings: (
    searchTerm: string,
    mappingType?: string,
    minConfidence?: number
  ) => Promise<SearchGroundTruthResponse>;
  isLoading: boolean;
  error: string | null;
}

const BACKEND_API_URL = 'http://localhost:8000';

export const useGroundTruthMappings = (): UseGroundTruthMappingsResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getGroundTruthMappings = useCallback(async (): Promise<GroundTruthResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${BACKEND_API_URL}/ground-truth-mappings`);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch ground truth mappings';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchGroundTruthMappings = useCallback(async (
    searchTerm: string,
    mappingType?: string,
    minConfidence?: number
  ): Promise<SearchGroundTruthResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        search_term: searchTerm,
        ...(mappingType && { mapping_type: mappingType }),
        ...(minConfidence !== undefined && { min_confidence: minConfidence })
      };

      const response = await axios.post(`${BACKEND_API_URL}/search-ground-truth`, payload);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to search ground truth mappings';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    getGroundTruthMappings,
    searchGroundTruthMappings,
    isLoading,
    error
  };
};