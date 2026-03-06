// pages/TeamAttendance.jsx (Fixed with proper hook usage)
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Skeleton,
  Fade,
  Slide,
  BottomNavigation,
  BottomNavigationAction,
  SwipeableDrawer,
  Collapse,
  Badge,
  Fab,
  Zoom,
  alpha,
} from '@mui/material';
import { styled } from '@mui/material/styles';
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
  DateRange,
  Dashboard,
  ExpandMore,
  ExpandLess,
  FilterAlt,
  Clear,
  Refresh,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useAttendance } from '../hooks/useAttendance';
import AttendanceDetails from './AttendanceDetails';
import { format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const PRIMARY_COLOR = "#4569ea";
const SECONDARY_COLOR = "#1a237e";

// Period Options
const PERIOD_OPTIONS = [
  { value: "Today", label: "Today", icon: <CalendarToday /> },
  { value: "This Week", label: "This Week", icon: <DateRange /> },
  { value: "This Month", label: "This Month", icon: <DateRange /> },
  { value: "All", label: "All Time", icon: <DateRange /> },
];

// Status Configuration
const STATUS_CONFIG = {
  present: {
    bg: alpha("#4caf50", 0.08),
    color: "#4caf50",
    icon: <CheckCircle sx={{ fontSize: 16 }} />,
    label: "Present",
  },
  absent: {
    bg: alpha("#f44336", 0.08),
    color: "#f44336",
    icon: <ErrorIcon sx={{ fontSize: 16 }} />,
    label: "Absent",
  },
  late: {
    bg: alpha("#ff9800", 0.08),
    color: "#ff9800",
    icon: <Warning sx={{ fontSize: 16 }} />,
    label: "Late",
  },
  leave: {
    bg: alpha("#9c27b0", 0.08),
    color: "#9c27b0",
    icon: <Person sx={{ fontSize: 16 }} />,
    label: "Leave",
  },
  holiday: {
    bg: alpha("#2196f3", 0.08),
    color: "#2196f3",
    icon: <CalendarToday sx={{ fontSize: 16 }} />,
    label: "Holiday",
  },
};

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
  }
}));

const StatusChip = ({ status, size = "small" }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.present;
  return (
    <Chip
      size={size}
      label={config.label}
      icon={config.icon}
      sx={{
        bgcolor: config.bg,
        color: config.color,
        fontWeight: 600,
        '& .MuiChip-icon': { color: config.color },
      }}
    />
  );
};

// ========== MOBILE FILTER DRAWER ==========
const MobileFilterDrawer = ({
  open,
  onClose,
  period,
  setPeriod,
  statusFilter,
  setStatusFilter,
  handleClearFilters,
  searchQuery,
  setSearchQuery,
  activeFilterCount,
}) => {
  const [expandedSection, setExpandedSection] = useState("search");

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

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
          maxHeight: "90vh",
          overflow: "hidden",
        },
      }}
    >
      <Box sx={{ position: "relative" }}>
        {/* Drag Handle */}
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

        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 3,
            pb: 2,
            borderBottom: `1px solid ${alpha(PRIMARY_COLOR, 0.1)}`,
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight="700" color={PRIMARY_COLOR}>
              Filter Team Attendance
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {activeFilterCount} active filter{activeFilterCount !== 1 && "s"}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ bgcolor: alpha(PRIMARY_COLOR, 0.1) }}
          >
            <Close />
          </IconButton>
        </Box>

        {/* Filter Content */}
        <Box sx={{ maxHeight: "calc(90vh - 120px)", overflow: "auto", p: 3 }}>
          <Stack spacing={2.5}>
            {/* Search Section */}
            <Paper
              elevation={0}
              sx={{
                border: `1px solid ${alpha(PRIMARY_COLOR, 0.1)}`,
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  p: 2,
                  bgcolor: alpha(PRIMARY_COLOR, 0.02),
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onClick={() => toggleSection("search")}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Search sx={{ color: PRIMARY_COLOR, fontSize: 20 }} />
                  <Typography variant="subtitle2" fontWeight={600}>
                    Search
                  </Typography>
                </Stack>
                {expandedSection === "search" ? <ExpandLess /> : <ExpandMore />}
              </Box>
              <Collapse in={expandedSection === "search"}>
                <Box sx={{ p: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search by name, email, ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search sx={{ color: "text.secondary", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: searchQuery && (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setSearchQuery("")}
                          >
                            <Close fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </Collapse>
            </Paper>

            {/* Period Section */}
            <Paper
              elevation={0}
              sx={{
                border: `1px solid ${alpha(PRIMARY_COLOR, 0.1)}`,
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  p: 2,
                  bgcolor: alpha(PRIMARY_COLOR, 0.02),
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onClick={() => toggleSection("period")}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <DateRange sx={{ color: PRIMARY_COLOR, fontSize: 20 }} />
                  <Typography variant="subtitle2" fontWeight={600}>
                    Time Period
                  </Typography>
                </Stack>
                {expandedSection === "period" ? <ExpandLess /> : <ExpandMore />}
              </Box>
              <Collapse in={expandedSection === "period"}>
                <Box sx={{ p: 2 }}>
                  <Grid container spacing={1}>
                    {PERIOD_OPTIONS.map((option) => (
                      <Grid item xs={6} key={option.value}>
                        <Button
                          fullWidth
                          variant={
                            period === option.value ? "contained" : "outlined"
                          }
                          onClick={() => setPeriod(option.value)}
                          startIcon={option.icon}
                          size="small"
                          sx={{
                            bgcolor:
                              period === option.value
                                ? PRIMARY_COLOR
                                : "transparent",
                            color:
                              period === option.value ? "#fff" : PRIMARY_COLOR,
                            borderColor: PRIMARY_COLOR,
                            "&:hover": {
                              bgcolor:
                                period === option.value
                                  ? SECONDARY_COLOR
                                  : alpha(PRIMARY_COLOR, 0.1),
                            },
                          }}
                        >
                          {option.label}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Collapse>
            </Paper>

            {/* Status Section */}
            <Paper
              elevation={0}
              sx={{
                border: `1px solid ${alpha(PRIMARY_COLOR, 0.1)}`,
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  p: 2,
                  bgcolor: alpha(PRIMARY_COLOR, 0.02),
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onClick={() => toggleSection("status")}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <FilterAlt sx={{ color: PRIMARY_COLOR, fontSize: 20 }} />
                  <Typography variant="subtitle2" fontWeight={600}>
                    Status
                  </Typography>
                </Stack>
                {expandedSection === "status" ? <ExpandLess /> : <ExpandMore />}
              </Box>
              <Collapse in={expandedSection === "status"}>
                <Box sx={{ p: 2 }}>
                  <FormControl fullWidth size="small">
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value="">All Statuses</MenuItem>
                      <MenuItem value="present">Present</MenuItem>
                      <MenuItem value="absent">Absent</MenuItem>
                      <MenuItem value="late">Late</MenuItem>
                      <MenuItem value="leave">Leave</MenuItem>
                      <MenuItem value="holiday">Holiday</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Collapse>
            </Paper>
          </Stack>
        </Box>

        {/* Action Buttons */}
        <Box
          sx={{
            p: 3,
            borderTop: `1px solid ${alpha(PRIMARY_COLOR, 0.1)}`,
            bgcolor: "#fff",
          }}
        >
          <Stack direction="row" spacing={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                handleClearFilters();
                onClose();
              }}
              startIcon={<Clear />}
              sx={{
                borderColor: PRIMARY_COLOR,
                color: PRIMARY_COLOR,
                "&:hover": {
                  bgcolor: alpha(PRIMARY_COLOR, 0.05),
                },
              }}
            >
              Clear All
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={onClose}
              sx={{
                bgcolor: PRIMARY_COLOR,
                "&:hover": {
                  bgcolor: SECONDARY_COLOR,
                },
              }}
            >
              Apply Filters
            </Button>
          </Stack>
        </Box>
      </Box>
    </SwipeableDrawer>
  );
};

// ========== MOBILE TEAM MEMBER CARD ==========
const MobileTeamMemberCard = ({ member, onViewAttendance, index }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Fade in={true} timeout={500 + index * 50}>
      <Paper
        sx={{
          mb: 1.5,
          borderRadius: 3,
          border: `1px solid ${alpha(PRIMARY_COLOR, 0.1)}`,
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: 2 }}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 1.5,
            }}
          >
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
              <Avatar
                sx={{
                  bgcolor: PRIMARY_COLOR,
                  color: "#fff",
                  width: 48,
                  height: 48,
                  fontWeight: 600,
                }}
              >
                {member.firstName?.charAt(0) || 'U'}
              </Avatar>
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight="700"
                  color={PRIMARY_COLOR}
                >
                  {member.firstName} {member.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ID: {member.employeeId || 'N/A'}
                </Typography>
              </Box>
            </Box>
            <IconButton
              size="small"
              onClick={() => setExpanded(!expanded)}
              sx={{
                transform: expanded ? "rotate(180deg)" : "none",
                transition: "transform 0.3s",
                bgcolor: alpha(PRIMARY_COLOR, 0.1),
              }}
            >
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>

          {/* Quick Info */}
          <Grid container spacing={1} sx={{ mb: 1.5 }}>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                {member.email}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Chip
                size="small"
                label={member.role || 'TEAM'}
                sx={{
                  bgcolor: alpha(PRIMARY_COLOR, 0.1),
                  color: PRIMARY_COLOR,
                  height: 24,
                  fontSize: "0.7rem",
                }}
              />
            </Grid>
          </Grid>

          {/* Expanded Details */}
          <Collapse in={expanded}>
            <Box
              sx={{
                mt: 2,
                pt: 2,
                borderTop: `1px solid ${alpha(PRIMARY_COLOR, 0.1)}`,
              }}
            >
              {/* Action Button */}
              <Button
                fullWidth
                size="small"
                variant="contained"
                startIcon={<History />}
                onClick={() => onViewAttendance(member)}
                sx={{
                  bgcolor: PRIMARY_COLOR,
                  borderRadius: 2,
                  "&:hover": { bgcolor: SECONDARY_COLOR },
                }}
              >
                View Attendance
              </Button>
            </Box>
          </Collapse>
        </Box>
      </Paper>
    </Fade>
  );
};

// ========== MOBILE ATTENDANCE CARD ==========
const MobileAttendanceCard = ({ attendance, onView, onDelete, canDelete, index }) => {
  const [expanded, setExpanded] = useState(false);
  const statusConfig = STATUS_CONFIG[attendance.status] || STATUS_CONFIG.present;

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

  return (
    <Fade in={true} timeout={500 + index * 50}>
      <Paper
        sx={{
          mb: 1.5,
          borderRadius: 3,
          border: `1px solid ${alpha(statusConfig.color, 0.2)}`,
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: 2 }}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 1.5,
            }}
          >
            <Box>
              <Typography variant="subtitle1" fontWeight="700">
                {formatDate(attendance.date)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {attendance.user?.name || 'Attendance Record'}
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() => setExpanded(!expanded)}
              sx={{
                transform: expanded ? "rotate(180deg)" : "none",
                transition: "transform 0.3s",
                bgcolor: alpha(statusConfig.color, 0.1),
              }}
            >
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>

          {/* Quick Info */}
          <Grid container spacing={1} sx={{ mb: 1.5 }}>
            <Grid item xs={4}>
              <Typography variant="caption" color="text.secondary">
                Punch In
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {attendance.punchIn ? formatTime(attendance.punchIn.time) : '-'}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="caption" color="text.secondary">
                Punch Out
              </Typography>
              <Typography variant="body2" fontWeight={600} color={attendance.punchOut ? 'text.primary' : PRIMARY_COLOR}>
                {attendance.punchOut ? formatTime(attendance.punchOut.time) : 'Ongoing'}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="caption" color="text.secondary">
                Hours
              </Typography>
              <Typography variant="body2" fontWeight={600} color={PRIMARY_COLOR}>
                {attendance.workHoursFormatted || '00:00'}
              </Typography>
            </Grid>
          </Grid>

          {/* Status Chip */}
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1.5 }}>
            <StatusChip status={attendance.status || 'present'} />
          </Box>

          {/* Location */}
          {attendance.punchIn?.address && (
            <Box display="flex" alignItems="center" gap={1}>
              <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                {attendance.punchIn.address.split(',')[0]}
              </Typography>
            </Box>
          )}

          {/* Expanded Details */}
          <Collapse in={expanded}>
            <Box
              sx={{
                mt: 2,
                pt: 2,
                borderTop: `1px solid ${alpha(statusConfig.color, 0.1)}`,
              }}
            >
              {/* Action Buttons */}
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Button
                  fullWidth
                  size="small"
                  variant="contained"
                  startIcon={<Visibility />}
                  onClick={() => onView(attendance)}
                  sx={{
                    bgcolor: PRIMARY_COLOR,
                    borderRadius: 2,
                    "&:hover": { bgcolor: SECONDARY_COLOR },
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
                    onClick={() => onDelete(attendance)}
                    sx={{
                      borderRadius: 2,
                      borderColor: "#f44336",
                      color: "#f44336",
                      "&:hover": { bgcolor: alpha("#f44336", 0.1) },
                    }}
                  >
                    Delete
                  </Button>
                )}
              </Stack>
            </Box>
          </Collapse>
        </Box>
      </Paper>
    </Fade>
  );
};

// ========== LOADING SKELETON ==========
const LoadingSkeleton = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Grid container spacing={isMobile ? 1.5 : 2} sx={{ mb: 3 }}>
        {[1, 2, 3, 4].map((item) => (
          <Grid item xs={6} sm={6} md={3} key={item}>
            <Skeleton
              variant="rectangular"
              height={isMobile ? 90 : 120}
              sx={{ borderRadius: 3 }}
            />
          </Grid>
        ))}
      </Grid>
      {isMobile && (
        <Skeleton
          variant="rectangular"
          height={56}
          sx={{ borderRadius: 2, mb: 2 }}
        />
      )}
      <Skeleton
        variant="rectangular"
        height={isMobile ? 500 : 400}
        sx={{ borderRadius: 3, mb: 2 }}
      />
      <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
    </Box>
  );
};

// ========== EMPTY STATE ==========
const EmptyState = ({ onClearFilters, hasFilters, message }) => (
  <Box sx={{ textAlign: "center", py: 8, px: 2 }}>
    <Box
      sx={{
        width: 120,
        height: 120,
        borderRadius: "50%",
        bgcolor: alpha(PRIMARY_COLOR, 0.1),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mx: "auto",
        mb: 3,
      }}
    >
      <Group sx={{ fontSize: 48, color: PRIMARY_COLOR }} />
    </Box>
    <Typography variant="h6" fontWeight={600} gutterBottom>
      {message || "No records found"}
    </Typography>
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ mb: 3, maxWidth: 400, mx: "auto" }}
    >
      {hasFilters
        ? "No records match your current filters. Try adjusting your search criteria."
        : "Records will appear here."}
    </Typography>
    {hasFilters && (
      <Button
        variant="contained"
        onClick={onClearFilters}
        startIcon={<Clear />}
        sx={{ bgcolor: PRIMARY_COLOR, "&:hover": { bgcolor: SECONDARY_COLOR } }}
      >
        Clear All Filters
      </Button>
    )}
  </Box>
);

export default function TeamAttendance() {
  const theme = useTheme();
  const navigate = useNavigate();
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
    getTeamMembers,
    deleteAttendance,
    clearMessages
  } = useAttendance();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [period, setPeriod] = useState('Today');
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [attendanceToDelete, setAttendanceToDelete] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [navValue, setNavValue] = useState(0);

  // Refs
  const containerRef = useRef(null);

  const userRole = getUserRole();
  const isHeadOffice = userRole === 'Head_office';
  const canDelete = isHeadOffice;

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchTerm) count++;
    if (statusFilter) count++;
    if (period !== "Today") count++;
    return count;
  }, [searchTerm, statusFilter, period]);

  // Load team members
  const loadTeamMembers = useCallback(async () => {
    setLoadingMembers(true);
    try {
      const members = await getTeamMembers();
      setTeamMembers(members || []);
    } catch (err) {
      console.error('Error loading team members:', err);
    } finally {
      setLoadingMembers(false);
    }
  }, [getTeamMembers]);

  // Load member attendance
  const loadMemberAttendance = useCallback(async (userId) => {
    const filters = {
      page: page + 1,
      limit: rowsPerPage,
      userId,
      ...(statusFilter && { status: statusFilter }),
      ...(period !== 'All' && { period: period.toLowerCase() }),
    };
    await fetchAttendances(filters);
  }, [fetchAttendances, page, rowsPerPage, statusFilter, period]);

  useEffect(() => {
    loadTeamMembers();
  }, [loadTeamMembers]);

  useEffect(() => {
    if (selectedMember) {
      loadMemberAttendance(selectedMember._id);
    }
  }, [selectedMember, page, rowsPerPage, statusFilter, period, loadMemberAttendance]);

  useEffect(() => {
    if (error) {
      setSnackbar({ open: true, message: error, severity: 'error' });
    }
    if (success) {
      setSnackbar({ open: true, message: success, severity: 'success' });
    }
  }, [error, success]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(0);
  };

  const handleViewDetails = (attendance) => {
    setSelectedAttendance(attendance);
    setDetailsOpen(true);
  };

  const handleDelete = (attendance) => {
    setAttendanceToDelete(attendance);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (attendanceToDelete) {
      const result = await deleteAttendance(attendanceToDelete._id);
      if (result.success && selectedMember) {
        loadMemberAttendance(selectedMember._id);
      }
      setDeleteDialogOpen(false);
      setAttendanceToDelete(null);
    }
  };

  const handleMemberSelect = (member) => {
    setSelectedMember(member);
    setPage(0);
    setSearchTerm('');
    setStatusFilter('');
  };

  const handleBackToMembers = () => {
    setSelectedMember(null);
    setSearchTerm('');
    setStatusFilter('');
    setPage(0);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPeriod('Today');
    setPage(0);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const filteredMembers = teamMembers.filter(member => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      member.firstName?.toLowerCase().includes(searchLower) ||
      member.lastName?.toLowerCase().includes(searchLower) ||
      member.email?.toLowerCase().includes(searchLower) ||
      member.employeeId?.toLowerCase().includes(searchLower)
    );
  });

  // Loading state
  if (loadingMembers && !teamMembers.length && !selectedMember) {
    return <LoadingSkeleton />;
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        p: { xs: 1.5, sm: 2, md: 3 },
        minHeight: '100vh',
        pb: { xs: 8, sm: 3 },
        bgcolor: '#f8fafc',
      }}
    >
      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        open={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        period={period}
        setPeriod={setPeriod}
        statusFilter={statusFilter}
        setStatusFilter={handleStatusChange}
        handleClearFilters={handleClearFilters}
        searchQuery={searchTerm}
        setSearchQuery={handleSearchChange}
        activeFilterCount={activeFilterCount}
      />

      {/* Header with Gradient Background */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, ${SECONDARY_COLOR} 100%)`,
          color: "#fff",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            {selectedMember && (
              <IconButton
                onClick={handleBackToMembers}
                sx={{
                  color: "#fff",
                  bgcolor: "rgba(255,255,255,0.2)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                }}
              >
                <ArrowBack />
              </IconButton>
            )}
            <Box>
              <Typography
                variant={isMobile ? "h6" : "h5"}
                fontWeight={700}
                gutterBottom
              >
                {selectedMember ? `${selectedMember.firstName} ${selectedMember.lastName}'s Attendance` : 'Team Attendance'}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  opacity: 0.9,
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                }}
              >
                {selectedMember ? 'View individual attendance records' : 'Manage team attendance records'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            {isMobile && selectedMember && (
              <Button
                variant="contained"
                startIcon={<FilterAlt />}
                onClick={() => setMobileFilterOpen(true)}
                size="small"
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "#fff",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                  position: "relative",
                }}
              >
                Filter
                {activeFilterCount > 0 && (
                  <Badge
                    badgeContent={activeFilterCount}
                    color="error"
                    sx={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                      "& .MuiBadge-badge": {
                        fontSize: "0.6rem",
                        minWidth: 16,
                        height: 16,
                      },
                    }}
                  />
                )}
              </Button>
            )}
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={() => selectedMember ? loadMemberAttendance(selectedMember._id) : loadTeamMembers()}
              disabled={loading}
              size={isMobile ? "small" : "medium"}
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                color: "#fff",
                "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
              }}
            >
              Refresh
            </Button>
          </Box>
        </Stack>
      </Paper>

      {!selectedMember ? (
        // Team Members View
        <>
          {/* Mobile Search Bar */}
          {isMobile && (
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search team members..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchTerm('')}>
                        <Close />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    bgcolor: "#fff",
                  },
                }}
              />
            </Box>
          )}

          {/* Desktop Search */}
          {!isMobile && (
            <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  size="small"
                  placeholder="Search team members..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  sx={{ minWidth: 300 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: "text.secondary" }} />
                      </InputAdornment>
                    ),
                  }}
                />
                {searchTerm && (
                  <Button
                    variant="text"
                    startIcon={<Clear />}
                    onClick={() => setSearchTerm('')}
                    sx={{ color: "error.main" }}
                  >
                    Clear
                  </Button>
                )}
              </Stack>
            </Paper>
          )}

          {/* Team Members Grid */}
          {loadingMembers ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : filteredMembers.length > 0 ? (
            <Grid container spacing={isMobile ? 1.5 : 3}>
              {filteredMembers.map((member, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={member._id}>
                  {isMobile ? (
                    <MobileTeamMemberCard
                      member={member}
                      onViewAttendance={handleMemberSelect}
                      index={index}
                    />
                  ) : (
                    <StyledCard>
                      <CardContent>
                        <Stack spacing={2}>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar sx={{ bgcolor: PRIMARY_COLOR, width: 48, height: 48 }}>
                              {member.firstName?.charAt(0)}
                            </Avatar>
                            <Box flex={1}>
                              <Typography variant="subtitle1" fontWeight={700}>
                                {member.firstName} {member.lastName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {member.employeeId || 'No ID'}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary">
                            {member.email}
                          </Typography>

                          <Chip
                            label={member.role || 'TEAM'}
                            size="small"
                            sx={{
                              bgcolor: alpha(PRIMARY_COLOR, 0.1),
                              color: PRIMARY_COLOR,
                              alignSelf: 'flex-start',
                            }}
                          />

                          <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<History />}
                            onClick={() => handleMemberSelect(member)}
                            sx={{
                              borderRadius: 2,
                              borderColor: PRIMARY_COLOR,
                              color: PRIMARY_COLOR,
                            }}
                          >
                            View Attendance
                          </Button>
                        </Stack>
                      </CardContent>
                    </StyledCard>
                  )}
                </Grid>
              ))}
            </Grid>
          ) : (
            <EmptyState
              onClearFilters={() => setSearchTerm('')}
              hasFilters={!!searchTerm}
              message="No team members found"
            />
          )}
        </>
      ) : (
        // Member Attendance View
        <>
          {/* Desktop Filters */}
          {!isMobile && (
            <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
              <Stack spacing={2.5}>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={2}
                  alignItems={{ xs: "stretch", md: "center" }}
                >
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={statusFilter}
                      onChange={handleStatusChange}
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

                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Period</InputLabel>
                    <Select
                      value={period}
                      onChange={(e) => setPeriod(e.target.value)}
                      label="Period"
                      sx={{ borderRadius: 2 }}
                    >
                      {PERIOD_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            {option.icon}
                            <span>{option.label}</span>
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {activeFilterCount > 0 && (
                    <Button
                      variant="text"
                      startIcon={<Clear />}
                      onClick={handleClearFilters}
                      sx={{ color: "error.main" }}
                    >
                      Clear All
                    </Button>
                  )}
                </Stack>

                {activeFilterCount > 0 && (
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mb: 1, display: "block" }}
                    >
                      Active Filters:
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {statusFilter && (
                        <Chip
                          label={`Status: ${statusFilter}`}
                          size="small"
                          onDelete={() => setStatusFilter('')}
                          sx={{
                            bgcolor: alpha(PRIMARY_COLOR, 0.1),
                            color: PRIMARY_COLOR,
                          }}
                        />
                      )}
                      {period !== "Today" && (
                        <Chip
                          label={`Period: ${period}`}
                          size="small"
                          onDelete={() => setPeriod('Today')}
                          sx={{
                            bgcolor: alpha(PRIMARY_COLOR, 0.1),
                            color: PRIMARY_COLOR,
                          }}
                        />
                      )}
                    </Stack>
                  </Box>
                )}
              </Stack>
            </Paper>
          )}

          {/* Attendance Table */}
          <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
            {!isMobile ? (
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: alpha(PRIMARY_COLOR, 0.05) }}>
                    <TableRow>
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
                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                          <CircularProgress />
                        </TableCell>
                      </TableRow>
                    ) : attendances && attendances.length > 0 ? (
                      attendances.map((attendance) => (
                        <TableRow key={attendance._id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {formatDate(attendance.date)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {attendance.punchIn ? (
                              <Chip
                                label={new Date(attendance.punchIn.time).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: true
                                })}
                                size="small"
                                sx={{ bgcolor: alpha('#4caf50', 0.1), color: '#4caf50' }}
                              />
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            {attendance.punchOut ? (
                              <Chip
                                label={new Date(attendance.punchOut.time).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: true
                                })}
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
                            <Typography variant="body2" fontWeight={600} color={PRIMARY_COLOR}>
                              {attendance.workHoursFormatted || '00:00'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <StatusChip status={attendance.status || 'present'} />
                          </TableCell>
                          <TableCell align="center">
                            <Stack direction="row" spacing={1} justifyContent="center">
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewDetails(attendance)}
                                  sx={{ color: PRIMARY_COLOR }}
                                >
                                  <Visibility fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              
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
                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">
                            No attendance records found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ p: 2 }}>
                {loading ? (
                  <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress />
                  </Box>
                ) : attendances && attendances.length > 0 ? (
                  attendances.map((attendance, index) => (
                    <MobileAttendanceCard
                      key={attendance._id}
                      attendance={attendance}
                      onView={handleViewDetails}
                      onDelete={handleDelete}
                      canDelete={canDelete}
                      index={index}
                    />
                  ))
                ) : (
                  <EmptyState
                    onClearFilters={handleClearFilters}
                    hasFilters={activeFilterCount > 0}
                    message="No attendance records found"
                  />
                )}
              </Box>
            )}

            {attendances && attendances.length > 0 && pagination && pagination.totalPages > 1 && (
              <Box
                sx={{
                  p: 2,
                  borderTop: 1,
                  borderColor: 'divider',
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Showing {page * rowsPerPage + 1} to {Math.min((page + 1) * rowsPerPage, pagination.totalItems)} of {pagination.totalItems}
                </Typography>
                <Pagination
                  count={pagination.totalPages}
                  page={page + 1}
                  onChange={handleChangePage}
                  color="primary"
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    "& .MuiPaginationItem-root": {
                      borderRadius: 2,
                      "&.Mui-selected": {
                        bgcolor: PRIMARY_COLOR,
                        color: "#fff",
                      },
                    },
                  }}
                />
              </Box>
            )}
          </Paper>
        </>
      )}

      {/* Mobile FAB */}
      {isMobile && selectedMember && (
        <Zoom in={true}>
          <Fab
            color="primary"
            aria-label="filter"
            onClick={() => setMobileFilterOpen(true)}
            sx={{
              position: "fixed",
              bottom: 80,
              right: 16,
              zIndex: 1000,
              bgcolor: PRIMARY_COLOR,
              "&:hover": { bgcolor: SECONDARY_COLOR },
              boxShadow: `0 4px 12px ${alpha(PRIMARY_COLOR, 0.3)}`,
            }}
          >
            <Badge
              badgeContent={activeFilterCount}
              color="error"
              max={9}
              sx={{
                "& .MuiBadge-badge": {
                  fontSize: "0.6rem",
                  minWidth: 16,
                  height: 16,
                },
              }}
            >
              <FilterAlt />
            </Badge>
          </Fab>
        </Zoom>
      )}

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
            borderTop: `1px solid ${alpha(PRIMARY_COLOR, 0.1)}`,
          }}
          elevation={3}
        >
          <BottomNavigation
            showLabels
            value={navValue}
            onChange={(event, newValue) => {
              setNavValue(newValue);
              if (newValue === 0) {
                if (selectedMember) {
                  handleBackToMembers();
                } else {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              } else if (newValue === 1) {
                navigate("/dashboard");
              }
            }}
            sx={{
              height: 64,
              "& .MuiBottomNavigationAction-root": {
                color: "text.secondary",
                "&.Mui-selected": { color: PRIMARY_COLOR },
              },
            }}
          >
            <BottomNavigationAction 
              label={selectedMember ? "Back" : "Team"} 
              icon={selectedMember ? <ArrowBack /> : <Group />} 
            />
            <BottomNavigationAction label="Dashboard" icon={<Dashboard />} />
          </BottomNavigation>
        </Paper>
      )}

      {/* Attendance Details Modal */}
      <AttendanceDetails
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        attendance={selectedAttendance}
        canEdit={false}
        canDelete={canDelete}
        onDelete={handleDelete}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 4,
            margin: isMobile ? 0 : 24,
          },
        }}
        TransitionComponent={isMobile ? Slide : Fade}
        transitionDuration={300}
      >
        <DialogTitle sx={{ bgcolor: "#f44336", color: "white", px: { xs: 2, sm: 3 } }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" fontWeight={700}>
              Confirm Delete
            </Typography>
            <IconButton onClick={() => setDeleteDialogOpen(false)} size="small" sx={{ color: "white" }}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ py: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 } }}>
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            This action cannot be undone.
          </Alert>
          {attendanceToDelete && (
            <Paper sx={{ p: 2, bgcolor: alpha('#f44336', 0.05), borderRadius: 2 }}>
              <Typography variant="body2">
                <strong>Date:</strong> {formatDate(attendanceToDelete.date)}<br />
                <strong>Status:</strong> {attendanceToDelete.status}
              </Typography>
            </Paper>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            p: { xs: 2, sm: 3 },
            pt: { xs: 1.5, sm: 2 },
            borderTop: 1,
            borderColor: "divider",
            gap: 1.5,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            fullWidth={isMobile}
            sx={{
              borderRadius: 2,
              borderColor: PRIMARY_COLOR,
              color: PRIMARY_COLOR,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            color="error"
            fullWidth={isMobile}
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
        anchorOrigin={{
          vertical: isMobile ? "top" : "bottom",
          horizontal: isMobile ? "center" : "right",
        }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%", borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}