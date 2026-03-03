// components/VisitDetails.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  Stack,
  IconButton,
  Alert,
  Chip,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  AddAPhoto,
  PhotoCamera,
  Route,
  LocationOn,
  Map,
  AccessTime,
  CloudUpload,
  Cancel,
  GpsFixed,
  CheckCircle,
  Error as ErrorIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const PRIMARY = '#4569ea';

const UploadArea = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: 12,
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s',
  '&:hover': {
    borderColor: PRIMARY,
    backgroundColor: `${PRIMARY}10`
  }
}));

const SuccessDialog = ({ open, visitData, onClose }) => {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
        <CheckCircle sx={{ fontSize: 64, color: '#4caf50', mb: 2 }} />
        <Typography variant="h5" fontWeight={800}>
          Visit Created Successfully!
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <Paper sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              {visitData?.locationName}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              {visitData?.address || 'Address not available'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
              <Chip
                icon={<LocationOn />}
                label={`${visitData?.coordinates?.lat?.toFixed(4)}, ${visitData?.coordinates?.lng?.toFixed(4)}`}
                size="small"
                variant="outlined"
              />
              {visitData?.distanceFromPreviousKm > 0 && (
                <Chip
                  icon={<Route />}
                  label={`${visitData?.distanceFromPreviousKm?.toFixed(2)} km`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          </Paper>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{ borderRadius: 2, px: 4 }}
        >
          Close
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            onClose();
            navigate('/total-visits');
          }}
          sx={{ borderRadius: 2, px: 4, bgcolor: PRIMARY }}
        >
          View All Visits
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default function VisitDetails({ onClose, onSave }) {
  const { createVisit, getCurrentPosition, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    locationName: '',
    remarks: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [createdVisit, setCreatedVisit] = useState(null);
  const [locationRetryCount, setLocationRetryCount] = useState(0);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    setError(null);
    
    const result = await getCurrentPosition();
    
    if (result.success) {
      setLocation(result);
    } else {
      setError(result.error || 'Failed to get location');
      if (locationRetryCount < 3) {
        setTimeout(() => {
          setLocationRetryCount(prev => prev + 1);
          getCurrentLocation();
        }, 3000);
      }
    }
    setLocationLoading(false);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size should be less than 10MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!imageFile) {
      setError('Please capture or upload a photo');
      return false;
    }
    if (!formData.locationName.trim()) {
      setError('Please enter location name');
      return false;
    }
    if (!location) {
      setError('Location not available. Please try again.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const visitData = {
        locationName: formData.locationName,
        latitude: location.lat,
        longitude: location.lng,
        remarks: formData.remarks || ''
      };

      const response = await createVisit(visitData, imageFile);

      if (response.success) {
        setCreatedVisit(response.data);
        setSuccess(true);
        
        if (onSave) {
          onSave(response.data);
        }
        
        // Clear form
        setImageFile(null);
        setPreview(null);
        setFormData({
          locationName: '',
          remarks: ''
        });
      } else {
        setError(response.error || 'Failed to create visit');
      }
    } catch (err) {
      console.error('Visit creation error:', err);
      setError(err.message || 'Failed to create visit');
    } finally {
      setLoading(false);
    }
  };

  const handleRetryLocation = () => {
    setLocationRetryCount(0);
    getCurrentLocation();
  };

  return (
    <>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight={800} sx={{ color: PRIMARY, mb: 1 }}>
          Create New Visit
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Capture site information and location coordinates
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            {/* Photo Capture */}
            <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AddAPhoto sx={{ fontSize: 20, color: PRIMARY }} />
                Capture Site Photo
                <Chip 
                  label="Required" 
                  size="small" 
                  color={imageFile ? 'success' : 'error'}
                  sx={{ ml: 'auto' }}
                />
              </Typography>

              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageChange}
                style={{ display: 'none' }}
                id="visit-image"
                disabled={loading || authLoading}
              />
              <label htmlFor="visit-image">
                {preview ? (
                  <Box sx={{ position: 'relative' }}>
                    <img
                      src={preview}
                      alt="Preview"
                      style={{
                        width: '100%',
                        height: 200,
                        objectFit: 'cover',
                        borderRadius: 12
                      }}
                    />
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        setImageFile(null);
                        setPreview(null);
                      }}
                      disabled={loading}
                    >
                      <Cancel />
                    </IconButton>
                  </Box>
                ) : (
                  <UploadArea>
                    <PhotoCamera sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body2" fontWeight={600}>
                      Click to capture or upload
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                      Clear site/storefront image required (Max 10MB)
                    </Typography>
                  </UploadArea>
                )}
              </label>
            </Paper>

            {/* Location Name Input */}
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn sx={{ fontSize: 20, color: PRIMARY }} />
                Location Name
                <Chip 
                  label="Required" 
                  size="small" 
                  color={formData.locationName ? 'success' : 'error'}
                  sx={{ ml: 'auto' }}
                />
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter location/business name"
                value={formData.locationName}
                onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                disabled={loading || authLoading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: 'action.hover'
                  }
                }}
              />
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            {/* Location Details */}
            <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <GpsFixed sx={{ fontSize: 20, color: PRIMARY }} />
                Location Coordinates
                <Chip 
                  label={location ? 'Acquired' : 'Required'} 
                  size="small" 
                  color={location ? 'success' : 'error'}
                  sx={{ ml: 'auto' }}
                />
              </Typography>

              {locationLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={24} sx={{ mr: 2 }} />
                  <Typography>Getting your location...</Typography>
                </Box>
              ) : location ? (
                <Stack spacing={2}>
                  <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      Current Coordinates
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Map sx={{ color: PRIMARY, fontSize: 20 }} />
                      <Typography variant="body2" fontFamily="monospace" fontWeight={600}>
                        {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                      </Typography>
                    </Box>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                          Latitude
                        </Typography>
                        <Typography variant="body2" fontFamily="monospace" fontWeight={600}>
                          {location.lat.toFixed(6)}° N
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                          Longitude
                        </Typography>
                        <Typography variant="body2" fontFamily="monospace" fontWeight={600}>
                          {location.lng.toFixed(6)}° E
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                          Accuracy
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          ±{location.accuracy?.toFixed(0)} meters
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4caf50', animation: 'pulse 2s infinite' }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Current Time
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {format(new Date(), 'hh:mm:ss a')}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Stack>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <ErrorIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
                  <Typography color="error" gutterBottom>
                    {error || 'Failed to get location'}
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={handleRetryLocation}
                    sx={{ mt: 2, borderRadius: 2 }}
                  >
                    Retry Location
                  </Button>
                </Box>
              )}
            </Paper>

            {/* Remarks */}
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTime sx={{ fontSize: 20, color: PRIMARY }} />
                Visit Remarks (Optional)
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Enter any additional notes about the visit..."
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                disabled={loading || authLoading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: 'action.hover'
                  }
                }}
              />
            </Paper>
          </Grid>
        </Grid>

        {error && (
          <Alert 
            severity="error" 
            sx={{ mt: 3, borderRadius: 2 }}
            onClose={() => setError(null)}
            action={
              error.includes('location') && (
                <Button color="inherit" size="small" onClick={handleRetryLocation}>
                  Retry
                </Button>
              )
            }
          >
            {error}
          </Alert>
        )}

        <Box display="flex" justifyContent="flex-end" gap={2} sx={{ mt: 4 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={loading}
            sx={{ px: 4, py: 1.5, borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CloudUpload />}
            onClick={handleSubmit}
            disabled={loading || authLoading || !location || !imageFile || !formData.locationName}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              bgcolor: PRIMARY,
              '&:hover': { bgcolor: '#3456c0' },
              '&.Mui-disabled': {
                bgcolor: 'action.disabledBackground'
              }
            }}
          >
            {loading ? 'Creating Visit...' : 'Create Visit'}
          </Button>
        </Box>
      </Box>

      {/* Success Dialog */}
      <SuccessDialog
        open={success}
        visitData={createdVisit}
        onClose={() => {
          setSuccess(false);
          onClose?.();
        }}
      />

      {/* Animation styles */}
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </>
  );
}