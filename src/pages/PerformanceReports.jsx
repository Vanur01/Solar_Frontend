// components/TeamPerformanceDashboard.jsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Avatar,
  Chip,
  Stack,
  Divider,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
  Badge,
  LinearProgress,
  alpha,
  useTheme,
  useMediaQuery,
  Alert,
  Snackbar,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  BottomNavigation,
  BottomNavigationAction,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Fab,
  Zoom,
  Backdrop,
  CircularProgress,
  Tab,
  Tabs,
  FormControlLabel,
  Pagination,
  CardActionArea,
  Switch,
  Checkbox,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Search,
  FilterList,
  Download,
  Refresh,
  Visibility,
  Group,
  TrendingUp,
  AccessTime,
  CheckCircle,
  Cancel,
  PlayArrow,
  Route,
  BarChart,
  PieChart,
  ShowChart,
  Map,
  GridView,
  ListAlt,
  ArrowUpward,
  ArrowDownward,
  Close,
  Share,
  Wifi,
  WifiOff,
  MyLocation,
  Menu as MenuIcon,
  Dashboard,
  History,
  People,
  FilterAlt,
  SwapVert,
  Clear,
  ArrowBack,
  CheckCircleOutline,
  Schedule,
  DoneAll,
  TrendingDown,
  Speed,
  PinDrop,
  CalendarToday,
  MoreVert,
  Info,
  VerifiedUser,
  Assignment,
  AssignmentTurnedIn,
  AssignmentLate,
  Timer,
  TimerOff,
  Verified,
  TaskAlt,
  LocationOn,
  Phone,
  Email,
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import { format, subDays, parseISO, isValid } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

// ========== CONSTANTS ==========
const PRIMARY = '#4569ea';
const SUCCESS = '#4caf50';
const WARNING = '#ff9800';
const ERROR = '#f44336';
const INFO = '#2196f3';
const SECONDARY = '#1a237e';

// ========== STYLED COMPONENTS ==========
const GlassPaper = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 500,
  padding: theme.spacing(1.5, 2),
  '&.MuiTableCell-head': {
    backgroundColor: alpha(PRIMARY, 0.05),
    fontWeight: 600,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(PRIMARY, 0.02),
  },
  '&.Mui-selected': {
    backgroundColor: alpha(PRIMARY, 0.08),
    '&:hover': {
      backgroundColor: alpha(PRIMARY, 0.12),
    },
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
  const colors = {
    'ON DUTY': { bg: alpha(SUCCESS, 0.1), color: SUCCESS },
    'HALF DAY': { bg: alpha(WARNING, 0.1), color: WARNING },
    'OFF DUTY': { bg: alpha('#9e9e9e', 0.1), color: '#9e9e9e' },
    'INACTIVE': { bg: alpha(ERROR, 0.1), color: ERROR },
    'BREAK': { bg: alpha(INFO, 0.1), color: INFO },
    'COMPLETED': { bg: alpha(INFO, 0.1), color: INFO },
    'IN PROGRESS': { bg: alpha(WARNING, 0.1), color: WARNING },
    'PENDING': { bg: alpha(ERROR, 0.1), color: ERROR },
    'VERIFIED': { bg: alpha(SUCCESS, 0.1), color: SUCCESS },
  };
  const style = colors[status] || colors['OFF DUTY'];
  return {
    backgroundColor: style.bg,
    color: style.color,
    fontWeight: 600,
    fontSize: '0.75rem',
    height: 28,
  };
});

const VisitStatusChip = styled(Chip)(({ theme, status }) => {
  const colors = {
    'Completed': { bg: alpha(SUCCESS, 0.1), color: SUCCESS },
    'InProgress': { bg: alpha(WARNING, 0.1), color: WARNING },
    'Cancelled': { bg: alpha(ERROR, 0.1), color: ERROR },
    'Scheduled': { bg: alpha(INFO, 0.1), color: INFO },
    'Verified': { bg: alpha(SUCCESS, 0.15), color: SUCCESS },
    'Pending': { bg: alpha(WARNING, 0.1), color: WARNING },
  };
  const style = colors[status] || colors['Scheduled'];
  return {
    backgroundColor: style.bg,
    color: style.color,
    fontWeight: 600,
    fontSize: '0.7rem',
    height: 24,
  };
});

const OnlineIndicator = styled(Box)(({ theme, isOnline }) => ({
  width: 10,
  height: 10,
  borderRadius: '50%',
  backgroundColor: isOnline ? SUCCESS : '#9e9e9e',
  border: `2px solid ${theme.palette.background.paper}`,
  position: 'absolute',
  bottom: 0,
  right: 0,
}));

// ========== VISIT DETAILS DIALOG ==========
const VisitDetailsDialog = ({ open, visit, onClose, onComplete }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!visit) return null;

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = parseISO(dateString);
      return isValid(date) ? format(date, 'MMM dd, yyyy HH:mm') : 'Invalid date';
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{ sx: { borderRadius: isMobile ? 0 : 3 } }}
    >
      <DialogTitle sx={{ 
        background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)`,
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h6" fontWeight={700}>Visit Details</Typography>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: isMobile ? 2 : 3, mt: 2 }}>
        <Stack spacing={3}>
          {/* Location Info */}
          <Paper sx={{ p: 2, bgcolor: alpha(PRIMARY, 0.02), borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} color={PRIMARY} gutterBottom>
              <LocationOn sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'middle' }} />
              Location Details
            </Typography>
            <Typography variant="body1" fontWeight={600} gutterBottom>
              {visit.locationName || 'Unknown Location'}
            </Typography>
            {visit.address && (
              <Typography variant="body2" color="text.secondary">
                {visit.address}
              </Typography>
            )}
          </Paper>

          {/* Status and Times */}
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Paper sx={{ p: 2, bgcolor: alpha(INFO, 0.02), borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary">Status</Typography>
                <Box mt={0.5}>
                  <VisitStatusChip label={visit.status || 'Unknown'} status={visit.status || 'Unknown'} />
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper sx={{ p: 2, bgcolor: alpha(SUCCESS, 0.02), borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary">Visit Type</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {visit.visitType || 'Regular'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Timings */}
          <Paper sx={{ p: 2, bgcolor: alpha(WARNING, 0.02), borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              <AccessTime sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'middle' }} />
              Timings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Check In</Typography>
                <Typography variant="body2" fontWeight={500}>
                  {formatDateTime(visit.checkInTime)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Check Out</Typography>
                <Typography variant="body2" fontWeight={500}>
                  {formatDateTime(visit.checkOutTime)}
                </Typography>
              </Grid>
              {visit.duration && (
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Duration</Typography>
                  <Typography variant="body2" fontWeight={600} color={PRIMARY}>
                    {visit.duration} minutes
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>

          {/* Coordinates */}
          {visit.latitude && visit.longitude && (
            <Paper sx={{ p: 2, bgcolor: alpha(INFO, 0.02), borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                <MyLocation sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'middle' }} />
                Coordinates
              </Typography>
              <Typography variant="body2">
                Lat: {visit.latitude.toFixed(6)}, Lng: {visit.longitude.toFixed(6)}
              </Typography>
            </Paper>
          )}

          {/* Remarks */}
          {visit.remarks && (
            <Paper sx={{ p: 2, bgcolor: alpha(INFO, 0.02), borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>Remarks</Typography>
              <Typography variant="body2" color="text.secondary">
                {visit.remarks}
              </Typography>
            </Paper>
          )}

          {/* Photos */}
          {visit.photos && visit.photos.length > 0 && (
            <Paper sx={{ p: 2, bgcolor: alpha(SUCCESS, 0.02), borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>Photos</Typography>
              <Grid container spacing={1}>
                {visit.photos.map((photo, index) => (
                  <Grid item xs={4} key={index}>
                    <Box
                      component="img"
                      src={photo.url || photo}
                      alt={`Visit photo ${index + 1}`}
                      sx={{
                        width: '100%',
                        height: 80,
                        objectFit: 'cover',
                        borderRadius: 1,
                        cursor: 'pointer'
                      }}
                      onClick={() => window.open(photo.url || photo, '_blank')}
                    />
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: isMobile ? 2 : 3, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={onClose} variant="outlined" fullWidth={isMobile}>
          Close
        </Button>
        {visit.status && !['Completed', 'Cancelled', 'Verified'].includes(visit.status) && (
          <Button
            onClick={() => onComplete(visit)}
            variant="contained"
            startIcon={<TaskAlt />}
            sx={{ bgcolor: SUCCESS, '&:hover': { bgcolor: '#388e3c' } }}
            fullWidth={isMobile}
          >
            Mark Complete
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

// ========== COMPLETE VISIT CONFIRMATION DIALOG ==========
const CompleteVisitDialog = ({ open, visit, onClose, onConfirm, loading }) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="xs"
    fullWidth
    PaperProps={{ sx: { borderRadius: 3 } }}
  >
    <DialogTitle sx={{ pb: 1 }}>
      <Stack direction="row" alignItems="center" gap={1}>
        <TaskAlt sx={{ color: SUCCESS }} />
        <Typography variant="h6" fontWeight={700}>Complete Visit</Typography>
      </Stack>
    </DialogTitle>
    <DialogContent>
      <Typography variant="body2" color="text.secondary" paragraph>
        Are you sure you want to mark this visit as <strong>Completed</strong>?
      </Typography>
      {visit && (
        <Paper sx={{ p: 2, bgcolor: alpha(SUCCESS, 0.05), borderRadius: 2 }}>
          <Typography variant="subtitle2" fontWeight={700}>{visit.locationName || 'Unknown Location'}</Typography>
          <Typography variant="caption" color="text.secondary">
            {visit.checkInTime ? format(parseISO(visit.checkInTime), 'HH:mm') : 'N/A'}
          </Typography>
        </Paper>
      )}
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
      <Button fullWidth variant="outlined" onClick={onClose} disabled={loading}>
        Cancel
      </Button>
      <Button
        fullWidth
        variant="contained"
        onClick={() => onConfirm(visit?.id)}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <TaskAlt />}
        sx={{ bgcolor: SUCCESS, '&:hover': { bgcolor: '#388e3c' } }}
      >
        {loading ? 'Completing...' : 'Complete'}
      </Button>
    </DialogActions>
  </Dialog>
);

// ========== MOBILE MEMBER CARD ==========
const MobileMemberCard = ({ member, onSelect, onViewMap, onViewDetails, isSelected }) => (
  <Card
    sx={{
      mb: 1.5,
      borderRadius: 3,
      border: isSelected ? `2px solid ${PRIMARY}` : '1px solid transparent',
      boxShadow: isSelected ? 4 : 1,
    }}
  >
    <CardActionArea onClick={() => onSelect(member)}>
      <CardContent sx={{ p: 2 }}>
        <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={<OnlineIndicator isOnline={member.isOnline} />}
          >
            <Avatar sx={{ bgcolor: member.isOnline ? SUCCESS : '#9e9e9e', width: 48, height: 48 }}>
              {member.firstName?.[0] || ''}{member.lastName?.[0] || ''}
            </Avatar>
          </Badge>
          <Box flex={1} minWidth={0}>
            <Typography variant="subtitle1" fontWeight={700} noWrap>
              {member.name || 'Unknown'}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" noWrap>
              {member.employeeId || member.email?.split('@')[0] || 'No ID'}
            </Typography>
          </Box>
          <StatusChip label={member.dutyStatus || 'OFF'} status={member.dutyStatus || 'OFF DUTY'} size="small" />
        </Box>

        <Grid container spacing={1} sx={{ mb: 1.5 }}>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Route sx={{ fontSize: 16, color: PRIMARY }} />
              <Typography variant="caption" display="block" color="text.secondary">Distance</Typography>
              <Typography variant="body2" fontWeight={600}>{member.distance?.toFixed(1) || 0} km</Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center' }}>
              <DoneAll sx={{ fontSize: 16, color: SUCCESS }} />
              <Typography variant="caption" display="block" color="text.secondary">Done</Typography>
              <Typography variant="body2" fontWeight={600}>{member.visits?.completed || 0}</Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Schedule sx={{ fontSize: 16, color: WARNING }} />
              <Typography variant="caption" display="block" color="text.secondary">Pending</Typography>
              <Typography variant="body2" fontWeight={600}>{member.visits?.pending || 0}</Typography>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mb: 1.5 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
            <Typography variant="caption" color="text.secondary">Completion Rate</Typography>
            <Typography variant="caption" fontWeight={600}>{member.visits?.completionRate || 0}%</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={parseFloat(member.visits?.completionRate) || 0}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: alpha(SUCCESS, 0.1),
              '& .MuiLinearProgress-bar': {
                backgroundColor: parseFloat(member.visits?.completionRate) >= 80 ? SUCCESS :
                                parseFloat(member.visits?.completionRate) >= 50 ? WARNING : ERROR,
                borderRadius: 3
              }
            }}
          />
        </Box>

        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={0.5} sx={{ maxWidth: '60%' }}>
            <PinDrop sx={{ fontSize: 14, color: member.isOnline ? SUCCESS : 'text.disabled' }} />
            <Typography variant="caption" color="text.secondary" noWrap>
              {member.lastKnownLocation?.address?.split(',')[0] || 'Location unavailable'}
            </Typography>
          </Box>
          <Box display="flex" gap={0.5}>
            <Tooltip title="View on Map">
              <IconButton 
                size="small" 
                onClick={(e) => { e.stopPropagation(); onViewMap(member); }}
                sx={{ bgcolor: alpha(PRIMARY, 0.05) }}
              >
                <Map fontSize="small" sx={{ color: PRIMARY }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="View Details">
              <IconButton 
                size="small"
                onClick={(e) => { e.stopPropagation(); onViewDetails(member); }}
                sx={{ bgcolor: alpha(INFO, 0.05) }}
              >
                <Visibility fontSize="small" sx={{ color: INFO }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </CardContent>
    </CardActionArea>
  </Card>
);

// ========== MAIN COMPONENT ==========
export default function TeamPerformanceDashboard() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // Use AuthContext
  const { 
    fetchAPI, 
    user, 
    onlineUsers, 
    socket,
    completeVisit: completeVisitAPI,
    getVisitById 
  } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [teamData, setTeamData] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberDetails, setMemberDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [chartType, setChartType] = useState('bar');
  const [timeRange, setTimeRange] = useState('week');
  const [sortBy, setSortBy] = useState('distance');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ 
    status: 'all', 
    dutyStatus: 'all', 
    online: 'all', 
    completionStatus: 'all' 
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [customDateRange] = useState({ start: subDays(new Date(), 7), end: new Date() });
  const [selectedRows, setSelectedRows] = useState([]);
  const [compactView, setCompactView] = useState(false);
  const [hoveredMember, setHoveredMember] = useState(null);
  const [detailsTabValue, setDetailsTabValue] = useState(0);

  // Visit states
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [visitDetailsOpen, setVisitDetailsOpen] = useState(false);
  const [completeVisitDialog, setCompleteVisitDialog] = useState({ open: false, visit: null });
  const [completeLoading, setCompleteLoading] = useState(false);

  // Auto-refresh ref
  const autoRefreshRef = useRef(null);

  // Socket event listeners
  useEffect(() => {
    if (socket) {
      socket.on('team:location', (data) => {
        setTeamData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            teamMembers: prev.teamMembers.map(member =>
              member.id === data.userId
                ? { 
                    ...member, 
                    lastKnownLocation: { 
                      ...member.lastKnownLocation, 
                      ...data.location, 
                      time: 'Just now' 
                    } 
                  }
                : member
            )
          };
        });
      });

      socket.on('visit:completed', (data) => {
        setTeamData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            teamMembers: prev.teamMembers.map(member => {
              if (member.id === data.userId) {
                const visits = { ...member.visits };
                visits.completed = (visits.completed || 0) + 1;
                visits.total = (visits.total || 0) + 1;
                visits.completionRate = visits.total ? 
                  ((visits.completed / visits.total) * 100).toFixed(1) : 0;
                return { 
                  ...member, 
                  visits, 
                  lastVisit: { 
                    locationName: data.visit.locationName, 
                    status: 'Completed', 
                    time: format(new Date(data.visit.checkOutTime), 'HH:mm') 
                  } 
                };
              }
              return member;
            })
          };
        });
        showSnackbar(`${data.userName} completed a visit`, 'success');
      });

      return () => {
        socket.off('team:location');
        socket.off('visit:completed');
      };
    }
  }, [socket]);

  // Fetch team performance data
  const fetchTeamPerformance = useCallback(async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) setRefreshing(true);
      else setLoading(true);

      const now = new Date();
      let startDate, endDate;
      
      switch (timeRange) {
        case 'day':
          startDate = format(now, 'yyyy-MM-dd');
          endDate = format(now, 'yyyy-MM-dd');
          break;
        case 'week':
          startDate = format(subDays(now, 7), 'yyyy-MM-dd');
          endDate = format(now, 'yyyy-MM-dd');
          break;
        case 'month':
          startDate = format(subDays(now, 30), 'yyyy-MM-dd');
          endDate = format(now, 'yyyy-MM-dd');
          break;
        case 'custom':
          startDate = format(customDateRange.start, 'yyyy-MM-dd');
          endDate = format(customDateRange.end, 'yyyy-MM-dd');
          break;
        default:
          startDate = format(subDays(now, 7), 'yyyy-MM-dd');
          endDate = format(now, 'yyyy-MM-dd');
      }

      const response = await fetchAPI(
        `/visit/performance/team?page=1&limit=100&sortBy=${sortBy}&sortOrder=${sortOrder}&startDate=${startDate}&endDate=${endDate}`
      );

      if (response?.success && response?.result) {
        const membersWithOnlineStatus = (response.result.teamMembers || []).map(member => ({
          ...member,
          id: member._id || member.id,
          isOnline: onlineUsers.some(u => u.userId === (member._id || member.id)),
          firstName: member.firstName || member.name?.split(' ')[0] || '',
          lastName: member.lastName || member.name?.split(' ').slice(1).join(' ') || '',
          visits: {
            completed: member.visits?.completed || 0,
            pending: (member.visits?.total || 0) - (member.visits?.completed || 0),
            total: member.visits?.total || 0,
            inProgress: member.visits?.inProgress || 0,
            cancelled: member.visits?.cancelled || 0,
            completionRate: member.visits?.total ? 
              ((member.visits.completed / member.visits.total) * 100).toFixed(1) : 0,
          },
          performance: { 
            efficiency: member.performance?.efficiency || 0, 
            avgTimePerVisit: member.performance?.avgTimePerVisit || 0, 
            onTimeRate: member.performance?.onTimeRate || 0 
          }
        }));

        setTeamData({
          ...response.result,
          teamMembers: membersWithOnlineStatus,
          summary: {
            ...response.result.summary,
            totalCompletedVisits: response.result.summary?.totalCompletedVisits || 
              membersWithOnlineStatus.reduce((acc, m) => acc + (m.visits?.completed || 0), 0),
            totalPendingVisits: response.result.summary?.totalPendingVisits || 
              membersWithOnlineStatus.reduce((acc, m) => acc + (m.visits?.pending || 0), 0),
            averageCompletionRate: response.result.summary?.averageCompletionRate || 
              (membersWithOnlineStatus.reduce((acc, m) => acc + (parseFloat(m.visits?.completionRate) || 0), 0) / 
              (membersWithOnlineStatus.length || 1)).toFixed(1),
          }
        });
      } else {
        showSnackbar('Failed to fetch team performance', 'error');
      }
    } catch (error) {
      console.error('Error fetching team performance:', error);
      showSnackbar(error.message || 'Error loading data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchAPI, timeRange, sortBy, sortOrder, onlineUsers, customDateRange]);

  // Initial fetch
  useEffect(() => {
    fetchTeamPerformance();
  }, [fetchTeamPerformance]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    autoRefreshRef.current = setInterval(() => {
      fetchTeamPerformance(true);
    }, 30000);
    
    return () => {
      if (autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current);
      }
    };
  }, [fetchTeamPerformance]);

  // Update rows per page on mobile
  useEffect(() => {
    setRowsPerPage(isMobile ? 5 : 10);
    setPage(0);
  }, [isMobile]);

  // Fetch member details
  const fetchMemberDetails = useCallback(async (memberId) => {
    if (!memberId) return;
    
    try {
      setDetailsLoading(true);
      const response = await fetchAPI(`/visit/performance/team-member/${memberId}`);
      
      if (response?.success && response?.result) {
        setMemberDetails(response.result);
      } else {
        showSnackbar('Failed to load member details', 'error');
      }
    } catch (error) {
      console.error('Error fetching member details:', error);
      showSnackbar(error.message || 'Failed to load member details', 'error');
    } finally {
      setDetailsLoading(false);
    }
  }, [fetchAPI]);

  // Handle member selection
  const handleMemberSelect = (member) => {
    setSelectedMember(member);
    setDetailsTabValue(0);
    fetchMemberDetails(member.id);
  };

  // Handle view member details
  const handleViewMemberDetails = (member) => {
    handleMemberSelect(member);
  };

  // Handle close details
  const handleCloseDetails = () => {
    setSelectedMember(null);
    setMemberDetails(null);
    setDetailsTabValue(0);
  };

  // Show snackbar
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Handle view visit details
  const handleViewVisitDetails = async (visit) => {
    try {
      if (visit.id) {
        const response = await getVisitById(visit.id);
        if (response.success && response.result) {
          setSelectedVisit(response.result);
        } else {
          setSelectedVisit(visit); // Fallback to provided visit data
        }
      } else {
        setSelectedVisit(visit);
      }
      setVisitDetailsOpen(true);
    } catch (error) {
      console.error('Error fetching visit details:', error);
      setSelectedVisit(visit);
      setVisitDetailsOpen(true);
    }
  };

  // Handle complete visit click
  const handleCompleteVisitClick = (visit) => {
    setCompleteVisitDialog({ open: true, visit });
  };

  // Handle complete visit confirm
  const handleCompleteVisitConfirm = async (visitId) => {
    if (!visitId) return;
    
    try {
      setCompleteLoading(true);
      const result = await completeVisitAPI(visitId);
      
      if (result.success) {
        showSnackbar('Visit marked as completed successfully!', 'success');
        setCompleteVisitDialog({ open: false, visit: null });
        setVisitDetailsOpen(false);

        // Update memberDetails if open
        if (memberDetails) {
          setMemberDetails(prev => ({
            ...prev,
            recentVisits: prev.recentVisits?.map(v =>
              v.id === visitId ? { ...v, status: 'Completed' } : v
            ),
            visits: {
              ...prev.visits,
              completed: (prev.visits?.completed || 0) + 1,
              inProgress: Math.max((prev.visits?.inProgress || 0) - 1, 0),
            }
          }));
        }

        // Refresh team data
        fetchTeamPerformance(true);
      } else {
        showSnackbar(result.error || 'Failed to complete visit', 'error');
      }
    } catch (error) {
      console.error('Complete visit error:', error);
      showSnackbar(error.message || 'Error completing visit', 'error');
    } finally {
      setCompleteLoading(false);
    }
  };

  // Filter and sort members
  const filteredMembers = useMemo(() => {
    if (!teamData?.teamMembers) return [];
    
    let filtered = [...teamData.teamMembers];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(m =>
        (m.name?.toLowerCase() || '').includes(term) ||
        (m.email?.toLowerCase() || '').includes(term) ||
        (m.phoneNumber || '').includes(term) ||
        (m.employeeId?.toLowerCase() || '').includes(term) ||
        (m.firstName?.toLowerCase() || '').includes(term) ||
        (m.lastName?.toLowerCase() || '').includes(term)
      );
    }

    // Status filters
    if (filters.status !== 'all') {
      filtered = filtered.filter(m => m.accountStatus === filters.status);
    }
    
    if (filters.dutyStatus !== 'all') {
      filtered = filtered.filter(m => m.dutyStatus === filters.dutyStatus);
    }
    
    if (filters.online !== 'all') {
      filtered = filtered.filter(m => m.isOnline === (filters.online === 'online'));
    }
    
    if (filters.completionStatus !== 'all') {
      switch (filters.completionStatus) {
        case 'high':
          filtered = filtered.filter(m => parseFloat(m.visits?.completionRate || 0) >= 80);
          break;
        case 'medium':
          filtered = filtered.filter(m => {
            const r = parseFloat(m.visits?.completionRate || 0);
            return r >= 50 && r < 80;
          });
          break;
        case 'low':
          filtered = filtered.filter(m => parseFloat(m.visits?.completionRate || 0) < 50);
          break;
      }
    }

    // Sorting
    filtered.sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case 'name':
          aVal = a.name || '';
          bVal = b.name || '';
          break;
        case 'distance':
          aVal = a.distance || 0;
          bVal = b.distance || 0;
          break;
        case 'completed':
          aVal = a.visits?.completed || 0;
          bVal = b.visits?.completed || 0;
          break;
        case 'pending':
          aVal = a.visits?.pending || 0;
          bVal = b.visits?.pending || 0;
          break;
        case 'completionRate':
          aVal = parseFloat(a.visits?.completionRate) || 0;
          bVal = parseFloat(b.visits?.completionRate) || 0;
          break;
        case 'efficiency':
          aVal = a.performance?.efficiency || 0;
          bVal = b.performance?.efficiency || 0;
          break;
        default:
          aVal = a.distance || 0;
          bVal = b.distance || 0;
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [teamData, searchTerm, filters, sortBy, sortOrder]);

  // Pagination
  const paginatedMembers = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredMembers.slice(start, start + rowsPerPage);
  }, [filteredMembers, page, rowsPerPage]);

  // Handle row selection
  const handleRowSelect = (memberId) => {
    setSelectedRows(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId) 
        : [...prev, memberId]
    );
  };

  const handleSelectAll = () => {
    setSelectedRows(
      selectedRows.length === paginatedMembers.length 
        ? [] 
        : paginatedMembers.map(m => m.id)
    );
  };

  // Chart data
  const performanceChartData = useMemo(() => {
    if (!teamData?.teamMembers?.length) return null;
    const members = teamData.teamMembers.slice(0, 10);
    return {
      labels: members.map(m => m.name?.split(' ')[0] || 'N/A'),
      datasets: [
        { 
          label: 'Distance (km)', 
          data: members.map(m => m.distance || 0), 
          backgroundColor: alpha(PRIMARY, 0.6), 
          borderColor: PRIMARY, 
          borderWidth: 1, 
          yAxisID: 'y', 
          borderRadius: 4 
        },
        { 
          label: 'Completed Visits', 
          data: members.map(m => m.visits?.completed || 0), 
          backgroundColor: alpha(SUCCESS, 0.6), 
          borderColor: SUCCESS, 
          borderWidth: 1, 
          yAxisID: 'y1', 
          borderRadius: 4 
        },
        { 
          label: 'Pending Visits', 
          data: members.map(m => m.visits?.pending || 0), 
          backgroundColor: alpha(WARNING, 0.6), 
          borderColor: WARNING, 
          borderWidth: 1, 
          yAxisID: 'y1', 
          borderRadius: 4 
        }
      ]
    };
  }, [teamData]);

  const chartOptions = useMemo(() => ({
    responsive: true, 
    maintainAspectRatio: false,
    plugins: { 
      legend: { 
        position: 'top', 
        labels: { 
          boxWidth: 12, 
          font: { size: isMobile ? 10 : 12 } 
        } 
      }, 
      tooltip: { 
        mode: 'index', 
        intersect: false 
      } 
    },
    scales: {
      y: { 
        type: 'linear', 
        display: true, 
        position: 'left', 
        title: { 
          display: true, 
          text: 'Distance (km)', 
          font: { size: isMobile ? 10 : 12 } 
        }, 
        grid: { drawBorder: false } 
      },
      y1: { 
        type: 'linear', 
        display: true, 
        position: 'right', 
        title: { 
          display: true, 
          text: 'Visits', 
          font: { size: isMobile ? 10 : 12 } 
        }, 
        grid: { drawOnChartArea: false } 
      }
    }
  }), [isMobile]);

  const statusChartData = useMemo(() => {
    if (!teamData?.summary) return null;
    return {
      labels: ['ON DUTY', 'HALF DAY', 'OFF DUTY', 'INACTIVE', 'BREAK'],
      datasets: [{ 
        data: [
          teamData.summary.onDuty || 0, 
          teamData.summary.halfDay || 0, 
          teamData.summary.offDuty || 0, 
          teamData.summary.inactive || 0, 
          teamData.summary.break || 0
        ], 
        backgroundColor: [
          alpha(SUCCESS, 0.8), 
          alpha(WARNING, 0.8), 
          alpha('#9e9e9e', 0.8), 
          alpha(ERROR, 0.8), 
          alpha(INFO, 0.8)
        ], 
        borderWidth: 0 
      }]
    };
  }, [teamData]);

  const visitStatusChartData = useMemo(() => {
    if (!teamData?.summary) return null;
    return {
      labels: ['Completed', 'In Progress', 'Cancelled', 'Pending'],
      datasets: [{ 
        data: [
          teamData.summary.completedVisits || 0, 
          teamData.summary.inProgressVisits || 0, 
          teamData.summary.cancelledVisits || 0, 
          teamData.summary.pendingVisits || 0
        ], 
        backgroundColor: [
          alpha(SUCCESS, 0.8), 
          alpha(WARNING, 0.8), 
          alpha(ERROR, 0.8), 
          alpha(INFO, 0.8)
        ], 
        borderWidth: 0 
      }]
    };
  }, [teamData]);

  // Handle sort
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      const dataStr = JSON.stringify(teamData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const link = document.createElement('a');
      link.setAttribute('href', dataUri);
      link.setAttribute('download', `team-performance-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`);
      link.click();
      showSnackbar('Data exported successfully');
    } catch (error) {
      showSnackbar('Failed to export data', 'error');
    }
  };

  // Clear filters
  const handleClearFilters = () => {
    setFilters({ 
      status: 'all', 
      dutyStatus: 'all', 
      online: 'all', 
      completionStatus: 'all' 
    });
    setSearchTerm('');
    setFilterAnchor(null);
    setMobileFilterOpen(false);
    setPage(0);
  };

  // View on map
  const handleViewOnMap = (member) => {
    if (member.lastKnownLocation?.coordinates) {
      navigate('/visit-route', { 
        state: { 
          viewMember: member, 
          coordinates: member.lastKnownLocation.coordinates 
        } 
      });
    } else {
      showSnackbar('Location not available for this member', 'warning');
    }
  };

  // Mobile filter drawer
  const renderMobileFilterDrawer = () => (
    <Drawer 
      anchor="bottom" 
      open={mobileFilterOpen} 
      onClose={() => setMobileFilterOpen(false)}
      PaperProps={{ 
        sx: { 
          borderTopLeftRadius: 16, 
          borderTopRightRadius: 16, 
          maxHeight: '80vh' 
        } 
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={700}>Filter Members</Typography>
          <IconButton onClick={() => setMobileFilterOpen(false)}>
            <Close />
          </IconButton>
        </Box>
        <Stack spacing={3}>
          {[
            { 
              label: 'Account Status', 
              key: 'status', 
              options: [
                ['all', 'All'], 
                ['active', 'Active'], 
                ['inactive', 'Inactive']
              ] 
            },
            { 
              label: 'Duty Status', 
              key: 'dutyStatus', 
              options: [
                ['all', 'All'], 
                ['ON DUTY', 'On Duty'], 
                ['HALF DAY', 'Half Day'], 
                ['OFF DUTY', 'Off Duty'], 
                ['INACTIVE', 'Inactive'], 
                ['BREAK', 'Break']
              ] 
            },
            { 
              label: 'Online Status', 
              key: 'online', 
              options: [
                ['all', 'All'], 
                ['online', 'Online'], 
                ['offline', 'Offline']
              ] 
            },
            { 
              label: 'Completion Rate', 
              key: 'completionStatus', 
              options: [
                ['all', 'All'], 
                ['high', 'High (≥80%)'], 
                ['medium', 'Medium (50-80%)'], 
                ['low', 'Low (<50%)']
              ] 
            },
          ].map(({ label, key, options }) => (
            <FormControl key={key} fullWidth size="small">
              <InputLabel>{label}</InputLabel>
              <Select 
                value={filters[key]} 
                label={label} 
                onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
              >
                {options.map(([val, lbl]) => (
                  <MenuItem key={val} value={val}>{lbl}</MenuItem>
                ))}
              </Select>
            </FormControl>
          ))}
          <Box display="flex" gap={1}>
            <Button fullWidth variant="outlined" onClick={handleClearFilters}>
              Clear
            </Button>
            <Button fullWidth variant="contained" onClick={() => setMobileFilterOpen(false)}>
              Apply
            </Button>
          </Box>
        </Stack>
      </Box>
    </Drawer>
  );

  // Member details dialog
  const renderMemberDetailsDialog = () => (
    <Dialog
      open={!!selectedMember}
      onClose={handleCloseDetails}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{ sx: { borderRadius: isMobile ? 0 : 3 } }}
    >
      {selectedMember && (
        <>
          <DialogTitle sx={{
            p: 0,
            background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)`,
            color: 'white',
          }}>
            <Box sx={{ p: isMobile ? 2 : 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Stack direction="row" alignItems="center" gap={2}>
                  <Badge 
                    overlap="circular" 
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={<OnlineIndicator isOnline={selectedMember.isOnline} />}
                  >
                    <Avatar 
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.2)', 
                        width: isMobile ? 48 : 64, 
                        height: isMobile ? 48 : 64,
                        border: '2px solid rgba(255,255,255,0.4)'
                      }}
                    >
                      {selectedMember.firstName?.[0] || ''}{selectedMember.lastName?.[0] || ''}
                    </Avatar>
                  </Badge>
                  <Box>
                    <Typography variant={isMobile ? 'subtitle1' : 'h6'} fontWeight={700} color="white">
                      {selectedMember.name || 'Unknown'}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.85 }}>
                      {selectedMember.employeeId || selectedMember.email?.split('@')[0] || 'No ID'}
                    </Typography>
                    <Box display="flex" gap={1} mt={0.5} flexWrap="wrap">
                      <Chip 
                        label={selectedMember.dutyStatus || 'OFF DUTY'} 
                        size="small"
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.15)', 
                          color: 'white', 
                          fontSize: '0.65rem', 
                          height: 20 
                        }} 
                      />
                      <Chip 
                        icon={selectedMember.isOnline ? 
                          <Wifi sx={{ fontSize: '12px !important', color: 'white !important' }} /> : 
                          <WifiOff sx={{ fontSize: '12px !important', color: 'white !important' }} />
                        }
                        label={selectedMember.isOnline ? 'Online' : 'Offline'} 
                        size="small"
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.15)', 
                          color: 'white', 
                          fontSize: '0.65rem', 
                          height: 20 
                        }} 
                      />
                    </Box>
                  </Box>
                </Stack>
                <IconButton onClick={handleCloseDetails} sx={{ color: 'white', mt: -0.5 }}>
                  <Close />
                </IconButton>
              </Stack>
            </Box>
            <Tabs
              value={detailsTabValue}
              onChange={(e, v) => setDetailsTabValue(v)}
              sx={{
                px: isMobile ? 1 : 2,
                '& .MuiTab-root': { 
                  color: 'rgba(255,255,255,0.7)', 
                  fontSize: '0.8rem', 
                  minHeight: 44 
                },
                '& .Mui-selected': { color: 'white !important' },
                '& .MuiTabs-indicator': { bgcolor: 'white' }
              }}
            >
              <Tab label="Overview" />
              <Tab label={`Visits (${memberDetails?.recentVisits?.length || 0})`} />
              <Tab label="Location" />
            </Tabs>
          </DialogTitle>

          <DialogContent sx={{ p: 0 }}>
            {detailsLoading ? (
              <Stack spacing={2} alignItems="center" sx={{ py: 6 }}>
                <CircularProgress sx={{ color: PRIMARY }} />
                <Typography color="text.secondary">Loading details...</Typography>
              </Stack>
            ) : memberDetails ? (
              <Box sx={{ p: isMobile ? 2 : 3 }}>
                {/* TAB 0: OVERVIEW */}
                {detailsTabValue === 0 && (
                  <Stack spacing={2.5}>
                    {/* Contact Info */}
                    <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(PRIMARY, 0.02) }}>
                      <Typography variant="subtitle2" fontWeight={700} mb={1.5} color={PRIMARY}>
                        Contact Information
                      </Typography>
                      <Grid container spacing={1.5}>
                        <Grid item xs={12} sm={6}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Box sx={{ 
                              width: 32, 
                              height: 32, 
                              borderRadius: 1.5, 
                              bgcolor: alpha(PRIMARY, 0.1), 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center' 
                            }}>
                              <Email sx={{ fontSize: 16, color: PRIMARY }} />
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary">Email</Typography>
                              <Typography variant="body2" fontWeight={500} noWrap>
                                {selectedMember.email || 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Box sx={{ 
                              width: 32, 
                              height: 32, 
                              borderRadius: 1.5, 
                              bgcolor: alpha(SUCCESS, 0.1), 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center' 
                            }}>
                              <Phone sx={{ fontSize: 16, color: SUCCESS }} />
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary">Phone</Typography>
                              <Typography variant="body2" fontWeight={500}>
                                {selectedMember.phoneNumber || 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </Paper>

                    {/* Stats */}
                    <Grid container spacing={1.5}>
                      {[
                        { label: 'Distance', value: `${memberDetails.distance?.toFixed(1) || 0} km`, color: PRIMARY },
                        { label: 'Completed', value: memberDetails.visits?.completed || 0, color: SUCCESS },
                        { label: 'In Progress', value: memberDetails.visits?.inProgress || 0, color: WARNING },
                        { label: 'Cancelled', value: memberDetails.visits?.cancelled || 0, color: ERROR },
                      ].map(({ label, value, color }) => (
                        <Grid item xs={6} sm={3} key={label}>
                          <Paper sx={{ 
                            p: 2, 
                            bgcolor: alpha(color, 0.05), 
                            borderRadius: 2, 
                            textAlign: 'center' 
                          }}>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {label}
                            </Typography>
                            <Typography variant="h6" fontWeight={700} sx={{ color }}>
                              {value}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>

                    {/* Performance */}
                    <Paper sx={{ p: 2, bgcolor: alpha(INFO, 0.04), borderRadius: 2 }}>
                      <Typography variant="subtitle2" fontWeight={700} mb={1.5} color={INFO}>
                        Performance Metrics
                      </Typography>
                      <Grid container spacing={2}>
                        {[
                          { label: 'Efficiency', value: `${memberDetails.performance?.efficiency || 0}%` },
                          { label: 'On-Time Rate', value: `${memberDetails.performance?.onTimeRate || 0}%` },
                          { label: 'Avg Time/Visit', value: `${memberDetails.performance?.avgTimePerVisit || 0} min` },
                        ].map(({ label, value }) => (
                          <Grid item xs={4} key={label}>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {label}
                            </Typography>
                            <Typography variant="body1" fontWeight={700}>
                              {value}
                            </Typography>
                          </Grid>
                        ))}
                      </Grid>
                    </Paper>

                    {/* Supervisor */}
                    {memberDetails.supervisor && (
                      <Paper sx={{ p: 2, bgcolor: alpha(INFO, 0.04), borderRadius: 2 }}>
                        <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
                          Reports To
                        </Typography>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ bgcolor: INFO, width: 40, height: 40 }}>
                            {memberDetails.supervisor.name?.[0] || 'S'}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {memberDetails.supervisor.name || 'Unknown'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {memberDetails.supervisor.email || 'No email'} • {memberDetails.supervisor.role || 'Unknown'}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    )}
                  </Stack>
                )}

                {/* TAB 1: VISITS */}
                {detailsTabValue === 1 && (
                  <Stack spacing={2}>
                    {memberDetails.recentVisits?.length > 0 ? (
                      memberDetails.recentVisits.map((visit) => (
                        <Paper 
                          key={visit.id} 
                          sx={{ 
                            p: 2, 
                            borderRadius: 2, 
                            border: `1px solid ${alpha(PRIMARY, 0.08)}`,
                            cursor: 'pointer',
                            '&:hover': {
                              bgcolor: alpha(PRIMARY, 0.02)
                            }
                          }}
                          onClick={() => handleViewVisitDetails(visit)}
                        >
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1}>
                            <Box flex={1} minWidth={0}>
                              <Typography variant="subtitle2" fontWeight={700} noWrap>
                                {visit.locationName || 'Unknown Location'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {visit.checkInTime ? format(parseISO(visit.checkInTime), 'MMM dd, HH:mm') : 'N/A'}
                              </Typography>
                              {visit.distance > 0 && (
                                <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                                  <Route sx={{ fontSize: 12, color: 'text.disabled' }} />
                                  <Typography variant="caption" color="text.secondary">
                                    {visit.distance?.toFixed(1)} km
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                            <Stack direction="row" alignItems="center" gap={1} flexShrink={0}>
                              <VisitStatusChip label={visit.status || 'Unknown'} status={visit.status || 'Unknown'} size="small" />
                            </Stack>
                          </Stack>
                        </Paper>
                      ))
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 6 }}>
                        <Assignment sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                        <Typography color="text.secondary">No visits found</Typography>
                      </Box>
                    )}
                  </Stack>
                )}

                {/* TAB 2: LOCATION */}
                {detailsTabValue === 2 && (
                  <Stack spacing={2}>
                    {memberDetails.lastKnownLocation ? (
                      <>
                        <Paper sx={{ p: 2, bgcolor: alpha(INFO, 0.04), borderRadius: 2 }}>
                          <Typography variant="subtitle2" fontWeight={700} mb={1.5} color={INFO}>
                            Current Location
                          </Typography>
                          <Box display="flex" alignItems="flex-start" gap={1.5} mb={2}>
                            <PinDrop sx={{ color: ERROR, mt: 0.3 }} />
                            <Box flex={1}>
                              <Typography variant="body2" fontWeight={500}>
                                {memberDetails.lastKnownLocation.address || 'Address not available'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Updated {memberDetails.lastKnownLocation.time || 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                          {memberDetails.lastKnownLocation.coordinates && (
                            <Chip
                              icon={<MyLocation sx={{ fontSize: '14px !important' }} />}
                              label={`${memberDetails.lastKnownLocation.coordinates.lat?.toFixed(6) || 'N/A'}, ${memberDetails.lastKnownLocation.coordinates.lng?.toFixed(6) || 'N/A'}`}
                              size="small"
                              variant="outlined"
                              sx={{ mb: 2, fontSize: '0.7rem' }}
                            />
                          )}
                          <Button 
                            variant="outlined" 
                            size="small" 
                            startIcon={<Map />} 
                            onClick={() => handleViewOnMap(selectedMember)} 
                            fullWidth
                          >
                            View on Map
                          </Button>
                        </Paper>
                      </>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 6 }}>
                        <PinDrop sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                        <Typography color="text.secondary">Location not available</Typography>
                      </Box>
                    )}
                  </Stack>
                )}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Info sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography color="text.secondary">No details available</Typography>
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ p: isMobile ? 2 : 3, borderTop: '1px solid', borderColor: 'divider', gap: 1 }}>
            <Button variant="outlined" onClick={handleCloseDetails} fullWidth={isMobile}>
              Close
            </Button>
            {selectedMember.lastKnownLocation?.coordinates && (
              <Button 
                variant="contained" 
                startIcon={<Map />} 
                onClick={() => handleViewOnMap(selectedMember)} 
                fullWidth={isMobile}
              >
                View on Map
              </Button>
            )}
          </DialogActions>
        </>
      )}
    </Dialog>
  );

  // Loading state
  if (loading && !teamData) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        bgcolor: '#f8fafc', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        flexDirection: 'column', 
        gap: 2 
      }}>
        <CircularProgress sx={{ color: PRIMARY }} />
        <Typography color="text.secondary">Loading team performance...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', pb: isMobile ? 7 : 4 }}>
      {/* Header */}
      <Paper sx={{ 
        p: isMobile ? 2 : 3, 
        borderRadius: 0, 
        background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)`, 
        color: 'white', 
        position: 'sticky', 
        top: 0, 
        zIndex: 100, 
        boxShadow: 3 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ color: 'white' }}>
            <ArrowBack />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={800}>
              Team Performance Dashboard
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {teamData?.summary?.totalMembers || 0} Members • {teamData?.summary?.totalVisits || 0} Total Visits
              {refreshing && (
                <> • <CircularProgress size={10} sx={{ color: 'white', ml: 0.5, verticalAlign: 'middle' }} /></>
              )}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title={socket?.connected ? 'Connected' : 'Offline'}>
              <IconButton sx={{ color: 'white' }}>
                {socket?.connected ? <Wifi /> : <WifiOff />}
              </IconButton>
            </Tooltip>
            {isMobile && (
              <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: 'white' }}>
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Box>

        {isMobile && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <TextField
              fullWidth 
              placeholder="Search members..." 
              size="small"
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ fontSize: 18, color: 'rgba(255,255,255,0.7)' }} />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      <Close sx={{ fontSize: 16, color: 'rgba(255,255,255,0.7)' }} />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: { 
                  bgcolor: 'rgba(255,255,255,0.1)', 
                  color: 'white', 
                  '& .MuiOutlinedInput-notchedOutline': { 
                    borderColor: 'rgba(255,255,255,0.3)' 
                  }, 
                  '&:hover .MuiOutlinedInput-notchedOutline': { 
                    borderColor: 'rgba(255,255,255,0.5)' 
                  }, 
                  '& .MuiInputBase-input::placeholder': { 
                    color: 'rgba(255,255,255,0.7)', 
                    opacity: 1 
                  } 
                }
              }}
            />
            <IconButton 
              onClick={() => setMobileFilterOpen(true)} 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.1)', 
                color: 'white', 
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } 
              }}
            >
              <FilterList />
            </IconButton>
          </Box>
        )}
      </Paper>

      <Container maxWidth="xl" sx={{ px: isMobile ? 2 : 3, mt: 3 }}>
        {/* Desktop Search and Filters */}
        {!isMobile && (
          <GlassPaper sx={{ p: 2, mb: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
              <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                <TextField
                  placeholder="Search members..." 
                  size="small" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setSearchTerm('')}>
                          <Close fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: 250 }}
                />
                <FormControl size="small" sx={{ minWidth: 130 }}>
                  <InputLabel>Sort By</InputLabel>
                  <Select value={sortBy} label="Sort By" onChange={(e) => setSortBy(e.target.value)}>
                    {[
                      ['distance', 'Distance'], 
                      ['completed', 'Completed Visits'], 
                      ['pending', 'Pending Visits'], 
                      ['completionRate', 'Completion Rate'], 
                      ['name', 'Name'], 
                      ['efficiency', 'Efficiency']
                    ].map(([v, l]) => (
                      <MenuItem key={v} value={v}>{l}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <IconButton onClick={() => setSortOrder(p => p === 'asc' ? 'desc' : 'asc')}>
                  {sortOrder === 'asc' ? <ArrowUpward /> : <ArrowDownward />}
                </IconButton>
                <Button 
                  variant="outlined" 
                  startIcon={<FilterList />} 
                  onClick={(e) => setFilterAnchor(e.currentTarget)} 
                  size="medium"
                >
                  Filter
                  {(filters.status !== 'all' || filters.dutyStatus !== 'all' || 
                    filters.online !== 'all' || filters.completionStatus !== 'all') && (
                    <Badge color="primary" variant="dot" sx={{ ml: 1 }} />
                  )}
                </Button>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Button variant="outlined" startIcon={<Download />} onClick={handleExport} size="medium">
                  Export
                </Button>
                <Tooltip title="Refresh (auto every 30s)">
                  <IconButton onClick={() => fetchTeamPerformance(true)} size="medium">
                    <Refresh />
                  </IconButton>
                </Tooltip>
                <ToggleButtonGroup 
                  size="small" 
                  value={viewMode} 
                  exclusive 
                  onChange={(e, val) => val && setViewMode(val)}
                >
                  <ToggleButton value="table">
                    <ListAlt fontSize="small" />
                  </ToggleButton>
                  <ToggleButton value="grid">
                    <GridView fontSize="small" />
                  </ToggleButton>
                </ToggleButtonGroup>
                <FormControlLabel 
                  control={
                    <Switch 
                      size="small" 
                      checked={compactView} 
                      onChange={(e) => setCompactView(e.target.checked)} 
                    />
                  } 
                  label="Compact" 
                />
              </Stack>
            </Stack>
          </GlassPaper>
        )}

        {/* Time Range Tabs */}
        <Paper sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
          <Tabs 
            value={timeRange} 
            onChange={(e, val) => setTimeRange(val)} 
            variant={isMobile ? 'scrollable' : 'fullWidth'} 
            scrollButtons={isMobile ? 'auto' : false}
            sx={{ 
              bgcolor: 'background.paper', 
              '& .MuiTab-root': { 
                fontSize: isMobile ? '0.75rem' : '0.875rem', 
                minHeight: 48 
              } 
            }}
          >
            <Tab label="Today" value="day" />
            <Tab label="This Week" value="week" />
            <Tab label="This Month" value="month" />
            <Tab label="Custom" value="custom" />
          </Tabs>
        </Paper>

        {/* Quick Stats */}
        <Grid container spacing={isMobile ? 1.5 : 3} sx={{ mb: 3 }}>
          {[
            { 
              label: 'Total Members', 
              value: teamData?.summary?.totalMembers || 0, 
              icon: <People sx={{ fontSize: 20, color: PRIMARY }} />, 
              sub: (
                <Box display="flex" gap={1} mt={1} flexWrap="wrap">
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: SUCCESS }} />
                    <Typography variant="caption">{teamData?.summary?.onDuty || 0} On Duty</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#9e9e9e' }} />
                    <Typography variant="caption">{teamData?.summary?.offDuty || 0} Off</Typography>
                  </Box>
                </Box>
              ) 
            },
            { 
              label: 'Total Distance', 
              value: `${teamData?.summary?.totalDistance?.toFixed(1) || 0} km`, 
              icon: <Route sx={{ fontSize: 20, color: WARNING }} />, 
              sub: (
                <Typography variant="caption" color="text.secondary">
                  Avg {(teamData?.summary?.avgDistance || 0).toFixed(1)} km/member
                </Typography>
              ) 
            },
            { 
              label: 'Completed Visits', 
              value: teamData?.summary?.completedVisits || 0, 
              icon: <DoneAll sx={{ fontSize: 20, color: SUCCESS }} />, 
              sub: (
                <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                  <TrendingUp sx={{ fontSize: 14, color: SUCCESS }} />
                  <Typography variant="caption" color="text.secondary">
                    {teamData?.summary?.completionRate || 0}% completion rate
                  </Typography>
                </Box>
              ) 
            },
            { 
              label: 'Pending Visits', 
              value: teamData?.summary?.pendingVisits || 0, 
              icon: <Schedule sx={{ fontSize: 20, color: ERROR }} />, 
              sub: (
                <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                  <AccessTime sx={{ fontSize: 14, color: ERROR }} />
                  <Typography variant="caption" color="text.secondary">
                    {teamData?.summary?.inProgressVisits || 0} in progress
                  </Typography>
                </Box>
              ) 
            },
          ].map(({ label, value, icon, sub }) => (
            <Grid item xs={6} md={3} key={label}>
              <GlassPaper sx={{ p: isMobile ? 2 : 3, borderRadius: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                  <Typography variant="caption" color="text.secondary">{label}</Typography>
                  {icon}
                </Box>
                <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight={700}>{value}</Typography>
                {sub}
              </GlassPaper>
            </Grid>
          ))}
        </Grid>

        {/* Charts */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <GlassPaper sx={{ p: isMobile ? 2 : 3, borderRadius: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
                <Typography variant={isMobile ? 'subtitle1' : 'h6'} fontWeight={700}>
                  Performance Overview
                </Typography>
                <ToggleButtonGroup 
                  size="small" 
                  value={chartType} 
                  exclusive 
                  onChange={(e, val) => val && setChartType(val)}
                >
                  <ToggleButton value="bar">
                    <BarChart fontSize="small" />
                  </ToggleButton>
                  <ToggleButton value="line">
                    <ShowChart fontSize="small" />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Stack>
              <Box sx={{ height: isMobile ? 250 : 300 }}>
                {performanceChartData ? (
                  chartType === 'bar' ? 
                    <Bar data={performanceChartData} options={chartOptions} /> : 
                    <Line data={performanceChartData} options={chartOptions} />
                ) : (
                  <Box sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    flexDirection: 'column', 
                    gap: 2 
                  }}>
                    <BarChart sx={{ fontSize: 48, color: 'text.disabled' }} />
                    <Typography color="text.secondary">No data available</Typography>
                  </Box>
                )}
              </Box>
            </GlassPaper>
          </Grid>
          <Grid item xs={12} md={4}>
            <GlassPaper sx={{ p: isMobile ? 2 : 3, borderRadius: 3, height: '100%' }}>
              <Typography variant={isMobile ? 'subtitle1' : 'h6'} fontWeight={700} mb={2}>
                Status Distribution
              </Typography>
              <Box sx={{ height: isMobile ? 150 : 200, mb: 2 }}>
                {statusChartData ? (
                  <Pie data={statusChartData} options={{ maintainAspectRatio: false }} />
                ) : (
                  <Box sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <PieChart sx={{ fontSize: 40, color: 'text.disabled' }} />
                  </Box>
                )}
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant={isMobile ? 'subtitle1' : 'h6'} fontWeight={700} mb={2}>
                Visit Status
              </Typography>
              <Box sx={{ height: isMobile ? 150 : 200 }}>
                {visitStatusChartData ? (
                  <Doughnut data={visitStatusChartData} options={{ maintainAspectRatio: false }} />
                ) : (
                  <Box sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <PieChart sx={{ fontSize: 40, color: 'text.disabled' }} />
                  </Box>
                )}
              </Box>
            </GlassPaper>
          </Grid>
        </Grid>

        {/* Team Members Section */}
        <GlassPaper sx={{ p: isMobile ? 2 : 3, borderRadius: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
            <Box>
              <Typography variant={isMobile ? 'subtitle1' : 'h6'} fontWeight={700}>
                Team Members
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {filteredMembers.length} members • {selectedRows.length} selected
              </Typography>
            </Box>
            {!isMobile && (
              <Stack direction="row" spacing={1}>
                {selectedRows.length > 0 && (
                  <Button 
                    size="small" 
                    variant="outlined" 
                    color="error" 
                    startIcon={<Close />} 
                    onClick={() => setSelectedRows([])}
                  >
                    Clear Selection
                  </Button>
                )}
                <Button 
                  size="small" 
                  variant="outlined" 
                  startIcon={<Refresh />} 
                  onClick={() => fetchTeamPerformance(true)}
                >
                  Refresh
                </Button>
              </Stack>
            )}
          </Stack>

          {/* Mobile View */}
          {isMobile ? (
            <Box>
              {paginatedMembers.length > 0 ? (
                paginatedMembers.map(member => (
                  <MobileMemberCard 
                    key={member.id} 
                    member={member} 
                    onSelect={handleMemberSelect} 
                    onViewMap={handleViewOnMap}
                    onViewDetails={handleViewMemberDetails}
                    isSelected={selectedMember?.id === member.id} 
                  />
                ))
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <People sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography color="text.secondary">No members found</Typography>
                  <Button variant="outlined" onClick={handleClearFilters} sx={{ mt: 2 }}>
                    Clear Filters
                  </Button>
                </Box>
              )}
            </Box>
          ) : (
            /* Desktop Table View */
            <TableContainer>
              <Table size={compactView ? 'small' : 'medium'}>
                <TableHead>
                  <TableRow>
                    <StyledTableCell padding="checkbox">
                      <Checkbox 
                        indeterminate={selectedRows.length > 0 && selectedRows.length < paginatedMembers.length} 
                        checked={selectedRows.length === paginatedMembers.length && paginatedMembers.length > 0} 
                        onChange={handleSelectAll} 
                      />
                    </StyledTableCell>
                    {[
                      ['name', 'Member'], 
                      ['distance', 'Distance'], 
                      ['completed', 'Completed'], 
                      ['pending', 'Pending'], 
                      ['completionRate', 'Completion'], 
                      ['efficiency', 'Efficiency']
                    ].map(([field, label]) => (
                      <StyledTableCell key={field}>
                        <TableSortLabel 
                          active={sortBy === field} 
                          direction={sortBy === field ? sortOrder : 'asc'} 
                          onClick={() => handleSort(field)}
                          IconComponent={sortBy === field ? 
                            (sortOrder === 'asc' ? ArrowUpward : ArrowDownward) : 
                            SwapVert}
                        >
                          {label}
                        </TableSortLabel>
                      </StyledTableCell>
                    ))}
                    <StyledTableCell>Status</StyledTableCell>
                    <StyledTableCell>Last Known</StyledTableCell>
                    <StyledTableCell align="center">Actions</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedMembers.map(member => (
                    <StyledTableRow 
                      key={member.id} 
                      hover 
                      selected={selectedMember?.id === member.id}
                      onMouseEnter={() => setHoveredMember(member.id)} 
                      onMouseLeave={() => setHoveredMember(null)}
                    >
                      <StyledTableCell padding="checkbox">
                        <Checkbox 
                          checked={selectedRows.includes(member.id)} 
                          onChange={() => handleRowSelect(member.id)} 
                        />
                      </StyledTableCell>
                      <StyledTableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Badge 
                            overlap="circular" 
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} 
                            badgeContent={<OnlineIndicator isOnline={member.isOnline} />}
                          >
                            <Avatar sx={{ bgcolor: PRIMARY, width: 40, height: 40 }}>
                              {member.firstName?.[0] || ''}{member.lastName?.[0] || ''}
                            </Avatar>
                          </Badge>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {member.name || 'Unknown'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {member.employeeId || member.email?.split('@')[0] || 'No ID'}
                            </Typography>
                          </Box>
                        </Box>
                      </StyledTableCell>
                      <StyledTableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Route sx={{ fontSize: 16, color: PRIMARY }} />
                          <Typography variant="body2" fontWeight={600}>
                            {member.distance?.toFixed(1) || 0} km
                          </Typography>
                        </Box>
                      </StyledTableCell>
                      <StyledTableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <DoneAll sx={{ fontSize: 16, color: SUCCESS }} />
                          <Typography variant="body2" fontWeight={600}>
                            {member.visits?.completed || 0}
                          </Typography>
                        </Box>
                      </StyledTableCell>
                      <StyledTableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Schedule sx={{ fontSize: 16, color: WARNING }} />
                          <Typography variant="body2" fontWeight={600}>
                            {member.visits?.pending || 0}
                          </Typography>
                        </Box>
                      </StyledTableCell>
                      <StyledTableCell>
                        <Box width={100}>
                          <Typography variant="caption" fontWeight={600}>
                            {member.visits?.completionRate || 0}%
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={parseFloat(member.visits?.completionRate) || 0}
                            sx={{ 
                              height: 6, 
                              borderRadius: 3, 
                              bgcolor: alpha(SUCCESS, 0.1), 
                              '& .MuiLinearProgress-bar': { 
                                bgcolor: parseFloat(member.visits?.completionRate) >= 80 ? SUCCESS : 
                                        parseFloat(member.visits?.completionRate) >= 50 ? WARNING : ERROR 
                              } 
                            }} 
                          />
                        </Box>
                      </StyledTableCell>
                      <StyledTableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Speed sx={{ fontSize: 16, color: INFO }} />
                          <Typography variant="body2">{member.performance?.efficiency || 0}%</Typography>
                        </Box>
                        {!compactView && (
                          <Typography variant="caption" color="text.secondary">
                            Avg {member.performance?.avgTimePerVisit || 0} min/visit
                          </Typography>
                        )}
                      </StyledTableCell>
                      <StyledTableCell>
                        <StatusChip 
                          label={member.dutyStatus || 'OFF DUTY'} 
                          status={member.dutyStatus || 'OFF DUTY'} 
                          size="small" 
                        />
                      </StyledTableCell>
                      <StyledTableCell>
                        <Tooltip title={member.lastKnownLocation?.address || 'No location'}>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <PinDrop sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="caption" noWrap sx={{ maxWidth: 120 }}>
                              {member.lastKnownLocation?.address?.split(',')[0] || 'N/A'}
                            </Typography>
                          </Box>
                        </Tooltip>
                        {member.lastKnownLocation?.time && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {member.lastKnownLocation.time}
                          </Typography>
                        )}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="View on Map">
                            <IconButton 
                              size="small" 
                              onClick={() => handleViewOnMap(member)} 
                              sx={{ 
                                bgcolor: hoveredMember === member.id ? alpha(PRIMARY, 0.1) : 'transparent' 
                              }}
                            >
                              <Map fontSize="small" sx={{ color: PRIMARY }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View Details">
                            <IconButton 
                              size="small" 
                              onClick={() => handleViewMemberDetails(member)} 
                              sx={{ 
                                bgcolor: hoveredMember === member.id ? alpha(INFO, 0.1) : 'transparent' 
                              }}
                            >
                              <Visibility fontSize="small" sx={{ color: INFO }} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </StyledTableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Pagination */}
          {filteredMembers.length > 0 && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mt: 3, 
              flexDirection: isMobile ? 'column' : 'row', 
              gap: 2 
            }}>
              <Typography variant="body2" color="text.secondary">
                Showing {page * rowsPerPage + 1} to {Math.min((page + 1) * rowsPerPage, filteredMembers.length)} of {filteredMembers.length} members
              </Typography>
              <Pagination
                count={Math.ceil(filteredMembers.length / rowsPerPage)} 
                page={page + 1}
                onChange={(e, val) => setPage(val - 1)} 
                color="primary" 
                size={isMobile ? 'small' : 'medium'}
                showFirstButton 
                showLastButton
                sx={{ 
                  '& .MuiPaginationItem-root': { 
                    borderRadius: 2, 
                    '&.Mui-selected': { 
                      bgcolor: PRIMARY, 
                      color: '#fff', 
                      '&:hover': { bgcolor: SECONDARY } 
                    } 
                  } 
                }}
              />
            </Box>
          )}
        </GlassPaper>

        {/* Desktop Filter Menu */}
        <Menu 
          anchorEl={filterAnchor} 
          open={Boolean(filterAnchor)} 
          onClose={() => setFilterAnchor(null)}
          PaperProps={{ sx: { width: 360, p: 3, borderRadius: 3, mt: 1 } }}
        >
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
            Filter Members
          </Typography>
          <Stack spacing={2.5}>
            {[
              { 
                label: 'Account Status', 
                key: 'status', 
                options: [
                  ['all', 'All'], 
                  ['active', 'Active'], 
                  ['inactive', 'Inactive']
                ] 
              },
              { 
                label: 'Duty Status', 
                key: 'dutyStatus', 
                options: [
                  ['all', 'All'], 
                  ['ON DUTY', 'On Duty'], 
                  ['HALF DAY', 'Half Day'], 
                  ['OFF DUTY', 'Off Duty'], 
                  ['INACTIVE', 'Inactive'], 
                  ['BREAK', 'Break']
                ] 
              },
              { 
                label: 'Online Status', 
                key: 'online', 
                options: [
                  ['all', 'All'], 
                  ['online', 'Online'], 
                  ['offline', 'Offline']
                ] 
              },
              { 
                label: 'Completion Rate', 
                key: 'completionStatus', 
                options: [
                  ['all', 'All'], 
                  ['high', 'High (≥80%)'], 
                  ['medium', 'Medium (50-80%)'], 
                  ['low', 'Low (<50%)']
                ] 
              },
            ].map(({ label, key, options }) => (
              <FormControl key={key} fullWidth size="small">
                <InputLabel>{label}</InputLabel>
                <Select 
                  value={filters[key]} 
                  label={label} 
                  onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
                >
                  {options.map(([val, lbl]) => (
                    <MenuItem key={val} value={val}>{lbl}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            ))}
            <Box display="flex" gap={1.5} sx={{ mt: 1 }}>
              <Button fullWidth variant="outlined" onClick={handleClearFilters} startIcon={<Clear />}>
                Clear
              </Button>
              <Button fullWidth variant="contained" onClick={() => setFilterAnchor(null)} startIcon={<CheckCircle />}>
                Apply
              </Button>
            </Box>
          </Stack>
        </Menu>

        {/* Mobile Filter Drawer */}
        {renderMobileFilterDrawer()}

        {/* Member Details Dialog */}
        {renderMemberDetailsDialog()}

        {/* Visit Details Dialog */}
        <VisitDetailsDialog
          open={visitDetailsOpen}
          visit={selectedVisit}
          onClose={() => setVisitDetailsOpen(false)}
          onComplete={handleCompleteVisitClick}
        />

        {/* Complete Visit Confirmation Dialog */}
        <CompleteVisitDialog
          open={completeVisitDialog.open}
          visit={completeVisitDialog.visit}
          onClose={() => setCompleteVisitDialog({ open: false, visit: null })}
          onConfirm={handleCompleteVisitConfirm}
          loading={completeLoading}
        />

        {/* Mobile Drawer Menu */}
        <Drawer 
          anchor="right" 
          open={drawerOpen} 
          onClose={() => setDrawerOpen(false)}
          PaperProps={{ 
            sx: { 
              width: '80%', 
              maxWidth: 300, 
              borderTopLeftRadius: 16, 
              borderBottomLeftRadius: 16 
            } 
          }}
        >
          <Box sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={2}>
              <Avatar sx={{ bgcolor: PRIMARY, width: 48, height: 48 }}>
                {user?.firstName?.[0] || ''}{user?.lastName?.[0] || ''}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  {user?.firstName || ''} {user?.lastName || ''}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.role || 'Unknown'}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <List>
              {[
                ['/', <Dashboard />, 'Dashboard'],
                ['/total-visits', <History />, 'Visits'],
                ['/visit-route', <Map />, 'Route History'],
                [null, <People />, 'Team Performance']
              ].map(([path, icon, label]) => (
                <ListItem 
                  button 
                  key={label} 
                  onClick={() => { 
                    setDrawerOpen(false); 
                    if (path) navigate(path); 
                  }}
                >
                  <ListItemIcon>{icon}</ListItemIcon>
                  <ListItemText primary={label} />
                </ListItem>
              ))}
            </List>
            <Divider sx={{ my: 2 }} />
            <List>
              <ListItem button onClick={() => setDrawerOpen(false)}>
                <ListItemIcon><Close /></ListItemIcon>
                <ListItemText primary="Close" />
              </ListItem>
            </List>
          </Box>
        </Drawer>

        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <Paper sx={{ 
            position: 'fixed', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            borderRadius: 0, 
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`, 
            zIndex: 100 
          }} elevation={3}>
            <BottomNavigation 
              showLabels 
              value={0} 
              onChange={(e, v) => { 
                if (v === 0) navigate('/'); 
                if (v === 1) navigate('/total-visits'); 
                if (v === 2) navigate('/visit-route'); 
              }}
            >
              <BottomNavigationAction label="Home" icon={<Dashboard />} />
              <BottomNavigationAction label="Visits" icon={<History />} />
              <BottomNavigationAction label="Map" icon={<Map />} />
            </BottomNavigation>
          </Paper>
        )}

        {/* Mobile FAB */}
        {isMobile && (
          <Zoom in={true}>
            <Fab 
              color="primary" 
              sx={{ position: 'fixed', bottom: 80, right: 16, zIndex: 1000 }} 
              onClick={() => fetchTeamPerformance(true)}
            >
              <Refresh />
            </Fab>
          </Zoom>
        )}

        {/* Refresh Backdrop */}
        <Backdrop sx={{ color: '#fff', zIndex: theme.zIndex.drawer + 1 }} open={refreshing}>
          <CircularProgress color="inherit" />
        </Backdrop>

        {/* Snackbar */}
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={3000} 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            severity={snackbar.severity} 
            sx={{ borderRadius: 2, width: '100%', boxShadow: 3 }} 
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}