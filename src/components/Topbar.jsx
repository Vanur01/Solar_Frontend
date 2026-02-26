// components/Topbar.jsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  alpha,
  Badge,
  InputBase,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  AccountCircle as AccountCircleIcon,
  Help as HelpIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../contexts/AuthContext";

const Topbar = ({ toggleDrawer, isMobile, drawerOpen, sidebarWidth = 280 }) => {
  const navigate = useNavigate();
  const { user, logout, getUserRole, fetchAPI } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');


  const handleProfileMenu = useCallback((event) => setAnchorEl(event.currentTarget), []);
  const handleNotificationMenu = useCallback((event) => setNotificationAnchor(event.currentTarget), []);
  
  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);
  
  const handleLogout = useCallback(async () => {
    try {
      setLoggingOut(true);
      handleClose();
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login', { replace: true });
    } finally {
      setLoggingOut(false);
    }
  }, [navigate, logout, handleClose]);

  const handleProfile = useCallback(() => {
    handleClose();
    navigate('/profile');
  }, [navigate, handleClose]);

  const handleSettings = useCallback(() => {
    handleClose();
    navigate('/settings');
  }, [navigate, handleClose]);

  const handleHelp = useCallback(() => {
    handleClose();
    navigate('/help');
  }, [navigate, handleClose]);

  const handleDashboard = useCallback(() => {
    handleClose();
    navigate('/dashboard');
  }, [navigate, handleClose]);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  }, [navigate, searchQuery]);

  const handleMarkAsRead = useCallback(async (notificationId) => {
    try {
      await fetchAPI(`/notifications/${notificationId}/read`, 'PATCH');
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [fetchAPI]);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await fetchAPI('/notifications/read-all', 'POST');
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [fetchAPI]);

  // User information
  const userInitials = useMemo(() => {
    if (!user) return 'U';
    const firstName = user?.firstName || user?.name?.split(' ')[0] || '';
    const lastName = user?.lastName || user?.name?.split(' ')[1] || '';
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
  }, [user]);

  const displayName = useMemo(() => {
    if (!user) return 'User';
    return user?.firstName || user?.name?.split(' ')[0] || 'User';
  }, [user]);

  const fullName = useMemo(() => {
    if (!user) return 'User';
    return user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User';
  }, [user]);

  const userRole = useMemo(() => {
    if (!user?.role) return 'User';
    const role = getUserRole ? getUserRole() : user.role;
    const roleMap = {
      'superadmin': 'Super Administrator',
      'admin': 'Administrator',
      'instructor': 'Instructor',
      'user': 'Member',
      'Head_office': 'Head Office',
      'ZSM': 'Zonal Sales Manager',
      'ASM': 'Area Sales Manager',
      'TEAM': 'Field Executive'
    };
    return roleMap[role] || role || 'User';
  }, [user, getUserRole]);

  const userAvatar = useMemo(() => {
    return user?.avatar || user?.profilePicture || null;
  }, [user]);

  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.read).length
  , [notifications]);

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: '#ffffff',
          borderBottom: '1px solid #e0e0e0',
          width: isMobile ? "100%" : `calc(100% - ${drawerOpen ? sidebarWidth : 72}px)`,
          ml: isMobile ? 0 : (drawerOpen ? `${sidebarWidth}px` : '72px'),
          zIndex: (theme) => theme.zIndex.drawer + 1,
          transition: 'all 0.3s ease',
        }}
      >
        <Toolbar sx={{
          justifyContent: 'space-between',
          minHeight: 64,
          px: { xs: 1.5, sm: 2, md: 3 },
        }}>
          {/* Left Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
            {isMobile && (
              <IconButton 
                onClick={toggleDrawer} 
                sx={{ 
                  color: '#4569ea',
                  '&:hover': { bgcolor: alpha('#4569ea', 0.1) },
                }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: '#333333',
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                display: { xs: isMobile ? 'none' : 'block', sm: 'block' },
              }}
            >
              {user?.dashboardTitle || 'Dashboard'}
            </Typography>

            {/* Search Bar - Hidden on mobile */}
            <Box
              component="form"
              onSubmit={handleSearch}
              sx={{
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                bgcolor: '#f5f5f5',
                borderRadius: 2,
                px: 2,
                py: 0.5,
                width: 300,
                ml: 4,
                border: '1px solid #e0e0e0',
                '&:hover': { bgcolor: '#f0f0f0' },
                '&:focus-within': {
                  borderColor: '#4569ea',
                  boxShadow: `0 0 0 2px ${alpha('#4569ea', 0.2)}`,
                },
              }}
            >
              <SearchIcon sx={{ color: '#999', mr: 1, fontSize: 20 }} />
              <InputBase
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  flex: 1,
                  fontSize: '0.9rem',
                  '& input::placeholder': { color: '#999', opacity: 1 },
                }}
              />
            </Box>
          </Box>

          {/* Right Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
            {/* Mobile Search Icon */}
            <IconButton
              sx={{
                display: { xs: 'flex', md: 'none' },
                color: '#666',
                '&:hover': { bgcolor: alpha('#4569ea', 0.05) },
              }}
              onClick={() => navigate('/search')}
            >
              <SearchIcon />
            </IconButton>

            {/* Notifications */}
            <IconButton
              onClick={handleNotificationMenu}
              sx={{
                color: '#666',
                '&:hover': { bgcolor: alpha('#4569ea', 0.05) },
              }}
            >
              <Badge
                badgeContent={unreadCount}
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    minWidth: 18,
                    height: 18,
                  },
                }}
              >
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* User Profile */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
                p: 0.5,
                borderRadius: '8px',
                '&:hover': { bgcolor: alpha('#4569ea', 0.05) },
              }}
              onClick={handleProfileMenu}
            >
              <Avatar
                src={userAvatar}
                sx={{
                  bgcolor: userAvatar ? 'transparent' : '#4569ea',
                  width: { xs: 32, sm: 36 },
                  height: { xs: 32, sm: 36 },
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  fontWeight: 600,
                  color: '#ffffff',
                }}
              >
                {!userAvatar && userInitials}
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography 
                  fontSize="0.9rem"
                  fontWeight={500}
                  color="#333333"
                  sx={{ lineHeight: 1.2 }}
                >
                  {displayName}
                </Typography>
                <Typography 
                  fontSize="0.75rem" 
                  color="#666666"
                  sx={{ lineHeight: 1.2 }}
                >
                  {userRole}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Toolbar>

        {/* Notifications Menu */}
        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleClose}
          PaperProps={{ 
            sx: { 
              width: 360,
              mt: 1,
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              maxHeight: 480,
            } 
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ 
            p: 2, 
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <Typography fontWeight={600} color="#333333">
              Notifications
              {unreadCount > 0 && (
                <Badge
                  badgeContent={unreadCount}
                  color="error"
                  sx={{ ml: 1 }}
                />
              )}
            </Typography>
            {unreadCount > 0 && (
              <Typography
                variant="caption"
                sx={{
                  color: '#4569ea',
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' },
                }}
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </Typography>
            )}
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={32} />
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <NotificationsIcon sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
              <Typography color="#999" fontSize="0.9rem">
                No notifications
              </Typography>
            </Box>
          ) : (
            notifications.slice(0, 5).map((notification) => (
              <MenuItem 
                key={notification.id} 
                onClick={() => {
                  handleMarkAsRead(notification.id);
                  if (notification.link) {
                    navigate(notification.link);
                  }
                  handleClose();
                }}
                sx={{ 
                  py: 1.5, 
                  px: 2,
                  bgcolor: !notification.read ? alpha('#4569ea', 0.05) : 'transparent',
                  borderBottom: '1px solid #f0f0f0',
                  '&:last-child': { borderBottom: 'none' },
                }}
              >
                <Box sx={{ width: '100%' }}>
                  <Typography variant="body2" fontWeight={500} color="#333333" mb={0.5}>
                    {notification.title}
                  </Typography>
                  <Typography variant="body2" color="#666666" fontSize="0.8rem" mb={0.5}>
                    {notification.message}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="#999">
                      {notification.timeAgo || new Date(notification.createdAt).toLocaleDateString()}
                    </Typography>
                    {!notification.read && (
                      <Box
                        component="span"
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: '#4569ea',
                          display: 'inline-block',
                        }}
                      />
                    )}
                  </Box>
                </Box>
              </MenuItem>
            ))
          )}
          
          {notifications.length > 5 && (
            <Box sx={{ p: 1, borderTop: '1px solid #e0e0e0' }}>
              <MenuItem
                onClick={() => {
                  handleClose();
                  navigate('/notifications');
                }}
                sx={{ justifyContent: 'center' }}
              >
                <Typography color="#4569ea" fontSize="0.9rem">
                  View all notifications
                </Typography>
              </MenuItem>
            </Box>
          )}
        </Menu>

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{ 
            sx: { 
              width: 280,
              mt: 1,
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            } 
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {/* User Info */}
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                src={userAvatar}
                sx={{
                  bgcolor: userAvatar ? 'transparent' : '#4569ea',
                  color: '#ffffff',
                  width: 48,
                  height: 48,
                  fontSize: '1rem',
                  fontWeight: 600,
                }}
              >
                {!userAvatar && userInitials}
              </Avatar>
              <Box>
                <Typography fontWeight={600} fontSize="0.95rem" color="#333333">
                  {fullName}
                </Typography>
                <Typography fontSize="0.8rem" color="#666666" mb={0.5}>
                  {userRole}
                </Typography>
                <Typography fontSize="0.75rem" color="#999">
                  {user?.email || ''}
                </Typography>
              </Box>
            </Box>
          </Box>
          
          {/* Menu Items */}
          <Box sx={{ py: 0.5 }}>
            <MenuItem 
              onClick={handleLogout} 
              sx={{ 
                color: '#ff4444',
                '&:hover': { bgcolor: alpha('#ff4444', 0.05) }
              }}
              disabled={loggingOut}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                {loggingOut ? <CircularProgress size={20} color="inherit" /> : <LogoutIcon fontSize="small" />}
              </ListItemIcon>
              <ListItemText 
                primary={loggingOut ? "Logging out..." : "Logout"} 
                primaryTypographyProps={{ fontSize: '0.9rem' }}
              />
            </MenuItem>
          </Box>
        </Menu>
      </AppBar>

      {/* Spacer for fixed AppBar */}
      <Box sx={{ height: 64 }} />
    </>
  );
};

export default Topbar;