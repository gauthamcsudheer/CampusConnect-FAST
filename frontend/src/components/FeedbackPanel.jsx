import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
} from "@mui/material";
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import DeleteIcon from '@mui/icons-material/Delete';

const FeedbackPanel = () => {
  const [feedback, setFeedback] = useState([]);
  const [sentimentAnalysis, setSentimentAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      const response = await axios.get("http://localhost:8000/api/v1/feedback", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data) {
        setFeedback(response.data.feedback || []);
        setSentimentAnalysis(response.data.sentiment_analysis);
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
      setError(error.response?.data?.detail || error.message || "Failed to fetch feedback");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (feedbackItem) => {
    setSelectedFeedback(feedbackItem);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8000/api/v1/feedback/${selectedFeedback.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDeleteDialogOpen(false);
      fetchFeedback();
    } catch (error) {
      console.error("Error deleting feedback:", error);
      alert(error.response?.data?.detail || "Failed to delete feedback");
    }
  };

  const handleCategoryChange = (event, newValue) => {
    setSelectedCategory(newValue);
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return <SentimentVerySatisfiedIcon color="success" />;
      case 'negative':
        return <SentimentVeryDissatisfiedIcon color="error" />;
      default:
        return <SentimentNeutralIcon color="action" />;
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return 'success';
      case 'negative':
        return 'error';
      default:
        return 'primary';
    }
  };

  const getCategoryColor = (category) => {
    if (!category) return 'default';
    switch (category) {
      case 'infrastructure':
        return 'primary';
      case 'academic':
        return 'success';
      case 'administrative':
        return 'info';
      case 'support':
        return 'warning';
      case 'campus':
        return 'secondary';
      case 'other':
        return 'default';
      default:
        return 'default';
    }
  };

  const filteredFeedback = selectedCategory === "all" 
    ? feedback 
    : feedback.filter(item => {
        // Handle both old and new category values
        const itemCategory = item.category?.toLowerCase() || "other";
        return itemCategory === selectedCategory;
      });

  const getCategoryLabel = (category) => {
    if (!category) return 'Other';
    const cat = category.toLowerCase();
    switch (cat) {
      case 'infrastructure':
        return 'Infrastructure & Facilities';
      case 'academic':
        return 'Academic Quality';
      case 'administrative':
        return 'Administrative Services';
      case 'support':
        return 'Student Support & Welfare';
      case 'campus':
        return 'Campus Environment & Culture';
      case 'other':
        return 'Other';
      default:
        return 'Other';
    }
  };

  const getCategoryValue = (label) => {
    switch (label.toLowerCase()) {
      case 'infrastructure & facilities':
        return 'infrastructure';
      case 'academic quality':
        return 'academic';
      case 'administrative services':
        return 'administrative';
      case 'student support & welfare':
        return 'support';
      case 'campus environment & culture':
        return 'campus';
      default:
        return 'other';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchFeedback}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Student Feedback
      </Typography>

      {/* Category Filter */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={selectedCategory} 
          onChange={handleCategoryChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="All" value="all" />
          <Tab label="Infrastructure & Facilities" value="infrastructure" />
          <Tab label="Academic Quality" value="academic" />
          <Tab label="Administrative Services" value="administrative" />
          <Tab label="Student Support & Welfare" value="support" />
          <Tab label="Campus Environment & Culture" value="campus" />
          <Tab label="Other" value="other" />
        </Tabs>
      </Box>

      {/* Sentiment Analysis Summary */}
      {sentimentAnalysis && (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 3, 
            bgcolor: "white", 
            borderRadius: 2, 
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)" 
          }}
        >
          <Typography variant="h6" gutterBottom>
            Sentiment Analysis
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(sentimentAnalysis.aggregate_stats.percentages).map(([sentiment, percentage]) => (
              <Grid item xs={12} md={4} key={sentiment}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                    {getSentimentIcon(sentiment)}
                    <Typography variant="subtitle1" sx={{ ml: 1 }}>
                      {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
                    </Typography>
                  </Box>
                  <Typography 
                    variant="h4" 
                    color={getSentimentColor(sentiment)}
                    sx={{ mb: 1 }}
                  >
                    {Math.round(percentage)}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={percentage} 
                    color={getSentimentColor(sentiment)}
                    sx={{ 
                      mt: 1,
                      height: 8,
                      borderRadius: 4,
                    }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Feedback List */}
      <Paper elevation={0} sx={{ bgcolor: "white", borderRadius: 2, boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
        <List>
          {filteredFeedback.map((item, index) => {
            const sentiment = sentimentAnalysis?.individual_sentiments.find(
              s => s.id === item.id
            )?.sentiment.overall_sentiment;
            
            return (
              <React.Fragment key={item.id}>
                <ListItem>
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <ListItemText
                        primary={item.message}
                        secondary={new Date(item.created_at).toLocaleString()}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={getCategoryLabel(item.category)}
                          color={getCategoryColor(item.category)}
                          size="small"
                        />
                        {sentiment && (
                          <Chip
                            icon={getSentimentIcon(sentiment)}
                            label={sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
                            color={getSentimentColor(sentiment)}
                            size="small"
                          />
                        )}
                        <Tooltip title="Delete Feedback">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(item)}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Box>
                </ListItem>
                {index < filteredFeedback.length - 1 && <Divider />}
              </React.Fragment>
            );
          })}
          {filteredFeedback.length === 0 && (
            <ListItem>
              <ListItemText primary="No feedback received yet" />
            </ListItem>
          )}
        </List>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this feedback? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FeedbackPanel; 