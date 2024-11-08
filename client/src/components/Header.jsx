import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { AppBar, Toolbar, Button, Box } from '@mui/material';
import logo from '../assets/logo.png';

const Header = () => {
  const { loginWithPopup, logout, isAuthenticated } = useAuth0();
  const location = useLocation();

  const linkStyle = (path) => ({
    textDecoration: location.pathname === path ? 'underline' : 'none',
    textDecorationColor: location.pathname === path ? 'white' : 'none',
    color: 'inherit',
    marginRight: '16px'
  });

  return (
    <AppBar position="sticky" style={{ backgroundColor: '#111827' }}>
      <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <img
              src={logo}
              alt='logo'
              style={{ height: '48px', marginRight: '16px' }}
            />
          </Link>

          {isAuthenticated && (
            <>
              <Button
                color="inherit"
                component={Link}
                to="/profile"
                style={linkStyle('/profile')}
              >
                My Profile
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/create-post"
                style={linkStyle('/create-post')}
              >
                Create Post
              </Button>
            </>
          )}
        </Box>

        <Box>
          {isAuthenticated ? (
            <Button color="secondary" variant="contained" onClick={() => logout({ returnTo: window.location.origin })}>
              Log Out
            </Button>
          ) : (
            <Button color="primary" variant="contained" onClick={() => loginWithPopup({ connection: 'google-oauth2' })}>
              Log In
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
