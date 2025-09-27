import React from 'react';
import { Box, Card, CardHeader, CardContent, useTheme } from '@mui/material';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { StatusChip } from '../Common/StatusChip';

// Custom cell renderer for status column
const StatusCellRenderer = (params: any) => {
  return <StatusChip status={params.value} size="small" />;
};

// Custom cell renderer for confidence scores
const ConfidenceCellRenderer = (params: any) => {
  const confidence = params.value;
  let color = 'default';
  
  if (confidence >= 90) color = 'success';
  else if (confidence >= 80) color = 'warning';
  else if (confidence >= 70) color = 'error';
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
      <StatusChip 
        status={color as any} 
        label={`${confidence}%`} 
        size="small" 
        showIcon={false}
        variant="outlined"
      />
    </Box>
  );
};

interface MuiAgGridWrapperProps {
  data: any[];
  title?: string;
}

export const MuiAgGridWrapper: React.FC<MuiAgGridWrapperProps> = ({
  data,
  title = "Data Table"
}) => {
  const theme = useTheme();

  const columnDefs: ColDef[] = [
    {
      headerName: 'Source Code',
      field: 'sourceCode',
      width: 120,
      pinned: 'left',
    },
    {
      headerName: 'Source Description',
      field: 'sourceDescription',
      flex: 1,
      minWidth: 200,
    },
    {
      headerName: 'Target Code',
      field: 'targetCode',
      width: 120,
    },
    {
      headerName: 'Target Description',
      field: 'targetDescription',
      flex: 1,
      minWidth: 200,
    },
    {
      headerName: 'Status',
      field: 'status',
      width: 100,
      cellRenderer: StatusCellRenderer,
    },
    {
      headerName: 'Confidence',
      field: 'confidence',
      width: 110,
      cellRenderer: ConfidenceCellRenderer,
    },
  ];

  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  // Material UI theme-aware AG Grid styles
  const gridStyle = {
    height: '400px',
    width: '100%',
    '--ag-foreground-color': theme.palette.text.primary,
    '--ag-background-color': theme.palette.background.paper,
    '--ag-header-foreground-color': theme.palette.text.primary,
    '--ag-header-background-color': theme.palette.grey[100],
    '--ag-odd-row-background-color': theme.palette.grey[50],
    '--ag-header-column-separator-color': theme.palette.divider,
    '--ag-row-border-color': theme.palette.divider,
    '--ag-border-color': theme.palette.divider,
    '--ag-selected-row-background-color': theme.palette.primary.light + '20',
    '--ag-range-selection-background-color': theme.palette.primary.light + '10',
    fontFamily: theme.typography.fontFamily,
  } as React.CSSProperties;

  return (
    <Card sx={{ height: '500px' }}>
      <CardHeader
        title={title}
        titleTypographyProps={{
          variant: 'h6',
          fontWeight: 600,
        }}
      />
      <CardContent sx={{ pt: 0, height: 'calc(100% - 80px)' }}>
        <Box 
          className="ag-theme-alpine"
          style={gridStyle}
        >
          <AgGridReact
            rowData={data}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            animateRows={true}
            rowSelection="multiple"
            pagination={true}
            paginationPageSize={20}
            suppressCellFocus={true}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default MuiAgGridWrapper;