import React, { useState, useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridApi, GridReadyEvent, CellValueChangedEvent } from 'ag-grid-community';
import { MappingRow } from '../../types';
import { 
  Edit, 
  Check, 
  X, 
  AlertCircle
} from 'lucide-react';
import { Button, Stack, Chip, IconButton } from '@mui/material';
import { FileDownload, TableView } from '@mui/icons-material';

interface MappingGridProps {
  data: MappingRow[];
  onRowChange: (rowId: string, changes: Partial<MappingRow>) => void;
  onBulkAction: (action: string, selectedRows: MappingRow[]) => void;
  onExport: (format: 'excel' | 'csv') => void;
  onEdit?: (row: MappingRow) => void;
  isLoading?: boolean;
}

export const MappingGrid: React.FC<MappingGridProps> = ({
  data,
  onRowChange,
  onBulkAction,
  onExport,
  onEdit,
  isLoading = false,
}) => {
  // Debug: Log the data received by the grid
  React.useEffect(() => {
    console.log(`🎭 MappingGrid data changed: ${data.length} rows`);
    if (data.length > 0) {
      console.log(`📋 First 3 mappings:`, data.slice(0, 3).map(d => ({
        id: d.id.substring(0, 20) + '...',
        sourceCode: d.sourceCode,
        targetCode: d.targetCode,
        status: d.status,
        claudeSuggestion: d.metadata?.claudeSuggestion
      })));
    }
  }, [data]);

  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [selectedRows, setSelectedRows] = useState<MappingRow[]>([]);
  const [filterText, setFilterText] = useState('');

  // Force AG Grid to update when data changes
  React.useEffect(() => {
    if (gridApi && data) {
      console.log(`🔄 Forcing AG Grid to update with ${data.length} rows`);
      gridApi.setGridOption('rowData', data);
      
      // Check if the update worked
      setTimeout(() => {
        const displayedRows = gridApi.getDisplayedRowCount();
        console.log(`✅ AG Grid now shows ${displayedRows} rows`);
      }, 50);
    }
  }, [data, gridApi]);
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
    const isClaudeSuggestion = row?.metadata?.claudeSuggestion;
    const isPending = row?.status === 'pending';
    
    return (
      <div className="flex items-center space-x-1">
        {isClaudeSuggestion && isPending ? (
          // Special actions for Claude suggestions
          <>
            <IconButton
              onClick={() => onRowChange(row.id, { status: 'mapped' })}
              size="small"
              title="Approve Claude suggestion"
              sx={{
                '&:hover': {
                  backgroundColor: '#dcfce7',
                },
              }}
            >
              <Check size={16} style={{ color: '#16a34a' }} />
            </IconButton>
            <IconButton
              onClick={() => onRowChange(row.id, { status: 'rejected' })}
              size="small"
              title="Reject Claude suggestion"
              sx={{
                '&:hover': {
                  backgroundColor: '#fef2f2',
                },
              }}
            >
              <X size={16} style={{ color: '#dc2626' }} />
            </IconButton>
          </>
        ) : (
          // Regular actions
          <>
            <IconButton
              onClick={() => handleEditRow(row)}
              size="small"
              title="Edit mapping"
              sx={{
                '&:hover': {
                  backgroundColor: '#f1f5f9',
                },
              }}
            >
              <Edit size={16} style={{ color: '#64748b' }} />
            </IconButton>
            <IconButton
              onClick={() => handleToggleStatus(row)}
              size="small"
              title="Toggle status"
              sx={{
                '&:hover': {
                  backgroundColor: row.status === 'mapped' ? '#fef2f2' : '#dcfce7',
                },
              }}
            >
              {row.status === 'mapped' ? (
                <X size={16} style={{ color: '#dc2626' }} />
              ) : (
                <Check size={16} style={{ color: '#16a34a' }} />
              )}
            </IconButton>
          </>
        )}
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
    console.log('🏗️ AG Grid is ready');
    setGridApi(params.api);
    
    // Check if data is available after grid is ready
    setTimeout(() => {
      const rowCount = params.api.getDisplayedRowCount();
      console.log(`📊 AG Grid ready - displayed rows: ${rowCount}, data length: ${data.length}`);
      
      if (rowCount === 0 && data.length > 0) {
        console.error('🚨 AG Grid has no displayed rows but data exists!');
        console.log('🔄 Attempting to refresh AG Grid...');
        params.api.refreshCells();
      }
    }, 100);
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
    if (onEdit) {
      onEdit(row);
    } else {
      console.log('Edit row:', row);
    }
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

  // Row styling to highlight Claude suggestions
  const getRowStyle = (params: any) => {
    if (params.data?.metadata?.claudeSuggestion) {
      return { 
        backgroundColor: '#f3e8ff'
      }; // Purple tint for Claude suggestions
    }
    if (params.data?.status === 'pending') {
      return { backgroundColor: '#fef3c7' }; // Yellow tint for pending
    }
    return undefined;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="p-4 border-b" style={{ backgroundColor: '#f8fafc' }}>
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
          
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<TableView />}
              onClick={() => onExport('excel')}
              sx={{
                backgroundColor: '#e7500d',
                '&:hover': { backgroundColor: '#B23808' },
                fontWeight: 500,
              }}
              size="small"
            >
              Export Excel
            </Button>
            <Button
              variant="contained"
              startIcon={<FileDownload />}
              onClick={() => onExport('csv')}
              sx={{
                backgroundColor: '#04243C',
                '&:hover': { backgroundColor: '#2A4A68' },
                fontWeight: 500,
              }}
              size="small"
            >
              Export CSV
            </Button>
          </Stack>
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

          {/* Claude Suggestions Filter */}
          <Button
            onClick={() => handleQuickFilter('Claude AI suggestion')}
            variant="contained"
            startIcon={<AlertCircle size={16} />}
            sx={{
              backgroundColor: '#8b5cf6',
              '&:hover': {
                backgroundColor: '#7c3aed',
              },
            }}
          >
            Claude Suggestions
            {data.filter(row => row.notes?.includes('Claude AI suggestion')).length > 0 && (
              <Chip
                label={data.filter(row => row.notes?.includes('Claude AI suggestion')).length}
                size="small"
                sx={{
                  ml: 1,
                  backgroundColor: '#6b21a8',
                  color: 'white',
                  height: '20px',
                  fontSize: '0.75rem',
                }}
              />
            )}
          </Button>

          {/* Bulk Actions */}
          {selectedRows.length > 0 && (
            <Stack direction="row" spacing={2}>
              <Button
                onClick={handleBulkAccept}
                variant="contained"
                sx={{
                  backgroundColor: '#4ade80',
                  '&:hover': {
                    backgroundColor: '#22c55e',
                  },
                }}
              >
                Accept All
              </Button>
              <Button
                onClick={handleBulkReject}
                variant="contained"
                sx={{
                  backgroundColor: '#f87171',
                  '&:hover': {
                    backgroundColor: '#ef4444',
                  },
                }}
              >
                Reject All
              </Button>
            </Stack>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 ag-theme-alpine" style={{ height: '100%', minHeight: '400px' }}>
        <AgGridReact
          theme="legacy"
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
          getRowStyle={getRowStyle}
        />
      </div>
    </div>
  );
};