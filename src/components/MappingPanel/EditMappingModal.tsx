import React, { useState } from 'react';
import { MappingRow } from '../../types';
import { X, Save } from 'lucide-react';

interface EditMappingModalProps {
  row: MappingRow | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (rowId: string, changes: Partial<MappingRow>) => void;
}

export const EditMappingModal: React.FC<EditMappingModalProps> = ({
  row,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<MappingRow>>({});

  React.useEffect(() => {
    if (row) {
      setFormData({
        targetCode: row.targetCode,
        targetDescription: row.targetDescription,
        matchType: row.matchType,
        confidence: row.confidence,
        status: row.status,
        notes: row.notes,
      });
    }
  }, [row]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (row) {
      onSave(row.id, {
        ...formData,
        lastModified: new Date(),
        modifiedBy: 'user',
      });
      onClose();
    }
  };

  if (!isOpen || !row) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full m-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Edit Mapping</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Source Information (Read-only) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source Code
              </label>
              <input
                type="text"
                value={row.sourceCode}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source Description
              </label>
              <input
                type="text"
                value={row.sourceDescription}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
              />
            </div>
          </div>

          {/* Target Information (Editable) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Code *
              </label>
              <input
                type="text"
                value={formData.targetCode || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, targetCode: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Description *
              </label>
              <input
                type="text"
                value={formData.targetDescription || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, targetDescription: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Match Type and Confidence */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Match Type
              </label>
              <select
                value={formData.matchType || 'Manual'}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  matchType: e.target.value as MappingRow['matchType']
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Exact">Exact</option>
                <option value="Semantic">Semantic</option>
                <option value="Manual">Manual</option>
                <option value="None">None</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confidence (0-100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.confidence || 0}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  confidence: parseInt(e.target.value) || 0
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status || 'unmapped'}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                status: e.target.value as MappingRow['status']
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="mapped">Mapped</option>
              <option value="unmapped">Unmapped</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add any notes or comments about this mapping..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Save size={16} />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};