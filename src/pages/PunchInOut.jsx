// components/PunchInOut.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
  Stack,
  Avatar,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  Login,
  Logout,
  LocationOn,
  GpsFixed,
  GpsOff,
  Close
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useAttendance } from '../hooks/useAttendance';
import { formatTime } from '../utils/apiUtils';

export default function PunchInOut({ onSuccess, onClose }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { getCurrentPosition, user } = useAuth();
  const {
    punchIn,
    punchOut,
    todayAttendance,
    loading,
    error,
    success,
    clearMessages
  } = useAttendance();

  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Get location on mount
  useEffect(() => {
    fetchLocation();
  }, []);

  // Handle snackbar messages
  useEffect(() => {
    if (error) {
      setSnackbar({ open: true, message: error, severity: 'error' });
    }
    if (success) {
      setSnackbar({ open: true, message: success, severity: 'success' });
      if (onSuccess) onSuccess();
    }
  }, [error, success, onSuccess]);

  const fetchLocation = async () => {
    setLocationLoading(true);
    const result = await getCurrentPosition();
    if (result.success) {
      setLocation(result);
    }
    setLocationLoading(false);
  };

  const handlePunchIn = async () => {
    if (!location) {
      await fetchLocation();
      if (!location) {
        setSnackbar({ open: true, message: 'Location required for punch in', severity: 'error' });
        return;
      }
    }

    // Create FormData with only latitude and longitude
    const formData = new FormData();
    formData.append('latitude', location.lat.toString());
    formData.append('longitude', location.lng.toString());

    // Log FormData contents for debugging
    console.log('Punch In FormData:');
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }

    await punchIn(formData);
  };

  const handlePunchOut = async () => {
    if (!location) {
      await fetchLocation();
      if (!location) {
        setSnackbar({ open: true, message: 'Location required for punch out', severity: 'error' });
        return;
      }
    }

    // Create FormData with only latitude and longitude
    const formData = new FormData();
    formData.append('latitude', location.lat.toString());
    formData.append('longitude', location.lng.toString());

    // Log FormData contents for debugging
    console.log('Punch Out FormData:');
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }

    await punchOut(formData);
  };

  const hasPunchedIn = todayAttendance?.punchIn?.time;
  const hasPunchedOut = todayAttendance?.punchOut?.time;

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      {/* Header with Close Button */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={700}>
          {hasPunchedIn ? 'Punch Out' : 'Punch In'}
        </Typography>
        {onClose && (
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        )}
      </Box>

      {/* User Info */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
          {user?.name?.charAt(0) || 'U'}
        </Avatar>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            {user?.name || 'User'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.email}
          </Typography>
          <Chip
            label={user?.role || 'TEAM'}
            size="small"
            sx={{ mt: 0.5, bgcolor: alpha('#4569ea', 0.1), color: '#4569ea', height: 20 }}
          />
        </Box>
      </Stack>

      {/* Status Card */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: alpha('#4569ea', 0.03), borderRadius: 2 }}>
        <Stack spacing={1.5}>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Status</Typography>
            <Chip
              label={hasPunchedIn ? (hasPunchedOut ? 'Completed' : 'Active') : 'Not Started'}
              size="small"
              color={hasPunchedIn ? (hasPunchedOut ? 'default' : 'success') : 'default'}
              sx={{ fontWeight: 600 }}
            />
          </Box>
          
          {todayAttendance?.punchIn && (
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Punch In</Typography>
              <Typography variant="body2" fontWeight={600}>
                {formatTime(todayAttendance.punchIn.time)}
              </Typography>
            </Box>
          )}
          
          {todayAttendance?.punchOut && (
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Punch Out</Typography>
              <Typography variant="body2" fontWeight={600}>
                {formatTime(todayAttendance.punchOut.time)}
              </Typography>
            </Box>
          )}
        </Stack>
      </Paper>

      {/* Location Status */}
      <Box 
        sx={{ 
          p: 2, 
          mb: 3, 
          bgcolor: alpha(location ? '#4caf50' : '#f44336', 0.05),
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}
      >
        {locationLoading ? (
          <CircularProgress size={24} />
        ) : location ? (
          <GpsFixed sx={{ color: '#4caf50' }} />
        ) : (
          <GpsOff sx={{ color: '#f44336' }} />
        )}
        <Box flex={1}>
          <Typography variant="body2" fontWeight={600}>
            {location ? 'Location Ready' : 'Location Required'}
          </Typography>
          {location && (
            <Typography variant="caption" color="text.secondary">
              Lat: {location.lat?.toFixed(6)}, Lng: {location.lng?.toFixed(6)}
            </Typography>
          )}
          {location && location.address && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {location.address}
            </Typography>
          )}
        </Box>
        {!location && (
          <Button size="small" onClick={fetchLocation} variant="outlined">
            Retry
          </Button>
        )}
      </Box>

      {/* Location Accuracy Info */}
      {location && location.accuracy && (
        <Paper sx={{ p: 1.5, mb: 3, bgcolor: alpha('#2196f3', 0.05), borderRadius: 2 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <LocationOn sx={{ color: '#2196f3', fontSize: 20 }} />
            <Typography variant="caption" color="text.secondary">
              Accuracy: ±{Math.round(location.accuracy)} meters
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Action Button */}
      {!hasPunchedIn && (
        <Button
          fullWidth
          variant="contained"
          size="large"
          startIcon={<Login />}
          onClick={handlePunchIn}
          disabled={loading || !location}
          sx={{ 
            py: 1.8, 
            borderRadius: 2,
            fontSize: '1rem',
            fontWeight: 700
          }}
        >
          {loading ? <CircularProgress size={24} /> : 'Punch In'}
        </Button>
      )}

      {hasPunchedIn && !hasPunchedOut && (
        <Button
          fullWidth
          variant="contained"
          color="warning"
          size="large"
          startIcon={<Logout />}
          onClick={handlePunchOut}
          disabled={loading || !location}
          sx={{ 
            py: 1.8, 
            borderRadius: 2,
            fontSize: '1rem',
            fontWeight: 700
          }}
        >
          {loading ? <CircularProgress size={24} /> : 'Punch Out'}
        </Button>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => {
          setSnackbar({ ...snackbar, open: false });
          clearMessages();
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => {
            setSnackbar({ ...snackbar, open: false });
            clearMessages();
          }}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}