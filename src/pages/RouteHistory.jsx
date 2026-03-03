// components/RouteHistory.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  Avatar,
  Stack,
  Chip,
  Divider,Grid,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Badge,
  Drawer,
  Fab,
  Tooltip,
  Fade,
  Alert,
  Snackbar,
  Skeleton,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Slider,
  ToggleButtonGroup,
  ToggleButton,
  Switch,
  FormControlLabel,
  Menu,
  MenuItem,
  Collapse
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  Route,
  DirectionsCar,
  Schedule,
  PhotoLibrary,
  Verified,
  Download,
  Share,
  MyLocation,
  Add,
  Remove,
  FilterList,
  Visibility,
  ChevronLeft,
  ChevronRight,
  Close,
  Menu as MenuIcon,
  GpsFixed,
  GpsOff,
  Timeline,
  AccessTime,
  Speed,
  Flag,
  Place,
  LocationOn,
  Navigation,
  NearMe,
  ZoomIn,
  ZoomOut,
  Fullscreen,
  FullscreenExit,
  Refresh,
  Info,
  Warning,
  CheckCircle,
  Error,
  History,
  Today,
  DateRange,
  Map,
  Layers,
  Satellite,
  Terrain,
  DirectionsWalk,
  DirectionsBike,
  TwoWheeler,
  Home,
  Work,
  Store,
  Restaurant,
  LocalHospital,
  School,
  PlayArrow,
  Pause,
  Stop,
  Replay,
  Assessment,
  ShowChart,
  Timeline as TimelineIcon,
  RadioButtonChecked,
  RadioButtonUnchecked,
  ArrowBack,
  ArrowForward,
  KeyboardArrowDown,
  KeyboardArrowUp
} from '@mui/icons-material';
import { format, subDays, isToday, isYesterday, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';
import { GoogleMap, LoadScript, Marker, InfoWindow, Polyline, Circle, DirectionsRenderer } from '@react-google-maps/api';
import { useAuth } from '../contexts/AuthContext';

// ========== CONSTANTS ==========
const PRIMARY = '#4569ea';
const SUCCESS = '#4caf50';
const WARNING = '#ff9800';
const ERROR = '#f44336';
const INFO = '#2196f3';

// Google Maps libraries
const libraries = ['places', 'geometry', 'directions'];

// ========== STYLED COMPONENTS ==========
const GlassPaper = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
}));

const LiveIndicator = styled(Box)(({ theme, isLive }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: isLive ? SUCCESS : ERROR,
  animation: isLive ? 'pulse 2s infinite' : 'none',
  boxShadow: isLive ? `0 0 0 2px ${alpha(SUCCESS, 0.3)}` : 'none'
}));

// ========== MAP CONFIGURATION ==========
const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'transit',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
};

// ========== MAIN COMPONENT ==========
export default function RouteHistory() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const { user, fetchAPI, getCurrentPosition, startWatchingPosition, stopWatchingPosition } = useAuth();

  // State
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [map, setMap] = useState(null);
  const [mapType, setMapType] = useState('roadmap');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);
  const [locationError, setLocationError] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [activeVisit, setActiveVisit] = useState(null);
  const [directions, setDirections] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visits, setVisits] = useState([]);
  const [dailyRoute, setDailyRoute] = useState([]);
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [trackingInterval, setTrackingInterval] = useState(null);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [viewMode, setViewMode] = useState('route'); // route, heatmap, satellite
  const [timeSlider, setTimeSlider] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1);
  const [showStats, setShowStats] = useState(true);
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [filters, setFilters] = useState({
    showCompleted: true,
    showInProgress: true,
    showCancelled: false,
    minDuration: 0,
    maxDuration: 240,
    dateRange: 'today' // today, week, month, custom
  });

  // Refs
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);
  const animationRef = useRef(null);

  // ========== DATA FETCHING ==========
  useEffect(() => {
    fetchVisits();
    return () => {
      if (trackingInterval) {
        clearInterval(trackingInterval);
      }
      stopWatchingPosition();
    };
  }, [selectedDate]);

  const fetchVisits = async () => {
    try {
      setLoading(true);
      
      // Fetch visits for selected date
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const response = await fetchAPI(`/visit?startDate=${startOfDay.toISOString()}&endDate=${endOfDay.toISOString()}&limit=50`);
      
      if (response.success && response.result?.visits) {
        const visitData = response.result.visits;
        setVisits(visitData);
        
        // Build daily route from visits
        buildDailyRoute(visitData);
        
        // Calculate totals
        calculateTotals(visitData);
      }
    } catch (error) {
      console.error('Error fetching visits:', error);
      showSnackbar('Failed to load visits', 'error');
    } finally {
      setLoading(false);
    }
  };

  const buildDailyRoute = (visitData) => {
    const sortedVisits = [...visitData].sort((a, b) => 
      new Date(a.createdAt) - new Date(b.createdAt)
    );

    const route = [];
    let totalDist = 0;

    sortedVisits.forEach((visit, index) => {
      if (visit.coordinates) {
        route.push({
          lat: visit.coordinates.lat,
          lng: visit.coordinates.lng,
          time: new Date(visit.createdAt),
          locationName: visit.locationName,
          status: visit.status,
          verified: visit.verified,
          photos: visit.photos?.length || 0,
          distance: visit.distanceFromPreviousKm || 0,
          id: visit._id
        });

        totalDist += visit.distanceFromPreviousKm || 0;
      }
    });

    setDailyRoute(route);
    setTotalDistance(totalDist);

    // Fit map to route bounds
    if (map && route.length > 0) {
      fitMapToRoute(route);
    }
  };

  const calculateTotals = (visitData) => {
    let totalMins = 0;
    let totalDist = 0;

    visitData.forEach(visit => {
      if (visit.timeSpentMinutes) {
        totalMins += visit.timeSpentMinutes;
      }
      totalDist += visit.distanceFromPreviousKm || 0;
    });

    setTotalTime(totalMins);
    setTotalDistance(totalDist);
  };

  // ========== LOCATION TRACKING ==========
  const startLiveTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported');
      return;
    }

    setIsLiveTracking(true);
    
    const watchId = startWatchingPosition(
      (position) => {
        setUserLocation({
          lat: position.lat,
          lng: position.lng,
          accuracy: position.accuracy,
          speed: position.speed || 0,
          heading: position.heading,
          timestamp: position.timestamp
        });

        setCurrentSpeed(position.speed || 0);
        setLocationError(null);

        // Add to location history (for path drawing)
        setLocationHistory(prev => {
          const newHistory = [...prev, {
            lat: position.lat,
            lng: position.lng,
            timestamp: position.timestamp
          }];
          
          // Keep last 1000 points for performance
          if (newHistory.length > 1000) {
            return newHistory.slice(-1000);
          }
          return newHistory;
        });
      },
      (error) => {
        console.error('Tracking error:', error);
        setLocationError('Location tracking failed');
        setIsLiveTracking(false);
      }
    );

    return watchId;
  }, [startWatchingPosition]);

  const stopLiveTracking = useCallback(() => {
    setIsLiveTracking(false);
    stopWatchingPosition();
    setLocationHistory([]);
    setCurrentSpeed(0);
  }, [stopWatchingPosition]);

  // ========== MAP UTILITIES ==========
  const fitMapToRoute = (route) => {
    if (!map || route.length === 0) return;

    const bounds = new window.google.maps.LatLngBounds();
    route.forEach(point => {
      bounds.extend(point);
    });

    // Add user location if available
    if (userLocation) {
      bounds.extend(userLocation);
    }

    map.fitBounds(bounds);
    
    // Don't zoom in too much
    const listener = map.addListener('idle', () => {
      if (map.getZoom() > 16) {
        map.setZoom(16);
      }
      window.google.maps.event.removeListener(listener);
    });
  };

  const handleMapLoad = (mapInstance) => {
    setMap(mapInstance);
    mapRef.current = mapInstance;
    setMapLoaded(true);

    if (dailyRoute.length > 0) {
      fitMapToRoute(dailyRoute);
    }
  };

  const handleZoomIn = () => {
    if (map) map.setZoom(map.getZoom() + 1);
  };

  const handleZoomOut = () => {
    if (map) map.setZoom(map.getZoom() - 1);
  };

  const handleMyLocation = () => {
    if (userLocation) {
      map.panTo(userLocation);
      map.setZoom(16);
    } else {
      startLiveTracking();
    }
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

  // ========== ROUTE ANIMATION ==========
  const animateRoute = useCallback(() => {
    if (!map || dailyRoute.length === 0) return;

    let step = 0;
    const totalSteps = dailyRoute.length;

    const animate = () => {
      if (step >= totalSteps - 1) {
        setIsPlaying(false);
        return;
      }

      step++;
      setTimeSlider((step / (totalSteps - 1)) * 100);

      // Highlight current point
      const currentPoint = dailyRoute[step];
      setActiveVisit(currentPoint);
      map.panTo(currentPoint);

      setTimeout(() => {
        if (isPlaying) {
          animationRef.current = requestAnimationFrame(animate);
        }
      }, 1000 / playSpeed);
    };

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dailyRoute, isPlaying, map, playSpeed]);

  useEffect(() => {
    if (isPlaying && dailyRoute.length > 0) {
      animateRoute();
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, dailyRoute, animateRoute]);

  // ========== ROUTE CALCULATION ==========
  const calculateRoute = async (start, end) => {
    if (!window.google || !start || !end) return;

    const directionsService = new window.google.maps.DirectionsService();

    try {
      const result = await directionsService.route({
        origin: start,
        destination: end,
        travelMode: window.google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: false,
        drivingOptions: {
          departureTime: new Date(),
          trafficModel: 'bestguess'
        }
      });
      
      setDirections(result);
      return result;
    } catch (error) {
      console.error('Error calculating route:', error);
      return null;
    }
  };

  // ========== UTILITIES ==========
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleExport = async () => {
    try {
      const routeData = {
        date: selectedDate,
        visits: visits,
        totalDistance,
        totalTime,
        route: dailyRoute
      };

      const blob = new Blob([JSON.stringify(routeData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `route-${format(selectedDate, 'yyyy-MM-dd')}.json`;
      a.click();
      
      showSnackbar('Route data exported successfully');
    } catch (error) {
      showSnackbar('Failed to export route data', 'error');
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showSnackbar('Link copied to clipboard', 'info');
  };

  const handleRefresh = () => {
    fetchVisits();
    showSnackbar('Data refreshed successfully');
  };

  // ========== MARKER STYLES ==========
  const getMarkerIcon = (status, verified, isActive = false) => {
    const colors = {
      'Completed': SUCCESS,
      'InProgress': WARNING,
      'Cancelled': ERROR,
      'Scheduled': INFO
    };

    const color = colors[status] || PRIMARY;

    return {
      path: window.google?.maps?.SymbolPath?.CIRCLE,
      fillColor: color,
      fillOpacity: verified ? 1 : 0.6,
      strokeColor: '#ffffff',
      strokeWeight: isActive ? 3 : 2,
      scale: isActive ? 14 : (verified ? 12 : 10)
    };
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return SUCCESS;
      case 'InProgress': return WARNING;
      case 'Cancelled': return ERROR;
      default: return INFO;
    }
  };

  // ========== FILTERED VISITS ==========
  const filteredVisits = useMemo(() => {
    return visits.filter(visit => {
      if (!filters.showCompleted && visit.status === 'Completed') return false;
      if (!filters.showInProgress && visit.status === 'InProgress') return false;
      if (!filters.showCancelled && visit.status === 'Cancelled') return false;
      
      const duration = visit.timeSpentMinutes || 0;
      if (duration < filters.minDuration || duration > filters.maxDuration) return false;
      
      return true;
    });
  }, [visits, filters]);

  // ========== RENDER ==========
  return (
    <Box 
      ref={containerRef}
      sx={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        bgcolor: '#0a0f1c',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Google Maps */}
      <LoadScript
        googleMapsApiKey="AIzaSyCqM7uF9c0ZMQjdssHqSMJJ3mBcmz5RNS0"
        libraries={libraries}
        loadingElement={
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            bgcolor: '#0a0f1c'
          }}>
            <CircularProgress sx={{ color: PRIMARY }} />
          </Box>
        }
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={userLocation || { lat: 20.5937, lng: 78.9629 }}
          zoom={12}
          options={{
            ...mapOptions,
            mapTypeId: mapType,
            styles: viewMode === 'satellite' ? [] : mapOptions.styles
          }}
          onLoad={handleMapLoad}
        >
          {/* Location History Path */}
          {locationHistory.length > 1 && (
            <Polyline
              path={locationHistory}
              options={{
                strokeColor: PRIMARY,
                strokeOpacity: 0.6,
                strokeWeight: 3,
                icons: [{
                  icon: { 
                    path: window.google?.maps?.SymbolPath?.FORWARD_CLOSED_ARROW,
                    scale: 2
                  },
                  offset: '100%',
                  repeat: '50px'
                }]
              }}
            />
          )}

          {/* Daily Route */}
          {dailyRoute.length > 1 && (
            <Polyline
              path={dailyRoute}
              options={{
                strokeColor: PRIMARY,
                strokeOpacity: 0.8,
                strokeWeight: 4,
                icons: [{
                  icon: { 
                    path: window.google?.maps?.SymbolPath?.FORWARD_CLOSED_ARROW,
                    scale: 2
                  },
                  offset: '100%',
                  repeat: '50px'
                }]
              }}
            />
          )}

          {/* Directions Route */}
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                polylineOptions: {
                  strokeColor: SUCCESS,
                  strokeWeight: 5,
                  strokeOpacity: 0.8
                },
                suppressMarkers: true
              }}
            />
          )}

          {/* User Location Marker */}
          {userLocation && (
            <Marker
              position={userLocation}
              icon={{
                path: window.google?.maps?.SymbolPath?.CIRCLE,
                fillColor: SUCCESS,
                fillOpacity: 1,
                strokeColor: 'white',
                strokeWeight: 3,
                scale: 10
              }}
              zIndex={1000}
            >
              {isLiveTracking && (
                <InfoWindow position={userLocation}>
                  <Box sx={{ p: 1 }}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      Current Location
                    </Typography>
                    <Typography variant="caption" display="block">
                      Speed: {(currentSpeed * 3.6).toFixed(1)} km/h
                    </Typography>
                    <Typography variant="caption" display="block">
                      Accuracy: ±{userLocation.accuracy?.toFixed(0)}m
                    </Typography>
                  </Box>
                </InfoWindow>
              )}
            </Marker>
          )}

          {/* Visit Markers */}
          {mapLoaded && filteredVisits.map((visit) => (
            <Marker
              key={visit._id}
              position={visit.coordinates}
              icon={getMarkerIcon(
                visit.status, 
                visit.verified,
                activeVisit?._id === visit._id
              )}
              onClick={() => setSelectedLocation(visit)}
              zIndex={activeVisit?._id === visit._id ? 100 : 1}
            />
          ))}

          {/* Selected Location Info */}
          {selectedLocation && (
            <InfoWindow
              position={selectedLocation.coordinates}
              onCloseClick={() => setSelectedLocation(null)}
            >
              <Box sx={{ p: 1, maxWidth: 250 }}>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  {selectedLocation.locationName}
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 1 }}>
                  {selectedLocation.address}
                </Typography>
                
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                  <Chip
                    size="small"
                    label={selectedLocation.status}
                    sx={{
                      bgcolor: alpha(getStatusColor(selectedLocation.status), 0.1),
                      color: getStatusColor(selectedLocation.status),
                      fontWeight: 600,
                      fontSize: '0.7rem'
                    }}
                  />
                  {selectedLocation.verified && (
                    <Chip
                      size="small"
                      icon={<Verified sx={{ fontSize: 12 }} />}
                      label="Verified"
                      sx={{
                        bgcolor: alpha(SUCCESS, 0.1),
                        color: SUCCESS,
                        fontWeight: 600,
                        fontSize: '0.7rem'
                      }}
                    />
                  )}
                </Stack>

                <Box display="flex" alignItems="center" gap={2}>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <AccessTime sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="caption">
                      {format(new Date(selectedLocation.createdAt), 'hh:mm a')}
                    </Typography>
                  </Box>
                  {selectedLocation.photos?.length > 0 && (
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <PhotoLibrary sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography variant="caption">
                        {selectedLocation.photos.length} photos
                      </Typography>
                    </Box>
                  )}
                </Box>

                {selectedLocation.distanceFromPreviousKm > 0 && (
                  <Box display="flex" alignItems="center" gap={0.5} sx={{ mt: 1 }}>
                    <DirectionsCar sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="caption">
                      {selectedLocation.distanceFromPreviousKm.toFixed(1)} km from previous
                    </Typography>
                  </Box>
                )}
              </Box>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>

      {/* Map Controls */}
      <Paper
        sx={{
          position: 'absolute',
          right: 16,
          top: '50%',
          transform: 'translateY(-50%)',
          p: 0.5,
          borderRadius: 3,
          bgcolor: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          zIndex: 10
        }}
      >
        <Stack spacing={0.5}>
          <Tooltip title="Zoom In" placement="left">
            <IconButton onClick={handleZoomIn} size="small">
              <ZoomIn />
            </IconButton>
          </Tooltip>
          <Divider />
          <Tooltip title="Zoom Out" placement="left">
            <IconButton onClick={handleZoomOut} size="small">
              <ZoomOut />
            </IconButton>
          </Tooltip>
          <Divider />
          <Tooltip title={isLiveTracking ? "Stop Tracking" : "Start Live Tracking"} placement="left">
            <IconButton 
              onClick={isLiveTracking ? stopLiveTracking : startLiveTracking}
              size="small"
              sx={{ color: isLiveTracking ? SUCCESS : PRIMARY }}
            >
              <GpsFixed />
            </IconButton>
          </Tooltip>
          <Divider />
          <Tooltip title="My Location" placement="left">
            <IconButton onClick={handleMyLocation} size="small" sx={{ color: PRIMARY }}>
              <MyLocation />
            </IconButton>
          </Tooltip>
          <Divider />
          <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"} placement="left">
            <IconButton onClick={handleFullscreen} size="small">
              {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>

      {/* Map Type Toggle */}
      <Paper
        sx={{
          position: 'absolute',
          top: 80,
          right: 16,
          p: 0.5,
          borderRadius: 3,
          bgcolor: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          zIndex: 10,
          display: 'flex',
          gap: 0.5
        }}
      >
        <Tooltip title="Road Map">
          <IconButton
            size="small"
            onClick={() => setMapType('roadmap')}
            sx={{
              bgcolor: mapType === 'roadmap' ? alpha(PRIMARY, 0.1) : 'transparent',
              color: mapType === 'roadmap' ? PRIMARY : 'text.secondary'
            }}
          >
            <Map />
          </IconButton>
        </Tooltip>
        <Tooltip title="Satellite">
          <IconButton
            size="small"
            onClick={() => setMapType('satellite')}
            sx={{
              bgcolor: mapType === 'satellite' ? alpha(PRIMARY, 0.1) : 'transparent',
              color: mapType === 'satellite' ? PRIMARY : 'text.secondary'
            }}
          >
            <Satellite />
          </IconButton>
        </Tooltip>
        <Tooltip title="Terrain">
          <IconButton
            size="small"
            onClick={() => setMapType('terrain')}
            sx={{
              bgcolor: mapType === 'terrain' ? alpha(PRIMARY, 0.1) : 'transparent',
              color: mapType === 'terrain' ? PRIMARY : 'text.secondary'
            }}
          >
            <Terrain />
          </IconButton>
        </Tooltip>
      </Paper>

      {/* Live Indicator */}
      <Fade in={isLiveTracking}>
        <Paper
          sx={{
            position: 'absolute',
            top: 80,
            left: 16,
            p: 1.5,
            borderRadius: 3,
            bgcolor: 'rgba(0,0,0,0.8)',
            color: 'white',
            backdropFilter: 'blur(8px)',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LiveIndicator isLive={true} />
            <Typography variant="caption" fontWeight={600}>
              LIVE TRACKING
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
          <Box>
            <Typography variant="caption" display="block">
              Speed: {(currentSpeed * 3.6).toFixed(1)} km/h
            </Typography>
            <Typography variant="caption" display="block" sx={{ opacity: 0.7 }}>
              Points: {locationHistory.length}
            </Typography>
          </Box>
          <IconButton size="small" onClick={stopLiveTracking} sx={{ color: ERROR }}>
            <Stop />
          </IconButton>
        </Paper>
      </Fade>

      {/* Main Header */}
      <GlassPaper
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          right: isMobile ? 16 : 'auto',
          width: isMobile ? 'auto' : 400,
          zIndex: 10,
          borderRadius: 3,
          p: 2
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton onClick={() => window.history.back()} size="small">
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant="h6" fontWeight={800} sx={{ color: PRIMARY }}>
                Route History
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </Typography>
            </Box>
          </Box>

          <Box display="flex" gap={1}>
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={handleRefresh}>
                <Refresh />
              </IconButton>
            </Tooltip>
            <Tooltip title="Filter">
              <IconButton size="small" onClick={(e) => setFilterAnchor(e.currentTarget)}>
                <FilterList />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export">
              <IconButton size="small" onClick={handleExport}>
                <Download />
              </IconButton>
            </Tooltip>
            <Tooltip title="Share">
              <IconButton size="small" onClick={handleShare}>
                <Share />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Date Navigation */}
        <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mt: 2 }}>
          <IconButton 
            size="small" 
            onClick={() => setSelectedDate(prev => subDays(prev, 1))}
          >
            <ChevronLeft />
          </IconButton>
          
          <Chip
            label={isToday(selectedDate) ? 'Today' : format(selectedDate, 'MMM d')}
            onClick={() => setSelectedDate(new Date())}
            sx={{ 
              bgcolor: alpha(PRIMARY, 0.1),
              color: PRIMARY,
              fontWeight: 600,
              px: 2
            }}
          />
          
          <IconButton 
            size="small" 
            onClick={() => setSelectedDate(prev => new Date(prev.setDate(prev.getDate() + 1)))}
            disabled={isToday(selectedDate)}
          >
            <ChevronRight />
          </IconButton>
        </Box>
      </GlassPaper>

      {/* Stats Panel */}
      <Collapse in={showStats}>
        <Paper
          sx={{
            position: 'absolute',
            top: 140,
            left: 16,
            width: isMobile ? 'calc(100% - 32px)' : 400,
            zIndex: 10,
            borderRadius: 3,
            p: 2,
            bgcolor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(8px)'
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: PRIMARY }}>
              Daily Summary
            </Typography>
            <IconButton size="small" onClick={() => setShowStats(false)}>
              <KeyboardArrowUp />
            </IconButton>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Paper sx={{ p: 1.5, bgcolor: alpha(PRIMARY, 0.05), borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Distance
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {totalDistance.toFixed(1)} km
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 1.5, bgcolor: alpha(SUCCESS, 0.05), borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Duration
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {Math.floor(totalTime / 60)}h {totalTime % 60}m
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 1.5, bgcolor: alpha(WARNING, 0.05), borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Visits
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {visits.length}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mt: 2 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: SUCCESS }} />
                <Typography variant="caption">Completed</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: WARNING }} />
                <Typography variant="caption">In Progress</Typography>
              </Box>
            </Box>
            <Button size="small" onClick={() => setShowStats(false)}>
              Hide
            </Button>
          </Box>
        </Paper>
      </Collapse>

      {/* Timeline Sidebar */}
      <Paper
        sx={{
          position: 'absolute',
          right: 16,
          top: 80,
          bottom: 100,
          width: isMobile ? 'calc(100% - 32px)' : 380,
          borderRadius: 3,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 8,
          bgcolor: 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(10px)',
          zIndex: 10
        }}
      >
        <Box sx={{ 
          p: 2, 
          bgcolor: PRIMARY,
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h6" fontWeight={700}>
            Visit Timeline
          </Typography>
          <Chip 
            label={`${filteredVisits.length} visits`}
            size="small"
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              color: 'white',
              fontWeight: 600
            }}
          />
        </Box>

        {/* Animation Controls */}
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography variant="caption" fontWeight={600}>Route Animation</Typography>
            <Box display="flex" gap={0.5}>
              <IconButton 
                size="small" 
                onClick={() => setPlaySpeed(0.5)}
                sx={{ bgcolor: playSpeed === 0.5 ? alpha(PRIMARY, 0.1) : 'transparent' }}
              >
                0.5x
              </IconButton>
              <IconButton 
                size="small" 
                onClick={() => setPlaySpeed(1)}
                sx={{ bgcolor: playSpeed === 1 ? alpha(PRIMARY, 0.1) : 'transparent' }}
              >
                1x
              </IconButton>
              <IconButton 
                size="small" 
                onClick={() => setPlaySpeed(2)}
                sx={{ bgcolor: playSpeed === 2 ? alpha(PRIMARY, 0.1) : 'transparent' }}
              >
                2x
              </IconButton>
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <IconButton 
              size="small"
              onClick={() => setIsPlaying(!isPlaying)}
              sx={{ color: PRIMARY }}
            >
              {isPlaying ? <Pause /> : <PlayArrow />}
            </IconButton>
            <IconButton size="small" onClick={() => setTimeSlider(0)}>
              <Replay />
            </IconButton>
            <Slider
              size="small"
              value={timeSlider}
              onChange={(e, val) => setTimeSlider(val)}
              sx={{ flex: 1 }}
            />
          </Box>
        </Box>

        {/* Timeline List */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {loading ? (
            <Stack spacing={2}>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
              ))}
            </Stack>
          ) : filteredVisits.length > 0 ? (
            <Stack spacing={2}>
              {filteredVisits.map((visit, index) => (
                <Paper
                  key={visit._id}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: activeVisit?._id === visit._id ? PRIMARY : 'divider',
                    bgcolor: activeVisit?._id === visit._id ? alpha(PRIMARY, 0.02) : 'background.paper',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: PRIMARY,
                      transform: 'translateX(4px)',
                      boxShadow: `0 4px 12px ${alpha(PRIMARY, 0.15)}`
                    }
                  }}
                  onClick={() => {
                    setActiveVisit(visit);
                    if (map && visit.coordinates) {
                      map.panTo(visit.coordinates);
                      map.setZoom(16);
                    }
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar sx={{ 
                        width: 24, 
                        height: 24, 
                        bgcolor: alpha(getStatusColor(visit.status), 0.1),
                        color: getStatusColor(visit.status),
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        {index + 1}
                      </Avatar>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {visit.locationName}
                      </Typography>
                    </Box>
                    <Chip
                      label={format(new Date(visit.createdAt), 'hh:mm a')}
                      size="small"
                      sx={{ 
                        bgcolor: alpha(PRIMARY, 0.1),
                        color: PRIMARY,
                        fontWeight: 600,
                        fontSize: '0.65rem',
                        height: 20
                      }}
                    />
                  </Box>

                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                    {visit.address}
                  </Typography>

                  <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                    {visit.timeSpentMinutes > 0 && (
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <AccessTime sx={{ fontSize: 14, color: 'text.disabled' }} />
                        <Typography variant="caption" color="text.secondary">
                          {Math.floor(visit.timeSpentMinutes / 60)}h {visit.timeSpentMinutes % 60}m
                        </Typography>
                      </Box>
                    )}
                    
                    {visit.distanceFromPreviousKm > 0 && (
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <DirectionsCar sx={{ fontSize: 14, color: 'text.disabled' }} />
                        <Typography variant="caption" color="text.secondary">
                          {visit.distanceFromPreviousKm.toFixed(1)} km
                        </Typography>
                      </Box>
                    )}

                    {visit.photos?.length > 0 && (
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <PhotoLibrary sx={{ fontSize: 14, color: 'text.disabled' }} />
                        <Typography variant="caption" color="text.secondary">
                          {visit.photos.length} photos
                        </Typography>
                      </Box>
                    )}

                    {visit.verified && (
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Verified sx={{ fontSize: 14, color: SUCCESS }} />
                        <Typography variant="caption" color={SUCCESS} fontWeight={600}>
                          Verified
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
              ))}
            </Stack>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <TimelineIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography color="text.secondary">No visits found for this date</Typography>
            </Box>
          )}
        </Box>

        {/* Export Button */}
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<Assessment />}
            onClick={handleExport}
            sx={{
              bgcolor: PRIMARY,
              '&:hover': { bgcolor: alpha(PRIMARY, 0.8) },
              py: 1.5,
              borderRadius: 2
            }}
          >
            Export Route Report
          </Button>
        </Box>
      </Paper>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchor}
        open={Boolean(filterAnchor)}
        onClose={() => setFilterAnchor(null)}
        PaperProps={{
          sx: { width: 280, p: 2, borderRadius: 2 }
        }}
      >
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
          Filter Visits
        </Typography>

        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={filters.showCompleted}
              onChange={(e) => setFilters({ ...filters, showCompleted: e.target.checked })}
            />
          }
          label="Show Completed"
        />
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={filters.showInProgress}
              onChange={(e) => setFilters({ ...filters, showInProgress: e.target.checked })}
            />
          }
          label="Show In Progress"
        />
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={filters.showCancelled}
              onChange={(e) => setFilters({ ...filters, showCancelled: e.target.checked })}
            />
          }
          label="Show Cancelled"
        />

        <Divider sx={{ my: 2 }} />

        <Typography variant="caption" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
          Duration Range (minutes)
        </Typography>
        <Slider
          value={[filters.minDuration, filters.maxDuration]}
          onChange={(e, val) => setFilters({ ...filters, minDuration: val[0], maxDuration: val[1] })}
          valueLabelDisplay="auto"
          min={0}
          max={240}
          sx={{ mt: 1 }}
        />

        <Box display="flex" justifyContent="space-between" sx={{ mt: 2 }}>
          <Button size="small" onClick={() => setFilterAnchor(null)}>Cancel</Button>
          <Button 
            size="small" 
            variant="contained"
            onClick={() => setFilterAnchor(null)}
            sx={{ bgcolor: PRIMARY }}
          >
            Apply
          </Button>
        </Box>
      </Menu>

      {/* Mobile FAB */}
      {isMobile && (
        <Fab
          color="primary"
          sx={{
            position: 'absolute',
            bottom: 120,
            right: 16,
            zIndex: 10,
            bgcolor: PRIMARY,
            '&:hover': { bgcolor: alpha(PRIMARY, 0.8) }
          }}
          onClick={() => setShowStats(!showStats)}
        >
          {showStats ? <KeyboardArrowDown /> : <KeyboardArrowUp />}
        </Fab>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ borderRadius: 2, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes pulse {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.2);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </Box>
  );
}