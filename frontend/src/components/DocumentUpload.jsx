import React, { useState } from 'react';
import {
  Paper,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  TextField
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { userService } from '../services/api';

const DocumentUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [extractedText, setExtractedText] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setError(null);
    setSuccess(false);
    setExtractedText(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);
    setExtractedText(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await userService.uploadDocument(formData);
      setSuccess(true);
      setFile(null);

      // Fetch the extracted text
      if (response.text_path) {
        const textResponse = await fetch(`http://localhost:8000/extracted_texts/${response.text_filename}`);
        const text = await textResponse.text();
        setExtractedText(text);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Upload Document
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          File uploaded and processed successfully!
        </Alert>
      )}

      <Box sx={{ mt: 2 }}>
        <input
          accept="image/*,application/pdf"
          style={{ display: 'none' }}
          id="file-upload"
          type="file"
          onChange={handleFileChange}
        />
        <label htmlFor="file-upload">
          <Button
            variant="outlined"
            component="span"
            startIcon={<CloudUploadIcon />}
            sx={{ mb: 2 }}
          >
            Select File
          </Button>
          {file && (
            <Typography variant="body2" sx={{ ml: 2 }}>
              Selected: {file.name}
            </Typography>
          )}
        </label>

        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!file || uploading}
          sx={{ mt: 2 }}
        >
          {uploading ? (
            <>
              <CircularProgress size={24} sx={{ mr: 1 }} />
              Processing...
            </>
          ) : (
            'Upload'
          )}
        </Button>
      </Box>

      {extractedText && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Extracted Text
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={10}
            value={extractedText}
            InputProps={{
              readOnly: true,
            }}
            variant="outlined"
          />
        </Box>
      )}
    </Paper>
  );
};

export default DocumentUpload; 