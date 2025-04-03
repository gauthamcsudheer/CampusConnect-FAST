import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.user_type === 'admin' ? children : <Navigate to="/home" />;
};

export default AdminRoute; 