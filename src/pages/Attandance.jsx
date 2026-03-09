// pages/Attandance.jsx (Updated with address integration)
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Chip,
  Avatar,
  IconButton,
  Stack,
  Card,
  CardContent,
  Button,
  useTheme,
  useMediaQuery,
  Skeleton,
  Dialog,
  Slide,
  Alert,
  Snackbar,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Pagination,
  Fade,
  Zoom,
  Badge,
  DialogTitle,
  DialogContent,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  Fab,
  SwipeableDrawer,
  BottomNavigation,
  BottomNavigationAction,
  InputAdornment,
  DialogActions,
  Tooltip,
  alpha,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  CalendarToday,
  ChevronLeft,
  ChevronRight,
  AccessTime,
  Person,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Visibility,
  Delete,
  Login,
  Logout,
  LocationOn,
  Close,
  Dashboard,
  Group,
  ExpandMore,
  Search,
  FilterAlt,
  Clear,
  Refresh,
  GpsFixed,
  GpsNotFixed,
  Timer,
  PlayArrow,
  Home,
  Business,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { useAttendance } from "../hooks/useAttendance";
import { useGeo } from "../hooks/useGeo";
import AttendanceDetails from "./AttendanceDetails";
import TeamAttendance from "./TeamAttendance";
import { format, differenceInSeconds } from "date-fns";
import { useNavigate } from "react-router-dom";

// ─── Constants ────────────────────────────────────────────────────────────────
const PRIMARY = "#4569ea";
const SECONDARY = "#1a237e";
const SUCCESS = "#22c55e";
const DANGER = "#ef4444";
const WARNING = "#f59e0b";

// Roles that should NOT see personal punch-in / punch-out UI
const MANAGER_ROLES = ["Head_office", "ZSM", "ASM"];

const PERIOD_OPTIONS = [
  { value: "Today", label: "Today" },
  { value: "This Week", label: "This Week" },
  { value: "This Month", label: "This Month" },
  { value: "All", label: "All Time" },
];

const STATUS_CONFIG = {
  present: {
    bg: alpha(SUCCESS, 0.1),
    color: SUCCESS,
    icon: <CheckCircle sx={{ fontSize: 14 }} />,
    label: "Present",
  },
  absent: {
    bg: alpha(DANGER, 0.1),
    color: DANGER,
    icon: <ErrorIcon sx={{ fontSize: 14 }} />,
    label: "Absent",
  },
  late: {
    bg: alpha(WARNING, 0.1),
    color: WARNING,
    icon: <Warning sx={{ fontSize: 14 }} />,
    label: "Late",
  },
  leave: {
    bg: alpha("#a855f7", 0.1),
    color: "#a855f7",
    icon: <Person sx={{ fontSize: 14 }} />,
    label: "Leave",
  },
  holiday: {
    bg: alpha("#3b82f6", 0.1),
    color: "#3b82f6",
    icon: <CalendarToday sx={{ fontSize: 14 }} />,
    label: "Holiday",
  },
};

// ─── useWorkTimer Hook ────────────────────────────────────────────────────────
function useWorkTimer(initialStartTime = null) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startTime, setStartTime] = useState(initialStartTime);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef(null);

  const formatTime = useCallback((seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const start = useCallback((ts = new Date()) => {
    setStartTime(ts);
    setIsActive(true);
  }, []);

  const stop = useCallback(() => {
    setIsActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    setElapsedSeconds(0);
    setStartTime(null);
    setIsActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isActive && startTime) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(differenceInSeconds(new Date(), new Date(startTime)));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, startTime]);

  return {
    elapsedSeconds,
    formattedTime: formatTime(elapsedSeconds),
    isActive,
    start,
    stop,
    reset,
  };
}

// ─── Styled Components ───────────────────────────────────────────────────────
const GlassCard = styled(Card)(() => ({
  background: "rgba(255,255,255,0.97)",
  backdropFilter: "blur(12px)",
  border: `1px solid ${alpha(PRIMARY, 0.08)}`,
  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  borderRadius: 20,
}));

const PulsingDot = styled(Box)(({ dotcolor }) => ({
  width: 9,
  height: 9,
  borderRadius: "50%",
  backgroundColor: dotcolor,
  flexShrink: 0,
  animation: "pulseAnim 2s ease-in-out infinite",
  "@keyframes pulseAnim": {
    "0%, 100%": { boxShadow: `0 0 0 0px ${dotcolor}55` },
    "50%": { boxShadow: `0 0 0 6px ${dotcolor}00` },
  },
}));

const TimerDisplay = styled(Box)(({ theme, isrunning }) => ({
  background: `linear-gradient(135deg, ${alpha(PRIMARY, 0.1)} 0%, ${alpha(SECONDARY, 0.1)} 100%)`,
  borderRadius: 16,
  padding: theme.spacing(2, 3),
  border: `1px solid ${alpha(isrunning === "true" ? SUCCESS : PRIMARY, 0.2)}`,
  boxShadow: `0 4px 12px ${alpha(isrunning === "true" ? SUCCESS : PRIMARY, 0.1)}`,
}));

// ─── StatusBadge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status, size = "small" }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.present;
  return (
    <Chip
      size={size}
      label={cfg.label}
      icon={cfg.icon}
      sx={{
        bgcolor: cfg.bg,
        color: cfg.color,
        fontWeight: 700,
        "& .MuiChip-icon": { color: cfg.color },
      }}
    />
  );
};

// ─── StatCard ─────────────────────────────────────────────────────────────────
const StatCard = ({
  icon: Icon,
  label,
  value,
  color = PRIMARY,
  sub,
  loading,
  index,
}) => (
  <Fade in timeout={300 + index * 80}>
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, sm: 2, md: 2.5 },
        borderRadius: 3,
        height: "100%",
        border: `1px solid ${alpha(color, 0.12)}`,
        background: `linear-gradient(140deg, #fff 55%, ${alpha(color, 0.05)})`,
        transition: "transform .2s, box-shadow .2s",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: `0 8px 24px ${alpha(color, 0.14)}`,
        },
      }}
    >
      {loading ? (
        <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
      ) : (
        <Stack spacing={1}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Box
              sx={{
                width: { xs: 34, sm: 42 },
                height: { xs: 34, sm: 42 },
                borderRadius: 2,
                bgcolor: alpha(color, 0.1),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color,
              }}
            >
              <Icon sx={{ fontSize: { xs: 18, sm: 22 } }} />
            </Box>
            <Typography
              variant="h5"
              fontWeight={800}
              color={color}
              sx={{ fontSize: { xs: "1.2rem", sm: "1.6rem" } }}
            >
              {value}
            </Typography>
          </Stack>
          <Box>
            <Typography
              variant="body2"
              fontWeight={700}
              sx={{ fontSize: { xs: "0.72rem", sm: "0.82rem" } }}
            >
              {label}
            </Typography>
            {sub && (
              <Typography variant="caption" color="text.secondary">
                {sub}
              </Typography>
            )}
          </Box>
        </Stack>
      )}
    </Paper>
  </Fade>
);

// ─── CalCell ──────────────────────────────────────────────────────────────────
const CalCell = ({
  day,
  isSelected,
  isToday,
  isWeekend,
  status,
  onClick,
  isPrev,
}) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <Box
      onClick={onClick}
      sx={{
        height: { xs: 36, sm: 44 },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 2,
        cursor: isPrev ? "default" : "pointer",
        fontSize: { xs: "0.7rem", sm: "0.8rem" },
        fontWeight: 600,
        transition: "all .18s ease",
        opacity: isPrev ? 0.2 : 1,
        userSelect: "none",
        bgcolor: isSelected
          ? PRIMARY
          : isToday
            ? alpha(PRIMARY, 0.12)
            : cfg
              ? cfg.bg
              : "transparent",
        color: isSelected
          ? "#fff"
          : isToday
            ? PRIMARY
            : cfg
              ? cfg.color
              : isWeekend
                ? alpha("#000", 0.3)
                : "text.primary",
        border:
          isToday && !isSelected
            ? `2px solid ${PRIMARY}`
            : "2px solid transparent",
        "&:hover": !isPrev
          ? {
              bgcolor: isSelected ? PRIMARY : alpha(PRIMARY, 0.1),
              transform: "scale(1.08)",
            }
          : {},
      }}
    >
      {day}
    </Box>
  );
};

// ─── LiveTimer ────────────────────────────────────────────────────────────────
const LiveTimer = ({ startTime, isRunning }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => setCurrentTime(new Date()), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  if (!startTime || !isRunning) return null;

  const diffMs = currentTime - new Date(startTime);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffMins = Math.floor((diffMs % 3600000) / 60000);
  const diffSecs = Math.floor((diffMs % 60000) / 1000);
  const formatted = `${diffHrs.toString().padStart(2, "0")}:${diffMins.toString().padStart(2, "0")}:${diffSecs.toString().padStart(2, "0")}`;

  return (
    <TimerDisplay isrunning="true">
      <Stack direction="row" spacing={2} alignItems="center">
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            bgcolor: alpha(SUCCESS, 0.15),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Timer sx={{ color: SUCCESS }} />
        </Box>
        <Box>
          <Typography
            variant="caption"
            sx={{ color: "rgba(255,255,255,0.85)", fontWeight: 700 }}
          >
            Current Session Duration
          </Typography>
          <Typography variant="h4" fontWeight={800} color={SUCCESS}>
            {formatted}
          </Typography>
        </Box>
        <Box sx={{ flex: 1, textAlign: "right" }}>
          <Chip
            icon={<PlayArrow />}
            label="LIVE"
            size="small"
            sx={{
              bgcolor: alpha(SUCCESS, 0.15),
              color: SUCCESS,
              fontWeight: 700,
              animation: "pulse 1.5s infinite",
              "@keyframes pulse": {
                "0%, 100%": { opacity: 1 },
                "50%": { opacity: 0.5 },
              },
            }}
          />
        </Box>
      </Stack>
    </TimerDisplay>
  );
};

// ─── PunchModal ───────────────────────────────────────────────────────────────
const PunchModal = ({
  open,
  mode,
  onClose,
  onConfirm,
  punchLoading,
  geo,
  timer,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isPunchIn = mode === "in";
  const accentColor = isPunchIn ? SUCCESS : DANGER;
  const [tick, setTick] = useState(new Date());
  const [fetchingAddress, setFetchingAddress] = useState(false);
  const [showFullAddress, setShowFullAddress] = useState(false);

  useEffect(() => {
    if (!open) return;
    const t = setInterval(() => setTick(new Date()), 1000);
    return () => clearInterval(t);
  }, [open]);

  // Fetch address when location is available
  useEffect(() => {
    const getAddress = async () => {
      if (geo.latitude && geo.longitude && !geo.address && !fetchingAddress && open) {
        setFetchingAddress(true);
        try {
          // Use the refreshAddress method if available, otherwise fetch directly
          if (geo.refreshAddress) {
            await geo.refreshAddress();
          } else {
            // Fallback: fetch address directly
            const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${geo.latitude}&lon=${geo.longitude}&zoom=18&addressdetails=1`;
            const response = await fetch(url, {
              headers: {
                'Accept-Language': 'en',
                'User-Agent': 'AttendanceApp/1.0'
              }
            });
            const data = await response.json();
            if (data) {
              geo.address = {
                full: data.display_name,
                short: data.address?.road 
                  ? `${data.address.road}${data.address.house_number ? ' ' + data.address.house_number : ''}`
                  : data.display_name?.split(',')[0] || 'Unknown location',
                ...data.address
              };
            }
          }
        } catch (error) {
          console.error('Address fetch failed:', error);
        } finally {
          setFetchingAddress(false);
        }
      }
    };
    
    if (open && geo.latitude && !geo.address) {
      getAddress();
    }
  }, [open, geo.latitude, geo.longitude, geo.address, geo, fetchingAddress]);

  const showTimer = !isPunchIn && timer?.isActive && timer?.formattedTime;

  return (
    <Dialog
      open={open}
      onClose={punchLoading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      fullScreen={isMobile}
      TransitionComponent={isMobile ? Slide : Zoom}
      TransitionProps={isMobile ? { direction: "up" } : {}}
      PaperProps={{
        sx: { borderRadius: isMobile ? 0 : 4, overflow: "hidden" },
      }}
    >
      <Box
        sx={{
          height: 5,
          background: `linear-gradient(90deg, ${PRIMARY}, ${accentColor})`,
        }}
      />

      <DialogTitle
        sx={{
          pb: 1,
          pt: 2.5,
          px: { xs: 2, sm: 3 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: "50%",
              bgcolor: alpha(accentColor, 0.12),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isPunchIn ? (
              <Login sx={{ color: accentColor, fontSize: 24 }} />
            ) : (
              <Logout sx={{ color: accentColor, fontSize: 24 }} />
            )}
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={800} lineHeight={1.2}>
              {isPunchIn ? "Punch In" : "Punch Out"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {format(tick, "EEEE, dd MMM yyyy")}
            </Typography>
          </Box>
        </Stack>
        <IconButton
          onClick={onClose}
          disabled={punchLoading}
          size="small"
          sx={{
            bgcolor: alpha("#000", 0.05),
            "&:hover": { bgcolor: alpha("#000", 0.1) },
          }}
        >
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: { xs: 2, sm: 3 }, pt: 1.5, pb: 2 }}>
        <Stack spacing={2.5}>
          {/* Live clock */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              textAlign: "center",
              background: `linear-gradient(135deg, ${alpha(accentColor, 0.07)}, ${alpha(PRIMARY, 0.04)})`,
              border: `1px solid ${alpha(accentColor, 0.15)}`,
            }}
          >
            <Typography
              variant="h2"
              fontWeight={900}
              lineHeight={1}
              sx={{
                color: accentColor,
                fontSize: { xs: "2.8rem", sm: "3.5rem" },
                letterSpacing: -2,
              }}
            >
              {format(tick, "hh:mm")}
              <Typography
                component="span"
                variant="h5"
                fontWeight={600}
                color="text.secondary"
                sx={{ ml: 0.75, letterSpacing: 0 }}
              >
                {format(tick, "ss")}
              </Typography>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {format(tick, "a")} · Current Time
            </Typography>
          </Paper>

          {/* Session timer (punch-out only) */}
          {showTimer && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2.5,
                bgcolor: alpha(SUCCESS, 0.08),
                border: `1px solid ${alpha(SUCCESS, 0.2)}`,
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    bgcolor: alpha(SUCCESS, 0.15),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Timer sx={{ color: SUCCESS, fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Current Session
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color={SUCCESS}>
                    {timer.formattedTime}
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  label="LIVE"
                  sx={{
                    bgcolor: alpha(SUCCESS, 0.2),
                    color: SUCCESS,
                    fontWeight: 700,
                    ml: "auto",
                  }}
                />
              </Stack>
            </Paper>
          )}

          {/* Enhanced Location status with address */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2.5,
              border: `1px solid ${alpha(
                geo.loading
                  ? PRIMARY
                  : geo.error
                    ? DANGER
                    : geo.latitude
                      ? SUCCESS
                      : "#000",
                0.25,
              )}`,
              bgcolor: alpha(
                geo.loading
                  ? PRIMARY
                  : geo.error
                    ? DANGER
                    : geo.latitude
                      ? SUCCESS
                      : "#000",
                0.04,
              ),
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  flexShrink: 0,
                  bgcolor: alpha(
                    geo.loading
                      ? PRIMARY
                      : geo.error
                        ? DANGER
                        : geo.latitude
                          ? SUCCESS
                          : "#000",
                    0.1,
                  ),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {geo.loading ? (
                  <CircularProgress size={18} sx={{ color: PRIMARY }} />
                ) : geo.error ? (
                  <GpsNotFixed sx={{ fontSize: 18, color: DANGER }} />
                ) : geo.latitude ? (
                  <GpsFixed sx={{ fontSize: 18, color: SUCCESS }} />
                ) : (
                  <LocationOn sx={{ fontSize: 18, color: "text.secondary" }} />
                )}
              </Box>
              <Box flex={1} minWidth={0}>
                <Typography variant="body2" fontWeight={700}>
                  {geo.loading
                    ? "Detecting your location…"
                    : geo.error
                      ? "Location unavailable"
                      : geo.latitude
                        ? geo.address?.short || "Location acquired"
                        : "Location not fetched"}
                </Typography>
                
                {/* Full address display with expand/collapse */}
                {geo.address?.full && (
                  <Box sx={{ mt: 0.5 }}>
                    <Stack 
                      direction="row" 
                      spacing={0.5} 
                      alignItems="center"
                      sx={{ cursor: 'pointer' }}
                      onClick={() => setShowFullAddress(!showFullAddress)}
                    >
                      <Home sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography 
                        variant="caption" 
                        color="text.secondary" 
                        sx={{ 
                          lineHeight: 1.3,
                          ...(!showFullAddress && {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '200px'
                          })
                        }}
                      >
                        {showFullAddress ? geo.address.full : geo.address.full.split(',')[0]}
                      </Typography>
                      <ExpandMore 
                        sx={{ 
                          fontSize: 14, 
                          color: 'text.secondary',
                          transform: showFullAddress ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s'
                        }} 
                      />
                    </Stack>
                    
                    {/* Additional address details */}
                    {showFullAddress && geo.address.city && (
                      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5, ml: 2.5 }}>
                        <Business sx={{ fontSize: 12, color: 'text.disabled' }} />
                        <Typography variant="caption" color="text.disabled">
                          {[geo.address.city, geo.address.state, geo.address.country]
                            .filter(Boolean)
                            .join(', ')}
                        </Typography>
                      </Stack>
                    )}
                  </Box>
                )}
                
                {/* Coordinates fallback */}
                {geo.latitude && !geo.error && !geo.address && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    📍 {geo.latitude.toFixed(5)}, {geo.longitude.toFixed(5)}
                    {geo.accuracy && ` (±${Math.round(geo.accuracy)}m)`}
                  </Typography>
                )}
                
                {/* Fetching address indicator */}
                {fetchingAddress && (
                  <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                    <CircularProgress size={12} sx={{ color: PRIMARY }} />
                    <Typography variant="caption" color="primary">
                      Getting precise address...
                    </Typography>
                  </Stack>
                )}
                
                {/* Error message */}
                {geo.error && (
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{ display: "block", lineHeight: 1.3, mt: 0.25 }}
                  >
                    {geo.error}
                  </Typography>
                )}
              </Box>
              {(geo.error || !geo.latitude) && !geo.loading && (
                <IconButton
                  size="small"
                  onClick={() => geo.fetchLocation(true)}
                  sx={{ bgcolor: alpha(PRIMARY, 0.08), flexShrink: 0 }}
                >
                  <Refresh fontSize="small" sx={{ color: PRIMARY }} />
                </IconButton>
              )}
            </Stack>
          </Paper>

          {geo.error && (
            <Alert severity="error" sx={{ borderRadius: 2, py: 0.75 }}>
              Location is required to punch in/out. Please allow access and tap
              retry.
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 2.5 },
          gap: 1.5,
          flexDirection: { xs: "column", sm: "row" },
          borderTop: `1px solid ${alpha(PRIMARY, 0.08)}`,
        }}
      >
        <Button
          fullWidth={isMobile}
          variant="outlined"
          onClick={onClose}
          disabled={punchLoading}
          sx={{
            borderRadius: 2.5,
            px: 3,
            borderColor: alpha(PRIMARY, 0.35),
            color: PRIMARY,
            order: isMobile ? 2 : 1,
          }}
        >
          Cancel
        </Button>
        <Button
          fullWidth={isMobile}
          variant="contained"
          onClick={onConfirm}
          disabled={
            punchLoading || 
            geo.loading || 
            (!geo.latitude && !geo.loading) ||
            fetchingAddress // Disable while fetching address
          }
          startIcon={
            punchLoading ? (
              <CircularProgress size={16} color="inherit" />
            ) : isPunchIn ? (
              <Login />
            ) : (
              <Logout />
            )
          }
          sx={{
            borderRadius: 2.5,
            px: 3,
            fontWeight: 700,
            order: isMobile ? 1 : 2,
            bgcolor: accentColor,
            "&:hover": { bgcolor: isPunchIn ? "#16a34a" : "#dc2626" },
          }}
        >
          {punchLoading
            ? "Processing…"
            : fetchingAddress
              ? "Getting address…"
              : isPunchIn
                ? "Confirm Punch In"
                : "Confirm Punch Out"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── MobileLogCard ────────────────────────────────────────────────────────────
const MobileLogCard = ({ entry, onView, onDelete, canDelete, index }) => {
  const [exp, setExp] = useState(false);
  const cfg = STATUS_CONFIG[entry.status] || STATUS_CONFIG.present;
  const d = new Date(entry.date);
  const ft = (ts) =>
    ts
      ? new Date(ts).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "—";

  // Get address from punch in
  const punchInAddress = entry.punchIn?.address;
  const punchOutAddress = entry.punchOut?.address;

  return (
    <Fade in timeout={350 + index * 50}>
      <Paper
        sx={{
          mb: 1.5,
          borderRadius: 3,
          border: `1px solid ${alpha(cfg.color, 0.2)}`,
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: 2 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            sx={{ mb: 1.5 }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  bgcolor: cfg.bg,
                  borderRadius: 2,
                  px: 1.25,
                  py: 0.75,
                  textAlign: "center",
                  minWidth: 52,
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight={800}
                  color={cfg.color}
                  sx={{
                    display: "block",
                    lineHeight: 1,
                    fontSize: "0.62rem",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  {d.toLocaleString("default", { month: "short" })}
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight={900}
                  lineHeight={1.1}
                  color={cfg.color}
                >
                  {d.getDate()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  {d.toLocaleDateString("en-US", { weekday: "long" })}
                </Typography>
                <StatusBadge status={entry.status || "present"} />
              </Box>
            </Stack>
            <IconButton
              size="small"
              onClick={() => setExp(!exp)}
              sx={{
                bgcolor: alpha(cfg.color, 0.08),
                transform: exp ? "rotate(180deg)" : "none",
                transition: "transform .25s",
              }}
            >
              <ExpandMore fontSize="small" />
            </IconButton>
          </Stack>

          <Grid container spacing={1} sx={{ mb: 1.5 }}>
            {[
              ["Punch In", ft(entry.punchIn?.time), SUCCESS],
              [
                "Punch Out",
                entry.punchOut ? ft(entry.punchOut.time) : "Ongoing",
                entry.punchOut ? WARNING : PRIMARY,
              ],
              ["Hours", entry.workHoursFormatted || "—", PRIMARY],
            ].map(([l, v, c]) => (
              <Grid item xs={4} key={l}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mb: 0.25, fontSize: "0.68rem" }}
                >
                  {l}
                </Typography>
                <Typography variant="body2" fontWeight={700} color={c}>
                  {v}
                </Typography>
              </Grid>
            ))}
          </Grid>

          {/* Punch In Address */}
          {punchInAddress && (
            <Stack
              direction="row"
              spacing={0.5}
              alignItems="flex-start"
              sx={{ mb: 0.5 }}
            >
              <LocationOn sx={{ fontSize: 13, color: "text.disabled", mt: 0.2 }} />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ lineHeight: 1.3 }}
              >
                <strong>In:</strong> {punchInAddress.short || punchInAddress.full?.split(',')[0] || 'Unknown'}
              </Typography>
            </Stack>
          )}

          {/* Punch Out Address */}
          {punchOutAddress && (
            <Stack
              direction="row"
              spacing={0.5}
              alignItems="flex-start"
              sx={{ mb: 0.5 }}
            >
              <LocationOn sx={{ fontSize: 13, color: "text.disabled", mt: 0.2 }} />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ lineHeight: 1.3 }}
              >
                <strong>Out:</strong> {punchOutAddress.short || punchOutAddress.full?.split(',')[0] || 'Unknown'}
              </Typography>
            </Stack>
          )}

          <Collapse in={exp}>
            <Stack
              direction="row"
              spacing={1}
              sx={{
                mt: 2,
                pt: 2,
                borderTop: `1px dashed ${alpha(cfg.color, 0.2)}`,
              }}
            >
              <Button
                fullWidth
                size="small"
                variant="contained"
                startIcon={<Visibility />}
                onClick={() => onView(entry)}
                sx={{
                  borderRadius: 2,
                  bgcolor: PRIMARY,
                  "&:hover": { bgcolor: SECONDARY },
                }}
              >
                View
              </Button>
              {canDelete && (
                <Button
                  fullWidth
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<Delete />}
                  onClick={() => onDelete(entry)}
                  sx={{ borderRadius: 2 }}
                >
                  Delete
                </Button>
              )}
            </Stack>
          </Collapse>
        </Box>
      </Paper>
    </Fade>
  );
};

// ─── LoadingSkeleton ──────────────────────────────────────────────────────────
const LoadingSkeleton = () => (
  <Box sx={{ p: { xs: 2, sm: 3 } }}>
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {[1, 2, 3, 4].map((i) => (
        <Grid item xs={6} sm={3} key={i}>
          <Skeleton
            variant="rectangular"
            height={100}
            sx={{ borderRadius: 3 }}
          />
        </Grid>
      ))}
    </Grid>
    <Skeleton
      variant="rectangular"
      height={56}
      sx={{ borderRadius: 2, mb: 2 }}
    />
    <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
  </Box>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Attandance() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { user, getUserRole } = useAuth();
  const {
    attendances,
    loading,
    error,
    success,
    pagination,
    summary,
    fetchAttendances,
    punchIn,
    punchOut,
    deleteAttendance,
    clearMessages,
  } = useAttendance();

  const geo = useGeo();
  const timer = useWorkTimer();

  // ─── Role flags ─────────────────────────────────────────────────────────────
  const userRole = getUserRole();
  const isTeam = userRole === "TEAM";
  const canManage = MANAGER_ROLES.includes(userRole);
  const canDelete = userRole === "Head_office";

  /**
   * Manager roles (Head_office, ZSM, ASM) do NOT see punch-in / punch-out UI.
   * They manage teams but do not clock attendance personally via this app.
   */
  const isManagerRole = MANAGER_ROLES.includes(userRole);

  // ─── Today's attendance ──────────────────────────────────────────────────────
  const [todayAtt, setTodayAtt] = useState(null);

  useEffect(() => {
    const ts = new Date().toDateString();
    const found =
      attendances?.find((a) => new Date(a.date).toDateString() === ts) || null;
    setTodayAtt(found);

    if (found?.punchIn && !found?.punchOut) {
      timer.start(found.punchIn.time);
    } else if (found?.punchOut) {
      timer.stop();
    } else {
      timer.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attendances]);

  const hasPunchedIn = !!todayAtt?.punchIn;
  const hasPunchedOut = !!todayAtt?.punchOut;

  // ─── State ───────────────────────────────────────────────────────────────────
  const [period, setPeriod] = useState("Today");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: "",
    search: "",
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [selLog, setSelLog] = useState(null);
  const [logOpen, setLogOpen] = useState(false);
  const [showTeam, setShowTeam] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [navValue, setNavValue] = useState(0);
  const [punchModal, setPunchModal] = useState({ open: false, mode: "in" });
  const [punchLoading, setPunchLoading] = useState(false);
  const containerRef = useRef(null);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (filters.search) n++;
    if (filters.status) n++;
    if (period !== "Today") n++;
    return n;
  }, [filters, period]);

  // ─── Load data ───────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    const q = {
      page: filters.page,
      limit: filters.limit,
      ...(filters.status && { status: filters.status }),
      ...(filters.search && { search: filters.search }),
      ...(isTeam && user?._id && { userId: user._id }),
      ...(period !== "All" && {
        period: period.toLowerCase().replace(" ", "_"),
      }),
    };
    await fetchAttendances(q);
  }, [filters, period, isTeam, user, fetchAttendances]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (error) setSnackbar({ open: true, message: error, severity: "error" });
    if (success)
      setSnackbar({ open: true, message: success, severity: "success" });
  }, [error, success]);

  // ─── Punch handlers ──────────────────────────────────────────────────────────
  const openPunchModal = useCallback(
    async (mode) => {
      if (mode === "in" && hasPunchedIn) {
        setSnackbar({
          open: true,
          message: hasPunchedOut
            ? "You have already completed attendance for today. See you tomorrow!"
            : "You are already punched in. Use Punch Out when you are done.",
          severity: "warning",
        });
        return;
      }
      if (mode === "out" && hasPunchedOut) {
        setSnackbar({
          open: true,
          message: "You have already punched out for today.",
          severity: "info",
        });
        return;
      }
      setPunchModal({ open: true, mode });
      // Pre-fetch fresh location — errors shown inside the modal
      try {
        await geo.fetchLocation(true); // Pass true to include address
      } catch {
        /* shown in modal */
      }
    },
    [geo, hasPunchedIn, hasPunchedOut],
  );

  /**
   * Handle punch confirmation with full address
   */
  const handlePunchConfirm = useCallback(async () => {
    if (punchModal.mode === "in" && hasPunchedIn) {
      setSnackbar({
        open: true,
        message: "Already punched in for today.",
        severity: "warning",
      });
      setPunchModal((s) => ({ ...s, open: false }));
      return;
    }
    if (punchModal.mode === "out" && hasPunchedOut) {
      setSnackbar({
        open: true,
        message: "Already punched out for today.",
        severity: "info",
      });
      setPunchModal((s) => ({ ...s, open: false }));
      return;
    }

    setPunchLoading(true);
    try {
      let latitude = geo.latitude;
      let longitude = geo.longitude;
      let address = geo.address;

      // If location not yet fetched, try one more time
      if (latitude === null || longitude === null) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              resolve,
              reject,
              {
                enableHighAccuracy: true,
                timeout: 30000,
                maximumAge: 0,
              }
            );
          });
          
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
          
          // Fetch address for the new coordinates
          if (!address) {
            const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
            const response = await fetch(url, {
              headers: { 
                'Accept-Language': 'en',
                'User-Agent': 'AttendanceApp/1.0'
              }
            });
            const data = await response.json();
            address = {
              full: data.display_name,
              short: data.address?.road 
                ? `${data.address.road}${data.address.house_number ? ' ' + data.address.house_number : ''}`
                : data.display_name?.split(',')[0] || 'Unknown location',
              road: data.address?.road,
              houseNumber: data.address?.house_number,
              city: data.address?.city || data.address?.town || data.address?.village,
              state: data.address?.state,
              country: data.address?.country,
              postcode: data.address?.postcode
            };
          }
        } catch (locationError) {
          console.error("Location fetch error:", locationError);
          setSnackbar({
            open: true,
            message: "Unable to get your precise location. Please ensure GPS is enabled and try again.",
            severity: "error",
          });
          setPunchLoading(false);
          return;
        }
      }

      // Validate coordinates
      if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
        setSnackbar({
          open: true,
          message: "Could not get valid location. Please try again.",
          severity: "error",
        });
        setPunchLoading(false);
        return;
      }

      const fn = punchModal.mode === "in" ? punchIn : punchOut;
      const label = punchModal.mode === "in" ? "Punch in" : "Punch out";

      // Include complete location data
      const result = await fn({
        latitude: parseFloat(latitude.toFixed(6)),
        longitude: parseFloat(longitude.toFixed(6)),
        accuracy: geo.accuracy,
        address: address
      });

      if (result?.success) {
        setSnackbar({
          open: true,
          message: `${label} successful!`,
          severity: "success",
        });
        setPunchModal({ open: false, mode: "in" });
        await loadData();
        
        // Start timer if punch in was successful
        if (punchModal.mode === "in") {
          timer.start(new Date());
        }
      } else {
        setSnackbar({
          open: true,
          message: result?.error || `${label} failed`,
          severity: "error",
        });
      }
    } catch (e) {
      console.error("Punch error:", e);
      setSnackbar({
        open: true,
        message: e.message || "Punch failed",
        severity: "error",
      });
    } finally {
      setPunchLoading(false);
    }
  }, [
    geo,
    punchModal.mode,
    hasPunchedIn,
    hasPunchedOut,
    punchIn,
    punchOut,
    loadData,
    timer,
  ]);

  // ─── Calendar ────────────────────────────────────────────────────────────────
  const calendarDays = useMemo(() => {
    const y = currentMonth.getFullYear();
    const m = currentMonth.getMonth();
    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const days = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      const d = new Date(y, m, -i);
      days.push({ day: d.getDate(), date: d, isPrev: true });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(y, m, i);
      const att = attendances?.find(
        (a) => new Date(a.date).toDateString() === date.toDateString(),
      );
      days.push({ day: i, date, status: att?.status, att });
    }
    return days;
  }, [currentMonth, attendances]);

  const DOW = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  // ─── Misc handlers ────────────────────────────────────────────────────────────
  const handleDateSelect = useCallback(
    (d) => {
      setSelectedDate(d);
      const att = attendances?.find(
        (a) => new Date(a.date).toDateString() === d.toDateString(),
      );
      if (att) {
        setSelLog(att);
        setLogOpen(true);
      }
    },
    [attendances],
  );

  const handleDeleteOpen = useCallback((att) => {
    setDeleteTarget(att);
    setDeleteOpen(true);
  }, []);
  
  const handleDeleteConfirm = useCallback(async () => {
    const id = deleteTarget?._id || deleteTarget?.id;
    if (!id) {
      setDeleteOpen(false);
      return;
    }
    const res = await deleteAttendance(id);
    if (res?.success) await loadData();
    setDeleteOpen(false);
    setDeleteTarget(null);
  }, [deleteTarget, deleteAttendance, loadData]);

  const clearFilters = useCallback(() => {
    setFilters({ page: 1, limit: 10, status: "", search: "" });
    setPeriod("Today");
  }, []);

  const setFilter = (key) => (val) =>
    setFilters((prev) => ({ ...prev, [key]: val, page: 1 }));

  const fmtDate = (ts) =>
    !ts
      ? "—"
      : new Date(ts).toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

  const fmtTime = (ts) =>
    !ts
      ? "—"
      : new Date(ts).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });

  if (loading && !attendances?.length) return <LoadingSkeleton />;

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <Box
      ref={containerRef}
      sx={{
        p: { xs: 1.5, sm: 2, md: 3 },
        minHeight: "100vh",
        pb: { xs: 9, sm: 3 },
        bgcolor: "#f4f6fb",
      }}
    >
      {/* Punch Modal — only rendered when needed */}
      <PunchModal
        open={punchModal.open}
        mode={punchModal.mode}
        onClose={() =>
          !punchLoading && setPunchModal((s) => ({ ...s, open: false }))
        }
        onConfirm={handlePunchConfirm}
        punchLoading={punchLoading}
        geo={geo}
        timer={timer}
      />

      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)`,
          color: "#fff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative blobs */}
        {[
          { w: 200, h: 200, t: -70, r: -50 },
          { w: 120, h: 120, t: 20, r: 100 },
        ].map((b, i) => (
          <Box
            key={i}
            sx={{
              position: "absolute",
              width: b.w,
              height: b.h,
              borderRadius: "50%",
              bgcolor: "#fff",
              opacity: i === 0 ? 0.05 : 0.04,
              top: b.t,
              right: b.r,
              pointerEvents: "none",
            }}
          />
        ))}

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
        >
          <Box>
            <Typography variant={isMobile ? "h6" : "h5"} fontWeight={800}>
              Attendance Dashboard
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mt: 0.5 }}
            >
              <PulsingDot
                dotcolor={
                  !isManagerRole && hasPunchedIn && !hasPunchedOut
                    ? SUCCESS
                    : "rgba(255,255,255,0.5)"
                }
              />
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                {isManagerRole
                  ? `Managing as ${userRole}`
                  : hasPunchedIn && !hasPunchedOut
                    ? "Currently clocked in"
                    : hasPunchedOut
                      ? "Clocked out for today"
                      : "Not clocked in today"}
              </Typography>
            </Stack>
          </Box>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            {/*
              Punch In / Punch Out buttons are HIDDEN for manager roles.
              Head_office, ZSM, ASM manage teams and do not personally punch attendance.
              Only TEAM role and other non-manager users see these buttons.
            */}
            {!showTeam && !isManagerRole && (
              <>
                {/* Not punched in yet */}
                {!hasPunchedIn && (
                  <Button
                    variant="contained"
                    startIcon={<Login />}
                    onClick={() => openPunchModal("in")}
                    size={isMobile ? "small" : "medium"}
                    sx={{
                      bgcolor: SUCCESS,
                      fontWeight: 700,
                      borderRadius: 2.5,
                      "&:hover": { bgcolor: "#16a34a" },
                      boxShadow: `0 4px 12px ${alpha(SUCCESS, 0.4)}`,
                    }}
                  >
                    Punch In
                  </Button>
                )}

                {/* Punched in but not out */}
                {hasPunchedIn && !hasPunchedOut && (
                  <Button
                    variant="contained"
                    startIcon={<Logout />}
                    onClick={() => openPunchModal("out")}
                    size={isMobile ? "small" : "medium"}
                    sx={{
                      bgcolor: DANGER,
                      fontWeight: 700,
                      borderRadius: 2.5,
                      "&:hover": { bgcolor: "#dc2626" },
                      boxShadow: `0 4px 12px ${alpha(DANGER, 0.4)}`,
                    }}
                  >
                    Punch Out
                  </Button>
                )}

                {/* Day complete */}
                {hasPunchedIn && hasPunchedOut && (
                  <Tooltip title="Attendance complete for today" arrow>
                    <span>
                      <Button
                        variant="contained"
                        startIcon={<CheckCircle />}
                        disabled
                        size={isMobile ? "small" : "medium"}
                        sx={{
                          fontWeight: 700,
                          borderRadius: 2.5,
                          bgcolor: "rgba(255,255,255,.15) !important",
                          color: "rgba(255,255,255,.6) !important",
                          cursor: "not-allowed",
                        }}
                      >
                        Day Complete
                      </Button>
                    </span>
                  </Tooltip>
                )}
              </>
            )}

            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={loadData}
              disabled={loading}
              size={isMobile ? "small" : "medium"}
              sx={{
                bgcolor: "rgba(255,255,255,.15)",
                color: "#fff",
                borderRadius: 2.5,
                "&:hover": { bgcolor: "rgba(255,255,255,.25)" },
              }}
            >
              Refresh
            </Button>

            {isMobile && (
              <Button
                variant="contained"
                startIcon={<FilterAlt />}
                onClick={() => setDrawerOpen(true)}
                size="small"
                sx={{
                  bgcolor: "rgba(255,255,255,.15)",
                  color: "#fff",
                  borderRadius: 2.5,
                  "&:hover": { bgcolor: "rgba(255,255,255,.25)" },
                  position: "relative",
                }}
              >
                Filter
                {activeFilterCount > 0 && (
                  <Badge
                    badgeContent={activeFilterCount}
                    color="error"
                    sx={{ position: "absolute", top: -8, right: -8 }}
                  />
                )}
              </Button>
            )}

            {canManage && (
              <Button
                variant="contained"
                startIcon={<Group />}
                onClick={() => setShowTeam((v) => !v)}
                size={isMobile ? "small" : "medium"}
                sx={{
                  bgcolor: showTeam
                    ? "rgba(255,255,255,.35)"
                    : "rgba(255,255,255,.15)",
                  color: "#fff",
                  borderRadius: 2.5,
                  "&:hover": { bgcolor: "rgba(255,255,255,.3)" },
                }}
              >
                {showTeam ? "My View" : "Team"}
              </Button>
            )}
          </Stack>
        </Stack>

        {/*
          Live timer hidden for manager roles — they don't punch in personally.
        */}
        {!isManagerRole && hasPunchedIn && !hasPunchedOut && !showTeam && (
          <Box sx={{ mt: 2 }}>
            <LiveTimer startTime={todayAtt?.punchIn?.time} isRunning={true} />
          </Box>
        )}

        {/*
          Today's summary bar hidden for manager roles.
        */}
        {!isManagerRole && !showTeam && (hasPunchedIn || hasPunchedOut) && (
          <Box
            sx={{ mt: 2, pt: 2, borderTop: "1px solid rgba(255,255,255,.15)" }}
          >
            <Stack direction="row" spacing={3} flexWrap="wrap">
              {[
                todayAtt?.punchIn && [
                  "Punch In",
                  fmtTime(todayAtt.punchIn.time),
                ],
                todayAtt?.punchOut && [
                  "Punch Out",
                  fmtTime(todayAtt.punchOut.time),
                ],
                todayAtt?.workHoursFormatted && [
                  "Work Hours",
                  todayAtt.workHoursFormatted,
                ],
                todayAtt?.status && [
                  "Status",
                  todayAtt.status.charAt(0).toUpperCase() +
                    todayAtt.status.slice(1),
                ],
              ]
                .filter(Boolean)
                .map(([label, value]) => (
                  <Box key={label}>
                    <Typography
                      variant="caption"
                      sx={{ opacity: 0.7, display: "block" }}
                    >
                      {label}
                    </Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {value}
                    </Typography>
                  </Box>
                ))}
            </Stack>
          </Box>
        )}
      </Paper>

      {showTeam && canManage ? (
        <TeamAttendance />
      ) : (
        <>
          {/* ─── Stat Cards ─────────────────────────────────────────────── */}
          <Grid container spacing={isMobile ? 1.5 : 2} sx={{ mb: 3 }}>
            {[
              {
                icon: CalendarToday,
                label: "Total Days",
                value: pagination?.totalItems || 0,
                color: PRIMARY,
                sub: "All records",
                index: 0,
              },
              {
                icon: AccessTime,
                label: "Work Hours",
                value: `${(summary?.totalWorkHours || 0).toFixed(1)}h`,
                color: "#3b82f6",
                sub: "Total logged",
                index: 1,
              },
              {
                icon: CheckCircle,
                label: "Present",
                value: summary?.presentCount || 0,
                color: SUCCESS,
                sub: "On time",
                index: 2,
              },
              {
                icon: Warning,
                label: "Late / Absent",
                value: `${summary?.lateCount || 0}/${summary?.absentCount || 0}`,
                color: WARNING,
                sub: "Needs review",
                index: 3,
              },
            ].map((props) => (
              <Grid item xs={6} sm={3} key={props.label}>
                <StatCard {...props} loading={loading} />
              </Grid>
            ))}
          </Grid>

          {/* ─── Mobile Search ───────────────────────────────────────────── */}
          {isMobile && (
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search records…"
                value={filters.search}
                onChange={(e) => setFilter("search")(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                  endAdornment: filters.search && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setFilter("search")("")}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 3, bgcolor: "#fff" },
                }}
              />
            </Box>
          )}

          {/* ─── Desktop Filters ─────────────────────────────────────────── */}
          {!isMobile && (
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                mb: 3,
                borderRadius: 3,
                border: `1px solid ${alpha(PRIMARY, 0.08)}`,
              }}
            >
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                flexWrap="wrap"
              >
                <TextField
                  size="small"
                  placeholder="Search records…"
                  value={filters.search}
                  onChange={(e) => setFilter("search")(e.target.value)}
                  sx={{ minWidth: 240 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search
                          sx={{ color: "text.secondary", fontSize: 18 }}
                        />
                      </InputAdornment>
                    ),
                    endAdornment: filters.search && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setFilter("search")("")}
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2 },
                  }}
                />
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    label="Status"
                    sx={{ borderRadius: 2 }}
                    onChange={(e) => setFilter("status")(e.target.value)}
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                      <MenuItem key={k} value={k}>
                        {v.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Period</InputLabel>
                  <Select
                    value={period}
                    label="Period"
                    sx={{ borderRadius: 2 }}
                    onChange={(e) => setPeriod(e.target.value)}
                  >
                    {PERIOD_OPTIONS.map((o) => (
                      <MenuItem key={o.value} value={o.value}>
                        {o.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {activeFilterCount > 0 && (
                  <Button
                    variant="text"
                    startIcon={<Clear />}
                    onClick={clearFilters}
                    sx={{ color: DANGER, fontWeight: 600 }}
                  >
                    Clear All
                  </Button>
                )}
              </Stack>

              {activeFilterCount > 0 && (
                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  sx={{ mt: 1.5 }}
                >
                  {filters.search && (
                    <Chip
                      size="small"
                      label={`Search: "${filters.search}"`}
                      onDelete={() => setFilter("search")("")}
                      sx={{ bgcolor: alpha(PRIMARY, 0.08), color: PRIMARY }}
                    />
                  )}
                  {filters.status && (
                    <Chip
                      size="small"
                      label={`Status: ${filters.status}`}
                      onDelete={() => setFilter("status")("")}
                      sx={{ bgcolor: alpha(PRIMARY, 0.08), color: PRIMARY }}
                    />
                  )}
                  {period !== "Today" && (
                    <Chip
                      size="small"
                      label={`Period: ${period}`}
                      onDelete={() => setPeriod("Today")}
                      sx={{ bgcolor: alpha(PRIMARY, 0.08), color: PRIMARY }}
                    />
                  )}
                </Stack>
              )}
            </Paper>
          )}

          {/* ─── Main Grid ──────────────────────────────────────────────── */}
          <Grid container spacing={isMobile ? 2 : 3}>
            {/* Calendar */}
            <Grid item xs={12} md={5} lg={4}>
              <GlassCard>
                <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 2.5 }}
                  >
                    <Typography variant="h6" fontWeight={700}>
                      {currentMonth.toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </Typography>
                    <Stack direction="row" spacing={0.5}>
                      {[
                        { icon: <ChevronLeft fontSize="small" />, dir: -1 },
                        { icon: <ChevronRight fontSize="small" />, dir: 1 },
                      ].map(({ icon, dir }) => (
                        <IconButton
                          key={dir}
                          size="small"
                          onClick={() =>
                            setCurrentMonth(
                              (d) =>
                                new Date(
                                  d.getFullYear(),
                                  d.getMonth() + dir,
                                  1,
                                ),
                            )
                          }
                          sx={{
                            bgcolor: alpha(PRIMARY, 0.07),
                            "&:hover": { bgcolor: alpha(PRIMARY, 0.14) },
                          }}
                        >
                          {icon}
                        </IconButton>
                      ))}
                    </Stack>
                  </Stack>

                  <Grid container columns={7} spacing={0.25} sx={{ mb: 0.5 }}>
                    {DOW.map((d) => (
                      <Grid item xs={1} key={d}>
                        <Typography
                          align="center"
                          variant="caption"
                          fontWeight={700}
                          color="text.disabled"
                          sx={{ display: "block", fontSize: "0.6rem" }}
                        >
                          {d}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>

                  <Grid container columns={7} spacing={0.25}>
                    {calendarDays.map((c, i) => (
                      <Grid item xs={1} key={i}>
                        <CalCell
                          day={c.day}
                          isPrev={c.isPrev}
                          isSelected={
                            c.date?.toDateString() ===
                            selectedDate.toDateString()
                          }
                          isToday={
                            c.date?.toDateString() === new Date().toDateString()
                          }
                          isWeekend={c.date && [0, 6].includes(c.date.getDay())}
                          status={c.status}
                          onClick={() =>
                            !c.isPrev && c.date && handleDateSelect(c.date)
                          }
                        />
                      </Grid>
                    ))}
                  </Grid>

                  <Box
                    sx={{
                      mt: 2.5,
                      pt: 2,
                      borderTop: `1px solid ${alpha(PRIMARY, 0.08)}`,
                    }}
                  >
                    <Grid container spacing={1}>
                      {[
                        ["Present", SUCCESS],
                        ["Late", WARNING],
                        ["Absent", DANGER],
                        ["Holiday", "#3b82f6"],
                      ].map(([l, c]) => (
                        <Grid item xs={6} key={l}>
                          <Stack
                            direction="row"
                            spacing={0.75}
                            alignItems="center"
                          >
                            <Box
                              sx={{
                                width: 9,
                                height: 9,
                                borderRadius: "50%",
                                bgcolor: c,
                                flexShrink: 0,
                              }}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {l}
                            </Typography>
                          </Stack>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </CardContent>
              </GlassCard>
            </Grid>

            {/* Attendance Log */}
            <Grid item xs={12} md={7} lg={8}>
              <GlassCard sx={{ height: "100%" }}>
                <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 2.5 }}
                  >
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        Attendance Log
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {pagination?.totalItems || 0} total records
                      </Typography>
                    </Box>
                    {loading && (
                      <CircularProgress size={20} sx={{ color: PRIMARY }} />
                    )}
                  </Stack>

                  {attendances?.length > 0 ? (
                    <>
                      {isMobile ? (
                        <Box>
                          {attendances.map((a, i) => (
                            <MobileLogCard
                              key={a._id || a.id}
                              entry={a}
                              onView={(e) => {
                                setSelLog(e);
                                setLogOpen(true);
                              }}
                              onDelete={handleDeleteOpen}
                              canDelete={canDelete}
                              index={i}
                            />
                          ))}
                        </Box>
                      ) : (
                        <TableContainer sx={{ maxHeight: 460 }}>
                          <Table stickyHeader size="small">
                            <TableHead>
                              <TableRow>
                                {[
                                  "Date",
                                  "Punch In",
                                  "Punch Out",
                                  "Hours",
                                  "Status",
                                  "Actions",
                                ].map((h) => (
                                  <TableCell
                                    key={h}
                                    sx={{
                                      bgcolor: alpha(PRIMARY, 0.04),
                                      fontWeight: 700,
                                      fontSize: "0.76rem",
                                      borderBottom: `2px solid ${alpha(PRIMARY, 0.1)}`,
                                    }}
                                  >
                                    {h}
                                  </TableCell>
                                ))}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {attendances.map((a) => (
                                <TableRow
                                  key={a._id || a.id}
                                  hover
                                  sx={{
                                    "&:hover": {
                                      bgcolor: alpha(PRIMARY, 0.02),
                                    },
                                  }}
                                >
                                  <TableCell>
                                    <Typography
                                      variant="body2"
                                      fontWeight={600}
                                    >
                                      {fmtDate(a.date)}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    {a.punchIn ? (
                                      <Chip
                                        label={fmtTime(a.punchIn.time)}
                                        size="small"
                                        sx={{
                                          bgcolor: alpha(SUCCESS, 0.1),
                                          color: SUCCESS,
                                          fontWeight: 700,
                                          fontSize: "0.72rem",
                                        }}
                                      />
                                    ) : (
                                      <Typography
                                        variant="body2"
                                        color="text.disabled"
                                      >
                                        —
                                      </Typography>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {a.punchOut ? (
                                      <Chip
                                        label={fmtTime(a.punchOut.time)}
                                        size="small"
                                        sx={{
                                          bgcolor: alpha(WARNING, 0.1),
                                          color: WARNING,
                                          fontWeight: 700,
                                          fontSize: "0.72rem",
                                        }}
                                      />
                                    ) : a.punchIn ? (
                                      <Chip
                                        label="Ongoing"
                                        size="small"
                                        variant="outlined"
                                        sx={{
                                          color: PRIMARY,
                                          borderColor: PRIMARY,
                                          fontWeight: 700,
                                        }}
                                      />
                                    ) : (
                                      <Typography
                                        variant="body2"
                                        color="text.disabled"
                                      >
                                        —
                                      </Typography>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Typography
                                      variant="body2"
                                      fontWeight={700}
                                      color={PRIMARY}
                                    >
                                      {a.workHoursFormatted || "—"}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <StatusBadge
                                      status={a.status || "present"}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Stack direction="row" spacing={0.5}>
                                      <Tooltip title="View Details">
                                        <IconButton
                                          size="small"
                                          onClick={() => {
                                            setSelLog(a);
                                            setLogOpen(true);
                                          }}
                                          sx={{
                                            color: PRIMARY,
                                            "&:hover": {
                                              bgcolor: alpha(PRIMARY, 0.08),
                                            },
                                          }}
                                        >
                                          <Visibility fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                      {canDelete && (
                                        <Tooltip title="Delete">
                                          <IconButton
                                            size="small"
                                            onClick={() => handleDeleteOpen(a)}
                                            sx={{
                                              color: DANGER,
                                              "&:hover": {
                                                bgcolor: alpha(DANGER, 0.08),
                                              },
                                            }}
                                          >
                                            <Delete fontSize="small" />
                                          </IconButton>
                                        </Tooltip>
                                      )}
                                    </Stack>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}

                      {pagination?.totalPages > 1 && (
                        <Box
                          display="flex"
                          justifyContent="center"
                          sx={{ mt: 2.5 }}
                        >
                          <Pagination
                            count={pagination.totalPages}
                            page={filters.page}
                            onChange={(_, v) => {
                              setFilters((p) => ({ ...p, page: v }));
                              containerRef.current?.scrollIntoView({
                                behavior: "smooth",
                              });
                            }}
                            color="primary"
                            shape="rounded"
                            size={isMobile ? "small" : "medium"}
                            sx={{
                              "& .MuiPaginationItem-root.Mui-selected": {
                                bgcolor: PRIMARY,
                                color: "#fff",
                              },
                            }}
                          />
                        </Box>
                      )}
                    </>
                  ) : (
                    <Box sx={{ textAlign: "center", py: 7 }}>
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: "50%",
                          bgcolor: alpha(PRIMARY, 0.08),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mx: "auto",
                          mb: 2,
                        }}
                      >
                        <CalendarToday sx={{ fontSize: 36, color: PRIMARY }} />
                      </Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        No records found
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: activeFilterCount ? 2.5 : 0 }}
                      >
                        {activeFilterCount
                          ? "No records match your current filters."
                          : "Your attendance records will appear here."}
                      </Typography>
                      {activeFilterCount > 0 && (
                        <Button
                          variant="contained"
                          startIcon={<Clear />}
                          onClick={clearFilters}
                          sx={{ bgcolor: PRIMARY, borderRadius: 2 }}
                        >
                          Clear Filters
                        </Button>
                      )}
                    </Box>
                  )}
                </CardContent>
              </GlassCard>
            </Grid>
          </Grid>
        </>
      )}

      {/* ─── Mobile Filter Drawer ─────────────────────────────────────────── */}
      <SwipeableDrawer
        anchor="bottom"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpen={() => {}}
        PaperProps={{
          sx: { borderTopLeftRadius: 24, borderTopRightRadius: 24 },
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 4,
            bgcolor: "grey.300",
            borderRadius: 2,
            mx: "auto",
            my: 1.5,
          }}
        />
        <Box sx={{ px: 3, pb: 3 }}>
          <Typography
            variant="h6"
            fontWeight={700}
            color={PRIMARY}
            sx={{ mb: 2.5 }}
          >
            Filter Attendance
          </Typography>
          <Stack spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                sx={{ borderRadius: 2 }}
                onChange={(e) => setFilter("status")(e.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <MenuItem key={k} value={k}>
                    {v.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Period</InputLabel>
              <Select
                value={period}
                label="Period"
                sx={{ borderRadius: 2 }}
                onChange={(e) => setPeriod(e.target.value)}
              >
                {PERIOD_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Stack direction="row" spacing={1.5}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Clear />}
                onClick={() => {
                  clearFilters();
                  setDrawerOpen(false);
                }}
                sx={{
                  borderRadius: 2,
                  borderColor: alpha(PRIMARY, 0.35),
                  color: PRIMARY,
                }}
              >
                Clear
              </Button>
              <Button
                fullWidth
                variant="contained"
                onClick={() => setDrawerOpen(false)}
                sx={{ borderRadius: 2, bgcolor: PRIMARY }}
              >
                Apply
              </Button>
            </Stack>
          </Stack>
        </Box>
      </SwipeableDrawer>

      {/* ─── Mobile FAB ──────────────────────────────────────────────────── */}
      {isMobile && !showTeam && (
        <Zoom in>
          <Fab
            size="medium"
            onClick={() => setDrawerOpen(true)}
            sx={{
              position: "fixed",
              bottom: 80,
              right: 16,
              zIndex: 1000,
              bgcolor: PRIMARY,
              color: "#fff",
              boxShadow: `0 4px 16px ${alpha(PRIMARY, 0.38)}`,
              "&:hover": { bgcolor: SECONDARY },
            }}
          >
            <Badge badgeContent={activeFilterCount} color="error">
              <FilterAlt />
            </Badge>
          </Fab>
        </Zoom>
      )}

      {/* ─── Bottom Navigation ────────────────────────────────────────────── */}
      {isMobile && (
        <Paper
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            borderRadius: 0,
            borderTop: `1px solid ${alpha(PRIMARY, 0.1)}`,
          }}
          elevation={3}
        >
          <BottomNavigation
            showLabels
            value={navValue}
            onChange={(_, v) => {
              setNavValue(v);
              if (v === 0) window.scrollTo({ top: 0, behavior: "smooth" });
              else if (v === 1) navigate("/dashboard");
            }}
            sx={{ height: 60, "& .Mui-selected": { color: PRIMARY } }}
          >
            <BottomNavigationAction
              label="Attendance"
              icon={<CalendarToday />}
            />
            <BottomNavigationAction label="Dashboard" icon={<Dashboard />} />
          </BottomNavigation>
        </Paper>
      )}

      {/* ─── Attendance Details Modal ─────────────────────────────────────── */}
      <AttendanceDetails
        open={logOpen}
        onClose={() => setLogOpen(false)}
        attendance={selLog}
        canEdit={canManage}
        canDelete={canDelete}
        onDelete={handleDeleteOpen}
      />

      {/* ─── Delete Confirmation ──────────────────────────────────────────── */}
      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, overflow: "hidden" } }}
      >
        <Box sx={{ height: 5, bgcolor: DANGER }} />
        <DialogTitle sx={{ pt: 2.5, pb: 1 }}>
          <Typography variant="h6" fontWeight={700}>
            Confirm Delete
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            This action cannot be undone.
          </Alert>
          {deleteTarget && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(DANGER, 0.04),
                border: `1px solid ${alpha(DANGER, 0.12)}`,
              }}
            >
              <Typography variant="body2">
                <strong>Date:</strong> {fmtDate(deleteTarget.date)}
                <br />
                <strong>Status:</strong> {deleteTarget.status}
              </Typography>
              {deleteTarget.punchIn?.address && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Location:</strong> {deleteTarget.punchIn.address.short}
                </Typography>
              )}
            </Paper>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            pb: 3,
            gap: 1.5,
            borderTop: `1px solid ${alpha(DANGER, 0.08)}`,
          }}
        >
          <Button
            variant="outlined"
            onClick={() => setDeleteOpen(false)}
            sx={{
              borderRadius: 2,
              borderColor: alpha(PRIMARY, 0.35),
              color: PRIMARY,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            sx={{ borderRadius: 2 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Snackbar ─────────────────────────────────────────────────────── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => {
          setSnackbar((s) => ({ ...s, open: false }));
          clearMessages();
        }}
        anchorOrigin={{
          vertical: isMobile ? "top" : "bottom",
          horizontal: isMobile ? "center" : "right",
        }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: 2, color: "#fff", fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}