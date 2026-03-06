// components/RouteHistory.jsx
// Clean alternative design — Mobile-first, card-based, refined dark UI
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  Stack,
  Chip,
  Divider,
  Grid,
  Drawer,
  Tooltip,
  Fade,
  Alert,
  Snackbar,
  Skeleton,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Slider,
  Switch,
  FormControlLabel,
  Collapse,
  Card,
  CardContent,
  Dialog,
  LinearProgress,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from "@mui/material";
import { styled, alpha, keyframes } from "@mui/material/styles";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  ArrowBack,
  ChevronLeft,
  ChevronRight,
  Today,
  People,
  Menu as MenuIcon,
  Close,
  ZoomIn,
  ZoomOut,
  GpsFixed,
  MyLocation,
  Fullscreen,
  FullscreenExit,
  Map,
  Satellite,
  Terrain,
  PlayArrow,
  Pause,
  Replay,
  Stop,
  AccessTime,
  DirectionsCar,
  Verified,
  Assessment,
  FilterList,
  KeyboardArrowUp,
  KeyboardArrowDown,
  Timeline as TimelineIcon,
  LocationOn,
  Speed,
  CheckCircle,
  RadioButtonChecked,
  NavigateNext,
  Place,
  Navigation,
  WifiOff,
  Wifi,
  Download,
  FileDownload,
  TableChart,
  Csv as CsvIcon,
  Excel as ExcelIcon
} from '@mui/icons-material';
import { format, subDays, isToday } from "date-fns";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
  Polyline,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// ─── TOKENS ──────────────────────────────────────────────────────────────────
const C = {
  bg: "#0d1117",
  surface: "#161b22",
  border: "#21262d",
  accent: "#3b82f6",
  accentLt: "#60a5fa",
  success: "#22c55e",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#38bdf8",
  text: "#e6edf3",
  muted: "#7d8590",
  card: "#1c2128",
};

const pulse = keyframes`
  0%,100% { opacity:1; transform:scale(1); box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
  50% { opacity:.9; transform:scale(1.15); box-shadow: 0 0 0 6px rgba(34,197,94,0); }
`;

const libraries = ["places", "geometry", "directions"];

// ─── STYLED ──────────────────────────────────────────────────────────────────
const FloatingCard = styled(Paper)(() => ({
  background: "rgba(22,27,34,0.92)",
  backdropFilter: "blur(16px)",
  border: `1px solid ${C.border}`,
  borderRadius: 14,
  boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
}));

const PingDot = styled(Box)(({ alive }) => ({
  width: 8,
  height: 8,
  borderRadius: "50%",
  background: alive ? C.success : C.error,
  animation: alive ? `${pulse} 2s infinite` : "none",
  flexShrink: 0,
}));

const StatBox = styled(Box)(() => ({
  background: C.card,
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  padding: "10px 14px",
  display: "flex",
  flexDirection: "column",
  gap: 2,
}));

const VisitRow = styled(Box)(({ selected }) => ({
  background: selected
    ? `linear-gradient(135deg, ${alpha(C.accent, 0.15)}, ${alpha(C.accent, 0.05)})`
    : C.card,
  border: `1px solid ${selected ? alpha(C.accent, 0.5) : C.border}`,
  borderRadius: 12,
  padding: "12px 14px",
  cursor: "pointer",
  transition: "all 0.18s ease",
  "&:hover": {
    border: `1px solid ${alpha(C.accent, 0.4)}`,
    background: selected ? undefined : alpha(C.accent, 0.06),
    transform: "translateX(2px)",
  },
}));

const MapControl = styled(Paper)(() => ({
  background: "rgba(22,27,34,0.88)",
  backdropFilter: "blur(12px)",
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
}));

const CtrlBtn = styled(IconButton)(() => ({
  borderRadius: 0,
  padding: 10,
  color: C.muted,
  "&:hover": { background: alpha(C.accent, 0.12), color: C.accentLt },
}));

const mapOptions = {
  disableDefaultUI: true,
  styles: [
    { elementType: "geometry", stylers: [{ color: "#1a1f2e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#0d1117" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#7d8590" }] },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#21262d" }],
    },
    {
      featureType: "road.arterial",
      elementType: "geometry",
      stylers: [{ color: "#2d333b" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#30363d" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#0d1117" }],
    },
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
    { featureType: "transit", stylers: [{ visibility: "off" }] },
  ],
};

// ─── EXPORT FUNCTIONS ────────────────────────────────────────────────────────
const exportToCSV = (visits, date) => {
  try {
    // Prepare data for CSV
    const csvData = visits.map((visit, index) => ({
      'S.No': index + 1,
      'Visit ID': visit._id || 'N/A',
      'Location Name': visit.locationName || 'N/A',
      'Address': visit.address || 'N/A',
      'Latitude': visit.coordinates?.lat?.toFixed(6) || 'N/A',
      'Longitude': visit.coordinates?.lng?.toFixed(6) || 'N/A',
      'Status': visit.status || 'N/A',
      'Date & Time': visit.createdAt ? format(new Date(visit.createdAt), 'dd/MM/yyyy hh:mm a') : 'N/A',
      'Distance (km)': visit.distanceFromPreviousKm?.toFixed(2) || '0',
      'Duration (min)': visit.timeSpentMinutes || '0',
      'Contact Person': visit.contactPerson || 'N/A',
      'Phone': visit.phone || 'N/A',
      'Email': visit.email || 'N/A',
      'Remarks': visit.remarks || 'N/A',
      'Photos Count': visit.photos?.length || 0,
      'Verified': visit.verified ? 'Yes' : 'No',
      'User': visit.user?.firstName && visit.user?.lastName ? 
        `${visit.user.firstName} ${visit.user.lastName}` : 'N/A',
      'User Email': visit.user?.email || 'N/A'
    }));

    // Convert to CSV
    const worksheet = XLSX.utils.json_to_sheet(csvData);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    
    // Create and download file
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const fileName = `route-history-${format(date, 'yyyy-MM-dd')}.csv`;
    saveAs(blob, fileName);
    
    return true;
  } catch (error) {
    console.error('CSV Export error:', error);
    return false;
  }
};

const exportToExcel = (visits, date) => {
  try {
    // Prepare data for Excel
    const excelData = visits.map((visit, index) => ({
      'S.No': index + 1,
      'Visit ID': visit._id || 'N/A',
      'Location Name': visit.locationName || 'N/A',
      'Address': visit.address || 'N/A',
      'Latitude': visit.coordinates?.lat || 'N/A',
      'Longitude': visit.coordinates?.lng || 'N/A',
      'Status': visit.status || 'N/A',
      'Date': visit.createdAt ? format(new Date(visit.createdAt), 'dd/MM/yyyy') : 'N/A',
      'Time': visit.createdAt ? format(new Date(visit.createdAt), 'hh:mm:ss a') : 'N/A',
      'Distance (km)': visit.distanceFromPreviousKm || 0,
      'Duration (min)': visit.timeSpentMinutes || 0,
      'Contact Person': visit.contactPerson || 'N/A',
      'Phone': visit.phone || 'N/A',
      'Email': visit.email || 'N/A',
      'Remarks': visit.remarks || 'N/A',
      'Photos Count': visit.photos?.length || 0,
      'Verified': visit.verified ? 'Yes' : 'No',
      'User Name': visit.user?.firstName && visit.user?.lastName ? 
        `${visit.user.firstName} ${visit.user.lastName}` : 'N/A',
      'User Email': visit.user?.email || 'N/A',
      'User Role': visit.user?.role || 'N/A'
    }));

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Route History');
    
    // Generate Excel file
    const fileName = `route-history-${format(date, 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    return true;
  } catch (error) {
    console.error('Excel Export error:', error);
    return false;
  }
};

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export default function RouteHistory() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const {
    user,
    fetchAPI,
    startWatchingPosition,
    stopWatchingPosition,
    socket,
    onlineUsers,
    locationState,
  } = useAuth();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [map, setMap] = useState(null);
  const [mapType, setMapType] = useState("roadmap");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [activeVisit, setActiveVisit] = useState(null);
  const [directions, setDirections] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visits, setVisits] = useState([]);
  const [dailyRoute, setDailyRoute] = useState([]);
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [timeSlider, setTimeSlider] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1);
  const [statsOpen, setStatsOpen] = useState(true);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [showTeam, setShowTeam] = useState(false);
  const [teamLocations, setTeamLocations] = useState([]);
  const [selectedTeamMember, setSelectedTeamMember] = useState(null);
  const [exportAnchor, setExportAnchor] = useState(null);
  const [filters, setFilters] = useState({
    showCompleted: true,
    showInProgress: true,
    showCancelled: false,
  });

  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const watchIdRef = useRef(null);

  // ── Socket ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;
    socket.on("team:location", (data) => {
      setTeamLocations((prev) => {
        const idx = prev.findIndex((t) => t.userId === data.userId);
        if (idx >= 0) {
          const u = [...prev];
          u[idx] = { ...u[idx], ...data };
          return u;
        }
        return [...prev, data];
      });
    });
    socket.on("team:visit", (data) => {
      if (data.userId !== user?._id) {
        showSnackbar(`New visit logged`, "info");
        fetchVisits();
      }
    });
    return () => {
      socket.off("team:location");
      socket.off("team:visit");
    };
  }, [socket, user]);

  // ── Data ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchVisits();
    return () => {
      if (watchIdRef.current) stopLiveTracking();
    };
  }, [selectedDate]);

  const fetchVisits = async () => {
    try {
      setLoading(true);
      const s = new Date(selectedDate);
      s.setHours(0, 0, 0, 0);
      const e = new Date(selectedDate);
      e.setHours(23, 59, 59, 999);
      const res = await fetchAPI(
        `/visit?startDate=${s.toISOString()}&endDate=${e.toISOString()}&limit=50`,
      );
      if (res.success && res.result?.visits) {
        const v = res.result.visits;
        setVisits(v);
        buildRoute(v);
        calcTotals(v);
      }
    } catch {
      showSnackbar("Failed to load visits", "error");
    } finally {
      setLoading(false);
    }
  };

  const buildRoute = (data) => {
    const sorted = [...data].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    );
    const route = [];
    sorted.forEach((v) => {
      if (v.coordinates) {
        route.push({
          lat: v.coordinates.lat,
          lng: v.coordinates.lng,
          time: new Date(v.createdAt),
          locationName: v.locationName,
          status: v.status,
          verified: v.verified,
          photos: v.photos?.length || 0,
          distance: v.distanceFromPreviousKm || 0,
          id: v._id,
          address: v.address,
          _id: v._id,
        });
      }
    });
    setDailyRoute(route);
    if (map && route.length) fitBounds(route);
  };

  const calcTotals = (data) => {
    let mins = 0,
      dist = 0;
    data.forEach((v) => {
      mins += v.timeSpentMinutes || 0;
      dist += v.distanceFromPreviousKm || 0;
    });
    setTotalTime(mins);
    setTotalDistance(dist);
  };

  // ── Live Tracking ──────────────────────────────────────────────────────────
  const startLiveTracking = useCallback(() => {
    setIsLiveTracking(true);
    watchIdRef.current = startWatchingPosition(
      (pos) => {
        setUserLocation({
          lat: pos.lat,
          lng: pos.lng,
          accuracy: pos.accuracy,
          speed: pos.speed || 0,
        });
        setCurrentSpeed(pos.speed || 0);
        setLocationHistory((prev) => {
          const n = [
            ...prev,
            { lat: pos.lat, lng: pos.lng, timestamp: pos.timestamp },
          ];
          return n.length > 1000 ? n.slice(-1000) : n;
        });
      },
      () => {
        setIsLiveTracking(false);
        showSnackbar("Location tracking failed", "error");
      },
    );
  }, [startWatchingPosition]);

  const stopLiveTracking = useCallback(() => {
    setIsLiveTracking(false);
    stopWatchingPosition();
    setLocationHistory([]);
    setCurrentSpeed(0);
    watchIdRef.current = null;
  }, [stopWatchingPosition]);

  // ── Map ─────────────────────────────────────────────────────────────────────
  const fitBounds = (route) => {
    if (!map || !route.length) return;
    const bounds = new window.google.maps.LatLngBounds();
    route.forEach((p) => bounds.extend(p));
    if (userLocation) bounds.extend(userLocation);
    map.fitBounds(bounds);
    const l = map.addListener("idle", () => {
      if (map.getZoom() > 16) map.setZoom(16);
      window.google.maps.event.removeListener(l);
    });
  };

  const handleMapLoad = (m) => {
    setMap(m);
    setMapLoaded(true);
    if (dailyRoute.length) fitBounds(dailyRoute);
  };
  const handleZoomIn = () => map?.setZoom(map.getZoom() + 1);
  const handleZoomOut = () => map?.setZoom(map.getZoom() - 1);
  const handleMyLoc = () => {
    if (userLocation) {
      map.panTo(userLocation);
      map.setZoom(17);
    } else startLiveTracking();
  };
  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // ── Route Animation ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isPlaying || !dailyRoute.length || !map) return;
    let step = Math.round((timeSlider / 100) * (dailyRoute.length - 1));
    const tick = () => {
      if (step >= dailyRoute.length - 1) {
        setIsPlaying(false);
        return;
      }
      step++;
      setTimeSlider((step / (dailyRoute.length - 1)) * 100);
      setActiveVisit(dailyRoute[step]);
      map.panTo(dailyRoute[step]);
      animationRef.current = setTimeout(tick, 800 / playSpeed);
    };
    animationRef.current = setTimeout(tick, 800 / playSpeed);
    return () => clearTimeout(animationRef.current);
  }, [isPlaying]);

  // ── Directions ──────────────────────────────────────────────────────────────
  const getDirections = async (dest) => {
    if (!window.google || !userLocation || !dest) return;
    const svc = new window.google.maps.DirectionsService();
    try {
      const r = await svc.route({
        origin: userLocation,
        destination: dest,
        travelMode: window.google.maps.TravelMode.DRIVING,
      });
      setDirections(r);
    } catch {
      showSnackbar("Could not calculate directions", "error");
    }
  };

  // ── Export Handlers ─────────────────────────────────────────────────────────
  const handleExportClick = (event) => {
    setExportAnchor(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportAnchor(null);
  };

  const handleExportCSV = () => {
    const success = exportToCSV(visits, selectedDate);
    if (success) {
      showSnackbar(`CSV exported successfully (${visits.length} records)`, "success");
    } else {
      showSnackbar("Failed to export CSV", "error");
    }
    handleExportClose();
  };

  const handleExportExcel = () => {
    const success = exportToExcel(visits, selectedDate);
    if (success) {
      showSnackbar(`Excel exported successfully (${visits.length} records)`, "success");
    } else {
      showSnackbar("Failed to export Excel", "error");
    }
    handleExportClose();
  };

  const handleExportJSON = () => {
    try {
      const exportData = {
        date: format(selectedDate, 'yyyy-MM-dd'),
        totalVisits: visits.length,
        totalDistance: totalDistance,
        totalTime: totalTime,
        visits: visits.map(v => ({
          ...v,
          createdAt: v.createdAt,
          updatedAt: v.updatedAt
        }))
      };
      
      const blob = new Blob(
        [JSON.stringify(exportData, null, 2)],
        { type: 'application/json' }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `route-data-${format(selectedDate, 'yyyy-MM-dd')}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      showSnackbar("JSON exported successfully", "success");
    } catch {
      showSnackbar("Failed to export JSON", "error");
    }
    handleExportClose();
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const showSnackbar = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });

  const statusColor = (s) =>
    ({ Completed: C.success, InProgress: C.warning, Cancelled: C.error })[s] ||
    C.info;
  const statusLabel = (s) =>
    ({
      Completed: "Done",
      InProgress: "Active",
      Cancelled: "Cancelled",
      Scheduled: "Scheduled",
    })[s] || s;

  const mkIcon = (status, verified, isActive) => ({
    path: window.google?.maps?.SymbolPath?.CIRCLE,
    fillColor: statusColor(status),
    fillOpacity: verified ? 1 : 0.7,
    strokeColor: isActive ? "#ffffff" : "rgba(255,255,255,0.6)",
    strokeWeight: isActive ? 3 : 2,
    scale: isActive ? 14 : verified ? 11 : 9,
  });

  const mkTeamIcon = () => ({
    path: window.google?.maps?.SymbolPath?.CIRCLE,
    fillColor: C.info,
    fillOpacity: 1,
    strokeColor: "#ffffff",
    strokeWeight: 2,
    scale: 10,
  });

  const filteredVisits = useMemo(
    () =>
      visits.filter((v) => {
        if (!filters.showCompleted && v.status === "Completed") return false;
        if (!filters.showInProgress && v.status === "InProgress") return false;
        if (!filters.showCancelled && v.status === "Cancelled") return false;
        return true;
      }),
    [visits, filters],
  );

  const completedCount = visits.filter((v) => v.status === "Completed").length;

  // ─── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <Box
      ref={containerRef}
      sx={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        bgcolor: C.bg,
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* ── TOP HEADER ─────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          p: isMobile ? "10px 12px" : "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background:
            "linear-gradient(180deg, rgba(13,17,23,0.97) 60%, transparent)",
        }}
      >
        {/* Left */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <IconButton
            size="small"
            onClick={() => navigate(-1)}
            sx={{
              color: C.text,
              bgcolor: alpha(C.border, 0.8),
              border: `1px solid ${C.border}`,
              borderRadius: 2,
              p: "6px",
            }}
          >
            <ArrowBack sx={{ fontSize: 18 }} />
          </IconButton>

          <Box>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: isMobile ? 15 : 17,
                color: C.text,
                lineHeight: 1.2,
              }}
            >
              Route History
            </Typography>
            <Typography sx={{ fontSize: 11, color: C.muted, lineHeight: 1.2 }}>
              {format(selectedDate, "EEE, MMM d yyyy")}
            </Typography>
          </Box>
        </Box>

        {/* Date nav */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={() => setSelectedDate((d) => subDays(d, 1))}
            sx={{ color: C.muted, p: "5px" }}
          >
            <ChevronLeft sx={{ fontSize: 18 }} />
          </IconButton>
          <Button
            size="small"
            onClick={() => setDatePickerOpen(true)}
            startIcon={<Today sx={{ fontSize: 14 }} />}
            sx={{
              fontSize: 12,
              fontWeight: 600,
              color: C.accentLt,
              bgcolor: alpha(C.accent, 0.12),
              border: `1px solid ${alpha(C.accent, 0.25)}`,
              borderRadius: 2,
              px: 1.5,
              py: 0.5,
              minWidth: 0,
              "&:hover": { bgcolor: alpha(C.accent, 0.2) },
            }}
          >
            {isToday(selectedDate) ? "Today" : format(selectedDate, "MMM d")}
          </Button>
          <IconButton
            size="small"
            onClick={() =>
              setSelectedDate((d) => {
                const n = new Date(d);
                n.setDate(n.getDate() + 1);
                return n;
              })
            }
            disabled={isToday(selectedDate)}
            sx={{ color: C.muted, p: "5px" }}
          >
            <ChevronRight sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* Right */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Tooltip title="Team Tracking">
            <IconButton
              size="small"
              onClick={() => setShowTeam((t) => !t)}
              sx={{
                color: showTeam ? C.success : C.muted,
                bgcolor: showTeam
                  ? alpha(C.success, 0.12)
                  : alpha(C.border, 0.6),
                border: `1px solid ${showTeam ? alpha(C.success, 0.3) : C.border}`,
                borderRadius: 2,
                p: "6px",
              }}
            >
              <Badge
                badgeContent={onlineUsers?.length || 0}
                color="success"
                sx={{
                  "& .MuiBadge-badge": {
                    fontSize: 9,
                    minWidth: 14,
                    height: 14,
                  },
                }}
              >
                <People sx={{ fontSize: 16 }} />
              </Badge>
            </IconButton>
          </Tooltip>
          <IconButton
            size="small"
            onClick={() => setPanelOpen(true)}
            sx={{
              color: C.text,
              bgcolor: alpha(C.border, 0.8),
              border: `1px solid ${C.border}`,
              borderRadius: 2,
              p: "6px",
            }}
          >
            <TimelineIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Box>

      {/* ── MAP ────────────────────────────────────────────────────────────────── */}
      <Box sx={{ flex: 1, position: "relative" }}>
        <LoadScript
          googleMapsApiKey="AIzaSyCqM7uF9c0ZMQjdssHqSMJJ3mBcmz5RNS0"
          libraries={libraries}
          loadingElement={
            <Box
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: C.bg,
              }}
            >
              <CircularProgress sx={{ color: C.accent }} size={28} />
            </Box>
          }
        >
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={userLocation || { lat: 20.5937, lng: 78.9629 }}
            zoom={12}
            options={{ ...mapOptions, mapTypeId: mapType }}
            onLoad={handleMapLoad}
          >
            {/* Live tracking path */}
            {isLiveTracking && locationHistory.length > 1 && (
              <Polyline
                path={locationHistory}
                options={{
                  strokeColor: C.success,
                  strokeOpacity: 0.5,
                  strokeWeight: 3,
                }}
              />
            )}

            {/* Daily route path */}
            {dailyRoute.length > 1 && (
              <Polyline
                path={dailyRoute}
                options={{
                  strokeColor: C.accent,
                  strokeOpacity: 0.85,
                  strokeWeight: 4,
                  icons: [
                    {
                      icon: {
                        path: window.google?.maps?.SymbolPath
                          ?.FORWARD_CLOSED_ARROW,
                        scale: 2.5,
                        strokeColor: "#fff",
                      },
                      offset: "100%",
                      repeat: "60px",
                    },
                  ],
                }}
              />
            )}

            {directions && (
              <DirectionsRenderer
                directions={directions}
                options={{
                  polylineOptions: {
                    strokeColor: C.warning,
                    strokeWeight: 5,
                    strokeOpacity: 0.9,
                  },
                  suppressMarkers: true,
                }}
              />
            )}

            {/* Team markers */}
            {showTeam &&
              teamLocations.map(
                (m) =>
                  m.location && (
                    <Marker
                      key={m.userId}
                      position={m.location}
                      icon={mkTeamIcon()}
                      onClick={() => setSelectedTeamMember(m)}
                    />
                  ),
              )}

            {/* User location */}
            {userLocation && (
              <Marker
                position={userLocation}
                icon={{
                  path: window.google?.maps?.SymbolPath?.CIRCLE,
                  fillColor: C.success,
                  fillOpacity: 1,
                  strokeColor: "#fff",
                  strokeWeight: 3,
                  scale: 11,
                }}
                zIndex={1000}
              >
                {isLiveTracking && (
                  <InfoWindow position={userLocation} onCloseClick={() => {}}>
                    <Box
                      sx={{
                        p: 1,
                        bgcolor: C.surface,
                        color: C.text,
                        borderRadius: 1.5,
                        minWidth: 140,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <PingDot alive={1} />
                        <Typography
                          sx={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: C.success,
                          }}
                        >
                          LIVE
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: 12, color: C.muted }}>
                        Speed
                      </Typography>
                      <Typography
                        sx={{ fontSize: 14, fontWeight: 700, color: C.text }}
                      >
                        {(currentSpeed * 3.6).toFixed(1)} km/h
                      </Typography>
                      <Typography
                        sx={{ fontSize: 12, color: C.muted, mt: 0.5 }}
                      >
                        Accuracy ±{userLocation.accuracy?.toFixed(0)}m
                      </Typography>
                    </Box>
                  </InfoWindow>
                )}
              </Marker>
            )}

            {/* Visit markers */}
            {mapLoaded &&
              filteredVisits.map((v) => (
                <Marker
                  key={v._id}
                  position={v.coordinates}
                  icon={mkIcon(
                    v.status,
                    v.verified,
                    activeVisit?._id === v._id,
                  )}
                  onClick={() => setSelectedLocation(v)}
                  zIndex={activeVisit?._id === v._id ? 100 : 1}
                />
              ))}

            {/* Visit InfoWindow */}
            {selectedLocation && (
              <InfoWindow
                position={selectedLocation.coordinates}
                onCloseClick={() => setSelectedLocation(null)}
              >
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: C.surface,
                    color: C.text,
                    borderRadius: 2,
                    maxWidth: 240,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 0.5,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: C.text,
                        flex: 1,
                        pr: 1,
                      }}
                    >
                      {selectedLocation.locationName}
                    </Typography>
                    <Chip
                      label={statusLabel(selectedLocation.status)}
                      size="small"
                      sx={{
                        fontSize: 10,
                        fontWeight: 700,
                        height: 20,
                        bgcolor: alpha(
                          statusColor(selectedLocation.status),
                          0.15,
                        ),
                        color: statusColor(selectedLocation.status),
                      }}
                    />
                  </Box>
                  <Typography sx={{ fontSize: 11, color: C.muted, mb: 1.5 }}>
                    {selectedLocation.address}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 2, mb: 1.5 }}>
                    <Box>
                      <Typography sx={{ fontSize: 10, color: C.muted }}>
                        Time
                      </Typography>
                      <Typography
                        sx={{ fontSize: 12, fontWeight: 600, color: C.text }}
                      >
                        {format(
                          new Date(selectedLocation.createdAt),
                          "hh:mm a",
                        )}
                      </Typography>
                    </Box>
                    {selectedLocation.distanceFromPreviousKm > 0 && (
                      <Box>
                        <Typography sx={{ fontSize: 10, color: C.muted }}>
                          From prev.
                        </Typography>
                        <Typography
                          sx={{ fontSize: 12, fontWeight: 600, color: C.text }}
                        >
                          {selectedLocation.distanceFromPreviousKm.toFixed(1)}{" "}
                          km
                        </Typography>
                      </Box>
                    )}
                    {selectedLocation.verified && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.3,
                          mt: 1.5,
                        }}
                      >
                        <Verified sx={{ fontSize: 13, color: C.success }} />
                        <Typography sx={{ fontSize: 11, color: C.success }}>
                          Verified
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Button
                    fullWidth
                    size="small"
                    variant="outlined"
                    onClick={() => getDirections(selectedLocation.coordinates)}
                    sx={{
                      borderRadius: 2,
                      fontSize: 11,
                      borderColor: alpha(C.accent, 0.4),
                      color: C.accentLt,
                      "&:hover": {
                        borderColor: C.accent,
                        bgcolor: alpha(C.accent, 0.08),
                      },
                    }}
                  >
                    Navigate Here
                  </Button>
                </Box>
              </InfoWindow>
            )}

            {/* Team member InfoWindow */}
            {selectedTeamMember && (
              <InfoWindow
                position={selectedTeamMember.location}
                onCloseClick={() => setSelectedTeamMember(null)}
              >
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: C.surface,
                    color: C.text,
                    borderRadius: 2,
                    minWidth: 160,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 0.5,
                    }}
                  >
                    <PingDot alive={1} />
                    <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                      Team Member
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: 12, color: C.muted }}>
                    Last seen{" "}
                    {format(
                      new Date(selectedTeamMember.location.timestamp),
                      "hh:mm a",
                    )}
                  </Typography>
                </Box>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      </Box>

      {/* ── MAP CONTROLS (right) ────────────────────────────────────────────────── */}
      <MapControl
        sx={{
          position: "absolute",
          right: 14,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 15,
        }}
      >
        <Tooltip title="Zoom In" placement="left">
          <CtrlBtn onClick={handleZoomIn}>
            <ZoomIn sx={{ fontSize: 18 }} />
          </CtrlBtn>
        </Tooltip>
        <Box sx={{ height: "1px", bgcolor: C.border }} />
        <Tooltip title="Zoom Out" placement="left">
          <CtrlBtn onClick={handleZoomOut}>
            <ZoomOut sx={{ fontSize: 18 }} />
          </CtrlBtn>
        </Tooltip>
        <Box sx={{ height: "1px", bgcolor: C.border }} />
        <Tooltip
          title={isLiveTracking ? "Stop Tracking" : "Live Track"}
          placement="left"
        >
          <CtrlBtn
            onClick={isLiveTracking ? stopLiveTracking : startLiveTracking}
            sx={{
              color: isLiveTracking ? C.success : C.muted,
              "&:hover": { color: isLiveTracking ? C.success : C.accentLt },
            }}
          >
            <GpsFixed sx={{ fontSize: 18 }} />
          </CtrlBtn>
        </Tooltip>
        <Box sx={{ height: "1px", bgcolor: C.border }} />
        <Tooltip title="My Location" placement="left">
          <CtrlBtn
            onClick={handleMyLoc}
            sx={{ color: C.accentLt, "&:hover": { color: C.accent } }}
          >
            <MyLocation sx={{ fontSize: 18 }} />
          </CtrlBtn>
        </Tooltip>
        <Box sx={{ height: "1px", bgcolor: C.border }} />
        <Tooltip
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          placement="left"
        >
          <CtrlBtn onClick={handleFullscreen}>
            {isFullscreen ? (
              <FullscreenExit sx={{ fontSize: 18 }} />
            ) : (
              <Fullscreen sx={{ fontSize: 18 }} />
            )}
          </CtrlBtn>
        </Tooltip>
      </MapControl>

      {/* ── MAP TYPE (below center-right) ────────────────────────────────────────── */}
      <MapControl
        sx={{
          position: "absolute",
          right: 14,
          top: isMobile ? 68 : 74,
          zIndex: 15,
          flexDirection: "row",
        }}
      >
        {[
          ["roadmap", "Map", <Map sx={{ fontSize: 14 }} />],
          ["satellite", "Sat", <Satellite sx={{ fontSize: 14 }} />],
          ["terrain", "Topo", <Terrain sx={{ fontSize: 14 }} />],
        ].map(([val, label, icon]) => (
          <CtrlBtn
            key={val}
            onClick={() => setMapType(val)}
            sx={{
              px: 1.5,
              color: mapType === val ? C.accentLt : C.muted,
              bgcolor: mapType === val ? alpha(C.accent, 0.15) : "transparent",
            }}
          >
            {icon}
          </CtrlBtn>
        ))}
      </MapControl>

      {/* ── LIVE TRACKING BADGE (top-left) ──────────────────────────────────────── */}
      <Fade in={isLiveTracking}>
        <FloatingCard
          sx={{
            position: "absolute",
            top: isMobile ? 72 : 72,
            left: 14,
            zIndex: 15,
            p: "8px 14px",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <PingDot alive={1} />
          <Box>
            <Typography
              sx={{
                fontSize: 10,
                fontWeight: 700,
                color: C.success,
                letterSpacing: 1,
              }}
            >
              LIVE
            </Typography>
            <Typography sx={{ fontSize: 12, color: C.text }}>
              {(currentSpeed * 3.6).toFixed(1)} km/h
            </Typography>
          </Box>
          <Box sx={{ width: "1px", height: 28, bgcolor: C.border }} />
          <Box>
            <Typography sx={{ fontSize: 10, color: C.muted }}>
              Points
            </Typography>
            <Typography sx={{ fontSize: 12, color: C.text }}>
              {locationHistory.length}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={stopLiveTracking}
            sx={{ color: C.error, p: "4px" }}
          >
            <Stop sx={{ fontSize: 14 }} />
          </IconButton>
        </FloatingCard>
      </Fade>

      {/* ── STATS STRIP (bottom, above panel) ────────────────────────────────────── */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 15,
          background:
            "linear-gradient(0deg, rgba(13,17,23,0.98) 70%, transparent)",
          px: isMobile ? 1.5 : 3,
          pb: isMobile ? 1.5 : 2,
          pt: 3,
        }}
      >
        {/* Collapse toggle */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 0.5 }}>
          <IconButton
            size="small"
            onClick={() => setStatsOpen((o) => !o)}
            sx={{
              color: C.muted,
              bgcolor: alpha(C.border, 0.6),
              border: `1px solid ${C.border}`,
              borderRadius: 2,
              p: "2px",
            }}
          >
            {statsOpen ? (
              <KeyboardArrowDown sx={{ fontSize: 16 }} />
            ) : (
              <KeyboardArrowUp sx={{ fontSize: 16 }} />
            )}
          </IconButton>
        </Box>

        <Collapse in={statsOpen}>
          {/* Stats row */}
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              mb: 1.5,
              overflowX: "auto",
              pb: 0.5,
            }}
          >
            {[
              {
                label: "Distance",
                value: `${totalDistance.toFixed(1)} km`,
                color: C.accent,
              },
              {
                label: "Duration",
                value: `${Math.floor(totalTime / 60)}h ${totalTime % 60}m`,
                color: C.success,
              },
              { label: "Visits", value: visits.length, color: C.warning },
              {
                label: "Verified",
                value: `${completedCount}/${visits.length}`,
                color: C.info,
              },
            ].map((s) => (
              <StatBox key={s.label} sx={{ flex: "0 0 auto", minWidth: 78 }}>
                <Typography
                  sx={{ fontSize: 10, color: C.muted, fontWeight: 500 }}
                >
                  {s.label}
                </Typography>
                <Typography
                  sx={{ fontSize: 14, fontWeight: 700, color: s.color }}
                >
                  {s.value}
                </Typography>
              </StatBox>
            ))}
          </Box>

          {/* Route progress bar */}
          {visits.length > 0 && (
            <Box sx={{ mb: 1.5 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 0.5,
                }}
              >
                <Typography sx={{ fontSize: 11, color: C.muted }}>
                  Visit Progress
                </Typography>
                <Typography
                  sx={{ fontSize: 11, color: C.accentLt, fontWeight: 600 }}
                >
                  {completedCount} of {visits.length} done
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={
                  visits.length ? (completedCount / visits.length) * 100 : 0
                }
                sx={{
                  height: 4,
                  borderRadius: 4,
                  bgcolor: alpha(C.accent, 0.12),
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 4,
                    bgcolor: C.accent,
                  },
                }}
              />
            </Box>
          )}
        </Collapse>

        {/* Bottom actions */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            size="small"
            startIcon={<TimelineIcon sx={{ fontSize: 14 }} />}
            onClick={() => setPanelOpen(true)}
            sx={{
              flex: 1,
              bgcolor: C.accent,
              color: "#fff",
              borderRadius: 2.5,
              fontWeight: 700,
              fontSize: 12,
              py: 1,
              "&:hover": { bgcolor: C.accentLt },
            }}
          >
            Timeline
          </Button>
          <Button
            size="small"
            startIcon={<Download sx={{ fontSize: 14 }} />}
            onClick={handleExportClick}
            sx={{
              flex: 1,
              bgcolor: alpha(C.border, 0.8),
              color: C.muted,
              border: `1px solid ${C.border}`,
              borderRadius: 2.5,
              fontWeight: 600,
              fontSize: 12,
              py: 1,
              "&:hover": { bgcolor: C.border, color: C.text },
            }}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* ── EXPORT MENU ─────────────────────────────────────────────────────────── */}
      <Menu
        anchorEl={exportAnchor}
        open={Boolean(exportAnchor)}
        onClose={handleExportClose}
        PaperProps={{
          sx: {
            bgcolor: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 2,
            minWidth: 180,
            mt: 1
          }
        }}
      >
        <MenuItem onClick={handleExportCSV} sx={{ color: C.text, py: 1.2 }}>
          <ListItemIcon>
            <TableChart sx={{ color: C.success, fontSize: 20 }} />
          </ListItemIcon>
          <ListItemText primary="Export as CSV" />
        </MenuItem>
        <MenuItem onClick={handleExportExcel} sx={{ color: C.text, py: 1.2 }}>
          <ListItemIcon>
            <Assessment sx={{ color: C.success, fontSize: 20 }} />
          </ListItemIcon>
          <ListItemText primary="Export as Excel" />
        </MenuItem>
        <MenuItem onClick={handleExportJSON} sx={{ color: C.text, py: 1.2 }}>
          <ListItemIcon>
            <FileDownload sx={{ color: C.accent, fontSize: 20 }} />
          </ListItemIcon>
          <ListItemText primary="Export as JSON" />
        </MenuItem>
      </Menu>

      {/* ── TIMELINE PANEL (bottom drawer mobile / right drawer desktop) ─────────── */}
      <Drawer
        anchor={isMobile ? "bottom" : "right"}
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: C.bg,
            border: `1px solid ${C.border}`,
            ...(isMobile
              ? {
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  maxHeight: "82dvh",
                }
              : {
                  width: 360,
                  borderTopLeftRadius: 12,
                  borderBottomLeftRadius: 12,
                }),
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: isMobile ? "auto" : "100%",
          }}
        >
          {/* Drag handle (mobile) */}
          {isMobile && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                pt: 1.5,
                pb: 0.5,
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 4,
                  bgcolor: C.border,
                  borderRadius: 2,
                }}
              />
            </Box>
          )}

          {/* Panel header */}
          <Box
            sx={{
              px: 2.5,
              py: 1.5,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <TimelineIcon sx={{ fontSize: 18, color: C.accent }} />
              <Box>
                <Typography
                  sx={{ fontWeight: 700, fontSize: 15, color: C.text }}
                >
                  Visit Timeline
                </Typography>
                <Typography sx={{ fontSize: 11, color: C.muted }}>
                  {filteredVisits.length} stops
                </Typography>
              </Box>
            </Box>
            <IconButton
              size="small"
              onClick={() => setPanelOpen(false)}
              sx={{
                color: C.muted,
                bgcolor: alpha(C.border, 0.6),
                border: `1px solid ${C.border}`,
                borderRadius: 2,
                p: "5px",
              }}
            >
              <Close sx={{ fontSize: 15 }} />
            </IconButton>
          </Box>

          {/* Playback controls */}
          <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${C.border}` }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography
                sx={{ fontSize: 11, fontWeight: 600, color: C.muted }}
              >
                Route Playback
              </Typography>
              <Box sx={{ display: "flex", gap: 0.3 }}>
                {[0.5, 1, 2].map((s) => (
                  <Button
                    key={s}
                    size="small"
                    onClick={() => setPlaySpeed(s)}
                    sx={{
                      fontSize: 10,
                      minWidth: 0,
                      px: 1,
                      py: 0.3,
                      borderRadius: 1.5,
                      fontWeight: 700,
                      color: playSpeed === s ? C.accentLt : C.muted,
                      bgcolor:
                        playSpeed === s ? alpha(C.accent, 0.15) : "transparent",
                    }}
                  >
                    {s}x
                  </Button>
                ))}
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton
                size="small"
                onClick={() => {
                  setTimeSlider(0);
                  setActiveVisit(null);
                }}
                sx={{ color: C.muted, p: "5px" }}
              >
                <Replay sx={{ fontSize: 16 }} />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => setIsPlaying((p) => !p)}
                sx={{
                  color: C.accent,
                  bgcolor: alpha(C.accent, 0.12),
                  border: `1px solid ${alpha(C.accent, 0.3)}`,
                  borderRadius: 2,
                  p: "5px",
                }}
              >
                {isPlaying ? (
                  <Pause sx={{ fontSize: 16 }} />
                ) : (
                  <PlayArrow sx={{ fontSize: 16 }} />
                )}
              </IconButton>
              <Slider
                size="small"
                value={timeSlider}
                onChange={(_, v) => setTimeSlider(v)}
                sx={{
                  flex: 1,
                  color: C.accent,
                  "& .MuiSlider-thumb": {
                    width: 12,
                    height: 12,
                    bgcolor: C.accent,
                  },
                  "& .MuiSlider-track": { bgcolor: C.accent },
                  "& .MuiSlider-rail": { bgcolor: alpha(C.accent, 0.2) },
                }}
              />
            </Box>
          </Box>

          {/* Filters */}
          <Box
            sx={{
              px: 2.5,
              py: 1.5,
              display: "flex",
              gap: 1,
              borderBottom: `1px solid ${C.border}`,
              flexWrap: "wrap",
            }}
          >
            {[
              { key: "showCompleted", label: "Completed", color: C.success },
              { key: "showInProgress", label: "Active", color: C.warning },
              { key: "showCancelled", label: "Cancelled", color: C.error },
            ].map((f) => (
              <Chip
                key={f.key}
                label={f.label}
                size="small"
                clickable
                onClick={() =>
                  setFilters((p) => ({ ...p, [f.key]: !p[f.key] }))
                }
                sx={{
                  fontSize: 11,
                  fontWeight: 600,
                  height: 24,
                  bgcolor: filters[f.key]
                    ? alpha(f.color, 0.15)
                    : alpha(C.border, 0.6),
                  color: filters[f.key] ? f.color : C.muted,
                  border: `1px solid ${filters[f.key] ? alpha(f.color, 0.4) : C.border}`,
                  "&:hover": { bgcolor: alpha(f.color, 0.2) },
                }}
              />
            ))}
          </Box>

          {/* Visit list */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              px: 2,
              py: 2,
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
            }}
          >
            {loading ? (
              [1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  height={88}
                  sx={{ borderRadius: 2, bgcolor: C.card }}
                />
              ))
            ) : filteredVisits.length > 0 ? (
              filteredVisits.map((visit, idx) => (
                <VisitRow
                  key={visit._id}
                  selected={activeVisit?._id === visit._id}
                  onClick={() => {
                    setActiveVisit(visit);
                    if (map && visit.coordinates) {
                      map.panTo(visit.coordinates);
                      map.setZoom(16);
                    }
                    if (isMobile) setPanelOpen(false);
                  }}
                >
                  <Box sx={{ display: "flex", gap: 1.5 }}>
                    {/* Step number + connector */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Box
                        sx={{
                          width: 26,
                          height: 26,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: alpha(statusColor(visit.status), 0.15),
                          border: `1.5px solid ${alpha(statusColor(visit.status), 0.5)}`,
                          fontSize: 11,
                          fontWeight: 700,
                          color: statusColor(visit.status),
                        }}
                      >
                        {idx + 1}
                      </Box>
                      {idx < filteredVisits.length - 1 && (
                        <Box
                          sx={{
                            width: 1,
                            flex: 1,
                            minHeight: 16,
                            bgcolor: C.border,
                            mt: 0.5,
                          }}
                        />
                      )}
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 0.3,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: C.text,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            flex: 1,
                            pr: 1,
                          }}
                        >
                          {visit.locationName}
                        </Typography>
                        <Chip
                          label={statusLabel(visit.status)}
                          size="small"
                          sx={{
                            fontSize: 9,
                            fontWeight: 700,
                            height: 18,
                            bgcolor: alpha(statusColor(visit.status), 0.15),
                            color: statusColor(visit.status),
                            flexShrink: 0,
                          }}
                        />
                      </Box>

                      <Typography
                        sx={{
                          fontSize: 11,
                          color: C.muted,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          mb: 0.8,
                        }}
                      >
                        {visit.address}
                      </Typography>

                      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.4,
                          }}
                        >
                          <AccessTime sx={{ fontSize: 11, color: C.muted }} />
                          <Typography sx={{ fontSize: 11, color: C.muted }}>
                            {format(new Date(visit.createdAt), "hh:mm a")}
                          </Typography>
                        </Box>
                        {visit.distanceFromPreviousKm > 0 && (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.4,
                            }}
                          >
                            <DirectionsCar
                              sx={{ fontSize: 11, color: C.muted }}
                            />
                            <Typography sx={{ fontSize: 11, color: C.muted }}>
                              {visit.distanceFromPreviousKm.toFixed(1)} km
                            </Typography>
                          </Box>
                        )}
                        {visit.verified && (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.3,
                            }}
                          >
                            <Verified sx={{ fontSize: 11, color: C.success }} />
                            <Typography sx={{ fontSize: 11, color: C.success }}>
                              Verified
                            </Typography>
                          </Box>
                        )}
                        {visit.photos?.length > 0 && (
                          <Typography sx={{ fontSize: 11, color: C.muted }}>
                            {visit.photos.length} photo
                            {visit.photos.length > 1 ? "s" : ""}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </VisitRow>
              ))
            ) : (
              <Box sx={{ py: 5, textAlign: "center" }}>
                <TimelineIcon sx={{ fontSize: 40, color: C.border, mb: 1.5 }} />
                <Typography sx={{ color: C.muted, fontSize: 13 }}>
                  No visits found for this date
                </Typography>
              </Box>
            )}
          </Box>

          {/* Export footer */}
          <Box sx={{ p: 2, borderTop: `1px solid ${C.border}` }}>
            <Button
              fullWidth
              startIcon={<Download sx={{ fontSize: 16 }} />}
              onClick={handleExportClick}
              sx={{
                bgcolor: C.accent,
                color: "#fff",
                fontWeight: 700,
                borderRadius: 2.5,
                py: 1.2,
                fontSize: 13,
                "&:hover": { bgcolor: C.accentLt },
              }}
            >
              Export Data
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* ── DATE PICKER ────────────────────────────────────────────────────────── */}
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <MobileDatePicker
          open={datePickerOpen}
          onClose={() => setDatePickerOpen(false)}
          value={selectedDate}
          onChange={(d) => {
            if (d) {
              setSelectedDate(d);
              setDatePickerOpen(false);
            }
          }}
          renderInput={() => <></>}
        />
      </LocalizationProvider>

      {/* ── SNACKBAR ─────────────────────────────────────────────────────────────── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2800}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{
            borderRadius: 2.5,
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            bgcolor: C.card,
            color: C.text,
            "& .MuiAlert-icon": { alignItems: "center" },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* ── GLOBAL ───────────────────────────────────────────────────────────────── */}
      <style>{`
        * { -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { width: 4px; } 
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
      `}</style>
    </Box>
  );
}