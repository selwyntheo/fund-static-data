import React from 'react';
import { MappingRow as MappingRowType } from '../../types';
import { Edit, Check, X, AlertCircle } from 'lucide-react';

interface MappingRowProps {
  data: MappingRowType;
  onEdit: (row: MappingRowType) => void;
  onStatusChange: (rowId: string, status: MappingRowType['status']) => void;
  isSelected?: boolean;
  onSelect?: (rowId: string, selected: boolean) => void;
}

export const MappingRow: React.FC<MappingRowProps> = ({
  data,
  onEdit,
  onStatusChange,
  isSelected = false,
  onSelect,
}) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'confidence-high';
    if (confidence >= 70) return 'confidence-medium';
    if (confidence >= 50) return 'confidence-low';
    return 'confidence-verylow';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 90) return <Check size={14} />;
    if (confidence >= 50) return <AlertCircle size={14} />;
    return <X size={14} />;
  };

  const getStatusBadge = (status: MappingRowType['status']) => {
    const badges = {
      mapped: { label: 'Mapped', className: 'status-mapped' },
      unmapped: { label: 'Unmapped', className: 'status-unmapped' },
      pending: { label: 'Pending', className: 'status-pending' },
      rejected: { label: 'Rejected', className: 'status-rejected' },
    };

    const badge = badges[status];
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <tr className={`border-b hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
      <td className="p-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect?.(data.id, e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </td>
      <td className="p-3 font-mono text-sm">{data.sourceCode}</td>
      <td className="p-3 text-sm max-w-xs truncate" title={data.sourceDescription}>
        {data.sourceDescription}
      </td>
      <td className="p-3 font-mono text-sm bg-gray-50">{data.targetCode}</td>
      <td className="p-3 text-sm max-w-xs truncate bg-gray-50" title={data.targetDescription}>
        {data.targetDescription}
      </td>
      <td className="p-3 text-sm">{data.matchType}</td>
      <td className="p-3">
        <div className={`flex items-center space-x-1 px-2 py-1 rounded text-sm ${getConfidenceColor(data.confidence)}`}>
          {getConfidenceIcon(data.confidence)}
          <span className="font-medium">{data.confidence}%</span>
        </div>
      </td>
      <td className="p-3">{getStatusBadge(data.status)}</td>
      <td className="p-3 text-sm max-w-xs truncate" title={data.notes}>
        {data.notes}
      </td>
      <td className="p-3 text-sm text-gray-500">
        {new Date(data.lastModified).toLocaleDateString()}
      </td>
      <td className="p-3 text-sm">
        <span className={`capitalize ${
          data.modifiedBy === 'claude' ? 'text-blue-600' : 'text-gray-600'
        }`}>
          {data.modifiedBy}
        </span>
      </td>
      <td className="p-3">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onEdit(data)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Edit mapping"
          >
            <Edit size={16} className="text-gray-600" />
          </button>
          <button
            onClick={() => onStatusChange(data.id, data.status === 'mapped' ? 'unmapped' : 'mapped')}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Toggle status"
          >
            {data.status === 'mapped' ? (
              <X size={16} className="text-red-600" />
            ) : (
              <Check size={16} className="text-green-600" />
            )}
          </button>
        </div>
      </td>
    </tr>
  );
};