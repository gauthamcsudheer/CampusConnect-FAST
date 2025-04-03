import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './components/Login';
import FacultyDashboard from './components/FacultyDashboard';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import Navigation from './components/Navigation';
import UserList from './components/UserList';
import CreateFaculty from './components/CreateFaculty';
import CreateStudent from './components/CreateStudent';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import { AuthProvider } from './contexts/AuthContext';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/faculty-dashboard"
              element={
                <PrivateRoute>
                  <Navigation />
                  <FacultyDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/student-dashboard"
              element={
                <PrivateRoute>
                  <Navigation />
                  <StudentDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin-dashboard"
              element={
                <AdminRoute>
                  <Navigation />
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/users"
              element={
                <AdminRoute>
                  <Navigation />
                  <UserList />
                </AdminRoute>
              }
            />
            <Route
              path="/create-faculty"
              element={
                <AdminRoute>
                  <Navigation />
                  <CreateFaculty />
                </AdminRoute>
              }
            />
            <Route
              path="/create-student"
              element={
                <AdminRoute>
                  <Navigation />
                  <CreateStudent />
                </AdminRoute>
              }
            />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
