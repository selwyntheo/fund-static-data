import React from 'react';
import { 
  Chip, 
  Box, 
  Typography, 
  CircularProgress,
  useTheme,
  alpha 
} from '@mui/material';
import { 
  CheckCircle, 
  Cancel, 
  Warning, 
  Schedule
} from '@mui/icons-material';

type StatusType = 'success' | 'error' | 'warning' | 'pending' | 'loading' | 'mapped' | 'unmapped' | 'rejected';

interface MuiStatusIndicatorProps {
  status: StatusType;
  message?: string;
  showIcon?: boolean;
  variant?: 'chip' | 'full' | 'compact';
  size?: 'small' | 'medium' | 'large';
}

export const MuiStatusIndicator: React.FC<MuiStatusIndicatorProps> = ({
  status,
  message,
  showIcon = true,
  variant = 'chip',
  size = 'medium',
}) => {
  const theme = useTheme();

  const getStatusConfig = (status: StatusType) => {
    const configs = {
      success: {
        icon: <CheckCircle />,
        color: theme.palette.success.main,
        backgroundColor: alpha(theme.palette.success.main, 0.1),
        label: 'Success',
        chipColor: 'success' as const,
      },
      mapped: {
        icon: <CheckCircle />,
        color: theme.palette.success.main,
        backgroundColor: alpha(theme.palette.success.main, 0.1),
        label: 'Mapped',
        chipColor: 'success' as const,
      },
      error: {
        icon: <Cancel />,
        color: theme.palette.error.main,
        backgroundColor: alpha(theme.palette.error.main, 0.1),
        label: 'Error',
        chipColor: 'error' as const,
      },
      rejected: {
        icon: <Cancel />,
        color: theme.palette.error.main,
        backgroundColor: alpha(theme.palette.error.main, 0.1),
        label: 'Rejected',
        chipColor: 'error' as const,
      },
      warning: {
        icon: <Warning />,
        color: theme.palette.warning.main,
        backgroundColor: alpha(theme.palette.warning.main, 0.1),
        label: 'Warning',
        chipColor: 'warning' as const,
      },
      pending: {
        icon: <Schedule />,
        color: theme.palette.primary.main,
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        label: 'Pending',
        chipColor: 'primary' as const,
      },
      unmapped: {
        icon: <Schedule />,
        color: theme.palette.text.secondary,
        backgroundColor: alpha(theme.palette.text.secondary, 0.1),
        label: 'Unmapped',
        chipColor: 'default' as const,
      },
      loading: {
        icon: <CircularProgress size={16} />,
        color: theme.palette.text.secondary,
        backgroundColor: alpha(theme.palette.text.secondary, 0.1),
        label: 'Loading',
        chipColor: 'default' as const,
      },
    };
    
    // Return the config for the status, or default to 'pending' if status not found
    return configs[status] || configs.pending;
  };

  const config = getStatusConfig(status);

  if (variant === 'chip') {
    return (
      <Chip
        icon={showIcon ? config.icon : undefined}
        label={message || config.label}
        color={config.chipColor}
        size={size === 'large' ? 'medium' : 'small'}
        sx={{
          fontWeight: 500,
          '& .MuiChip-icon': {
            fontSize: size === 'small' ? '16px' : '20px',
          },
        }}
      />
    );
  }

  if (variant === 'compact') {
    return (
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1,
          color: config.color,
        }}
      >
        {showIcon && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {config.icon}
          </Box>
        )}
        <Typography
          variant={size === 'small' ? 'caption' : 'body2'}
          sx={{ fontWeight: 500 }}
        >
          {message || config.label}
        </Typography>
      </Box>
    );
  }

  // Full variant
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1.5,
        padding: '8px 16px',
        borderRadius: 1,
        backgroundColor: config.backgroundColor,
        border: `1px solid ${alpha(config.color, 0.3)}`,
      }}
    >
      {showIcon && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            color: config.color,
          }}
        >
          {config.icon}
        </Box>
      )}
      <Typography
        variant={size === 'small' ? 'body2' : 'body1'}
        sx={{
          color: config.color,
          fontWeight: 500,
        }}
      >
        {message || config.label}
      </Typography>
    </Box>
  );
};

export default MuiStatusIndicator;