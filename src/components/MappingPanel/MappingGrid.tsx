import React, { useState, useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridApi, GridReadyEvent, CellValueChangedEvent } from 'ag-grid-community';
import { MappingRow } from '../../types';
import { 
  Edit, 
  Check, 
  X, 
  AlertCircle, 
  Download
} from 'lucide-react';

interface MappingGridProps {
  data: MappingRow[];
  onRowChange: (rowId: string, changes: Partial<MappingRow>) => void;
  onBulkAction: (action: string, selectedRows: MappingRow[]) => void;
  onExport: (format: 'excel' | 'csv') => void;
  isLoading?: boolean;
}

export const MappingGrid: React.FC<MappingGridProps> = ({
  data,
  onRowChange,
  onBulkAction,
  onExport,
  isLoading = false,
}) => {
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [selectedRows, setSelectedRows] = useState<MappingRow[]>([]);
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Status Badge Renderer
  const StatusBadgeRenderer = (params: any) => {
    const status = params.value;
    const badges = {
      mapped: { label: 'Mapped', className: 'status-mapped' },
      unmapped: { label: 'Unmapped', className: 'status-unmapped' },
      pending: { label: 'Pending', className: 'status-pending' },
      rejected: { label: 'Rejected', className: 'status-rejected' },
    };

    const badge = badges[status as keyof typeof badges];
    if (!badge) return status;

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

  // Confidence Renderer with Color Coding
  const ConfidenceRenderer = (params: any) => {
    const confidence = params.value;
    let className = '';
    let icon = null;

    if (confidence >= 90) {
      className = 'confidence-high';
      icon = <Check size={14} />;
    } else if (confidence >= 70) {
      className = 'confidence-medium';
      icon = <AlertCircle size={14} />;
    } else if (confidence >= 50) {
      className = 'confidence-low';
      icon = <AlertCircle size={14} />;
    } else {
      className = 'confidence-verylow';
      icon = <X size={14} />;
    }

    return (
      <div className={`flex items-center space-x-1 px-2 py-1 rounded ${className}`}>
        {icon}
        <span className="font-medium">{confidence}%</span>
      </div>
    );
  };

  // Action Buttons Renderer
  const ActionRenderer = (params: any) => {
    const row = params.data;
    
    return (
      <div className="flex items-center space-x-1">
        <button
          onClick={() => handleEditRow(row)}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title="Edit mapping"
        >
          <Edit size={16} className="text-gray-600" />
        </button>
        <button
          onClick={() => handleToggleStatus(row)}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title="Toggle status"
        >
          {row.status === 'mapped' ? (
            <X size={16} className="text-red-600" />
          ) : (
            <Check size={16} className="text-green-600" />
          )}
        </button>
      </div>
    );
  };

  // Column Definitions
  const columnDefs: ColDef[] = useMemo(() => [
    {
      headerName: '',
      field: 'id',
      checkboxSelection: true,
      headerCheckboxSelection: true,
      width: 50,
      pinned: 'left',
    },
    {
      headerName: 'Source Code',
      field: 'sourceCode',
      width: 150,
      pinned: 'left',
      editable: false,
    },
    {
      headerName: 'Source Description',
      field: 'sourceDescription',
      width: 250,
      editable: false,
      tooltipField: 'sourceDescription',
    },
    {
      headerName: 'Target Code',
      field: 'targetCode',
      width: 150,
      editable: true,
      cellStyle: { backgroundColor: '#f8fafc' },
    },
    {
      headerName: 'Target Description',
      field: 'targetDescription',
      width: 250,
      editable: true,
      cellStyle: { backgroundColor: '#f8fafc' },
      tooltipField: 'targetDescription',
    },
    {
      headerName: 'Match Type',
      field: 'matchType',
      width: 120,
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['Exact', 'Semantic', 'Manual', 'None'],
      },
    },
    {
      headerName: 'Confidence',
      field: 'confidence',
      width: 120,
      cellRenderer: ConfidenceRenderer,
      editable: true,
      cellEditor: 'agNumberCellEditor',
      cellEditorParams: {
        min: 0,
        max: 100,
      },
    },
    {
      headerName: 'Status',
      field: 'status',
      width: 100,
      cellRenderer: StatusBadgeRenderer,
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['mapped', 'unmapped', 'pending', 'rejected'],
      },
    },
    {
      headerName: 'Notes',
      field: 'notes',
      width: 200,
      editable: true,
      tooltipField: 'notes',
    },
    {
      headerName: 'Last Modified',
      field: 'lastModified',
      width: 150,
      valueFormatter: (params) => 
        new Date(params.value).toLocaleDateString(),
    },
    {
      headerName: 'Modified By',
      field: 'modifiedBy',
      width: 100,
      cellRenderer: (params: any) => (
        <span className={`capitalize ${
          params.value === 'claude' ? 'text-blue-600' : 'text-gray-600'
        }`}>
          {params.value}
        </span>
      ),
    },
    {
      headerName: 'Actions',
      field: 'actions',
      width: 100,
      cellRenderer: ActionRenderer,
      pinned: 'right',
      sortable: false,
      filter: false,
    },
  ], []);

  // Grid Event Handlers
  const onGridReady = (params: GridReadyEvent) => {
    setGridApi(params.api);
  };

  const onSelectionChanged = useCallback(() => {
    if (gridApi) {
      const selected = gridApi.getSelectedRows();
      setSelectedRows(selected);
    }
  }, [gridApi]);

  const onCellValueChanged = (event: CellValueChangedEvent) => {
    const { data, colDef, newValue, oldValue } = event;
    if (newValue !== oldValue && colDef.field) {
      onRowChange(data.id, {
        [colDef.field]: newValue,
        lastModified: new Date(),
        modifiedBy: 'user',
      });
    }
  };

  // Action Handlers
  const handleEditRow = (row: MappingRow) => {
    // Implementation for opening edit modal
    console.log('Edit row:', row);
  };

  const handleToggleStatus = (row: MappingRow) => {
    const newStatus = row.status === 'mapped' ? 'unmapped' : 'mapped';
    onRowChange(row.id, { status: newStatus });
  };

  const handleBulkAccept = () => {
    onBulkAction('accept', selectedRows);
  };

  const handleBulkReject = () => {
    onBulkAction('reject', selectedRows);
  };

  const handleQuickFilter = (value: string) => {
    setFilterText(value);
    if (gridApi) {
      gridApi.setGridOption('quickFilterText', value);
    }
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    if (gridApi) {
      if (status === 'all') {
        gridApi.setFilterModel({});
      } else {
        gridApi.setFilterModel({
          status: {
            type: 'equals',
            filter: status,
          },
        });
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Account Mappings ({data.length} rows)
            </h3>
            {selectedRows.length > 0 && (
              <span className="text-sm text-blue-600">
                {selectedRows.length} selected
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onExport('excel')}
              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1"
            >
              <Download size={16} />
              <span>Export Excel</span>
            </button>
            <button
              onClick={() => onExport('csv')}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
            >
              <Download size={16} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search Filter */}
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search mappings..."
              value={filterText}
              onChange={(e) => handleQuickFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="mapped">Mapped</option>
            <option value="unmapped">Unmapped</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Bulk Actions */}
          {selectedRows.length > 0 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBulkAccept}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Accept All
              </button>
              <button
                onClick={handleBulkReject}
                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reject All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 ag-theme-alpine">
        <AgGridReact
          rowData={data}
          columnDefs={columnDefs}
          onGridReady={onGridReady}
          onSelectionChanged={onSelectionChanged}
          onCellValueChanged={onCellValueChanged}
          rowSelection="multiple"
          suppressRowClickSelection={true}
          enableCellTextSelection={true}
          ensureDomOrder={true}
          animateRows={true}
          pagination={true}
          paginationPageSize={50}
          suppressPaginationPanel={false}
          loading={isLoading}
          loadingOverlayComponent="agLoadingOverlay"
          noRowsOverlayComponent="agNoRowsOverlay"
        />
      </div>
    </div>
  );
};