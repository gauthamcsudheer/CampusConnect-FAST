import React from "react";
import { Box, Container, Typography, Paper } from "@mui/material";
import FeedbackPanel from "./FeedbackPanel";

const AdminDashboard = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
        <Paper elevation={0} sx={{ p: 3, bgcolor: "white", borderRadius: 2, boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
          <Typography variant="h6" gutterBottom>
            Student Feedback
          </Typography>
          <FeedbackPanel />
        </Paper>
      </Box>
    </Container>
  );
};

export default AdminDashboard; 