// pages/SalesDailySummary.jsx
// ✅ FIX: getTeamLocations sourced from VisitContext (was missing)
// ✅ NEW: Click visit card → map flies to location + info window opens
// ✅ NEW: Default 5 recent visits shown on map as emoji pins
// ✅ NEW: Completely redesigned — warm field-ops aesthetic, rich cards, smooth animations

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Paper,
  Grid,
  Button,
  Chip,
  Stack,
  Badge,
  CircularProgress,
  Skeleton,
  Fab,
  Zoom,
  Fade,
  useMediaQuery,
  alpha,
  Container,
  BottomNavigation,
  BottomNavigationAction,
  Snackbar,
  Alert,
  Card,
  CardContent,
  LinearProgress,
  Drawer,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import {
  Menu as MenuIcon,
  MyLocation as MyLocationIcon,
  ZoomOutMap as ZoomOutMapIcon,
  Map as MapIcon,
  Satellite as SatelliteIcon,
  Add as AddIcon,
  Dashboard as DashboardIcon,
  ListAlt as VisitsIcon,
  Route as RouteIcon,
  Group as TeamIcon,
  AccessTime as TimeIcon,
  Straighten as DistanceIcon,
  CheckCircle as CompletedIcon,
  Today as TodayIcon,
  ArrowForward as ArrowForwardIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { useVisit } from "../contexts/VisitContext";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
  Circle,
  Polyline,
} from "@react-google-maps/api";

const GOOGLE_MAPS_API_KEY = "AIzaSyCqM7uF9c0ZMQjdssHqSMJJ3mBcmz5RNS0";
const LIBRARIES = ["places"];

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  bg: "#0D1117",
  surface: "#161B22",
  card: "#1C2128",
  border: "#30363D",
  text: "#E6EDF3",
  muted: "#8B949E",
  accent: "#F78166",
  blue: "#58A6FF",
  green: "#3FB950",
  yellow: "#E3B341",
  purple: "#D2A8FF",
  red: "#F85149",
};

// ─── Status config with emojis ────────────────────────────────────────────────
const STATUS = {
  completed: {
    color: T.green,
    bg: "#0D2818",
    border: "#2EA043",
    emoji: "✅",
    label: "Completed",
  },
  inprogress: {
    color: T.blue,
    bg: "#0D1F35",
    border: "#1F6FEB",
    emoji: "🔵",
    label: "In Progress",
  },
  cancelled: {
    color: T.red,
    bg: "#2D0F0F",
    border: "#CF222E",
    emoji: "❌",
    label: "Cancelled",
  },
  pending: {
    color: T.yellow,
    bg: "#2D1F02",
    border: "#BB8009",
    emoji: "⏳",
    label: "Pending",
  },
};
const getStatus = (s) => STATUS[s?.toLowerCase()] || STATUS.pending;

// ─── Map emoji pins as SVG data URIs ─────────────────────────────────────────
const emojiPin = (emoji, selected = false) => {
  const sz = selected ? 52 : 42;
  const fz = selected ? 22 : 18;
  return {
    url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="${sz}" height="${sz + 12}" viewBox="0 0 52 64">
        <filter id="sh"><feDropShadow dx="0" dy="3" stdDeviation="${selected ? 4 : 2}" flood-color="#000" flood-opacity="${selected ? 0.5 : 0.3}"/></filter>
        <path d="M26 2C15.5 2 7 10.5 7 21C7 36 26 62 26 62C26 62 45 36 45 21C45 10.5 36.5 2 26 2Z"
          fill="${selected ? "#F78166" : "#1C2128"}" stroke="${selected ? "#FF8A70" : "#58A6FF"}"
          stroke-width="${selected ? 2.5 : 1.5}" filter="url(#sh)"/>
        <circle cx="26" cy="21" r="13" fill="${selected ? "rgba(255,255,255,0.15)" : "rgba(88,166,255,0.1)"}"/>
        <text x="26" y="27" text-anchor="middle" font-size="${fz}">${emoji}</text>
      </svg>`)}`,
    scaledSize: { width: sz, height: sz + 12 },
    anchor: { x: sz / 2, y: sz + 12 },
  };
};

const myLocationPin = (initial) => ({
  url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 52 52">
      <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <circle cx="26" cy="26" r="24" fill="#1F6FEB" filter="url(#glow)" opacity="0.9"/>
      <circle cx="26" cy="26" r="18" fill="#58A6FF"/>
      <circle cx="26" cy="26" r="10" fill="white" opacity="0.9"/>
      <text x="26" y="31" text-anchor="middle" fill="#1F6FEB" font-size="14" font-weight="800">${initial}</text>
    </svg>`)}`,
  scaledSize: { width: 52, height: 52 },
  anchor: { x: 26, y: 26 },
});

const teamPin = (color, initial) => ({
  url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44">
      <circle cx="22" cy="22" r="20" fill="${color}" opacity="0.9"/>
      <circle cx="22" cy="22" r="14" fill="white" opacity="0.15"/>
      <text x="22" y="28" text-anchor="middle" fill="white" font-size="15" font-weight="700">${initial}</text>
    </svg>`)}`,
  scaledSize: { width: 44, height: 44 },
  anchor: { x: 22, y: 22 },
});

// ─── Dark map style ───────────────────────────────────────────────────────────
const DARK_MAP = [
  { elementType: "geometry", stylers: [{ color: "#0D1117" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0D1117" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#58A6FF" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#161B22" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#21262D" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#8B949E" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#1C2128" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0D1F35" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#3D6A9E" }],
  },
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#E3B341" }],
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{ color: "#12171E" }],
  },
];

const ROLE_COLORS = {
  TEAM: "#3FB950",
  ZSM: "#58A6FF",
  ASM: "#D2A8FF",
  Head_office: "#E3B341",
};

// ─── Styled Components ────────────────────────────────────────────────────────
const GlassBar = styled(AppBar)(() => ({
  background: `linear-gradient(180deg, ${T.surface}F0 0%, ${T.surface}CC 100%)`,
  backdropFilter: "blur(24px)",
  borderBottom: `1px solid ${T.border}`,
  boxShadow: `0 1px 0 ${T.border}`,
}));

const SurfaceCard = styled(Card)(({ selected, accentcolor }) => ({
  background: selected ? alpha(accentcolor || T.blue, 0.08) : T.card,
  border: `1px solid ${selected ? accentcolor || T.blue : T.border}`,
  borderRadius: 14,
  cursor: "pointer",
  transition: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
  "&:hover": {
    border: `1px solid ${accentcolor || T.blue}`,
    transform: "translateY(-2px)",
    boxShadow: `0 8px 24px ${alpha(accentcolor || T.blue, 0.18)}`,
  },
}));

const StatTile = styled(Paper)(({ tilecolor }) => ({
  background: alpha(tilecolor || T.blue, 0.1),
  border: `1px solid ${alpha(tilecolor || T.blue, 0.25)}`,
  borderRadius: 14,
  padding: "14px 8px",
  textAlign: "center",
  transition: "transform 0.18s",
  "&:hover": { transform: "scale(1.04)" },
}));

const PulseDot = styled(Box)(({ dotcolor }) => ({
  width: 8,
  height: 8,
  borderRadius: "50%",
  background: dotcolor || T.green,
  animation: "pulse 1.8s infinite",
  "@keyframes pulse": {
    "0%,100%": { opacity: 1, transform: "scale(1)" },
    "50%": { opacity: 0.4, transform: "scale(0.85)" },
  },
}));

const MapWrap = styled(Box)({
  height: 340,
  position: "relative",
  borderRadius: 14,
  overflow: "hidden",
  border: `1px solid ${T.border}`,
});

const NumberBadge = styled(Box)(({ badgecolor }) => ({
  width: 26,
  height: 26,
  borderRadius: "50%",
  background: alpha(badgecolor || T.blue, 0.15),
  border: `1.5px solid ${alpha(badgecolor || T.blue, 0.4)}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 11,
  fontWeight: 800,
  color: badgecolor || T.blue,
  flexShrink: 0,
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDist = (km) =>
  !km ? "0 m" : km >= 1 ? `${km.toFixed(1)} km` : `${Math.round(km * 1000)} m`;
const fmtTime = (min) => {
  if (!min) return "0 m";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
};
const fmtClock = (dt) => {
  try {
    return new Date(dt).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};
const fmtDate = (dt) => {
  try {
    return new Date(dt).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  } catch {
    return "";
  }
};

// Visit emoji by index (makes each pin feel unique)
const VISIT_EMOJIS = [
  "📍",
  "🏪",
  "🏢",
  "🏬",
  "🏦",
  "🏨",
  "🛒",
  "🏭",
  "🏠",
  "🗺️",
];
const visitEmoji = (i, status) => {
  const s = status?.toLowerCase();
  if (s === "completed") return "✅";
  if (s === "cancelled") return "❌";
  if (s === "inprogress") return "🔵";
  return VISIT_EMOJIS[i % VISIT_EMOJIS.length];
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SalesDailySummary() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { user, locationState, startWatchingPosition, stopWatchingPosition } =
    useAuth();
  // ✅ FIX: getTeamLocations is now correctly destructured from VisitContext
  const { getVisitStats, getRecentVisits, getTeamLocations } = useVisit();
  const { socket, emitLocationUpdate } = useSocket();

  const isManager = ["ZSM", "ASM", "Head_office"].includes(user?.role);

  // ─── State ────────────────────────────────────────────────────────────────
  const [stats, setStats] = useState({
    visitsToday: 0,
    totalDistanceKm: 0,
    totalTravelTimeMinutes: 0,
    totalCompletedVisits: 0,
  });
  const [visits, setVisits] = useState([]);
  const [teamLocs, setTeamLocs] = useState([]);
  const [myLoc, setMyLoc] = useState(null);
  const [liveTrail, setLiveTrail] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [infoWin, setInfoWin] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mapType, setMapType] = useState("roadmap");
  const [snack, setSnack] = useState({ open: false, msg: "", type: "success" });
  const [navValue, setNavValue] = useState(0);

  const mapRef = useRef(null);
  const pollRef = useRef(null);
  const centeredRef = useRef(false);

  // ─── Load data ────────────────────────────────────────────────────────────
  const loadData = useCallback(
    async (refresh = false) => {
      if (refresh) setRefreshing(true);
      else setLoading(true);
      try {
        const [sRes, vRes] = await Promise.all([
          getVisitStats(refresh),
          getRecentVisits(5, refresh),
        ]);
        if (sRes?.success) setStats(sRes.result || {});
        if (vRes?.success) {
          const list = Array.isArray(vRes.result)
            ? vRes.result
            : vRes.result?.visits || [];
          setVisits(list.slice(0, 5));
        }
      } catch (e) {
        console.error("loadData:", e);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [getVisitStats, getRecentVisits],
  );

  useEffect(() => {
    loadData();
  }, []);

  // ─── GPS watching ─────────────────────────────────────────────────────────
  useEffect(() => {
    startWatchingPosition(
      (loc) => {
        setMyLoc({ lat: loc.lat, lng: loc.lng });
        setLiveTrail((p) => [...p, { lat: loc.lat, lng: loc.lng }].slice(-300));
        emitLocationUpdate?.({
          lat: loc.lat,
          lng: loc.lng,
          accuracy: loc.accuracy,
        });
      },
      () => {},
      { enableHighAccuracy: true },
    );
    return () => stopWatchingPosition();
  }, []);

  useEffect(() => {
    if (locationState?.coords && !myLoc) setMyLoc(locationState.coords);
  }, [locationState]);

  // ─── Team locations polling ───────────────────────────────────────────────
  useEffect(() => {
    if (!isManager) return;

    const fetchTeam = async () => {
      // ✅ FIX: getTeamLocations is a real function now
      const res = await getTeamLocations();
      if (res?.success && Array.isArray(res.result)) setTeamLocs(res.result);
    };

    fetchTeam();
    pollRef.current = setInterval(fetchTeam, 30000);
    return () => clearInterval(pollRef.current);
  }, [isManager, getTeamLocations]);

  // ─── Socket: live team location updates ──────────────────────────────────
  useEffect(() => {
    if (!socket || !isManager) return;
    const onUpdate = (d) =>
      setTeamLocs((prev) => {
        const idx = prev.findIndex((t) => t.userId === d.userId);
        if (idx >= 0) {
          const u = [...prev];
          u[idx] = d;
          return u;
        }
        return [...prev, d];
      });
    socket.on("team:location-update", onUpdate);
    return () => socket.off("team:location-update", onUpdate);
  }, [socket, isManager]);

  // ─── Auto-center map on first load ────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || centeredRef.current) return;
    const withCoords = visits.filter((v) => v.latitude && v.longitude);
    if (withCoords.length > 0 && window.google) {
      const b = new window.google.maps.LatLngBounds();
      withCoords.forEach((v) =>
        b.extend({ lat: v.latitude, lng: v.longitude }),
      );
      if (myLoc) b.extend(myLoc);
      if (!b.isEmpty()) {
        mapRef.current.fitBounds(b, { padding: 60 });
        centeredRef.current = true;
      }
    }
  }, [visits, mapLoaded, myLoc]);

  // ─── Card click → map fly-to + info window ───────────────────────────────
  const handleCardClick = useCallback((visit) => {
    setSelectedId(visit._id);

    if (!visit.latitude || !visit.longitude) {
      setSnack({
        open: true,
        msg: "📍 No location data for this visit",
        type: "warning",
      });
      return;
    }

    // Fly map to the visit location
    if (mapRef.current) {
      mapRef.current.panTo({ lat: visit.latitude, lng: visit.longitude });
      mapRef.current.setZoom(16);
      setInfoWin({
        type: "visit",
        data: visit,
        pos: { lat: visit.latitude, lng: visit.longitude },
      });
    }

    // Smooth scroll to map
    document
      .getElementById("map-section")
      ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  // ─── Map controls ─────────────────────────────────────────────────────────
  const centerOnMe = () => {
    if (mapRef.current && myLoc) {
      mapRef.current.panTo(myLoc);
      mapRef.current.setZoom(16);
    }
  };

  const fitAll = () => {
    if (!mapRef.current || !window.google) return;
    const b = new window.google.maps.LatLngBounds();
    visits.forEach(
      (v) => v.latitude && b.extend({ lat: v.latitude, lng: v.longitude }),
    );
    if (myLoc) b.extend(myLoc);
    teamLocs.forEach(
      (t) =>
        t.location && b.extend({ lat: t.location.lat, lng: t.location.lng }),
    );
    if (!b.isEmpty()) mapRef.current.fitBounds(b, { padding: 60 });
  };

  const mapCenter = visits.find((v) => v.latitude)
    ? { lat: visits[0].latitude, lng: visits[0].longitude }
    : myLoc || { lat: 20.2961, lng: 85.8245 };

  const statItems = [
    {
      label: "Visits",
      value: stats.visitsToday || 0,
      icon: "📅",
      color: T.blue,
    },
    {
      label: "Done",
      value: stats.totalCompletedVisits || 0,
      icon: "✅",
      color: T.green,
    },
    {
      label: "Distance",
      value: fmtDist(stats.totalDistanceKm),
      icon: "📏",
      color: T.yellow,
    },
    {
      label: "On Road",
      value: fmtTime(stats.totalTravelTimeMinutes),
      icon: "⏱️",
      color: T.purple,
    },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Box
      sx={{
        bgcolor: T.bg,
        minHeight: "100vh",
        pt: { xs: 7.5, sm: 8.5 },
        pb: { xs: 9, sm: 3 },
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      {/* ── App Bar ─────────────────────────────────────────────────────── */}
      <GlassBar position="fixed" elevation={0}>
        <Toolbar sx={{ minHeight: { xs: 58, sm: 64 } }}>
          <IconButton
            edge="start"
            onClick={() => setDrawerOpen(true)}
            sx={{ color: T.text, mr: 1 }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontWeight: 700,
                color: T.text,
                fontSize: { xs: 15, sm: 17 },
                lineHeight: 1.2,
                fontFamily: "inherit",
              }}
            >
              📊 Daily Summary
            </Typography>
            <Typography
              sx={{ fontSize: 11, color: T.muted, fontFamily: "inherit" }}
            >
              {fmtDate(new Date())}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            {/* Live indicator */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                bgcolor: alpha(T.green, 0.12),
                border: `1px solid ${alpha(T.green, 0.3)}`,
                borderRadius: 20,
                px: 1.25,
                py: 0.5,
              }}
            >
              <PulseDot dotcolor={T.green} />
              <Typography
                sx={{
                  fontSize: 10,
                  color: T.green,
                  fontWeight: 700,
                  fontFamily: "inherit",
                }}
              >
                LIVE
              </Typography>
            </Box>

            <IconButton
              onClick={() => loadData(true)}
              disabled={refreshing}
              sx={{ color: T.muted }}
            >
              {refreshing ? (
                <CircularProgress size={18} sx={{ color: T.blue }} />
              ) : (
                <RefreshIcon sx={{ fontSize: 20 }} />
              )}
            </IconButton>

            <Avatar
              sx={{
                width: 34,
                height: 34,
                bgcolor: alpha(T.accent, 0.2),
                color: T.accent,
                fontWeight: 800,
                fontSize: 14,
              }}
            >
              {(user?.name || user?.firstName || "U")[0].toUpperCase()}
            </Avatar>
          </Stack>
        </Toolbar>
        {refreshing && (
          <LinearProgress
            sx={{
              height: 2,
              bgcolor: alpha(T.blue, 0.1),
              "& .MuiLinearProgress-bar": { bgcolor: T.blue },
            }}
          />
        )}
      </GlassBar>

      <Container maxWidth="lg" sx={{ px: { xs: 1.5, sm: 2.5 } }}>
        {/* ── Greeting ──────────────────────────────────────────────────── */}
        <Box sx={{ mb: 2.5, mt: 0.5 }}>
          <Typography
            sx={{
              fontSize: { xs: 20, sm: 24 },
              fontWeight: 800,
              color: T.text,
              lineHeight: 1.3,
              fontFamily: "inherit",
            }}
          >
            Good{" "}
            {new Date().getHours() < 12
              ? "morning"
              : new Date().getHours() < 17
                ? "afternoon"
                : "evening"}{" "}
            👋
          </Typography>
          <Typography
            sx={{
              fontSize: 13,
              color: T.muted,
              mt: 0.25,
              fontFamily: "inherit",
            }}
          >
            {user?.name || "Field Officer"} · {user?.role}
          </Typography>
        </Box>

        {/* ── Stat Cards ────────────────────────────────────────────────── */}
        <Grid container spacing={1.5} sx={{ mb: 3 }}>
          {statItems.map((s, i) => (
            <Grid item xs={6} sm={3} key={s.label}>
              <Fade in timeout={300 + i * 80}>
                <StatTile elevation={0} tilecolor={s.color}>
                  {loading ? (
                    <Skeleton
                      variant="rectangular"
                      height={56}
                      sx={{ borderRadius: 2, bgcolor: alpha(s.color, 0.1) }}
                    />
                  ) : (
                    <>
                      <Typography sx={{ fontSize: 22, lineHeight: 1, mb: 0.5 }}>
                        {s.icon}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: { xs: "1.1rem", sm: "1.4rem" },
                          fontWeight: 800,
                          color: s.color,
                          lineHeight: 1.1,
                          fontFamily: "inherit",
                        }}
                      >
                        {s.value}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: 11,
                          color: T.muted,
                          fontWeight: 600,
                          mt: 0.25,
                          fontFamily: "inherit",
                        }}
                      >
                        {s.label}
                      </Typography>
                    </>
                  )}
                </StatTile>
              </Fade>
            </Grid>
          ))}
        </Grid>

        {/* ── Map Section ───────────────────────────────────────────────── */}
        <Box id="map-section" sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1.5,
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  color: T.text,
                  fontSize: 15,
                  fontFamily: "inherit",
                }}
              >
                🗺️ Live Map
              </Typography>
              <Typography
                sx={{ fontSize: 11, color: T.muted, fontFamily: "inherit" }}
              >
                {visits.filter((v) => v.latitude).length} pinned · tap a visit
                card to focus
              </Typography>
            </Box>
            <ToggleButtonGroup
              value={mapType}
              exclusive
              onChange={(_, v) => v && setMapType(v)}
              size="small"
              sx={{
                bgcolor: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: 2,
                "& .MuiToggleButton-root": {
                  border: "none",
                  color: T.muted,
                  px: 1.25,
                  py: 0.5,
                  fontSize: 11,
                },
                "& .Mui-selected": {
                  bgcolor: `${alpha(T.blue, 0.15)} !important`,
                  color: `${T.blue} !important`,
                },
              }}
            >
              <ToggleButton value="roadmap">
                <MapIcon sx={{ fontSize: 14, mr: 0.5 }} />
                Map
              </ToggleButton>
              <ToggleButton value="satellite">
                <SatelliteIcon sx={{ fontSize: 14, mr: 0.5 }} />
                Sat
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <MapWrap>
            <LoadScript
              googleMapsApiKey={GOOGLE_MAPS_API_KEY}
              libraries={LIBRARIES}
            >
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={mapCenter}
                zoom={13}
                options={{
                  styles: DARK_MAP,
                  disableDefaultUI: true,
                  gestureHandling: "greedy",
                  mapTypeId: mapType,
                  clickableIcons: false,
                  backgroundColor: T.bg,
                }}
                onLoad={(m) => {
                  mapRef.current = m;
                  setMapLoaded(true);
                }}
              >
                {/* GPS trail */}
                {liveTrail.length > 1 && (
                  <Polyline
                    path={liveTrail}
                    options={{
                      strokeColor: T.blue,
                      strokeOpacity: 0.45,
                      strokeWeight: 4,
                    }}
                  />
                )}

                {/* My location */}
                {myLoc && (
                  <>
                    <Circle
                      center={myLoc}
                      radius={locationState?.accuracy || 30}
                      options={{
                        fillColor: T.blue,
                        fillOpacity: 0.12,
                        strokeColor: T.blue,
                        strokeOpacity: 0.3,
                        strokeWeight: 1,
                      }}
                    />
                    <Marker
                      position={myLoc}
                      icon={myLocationPin((user?.name || "U")[0].toUpperCase())}
                      zIndex={200}
                      onClick={() => setInfoWin({ type: "me", pos: myLoc })}
                    />
                  </>
                )}

                {/* Team members (managers only) */}
                {isManager &&
                  teamLocs.map((m) =>
                    m.location ? (
                      <Marker
                        key={m.userId}
                        position={{ lat: m.location.lat, lng: m.location.lng }}
                        icon={teamPin(
                          ROLE_COLORS[m.role] || T.muted,
                          (m.name || "T")[0],
                        )}
                        zIndex={150}
                        onClick={() =>
                          setInfoWin({
                            type: "team",
                            data: m,
                            pos: { lat: m.location.lat, lng: m.location.lng },
                          })
                        }
                      />
                    ) : null,
                  )}

                {/*
                  ✅ Default 5 recent visits shown as emoji pins on map.
                  Each pin uses a unique emoji based on index or status.
                  Selected pin is larger and uses accent color.
                */}
                {visits.map((v, i) =>
                  v.latitude ? (
                    <Marker
                      key={v._id}
                      position={{ lat: v.latitude, lng: v.longitude }}
                      icon={emojiPin(
                        visitEmoji(i, v.status),
                        selectedId === v._id,
                      )}
                      zIndex={selectedId === v._id ? 180 : 100 - i}
                      onClick={() => handleCardClick(v)}
                    />
                  ) : null,
                )}

                {/* Info Window */}
                {infoWin && (
                  <InfoWindow
                    position={infoWin.pos}
                    onCloseClick={() => {
                      setInfoWin(null);
                      setSelectedId(null);
                    }}
                    options={{
                      pixelOffset:
                        infoWin.type !== "me"
                          ? new window.google.maps.Size(0, -16)
                          : new window.google.maps.Size(0, 0),
                    }}
                  >
                    <Box
                      sx={{
                        bgcolor: T.card,
                        color: T.text,
                        borderRadius: 2,
                        p: 1.5,
                        minWidth: 170,
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {infoWin.type === "me" && (
                        <>
                          <Typography
                            sx={{
                              fontWeight: 700,
                              fontSize: 13,
                              color: T.text,
                            }}
                          >
                            📍 You are here
                          </Typography>
                          <Typography sx={{ fontSize: 11, color: T.muted }}>
                            ±{Math.round(locationState?.accuracy || 0)}m
                            accuracy
                          </Typography>
                        </>
                      )}
                      {infoWin.type === "team" && (
                        <>
                          <Typography
                            sx={{
                              fontWeight: 700,
                              fontSize: 13,
                              color: T.text,
                            }}
                          >
                            👤 {infoWin.data.name}
                          </Typography>
                          <Typography sx={{ fontSize: 11, color: T.muted }}>
                            {infoWin.data.role}
                          </Typography>
                        </>
                      )}
                      {infoWin.type === "visit" &&
                        (() => {
                          const cfg = getStatus(infoWin.data.status);
                          return (
                            <>
                              <Typography
                                sx={{
                                  fontWeight: 700,
                                  fontSize: 13,
                                  color: T.text,
                                  mb: 0.5,
                                }}
                              >
                                {cfg.emoji}{" "}
                                {infoWin.data.locationName || "Visit"}
                              </Typography>
                              {infoWin.data.address && (
                                <Typography
                                  sx={{
                                    fontSize: 11,
                                    color: T.muted,
                                    mb: 0.75,
                                  }}
                                >
                                  {infoWin.data.address}
                                </Typography>
                              )}
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: "50%",
                                    bgcolor: cfg.color,
                                  }}
                                />
                                <Typography
                                  sx={{
                                    fontSize: 11,
                                    color: cfg.color,
                                    fontWeight: 600,
                                  }}
                                >
                                  {cfg.label}
                                </Typography>
                              </Box>
                              {infoWin.data.createdAt && (
                                <Typography
                                  sx={{ fontSize: 10, color: T.muted, mt: 0.5 }}
                                >
                                  🕐 {fmtClock(infoWin.data.createdAt)}
                                </Typography>
                              )}
                            </>
                          );
                        })()}
                    </Box>
                  </InfoWindow>
                )}
              </GoogleMap>
            </LoadScript>

            {/* Map control buttons */}
            <Fade in={mapLoaded}>
              <Box
                sx={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.75,
                }}
              >
                {[
                  {
                    icon: <MyLocationIcon sx={{ fontSize: 18 }} />,
                    onClick: centerOnMe,
                    tip: "My Location",
                  },
                  {
                    icon: <ZoomOutMapIcon sx={{ fontSize: 18 }} />,
                    onClick: fitAll,
                    tip: "Fit All",
                  },
                ].map((btn, i) => (
                  <IconButton
                    key={i}
                    size="small"
                    onClick={btn.onClick}
                    sx={{
                      bgcolor: T.surface,
                      color: T.blue,
                      border: `1px solid ${T.border}`,
                      borderRadius: 2,
                      backdropFilter: "blur(8px)",
                      "&:hover": { bgcolor: alpha(T.blue, 0.12) },
                      width: 34,
                      height: 34,
                    }}
                  >
                    {btn.icon}
                  </IconButton>
                ))}
              </Box>
            </Fade>

            {/* Visit count badge overlay */}
            {visits.filter((v) => v.latitude).length > 0 && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: 10,
                  left: 10,
                  bgcolor: alpha(T.surface, 0.9),
                  border: `1px solid ${T.border}`,
                  borderRadius: 20,
                  px: 1.5,
                  py: 0.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  backdropFilter: "blur(8px)",
                }}
              >
                <Typography sx={{ fontSize: 14 }}>📍</Typography>
                <Typography
                  sx={{
                    fontSize: 11,
                    color: T.text,
                    fontWeight: 600,
                    fontFamily: "inherit",
                  }}
                >
                  {visits.filter((v) => v.latitude).length} locations
                </Typography>
              </Box>
            )}
          </MapWrap>

          {/* Team online strip (managers only) */}
          {isManager && teamLocs.length > 0 && (
            <Box
              sx={{
                mt: 1,
                p: 1.5,
                bgcolor: T.surface,
                borderRadius: 2,
                border: `1px solid ${T.border}`,
                display: "flex",
                alignItems: "center",
                gap: 2,
                overflowX: "auto",
                "&::-webkit-scrollbar": { display: "none" },
              }}
            >
              <Typography
                sx={{
                  fontSize: 10,
                  color: T.muted,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  fontFamily: "inherit",
                }}
              >
                👥 ONLINE
              </Typography>
              {teamLocs.map((m) => (
                <Box
                  key={m.userId}
                  onClick={() => {
                    if (mapRef.current && m.location) {
                      mapRef.current.panTo({
                        lat: m.location.lat,
                        lng: m.location.lng,
                      });
                      mapRef.current.setZoom(15);
                      setInfoWin({
                        type: "team",
                        data: m,
                        pos: { lat: m.location.lat, lng: m.location.lng },
                      });
                    }
                  }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    badgeContent={
                      <Box
                        sx={{
                          width: 9,
                          height: 9,
                          borderRadius: "50%",
                          bgcolor: T.green,
                          border: `2px solid ${T.surface}`,
                        }}
                      />
                    }
                  >
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: alpha(ROLE_COLORS[m.role] || T.muted, 0.2),
                        color: ROLE_COLORS[m.role] || T.muted,
                        fontWeight: 800,
                        fontSize: 13,
                      }}
                    >
                      {(m.name || "T")[0]}
                    </Avatar>
                  </Badge>
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: T.text,
                      display: { xs: "none", sm: "block" },
                      fontFamily: "inherit",
                    }}
                  >
                    {m.name?.split(" ")[0]}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* ── Recent Visits ─────────────────────────────────────────────── */}
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1.5,
            }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                color: T.text,
                fontSize: 15,
                fontFamily: "inherit",
              }}
            >
              🕐 Recent Visits
            </Typography>
            <Button
              endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
              onClick={() => navigate("/team-performance-report")}
              sx={{
                color: T.blue,
                fontSize: 12,
                fontFamily: "inherit",
                fontWeight: 600,
                minWidth: 0,
              }}
            >
              View all
            </Button>
          </Box>

          {loading ? (
            <Stack spacing={1.5}>
              {[1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  variant="rounded"
                  height={90}
                  sx={{ borderRadius: 2, bgcolor: alpha(T.muted, 0.08) }}
                />
              ))}
            </Stack>
          ) : visits.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 5,
                bgcolor: T.surface,
                borderRadius: 3,
                border: `1px solid ${T.border}`,
              }}
            >
              <Typography sx={{ fontSize: 36, mb: 1 }}>🗺️</Typography>
              <Typography
                sx={{
                  color: T.muted,
                  fontSize: 14,
                  mb: 2,
                  fontFamily: "inherit",
                }}
              >
                No visits recorded today
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate("/visit-details")}
                sx={{
                  borderRadius: 3,
                  px: 3,
                  bgcolor: T.accent,
                  "&:hover": { bgcolor: "#E05A42" },
                  fontFamily: "inherit",
                }}
              >
                Start your first visit
              </Button>
            </Box>
          ) : (
            <Stack spacing={1.25}>
              {visits.map((v, i) => {
                const cfg = getStatus(v.status);
                const isSelected = selectedId === v._id;
                const emoji = visitEmoji(i, v.status);
                return (
                  <Zoom
                    in
                    key={v._id}
                    style={{ transitionDelay: `${i * 60}ms` }}
                  >
                    {/*
                      ✅ Click card → map flies to visit location & info window opens
                    */}
                    <SurfaceCard
                      elevation={0}
                      selected={isSelected ? 1 : 0}
                      accentcolor={cfg.color}
                      onClick={() => handleCardClick(v)}
                    >
                      <CardContent sx={{ p: "14px 16px !important" }}>
                        <Stack
                          direction="row"
                          spacing={1.5}
                          alignItems="flex-start"
                        >
                          {/* Number badge */}
                          <NumberBadge badgecolor={cfg.color}>
                            {i + 1}
                          </NumberBadge>

                          {/* Content */}
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="flex-start"
                              sx={{ mb: 0.5 }}
                            >
                              <Typography
                                sx={{
                                  fontWeight: 700,
                                  color: T.text,
                                  fontSize: 13.5,
                                  fontFamily: "inherit",
                                  lineHeight: 1.3,
                                }}
                                noWrap
                              >
                                {emoji} {v.locationName || "Untitled visit"}
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: 10.5,
                                  color: T.muted,
                                  flexShrink: 0,
                                  ml: 1,
                                  fontFamily: "inherit",
                                }}
                              >
                                🕐 {fmtClock(v.createdAt)}
                              </Typography>
                            </Stack>

                            <Typography
                              sx={{
                                fontSize: 11.5,
                                color: T.muted,
                                mb: 1,
                                fontFamily: "inherit",
                              }}
                              noWrap
                            >
                              📍{" "}
                              {v.address ||
                                (v.latitude
                                  ? `${v.latitude.toFixed(5)}, ${v.longitude.toFixed(5)}`
                                  : "No location")}
                            </Typography>

                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                              flexWrap="wrap"
                            >
                              {/* Status chip */}
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                  bgcolor: alpha(cfg.color, 0.12),
                                  border: `1px solid ${alpha(cfg.color, 0.3)}`,
                                  borderRadius: 10,
                                  px: 1,
                                  py: 0.25,
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: "50%",
                                    bgcolor: cfg.color,
                                  }}
                                />
                                <Typography
                                  sx={{
                                    fontSize: 10.5,
                                    color: cfg.color,
                                    fontWeight: 700,
                                    fontFamily: "inherit",
                                  }}
                                >
                                  {cfg.label}
                                </Typography>
                              </Box>

                              {v.distanceFromPrevious > 0 && (
                                <Typography
                                  sx={{
                                    fontSize: 10.5,
                                    color: T.muted,
                                    fontFamily: "inherit",
                                  }}
                                >
                                  📏 +{fmtDist(v.distanceFromPrevious)}
                                </Typography>
                              )}

                              {!v.latitude && (
                                <Typography
                                  sx={{
                                    fontSize: 10.5,
                                    color: alpha(T.muted, 0.5),
                                    fontFamily: "inherit",
                                  }}
                                >
                                  No map data
                                </Typography>
                              )}
                            </Stack>
                          </Box>

                          {/* Focus indicator */}
                          {isSelected && (
                            <Box
                              sx={{
                                width: 28,
                                height: 28,
                                borderRadius: "50%",
                                bgcolor: alpha(cfg.color, 0.15),
                                border: `1.5px solid ${alpha(cfg.color, 0.4)}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              <Typography sx={{ fontSize: 13 }}>🎯</Typography>
                            </Box>
                          )}
                        </Stack>
                      </CardContent>
                    </SurfaceCard>
                  </Zoom>
                );
              })}
            </Stack>
          )}
        </Box>

        {/* ── Quick Actions ─────────────────────────────────────────────── */}
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate("/visit-details")}
              sx={{
                py: 1.5,
                borderRadius: 3,
                bgcolor: T.accent,
                "&:hover": { bgcolor: "#E05A42" },
                fontWeight: 700,
                fontFamily: "inherit",
                boxShadow: `0 4px 16px ${alpha(T.accent, 0.35)}`,
              }}
            >
              New Visit
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<RouteIcon />}
              onClick={() => navigate("/route-history")}
              sx={{
                py: 1.5,
                borderRadius: 3,
                borderColor: T.border,
                color: T.text,
                "&:hover": {
                  bgcolor: alpha(T.blue, 0.08),
                  borderColor: T.blue,
                },
                fontWeight: 600,
                fontFamily: "inherit",
              }}
            >
              Route History
            </Button>
          </Grid>
          {isManager && (
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<TeamIcon />}
                onClick={() => navigate("/team-performance")}
                sx={{
                  py: 1.5,
                  borderRadius: 3,
                  borderColor: T.border,
                  color: T.text,
                  "&:hover": {
                    bgcolor: alpha(T.purple, 0.08),
                    borderColor: T.purple,
                  },
                  fontWeight: 600,
                  fontFamily: "inherit",
                }}
              >
                👥 Team Performance
              </Button>
            </Grid>
          )}
        </Grid>
      </Container>

      {/* ── Bottom Nav ────────────────────────────────────────────────────── */}
      <Paper
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 200,
          bgcolor: alpha(T.surface, 0.96),
          backdropFilter: "blur(24px)",
          borderTop: `1px solid ${T.border}`,
        }}
        elevation={0}
      >
        <BottomNavigation
          value={navValue}
          onChange={(_, v) => {
            setNavValue(v);
            [
              "/dashboard",
              "/total-visits",
              "/route-history",
              "/team-performance",
            ][v] &&
              navigate(
                [
                  "/dashboard",
                  "/total-visits",
                  "/route-history",
                  "/team-performance",
                ][v],
              );
          }}
          showLabels
          sx={{
            bgcolor: "transparent",
            height: 64,
            "& .Mui-selected": { color: T.accent },
            "& .MuiBottomNavigationAction-root": {
              color: T.muted,
              fontFamily: "inherit",
              fontSize: 11,
            },
          }}
        >
          <BottomNavigationAction label="Dashboard" icon={<DashboardIcon />} />
          <BottomNavigationAction label="Visits" icon={<VisitsIcon />} />
          <BottomNavigationAction label="Route" icon={<RouteIcon />} />
          {isManager && (
            <BottomNavigationAction label="Team" icon={<TeamIcon />} />
          )}
        </BottomNavigation>
        <Fab
          onClick={() => navigate("/visit-details")}
          sx={{
            position: "absolute",
            top: -26,
            left: "50%",
            transform: "translateX(-50%)",
            bgcolor: T.accent,
            color: "#fff",
            boxShadow: `0 4px 20px ${alpha(T.accent, 0.5)}`,
            "&:hover": { bgcolor: "#E05A42" },
            width: 52,
            height: 52,
          }}
        >
          <AddIcon />
        </Fab>
      </Paper>

      {/* ── Side Drawer ───────────────────────────────────────────────────── */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: "78%", sm: 290 },
            bgcolor: T.surface,
            borderRight: `1px solid ${T.border}`,
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 3 }}
          >
            <Typography
              sx={{
                fontWeight: 800,
                color: T.text,
                fontSize: 16,
                fontFamily: "inherit",
              }}
            >
              📊 Menu
            </Typography>
            <IconButton
              size="small"
              onClick={() => setDrawerOpen(false)}
              sx={{ color: T.muted }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 3,
              p: 2,
              bgcolor: alpha(T.accent, 0.08),
              borderRadius: 3,
              border: `1px solid ${alpha(T.accent, 0.2)}`,
            }}
          >
            <Avatar
              sx={{
                width: 46,
                height: 46,
                bgcolor: alpha(T.accent, 0.2),
                color: T.accent,
                fontWeight: 800,
                fontSize: 20,
              }}
            >
              {(user?.name || "U")[0]}
            </Avatar>
            <Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  color: T.text,
                  fontSize: 14,
                  fontFamily: "inherit",
                }}
              >
                {user?.name || "User"}
              </Typography>
              <Typography
                sx={{ fontSize: 11, color: T.muted, fontFamily: "inherit" }}
              >
                {user?.role}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ borderColor: T.border, mb: 2 }} />

          <Stack spacing={0.75}>
            {[
              { label: "Dashboard", icon: "📊", path: "/dashboard" },
              { label: "Start Visits", icon: "📋", path: "/visit-details" },
              { label: "Track Location", icon: "🗺️", path: "/visit-route" },
              ...(isManager
                ? [
                    {
                      label: "Team Performance",
                      icon: "👥",
                      path: "/team-performance",
                    },
                  ]
                : []),
            ].map((item) => (
              <Button
                key={item.label}
                fullWidth
                onClick={() => {
                  navigate(item.path);
                  setDrawerOpen(false);
                }}
                sx={{
                  justifyContent: "flex-start",
                  px: 2,
                  py: 1.25,
                  color: T.text,
                  borderRadius: 2.5,
                  fontFamily: "inherit",
                  fontWeight: 600,
                  fontSize: 13.5,
                  "&:hover": { bgcolor: alpha(T.blue, 0.1) },
                }}
              >
                <Typography component="span" sx={{ mr: 1.5, fontSize: 16 }}>
                  {item.icon}
                </Typography>
                {item.label}
              </Button>
            ))}
          </Stack>
        </Box>
      </Drawer>

      {/* ── Snackbar ──────────────────────────────────────────────────────── */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3200}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ mb: 8 }}
      >
        <Alert
          severity={snack.type}
          variant="filled"
          sx={{ borderRadius: 3, fontFamily: "inherit" }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
