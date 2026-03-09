// components/VisitDetails.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  Stack,
  IconButton,
  LinearProgress,
  Alert,
  Chip,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  Avatar,
  Fade,
  Zoom,
  Slide,
  Card,
  CardContent,
  InputAdornment,
  FormHelperText,
  BottomNavigation,
  BottomNavigationAction,
  Fab,
  Badge,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Radio,
  RadioGroup,
  FormLabel,
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
  Error as ErrorIcon,
  ArrowBack,
  Business,
  Notes,
  Person,
  Phone,
  Email,
  Save,
  MyLocation,
  GpsOff,
  Wifi,
  WifiOff,
  Dashboard,
  Schedule,
  History,
  CameraAlt,
  Delete,
  Refresh,
  Fullscreen,
  Close,
  Group,
  PersonAdd,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// ========== CONSTANTS ==========
const PRIMARY = '#4569ea';
const SECONDARY = '#1a237e';
const SUCCESS = '#4caf50';
const ERROR = '#f44336';
const WARNING = '#ff9800';

// ========== STYLED COMPONENTS ==========
const UploadArea = styled(Box)(({ theme }) => ({
  border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
  borderRadius: 16,
  padding: theme.spacing(3),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s',
  backgroundColor: alpha(theme.palette.primary.main, 0.02),
  minHeight: 200,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    transform: 'scale(1.02)'
  },
  '&.has-image': {
    borderStyle: 'solid',
    borderColor: SUCCESS,
    backgroundColor: alpha(SUCCESS, 0.05)
  }
}));

const LocationCard = styled(Paper)(({ theme, accuracy }) => {
  const getAccuracyColor = () => {
    if (accuracy > 50) return WARNING;
    if (accuracy > 20) return theme.palette.primary.main;
    return SUCCESS;
  };

  return {
    padding: theme.spacing(2),
    borderRadius: 16,
    background: `linear-gradient(135deg, ${alpha(getAccuracyColor(), 0.1)}, ${alpha(theme.palette.background.paper, 0.8)})`,
    backdropFilter: 'blur(10px)',
    border: `1px solid ${alpha(getAccuracyColor(), 0.3)}`,
    transition: 'all 0.3s ease'
  };
});

const FormSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: 16,
  backgroundColor: '#fff',
  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  }
}));

const ImagePreview = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: 250,
  borderRadius: 16,
  overflow: 'hidden',
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  '& .overlay': {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    padding: theme.spacing(2),
    opacity: 0,
    transition: 'opacity 0.2s',
    [theme.breakpoints.down('sm')]: {
      opacity: 1, // Always visible on mobile for better UX
    },
    '&:hover': {
      opacity: 1
    }
  }
}));

// ========== SUCCESS DIALOG ==========
const SuccessDialog = ({ open, visitData, onClose }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 4,
          background: `linear-gradient(135deg, ${alpha(SUCCESS, 0.05)}, ${alpha(theme.palette.primary.main, 0.05)})`
        }
      }}
      TransitionComponent={isMobile ? Slide : Zoom}
      transitionDuration={300}
    >
      <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
        <Zoom in={open}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: alpha(SUCCESS, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2
            }}
          >
            <CheckCircle sx={{ fontSize: 48, color: SUCCESS }} />
          </Box>
        </Zoom>
        <Typography variant={isMobile ? "h6" : "h5"} fontWeight={800}>
          Visit Created Successfully!
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Your visit has been recorded and synced
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
            {visitData?.photos?.[0]?.url && (
              <Box
                component="img"
                src={visitData.photos[0].url}
                alt="Visit"
                sx={{
                  width: '100%',
                  height: 200,
                  objectFit: 'cover'
                }}
              />
            )}
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                {visitData?.locationName}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">Latitude</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {visitData?.coordinates?.lat?.toFixed(6)}°
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">Longitude</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {visitData?.coordinates?.lng?.toFixed(6)}°
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {visitData?.distanceFromPreviousKm > 0 && (
                <Chip
                  icon={<Route />}
                  label={`${visitData.distanceFromPreviousKm.toFixed(2)} km from previous`}
                  size="small"
                  sx={{ mt: 2 }}
                />
              )}
            </CardContent>
          </Card>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2, flexDirection: isMobile ? 'column' : 'row' }}>
        <Button
          fullWidth={isMobile}
          variant="outlined"
          onClick={onClose}
          sx={{ 
            borderRadius: 2, 
            px: 4,
            borderColor: theme.palette.primary.main,
            color: theme.palette.primary.main
          }}
        >
          Close
        </Button>
        <Button
          fullWidth={isMobile}
          variant="contained"
          onClick={() => {
            onClose();
            navigate('/total-visits');
          }}
          sx={{ 
            borderRadius: 2, 
            px: 4, 
            bgcolor: theme.palette.primary.main,
            '&:hover': { bgcolor: SECONDARY }
          }}
        >
          View All Visits
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ========== MAIN COMPONENT ==========
export default function VisitDetails({ onClose, onSave }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  
  // Refs for camera input
  const cameraInputRef = useRef(null);
  const locationTimeoutRef = useRef(null);
  
  const { 
    createVisit, 
    getCurrentPosition, 
    getLocationSmart,
    requestLocationPermission,
    locationState,
    loading: authLoading,
    socket,
    user
  } = useAuth();
  
  // State
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    locationName: '',
    remarks: '',
    contactPerson: '',
    phone: '',
    email: ''
  });
  const [isLeadCreated, setIsLeadCreated] = useState('no'); // 'yes' or 'no'
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [createdVisit, setCreatedVisit] = useState(null);
  const [accuracyStatus, setAccuracyStatus] = useState('unknown');
  const [validationErrors, setValidationErrors] = useState({});
  const [bottomNav, setBottomNav] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState(false);
  const [locationAttempts, setLocationAttempts] = useState(0);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (locationTimeoutRef.current) {
        clearTimeout(locationTimeoutRef.current);
      }
    };
  }, []);

  // Get location with improved timeout handling
  const getCurrentLocation = useCallback(async (highAccuracy = true) => {
    setLocationLoading(true);
    setError(null);
    
    try {
      const permResult = await requestLocationPermission();
      if (!permResult.success) {
        setError(permResult.error || 'Location permission denied');
        setLocationLoading(false);
        return;
      }

      // Create a promise that rejects after timeout
      const locationPromise = getCurrentPosition({ 
        enableHighAccuracy: highAccuracy,
        timeout: 15000 // 15 seconds timeout
      });

      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        locationTimeoutRef.current = setTimeout(() => {
          reject({ code: 3, message: 'Location timeout' });
        }, 16000);
      });

      // Race between location and timeout
      const result = await Promise.race([locationPromise, timeoutPromise]);
      
      // Clear timeout if location succeeded
      if (locationTimeoutRef.current) {
        clearTimeout(locationTimeoutRef.current);
        locationTimeoutRef.current = null;
      }

      if (result.success) {
        setLocation(result);
        setLocationAttempts(0);
        
        if (socket?.connected && user?._id) {
          socket.emit('location:update', {
            userId: user._id,
            location: {
              lat: result.lat,
              lng: result.lng,
              accuracy: result.accuracy,
              timestamp: new Date().toISOString()
            },
            activity: 'creating_visit'
          });
        }
        setLocationLoading(false);
      } else {
        throw new Error(result.error || 'Failed to get location');
      }
    } catch (err) {
      console.error('Location error:', err);
      
      if (locationTimeoutRef.current) {
        clearTimeout(locationTimeoutRef.current);
        locationTimeoutRef.current = null;
      }

      // Handle timeout
      if (err.code === 3 || err.message?.includes('timeout')) {
        if (highAccuracy && locationAttempts < 2) {
          // Try with low accuracy
          setLocationAttempts(prev => prev + 1);
          setError('High accuracy timeout, trying low accuracy...');
          setTimeout(() => getCurrentLocation(false), 1000);
        } else if (locationAttempts < 3) {
          // Retry with current accuracy
          setLocationAttempts(prev => prev + 1);
          setError(`Location timeout (attempt ${locationAttempts + 1}/3). Retrying...`);
          setTimeout(() => getCurrentLocation(highAccuracy), 2000);
        } else {
          setError('Unable to get location after multiple attempts. Please try manual entry or check GPS.');
          setLocationLoading(false);
        }
      } else {
        setError(err.message || 'Failed to get location');
        setLocationLoading(false);
      }
    }
  }, [getCurrentPosition, requestLocationPermission, socket, user, locationAttempts]);

  // Initial location fetch
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Update accuracy status
  useEffect(() => {
    if (location?.accuracy) {
      if (location.accuracy <= 20) setAccuracyStatus('good');
      else if (location.accuracy <= 50) setAccuracyStatus('fair');
      else setAccuracyStatus('poor');
    }
  }, [location]);

  // Camera Handler - Direct camera capture only
  const handleCameraCapture = (event) => {
    const file = event.target.files[0];
    if (file) {
      processImageFile(file);
    }
    // Reset input value so same file can be selected again
    event.target.value = '';
  };

  const processImageFile = (file) => {
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size should be less than 10MB');
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please capture a valid image');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setImageFile(null);
    setPreview(null);
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  };

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleLeadCreatedChange = (event) => {
    setIsLeadCreated(event.target.value);
    // Clear contact fields when switching to 'no'
    if (event.target.value === 'no') {
      setFormData(prev => ({
        ...prev,
        contactPerson: '',
        phone: '',
        email: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!imageFile) {
      errors.photo = 'Please capture a photo';
    }

    if (!formData.locationName.trim()) {
      errors.locationName = 'Location name is required';
    }

    if (!location) {
      errors.location = 'Location coordinates are required';
    }

    // Only validate contact fields if lead is created (isLeadCreated === 'yes')
    if (isLeadCreated === 'yes') {
      if (!formData.contactPerson.trim()) {
        errors.contactPerson = 'Contact person is required when lead is created';
      }

      if (formData.phone && !/^[0-9+\-\s()]{10,15}$/.test(formData.phone)) {
        errors.phone = 'Please enter a valid phone number';
      }

      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setError('Please fill all required fields correctly');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get fresh location if accuracy is poor
      let currentLocation = location;
      if (accuracyStatus === 'poor') {
        const freshLocation = await getLocationSmart();
        if (freshLocation.success) {
          currentLocation = freshLocation;
        }
      }

      const formDataObj = new FormData();
      formDataObj.append('latitude', currentLocation.lat.toString());
      formDataObj.append('longitude', currentLocation.lng.toString());
      formDataObj.append('locationName', formData.locationName.trim());
      formDataObj.append('isLeadCreated', isLeadCreated);
      
      if (formData.remarks.trim()) {
        formDataObj.append('remarks', formData.remarks.trim());
      }
      
      // Only append contact fields if lead is created
      if (isLeadCreated === 'yes') {
        if (formData.contactPerson.trim()) {
          formDataObj.append('contactPerson', formData.contactPerson.trim());
        }
        
        if (formData.phone.trim()) {
          formDataObj.append('phone', formData.phone.trim());
        }
        
        if (formData.email.trim()) {
          formDataObj.append('email', formData.email.trim());
        }
      }
      
      formDataObj.append('photos', imageFile);

      const response = await createVisit(formDataObj, imageFile);

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
          remarks: '',
          contactPerson: '',
          phone: '',
          email: ''
        });
        setIsLeadCreated('no');
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
    setLocationAttempts(0);
    getCurrentLocation();
  };

  // Helper Functions
  const getAccuracyColor = () => {
    switch(accuracyStatus) {
      case 'good': return SUCCESS;
      case 'fair': return WARNING;
      case 'poor': return ERROR;
      default: return theme.palette.text.secondary;
    }
  };

  const getAccuracyIcon = () => {
    switch(accuracyStatus) {
      case 'good': return <GpsFixed sx={{ color: SUCCESS }} />;
      case 'fair': return <MyLocation sx={{ color: WARNING }} />;
      case 'poor': return <GpsOff sx={{ color: ERROR }} />;
      default: return <LocationOn sx={{ color: theme.palette.text.secondary }} />;
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#f8fafc',
      pb: isMobile ? 8 : 4
    }}>
      {/* Hidden Camera Input - Only Camera */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraCapture}
        style={{ display: 'none' }}
      />

      {/* Header - Fully Responsive */}
      <Paper
        sx={{
          p: isMobile ? 2 : 3,
          borderRadius: 0,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${SECONDARY} 100%)`,
          color: 'white',
          position: 'sticky',
          top: 0,
          ml : isMobile ? 2 : 3,
          width : isMobile ? "90%" : "1150px",
          zIndex: 100,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          mb: 3,
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
            <IconButton 
              onClick={() => onClose ? onClose() : navigate(-1)} 
              sx={{ color: 'white' }}
            >
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant={isMobile ? "h6" : "h5"} fontWeight={700}>
                Create New Visit
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </Typography>
            </Box>
          </Box>

          {/* Connection Status */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            px: 1.5,
            py: 0.5,
            bgcolor: 'rgba(255,255,255,0.1)',
            borderRadius: 2,
            width: isMobile ? '100%' : 'fit-content',
            justifyContent: isMobile ? 'center' : 'flex-start'
          }}>
            {socket?.connected ? (
              <>
                <Wifi sx={{ fontSize: 16 }} />
                <Typography variant="caption">Connected</Typography>
              </>
            ) : (
              <>
                <WifiOff sx={{ fontSize: 16 }} />
                <Typography variant="caption">Offline</Typography>
              </>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Main Content - Fully Responsive */}
      <Box sx={{ 
        px: isMobile ? 2 : 3,
        maxWidth: '1200px',
        mx: 'auto'
      }}>
        <Grid container spacing={isMobile ? 2 : 3}>
          {/* Left Column - Photo & Basic Info */}
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              {/* Camera Section - Direct camera capture */}
              <FormSection>
                <Typography variant="subtitle1" fontWeight={700} sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  color: theme.palette.primary.main,
                  mb: 2,
                  fontSize: isMobile ? '1rem' : '1.1rem'
                }}>
                  <CameraAlt /> Site Photo
                  <Chip 
                    label="Required" 
                    size="small" 
                    color={imageFile ? 'success' : 'error'}
                    sx={{ ml: 'auto', height: 24 }}
                  />
                </Typography>

                <AnimatePresence mode="wait">
                  {preview ? (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <ImagePreview>
                        <img 
                          src={preview} 
                          alt="Preview" 
                          onClick={() => setFullscreenImage(true)}
                        />
                        <Box className="overlay">
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<Fullscreen />}
                            onClick={() => setFullscreenImage(true)}
                            sx={{ 
                              bgcolor: 'rgba(255,255,255,0.2)',
                              backdropFilter: 'blur(5px)',
                              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                            }}
                          >
                            View
                          </Button>
                          <IconButton
                            onClick={handleRemovePhoto}
                            sx={{ 
                              bgcolor: 'rgba(255,255,255,0.2)',
                              backdropFilter: 'blur(5px)',
                              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </ImagePreview>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="upload"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <UploadArea 
                        onClick={() => cameraInputRef.current?.click()}
                        role="button"
                        tabIndex={0}
                      >
                        <CameraAlt sx={{ 
                          fontSize: isMobile ? 40 : 48, 
                          color: alpha(theme.palette.primary.main, 0.5), 
                          mb: 2 
                        }} />
                        <Typography 
                          variant={isMobile ? "body1" : "h6"} 
                          fontWeight={600} 
                          color={theme.palette.primary.main}
                        >
                          Tap to open camera
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                          Take a photo of the site
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Max size: 10MB
                        </Typography>
                        <Button
                          variant="contained"
                          size={isMobile ? "small" : "medium"}
                          startIcon={<PhotoCamera />}
                          onClick={(e) => {
                            e.stopPropagation();
                            cameraInputRef.current?.click();
                          }}
                          sx={{ 
                            mt: 2, 
                            borderRadius: 2,
                            bgcolor: theme.palette.primary.main,
                            '&:hover': { bgcolor: SECONDARY }
                          }}
                        >
                          Open Camera
                        </Button>
                      </UploadArea>
                    </motion.div>
                  )}
                </AnimatePresence>

                {validationErrors.photo && (
                  <FormHelperText error sx={{ mt: 1 }}>
                    {validationErrors.photo}
                  </FormHelperText>
                )}
              </FormSection>

              {/* Location Name */}
              <FormSection>
                <Typography variant="subtitle1" fontWeight={700} sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  color: theme.palette.primary.main,
                  mb: 2,
                  fontSize: isMobile ? '1rem' : '1.1rem'
                }}>
                  <Business /> Location Details
                </Typography>
                
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="Location/Business Name *"
                    placeholder="e.g., Client Office, Store Name"
                    value={formData.locationName}
                    onChange={handleChange('locationName')}
                    error={!!validationErrors.locationName}
                    helperText={validationErrors.locationName}
                    disabled={loading || authLoading}
                    size={isMobile ? "small" : "medium"}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOn sx={{ color: alpha(theme.palette.primary.main, 0.5) }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Stack>
              </FormSection>
            </Stack>
          </Grid>

          {/* Right Column - Contact & Location */}
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              {/* Lead Created Toggle */}
              <FormSection>
                <Typography variant="subtitle1" fontWeight={700} sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  color: theme.palette.primary.main,
                  mb: 2,
                  fontSize: isMobile ? '1rem' : '1.1rem'
                }}>
                  <PersonAdd /> Lead Created?
                </Typography>

                <FormControl component="fieldset" fullWidth>
                  <RadioGroup
                    row
                    value={isLeadCreated}
                    onChange={handleLeadCreatedChange}
                    sx={{
                      justifyContent: 'space-around',
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      borderRadius: 2,
                      p: 1,
                    }}
                  >
                    <FormControlLabel 
                      value="yes" 
                      control={<Radio sx={{ color: theme.palette.primary.main }} />} 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography>Yes</Typography>
                        </Box>
                      } 
                    />
                    <FormControlLabel 
                      value="no" 
                      control={<Radio sx={{ color: theme.palette.primary.main }} />} 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography>No</Typography>
                        </Box>
                      } 
                    />
                  </RadioGroup>
                </FormControl>
              </FormSection>

              {/* Contact Information - Only shown if lead is created */}
              {isLeadCreated === 'yes' && (
                <FormSection>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    color: theme.palette.primary.main,
                    mb: 2,
                    fontSize: isMobile ? '1rem' : '1.1rem'
                  }}>
                    <Person /> Contact Information
                    <Chip 
                      label="Lead Created" 
                      size="small" 
                      color="success"
                      sx={{ ml: 'auto', height: 24 }}
                    />
                  </Typography>

                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="Contact Person *"
                      placeholder="Enter contact name"
                      value={formData.contactPerson}
                      onChange={handleChange('contactPerson')}
                      error={!!validationErrors.contactPerson}
                      helperText={validationErrors.contactPerson}
                      disabled={loading || authLoading}
                      size={isMobile ? "small" : "medium"}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person sx={{ color: alpha(theme.palette.primary.main, 0.5) }} />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Phone Number"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={handleChange('phone')}
                      error={!!validationErrors.phone}
                      helperText={validationErrors.phone}
                      disabled={loading || authLoading}
                      size={isMobile ? "small" : "medium"}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone sx={{ color: alpha(theme.palette.primary.main, 0.5) }} />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Email Address"
                      placeholder="Enter email address"
                      type="email"
                      value={formData.email}
                      onChange={handleChange('email')}
                      error={!!validationErrors.email}
                      helperText={validationErrors.email}
                      disabled={loading || authLoading}
                      size={isMobile ? "small" : "medium"}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email sx={{ color: alpha(theme.palette.primary.main, 0.5) }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Stack>
                </FormSection>
              )}

              {/* Location Status */}
              <FormSection>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  mb: 2,
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? 1 : 0
                }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    color: theme.palette.primary.main,
                    fontSize: isMobile ? '1rem' : '1.1rem'
                  }}>
                    <GpsFixed /> Location Coordinates
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<Refresh />}
                    onClick={handleRetryLocation}
                    disabled={locationLoading}
                    sx={{ 
                      color: theme.palette.primary.main,
                      width: isMobile ? '100%' : 'auto'
                    }}
                  >
                    Refresh
                  </Button>
                </Box>

                {locationLoading ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress size={isMobile ? 32 : 40} sx={{ color: theme.palette.primary.main, mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      {locationAttempts > 0 ? `Attempt ${locationAttempts}/3...` : 'Getting your location...'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Please ensure GPS is enabled
                    </Typography>
                    {locationAttempts > 0 && (
                      <LinearProgress 
                        sx={{ mt: 2, borderRadius: 2 }} 
                        variant="determinate" 
                        value={locationAttempts * 33.33} 
                      />
                    )}
                  </Box>
                ) : location ? (
                  <LocationCard accuracy={location.accuracy}>
                    <Stack spacing={2}>
                      {/* Accuracy Indicator */}
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: isMobile ? 1 : 0
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getAccuracyIcon()}
                          <Typography variant="body2">
                            Accuracy: ±{location.accuracy?.toFixed(0)}m
                          </Typography>
                        </Box>
                        <Chip
                          label={accuracyStatus.toUpperCase()}
                          size="small"
                          sx={{
                            bgcolor: alpha(getAccuracyColor(), 0.1),
                            color: getAccuracyColor(),
                            fontWeight: 600,
                            height: 24,
                            width: isMobile ? '100%' : 'auto'
                          }}
                        />
                      </Box>

                      {/* Coordinates */}
                      <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary" gutterBottom>
                          Current Position
                        </Typography>
                        <Typography 
                          variant="body2" 
                          fontFamily="monospace" 
                          fontWeight={600}
                          sx={{ 
                            fontSize: isMobile ? '0.8rem' : '0.9rem',
                            wordBreak: 'break-all'
                          }}
                        >
                          {location.lat.toFixed(6)}° N, {location.lng.toFixed(6)}° E
                        </Typography>
                      </Box>

                      <Grid container spacing={isMobile ? 1 : 2}>
                        <Grid item xs={6}>
                          <Paper sx={{ p: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                            <Typography variant="caption" color="text.secondary">Latitude</Typography>
                            <Typography variant="body2" fontWeight={600} sx={{ fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                              {location.lat.toFixed(6)}°
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6}>
                          <Paper sx={{ p: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                            <Typography variant="caption" color="text.secondary">Longitude</Typography>
                            <Typography variant="body2" fontWeight={600} sx={{ fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                              {location.lng.toFixed(6)}°
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Stack>
                  </LocationCard>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <GpsOff sx={{ fontSize: 48, color: ERROR, mb: 2 }} />
                    <Typography color="error" gutterBottom>
                      {error || 'Failed to get location'}
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={handleRetryLocation}
                      fullWidth={isMobile}
                      sx={{ 
                        mt: 2, 
                        borderRadius: 2,
                        bgcolor: theme.palette.primary.main,
                        '&:hover': { bgcolor: SECONDARY }
                      }}
                    >
                      Retry Location
                    </Button>
                  </Box>
                )}
                {validationErrors.location && (
                  <FormHelperText error sx={{ mt: 1 }}>
                    {validationErrors.location}
                  </FormHelperText>
                )}
              </FormSection>

              {/* Remarks */}
              <FormSection>
                <Typography variant="subtitle1" fontWeight={700} sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  color: theme.palette.primary.main,
                  mb: 2,
                  fontSize: isMobile ? '1rem' : '1.1rem'
                }}>
                  <Notes /> Visit Notes
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={isMobile ? 3 : 4}
                  placeholder="Enter any additional notes about the visit..."
                  value={formData.remarks}
                  onChange={handleChange('remarks')}
                  disabled={loading || authLoading}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'action.hover'
                    }
                  }}
                />
              </FormSection>
            </Stack>
          </Grid>
        </Grid>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Alert 
                severity={error.includes('timeout') ? 'warning' : 'error'} 
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons - Fully Responsive */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: 2, 
            mt: 4,
            mb: isMobile ? 2 : 0,
            flexDirection: isMobile ? 'column' : 'row'
          }}
        >
          <Button
            fullWidth={isMobile}
            variant="outlined"
            onClick={() => onClose ? onClose() : navigate(-1)}
            disabled={loading}
            sx={{ 
              px: 4, 
              py: 1.5, 
              borderRadius: 2,
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) },
              order: isMobile ? 2 : 1
            }}
          >
            Cancel
          </Button>
          <Button
            fullWidth={isMobile}
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
            onClick={handleSubmit}
            disabled={loading || authLoading || !location || !imageFile || !formData.locationName}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              bgcolor: theme.palette.primary.main,
              '&:hover': { bgcolor: SECONDARY },
              '&.Mui-disabled': {
                bgcolor: alpha(theme.palette.primary.main, 0.3)
              },
              order: isMobile ? 1 : 2
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

      {/* Fullscreen Image Dialog */}
      <Dialog
        open={fullscreenImage}
        onClose={() => setFullscreenImage(false)}
        maxWidth="lg"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            bgcolor: 'black',
            borderRadius: isMobile ? 0 : 2
          }
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative', height: isMobile ? '100vh' : 'auto' }}>
          <IconButton
            onClick={() => setFullscreenImage(false)}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
              zIndex: 1
            }}
          >
            <Close />
          </IconButton>
          <Box
            component="img"
            src={preview}
            alt="Full preview"
            sx={{
              width: '100%',
              height: isMobile ? '100%' : 'auto',
              objectFit: 'contain'
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <Paper
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            borderRadius: 0,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
          elevation={3}
        >
          <BottomNavigation
            showLabels
            value={bottomNav}
            onChange={(e, newValue) => setBottomNav(newValue)}
            sx={{
              height: 64,
              '& .MuiBottomNavigationAction-root': {
                color: theme.palette.text.secondary,
                '&.Mui-selected': { color: theme.palette.primary.main },
              },
            }}
          >
            <BottomNavigationAction
              label="Dashboard"
              icon={<Dashboard />}
              onClick={() => navigate('/dashboard')}
            />
            <BottomNavigationAction
              label="Visits"
              icon={<History />}
              onClick={() => navigate('/total-visits')}
            />
            <BottomNavigationAction
              label="New Visit"
              icon={<AddAPhoto />}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            />
          </BottomNavigation>
        </Paper>
      )}

      {/* Mobile FAB for quick actions */}
      {isMobile && (
        <Zoom in={true}>
          <Fab
            color="primary"
            aria-label="location"
            onClick={handleRetryLocation}
            disabled={locationLoading}
            sx={{
              position: 'fixed',
              bottom: 80,
              right: 16,
              zIndex: 1000,
              bgcolor: theme.palette.primary.main,
              '&:hover': { bgcolor: SECONDARY },
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
            }}
          >
            <Badge
              variant="dot"
              color={location ? 'success' : 'error'}
              overlap="circular"
            >
              <MyLocation />
            </Badge>
          </Fab>
        </Zoom>
      )}

      {/* Global Styles */}
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.1); }
            100% { opacity: 1; transform: scale(1); }
          }
        `}
      </style>
    </Box>
  );
}