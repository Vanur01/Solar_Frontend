// pages/MissedLeadsPage.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Box,
  Typography,
  Card,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  Grid,
  Avatar,
  LinearProgress,
  Tooltip,
  useTheme,
  useMediaQuery,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
  Paper,
  AlertTitle,
  CardContent,
  Tab,
  Tabs,
  Skeleton,
  FormHelperText,
  Checkbox,
  FormControlLabel,
  alpha,
} from "@mui/material";
import { 
  Search, 
  Visibility, 
  Close, 
  Refresh,
  Warning,
  TrendingDown,
  AccessTime,
  Restore,
  PriorityHigh,
  Schedule,
  ArrowForward,
  CalendarToday,
  Phone,
  Email,
  Person,
  Timeline,
  FilterList,
  ArrowDropDown,
  ArrowDropUp,
  Info,
  CheckCircle,
  Error,
  Home,
  LocationOn,
  Description,
  AccountBalance,
  ReceiptLong,
  Build,
  ExpandMore,
  AttachFile,
  Note,
  Paid,
  LocalAtm,
  History,
  Download,
  OpenInNew,
  AccountBalanceWallet,
  Badge as BadgeIcon,
  CreditCard,
  PictureAsPdf,
  Image,
  FolderOpen,
  Money,
  Event,
  Tune,
  Clear,
  ArrowUpward,
  ArrowDownward,
  People,
  DateRange,
  FirstPage,
  LastPage,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  HowToReg,
  SupervisorAccount,
  AdminPanelSettings,
  WorkspacePremium,
  Groups,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { format, isValid, parseISO, startOfDay, endOfDay } from "date-fns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

// ========== CONSTANTS & CONFIGURATION ==========
const PRIMARY_COLOR = "#4569ea";
const SECONDARY_COLOR = "#1a237e";
const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50, 100];
const DEFAULT_ITEMS_PER_PAGE = 20;

// Priority Configuration
const PRIORITY_CONFIG = {
  High: {
    label: "High",
    color: "#f44336",
    bgcolor: alpha("#f44336", 0.1),
    icon: <PriorityHigh sx={{ fontSize: 16 }} />,
    daysThreshold: 30,
    description: "Inactive for 30+ days - Immediate action required",
  },
  Medium: {
    label: "Medium",
    color: "#ff9800",
    bgcolor: alpha("#ff9800", 0.1),
    icon: <Warning sx={{ fontSize: 16 }} />,
    daysThreshold: 15,
    description: "Inactive for 15-29 days - Follow up needed",
  },
  Low: {
    label: "Low",
    color: "#4caf50",
    bgcolor: alpha("#4caf50", 0.1),
    icon: <CheckCircle sx={{ fontSize: 16 }} />,
    daysThreshold: 0,
    description: "Inactive for less than 15 days - Monitor",
  },
};

// Stage Configuration
const STAGE_CONFIG = {
  "Installation Completion": {
    label: "Installation",
    color: PRIMARY_COLOR,
    bgcolor: alpha(PRIMARY_COLOR, 0.1),
    icon: <Build sx={{ fontSize: 16 }} />,
  },
  "Missed": {
    label: "Missed Lead",
    color: "#f44336",
    bgcolor: alpha("#f44336", 0.1),
    icon: <Warning sx={{ fontSize: 16 }} />,
  },
};

// ========== HELPER FUNCTIONS ==========
const getPriorityConfig = (daysInactive) => {
  if (daysInactive >= 30) return PRIORITY_CONFIG.High;
  if (daysInactive >= 15) return PRIORITY_CONFIG.Medium;
  return PRIORITY_CONFIG.Low;
};

const getStageConfig = (status) => {
  return STAGE_CONFIG[status] || {
    label: status || "New",
    color: "#757575",
    bgcolor: alpha("#757575", 0.1),
    icon: <Info sx={{ fontSize: 16 }} />,
  };
};

const formatDate = (dateString, formatStr = "dd MMM yyyy") => {
  if (!dateString) return "Not Available";
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return isValid(date) ? format(date, formatStr) : "Invalid Date";
  } catch (err) {
    return "Invalid Date";
  }
};

const formatDisplayName = (user) => {
  if (!user) return "Not Assigned";
  if (typeof user === 'string') return user;
  if (user.firstName || user.lastName) {
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || "Unknown User";
  }
  return "Unknown User";
};

// ========== REUSABLE COMPONENTS ==========

// Priority Chip Component
const PriorityChip = React.memo(({ daysInactive }) => {
  const config = getPriorityConfig(daysInactive);
  return (
    <Chip
      label={config.label}
      size="small"
      icon={config.icon}
      sx={{
        bgcolor: config.bgcolor,
        color: config.color,
        fontWeight: 600,
        fontSize: "0.75rem",
        height: 28,
        '& .MuiChip-icon': {
          color: config.color,
          fontSize: 16,
        }
      }}
    />
  );
});

PriorityChip.displayName = "PriorityChip";

// Stage Chip Component
const StageChip = React.memo(({ status }) => {
  const config = getStageConfig(status);
  return (
    <Chip
      label={config.label}
      size="small"
      icon={config.icon}
      sx={{
        bgcolor: config.bgcolor,
        color: config.color,
        fontWeight: 600,
        fontSize: "0.75rem",
        height: 28,
        '& .MuiChip-icon': {
          color: config.color,
          fontSize: 16,
        }
      }}
    />
  );
});

StageChip.displayName = "StageChip";

// Loading Skeleton
const LoadingSkeleton = () => (
  <Box sx={{ p: { xs: 2, sm: 3 } }}>
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {[1, 2, 3, 4].map((item) => (
        <Grid item xs={6} sm={3} key={item}>
          <Skeleton
            variant="rectangular"
            height={120}
            sx={{ borderRadius: 2 }}
          />
        </Grid>
      ))}
    </Grid>
    <Skeleton
      variant="rectangular"
      height={400}
      sx={{ borderRadius: 2, mb: 2 }}
    />
    <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
  </Box>
);

// Mobile Lead Card
const MobileLeadCard = React.memo(({ lead, onView, onReopen }) => {
  const priorityConfig = getPriorityConfig(lead.daysInactive || 0);
  const stageConfig = getStageConfig(lead.status);

  return (
    <Card sx={{ mb: 2, p: 2.5, borderRadius: 3, boxShadow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar 
            sx={{ 
              width: 40, 
              height: 40, 
              bgcolor: alpha(PRIMARY_COLOR, 0.1),
              color: PRIMARY_COLOR,
              fontSize: '1rem',
              fontWeight: 600
            }}
          >
            {lead.firstName?.charAt(0)}{lead.lastName?.charAt(0)}
          </Avatar>
          <Box>
            <Typography fontWeight="bold" fontSize="1rem">
              {`${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Unnamed Lead'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {lead.phone || 'No phone'}
            </Typography>
          </Box>
        </Box>
        <Chip
          label={priorityConfig.label}
          size="small"
          icon={priorityConfig.icon}
          sx={{
            bgcolor: priorityConfig.bgcolor,
            color: priorityConfig.color,
            fontWeight: 600,
          }}
        />
      </Box>

      <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
        <Grid item xs={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
            <CalendarToday sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              Created
            </Typography>
          </Box>
          <Typography variant="body2">
            {formatDate(lead.createdAt)}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
            <Timeline sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              Stage
            </Typography>
          </Box>
          <Chip
            label={stageConfig.label}
            size="small"
            icon={stageConfig.icon}
            sx={{
              bgcolor: stageConfig.bgcolor,
              color: stageConfig.color,
              fontWeight: 600,
              fontSize: "0.75rem",
              height: 28,
            }}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 1.5 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          {lead.daysInactive || 0} days inactive
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => onView(lead)}
              sx={{
                bgcolor: alpha(PRIMARY_COLOR, 0.1),
                color: PRIMARY_COLOR,
                '&:hover': {
                  bgcolor: alpha(PRIMARY_COLOR, 0.2),
                }
              }}
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          {(lead.canReopen !== false) && (
            <Tooltip title="Reopen Lead">
              <IconButton
                size="small"
                onClick={() => onReopen(lead)}
                sx={{
                  bgcolor: alpha(PRIORITY_CONFIG.Low.color, 0.1),
                  color: PRIORITY_CONFIG.Low.color,
                  '&:hover': {
                    bgcolor: PRIORITY_CONFIG.Low.color,
                    color: 'white',
                  }
                }}
              >
                <Restore fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
    </Card>
  );
});

MobileLeadCard.displayName = "MobileLeadCard";

// ========== MAIN COMPONENT ==========
export default function MissedLeadsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  
  const { fetchAPI } = useAuth();
  
  // State Management
  const [period, setPeriod] = useState("Today");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [missedLeads, setMissedLeads] = useState([]);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    startDate: null,
    endDate: null,
  });
  const [dateFilterError, setDateFilterError] = useState("");
  const [selectedPriorities, setSelectedPriorities] = useState({
    High: true,
    Medium: true,
    Low: true,
  });
  
  // Sorting & Pagination
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: DEFAULT_ITEMS_PER_PAGE,
    total: 0,
    totalPages: 1
  });
  
  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadDetails, setLeadDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Summary stats
  const [summaryStats, setSummaryStats] = useState({
    total: 0,
    highPriority: 0,
    mediumPriority: 0,
    lowPriority: 0,
    avgInactiveDays: 0,
    reopenable: 0
  });

  // Snackbar Handler
  const showSnackbar = useCallback((message, severity = "success") => {
    if (severity === "success") {
      setSuccess(message);
    } else {
      setError(message);
    }
  }, []);

  // Fetch missed leads
  const fetchMissedLeads = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(priorityFilter && { priority: priorityFilter }),
        ...(searchTerm && { search: searchTerm }),
        ...(period !== "Today" && { period: period.toLowerCase().replace(' ', '_') })
      });

      const response = await fetchAPI(`/lead/missed?${params}`);
      
      if (response?.success) {
        const leads = response.result.missedLeads || [];
        setMissedLeads(leads);
        setPagination(response.result.pagination || {
          page: 1,
          limit: DEFAULT_ITEMS_PER_PAGE,
          total: leads.length,
          totalPages: Math.ceil(leads.length / DEFAULT_ITEMS_PER_PAGE)
        });
        calculateSummaryStats(leads);
      } else {
        throw new Error(response?.message || "Failed to fetch missed leads");
      }
    } catch (err) {
      console.error("Error fetching missed leads:", err);
      setError(err.message || "Failed to load missed leads. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, priorityFilter, searchTerm, period, fetchAPI]);

  // Calculate summary statistics
  const calculateSummaryStats = (leads) => {
    const high = leads.filter(lead => (lead.daysInactive || 0) >= 30).length;
    const medium = leads.filter(lead => (lead.daysInactive || 0) >= 15 && (lead.daysInactive || 0) < 30).length;
    const low = leads.filter(lead => (lead.daysInactive || 0) < 15).length;
    const avgDays = leads.length > 0 
      ? Math.round(leads.reduce((sum, lead) => sum + (lead.daysInactive || 0), 0) / leads.length)
      : 0;
    const reopenable = leads.filter(lead => lead.canReopen !== false).length;

    setSummaryStats({
      total: leads.length,
      highPriority: high,
      mediumPriority: medium,
      lowPriority: low,
      avgInactiveDays: avgDays,
      reopenable: reopenable
    });
  };

  // Apply Filters
  const applyFilters = useCallback(() => {
    try {
      let filtered = [...missedLeads];

      // Search filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        filtered = filtered.filter(
          (lead) =>
            (lead.firstName?.toLowerCase() || "").includes(query) ||
            (lead.lastName?.toLowerCase() || "").includes(query) ||
            (lead.email?.toLowerCase() || "").includes(query) ||
            (lead.phone || "").includes(query)
        );
      }

      // Priority filter
      if (priorityFilter) {
        if (priorityFilter === "High") {
          filtered = filtered.filter(lead => (lead.daysInactive || 0) >= 30);
        } else if (priorityFilter === "Medium") {
          filtered = filtered.filter(lead => (lead.daysInactive || 0) >= 15 && (lead.daysInactive || 0) < 30);
        } else if (priorityFilter === "Low") {
          filtered = filtered.filter(lead => (lead.daysInactive || 0) < 15);
        }
      }

      // Priority checkboxes
      const activePriorities = Object.keys(selectedPriorities).filter(
        (priority) => selectedPriorities[priority]
      );
      
      if (activePriorities.length < 3) {
        filtered = filtered.filter((lead) => {
          const days = lead.daysInactive || 0;
          if (days >= 30) return activePriorities.includes("High");
          if (days >= 15) return activePriorities.includes("Medium");
          return activePriorities.includes("Low");
        });
      }

      // Date filter
      if (dateFilter.startDate && isValid(dateFilter.startDate)) {
        const start = startOfDay(new Date(dateFilter.startDate));
        filtered = filtered.filter((lead) => {
          if (!lead.createdAt) return false;
          try {
            const createdDate = parseISO(lead.createdAt);
            return isValid(createdDate) && createdDate >= start;
          } catch {
            return false;
          }
        });
      }

      if (dateFilter.endDate && isValid(dateFilter.endDate)) {
        const end = endOfDay(new Date(dateFilter.endDate));
        filtered = filtered.filter((lead) => {
          if (!lead.createdAt) return false;
          try {
            const createdDate = parseISO(lead.createdAt);
            return isValid(createdDate) && createdDate <= end;
          } catch {
            return false;
          }
        });
      }

      // Sorting
      if (sortConfig.key) {
        filtered.sort((a, b) => {
          let aVal = a[sortConfig.key];
          let bVal = b[sortConfig.key];

          if (sortConfig.key === "createdAt" || sortConfig.key === "lastContactedAt") {
            aVal = aVal ? parseISO(aVal) : new Date(0);
            bVal = bVal ? parseISO(bVal) : new Date(0);
          } else if (sortConfig.key === "fullName") {
            aVal = `${a.firstName || ""} ${a.lastName || ""}`.toLowerCase();
            bVal = `${b.firstName || ""} ${b.lastName || ""}`.toLowerCase();
          } else if (sortConfig.key === "daysInactive") {
            aVal = aVal || 0;
            bVal = bVal || 0;
          }

          if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
          if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
          return 0;
        });
      }

      return filtered;
    } catch (err) {
      console.error("Filter error:", err);
      showSnackbar("Error applying filters", "error");
      return [];
    }
  }, [missedLeads, searchTerm, priorityFilter, dateFilter, selectedPriorities, sortConfig, showSnackbar]);

  // Memoized filtered leads
  const filteredLeads = useMemo(() => applyFilters(), [applyFilters]);

  // Paginated leads
  const paginatedLeads = useMemo(() => {
    const start = (pagination.page - 1) * pagination.limit;
    return filteredLeads.slice(start, start + pagination.limit);
  }, [filteredLeads, pagination.page, pagination.limit]);

  // Handle view lead details
  const handleViewClick = useCallback(async (lead) => {
    setSelectedLead(lead);
    setDetailsLoading(true);
    setViewDialogOpen(true);
    
    try {
      const response = await fetchAPI(`/lead/getLeadById/${lead._id}`);
      if (response.success) {
        setLeadDetails(response.result);
      } else {
        throw new Error(response.message || "Failed to load lead details");
      }
    } catch (err) {
      console.error("Error loading lead details:", err);
      setError("Failed to load lead details: " + err.message);
    } finally {
      setDetailsLoading(false);
    }
  }, [fetchAPI]);

  // Handle reopen lead
  const handleReopenClick = useCallback(async (lead) => {
    try {
      const response = await fetchAPI(`/lead/updateLead/${lead._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "New",
          lastContactedAt: new Date().toISOString(),
          notes: lead.notes ? `${lead.notes}\n[${new Date().toLocaleDateString()}] Lead reopened from Missed status` 
                           : `[${new Date().toLocaleDateString()}] Lead reopened from Missed status`
        })
      });

      if (response?.success) {
        setSuccess("Lead reopened successfully and marked as New!");
        
        const updatedLeads = missedLeads.filter(item => item._id !== lead._id);
        setMissedLeads(updatedLeads);
        calculateSummaryStats(updatedLeads);
        
        setTimeout(() => {
          fetchMissedLeads();
        }, 1000);
      } else {
        throw new Error(response?.message || "Failed to reopen lead");
      }
    } catch (err) {
      console.error("Error reopening lead:", err);
      setError("Failed to reopen lead: " + err.message);
    }
  }, [missedLeads, fetchAPI, fetchMissedLeads]);

  // Handle pagination change
  const handlePageChange = useCallback((event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  // Handle rows per page change
  const handleChangeRowsPerPage = useCallback((event) => {
    setPagination(prev => ({ 
      ...prev, 
      limit: parseInt(event.target.value, 10),
      page: 1 
    }));
  }, []);

  // Handle search on Enter key
  const handleSearchKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      setPagination(prev => ({ ...prev, page: 1 }));
      fetchMissedLeads();
    }
  }, [fetchMissedLeads]);

  // Handle sort
  const handleSort = useCallback((key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  // Handle priority checkbox change
  const handlePriorityCheckboxChange = useCallback((priority) => {
    setSelectedPriorities((prev) => ({
      ...prev,
      [priority]: !prev[priority],
    }));
  }, []);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setPriorityFilter("");
    setPeriod("Today");
    setDateFilter({ startDate: null, endDate: null });
    setDateFilterError("");
    setSelectedPriorities({
      High: true,
      Medium: true,
      Low: true,
    });
    setSortConfig({ key: null, direction: "asc" });
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Validate date range
  useEffect(() => {
    if (dateFilter.startDate && dateFilter.endDate) {
      const from = new Date(dateFilter.startDate);
      const to = new Date(dateFilter.endDate);
      const error = from > to ? "Start date cannot be after end date" : "";
      setDateFilterError(error);
    } else {
      setDateFilterError("");
    }
  }, [dateFilter.startDate, dateFilter.endDate]);

  // Download document function
  const handleDownload = useCallback((url, filename) => {
    if (!url) {
      setError("No document URL provided");
      return;
    }
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = filename || 'document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchMissedLeads();
  }, [fetchMissedLeads]);

  // Summary cards data
  const summaryCards = useMemo(() => [
    {
      label: "Total Missed",
      value: summaryStats.total,
      icon: <TrendingDown />,
      color: PRIMARY_COLOR,
      subText: "Leads lost",
    },
    {
      label: "High Priority",
      value: summaryStats.highPriority,
      icon: <PriorityHigh />,
      color: PRIORITY_CONFIG.High.color,
      subText: "30+ days inactive",
    },
    {
      label: "Avg Inactive Days",
      value: summaryStats.avgInactiveDays,
      icon: <AccessTime />,
      color: PRIORITY_CONFIG.Medium.color,
      subText: "Days without contact",
    },
    {
      label: "Can Reopen",
      value: summaryStats.reopenable,
      icon: <Restore />,
      color: PRIORITY_CONFIG.Low.color,
      subText: "Ready for recovery",
    },
  ], [summaryStats]);

  // Loading state
  if (loading && missedLeads.length === 0) {
    return <LoadingSkeleton />;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: { xs: 2, sm: 3 }, minHeight: "100vh" }}>
        {/* Header */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ mb: 4 }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          <Box>
            <Typography
              variant="h5"
              fontWeight={700}
              gutterBottom
              sx={{ color: PRIMARY_COLOR }}
            >
              Missed Leads Recovery
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track and recover lost opportunities with action plans
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={fetchMissedLeads}
              disabled={loading}
              sx={{
                background: PRIMARY_COLOR,
                color: "#fff",
                "&:hover": {
                  bgcolor: SECONDARY_COLOR,
                },
              }}
            >
              Refresh
            </Button>
          </Box>
        </Stack>

        {/* Period Selector */}
        <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 2, mb: 3 }}>
          {["Today", "This Week", "This Month", "All"].map((item) => (
            <Button
              key={item}
              variant={period === item ? "contained" : "outlined"}
              onClick={() => setPeriod(item)}
              size="small"
              sx={{
                minWidth: 'auto',
                whiteSpace: 'nowrap',
                borderRadius: 2,
                background: period === item ? PRIMARY_COLOR : 'transparent',
                borderColor: period === item ? PRIMARY_COLOR : 'divider',
                color: period === item ? '#fff' : 'text.primary',
                '&:hover': {
                  bgcolor: period === item ? SECONDARY_COLOR : alpha(PRIMARY_COLOR, 0.1),
                  borderColor: PRIMARY_COLOR,
                },
              }}
            >
              {item}
            </Button>
          ))}
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {summaryCards.map((card, index) => (
            <Grid item xs={6} sm={6} md={3} key={index}>
              <Card
                sx={{
                  borderRadius: 3,
                  overflow: "visible",
                  position: "relative",
                  border: `1px solid ${alpha(card.color, 0.1)}`,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
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
                          width: { xs: 40, sm: 48 },
                          height: { xs: 40, sm: 48 },
                          borderRadius: 2,
                          bgcolor: alpha(card.color, 0.1),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: card.color,
                        }}
                      >
                        {React.cloneElement(card.icon, { 
                          sx: { fontSize: { xs: 20, sm: 24 } } 
                        })}
                      </Box>
                      <Typography
                        variant="h4"
                        fontWeight={700}
                        sx={{ 
                          color: card.color,
                          fontSize: { xs: "1.5rem", sm: "2rem" }
                        }}
                      >
                        {card.value}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {card.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {card.subText}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Filters Card */}
        <Card sx={{ borderRadius: 3, mb: 4, overflow: "visible" }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack spacing={3}>
              {/* Top Filters Row */}
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                justifyContent="space-between"
                alignItems={{ xs: "stretch", md: "center" }}
              >
                <Box sx={{ width: { xs: "100%", md: 300 } }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search by name, phone, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search sx={{ color: "text.secondary" }} />
                        </InputAdornment>
                      ),
                      endAdornment: searchTerm && (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setSearchTerm("")}
                          >
                            <Close />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <Stack 
                  direction={{ xs: "column", sm: "row" }} 
                  spacing={2} 
                  flexWrap="wrap"
                >
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Priority</InputLabel>
                    <Select
                      value={priorityFilter}
                      label="Priority"
                      onChange={(e) => setPriorityFilter(e.target.value)}
                    >
                      <MenuItem value="">All Priorities</MenuItem>
                      {Object.keys(PRIORITY_CONFIG).map((priority) => (
                        <MenuItem key={priority} value={priority}>
                          {priority}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Button
                    variant="outlined"
                    startIcon={<Tune />}
                    onClick={() => setShowFilterPanel(!showFilterPanel)}
                    sx={{
                      borderColor: PRIMARY_COLOR,
                      color: PRIMARY_COLOR,
                      "&:hover": {
                        borderColor: SECONDARY_COLOR,
                        bgcolor: alpha(PRIMARY_COLOR, 0.05),
                      },
                    }}
                  >
                    {showFilterPanel ? "Hide Filters" : "More Filters"}
                  </Button>
                </Stack>
              </Stack>

              {/* Advanced Filter Panel */}
              {showFilterPanel && (
                <Paper
                  variant="outlined"
                  sx={{
                    p: { xs: 2, sm: 3 },
                    borderRadius: 2,
                    borderColor: "divider",
                    bgcolor: "grey.50",
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Advanced Filters
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <DatePicker
                        label="Start Date"
                        value={dateFilter.startDate}
                        onChange={(newValue) =>
                          setDateFilter((prev) => ({
                            ...prev,
                            startDate: newValue,
                          }))
                        }
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: "small",
                            error: !!dateFilterError,
                            helperText: dateFilterError,
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <DatePicker
                        label="End Date"
                        value={dateFilter.endDate}
                        onChange={(newValue) =>
                          setDateFilter((prev) => ({
                            ...prev,
                            endDate: newValue,
                          }))
                        }
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: "small",
                            error: !!dateFilterError,
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography
                        variant="subtitle2"
                        fontWeight={600}
                        gutterBottom
                      >
                        Priority
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        useFlexGap
                      >
                        {Object.keys(PRIORITY_CONFIG).map((priority) => (
                          <FormControlLabel
                            key={priority}
                            control={
                              <Checkbox
                                checked={selectedPriorities[priority]}
                                onChange={() =>
                                  handlePriorityCheckboxChange(priority)
                                }
                                size="small"
                                sx={{
                                  color: PRIORITY_CONFIG[priority].color,
                                  "&.Mui-checked": {
                                    color: PRIORITY_CONFIG[priority].color,
                                  },
                                }}
                              />
                            }
                            label={
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={0.5}
                              >
                                {PRIORITY_CONFIG[priority].icon}
                                <span>{priority}</span>
                              </Stack>
                            }
                          />
                        ))}
                      </Stack>
                    </Grid>
                  </Grid>
                  <Stack
                    direction="row"
                    spacing={2}
                    justifyContent="flex-end"
                    sx={{ mt: 3 }}
                  >
                    <Button
                      variant="outlined"
                      onClick={handleClearFilters}
                      startIcon={<Clear />}
                      sx={{
                        borderColor: PRIMARY_COLOR,
                        color: PRIMARY_COLOR,
                      }}
                    >
                      Clear All
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => setShowFilterPanel(false)}
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
                </Paper>
              )}

              {/* Active Filters */}
              {(searchTerm ||
                priorityFilter ||
                dateFilter.startDate ||
                dateFilter.endDate ||
                Object.values(selectedPriorities).some((v) => !v)) && (
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 1, display: "block" }}
                  >
                    Active Filters:
                  </Typography>
                  <Stack 
                    direction="row" 
                    spacing={1} 
                    flexWrap="wrap" 
                    useFlexGap
                  >
                    {searchTerm && (
                      <Chip
                        label={`Search: ${searchTerm}`}
                        size="small"
                        onDelete={() => setSearchTerm("")}
                        sx={{
                          bgcolor: alpha(PRIMARY_COLOR, 0.1),
                          color: PRIMARY_COLOR,
                        }}
                      />
                    )}
                    {priorityFilter && (
                      <Chip
                        label={`Priority: ${priorityFilter}`}
                        size="small"
                        onDelete={() => setPriorityFilter("")}
                        sx={{
                          bgcolor: alpha(PRIORITY_CONFIG[priorityFilter]?.color || PRIMARY_COLOR, 0.1),
                          color: PRIORITY_CONFIG[priorityFilter]?.color || PRIMARY_COLOR,
                        }}
                      />
                    )}
                    {dateFilter.startDate && (
                      <Chip
                        label={`From: ${format(
                          dateFilter.startDate,
                          "dd MMM yyyy",
                        )}`}
                        size="small"
                        onDelete={() =>
                          setDateFilter((prev) => ({
                            ...prev,
                            startDate: null,
                          }))
                        }
                        sx={{
                          bgcolor: alpha(PRIMARY_COLOR, 0.1),
                          color: PRIMARY_COLOR,
                        }}
                      />
                    )}
                    {dateFilter.endDate && (
                      <Chip
                        label={`To: ${format(
                          dateFilter.endDate,
                          "dd MMM yyyy",
                        )}`}
                        size="small"
                        onDelete={() =>
                          setDateFilter((prev) => ({
                            ...prev,
                            endDate: null,
                          }))
                        }
                        sx={{
                          bgcolor: alpha(PRIMARY_COLOR, 0.1),
                          color: PRIMARY_COLOR,
                        }}
                      />
                    )}
                    {Object.keys(selectedPriorities).some(
                      (priority) => !selectedPriorities[priority]
                    ) && (
                      <Chip
                        label="Custom Priority Filter"
                        size="small"
                        onDelete={() =>
                          setSelectedPriorities({
                            High: true,
                            Medium: true,
                            Low: true,
                          })
                        }
                        sx={{
                          bgcolor: alpha(PRIMARY_COLOR, 0.1),
                          color: PRIMARY_COLOR,
                        }}
                      />
                    )}
                    <Chip
                      label="Clear All"
                      size="small"
                      variant="outlined"
                      onClick={handleClearFilters}
                      deleteIcon={<Close />}
                      onDelete={handleClearFilters}
                      sx={{
                        borderColor: PRIMARY_COLOR,
                        color: PRIMARY_COLOR,
                      }}
                    />
                  </Stack>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Missed Leads List */}
        <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
          <CardContent sx={{ p: 0 }}>
            {/* Header */}
            <Box
              sx={{
                p: { xs: 2, sm: 3 },
                borderBottom: 1,
                borderColor: "divider",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Typography variant="h6" fontWeight={600}>
                Missed Leads ({filteredLeads.length})
              </Typography>
              <Stack 
                direction="row" 
                spacing={2} 
                alignItems="center"
                flexWrap="wrap"
              >
                <Typography variant="body2" color="text.secondary">
                  Show:
                </Typography>
                <Select
                  size="small"
                  value={pagination.limit}
                  onChange={handleChangeRowsPerPage}
                  sx={{ minWidth: 100 }}
                >
                  {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </Stack>
            </Box>

            {/* Content */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
                <CircularProgress />
              </Box>
            ) : filteredLeads.length === 0 ? (
              <Box sx={{ p: 6, textAlign: 'center' }}>
                <Box sx={{ 
                  width: 100, 
                  height: 100, 
                  borderRadius: '50%', 
                  bgcolor: alpha(PRIMARY_COLOR, 0.05), 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3
                }}>
                  <Info sx={{ fontSize: 48, color: 'text.disabled' }} />
                </Box>
                <Typography variant="h6" color="text.primary" gutterBottom>
                  No missed leads found
                </Typography>
                <Typography color="text.secondary" paragraph sx={{ maxWidth: 400, mx: 'auto', mb: 3 }}>
                  {searchTerm || priorityFilter || dateFilter.startDate || dateFilter.endDate || Object.values(selectedPriorities).some(v => !v)
                    ? "Try adjusting your search or filters"
                    : "Great! You have no missed leads to recover."
                  }
                </Typography>
                {(searchTerm || priorityFilter || dateFilter.startDate || dateFilter.endDate || Object.values(selectedPriorities).some(v => !v)) && (
                  <Button
                    variant="outlined"
                    onClick={handleClearFilters}
                    sx={{ borderColor: PRIMARY_COLOR, color: PRIMARY_COLOR }}
                  >
                    Clear All Filters
                  </Button>
                )}
              </Box>
            ) : isMobile ? (
              // Mobile View
              <Box sx={{ p: 2.5 }}>
                {paginatedLeads.map((lead) => (
                  <MobileLeadCard
                    key={lead._id}
                    lead={lead}
                    onView={handleViewClick}
                    onReopen={handleReopenClick}
                  />
                ))}
              </Box>
            ) : (
              // Desktop Table View
              <TableContainer
                sx={{
                  maxHeight: { xs: "60vh", md: "70vh" },
                  position: "relative",
                  overflowX: "auto",
                }}
              >
                <Table stickyHeader size="medium">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ minWidth: 200 }}>
                        <Button
                          fullWidth
                          size="small"
                          onClick={() => handleSort("fullName")}
                          endIcon={
                            sortConfig.key === "fullName" ? (
                              sortConfig.direction === "asc" ? (
                                <ArrowUpward fontSize="small" />
                              ) : (
                                <ArrowDownward fontSize="small" />
                              )
                            ) : null
                          }
                          sx={{
                            justifyContent: "flex-start",
                            fontWeight: 600,
                            color: "text.primary",
                            textTransform: "none",
                          }}
                        >
                          Customer
                        </Button>
                      </TableCell>
                      <TableCell sx={{ minWidth: 150 }}>
                        <Button
                          fullWidth
                          size="small"
                          onClick={() => handleSort("createdAt")}
                          endIcon={
                            sortConfig.key === "createdAt" ? (
                              sortConfig.direction === "asc" ? (
                                <ArrowUpward fontSize="small" />
                              ) : (
                                <ArrowDownward fontSize="small" />
                              )
                            ) : null
                          }
                          sx={{
                            justifyContent: "flex-start",
                            fontWeight: 600,
                            color: "text.primary",
                            textTransform: "none",
                          }}
                        >
                          Created Date
                        </Button>
                      </TableCell>
                      <TableCell sx={{ minWidth: 150 }}>
                        <Button
                          fullWidth
                          size="small"
                          onClick={() => handleSort("lastContactedAt")}
                          endIcon={
                            sortConfig.key === "lastContactedAt" ? (
                              sortConfig.direction === "asc" ? (
                                <ArrowUpward fontSize="small" />
                              ) : (
                                <ArrowDownward fontSize="small" />
                              )
                            ) : null
                          }
                          sx={{
                            justifyContent: "flex-start",
                            fontWeight: 600,
                            color: "text.primary",
                            textTransform: "none",
                          }}
                        >
                          Last Contact
                        </Button>
                      </TableCell>
                      <TableCell sx={{ minWidth: 150 }}>
                        <Button
                          fullWidth
                          size="small"
                          onClick={() => handleSort("daysInactive")}
                          endIcon={
                            sortConfig.key === "daysInactive" ? (
                              sortConfig.direction === "asc" ? (
                                <ArrowUpward fontSize="small" />
                              ) : (
                                <ArrowDownward fontSize="small" />
                              )
                            ) : null
                          }
                          sx={{
                            justifyContent: "flex-start",
                            fontWeight: 600,
                            color: "text.primary",
                            textTransform: "none",
                          }}
                        >
                          Priority
                        </Button>
                      </TableCell>
                      <TableCell sx={{ minWidth: 130 }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Stage
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ minWidth: 100 }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Actions
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedLeads.map((lead) => {
                      const priorityConfig = getPriorityConfig(lead.daysInactive || 0);
                      const stageConfig = getStageConfig(lead.status);

                      return (
                        <TableRow
                          key={lead._id}
                          hover
                          sx={{
                            "&:hover": {
                              bgcolor: alpha(PRIMARY_COLOR, 0.02),
                            },
                          }}
                        >
                          {/* Customer */}
                          <TableCell>
                            <Stack spacing={1}>
                              <Typography variant="subtitle2" fontWeight={600}>
                                {`${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Unnamed Lead'}
                              </Typography>
                              <Stack spacing={0.5}>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                    color: "text.secondary",
                                  }}
                                >
                                  <Email fontSize="inherit" />
                                  {lead.email || 'No email'}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                    color: "text.secondary",
                                  }}
                                >
                                  <Phone fontSize="inherit" />
                                  {lead.phone || 'No phone'}
                                </Typography>
                              </Stack>
                            </Stack>
                          </TableCell>

                          {/* Created Date */}
                          <TableCell>
                            <Stack spacing={0.5}>
                              <Typography variant="body2">
                                {formatDate(lead.createdAt)}
                              </Typography>
                            </Stack>
                          </TableCell>

                          {/* Last Contact */}
                          <TableCell>
                            <Stack spacing={0.5}>
                              <Typography variant="body2">
                                {formatDate(lead.lastContactedAt)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {lead.daysInactive || 0} days ago
                              </Typography>
                            </Stack>
                          </TableCell>

                          {/* Priority */}
                          <TableCell>
                            <Chip
                              label={priorityConfig.label}
                              size="small"
                              icon={priorityConfig.icon}
                              sx={{
                                bgcolor: priorityConfig.bgcolor,
                                color: priorityConfig.color,
                                fontWeight: 600,
                                minWidth: 80,
                              }}
                            />
                          </TableCell>

                          {/* Stage */}
                          <TableCell>
                            <Chip
                              label={stageConfig.label}
                              size="small"
                              icon={stageConfig.icon}
                              sx={{
                                bgcolor: stageConfig.bgcolor,
                                color: stageConfig.color,
                                fontWeight: 600,
                                minWidth: 100,
                              }}
                            />
                          </TableCell>

                          {/* Actions */}
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Tooltip title="View Details" arrow>
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewClick(lead)}
                                  sx={{
                                    bgcolor: alpha(PRIMARY_COLOR, 0.1),
                                    color: PRIMARY_COLOR,
                                    "&:hover": {
                                      bgcolor: alpha(PRIMARY_COLOR, 0.2),
                                    },
                                  }}
                                >
                                  <Visibility fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Pagination */}
            {filteredLeads.length > 0 && (
              <Box
                sx={{
                  p: { xs: 2, sm: 3 },
                  borderTop: 1,
                  borderColor: "divider",
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    bgcolor: alpha(PRIMARY_COLOR, 0.1), 
                    color: PRIMARY_COLOR, 
                    px: 2, 
                    py: 1, 
                    borderRadius: 4,
                    textAlign: "center",
                    width: { xs: "100%", sm: "auto" }
                  }}
                >
                  Showing {Math.min((pagination.page - 1) * pagination.limit + 1, filteredLeads.length)} to{" "}
                  {Math.min(pagination.page * pagination.limit, filteredLeads.length)} of{" "}
                  {filteredLeads.length} entries
                </Typography>
                <Pagination 
                  count={Math.ceil(filteredLeads.length / pagination.limit)}
                  page={pagination.page}
                  onChange={handlePageChange}
                  showFirstButton
                  showLastButton
                  siblingCount={1}
                  boundaryCount={1}
                  size={isTablet ? "small" : "medium"}
                  sx={{
                    "& .MuiPaginationItem-root": {
                      borderRadius: 2,
                      "&.Mui-selected": {
                        bgcolor: PRIMARY_COLOR,
                        color: "#fff",
                        "&:hover": {
                          bgcolor: SECONDARY_COLOR,
                        },
                      },
                    },
                  }}
                />
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Footer Note */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 3, display: "block", textAlign: "center" }}
        >
          Last updated: {formatDate(new Date().toISOString())} •{" "}
          {summaryStats.total} missed leads
        </Typography>

        {/* View Details Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="lg"
          fullWidth
          fullScreen={isMobile}
          PaperProps={{
            sx: { 
              borderRadius: isMobile ? 0 : 3,
              overflow: 'hidden',
              maxHeight: '90vh'
            }
          }}
        >
          <DialogTitle sx={{ 
            bgcolor: PRIMARY_COLOR,
            color: "white",
            pb: 2,
          }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: "white", color: PRIMARY_COLOR }}>
                  {selectedLead?.firstName?.[0] || "L"}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    {selectedLead ? `${selectedLead.firstName || ''} ${selectedLead.lastName || ''}`.trim() : 'Lead Details'}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    Complete Information
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={() => setViewDialogOpen(false)} size="small" sx={{ color: "white" }}>
                <Close />
              </IconButton>
            </Stack>
          </DialogTitle>
          
          <DialogContent dividers sx={{ p: 0 }}>
            {detailsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ p: 3, maxHeight: "60vh", overflow: "auto" }}>
                {/* Basic Information */}
                <Accordion defaultExpanded sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Person sx={{ color: PRIMARY_COLOR }} />
                      <Typography variant="subtitle1" fontWeight={600}>
                        Basic Information
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <List dense>
                          <ListItem>
                            <ListItemIcon>
                              <Person />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Full Name" 
                              secondary={selectedLead ? `${selectedLead.firstName || ''} ${selectedLead.lastName || ''}`.trim() || 'Not Available' : 'Not Available'} 
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <Email />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Email" 
                              secondary={selectedLead?.email || 'Not Available'} 
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <Phone />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Phone" 
                              secondary={selectedLead?.phone || 'Not Available'} 
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <Home />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Address" 
                              secondary={selectedLead?.address || 'Not Available'} 
                            />
                          </ListItem>
                        </List>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <List dense>
                          <ListItem>
                            <ListItemIcon>
                              <LocationOn />
                            </ListItemIcon>
                            <ListItemText 
                              primary="City" 
                              secondary={selectedLead?.city || 'Not Available'} 
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <LocationOn />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Pincode" 
                              secondary={selectedLead?.pincode || 'Not Available'} 
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <Build />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Solar Requirement" 
                              secondary={selectedLead?.solarRequirement || 'Not Available'} 
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <CalendarToday />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Created Date" 
                              secondary={formatDate(selectedLead?.createdAt, "dd MMM yyyy, HH:mm:ss")} 
                            />
                          </ListItem>
                        </List>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>

                {/* Current Status */}
                <Accordion sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Timeline sx={{ color: PRIMARY_COLOR }} />
                      <Typography variant="subtitle1" fontWeight={600}>
                        Current Status & Timeline
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Current Status
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                            <StageChip status={selectedLead?.status} />
                            <PriorityChip daysInactive={selectedLead?.daysInactive || 0} />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Last Contacted: {formatDate(selectedLead?.lastContactedAt, "dd MMM yyyy, HH:mm:ss")}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Days Inactive: {selectedLead?.daysInactive || 0} days
                          </Typography>
                        </Card>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            System Information
                          </Typography>
                          <List dense>
                            <ListItem>
                              <ListItemIcon>
                                <Person />
                              </ListItemIcon>
                              <ListItemText 
                                primary="Assigned Manager" 
                                secondary={selectedLead?.assignedManager ? formatDisplayName(selectedLead.assignedManager) : 'Not Assigned'} 
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon>
                                <Person />
                              </ListItemIcon>
                              <ListItemText 
                                primary="Assigned User" 
                                secondary={selectedLead?.assignedUser ? formatDisplayName(selectedLead.assignedUser) : 'Not Assigned'} 
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon>
                                <Event />
                              </ListItemIcon>
                              <ListItemText 
                                primary="Updated At" 
                                secondary={formatDate(selectedLead?.updatedAt, "dd MMM yyyy, HH:mm:ss")} 
                              />
                            </ListItem>
                          </List>
                        </Card>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>

                {/* Document Information */}
                {(selectedLead?.aadhaar?.url || selectedLead?.panCard?.url || selectedLead?.passbook?.url) && (
                  <Accordion sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <FolderOpen sx={{ color: "#d32f2f" }} />
                        <Typography variant="subtitle1" fontWeight={600}>
                          Document Information
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        {selectedLead?.aadhaar?.url && (
                          <Grid item xs={12} sm={6} md={4}>
                            <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                <BadgeIcon sx={{ color: '#f57c00' }} />
                                <Typography variant="body2" fontWeight={600}>
                                  Aadhaar Card
                                </Typography>
                              </Box>
                              <Button
                                fullWidth
                                size="small"
                                variant="outlined"
                                startIcon={<OpenInNew />}
                                onClick={() => handleDownload(selectedLead.aadhaar.url, 'aadhaar-card')}
                              >
                                View Document
                              </Button>
                            </Card>
                          </Grid>
                        )}
                        {selectedLead?.panCard?.url && (
                          <Grid item xs={12} sm={6} md={4}>
                            <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                <CreditCard sx={{ color: '#1976d2' }} />
                                <Typography variant="body2" fontWeight={600}>
                                  PAN Card
                                </Typography>
                              </Box>
                              <Button
                                fullWidth
                                size="small"
                                variant="outlined"
                                startIcon={<OpenInNew />}
                                onClick={() => handleDownload(selectedLead.panCard.url, 'pan-card')}
                              >
                                View Document
                              </Button>
                            </Card>
                          </Grid>
                        )}
                        {selectedLead?.passbook?.url && (
                          <Grid item xs={12} sm={6} md={4}>
                            <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                <ReceiptLong sx={{ color: '#388e3c' }} />
                                <Typography variant="body2" fontWeight={600}>
                                  Bank Passbook
                                </Typography>
                              </Box>
                              <Button
                                fullWidth
                                size="small"
                                variant="outlined"
                                startIcon={<OpenInNew />}
                                onClick={() => handleDownload(selectedLead.passbook.url, 'passbook')}
                              >
                                View Document
                              </Button>
                            </Card>
                          </Grid>
                        )}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                )}

                {/* Notes */}
                {selectedLead?.notes && (
                  <Accordion sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Note sx={{ color: "#757575" }} />
                        <Typography variant="subtitle1" fontWeight={600}>
                          Notes
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Paper sx={{ p: 3, bgcolor: "grey.50", borderRadius: 2 }}>
                        <Typography
                          variant="body1"
                          style={{ whiteSpace: "pre-wrap" }}
                        >
                          {selectedLead.notes}
                        </Typography>
                      </Paper>
                    </AccordionDetails>
                  </Accordion>
                )}
              </Box>
            )}
          </DialogContent>
          
          <DialogActions sx={{ p: 3, bgcolor: 'grey.50', borderTop: 1, borderColor: 'divider' }}>
            <Button 
              onClick={() => setViewDialogOpen(false)}
              variant="outlined"
              sx={{ 
                borderRadius: 2,
                px: 3,
                borderColor: PRIMARY_COLOR,
                color: PRIMARY_COLOR,
              }}
            >
              Close
            </Button>
            {(selectedLead?.canReopen !== false) && (
              <Button
                variant="contained"
                startIcon={<Restore />}
                onClick={() => {
                  handleReopenClick(selectedLead);
                  setViewDialogOpen(false);
                }}
                sx={{ 
                  bgcolor: PRIORITY_CONFIG.Low.color,
                  borderRadius: 2,
                  px: 4,
                  fontWeight: 600,
                  '&:hover': { 
                    bgcolor: '#388e3c',
                  },
                }}
              >
                Reopen Lead
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Snackbars */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={() => setError(null)}
            severity="error"
            sx={{ 
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
            variant="filled"
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Error />
              <Typography fontWeight={600}>{error}</Typography>
            </Box>
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!success}
          autoHideDuration={4000}
          onClose={() => setSuccess(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={() => setSuccess(null)}
            severity="success"
            sx={{ 
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
            variant="filled"
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle />
              <Typography fontWeight={600}>{success}</Typography>
            </Box>
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
}