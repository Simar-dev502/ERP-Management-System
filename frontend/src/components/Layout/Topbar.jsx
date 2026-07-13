import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  AppBar, Toolbar, Typography, Box, IconButton, Avatar, Menu, MenuItem, ListItemIcon, Divider,
} from '@mui/material';
import {
  DarkMode, LightMode, Logout, Person, AccountCircle,
} from '@mui/icons-material';
import useAuth from '../../hooks/useAuth';

const Topbar = ({ mode, toggleTheme }) => {
  const { user } = useSelector((state) => state.auth);
  const { logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <AppBar position="fixed" color="inherit" elevation={1} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
          {user?.name ? `Welcome, ${user.name}` : 'ERP System'}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={toggleTheme} color="inherit">
            {mode === 'light' ? <DarkMode /> : <LightMode />}
          </IconButton>

          <IconButton onClick={handleMenu} color="inherit">
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
          </IconButton>

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose} transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
            <MenuItem disabled>
              <ListItemIcon><AccountCircle fontSize="small" /></ListItemIcon>
              <Box>
                <Typography variant="body2">{user?.name}</Typography>
                <Typography variant="caption" color="text.secondary">{user?.role}</Typography>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { handleClose(); logout(); }}>
              <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;