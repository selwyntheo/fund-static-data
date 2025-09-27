import React from 'react';
import { Button, Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { Psychology, TrendingUp, Close } from '@mui/icons-material';

interface IntelligentRecommendationProps {
  fileName: string;
  onAccept: () => void;
  onDismiss: () => void;
  isLoading?: boolean;
}

export const IntelligentRecommendation: React.FC<IntelligentRecommendationProps> = ({
  fileName,
  onAccept,
  onDismiss,
  isLoading = false,
}) => {
  return (
    <Card 
      elevation={3}
      sx={{
        mb: 3,
        borderLeft: '4px solid #2B9CAE',
        backgroundColor: '#f8feff',
        position: 'relative',
      }}
    >
      <CardContent sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Psychology sx={{ color: '#2B9CAE', fontSize: 24 }} />
            <Chip 
              label="Smart Suggestion" 
              size="small" 
              sx={{ 
                backgroundColor: '#2B9CAE', 
                color: 'white',
                fontWeight: 600,
                fontSize: '0.75rem'
              }} 
            />
          </Box>
          <Button
            size="small"
            onClick={onDismiss}
            sx={{ 
              minWidth: 'auto', 
              p: 0.5,
              color: '#64748b',
              '&:hover': { backgroundColor: '#f1f5f9' }
            }}
          >
            <Close fontSize="small" />
          </Button>
        </Box>

        <Typography variant="h6" sx={{ mb: 1, color: '#1e293b', fontWeight: 600 }}>
          Map IO Accounts to Eagle Platform
        </Typography>
        
        <Typography variant="body2" sx={{ mb: 2, color: '#475569', lineHeight: 1.5 }}>
          I've detected <strong>{fileName}</strong> contains IO accounting data. 
          Would you like me to automatically map these accounts to the Eagle platform structure?
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <TrendingUp sx={{ color: '#16a34a', fontSize: 16 }} />
          <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 500 }}>
            This will help streamline your account migration process
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            onClick={onAccept}
            disabled={isLoading}
            startIcon={<Psychology />}
            sx={{
              backgroundColor: '#2B9CAE',
              '&:hover': { backgroundColor: '#1E6B79' },
              fontWeight: 600,
              textTransform: 'none',
            }}
          >
            {isLoading ? 'Processing...' : 'Start IO → Eagle Mapping'}
          </Button>
          <Button
            variant="outlined"
            onClick={onDismiss}
            sx={{
              borderColor: '#d1d5db',
              color: '#6b7280',
              textTransform: 'none',
              '&:hover': { 
                borderColor: '#9ca3af',
                backgroundColor: '#f9fafb'
              }
            }}
          >
            Maybe Later
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};