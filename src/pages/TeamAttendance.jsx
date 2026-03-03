import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Avatar,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Stack,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
  Tooltip,
  useTheme,
  useMediaQuery,
  Tab,
  Tabs,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  Search,
  Visibility,
  Edit,
  Delete,
  History,
  CalendarToday,
  AccessTime,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Person,
  Group,
  FilterList,
  Download,
  Close,
  LocationOn,
  PhotoLibrary,
  ArrowBack,
  ArrowForward,
  Today,
  DateRange
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useAttendance } from '../hooks/useAttendance';
import AttendanceDetails from './AttendanceDetails';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
  }
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
  const colors = {
    present: { bg: alpha('#4caf50', 0.1), color: '#4caf50' },
    absent: { bg: alpha('#f44336', 0.1), color: '#f44336' },
    late: { bg: alpha('#ff9800', 0.1), color: '#ff9800' },
    leave: { bg: alpha('#9c27b0', 0.1), color: '#9c27b0' },
    holiday: { bg: alpha('#2196f3', 0.1), color: '#2196f3' }
  };
  const style = colors[status] || colors.present;
  
  return {
    backgroundColor: style.bg,
    color: style.color,
    fontWeight: 600,
    '& .MuiChip-label': {
      px: 1.5
    }
  };
});

export default function TeamAttendance() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, getUserRole } = useAuth();
  const {
    attendances,
    loading,
    error,
    success,
    pagination,
    summary,
    fetchAttendances,
    deleteAttendance,
    clearMessages,
    getTeamMembers
  } = useAttendance();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [attendanceToDelete, setAttendanceToDelete] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [tabValue, setTabValue] = useState(0);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  const userRole = getUserRole();
  const isHeadOffice = userRole === 'Head_office';
  const isZSM = userRole === 'ZSM';
  const isASM = userRole === 'ASM';
  const isTeam = userRole === 'TEAM';
  const canManage = isASM || isZSM || isHeadOffice;
  const canDelete = isHeadOffice;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (error) {
      setSnackbar({ open: true, message: error, severity: 'error' });
    }
    if (success) {
      setSnackbar({ open: true, message: success, severity: 'success' });
    }
  }, [error, success]);

  const loadData = async (filters = {}) => {
    const queryFilters = {
      page: page + 1,
      limit: rowsPerPage,
      status: statusFilter,
      ...(dateFilter && { date: dateFilter }),
      ...(selectedMember && { userId: selectedMember.id }),
      ...filters
    };
    
    if (isTeam) {
      // Team members see only their own data
      queryFilters.userId = user._id;
    }
    
    await fetchAttendances(queryFilters);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    loadData({ page: newPage + 1 });
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    loadData({ limit: newRowsPerPage, page: 1 });
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleStatusFilter = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
    loadData({ status: event.target.value, page: 1 });
  };

  const handleDateFilter = (event) => {
    setDateFilter(event.target.value);
    setPage(0);
    loadData({ date: event.target.value, page: 1 });
  };

  const handleViewDetails = (attendance) => {
    setSelectedAttendance(attendance);
    setDetailsOpen(true);
  };

  const handleEdit = (attendance) => {
    // Implement edit functionality
    console.log('Edit attendance:', attendance);
  };

  const handleDelete = (attendance) => {
    setAttendanceToDelete(attendance);
    setDeleteDialogOpen(true);
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

  const handleMemberSelect = (member) => {
    setSelectedMember(member);
    setPage(0);
    loadData({ userId: member.id, page: 1 });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setDateFilter('');
    setSelectedMember(null);
    setPage(0);
    loadData({ page: 1 });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const filteredAttendances = attendances.filter(attendance => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      attendance.user?.name?.toLowerCase().includes(searchLower) ||
      attendance.user?.email?.toLowerCase().includes(searchLower) ||
      attendance.user?.employeeId?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Box sx={{ 
      minHeight: '100vh',
      pb: isMobile ? 7 : 0
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
              Team Attendance
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {isTeam ? 'Your Attendance History' : 'Manage Team Attendance Records'}
            </Typography>
          </Box>
          
          {canManage && (
            <Button
              variant="contained"
              startIcon={<Group />}
              onClick={() => setSelectedMember(null)}
              sx={{ borderRadius: 3, px: 3 }}
            >
              View All Team
            </Button>
          )}
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={3}>
            <StyledCard>
              <CardContent>
                <Stack spacing={1}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar sx={{ bgcolor: alpha('#4569ea', 0.1), width: 40, height: 40 }}>
                      <CalendarToday sx={{ color: '#4569ea', fontSize: 20 }} />
                    </Avatar>
                    <Typography variant="caption" color="text.secondary">Total Days</Typography>
                  </Box>
                  <Typography variant="h4" fontWeight={800} color="#4569ea">
                    {pagination?.totalItems || 0}
                  </Typography>
                </Stack>
              </CardContent>
            </StyledCard>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <StyledCard>
              <CardContent>
                <Stack spacing={1}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar sx={{ bgcolor: alpha('#4caf50', 0.1), width: 40, height: 40 }}>
                      <CheckCircle sx={{ color: '#4caf50', fontSize: 20 }} />
                    </Avatar>
                    <Typography variant="caption" color="text.secondary">Present</Typography>
                  </Box>
                  <Typography variant="h4" fontWeight={800} color="#4caf50">
                    {summary?.presentCount || 0}
                  </Typography>
                </Stack>
              </CardContent>
            </StyledCard>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <StyledCard>
              <CardContent>
                <Stack spacing={1}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar sx={{ bgcolor: alpha('#ff9800', 0.1), width: 40, height: 40 }}>
                      <Warning sx={{ color: '#ff9800', fontSize: 20 }} />
                    </Avatar>
                    <Typography variant="caption" color="text.secondary">Late</Typography>
                  </Box>
                  <Typography variant="h4" fontWeight={800} color="#ff9800">
                    {summary?.lateCount || 0}
                  </Typography>
                </Stack>
              </CardContent>
            </StyledCard>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <StyledCard>
              <CardContent>
                <Stack spacing={1}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar sx={{ bgcolor: alpha('#f44336', 0.1), width: 40, height: 40 }}>
                      <ErrorIcon sx={{ color: '#f44336', fontSize: 20 }} />
                    </Avatar>
                    <Typography variant="caption" color="text.secondary">Absent</Typography>
                  </Box>
                  <Typography variant="h4" fontWeight={800} color="#f44336">
                    {summary?.absentCount || 0}
                  </Typography>
                </Stack>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            spacing={2} 
            alignItems={{ xs: 'stretch', md: 'center' }}
            justifyContent="space-between"
          >
            <Box display="flex" gap={2} flexWrap="wrap" flex={1}>
              <TextField
                size="small"
                placeholder="Search by name, email or ID..."
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2, minWidth: 250 }
                }}
              />

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={handleStatusFilter}
                  label="Status"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="present">Present</MenuItem>
                  <MenuItem value="absent">Absent</MenuItem>
                  <MenuItem value="late">Late</MenuItem>
                  <MenuItem value="leave">Leave</MenuItem>
                  <MenuItem value="holiday">Holiday</MenuItem>
                </Select>
              </FormControl>

              <TextField
                size="small"
                type="date"
                value={dateFilter}
                onChange={handleDateFilter}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Today sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2, minWidth: 150 }
                }}
              />

              {selectedMember && (
                <Chip
                  label={`Member: ${selectedMember.name}`}
                  onDelete={() => handleMemberSelect(null)}
                  color="primary"
                  sx={{ borderRadius: 2 }}
                />
              )}
            </Box>

            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={clearFilters}
              sx={{ borderRadius: 2 }}
            >
              Clear Filters
            </Button>
          </Stack>
        </Paper>

        {/* Team Members Grid (for managers) */}
        {canManage && !selectedMember && teamMembers.length > 0 && (
          <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Team Members
            </Typography>
            <Grid container spacing={2}>
              {teamMembers.map((member) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={member.id}>
                  <StyledCard>
                    <CardContent>
                      <Stack spacing={2}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ bgcolor: '#4569ea', width: 48, height: 48 }}>
                            {member.name?.charAt(0)}
                          </Avatar>
                          <Box flex={1}>
                            <Typography variant="subtitle1" fontWeight={700}>
                              {member.firstName} {member.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {member.employeeId}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<History />}
                          onClick={() => handleMemberSelect(member)}
                          sx={{ borderRadius: 2 }}
                        >
                          View Attendance
                        </Button>
                      </Stack>
                    </CardContent>
                  </StyledCard>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}

        {/* Attendance Table */}
        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: alpha('#4569ea', 0.05) }}>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Punch In</TableCell>
                  <TableCell>Punch Out</TableCell>
                  <TableCell>Hours</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : filteredAttendances.length > 0 ? (
                  filteredAttendances.map((attendance) => (
                    <TableRow key={attendance.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar sx={{ bgcolor: '#4569ea', width: 40, height: 40 }}>
                            {attendance.user?.firstName?.charAt(0) || 'U'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {attendance.user?.firstName || 'N/A'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {attendance.user?.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {formatDate(attendance.date)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {attendance.punchIn ? (
                          <Chip
                            label={formatTime(attendance.punchIn.time)}
                            size="small"
                            sx={{ bgcolor: alpha('#4caf50', 0.1), color: '#4caf50' }}
                          />
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {attendance.punchOut ? (
                          <Chip
                            label={formatTime(attendance.punchOut.time)}
                            size="small"
                            sx={{ bgcolor: alpha('#ff9800', 0.1), color: '#ff9800' }}
                          />
                        ) : attendance.punchIn ? (
                          <Chip
                            label="Ongoing"
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color="primary">
                          {attendance.workHoursFormatted || '00:00'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <StatusChip
                          label={attendance.status || 'present'}
                          status={attendance.status}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewDetails(attendance)}
                              sx={{ color: '#4569ea' }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          {canManage && (
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => handleEdit(attendance)}
                                sx={{ color: '#ff9800' }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          {canDelete && (
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(attendance)}
                                sx={{ color: '#f44336' }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No attendance records found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={pagination?.totalItems || 0}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Container>

      {/* Attendance Details Modal */}
      <AttendanceDetails
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        attendance={selectedAttendance}
        canEdit={canManage}
        canDelete={canDelete}
        onEdit={handleEdit}
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