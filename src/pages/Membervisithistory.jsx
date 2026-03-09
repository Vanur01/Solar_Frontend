// pages/MemberVisitHistory.jsx (Fully Mobile Responsive)
import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Stack,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  alpha,
  Drawer,
  BottomNavigation,
  BottomNavigationAction,
  Fab,
  Zoom,
  SwipeableDrawer,
  Divider,
  Badge,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  ListItemIcon,Checkbox,FormControl,Select,
  ListItemText,FormControlLabel,
} from "@mui/material";
import {
  ArrowBack,
  CalendarToday,
  ExpandMore,
  Mail,
  Download,
  Route,
  LocationOn,
  Timer,
  Refresh,Today,
  Add,
  Store,
  Restaurant,
  Business,
  MyLocation,
  Login,
  Logout,
  CheckCircle,
  Cancel,
  Menu as MenuIcon,
  MoreVert,
  Share,
  FilterList,
  Dashboard,
  History,
  Person,
  Close,
  DateRange,
  AccessTime,
  TrendingUp,
  PieChart,
  BarChart,
  Fullscreen,
  FullscreenExit,
  ZoomIn,
  ZoomOut,
  Layers,
  Map,
  Satellite,
  DirectionsCar,
  Warning,
  Info,
} from "@mui/icons-material";

const PRIMARY = "#136dec";
const SUCCESS = "#22c55e";
const WARNING = "#f59e0b";
const ERROR = "#ef4444";

// ─── Summary Metrics ──────────────────────────────────────────────────────────
const METRICS = [
  { icon: <Route />, label: "Distance", value: "45.2", unit: "km" },
  { icon: <LocationOn />, label: "Visits", value: "8", unit: "stops" },
  { icon: <Timer />, label: "Avg. Time", value: "42", unit: "mins" },
];

// ─── Timeline Entries ─────────────────────────────────────────────────────────
const TIMELINE = [
  {
    id: 1,
    type: "visit",
    icon: <Store sx={{ fontSize: 18, color: "#fff" }} />,
    iconBg: PRIMARY,
    title: "TechNova Solutions",
    address: "452 Market St, San Francisco",
    time: "09:15 AM",
    checkin: "09:15 AM",
    checkout: "10:30 AM",
    note: "Discussed the Q4 hardware upgrade plan. Client is interested in the new server series.",
    status: null,
  },
  {
    id: 2,
    type: "break",
    icon: <Restaurant sx={{ fontSize: 18, color: "#64748b" }} />,
    iconBg: "#f1f5f9",
    title: "Blue Bottle Coffee",
    address: "66 Mint St, San Francisco",
    time: "11:00 AM",
    duration: "30 min break",
    note: null,
    status: null,
  },
  {
    id: 3,
    type: "visit",
    icon: <Business sx={{ fontSize: 18, color: "#fff" }} />,
    iconBg: PRIMARY,
    title: "Apex Global Logistics",
    address: "Pier 27, The Embarcadero",
    time: "12:30 PM",
    checkin: "12:30 PM",
    checkout: "01:45 PM",
    note: "Routine maintenance check. All systems operational. Renewed support contract for 12 months.",
    status: null,
  },
  {
    id: 4,
    type: "current",
    icon: <MyLocation sx={{ fontSize: 18, color: "#fff" }} />,
    iconBg: SUCCESS,
    title: "Swift Delivery Hub",
    address: "1500 Mission St, San Francisco",
    time: "02:20 PM",
    checkin: "02:20 PM",
    checkout: null,
    note: null,
    status: "inprogress",
  },
];

// ─── Timeline Item ─────────────────────────────────────────────────────────────
const TimelineItem = ({ entry, isLast, isMobile }) => {
  const isCurrent = entry.status === "inprogress";
  const [expanded, setExpanded] = useState(false);

  return (
    <Box sx={{ position: "relative", display: "flex", gap: isMobile ? 1.5 : 2 }}>
      {/* Dot */}
      <Box
        sx={{
          zIndex: 1,
          width: isMobile ? 36 : 40,
          height: isMobile ? 36 : 40,
          flexShrink: 0,
          borderRadius: "50%",
          bgcolor: entry.iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 0 4px #fff",
          ...(isCurrent && {
            animation: "pulse 1.5s ease-in-out infinite",
            "@keyframes pulse": {
              "0%, 100%": { opacity: 1 },
              "50%": { opacity: 0.6 },
            },
          }),
        }}
      >
        {entry.icon}
      </Box>

      {/* Card */}
      <Box
        sx={{
          flex: 1,
          border: isCurrent ? "1px solid #bbf7d0" : "1px solid #f1f5f9",
          bgcolor: isCurrent ? alpha(SUCCESS, 0.03) : "#fff",
          borderRadius: "0.75rem",
          p: isMobile ? 1.5 : 2,
          mb: isLast ? 0 : 0,
        }}
      >
        {/* Title row */}
        <Box sx={{ 
          display: "flex", 
          alignItems: "flex-start", 
          justifyContent: "space-between", 
          mb: 0.5,
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 0.5 : 0
        }}>
          <Typography 
            variant="body2" 
            fontWeight={700} 
            sx={{ 
              color: "#1e293b", 
              fontSize: isMobile ? "0.8rem" : "0.82rem",
              wordBreak: "break-word"
            }}
          >
            {entry.title}
          </Typography>
          {isCurrent ? (
            <Chip
              label="In Progress"
              size="small"
              sx={{
                bgcolor: "#dcfce7",
                color: SUCCESS,
                fontWeight: 700,
                fontSize: "0.6rem",
                height: 20,
                borderRadius: "0.25rem",
                letterSpacing: "0.04em",
                alignSelf: isMobile ? "flex-start" : "auto"
              }}
            />
          ) : (
            <Typography 
              variant="caption" 
              sx={{ 
                color: "#94a3b8", 
                fontWeight: 600, 
                fontSize: "0.65rem", 
                textTransform: "uppercase", 
                letterSpacing: "0.06em" 
              }}
            >
              {entry.time}
            </Typography>
          )}
        </Box>

        {/* Address */}
        <Stack 
          direction="row" 
          alignItems="center" 
          spacing={0.25} 
          sx={{ mb: 1 }}
        >
          <LocationOn sx={{ fontSize: 13, color: "#94a3b8" }} />
          <Typography 
            variant="caption" 
            sx={{ 
              color: "#64748b", 
              fontSize: isMobile ? "0.68rem" : "0.7rem",
              wordBreak: "break-word"
            }}
          >
            {entry.address}
          </Typography>
        </Stack>

        {/* Times */}
        {entry.checkin && (
          <Stack 
            direction={isMobile ? "column" : "row"} 
            spacing={isMobile ? 1 : 3} 
            sx={{ mb: entry.note || isCurrent ? 1.5 : 0 }}
          >
            <Stack direction="row" alignItems="center" spacing={0.4}>
              <Login sx={{ fontSize: 13, color: "#94a3b8" }} />
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 500, fontSize: isMobile ? "0.65rem" : "0.68rem" }}>
                {entry.checkin}
              </Typography>
            </Stack>
            {entry.checkout && (
              <Stack direction="row" alignItems="center" spacing={0.4}>
                <Logout sx={{ fontSize: 13, color: "#94a3b8" }} />
                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 500, fontSize: isMobile ? "0.65rem" : "0.68rem" }}>
                  {entry.checkout}
                </Typography>
              </Stack>
            )}
          </Stack>
        )}

        {/* Break duration */}
        {entry.duration && (
          <Stack direction="row" alignItems="center" spacing={0.4} sx={{ mb: 0.5 }}>
            <Timer sx={{ fontSize: 13, color: "#94a3b8" }} />
            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 500, fontSize: isMobile ? "0.65rem" : "0.68rem" }}>
              {entry.duration}
            </Typography>
          </Stack>
        )}

        {/* Note - Collapsible on mobile */}
        {entry.note && (
          <>
            {isMobile && !expanded && (
              <Button
                size="small"
                onClick={() => setExpanded(true)}
                sx={{
                  mt: 0.5,
                  p: 0,
                  color: PRIMARY,
                  fontSize: "0.65rem",
                  textTransform: "none",
                  fontWeight: 600
                }}
              >
                Show Notes
              </Button>
            )}
            {(expanded || !isMobile) && (
              <Box
                sx={{
                  bgcolor: "#f8fafc",
                  borderLeft: `2px solid ${alpha(PRIMARY, 0.3)}`,
                  borderRadius: "0 0.5rem 0.5rem 0",
                  p: 1.25,
                  mt: 0.5,
                }}
              >
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: "#475569", 
                    fontSize: isMobile ? "0.7rem" : "0.72rem", 
                    fontStyle: "italic",
                    wordBreak: "break-word"
                  }}
                >
                  "{entry.note}"
                </Typography>
                {isMobile && (
                  <Button
                    size="small"
                    onClick={() => setExpanded(false)}
                    sx={{
                      mt: 0.5,
                      p: 0,
                      color: PRIMARY,
                      fontSize: "0.65rem",
                      textTransform: "none",
                      fontWeight: 600
                    }}
                  >
                    Hide
                  </Button>
                )}
              </Box>
            )}
          </>
        )}

        {/* Current Visit Actions */}
        {isCurrent && (
          <Stack 
            direction={isMobile ? "column" : "row"} 
            spacing={1.5} 
            sx={{ mt: 1.5 }} 
            flexWrap="wrap"
          >
            <Button
              size="small"
              startIcon={<CheckCircle sx={{ fontSize: 14 }} />}
              fullWidth={isMobile}
              sx={{
                flex: 1,
                minWidth: 120,
                bgcolor: SUCCESS,
                color: "#fff",
                fontWeight: 700,
                fontSize: isMobile ? "0.65rem" : "0.68rem",
                textTransform: "none",
                borderRadius: "0.5rem",
                py: 0.8,
                "&:hover": { bgcolor: "#15803d" },
                boxShadow: "0 1px 3px rgba(22,163,74,0.25)",
              }}
            >
              Complete Visit
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Cancel sx={{ fontSize: 14 }} />}
              fullWidth={isMobile}
              sx={{
                flex: 1,
                minWidth: 120,
                borderColor: "#e2e8f0",
                color: "#475569",
                fontWeight: 700,
                fontSize: isMobile ? "0.65rem" : "0.68rem",
                textTransform: "none",
                borderRadius: "0.5rem",
                py: 0.8,
                bgcolor: "#fff",
                "&:hover": { bgcolor: "#f8fafc" },
              }}
            >
              Cancel Visit
            </Button>
          </Stack>
        )}
      </Box>
    </Box>
  );
};

// ─── Mobile Filter Drawer ─────────────────────────────────────────────────────
const MobileFilterDrawer = ({ open, onClose }) => {
  const [selectedDate, setSelectedDate] = useState("today");
  
  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      disableSwipeToOpen={false}
      PaperProps={{
        sx: {
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          maxHeight: "80vh",
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            width: 40,
            height: 4,
            bgcolor: "grey.300",
            borderRadius: 2,
            mx: "auto",
            mb: 2,
          }}
        />
        
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight={700} color={PRIMARY}>
            Filter Timeline
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Stack>

        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Date Range
            </Typography>
            <Stack spacing={1}>
              {[
                { value: "today", label: "Today", icon: <Today /> },
                { value: "yesterday", label: "Yesterday", icon: <DateRange /> },
                { value: "week", label: "This Week", icon: <DateRange /> },
                { value: "month", label: "This Month", icon: <DateRange /> },
                { value: "custom", label: "Custom Range", icon: <DateRange /> },
              ].map((option) => (
                <Button
                  key={option.value}
                  fullWidth
                  variant={selectedDate === option.value ? "contained" : "outlined"}
                  startIcon={option.icon}
                  onClick={() => setSelectedDate(option.value)}
                  sx={{
                    justifyContent: "flex-start",
                    borderRadius: 2,
                    borderColor: PRIMARY,
                    color: selectedDate === option.value ? "#fff" : PRIMARY,
                    bgcolor: selectedDate === option.value ? PRIMARY : "transparent",
                  }}
                >
                  {option.label}
                </Button>
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Visit Type
            </Typography>
            <Stack spacing={1}>
              {[
                { value: "all", label: "All Visits" },
                { value: "completed", label: "Completed" },
                { value: "inprogress", label: "In Progress" },
                { value: "breaks", label: "Breaks" },
              ].map((option) => (
                <FormControlLabel
                  key={option.value}
                  control={
                    <Checkbox
                      sx={{
                        color: PRIMARY,
                        "&.Mui-checked": { color: PRIMARY },
                      }}
                    />
                  }
                  label={option.label}
                />
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Sort By
            </Typography>
            <FormControl fullWidth size="small">
              <Select defaultValue="time_desc">
                <MenuItem value="time_desc">Time (Newest First)</MenuItem>
                <MenuItem value="time_asc">Time (Oldest First)</MenuItem>
                <MenuItem value="duration_desc">Duration (Longest)</MenuItem>
                <MenuItem value="duration_asc">Duration (Shortest)</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={onClose}
              sx={{
                borderColor: PRIMARY,
                color: PRIMARY,
                borderRadius: 2,
              }}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={onClose}
              sx={{
                bgcolor: PRIMARY,
                borderRadius: 2,
                "&:hover": { bgcolor: "#0f5fd4" },
              }}
            >
              Apply
            </Button>
          </Stack>
        </Stack>
      </Box>
    </SwipeableDrawer>
  );
};

// ─── Map Style Selector ───────────────────────────────────────────────────────
const MapStyleSelector = ({ open, anchorEl, onClose, onSelect }) => {
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 2,
          minWidth: 180,
          mt: 1,
        },
      }}
    >
      <MenuItem onClick={() => { onSelect("roadmap"); onClose(); }}>
        <ListItemIcon><Map fontSize="small" /></ListItemIcon>
        <ListItemText>Road Map</ListItemText>
      </MenuItem>
      <MenuItem onClick={() => { onSelect("satellite"); onClose(); }}>
        <ListItemIcon><Satellite fontSize="small" /></ListItemIcon>
        <ListItemText>Satellite</ListItemText>
      </MenuItem>
      <MenuItem onClick={() => { onSelect("terrain"); onClose(); }}>
        <ListItemIcon><Layers fontSize="small" /></ListItemIcon>
        <ListItemText>Terrain</ListItemText>
      </MenuItem>
    </Menu>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MemberVisitHistory() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  
  const [bottomNav, setBottomNav] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [mapStyleAnchor, setMapStyleAnchor] = useState(null);
  const [mapStyle, setMapStyle] = useState("roadmap");
  const [mapZoom, setMapZoom] = useState(1);
  const [fullscreenMap, setFullscreenMap] = useState(false);
  const [showAllMetrics, setShowAllMetrics] = useState(false);

  const handleMapStyleClick = (event) => {
    setMapStyleAnchor(event.currentTarget);
  };

  const handleMapStyleClose = () => {
    setMapStyleAnchor(null);
  };

  const handleMapStyleSelect = (style) => {
    setMapStyle(style);
  };

  const handleZoomIn = () => {
    setMapZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setMapZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleFullscreen = () => {
    setFullscreenMap(!fullscreenMap);
  };

  return (
    <Box sx={{ 
      minHeight: "100vh", 
      bgcolor: "#f6f7f8", 
      fontFamily: "'Inter', sans-serif",
      pb: isMobile ? 7 : 0,
    }}>

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer 
        open={filterDrawerOpen} 
        onClose={() => setFilterDrawerOpen(false)} 
      />

      {/* Map Style Selector */}
      <MapStyleSelector
        open={Boolean(mapStyleAnchor)}
        anchorEl={mapStyleAnchor}
        onClose={handleMapStyleClose}
        onSelect={handleMapStyleSelect}
      />

      {/* ─── Main Content ─────────────────────────────────────────────── */}
      <Box
        component="main"
        sx={{ 
          p: { xs: 2, sm: 3, lg: 5 }, 
          maxWidth: 1280, 
          mx: "auto", 
          width: "100%" 
        }}
      >
        <Grid container spacing={isMobile ? 2 : 4}>

          {/* ── Left Column: Map + Metrics ─────────────────────────────── */}
          <Grid item xs={12} lg={7}>
            <Stack spacing={isMobile ? 2 : 3}>

              {/* Map with Controls */}
              <Paper
                elevation={0}
                sx={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: "0.75rem",
                  border: "1px solid #e2e8f0",
                  aspectRatio: { xs: "4/3", sm: "16/9", lg: "1/1" },
                  maxHeight: { xs: 300, sm: 400, lg: 600 },
                  backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAilhso8ih8JRLY6xfV-NWoT3eY21r4NGlDuaaz8gRLoWxHDpY_s_oBO2zxGSe9wstRo_n1y20qPC3XTXao04H7MLf97ihtYUOSgsPp2dlR93xm_e1Y-lYo3sRem2o5sHw7FzVoMTIfRL6AsLI5BZFkqLSQBhuJmcZ16VtqSFlmXMwTXEjXry2fQEuZn3PRgY0ZsDxxxTPamgEAfXQc6POMJA6jTYOmDm4YW-mB8MsEIxqQfG1w7dpCA9dZRz1cPWq8JclV7opWO5g')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* Map Style Overlay */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 16,
                    left: 16,
                    zIndex: 2,
                    bgcolor: "rgba(255,255,255,0.9)",
                    backdropFilter: "blur(4px)",
                    borderRadius: "0.5rem",
                    px: 1.5,
                    py: 0.75,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                  onClick={handleMapStyleClick}
                >
                  <Layers sx={{ fontSize: 16, color: PRIMARY }} />
                  <Typography variant="caption" fontWeight={600} sx={{ color: "#1e293b", textTransform: "capitalize" }}>
                    {mapStyle}
                  </Typography>
                  <ExpandMore sx={{ fontSize: 16, color: "#64748b" }} />
                </Box>

                {/* Overlay */}
                <Box sx={{ position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,0.1)" }} />

                {/* Zoom Controls */}
                <Stack
                  spacing={1}
                  sx={{ position: "absolute", top: 16, right: 16, zIndex: 2 }}
                >
                  <Paper
                    elevation={3}
                    sx={{
                      width: { xs: 32, sm: 36 },
                      height: { xs: 32, sm: 36 },
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "0.5rem",
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: { xs: "1rem", sm: "1.1rem" },
                      color: "#334155",
                      "&:hover": { bgcolor: "#f8fafc" },
                    }}
                    onClick={handleZoomIn}
                  >
                    +
                  </Paper>
                  <Paper
                    elevation={3}
                    sx={{
                      width: { xs: 32, sm: 36 },
                      height: { xs: 32, sm: 36 },
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "0.5rem",
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: { xs: "1rem", sm: "1.1rem" },
                      color: "#334155",
                      "&:hover": { bgcolor: "#f8fafc" },
                    }}
                    onClick={handleZoomOut}
                  >
                    −
                  </Paper>
                  <Paper
                    elevation={3}
                    sx={{
                      width: { xs: 32, sm: 36 },
                      height: { xs: 32, sm: 36 },
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "0.5rem",
                      cursor: "pointer",
                      color: "#334155",
                      "&:hover": { bgcolor: "#f8fafc" },
                    }}
                    onClick={handleFullscreen}
                  >
                    {fullscreenMap ? <FullscreenExit sx={{ fontSize: { xs: 16, sm: 18 } }} /> : <Fullscreen sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                  </Paper>
                </Stack>

                {/* Route Badge */}
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 16,
                    left: 16,
                    zIndex: 2,
                    bgcolor: "rgba(255,255,255,0.92)",
                    backdropFilter: "blur(4px)",
                    px: 1.5,
                    py: 0.75,
                    borderRadius: "0.5rem",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  <Typography variant="caption" fontWeight={600} sx={{ fontSize: isMobile ? "0.68rem" : "0.72rem", color: "#0f172a" }}>
                    Today's Route: 45.2 km
                  </Typography>
                </Box>

                {/* Current Location Pin */}
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ position: "relative", width: { xs: 28, sm: 32 }, height: { xs: 28, sm: 32 }, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Box
                      sx={{
                        position: "absolute",
                        width: { xs: 28, sm: 32 },
                        height: { xs: 28, sm: 32 },
                        borderRadius: "50%",
                        bgcolor: alpha(SUCCESS, 0.7),
                        animation: "ping 1.5s ease-in-out infinite",
                        "@keyframes ping": {
                          "0%": { transform: "scale(1)", opacity: 0.75 },
                          "100%": { transform: "scale(1.8)", opacity: 0 },
                        },
                      }}
                    />
                    <Box
                      sx={{
                        width: { xs: 14, sm: 16 },
                        height: { xs: 14, sm: 16 },
                        borderRadius: "50%",
                        bgcolor: SUCCESS,
                        border: "2px solid #fff",
                        zIndex: 1,
                      }}
                    />
                  </Box>
                  <Box
                    sx={{
                      mt: 0.5,
                      bgcolor: "rgba(255,255,255,0.97)",
                      px: 1,
                      py: 0.3,
                      borderRadius: "0.375rem",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                      border: "1px solid rgba(34,197,94,0.3)",
                    }}
                  >
                    <Typography sx={{ fontSize: isMobile ? "0.55rem" : "0.6rem", fontWeight: 700, color: "#1e293b", whiteSpace: "nowrap" }}>
                      Current Location
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Metrics - Scrollable on mobile */}
              <Box sx={{ 
                overflowX: isMobile ? "auto" : "visible",
                pb: isMobile ? 1 : 0,
              }}>
                <Grid 
                  container 
                  spacing={isMobile ? 1.5 : 2} 
                  sx={{ 
                    minWidth: isMobile ? 600 : "auto",
                    flexWrap: isMobile ? "nowrap" : "wrap",
                  }}
                >
                  {METRICS.map((m, i) => (
                    <Grid item key={i} sx={{ flex: isMobile ? "0 0 auto" : 1, width: isMobile ? 200 : "auto" }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: { xs: 2, sm: 2.5 },
                          borderRadius: "0.75rem",
                          border: "1px solid #e2e8f0",
                          bgcolor: "#fff",
                          "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.06)" },
                          transition: "box-shadow 0.2s",
                          height: "100%",
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                          {React.cloneElement(m.icon, { sx: { fontSize: { xs: 18, sm: 20 }, color: PRIMARY } })}
                          <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 500, fontSize: { xs: "0.75rem", sm: "0.78rem" } }}>
                            {m.label}
                          </Typography>
                        </Stack>
                        <Typography variant="h5" fontWeight={700} sx={{ color: "#0f172a", letterSpacing: "-0.5px", fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
                          {m.value}{" "}
                          <Typography component="span" variant="body2" sx={{ color: "#94a3b8", fontWeight: 400, fontSize: { xs: "0.7rem", sm: "0.78rem" } }}>
                            {m.unit}
                          </Typography>
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Additional Metrics Toggle for Mobile */}
              {isMobile && (
                <Button
                  fullWidth
                  variant="text"
                  onClick={() => setShowAllMetrics(!showAllMetrics)}
                  sx={{
                    color: PRIMARY,
                    fontSize: "0.75rem",
                    fontWeight: 600,
                  }}
                >
                  {showAllMetrics ? "Show Less" : "Show More Metrics"}
                </Button>
              )}

              {/* Additional Metrics (shown when toggled) */}
              {isMobile && showAllMetrics && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: "0.75rem",
                    border: "1px solid #e2e8f0",
                    bgcolor: "#fff",
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, color: "#0f172a" }}>
                    Detailed Statistics
                  </Typography>
                  <Stack spacing={2}>
                    {[
                      { label: "Total Distance", value: "45.2 km", trend: "+12%", color: SUCCESS },
                      { label: "Total Time", value: "6h 30m", trend: "-5%", color: ERROR },
                      { label: "Visits Completed", value: "8/10", trend: "80%", color: PRIMARY },
                      { label: "Break Time", value: "1h 15m", trend: "15%", color: WARNING },
                    ].map((stat, i) => (
                      <Box key={i} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography variant="body2" fontWeight={600}>{stat.value}</Typography>
                          <Chip
                            label={stat.trend}
                            size="small"
                            sx={{
                              bgcolor: alpha(stat.color, 0.1),
                              color: stat.color,
                              fontWeight: 600,
                              height: 20,
                              fontSize: "0.6rem",
                            }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              )}
            </Stack>
          </Grid>

          {/* ── Right Column: Actions + Timeline ──────────────────────── */}
          <Grid item xs={12} lg={5}>
            <Stack spacing={isMobile ? 2 : 3}>

              {/* Action Buttons */}
              <Stack 
                direction={isMobile ? "column" : "row"} 
                spacing={isMobile ? 1 : 1.5}
              >
                <Button
                  fullWidth
                  startIcon={<Mail sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                  sx={{
                    bgcolor: PRIMARY,
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: { xs: "0.75rem", sm: "0.8rem" },
                    textTransform: "none",
                    borderRadius: "0.5rem",
                    py: { xs: 1, sm: 1.25 },
                    boxShadow: `0 1px 3px ${alpha(PRIMARY, 0.3)}`,
                    "&:hover": { bgcolor: "#0f5fd4" },
                  }}
                >
                  Contact Member
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Download sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                  sx={{
                    borderColor: "#e2e8f0",
                    color: "#1e293b",
                    fontWeight: 700,
                    fontSize: { xs: "0.75rem", sm: "0.8rem" },
                    textTransform: "none",
                    borderRadius: "0.5rem",
                    py: { xs: 1, sm: 1.25 },
                    bgcolor: "#fff",
                    "&:hover": { bgcolor: "#f8fafc" },
                  }}
                >
                  Export Report
                </Button>
              </Stack>

              {/* Timeline Card */}
              <Paper
                elevation={0}
                sx={{
                  borderRadius: "0.75rem",
                  border: "1px solid #e2e8f0",
                  bgcolor: "#fff",
                  overflow: "hidden",
                }}
              >
                {/* Timeline Header */}
                <Box
                  sx={{
                    px: { xs: 2, sm: 2.5 },
                    py: { xs: 1.5, sm: 2 },
                    borderBottom: "1px solid #f1f5f9",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    flexWrap: "wrap",
                  }}
                >
                  <Typography 
                    variant={isMobile ? "body1" : "subtitle1"} 
                    fontWeight={700} 
                    sx={{ color: "#0f172a", mr: "auto" }}
                  >
                    Visit Timeline
                  </Typography>
                  
                  {!isMobile && (
                    <>
                      <Tooltip title="Refresh">
                        <IconButton size="small" sx={{ color: "#94a3b8", borderRadius: "0.375rem", "&:hover": { bgcolor: "#f8fafc" } }}>
                          <Refresh sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.7rem", mr: 1 }}>
                        Updated 5m ago
                      </Typography>
                    </>
                  )}
                  
                  <Button
                    size="small"
                    startIcon={<Add sx={{ fontSize: { xs: 12, sm: 14 } }} />}
                    fullWidth={isMobile}
                    sx={{
                      bgcolor: alpha(PRIMARY, 0.08),
                      color: PRIMARY,
                      fontWeight: 700,
                      fontSize: { xs: "0.65rem", sm: "0.7rem" },
                      textTransform: "none",
                      borderRadius: "0.5rem",
                      px: { xs: 1, sm: 1.5 },
                      py: 0.6,
                      "&:hover": { bgcolor: alpha(PRIMARY, 0.14) },
                    }}
                  >
                    Add New Visit
                  </Button>
                </Box>

                {/* Mobile Timeline Header Extras */}
                {isMobile && (
                  <Box
                    sx={{
                      px: 2,
                      py: 1,
                      borderBottom: "1px solid #f1f5f9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      bgcolor: "#f8fafc",
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Refresh sx={{ fontSize: 14, color: "#94a3b8" }} />
                      <Typography variant="caption" sx={{ color: "#64748b" }}>
                        Updated 5m ago
                      </Typography>
                    </Stack>
                    <Badge badgeContent={3} color="primary" sx={{ "& .MuiBadge-badge": { fontSize: "0.6rem", height: 16, minWidth: 16 } }}>
                      <FilterList 
                        sx={{ fontSize: 18, color: PRIMARY, cursor: "pointer" }} 
                        onClick={() => setFilterDrawerOpen(true)}
                      />
                    </Badge>
                  </Box>
                )}

                {/* Timeline Entries */}
                <Box sx={{ p: { xs: 2, sm: 2.5 }, position: "relative" }}>
                  {/* Vertical line */}
                  <Box
                    sx={{
                      position: "absolute",
                      left: { xs: "calc(2rem + 8px)", sm: "calc(2.25rem + 10px)" },
                      top: 40,
                      bottom: 40,
                      width: 2,
                      bgcolor: "#f1f5f9",
                      zIndex: 0,
                      display: { xs: "none", sm: "block" }
                    }}
                  />

                  <Stack spacing={isMobile ? 3 : 4}>
                    {TIMELINE.map((entry, i) => (
                      <TimelineItem 
                        key={entry.id} 
                        entry={entry} 
                        isLast={i === TIMELINE.length - 1}
                        isMobile={isMobile}
                      />
                    ))}
                  </Stack>
                </Box>

                {/* Load More */}
                <Box
                  sx={{
                    px: { xs: 2, sm: 3 },
                    py: { xs: 1.5, sm: 2 },
                    bgcolor: "#f8fafc",
                    textAlign: "center",
                    borderTop: "1px solid #f1f5f9",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: PRIMARY,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontSize: { xs: "0.75rem", sm: "0.8rem" },
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    Load earlier visits
                  </Typography>
                </Box>
              </Paper>

              {/* Quick Stats for Mobile */}
              {isMobile && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: "0.75rem",
                    border: "1px solid #e2e8f0",
                    bgcolor: "#fff",
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, color: "#0f172a" }}>
                    Today's Summary
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography variant="h6" fontWeight={700} color={PRIMARY}>
                          8
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Visits
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography variant="h6" fontWeight={700} color={SUCCESS}>
                          6
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Completed
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography variant="h6" fontWeight={700} color={WARNING}>
                          2
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Pending
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              )}
            </Stack>
          </Grid>

        </Grid>
      </Box>

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
            borderTop: `1px solid ${alpha(PRIMARY, 0.1)}`,
          }}
          elevation={3}
        >
          <BottomNavigation
            showLabels
            value={bottomNav}
            onChange={(e, newValue) => setBottomNav(newValue)}
            sx={{
              height: 56,
              "& .MuiBottomNavigationAction-root": {
                color: "#64748b",
                "&.Mui-selected": { color: PRIMARY },
                minWidth: 0,
                py: 0.5,
              },
            }}
          >
            <BottomNavigationAction
              label="Dashboard"
              icon={<Dashboard sx={{ fontSize: 20 }} />}
              sx={{ fontSize: "0.65rem" }}
            />
            <BottomNavigationAction
              label="Timeline"
              icon={<History sx={{ fontSize: 20 }} />}
              sx={{ fontSize: "0.65rem" }}
            />
            <BottomNavigationAction
              label="Profile"
              icon={<Person sx={{ fontSize: 20 }} />}
              sx={{ fontSize: "0.65rem" }}
            />
          </BottomNavigation>
        </Paper>
      )}

      {/* Mobile FAB for quick actions */}
      {isMobile && (
        <Zoom in={true}>
          <Fab
            color="primary"
            aria-label="add"
            sx={{
              position: "fixed",
              bottom: 72,
              right: 16,
              zIndex: 1000,
              bgcolor: PRIMARY,
              "&:hover": { bgcolor: "#0f5fd4" },
              boxShadow: `0 4px 12px ${alpha(PRIMARY, 0.3)}`,
            }}
          >
            <Add />
          </Fab>
        </Zoom>
      )}
    </Box>
  );
}