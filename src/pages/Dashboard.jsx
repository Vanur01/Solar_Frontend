// pages/UnifiedDashboard.jsx
import React, { useState, useEffect, useMemo } from "react";
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

// Empty State Components
const EmptyStateCard = ({ title, message, icon, action }) => (
  <Card
    sx={{
      borderRadius: 3,
      boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
      bgcolor: "white",
      border: "1px solid #edf2f7",
      height: "100%",
      minHeight: 300,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      p: 4,
    }}
  >
    <Box sx={{ textAlign: "center" }}>
      <Box sx={{ color: alpha(PRIMARY_COLOR, 0.5), mb: 2 }}>
        {icon}
      </Box>
      <Typography variant="h6" color="text.secondary" gutterBottom fontWeight={600}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 300 }}>
        {message}
      </Typography>
      {action}
    </Box>
  </Card>
);

// Stat Card Component - Updated for 4 cards per row with fixed width
const StatCard = ({ stat, onClick, isXSmall }) => (
  <Card
    sx={{
      borderRadius: 3,
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
    }}
    onClick={onClick}
  >
    <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 2.5 } }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: { xs: 1, sm: 1.5 } }}>
        <Box>
          <Typography 
            variant="h4" 
            fontWeight="700" 
            color={PRIMARY_COLOR} 
            sx={{ 
              fontSize: { xs: "1.25rem", sm: "1.5rem", md: "1.75rem", lg: "2rem" } 
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
              fontSize: { xs: "0.7rem", sm: "0.8rem", md: "0.875rem" }
            }}
          >
            {stat.title}
          </Typography>
        </Box>
        <Box
          sx={{
            p: { xs: 1, sm: 1.25, md: 1.5 },
            borderRadius: 2,
            bgcolor: alpha(PRIMARY_COLOR, 0.1),
            color: PRIMARY_COLOR,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {React.cloneElement(stat.icon, { 
            sx: { fontSize: { xs: 20, sm: 22, md: 24 } } 
          })}
        </Box>
      </Box>

      <Box sx={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between",
        mt: { xs: 0.5, sm: 1 }
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {stat.trend === "up" ? (
            <ArrowUpward sx={{ fontSize: { xs: 12, sm: 14, md: 16 }, color: SUCCESS_COLOR }} />
          ) : stat.trend === "down" ? (
            <ArrowDownward sx={{ fontSize: { xs: 12, sm: 14, md: 16 }, color: ERROR_COLOR }} />
          ) : (
            <TrendingFlat sx={{ fontSize: { xs: 12, sm: 14, md: 16 }, color: "text.secondary" }} />
          )}
          <Typography 
            variant="caption" 
            fontWeight="600" 
            color={stat.trend === "up" ? SUCCESS_COLOR : stat.trend === "down" ? ERROR_COLOR : "text.secondary"}
            sx={{ fontSize: { xs: "0.6rem", sm: "0.65rem", md: "0.7rem" } }}
          >
            {stat.change}
          </Typography>
        </Box>
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ fontSize: { xs: "0.6rem", sm: "0.65rem", md: "0.7rem" } }}
        >
          {stat.subtitle}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

// Activity Card Component
const ActivityCard = ({ activity }) => (
  <Paper
    sx={{
      p: 2,
      borderRadius: 2,
      border: `1px solid ${alpha(PRIMARY_COLOR, 0.1)}`,
      bgcolor: alpha(PRIMARY_COLOR, 0.02),
      transition: "all 0.2s ease",
      "&:hover": {
        borderColor: alpha(PRIMARY_COLOR, 0.3),
        bgcolor: alpha(PRIMARY_COLOR, 0.04),
        transform: "translateX(4px)",
      },
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <Avatar
        sx={{
          bgcolor: alpha(PRIMARY_COLOR, 0.1),
          color: PRIMARY_COLOR,
          width: 40,
          height: 40,
          fontSize: "0.9rem",
          fontWeight: "bold",
        }}
      >
        {getInitials(activity.leadName)}
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
          <Typography variant="subtitle2" fontWeight="600" color={PRIMARY_COLOR}>
            {activity.leadName}
          </Typography>
          <Chip
            label={activity.status}
            size="small"
            sx={{
              height: 24,
              fontSize: "0.7rem",
              fontWeight: 600,
              bgcolor: alpha(PRIMARY_COLOR, 0.1),
              color: PRIMARY_COLOR,
            }}
          />
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
          {activity.description || "Activity updated"}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AccessTime sx={{ fontSize: 12, color: "text.secondary" }} />
          <Typography variant="caption" color="text.secondary">
            {activity.updatedAt ? new Date(activity.updatedAt).toLocaleString() : "Just now"}
          </Typography>
        </Box>
      </Box>
    </Box>
  </Paper>
);

// Team Member Card Component
const TeamMemberCard = ({ member }) => (
  <Paper
    sx={{
      p: 2,
      borderRadius: 2,
      border: `1px solid ${alpha(PRIMARY_COLOR, 0.1)}`,
      bgcolor: "white",
      transition: "all 0.2s ease",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: `0 4px 20px ${alpha(PRIMARY_COLOR, 0.1)}`,
        borderColor: alpha(PRIMARY_COLOR, 0.3),
      },
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
      <Avatar
        sx={{
          bgcolor: alpha(PRIMARY_COLOR, 0.1),
          color: PRIMARY_COLOR,
          width: 48,
          height: 48,
          fontSize: "1rem",
          fontWeight: "bold",
        }}
      >
        {getInitials(`${member.firstName || ""} ${member.lastName || ""}`)}
      </Avatar>
      <Box>
        <Typography variant="subtitle1" fontWeight="600" color={PRIMARY_COLOR}>
          {member.firstName || ""} {member.lastName || ""}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
          {member.role || "Team Member"}
        </Typography>
      </Box>
    </Box>

    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
      <Chip
        label={member.status === "active" ? "Active" : "Inactive"}
        size="small"
        sx={{
          fontSize: "0.7rem",
          fontWeight: 600,
          bgcolor: member.status === "active" ? alpha(SUCCESS_COLOR, 0.1) : alpha(ERROR_COLOR, 0.1),
          color: member.status === "active" ? SUCCESS_COLOR : ERROR_COLOR,
        }}
      />
      {member.performance && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Star sx={{ fontSize: 14, color: WARNING_COLOR }} />
          <Typography variant="caption" fontWeight="600">
            {member.performance}%
          </Typography>
        </Box>
      )}
    </Box>

    {member.email && (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Mail sx={{ fontSize: 14, color: alpha(PRIMARY_COLOR, 0.6) }} />
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
          {member.email}
        </Typography>
      </Box>
    )}
  </Paper>
);

export default function UnifiedDashboard() {
  const theme = useTheme();
  const navigate = useNavigate();

  // Responsive breakpoints
  const isXSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const isSmall = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isMedium = useMediaQuery(theme.breakpoints.between("md", "lg"));
  const isLarge = useMediaQuery(theme.breakpoints.up("lg"));

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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAnchor, setFilterAnchor] = useState(null);

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
          icon: <Visibility sx={{ fontSize: 24 }} />,
          subtitle: getTimeSubtitle(),
          navigateTo: "/total-visits",
        },
        {
          title: "Registrations",
          value: (overview.totalRegistrations || 0).toLocaleString(),
          change: overview.totalRegistrations > 0 ? "+15.5%" : "0%",
          trend: overview.totalRegistrations > 0 ? "up" : "flat",
          icon: <PersonAdd sx={{ fontSize: 24 }} />,
          subtitle: getTimeSubtitle(),
          navigateTo: "/registration",
        },
        {
          title: "Missed Leads",
          value: (overview.totalMissedLeads || 0).toLocaleString(),
          change: overview.totalMissedLeads > 0 ? "+5.3%" : "0%",
          trend: overview.totalMissedLeads > 0 ? "up" : "down",
          icon: <Cancel sx={{ fontSize: 24 }} />,
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
            icon: <AccountBalance sx={{ fontSize: 24 }} />,
            subtitle: getTimeSubtitle(),
            navigateTo: "/bank-loan-apply",
          },
          {
            title: "Documents",
            value: (overview.totalDocumentSubmission || 0).toLocaleString(),
            change: overview.totalDocumentSubmission > 0 ? "+12.1%" : "0%",
            trend: overview.totalDocumentSubmission > 0 ? "up" : "flat",
            icon: <Description sx={{ fontSize: 24 }} />,
            subtitle: getTimeSubtitle(),
            navigateTo: "/document-submission",
          },
          {
            title: "Disbursement",
            value: `₹${(overview.totalDisbursement || 0).toLocaleString("en-IN")}`,
            change: overview.totalDisbursement > 0 ? "+18.3%" : "0%",
            trend: overview.totalDisbursement > 0 ? "up" : "flat",
            icon: <Payments sx={{ fontSize: 24 }} />,
            subtitle: getTimeSubtitle(),
            navigateTo: "/disbursement",
          },
          {
            title: "Installations",
            value: (overview.totalInstallations || 0).toLocaleString(),
            change: overview.totalInstallations > 0 ? "+8.7%" : "0%",
            trend: overview.totalInstallations > 0 ? "up" : "flat",
            icon: <CheckCircle sx={{ fontSize: 24 }} />,
            subtitle: getTimeSubtitle(),
            navigateTo: "/installation-completion",
          },
          {
            title: "Team Members",
            value: (overview.totalTeamMembers || 0).toLocaleString(),
            change: overview.totalTeamMembers > 0 ? "+3.1%" : "0%",
            trend: overview.totalTeamMembers > 0 ? "up" : "flat",
            icon: <Group sx={{ fontSize: 24 }} />,
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
            icon: <Group sx={{ fontSize: 24 }} />,
            subtitle: "Under management",
            navigateTo: "/my-team",
          },
          {
            title: "Total Leads",
            value: (overview.totalLeads || 0).toLocaleString(),
            change: overview.totalLeads > 0 ? "+10.2%" : "0%",
            trend: overview.totalLeads > 0 ? "up" : "flat",
            icon: <AssignmentTurnedIn sx={{ fontSize: 24 }} />,
            subtitle: getTimeSubtitle(),
            navigateTo: "/all-leads",
          },
          {
            title: "Conversion",
            value: overview.conversionRate ? `${overview.conversionRate}%` : "0%",
            change: "+5.3%",
            trend: "up",
            icon: <TrendingUp sx={{ fontSize: 24 }} />,
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
            icon: <AssignmentTurnedIn sx={{ fontSize: 24 }} />,
            subtitle: getTimeSubtitle(),
            navigateTo: "/all-leads",
          },
          {
            title: "Today's Target",
            value: overview.todaysTarget?.toString() || "0/5",
            change: "+20%",
            trend: "up",
            icon: <TaskAlt sx={{ fontSize: 24 }} />,
            subtitle: "Visits completed",
            navigateTo: "/my-targets",
          },
          {
            title: "My Performance",
            value: overview.conversionRate ? `${overview.conversionRate}%` : "0%",
            change: "+3.2%",
            trend: "up",
            icon: <Assessment sx={{ fontSize: 24 }} />,
            subtitle: "This month",
            navigateTo: "/my-performance",
          },
        ];
      }

      const allStats = [...baseStats, ...roleSpecificStats];
      
      // Return all stats for 4 cards per row layout
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
      return dashboardData?.recentData?.visits?.slice(0, 5) || [];
    } catch (err) {
      return [];
    }
  }, [dashboardData]);

  const getRecentRegistrations = useMemo(() => {
    try {
      return dashboardData?.recentData?.registrations?.slice(0, 5) || [];
    } catch (err) {
      return [];
    }
  }, [dashboardData]);

  const hasMissedLeadsData = useMemo(() => {
    return dashboardData?.recentData?.missedLeads !== undefined;
  }, [dashboardData]);

  const getRecentMissedLeads = useMemo(() => {
    try {
      return dashboardData?.recentData?.missedLeads?.slice(0, 5) || [];
    } catch (err) {
      return [];
    }
  }, [dashboardData]);

  const getRecentActivities = useMemo(() => {
    try {
      return dashboardData?.activities?.slice(0, 6) || [];
    } catch (err) {
      return [];
    }
  }, [dashboardData]);

  const getTeamMembers = useMemo(() => {
    try {
      return dashboardData?.team?.members?.slice(0, 8) || [];
    } catch (err) {
      return [];
    }
  }, [dashboardData]);

  const getTeamPerformance = useMemo(() => {
    try {
      return dashboardData?.teamPerformance?.slice(0, 5) || [];
    } catch (err) {
      return [];
    }
  }, [dashboardData]);

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
    if (isXSmall) return 1.5;
    if (isSmall) return 2;
    return 3;
  };

  // Loading skeleton
  if (loading && !dashboardData) {
    return (
      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width="40%" height={48} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="30%" height={24} />
        </Box>

        <Grid container spacing={getGridSpacing()} sx={{ mb: 4 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <Grid item xs={6} sm={6} md={4} lg={3} key={item}>
              <Skeleton variant="rounded" height={140} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={getGridSpacing()}>
          <Grid item xs={12} lg={8}>
            <Skeleton variant="rounded" height={400} sx={{ borderRadius: 3 }} />
          </Grid>
          <Grid item xs={12} lg={4}>
            <Skeleton variant="rounded" height={400} sx={{ borderRadius: 3 }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  // Main error state
  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
        <Alert
          severity="error"
          sx={{ borderRadius: 3 }}
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
        >
          <AlertTitle>Error Loading Dashboard</AlertTitle>
          {error}
        </Alert>
      </Container>
    );
  }

  // No data state
  if (!hasDashboardData && !loading) {
    return (
      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Info sx={{ fontSize: 64, color: alpha(PRIMARY_COLOR, 0.5), mb: 3 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom fontWeight={600}>
            No Data Available
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: "auto" }}>
            Your dashboard is currently empty. Start by creating visits or registrations to see your performance data.
          </Typography>
          <Button
            variant="contained"
            onClick={handleRefresh}
            startIcon={<Refresh />}
            size="large"
            sx={{
              bgcolor: PRIMARY_COLOR,
              borderRadius: 2,
              px: 4,
              py: 1.5,
              "&:hover": { bgcolor: "#3451b3" },
            }}
          >
            Refresh Dashboard
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
      {/* Header Section */}
      <Box sx={{ mb: { xs: 3, sm: 4 } , marginLeft:"30px"  }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "center" },
            gap: 2,
            mb: 3,
          }}
        >
          <Box>
            <Typography
              variant={isXSmall ? "h5" : "h4"}
              fontWeight="700"
              color={PRIMARY_COLOR}
              gutterBottom
            >
              {console.log("data...", getRoleDisplayName())}
              {getRoleDisplayName()} Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Welcome back, {user?.firstName || "User"}! Here's your performance summary
            </Typography>
            {dashboardData && (
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                Last updated: {formatDateTime(new Date())}
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "stretch", sm: "center" },
              gap: 1.5,
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
                  <Box component="span" sx={{ ml: 1, display: { xs: "none", sm: "inline" } }}>
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
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Stats Overview - 4 Cards Per Row */}
        <Grid container spacing={getGridSpacing()}>
          {stats.map((stat, index) => (
            <Grid item xs={6} sm={6} md={4} lg={3} key={index}>
              <StatCard stat={stat} onClick={() => stat.navigateTo && handleNavigateTo(stat.navigateTo)} isXSmall={isXSmall} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Main Content Grid */}
      <Grid container spacing={getGridSpacing()} sx={{ marginLeft:"8px" }}>
        {/* Recent Visits */}
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.02)", border: "1px solid #edf2f7", height: "100%" }}>
            <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h6" fontWeight="600" color={PRIMARY_COLOR}>
                  Recent Visits
                </Typography>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => handleNavigateTo("/total-visits")}
                  endIcon={<NavigateNext />}
                  sx={{ color: PRIMARY_COLOR }}
                >
                  View All
                </Button>
              </Box>

              {getRecentVisits.length === 0 ? (
                <EmptyStateCard
                  title="No Recent Visits"
                  message="Create a new visit to get started."
                  icon={<Visibility sx={{ fontSize: 48 }} />}
                  action={
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => navigate("/create-visit")}
                      sx={{ bgcolor: PRIMARY_COLOR, "&:hover": { bgcolor: "#3451b3" } }}
                    >
                      Create Visit
                    </Button>
                  }
                />
              ) : (
                <Stack spacing={2}>
                  {getRecentVisits.map((visit, index) => (
                    <Paper
                      key={index}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: `1px solid ${alpha(PRIMARY_COLOR, 0.1)}`,
                        bgcolor: alpha(PRIMARY_COLOR, 0.02),
                        transition: "all 0.2s ease",
                        "&:hover": {
                          borderColor: alpha(PRIMARY_COLOR, 0.3),
                          bgcolor: alpha(PRIMARY_COLOR, 0.04),
                        },
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                        <Typography fontWeight="600" color={PRIMARY_COLOR}>
                          {visit.firstName} {visit.lastName}
                        </Typography>
                        <Chip
                          label={visit.visitStatus || "Pending"}
                          size="small"
                          sx={{
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            bgcolor: alpha(PRIMARY_COLOR, 0.1),
                            color: PRIMARY_COLOR,
                          }}
                        />
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1, flexWrap: "wrap" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <Phone sx={{ fontSize: 14, color: alpha(PRIMARY_COLOR, 0.6) }} />
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                            {visit.phone || "N/A"}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <Mail sx={{ fontSize: 14, color: alpha(PRIMARY_COLOR, 0.6) }} />
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                            {visit.email || "N/A"}
                          </Typography>
                        </Box>
                      </Box>
                      {visit.assignedUser && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                          Assigned to: {visit.assignedUser?.firstName} {visit.assignedUser?.lastName}
                        </Typography>
                      )}
                    </Paper>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Registrations */}
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.02)", border: "1px solid #edf2f7", height: "100%" }}>
            <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h6" fontWeight="600" color={PRIMARY_COLOR}>
                  Recent Registrations
                </Typography>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => handleNavigateTo("/registration")}
                  endIcon={<NavigateNext />}
                  sx={{ color: PRIMARY_COLOR }}
                >
                  View All
                </Button>
              </Box>

              {getRecentRegistrations.length === 0 ? (
                <EmptyStateCard
                  title="No Recent Registrations"
                  message="Complete a visit to create a registration."
                  icon={<PersonAdd sx={{ fontSize: 48 }} />}
                  action={
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => navigate("/registration")}
                      sx={{ bgcolor: PRIMARY_COLOR, "&:hover": { bgcolor: "#3451b3" } }}
                    >
                      New Registration
                    </Button>
                  }
                />
              ) : (
                <Stack spacing={2}>
                  {getRecentRegistrations.map((reg, index) => (
                    <Paper
                      key={index}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: `1px solid ${alpha(PRIMARY_COLOR, 0.1)}`,
                        bgcolor: alpha(PRIMARY_COLOR, 0.02),
                        transition: "all 0.2s ease",
                        "&:hover": {
                          borderColor: alpha(PRIMARY_COLOR, 0.3),
                          bgcolor: alpha(PRIMARY_COLOR, 0.04),
                        },
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                        <Typography fontWeight="600" color={PRIMARY_COLOR}>
                          {reg.firstName} {reg.lastName}
                        </Typography>
                        <Chip
                          label="Registered"
                          size="small"
                          sx={{
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            bgcolor: alpha(SUCCESS_COLOR, 0.1),
                            color: SUCCESS_COLOR,
                          }}
                        />
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1, flexWrap: "wrap" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <Phone sx={{ fontSize: 14, color: alpha(PRIMARY_COLOR, 0.6) }} />
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                            {reg.phone || "N/A"}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <Mail sx={{ fontSize: 14, color: alpha(PRIMARY_COLOR, 0.6) }} />
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                            {reg.email || "N/A"}
                          </Typography>
                        </Box>
                      </Box>
                      {reg.dateOfRegistration && (
                        <Typography variant="caption" color="text.secondary">
                          Registered: {new Date(reg.dateOfRegistration).toLocaleDateString()}
                        </Typography>
                      )}
                    </Paper>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Missed Leads or Activities */}
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.02)", border: "1px solid #edf2f7", height: "100%" }}>
            <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h6" fontWeight="600" color={PRIMARY_COLOR}>
                  {hasMissedLeadsData ? "Missed Leads" : "Recent Activities"}
                </Typography>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => handleNavigateTo(hasMissedLeadsData ? "/missed-leads" : "/activities")}
                  endIcon={<NavigateNext />}
                  sx={{ color: PRIMARY_COLOR }}
                >
                  View All
                </Button>
              </Box>

              {hasMissedLeadsData ? (
                getRecentMissedLeads.length === 0 ? (
                  <EmptyStateCard
                    title="No Missed Leads"
                    message="Great job! No missed leads to show."
                    icon={<CheckCircle sx={{ fontSize: 48, color: SUCCESS_COLOR }} />}
                    action={
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => navigate("/missed-leads")}
                        sx={{ bgcolor: PRIMARY_COLOR, "&:hover": { bgcolor: "#3451b3" } }}
                      >
                        View All
                      </Button>
                    }
                  />
                ) : (
                  <Stack spacing={2}>
                    {getRecentMissedLeads.map((lead, index) => (
                      <Paper
                        key={index}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: `1px solid ${alpha(ERROR_COLOR, 0.1)}`,
                          bgcolor: alpha(ERROR_COLOR, 0.02),
                          transition: "all 0.2s ease",
                          "&:hover": {
                            borderColor: alpha(ERROR_COLOR, 0.3),
                            bgcolor: alpha(ERROR_COLOR, 0.04),
                          },
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                          <Typography fontWeight="600" color={ERROR_COLOR}>
                            {lead.firstName} {lead.lastName}
                          </Typography>
                          <Chip
                            label="Missed"
                            size="small"
                            sx={{
                              fontSize: "0.7rem",
                              fontWeight: 600,
                              bgcolor: alpha(ERROR_COLOR, 0.1),
                              color: ERROR_COLOR,
                            }}
                          />
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1, flexWrap: "wrap" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <Phone sx={{ fontSize: 14, color: alpha(ERROR_COLOR, 0.6) }} />
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                              {lead.phone || "N/A"}
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <Mail sx={{ fontSize: 14, color: alpha(ERROR_COLOR, 0.6) }} />
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                              {lead.email || "N/A"}
                            </Typography>
                          </Box>
                        </Box>
                        {lead.reason && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                            Reason: {lead.reason}
                          </Typography>
                        )}
                      </Paper>
                    ))}
                  </Stack>
                )
              ) : (
                getRecentActivities.length === 0 ? (
                  <EmptyStateCard
                    title="No Recent Activity"
                    message="Your activity feed will appear here."
                    icon={<Schedule sx={{ fontSize: 48 }} />}
                    action={
                      <Button
                        variant="contained"
                        size="small"
                        onClick={handleRefresh}
                        startIcon={<Refresh />}
                        sx={{ bgcolor: PRIMARY_COLOR, "&:hover": { bgcolor: "#3451b3" } }}
                      >
                        Refresh
                      </Button>
                    }
                  />
                ) : (
                  <Stack spacing={2}>
                    {getRecentActivities.slice(0, 5).map((activity, index) => (
                      <ActivityCard key={index} activity={activity} />
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
            <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.02)", border: "1px solid #edf2f7" }}>
              <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                  <Typography variant="h6" fontWeight="600" color={PRIMARY_COLOR}>
                    Team Overview
                  </Typography>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => handleNavigateTo("/team-members")}
                    endIcon={<NavigateNext />}
                    sx={{ color: PRIMARY_COLOR }}
                  >
                    View All Team
                  </Button>
                </Box>

                <Grid container spacing={2}>
                  {getTeamMembers.map((member, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                      <TeamMemberCard member={member} />
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
            <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.02)", border: "1px solid #edf2f7" }}>
              <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                  <Typography variant="h6" fontWeight="600" color={PRIMARY_COLOR}>
                    Team Performance
                  </Typography>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => handleNavigateTo("/performance")}
                    endIcon={<NavigateNext />}
                    sx={{ color: PRIMARY_COLOR }}
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
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
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
                            <Typography variant="subtitle2" fontWeight="600">
                              {member.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {member.role}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ mb: 1.5 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              Performance
                            </Typography>
                            <Typography variant="caption" fontWeight="600" color={PRIMARY_COLOR}>
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

                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Completed
                            </Typography>
                            <Typography variant="body2" fontWeight="600">
                              {member.completed || 0}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Pending
                            </Typography>
                            <Typography variant="body2" fontWeight="600">
                              {member.pending || 0}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Total
                            </Typography>
                            <Typography variant="body2" fontWeight="600">
                              {member.total || 0}
                            </Typography>
                          </Box>
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

      {/* Floating Action Button for Mobile */}
      {isXSmall && (
        <Tooltip title="Refresh">
          <IconButton
            onClick={handleRefresh}
            disabled={refreshing}
            sx={{
              position: "fixed",
              bottom: 16,
              right: 16,
              zIndex: 1000,
              bgcolor: PRIMARY_COLOR,
              color: "white",
              width: 56,
              height: 56,
              boxShadow: "0 4px 20px rgba(69, 105, 234, 0.3)",
              "&:hover": {
                bgcolor: "#3451b3",
              },
            }}
          >
            <Refresh />
          </IconButton>
        </Tooltip>
      )}
    </Container>
  );
}