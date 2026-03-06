// components/TeamPerformanceDashboard.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  TablePagination,
  TableSortLabel,
  Tooltip,
  Badge,
  LinearProgress,
  alpha,
  useTheme,
  useMediaQuery,
  Skeleton,
  Alert,
  Snackbar,
  ToggleButton,
  ToggleButtonGroup,
  Collapse,
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
  Slide,
  Backdrop,
  CircularProgress,
  Tab,
  Tabs,
  FormHelperText,
  Pagination
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Search,
  FilterList,
  Download,
  Refresh,
  Visibility,
  Person,
  Group,
  TrendingUp,
  AccessTime,
  LocationOn,
  Email,
  Phone,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Cancel,
  PlayArrow,
  Pause,
  Route,
  Assessment,
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
  GpsFixed,
  GpsOff,
  MyLocation,
  Menu as MenuIcon,
  Dashboard,
  History,
  People,
  FilterAlt,
  SwapVert,
  Clear,
  ArrowBack,
  Today,
  DateRange,
  Weekend
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
import { format, subDays, subWeeks, subMonths, isToday, isYesterday } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Register ChartJS components
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

const StatCard = styled(Card)(({ theme, color = 'primary' }) => ({
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  position: 'relative',
  height: '100%',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: theme.breakpoints.up('sm') ? 'translateY(-4px)' : 'none',
    boxShadow: theme.shadows[8]
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: `linear-gradient(90deg, ${theme.palette[color]?.main || PRIMARY}, ${alpha(theme.palette[color]?.main || PRIMARY, 0.5)})`
  }
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
  const colors = {
    'ON DUTY': { bg: alpha(SUCCESS, 0.1), color: SUCCESS },
    'HALF DAY': { bg: alpha(WARNING, 0.1), color: WARNING },
    'COMPLETED': { bg: alpha(INFO, 0.1), color: INFO },
    'OFF DUTY': { bg: alpha('#9e9e9e', 0.1), color: '#9e9e9e' },
    'INACTIVE': { bg: alpha(ERROR, 0.1), color: ERROR }
  };
  const style = colors[status] || colors['OFF DUTY'];

  return {
    backgroundColor: style.bg,
    color: style.color,
    fontWeight: 600,
    fontSize: theme.breakpoints.down('sm') ? '0.65rem' : '0.75rem',
    height: theme.breakpoints.down('sm') ? 24 : 28,
    '& .MuiChip-icon': {
      color: style.color,
      fontSize: theme.breakpoints.down('sm') ? 14 : 16
    }
  };
});

const VisitStatusChip = styled(Chip)(({ theme, status }) => {
  const colors = {
    'Completed': { bg: alpha(SUCCESS, 0.1), color: SUCCESS },
    'InProgress': { bg: alpha(WARNING, 0.1), color: WARNING },
    'Cancelled': { bg: alpha(ERROR, 0.1), color: ERROR },
    'Scheduled': { bg: alpha(INFO, 0.1), color: INFO }
  };
  const style = colors[status] || colors['Scheduled'];

  return {
    backgroundColor: style.bg,
    color: style.color,
    fontWeight: 600,
    fontSize: theme.breakpoints.down('sm') ? '0.6rem' : '0.7rem',
    height: theme.breakpoints.down('sm') ? 20 : 24
  };
});

const MemberCard = styled(Card)(({ theme, isSelected }) => ({
  borderRadius: theme.spacing(2),
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  border: isSelected ? `2px solid ${PRIMARY}` : '1px solid transparent',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    transform: theme.breakpoints.up('sm') ? 'translateY(-4px)' : 'none',
    boxShadow: theme.shadows[8]
  }
}));

const OnlineIndicator = styled(Box)(({ theme, isOnline }) => ({
  width: 10,
  height: 10,
  borderRadius: '50%',
  backgroundColor: isOnline ? SUCCESS : '#9e9e9e',
  border: `2px solid ${theme.palette.background.paper}`,
  position: 'absolute',
  bottom: 0,
  right: 0
}));

// ========== MAIN COMPONENT ==========
export default function TeamPerformanceDashboard() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const { fetchAPI, user, onlineUsers, socket } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [teamData, setTeamData] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberDetails, setMemberDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
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
    online: 'all'
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [customDateRange, setCustomDateRange] = useState({
    start: subDays(new Date(), 7),
    end: new Date()
  });
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Socket event listeners
  useEffect(() => {
    if (socket) {
      socket.on('team:location', (data) => {
        setTeamData(prev => {
          if (!prev) return prev;
          const updatedMembers = prev.teamMembers.map(member => {
            if (member.id === data.userId) {
              return {
                ...member,
                lastKnownLocation: {
                  ...member.lastKnownLocation,
                  ...data.location,
                  time: 'Just now'
                }
              };
            }
            return member;
          });
          return { ...prev, teamMembers: updatedMembers };
        });
      });

      return () => {
        socket.off('team:location');
      };
    }
  }, [socket]);

  // Fetch team performance data
  const fetchTeamPerformance = useCallback(async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      let startDate, endDate;
      const now = new Date();
      
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

      const response = await fetchAPI(`/visit/performance/team?page=1&limit=100&sortBy=${sortBy}&sortOrder=${sortOrder}&startDate=${startDate}&endDate=${endDate}`);
      
      if (response?.success && response?.result) {
        const membersWithOnlineStatus = (response.result.teamMembers || []).map(member => ({
          ...member,
          isOnline: onlineUsers.some(u => u.userId === member.id)
        }));

        setTeamData({
          ...response.result,
          teamMembers: membersWithOnlineStatus
        });
      } else {
        showSnackbar('Failed to fetch team performance', 'error');
      }
    } catch (error) {
      console.error('Error fetching team performance:', error);
      showSnackbar('Error loading data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchAPI, timeRange, sortBy, sortOrder, onlineUsers, customDateRange]);

  useEffect(() => {
    fetchTeamPerformance();
  }, [fetchTeamPerformance]);

  // Update rows per page based on screen size
  useEffect(() => {
    setRowsPerPage(isMobile ? 5 : 10);
    setPage(0);
  }, [isMobile]);

  // Fetch member details
  const fetchMemberDetails = useCallback(async (memberId) => {
    try {
      setDetailsLoading(true);
      const response = await fetchAPI(`/visit/performance/team-member/${memberId}`);
      if (response?.success && response?.result) {
        setMemberDetails(response.result);
      }
    } catch (error) {
      console.error('Error fetching member details:', error);
      showSnackbar('Failed to load member details', 'error');
    } finally {
      setDetailsLoading(false);
    }
  }, [fetchAPI]);

  const handleMemberSelect = (member) => {
    setSelectedMember(member);
    fetchMemberDetails(member.id);
  };

  const handleCloseDetails = () => {
    setSelectedMember(null);
    setMemberDetails(null);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Filter and sort team members
  const filteredMembers = useMemo(() => {
    if (!teamData?.teamMembers) return [];

    let filtered = [...teamData.teamMembers];

    // Apply search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(member =>
        (member.name?.toLowerCase() || '').includes(term) ||
        (member.email?.toLowerCase() || '').includes(term) ||
        (member.phoneNumber || '').includes(term) ||
        (member.employeeId?.toLowerCase() || '').includes(term)
      );
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(member => member.accountStatus === filters.status);
    }

    // Apply duty status filter
    if (filters.dutyStatus !== 'all') {
      filtered = filtered.filter(member => member.dutyStatus === filters.dutyStatus);
    }

    // Apply online filter
    if (filters.online !== 'all') {
      const isOnline = filters.online === 'online';
      filtered = filtered.filter(member => member.isOnline === isOnline);
    }

    // Apply sorting
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
        case 'visits':
          aVal = a.visits?.completed || 0;
          bVal = b.visits?.completed || 0;
          break;
        case 'status':
          aVal = a.dutyStatus || '';
          bVal = b.dutyStatus || '';
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

  // Chart data for team performance
  const performanceChartData = useMemo(() => {
    if (!teamData?.teamMembers || teamData.teamMembers.length === 0) return null;

    const members = teamData.teamMembers.slice(0, 10);
    const labels = members.map(m => {
      const name = m.name?.split(' ') || [];
      return name[0] || 'N/A';
    });
    const distances = members.map(m => m.distance || 0);
    const completedVisits = members.map(m => m.visits?.completed || 0);

    return {
      labels,
      datasets: [
        {
          label: 'Distance (km)',
          data: distances,
          backgroundColor: alpha(PRIMARY, 0.6),
          borderColor: PRIMARY,
          borderWidth: 1,
          yAxisID: 'y',
          borderRadius: 4
        },
        {
          label: 'Completed Visits',
          data: completedVisits,
          backgroundColor: alpha(SUCCESS, 0.6),
          borderColor: SUCCESS,
          borderWidth: 1,
          yAxisID: 'y1',
          borderRadius: 4
        }
      ]
    };
  }, [teamData]);

  // Chart options
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 12,
          font: {
            size: isMobile ? 10 : 12
          }
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
          font: {
            size: isMobile ? 10 : 12
          }
        },
        grid: {
          drawBorder: false
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Visits',
          font: {
            size: isMobile ? 10 : 12
          }
        },
        grid: {
          drawOnChartArea: false
        }
      }
    }
  }), [isMobile]);

  // Status distribution chart data
  const statusChartData = useMemo(() => {
    if (!teamData?.summary) return null;

    return {
      labels: ['ON DUTY', 'HALF DAY', 'OFF DUTY', 'INACTIVE'],
      datasets: [
        {
          data: [
            teamData.summary.onDuty || 0,
            teamData.summary.halfDay || 0,
            teamData.summary.offDuty || 0,
            teamData.summary.inactive || 0
          ],
          backgroundColor: [
            alpha(SUCCESS, 0.8),
            alpha(WARNING, 0.8),
            alpha('#9e9e9e', 0.8),
            alpha(ERROR, 0.8)
          ],
          borderWidth: 0,
        }
      ]
    };
  }, [teamData]);

  // Visit status chart data
  const visitStatusChartData = useMemo(() => {
    if (!teamData?.summary) return null;

    return {
      labels: ['Completed', 'In Progress', 'Cancelled'],
      datasets: [
        {
          data: [
            teamData.summary.completedVisits || 0,
            teamData.summary.inProgressVisits || 0,
            teamData.summary.cancelledVisits || 0
          ],
          backgroundColor: [
            alpha(SUCCESS, 0.8),
            alpha(WARNING, 0.8),
            alpha(ERROR, 0.8)
          ],
          borderWidth: 0,
        }
      ]
    };
  }, [teamData]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleExport = async () => {
    try {
      const dataStr = JSON.stringify(teamData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const exportFileDefaultName = `team-performance-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      showSnackbar('Data exported successfully');
    } catch (error) {
      showSnackbar('Failed to export data', 'error');
    }
  };

  const handleRefresh = () => {
    fetchTeamPerformance(true);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showSnackbar('Link copied to clipboard', 'info');
  };

  const handleClearFilters = () => {
    setFilters({
      status: 'all',
      dutyStatus: 'all',
      online: 'all'
    });
    setSearchTerm('');
    setFilterAnchor(null);
    setMobileFilterOpen(false);
    setPage(0);
  };

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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
          <FormControl fullWidth size="small">
            <InputLabel>Account Status</InputLabel>
            <Select
              value={filters.status}
              label="Account Status"
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Duty Status</InputLabel>
            <Select
              value={filters.dutyStatus}
              label="Duty Status"
              onChange={(e) => setFilters({ ...filters, dutyStatus: e.target.value })}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="ON DUTY">On Duty</MenuItem>
              <MenuItem value="HALF DAY">Half Day</MenuItem>
              <MenuItem value="OFF DUTY">Off Duty</MenuItem>
              <MenuItem value="INACTIVE">Inactive</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Online Status</InputLabel>
            <Select
              value={filters.online}
              label="Online Status"
              onChange={(e) => setFilters({ ...filters, online: e.target.value })}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="online">Online</MenuItem>
              <MenuItem value="offline">Offline</MenuItem>
            </Select>
          </FormControl>

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

  // Mobile member card
  const renderMobileMemberCard = (member) => (
    <MemberCard
      key={member.id}
      isSelected={selectedMember?.id === member.id}
      onClick={() => handleMemberSelect(member)}
    >
      <CardContent sx={{ p: 2 }}>
        <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <OnlineIndicator isOnline={member.isOnline} />
            }
          >
            <Avatar 
              sx={{ 
                bgcolor: member.isOnline ? SUCCESS : '#9e9e9e',
                width: 48, 
                height: 48 
              }}
            >
              {member.firstName?.[0] || ''}{member.lastName?.[0] || ''}
            </Avatar>
          </Badge>
          <Box flex={1} minWidth={0}>
            <Typography variant="subtitle2" fontWeight={700} noWrap>
              {member.name || 'Unknown'}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" noWrap>
              {member.employeeId || member.email || 'No ID'}
            </Typography>
          </Box>
          <StatusChip
            label={member.dutyStatus || 'OFF DUTY'}
            status={member.dutyStatus || 'OFF DUTY'}
            size="small"
          />
        </Box>

        <Stack spacing={1} sx={{ mb: 1.5 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Route sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2">
              <strong>{member.distance?.toFixed(1) || 0} km</strong> today
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Assessment sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2">
              <strong>{member.visits?.completed || 0}/{member.visits?.total || 0}</strong> visits
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={(member.visits?.completed / (member.visits?.total || 1)) * 100}
            sx={{ height: 4, borderRadius: 2 }}
          />
        </Stack>

        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={0.5} sx={{ maxWidth: '60%' }}>
            <MyLocation sx={{ fontSize: 14, color: member.isOnline ? SUCCESS : 'text.disabled' }} />
            <Typography variant="caption" color="text.secondary" noWrap>
              {member.lastKnownLocation?.address || 'Location unavailable'}
            </Typography>
          </Box>
          <Box display="flex" gap={0.5}>
            <Tooltip title="View on Map">
              <IconButton size="small" onClick={(e) => {
                e.stopPropagation();
                handleViewOnMap(member);
              }}>
                <Map fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="View Details">
              <IconButton size="small" onClick={(e) => {
                e.stopPropagation();
                handleMemberSelect(member);
              }}>
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </CardContent>
    </MemberCard>
  );

  if (loading && !teamData) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        bgcolor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <CircularProgress sx={{ color: PRIMARY }} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#f8fafc',
      pb: isMobile ? 7 : 4,
      ml : isMobile ? 2 : 3
    }}>
      {/* Header */}
      <Paper
        sx={{
          p: isMobile ? 2 : 3,
          borderRadius: 0,
          background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)`,
          color: 'white',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: 3,
          mb: 3,
          width: isMobile ? "95%" : "1160px",
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ color: 'white' }}>
            <ArrowBack />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant={isMobile ? "h6" : "h5"} fontWeight={800}>
              Team Performance
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title={socket?.connected ? "Connected" : "Offline"}>
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

        {/* Search and Filter Bar - Mobile */}
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

      <Container maxWidth="xl" sx={{ px: isMobile ? 2 : 3 }}>
        {/* Search and Filter - Desktop */}
        {!isMobile && (
          <GlassPaper sx={{ p: 2, mb: 3 }}>
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
                }}
                sx={{ width: 250 }}
              />
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={(e) => setFilterAnchor(e.currentTarget)}
                size="small"
              >
                Filter
              </Button>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={handleExport}
                size="small"
              >
                Export
              </Button>
              <IconButton onClick={handleRefresh} size="small">
                <Refresh />
              </IconButton>
              <IconButton onClick={handleShare} size="small">
                <Share />
              </IconButton>
              <Box sx={{ flex: 1 }} />
              <ToggleButtonGroup
                size="small"
                value={viewMode}
                exclusive
                onChange={(e, val) => val && setViewMode(val)}
              >
                <ToggleButton value="grid">
                  <GridView fontSize="small" />
                </ToggleButton>
                <ToggleButton value="list">
                  <ListAlt fontSize="small" />
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </GlassPaper>
        )}

        {/* Time Range Tabs */}
        <Paper sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
          <Tabs
            value={timeRange}
            onChange={(e, val) => setTimeRange(val)}
            variant={isMobile ? "scrollable" : "fullWidth"}
            scrollButtons={isMobile ? "auto" : false}
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
          <Grid item xs={6} md={3}>
            <StatCard color="primary">
              <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: isMobile ? '0.6rem' : '0.75rem' }}>
                  Total Members
                </Typography>
                <Typography variant={isMobile ? "h6" : "h5"} fontWeight={700}>
                  {teamData?.summary?.totalMembers || 0}
                </Typography>
                <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                  <People sx={{ fontSize: 14, color: 'text.disabled' }} />
                  <Typography variant="caption" color="text.secondary">
                    {teamData?.summary?.activeMembers || 0} active
                  </Typography>
                </Box>
              </CardContent>
            </StatCard>
          </Grid>

          <Grid item xs={6} md={3}>
            <StatCard color="success">
              <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: isMobile ? '0.6rem' : '0.75rem' }}>
                  On Duty
                </Typography>
                <Typography variant={isMobile ? "h6" : "h5"} fontWeight={700}>
                  {teamData?.summary?.onDuty || 0}
                </Typography>
                <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                  <PlayArrow sx={{ fontSize: 14, color: SUCCESS }} />
                  <Typography variant="caption" color="text.secondary">
                    {((teamData?.summary?.onDuty / (teamData?.summary?.totalMembers || 1)) * 100).toFixed(0)}% active
                  </Typography>
                </Box>
              </CardContent>
            </StatCard>
          </Grid>

          <Grid item xs={6} md={3}>
            <StatCard color="warning">
              <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: isMobile ? '0.6rem' : '0.75rem' }}>
                  Total Distance
                </Typography>
                <Typography variant={isMobile ? "h6" : "h5"} fontWeight={700}>
                  {teamData?.summary?.totalDistance?.toFixed(1) || 0} km
                </Typography>
                <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                  <Route sx={{ fontSize: 14, color: 'text.disabled' }} />
                  <Typography variant="caption" color="text.secondary">
                    Avg {(teamData?.summary?.avgDistance || 0).toFixed(1)} km
                  </Typography>
                </Box>
              </CardContent>
            </StatCard>
          </Grid>

          <Grid item xs={6} md={3}>
            <StatCard color="info">
              <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: isMobile ? '0.6rem' : '0.75rem' }}>
                  Total Visits
                </Typography>
                <Typography variant={isMobile ? "h6" : "h5"} fontWeight={700}>
                  {teamData?.summary?.totalVisits || 0}
                </Typography>
                <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                  <Assessment sx={{ fontSize: 14, color: 'text.disabled' }} />
                  <Typography variant="caption" color="text.secondary">
                    {teamData?.summary?.completionRate || 0}% completed
                  </Typography>
                </Box>
              </CardContent>
            </StatCard>
          </Grid>
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <GlassPaper sx={{ p: isMobile ? 2 : 3, borderRadius: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
                <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight={700}>
                  Performance Overview
                </Typography>
                <Stack direction="row" spacing={1}>
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
              </Stack>
              <Box sx={{ height: isMobile ? 250 : 300 }}>
                {performanceChartData ? (
                  chartType === 'bar' ? (
                    <Bar data={performanceChartData} options={chartOptions} />
                  ) : (
                    <Line data={performanceChartData} options={chartOptions} />
                  )
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
              <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight={700} mb={2}>
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
              <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight={700} mb={2}>
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
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={1}>
            <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight={700}>
              Team Members
            </Typography>
            {!isMobile && (
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  startIcon={<FilterAlt />}
                  onClick={(e) => setFilterAnchor(e.currentTarget)}
                >
                  Filter
                </Button>
                <Button
                  size="small"
                  startIcon={<SwapVert />}
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  Sort {sortOrder === 'asc' ? '↑' : '↓'}
                </Button>
              </Stack>
            )}
          </Stack>

          {/* Grid View */}
          {viewMode === 'grid' && (
            <Grid container spacing={isMobile ? 1.5 : 2}>
              {paginatedMembers.length > 0 ? (
                paginatedMembers.map((member) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={member.id}>
                    {isMobile ? (
                      renderMobileMemberCard(member)
                    ) : (
                      <MemberCard 
                        isSelected={selectedMember?.id === member.id}
                        onClick={() => handleMemberSelect(member)}
                      >
                        <CardContent>
                          <Box display="flex" alignItems="center" gap={2} mb={2}>
                            <Badge
                              overlap="circular"
                              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                              badgeContent={
                                <OnlineIndicator isOnline={member.isOnline} />
                              }
                            >
                              <Avatar sx={{ bgcolor: PRIMARY, width: 48, height: 48 }}>
                                {member.firstName?.[0] || ''}{member.lastName?.[0] || ''}
                              </Avatar>
                            </Badge>
                            <Box flex={1} minWidth={0}>
                              <Typography variant="subtitle2" fontWeight={700} noWrap>
                                {member.name || 'Unknown'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block" noWrap>
                                {member.employeeId || member.email || 'No ID'}
                              </Typography>
                            </Box>
                            <StatusChip
                              label={member.dutyStatus || 'OFF DUTY'}
                              status={member.dutyStatus || 'OFF DUTY'}
                              size="small"
                            />
                          </Box>

                          <Stack spacing={1} sx={{ mb: 2 }}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Route fontSize="small" sx={{ color: 'text.secondary' }} />
                              <Typography variant="body2">
                                <strong>{member.distance?.toFixed(1) || 0} km</strong> today
                              </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Assessment fontSize="small" sx={{ color: 'text.secondary' }} />
                              <Typography variant="body2">
                                <strong>{member.visits?.completed || 0}/{member.visits?.total || 0}</strong> visits
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={(member.visits?.completed / (member.visits?.total || 1)) * 100}
                              sx={{ height: 6, borderRadius: 3 }}
                            />
                          </Stack>

                          <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Box display="flex" alignItems="center" gap={0.5} sx={{ maxWidth: '60%' }}>
                              <LocationOn fontSize="small" sx={{ color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary" noWrap>
                                {member.lastKnownLocation?.address || 'No location'}
                              </Typography>
                            </Box>
                            <Box display="flex" gap={0.5}>
                              <Tooltip title="View on Map">
                                <IconButton size="small" onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewOnMap(member);
                                }}>
                                  <Map fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="View Details">
                                <IconButton size="small" onClick={(e) => {
                                  e.stopPropagation();
                                  handleMemberSelect(member);
                                }}>
                                  <Visibility fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        </CardContent>
                      </MemberCard>
                    )}
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <People sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                    <Typography color="text.secondary">No members found</Typography>
                    <Button
                      variant="outlined"
                      onClick={handleClearFilters}
                      sx={{ mt: 2 }}
                    >
                      Clear Filters
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}

          {/* List View - Desktop Only */}
          {viewMode === 'list' && !isMobile && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <TableSortLabel
                        active={sortBy === 'name'}
                        direction={sortBy === 'name' ? sortOrder : 'asc'}
                        onClick={() => handleSort('name')}
                      >
                        Member
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortBy === 'distance'}
                        direction={sortBy === 'distance' ? sortOrder : 'asc'}
                        onClick={() => handleSort('distance')}
                      >
                        Distance
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortBy === 'visits'}
                        direction={sortBy === 'visits' ? sortOrder : 'asc'}
                        onClick={() => handleSort('visits')}
                      >
                        Visits
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Last Known</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedMembers.map((member) => (
                    <TableRow 
                      key={member.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleMemberSelect(member)}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            badgeContent={
                              <OnlineIndicator isOnline={member.isOnline} />
                            }
                          >
                            <Avatar sx={{ bgcolor: PRIMARY, width: 32, height: 32 }}>
                              {member.firstName?.[0] || ''}
                            </Avatar>
                          </Badge>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {member.name || 'Unknown'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {member.email || 'No email'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <StatusChip
                          label={member.dutyStatus || 'OFF DUTY'}
                          status={member.dutyStatus || 'OFF DUTY'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {member.distance?.toFixed(1) || 0} km
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {member.visits?.completed || 0}/{member.visits?.total || 0}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={(member.visits?.completed / (member.visits?.total || 1)) * 100}
                            sx={{ height: 4, borderRadius: 2, width: 80 }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {member.lastKnownLocation?.time || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View on Map">
                          <IconButton size="small" onClick={(e) => {
                            e.stopPropagation();
                            handleViewOnMap(member);
                          }}>
                            <Map fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={(e) => {
                            e.stopPropagation();
                            handleMemberSelect(member);
                          }}>
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
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
                Showing {page * rowsPerPage + 1} to {Math.min((page + 1) * rowsPerPage, filteredMembers.length)} of {filteredMembers.length}
              </Typography>
              <Pagination
                count={Math.ceil(filteredMembers.length / rowsPerPage)}
                page={page + 1}
                onChange={(e, val) => setPage(val - 1)}
                color="primary"
                size={isMobile ? "small" : "medium"}
                sx={{
                  '& .MuiPaginationItem-root': {
                    borderRadius: 2,
                    '&.Mui-selected': { bgcolor: PRIMARY, color: '#fff' }
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
          PaperProps={{ 
            sx: { 
              width: 320, 
              p: 2,
              borderRadius: 2,
              mt: 1
            } 
          }}
        >
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
            Filter Members
          </Typography>

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Account Status</InputLabel>
            <Select
              value={filters.status}
              label="Account Status"
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Duty Status</InputLabel>
            <Select
              value={filters.dutyStatus}
              label="Duty Status"
              onChange={(e) => setFilters({ ...filters, dutyStatus: e.target.value })}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="ON DUTY">On Duty</MenuItem>
              <MenuItem value="HALF DAY">Half Day</MenuItem>
              <MenuItem value="OFF DUTY">Off Duty</MenuItem>
              <MenuItem value="INACTIVE">Inactive</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Online Status</InputLabel>
            <Select
              value={filters.online}
              label="Online Status"
              onChange={(e) => setFilters({ ...filters, online: e.target.value })}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="online">Online</MenuItem>
              <MenuItem value="offline">Offline</MenuItem>
            </Select>
          </FormControl>

          <Box display="flex" gap={1} sx={{ mt: 2 }}>
            <Button fullWidth variant="outlined" onClick={handleClearFilters}>
              Clear
            </Button>
            <Button fullWidth variant="contained" onClick={() => setFilterAnchor(null)}>
              Apply
            </Button>
          </Box>
        </Menu>

        {/* Mobile Filter Drawer */}
        {renderMobileFilterDrawer()}

        {/* Member Details Dialog */}
        <Dialog
          open={!!selectedMember}
          onClose={handleCloseDetails}
          maxWidth="md"
          fullWidth
          fullScreen={isMobile}
          PaperProps={{
            sx: {
              borderRadius: isMobile ? 0 : 3
            }
          }}
        >
          {selectedMember && (
            <>
              <DialogTitle sx={{ 
                borderBottom: '1px solid', 
                borderColor: 'divider', 
                p: 2,
                bgcolor: isMobile ? PRIMARY : 'transparent',
                color: isMobile ? 'white' : 'inherit'
              }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" fontWeight={700}>
                    Member Details
                  </Typography>
                  <IconButton onClick={handleCloseDetails} sx={{ color: isMobile ? 'white' : 'inherit' }}>
                    <Close />
                  </IconButton>
                </Stack>
              </DialogTitle>

              <DialogContent sx={{ p: isMobile ? 2 : 3 }}>
                {detailsLoading ? (
                  <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
                    <CircularProgress sx={{ color: PRIMARY }} />
                    <Typography>Loading details...</Typography>
                  </Stack>
                ) : (
                  <Stack spacing={3}>
                    {/* Member Info */}
                    <Box display="flex" alignItems="center" gap={3} flexWrap="wrap">
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                          <OnlineIndicator isOnline={selectedMember.isOnline} />
                        }
                      >
                        <Avatar sx={{ bgcolor: PRIMARY, width: 80, height: 80 }}>
                          {selectedMember.firstName?.[0] || ''}{selectedMember.lastName?.[0] || ''}
                        </Avatar>
                      </Badge>
                      <Box flex={1}>
                        <Typography variant={isMobile ? "h6" : "h5"} fontWeight={700}>
                          {selectedMember.name || 'Unknown'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {selectedMember.email || 'No email'} • {selectedMember.phoneNumber || 'No phone'}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                          <StatusChip label={selectedMember.dutyStatus || 'OFF DUTY'} status={selectedMember.dutyStatus || 'OFF DUTY'} size="small" />
                          <Chip label={selectedMember.role || 'Unknown'} size="small" variant="outlined" />
                          <Chip 
                            icon={selectedMember.isOnline ? <Wifi /> : <WifiOff />}
                            label={selectedMember.isOnline ? 'Online' : 'Offline'}
                            size="small"
                            color={selectedMember.isOnline ? 'success' : 'default'}
                          />
                        </Box>
                      </Box>
                    </Box>

                    <Divider />

                    {/* Stats Grid */}
                    <Grid container spacing={2}>
                      <Grid item xs={6} md={3}>
                        <Paper sx={{ p: 2, bgcolor: alpha(PRIMARY, 0.05), borderRadius: 2 }}>
                          <Typography variant="caption" color="text.secondary">Total Distance</Typography>
                          <Typography variant="h6" fontWeight={700}>
                            {selectedMember.distance?.toFixed(1) || 0} km
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Paper sx={{ p: 2, bgcolor: alpha(SUCCESS, 0.05), borderRadius: 2 }}>
                          <Typography variant="caption" color="text.secondary">Completed Visits</Typography>
                          <Typography variant="h6" fontWeight={700}>
                            {selectedMember.visits?.completed || 0}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Paper sx={{ p: 2, bgcolor: alpha(WARNING, 0.05), borderRadius: 2 }}>
                          <Typography variant="caption" color="text.secondary">In Progress</Typography>
                          <Typography variant="h6" fontWeight={700}>
                            {selectedMember.visits?.inProgress || 0}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Paper sx={{ p: 2, bgcolor: alpha(ERROR, 0.05), borderRadius: 2 }}>
                          <Typography variant="caption" color="text.secondary">Cancelled</Typography>
                          <Typography variant="h6" fontWeight={700}>
                            {selectedMember.visits?.cancelled || 0}
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>

                    {/* Current Location */}
                    {selectedMember.lastKnownLocation && (
                      <Paper sx={{ p: 2, bgcolor: alpha(INFO, 0.05), borderRadius: 2 }}>
                        <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                          Current Location
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          {selectedMember.lastKnownLocation.address || 'Address not available'}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={2} mt={1} flexWrap="wrap">
                          <Chip
                            icon={<MyLocation />}
                            label={`${selectedMember.lastKnownLocation.coordinates?.lat?.toFixed(6) || 'N/A'}, ${selectedMember.lastKnownLocation.coordinates?.lng?.toFixed(6) || 'N/A'}`}
                            size="small"
                            variant="outlined"
                          />
                          <Typography variant="caption" color="text.secondary">
                            Updated {selectedMember.lastKnownLocation.time || 'N/A'}
                          </Typography>
                        </Box>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Map />}
                          onClick={() => handleViewOnMap(selectedMember)}
                          sx={{ mt: 2 }}
                        >
                          View on Map
                        </Button>
                      </Paper>
                    )}

                    {/* Recent Visits */}
                    {selectedMember.recentVisits?.length > 0 && (
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                          Recent Visits
                        </Typography>
                        <Stack spacing={2}>
                          {selectedMember.recentVisits.map((visit) => (
                            <Paper key={visit.id} sx={{ p: 2, bgcolor: alpha(PRIMARY, 0.02), borderRadius: 2 }}>
                              <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                                <Box>
                                  <Typography variant="subtitle2" fontWeight={600}>
                                    {visit.locationName || 'Unknown'}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {visit.time || 'N/A'}
                                  </Typography>
                                </Box>
                                <VisitStatusChip label={visit.status || 'Unknown'} status={visit.status || 'Unknown'} size="small" />
                              </Stack>
                              {visit.distance > 0 && (
                                <Box display="flex" alignItems="center" gap={1} mt={1}>
                                  <Route sx={{ fontSize: 14, color: 'text.disabled' }} />
                                  <Typography variant="caption">
                                    {visit.distance.toFixed(1)} km from previous
                                  </Typography>
                                </Box>
                              )}
                            </Paper>
                          ))}
                        </Stack>
                      </Box>
                    )}

                    {/* Supervisor Info */}
                    {selectedMember.supervisor && (
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                          Reports To
                        </Typography>
                        <Paper sx={{ p: 2, bgcolor: alpha(INFO, 0.05), borderRadius: 2 }}>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar sx={{ bgcolor: INFO }}>
                              {selectedMember.supervisor.name?.[0] || 'S'}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" fontWeight={600}>
                                {selectedMember.supervisor.name || 'Unknown'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {selectedMember.supervisor.email || 'No email'} • {selectedMember.supervisor.role || 'Unknown'}
                              </Typography>
                            </Box>
                          </Box>
                        </Paper>
                      </Box>
                    )}
                  </Stack>
                )}
              </DialogContent>
              {isMobile && (
                <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Button fullWidth variant="contained" onClick={handleCloseDetails}>
                    Close
                  </Button>
                </DialogActions>
              )}
            </>
          )}
        </Dialog>

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
              <ListItem button onClick={() => { setDrawerOpen(false); navigate('/'); }}>
                <ListItemIcon><Dashboard /></ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItem>
              <ListItem button onClick={() => { setDrawerOpen(false); navigate('/total-visits'); }}>
                <ListItemIcon><History /></ListItemIcon>
                <ListItemText primary="Visits" />
              </ListItem>
              <ListItem button onClick={() => { setDrawerOpen(false); navigate('/visit-route'); }}>
                <ListItemIcon><Map /></ListItemIcon>
                <ListItemText primary="Route History" />
              </ListItem>
              <ListItem button onClick={() => { setDrawerOpen(false); }}>
                <ListItemIcon><People /></ListItemIcon>
                <ListItemText primary="Team Performance" />
              </ListItem>
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
          <Paper
            sx={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              borderRadius: 0,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              zIndex: 100
            }}
            elevation={3}
          >
            <BottomNavigation
              showLabels
              value={0}
              onChange={(e, newValue) => {
                if (newValue === 0) navigate('/');
                if (newValue === 1) navigate('/total-visits');
                if (newValue === 2) navigate('/visit-route');
              }}
            >
              <BottomNavigationAction label="Home" icon={<Dashboard />} />
              <BottomNavigationAction label="Visits" icon={<History />} />
              <BottomNavigationAction label="Map" icon={<Map />} />
            </BottomNavigation>
          </Paper>
        )}

        {/* Refresh Indicator */}
        <Backdrop
          sx={{ color: '#fff', zIndex: theme.zIndex.drawer + 1 }}
          open={refreshing}
        >
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
            sx={{ 
              borderRadius: 2,
              width: '100%'
            }}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}