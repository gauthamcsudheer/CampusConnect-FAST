import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import GeminiChat from './GeminiChat';

const DocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/documents/');
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      const data = await response.json();
      setDocuments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentClick = async (document) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/document/${document.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch document content');
      }
      const data = await response.json();
      setSelectedDocument({ ...document, content: data.content });
      setOpen(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedDocument(null);
    setTabValue(0);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading documents...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Available Documents
      </Typography>
      <Grid container spacing={3}>
        {documents.map((doc) => (
          <Grid item xs={12} sm={6} md={4} key={doc.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 6,
                },
              }}
              onClick={() => handleDocumentClick(doc)}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {doc.filename}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Uploaded: {new Date(doc.created_at).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {selectedDocument?.filename}
        </DialogTitle>
        <DialogContent>
          <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
            <Tab label="Content" />
            <Tab label="Chat with AI" />
          </Tabs>
          {tabValue === 0 ? (
            <Paper
              sx={{
                p: 2,
                maxHeight: '60vh',
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
              }}
            >
              <Typography variant="body1">
                {selectedDocument?.content}
              </Typography>
            </Paper>
          ) : (
            <GeminiChat
              extractedText={selectedDocument?.content}
              docId={selectedDocument?.id}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentList; 