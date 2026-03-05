// pages/UnifiedDashboard.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Stack,
  Paper,
  Chip,
  useTheme,
  useMediaQuery,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  alpha,
  Skeleton,
  Alert,
  AlertTitle,
  Container,
  Divider,
  LinearProgress,
  Tooltip,
  Fab,
  SwipeableDrawer,
  BottomNavigation,
  BottomNavigationAction,
  Badge,
} from "@mui/material";
import {
  Visibility,
  PersonAdd,
  AccountBalance,
  Description,
  Payments,
  CheckCircle,
  TrendingUp,
  Mail,
  Phone,
  ArrowUpward,
  ArrowDownward,
  Today,
  CalendarMonth,
  Event,
  Refresh,
  NavigateNext,
  TrendingFlat,
  AccessTime,
  TaskAlt,
  Cancel,
  AssignmentTurnedIn,
  Info,
  Schedule,
  Dashboard as DashboardIcon,
  Group,
  PeopleAlt,
  Warning,
  ReceiptLong,
  PendingActions,
  Assessment,
  Timeline,
  PieChart,
  BarChart,
  Settings,
  MoreVert,
  Search,
  FilterList,
  Download,
  Share,
  Star,
  StarBorder,
  Verified,
  Home,
  Menu as MenuIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../contexts/DashboardContext";
import { useAuth } from "../contexts/AuthContext";

// Single color for entire dashboard
const PRIMARY_COLOR = "#4569ea";
const SECONDARY_COLOR = "#f5f7ff";
const SUCCESS_COLOR = "#4caf50";
const WARNING_COLOR = "#ff9800";
const ERROR_COLOR = "#f44336";

const getInitials = (name) => {
  if (!name || typeof name !== "string") return "??";
  return name
    .split(" ")
    .map((n) => n?.[0] || "")
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

// Period options with icons
const PERIOD_OPTIONS = [
  { value: "today", label: "Today", icon: <Today fontSize="small" /> },
  { value: "weekly", label: "Weekly", icon: <CalendarMonth fontSize="small" /> },
  { value: "monthly", label: "Monthly", icon: <Event fontSize="small" /> },
  { value: "yearly", label: "Yearly", icon: <AccessTime fontSize="small" /> },
];

// Quick action items for mobile
const QUICK_ACTIONS = [
  { label: "New Visit", icon: <Visibility />, path: "/create-visit" },
  { label: "Registration", icon: <PersonAdd />, path: "/registration" },
  { label: "Bank Loan", icon: <AccountBalance />, path: "/bank-loan-apply" },
  { label: "Document", icon: <Description />, path: "/document-submission" },
];

// Empty State Components
const EmptyStateCard = ({ title, message, icon, action, isMobile }) => (
  <Card
    sx={{
      borderRadius: { xs: 2, sm: 3 },
      boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
      bgcolor: "white",
      border: "1px solid #edf2f7",
      height: "100%",
      minHeight: { xs: 180, sm: 250, md: 300 },
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      p: { xs: 2, sm: 3, md: 4 },
    }}
  >
    <Box sx={{ textAlign: "center" }}>
      <Box sx={{ 
        color: alpha(PRIMARY_COLOR, 0.5), 
        mb: { xs: 1, sm: 2 },
        '& svg': { fontSize: { xs: 32, sm: 40, md: 48 } }
      }}>
        {icon}
      </Box>
      <Typography 
        variant={isMobile ? "subtitle1" : "h6"} 
        color="text.secondary" 
        gutterBottom 
        fontWeight={600}
        sx={{ fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.25rem' } }}
      >
        {title}
      </Typography>
      <Typography 
        variant="body2" 
        color="text.secondary" 
        sx={{ 
          mb: { xs: 2, sm: 3 }, 
          maxWidth: { xs: 220, sm: 280, md: 300 },
          fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' }
        }}
      >
        {message}
      </Typography>
      {action}
    </Box>
  </Card>
);

// Stat Card Component - Fully Responsive
const StatCard = ({ stat, onClick, isMobile }) => (
  <Card
    sx={{
      borderRadius: { xs: 2, sm: 2.5, md: 3 },
      boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
      height: "100%",
      width: "100%",
      transition: "all 0.3s ease",
      cursor: "pointer",
      bgcolor: "white",
      border: "1px solid #edf2f7",
      "&:hover": {
        transform: { xs: "none", sm: "translateY(-4px)" },
        boxShadow: `0 8px 30px ${alpha(PRIMARY_COLOR, 0.15)}`,
        borderColor: alpha(PRIMARY_COLOR, 0.3),
      },
      "&:active": {
        transform: "scale(0.98)",
      },
    }}
    onClick={onClick}
  >
    <CardContent sx={{ p: { xs: 1.25, sm: 1.5, md: 2, lg: 2.5 } }}>
      <Box sx={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "flex-start", 
        mb: { xs: 0.5, sm: 1, md: 1.5 } 
      }}>
        <Box>
          <Typography 
            variant="h4" 
            fontWeight="700" 
            color={PRIMARY_COLOR} 
            sx={{ 
              fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem", lg: "1.75rem", xl: "2rem" } 
            }}
          >
            {stat.value}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            fontWeight="500" 
            sx={{ 
              mt: 0.25,
              fontSize: { xs: "0.6rem", sm: "0.65rem", md: "0.75rem", lg: "0.875rem" },
              lineHeight: 1.2,
            }}
          >
            {stat.title}
          </Typography>
        </Box>
        <Box
          sx={{
            p: { xs: 0.75, sm: 1, md: 1.25, lg: 1.5 },
            borderRadius: { xs: 1.5, sm: 1.5, md: 2 },
            bgcolor: alpha(PRIMARY_COLOR, 0.1),
            color: PRIMARY_COLOR,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {React.cloneElement(stat.icon, { 
            sx: { fontSize: { xs: 16, sm: 18, md: 20, lg: 24 } } 
          })}
        </Box>
      </Box>

      <Box sx={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between",
        mt: { xs: 0.25, sm: 0.5, md: 1 }
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
          {stat.trend === "up" ? (
            <ArrowUpward sx={{ fontSize: { xs: 10, sm: 10, md: 12, lg: 14 }, color: SUCCESS_COLOR }} />
          ) : stat.trend === "down" ? (
            <ArrowDownward sx={{ fontSize: { xs: 10, sm: 10, md: 12, lg: 14 }, color: ERROR_COLOR }} />
          ) : (
            <TrendingFlat sx={{ fontSize: { xs: 10, sm: 10, md: 12, lg: 14 }, color: "text.secondary" }} />
          )}
          <Typography 
            variant="caption" 
            fontWeight="600" 
            color={stat.trend === "up" ? SUCCESS_COLOR : stat.trend === "down" ? ERROR_COLOR : "text.secondary"}
            sx={{ fontSize: { xs: "0.5rem", sm: "0.55rem", md: "0.6rem", lg: "0.7rem" } }}
          >
            {stat.change}
          </Typography>
        </Box>
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ fontSize: { xs: "0.5rem", sm: "0.55rem", md: "0.6rem", lg: "0.7rem" } }}
        >
          {stat.subtitle}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

// Mobile Stat Card - Horizontal Layout for very small screens
const MobileStatCard = ({ stat, onClick }) => (
  <Paper
    elevation={0}
    sx={{
      p: 1.5,
      borderRadius: 2,
      bgcolor: "white",
      border: "1px solid #edf2f7",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      cursor: "pointer",
      width: 160,
      flexShrink: 0,
      "&:active": {
        bgcolor: alpha(PRIMARY_COLOR, 0.05),
      },
    }}
    onClick={onClick}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Box
        sx={{
          p: 1,
          borderRadius: 1.5,
          bgcolor: alpha(PRIMARY_COLOR, 0.1),
          color: PRIMARY_COLOR,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {React.cloneElement(stat.icon, { sx: { fontSize: 20 } })}
      </Box>
      <Box>
        <Typography variant="subtitle2" fontWeight="600" color={PRIMARY_COLOR} sx={{ fontSize: '0.9rem' }}>
          {stat.value}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
          {stat.title}
        </Typography>
      </Box>
    </Box>
    <Box sx={{ textAlign: "right" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, justifyContent: "flex-end" }}>
        {stat.trend === "up" ? (
          <ArrowUpward sx={{ fontSize: 10, color: SUCCESS_COLOR }} />
        ) : stat.trend === "down" ? (
          <ArrowDownward sx={{ fontSize: 10, color: ERROR_COLOR }} />
        ) : (
          <TrendingFlat sx={{ fontSize: 10, color: "text.secondary" }} />
        )}
        <Typography variant="caption" fontWeight="600" sx={{ fontSize: '0.6rem' }} color={stat.trend === "up" ? SUCCESS_COLOR : stat.trend === "down" ? ERROR_COLOR : "text.secondary"}>
          {stat.change}
        </Typography>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.55rem" }}>
        {stat.subtitle}
      </Typography>
    </Box>
  </Paper>
);

// Activity Card Component - Fully Responsive
const ActivityCard = ({ activity, isMobile }) => (
  <Paper
    sx={{
      p: { xs: 1.5, sm: 1.5, md: 2 },
      borderRadius: { xs: 1.5, sm: 1.5, md: 2 },
      border: `1px solid ${alpha(PRIMARY_COLOR, 0.1)}`,
      bgcolor: alpha(PRIMARY_COLOR, 0.02),
      transition: "all 0.2s ease",
      "&:hover": {
        borderColor: alpha(PRIMARY_COLOR, 0.3),
        bgcolor: alpha(PRIMARY_COLOR, 0.04),
        transform: { xs: "none", sm: "translateX(4px)" },
      },
      "&:active": {
        bgcolor: alpha(PRIMARY_COLOR, 0.08),
      },
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 1.5, md: 2 } }}>
      <Avatar
        sx={{
          bgcolor: alpha(PRIMARY_COLOR, 0.1),
          color: PRIMARY_COLOR,
          width: { xs: 32, sm: 36, md: 40 },
          height: { xs: 32, sm: 36, md: 40 },
          fontSize: { xs: "0.8rem", sm: "0.85rem", md: "0.9rem" },
          fontWeight: "bold",
        }}
      >
        {getInitials(activity.leadName)}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          mb: 0.25,
          flexWrap: "wrap",
          gap: 0.5,
        }}>
          <Typography 
            variant="subtitle2" 
            fontWeight="600" 
            color={PRIMARY_COLOR}
            sx={{ fontSize: { xs: "0.8rem", sm: "0.85rem", md: "0.9rem" } }}
          >
            {activity.leadName}
          </Typography>
          <Chip
            label={activity.status}
            size="small"
            sx={{
              height: { xs: 20, sm: 20, md: 24 },
              fontSize: { xs: "0.6rem", sm: "0.6rem", md: "0.7rem" },
              fontWeight: 600,
              bgcolor: alpha(PRIMARY_COLOR, 0.1),
              color: PRIMARY_COLOR,
            }}
          />
        </Box>
        <Typography 
          variant="caption" 
          color="text.secondary" 
          sx={{ 
            display: "block", 
            mb: 0.25,
            fontSize: { xs: "0.7rem", sm: "0.7rem", md: "0.75rem" },
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {activity.description || "Activity updated"}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <AccessTime sx={{ fontSize: { xs: 10, sm: 10, md: 12 }, color: "text.secondary" }} />
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ fontSize: { xs: "0.6rem", sm: "0.6rem", md: "0.7rem" } }}
          >
            {activity.updatedAt ? new Date(activity.updatedAt).toLocaleString() : "Just now"}
          </Typography>
        </Box>
      </Box>
    </Box>
  </Paper>
);

// Team Member Card Component - Fully Responsive
const TeamMemberCard = ({ member, isMobile }) => (
  <Paper
    sx={{
      p: { xs: 1.5, sm: 1.5, md: 2 },
      borderRadius: { xs: 1.5, sm: 1.5, md: 2 },
      border: `1px solid ${alpha(PRIMARY_COLOR, 0.1)}`,
      bgcolor: "white",
      transition: "all 0.2s ease",
      height: '100%',
      "&:hover": {
        transform: { xs: "none", sm: "translateY(-2px)" },
        boxShadow: `0 4px 20px ${alpha(PRIMARY_COLOR, 0.1)}`,
        borderColor: alpha(PRIMARY_COLOR, 0.3),
      },
      "&:active": {
        transform: "scale(0.98)",
      },
    }}
  >
    <Box sx={{ 
      display: "flex", 
      alignItems: "center", 
      gap: { xs: 1.5, sm: 1.5, md: 2 }, 
      mb: { xs: 1.5, sm: 1.5, md: 2 } 
    }}>
      <Avatar
        sx={{
          bgcolor: alpha(PRIMARY_COLOR, 0.1),
          color: PRIMARY_COLOR,
          width: { xs: 40, sm: 44, md: 48 },
          height: { xs: 40, sm: 44, md: 48 },
          fontSize: { xs: "0.9rem", sm: "0.95rem", md: "1rem" },
          fontWeight: "bold",
        }}
      >
        {getInitials(`${member.firstName || ""} ${member.lastName || ""}`)}
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography 
          variant="subtitle2" 
          fontWeight="600" 
          color={PRIMARY_COLOR}
          sx={{ 
            fontSize: { xs: "0.85rem", sm: "0.9rem", md: "1rem" },
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {member.firstName || ""} {member.lastName || ""}
        </Typography>
        <Typography 
          variant="caption" 
          color="text.secondary" 
          sx={{ 
            display: "block",
            fontSize: { xs: "0.7rem", sm: "0.7rem", md: "0.75rem" },
          }}
        >
          {member.role || "Team Member"}
        </Typography>
      </Box>
    </Box>

    <Box sx={{ 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "space-between", 
      mb: 1,
      flexWrap: "wrap",
      gap: 0.5,
    }}>
      <Chip
        label={member.status === "active" ? "Active" : "Inactive"}
        size="small"
        sx={{
          fontSize: { xs: "0.6rem", sm: "0.6rem", md: "0.7rem" },
          fontWeight: 600,
          height: { xs: 20, sm: 22, md: 24 },
          bgcolor: member.status === "active" ? alpha(SUCCESS_COLOR, 0.1) : alpha(ERROR_COLOR, 0.1),
          color: member.status === "active" ? SUCCESS_COLOR : ERROR_COLOR,
        }}
      />
      {member.performance && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
          <Star sx={{ fontSize: { xs: 12, sm: 12, md: 14 }, color: WARNING_COLOR }} />
          <Typography variant="caption" fontWeight="600" sx={{ fontSize: { xs: "0.6rem", sm: "0.65rem", md: "0.7rem" } }}>
            {member.performance}%
          </Typography>
        </Box>
      )}
    </Box>

    {member.email && (
      <Box sx={{ 
        display: "flex", 
        alignItems: "center", 
        gap: 0.5,
        minWidth: 0,
      }}>
        <Mail sx={{ fontSize: { xs: 12, sm: 12, md: 14 }, color: alpha(PRIMARY_COLOR, 0.6) }} />
        <Typography 
          variant="caption" 
          color="text.secondary" 
          sx={{ 
            fontSize: { xs: "0.65rem", sm: "0.7rem", md: "0.75rem" },
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {member.email}
        </Typography>
      </Box>
    )}
  </Paper>
);

// Mobile Quick Actions Drawer
const QuickActionsDrawer = ({ open, onClose, navigate }) => (
  <SwipeableDrawer
    anchor="bottom"
    open={open}
    onClose={onClose}
    onOpen={() => {}}
    disableSwipeToOpen={false}
    swipeAreaWidth={30}
    PaperProps={{
      sx: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '70vh',
      }
    }}
  >
    <Box sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight="600" color={PRIMARY_COLOR} sx={{ fontSize: '1.1rem' }}>
          Quick Actions
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>
      <Grid container spacing={1.5}>
        {QUICK_ACTIONS.map((action, index) => (
          <Grid item xs={6} key={index}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(PRIMARY_COLOR, 0.05),
                border: `1px solid ${alpha(PRIMARY_COLOR, 0.1)}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
                '&:active': {
                  bgcolor: alpha(PRIMARY_COLOR, 0.1),
                },
              }}
              onClick={() => {
                navigate(action.path);
                onClose();
              }}
            >
              <Box sx={{ color: PRIMARY_COLOR, '& svg': { fontSize: 24 } }}>
                {action.icon}
              </Box>
              <Typography variant="caption" fontWeight="500" sx={{ fontSize: '0.75rem' }}>
                {action.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  </SwipeableDrawer>
);

// Mobile Filter Drawer
const FilterDrawer = ({ open, onClose, timeFilter, onFilterChange }) => (
  <SwipeableDrawer
    anchor="bottom"
    open={open}
    onClose={onClose}
    onOpen={() => {}}
    PaperProps={{
      sx: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      }
    }}
  >
    <Box sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight="600" color={PRIMARY_COLOR} sx={{ fontSize: '1.1rem' }}>
          Select Time Period
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>
      <Stack spacing={1}>
        {PERIOD_OPTIONS.map((option) => (
          <Paper
            key={option.value}
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: timeFilter === option.value ? alpha(PRIMARY_COLOR, 0.1) : 'transparent',
              border: `1px solid ${timeFilter === option.value ? PRIMARY_COLOR : alpha(PRIMARY_COLOR, 0.1)}`,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              cursor: 'pointer',
              '&:active': {
                bgcolor: alpha(PRIMARY_COLOR, 0.15),
              },
            }}
            onClick={() => {
              onFilterChange(null, option.value);
              onClose();
            }}
          >
            <Box sx={{ color: timeFilter === option.value ? PRIMARY_COLOR : 'text.secondary' }}>
              {option.icon}
            </Box>
            <Typography 
              fontWeight={timeFilter === option.value ? 600 : 400}
              color={timeFilter === option.value ? PRIMARY_COLOR : 'text.primary'}
              sx={{ fontSize: '0.95rem' }}
            >
              {option.label}
            </Typography>
          </Paper>
        ))}
      </Stack>
    </Box>
  </SwipeableDrawer>
);

// Mobile Bottom Navigation
const MobileBottomNav = ({ value, onChange }) => (
  <Paper
    sx={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      borderTop: '1px solid #edf2f7',
      display: { xs: 'block', sm: 'none' },
    }}
    elevation={3}
  >
    <BottomNavigation
      value={value}
      onChange={onChange}
      showLabels
      sx={{
        height: 60,
        '& .MuiBottomNavigationAction-root': {
          color: 'text.secondary',
          minWidth: 'auto',
          '&.Mui-selected': {
            color: PRIMARY_COLOR,
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.7rem',
            '&.Mui-selected': {
              fontSize: '0.7rem',
            },
          },
        },
      }}
    >
      <BottomNavigationAction label="Home" icon={<Home sx={{ fontSize: 20 }} />} />
      <BottomNavigationAction label="Stats" icon={<BarChart sx={{ fontSize: 20 }} />} />
      <BottomNavigationAction 
        label="Actions" 
        icon={
          <Badge badgeContent={4} color="primary" variant="dot">
            <MenuIcon sx={{ fontSize: 20 }} />
          </Badge>
        } 
      />
      <BottomNavigationAction label="Team" icon={<Group sx={{ fontSize: 20 }} />} />
    </BottomNavigation>
  </Paper>
);

export default function UnifiedDashboard() {
  const theme = useTheme();
  const navigate = useNavigate();

  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const { user } = useAuth();
  const {
    dashboardData,
    loading,
    error,
    fetchDashboardData,
    refreshDashboard,
    formatDateTime,
    getRoleDisplayName,
  } = useDashboard();

  // State
  const [timeFilter, setTimeFilter] = useState("today");
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState([]);
  const [mobileNavValue, setMobileNavValue] = useState(0);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // Fetch data on mount
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle time filter change
  const handleTimeFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setTimeFilter(newFilter);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshDashboard();
    setRefreshing(false);
  };

  // Navigation handlers
  const handleNavigateTo = (path) => {
    navigate(path);
  };

  // Process stats data based on API response
  useEffect(() => {
    if (dashboardData?.overview) {
      const processedStats = processStats();
      setStats(processedStats);
    }
  }, [dashboardData, timeFilter, user?.role]);

  // Process stats based on dashboard data and user role
  const processStats = () => {
    try {
      if (!dashboardData?.overview) {
        return [];
      }

      const { overview } = dashboardData;
      const userRole = user?.role;

      const baseStats = [
        {
          title: "Total Visits",
          value: (overview.totalVisits || 0).toLocaleString(),
          change: overview.totalVisits > 0 ? "+8.2%" : "0%",
          trend: overview.totalVisits > 0 ? "up" : "flat",
          icon: <Visibility />,
          subtitle: getTimeSubtitle(),
          navigateTo: "/total-visits",
        },
        {
          title: "Registrations",
          value: (overview.totalRegistrations || 0).toLocaleString(),
          change: overview.totalRegistrations > 0 ? "+15.5%" : "0%",
          trend: overview.totalRegistrations > 0 ? "up" : "flat",
          icon: <PersonAdd />,
          subtitle: getTimeSubtitle(),
          navigateTo: "/registration",
        },
        {
          title: "Missed Leads",
          value: (overview.totalMissedLeads || 0).toLocaleString(),
          change: overview.totalMissedLeads > 0 ? "+5.3%" : "0%",
          trend: overview.totalMissedLeads > 0 ? "up" : "down",
          icon: <Cancel />,
          subtitle: getTimeSubtitle(),
          navigateTo: "/missed-leads",
        },
      ];

      let roleSpecificStats = [];

      if (userRole === "Head_office" || userRole === "ZSM") {
        roleSpecificStats = [
          {
            title: "Bank Loans",
            value: (overview.totalBankLoanApply || 0).toLocaleString(),
            change: overview.totalBankLoanApply > 0 ? "+5.2%" : "0%",
            trend: overview.totalBankLoanApply > 0 ? "up" : "flat",
            icon: <AccountBalance />,
            subtitle: getTimeSubtitle(),
            navigateTo: "/bank-loan-apply",
          },
          {
            title: "Documents",
            value: (overview.totalDocumentSubmission || 0).toLocaleString(),
            change: overview.totalDocumentSubmission > 0 ? "+12.1%" : "0%",
            trend: overview.totalDocumentSubmission > 0 ? "up" : "flat",
            icon: <Description />,
            subtitle: getTimeSubtitle(),
            navigateTo: "/document-submission",
          },
          {
            title: "Disbursement",
            value: `₹${(overview.totalDisbursement || 0).toLocaleString("en-IN")}`,
            change: overview.totalDisbursement > 0 ? "+18.3%" : "0%",
            trend: overview.totalDisbursement > 0 ? "up" : "flat",
            icon: <Payments />,
            subtitle: getTimeSubtitle(),
            navigateTo: "/disbursement",
          },
          {
            title: "Installations",
            value: (overview.totalInstallations || 0).toLocaleString(),
            change: overview.totalInstallations > 0 ? "+8.7%" : "0%",
            trend: overview.totalInstallations > 0 ? "up" : "flat",
            icon: <CheckCircle />,
            subtitle: getTimeSubtitle(),
            navigateTo: "/installation-completion",
          },
          {
            title: "Team Members",
            value: (overview.totalTeamMembers || 0).toLocaleString(),
            change: overview.totalTeamMembers > 0 ? "+3.1%" : "0%",
            trend: overview.totalTeamMembers > 0 ? "up" : "flat",
            icon: <Group />,
            subtitle: "Active members",
            navigateTo: "/team-members",
          },
        ];
      } else if (userRole === "ASM") {
        roleSpecificStats = [
          {
            title: "My Team",
            value: (overview.totalTeamMembers || 0).toLocaleString(),
            change: overview.totalTeamMembers > 0 ? "+2.4%" : "0%",
            trend: overview.totalTeamMembers > 0 ? "up" : "flat",
            icon: <Group />,
            subtitle: "Under management",
            navigateTo: "/my-team",
          },
          {
            title: "Total Leads",
            value: (overview.totalLeads || 0).toLocaleString(),
            change: overview.totalLeads > 0 ? "+10.2%" : "0%",
            trend: overview.totalLeads > 0 ? "up" : "flat",
            icon: <AssignmentTurnedIn />,
            subtitle: getTimeSubtitle(),
            navigateTo: "/all-leads",
          },
          {
            title: "Conversion",
            value: overview.conversionRate ? `${overview.conversionRate}%` : "0%",
            change: "+5.3%",
            trend: "up",
            icon: <TrendingUp />,
            subtitle: "Visit to Registration",
            navigateTo: "/performance",
          },
        ];
      } else if (userRole === "TEAM") {
        roleSpecificStats = [
          {
            title: "My Leads",
            value: (overview.totalLeads || 0).toLocaleString(),
            change: overview.totalLeads > 0 ? "+10.2%" : "0%",
            trend: overview.totalLeads > 0 ? "up" : "flat",
            icon: <AssignmentTurnedIn />,
            subtitle: getTimeSubtitle(),
            navigateTo: "/all-leads",
          },
          {
            title: "Today's Target",
            value: overview.todaysTarget?.toString() || "0/5",
            change: "+20%",
            trend: "up",
            icon: <TaskAlt />,
            subtitle: "Visits completed",
            navigateTo: "/my-targets",
          },
          {
            title: "My Performance",
            value: overview.conversionRate ? `${overview.conversionRate}%` : "0%",
            change: "+3.2%",
            trend: "up",
            icon: <Assessment />,
            subtitle: "This month",
            navigateTo: "/my-performance",
          },
        ];
      }

      const allStats = [...baseStats, ...roleSpecificStats];
      
      // Limit stats for mobile view to prevent overcrowding
      if (isMobile) {
        return allStats.slice(0, 4);
      }
      if (isTablet) {
        return allStats.slice(0, 6);
      }
      
      return allStats;
    } catch (err) {
      console.error("Error in processStats:", err);
      return [];
    }
  };

  // Get time subtitle based on filter
  const getTimeSubtitle = () => {
    switch (timeFilter) {
      case "today": return "Today";
      case "weekly": return "This week";
      case "monthly": return "This month";
      case "yearly": return "This year";
      default: return "";
    }
  };

  // Get data for sections with error handling
  const getRecentVisits = useMemo(() => {
    try {
      return dashboardData?.recentData?.visits?.slice(0, isMobile ? 3 : 5) || [];
    } catch (err) {
      return [];
    }
  }, [dashboardData, isMobile]);

  const getRecentRegistrations = useMemo(() => {
    try {
      return dashboardData?.recentData?.registrations?.slice(0, isMobile ? 3 : 5) || [];
    } catch (err) {
      return [];
    }
  }, [dashboardData, isMobile]);

  const hasMissedLeadsData = useMemo(() => {
    return dashboardData?.recentData?.missedLeads !== undefined;
  }, [dashboardData]);

  const getRecentMissedLeads = useMemo(() => {
    try {
      return dashboardData?.recentData?.missedLeads?.slice(0, isMobile ? 3 : 5) || [];
    } catch (err) {
      return [];
    }
  }, [dashboardData, isMobile]);

  const getRecentActivities = useMemo(() => {
    try {
      return dashboardData?.activities?.slice(0, isMobile ? 3 : 6) || [];
    } catch (err) {
      return [];
    }
  }, [dashboardData, isMobile]);

  const getTeamMembers = useMemo(() => {
    try {
      return dashboardData?.team?.members?.slice(0, isMobile ? 4 : 8) || [];
    } catch (err) {
      return [];
    }
  }, [dashboardData, isMobile]);

  const getTeamPerformance = useMemo(() => {
    try {
      return dashboardData?.teamPerformance?.slice(0, isMobile ? 4 : 5) || [];
    } catch (err) {
      return [];
    }
  }, [dashboardData, isMobile]);

  // Check if dashboard has any data
  const hasDashboardData = useMemo(() => {
    if (!dashboardData) return false;
    const { overview, recentData, activities, team, teamPerformance } = dashboardData;
    const hasOverviewData = overview && Object.keys(overview).length > 0;
    const hasRecentData = recentData && (
      (recentData.visits?.length > 0) ||
      (recentData.registrations?.length > 0) ||
      recentData.missedLeads !== undefined
    );
    return hasOverviewData || hasRecentData || activities?.length > 0 || team?.members?.length > 0 || teamPerformance?.length > 0;
  }, [dashboardData]);

  // Responsive grid spacing
  const getGridSpacing = () => {
    if (isMobile) return 1.5;
    if (isTablet) return 2;
    return 3;
  };

  // Handle mobile navigation
  const handleMobileNavChange = (event, newValue) => {
    setMobileNavValue(newValue);
    switch (newValue) {
      case 0:
        setActiveSection('home');
        break;
      case 1:
        setActiveSection('stats');
        break;
      case 2:
        setQuickActionsOpen(true);
        break;
      case 3:
        setActiveSection('team');
        break;
      default:
        setActiveSection('home');
    }
  };

  // Loading skeleton
  if (loading && !dashboardData) {
    return (
      <Box sx={{ width: '100%', maxWidth: '1600px', mx: 'auto', px: { xs: 1, sm: 2, md: 3, lg: 4 } }}>
        <Box sx={{ mb: { xs: 2, sm: 3 } }}>
          <Skeleton variant="text" width="60%" height={40} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="40%" height={24} />
        </Box>

        <Grid container spacing={getGridSpacing()} sx={{ mb: 3 }}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={6} sm={6} md={4} lg={3} key={item}>
              <Skeleton variant="rounded" height={isMobile ? 90 : 120} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={getGridSpacing()}>
          <Grid item xs={12} lg={8}>
            <Skeleton variant="rounded" height={isMobile ? 250 : 350} sx={{ borderRadius: 2 }} />
          </Grid>
          <Grid item xs={12} lg={4}>
            <Skeleton variant="rounded" height={isMobile ? 250 : 350} sx={{ borderRadius: 2 }} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  // Main error state
  if (error) {
    return (
      <Box sx={{ width: '100%', maxWidth: '1600px', mx: 'auto', px: { xs: 1, sm: 2, md: 3, lg: 4 } }}>
        <Alert
          severity="error"
          sx={{ borderRadius: 2 }}
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
        >
          <AlertTitle>Error Loading Dashboard</AlertTitle>
          {error}
        </Alert>
      </Box>
    );
  }

  // No data state
  if (!hasDashboardData && !loading) {
    return (
      <Box sx={{ width: '100%', maxWidth: '1600px', mx: 'auto', px: { xs: 1, sm: 2, md: 3, lg: 4 } }}>
        <Box sx={{ textAlign: "center", py: { xs: 4, sm: 6, md: 8 } }}>
          <Info sx={{ fontSize: { xs: 48, sm: 56, md: 64 }, color: alpha(PRIMARY_COLOR, 0.5), mb: 2 }} />
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            color="text.secondary" 
            gutterBottom 
            fontWeight={600}
          >
            No Data Available
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ mb: 3, maxWidth: 500, mx: "auto", px: 2 }}
          >
            Your dashboard is currently empty. Start by creating visits or registrations to see your performance data.
          </Typography>
          <Button
            variant="contained"
            onClick={handleRefresh}
            startIcon={<Refresh />}
            size={isMobile ? "medium" : "large"}
            sx={{
              bgcolor: PRIMARY_COLOR,
              borderRadius: 2,
              px: { xs: 3, sm: 4 },
              py: { xs: 1, sm: 1.5 },
              "&:hover": { bgcolor: "#3451b3" },
            }}
          >
            Refresh Dashboard
          </Button>
        </Box>
      </Box>
    );
  }

  // Render mobile view
  if (isMobile) {
    return (
      <>
        <Box sx={{ width: '100%', pb: 8 }}>
          {/* Mobile Header */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Box>
                <Typography variant="h6" fontWeight="700" color={PRIMARY_COLOR} sx={{ fontSize: '1.1rem' }}>
                  {getRoleDisplayName()} Dashboard
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  Hi, {user?.firstName || "User"}! 👋
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 0.5 }}>
                <IconButton 
                  size="small" 
                  onClick={() => setFilterDrawerOpen(true)}
                  sx={{ bgcolor: SECONDARY_COLOR, width: 32, height: 32 }}
                >
                  <FilterList sx={{ fontSize: 18 }} />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={handleRefresh} 
                  disabled={refreshing}
                  sx={{ bgcolor: SECONDARY_COLOR, width: 32, height: 32 }}
                >
                  <Refresh sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              {getTimeSubtitle()} overview
            </Typography>
          </Box>

          {/* Stats Cards - Horizontal Scroll for Mobile */}
          <Box sx={{ mb: 2.5, overflowX: 'auto', pb: 1, WebkitOverflowScrolling: 'touch' }}>
            <Box sx={{ display: 'flex', gap: 1.5, minWidth: 'min-content', px: 0.5 }}>
              {stats.slice(0, 4).map((stat, index) => (
                <MobileStatCard key={index} stat={stat} onClick={() => stat.navigateTo && handleNavigateTo(stat.navigateTo)} />
              ))}
            </Box>
          </Box>

          {/* Main Content Sections based on active tab */}
          {(activeSection === 'home' || activeSection === 'stats') && (
            <Stack spacing={2}>
              {/* Recent Visits */}
              <Card sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight="600" color={PRIMARY_COLOR} sx={{ fontSize: '0.9rem' }}>
                      Recent Visits
                    </Typography>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => handleNavigateTo("/total-visits")}
                      endIcon={<NavigateNext sx={{ fontSize: 16 }} />}
                      sx={{ color: PRIMARY_COLOR, fontSize: '0.75rem' }}
                    >
                      View
                    </Button>
                  </Box>

                  {getRecentVisits.length === 0 ? (
                    <EmptyStateCard
                      title="No Recent Visits"
                      message="Create a new visit to get started."
                      icon={<Visibility />}
                      isMobile={true}
                      action={
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => navigate("/create-visit")}
                          sx={{ bgcolor: PRIMARY_COLOR, "&:hover": { bgcolor: "#3451b3" }, fontSize: '0.7rem', py: 0.5 }}
                        >
                          Create Visit
                        </Button>
                      }
                    />
                  ) : (
                    <Stack spacing={1}>
                      {getRecentVisits.map((visit, index) => (
                        <Paper
                          key={index}
                          sx={{
                            p: 1.5,
                            borderRadius: 1.5,
                            border: `1px solid ${alpha(PRIMARY_COLOR, 0.1)}`,
                          }}
                        >
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                            <Typography variant="body2" fontWeight="600" color={PRIMARY_COLOR} sx={{ fontSize: '0.85rem' }}>
                              {visit.firstName} {visit.lastName}
                            </Typography>
                            <Chip
                              label={visit.visitStatus || "Pending"}
                              size="small"
                              sx={{ height: 20, fontSize: '0.6rem' }}
                            />
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
                              <Phone sx={{ fontSize: 12, color: alpha(PRIMARY_COLOR, 0.6) }} />
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                {visit.phone || "N/A"}
                              </Typography>
                            </Box>
                          </Box>
                        </Paper>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </Card>

              {/* Recent Registrations */}
              <Card sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight="600" color={PRIMARY_COLOR} sx={{ fontSize: '0.9rem' }}>
                      Recent Registrations
                    </Typography>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => handleNavigateTo("/registration")}
                      endIcon={<NavigateNext sx={{ fontSize: 16 }} />}
                      sx={{ color: PRIMARY_COLOR, fontSize: '0.75rem' }}
                    >
                      View
                    </Button>
                  </Box>

                  {getRecentRegistrations.length === 0 ? (
                    <EmptyStateCard
                      title="No Recent Registrations"
                      message="Complete a visit to create a registration."
                      icon={<PersonAdd />}
                      isMobile={true}
                      action={
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => navigate("/registration")}
                          sx={{ bgcolor: PRIMARY_COLOR, "&:hover": { bgcolor: "#3451b3" }, fontSize: '0.7rem', py: 0.5 }}
                        >
                          New Registration
                        </Button>
                      }
                    />
                  ) : (
                    <Stack spacing={1}>
                      {getRecentRegistrations.map((reg, index) => (
                        <Paper
                          key={index}
                          sx={{
                            p: 1.5,
                            borderRadius: 1.5,
                            border: `1px solid ${alpha(PRIMARY_COLOR, 0.1)}`,
                          }}
                        >
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                            <Typography variant="body2" fontWeight="600" color={PRIMARY_COLOR} sx={{ fontSize: '0.85rem' }}>
                              {reg.firstName} {reg.lastName}
                            </Typography>
                            <Chip
                              label="Registered"
                              size="small"
                              sx={{ height: 20, fontSize: '0.6rem', bgcolor: alpha(SUCCESS_COLOR, 0.1), color: SUCCESS_COLOR }}
                            />
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
                              <Phone sx={{ fontSize: 12, color: alpha(PRIMARY_COLOR, 0.6) }} />
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                {reg.phone || "N/A"}
                              </Typography>
                            </Box>
                          </Box>
                        </Paper>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activities or Missed Leads */}
              <Card sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight="600" color={PRIMARY_COLOR} sx={{ fontSize: '0.9rem' }}>
                      {hasMissedLeadsData ? "Missed Leads" : "Recent Activities"}
                    </Typography>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => handleNavigateTo(hasMissedLeadsData ? "/missed-leads" : "/activities")}
                      endIcon={<NavigateNext sx={{ fontSize: 16 }} />}
                      sx={{ color: PRIMARY_COLOR, fontSize: '0.75rem' }}
                    >
                      View
                    </Button>
                  </Box>

                  {hasMissedLeadsData ? (
                    getRecentMissedLeads.length === 0 ? (
                      <EmptyStateCard
                        title="No Missed Leads"
                        message="Great job! No missed leads to show."
                        icon={<CheckCircle sx={{ color: SUCCESS_COLOR }} />}
                        isMobile={true}
                        action={
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => navigate("/missed-leads")}
                            sx={{ bgcolor: PRIMARY_COLOR, "&:hover": { bgcolor: "#3451b3" }, fontSize: '0.7rem', py: 0.5 }}
                          >
                            View All
                          </Button>
                        }
                      />
                    ) : (
                      <Stack spacing={1}>
                        {getRecentMissedLeads.map((lead, index) => (
                          <Paper
                            key={index}
                            sx={{
                              p: 1.5,
                              borderRadius: 1.5,
                              border: `1px solid ${alpha(ERROR_COLOR, 0.1)}`,
                              bgcolor: alpha(ERROR_COLOR, 0.02),
                            }}
                          >
                            <Typography variant="body2" fontWeight="600" color={ERROR_COLOR} sx={{ fontSize: '0.85rem' }}>
                              {lead.firstName} {lead.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.65rem' }}>
                              {lead.reason || "No reason provided"}
                            </Typography>
                          </Paper>
                        ))}
                      </Stack>
                    )
                  ) : (
                    getRecentActivities.length === 0 ? (
                      <EmptyStateCard
                        title="No Recent Activity"
                        message="Your activity feed will appear here."
                        icon={<Schedule />}
                        isMobile={true}
                        action={
                          <Button
                            variant="contained"
                            size="small"
                            onClick={handleRefresh}
                            startIcon={<Refresh sx={{ fontSize: 14 }} />}
                            sx={{ bgcolor: PRIMARY_COLOR, "&:hover": { bgcolor: "#3451b3" }, fontSize: '0.7rem', py: 0.5 }}
                          >
                            Refresh
                          </Button>
                        }
                      />
                    ) : (
                      <Stack spacing={1}>
                        {getRecentActivities.map((activity, index) => (
                          <ActivityCard key={index} activity={activity} isMobile={true} />
                        ))}
                      </Stack>
                    )
                  )}
                </CardContent>
              </Card>
            </Stack>
          )}

          {/* Team Section */}
          {activeSection === 'team' && (user?.role === "Head_office" || user?.role === "ZSM" || user?.role === "ASM") && (
            <Stack spacing={2}>
              {/* Team Members */}
              {getTeamMembers.length > 0 && (
                <Card sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ p: 1.5 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                      <Typography variant="subtitle2" fontWeight="600" color={PRIMARY_COLOR} sx={{ fontSize: '0.9rem' }}>
                        Team Members
                      </Typography>
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => handleNavigateTo("/team-members")}
                        endIcon={<NavigateNext sx={{ fontSize: 16 }} />}
                        sx={{ color: PRIMARY_COLOR, fontSize: '0.75rem' }}
                      >
                        View All
                      </Button>
                    </Box>

                    <Grid container spacing={1}>
                      {getTeamMembers.map((member, index) => (
                        <Grid item xs={6} key={index}>
                          <TeamMemberCard member={member} isMobile={true} />
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {/* Team Performance */}
              {getTeamPerformance.length > 0 && (
                <Card sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ p: 1.5 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                      <Typography variant="subtitle2" fontWeight="600" color={PRIMARY_COLOR} sx={{ fontSize: '0.9rem' }}>
                        Team Performance
                      </Typography>
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => handleNavigateTo("/performance")}
                        endIcon={<NavigateNext sx={{ fontSize: 16 }} />}
                        sx={{ color: PRIMARY_COLOR, fontSize: '0.75rem' }}
                      >
                        View
                      </Button>
                    </Box>

                    <Grid container spacing={1}>
                      {getTeamPerformance.map((member, index) => (
                        <Grid item xs={6} key={index}>
                          <Paper sx={{ p: 1.5, borderRadius: 1.5 }}>
                            <Typography variant="caption" fontWeight="600" display="block" sx={{ fontSize: '0.75rem' }}>
                              {member.name}
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.25 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                                  Progress
                                </Typography>
                                <Typography variant="caption" fontWeight="600" color={PRIMARY_COLOR} sx={{ fontSize: '0.6rem' }}>
                                  {member.performance}%
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={member.performance || 0}
                                sx={{ height: 4, borderRadius: 2 }}
                              />
                            </Box>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              )}
            </Stack>
          )}
        </Box>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav value={mobileNavValue} onChange={handleMobileNavChange} />

        {/* Quick Actions Drawer */}
        <QuickActionsDrawer 
          open={quickActionsOpen} 
          onClose={() => setQuickActionsOpen(false)} 
          navigate={navigate}
        />

        {/* Filter Drawer */}
        <FilterDrawer 
          open={filterDrawerOpen}
          onClose={() => setFilterDrawerOpen(false)}
          timeFilter={timeFilter}
          onFilterChange={handleTimeFilterChange}
        />
      </>
    );
  }

  // Desktop/Tablet view with perfect centering
  return (
    <Box sx={{ 
      width: '100%', 
      maxWidth: '1600px', 
      mx: 'auto', 
      px: { xs: 2, sm: 3, md: 4, lg: 5 } 
    }}>
      {/* Header Section */}
      <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 2,
            mb: 3
          }}
        >
          <Box>
            <Typography
              variant={isTablet ? "h5" : "h4"}
              fontWeight="700"
              color={PRIMARY_COLOR}
              gutterBottom
              sx={{ fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' } }}
            >
              {getRoleDisplayName()} Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
              Welcome back, {user?.firstName || "User"}! Here's your performance summary
            </Typography>
            {dashboardData && (
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5, fontSize: '0.7rem' }}>
                Last updated: {formatDateTime(new Date())}
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 1,
            }}
          >
            <ToggleButtonGroup
              value={timeFilter}
              exclusive
              onChange={handleTimeFilterChange}
              size="small"
              sx={{
                bgcolor: SECONDARY_COLOR,
                borderRadius: 2,
                p: 0.5,
                "& .MuiToggleButton-root": {
                  border: "none",
                  borderRadius: 1.5,
                  px: { xs: 1.5, sm: 2 },
                  py: 0.75,
                  color: "text.secondary",
                  fontSize: { xs: '0.7rem', sm: '0.8rem' },
                  "&.Mui-selected": {
                    bgcolor: "white",
                    color: PRIMARY_COLOR,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  },
                },
              }}
            >
              {PERIOD_OPTIONS.map((option) => (
                <ToggleButton key={option.value} value={option.value}>
                  {option.icon}
                  <Box component="span" sx={{ ml: 0.5, display: { xs: "none", sm: "inline" } }}>
                    {option.label}
                  </Box>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            <Tooltip title="Refresh Dashboard">
              <IconButton
                onClick={handleRefresh}
                disabled={refreshing}
                sx={{
                  bgcolor: SECONDARY_COLOR,
                  color: PRIMARY_COLOR,
                  "&:hover": { bgcolor: alpha(PRIMARY_COLOR, 0.1) },
                  width: { xs: 36, sm: 40 },
                  height: { xs: 36, sm: 40 },
                }}
              >
                <Refresh sx={{ fontSize: { xs: 18, sm: 20 } }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Stats Overview */}
        <Grid container spacing={getGridSpacing()}>
          {stats.map((stat, index) => (
            <Grid item xs={6} sm={6} md={4} lg={3} key={index}>
              <StatCard stat={stat} onClick={() => stat.navigateTo && handleNavigateTo(stat.navigateTo)} isMobile={isMobile} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Main Content Grid */}
      <Grid container spacing={getGridSpacing()}>
        {/* Recent Visits */}
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ borderRadius: { xs: 2, sm: 2.5, md: 3 }, boxShadow: "0 4px 20px rgba(0,0,0,0.02)", border: "1px solid #edf2f7", height: "100%" }}>
            <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" fontWeight="600" color={PRIMARY_COLOR} sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                  Recent Visits
                </Typography>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => handleNavigateTo("/total-visits")}
                  endIcon={<NavigateNext />}
                  sx={{ color: PRIMARY_COLOR, fontSize: { xs: '0.75rem', sm: '0.85rem' } }}
                >
                  View All
                </Button>
              </Box>

              {getRecentVisits.length === 0 ? (
                <EmptyStateCard
                  title="No Recent Visits"
                  message="Create a new visit to get started."
                  icon={<Visibility sx={{ fontSize: 40 }} />}
                  isMobile={isMobile}
                  action={
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => navigate("/create-visit")}
                      sx={{ bgcolor: PRIMARY_COLOR, "&:hover": { bgcolor: "#3451b3" }, fontSize: { xs: '0.7rem', sm: '0.8rem' } }}
                    >
                      Create Visit
                    </Button>
                  }
                />
              ) : (
                <Stack spacing={1.5}>
                  {getRecentVisits.map((visit, index) => (
                    <Paper
                      key={index}
                      sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        border: `1px solid ${alpha(PRIMARY_COLOR, 0.1)}`,
                        bgcolor: alpha(PRIMARY_COLOR, 0.02),
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography fontWeight="600" color={PRIMARY_COLOR} variant="body2" sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' } }}>
                          {visit.firstName} {visit.lastName}
                        </Typography>
                        <Chip
                          label={visit.visitStatus || "Pending"}
                          size="small"
                          sx={{ height: 22, fontSize: { xs: '0.6rem', sm: '0.65rem' } }}
                        />
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <Phone sx={{ fontSize: 14, color: alpha(PRIMARY_COLOR, 0.6) }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                            {visit.phone || "N/A"}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Registrations */}
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ borderRadius: { xs: 2, sm: 2.5, md: 3 }, boxShadow: "0 4px 20px rgba(0,0,0,0.02)", border: "1px solid #edf2f7", height: "100%" }}>
            <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" fontWeight="600" color={PRIMARY_COLOR} sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                  Recent Registrations
                </Typography>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => handleNavigateTo("/registration")}
                  endIcon={<NavigateNext />}
                  sx={{ color: PRIMARY_COLOR, fontSize: { xs: '0.75rem', sm: '0.85rem' } }}
                >
                  View All
                </Button>
              </Box>

              {getRecentRegistrations.length === 0 ? (
                <EmptyStateCard
                  title="No Recent Registrations"
                  message="Complete a visit to create a registration."
                  icon={<PersonAdd sx={{ fontSize: 40 }} />}
                  isMobile={isMobile}
                  action={
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => navigate("/registration")}
                      sx={{ bgcolor: PRIMARY_COLOR, "&:hover": { bgcolor: "#3451b3" }, fontSize: { xs: '0.7rem', sm: '0.8rem' } }}
                    >
                      New Registration
                    </Button>
                  }
                />
              ) : (
                <Stack spacing={1.5}>
                  {getRecentRegistrations.map((reg, index) => (
                    <Paper
                      key={index}
                      sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        border: `1px solid ${alpha(PRIMARY_COLOR, 0.1)}`,
                        bgcolor: alpha(PRIMARY_COLOR, 0.02),
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography fontWeight="600" color={PRIMARY_COLOR} variant="body2" sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' } }}>
                          {reg.firstName} {reg.lastName}
                        </Typography>
                        <Chip
                          label="Registered"
                          size="small"
                          sx={{ height: 22, fontSize: { xs: '0.6rem', sm: '0.65rem' }, bgcolor: alpha(SUCCESS_COLOR, 0.1), color: SUCCESS_COLOR }}
                        />
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <Phone sx={{ fontSize: 14, color: alpha(PRIMARY_COLOR, 0.6) }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                            {reg.phone || "N/A"}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Missed Leads or Activities */}
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ borderRadius: { xs: 2, sm: 2.5, md: 3 }, boxShadow: "0 4px 20px rgba(0,0,0,0.02)", border: "1px solid #edf2f7", height: "100%" }}>
            <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" fontWeight="600" color={PRIMARY_COLOR} sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                  {hasMissedLeadsData ? "Missed Leads" : "Recent Activities"}
                </Typography>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => handleNavigateTo(hasMissedLeadsData ? "/missed-leads" : "/activities")}
                  endIcon={<NavigateNext />}
                  sx={{ color: PRIMARY_COLOR, fontSize: { xs: '0.75rem', sm: '0.85rem' } }}
                >
                  View All
                </Button>
              </Box>

              {hasMissedLeadsData ? (
                getRecentMissedLeads.length === 0 ? (
                  <EmptyStateCard
                    title="No Missed Leads"
                    message="Great job! No missed leads to show."
                    icon={<CheckCircle sx={{ fontSize: 40, color: SUCCESS_COLOR }} />}
                    isMobile={isMobile}
                    action={
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => navigate("/missed-leads")}
                        sx={{ bgcolor: PRIMARY_COLOR, "&:hover": { bgcolor: "#3451b3" }, fontSize: { xs: '0.7rem', sm: '0.8rem' } }}
                      >
                        View All
                      </Button>
                    }
                  />
                ) : (
                  <Stack spacing={1.5}>
                    {getRecentMissedLeads.map((lead, index) => (
                      <Paper
                        key={index}
                        sx={{
                          p: 1.5,
                          borderRadius: 1.5,
                          border: `1px solid ${alpha(ERROR_COLOR, 0.1)}`,
                          bgcolor: alpha(ERROR_COLOR, 0.02),
                        }}
                      >
                        <Typography fontWeight="600" color={ERROR_COLOR} variant="body2" sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' } }} gutterBottom>
                          {lead.firstName} {lead.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                          {lead.reason || "No reason provided"}
                        </Typography>
                      </Paper>
                    ))}
                  </Stack>
                )
              ) : (
                getRecentActivities.length === 0 ? (
                  <EmptyStateCard
                    title="No Recent Activity"
                    message="Your activity feed will appear here."
                    icon={<Schedule sx={{ fontSize: 40 }} />}
                    isMobile={isMobile}
                    action={
                      <Button
                        variant="contained"
                        size="small"
                        onClick={handleRefresh}
                        startIcon={<Refresh />}
                        sx={{ bgcolor: PRIMARY_COLOR, "&:hover": { bgcolor: "#3451b3" }, fontSize: { xs: '0.7rem', sm: '0.8rem' } }}
                      >
                        Refresh
                      </Button>
                    }
                  />
                ) : (
                  <Stack spacing={1.5}>
                    {getRecentActivities.slice(0, 5).map((activity, index) => (
                      <ActivityCard key={index} activity={activity} isMobile={false} />
                    ))}
                  </Stack>
                )
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Team Overview - For Head_office, ZSM, ASM */}
        {(user?.role === "Head_office" || user?.role === "ZSM" || user?.role === "ASM") && getTeamMembers.length > 0 && (
          <Grid item xs={12}>
            <Card sx={{ borderRadius: { xs: 2, sm: 2.5, md: 3 }, boxShadow: "0 4px 20px rgba(0,0,0,0.02)", border: "1px solid #edf2f7" }}>
              <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="h6" fontWeight="600" color={PRIMARY_COLOR} sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                    Team Overview
                  </Typography>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => handleNavigateTo("/team-members")}
                    endIcon={<NavigateNext />}
                    sx={{ color: PRIMARY_COLOR, fontSize: { xs: '0.75rem', sm: '0.85rem' } }}
                  >
                    View All Team
                  </Button>
                </Box>

                <Grid container spacing={2}>
                  {getTeamMembers.map((member, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                      <TeamMemberCard member={member} isMobile={false} />
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Performance Chart Section */}
        {getTeamPerformance.length > 0 && (
          <Grid item xs={12}>
            <Card sx={{ borderRadius: { xs: 2, sm: 2.5, md: 3 }, boxShadow: "0 4px 20px rgba(0,0,0,0.02)", border: "1px solid #edf2f7" }}>
              <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="h6" fontWeight="600" color={PRIMARY_COLOR} sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                    Team Performance
                  </Typography>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => handleNavigateTo("/performance")}
                    endIcon={<NavigateNext />}
                    sx={{ color: PRIMARY_COLOR, fontSize: { xs: '0.75rem', sm: '0.85rem' } }}
                  >
                    View Details
                  </Button>
                </Box>

                <Grid container spacing={2}>
                  {getTeamPerformance.map((member, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                      <Paper
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: `1px solid ${alpha(PRIMARY_COLOR, 0.1)}`,
                          bgcolor: "white",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                          <Avatar
                            sx={{
                              bgcolor: alpha(PRIMARY_COLOR, 0.1),
                              color: PRIMARY_COLOR,
                              width: 40,
                              height: 40,
                            }}
                          >
                            {getInitials(member.name)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="600" sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' } }}>
                              {member.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                              {member.role}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ mb: 1 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                              Performance
                            </Typography>
                            <Typography variant="caption" fontWeight="600" color={PRIMARY_COLOR} sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                              {member.performance}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={member.performance || 0}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              bgcolor: alpha(PRIMARY_COLOR, 0.1),
                              "& .MuiLinearProgress-bar": {
                                bgcolor: PRIMARY_COLOR,
                              },
                            }}
                          />
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}