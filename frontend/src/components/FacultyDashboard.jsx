import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import DocumentUpload from './DocumentUpload';

const FacultyDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        {/* User Info Section */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4">Welcome, {user?.full_name}</Typography>
          </Box>

          <Typography><strong>Email:</strong> {user?.email}</Typography>
        </Paper>

        {/* Document Upload Section */}
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Document Management
          </Typography>
          <DocumentUpload />
        </Paper>
      </Box>
    </Container>
  );
};

export default FacultyDashboard; 