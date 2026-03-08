// pages/TeamAttendance.jsx (Updated with Edit Attendance)
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  Pagination,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Search,
  Visibility,
  Edit,
  Delete,
  History,
  CalendarToday,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Person,
  Group,
  Close,
  LocationOn,
  ArrowBack,
  DateRange,
  Dashboard,
  ExpandMore,
  ExpandLess,
  FilterAlt,
  Clear,
  Refresh,
  Save,
  EditNote,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { useAttendance } from "../hooks/useAttendance";
import AttendanceDetails from "./AttendanceDetails";
import { useNavigate } from "react-router-dom";

const PRIMARY_COLOR = "#4569ea";
const SECONDARY_COLOR = "#1a237e";

const PERIOD_OPTIONS = [
  { value: "Today", label: "Today", icon: <CalendarToday /> },
  { value: "This Week", label: "This Week", icon: <DateRange /> },
  { value: "This Month", label: "This Month", icon: <DateRange /> },
  { value: "All", label: "All Time", icon: <DateRange /> },
];

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
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
  },
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
        "& .MuiChip-icon": { color: config.color },
      }}
    />
  );
};

// ========== EDIT ATTENDANCE DIALOG ==========
const EditAttendanceDialog = ({
  open,
  onClose,
  attendance,
  onSave,
  loading,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [formData, setFormData] = useState({
    status: "",
    remarks: "",
  });
  const [errors, setErrors] = useState({});

  // Sync form when attendance changes
  useEffect(() => {
    if (attendance) {
      setFormData({
        status: attendance.status || "present",
        remarks: attendance.remarks || "",
      });
      setErrors({});
    }
  }, [attendance]);

  const validate = () => {
    const newErrors = {};
    if (!formData.status) newErrors.status = "Status is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    if (!attendance?._id) {
      onSave(null, { error: "Invalid attendance record" });
      return;
    }
    onSave(attendance._id, {
      status: formData.status,
      remarks: formData.remarks.trim(),
    });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleDateString("en-US", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      fullScreen={isMobile}
      TransitionComponent={isMobile ? Slide : Zoom}
      TransitionProps={isMobile ? { direction: "up" } : {}}
      transitionDuration={300}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 4,
          overflow: "hidden",
        },
      }}
    >
      {/* Colored top bar */}
      <Box
        sx={{
          height: 5,
          background: `linear-gradient(90deg, ${PRIMARY_COLOR}, ${SECONDARY_COLOR})`,
        }}
      />

      <DialogTitle
        sx={{
          pb: 1,
          pt: 2.5,
          px: { xs: 2, sm: 3 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              bgcolor: alpha(PRIMARY_COLOR, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <EditNote sx={{ color: PRIMARY_COLOR, fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
              Edit Attendance
            </Typography>
            {attendance && (
              <Typography variant="caption" color="text.secondary">
                {formatDate(attendance.date)}
              </Typography>
            )}
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            bgcolor: alpha("#000", 0.05),
            "&:hover": { bgcolor: alpha("#000", 0.1) },
          }}
        >
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: { xs: 2, sm: 3 }, pt: 2, pb: 1 }}>
        <Stack spacing={2.5}>
          {/* Current status preview */}
          {attendance && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(PRIMARY_COLOR, 0.04),
                border: `1px solid ${alpha(PRIMARY_COLOR, 0.12)}`,
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
                display="block"
                mb={1}
              >
                Current Record
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap" gap={1}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Punch In
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {attendance.punchIn
                      ? new Date(attendance.punchIn.time).toLocaleTimeString(
                          "en-US",
                          { hour: "2-digit", minute: "2-digit", hour12: true },
                        )
                      : "—"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Punch Out
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {attendance.punchOut
                      ? new Date(attendance.punchOut.time).toLocaleTimeString(
                          "en-US",
                          { hour: "2-digit", minute: "2-digit", hour12: true },
                        )
                      : attendance.punchIn
                        ? "Ongoing"
                        : "—"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Work Hours
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color={PRIMARY_COLOR}
                  >
                    {attendance.workHoursFormatted || "00:00"}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          )}

          {/* Status Select */}
          <FormControl fullWidth size="small" error={!!errors.status}>
            <InputLabel>Status *</InputLabel>
            <Select
              value={formData.status}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, status: e.target.value }));
                if (errors.status)
                  setErrors((prev) => ({ ...prev, status: "" }));
              }}
              label="Status *"
              sx={{
                borderRadius: 2,
              }}
              renderValue={(val) => {
                const cfg = STATUS_CONFIG[val];
                if (!cfg) return val;
                return (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ color: cfg.color, display: "flex" }}>
                      {cfg.icon}
                    </Box>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={{ color: cfg.color }}
                    >
                      {cfg.label}
                    </Typography>
                  </Box>
                );
              }}
            >
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <MenuItem key={key} value={key}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      py: 0.25,
                    }}
                  >
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        bgcolor: cfg.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: cfg.color,
                      }}
                    >
                      {cfg.icon}
                    </Box>
                    <Typography variant="body2" fontWeight={500}>
                      {cfg.label}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {errors.status && (
              <Typography
                variant="caption"
                color="error"
                sx={{ mt: 0.5, ml: 1.5 }}
              >
                {errors.status}
              </Typography>
            )}
          </FormControl>

          {/* Remarks */}
          <TextField
            fullWidth
            size="small"
            label="Remarks"
            placeholder="e.g. Approved by ASM"
            value={formData.remarks}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, remarks: e.target.value }))
            }
            multiline
            rows={3}
            inputProps={{ maxLength: 250 }}
            helperText={`${formData.remarks.length}/250`}
            FormHelperTextProps={{ sx: { textAlign: "right", mr: 0 } }}
            sx={{
              "& .MuiOutlinedInput-root": { borderRadius: 2 },
            }}
          />
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          p: { xs: 2, sm: 3 },
          pt: 2,
          gap: 1.5,
          flexDirection: { xs: "column", sm: "row" },
          borderTop: `1px solid ${alpha(PRIMARY_COLOR, 0.1)}`,
        }}
      >
        <Button
          fullWidth={isMobile}
          variant="outlined"
          onClick={onClose}
          disabled={loading}
          sx={{
            borderRadius: 2,
            px: 3,
            borderColor: alpha(PRIMARY_COLOR, 0.4),
            color: PRIMARY_COLOR,
            order: isMobile ? 2 : 1,
          }}
        >
          Cancel
        </Button>
        <Button
          fullWidth={isMobile}
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={
            loading ? <CircularProgress size={16} color="inherit" /> : <Save />
          }
          sx={{
            borderRadius: 2,
            px: 3,
            bgcolor: PRIMARY_COLOR,
            "&:hover": { bgcolor: SECONDARY_COLOR },
            order: isMobile ? 1 : 2,
          }}
        >
          {loading ? "Saving…" : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
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
  const toggleSection = (section) =>
    setExpandedSection(expandedSection === section ? null : section);

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

        <Box sx={{ maxHeight: "calc(90vh - 120px)", overflow: "auto", p: 3 }}>
          <Stack spacing={2.5}>
            {/* Search */}
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
                          <Search
                            sx={{ color: "text.secondary", fontSize: 20 }}
                          />
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

            {/* Period */}
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

            {/* Status */}
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
                "&:hover": { bgcolor: alpha(PRIMARY_COLOR, 0.05) },
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
                "&:hover": { bgcolor: SECONDARY_COLOR },
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
  console.log("member..", member)
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
                {member.firstName?.charAt(0) || "U"}
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
                  {member.phoneNumber || "N/A"}
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
          <Grid container spacing={1} sx={{ mb: 1.5 }}>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                {member.email}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Chip
                size="small"
                label={member.role || "TEAM"}
                sx={{
                  bgcolor: alpha(PRIMARY_COLOR, 0.1),
                  color: PRIMARY_COLOR,
                  height: 24,
                  fontSize: "0.7rem",
                }}
              />
            </Grid>
          </Grid>
          <Collapse in={expanded}>
            <Box
              sx={{
                mt: 2,
                pt: 2,
                borderTop: `1px solid ${alpha(PRIMARY_COLOR, 0.1)}`,
              }}
            >
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
const MobileAttendanceCard = ({
  attendance,
  onView,
  onEdit,
  onDelete,
  canDelete,
  canEdit,
  index,
}) => {
  const [expanded, setExpanded] = useState(false);
  const statusConfig =
    STATUS_CONFIG[attendance.status] || STATUS_CONFIG.present;

  const formatTime = (timestamp) => {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };
  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
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
                {attendance.user?.name || "Attendance Record"}
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
          <Grid container spacing={1} sx={{ mb: 1.5 }}>
            <Grid item xs={4}>
              <Typography variant="caption" color="text.secondary">
                Punch In
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {attendance.punchIn ? formatTime(attendance.punchIn.time) : "-"}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="caption" color="text.secondary">
                Punch Out
              </Typography>
              <Typography
                variant="body2"
                fontWeight={600}
                color={attendance.punchOut ? "text.primary" : PRIMARY_COLOR}
              >
                {attendance.punchOut
                  ? formatTime(attendance.punchOut.time)
                  : "Ongoing"}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="caption" color="text.secondary">
                Hours
              </Typography>
              <Typography
                variant="body2"
                fontWeight={600}
                color={PRIMARY_COLOR}
              >
                {attendance.workHoursFormatted || "00:00"}
              </Typography>
            </Grid>
          </Grid>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
            <StatusChip status={attendance.status || "present"} />
            {attendance.remarks && (
              <Chip
                size="small"
                label={attendance.remarks}
                variant="outlined"
                sx={{ fontSize: "0.65rem", maxWidth: 160, height: 22 }}
              />
            )}
          </Box>
          {attendance.punchIn?.address && (
            <Box display="flex" alignItems="center" gap={1}>
              <LocationOn sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography
                variant="caption"
                color="text.secondary"
                noWrap
                sx={{ maxWidth: 200 }}
              >
                {attendance.punchIn.address.split(",")[0]}
              </Typography>
            </Box>
          )}
          <Collapse in={expanded}>
            <Box
              sx={{
                mt: 2,
                pt: 2,
                borderTop: `1px solid ${alpha(statusConfig.color, 0.1)}`,
              }}
            >
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
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
                {canEdit && (
                  <Button
                    fullWidth
                    size="small"
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => onEdit(attendance)}
                    sx={{
                      borderRadius: 2,
                      borderColor: "#ff9800",
                      color: "#ff9800",
                      "&:hover": { bgcolor: alpha("#ff9800", 0.08) },
                    }}
                  >
                    Edit
                  </Button>
                )}
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
        ? "No records match your current filters."
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

// ========== MAIN COMPONENT ==========
export default function TeamAttendance() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { getUserRole } = useAuth();
  const {
    attendances,
    loading,
    error,
    success,
    pagination,
    fetchAttendances,
    getTeamMembers,
    updateAttendance,
    deleteAttendance,
    clearMessages,
  } = useAttendance();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [period, setPeriod] = useState("Today");
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Edit state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [attendanceToEdit, setAttendanceToEdit] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [attendanceToDelete, setAttendanceToDelete] = useState(null);

  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [navValue, setNavValue] = useState(0);
  const containerRef = useRef(null);

  const userRole = getUserRole();
  const isHeadOffice = userRole === "Head_office";
  const isASM = userRole === "ASM";
  const isZSM = userRole === "ZSM";
  // Managers (ASM, ZSM, Head_office) can edit; only Head_office can delete
  const canEdit = isHeadOffice || isASM || isZSM;
  const canDelete = isHeadOffice;

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchTerm) count++;
    if (statusFilter) count++;
    if (period !== "Today") count++;
    return count;
  }, [searchTerm, statusFilter, period]);

  const loadTeamMembers = useCallback(async () => {
    setLoadingMembers(true);
    try {
      const members = await getTeamMembers();
      setTeamMembers(members || []);
    } catch (err) {
      console.error("Error loading team members:", err);
      showSnackbar("Failed to load team members", "error");
    } finally {
      setLoadingMembers(false);
    }
  }, [getTeamMembers]);

  const loadMemberAttendance = useCallback(
    async (userId) => {
      if (!userId) return;
      
      const filters = {
        page: page + 1,
        limit: rowsPerPage,
        userId,
        ...(statusFilter && { status: statusFilter }),
        ...(period !== "All" && { period: period.toLowerCase() }),
      };
      await fetchAttendances(filters);
    },
    [fetchAttendances, page, rowsPerPage, statusFilter, period],
  );

  useEffect(() => {
    loadTeamMembers();
  }, [loadTeamMembers]);

  useEffect(() => {
    if (selectedMember?._id) {
      loadMemberAttendance(selectedMember._id);
    }
  }, [selectedMember, page, rowsPerPage, statusFilter, period, loadMemberAttendance]);

  useEffect(() => {
    if (error) setSnackbar({ open: true, message: error, severity: "error" });
    if (success)
      setSnackbar({ open: true, message: success, severity: "success" });
  }, [error, success]);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage - 1);
    containerRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(0);
  };
  
  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  
  const handleViewDetails = (attendance) => {
    setSelectedAttendance(attendance);
    setDetailsOpen(true);
  };

  // ── Edit handlers ────────────────────────────────────────────────────────────
  const handleEditOpen = (attendance) => {
    // Validate attendance has an ID
    if (!attendance || !attendance._id) {
      showSnackbar("Cannot edit: Invalid attendance record", "error");
      return;
    }
    console.log("Opening edit for attendance:", attendance._id);
    setAttendanceToEdit(attendance);
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setAttendanceToEdit(null);
  };

  const handleEditSave = async (id, data) => {
    // Validate ID
    if (!id) {
      showSnackbar("Invalid attendance record: Missing ID", "error");
      setEditLoading(false);
      setEditDialogOpen(false);
      return;
    }

    setEditLoading(true);
    try {
      const result = await updateAttendance(id, data);
      console.log("Edit result:", result);
      
      if (result?.success) {
        showSnackbar("Attendance updated successfully", "success");
        setEditDialogOpen(false);
        setAttendanceToEdit(null);
        if (selectedMember?._id) {
          await loadMemberAttendance(selectedMember._id);
        }
      } else {
        showSnackbar(result?.error || "Failed to update attendance", "error");
      }
    } catch (err) {
      console.error("Edit error:", err);
      showSnackbar("Failed to update attendance", "error");
    } finally {
      setEditLoading(false);
    }
  };

  // ── Delete handlers ──────────────────────────────────────────────────────────
  const handleDelete = (attendance) => {
    if (!attendance || !attendance._id) {
      showSnackbar("Cannot delete: Invalid attendance record", "error");
      return;
    }
    setAttendanceToDelete(attendance);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!attendanceToDelete?._id) {
      showSnackbar("Invalid attendance record", "error");
      setDeleteDialogOpen(false);
      return;
    }

    const result = await deleteAttendance(attendanceToDelete._id);
    if (result?.success) {
      showSnackbar("Attendance deleted successfully", "success");
      if (selectedMember?._id) {
        await loadMemberAttendance(selectedMember._id);
      }
    } else {
      showSnackbar(result?.error || "Failed to delete attendance", "error");
    }
    setDeleteDialogOpen(false);
    setAttendanceToDelete(null);
  };

  const handleMemberSelect = (member) => {
    if (!member?._id) {
      showSnackbar("Invalid member selected", "error");
      return;
    }
    setSelectedMember(member);
    setPage(0);
    setSearchTerm("");
    setStatusFilter("");
  };
  
  const handleBackToMembers = () => {
    setSelectedMember(null);
    setSearchTerm("");
    setStatusFilter("");
    setPeriod("Today");
    setPage(0);
  };
  
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setPeriod("Today");
    setPage(0);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filteredMembers = teamMembers.filter((member) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      member.firstName?.toLowerCase().includes(s) ||
      member.lastName?.toLowerCase().includes(s) ||
      member.email?.toLowerCase().includes(s) ||
      member.employeeId?.toLowerCase().includes(s)
    );
  });

  if (loadingMembers && !teamMembers.length && !selectedMember)
    return <LoadingSkeleton />;

  return (
    <Box
      ref={containerRef}
      sx={{
        p: { xs: 1.5, sm: 2, md: 3 },
        minHeight: "100vh",
        pb: { xs: 8, sm: 3 },
        bgcolor: "#f8fafc",
      }}
    >
      {/* Filter Drawer */}
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

      {/* Edit Dialog */}
      <EditAttendanceDialog
        open={editDialogOpen}
        onClose={handleEditClose}
        attendance={attendanceToEdit}
        onSave={handleEditSave}
        loading={editLoading}
      />

      {/* Header */}
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
                {selectedMember
                  ? `${selectedMember.firstName} ${selectedMember.lastName}'s Attendance`
                  : "Team Attendance"}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  opacity: 0.9,
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                }}
              >
                {selectedMember
                  ? "View and manage individual attendance records"
                  : "Manage team attendance records"}
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
              onClick={() =>
                selectedMember?._id
                  ? loadMemberAttendance(selectedMember._id)
                  : loadTeamMembers()
              }
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
        // ── Team Members View ──
        <>
          {isMobile ? (
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
                      <IconButton
                        size="small"
                        onClick={() => setSearchTerm("")}
                      >
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
          ) : (
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
                    onClick={() => setSearchTerm("")}
                    sx={{ color: "error.main" }}
                  >
                    Clear
                  </Button>
                )}
              </Stack>
            </Paper>
          )}

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
                            <Avatar
                              sx={{
                                bgcolor: PRIMARY_COLOR,
                                width: 48,
                                height: 48,
                              }}
                            >
                              {member.firstName?.charAt(0)}
                            </Avatar>
                            <Box flex={1}>
                              <Typography variant="subtitle1" fontWeight={700}>
                                {member.firstName} {member.lastName}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {member.employeeId || "No ID"}
                              </Typography>
                            </Box>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {member.email}
                          </Typography>
                          <Chip
                            label={member.role || "TEAM"}
                            size="small"
                            sx={{
                              bgcolor: alpha(PRIMARY_COLOR, 0.1),
                              color: PRIMARY_COLOR,
                              alignSelf: "flex-start",
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
              onClearFilters={() => setSearchTerm("")}
              hasFilters={!!searchTerm}
              message="No team members found"
            />
          )}
        </>
      ) : (
        // ── Member Attendance View ──
        <>
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
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                          >
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
                          onDelete={() => setStatusFilter("")}
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
                          onDelete={() => setPeriod("Today")}
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

          <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
            {!isMobile ? (
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: alpha(PRIMARY_COLOR, 0.05) }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Punch In</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Punch Out</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Hours</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Remarks</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                          <CircularProgress />
                        </TableCell>
                      </TableRow>
                    ) : attendances && attendances.length > 0 ? (
                      attendances.map((attendance) => (
                        <TableRow
                          key={attendance._id}
                          hover
                          sx={{
                            "&:hover": { bgcolor: alpha(PRIMARY_COLOR, 0.02) },
                          }}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {formatDate(attendance.date)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {attendance.punchIn ? (
                              <Chip
                                label={new Date(
                                  attendance.punchIn.time,
                                ).toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                })}
                                size="small"
                                sx={{
                                  bgcolor: alpha("#4caf50", 0.1),
                                  color: "#4caf50",
                                }}
                              />
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            {attendance.punchOut ? (
                              <Chip
                                label={new Date(
                                  attendance.punchOut.time,
                                ).toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                })}
                                size="small"
                                sx={{
                                  bgcolor: alpha("#ff9800", 0.1),
                                  color: "#ff9800",
                                }}
                              />
                            ) : attendance.punchIn ? (
                              <Chip
                                label="Ongoing"
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              color={PRIMARY_COLOR}
                            >
                              {attendance.workHoursFormatted || "00:00"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <StatusChip
                              status={attendance.status || "present"}
                            />
                          </TableCell>
                          <TableCell>
                            {attendance.remarks ? (
                              <Tooltip title={attendance.remarks}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  noWrap
                                  sx={{ maxWidth: 150 }}
                                >
                                  {attendance.remarks}
                                </Typography>
                              </Tooltip>
                            ) : (
                              <Typography variant="body2" color="text.disabled">
                                —
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <Stack
                              direction="row"
                              spacing={0.5}
                              justifyContent="center"
                            >
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewDetails(attendance)}
                                  sx={{
                                    color: PRIMARY_COLOR,
                                    "&:hover": {
                                      bgcolor: alpha(PRIMARY_COLOR, 0.1),
                                    },
                                  }}
                                >
                                  <Visibility fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              {canEdit && (
                                <Tooltip title="Edit Attendance">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleEditOpen(attendance)}
                                    sx={{
                                      color: "#ff9800",
                                      "&:hover": {
                                        bgcolor: alpha("#ff9800", 0.1),
                                      },
                                    }}
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
                                    sx={{
                                      color: "#f44336",
                                      "&:hover": {
                                        bgcolor: alpha("#f44336", 0.1),
                                      },
                                    }}
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
                      onEdit={handleEditOpen}
                      onDelete={handleDelete}
                      canDelete={canDelete}
                      canEdit={canEdit}
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

            {/* Pagination */}
            {attendances &&
              attendances.length > 0 &&
              pagination &&
              pagination.totalPages > 1 && (
                <Box
                  sx={{
                    p: 2,
                    borderTop: 1,
                    borderColor: "divider",
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Showing {page * rowsPerPage + 1}–
                    {Math.min((page + 1) * rowsPerPage, pagination.totalItems)}{" "}
                    of {pagination.totalItems}
                  </Typography>
                  <Pagination
                    count={pagination.totalPages}
                    page={page + 1}
                    onChange={handleChangePage}
                    color="primary"
                    size={isMobile ? "small" : "medium"}
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

      {/* Mobile Bottom Nav */}
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
                selectedMember
                  ? handleBackToMembers()
                  : window.scrollTo({ top: 0, behavior: "smooth" });
              } else if (newValue === 1) navigate("/dashboard");
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
        canEdit={canEdit}
        canDelete={canDelete}
        onEdit={handleEditOpen}
        onDelete={handleDelete}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        fullScreen={isMobile}
        PaperProps={{
          sx: { borderRadius: isMobile ? 0 : 4, margin: isMobile ? 0 : 24 },
        }}
        TransitionComponent={isMobile ? Slide : Fade}
        transitionDuration={300}
      >
        <DialogTitle
          sx={{ bgcolor: "#f44336", color: "white", px: { xs: 2, sm: 3 } }}
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6" fontWeight={700}>
              Confirm Delete
            </Typography>
            <IconButton
              onClick={() => setDeleteDialogOpen(false)}
              size="small"
              sx={{ color: "white" }}
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ py: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 } }}>
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            This action cannot be undone.
          </Alert>
          {attendanceToDelete && (
            <Paper
              sx={{ p: 2, bgcolor: alpha("#f44336", 0.05), borderRadius: 2 }}
            >
              <Typography variant="body2">
                <strong>Date:</strong> {formatDate(attendanceToDelete.date)}
                <br />
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
          sx={{ width: "100%", borderRadius: 2, color: "#fff" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}