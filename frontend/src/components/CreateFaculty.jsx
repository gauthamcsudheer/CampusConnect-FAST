import React, { useState } from 'react';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Grid
} from '@mui/material';
import { userService } from '../services/api';

const CreateFaculty = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    full_name: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await userService.createFaculty({
        ...formData,
        user_type: 'faculty'
      });
      setSuccess(true);
      setError(null);
      setFormData({
        email: '',
        username: '',
        full_name: '',
        password: ''
      });
    } catch (err) {
      setError('Failed to create faculty member');
      setSuccess(false);
      console.error('Error creating faculty:', err);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Register New Faculty Member
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Faculty member registered successfully!
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Full Name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
            >
              Register Faculty Member
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default CreateFaculty; 