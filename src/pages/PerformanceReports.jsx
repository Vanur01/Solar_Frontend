// components/TeamPerformanceDashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
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
  ToggleButton,styled,
  ToggleButtonGroup,
  Collapse,Dialog,DialogTitle,DialogContent,
  Fade,
  Grow
} from '@mui/material';
import {
  Search,
  FilterList,
  Download,
  Refresh,
  MoreVert,
  Visibility,
  Edit,
  Delete,
  Person,
  Group,
  TrendingUp,
  TrendingDown,
  AccessTime,
  LocationOn,
  Email,
  Phone,
  CalendarToday,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Cancel,
  PlayArrow,
  Pause,
  Speed,
  Route,
  Assessment,
  BarChart,
  PieChart,
  Timeline,
  ShowChart,
  Map,
  GridView,
  ListAlt,
  Sort,
  ArrowUpward,
  ArrowDownward,
  Close,
  Fullscreen,
  FullscreenExit,
  Print,
  Share
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
import { format, subDays, isToday, isYesterday, differenceInMinutes } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';

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

// ========== STYLED COMPONENTS ==========
const GlassPaper = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
}));

const StatCard = styled(Card)(({ theme, color = 'primary' }) => ({
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: `linear-gradient(90deg, ${theme.palette[color].main}, ${alpha(theme.palette[color].main, 0.5)})`
  }
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
  const colors = {
    'ON DUTY': { bg: alpha('#4caf50', 0.1), color: '#4caf50', icon: PlayArrow },
    'HALF DAY': { bg: alpha('#ff9800', 0.1), color: '#ff9800', icon: Pause },
    'COMPLETED': { bg: alpha('#2196f3', 0.1), color: '#2196f3', icon: CheckCircle },
    'OFF DUTY': { bg: alpha('#9e9e9e', 0.1), color: '#9e9e9e', icon: Cancel },
    'INACTIVE': { bg: alpha('#f44336', 0.1), color: '#f44336', icon: ErrorIcon }
  };
  const style = colors[status] || colors['OFF DUTY'];
  const Icon = style.icon;

  return {
    backgroundColor: style.bg,
    color: style.color,
    fontWeight: 600,
    '& .MuiChip-icon': {
      color: style.color
    }
  };
});

const VisitStatusChip = styled(Chip)(({ theme, status }) => {
  const colors = {
    'Completed': { bg: alpha('#4caf50', 0.1), color: '#4caf50' },
    'InProgress': { bg: alpha('#ff9800', 0.1), color: '#ff9800' },
    'Cancelled': { bg: alpha('#f44336', 0.1), color: '#f44336' },
    'Scheduled': { bg: alpha('#2196f3', 0.1), color: '#2196f3' }
  };
  const style = colors[status] || colors['Scheduled'];

  return {
    backgroundColor: style.bg,
    color: style.color,
    fontWeight: 600,
    fontSize: '0.7rem',
    height: 20
  };
});

const MemberCard = styled(Card)(({ theme, isSelected }) => ({
  borderRadius: theme.spacing(2),
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  border: isSelected ? `2px solid ${theme.palette.primary.main}` : '1px solid transparent',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8]
  }
}));

// ========== MAIN COMPONENT ==========
export default function TeamPerformanceDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const { fetchAPI, user } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [teamData, setTeamData] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberDetails, setMemberDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [chartType, setChartType] = useState('bar'); // bar, line, pie
  const [timeRange, setTimeRange] = useState('week'); // day, week, month
  const [sortBy, setSortBy] = useState('distance');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    dutyStatus: 'all'
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [expandedStats, setExpandedStats] = useState(false);

  // Fetch team performance data
  useEffect(() => {
    fetchTeamPerformance();
  }, []);

  const fetchTeamPerformance = async () => {
    try {
      setLoading(true);
      const response = await fetchAPI('/visit/team-performance');
      if (response.success && response.result) {
        setTeamData(response.result);
      } else {
        showSnackbar('Failed to fetch team performance', 'error');
      }
    } catch (error) {
      console.error('Error fetching team performance:', error);
      showSnackbar('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch member details
  const fetchMemberDetails = async (memberId) => {
    try {
      setDetailsLoading(true);
      const response = await fetchAPI(`/visit/team-member/${memberId}/performance`);
      if (response.success && response.result) {
        setMemberDetails(response.result);
      }
    } catch (error) {
      console.error('Error fetching member details:', error);
    } finally {
      setDetailsLoading(false);
    }
  };

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
    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phoneNumber.includes(searchTerm)
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

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case 'name':
          aVal = a.name;
          bVal = b.name;
          break;
        case 'distance':
          aVal = a.distance;
          bVal = b.distance;
          break;
        case 'visits':
          aVal = a.visits.completed;
          bVal = b.visits.completed;
          break;
        case 'status':
          aVal = a.dutyStatus;
          bVal = b.dutyStatus;
          break;
        default:
          aVal = a.distance;
          bVal = b.distance;
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
    if (!teamData?.teamMembers) return null;

    const labels = teamData.teamMembers.map(m => m.name.split(' ')[0]);
    const distances = teamData.teamMembers.map(m => m.distance);
    const completedVisits = teamData.teamMembers.map(m => m.visits.completed);
    const totalVisits = teamData.teamMembers.map(m => m.visits.total);

    return {
      labels,
      datasets: [
        {
          label: 'Distance (km)',
          data: distances,
          backgroundColor: alpha(theme.palette.primary.main, 0.6),
          borderColor: theme.palette.primary.main,
          borderWidth: 1,
          yAxisID: 'y',
        },
        {
          label: 'Completed Visits',
          data: completedVisits,
          backgroundColor: alpha(theme.palette.success.main, 0.6),
          borderColor: theme.palette.success.main,
          borderWidth: 1,
          yAxisID: 'y1',
        }
      ]
    };
  }, [teamData, theme]);

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Distance (km)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Visits'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  // Status distribution chart data
  const statusChartData = useMemo(() => {
    if (!teamData?.summary) return null;

    return {
      labels: ['ON DUTY', 'HALF DAY', 'COMPLETED', 'OFF DUTY', 'INACTIVE'],
      datasets: [
        {
          data: [
            teamData.summary.onDuty,
            teamData.summary.completed || 0,
            teamData.summary.onDuty ? 0 : 0, // You may need to adjust this
            teamData.summary.inactiveMembers || 0,
          ],
          backgroundColor: [
            alpha('#4caf50', 0.8),
            alpha('#ff9800', 0.8),
            alpha('#2196f3', 0.8),
            alpha('#9e9e9e', 0.8),
            alpha('#f44336', 0.8),
          ],
          borderWidth: 0,
        },
      ],
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
            teamData.summary.completedVisits,
            teamData.summary.inProgressVisits,
            (teamData.summary.totalVisits - teamData.summary.completedVisits - teamData.summary.inProgressVisits)
          ],
          backgroundColor: [
            alpha('#4caf50', 0.8),
            alpha('#ff9800', 0.8),
            alpha('#f44336', 0.8),
          ],
          borderWidth: 0,
        },
      ],
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

  const handleExport = () => {
    const dataStr = JSON.stringify(teamData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `team-performance-${format(new Date(), 'yyyy-MM-dd')}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    showSnackbar('Data exported successfully');
  };

  const handleRefresh = () => {
    fetchTeamPerformance();
    showSnackbar('Data refreshed');
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
          <Grid item xs={12}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }} spacing={2}>
            <Box>
              <Typography variant="h5" fontWeight={800} sx={{ color: theme.palette.primary.main }}>
                Team Performance Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {format(new Date(), 'EEEE, MMMM d, yyyy')} • {teamData?.teamMembers?.length || 0} team members
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
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
                sx={{ width: 200 }}
              />
              <IconButton onClick={(e) => setFilterAnchor(e.currentTarget)}>
                <FilterList />
              </IconButton>
              <IconButton onClick={handleExport}>
                <Download />
              </IconButton>
              <IconButton onClick={handleRefresh}>
                <Refresh />
              </IconButton>
            </Stack>
          </Stack>

          {/* Quick Stats */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary">Total Members</Typography>
                <Typography variant="h5" fontWeight={700}>{teamData?.summary?.totalMembers || 0}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.success.main, 0.05), borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary">Active Members</Typography>
                <Typography variant="h5" fontWeight={700}>{teamData?.summary?.activeMembers || 0}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.warning.main, 0.05), borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary">Total Distance</Typography>
                <Typography variant="h5" fontWeight={700}>{teamData?.summary?.totalDistance?.toFixed(1)} km</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary">Total Visits</Typography>
                <Typography variant="h5" fontWeight={700}>{teamData?.summary?.totalVisits || 0}</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Paper>

        {/* Charts Section */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={700}>
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
                  <ToggleButtonGroup
                    size="small"
                    value={timeRange}
                    exclusive
                    onChange={(e, val) => val && setTimeRange(val)}
                  >
                    <ToggleButton value="day">Day</ToggleButton>
                    <ToggleButton value="week">Week</ToggleButton>
                    <ToggleButton value="month">Month</ToggleButton>
                  </ToggleButtonGroup>
                </Stack>
              </Stack>
              <Box sx={{ height: 300 }}>
                {performanceChartData && chartType === 'bar' && (
                  <Bar data={performanceChartData} options={chartOptions} />
                )}
                {performanceChartData && chartType === 'line' && (
                  <Line data={performanceChartData} options={chartOptions} />
                )}
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Status Distribution
              </Typography>
              <Box sx={{ height: 200, mb: 2 }}>
                {statusChartData && (
                  <Pie data={statusChartData} options={{ maintainAspectRatio: false }} />
                )}
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" fontWeight={700} mb={2}>
                Visit Status
              </Typography>
              <Box sx={{ height: 200 }}>
                {visitStatusChartData && (
                  <Doughnut data={visitStatusChartData} options={{ maintainAspectRatio: false }} />
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Team Members Section */}
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight={700}>
              Team Members
            </Typography>
            <Stack direction="row" spacing={1}>
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
              <IconButton size="small" onClick={() => setExpandedStats(!expandedStats)}>
                {expandedStats ? <ArrowUpward /> : <ArrowDownward />}
              </IconButton>
            </Stack>
          </Stack>

          {/* Grid View */}
          {viewMode === 'grid' && (
            <Grid container spacing={2}>
              {paginatedMembers.map((member) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={member.id}>
                  <MemberCard 
                    isSelected={selectedMember?.id === member.id}
                    onClick={() => handleMemberSelect(member)}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 48, height: 48 }}>
                          {member.firstName[0]}{member.lastName[0]}
                        </Avatar>
                        <Box flex={1}>
                          <Typography variant="subtitle1" fontWeight={700} noWrap>
                            {member.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block" noWrap>
                            {member.employeeId}
                          </Typography>
                        </Box>
                        <StatusChip
                          label={member.dutyStatus}
                          status={member.dutyStatus}
                          size="small"
                        />
                      </Box>

                      <Stack spacing={1} sx={{ mb: 2 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Route fontSize="small" sx={{ color: 'text.secondary' }} />
                          <Typography variant="body2">
                            <strong>{member.distance} km</strong> today
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Assessment fontSize="small" sx={{ color: 'text.secondary' }} />
                          <Typography variant="body2">
                            <strong>{member.visits.completed}/{member.visits.total}</strong> visits
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(member.visits.completed / (member.visits.total || 1)) * 100}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Stack>

                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <LocationOn fontSize="small" sx={{ color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 120 }}>
                            {member.lastKnownLocation.address || 'No location'}
                          </Typography>
                        </Box>
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={(e) => {
                            e.stopPropagation();
                            handleMemberSelect(member);
                          }}>
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </CardContent>
                  </MemberCard>
                </Grid>
              ))}
            </Grid>
          )}

          {/* List View */}
          {viewMode === 'list' && (
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
                          <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 32, height: 32 }}>
                            {member.firstName[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {member.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {member.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <StatusChip
                          label={member.dutyStatus}
                          status={member.dutyStatus}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {member.distance} km
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {member.visits.completed}/{member.visits.total}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={(member.visits.completed / (member.visits.total || 1)) * 100}
                            sx={{ height: 4, borderRadius: 2, width: 80 }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {member.lastKnownLocation.time}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={(e) => {
                          e.stopPropagation();
                          handleMemberSelect(member);
                        }}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Pagination */}
          <TablePagination
            component="div"
            count={filteredMembers.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Paper>

        {/* Member Details Dialog */}
        <MemberDetailsDialog
          open={!!selectedMember}
          onClose={handleCloseDetails}
          member={selectedMember}
          details={memberDetails}
          loading={detailsLoading}
        />

        {/* Filter Menu */}
        <Menu
          anchorEl={filterAnchor}
          open={Boolean(filterAnchor)}
          onClose={() => setFilterAnchor(null)}
          PaperProps={{ sx: { width: 280, p: 2 } }}
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
              <MenuItem value="COMPLETED">Completed</MenuItem>
              <MenuItem value="OFF DUTY">Off Duty</MenuItem>
              <MenuItem value="INACTIVE">Inactive</MenuItem>
            </Select>
          </FormControl>

          <Button
            fullWidth
            variant="contained"
            onClick={() => setFilterAnchor(null)}
          >
            Apply Filters
          </Button>
        </Menu>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}

// ========== MEMBER DETAILS DIALOG ==========
const MemberDetailsDialog = ({ open, onClose, member, details, loading }) => {
  const theme = useTheme();

  if (!member) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider', p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={700}>
            Member Details
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {loading ? (
          <Stack spacing={2}>
            <Skeleton variant="rectangular" height={100} />
            <Skeleton variant="rectangular" height={200} />
          </Stack>
        ) : (
          <Stack spacing={3}>
            {/* Member Info */}
            <Box display="flex" alignItems="center" gap={3}>
              <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 80, height: 80 }}>
                {member.firstName[0]}{member.lastName[0]}
              </Avatar>
              <Box flex={1}>
                <Typography variant="h5" fontWeight={700}>
                  {member.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {member.email} • {member.phoneNumber}
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <StatusChip label={member.dutyStatus} status={member.dutyStatus} size="small" />
                  <Chip label={member.role} size="small" variant="outlined" />
                </Box>
              </Box>
            </Box>

            <Divider />

            {/* Stats Grid */}
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Total Distance</Typography>
                  <Typography variant="h6" fontWeight={700}>{member.distance} km</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} md={3}>
                <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.success.main, 0.05), borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Completed Visits</Typography>
                  <Typography variant="h6" fontWeight={700}>{member.visits.completed}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} md={3}>
                <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.warning.main, 0.05), borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">In Progress</Typography>
                  <Typography variant="h6" fontWeight={700}>{member.visits.inProgress}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} md={3}>
                <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.error.main, 0.05), borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Cancelled</Typography>
                  <Typography variant="h6" fontWeight={700}>{member.visits.cancelled}</Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Recent Visits */}
            <Box>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Recent Visits
              </Typography>
              <Stack spacing={2}>
                {member.recentVisits?.map((visit) => (
                  <Paper key={visit.id} sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.02), borderRadius: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {visit.locationName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {visit.time}
                        </Typography>
                      </Box>
                      <VisitStatusChip label={visit.status} status={visit.status} size="small" />
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Box>

            {/* Supervisor Info */}
            {member.supervisor && (
              <Box>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                  Reports To
                </Typography>
                <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                      {member.supervisor.name[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {member.supervisor.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {member.supervisor.email} • {member.supervisor.role}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Box>
            )}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
};