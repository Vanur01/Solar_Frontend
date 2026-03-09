// pages/AttendanceDetails.jsx
import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  Stack,
  Grid,
  Paper,
  Chip,
  Avatar,
  Divider,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery,
  Slide,
  Fade,
  CircularProgress,
  alpha,
} from "@mui/material";
import {
  Close,
  AccessTime,
  LocationOn,
  Edit,
  Delete,
  Save,
  Cancel,
  Person,
  CalendarToday,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Login,
  Logout,
  Visibility,
} from "@mui/icons-material";
import { useAttendance } from "../hooks/useAttendance";
import { format } from "date-fns";

// ─── Constants ────────────────────────────────────────────────────────────────
const PRIMARY = "#4569ea";
const SECONDARY = "#1a237e";
const SUCCESS = "#22c55e";
const DANGER = "#ef4444";
const WARNING = "#f59e0b";

const STATUS_CONFIG = {
  present: {
    bg: alpha(SUCCESS, 0.1),
    color: SUCCESS,
    icon: <CheckCircle sx={{ fontSize: 15 }} />,
    label: "Present",
  },
  absent: {
    bg: alpha(DANGER, 0.1),
    color: DANGER,
    icon: <ErrorIcon sx={{ fontSize: 15 }} />,
    label: "Absent",
  },
  late: {
    bg: alpha(WARNING, 0.1),
    color: WARNING,
    icon: <Warning sx={{ fontSize: 15 }} />,
    label: "Late",
  },
  leave: {
    bg: alpha("#a855f7", 0.1),
    color: "#a855f7",
    icon: <Person sx={{ fontSize: 15 }} />,
    label: "Leave",
  },
  holiday: {
    bg: alpha("#3b82f6", 0.1),
    color: "#3b82f6",
    icon: <CalendarToday sx={{ fontSize: 15 }} />,
    label: "Holiday",
  },
};

// ─── StatusChip ───────────────────────────────────────────────────────────────
const StatusChip = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.present;
  return (
    <Chip
      size="small"
      label={cfg.label}
      icon={cfg.icon}
      sx={{
        background: "#fff",
        color: "#1fa710",
        fontWeight: 700,
        borderRadius: 1,
        "& .MuiChip-icon": { color: cfg.color },
      }}
    />
  );
};

// ─── InfoRow ──────────────────────────────────────────────────────────────────
const InfoRow = ({ label, value, color }) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      py: 1,
      borderBottom: `1px solid ${alpha(PRIMARY, 0.06)}`,
      "&:last-child": { border: "none", pb: 0 },
    }}
  >
    <Typography
      variant="caption"
      color="text.secondary"
      fontWeight={600}
      sx={{
        textTransform: "uppercase",
        letterSpacing: 0.5,
        fontSize: "0.68rem",
      }}
    >
      {label}
    </Typography>
    <Typography
      variant="body2"
      fontWeight={600}
      color={color || "text.primary"}
    >
      {value}
    </Typography>
  </Box>
);

// ─── PunchBlock ───────────────────────────────────────────────────────────────
const PunchBlock = ({ type, data }) => {
  const isPunchIn = type === "in";
  const color = isPunchIn ? SUCCESS : WARNING;
  const absent = !data;

  const formatTime = (ts) =>
    ts
      ? new Date(ts).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      : "—";

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        border: `1px solid ${alpha(color, absent ? 0.1 : 0.2)}`,
        bgcolor: alpha(color, absent ? 0.02 : 0.05),
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            bgcolor: alpha(color, 0.12),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isPunchIn ? (
            <Login sx={{ fontSize: 18, color }} />
          ) : (
            <Logout sx={{ fontSize: 18, color }} />
          )}
        </Box>
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={700}
            sx={{
              textTransform: "uppercase",
              letterSpacing: 0.5,
              fontSize: "0.68rem",
            }}
          >
            Punch {isPunchIn ? "In" : "Out"}
          </Typography>
          <Typography
            variant="h6"
            fontWeight={800}
            color={absent ? "text.disabled" : color}
            lineHeight={1.1}
          >
            {absent
              ? isPunchIn
                ? "Not recorded"
                : "Not punched out"
              : formatTime(data?.time)}
          </Typography>
        </Box>
      </Stack>

      {data?.address && (
        <Stack
          direction="row"
          spacing={0.75}
          alignItems="flex-start"
          sx={{ mb: 1 }}
        >
          <LocationOn
            sx={{
              fontSize: 14,
              color: "text.secondary",
              mt: 0.2,
              flexShrink: 0,
            }}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ lineHeight: 1.4 }}
          >
            {data.address}
          </Typography>
        </Stack>
      )}

      {data?.location && (
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ fontSize: "0.65rem" }}
        >
          {data.location.lat?.toFixed(5)}, {data.location.lng?.toFixed(5)}
        </Typography>
      )}

      {data?.remarks && (
        <Box
          sx={{ mt: 1, pt: 1, borderTop: `1px dashed ${alpha(color, 0.2)}` }}
        >
          <Typography variant="caption" color="text.secondary">
            <strong>Note:</strong> {data.remarks}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AttendanceDetails({
  open,
  onClose,
  attendance,
  canEdit = false,
  canDelete = false,
  onEdit,
  onDelete,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { updateAttendance } = useAttendance();

  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ status: "", remarks: "" });
  const [editLoad, setEditLoad] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [selPhoto, setSelPhoto] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnack = useCallback(
    (message, severity = "success") =>
      setSnackbar({ open: true, message, severity }),
    [],
  );

  if (!attendance) return null;

  const a = attendance;
  const statusCfg = STATUS_CONFIG[a.status] || STATUS_CONFIG.present;

  const formatDate = (ts) =>
    !ts
      ? "—"
      : new Date(ts).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });

  const photos = [...(a.punchIn?.photos || []), ...(a.punchOut?.photos || [])];

  const handleEditStart = () => {
    setEditData({ status: a.status || "present", remarks: a.remarks || "" });
    setEditMode(true);
  };

  const handleEditSave = async () => {
    setEditLoad(true);
    try {
      const id = a._id || a.id;
      if (!id) {
        showSnack("Invalid record ID", "error");
        return;
      }
      const res = await updateAttendance(id, editData);
      if (res?.success) {
        showSnack("Attendance updated successfully");
        setEditMode(false);
        if (onEdit) onEdit(res.data);
      } else {
        showSnack(res?.error || "Update failed", "error");
      }
    } catch (e) {
      showSnack("An error occurred", "error");
    } finally {
      setEditLoad(false);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(a);
      onClose();
    }
  };

  const handleClose = () => {
    setEditMode(false);
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 4,
            overflow: "hidden",
            maxHeight: isMobile ? "100%" : "92vh",
          },
        }}
        TransitionComponent={isMobile ? Slide : Fade}
        TransitionProps={isMobile ? { direction: "up" } : {}}
        transitionDuration={280}
      >
        {/* Colored top bar */}
        <Box
          sx={{
            height: 5,
            background: `linear-gradient(90deg, ${statusCfg.color}, ${PRIMARY})`,
          }}
        />

        {/* Title */}
        <DialogTitle
          sx={{
            bgcolor: PRIMARY,
            color: "#fff",
            px: { xs: 2, sm: 3 },
            py: { xs: 1.5, sm: 2 },
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar
                sx={{
                  bgcolor: "rgba(255,255,255,.15)",
                  color: "#fff",
                  width: { xs: 38, sm: 44 },
                  height: { xs: 38, sm: 44 },
                  fontWeight: 700,
                }}
              >
                {a.user?.name?.charAt(0) || "A"}
              </Avatar>
              <Box>
                <Typography
                  variant="h6"
                  fontWeight={800}
                  sx={{ fontSize: { xs: "1rem", sm: "1.15rem" } }}
                >
                  {a.user?.name || "Attendance Details"}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.85 }}>
                  {formatDate(a.date)}
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <StatusChip status={a.status || "present"} />
              <IconButton
                onClick={handleClose}
                size="small"
                sx={{ color: "#fff", ml: 0.5 }}
              >
                <Close />
              </IconButton>
            </Stack>
          </Stack>
        </DialogTitle>

        {/* Content */}
        <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 2.5 } }}>
          <Stack spacing={2.5}>
            {console.log("usera11222....", a)}
            {/* Summary row */}
            <Grid container spacing={1.5}>
              {[
                {
                  label: "Work Hours",
                  value: a.workHoursFormatted || "—",
                  color: PRIMARY,
                },
                { label: "Phone", value: a.user?.phone || "—" },
                { label: "Email", value: a.user?.email || "—" },
              ].map((item) => (
                <Grid item xs={12} sm={4} key={item.label}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: 2.5,
                      bgcolor: alpha(PRIMARY, 0.04),
                      border: `1px solid ${alpha(PRIMARY, 0.1)}`,
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={600}
                      sx={{
                        textTransform: "uppercase",
                        fontSize: "0.65rem",
                        letterSpacing: 0.5,
                      }}
                    >
                      {item.label}
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      color={item.color || "text.primary"}
                      noWrap
                      sx={{ mt: 0.25 }}
                    >
                      {item.value}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            {/* Edit mode */}
            {editMode && (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: `1px solid ${alpha(WARNING, 0.25)}`,
                  bgcolor: alpha(WARNING, 0.04),
                }}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  color={WARNING}
                  sx={{ mb: 2 }}
                >
                  Edit Attendance
                </Typography>
                <Stack spacing={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={editData.status}
                      onChange={(e) =>
                        setEditData((p) => ({ ...p, status: e.target.value }))
                      }
                      label="Status"
                      sx={{ borderRadius: 2 }}
                    >
                      {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                        <MenuItem key={k} value={k}>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Box sx={{ color: v.color }}>{v.icon}</Box>
                            <span>{v.label}</span>
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    size="small"
                    label="Remarks"
                    multiline
                    rows={2}
                    fullWidth
                    value={editData.remarks}
                    onChange={(e) =>
                      setEditData((p) => ({ ...p, remarks: e.target.value }))
                    }
                    inputProps={{ maxLength: 250 }}
                    helperText={`${editData.remarks.length}/250`}
                    FormHelperTextProps={{ sx: { textAlign: "right" } }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                </Stack>
              </Paper>
            )}

            {/* Punch blocks */}
            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={6}>
                <PunchBlock type="in" data={a.punchIn} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <PunchBlock type="out" data={a.punchOut} />
              </Grid>
            </Grid>

            {/* Remarks */}
            {a.remarks && !editMode && (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  bgcolor: alpha(PRIMARY, 0.04),
                  border: `1px solid ${alpha(PRIMARY, 0.1)}`,
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                  sx={{
                    textTransform: "uppercase",
                    fontSize: "0.65rem",
                    letterSpacing: 0.5,
                    display: "block",
                    mb: 0.5,
                  }}
                >
                  Remarks
                </Typography>
                <Typography variant="body2">{a.remarks}</Typography>
              </Paper>
            )}

            {/* Record metadata */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2.5,
                bgcolor: alpha(PRIMARY, 0.025),
                border: `1px solid ${alpha(PRIMARY, 0.08)}`,
              }}
            >
              <InfoRow
                label="Record ID"
                value={(a._id || a.id || "—").slice(-10)}
              />
              <InfoRow
                label="Created"
                value={
                  a.createdAt
                    ? format(new Date(a.createdAt), "dd MMM yyyy, hh:mm a")
                    : "—"
                }
              />
              <InfoRow
                label="Last Updated"
                value={
                  a.updatedAt
                    ? format(new Date(a.updatedAt), "dd MMM yyyy, hh:mm a")
                    : "—"
                }
              />
            </Paper>

            {/* Photos */}
            {photos.length > 0 && (
              <Box>
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  sx={{ mb: 1.5 }}
                >
                  Photos ({photos.length})
                </Typography>
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ overflowX: "auto", pb: 0.5 }}
                >
                  {photos.map((p, i) => (
                    <Box
                      key={i}
                      onClick={() => {
                        setSelPhoto(p);
                        setPhotoOpen(true);
                      }}
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: 2,
                        overflow: "hidden",
                        border: `2px solid ${alpha(PRIMARY, 0.2)}`,
                        flexShrink: 0,
                        cursor: "pointer",
                        transition: "transform .2s",
                        "&:hover": {
                          transform: "scale(1.06)",
                          borderColor: PRIMARY,
                        },
                      }}
                    >
                      <img
                        src={p.url}
                        alt={`photo-${i}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </DialogContent>

        {/* Actions */}
        {(canEdit || canDelete) && (
          <DialogActions
            sx={{
              px: { xs: 2, sm: 3 },
              py: { xs: 2, sm: 2 },
              borderTop: `1px solid ${alpha(PRIMARY, 0.08)}`,
              flexDirection: { xs: "column", sm: "row" },
              gap: 1,
            }}
          >
            {editMode ? (
              <>
                <Button
                  fullWidth={isMobile}
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={() => setEditMode(false)}
                  disabled={editLoad}
                  sx={{
                    borderRadius: 2,
                    borderColor: alpha(PRIMARY, 0.3),
                    color: PRIMARY,
                    order: isMobile ? 2 : 1,
                  }}
                >
                  Cancel
                </Button>
                <Button
                  fullWidth={isMobile}
                  variant="contained"
                  startIcon={
                    editLoad ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <Save />
                    )
                  }
                  onClick={handleEditSave}
                  disabled={editLoad}
                  sx={{
                    borderRadius: 2,
                    bgcolor: PRIMARY,
                    order: isMobile ? 1 : 2,
                    "&:hover": { bgcolor: SECONDARY },
                  }}
                >
                  {editLoad ? "Saving…" : "Save Changes"}
                </Button>
              </>
            ) : (
              <>
                <Button
                  fullWidth={isMobile}
                  onClick={handleClose}
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    borderColor: alpha(PRIMARY, 0.3),
                    color: PRIMARY,
                    order: isMobile ? 3 : 1,
                  }}
                >
                  Close
                </Button>
                {canEdit && (
                  <Button
                    fullWidth={isMobile}
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={handleEditStart}
                    sx={{
                      borderRadius: 2,
                      borderColor: WARNING,
                      color: WARNING,
                      order: isMobile ? 2 : 2,
                      "&:hover": { bgcolor: alpha(WARNING, 0.06) },
                    }}
                  >
                    Edit
                  </Button>
                )}
                {canDelete && (
                  <Button
                    fullWidth={isMobile}
                    variant="contained"
                    color="error"
                    startIcon={<Delete />}
                    onClick={handleDelete}
                    sx={{ borderRadius: 2, order: isMobile ? 1 : 3 }}
                  >
                    Delete
                  </Button>
                )}
              </>
            )}
          </DialogActions>
        )}
      </Dialog>

      {/* Photo viewer */}
      <Dialog
        open={photoOpen}
        onClose={() => setPhotoOpen(false)}
        maxWidth="lg"
        fullScreen={isMobile}
        PaperProps={{ sx: { borderRadius: isMobile ? 0 : 3, bgcolor: "#000" } }}
      >
        <IconButton
          onClick={() => setPhotoOpen(false)}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            bgcolor: "rgba(0,0,0,.5)",
            color: "#fff",
            zIndex: 10,
          }}
        >
          <Close />
        </IconButton>
        {selPhoto?.url && (
          <img
            src={selPhoto.url}
            alt="attendance"
            style={{ width: "100%", maxHeight: "92vh", objectFit: "contain" }}
          />
        )}
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
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
    </>
  );
}
