import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  TextField,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Stack,
  Alert,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  AccountBalance,
  Assignment,
  Settings,
  Download,
  Refresh,
} from '@mui/icons-material';
import { MuiStatusIndicator } from './Common/MuiStatusIndicator';
import { MuiAgGridWrapper } from './Common/MuiAgGridWrapper';

export const ThemeShowcase: React.FC = () => {
  const [inputValue, setInputValue] = useState('');

  const sampleData = [
    { id: 1, account: '1000', description: 'Cash and Cash Equivalents', status: 'mapped', confidence: 95 },
    { id: 2, account: '1010', description: 'Operating Cash Account', status: 'pending', confidence: 85 },
    { id: 3, account: '1020', description: 'Savings Account', status: 'error', confidence: 65 },
    { id: 4, account: '2000', description: 'Accounts Payable', status: 'mapped', confidence: 92 },
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom>
          Material UI Theme Showcase
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Demonstrating your custom color palette: Primary (#2B9CAE), Secondary (#04243C), Accent (#e7500d)
        </Typography>
      </Box>

      {/* Color Palette Display */}
      <Card sx={{ mb: 4 }}>
        <CardHeader title="Your Custom Color Palette" />
        <CardContent>
          <Stack direction="row" spacing={3} flexWrap="wrap">
            <Box sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  backgroundColor: '#2B9CAE',
                  borderRadius: 2,
                  mb: 1,
                  border: '2px solid #ccc',
                }}
              />
              <Typography variant="body2" fontWeight="bold">
                Primary
              </Typography>
              <Typography variant="caption" color="text.secondary">
                #2B9CAE
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  backgroundColor: '#04243C',
                  borderRadius: 2,
                  mb: 1,
                  border: '2px solid #ccc',
                }}
              />
              <Typography variant="body2" fontWeight="bold">
                Secondary
              </Typography>
              <Typography variant="caption" color="text.secondary">
                #04243C
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  backgroundColor: '#e7500d',
                  borderRadius: 2,
                  mb: 1,
                  border: '2px solid #ccc',
                }}
              />
              <Typography variant="body2" fontWeight="bold">
                Accent
              </Typography>
              <Typography variant="caption" color="text.secondary">
                #e7500d
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Alert Examples */}
      <Stack spacing={2} sx={{ mb: 4 }}>
        <Alert severity="info">
          Theme successfully applied with your custom color palette!
        </Alert>
        <Alert severity="success">
          Account mapping completed successfully.
        </Alert>
        <Alert severity="warning">
          Some mappings require manual review.
        </Alert>
        <Alert severity="error">
          Connection to external system failed.
        </Alert>
      </Stack>

      {/* Cards with Your Colors */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3, mb: 4 }}>
        <Card sx={{ border: '2px solid #2B9CAE' }}>
          <CardHeader
            avatar={
              <Avatar sx={{ bgcolor: '#2B9CAE' }}>
                <AccountBalance />
              </Avatar>
            }
            title="Primary Color Card"
            subheader="Using #2B9CAE"
            sx={{ backgroundColor: 'rgba(43, 156, 174, 0.1)' }}
          />
          <CardContent>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">Total Accounts</Typography>
                <Chip label="1,247" sx={{ backgroundColor: '#2B9CAE', color: 'white' }} size="small" />
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={79} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#2B9CAE'
                  }
                }}
              />
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ border: '2px solid #04243C' }}>
          <CardHeader
            avatar={
              <Avatar sx={{ bgcolor: '#04243C' }}>
                <Assignment />
              </Avatar>
            }
            title="Secondary Color Card"
            subheader="Using #04243C"
            sx={{ backgroundColor: 'rgba(4, 36, 60, 0.1)' }}
          />
          <CardContent>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">Mapped</Typography>
                <Chip label="983" sx={{ backgroundColor: '#04243C', color: 'white' }} size="small" />
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={65} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#04243C'
                  }
                }}
              />
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ border: '2px solid #e7500d' }}>
          <CardHeader
            avatar={
              <Avatar sx={{ bgcolor: '#e7500d' }}>
                <Settings />
              </Avatar>
            }
            title="Accent Color Card"
            subheader="Using #e7500d"
            sx={{ backgroundColor: 'rgba(231, 80, 13, 0.1)' }}
          />
          <CardContent>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">Pending</Typography>
                <Chip label="264" sx={{ backgroundColor: '#e7500d', color: 'white' }} size="small" />
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={21} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#e7500d'
                  }
                }}
              />
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Status Indicators"
            subheader="Different status indicator variants"
          />
          <CardContent>
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" gutterBottom>Chip Variant:</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <MuiStatusIndicator status="success" variant="chip" />
                  <MuiStatusIndicator status="error" variant="chip" />
                  <MuiStatusIndicator status="warning" variant="chip" />
                  <MuiStatusIndicator status="pending" variant="chip" />
                  <MuiStatusIndicator status="loading" variant="chip" />
                </Stack>
              </Box>
              
              <Box>
                <Typography variant="body2" gutterBottom>Compact Variant:</Typography>
                <Stack spacing={1}>
                  <MuiStatusIndicator status="success" variant="compact" message="Mapping successful" />
                  <MuiStatusIndicator status="error" variant="compact" message="Validation failed" />
                  <MuiStatusIndicator status="pending" variant="compact" message="Awaiting review" />
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* Buttons */}
      <Card sx={{ mb: 4 }}>
        <CardHeader title="Buttons" subheader="Various button styles with your theme" />
        <CardContent>
          <Stack spacing={3}>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<Download />}
                sx={{ backgroundColor: '#2B9CAE', '&:hover': { backgroundColor: '#1E6B79' } }}
              >
                Primary (#2B9CAE)
              </Button>
              <Button 
                variant="contained" 
                color="secondary" 
                startIcon={<Assignment />}
                sx={{ backgroundColor: '#04243C', '&:hover': { backgroundColor: '#2A4A68' } }}
              >
                Secondary (#04243C)
              </Button>
              <Button 
                variant="contained"
                startIcon={<Refresh />}
                sx={{ 
                  backgroundColor: '#e7500d', 
                  color: 'white',
                  '&:hover': { backgroundColor: '#B23808' } 
                }}
              >
                Accent (#e7500d)
              </Button>
              <Button variant="outlined" color="primary" startIcon={<Settings />}>
                Outlined Primary
              </Button>
            </Stack>
            
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Button variant="contained" size="small">Small</Button>
              <Button variant="contained" size="medium">Medium</Button>
              <Button variant="contained" size="large">Large</Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Form Elements */}
      <Card sx={{ mb: 4 }}>
        <CardHeader title="Form Elements" />
        <CardContent>
          <Stack spacing={3}>
            <TextField
              label="Account Code"
              variant="outlined"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter account code"
            />
            <TextField
              label="Description"
              variant="outlined"
              multiline
              rows={3}
              placeholder="Enter account description"
            />
            <Stack direction="row" spacing={2}>
              <Button variant="contained" color="primary">
                Save Changes
              </Button>
              <Button variant="outlined" color="secondary">
                Cancel
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader 
          title="Material UI Table"
          action={
            <Stack direction="row" spacing={1}>
              <Tooltip title="Refresh Data">
                <IconButton>
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export">
                <IconButton>
                  <Download />
                </IconButton>
              </Tooltip>
            </Stack>
          }
        />
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Account Code</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Confidence</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sampleData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {row.account}
                      </Typography>
                    </TableCell>
                    <TableCell>{row.description}</TableCell>
                    <TableCell>
                      <MuiStatusIndicator 
                        status={row.status as 'mapped' | 'pending' | 'error'} 
                        variant="chip"
                        size="small" 
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        variant="body2" 
                        color={row.confidence > 90 ? 'success.main' : row.confidence > 80 ? 'warning.main' : 'error.main'}
                        fontWeight="medium"
                      >
                        {row.confidence}%
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* AG Grid with Material UI Styling */}
      <Box sx={{ mt: 4 }}>
        <MuiAgGridWrapper 
          data={sampleData.map(row => ({
            sourceCode: row.account,
            sourceDescription: row.description,
            targetCode: `${parseInt(row.account) + 10000}`,
            targetDescription: `Target ${row.description}`,
            status: row.status,
            confidence: row.confidence
          }))}
          title="AG Grid with Material UI Theme"
        />
      </Box>
    </Box>
  );
};

export default ThemeShowcase;