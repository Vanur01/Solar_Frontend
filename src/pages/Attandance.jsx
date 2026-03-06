// pages/Attandance.jsx (Updated with Mobile View)
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  useMediaQuery,
  DialogActions,
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
  Collapse,
  Tab,
  Tabs,
  Fab,
  SwipeableDrawer,
  BottomNavigation,InputAdornment,
  BottomNavigationAction,
  alpha,
} from '@mui/material';
import { styled } from '@mui/material/styles';
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
  Add,
  FilterAlt,
  Sort,
  ViewList,
  ViewModule,
  FiberManualRecord,Refresh,Clear,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useAttendance } from '../hooks/useAttendance';
import AttendanceDetails from './AttendanceDetails';
import TeamAttendance from './TeamAttendance';
import { format, parseISO, isValid, subWeeks, subMonths } from 'date-fns';
import { useNavigate } from 'react-router-dom';

// ========== CONSTANTS & CONFIGURATION ==========
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
    order: 1,
  },
  absent: {
    bg: alpha("#f44336", 0.08),
    color: "#f44336",
    icon: <Error sx={{ fontSize: 16 }} />,
    label: "Absent",
    order: 2,
  },
  late: {
    bg: alpha("#ff9800", 0.08),
    color: "#ff9800",
    icon: <Warning sx={{ fontSize: 16 }} />,
    label: "Late",
    order: 3,
  },
  leave: {
    bg: alpha("#9c27b0", 0.08),
    color: "#9c27b0",
    icon: <Person sx={{ fontSize: 16 }} />,
    label: "Leave",
    order: 4,
  },
  holiday: {
    bg: alpha("#2196f3", 0.08),
    color: "#2196f3",
    icon: <Weekend sx={{ fontSize: 16 }} />,
    label: "Holiday",
    order: 5,
  },
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
  sortConfig,
  setSortConfig,
  viewMode,
  setViewMode,
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
              Filter Attendance
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

            {/* Sort Section */}
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
                onClick={() => toggleSection("sort")}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Sort sx={{ color: PRIMARY_COLOR, fontSize: 20 }} />
                  <Typography variant="subtitle2" fontWeight={600}>
                    Sort By
                  </Typography>
                </Stack>
                {expandedSection === "sort" ? <ExpandLess /> : <ExpandMore />}
              </Box>
              <Collapse in={expandedSection === "sort"}>
                <Box sx={{ p: 2 }}>
                  <Stack spacing={1}>
                    {[
                      { key: "date", label: "Date" },
                      { key: "status", label: "Status" },
                    ].map((option) => (
                      <Button
                        key={option.key}
                        fullWidth
                        variant={
                          sortConfig.key === option.key
                            ? "contained"
                            : "outlined"
                        }
                        onClick={() =>
                          setSortConfig((prev) => ({
                            key: option.key,
                            direction:
                              prev.key === option.key &&
                              prev.direction === "asc"
                                ? "desc"
                                : "asc",
                          }))
                        }
                        endIcon={
                          sortConfig.key === option.key &&
                          (sortConfig.direction === "asc" ? (
                            <ArrowUpward fontSize="small" />
                          ) : (
                            <ArrowDownward fontSize="small" />
                          ))
                        }
                        sx={{
                          justifyContent: "space-between",
                          bgcolor:
                            sortConfig.key === option.key
                              ? PRIMARY_COLOR
                              : "transparent",
                          color:
                            sortConfig.key === option.key
                              ? "#fff"
                              : PRIMARY_COLOR,
                          borderColor: PRIMARY_COLOR,
                        }}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </Stack>
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

// ========== STAT CARD COMPONENT ==========
const StatCard = ({ icon: Icon, label, value, trend, color = PRIMARY_COLOR, loading, index }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
    <Fade in={true} timeout={500 + index * 100}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2, md: 2.5 },
          borderRadius: 3,
          border: `1px solid ${alpha(color, 0.1)}`,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          transition: "transform 0.2s",
          height: "100%",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: `0 8px 24px ${alpha(color, 0.15)}`,
          },
        }}
      >
        <Stack spacing={1}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box
              sx={{
                width: { xs: 32, sm: 40, md: 48 },
                height: { xs: 32, sm: 40, md: 48 },
                borderRadius: { xs: 1.5, sm: 2 },
                bgcolor: alpha(color, 0.1),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: color,
              }}
            >
              <Icon sx={{ fontSize: { xs: 16, sm: 20, md: 24 } }} />
            </Box>
            {trend && (
              <Chip
                icon={trend.direction === 'up' ? <TrendingUp /> : <TrendingDown />}
                label={trend.value}
                size="small"
                sx={{
                  borderRadius: 2,
                  bgcolor: trend.direction === 'up' ? alpha("#4caf50", 0.1) : alpha("#f44336", 0.1),
                  color: trend.direction === 'up' ? "#4caf50" : "#f44336",
                  height: 24,
                  "& .MuiChip-icon": { fontSize: 14, color: "inherit" },
                }}
              />
            )}
          </Box>
          <Box>
            <Typography
              variant="subtitle2"
              fontWeight={600}
              sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
            >
              {label}
            </Typography>
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{
                color: color,
                fontSize: { xs: "1.25rem", sm: "1.5rem", md: "2rem" },
              }}
            >
              {value}
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Fade>
  );
};

// ========== CALENDAR CELL ==========
const CalendarCell = ({ isSelected, isToday, isWeekend, status, onClick, day }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return '#4caf50';
      case 'absent': return '#f44336';
      case 'late': return '#ff9800';
      case 'leave': return '#9c27b0';
      case 'holiday': return '#2196f3';
      default: return 'transparent';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'present': return alpha('#4caf50', 0.1);
      case 'absent': return alpha('#f44336', 0.1);
      case 'late': return alpha('#ff9800', 0.1);
      case 'leave': return alpha('#9c27b0', 0.1);
      case 'holiday': return alpha('#2196f3', 0.1);
      default: return 'transparent';
    }
  };

  return (
    <Box
      onClick={onClick}
      sx={{
        height: { xs: 40, sm: 48 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 2,
        fontSize: { xs: '0.75rem', sm: '0.875rem' },
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        bgcolor: isSelected 
          ? PRIMARY_COLOR 
          : isToday 
          ? alpha(PRIMARY_COLOR, 0.1)
          : getStatusBg(status),
        color: isSelected 
          ? '#fff' 
          : isToday 
          ? PRIMARY_COLOR
          : status
          ? getStatusColor(status)
          : isWeekend 
          ? 'text.disabled' 
          : 'text.primary',
        border: isToday && !isSelected ? `2px solid ${PRIMARY_COLOR}` : 'none',
        '&:hover': {
          bgcolor: isSelected ? PRIMARY_COLOR : alpha(PRIMARY_COLOR, 0.1),
          transform: 'scale(1.05)',
        },
        opacity: status ? 1 : isWeekend ? 0.7 : 1,
      }}
    >
      {day}
    </Box>
  );
};

// ========== MOBILE LOG CARD ==========
const MobileLogCard = ({ entry, onView, onDelete, canDelete, index }) => {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(entry.date);
  const status = entry.status || 'present';
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.present;

  const formatTime = (timestamp) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
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
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
              <Box
                sx={{
                  bgcolor: statusConfig.bg,
                  borderRadius: 2,
                  p: 1,
                  minWidth: 50,
                  textAlign: 'center',
                }}
              >
                <Typography variant="caption" fontWeight={700} color={statusConfig.color}>
                  {date.toLocaleString('default', { month: 'short' }).toUpperCase()}
                </Typography>
                <Typography variant="h6" fontWeight={800} lineHeight={1} color={statusConfig.color}>
                  {date.getDate()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight="700">
                  {date.toLocaleDateString('en-US', { weekday: 'long' })}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {entry.user?.name || 'Regular Working Day'}
                </Typography>
              </Box>
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
                {entry.punchIn ? formatTime(entry.punchIn.time) : '-'}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="caption" color="text.secondary">
                Punch Out
              </Typography>
              <Typography variant="body2" fontWeight={600} color={entry.punchOut ? 'text.primary' : PRIMARY_COLOR}>
                {entry.punchOut ? formatTime(entry.punchOut.time) : 'Ongoing'}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="caption" color="text.secondary">
                Hours
              </Typography>
              <Typography variant="body2" fontWeight={600} color={PRIMARY_COLOR}>
                {entry.workHoursFormatted || '00:00'}
              </Typography>
            </Grid>
          </Grid>

          {/* Status Chip */}
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1.5 }}>
            <Chip
              size="small"
              label={statusConfig.label}
              icon={statusConfig.icon}
              sx={{
                bgcolor: statusConfig.bg,
                color: statusConfig.color,
                fontWeight: 600,
                height: 24,
                fontSize: "0.7rem",
                "& .MuiChip-icon": { fontSize: 14 },
              }}
            />
          </Box>

          {/* Location */}
          {entry.punchIn?.address && (
            <Box display="flex" alignItems="center" gap={1}>
              <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                {entry.punchIn.address.split(',')[0]}
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
              {/* Additional Info */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                {entry.punchIn?.remarks && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Punch In Remarks
                    </Typography>
                    <Typography variant="body2">
                      {entry.punchIn.remarks}
                    </Typography>
                  </Grid>
                )}
                {entry.punchOut?.remarks && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Punch Out Remarks
                    </Typography>
                    <Typography variant="body2">
                      {entry.punchOut.remarks}
                    </Typography>
                  </Grid>
                )}
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Created
                  </Typography>
                  <Typography variant="body2">
                    {entry.createdAt ? format(new Date(entry.createdAt), 'dd MMM yyyy') : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Last Updated
                  </Typography>
                  <Typography variant="body2">
                    {entry.updatedAt ? format(new Date(entry.updatedAt), 'dd MMM yyyy') : 'N/A'}
                  </Typography>
                </Grid>
              </Grid>

              {/* Action Buttons */}
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Button
                  fullWidth
                  size="small"
                  variant="contained"
                  startIcon={<Visibility />}
                  onClick={() => onView(entry)}
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
                    onClick={() => onDelete(entry)}
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
const EmptyState = ({ onClearFilters, hasFilters }) => (
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
      <CalendarToday sx={{ fontSize: 48, color: PRIMARY_COLOR }} />
    </Box>
    <Typography variant="h6" fontWeight={600} gutterBottom>
      No attendance records found
    </Typography>
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ mb: 3, maxWidth: 400, mx: "auto" }}
    >
      {hasFilters
        ? "No records match your current filters. Try adjusting your search criteria."
        : "Attendance records will appear here."}
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

// ========== GLASS CARD ==========
const GlassCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  borderRadius: 20,
}));

// ========== MAIN COMPONENT ==========
export default function Attandance() {
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
    deleteAttendance,
    clearMessages,
  } = useAttendance();

  // State Management
  const [period, setPeriod] = useState('Today');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('calendar');
  const [filters, setFilters] = useState({
    page: 1,
    limit: isMobile ? 5 : 10,
    status: '',
    search: '',
  });
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const [showPunchModal, setShowPunchModal] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [selectedLog, setSelectedLog] = useState(null);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [showTeamView, setShowTeamView] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [attendanceToDelete, setAttendanceToDelete] = useState(null);
  const [navValue, setNavValue] = useState(0);

  // Refs
  const containerRef = useRef(null);

  const userRole = getUserRole();
  const isTeam = userRole === 'TEAM';
  const isASM = userRole === 'ASM';
  const isZSM = userRole === 'ZSM';
  const isHeadOffice = userRole === 'Head_office';
  const canManage = isASM || isZSM || isHeadOffice;
  const canDelete = isHeadOffice;

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status) count++;
    if (period !== "Today") count++;
    return count;
  }, [filters.search, filters.status, period]);

  useEffect(() => {
    loadData();
  }, [filters.page, filters.limit, filters.status, filters.search, period]);

  const loadData = async () => {
    const queryFilters = {
      page: filters.page,
      limit: filters.limit,
      ...(filters.status && { status: filters.status }),
      ...(filters.search && { search: filters.search }),
      ...(isTeam && { userId: user._id }),
      ...(period !== 'All' && { period: period.toLowerCase() }),
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

  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handlePageChange = (event, value) => {
    setFilters(prev => ({ ...prev, page: value }));
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth" });
    }
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

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: isMobile ? 5 : 10,
      status: '',
      search: '',
    });
    setPeriod('Today');
    setSortConfig({ key: null, direction: "asc" });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Loading state
  if (loading && !attendances.length) {
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
        statusFilter={filters.status}
        setStatusFilter={handleStatusChange}
        handleClearFilters={handleClearFilters}
        searchQuery={filters.search}
        setSearchQuery={handleSearchChange}
        sortConfig={sortConfig}
        setSortConfig={setSortConfig}
        viewMode={viewMode}
        setViewMode={setViewMode}
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
          <Box>
            <Typography
              variant={isMobile ? "h6" : "h5"}
              fontWeight={700}
              gutterBottom
            >
              Attendance Dashboard
            </Typography>
            <Typography
              variant="body2"
              sx={{
                opacity: 0.9,
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              }}
            >
              {isTeam ? 'Your Attendance Overview' : 'Team Attendance Management'}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            {isMobile && (
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
              onClick={loadData}
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
            {canManage && (
              <Button
                variant="contained"
                startIcon={<Group />}
                onClick={() => setShowTeamView(!showTeamView)}
                size={isMobile ? "small" : "medium"}
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "#fff",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                }}
              >
                {showTeamView ? 'My View' : 'Team View'}
              </Button>
            )}
          </Box>
        </Stack>
      </Paper>

      {showTeamView && canManage ? (
        <TeamAttendance />
      ) : (
        <>
          {/* Stats Cards */}
          <Grid container spacing={isMobile ? 1.5 : 2} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={3}>
              <StatCard
                icon={CalendarToday}
                label="Total Days"
                value={pagination?.totalItems || 0}
                color={PRIMARY_COLOR}
                index={0}
                loading={loading}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatCard
                icon={AccessTime}
                label="Total Hours"
                value={`${summary?.totalWorkHours?.toFixed(1) || 0}h`}
                color="#2196f3"
                index={1}
                loading={loading}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatCard
                icon={CheckCircle}
                label="Present"
                value={summary?.presentCount || 0}
                color="#4caf50"
                index={2}
                loading={loading}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatCard
                icon={Warning}
                label="Late/Absent"
                value={`${summary?.lateCount || 0}/${summary?.absentCount || 0}`}
                color="#ff9800"
                index={3}
                loading={loading}
              />
            </Grid>
          </Grid>

          {/* Mobile Search Bar */}
          {isMobile && (
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by name, email, ID..."
                value={filters.search}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                  endAdornment: filters.search && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => handleSearchChange({ target: { value: '' } })}>
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

          {/* Desktop Filters */}
          {!isMobile && (
            <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
              <Stack spacing={2.5}>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={2}
                  alignItems={{ xs: "stretch", md: "center" }}
                >
                  <TextField
                    size="small"
                    placeholder="Search by name, email, ID..."
                    value={filters.search}
                    onChange={handleSearchChange}
                    sx={{ minWidth: 250 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search sx={{ color: "text.secondary" }} />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <FormControl size="small" sx={{ minWidth: 150 }}>
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
                      {filters.search && (
                        <Chip
                          label={`Search: ${filters.search}`}
                          size="small"
                          onDelete={() => handleSearchChange({ target: { value: '' } })}
                          sx={{
                            bgcolor: alpha(PRIMARY_COLOR, 0.1),
                            color: PRIMARY_COLOR,
                          }}
                        />
                      )}
                      {filters.status && (
                        <Chip
                          label={`Status: ${filters.status}`}
                          size="small"
                          onDelete={() => handleStatusChange({ target: { value: '' } })}
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

          {/* Main Grid */}
          <Grid container spacing={3}>
            {/* Left Column - Calendar */}
            <Grid item xs={12} md={5} lg={4}>
              <GlassCard>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
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
                          sx={{ fontSize: { xs: '0.6rem', sm: '0.75rem' } }}
                        >
                          {day}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>

                  <Grid container columns={7} spacing={0.5}>
                    {calendarDays.map((cell, index) => (
                      <Grid item xs={1} key={index}>
                        <CalendarCell
                          isSelected={cell.date && cell.date.toDateString() === selectedDate.toDateString()}
                          isToday={cell.date && cell.date.toDateString() === new Date().toDateString()}
                          isWeekend={cell.date && (cell.date.getDay() === 0 || cell.date.getDay() === 6)}
                          status={cell.status}
                          onClick={() => cell.date && handleDateSelect(cell.date)}
                          day={cell.day}
                        />
                      </Grid>
                    ))}
                  </Grid>

                  <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center">
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: PRIMARY_COLOR }} />
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
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
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
                  </Box>

                  {loading && !attendances.length ? (
                    <Box display="flex" justifyContent="center" p={4}>
                      <CircularProgress />
                    </Box>
                  ) : attendances && attendances.length > 0 ? (
                    <Box sx={{ maxHeight: 500, overflowY: 'auto', pr: 1 }}>
                      {attendances.map((attendance, index) => (
                        <MobileLogCard
                          key={attendance.id}
                          entry={attendance}
                          onView={handleViewLog}
                          onDelete={handleDelete}
                          canDelete={canDelete}
                          index={index}
                        />
                      ))}
                    </Box>
                  ) : (
                    <EmptyState
                      onClearFilters={handleClearFilters}
                      hasFilters={activeFilterCount > 0}
                    />
                  )}

                  {pagination && pagination.totalPages > 1 && (
                    <Box display="flex" justifyContent="center" sx={{ mt: 3 }}>
                      <Pagination
                        count={pagination.totalPages}
                        page={filters.page}
                        onChange={handlePageChange}
                        color="primary"
                        shape="rounded"
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
                </CardContent>
              </GlassCard>
            </Grid>
          </Grid>
        </>
      )}

      {/* Mobile FAB */}
      {isMobile && (
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
                window.scrollTo({ top: 0, behavior: "smooth" });
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
            <BottomNavigationAction label="Attendance" icon={<CalendarToday />} />
            <BottomNavigationAction label="Dashboard" icon={<Dashboard />} />
          </BottomNavigation>
        </Paper>
      )}

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
                <strong>Employee:</strong> {attendanceToDelete.user?.name}<br />
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