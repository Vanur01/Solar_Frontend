import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  Chip,
  LinearProgress,
  Stack,
  alpha,
  useTheme,
  IconButton,
  Avatar,
  Skeleton,
  Alert,
  Snackbar,
  Badge,
  useMediaQuery,
  Fade,
  Zoom,
  Grow,
  Slide,
  Fab,
  BottomNavigation,
  BottomNavigationAction,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip
} from '@mui/material';
import {
  Login as LoginIcon,
  Logout as LogoutIcon,
  AddLocationAlt as AddLocationAltIcon,
  ArrowUpward as ArrowUpwardIcon,
  Verified as VerifiedIcon,
  Image as ImageIcon,
  LocationOn as LocationOnIcon,
  Route as RouteIcon,
  FiberManualRecord as FiberManualRecordIcon,
  Visibility as VisibilityIcon,
  Schedule as ScheduleIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon,
  PhotoCamera as PhotoCameraIcon,
  Menu as MenuIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  GpsFixed as GpsFixedIcon,
  GpsOff as GpsOffIcon,
  Wifi as WifiIcon,
  Public as PublicIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  History as HistoryIcon,
  Map as MapIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { format, isToday, isYesterday, formatDistance } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Modern Stats Card
const ModernStatsCard = ({ icon: Icon, title, value, subValue, color = 'primary', trend, onClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Paper
        onClick={onClick}
        sx={{
          p: isMobile ? 2 : 2.5,
          borderRadius: 4,
          background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.1)} 0%, ${alpha(theme.palette[color].main, 0.05)} 100%)`,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`,
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.3s ease',
          height:"140px",
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${theme.palette[color].main}, ${alpha(theme.palette[color].main, 0.5)})`
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              {title}
            </Typography>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              sx={{
                fontWeight: 800,
                mt: 0.5,
                background: `linear-gradient(135deg, ${theme.palette[color].main}, ${alpha(theme.palette[color].main, 0.8)})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent'
              }}
            >
              {value}
            </Typography>
          </Box>
          <Avatar
            sx={{
              bgcolor: alpha(theme.palette[color].main, 0.2),
              color: theme.palette[color].main,
              width: isMobile ? 40 : 48,
              height: isMobile ? 40 : 48
            }}
          >
            <Icon />
          </Avatar>
        </Box>

        {subValue && (
          <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
            {subValue}
          </Typography>
        )}

        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
            <ArrowUpwardIcon sx={{ color: 'success.main', fontSize: 16 }} />
            <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
              {trend}
            </Typography>
          </Box>
        )}
      </Paper>
    </motion.div>
  );
};

// Modern Visit Card
const ModernVisitCard = ({ visit, onViewLiveRoute, index }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [imageError, setImageError] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed': return theme.palette.success;
      case 'inprogress': return theme.palette.warning;
      case 'cancelled': return theme.palette.error;
      default: return theme.palette.info;
    }
  };

  const formatVisitTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isToday(date)) return `Today, ${format(date, 'h:mm a')}`;
    if (isYesterday(date)) return `Yesterday, ${format(date, 'h:mm a')}`;
    return format(date, 'MMM d, h:mm a');
  };

  const statusColor = getStatusColor(visit.status);

  return (
    <motion.div
      variants={fadeInUp}
      custom={index}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Paper
        sx={{
          p: isMobile ? 1.5 : 2,
          borderRadius: 3,
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'white',
          border: `1px solid ${alpha(statusColor.main, 0.2)}`,
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
          '&:hover': {
            boxShadow: `0 8px 20px ${alpha(statusColor.main, 0.2)}`
          }
        }}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Status Indicator */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 4,
            height: '100%',
            bgcolor: statusColor.main
          }}
        />

        <Box sx={{ pl: 1.5 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', gap: 1.5, mb: expanded ? 1.5 : 0 }}>
            {/* Image */}
            {visit.photos?.length > 0 && !imageError ? (
              <Box
                sx={{
                  width: isMobile ? 50 : 60,
                  height: isMobile ? 50 : 60,
                  borderRadius: 2,
                  backgroundImage: `url(${visit.photos[0].url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  flexShrink: 0,
                  position: 'relative',
                  border: `2px solid ${alpha(statusColor.main, 0.3)}`
                }}
              >
                {visit.photos.length > 1 && (
                  <Badge
                    badgeContent={`+${visit.photos.length - 1}`}
                    color="primary"
                    sx={{
                      position: 'absolute',
                      bottom: -4,
                      right: -4,
                      '& .MuiBadge-badge': {
                        fontSize: 10,
                        height: 18,
                        minWidth: 18
                      }
                    }}
                  />
                )}
              </Box>
            ) : (
              <Box
                sx={{
                  width: isMobile ? 50 : 60,
                  height: isMobile ? 50 : 60,
                  borderRadius: 2,
                  bgcolor: alpha(statusColor.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: `2px solid ${alpha(statusColor.main, 0.3)}`
                }}
              >
                <LocationOnIcon sx={{ color: alpha(statusColor.main, 0.5), fontSize: isMobile ? 24 : 30 }} />
              </Box>
            )}

            {/* Basic Info */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: isMobile ? '0.9rem' : '1rem' }}>
                  {visit.locationName || 'Unknown Location'}
                </Typography>
                <Chip
                  label={visit.status || 'Pending'}
                  size="small"
                  sx={{
                    bgcolor: alpha(statusColor.main, 0.1),
                    color: statusColor.main,
                    fontWeight: 600,
                    fontSize: '0.65rem',
                    height: 20
                  }}
                />
              </Box>

              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                {visit.address || 'Address not available'}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ScheduleIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {formatVisitTime(visit.visitDate || visit.createdAt)}
                  </Typography>
                </Box>

                {visit.distanceFromPreviousKm > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <RouteIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {visit.distanceFromPreviousKm.toFixed(1)} km
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>

          {/* Expanded Details */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Divider sx={{ my: 1.5 }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {/* Photos */}
                  {visit.photos?.length > 0 && (
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5, display: 'block' }}>
                        Photos ({visit.photos.length})
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, overflowX: 'auto', pb: 0.5 }}>
                        {visit.photos.map((photo, idx) => (
                          <Box
                            key={idx}
                            component="img"
                            src={photo.url}
                            alt={`Visit ${idx + 1}`}
                            sx={{
                              width: 60,
                              height: 60,
                              borderRadius: 1,
                              objectFit: 'cover',
                              cursor: 'pointer',
                              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(photo.url, '_blank');
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Actions */}
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewLiveRoute(visit);
                      }}
                      sx={{ borderRadius: 2 }}
                    >
                      Live Route
                    </Button>
                    {visit.verified && (
                      <Chip
                        icon={<VerifiedIcon />}
                        label="Verified"
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </Paper>
    </motion.div>
  );
};

// Location Status Component
const LocationStatus = ({ state, onRetry, onManual }) => {
  const theme = useTheme();

  const getStatusConfig = () => {
    if (state.error) {
      return {
        icon: <GpsOffIcon />,
        color: 'error',
        message: state.error
      };
    }
    if (state.coords) {
      return {
        icon: <GpsFixedIcon />,
        color: 'success',
        message: `Location acquired (${state.accuracy?.toFixed(0)}m accuracy)`
      };
    }
    if (state.isWatching) {
      return {
        icon: <GpsFixedIcon sx={{ animation: 'pulse 1s infinite' }} />,
        color: 'warning',
        message: 'Getting location...'
      };
    }
    return {
      icon: <PublicIcon />,
      color: 'info',
      message: 'Location not requested'
    };
  };

  const config = getStatusConfig();

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 3,
        bgcolor: alpha(theme.palette[config.color].main, 0.1),
        border: `1px solid ${alpha(theme.palette[config.color].main, 0.2)}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ color: theme.palette[config.color].main }}>
          {config.icon}
        </Box>
        <Typography variant="body2" sx={{ color: theme.palette[config.color].main }}>
          {config.message}
        </Typography>
      </Box>

      {(state.error || !state.coords) && (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="outlined" onClick={onRetry}>
            Retry
          </Button>
          <Button size="small" variant="contained" onClick={onManual}>
            Manual
          </Button>
        </Box>
      )}
    </Paper>
  );
};

// Manual Location Dialog
const ManualLocationDialog = ({ open, onClose, onSubmit }) => {
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

  const handleSubmit = () => {
    if (lat && lng) {
      onSubmit(parseFloat(lat), parseFloat(lng));
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Enter Location Manually</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Latitude"
            type="number"
            fullWidth
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="e.g., 20.053094"
            size="small"
          />
          <TextField
            label="Longitude"
            type="number"
            fullWidth
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            placeholder="e.g., 85.338117"
            size="small"
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Main Component
const SalesDailySummary = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const {
    user,
    fetchAPI,
    locationState,
    requestLocationPermission,
    getLocationSmart,
    startWatchingPosition,
    stopWatchingPosition,
    punchIn,
    punchOut,
    getVisitStats,
    getRecentVisits
  } = useAuth();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    visitsToday: 0,
    totalVisits: 0,
    totalDistanceKm: 0,
    totalTravelTimeMinutes: 0
  });
  const [recentVisits, setRecentVisits] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [locationLoading, setLocationLoading] = useState(false);
  const [manualLocationOpen, setManualLocationOpen] = useState(false);
  const [bottomNav, setBottomNav] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [date] = useState(new Date());

  // Format date
  const formattedDate = format(date, 'EEEE, MMMM d, yyyy');

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [statsRes, visitsRes] = await Promise.all([
        getVisitStats(),
        getRecentVisits(5)
      ]);

      if (statsRes.success) {
        setStats(statsRes.result);
      }

      if (visitsRes.success) {
        setRecentVisits(visitsRes.result);
      }

      // Load attendance from localStorage
      const savedAttendance = localStorage.getItem('attendance');
      if (savedAttendance) {
        setAttendance(JSON.parse(savedAttendance));
      }
    } catch (error) {
      showSnackbar('Failed to load dashboard', 'error');
    } finally {
      setLoading(false);
    }
  }, [getVisitStats, getRecentVisits]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Show snackbar
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Handle Punch In
  const handlePunchIn = async () => {
    try {
      setLocationLoading(true);
      
      // Request permission
      const permResult = await requestLocationPermission();
      if (!permResult.success) {
        showSnackbar(permResult.error, 'error');
        setLocationLoading(false);
        return;
      }

      // Get location
      const location = await getLocationSmart();
      
      if (!location.success) {
        showSnackbar('Could not get location. Try manual entry.', 'warning');
        setManualLocationOpen(true);
        setLocationLoading(false);
        return;
      }

      // Punch in
      const result = await punchIn(location.lat, location.lng, location.source);
      
      if (result.success) {
        setAttendance(result.data);
        showSnackbar('Punched in successfully');
        loadDashboardData();
        
        // Start watching position
        startWatchingPosition(
          (pos) => console.log('Position updated:', pos),
          (err) => console.error('Watch error:', err)
        );
      } else {
        showSnackbar(result.error, 'error');
      }
    } catch (error) {
      showSnackbar('Failed to punch in', 'error');
    } finally {
      setLocationLoading(false);
    }
  };

  // Handle Punch Out
  const handlePunchOut = async () => {
    try {
      setLocationLoading(true);
      
      const location = await getLocationSmart();
      
      if (!location.success) {
        showSnackbar('Could not get location', 'warning');
        setLocationLoading(false);
        return;
      }

      const result = await punchOut(location.lat, location.lng);
      
      if (result.success) {
        setAttendance(result.data);
        showSnackbar('Punched out successfully');
        loadDashboardData();
        stopWatchingPosition();
      } else {
        showSnackbar(result.error, 'error');
      }
    } catch (error) {
      showSnackbar('Failed to punch out', 'error');
    } finally {
      setLocationLoading(false);
    }
  };

  // Handle Manual Location
  const handleManualLocation = async (lat, lng) => {
    setLocationLoading(true);
    const result = await punchIn(lat, lng, 'manual');
    if (result.success) {
      setAttendance(result.data);
      showSnackbar('Punched in with manual location');
      loadDashboardData();
    } else {
      showSnackbar(result.error, 'error');
    }
    setLocationLoading(false);
  };

  // Get attendance status
  const getAttendanceStatus = () => {
    if (!attendance) {
      return {
        text: 'OFF DUTY',
        color: 'text.disabled',
        icon: <CancelIcon />,
        action: 'Punch In'
      };
    }
    if (attendance.status === 'ON DUTY') {
      return {
        text: 'ON DUTY',
        color: 'success.main',
        icon: <CheckCircleIcon />,
        action: 'Punch Out',
        time: format(new Date(attendance.punchInTime), 'h:mm a')
      };
    }
    return {
      text: 'COMPLETED',
      color: 'info.main',
      icon: <HistoryIcon />,
      action: 'Punch In',
      time: format(new Date(attendance.punchOutTime), 'h:mm a')
    };
  };

  const status = getAttendanceStatus();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        pb: isMobile ? 7 : 4,
        ml : 3
      }}
    >
      <Container maxWidth="xl" sx={{ px: isMobile ? 2 : 3 }}>
        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Paper
            sx={{
              p: 2,
              mb: 3,
              borderRadius: 3,
              display: 'flex',
              gap: 2,
              flexDirection: isMobile ? 'column' : 'row',
              bgcolor: alpha(theme.palette.background.paper, 0.6),
              backdropFilter: 'blur(10px)'
            }}
          >
            <Button
              fullWidth={isMobile}
              variant="contained"
              size="large"
              startIcon={attendance?.status === 'ON DUTY' ? <LogoutIcon /> : <LoginIcon />}
              onClick={attendance?.status === 'ON DUTY' ? handlePunchOut : handlePunchIn}
              disabled={locationLoading}
              sx={{
                py: 1.5,
                borderRadius: 2,
                background: attendance?.status === 'ON DUTY'
                  ? `linear-gradient(135deg, ${theme.palette.error.main}, ${alpha(theme.palette.error.main, 0.8)})`
                  : `linear-gradient(135deg, ${theme.palette.success.main}, ${alpha(theme.palette.success.main, 0.8)})`
              }}
            >
              {locationLoading ? 'Getting Location...' : status.action}
            </Button>

            <Button
              fullWidth={isMobile}
              variant="outlined"
              size="large"
              startIcon={<AddLocationAltIcon />}
              onClick={() => navigate('/visit-details')}
              sx={{ py: 1.5, borderRadius: 2 }}
            >
              Start Visit
            </Button>

            <IconButton
              onClick={loadDashboardData}
              disabled={loading}
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                borderRadius: 2,
                width: isMobile ? '100%' : 56,
                height: 56
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Paper>
        </motion.div>

        {/* Location Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <LocationStatus
            state={locationState}
            onRetry={handlePunchIn}
            onManual={() => setManualLocationOpen(true)}
          />
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <Grid container spacing={isMobile ? 1.5 : 3} sx={{ my: 2 }}>
            <Grid item xs={6} md={3}>
              {loading ? (
                <Skeleton variant="rounded" height={isMobile ? 120 : 140} sx={{ borderRadius: 3 }} />
              ) : (
                <ModernStatsCard
                  icon={TrendingUpIcon}
                  title="Today's Visits"
                  value={stats.visitsToday || 0}
                  subValue={`${((stats.visitsToday / 12) * 100).toFixed(0)}% of target`}
                  color="primary"
                  onClick={() => navigate('/total-visits')}
                />
              )}
            </Grid>

            <Grid item xs={6} md={3}>
              {loading ? (
                <Skeleton variant="rounded" height={isMobile ? 120 : 140} sx={{ borderRadius: 3 }} />
              ) : (
                <ModernStatsCard
                  icon={RouteIcon}
                  title="Distance"
                  value={`${(stats.totalDistanceKm || 0).toFixed(1)} km`}
                  subValue={`Avg ${((stats.totalDistanceKm || 0) / (stats.visitsToday || 1)).toFixed(1)} km`}
                  color="success"
                />
              )}
            </Grid>

            <Grid item xs={6} md={3}>
              {loading ? (
                <Skeleton variant="rounded" height={isMobile ? 120 : 140} sx={{ borderRadius: 3 }} />
              ) : (
                <ModernStatsCard
                  icon={AccessTimeIcon}
                  title="Travel Time"
                  value={`${Math.floor((stats.totalTravelTimeMinutes || 0) / 60)}h ${(stats.totalTravelTimeMinutes || 0) % 60}m`}
                  subValue="Total today"
                  color="warning"
                />
              )}
            </Grid>

            <Grid item xs={6} md={3}>
              {loading ? (
                <Skeleton variant="rounded" height={isMobile ? 120 : 140} sx={{ borderRadius: 3 }} />
              ) : (
                <ModernStatsCard
                  icon={status.icon.type}
                  title="Status"
                  value={status.text}
                  subValue={status.time}
                  color={status.text === 'ON DUTY' ? 'success' : 'info'}
                />
              )}
            </Grid>
          </Grid>
        </motion.div>

        {/* Recent Visits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Paper
            sx={{
              p: isMobile ? 2 : 3,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.background.paper, 0.6),
              backdropFilter: 'blur(10px)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Recent Visits
              </Typography>
              <Button
                size="small"
                onClick={() => navigate('/team-performance-report')}
                sx={{ borderRadius: 2 }}
              >
                View All
              </Button>
            </Box>

            {loading ? (
              <Stack spacing={2}>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} variant="rounded" height={isMobile ? 100 : 120} sx={{ borderRadius: 2 }} />
                ))}
              </Stack>
            ) : recentVisits.length > 0 ? (
              <Stack spacing={1.5}>
                {recentVisits.map((visit, index) => (
                  <ModernVisitCard
                    key={visit._id}
                    visit={visit}
                    index={index}
                    onViewLiveRoute={(v) => navigate('/visit-route', { state: { visit: v } })}
                  />
                ))}
              </Stack>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <LocationOnIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography color="text.secondary">No visits yet today</Typography>
              </Box>
            )}
          </Paper>
        </motion.div>
      </Container>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <Paper
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            borderRadius: 0,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            zIndex: 100
          }}
          elevation={3}
        >
          <BottomNavigation
            value={bottomNav}
            onChange={(e, newValue) => setBottomNav(newValue)}
            showLabels
          >
            <BottomNavigationAction label="Dashboard" icon={<DashboardIcon />} />
            <BottomNavigationAction label="Visits" icon={<HistoryIcon />} />
            <BottomNavigationAction label="Map" icon={<MapIcon />} />
            <BottomNavigationAction label="Profile" icon={<PersonIcon />} />
          </BottomNavigation>
        </Paper>
      )}

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: '80%',
            maxWidth: 300,
            bgcolor: theme.palette.mode === 'dark' ? '#1A1F2E' : '#FFFFFF'
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
              {user?.firstName?.[0]}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {user?.role}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <List>
            <ListItem button onClick={() => navigate('/dashboard')}>
              <ListItemIcon><DashboardIcon /></ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
            <ListItem button onClick={() => navigate('/total-visits')}>
              <ListItemIcon><HistoryIcon /></ListItemIcon>
              <ListItemText primary="Visits" />
            </ListItem>
            <ListItem button onClick={() => navigate('/visit-route')}>
              <ListItemIcon><MapIcon /></ListItemIcon>
              <ListItemText primary="Route History" />
            </ListItem>
            <ListItem button onClick={() => navigate('/profile')}>
              <ListItemIcon><PersonIcon /></ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItem>
          </List>

          <Divider sx={{ my: 2 }} />

          <List>
            <ListItem button onClick={() => setDrawerOpen(false)}>
              <ListItemIcon><CloseIcon /></ListItemIcon>
              <ListItemText primary="Close" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Manual Location Dialog */}
      <ManualLocationDialog
        open={manualLocationOpen}
        onClose={() => setManualLocationOpen(false)}
        onSubmit={handleManualLocation}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: isMobile ? 'center' : 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Global Styles */}
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </Box>
  );
};

export default SalesDailySummary;