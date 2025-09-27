import React from 'react';
import { Chip } from '@mui/material';
import { 
  CheckCircle, 
  Cancel, 
  Warning, 
  Schedule,
  Sync as SyncIcon 
} from '@mui/icons-material';

type StatusType = 'success' | 'error' | 'warning' | 'pending' | 'loading' | 'mapped' | 'unmapped' | 'rejected';

interface StatusChipProps {
  status: StatusType;
  label?: string;
  variant?: 'filled' | 'outlined';
  size?: 'small' | 'medium';
  showIcon?: boolean;
}

export const StatusChip: React.FC<StatusChipProps> = ({
  status,
  label,
  variant = 'filled',
  size = 'small',
  showIcon = true,
}) => {
  const getStatusConfig = (status: StatusType) => {
    const configs = {
      success: {
        icon: <CheckCircle fontSize="small" />,
        label: 'Success',
        color: 'success' as const,
      },
      mapped: {
        icon: <CheckCircle fontSize="small" />,
        label: 'Mapped',
        color: 'success' as const,
      },
      error: {
        icon: <Cancel fontSize="small" />,
        label: 'Error',
        color: 'error' as const,
      },
      rejected: {
        icon: <Cancel fontSize="small" />,
        label: 'Rejected',
        color: 'error' as const,
      },
      warning: {
        icon: <Warning fontSize="small" />,
        label: 'Warning',
        color: 'warning' as const,
      },
      pending: {
        icon: <Schedule fontSize="small" />,
        label: 'Pending',
        color: 'primary' as const,
      },
      unmapped: {
        icon: <Schedule fontSize="small" />,
        label: 'Unmapped',
        color: 'default' as const,
      },
      loading: {
        icon: <SyncIcon fontSize="small" sx={{ animation: 'spin 1s linear infinite' }} />,
        label: 'Loading',
        color: 'primary' as const,
      },
    };
    return configs[status] || configs.pending;
  };

  const config = getStatusConfig(status);

  return (
    <Chip
      icon={showIcon ? config.icon : undefined}
      label={label || config.label}
      color={config.color}
      variant={variant}
      size={size}
      sx={{
        fontWeight: 500,
        '& .MuiChip-icon': {
          fontSize: '16px',
        },
        '@keyframes spin': {
          '0%': {
            transform: 'rotate(0deg)',
          },
          '100%': {
            transform: 'rotate(360deg)',
          },
        },
      }}
    />
  );
};

export default StatusChip;