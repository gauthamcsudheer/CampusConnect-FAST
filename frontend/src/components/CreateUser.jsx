import React, { useState } from 'react';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert
} from '@mui/material';
import { userService } from '../services/api';

const CreateUser = () => {
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
      await userService.createUser(formData);
      setSuccess(true);
      setError(null);
      setFormData({
        email: '',
        username: '',
        full_name: '',
        password: ''
      });
    } catch (err) {
      setError('Failed to create user');
      setSuccess(false);
      console.error('Error creating user:', err);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Create New User
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          User created successfully!
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Full Name"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          margin="normal"
          required
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3 }}
        >
          Create User
        </Button>
      </Box>
    </Paper>
  );
};

export default CreateUser; 