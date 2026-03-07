// components/SalesDailySummary.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  Tooltip,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Zoom,
  Fade,
  Collapse,
} from "@mui/material";
import {
  Login as LoginIcon,
  Logout as LogoutIcon,
  AddLocationAlt as AddLocationAltIcon,
  ArrowUpward as ArrowUpwardIcon,
  Verified as VerifiedIcon,
  LocationOn as LocationOnIcon,
  Route as RouteIcon,
  Visibility as VisibilityIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon,
  PhotoCamera as PhotoCameraIcon,
  Menu as MenuIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  GpsFixed as GpsFixedIcon,
  GpsOff as GpsOffIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  History as HistoryIcon,
  Map as MapIcon,
  Close as CloseIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  People as PeopleIcon,
  RadioButtonChecked as RadioButtonCheckedIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  FiberManualRecord as FiberManualRecordIcon,
  AdminPanelSettings as AdminIcon,
  SupervisorAccount as ManagerIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { format, isToday, isYesterday } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

// ========== ANIMATION VARIANTS ==========
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const slideInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

// ========== ROLE CONFIGURATION ==========
const ROLE_CONFIG = {
  Head_office: {
    label: "Head Office",
    icon: <AdminIcon />,
    color: "#4569ea",
    actions: ["view", "manage", "approve"],
  },
  ZSM: {
    label: "Zone Manager",
    icon: <ManagerIcon />,
    color: "#4caf50",
    actions: ["view", "manage"],
  },
  ASM: {
    label: "Area Manager",
    icon: <ManagerIcon />,
    color: "#ff9800",
    actions: ["view", "manage"],
  },
  TEAM: {
    label: "Team Member",
    icon: <PersonIcon />,
    color: "#2196f3",
    actions: ["view", "punch", "visit"],
  },
};

// ========== STYLED COMPONENTS ==========
const ModernStatsCard = ({
  icon: Icon,
  title,
  value,
  subValue,
  color = "primary",
  trend,
  onClick,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Paper
        onClick={onClick}
        elevation={0}
        sx={{
          p: isMobile ? 1.5 : 2.5,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.1)} 0%, ${alpha(theme.palette[color].main, 0.05)} 100%)`,
          backdropFilter: "blur(10px)",
          border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`,
          cursor: onClick ? "pointer" : "default",
          transition: "all 0.3s ease",
          height: isMobile ? "120px" : "140px",
          position: "relative",
          ml: isMobile ? 2 : 3,
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${theme.palette[color].main}, ${alpha(theme.palette[color].main, 0.5)})`,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontSize: isMobile ? "0.6rem" : "0.75rem",
              }}
            >
              {title}
            </Typography>
            <Typography
              variant={isMobile ? "h6" : "h5"}
              sx={{
                fontWeight: 800,
                mt: 0.5,
                fontSize: isMobile ? "1rem" : "1.4rem",
                background: `linear-gradient(135deg, ${theme.palette[color].main}, ${alpha(theme.palette[color].main, 0.8)})`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              {value}
            </Typography>
          </Box>
          <Avatar
            sx={{
              bgcolor: alpha(theme.palette[color].main, 0.2),
              color: theme.palette[color].main,
              width: isMobile ? 26 : 40,
              height: isMobile ? 26 : 40,
            }}
          >
            <Icon sx={{ fontSize: isMobile ? 14 : 18 }} />
          </Avatar>
        </Box>

        {subValue && (
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              mt: 1,
              display: "block",
              fontSize: isMobile ? "0.6rem" : "0.75rem",
            }}
          >
            {subValue}
          </Typography>
        )}

        {trend && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}>
            <ArrowUpwardIcon
              sx={{ color: "success.main", fontSize: isMobile ? 12 : 16 }}
            />
            <Typography
              variant="caption"
              sx={{
                color: "success.main",
                fontWeight: 600,
                fontSize: isMobile ? "0.6rem" : "0.75rem",
              }}
            >
              {trend}
            </Typography>
          </Box>
        )}
      </Paper>
    </motion.div>
  );
};

// Modern Visit Card
const ModernVisitCard = ({ visit, onViewLiveRoute, index, userRole }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [imageError, setImageError] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return theme.palette.success;
      case "inprogress":
        return theme.palette.warning;
      case "cancelled":
        return theme.palette.error;
      default:
        return theme.palette.info;
    }
  };

  const formatVisitTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isToday(date)) return `Today, ${format(date, "h:mm a")}`;
    if (isYesterday(date)) return `Yesterday, ${format(date, "h:mm a")}`;
    return format(date, "MMM d, h:mm a");
  };

  const statusColor = getStatusColor(visit.status);

  return (
    <motion.div
      variants={fadeInUp}
      custom={index}
      whileHover={{ scale: isMobile ? 1 : 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Paper
        elevation={0}
        sx={{
          p: isMobile ? 1.5 : 2,
          borderRadius: 3,
          bgcolor:
            theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "white",
          border: `1px solid ${alpha(statusColor.main, 0.2)}`,
          position: "relative",
          overflow: "hidden",
          cursor: "pointer",
          "&:hover": {
            boxShadow: `0 8px 20px ${alpha(statusColor.main, 0.2)}`,
          },
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 4,
            height: "100%",
            bgcolor: statusColor.main,
          }}
        />

        <Box sx={{ pl: 1.5 }}>
          <Box sx={{ display: "flex", gap: 1.5, mb: expanded ? 1.5 : 0 }}>
            {visit.photos?.length > 0 && !imageError ? (
              <Box
                sx={{
                  width: isMobile ? 45 : 60,
                  height: isMobile ? 45 : 60,
                  borderRadius: 2,
                  backgroundImage: `url(${visit.photos[0].url})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  flexShrink: 0,
                  position: "relative",
                  border: `2px solid ${alpha(statusColor.main, 0.3)}`,
                }}
              >
                {visit.photos.length > 1 && (
                  <Badge
                    badgeContent={`+${visit.photos.length - 1}`}
                    color="primary"
                    sx={{
                      position: "absolute",
                      bottom: -4,
                      right: -4,
                      "& .MuiBadge-badge": {
                        fontSize: 8,
                        height: 16,
                        minWidth: 16,
                      },
                    }}
                />
                )}
              </Box>
            ) : (
              <Box
                sx={{
                  width: isMobile ? 45 : 60,
                  height: isMobile ? 45 : 60,
                  borderRadius: 2,
                  bgcolor: alpha(statusColor.main, 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  border: `2px solid ${alpha(statusColor.main, 0.3)}`,
                }}
              >
                <LocationOnIcon
                  sx={{
                    color: alpha(statusColor.main, 0.5),
                    fontSize: isMobile ? 20 : 30,
                  }}
                />
              </Box>
            )}

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 0.5,
                  flexWrap: "wrap",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 700,
                    fontSize: isMobile ? "0.85rem" : "1rem",
                  }}
                >
                  {visit.locationName || "Unknown Location"}
                </Typography>
                <Chip
                  label={visit.status || "Pending"}
                  size="small"
                  sx={{
                    bgcolor: alpha(statusColor.main, 0.1),
                    color: statusColor.main,
                    fontWeight: 600,
                    fontSize: "0.6rem",
                    height: 18,
                  }}
                />
              </Box>

              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  display: "block",
                  mb: 0.5,
                  fontSize: isMobile ? "0.6rem" : "0.75rem",
                }}
              >
                {visit.address || "Address not available"}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  flexWrap: "wrap",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <ScheduleIcon
                    sx={{
                      fontSize: isMobile ? 10 : 12,
                      color: "text.disabled",
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      fontSize: isMobile ? "0.6rem" : "0.75rem",
                    }}
                  >
                    {formatVisitTime(visit.visitDate || visit.createdAt)}
                  </Typography>
                </Box>

                {visit.distanceFromPreviousKm > 0 && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <RouteIcon
                      sx={{
                        fontSize: isMobile ? 10 : 12,
                        color: "text.disabled",
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        fontSize: isMobile ? "0.6rem" : "0.75rem",
                      }}
                    >
                      {visit.distanceFromPreviousKm.toFixed(1)} km
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Divider sx={{ my: 1.5 }} />

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {visit.photos?.length > 0 && (
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 600,
                          color: "text.secondary",
                          mb: 0.5,
                          display: "block",
                          fontSize: isMobile ? "0.6rem" : "0.75rem",
                        }}
                      >
                        Photos ({visit.photos.length})
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 0.5,
                          overflowX: "auto",
                          pb: 0.5,
                        }}
                      >
                        {visit.photos.map((photo, idx) => (
                          <Box
                            key={idx}
                            component="img"
                            src={photo.url}
                            alt={`Visit ${idx + 1}`}
                            sx={{
                              width: isMobile ? 45 : 60,
                              height: isMobile ? 45 : 60,
                              borderRadius: 1,
                              objectFit: "cover",
                              cursor: "pointer",
                              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(photo.url, "_blank");
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      justifyContent: "flex-end",
                      mt: 1,
                    }}
                  >
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={
                        <VisibilityIcon sx={{ fontSize: isMobile ? 14 : 18 }} />
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewLiveRoute(visit);
                      }}
                      sx={{
                        borderRadius: 2,
                        fontSize: isMobile ? "0.7rem" : "0.875rem",
                        py: isMobile ? 0.5 : 1,
                        px: isMobile ? 1 : 2,
                      }}
                    >
                      {isMobile ? "Route" : "Live Route"}
                    </Button>
                    {visit.verified && (
                      <Chip
                        icon={
                          <VerifiedIcon sx={{ fontSize: isMobile ? 12 : 14 }} />
                        }
                        label="Verified"
                        size="small"
                        color="success"
                        variant="outlined"
                        sx={{
                          fontSize: isMobile ? "0.6rem" : "0.75rem",
                          height: isMobile ? 22 : 28,
                        }}
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
const LocationStatus = ({
  state,
  onRetry,
  onManual,
  onToggleTracking,
  isTracking,
  userRole,
}) => {
  const theme = useTheme();

  const getStatusConfig = () => {
    if (state.error) {
      return {
        icon: <GpsOffIcon />,
        color: "error",
        message: state.error,
      };
    }
    if (state.coords) {
      return {
        icon: <GpsFixedIcon />,
        color: "success",
        message: `Location acquired (${state.accuracy?.toFixed(0)}m accuracy)`,
      };
    }
    if (state.isWatching || isTracking) {
      return {
        icon: <GpsFixedIcon sx={{ animation: "pulse 1s infinite" }} />,
        color: "warning",
        message: "Getting location...",
      };
    }
    return {
      icon: <GpsOffIcon />,
      color: "info",
      message: "Location not requested",
    };
  };

  const config = getStatusConfig();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Only show location status for TEAM role
  if (userRole !== "TEAM") return null;

  return (
    <Paper
      elevation={0}
      sx={{
        p: isMobile ? 1.5 : 2,
        borderRadius: 3,
        bgcolor: alpha(theme.palette[config.color].main, 0.1),
        border: `1px solid ${alpha(theme.palette[config.color].main, 0.2)}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: isMobile ? "320px" : "1150px",
        ml: isMobile ? 2 : 3,
        flexWrap: "wrap",
        gap: 1,
        mb: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box sx={{ color: theme.palette[config.color].main }}>
          {config.icon}
        </Box>
        <Typography
          variant={isMobile ? "caption" : "body2"}
          sx={{ color: theme.palette[config.color].main }}
        >
          {config.message}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 1 }}>
        {state.coords && (
          <Tooltip title={isTracking ? "Stop Tracking" : "Start Live Tracking"}>
            <IconButton
              size="small"
              onClick={onToggleTracking}
              sx={{
                color: isTracking
                  ? theme.palette.success.main
                  : theme.palette.primary.main,
              }}
            >
              <RadioButtonCheckedIcon
                sx={{ animation: isTracking ? "pulse 1s infinite" : "none" }}
              />
            </IconButton>
          </Tooltip>
        )}
        {(state.error || !state.coords) && (
          <>
            <Button
              size="small"
              variant="outlined"
              onClick={onRetry}
              sx={{ fontSize: isMobile ? "0.7rem" : "0.875rem" }}
            >
              Retry
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={onManual}
              sx={{ fontSize: isMobile ? "0.7rem" : "0.875rem" }}
            >
              Manual
            </Button>
          </>
        )}
      </Box>
    </Paper>
  );
};

// Manual Location Dialog
const ManualLocationDialog = ({ open, onClose, onSubmit }) => {
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  const handleSubmit = () => {
    if (lat && lng) {
      onSubmit(parseFloat(lat), parseFloat(lng));
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
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

// Role Info Card
const RoleInfoCard = ({ user }) => {
  const theme = useTheme();
  const roleConfig = ROLE_CONFIG[user?.role] || ROLE_CONFIG.TEAM;
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Paper
      elevation={0}
      sx={{
        p: isMobile ? 1.5 : 2,
        borderRadius: 3,
        bgcolor: alpha(roleConfig.color, 0.1),
        border: `1px solid ${alpha(roleConfig.color, 0.2)}`,
        mb: 2,
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Avatar
        sx={{
          bgcolor: roleConfig.color,
          width: isMobile ? 40 : 48,
          height: isMobile ? 40 : 48,
        }}
      >
        {roleConfig.icon}
      </Avatar>
      <Box>
        <Typography variant="subtitle2" fontWeight={600}>
          {roleConfig.label}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {user?.email}
        </Typography>
      </Box>
    </Paper>
  );
};

// Main Component
const SalesDailySummary = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const {
    user,
    locationState,
    onlineUsers,
    requestLocationPermission,
    getLocationSmart,
    startWatchingPosition,
    stopWatchingPosition,
    punchIn,
    punchOut,
    getVisitStats,
    getRecentVisits,
    attendance: authAttendance, // Get attendance from AuthContext
  } = useAuth();

  const userRole = user?.role;
  const isTeamMember = userRole === "TEAM";

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    visitsToday: 0,
    totalVisits: 0,
    totalDistanceKm: 0,
    totalTravelTimeMinutes: 0,
    totalCompletedVisits: 0,
  });
  const [recentVisits, setRecentVisits] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [locationLoading, setLocationLoading] = useState(false);
  const [manualLocationOpen, setManualLocationOpen] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [bottomNav, setBottomNav] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [date] = useState(new Date());

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const [statsRes, visitsRes] = await Promise.all([
        getVisitStats(),
        getRecentVisits(5),
      ]);

      if (statsRes.success) {
        setStats(statsRes.result);
      }

      if (visitsRes.success) {
        setRecentVisits(visitsRes.result);
      }
    } catch (error) {
      showSnackbar("Failed to load dashboard", "error");
    } finally {
      setLoading(false);
    }
  }, [getVisitStats, getRecentVisits]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Show snackbar
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  // Handle Punch In - Only for TEAM role
  const handlePunchIn = async () => {
    if (!isTeamMember) {
      showSnackbar("Only team members can punch in", "warning");
      return;
    }

    try {
      setLocationLoading(true);
      showSnackbar("Getting your location...", "info");

      const permResult = await requestLocationPermission();
      if (!permResult.success) {
        showSnackbar(permResult.error, "error");
        setLocationLoading(false);
        return;
      }

      const location = await getLocationSmart(50); // Request 50m accuracy

      if (!location.success) {
        if (location.errorType === 'LOW_ACCURACY') {
          showSnackbar(
            `Location accuracy too low (${location.accuracy?.toFixed(0)}m). Please move to an open area.`,
            "warning"
          );
        } else {
          showSnackbar("Could not get location. Try manual entry.", "warning");
        }
        setManualLocationOpen(true);
        setLocationLoading(false);
        return;
      }

      const result = await punchIn(location.lat, location.lng, location.source);

      if (result.success) {
        showSnackbar(`Punched in successfully (Accuracy: ${location.accuracy?.toFixed(0)}m)`, "success");
        loadDashboardData();
      } else {
        showSnackbar(result.error, "error");
      }
    } catch (error) {
      console.error('Punch in error:', error);
      showSnackbar("Failed to punch in", "error");
    } finally {
      setLocationLoading(false);
    }
  };

  // Handle Punch Out - Only for TEAM role
  const handlePunchOut = async () => {
    if (!isTeamMember) {
      showSnackbar("Only team members can punch out", "warning");
      return;
    }

    try {
      setLocationLoading(true);
      showSnackbar("Getting your location for punch out...", "info");

      const location = await getLocationSmart(50); // Request 50m accuracy

      if (!location.success) {
        if (location.errorType === 'LOW_ACCURACY') {
          showSnackbar(
            `Location accuracy too low (${location.accuracy?.toFixed(0)}m). Please move to an open area.`,
            "warning"
          );
        } else {
          showSnackbar("Could not get location", "warning");
        }
        setLocationLoading(false);
        return;
      }

      const result = await punchOut(location.lat, location.lng);

      if (result.success) {
        showSnackbar("Punched out successfully", "success");
        loadDashboardData();
        if (isTracking) {
          stopTracking();
        }
      } else {
        showSnackbar(result.error, "error");
      }
    } catch (error) {
      console.error('Punch out error:', error);
      showSnackbar("Failed to punch out", "error");
    } finally {
      setLocationLoading(false);
    }
  };

  // Handle Manual Location - Only for TEAM role
  const handleManualLocation = async (lat, lng) => {
    if (!isTeamMember) return;

    setLocationLoading(true);
    try {
      const result = await punchIn(lat, lng, "manual");
      if (result.success) {
        showSnackbar("Punched in with manual location", "success");
        loadDashboardData();
      } else {
        showSnackbar(result.error, "error");
      }
    } catch (error) {
      showSnackbar("Failed to punch in with manual location", "error");
    } finally {
      setLocationLoading(false);
    }
  };

  // Toggle live tracking - Only for TEAM role
  const toggleTracking = () => {
    if (!isTeamMember) {
      showSnackbar("Only team members can track location", "warning");
      return;
    }

    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  };

  const startTracking = () => {
    startWatchingPosition(
      (pos) => {
        console.log("Position updated:", pos);
      },
      (err) => {
        console.error("Watch error:", err);
        showSnackbar("Tracking error", "error");
      },
    );
    setIsTracking(true);
    showSnackbar("Live tracking started");
  };

  const stopTracking = () => {
    stopWatchingPosition();
    setIsTracking(false);
    showSnackbar("Live tracking stopped");
  };

  // Navigate to create visit - Only for TEAM role
  const handleStartVisit = () => {
    if (!isTeamMember) {
      showSnackbar("Only team members can create visits", "warning");
      return;
    }
    navigate("/visit-details");
  };

  // Get attendance status from AuthContext
  const getAttendanceStatus = useMemo(() => {
    console.log('Current attendance from context:', authAttendance); // Debug log
    
    if (!authAttendance) {
      return {
        text: "OFF DUTY",
        color: "text.disabled",
        icon: <CancelIcon />,
        action: "Punch In",
        showPunchIn: true,
        showPunchOut: false,
      };
    }
    
    if (authAttendance.status === "ON DUTY") {
      return {
        text: "ON DUTY",
        color: "success.main",
        icon: <CheckCircleIcon />,
        action: "Punch Out",
        time: authAttendance.punchInTime ? format(new Date(authAttendance.punchInTime), "h:mm a") : "",
        showPunchIn: false,
        showPunchOut: true,
      };
    }
    
    // Completed (OFF DUTY)
    return {
      text: "OFF DUTY",
      color: "info.main",
      icon: <HistoryIcon />,
      action: "Punch In",
      time: authAttendance.punchOutTime ? format(new Date(authAttendance.punchOutTime), "h:mm a") : "",
      showPunchIn: true,
      showPunchOut: false,
    };
  }, [authAttendance]);

  // Navigation items based on role
  const navItems = useMemo(() => {
    const items = [
      { label: "Dashboard", icon: <DashboardIcon />, path: "/" },
      { label: "Visits", icon: <HistoryIcon />, path: "/total-visits" },
      { label: "Map", icon: <MapIcon />, path: "/visit-route" },
    ];

    // Add Team Performance for managers
    if (!isTeamMember) {
      items.push({
        label: "Team",
        icon: <PeopleIcon />,
        path: "/team-performance-report",
      });
    }

    return items;
  }, [isTeamMember]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        pb: isMobile ? 7 : 4,
        bgcolor: "#f8fafc",
      }}
    >
      {/* Header with gradient */}
      <Paper
        elevation={0}
        sx={{
          p: isMobile ? 2 : 3,
          borderRadius: 0,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.8)})`,
          color: "white",
          position: "sticky",
          top: 0,
          ml: isMobile ? 2 : 3,
          width: isMobile ? "92%" : "1160px",
          zIndex: 100,
          boxShadow: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography variant={isMobile ? "h6" : "h5"} fontWeight={800}>
              Visit Summary
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {format(new Date(), "EEEE, MMMM d, yyyy")}
            </Typography>
          </Box>
          {isMobile && (
            <IconButton color="inherit" onClick={() => setDrawerOpen(true)}>
              <MenuIcon />
            </IconButton>
          )}
        </Box>
      </Paper>

      <Container maxWidth="xl" sx={{ px: isMobile ? 2 : 3, mt: 2 }}>
        {/* Action Buttons - Only for TEAM role */}
        {isTeamMember && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Paper
              elevation={0}
              sx={{
                p: isMobile ? 1.5 : 2,
                mb: 2,
                borderRadius: 3,
                display: "flex",
                gap: 1,
                width: isMobile ? "100%" : "1150px",
                ml: isMobile ? 0 : 3,
                flexDirection: isMobile ? "column" : "row",
                bgcolor: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: "blur(10px)",
              }}
            >
              <Button
                fullWidth={isMobile}
                variant="contained"
                size={isMobile ? "medium" : "large"}
                startIcon={
                  getAttendanceStatus.showPunchOut ? (
                    <LogoutIcon />
                  ) : (
                    <LoginIcon />
                  )
                }
                onClick={
                  getAttendanceStatus.showPunchOut
                    ? handlePunchOut
                    : handlePunchIn
                }
                disabled={locationLoading}
                sx={{
                  py: isMobile ? 1.5 : 1.5,
                  borderRadius: 2,
                  fontSize: isMobile ? "0.9rem" : "1rem",
                  fontWeight: 600,
                  background: getAttendanceStatus.showPunchOut
                    ? `linear-gradient(135deg, ${theme.palette.error.main}, ${alpha(theme.palette.error.main, 0.8)})`
                    : `linear-gradient(135deg, ${theme.palette.success.main}, ${alpha(theme.palette.success.main, 0.8)})`,
                  '&:hover': {
                    background: getAttendanceStatus.showPunchOut
                      ? theme.palette.error.dark
                      : theme.palette.success.dark,
                  }
                }}
              >
                {locationLoading
                  ? "Getting Location..."
                  : getAttendanceStatus.showPunchOut
                    ? "Punch Out"
                    : "Punch In"}
              </Button>

              <Button
                fullWidth={isMobile}
                variant="outlined"
                size={isMobile ? "medium" : "large"}
                startIcon={<AddLocationAltIcon />}
                onClick={handleStartVisit}
                disabled={!getAttendanceStatus.showPunchOut} // Only enable Start Visit when on duty
                sx={{
                  py: isMobile ? 1.5 : 1.5,
                  borderRadius: 2,
                  fontSize: isMobile ? "0.9rem" : "1rem",
                  fontWeight: 600,
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                  }
                }}
              >
                Start Visit
              </Button>

              <IconButton
                onClick={loadDashboardData}
                disabled={loading}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  borderRadius: 2,
                  width: isMobile ? "100%" : 56,
                  height: isMobile ? 48 : 56,
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Paper>
          </motion.div>
        )}

        {/* Location Status - Only for TEAM role */}
        {isTeamMember && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <LocationStatus
              state={locationState}
              onRetry={handlePunchIn}
              onManual={() => setManualLocationOpen(true)}
              onToggleTracking={toggleTracking}
              isTracking={isTracking}
              userRole={userRole}
            />
          </motion.div>
        )}

        {/* Stats Grid - Show for all roles */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <Grid container spacing={isMobile ? 1.5 : 3} sx={{ my: 2 }}>
            <Grid item xs={6} md={3}>
              {loading ? (
                <Skeleton
                  variant="rounded"
                  height={isMobile ? 100 : 140}
                  sx={{ borderRadius: 3, ml: isMobile ? 0 : 3 }}
                />
              ) : (
                <ModernStatsCard
                  icon={TrendingUpIcon}
                  title="Today's Visits"
                  value={stats.visitsToday || 0}
                  subValue={`${stats.totalCompletedVisits || 0} completed`}
                  color="primary"
                  onClick={() => navigate("/total-visits")}
                />
              )}
            </Grid>

            <Grid item xs={6} md={3}>
              {loading ? (
                <Skeleton
                  variant="rounded"
                  height={isMobile ? 100 : 140}
                  sx={{ borderRadius: 3 }}
                />
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
                <Skeleton
                  variant="rounded"
                  height={isMobile ? 100 : 140}
                  sx={{ borderRadius: 3 }}
                />
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
                <Skeleton
                  variant="rounded"
                  height={isMobile ? 100 : 140}
                  sx={{ borderRadius: 3 }}
                />
              ) : (
                <ModernStatsCard
                  icon={getAttendanceStatus.icon.type}
                  title="Status"
                  value={getAttendanceStatus.text}
                  subValue={getAttendanceStatus.time}
                  color={
                    getAttendanceStatus.text === "ON DUTY" ? "success" : "info"
                  }
                />
              )}
            </Grid>
          </Grid>
        </motion.div>

        {/* Recent Visits - Show for all roles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: isMobile ? 1.5 : 3,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.background.paper, 0.6),
              backdropFilter: "blur(10px)",
              mb: isMobile ? 2 : 0,
              ml: isMobile ? 0 : 3,
              width: isMobile ? "100%" : "1150px",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography
                variant={isMobile ? "subtitle1" : "h6"}
                sx={{ fontWeight: 700 }}
              >
                Recent Visits
              </Typography>
              <Button
                size="small"
                onClick={() => navigate("/team-performance-report")}
                sx={{
                  borderRadius: 2,
                  fontSize: isMobile ? "0.75rem" : "0.875rem",
                }}
              >
                View All
              </Button>
            </Box>

            {loading ? (
              <Stack spacing={1.5}>
                {[1, 2, 3].map((i) => (
                  <Skeleton
                    key={i}
                    variant="rounded"
                    height={isMobile ? 80 : 100}
                    sx={{ borderRadius: 2 }}
                  />
                ))}
              </Stack>
            ) : recentVisits.length > 0 ? (
              <Stack spacing={1.5}>
                {recentVisits.map((visit, index) => (
                  <ModernVisitCard
                    key={visit._id}
                    visit={visit}
                    index={index}
                    onViewLiveRoute={(v) =>
                      navigate("/visit-route", { state: { visit: v } })
                    }
                    userRole={userRole}
                  />
                ))}
              </Stack>
            ) : (
              <Box sx={{ textAlign: "center", py: 3 }}>
                <LocationOnIcon
                  sx={{ fontSize: 40, color: "text.disabled", mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  No visits yet today
                </Typography>
                {isTeamMember && getAttendanceStatus.showPunchOut && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleStartVisit}
                    sx={{ mt: 2, borderRadius: 2 }}
                  >
                    Create First Visit
                  </Button>
                )}
              </Box>
            )}
          </Paper>
        </motion.div>
      </Container>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <Paper
          elevation={3}
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            borderRadius: 0,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            zIndex: 100,
          }}
        >
          <BottomNavigation
            value={bottomNav}
            onChange={(e, newValue) => {
              setBottomNav(newValue);
              navigate(navItems[newValue].path);
            }}
            showLabels
            sx={{ height: 56 }}
          >
            {navItems.map((item) => (
              <BottomNavigationAction
                key={item.label}
                label={item.label}
                icon={item.icon}
              />
            ))}
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
            width: "80%",
            maxWidth: 300,
            bgcolor: theme.palette.mode === "dark" ? "#1A1F2E" : "#FFFFFF",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Avatar sx={{ bgcolor: "primary.main", width: 48, height: 48 }}>
              {user?.firstName?.[0] || user?.name?.[0] || "U"}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {ROLE_CONFIG[userRole]?.label || userRole}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <List>
            {navItems.map((item) => (
              <ListItem
                button
                key={item.label}
                onClick={() => {
                  setDrawerOpen(false);
                  navigate(item.path);
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />

          <List>
            <ListItem button onClick={() => setDrawerOpen(false)}>
              <ListItemIcon>
                <CloseIcon />
              </ListItemIcon>
              <ListItemText primary="Close" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Manual Location Dialog - Only for TEAM role */}
      {isTeamMember && (
        <ManualLocationDialog
          open={manualLocationOpen}
          onClose={() => setManualLocationOpen(false)}
          onSubmit={handleManualLocation}
        />
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{
          vertical: "top",
          horizontal: isMobile ? "center" : "right",
        }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            borderRadius: 2,
            fontSize: isMobile ? "0.85rem" : "1rem",
            color: "#fff",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

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
};

export default SalesDailySummary;