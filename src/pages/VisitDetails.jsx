// pages/VisitDetails.jsx
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
  FormControlLabel,
  Switch,
  Collapse,
  Tooltip,
} from "@mui/material";
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
  PersonAdd,
  PersonOutline,
  Info,
} from "@mui/icons-material";
import { styled, alpha } from "@mui/material/styles";
import { format } from "date-fns";
import { useAuth } from "../contexts/AuthContext";
import { useVisit } from "../contexts/VisitContext";
import { useLocation } from "../service/location.service";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// ========== CONSTANTS ==========
const PRIMARY = "#4569ea";
const SECONDARY = "#1a237e";
const SUCCESS = "#4caf50";
const ERROR = "#f44336";
const WARNING = "#ff9800";

// ========== STYLED COMPONENTS ==========
const UploadArea = styled(Box)(({ theme }) => ({
  border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
  borderRadius: 16,
  padding: theme.spacing(3),
  textAlign: "center",
  cursor: "pointer",
  transition: "all 0.2s",
  backgroundColor: alpha(theme.palette.primary.main, 0.02),
  minHeight: 200,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  "&:hover": {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    transform: "scale(1.02)",
  },
  "&.has-image": {
    borderStyle: "solid",
    borderColor: SUCCESS,
    backgroundColor: alpha(SUCCESS, 0.05),
  },
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
    backdropFilter: "blur(10px)",
    border: `1px solid ${alpha(getAccuracyColor(), 0.3)}`,
    transition: "all 0.3s ease",
  };
});

const FormSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: 16,
  backgroundColor: "#fff",
  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));

const ImagePreview = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "100%",
  height: 250,
  borderRadius: 16,
  overflow: "hidden",
  "& img": {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  "& .overlay": {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    padding: theme.spacing(2),
    opacity: 0,
    transition: "opacity 0.2s",
    [theme.breakpoints.down("sm")]: {
      opacity: 1,
    },
    "&:hover": {
      opacity: 1,
    },
  },
}));

// ========== SUCCESS DIALOG ==========
const SuccessDialog = ({ open, visitData, onClose }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
          background: `linear-gradient(135deg, ${alpha(SUCCESS, 0.05)}, ${alpha(theme.palette.primary.main, 0.05)})`,
        },
      }}
      TransitionComponent={isMobile ? Slide : Zoom}
      transitionDuration={300}
    >
      <DialogTitle sx={{ textAlign: "center", pt: 4 }}>
        <Zoom in={open}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              bgcolor: alpha(SUCCESS, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
            }}
          >
            <CheckCircle sx={{ fontSize: 48, color: SUCCESS }} />
          </Box>
        </Zoom>
        <Typography variant={isMobile ? "h6" : "h5"} fontWeight={800}>
          {visitData?.isLeadCreate
            ? "Visit & Lead Created Successfully!"
            : "Visit Created Successfully!"}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {visitData?.isLeadCreate
            ? "Your visit has been recorded and a new lead has been created"
            : "Your visit has been recorded and synced"}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
            {visitData?.photos?.[0]?.url && (
              <Box
                component="img"
                src={visitData.photos[0].url}
                alt="Visit"
                sx={{
                  width: "100%",
                  height: 200,
                  objectFit: "cover",
                }}
              />
            )}
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                {visitData?.locationName}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {visitData?.address || "Address not available"}
              </Typography>

              {visitData?.isLeadCreate && (
                <Chip
                  icon={<PersonAdd />}
                  label="Lead Created"
                  color="success"
                  size="small"
                  sx={{ mb: 2 }}
                />
              )}

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper
                    sx={{
                      p: 1.5,
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Latitude
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {visitData?.coordinates?.lat?.toFixed(6)}°
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper
                    sx={{
                      p: 1.5,
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Longitude
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {visitData?.coordinates?.lng?.toFixed(6)}°
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          p: 3,
          justifyContent: "center",
          gap: 2,
          flexDirection: isMobile ? "column" : "row",
        }}
      >
        <Button
          fullWidth={isMobile}
          variant="outlined"
          onClick={onClose}
          sx={{
            borderRadius: 2,
            px: 4,
            borderColor: theme.palette.primary.main,
            color: theme.palette.primary.main,
          }}
        >
          Close
        </Button>
        <Button
          fullWidth={isMobile}
          variant="contained"
          onClick={() => {
            onClose();
            navigate("/total-visits");
          }}
          sx={{
            borderRadius: 2,
            px: 4,
            bgcolor: theme.palette.primary.main,
            "&:hover": { bgcolor: SECONDARY },
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
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  // Refs
  const cameraInputRef = useRef(null);

  // Contexts
  const { user } = useAuth();
  const { createVisit, visitLoading } = useVisit();
  
  // Custom location hook
  const {
    location,
    loading: locationLoading,
    error: locationError,
    attempts: locationAttempts,
    getLocation,
    getLocationWithRetry,
    accuracy,
  } = useLocation({ autoRequest: true });

  // State
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLeadCreate, setIsLeadCreate] = useState(false);
  const [formData, setFormData] = useState({
    locationName: "",
    address: "",
    remarks: "",
    contactPerson: "",
    phone: "",
    email: "",
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [createdVisit, setCreatedVisit] = useState(null);
  const [bottomNav, setBottomNav] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState(false);

  // Memoized accuracy status
  const accuracyStatus = useMemo(() => {
    if (!accuracy) return "unknown";
    if (accuracy <= 20) return "good";
    if (accuracy <= 50) return "fair";
    return "poor";
  }, [accuracy]);

  // Camera Handler
  const handleCameraCapture = (event) => {
    const file = event.target.files[0];
    if (file) {
      processImageFile(file);
    }
    event.target.value = "";
  };

  const processImageFile = (file) => {
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setValidationErrors(prev => ({ ...prev, photo: "Image size should be less than 10MB" }));
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setValidationErrors(prev => ({ ...prev, photo: "Please capture a valid image" }));
      return;
    }

    setImageFile(file);
    setValidationErrors(prev => ({ ...prev, photo: null }));
    
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
      cameraInputRef.current.value = "";
    }
  };

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = useCallback(() => {
    const errors = {};

    if (!imageFile) {
      errors.photo = "Please capture a photo";
    }

    if (!formData.locationName.trim()) {
      errors.locationName = "Location name is required";
    }

    if (!location) {
      errors.location = "Location coordinates are required";
    }

    if (isLeadCreate) {
      if (!formData.contactPerson.trim()) {
        errors.contactPerson = "Contact person is required for lead creation";
      }

      if (formData.phone && !/^[0-9+\-\s()]{10,15}$/.test(formData.phone)) {
        errors.phone = "Please enter a valid phone number";
      }

      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = "Please enter a valid email address";
      }

      if (!formData.phone && !formData.email && !formData.contactPerson) {
        errors.contact = "At least one contact method is required";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [imageFile, formData, location, isLeadCreate]);

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // Get fresh location if needed
      let currentLocation = location;
      if (accuracyStatus === "poor" || !location) {
        const freshLocation = await getLocationWithRetry();
        if (freshLocation.success) {
          currentLocation = freshLocation.data;
        }
      }

      if (!currentLocation) {
        setValidationErrors(prev => ({ 
          ...prev, 
          location: "Unable to get location. Please try again." 
        }));
        return;
      }

      const visitData = {
        latitude: currentLocation.lat,
        longitude: currentLocation.lng,
        locationName: formData.locationName.trim(),
        address: formData.address.trim() || undefined,
        remarks: formData.remarks.trim() || undefined,
        isLeadCreate: isLeadCreate.toString(),
      };

      // Add lead data if creating lead
      if (isLeadCreate) {
        if (formData.contactPerson.trim()) {
          visitData.contactPerson = formData.contactPerson.trim();
        }
        if (formData.phone.trim()) {
          visitData.phone = formData.phone.trim();
        }
        if (formData.email.trim()) {
          visitData.email = formData.email.trim();
        }
      }

      const response = await createVisit(visitData, imageFile);

      if (response.success) {
        setCreatedVisit({
          ...response.data,
          isLeadCreate,
          coordinates: {
            lat: currentLocation.lat,
            lng: currentLocation.lng,
          },
        });
        setSuccess(true);

        if (onSave) {
          onSave(response.data);
        }

        // Reset form
        setImageFile(null);
        setPreview(null);
        setIsLeadCreate(false);
        setFormData({
          locationName: "",
          address: "",
          remarks: "",
          contactPerson: "",
          phone: "",
          email: "",
        });
      } else {
        setValidationErrors(prev => ({ ...prev, submit: response.error }));
      }
    } catch (err) {
      console.error("Visit creation error:", err);
      setValidationErrors(prev => ({ ...prev, submit: err.message }));
    }
  };

  const handleRetryLocation = () => {
    getLocation();
  };

  const handleToggleLeadCreate = () => {
    setIsLeadCreate((prev) => !prev);
    // Clear lead-specific validation errors when toggling off
    if (!isLeadCreate) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.contactPerson;
        delete newErrors.phone;
        delete newErrors.email;
        delete newErrors.contact;
        return newErrors;
      });
    }
  };

  // Helper Functions
  const getAccuracyColor = () => {
    switch (accuracyStatus) {
      case "good": return SUCCESS;
      case "fair": return WARNING;
      case "poor": return ERROR;
      default: return theme.palette.text.secondary;
    }
  };

  const getAccuracyIcon = () => {
    switch (accuracyStatus) {
      case "good": return <GpsFixed sx={{ color: SUCCESS }} />;
      case "fair": return <MyLocation sx={{ color: WARNING }} />;
      case "poor": return <GpsOff sx={{ color: ERROR }} />;
      default: return <LocationOn sx={{ color: theme.palette.text.secondary }} />;
    }
  };

  const isFormValid = useMemo(() => {
    return (
      imageFile &&
      formData.locationName.trim() &&
      location &&
      (!isLeadCreate || (isLeadCreate && formData.contactPerson.trim()))
    );
  }, [imageFile, formData.locationName, location, isLeadCreate, formData.contactPerson]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f8fafc",
        pb: isMobile ? 8 : 4,
      }}
    >
      {/* Hidden Camera Input */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraCapture}
        style={{ display: "none" }}
      />

      {/* Header */}
      <Paper
        sx={{
          p: isMobile ? 2 : 3,
          borderRadius: 0,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${SECONDARY} 100%)`,
          color: "white",
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          mb: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? 1 : 0,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton
              onClick={() => (onClose ? onClose() : navigate(-1))}
              sx={{ color: "white" }}
            >
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant={isMobile ? "h6" : "h5"} fontWeight={700}>
                Create New Visit
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {format(new Date(), "EEEE, MMMM d, yyyy")}
              </Typography>
            </Box>
          </Box>

          {/* Location Status Badge */}
          {location && (
            <Tooltip title={`Accuracy: ±${accuracy?.toFixed(0)}m`}>
              <Chip
                icon={getAccuracyIcon()}
                label={accuracyStatus.toUpperCase()}
                size="small"
                sx={{
                  bgcolor: alpha(getAccuracyColor(), 0.2),
                  color: "white",
                  fontWeight: 600,
                  "& .MuiChip-icon": { color: "white" },
                }}
              />
            </Tooltip>
          )}
        </Box>
      </Paper>

      {/* Main Content */}
      <Box
        sx={{
          px: isMobile ? 2 : 3,
          maxWidth: "1200px",
          mx: "auto",
        }}
      >
        <Grid container spacing={isMobile ? 2 : 3}>
          {/* Left Column - Photo & Basic Info */}
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              {/* Camera Section */}
              <FormSection>
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    color: theme.palette.primary.main,
                    mb: 2,
                  }}
                >
                  <CameraAlt /> Site Photo
                  <Chip
                    label="Required"
                    size="small"
                    color={imageFile ? "success" : "error"}
                    sx={{ ml: "auto", height: 24 }}
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
                              bgcolor: "rgba(255,255,255,0.2)",
                              backdropFilter: "blur(5px)",
                              "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                            }}
                          >
                            View
                          </Button>
                          <IconButton
                            onClick={handleRemovePhoto}
                            sx={{
                              bgcolor: "rgba(255,255,255,0.2)",
                              backdropFilter: "blur(5px)",
                              "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
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
                        <CameraAlt
                          sx={{
                            fontSize: isMobile ? 40 : 48,
                            color: alpha(theme.palette.primary.main, 0.5),
                            mb: 2,
                          }}
                        />
                        <Typography
                          variant={isMobile ? "body1" : "h6"}
                          fontWeight={600}
                          color={theme.palette.primary.main}
                        >
                          Tap to open camera
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          sx={{ mt: 1 }}
                        >
                          Take a photo of the site
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
                            "&:hover": { bgcolor: SECONDARY },
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
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    color: theme.palette.primary.main,
                    mb: 2,
                  }}
                >
                  <Business /> Location Details
                </Typography>

                <TextField
                  fullWidth
                  label="Location/Business Name *"
                  placeholder="e.g., Client Office, Store Name"
                  value={formData.locationName}
                  onChange={handleChange("locationName")}
                  error={!!validationErrors.locationName}
                  helperText={validationErrors.locationName}
                  size={isMobile ? "small" : "medium"}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn sx={{ color: alpha(theme.palette.primary.main, 0.5) }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </FormSection>
            </Stack>
          </Grid>

          {/* Right Column - Contact & Location */}
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              {/* Lead Creation Toggle */}
              <FormSection>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexDirection: isMobile ? "column" : "row",
                    gap: isMobile ? 1 : 0,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PersonAdd
                      sx={{
                        color: isLeadCreate ? SUCCESS : theme.palette.text.secondary,
                      }}
                    />
                    <Typography variant="subtitle1" fontWeight={700}>
                      Create Lead
                    </Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isLeadCreate}
                        onChange={handleToggleLeadCreate}
                        color="success"
                        size={isMobile ? "medium" : "small"}
                      />
                    }
                    label={isLeadCreate ? "Yes" : "No"}
                    labelPlacement="start"
                    sx={{
                      m: 0,
                      "& .MuiFormControlLabel-label": {
                        fontWeight: 600,
                        color: isLeadCreate ? SUCCESS : theme.palette.text.secondary,
                      },
                    }}
                  />
                </Box>
              </FormSection>

              {/* Contact Information */}
              <Collapse in={isLeadCreate}>
                <FormSection>
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      color: SUCCESS,
                      mb: 2,
                    }}
                  >
                    <PersonAdd /> Lead Information
                    <Chip
                      label="Required"
                      size="small"
                      color="success"
                      sx={{ ml: "auto", height: 24 }}
                    />
                  </Typography>

                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="Contact Person *"
                      placeholder="Enter contact name"
                      value={formData.contactPerson}
                      onChange={handleChange("contactPerson")}
                      error={!!validationErrors.contactPerson}
                      helperText={validationErrors.contactPerson}
                      size={isMobile ? "small" : "medium"}
                      required={isLeadCreate}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person sx={{ color: alpha(SUCCESS, 0.5) }} />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Phone Number"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={handleChange("phone")}
                      error={!!validationErrors.phone}
                      helperText={validationErrors.phone}
                      size={isMobile ? "small" : "medium"}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone sx={{ color: alpha(SUCCESS, 0.5) }} />
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
                      onChange={handleChange("email")}
                      error={!!validationErrors.email}
                      helperText={validationErrors.email}
                      size={isMobile ? "small" : "medium"}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email sx={{ color: alpha(SUCCESS, 0.5) }} />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Address"
                      placeholder="Full address"
                      value={formData.address}
                      onChange={handleChange("address")}
                      multiline
                      rows={isMobile ? 2 : 2}
                      size={isMobile ? "small" : "medium"}
                    />

                    {validationErrors.contact && (
                      <Alert severity="warning" sx={{ borderRadius: 2 }}>
                        {validationErrors.contact}
                      </Alert>
                    )}
                  </Stack>
                </FormSection>
              </Collapse>

              {/* Location Status */}
              <FormSection>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2,
                    flexDirection: isMobile ? "column" : "row",
                    gap: isMobile ? 1 : 0,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      color: theme.palette.primary.main,
                    }}
                  >
                    <GpsFixed /> Location Coordinates
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<Refresh />}
                    onClick={handleRetryLocation}
                    disabled={locationLoading}
                    sx={{
                      color: theme.palette.primary.main,
                      width: isMobile ? "100%" : "auto",
                    }}
                  >
                    Refresh
                  </Button>
                </Box>

                {locationLoading ? (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <CircularProgress
                      size={isMobile ? 32 : 40}
                      sx={{ color: theme.palette.primary.main, mb: 2 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {locationAttempts > 0
                        ? `Attempt ${locationAttempts}/3...`
                        : "Getting your location..."}
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
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexDirection: isMobile ? "column" : "row",
                          gap: isMobile ? 1 : 0,
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          {getAccuracyIcon()}
                          <Typography variant="body2">
                            Accuracy: ±{accuracy?.toFixed(0)}m
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
                            width: isMobile ? "100%" : "auto",
                          }}
                        />
                      </Box>

                      <Box sx={{ p: 2, bgcolor: "action.hover", borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary" gutterBottom>
                          Current Position
                        </Typography>
                        <Typography
                          variant="body2"
                          fontFamily="monospace"
                          fontWeight={600}
                          sx={{
                            fontSize: isMobile ? "0.8rem" : "0.9rem",
                            wordBreak: "break-all",
                          }}
                        >
                          {location.lat.toFixed(6)}° N, {location.lng.toFixed(6)}° E
                        </Typography>
                      </Box>

                      <Grid container spacing={isMobile ? 1 : 2}>
                        <Grid item xs={6}>
                          <Paper
                            sx={{
                              p: 1.5,
                              bgcolor: alpha(theme.palette.primary.main, 0.05),
                              borderRadius: 2,
                            }}
                          >
                            <Typography variant="caption" color="text.secondary">
                              Latitude
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              sx={{ fontSize: isMobile ? "0.8rem" : "0.9rem" }}
                            >
                              {location.lat.toFixed(6)}°
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6}>
                          <Paper
                            sx={{
                              p: 1.5,
                              bgcolor: alpha(theme.palette.primary.main, 0.05),
                              borderRadius: 2,
                            }}
                          >
                            <Typography variant="caption" color="text.secondary">
                              Longitude
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              sx={{ fontSize: isMobile ? "0.8rem" : "0.9rem" }}
                            >
                              {location.lng.toFixed(6)}°
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Stack>
                  </LocationCard>
                ) : (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <GpsOff sx={{ fontSize: 48, color: ERROR, mb: 2 }} />
                    <Typography color="error" gutterBottom>
                      {locationError || "Failed to get location"}
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={handleRetryLocation}
                      fullWidth={isMobile}
                      sx={{
                        mt: 2,
                        borderRadius: 2,
                        bgcolor: theme.palette.primary.main,
                        "&:hover": { bgcolor: SECONDARY },
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
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    color: theme.palette.primary.main,
                    mb: 2,
                  }}
                >
                  <Notes /> Visit Notes
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={isMobile ? 3 : 4}
                  placeholder="Enter any additional notes about the visit..."
                  value={formData.remarks}
                  onChange={handleChange("remarks")}
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      bgcolor: "action.hover",
                    },
                  }}
                />
              </FormSection>
            </Stack>
          </Grid>
        </Grid>

        {/* Error Alert */}
        <AnimatePresence>
          {validationErrors.submit && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Alert
                severity="error"
                sx={{ mt: 3, borderRadius: 2 }}
                onClose={() => setValidationErrors(prev => ({ ...prev, submit: null }))}
              >
                {validationErrors.submit}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary Card */}
        <Fade in={isLeadCreate}>
          <Paper
            sx={{
              mt: 3,
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(SUCCESS, 0.05),
              border: `1px solid ${alpha(SUCCESS, 0.2)}`,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Info color="info" sx={{ fontSize: 20 }} />
              <Typography variant="subtitle2" fontWeight={600}>
                Summary:
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              • A new visit will be created at{" "}
              <strong>{formData.locationName || "this location"}</strong>
            </Typography>
            {isLeadCreate && (
              <Typography
                variant="body2"
                color="success.main"
                fontWeight={500}
                sx={{ mt: 0.5 }}
              >
                • A new lead will be created for{" "}
                <strong>{formData.contactPerson || "the contact person"}</strong>
              </Typography>
            )}
          </Paper>
        </Fade>

        {/* Action Buttons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
            mt: 4,
            mb: isMobile ? 2 : 0,
            flexDirection: isMobile ? "column" : "row",
          }}
        >
          <Button
            fullWidth={isMobile}
            variant="outlined"
            onClick={() => (onClose ? onClose() : navigate(-1))}
            disabled={visitLoading}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.05) },
              order: isMobile ? 2 : 1,
            }}
          >
            Cancel
          </Button>
          <Button
            fullWidth={isMobile}
            variant="contained"
            startIcon={
              visitLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <Save />
              )
            }
            onClick={handleSubmit}
            disabled={!isFormValid || visitLoading || locationLoading}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              bgcolor: isLeadCreate ? SUCCESS : theme.palette.primary.main,
              "&:hover": {
                bgcolor: isLeadCreate ? "#3d8b40" : SECONDARY,
              },
              "&.Mui-disabled": {
                bgcolor: alpha(isLeadCreate ? SUCCESS : theme.palette.primary.main, 0.3),
              },
              order: isMobile ? 1 : 2,
            }}
          >
            {visitLoading
              ? "Creating..."
              : isLeadCreate
                ? "Create Visit & Lead"
                : "Create Visit"}
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
            bgcolor: "black",
            borderRadius: isMobile ? 0 : 2,
          },
        }}
      >
        <DialogContent sx={{ p: 0, position: "relative", height: isMobile ? "100vh" : "auto" }}>
          <IconButton
            onClick={() => setFullscreenImage(false)}
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              bgcolor: "rgba(255,255,255,0.2)",
              color: "white",
              "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
              zIndex: 1,
            }}
          >
            <Close />
          </IconButton>
          <Box
            component="img"
            src={preview}
            alt="Full preview"
            sx={{
              width: "100%",
              height: isMobile ? "100%" : "auto",
              objectFit: "contain",
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <Paper
          sx={{
            position: "fixed",
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
              "& .MuiBottomNavigationAction-root": {
                color: theme.palette.text.secondary,
                "&.Mui-selected": { color: theme.palette.primary.main },
              },
            }}
          >
            <BottomNavigationAction
              label="Dashboard"
              icon={<Dashboard />}
              onClick={() => navigate("/dashboard")}
            />
            <BottomNavigationAction
              label="Visits"
              icon={<History />}
              onClick={() => navigate("/total-visits")}
            />
            <BottomNavigationAction
              label="New Visit"
              icon={<AddAPhoto />}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            />
          </BottomNavigation>
        </Paper>
      )}

      {/* Mobile FAB */}
      {isMobile && (
        <Zoom in={true}>
          <Fab
            color="primary"
            aria-label="location"
            onClick={handleRetryLocation}
            disabled={locationLoading}
            sx={{
              position: "fixed",
              bottom: 80,
              right: 16,
              zIndex: 1000,
              bgcolor: theme.palette.primary.main,
              "&:hover": { bgcolor: SECONDARY },
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
            }}
          >
            <Badge
              variant="dot"
              color={location ? "success" : "error"}
              overlap="circular"
            >
              <MyLocation />
            </Badge>
          </Fab>
        </Zoom>
      )}
    </Box>
  );
}