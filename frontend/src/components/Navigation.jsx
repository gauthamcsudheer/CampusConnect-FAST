import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LogoutIcon from '@mui/icons-material/Logout';

const Navigation = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          CampusConnect
        </Typography>
        <Box>
          {user?.user_type === 'admin' && (
            <>
              <Button
                color="inherit"
                startIcon={<PeopleIcon />}
                onClick={() => navigate('/users')}
              >
                Users
              </Button>
              <Button
                color="inherit"
                startIcon={<PersonAddIcon />}
                onClick={() => navigate('/create-faculty')}
              >
                Add Faculty
              </Button>
              <Button
                color="inherit"
                startIcon={<PersonAddIcon />}
                onClick={() => navigate('/create-student')}
              >
                Add Student
              </Button>
            </>
          )}
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation; 