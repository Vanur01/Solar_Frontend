import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Chip,
  Avatar,
  IconButton,
  Stack,
  Divider,
  Card,
  CardContent,
  LinearProgress,
  Button,
  useTheme,
  useMediaQuery,DialogActions,
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
  Tooltip,
  Fade,
  Zoom,
  Grow,
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
  TablePagination,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Collapse,
  Tab,
  Tabs,
  Fab
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  CalendarToday,
  ChevronLeft,
  ChevronRight,
  AccessTime,
  TrendingUp,
  TrendingDown,
  Person,
  Work,
  CheckCircle,
  Warning,
  Error,
  Info,
  Weekend,
  EventBusy,
  WatchLater,
  Schedule,
  Visibility,
  Edit,
  Delete,
  Login,
  Logout,
  LocationOn,
  PhotoCamera,
  Close,
  History,
  Dashboard,
  Group,
  AdminPanelSettings,
  PhotoLibrary,
  ArrowBack,
  ArrowForward,
  People,
  DateRange,
  ExpandMore,
  ExpandLess,
  Search,
  FilterList,
  Download,
  Print,
  Add
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useAttendance } from '../hooks/useAttendance';
import PunchInOut from './PunchInOut';
import AttendanceDetails from './AttendanceDetails';
import TeamAttendance from './TeamAttendance';

const GlassCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  borderRadius: 20,
}));

const CalendarCell = styled(Box)(({ theme, isSelected, isToday, isWeekend, status }) => ({
  height: 48,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 12,
  fontSize: '0.875rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  backgroundColor: isSelected 
    ? theme.palette.primary.main 
    : isToday 
    ? alpha(theme.palette.primary.main, 0.1)
    : status === 'present'
    ? alpha('#4caf50', 0.1)
    : status === 'absent'
    ? alpha('#f44336', 0.1)
    : status === 'late'
    ? alpha('#ff9800', 0.1)
    : status === 'holiday'
    ? alpha('#2196f3', 0.1)
    : status === 'leave'
    ? alpha('#9c27b0', 0.1)
    : 'transparent',
  color: isSelected 
    ? '#fff' 
    : isToday 
    ? theme.palette.primary.main
    : status === 'present'
    ? '#4caf50'
    : status === 'absent'
    ? '#f44336'
    : status === 'late'
    ? '#ff9800'
    : status === 'holiday'
    ? '#2196f3'
    : status === 'leave'
    ? '#9c27b0'
    : isWeekend 
    ? theme.palette.text.secondary 
    : theme.palette.text.primary,
  border: isToday && !isSelected ? `2px solid ${theme.palette.primary.main}` : 'none',
  '&:hover': {
    backgroundColor: isSelected ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.1),
    transform: 'scale(1.05)',
  }
}));

const StatCard = ({ icon: Icon, label, value, trend, color = '#4569ea', loading }) => {
  if (loading) {
    return (
      <Paper sx={{ p: 2.5, borderRadius: 3 }}>
        <Stack spacing={2}>
          <Skeleton variant="circular" width={48} height={48} />
          <Skeleton variant="text" width={80} height={20} />
          <Skeleton variant="text" width={60} height={32} />
        </Stack>
      </Paper>
    );
  }

  return (
    <Zoom in timeout={500}>
      <Paper
        sx={{
          p: 2.5,
          borderRadius: 3,
          bgcolor: 'white',
          border: `1px solid ${alpha(color, 0.1)}`,
          height: '100%',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 12px 40px ${alpha(color, 0.15)}`,
          }
        }}
      >
        <Stack spacing={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Avatar sx={{ bgcolor: alpha(color, 0.1), color, width: 48, height: 48 }}>
              <Icon />
            </Avatar>
            {trend && (
              <Chip
                icon={trend.direction === 'up' ? <TrendingUp /> : <TrendingDown />}
                label={trend.value}
                size="small"
                sx={{
                  bgcolor: alpha(trend.direction === 'up' ? '#4caf50' : '#f44336', 0.1),
                  color: trend.direction === 'up' ? '#4caf50' : '#f44336',
                  fontWeight: 600
                }}
              />
            )}
          </Box>
          
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              {label}
            </Typography>
            <Typography variant="h4" fontWeight={800} sx={{ color, mt: 0.5 }}>
              {value}
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Zoom>
  );
};

const LogEntryCard = ({ entry, onView }) => {
  const theme = useTheme();
  const isActive = !entry.punchOut?.time;
  const date = new Date(entry.date);

  const getStatusColor = (status) => {
    const colors = {
      present: '#4caf50',
      absent: '#f44336',
      late: '#ff9800',
      leave: '#9c27b0',
      holiday: '#2196f3'
    };
    return colors[status] || '#4caf50';
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Grow in timeout={500}>
      <Paper
        sx={{
          p: 2.5,
          mb: 2,
          borderRadius: 3,
          border: '1px solid',
          borderColor: isActive ? theme.palette.primary.main : 'divider',
          bgcolor: isActive ? alpha(theme.palette.primary.main, 0.02) : 'background.paper',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
            borderColor: theme.palette.primary.main,
          }
        }}
        onClick={() => onView(entry)}
      >
        <Stack spacing={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={1.5}>
              <Box
                sx={{
                  bgcolor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'action.hover',
                  borderRadius: 2,
                  p: 1.5,
                  minWidth: 60,
                  textAlign: 'center',
                }}
              >
                <Typography variant="caption" fontWeight={700} color={isActive ? 'primary' : 'text.secondary'}>
                  {date.toLocaleString('default', { month: 'short' }).toUpperCase()}
                </Typography>
                <Typography variant="h5" fontWeight={800} lineHeight={1} color={isActive ? 'primary' : 'text.primary'}>
                  {date.getDate()}
                </Typography>
              </Box>
              <Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {date.toLocaleDateString('en-US', { weekday: 'long' })}
                  </Typography>
                  {isActive && entry.punchIn && !entry.punchOut && (
                    <Chip
                      label="Active"
                      size="small"
                      sx={{
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        color: theme.palette.success.main,
                        fontWeight: 700,
                        height: 20,
                        fontSize: 10
                      }}
                    />
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {entry.user?.name || 'Regular Working Day'}
                </Typography>
              </Box>
            </Box>
            <Chip
              label={entry.status}
              size="small"
              sx={{
                bgcolor: alpha(getStatusColor(entry.status), 0.1),
                color: getStatusColor(entry.status),
                fontWeight: 700
              }}
            />
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Punch In
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {entry.punchIn?.time ? formatTime(entry.punchIn.time) : '-'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Punch Out
                </Typography>
                <Typography 
                  variant="body2" 
                  fontWeight={700}
                  color={!entry.punchOut?.time ? 'primary' : 'text.primary'}
                >
                  {entry.punchOut?.time ? formatTime(entry.punchOut.time) : 'Ongoing'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Hours
                </Typography>
                <Typography variant="body2" fontWeight={700} color="primary">
                  {entry.workHoursFormatted || '00:00'}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {entry.punchIn?.address && (
            <Box display="flex" alignItems="center" gap={1}>
              <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                {entry.punchIn.address.split(',')[0]}
              </Typography>
            </Box>
          )}
        </Stack>
      </Paper>
    </Grow>
  );
};

export default function Attandance() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, getUserRole } = useAuth();
  const {
    attendances,
    todayAttendance,
    loading,
    error,
    success,
    pagination,
    summary,
    fetchAttendances,
    getMyAttendanceHistory,
    deleteAttendance,
    clearMessages
  } = useAttendance();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('calendar');
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: ''
  });
  const [showPunchModal, setShowPunchModal] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [selectedLog, setSelectedLog] = useState(null);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [showTeamView, setShowTeamView] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [attendanceToDelete, setAttendanceToDelete] = useState(null);

  const userRole = getUserRole();
  const isTeam = userRole === 'TEAM';
  const isASM = userRole === 'ASM';
  const isZSM = userRole === 'ZSM';
  const isHeadOffice = userRole === 'Head_office';
  const canManage = isASM || isZSM || isHeadOffice;
  const canDelete = isHeadOffice;

  useEffect(() => {
    loadData();
  }, [filters.page, filters.limit, filters.status]);

  const loadData = async () => {
    const queryFilters = {
      ...filters,
      ...(isTeam && { userId: user._id })
    };
    await fetchAttendances(queryFilters);
  };

  useEffect(() => {
    if (error) {
      setSnackbar({ open: true, message: error, severity: 'error' });
    }
    if (success) {
      setSnackbar({ open: true, message: success, severity: 'success' });
    }
  }, [error, success]);

  // Calendar functions
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    
    for (let i = 0; i < startingDay; i++) {
      const prevDate = new Date(year, month, -i);
      days.unshift({ day: prevDate.getDate(), prev: true });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const attendance = attendances?.find(a => 
        new Date(a.date).toDateString() === date.toDateString()
      );
      days.push({ 
        day: i, 
        date,
        status: attendance?.status,
        attendance
      });
    }
    
    return days;
  };

  const calendarDays = getDaysInMonth();
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    const attendance = attendances?.find(a => 
      new Date(a.date).toDateString() === date.toDateString()
    );
    if (attendance) {
      setSelectedLog(attendance);
      setLogModalOpen(true);
    }
  };

  const handleStatusChange = (e) => {
    setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }));
  };

  const handlePageChange = (event, value) => {
    setFilters(prev => ({ ...prev, page: value }));
  };

  const handleViewLog = (log) => {
    setSelectedLog(log);
    setLogModalOpen(true);
  };

  const handleDelete = (attendance) => {
    if (canDelete) {
      setAttendanceToDelete(attendance);
      setDeleteDialogOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (attendanceToDelete) {
      const result = await deleteAttendance(attendanceToDelete.id);
      if (result.success) {
        loadData();
      }
      setDeleteDialogOpen(false);
      setAttendanceToDelete(null);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      pb: isMobile ? 7 : 0,
      ml: 3
    }}>
      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
        {/* Header */}
        <Box 
          display="flex" 
          flexDirection={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between" 
          alignItems={{ xs: 'stretch', sm: 'center' }} 
          sx={{ mb: 4 }}
          gap={2}
        >
          <Box>
            <Typography variant="h4" fontWeight={800} sx={{ color: '#4569ea' }}>
              Attendance Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {isTeam ? 'Your Attendance Overview' : 'Team Attendance Management'}
            </Typography>
          </Box>
          
          <Box display="flex" gap={1.5} flexWrap="wrap">
            {canManage && (
              <Button
                variant={showTeamView ? "contained" : "outlined"}
                startIcon={<Group />}
                onClick={() => setShowTeamView(!showTeamView)}
                sx={{ borderRadius: 3, px: 3 }}
              >
                {showTeamView ? 'My Dashboard' : 'Team View'}
              </Button>
            )}
          </Box>
        </Box>

        {showTeamView && canManage ? (
          <TeamAttendance />
        ) : (
          <>
            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={6} sm={3}>
                <StatCard
                  icon={CalendarToday}
                  label="Total Days"
                  value={pagination?.totalItems || 0}
                  trend={{ direction: 'up', value: '+2' }}
                  color="#4569ea"
                  loading={loading}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <StatCard
                  icon={AccessTime}
                  label="Total Hours"
                  value={`${summary?.totalWorkHours?.toFixed(1) || 0}h`}
                  trend={{ direction: 'up', value: '+12.5h' }}
                  color="#2196f3"
                  loading={loading}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <StatCard
                  icon={CheckCircle}
                  label="Present"
                  value={summary?.presentCount || 0}
                  trend={{ direction: 'up', value: '+5' }}
                  color="#4caf50"
                  loading={loading}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <StatCard
                  icon={Warning}
                  label="Late/Absent"
                  value={`${summary?.lateCount || 0}/${summary?.absentCount || 0}`}
                  trend={{ direction: 'down', value: '-2' }}
                  color="#ff9800"
                  loading={loading}
                />
              </Grid>
            </Grid>

            {/* Main Grid */}
            <Grid container spacing={3}>
              {/* Left Column - Calendar */}
              <Grid item xs={12} md={5} lg={4}>
                <GlassCard>
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                      <Typography variant="h6" fontWeight={700}>
                        {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </Typography>
                      <Box display="flex" gap={1}>
                        <IconButton size="small" onClick={handlePrevMonth}>
                          <ChevronLeft />
                        </IconButton>
                        <IconButton size="small" onClick={handleNextMonth}>
                          <ChevronRight />
                        </IconButton>
                      </Box>
                    </Box>

                    <Grid container columns={7} spacing={0.5} sx={{ mb: 1 }}>
                      {daysOfWeek.map((day) => (
                        <Grid item xs={1} key={day}>
                          <Typography 
                            align="center" 
                            variant="caption" 
                            fontWeight={700} 
                            color="text.secondary"
                          >
                            {day}
                          </Typography>
                        </Grid>
                      ))}
                    </Grid>

                    <Grid container columns={7} spacing={0.5}>
                      {calendarDays.map((cell, index) => {
                        const isToday = cell.date && cell.date.toDateString() === new Date().toDateString();
                        const isSelected = cell.date && cell.date.toDateString() === selectedDate.toDateString();
                        const isWeekend = cell.date && (cell.date.getDay() === 0 || cell.date.getDay() === 6);
                        
                        return (
                          <Grid item xs={1} key={index}>
                            <CalendarCell
                              isSelected={isSelected}
                              isToday={isToday}
                              isWeekend={isWeekend}
                              status={cell.status}
                              onClick={() => cell.date && handleDateSelect(cell.date)}
                              sx={{ opacity: cell.prev ? 0.5 : 1 }}
                            >
                              {cell.day}
                            </CalendarCell>
                          </Grid>
                        );
                      })}
                    </Grid>

                    <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                      <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center">
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#4569ea' }} />
                          <Typography variant="caption">Today</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#4caf50' }} />
                          <Typography variant="caption">Present</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#f44336' }} />
                          <Typography variant="caption">Absent</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ff9800' }} />
                          <Typography variant="caption">Late</Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </CardContent>
                </GlassCard>
              </Grid>

              {/* Right Column - Logs */}
              <Grid item xs={12} md={7} lg={8}>
                <GlassCard>
                  <CardContent sx={{ p: 3 }}>
                    <Box 
                      display="flex" 
                      flexDirection={{ xs: 'column', sm: 'row' }}
                      justifyContent="space-between" 
                      alignItems={{ xs: 'stretch', sm: 'center' }}
                      sx={{ mb: 3 }}
                      gap={2}
                    >
                      <Typography variant="h6" fontWeight={700}>
                        Daily Log Entries
                      </Typography>
                      
                      {canManage && (
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <InputLabel>Status</InputLabel>
                          <Select
                            value={filters.status}
                            onChange={handleStatusChange}
                            label="Status"
                            sx={{ borderRadius: 2 }}
                          >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="present">Present</MenuItem>
                            <MenuItem value="absent">Absent</MenuItem>
                            <MenuItem value="late">Late</MenuItem>
                            <MenuItem value="holiday">Holiday</MenuItem>
                            <MenuItem value="leave">Leave</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    </Box>

                    <Box sx={{ maxHeight: 500, overflowY: 'auto', pr: 1 }}>
                      {loading ? (
                        <Box display="flex" justifyContent="center" p={4}>
                          <CircularProgress />
                        </Box>
                      ) : attendances && attendances.length > 0 ? (
                        attendances.map((attendance) => (
                          <LogEntryCard 
                            key={attendance.id} 
                            entry={attendance} 
                            onView={handleViewLog}
                          />
                        ))
                      ) : (
                        <Box textAlign="center" py={4}>
                          <Typography color="text.secondary">
                            No attendance records found
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {pagination && pagination.totalPages > 1 && (
                      <Box display="flex" justifyContent="center" sx={{ mt: 3 }}>
                        <Pagination
                          count={pagination.totalPages}
                          page={filters.page}
                          onChange={handlePageChange}
                          color="primary"
                          shape="rounded"
                          size={isMobile ? 'small' : 'medium'}
                        />
                      </Box>
                    )}
                  </CardContent>
                </GlassCard>
              </Grid>
            </Grid>
          </>
        )}

        {/* Floating Action Button for Mobile */}
        {isTeam && isMobile && (
          <Fab
            color="primary"
            sx={{ position: 'fixed', bottom: 80, right: 16 }}
            onClick={() => setShowPunchModal(true)}
          >
            {todayAttendance?.punchIn ? <Logout /> : <Login />}
          </Fab>
        )}
      </Container>

      {/* Punch In/Out Modal */}
      <Dialog
        open={showPunchModal}
        onClose={() => setShowPunchModal(false)}
        fullScreen={isMobile}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: isMobile ? 0 : 4 } }}
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider', p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={700}>
              {todayAttendance?.punchIn ? 'Punch Out' : 'Punch In'}
            </Typography>
            <IconButton onClick={() => setShowPunchModal(false)}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <PunchInOut onSuccess={() => {
            setShowPunchModal(false);
            loadData();
          }} />
        </DialogContent>
      </Dialog>

      {/* Attendance Details Modal */}
      <AttendanceDetails
        open={logModalOpen}
        onClose={() => setLogModalOpen(false)}
        attendance={selectedLog}
        canEdit={canManage}
        canDelete={canDelete}
        onDelete={handleDelete}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight={700}>
            Confirm Delete
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this attendance record?
            This action cannot be undone.
          </Typography>
          {attendanceToDelete && (
            <Paper sx={{ p: 2, mt: 2, bgcolor: alpha('#f44336', 0.05), borderRadius: 2 }}>
              <Typography variant="body2">
                <strong>Employee:</strong> {attendanceToDelete.user?.name}<br />
                <strong>Date:</strong> {formatDate(attendanceToDelete.date)}<br />
                <strong>Status:</strong> {attendanceToDelete.status}
              </Typography>
            </Paper>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            color="error"
            sx={{ borderRadius: 2 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => {
          setSnackbar({ ...snackbar, open: false });
          clearMessages();
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => {
            setSnackbar({ ...snackbar, open: false });
            clearMessages();
          }}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}