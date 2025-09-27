import React, { useState, useEffect } from 'react';
import { useGroundTruthMappings } from '../hooks';
import { Search, Database, TrendingUp, AlertCircle } from 'lucide-react';

interface GroundTruthMapping {
  Source_Account_Code: string;
  Source_Description: string;
  Target_Account_Code: string;
  Target_Description: string;
  Mapping_Confidence: number;
  Mapping_Type: string;
  Notes: string;
}

export const GroundTruthViewer: React.FC = () => {
  const { getGroundTruthMappings, searchGroundTruthMappings, isLoading, error } = useGroundTruthMappings();
  const [mappings, setMappings] = useState<GroundTruthMapping[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [mappingType, setMappingType] = useState('');
  const [minConfidence, setMinConfidence] = useState(0);

  useEffect(() => {
    loadAllMappings();
  }, []);

  const loadAllMappings = async () => {
    try {
      const response = await getGroundTruthMappings();
      setMappings(response.mappings);
    } catch (err) {
      console.error('Failed to load ground truth mappings:', err);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      await loadAllMappings();
      return;
    }

    try {
      const response = await searchGroundTruthMappings(
        searchTerm,
        mappingType || undefined,
        minConfidence > 0 ? minConfidence : undefined
      );
      setMappings(response.mappings);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 95) return 'text-green-600 bg-green-50';
    if (confidence >= 85) return 'text-blue-600 bg-blue-50';
    if (confidence >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'direct': return 'bg-green-100 text-green-800';
      case 'semantic': return 'bg-blue-100 text-blue-800';
      case 'consolidated': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <Database className="text-blue-600" size={24} />
          <h1 className="text-2xl font-bold text-gray-900">Ground Truth Mappings</h1>
          <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
            {mappings.length} patterns
          </span>
        </div>

        {/* Search Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search accounts..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={mappingType}
            onChange={(e) => setMappingType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="Direct">Direct</option>
            <option value="Semantic">Semantic</option>
            <option value="Consolidated">Consolidated</option>
          </select>

          <input
            type="number"
            placeholder="Min Confidence"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={minConfidence || ''}
            onChange={(e) => setMinConfidence(parseInt(e.target.value) || 0)}
            min="0"
            max="100"
          />

          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {error && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
            <AlertCircle className="text-red-600" size={20} />
            <span className="text-red-700">{error}</span>
          </div>
        )}
      </div>

      {/* Mappings Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source Account
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target Account
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Confidence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mappings.map((mapping, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {mapping.Source_Account_Code}
                      </div>
                      <div className="text-sm text-gray-500">
                        {mapping.Source_Description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {mapping.Target_Account_Code}
                      </div>
                      <div className="text-sm text-gray-500">
                        {mapping.Target_Description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConfidenceColor(mapping.Mapping_Confidence)}`}>
                      <TrendingUp size={12} className="mr-1" />
                      {mapping.Mapping_Confidence}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(mapping.Mapping_Type)}`}>
                      {mapping.Mapping_Type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs">
                      {mapping.Notes}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {mappings.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Database className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No mappings found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search criteria' : 'No ground truth mappings available'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};