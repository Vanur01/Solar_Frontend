// pages/TeamAttendance.jsx
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
  Zoom,
  BottomNavigation,
  BottomNavigationAction,
  SwipeableDrawer,
  Collapse,
  Badge,
  Fab,
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

// ─── Constants ─────────────────────────────────────────────────────────────
const PRIMARY = "#4569ea";
const SECONDARY = "#1a237e";
const SUCCESS = "#22c55e";
const DANGER = "#ef4444";
const WARNING = "#f59e0b";

const PERIOD_OPTIONS = [
  { value: "Today", label: "Today" },
  { value: "This Week", label: "This Week" },
  { value: "This Month", label: "This Month" },
  { value: "All", label: "All Time" },
];

const STATUS_CONFIG = {
  present: {
    bg: alpha(SUCCESS, 0.08),
    color: SUCCESS,
    icon: <CheckCircle sx={{ fontSize: 14 }} />,
    label: "Present",
  },
  absent: {
    bg: alpha(DANGER, 0.08),
    color: DANGER,
    icon: <ErrorIcon sx={{ fontSize: 14 }} />,
    label: "Absent",
  },
  late: {
    bg: alpha(WARNING, 0.08),
    color: WARNING,
    icon: <Warning sx={{ fontSize: 14 }} />,
    label: "Late",
  },
  leave: {
    bg: alpha("#a855f7", 0.08),
    color: "#a855f7",
    icon: <Person sx={{ fontSize: 14 }} />,
    label: "Leave",
  },
  holiday: {
    bg: alpha("#3b82f6", 0.08),
    color: "#3b82f6",
    icon: <CalendarToday sx={{ fontSize: 14 }} />,
    label: "Holiday",
  },
};

// ─── Styled ────────────────────────────────────────────────────────────────
const MemberCard = styled(Card)(() => ({
  borderRadius: 16,
  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  border: `1px solid ${alpha(PRIMARY, 0.1)}`,
  transition: "transform .2s, box-shadow .2s",
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow: `0 8px 24px ${alpha(PRIMARY, 0.12)}`,
  },
}));

// ─── StatusChip ────────────────────────────────────────────────────────────
const StatusChip = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.present;
  return (
    <Chip
      size="small"
      label={cfg.label}
      icon={cfg.icon}
      sx={{
        bgcolor: cfg.bg,
        color: cfg.color,
        fontWeight: 700,
        "& .MuiChip-icon": { color: cfg.color },
      }}
    />
  );
};

// ─── EditAttendanceDialog ──────────────────────────────────────────────────
const EditAttendanceDialog = ({
  open,
  onClose,
  attendance,
  onSave,
  loading,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [form, setForm] = useState({ status: "present", remarks: "" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open && attendance) {
      setForm({
        status: attendance.status || "present",
        remarks: attendance.remarks || "",
      });
      setErrors({});
    }
  }, [open, attendance]);

  const validate = () => {
    const e = {};
    if (!form.status) e.status = "Status is required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const id = attendance?._id || attendance?.id;
    if (!id) {
      onSave(null, { error: "Invalid attendance record" });
      return;
    }
    onSave(id, { status: form.status, remarks: form.remarks.trim() });
  };

  const fmt = (ts) =>
    !ts
      ? "—"
      : new Date(ts).toLocaleDateString("en-US", {
          weekday: "long",
          day: "2-digit",
          month: "long",
          year: "numeric",
        });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      fullScreen={isMobile}
      TransitionComponent={isMobile ? Slide : Zoom}
      TransitionProps={isMobile ? { direction: "up" } : {}}
      PaperProps={{
        sx: { borderRadius: isMobile ? 0 : 4, overflow: "hidden" },
      }}
    >
      <Box
        sx={{
          height: 5,
          background: `linear-gradient(90deg, ${PRIMARY}, ${SECONDARY})`,
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
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              bgcolor: alpha(PRIMARY, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <EditNote sx={{ color: PRIMARY, fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
              Edit Attendance
            </Typography>
            {attendance && (
              <Typography variant="caption" color="text.secondary">
                {fmt(attendance.date)}
              </Typography>
            )}
          </Box>
        </Stack>
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
          {/* Current record preview */}
          {attendance && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(PRIMARY, 0.04),
                border: `1px solid ${alpha(PRIMARY, 0.12)}`,
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
                display="block"
                sx={{ mb: 1 }}
              >
                Current Record
              </Typography>
              <Grid container spacing={1.5}>
                {[
                  [
                    "Punch In",
                    attendance.punchIn
                      ? new Date(attendance.punchIn.time).toLocaleTimeString(
                          "en-US",
                          { hour: "2-digit", minute: "2-digit", hour12: true },
                        )
                      : "—",
                  ],
                  [
                    "Punch Out",
                    attendance.punchOut
                      ? new Date(attendance.punchOut.time).toLocaleTimeString(
                          "en-US",
                          { hour: "2-digit", minute: "2-digit", hour12: true },
                        )
                      : attendance.punchIn
                        ? "Ongoing"
                        : "—",
                  ],
                  ["Work Hours", attendance.workHoursFormatted || "—"],
                ].map(([l, v]) => (
                  <Grid item xs={4} key={l}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      {l}
                    </Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {v}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}

          {/* Status */}
          <FormControl fullWidth size="small" error={!!errors.status}>
            <InputLabel>Status *</InputLabel>
            <Select
              value={form.status}
              label="Status *"
              sx={{ borderRadius: 2 }}
              onChange={(e) => {
                setForm((p) => ({ ...p, status: e.target.value }));
                if (errors.status) setErrors((p) => ({ ...p, status: "" }));
              }}
              renderValue={(val) => {
                const cfg = STATUS_CONFIG[val];
                if (!cfg) return val;
                return (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ color: cfg.color, display: "flex" }}>
                      {cfg.icon}
                    </Box>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{ color: cfg.color }}
                    >
                      {cfg.label}
                    </Typography>
                  </Stack>
                );
              }}
            >
              {Object.entries(STATUS_CONFIG).map(([k, cfg]) => (
                <MenuItem key={k} value={k}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
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
                  </Stack>
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
            placeholder="e.g. Approved by manager"
            value={form.remarks}
            onChange={(e) =>
              setForm((p) => ({ ...p, remarks: e.target.value }))
            }
            multiline
            rows={3}
            inputProps={{ maxLength: 250 }}
            helperText={`${form.remarks.length}/250`}
            FormHelperTextProps={{ sx: { textAlign: "right", mr: 0 } }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          p: { xs: 2, sm: 3 },
          pt: 2,
          gap: 1.5,
          flexDirection: { xs: "column", sm: "row" },
          borderTop: `1px solid ${alpha(PRIMARY, 0.1)}`,
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
            borderColor: alpha(PRIMARY, 0.4),
            color: PRIMARY,
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
            bgcolor: PRIMARY,
            order: isMobile ? 1 : 2,
            "&:hover": { bgcolor: SECONDARY },
          }}
        >
          {loading ? "Saving…" : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Mobile Team Member Card ────────────────────────────────────────────────
const MobileTeamCard = ({ member, onViewAttendance, index }) => {
  const [exp, setExp] = useState(false);
  return (
    <Fade in timeout={400 + index * 50}>
      <Paper
        sx={{
          mb: 1.5,
          borderRadius: 3,
          border: `1px solid ${alpha(PRIMARY, 0.1)}`,
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: 2 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            sx={{ mb: 1.5 }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar
                sx={{
                  bgcolor: PRIMARY,
                  color: "#fff",
                  width: 48,
                  height: 48,
                  fontWeight: 700,
                }}
              >
                {member.firstName?.charAt(0) || "U"}
              </Avatar>
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  color={PRIMARY}
                >
                  {member.firstName} {member.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {member.phoneNumber || member.email || "N/A"}
                </Typography>
              </Box>
            </Stack>
            <IconButton
              size="small"
              onClick={() => setExp(!exp)}
              sx={{
                bgcolor: alpha(PRIMARY, 0.08),
                transform: exp ? "rotate(180deg)" : "none",
                transition: "transform .25s",
              }}
            >
              <ExpandMore />
            </IconButton>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Chip
              size="small"
              label={member.role || "TEAM"}
              sx={{
                bgcolor: alpha(PRIMARY, 0.1),
                color: PRIMARY,
                fontSize: "0.7rem",
              }}
            />
            {member.email && (
              <Typography
                variant="caption"
                color="text.secondary"
                noWrap
                sx={{ mt: 0.3 }}
              >
                {member.email}
              </Typography>
            )}
          </Stack>

          <Collapse in={exp}>
            <Box
              sx={{
                mt: 2,
                pt: 2,
                borderTop: `1px dashed ${alpha(PRIMARY, 0.12)}`,
              }}
            >
              <Button
                fullWidth
                size="small"
                variant="contained"
                startIcon={<History />}
                onClick={() => onViewAttendance(member)}
                sx={{
                  bgcolor: PRIMARY,
                  borderRadius: 2,
                  "&:hover": { bgcolor: SECONDARY },
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

// ─── Mobile Attendance Card ─────────────────────────────────────────────────
const MobileAttCard = ({
  attendance: a,
  onView,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
  index,
}) => {
  const [exp, setExp] = useState(false);
  const cfg = STATUS_CONFIG[a.status] || STATUS_CONFIG.present;
  const ft = (ts) =>
    ts
      ? new Date(ts).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "—";
  const fd = (ts) =>
    ts
      ? new Date(ts).toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";

  return (
    <Fade in timeout={400 + index * 50}>
      <Paper
        sx={{
          mb: 1.5,
          borderRadius: 3,
          border: `1px solid ${alpha(cfg.color, 0.2)}`,
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: 2 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            sx={{ mb: 1.5 }}
          >
            <Box>
              <Typography variant="subtitle2" fontWeight={700}>
                {fd(a.date)}
              </Typography>
              <StatusChip status={a.status || "present"} />
            </Box>
            <IconButton
              size="small"
              onClick={() => setExp(!exp)}
              sx={{
                bgcolor: alpha(cfg.color, 0.08),
                transform: exp ? "rotate(180deg)" : "none",
                transition: "transform .25s",
              }}
            >
              <ExpandMore />
            </IconButton>
          </Stack>

          <Grid container spacing={1} sx={{ mb: 1 }}>
            {[
              ["In", ft(a.punchIn?.time), SUCCESS],
              [
                "Out",
                a.punchOut ? ft(a.punchOut.time) : "Ongoing",
                a.punchOut ? WARNING : PRIMARY,
              ],
              ["Hrs", a.workHoursFormatted || "—", PRIMARY],
            ].map(([l, v, c]) => (
              <Grid item xs={4} key={l}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  {l}
                </Typography>
                <Typography variant="body2" fontWeight={700} color={c}>
                  {v}
                </Typography>
              </Grid>
            ))}
          </Grid>

          {a.remarks && (
            <Chip
              size="small"
              label={a.remarks}
              variant="outlined"
              sx={{ fontSize: "0.65rem", maxWidth: 200, height: 22, mb: 1 }}
            />
          )}

          {a.punchIn?.address && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <LocationOn sx={{ fontSize: 13, color: "text.disabled" }} />
              <Typography
                variant="caption"
                color="text.secondary"
                noWrap
                sx={{ maxWidth: 220 }}
              >
                {a.punchIn.address.split(",")[0]}
              </Typography>
            </Stack>
          )}

          <Collapse in={exp}>
            <Stack
              direction="row"
              spacing={1}
              sx={{
                mt: 2,
                pt: 2,
                borderTop: `1px dashed ${alpha(cfg.color, 0.15)}`,
              }}
            >
              <Button
                fullWidth
                size="small"
                variant="contained"
                startIcon={<Visibility />}
                onClick={() => onView(a)}
                sx={{
                  borderRadius: 2,
                  bgcolor: PRIMARY,
                  "&:hover": { bgcolor: SECONDARY },
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
                  onClick={() => onEdit(a)}
                  sx={{ borderRadius: 2, borderColor: WARNING, color: WARNING }}
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
                  onClick={() => onDelete(a)}
                  sx={{ borderRadius: 2 }}
                >
                  Del
                </Button>
              )}
            </Stack>
          </Collapse>
        </Box>
      </Paper>
    </Fade>
  );
};

// ─── Loading Skeleton ───────────────────────────────────────────────────────
const LoadingSkeleton = () => (
  <Box sx={{ p: { xs: 2, sm: 3 } }}>
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {[1, 2, 3, 4].map((i) => (
        <Grid item xs={6} sm={3} key={i}>
          <Skeleton
            variant="rectangular"
            height={100}
            sx={{ borderRadius: 3 }}
          />
        </Grid>
      ))}
    </Grid>
    <Skeleton variant="rectangular" height={420} sx={{ borderRadius: 3 }} />
  </Box>
);

// ─── Empty State ────────────────────────────────────────────────────────────
const EmptyState = ({ onClear, hasFilters, message }) => (
  <Box sx={{ textAlign: "center", py: 7, px: 2 }}>
    <Box
      sx={{
        width: 80,
        height: 80,
        borderRadius: "50%",
        bgcolor: alpha(PRIMARY, 0.08),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mx: "auto",
        mb: 2,
      }}
    >
      <Group sx={{ fontSize: 36, color: PRIMARY }} />
    </Box>
    <Typography variant="h6" fontWeight={600} gutterBottom>
      {message || "No records found"}
    </Typography>
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ mb: hasFilters ? 2 : 0 }}
    >
      {hasFilters ? "Try adjusting your filters." : "Records will appear here."}
    </Typography>
    {hasFilters && (
      <Button
        variant="contained"
        startIcon={<Clear />}
        onClick={onClear}
        sx={{ bgcolor: PRIMARY, borderRadius: 2 }}
      >
        Clear Filters
      </Button>
    )}
  </Box>
);

// ─── Main Component ─────────────────────────────────────────────────────────
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

  // ── State ──────────────────────────────────────────────────────────────
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [period, setPeriod] = useState("Today");
  const [selectedMember, setSelectedMember] = useState(null);
  const [selAtt, setSelAtt] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editAtt, setEditAtt] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteAtt, setDeleteAtt] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [navValue, setNavValue] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const containerRef = useRef(null);

  const userRole = getUserRole();
  const canEdit = ["Head_office", "ASM", "ZSM"].includes(userRole);
  const canDelete = userRole === "Head_office";

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (searchTerm) n++;
    if (statusFilter) n++;
    if (period !== "Today") n++;
    return n;
  }, [searchTerm, statusFilter, period]);

  const showSnack = useCallback(
    (msg, sev = "success") =>
      setSnackbar({ open: true, message: msg, severity: sev }),
    [],
  );

  // ── Load team members ──────────────────────────────────────────────────
  const loadTeamMembers = useCallback(async () => {
    setLoadingMembers(true);
    try {
      const members = await getTeamMembers();
      setTeamMembers(members || []);
    } catch (e) {
      showSnack("Failed to load team members", "error");
    } finally {
      setLoadingMembers(false);
    }
  }, [getTeamMembers, showSnack]);

  // ── Load member attendance ─────────────────────────────────────────────
  const loadMemberAtt = useCallback(
    async (userId) => {
      if (!userId) return;
      await fetchAttendances({
        page: page + 1,
        limit: rowsPerPage,
        userId,
        ...(statusFilter && { status: statusFilter }),
        ...(period !== "All" && {
          period: period.toLowerCase().replace(" ", "_"),
        }),
      });
    },
    [fetchAttendances, page, rowsPerPage, statusFilter, period],
  );

  useEffect(() => {
    loadTeamMembers();
  }, [loadTeamMembers]);

  useEffect(() => {
    if (selectedMember?._id) loadMemberAtt(selectedMember._id);
  }, [selectedMember, page, rowsPerPage, statusFilter, period, loadMemberAtt]);

  useEffect(() => {
    if (error) showSnack(error, "error");
    if (success) showSnack(success, "success");
  }, [error, success, showSnack]);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleMemberSelect = useCallback(
    (member) => {
      if (!member?._id) {
        showSnack("Invalid member", "error");
        return;
      }
      setSelectedMember(member);
      setPage(0);
      setSearchTerm("");
      setStatusFilter("");
    },
    [showSnack],
  );

  const handleBack = useCallback(() => {
    setSelectedMember(null);
    setPage(0);
    setSearchTerm("");
    setStatusFilter("");
    setPeriod("Today");
  }, []);

  const handleEditOpen = useCallback(
    (a) => {
      const id = a?._id || a?.id;
      if (!id) {
        showSnack("Invalid record", "error");
        return;
      }
      setEditAtt(a);
      setEditOpen(true);
    },
    [showSnack],
  );

  const handleEditSave = useCallback(
    async (id, data) => {
      if (!id) {
        showSnack("Missing ID", "error");
        return;
      }
      setEditLoading(true);
      try {
        const res = await updateAttendance(id, data);
        if (res?.success) {
          showSnack("Attendance updated");
          setEditOpen(false);
          setEditAtt(null);
          if (selectedMember?._id) await loadMemberAtt(selectedMember._id);
        } else {
          showSnack(res?.error || "Update failed", "error");
        }
      } catch (e) {
        showSnack("Update failed", "error");
      } finally {
        setEditLoading(false);
      }
    },
    [updateAttendance, selectedMember, loadMemberAtt, showSnack],
  );

  const handleDeleteOpen = useCallback(
    (a) => {
      if (!a?._id && !a?.id) {
        showSnack("Invalid record", "error");
        return;
      }
      setDeleteAtt(a);
      setDeleteOpen(true);
    },
    [showSnack],
  );

  const handleDeleteConfirm = useCallback(async () => {
    const id = deleteAtt?._id || deleteAtt?.id;
    if (!id) {
      showSnack("Invalid record", "error");
      setDeleteOpen(false);
      return;
    }
    const res = await deleteAttendance(id);
    if (res?.success) {
      showSnack("Attendance deleted");
      if (selectedMember?._id) await loadMemberAtt(selectedMember._id);
    } else {
      showSnack(res?.error || "Delete failed", "error");
    }
    setDeleteOpen(false);
    setDeleteAtt(null);
  }, [deleteAtt, deleteAttendance, selectedMember, loadMemberAtt, showSnack]);

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter("");
    setPeriod("Today");
    setPage(0);
  }, []);

  const filteredMembers = useMemo(() => {
    if (!searchTerm) return teamMembers;
    const s = searchTerm.toLowerCase();
    return teamMembers.filter(
      (m) =>
        m.firstName?.toLowerCase().includes(s) ||
        m.lastName?.toLowerCase().includes(s) ||
        m.email?.toLowerCase().includes(s) ||
        m.employeeId?.toLowerCase().includes(s),
    );
  }, [teamMembers, searchTerm]);

  const fmt = (ts) =>
    !ts
      ? "—"
      : new Date(ts).toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

  if (loadingMembers && !teamMembers.length && !selectedMember)
    return <LoadingSkeleton />;

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <Box
      ref={containerRef}
      sx={{
        p: { xs: 1.5, sm: 2, md: 3 },
        minHeight: "100vh",
        pb: { xs: 9, sm: 3 },
        bgcolor: "#f4f6fb",
      }}
    >
      {/* Edit Dialog */}
      <EditAttendanceDialog
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setEditAtt(null);
        }}
        attendance={editAtt}
        onSave={handleEditSave}
        loading={editLoading}
      />


      {/* ─── Team members list ───────────────────────────────────────────── */}
      {!selectedMember ? (
        <>
          {/* Search */}
          {isMobile ? (
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search team members…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                  sx: { borderRadius: 3, bgcolor: "#fff" },
                }}
              />
            </Box>
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                mb: 3,
                borderRadius: 3,
                border: `1px solid ${alpha(PRIMARY, 0.08)}`,
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  size="small"
                  placeholder="Search team members…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ minWidth: 300 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: "text.secondary" }} />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2 },
                  }}
                />
                {searchTerm && (
                  <Button
                    variant="text"
                    startIcon={<Clear />}
                    onClick={() => setSearchTerm("")}
                    sx={{ color: DANGER }}
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
            <Grid container spacing={isMobile ? 1.5 : 2.5}>
              {filteredMembers.map((member, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={member._id}>
                  {isMobile ? (
                    <MobileTeamCard
                      member={member}
                      onViewAttendance={handleMemberSelect}
                      index={index}
                    />
                  ) : (
                    <MemberCard>
                      <CardContent sx={{ p: 2.5 }}>
                        <Stack spacing={2}>
                          <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                          >
                            <Avatar
                              sx={{
                                bgcolor: PRIMARY,
                                width: 48,
                                height: 48,
                                fontWeight: 700,
                              }}
                            >
                              {member.firstName?.charAt(0)}
                            </Avatar>
                            <Box flex={1} minWidth={0}>
                              <Typography
                                variant="subtitle1"
                                fontWeight={700}
                                noWrap
                              >
                                {member.firstName} {member.lastName}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                noWrap
                              >
                                {member.phoneNumber || "No ID"}
                              </Typography>
                            </Box>
                          </Stack>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            noWrap
                          >
                            {member.email}
                          </Typography>
                          <Chip
                            label={member.role || "TEAM"}
                            size="small"
                            sx={{
                              bgcolor: alpha(PRIMARY, 0.1),
                              color: PRIMARY,
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
                              borderColor: PRIMARY,
                              color: PRIMARY,
                              "&:hover": { bgcolor: alpha(PRIMARY, 0.06) },
                            }}
                          >
                            View Attendance
                          </Button>
                        </Stack>
                      </CardContent>
                    </MemberCard>
                  )}
                </Grid>
              ))}
            </Grid>
          ) : (
            <EmptyState
              onClear={() => setSearchTerm("")}
              hasFilters={!!searchTerm}
              message="No team members found"
            />
          )}
        </>
      ) : (
        /* ─── Member attendance ─────────────────────────────────────────── */
        <>
          {/* Desktop filters */}
          {!isMobile && (
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                mb: 3,
                borderRadius: 3,
                border: `1px solid ${alpha(PRIMARY, 0.08)}`,
              }}
            >
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                flexWrap="wrap"
              >
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    sx={{ borderRadius: 2 }}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(0);
                    }}
                  >
                    <MenuItem value="">All</MenuItem>
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                      <MenuItem key={k} value={k}>
                        {v.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Period</InputLabel>
                  <Select
                    value={period}
                    label="Period"
                    sx={{ borderRadius: 2 }}
                    onChange={(e) => setPeriod(e.target.value)}
                  >
                    {PERIOD_OPTIONS.map((o) => (
                      <MenuItem key={o.value} value={o.value}>
                        {o.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {activeFilterCount > 0 && (
                  <Button
                    variant="text"
                    startIcon={<Clear />}
                    onClick={handleClearFilters}
                    sx={{ color: DANGER }}
                  >
                    Clear All
                  </Button>
                )}
                {activeFilterCount > 0 && (
                  <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    sx={{ ml: 1 }}
                  >
                    {statusFilter && (
                      <Chip
                        size="small"
                        label={`Status: ${statusFilter}`}
                        onDelete={() => setStatusFilter("")}
                        sx={{ bgcolor: alpha(PRIMARY, 0.1), color: PRIMARY }}
                      />
                    )}
                    {period !== "Today" && (
                      <Chip
                        size="small"
                        label={`Period: ${period}`}
                        onDelete={() => setPeriod("Today")}
                        sx={{ bgcolor: alpha(PRIMARY, 0.1), color: PRIMARY }}
                      />
                    )}
                  </Stack>
                )}
              </Stack>
            </Paper>
          )}

          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              border: `1px solid ${alpha(PRIMARY, 0.08)}`,
            }}
          >
            {!isMobile ? (
              <TableContainer>
                {loading && (
                  <Box sx={{ position: "relative" }}>
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        bgcolor: alpha(PRIMARY, 0.1),
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          width: "40%",
                          height: "100%",
                          bgcolor: PRIMARY,
                          animation: "slide 1.2s infinite",
                          "@keyframes slide": {
                            "0%": { left: "-40%" },
                            "100%": { left: "100%" },
                          },
                          position: "absolute",
                        }}
                      />
                    </Box>
                  </Box>
                )}
                <Table>
                  <TableHead sx={{ bgcolor: alpha(PRIMARY, 0.04) }}>
                    <TableRow>
                      {[
                        "Date",
                        "Punch In",
                        "Punch Out",
                        "Hours",
                        "Status",
                        "Remarks",
                        "Actions",
                      ].map((h) => (
                        <TableCell
                          key={h}
                          sx={{ fontWeight: 700, py: 1.5, fontSize: "0.78rem" }}
                        >
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                          <CircularProgress sx={{ color: PRIMARY }} />
                        </TableCell>
                      </TableRow>
                    ) : attendances?.length > 0 ? (
                      attendances.map((a) => {
                        const ft = (ts) =>
                          ts
                            ? new Date(ts).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })
                            : "—";
                        return (
                          <TableRow
                            key={a._id || a.id}
                            hover
                            sx={{
                              "&:hover": { bgcolor: alpha(PRIMARY, 0.02) },
                            }}
                          >
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {fmt(a.date)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {a.punchIn ? (
                                <Chip
                                  label={ft(a.punchIn.time)}
                                  size="small"
                                  sx={{
                                    bgcolor: alpha(SUCCESS, 0.1),
                                    color: SUCCESS,
                                    fontWeight: 600,
                                  }}
                                />
                              ) : (
                                "—"
                              )}
                            </TableCell>
                            <TableCell>
                              {a.punchOut ? (
                                <Chip
                                  label={ft(a.punchOut.time)}
                                  size="small"
                                  sx={{
                                    bgcolor: alpha(WARNING, 0.1),
                                    color: WARNING,
                                    fontWeight: 600,
                                  }}
                                />
                              ) : a.punchIn ? (
                                <Chip
                                  label="Ongoing"
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    color: PRIMARY,
                                    borderColor: PRIMARY,
                                    fontWeight: 600,
                                  }}
                                />
                              ) : (
                                "—"
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                fontWeight={700}
                                color={PRIMARY}
                              >
                                {a.workHoursFormatted || "—"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <StatusChip status={a.status || "present"} />
                            </TableCell>
                            <TableCell>
                              {a.remarks ? (
                                <Tooltip title={a.remarks}>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    noWrap
                                    sx={{ maxWidth: 140 }}
                                  >
                                    {a.remarks}
                                  </Typography>
                                </Tooltip>
                              ) : (
                                <Typography
                                  variant="body2"
                                  color="text.disabled"
                                >
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
                                <Tooltip title="View">
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setSelAtt(a);
                                      setDetailsOpen(true);
                                    }}
                                    sx={{
                                      color: PRIMARY,
                                      "&:hover": {
                                        bgcolor: alpha(PRIMARY, 0.08),
                                      },
                                    }}
                                  >
                                    <Visibility fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                {canEdit && (
                                  <Tooltip title="Edit">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleEditOpen(a)}
                                      sx={{
                                        color: WARNING,
                                        "&:hover": {
                                          bgcolor: alpha(WARNING, 0.08),
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
                                      onClick={() => handleDeleteOpen(a)}
                                      sx={{
                                        color: DANGER,
                                        "&:hover": {
                                          bgcolor: alpha(DANGER, 0.08),
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
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7}>
                          <EmptyState
                            onClear={handleClearFilters}
                            hasFilters={activeFilterCount > 0}
                            message="No attendance records found"
                          />
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
                ) : attendances?.length > 0 ? (
                  attendances.map((a, i) => (
                    <MobileAttCard
                      key={a._id || a.id}
                      attendance={a}
                      onView={(e) => {
                        setSelAtt(e);
                        setDetailsOpen(true);
                      }}
                      onEdit={handleEditOpen}
                      onDelete={handleDeleteOpen}
                      canEdit={canEdit}
                      canDelete={canDelete}
                      index={i}
                    />
                  ))
                ) : (
                  <EmptyState
                    onClear={handleClearFilters}
                    hasFilters={activeFilterCount > 0}
                    message="No attendance records found"
                  />
                )}
              </Box>
            )}

            {/* Pagination */}
            {attendances?.length > 0 && pagination?.totalPages > 1 && (
              <Box
                sx={{
                  p: 2,
                  borderTop: `1px solid ${alpha(PRIMARY, 0.08)}`,
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {page * rowsPerPage + 1}–
                  {Math.min((page + 1) * rowsPerPage, pagination.totalItems)} of{" "}
                  {pagination.totalItems}
                </Typography>
                <Pagination
                  count={pagination.totalPages}
                  page={page + 1}
                  onChange={(_, v) => {
                    setPage(v - 1);
                    containerRef.current?.scrollIntoView({
                      behavior: "smooth",
                    });
                  }}
                  color="primary"
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    "& .MuiPaginationItem-root.Mui-selected": {
                      bgcolor: PRIMARY,
                      color: "#fff",
                    },
                  }}
                />
              </Box>
            )}
          </Paper>
        </>
      )}

      {/* ─── Mobile filter drawer ──────────────────────────────────────── */}
      <SwipeableDrawer
        anchor="bottom"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpen={() => {}}
        PaperProps={{
          sx: { borderTopLeftRadius: 24, borderTopRightRadius: 24 },
        }}
      >
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
        <Box sx={{ px: 3, pb: 3 }}>
          <Typography
            variant="h6"
            fontWeight={700}
            color={PRIMARY}
            sx={{ mb: 2.5 }}
          >
            Filter Attendance
          </Typography>
          <Stack spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                sx={{ borderRadius: 2 }}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="">All</MenuItem>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <MenuItem key={k} value={k}>
                    {v.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Period</InputLabel>
              <Select
                value={period}
                label="Period"
                sx={{ borderRadius: 2 }}
                onChange={(e) => setPeriod(e.target.value)}
              >
                {PERIOD_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Stack direction="row" spacing={1.5}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Clear />}
                onClick={() => {
                  handleClearFilters();
                  setDrawerOpen(false);
                }}
                sx={{
                  borderRadius: 2,
                  borderColor: alpha(PRIMARY, 0.3),
                  color: PRIMARY,
                }}
              >
                Clear
              </Button>
              <Button
                fullWidth
                variant="contained"
                onClick={() => setDrawerOpen(false)}
                sx={{ borderRadius: 2, bgcolor: PRIMARY }}
              >
                Apply
              </Button>
            </Stack>
          </Stack>
        </Box>
      </SwipeableDrawer>

      {/* ─── Mobile FAB ───────────────────────────────────────────────── */}
      {isMobile && selectedMember && (
        <Zoom in>
          <Fab
            size="medium"
            onClick={() => setDrawerOpen(true)}
            sx={{
              position: "fixed",
              bottom: 80,
              right: 16,
              zIndex: 1000,
              bgcolor: PRIMARY,
              color: "#fff",
              boxShadow: `0 4px 14px ${alpha(PRIMARY, 0.35)}`,
            }}
          >
            <Badge badgeContent={activeFilterCount} color="error">
              <FilterAlt />
            </Badge>
          </Fab>
        </Zoom>
      )}

      {/* ─── Bottom nav ───────────────────────────────────────────────── */}
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
            value={navValue}
            onChange={(_, v) => {
              setNavValue(v);
              if (v === 0)
                selectedMember
                  ? handleBack()
                  : window.scrollTo({ top: 0, behavior: "smooth" });
              else if (v === 1) navigate("/dashboard");
            }}
            sx={{ height: 60, "& .Mui-selected": { color: PRIMARY } }}
          >
            <BottomNavigationAction
              label={selectedMember ? "Back" : "Team"}
              icon={selectedMember ? <ArrowBack /> : <Group />}
            />
            <BottomNavigationAction label="Dashboard" icon={<Dashboard />} />
          </BottomNavigation>
        </Paper>
      )}

      {/* ─── Details modal ────────────────────────────────────────────── */}
      <AttendanceDetails
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        attendance={selAtt}
        canEdit={canEdit}
        canDelete={canDelete}
        onEdit={handleEditOpen}
        onDelete={handleDeleteOpen}
      />

      {/* ─── Delete confirm ───────────────────────────────────────────── */}
      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, overflow: "hidden" } }}
      >
        <Box sx={{ height: 5, bgcolor: DANGER }} />
        <DialogTitle sx={{ pt: 2.5, pb: 1 }}>
          <Typography variant="h6" fontWeight={700}>
            Confirm Delete
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            This action cannot be undone.
          </Alert>
          {deleteAtt && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(DANGER, 0.04),
                border: `1px solid ${alpha(DANGER, 0.12)}`,
              }}
            >
              <Typography variant="body2">
                <strong>Date:</strong> {fmt(deleteAtt.date)}
                <br />
                <strong>Status:</strong> {deleteAtt.status}
              </Typography>
            </Paper>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            pb: 3,
            gap: 1.5,
            borderTop: `1px solid ${alpha(DANGER, 0.08)}`,
          }}
        >
          <Button
            variant="outlined"
            onClick={() => setDeleteOpen(false)}
            sx={{
              borderRadius: 2,
              borderColor: alpha(PRIMARY, 0.3),
              color: PRIMARY,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            sx={{ borderRadius: 2 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Snackbar ─────────────────────────────────────────────────── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => {
          setSnackbar((s) => ({ ...s, open: false }));
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
          sx={{ borderRadius: 2, color: "#fff", fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
