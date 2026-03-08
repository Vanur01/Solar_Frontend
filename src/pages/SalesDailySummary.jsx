// pages/SalesDailySummary.js
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  Chip,
  Stack,
  alpha,
  useTheme,
  IconButton,
  Avatar,
  Skeleton,
  Alert,
  Snackbar,
  useMediaQuery,
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
} from "@mui/material";
import {
  Login as LoginIcon,
  Logout as LogoutIcon,
  AddLocationAlt as AddLocationAltIcon,
  Verified as VerifiedIcon,
  LocationOn as LocationOnIcon,
  Route as RouteIcon,
  Visibility as VisibilityIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon,
  Menu as MenuIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  GpsFixed as GpsFixedIcon,
  GpsOff as GpsOffIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  History as HistoryIcon,
  Map as MapIcon,
  People as PeopleIcon,
  AdminPanelSettings as AdminIcon,
  SupervisorAccount as ManagerIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { format, isToday, isYesterday } from "date-fns";

// ========== ROLE CONFIG ==========
const ROLE_CONFIG = {
  Head_office: { label: "Head Office", icon: <AdminIcon />, color: "#4569ea" },
  ZSM: { label: "Zone Manager", icon: <ManagerIcon />, color: "#4caf50" },
  ASM: { label: "Area Manager", icon: <ManagerIcon />, color: "#ff9800" },
  TEAM: { label: "Team Member", icon: <PersonIcon />, color: "#2196f3" },
};

// ========== STATS CARD ==========
const StatsCard = ({
  icon: Icon,
  title,
  value,
  subValue,
  color = "primary",
  onClick,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Paper
      onClick={onClick}
      elevation={0}
      sx={{
        p: isMobile ? 1.5 : 2.5,
        borderRadius: 3,
        background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.1)} 0%, ${alpha(theme.palette[color].main, 0.05)} 100%)`,
        border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`,
        cursor: onClick ? "pointer" : "default",
        height: isMobile ? "110px" : "130px",
        position: "relative",
        overflow: "hidden",
        width: "100%",
          ml: isMobile ? 3 : 3,
        "&:hover": onClick
          ? { transform: "translateY(-4px)", transition: "all 0.3s" }
          : {},
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
            sx={{ color: "text.secondary", fontWeight: 600 }}
          >
            {title}
          </Typography>
          <Typography
            variant={isMobile ? "h6" : "h5"}
            sx={{
              fontWeight: 800,
              mt: 0.5,
              color: theme.palette[color].main,
            }}
          >
            {value}
          </Typography>
        </Box>
        <Avatar
          sx={{
            bgcolor: alpha(theme.palette[color].main, 0.2),
            color: theme.palette[color].main,
          }}
        >
          <Icon sx={{ fontSize: isMobile ? 18 : 20 }} />
        </Avatar>
      </Box>
      {subValue && (
        <Typography
          variant="caption"
          sx={{ color: "text.secondary", mt: 1, display: "block" }}
        >
          {subValue}
        </Typography>
      )}
    </Paper>
  );
};

// ========== VISIT CARD ==========
const VisitCard = ({ visit, onViewLiveRoute }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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
    <Paper
      elevation={0}
      sx={{
        p: isMobile ? 1.5 : 2,
        borderRadius: 3,
        border: `1px solid ${alpha(statusColor.main, 0.2)}`,
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        "&:hover": { boxShadow: `0 4px 12px ${alpha(statusColor.main, 0.2)}` },
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
        <Box sx={{ display: "flex", gap: 1.5 }}>
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
            }}
          >
            <LocationOnIcon
              sx={{
                color: alpha(statusColor.main, 0.5),
                fontSize: isMobile ? 20 : 30,
              }}
            />
          </Box>

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
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {visit.locationName || "Unknown Location"}
              </Typography>
              <Chip
                label={visit.status || "Pending"}
                size="small"
                sx={{
                  bgcolor: alpha(statusColor.main, 0.1),
                  color: statusColor.main,
                  fontWeight: 600,
                  height: 20,
                }}
              />
            </Box>

            <Typography
              variant="caption"
              sx={{ color: "text.secondary", display: "block", mb: 0.5 }}
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
                <ScheduleIcon sx={{ fontSize: 12, color: "text.disabled" }} />
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {formatVisitTime(visit.visitDate || visit.createdAt)}
                </Typography>
              </Box>
            </Box>

            {expanded && (
              <Box
                sx={{
                  mt: 1.5,
                  pt: 1.5,
                  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<VisibilityIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewLiveRoute(visit);
                  }}
                  sx={{ borderRadius: 2, mr: 1 }}
                >
                  View Route
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
            )}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

// ========== LOCATION STATUS ==========
const LocationStatus = ({ state, onRetry, onManual }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const getStatusConfig = () => {
    if (state.error)
      return { icon: <GpsOffIcon />, color: "error", message: state.error };
    if (state.coords)
      return {
        icon: <GpsFixedIcon />,
        color: "success",
        message: `Location available (${Math.round(state.coords.accuracy)}m accuracy)`,
      };
    return {
      icon: <GpsOffIcon />,
      color: "info",
      message: "Location not requested",
    };
  };

  const config = getStatusConfig();

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
        mb: 2,
        flexWrap: "wrap",
          ml: isMobile ? 3 : 3,
        gap: 1,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box sx={{ color: theme.palette[config.color].main }}>
          {config.icon}
        </Box>
        <Typography
          variant="body2"
          sx={{ color: theme.palette[config.color].main }}
        >
          {config.message}
        </Typography>
      </Box>

      {(state.error || !state.coords) && (
        <Box sx={{ display: "flex", gap: 1 }}>
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

// ========== MANUAL LOCATION DIALOG ==========
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
      <DialogTitle>Enter Location Manually</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Latitude"
            type="number"
            fullWidth
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            size="small"
            placeholder="e.g., 20.2767"
          />
          <TextField
            label="Longitude"
            type="number"
            fullWidth
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            size="small"
            placeholder="e.g., 85.7767"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ========== MAIN COMPONENT ==========
const SalesDailySummary = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    user,
    locationState,
    requestLocationWithPermission,
    getCurrentLocation,
    punchIn,
    punchOut,
    getVisitStats,
    getRecentVisits,
    checkAttendanceStatus,
    attendance,
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
  const [bottomNav, setBottomNav] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Check attendance status on load
  useEffect(() => {
    const verifyAttendance = async () => {
      if (user) {
        await checkAttendanceStatus();
      }
    };
    verifyAttendance();
  }, [user, checkAttendanceStatus]);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, visitsRes] = await Promise.all([
        getVisitStats(),
        getRecentVisits(10),
      ]);

      if (statsRes.success) setStats(statsRes.result);
      if (visitsRes.success) setRecentVisits(visitsRes.result);
    } catch (error) {
      showSnackbar("Failed to load dashboard", "error");
    } finally {
      setLoading(false);
    }
  }, [getVisitStats, getRecentVisits]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  // ========== PUNCH HANDLERS ==========
  const handlePunchIn = async () => {
    if (!isTeamMember) {
      showSnackbar("Only team members can punch in", "warning");
      return;
    }

    try {
      setLocationLoading(true);
      showSnackbar("Requesting location permission...", "info");

      // This will trigger the browser's permission popup
      const locationResult = await requestLocationWithPermission();

      if (!locationResult.success) {
        showSnackbar(locationResult.error, "error");

        // If permission denied or timeout, offer manual entry
        if (locationResult.code === 1 || locationResult.code === 3) {
          setManualLocationOpen(true);
        }
        setLocationLoading(false);
        return;
      }

      showSnackbar(
        `Location acquired with ${Math.round(locationResult.accuracy)}m accuracy`,
        "success",
      );

      // Punch in with the obtained location
      const result = await punchIn(
        locationResult.lat,
        locationResult.lng,
        locationResult.source,
      );

      if (result.success) {
        showSnackbar("Punched in successfully!", "success");
        loadDashboardData();
      } else {
        showSnackbar(result.error, "error");
      }
    } catch (error) {
      console.error("Punch in error:", error);
      showSnackbar("Failed to punch in. Please try again.", "error");
    } finally {
      setLocationLoading(false);
    }
  };

  const handlePunchOut = async () => {
    if (!isTeamMember) {
      showSnackbar("Only team members can punch out", "warning");
      return;
    }

    try {
      setLocationLoading(true);
      showSnackbar("Getting your location for punch out...", "info");

      // Get current location for punch out
      const locationResult = await getCurrentLocation();

      if (!locationResult.success) {
        showSnackbar(locationResult.error, "error");
        setLocationLoading(false);
        return;
      }

      const result = await punchOut(locationResult.lat, locationResult.lng);

      if (result.success) {
        showSnackbar("Punched out successfully!", "success");
        loadDashboardData();
      } else {
        showSnackbar(result.error, "error");
      }
    } catch (error) {
      console.error("Punch out error:", error);
      showSnackbar("Failed to punch out. Please try again.", "error");
    } finally {
      setLocationLoading(false);
    }
  };

  const handleManualLocation = async (lat, lng) => {
    if (!isTeamMember) return;

    setLocationLoading(true);
    try {
      showSnackbar("Using manually entered location...", "info");

      const result = await punchIn(lat, lng, "manual");

      if (result.success) {
        showSnackbar("Punched in with manual location", "success");
        loadDashboardData();
      } else {
        showSnackbar(result.error, "error");
      }
    } catch (error) {
      console.error("Manual punch in error:", error);
      showSnackbar("Failed to punch in", "error");
    } finally {
      setLocationLoading(false);
    }
  };

  const handleStartVisit = () => {
    if (!isTeamMember) {
      showSnackbar("Only team members can create visits", "warning");
      return;
    }

    if (!attendance || attendance.status !== "ON DUTY") {
      showSnackbar("Please punch in first before starting a visit", "warning");
      return;
    }

    navigate("/visit-details");
  };

  // Attendance status
  const attendanceStatus = useMemo(() => {
    if (!attendance || attendance.status === "OFF DUTY") {
      return {
        text: "OFF DUTY",
        color: "info",
        icon: CancelIcon,
        showPunchIn: true,
        showPunchOut: false,
      };
    }
    return {
      text: "ON DUTY",
      color: "success",
      icon: CheckCircleIcon,
      time: attendance.punchInTime
        ? format(new Date(attendance.punchInTime), "h:mm a")
        : "",
      showPunchIn: false,
      showPunchOut: true,
    };
  }, [attendance]);

  // Navigation items
  const navItems = useMemo(() => {
    const items = [
      { label: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
      { label: "Visits", icon: <HistoryIcon />, path: "/total-visits" },
      { label: "Map", icon: <MapIcon />, path: "/visit-route" },
    ];
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
    <Box sx={{ minHeight: "100vh", pb: isMobile ? 7 : 4, bgcolor: "#f8fafc" }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: isMobile ? 2 : 3,
          borderRadius: 0,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.8)})`,
          color: "white",
          position: "sticky",
          ml: isMobile ? 3 : 3,
          width: isMobile ? "320px" : "1150px",
          top: 0,
          zIndex: 100,
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
        {/* Action Buttons - Team Member Only */}
        {isTeamMember && (
          <Paper
            elevation={0}
            sx={{
              p: isMobile ? 1.5 : 2,
              mb: 2,
              borderRadius: 3,
              display: "flex",
              ml: isMobile ? 3 : 3,
              width: isMobile ? "320px" : "1150px",
              gap: 1,
              flexDirection: isMobile ? "column" : "row",
              bgcolor: alpha(theme.palette.background.paper, 0.8),
            }}
          >
            <Button
              fullWidth={isMobile}
              variant="contained"
              startIcon={
                attendanceStatus.showPunchOut ? <LogoutIcon /> : <LoginIcon />
              }
              onClick={
                attendanceStatus.showPunchOut ? handlePunchOut : handlePunchIn
              }
              disabled={locationLoading}
              sx={{
                py: isMobile ? 1.5 : 1.5,
                borderRadius: 2,
                bgcolor: attendanceStatus.showPunchOut
                  ? "error.main"
                  : "success.main",
                "&:hover": {
                  bgcolor: attendanceStatus.showPunchOut
                    ? "error.dark"
                    : "success.dark",
                },
              }}
            >
              {locationLoading
                ? "Getting Location..."
                : attendanceStatus.showPunchOut
                  ? "Punch Out"
                  : "Punch In"}
            </Button>

            <Button
              fullWidth={isMobile}
              variant="outlined"
              startIcon={<AddLocationAltIcon />}
              onClick={handleStartVisit}
              disabled={!attendanceStatus.showPunchOut}
              sx={{ py: isMobile ? 1.5 : 1.5, borderRadius: 2 }}
            >
              Start Visit
            </Button>

            <IconButton
              onClick={loadDashboardData}
              disabled={loading}
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                borderRadius: 2,
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Paper>
        )}

        {/* Location Status - Team Member Only */}
        {isTeamMember && (
          <LocationStatus
            state={locationState}
            onRetry={handlePunchIn}
            onManual={() => setManualLocationOpen(true)}
          />
        )}

        {/* Stats Grid */}
        <Grid container spacing={isMobile ? 1.5 : 3} sx={{ my: 2 }}>
          <Grid item xs={6} md={3}>
            {loading ? (
              <Skeleton
                variant="rounded"
                height={isMobile ? 100 : 130}
                sx={{ borderRadius: 3 }}
              />
            ) : (
              <StatsCard
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
                height={isMobile ? 100 : 130}
                sx={{ borderRadius: 3 }}
              />
            ) : (
              <StatsCard
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
                height={isMobile ? 100 : 130}
                sx={{ borderRadius: 3 }}
              />
            ) : (
              <StatsCard
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
                height={isMobile ? 100 : 130}
                sx={{ borderRadius: 3 }}
              />
            ) : (
              <StatsCard
                icon={attendanceStatus.icon}
                title="Status"
                value={attendanceStatus.text}
                subValue={attendanceStatus.time}
                color={attendanceStatus.color}
              />
            )}
          </Grid>
        </Grid>

        {/* Recent Visits */}
        <Paper
          elevation={0}
          sx={{
            p: isMobile ? 1.5 : 3,
            borderRadius: 3,
            bgcolor: alpha(theme.palette.background.paper, 0.6),
            mb: isMobile ? 2 : 0,
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
              sx={{ borderRadius: 2 }}
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
              {recentVisits.map((visit) => (
                <VisitCard
                  key={visit._id}
                  visit={visit}
                  onViewLiveRoute={(v) =>
                    navigate("/visit-route", { state: { visit: v } })
                  }
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
              {isTeamMember && attendanceStatus.showPunchOut && (
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
      >
        <Box sx={{ width: 250, p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Avatar sx={{ bgcolor: "primary.main" }}>
              {user?.firstName?.[0] || user?.name?.[0] || "U"}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight={700}>
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
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
        </Box>
      </Drawer>

      {/* Manual Location Dialog */}
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
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SalesDailySummary;