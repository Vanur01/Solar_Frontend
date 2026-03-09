// pages/InputLeadsPage.jsx (Updated with Mobile View)
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  Stack,
  MenuItem,
  Select,
  FormControl,
  Grid,
  Input,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme,
  AlertTitle,
  Avatar,
  alpha,
  Paper,
  InputLabel,
  Badge,
  Fade,
  Zoom,
  Fab,
  BottomNavigation,
  BottomNavigationAction,
  Tooltip,
  Divider,
  Skeleton,
  Chip,
} from "@mui/material";
import {
  Add,
  Description,
  Close,
  FilterList,
  Upload,
  CloudUpload,
  Download,
  People,
  TrendingUp,
  Warning,
  Refresh,
  Dashboard,
  Person,
  Schedule,
  DateRange,
  FilterAlt,
  Clear,
  Info,
  CheckCircle,
  Error,
  FileDownload,
  InsertDriveFile,
  TableChart,
  BarChart,
  Assessment,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const PRIMARY = "#4569ea";
const SECONDARY = "#1a237e";
const API_BASE = (
  process.env.REACT_APP_API_URL || "https://backend.sunergytechsolar.com/api/v1"
).replace(/\/+$/, "");

// Role-based access control
const ALLOWED_ROLES = ["ASM", "ZSM", "Head_office", "TEAM"];

const hasAccess = (userRole) => ALLOWED_ROLES.includes(userRole);

// Role Configuration
const ROLE_CONFIG = {
  Head_office: {
    label: "Head Office",
    color: PRIMARY,
    icon: <Person sx={{ fontSize: 16 }} />,
  },
  ZSM: {
    label: "Zone Sales Manager",
    color: PRIMARY,
    icon: <Person sx={{ fontSize: 16 }} />,
  },
  ASM: {
    label: "Area Sales Manager",
    color: PRIMARY,
    icon: <Person sx={{ fontSize: 16 }} />,
  },
  TEAM: {
    label: "Team Member",
    color: PRIMARY,
    icon: <Person sx={{ fontSize: 16 }} />,
  },
};

const getRoleConfig = (role) => {
  return (
    ROLE_CONFIG[role] || {
      label: role || "User",
      color: PRIMARY,
      icon: <Person sx={{ fontSize: 16 }} />,
    }
  );
};

// Summary Card Component
const SummaryCard = ({ card, index }) => (
  <Fade in={true} timeout={500 + index * 100}>
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, sm: 2, md: 2.5 },
        borderRadius: 3,
        border: `1px solid ${alpha(card.color, 0.1)}`,
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        transition: "transform 0.2s",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
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
              bgcolor: alpha(card.color, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: card.color,
            }}
          >
            {React.cloneElement(card.icon, {
              sx: { fontSize: { xs: 16, sm: 20, md: 24 } },
            })}
          </Box>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              color: card.color,
              fontSize: { xs: "1.25rem", sm: "1.5rem", md: "2rem" },
            }}
          >
            {card.value}
          </Typography>
        </Box>
        <Box>
          <Typography
            variant="subtitle2"
            fontWeight={600}
            sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
          >
            {card.label}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: { xs: "0.6rem", sm: "0.7rem" } }}
          >
            {card.subText}
          </Typography>
        </Box>
        <Typography
          variant="caption"
          sx={{
            color: card.color,
            fontWeight: 500,
            display: "block",
            fontSize: { xs: "0.6rem", sm: "0.7rem" },
          }}
        >
          {card.trend}
        </Typography>
      </Stack>
    </Paper>
  </Fade>
);

// Mobile Option Card Component
const MobileOptionCard = ({
  icon,
  title,
  description,
  buttonText,
  onClick,
  color = PRIMARY,
}) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      borderRadius: 3,
      border: `2px dashed ${alpha(color, 0.3)}`,
      bgcolor: alpha(color, 0.02),
      textAlign: "center",
    }}
  >
    <Avatar
      sx={{
        width: 56,
        height: 56,
        bgcolor: alpha(color, 0.1),
        color: color,
        mx: "auto",
        mb: 2,
      }}
    >
      {icon}
    </Avatar>
    <Typography variant="h6" fontWeight={600} gutterBottom>
      {title}
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
      {description}
    </Typography>
    <Button
      onClick={onClick}
      variant="contained"
      startIcon={icon}
      fullWidth
      sx={{
        bgcolor: color,
        borderRadius: 2,
        py: 1.2,
        "&:hover": { bgcolor: SECONDARY },
      }}
    >
      {buttonText}
    </Button>
  </Paper>
);

export default function InputLeadsPage() {
  const [filter, setFilter] = useState("Today");
  const [selectedFile, setSelectedFile] = useState(null);
  const [leadsData, setLeadsData] = useState({
    totalLeads: 0,
    activeLeads: 0,
    convertedLeads: 0,
    conversionRate: 0,
    todayLeads: 0,
    thisWeekLeads: 0,
    thisMonthLeads: 0,
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { fetchAPI, getUserRole } = useAuth();
  const userRole = getUserRole();
  const theme = useTheme();

  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  // Check access
  const canImportLeads = hasAccess(userRole);

  // Stats cards data - memoized
  const statsCards = useMemo(
    () => [
      {
        label: "Total Leads",
        value: leadsData.totalLeads,
        color: PRIMARY,
        icon: <People />,
        subText: "All time leads",
        trend:
          leadsData.todayLeads > 0
            ? `+${leadsData.todayLeads} today`
            : "No new leads",
      },
      {
        label: "Active Leads",
        value: leadsData.activeLeads,
        color: PRIMARY,
        icon: <TrendingUp />,
        subText: "Currently active",
        trend: "Follow up required",
      },
      {
        label: "Converted",
        value: leadsData.convertedLeads,
        color: PRIMARY,
        icon: <CheckCircle />,
        subText: "Successfully converted",
        trend: `${leadsData.conversionRate}% rate`,
      },
      {
        label: "This Month",
        value: leadsData.thisMonthLeads,
        color: PRIMARY,
        icon: <BarChart />,
        subText: "Monthly performance",
        trend:
          leadsData.thisWeekLeads > 0
            ? `+${leadsData.thisWeekLeads} this week`
            : "No weekly leads",
      },
    ],
    [leadsData],
  );

  // Fetch leads stats - optimized
  const fetchLeadsStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchAPI("/lead/stats");

      if (response?.success && response.result?.stats) {
        setLeadsData({
          totalLeads: response.result.stats.totalLeads || 0,
          activeLeads: response.result.stats.activeLeads || 0,
          convertedLeads: response.result.stats.convertedLeads || 0,
          conversionRate: response.result.stats.conversionRate || 0,
          todayLeads: response.result.stats.todayLeads || 0,
          thisWeekLeads: response.result.stats.thisWeekLeads || 0,
          thisMonthLeads: response.result.stats.thisMonthLeads || 0,
        });
      } else {
        throw new Error(response?.message || "Failed to fetch leads stats");
      }
    } catch (error) {
      console.error("Error fetching leads stats:", error);
      showSnackbar("Failed to load leads statistics", "error");
      setLeadsData({
        totalLeads: 0,
        activeLeads: 0,
        convertedLeads: 0,
        conversionRate: 0,
        todayLeads: 0,
        thisWeekLeads: 0,
        thisMonthLeads: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [fetchAPI]);

  // Initial load
  useEffect(() => {
    if (canImportLeads) {
      fetchLeadsStats();
    }
  }, [fetchLeadsStats, canImportLeads]);

  // File validation helper
  const validateFile = useCallback((file) => {
    const allowedTypes = [".xlsx", ".csv"];
    const ext = "." + file.name.split(".").pop().toLowerCase();

    if (!allowedTypes.includes(ext)) {
      throw new Error(`Only ${allowedTypes.join(", ")} files are allowed`);
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error("File size must be less than 10MB");
    }

    return true;
  }, []);

  // Handle file change
  const handleFileChange = useCallback(
    (e) => {
      if (!canImportLeads) {
        showSnackbar("You don't have permission to import leads", "error");
        return;
      }

      const file = e.target.files[0];
      if (!file) return;

      try {
        validateFile(file);
        setSelectedFile(file);
        showSnackbar(`Selected: ${file.name}`, "success");
      } catch (error) {
        showSnackbar(error.message, "error");
        e.target.value = null;
      }
    },
    [validateFile, canImportLeads],
  );

  // Import leads function
  const handleImportLeads = useCallback(async () => {
    if (!canImportLeads) {
      showSnackbar("You don't have permission to import leads", "error");
      return;
    }

    if (!selectedFile) {
      showSnackbar("Please select a file first", "warning");
      return;
    }

    setUploading(true);
    const token = localStorage.getItem("token");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("uploadedBy", userRole || "Unknown");

      const response = await fetch(`${API_BASE}/lead/import`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const text = await response.text();

      // Check for HTML response (auth error)
      if (text.trimStart().startsWith("<!DOCTYPE") || text.includes("<html")) {
        throw new Error("Authentication failed. Please log in again.");
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Invalid response from server");
      }

      if (!response.ok) {
        throw new Error(data.message || data.error || "Import failed");
      }

      showSnackbar(data.message || "Leads imported successfully!", "success");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = null;
      fetchLeadsStats(); // Refresh stats
    } catch (error) {
      console.error("Import error:", error);
      showSnackbar(error.message || "Failed to import leads", "error");
    } finally {
      setUploading(false);
    }
  }, [selectedFile, fetchLeadsStats, canImportLeads, userRole]);

  // Event handlers
  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = null;
    showSnackbar("File removed", "info");
  }, []);

  const addLead = useCallback(() => navigate("/add-lead"), [navigate]);

  const handleFilterChange = useCallback((e) => {
    setFilter(e.target.value);
    // You can add filter logic here if needed
  }, []);

  const showSnackbar = useCallback((message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  // Download template
  const downloadTemplate = useCallback(() => {
    const templateUrl = `${API_BASE}/templates/leads_template.csv`;
    const link = document.createElement("a");
    link.href = templateUrl;
    link.download = "leads_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSnackbar("Template download started", "info");
  }, [showSnackbar]);

  // Loading skeleton
  if (loading) {
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
  }

  // Check if user has access to this page
  if (!canImportLeads) {
    return (
      <Box
        sx={{
          p: 3,
          textAlign: "center",
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Alert severity="warning" sx={{ maxWidth: 500, borderRadius: 3 }}>
          <AlertTitle>Access Restricted</AlertTitle>
          Only ASM, ZSM, and Head Office can import leads.
          <br />
          <Typography variant="body2" sx={{ mt: 1 }}>
            Your role: <strong>{userRole || "Unknown"}</strong>
          </Typography>
          <Button
            sx={{ mt: 2 }}
            variant="contained"
            onClick={() => navigate("/dashboard")}
            style={{ backgroundColor: PRIMARY }}
          >
            Go to Dashboard
          </Button>
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: { xs: 1.5, sm: 2, md: 3 },
        pb: { xs: 8, sm: 3 },
        bgcolor: "#f8fafc",
      }}
    >
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{
          vertical: isMobile ? "top" : "bottom",
          horizontal: isMobile ? "center" : "right",
        }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%", borderRadius: 2, color: "#fff" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Header with Gradient Background */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)`,
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
              Import Leads
            </Typography>
            <Typography
              variant="body2"
              sx={{
                opacity: 0.9,
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              }}
            >
              Import and manage leads • Role: {getRoleConfig(userRole).label}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <FormControl size="small" sx={{ minWidth: { xs: 120, sm: 140 } }}>
              <Select
                value={filter}
                onChange={handleFilterChange}
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "#fff",
                  borderRadius: 2,
                  height: 40,
                  "& .MuiSvgIcon-root": { color: "#fff" },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255,255,255,0.3)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255,255,255,0.5)",
                  },
                }}
              >
                <MenuItem value="Today">Today</MenuItem>
                <MenuItem value="Week">This Week</MenuItem>
                <MenuItem value="Month">This Month</MenuItem>
                <MenuItem value="Year">This Year</MenuItem>
              </Select>
            </FormControl>
            <Button
              startIcon={<Refresh />}
              onClick={fetchLeadsStats}
              variant="contained"
              size={isMobile ? "small" : "medium"}
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                color: "#fff",
                borderRadius: 2,
                height: 40,
                "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
              }}
            >
              Refresh
            </Button>
          </Box>
        </Stack>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={isMobile ? 1.5 : 2} sx={{ mb: 4 }}>
        {statsCards.map((card, index) => (
          <Grid item xs={6} sm={6} md={3} key={card.label}>
            <SummaryCard card={card} index={index} />
          </Grid>
        ))}
      </Grid>

      {/* Add Leads Section */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          p: { xs: 2.5, sm: 4 },
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "#fff",
        }}
      >
        <Typography
          variant={isMobile ? "h6" : "h5"}
          fontWeight="bold"
          gutterBottom
        >
          Import New Leads
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Bulk import leads from Excel/CSV files or add manually
        </Typography>

        {/* Two Options: Manual Add & Bulk Import */}
        <Grid container spacing={3}>
          {/* Manual Add Option */}
          <Grid item xs={12} md={6}>
            <MobileOptionCard
              icon={<Add />}
              title="Add Single Lead"
              description="Add individual leads with detailed information"
              buttonText="Add New Lead"
              onClick={addLead}
              color={PRIMARY}
            />
          </Grid>

          {/* Bulk Import Option */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3 },
                borderRadius: 3,
                border: `2px dashed ${alpha(PRIMARY, 0.3)}`,
                bgcolor: alpha(PRIMARY, 0.02),
                textAlign: "center",
              }}
            >
              <Avatar
                sx={{
                  width: { xs: 52, sm: 60 },
                  height: { xs: 52, sm: 60 },
                  bgcolor: alpha(PRIMARY, 0.1),
                  color: PRIMARY,
                  mx: "auto",
                  mb: 2,
                }}
              >
                <CloudUpload sx={{ fontSize: { xs: 28, sm: 32 } }} />
              </Avatar>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Bulk Import
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2.5 }}
              >
                Import multiple leads from Excel/CSV file
              </Typography>

              <Input
                inputRef={fileInputRef}
                type="file"
                accept=".xlsx,.csv"
                onChange={handleFileChange}
                sx={{ display: "none" }}
                id="file-upload"
              />

              {!selectedFile ? (
                <>
                  <label htmlFor="file-upload">
                    <Button
                      variant="contained"
                      component="span"
                      startIcon={<Upload />}
                      fullWidth
                      sx={{
                        bgcolor: PRIMARY,
                        borderRadius: 2,
                        py: 1.2,
                        "&:hover": { bgcolor: SECONDARY },
                      }}
                    >
                      Select File
                    </Button>
                  </label>
                </>
              ) : (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "action.hover",
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 2 }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Description sx={{ color: PRIMARY }} />
                      <Box sx={{ maxWidth: { xs: 150, sm: 200 } }}>
                        <Typography fontWeight={600} noWrap>
                          {selectedFile.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </Typography>
                      </Box>
                    </Stack>
                    <IconButton size="small" onClick={handleRemoveFile}>
                      <Close />
                    </IconButton>
                  </Stack>
                  <Button
                    variant="contained"
                    onClick={handleImportLeads}
                    disabled={uploading}
                    fullWidth
                    sx={{
                      bgcolor: PRIMARY,
                      borderRadius: 2,
                      py: 1.2,
                      "&:hover": { bgcolor: SECONDARY },
                    }}
                    startIcon={
                      uploading ? (
                        <CircularProgress size={20} sx={{ color: "#fff" }} />
                      ) : null
                    }
                  >
                    {uploading ? "Importing..." : "Import Leads"}
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Instructions */}
        <Box
          sx={{
            mt: 4,
            p: { xs: 2, sm: 3 },
            bgcolor: alpha(PRIMARY, 0.02),
            borderRadius: 2,
            border: "1px solid",
            borderColor: alpha(PRIMARY, 0.2),
          }}
        >
          <Typography
            variant="subtitle2"
            fontWeight={600}
            color="text.primary"
            gutterBottom
          >
            📋 Import Instructions
          </Typography>
          <Stack spacing={1.5} sx={{ pl: { xs: 0, sm: 2 } }}>
            <Typography
              variant="body2"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Info fontSize="small" sx={{ color: PRIMARY }} />
              1. Use the template with required columns:{" "}
              <strong>name, phone, email, source, status</strong>
            </Typography>
            <Typography
              variant="body2"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Info fontSize="small" sx={{ color: PRIMARY }} />
              2. Save file as <strong>.xlsx</strong> or <strong>.csv</strong>{" "}
              format
            </Typography>
            <Typography
              variant="body2"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Info fontSize="small" sx={{ color: PRIMARY }} />
              3. Maximum file size: <strong>10MB</strong>
            </Typography>
            <Typography
              variant="body2"
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Info fontSize="small" sx={{ color: PRIMARY }} />
              4. Required permissions: <strong>ASM, ZSM, or Head Office</strong>
            </Typography>
            <Button
              onClick={downloadTemplate}
              variant="text"
              startIcon={<FileDownload />}
              sx={{
                mt: 1,
                alignSelf: "flex-start",
                color: PRIMARY,
                "&:hover": { bgcolor: alpha(PRIMARY, 0.1) },
              }}
            >
              Download Template
            </Button>
          </Stack>
        </Box>

        {/* Quick Tips */}
        <Box
          sx={{
            mt: 3,
            p: { xs: 1.5, sm: 2 },
            bgcolor: alpha(PRIMARY, 0.08),
            borderRadius: 2,
            border: "1px solid",
            borderColor: alpha(PRIMARY, 0.3),
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Warning sx={{ color: PRIMARY, fontSize: { xs: 18, sm: 20 } }} />
            <Typography variant="body2">
              <strong>Tip:</strong> Ensure phone numbers are in correct format
              (10 digits). Invalid data may be skipped during import.
            </Typography>
          </Stack>
        </Box>
      </Paper>

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
            borderTop: `1px solid ${alpha(PRIMARY, 0.1)}`,
          }}
          elevation={3}
        >
          <BottomNavigation
            showLabels
            sx={{
              height: 64,
              "& .MuiBottomNavigationAction-root": {
                color: "text.secondary",
                "&.Mui-selected": { color: PRIMARY },
              },
            }}
          >
            <BottomNavigationAction
              label="Dashboard"
              icon={<Dashboard />}
              onClick={() => navigate("/dashboard")}
            />
            <BottomNavigationAction
              label="Leads"
              icon={<People />}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            />
            <BottomNavigationAction
              label="Profile"
              icon={<Person />}
              onClick={() => navigate("/profile")}
            />
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
}
