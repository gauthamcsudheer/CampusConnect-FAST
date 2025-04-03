import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import DocumentList from './DocumentList';
import GlobalChatbot from './GlobalChatbot';

const StudentDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Welcome, {user.full_name}!
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {user.email}
          </Typography>
        </Paper>
        <DocumentList />
        <GlobalChatbot />
      </Box>
    </Container>
  );
};

export default StudentDashboard; 