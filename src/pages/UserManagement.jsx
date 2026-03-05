// pages/UserManagement.jsx (Updated with Mobile View)
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  TablePagination,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Snackbar,
  useMediaQuery,
  useTheme,
  Grid,
  Card,
  CardContent,
  Stack,
  Radio,
  RadioGroup,
  FormControlLabel,
  Badge,
  SwipeableDrawer,
  Collapse,
  Fab,
  Zoom,
  Fade,
  Slide,
  BottomNavigation,
  BottomNavigationAction,
  alpha,
  Skeleton,
  Divider,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Person,
  Search,
  Refresh,
  CheckCircle,
  Block,
  MoreVert,
  Clear,
  Phone,
  Email,
  PersonAdd,
  Check,
  Close,
  Group,
  SupervisorAccount,
  AdminPanelSettings,
  People,
  Lock,
  LockOpen,
  Visibility,
  ContentCopy,
  FilterAlt,
  Sort,
  ExpandMore,
  ExpandLess,
  DateRange,
  CalendarToday,
  Dashboard,
  ArrowUpward,
  ArrowDownward,
  ViewList,
  ViewModule,
  FiberManualRecord,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const PRIMARY_COLOR = "#4569ea";
const SECONDARY_COLOR = "#1a237e";

// Period Options
const PERIOD_OPTIONS = [
  { value: "Today", label: "Today", icon: <CalendarToday /> },
  { value: "This Week", label: "This Week", icon: <DateRange /> },
  { value: "This Month", label: "This Month", icon: <DateRange /> },
  { value: "All", label: "All Time", icon: <DateRange /> },
];

const ROLE_CONFIG = {
  Head_office: {
    color: PRIMARY_COLOR,
    bg: alpha(PRIMARY_COLOR, 0.08),
    icon: <AdminPanelSettings fontSize="small" />,
    label: "Head Office",
    level: 1,
  },
  ZSM: {
    color: PRIMARY_COLOR,
    bg: alpha(PRIMARY_COLOR, 0.08),
    icon: <SupervisorAccount fontSize="small" />,
    label: "Zonal Sales Manager",
    level: 2,
  },
  ASM: {
    color: PRIMARY_COLOR,
    bg: alpha(PRIMARY_COLOR, 0.08),
    icon: <SupervisorAccount fontSize="small" />,
    label: "Area Sales Manager",
    level: 3,
  },
  TEAM: {
    color: PRIMARY_COLOR,
    bg: alpha(PRIMARY_COLOR, 0.08),
    icon: <Group fontSize="small" />,
    label: "Team Member",
    level: 4,
  },
};

const STATUS_CONFIG = {
  active: {
    color: "#4caf50",
    bg: alpha("#4caf50", 0.08),
    icon: <CheckCircle fontSize="small" />,
    label: "Active",
  },
  inactive: {
    color: "#f44336",
    bg: alpha("#f44336", 0.08),
    icon: <Block fontSize="small" />,
    label: "Inactive",
  },
};

// ========== MOBILE FILTER DRAWER ==========
const MobileFilterDrawer = ({
  open,
  onClose,
  period,
  setPeriod,
  roleFilter,
  setRoleFilter,
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
  roleOptions,
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
              Filter Users
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
                    placeholder="Search by name, email, phone..."
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

            {/* Role Section */}
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
                onClick={() => toggleSection("role")}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <SupervisorAccount sx={{ color: PRIMARY_COLOR, fontSize: 20 }} />
                  <Typography variant="subtitle2" fontWeight={600}>
                    Role
                  </Typography>
                </Stack>
                {expandedSection === "role" ? <ExpandLess /> : <ExpandMore />}
              </Box>
              <Collapse in={expandedSection === "role"}>
                <Box sx={{ p: 2 }}>
                  <FormControl fullWidth size="small">
                    <Select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value="all">All Roles</MenuItem>
                      {roleOptions.filter(opt => opt.value !== "all").map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            {option.icon}
                            <span>{option.label}</span>
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
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
                  <CheckCircle sx={{ color: PRIMARY_COLOR, fontSize: 20 }} />
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
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="active">
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <CheckCircle sx={{ color: "#4caf50" }} />
                          <span>Active</span>
                        </Stack>
                      </MenuItem>
                      <MenuItem value="inactive">
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Block sx={{ color: "#f44336" }} />
                          <span>Inactive</span>
                        </Stack>
                      </MenuItem>
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
                      { key: "firstName", label: "Name" },
                      { key: "role", label: "Role" },
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

            {/* View Mode Section */}
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
                onClick={() => toggleSection("view")}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  {viewMode === "card" ? <ViewModule /> : <ViewList />}
                  <Typography variant="subtitle2" fontWeight={600}>
                    View Mode
                  </Typography>
                </Stack>
                {expandedSection === "view" ? <ExpandLess /> : <ExpandMore />}
              </Box>
              <Collapse in={expandedSection === "view"}>
                <Box sx={{ p: 2 }}>
                  <Stack direction="row" spacing={1}>
                    <Button
                      fullWidth
                      variant={viewMode === "card" ? "contained" : "outlined"}
                      onClick={() => setViewMode("card")}
                      startIcon={<ViewModule />}
                      sx={{
                        bgcolor:
                          viewMode === "card" ? PRIMARY_COLOR : "transparent",
                        color: viewMode === "card" ? "#fff" : PRIMARY_COLOR,
                        borderColor: PRIMARY_COLOR,
                      }}
                    >
                      Card View
                    </Button>
                    <Button
                      fullWidth
                      variant={viewMode === "table" ? "contained" : "outlined"}
                      onClick={() => setViewMode("table")}
                      startIcon={<ViewList />}
                      sx={{
                        bgcolor:
                          viewMode === "table" ? PRIMARY_COLOR : "transparent",
                        color: viewMode === "table" ? "#fff" : PRIMARY_COLOR,
                        borderColor: PRIMARY_COLOR,
                      }}
                    >
                      List View
                    </Button>
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

// Statistics Card Component
const StatCard = ({ title, value, icon, color, subtext, index }) => (
  <Fade in={true} timeout={500 + index * 100}>
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, sm: 2, md: 2.5 },
        borderRadius: 3,
        border: `1px solid ${alpha(color, 0.1)}`,
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
              bgcolor: alpha(color, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: color,
            }}
          >
            {React.cloneElement(icon, {
              sx: { fontSize: { xs: 16, sm: 20, md: 24 } },
            })}
          </Box>
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
        <Box>
          <Typography
            variant="subtitle2"
            fontWeight={600}
            sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
          >
            {title}
          </Typography>
          {subtext && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.6rem", sm: "0.7rem" } }}
            >
              {subtext}
            </Typography>
          )}
        </Box>
      </Stack>
    </Paper>
  </Fade>
);

// Mobile User Card Component
const MobileUserCard = ({
  user,
  onEdit,
  onToggleStatus,
  onAssign,
  onViewPassword,
  onDelete,
  currentUserRole,
  currentUserId,
  statusLoading,
}) => {
  const [expanded, setExpanded] = useState(false);
  const roleConfig = ROLE_CONFIG[user.role] || ROLE_CONFIG.TEAM;
  const statusConfig = STATUS_CONFIG[user.status] || STATUS_CONFIG.active;
  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`;

  const canEdit = useMemo(() => {
    if (!currentUserRole || !user) return false;
    if (user._id === currentUserId) return true;
    if (currentUserRole === "Head_office") return true;

    const userRoleLevel = ROLE_CONFIG[user.role]?.level || 999;
    const currentRoleLevel = ROLE_CONFIG[currentUserRole]?.level || 0;

    if (currentUserRole === "ZSM") {
      return userRoleLevel > currentRoleLevel;
    }
    if (currentUserRole === "ASM") {
      return user.role === "TEAM";
    }
    return false;
  }, [currentUserRole, user, currentUserId]);

  const canToggleStatus = canEdit;
  const canAssign =
    user.role === "TEAM" &&
    ["ZSM", "ASM", "Head_office"].includes(currentUserRole) &&
    !user.supervisor;
  const canViewPassword = currentUserRole === "Head_office";
  const canDelete =
    currentUserRole === "Head_office" && user.role !== "Head_office";

  return (
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
                bgcolor: roleConfig.color,
                color: "#fff",
                width: 48,
                height: 48,
                fontWeight: 600,
              }}
            >
              {initials}
            </Avatar>
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight="700"
                color={PRIMARY_COLOR}
              >
                {user.firstName} {user.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ID: {user._id?.slice(-8) || "N/A"}
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
          <Grid item xs={6}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Email sx={{ fontSize: 14, color: alpha(PRIMARY_COLOR, 0.6) }} />
              <Typography variant="caption" noWrap>
                {user.email || "No email"}
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={6}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Phone sx={{ fontSize: 14, color: alpha(PRIMARY_COLOR, 0.6) }} />
              <Typography variant="caption" noWrap>
                {user.phoneNumber || "No phone"}
              </Typography>
            </Stack>
          </Grid>
        </Grid>

        {/* Role and Status Chips */}
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1.5 }}>
          <Chip
            label={roleConfig.label}
            size="small"
            icon={roleConfig.icon}
            sx={{
              bgcolor: roleConfig.bg,
              color: roleConfig.color,
              fontWeight: 600,
              height: 24,
              fontSize: "0.7rem",
              "& .MuiChip-icon": { fontSize: 14 },
            }}
          />
          <Chip
            label={statusConfig.label}
            size="small"
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

        {/* Manager Info */}
        {user.supervisor && (
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Manager
            </Typography>
            <Typography variant="body2">
              {user.supervisor.firstName} {user.supervisor.lastName}
            </Typography>
          </Box>
        )}

        {/* Expanded Details */}
        <Collapse in={expanded}>
          <Box
            sx={{
              mt: 2,
              pt: 2,
              borderTop: `1px solid ${alpha(PRIMARY_COLOR, 0.1)}`,
            }}
          >
            {/* Additional Info */}
            <Grid container spacing={2}>
              {user.zone && (
                <Grid item xs={12}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Zone
                  </Typography>
                  <Typography variant="body2">
                    {user.zone}
                  </Typography>
                </Grid>
              )}
              <Grid item xs={6}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Created
                </Typography>
                <Typography variant="body2">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Last Updated
                </Typography>
                <Typography variant="body2">
                  {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : "N/A"}
                </Typography>
              </Grid>
            </Grid>

            {/* Action Buttons */}
            <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap" }}>
              {canEdit && (
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<Edit sx={{ ml : 1}} />}
                  onClick={() => onEdit(user)}
                  sx={{
                    flex: 1,
                    bgcolor: PRIMARY_COLOR,
                    "&:hover": { bgcolor: SECONDARY_COLOR },
                    fontSize: "0.7rem",
                  }}
                >
                </Button>
              )}

              {canToggleStatus && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={user.status === "active" ? <Lock sx={{ ml : 1}} /> : <LockOpen sx={{ ml : 1}} />}
                  onClick={() => onToggleStatus(user)}
                  disabled={statusLoading[user._id]}
                  sx={{
                    flex: 1,
                    borderColor: user.status === "active" ? "#f44336" : "#4caf50",
                    color: user.status === "active" ? "#f44336" : "#4caf50",
                    fontSize: "0.7rem",
                  }}
                >
                </Button>
              )}

              {canAssign && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<PersonAdd sx={{ ml : 1}} />}
                  onClick={() => onAssign(user)}
                  sx={{
                    flex: 1,
                    borderColor: "#00bcd4",
                    color: "#00bcd4",
                    fontSize: "0.7rem",
                  }}
                >
                </Button>
              )}

              {canViewPassword && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Visibility sx={{ ml : 1}} />}
                  onClick={() => onViewPassword(user)}
                  sx={{
                    flex: 1,
                    borderColor: "#ff9800",
                    color: "#ff9800",
                    fontSize: "0.7rem",
                  }}
                >
                </Button>
              )}
            </Stack>

              {canDelete && (
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<Delete />}
                  onClick={() => onDelete(user)}
                  sx={{
                    flex: 1,
                    borderColor: "#f44336",
                    color: "#f44336",
                    fontSize: "0.7rem",
                    mt : 1
                  }}
                >
                  Delete
                </Button>
              )}
              
          </Box>
        </Collapse>
      </Box>
    </Paper>
  );
};

// Loading Skeleton
const LoadingSkeleton = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Grid container spacing={isMobile ? 1.5 : 2} sx={{ mb: 3 }}>
        {[1, 2, 3].map((item) => (
          <Grid item xs={6} sm={6} md={4} key={item}>
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

// Empty State
const EmptyState = ({ onClearFilters, hasFilters, canAddUser, onAddUser }) => (
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
      <Person sx={{ fontSize: 48, color: PRIMARY_COLOR }} />
    </Box>
    <Typography variant="h6" fontWeight={600} gutterBottom>
      No users found
    </Typography>
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ mb: 3, maxWidth: 400, mx: "auto" }}
    >
      {hasFilters
        ? "No users match your current filters. Try adjusting your search criteria."
        : canAddUser
          ? "Add your first user to get started"
          : "No users available"}
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
    {!hasFilters && canAddUser && (
      <Button
        variant="contained"
        onClick={onAddUser}
        startIcon={<Add />}
        sx={{ bgcolor: PRIMARY_COLOR, "&:hover": { bgcolor: SECONDARY_COLOR } }}
      >
        Add First User
      </Button>
    )}
  </Box>
);

// Edit User Modal Component
const EditUserModal = ({ open, onClose, user, onSave, currentUserRole, currentUser }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { safeFetchAPI } = useAuth();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    role: "",
    status: "active",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        role: user.role || "",
        status: user.status || "active",
      });
    }
  }, [user]);

  const getAvailableRoles = useMemo(() => {
    const currentRoleLevel = ROLE_CONFIG[currentUserRole]?.level || 0;

    return Object.entries(ROLE_CONFIG)
      .filter(([roleKey, config]) => {
        if (currentUserRole === "Head_office") return true;
        return config.level > currentRoleLevel;
      })
      .map(([value, config]) => ({
        value,
        label: config.label,
        icon: config.icon,
        level: config.level,
      }))
      .sort((a, b) => a.level - b.level);
  }, [currentUserRole]);

  const canEditRole = useMemo(() => {
    if (!user || !currentUserRole) return false;
    if (currentUserRole === "Head_office") return true;
    if (user._id === currentUser?._id) return false;

    const userRoleLevel = ROLE_CONFIG[user.role]?.level || 0;
    const currentRoleLevel = ROLE_CONFIG[currentUserRole]?.level || 0;
    return userRoleLevel > currentRoleLevel;
  }, [user, currentUserRole, currentUser]);

  const canEditStatus = useMemo(() => {
    if (!user || !currentUserRole) return false;
    if (currentUserRole === "Head_office") return true;
    if (user._id === currentUser?._id) return true;

    const userRoleLevel = ROLE_CONFIG[user.role]?.level || 0;
    const currentRoleLevel = ROLE_CONFIG[currentUserRole]?.level || 0;
    return userRoleLevel > currentRoleLevel;
  }, [user, currentUserRole, currentUser]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (
      formData.phoneNumber &&
      !/^[0-9+\-\s]{10,}$/.test(formData.phoneNumber)
    ) {
      newErrors.phoneNumber = "Invalid phone number";
    }
    if (!formData.role && canEditRole) newErrors.role = "Role is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
      };

      if (canEditRole) updateData.role = formData.role;
      if (canEditStatus) updateData.status = formData.status;

      const response = await safeFetchAPI(`/user/update/${user._id}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
      });

      if (!response.success) {
        if (response.type === "PERMISSION_DENIED") {
          setErrors({
            submit:
              response.message ||
              "You don't have permission to update this user",
          });
        } else {
          setErrors({
            submit: response.message || "Failed to update user",
          });
        }
        return;
      }

      if (response.result) {
        onSave(response.result);
        onClose();
      } else {
        onSave(response);
        onClose();
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setErrors({
        submit: error.message || "An error occurred while updating the user",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
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
      <DialogTitle
        sx={{
          bgcolor: PRIMARY_COLOR,
          color: "white",
          pb: 2,
          px: { xs: 2, sm: 3 },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              sx={{
                bgcolor: "white",
                color: PRIMARY_COLOR,
                width: { xs: 40, sm: 48 },
                height: { xs: 40, sm: 48 },
                fontWeight: 600,
              }}
            >
              {user?.firstName?.[0] || "U"}
            </Avatar>
            <Box>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
              >
                Edit User
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  opacity: 0.9,
                  fontSize: { xs: "0.7rem", sm: "0.75rem" },
                }}
              >
                {user?.firstName} {user?.lastName}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: "white" }}>
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ py: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 } }}>
        {errors.submit && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {errors.submit}
          </Alert>
        )}

        <Stack spacing={3} sx={{ mt: 1 }}>
          <Grid container spacing={isMobile ? 2 : 3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={handleChange("firstName")}
                error={!!errors.firstName}
                helperText={errors.firstName}
                required
                size={isMobile ? "small" : "medium"}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={handleChange("lastName")}
                error={!!errors.lastName}
                helperText={errors.lastName}
                required
                size={isMobile ? "small" : "medium"}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange("email")}
                error={!!errors.email}
                helperText={errors.email}
                required
                size={isMobile ? "small" : "medium"}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange("phoneNumber")}
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber}
                size={isMobile ? "small" : "medium"}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>

            {canEditRole && (
              <Grid item xs={12}>
                <FormControl fullWidth size={isMobile ? "small" : "medium"} error={!!errors.role} required>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={formData.role}
                    onChange={handleChange("role")}
                    label="Role"
                    sx={{ borderRadius: 2 }}
                  >
                    {getAvailableRoles.map((role) => (
                      <MenuItem key={role.value} value={role.value}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          {role.icon}
                          <Typography>{role.label}</Typography>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.role && (
                    <Typography variant="caption" color="error">
                      {errors.role}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
            )}
          </Grid>

          {canEditStatus && (
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Account Status
              </Typography>
              <FormControl component="fieldset" fullWidth>
                <RadioGroup
                  value={formData.status}
                  onChange={handleChange("status")}
                >
                  <FormControlLabel
                    value="active"
                    control={<Radio />}
                    label={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <CheckCircle sx={{ color: STATUS_CONFIG.active.color }} />
                        <Typography>Active</Typography>
                      </Stack>
                    }
                  />
                  <FormControlLabel
                    value="inactive"
                    control={<Radio />}
                    label={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Block sx={{ color: STATUS_CONFIG.inactive.color }} />
                        <Typography>Inactive</Typography>
                      </Stack>
                    }
                  />
                </RadioGroup>
              </FormControl>
            </Paper>
          )}
        </Stack>
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
          onClick={onClose}
          variant="outlined"
          fullWidth={isMobile}
          disabled={loading}
          sx={{
            borderRadius: 2,
            borderColor: PRIMARY_COLOR,
            color: PRIMARY_COLOR,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          fullWidth={isMobile}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <Check />}
          sx={{
            bgcolor: PRIMARY_COLOR,
            borderRadius: 2,
            "&:hover": { bgcolor: SECONDARY_COLOR },
          }}
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Password View Dialog
const PasswordViewDialog = ({ open, onClose, user, fetchAPI }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open && user) {
      fetchPassword();
    }
  }, [open, user]);

  const fetchPassword = async () => {
    if (!user?._id) return;

    setLoading(true);
    try {
      const data = await fetchAPI(`/user/getViewPassword/${user._id}`);
      if (data.success) {
        setPassword(data.result?.viewPassword || "No password available");
      } else {
        setPassword("Unable to fetch password");
      }
    } catch (error) {
      console.error("Error fetching password:", error);
      setPassword("Error loading password");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPassword = () => {
    if (
      password &&
      !password.includes("Unable") &&
      !password.includes("Error")
    ) {
      navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
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
      <DialogTitle
        sx={{
          bgcolor: PRIMARY_COLOR,
          color: "white",
          pb: 2,
          px: { xs: 2, sm: 3 },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              sx={{
                bgcolor: "white",
                color: PRIMARY_COLOR,
                width: { xs: 40, sm: 48 },
                height: { xs: 40, sm: 48 },
              }}
            >
              {user?.firstName?.[0] || "U"}
            </Avatar>
            <Box>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
              >
                View Password
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  opacity: 0.9,
                  fontSize: { xs: "0.7rem", sm: "0.75rem" },
                }}
              >
                {user?.firstName} {user?.lastName}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: "white" }}>
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ py: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 } }}>
        <Stack spacing={3}>
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              Security Notice
            </Typography>
            <Typography variant="body2">
              This password is only visible to Head Office. Please handle
              securely.
            </Typography>
          </Alert>

          {loading ? (
            <Stack alignItems="center" spacing={2} py={3}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary">
                Loading password...
              </Typography>
            </Stack>
          ) : (
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                position: "relative",
                bgcolor: "grey.50",
                borderRadius: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "monospace",
                  letterSpacing: "0.1em",
                  textAlign: "center",
                  wordBreak: "break-all",
                  color: "text.primary",
                  fontWeight: 600,
                  fontSize: { xs: "1rem", sm: "1.25rem" },
                }}
              >
                {password}
              </Typography>
              {!password.includes("Unable") &&
                !password.includes("Error") && (
                  <IconButton
                    onClick={handleCopyPassword}
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      color: copied ? "success.main" : PRIMARY_COLOR,
                      bgcolor: "background.paper",
                    }}
                  >
                    <ContentCopy fontSize="small" />
                  </IconButton>
                )}
            </Paper>
          )}
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          p: { xs: 2, sm: 3 },
          pt: { xs: 1.5, sm: 2 },
          borderTop: 1,
          borderColor: "divider",
        }}
      >
        <Button
          onClick={onClose}
          variant="contained"
          fullWidth={isMobile}
          sx={{
            borderRadius: 2,
            bgcolor: PRIMARY_COLOR,
            "&:hover": { bgcolor: SECONDARY_COLOR },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const UserManagement = () => {
  const navigate = useNavigate();
  const { safeFetchAPI, user: currentUser } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // State Management
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [period, setPeriod] = useState("All");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState(isMobile ? "card" : "table");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Dialog states
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [userToAssign, setUserToAssign] = useState(null);
  const [selectedManager, setSelectedManager] = useState("");
  const [managers, setManagers] = useState([]);

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [userToViewPassword, setUserToViewPassword] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Loading states
  const [statusLoading, setStatusLoading] = useState({});
  const [assignLoading, setAssignLoading] = useState(false);

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    byRole: {},
  });

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Refs
  const containerRef = useRef(null);

  // Role-based permissions
  const userRole = currentUser?.role || "";
  const canAddUser = ["Head_office", "ZSM", "ASM", "TEAM"].includes(userRole);
  const canViewPassword = userRole === "Head_office";
  const canDeleteUsers = userRole === "Head_office";

  // Filter options based on role
  const roleOptions = useMemo(() => {
    const allRoles = [
      { value: "all", label: "All Roles", icon: <People /> },
      ...Object.entries(ROLE_CONFIG).map(([value, config]) => ({
        value,
        label: config.label,
        icon: config.icon,
      })),
    ];

    if (userRole === "ASM") {
      return allRoles.filter(
        (role) => role.value === "all" || role.value === "TEAM",
      );
    }

    if (userRole === "ZSM") {
      return allRoles.filter(
        (role) => role.value === "all" || ["ASM", "TEAM"].includes(role.value),
      );
    }

    return allRoles;
  }, [userRole]);

  // Helper functions
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchTerm) count++;
    if (roleFilter !== "all") count++;
    if (statusFilter !== "all") count++;
    if (period !== "All") count++;
    return count;
  }, [searchTerm, roleFilter, statusFilter, period]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: "1",
        limit: "100",
      });

      if (searchTerm) params.append("search", searchTerm);

      const data = await safeFetchAPI(`/user/getAllUsers?${params.toString()}`);

      if (data.type === "PERMISSION_DENIED") {
        showSnackbar(
          data.error || "You don't have permission to view users",
          "warning",
        );
        setUsers([]);
        setFilteredUsers([]);
        return;
      }

      if (data.success) {
        let fetchedUsers = data.result?.users || [];

        // Filter based on role hierarchy
        if (userRole === "Head_office") {
          fetchedUsers = fetchedUsers.filter(
            (user) => user.role !== "Head_office",
          );
        } else if (userRole === "ZSM") {
          fetchedUsers = fetchedUsers.filter((user) =>
            ["ASM", "TEAM"].includes(user.role),
          );
        } else if (userRole === "ASM") {
          fetchedUsers = fetchedUsers.filter((user) => user.role === "TEAM");
        }

        setUsers(fetchedUsers);

        // Calculate statistics
        const total = fetchedUsers.length;
        const active = fetchedUsers.filter((u) => u.status === "active").length;
        const inactive = fetchedUsers.filter(
          (u) => u.status === "inactive",
        ).length;

        setStats({ total, active, inactive });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      showSnackbar(error.message || "Failed to fetch users", "error");
    } finally {
      setLoading(false);
    }
  }, [safeFetchAPI, searchTerm, userRole]);

  // Fetch managers for assignment
  const fetchManagers = useCallback(async () => {
    try {
      let allManagers = [];

      if (userRole === "ASM") {
        // ASM can only assign to themselves
        const params = new URLSearchParams({
          page: "1",
          limit: "100",
          _id: currentUser?._id,
        });
        const data = await safeFetchAPI(
          `/user/getAllUsers?${params.toString()}`,
        );
        if (data.success) {
          allManagers = data.result?.users || [];
        }
      } else {
        // Fetch ZSM managers
        const zsmParams = new URLSearchParams({
          page: "1",
          limit: "100",
          role: "ZSM",
        });
        const zsmData = await safeFetchAPI(
          `/user/getAllUsers?${zsmParams.toString()}`,
        );

        if (zsmData.success) {
          allManagers = [...(zsmData.result?.users || [])];
        }

        // Fetch ASM managers if needed
        if (userRole === "Head_office") {
          const asmParams = new URLSearchParams({
            page: "1",
            limit: "100",
            role: "ASM",
          });
          const asmData = await safeFetchAPI(
            `/user/getAllUsers?${asmParams.toString()}`,
          );

          if (asmData.success) {
            allManagers = [...allManagers, ...(asmData.result?.users || [])];
          }
        }
      }

      // Filter active managers and remove duplicates
      const uniqueManagers = allManagers
        .filter(
          (manager) =>
            manager.status === "active" && manager._id !== currentUser?._id,
        )
        .filter(
          (manager, index, self) =>
            index === self.findIndex((m) => m._id === manager._id),
        );

      setManagers(uniqueManagers);
    } catch (error) {
      console.error("Error fetching managers:", error);
      showSnackbar("Failed to load managers", "error");
    }
  }, [safeFetchAPI, userRole, currentUser?._id]);

  // Initial fetch
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Fetch managers when assign dialog opens
  useEffect(() => {
    if (assignDialogOpen) {
      fetchManagers();
    }
  }, [assignDialogOpen, fetchManagers]);

  // Filter and sort users
  useEffect(() => {
    let filtered = [...users];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.firstName?.toLowerCase().includes(searchLower) ||
          user.lastName?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.phoneNumber?.includes(searchTerm),
      );
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.status === statusFilter);
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (sortConfig.key === "firstName") {
          aVal = `${a.firstName || ""} ${a.lastName || ""}`.toLowerCase();
          bVal = `${b.firstName || ""} ${b.lastName || ""}`.toLowerCase();
        } else if (sortConfig.key === "role") {
          aVal = ROLE_CONFIG[a.role]?.level || 0;
          bVal = ROLE_CONFIG[b.role]?.level || 0;
        } else if (sortConfig.key === "status") {
          aVal = a.status || "";
          bVal = b.status || "";
        }

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    setFilteredUsers(filtered);
    setPage(0);
  }, [users, searchTerm, roleFilter, statusFilter, sortConfig]);

  const canEditUser = (user) => {
    if (!user || !currentUser) return false;
    if (user._id === currentUser._id) return true;
    if (currentUser.role === "Head_office") return true;

    const userRoleLevel = ROLE_CONFIG[user.role]?.level || 999;
    const currentRoleLevel = ROLE_CONFIG[currentUser.role]?.level || 0;

    if (currentUser.role === "ZSM") {
      return userRoleLevel > currentRoleLevel;
    }
    if (currentUser.role === "ASM") {
      return user.role === "TEAM";
    }
    return false;
  };

  const handleEditUser = (user) => {
    if (!canEditUser(user)) {
      showSnackbar("You don't have permission to edit this user", "error");
      return;
    }
    setUserToEdit(user);
    setEditModalOpen(true);
  };

  const handleSaveEditedUser = (updatedUser) => {
    setUsers((prev) =>
      prev.map((user) => (user._id === updatedUser._id ? updatedUser : user)),
    );
    showSnackbar("User updated successfully", "success");
  };

  const handleViewPassword = (user) => {
    if (!canViewPassword) {
      showSnackbar("Only Head Office can view passwords", "error");
      return;
    }
    setUserToViewPassword(user);
    setPasswordDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete || !canDeleteUsers) {
      showSnackbar("Only Head Office can delete users", "error");
      return;
    }

    if (userToDelete.role === "Head_office") {
      showSnackbar("Cannot delete Head Office users", "error");
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      return;
    }

    try {
      const response = await safeFetchAPI(`/user/delete/${userToDelete._id}`, {
        method: "DELETE",
      });

      if (response.type === "PERMISSION_DENIED") {
        showSnackbar(
          response.error || "You don't have permission to delete this user",
          "error",
        );
        return;
      }

      showSnackbar("User deleted successfully", "success");
      setUsers((prev) => prev.filter((user) => user._id !== userToDelete._id));
    } catch (error) {
      showSnackbar(error.message || "Failed to delete user", "error");
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleAssignManager = async () => {
    if (!userToAssign || !selectedManager) {
      showSnackbar("Please select a manager", "error");
      return;
    }

    if (userRole === "ASM" && selectedManager !== currentUser?._id) {
      showSnackbar("ASM can only assign to themselves", "error");
      return;
    }

    setAssignLoading(true);
    try {
      const response = await safeFetchAPI("/user/asignUserToManager", {
        method: "POST",
        body: JSON.stringify({
          userId: userToAssign._id,
          managerId: selectedManager,
        }),
      });

      if (response.type === "PERMISSION_DENIED") {
        showSnackbar(
          response.error || "You don't have permission to assign this user",
          "error",
        );
        return;
      }

      if (response.success) {
        showSnackbar("User assigned to manager successfully", "success");
        setUsers((prev) =>
          prev.map((user) =>
            user._id === userToAssign._id
              ? { ...user, supervisor: selectedManager }
              : user,
          ),
        );
      } else {
        showSnackbar(response.message || "Failed to assign manager", "error");
      }
    } catch (error) {
      console.error("Error assigning manager:", error);
      showSnackbar(error.message || "Failed to assign manager", "error");
    } finally {
      setAssignLoading(false);
      setAssignDialogOpen(false);
      setUserToAssign(null);
      setSelectedManager("");
    }
  };

  const handleToggleStatus = async (user) => {
    if (!user?._id) return;

    if (!canEditUser(user)) {
      showSnackbar(
        "You don't have permission to change this user's status",
        "error",
      );
      return;
    }

    setStatusLoading((prev) => ({ ...prev, [user._id]: true }));

    try {
      const newStatus = user.status === "active" ? "inactive" : "active";
      const response = await safeFetchAPI(`/user/update/${user._id}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.type === "PERMISSION_DENIED") {
        showSnackbar(
          response.error || "You can only update users in your zone",
          "error",
        );
        return;
      }

      if (response.success) {
        showSnackbar(
          `User ${newStatus === "active" ? "activated" : "deactivated"} successfully`,
          "success",
        );
        setUsers((prev) =>
          prev.map((u) =>
            u._id === user._id ? { ...u, status: newStatus } : u,
          ),
        );
      } else {
        showSnackbar(
          response.message || "Failed to update user status",
          "error",
        );
      }
    } catch (error) {
      showSnackbar(error.message || "Failed to update user status", "error");
    } finally {
      setStatusLoading((prev) => ({ ...prev, [user._id]: false }));
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setStatusFilter("all");
    setPeriod("All");
    setSortConfig({ key: null, direction: "asc" });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Loading state
  if (loading && users.length === 0) {
    return <LoadingSkeleton />;
  }

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
      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        open={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        period={period}
        setPeriod={setPeriod}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        handleClearFilters={handleClearFilters}
        searchQuery={searchTerm}
        setSearchQuery={setSearchTerm}
        sortConfig={sortConfig}
        setSortConfig={setSortConfig}
        viewMode={viewMode}
        setViewMode={setViewMode}
        activeFilterCount={activeFilterCount}
        roleOptions={roleOptions}
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
              User Management
            </Typography>
            <Typography
              variant="body2"
              sx={{
                opacity: 0.9,
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              }}
            >
              {userRole === "ASM"
                ? "Manage your team members"
                : userRole === "ZSM"
                  ? "Manage ASM and TEAM members in your zone"
                  : "Manage all users in the system"}
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
              onClick={fetchUsers}
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
            {canAddUser && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate("/add-user")}
                size={isMobile ? "small" : "medium"}
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "#fff",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                }}
              >
                Add User
              </Button>
            )}
          </Box>
        </Stack>
      </Paper>

      {/* Statistics Cards */}
      <Grid container spacing={isMobile ? 1.5 : 2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={6} md={4}>
          <StatCard
            title="Total Users"
            value={stats.total}
            icon={<People />}
            color={PRIMARY_COLOR}
            subtext={`${userRole} View`}
            index={0}
          />
        </Grid>
        <Grid item xs={6} sm={6} md={4}>
          <StatCard
            title="Active Users"
            value={stats.active}
            icon={<CheckCircle />}
            color="#4caf50"
            subtext={`${((stats.active / stats.total) * 100 || 0).toFixed(1)}% of total`}
            index={1}
          />
        </Grid>
        <Grid item xs={6} sm={6} md={4}>
          <StatCard
            title="Inactive Users"
            value={stats.inactive}
            icon={<Block />}
            color="#f44336"
            subtext={`${((stats.inactive / stats.total) * 100 || 0).toFixed(1)}% of total`}
            index={2}
          />
        </Grid>
      </Grid>

      {/* Desktop Search and Filters */}
      {!isMobile && (
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Stack spacing={2.5}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search users by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="small"
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
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Role Filter</InputLabel>
                  <Select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    label="Role Filter"
                    sx={{ borderRadius: 2 }}
                  >
                    {roleOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          {option.icon}
                          <span>{option.label}</span>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status Filter</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Status Filter"
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="active">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <CheckCircle sx={{ color: "#4caf50" }} />
                        <span>Active</span>
                      </Stack>
                    </MenuItem>
                    <MenuItem value="inactive">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Block sx={{ color: "#f44336" }} />
                        <span>Inactive</span>
                      </Stack>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

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
                  {roleFilter !== "all" && (
                    <Chip
                      label={`Role: ${roleOptions.find(opt => opt.value === roleFilter)?.label || roleFilter}`}
                      size="small"
                      onDelete={() => setRoleFilter("all")}
                      sx={{
                        bgcolor: alpha(PRIMARY_COLOR, 0.1),
                        color: PRIMARY_COLOR,
                      }}
                    />
                  )}
                  {statusFilter !== "all" && (
                    <Chip
                      label={`Status: ${statusFilter === "active" ? "Active" : "Inactive"}`}
                      size="small"
                      onDelete={() => setStatusFilter("all")}
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
        </Paper>
      )}

      {/* Mobile Search Bar */}
      {isMobile && (
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search users..."
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
                  <IconButton size="small" onClick={() => setSearchTerm("")}>
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

      {/* Content */}
      <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden" }}>
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
            bgcolor: "#fff",
          }}
        >
          <Typography
            variant="h6"
            fontWeight={600}
            sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
          >
            Users
            <Chip
              label={`${filteredUsers.length} total`}
              size="small"
              sx={{
                ml: 1,
                bgcolor: alpha(PRIMARY_COLOR, 0.1),
                color: PRIMARY_COLOR,
              }}
            />
          </Typography>

          {!isMobile && (
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Rows per page:
              </Typography>
              <Select
                size="small"
                value={rowsPerPage}
                onChange={handleChangeRowsPerPage}
                sx={{ minWidth: 80 }}
              >
                {[5, 10, 25, 50].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </Stack>
          )}
        </Box>

        {!isMobile ? (
          // Desktop Table View
          filteredUsers.length === 0 ? (
            <Box sx={{ p: 4 }}>
              <EmptyState
                onClearFilters={handleClearFilters}
                hasFilters={activeFilterCount > 0}
                canAddUser={canAddUser}
                onAddUser={() => navigate("/add-user")}
              />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: alpha(PRIMARY_COLOR, 0.05) }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Contact</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Manager</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="center">
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage,
                      )
                      .map((user) => {
                        const roleConfig =
                          ROLE_CONFIG[user.role] || ROLE_CONFIG.TEAM;
                        const statusConfig =
                          STATUS_CONFIG[user.status] || STATUS_CONFIG.active;
                        const canEdit = canEditUser(user);
                        const canAssign =
                          user.role === "TEAM" &&
                          ["ZSM", "ASM", "Head_office"].includes(userRole) &&
                          !user.supervisor;
                        const canView = canViewPassword;
                        const canDelete =
                          canDeleteUsers && user.role !== "Head_office";

                        return (
                          <TableRow key={user._id} hover>
                            <TableCell>
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={2}
                              >
                                <Avatar
                                  sx={{
                                    bgcolor: roleConfig.color,
                                    width: 40,
                                    height: 40,
                                  }}
                                >
                                  {user.firstName?.[0]}
                                </Avatar>
                                <Box>
                                  <Typography
                                    fontWeight={600}
                                    variant="subtitle2"
                                  >
                                    {user.firstName} {user.lastName}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    ID: {user._id?.slice(-6)}
                                  </Typography>
                                </Box>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Box>
                                <Typography variant="body2">
                                  {user.email}
                                </Typography>
                                {user.phoneNumber && (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {user.phoneNumber}
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={roleConfig.label}
                                size="small"
                                icon={roleConfig.icon}
                                sx={{
                                  bgcolor: roleConfig.bg,
                                  color: roleConfig.color,
                                  fontWeight: 600,
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1}
                              >
                                <Chip
                                  label={statusConfig.label}
                                  size="small"
                                  icon={statusConfig.icon}
                                  sx={{
                                    bgcolor: statusConfig.bg,
                                    color: statusConfig.color,
                                    fontWeight: 600,
                                  }}
                                />
                                {canEdit && (
                                  <Tooltip
                                    title={
                                      user.status === "active"
                                        ? "Deactivate"
                                        : "Activate"
                                    }
                                  >
                                    <IconButton
                                      size="small"
                                      onClick={() => handleToggleStatus(user)}
                                      disabled={statusLoading[user._id]}
                                    >
                                      {statusLoading[user._id] ? (
                                        <CircularProgress size={20} />
                                      ) : user.status === "active" ? (
                                        <Lock
                                          fontSize="small"
                                          sx={{ color: "#f44336" }}
                                        />
                                      ) : (
                                        <LockOpen
                                          fontSize="small"
                                          sx={{ color: "#4caf50" }}
                                        />
                                      )}
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Stack>
                            </TableCell>
                            <TableCell>
                              {user.supervisor ? (
                                <Chip
                                  label="Assigned"
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                />
                              ) : canAssign ? (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<PersonAdd />}
                                  onClick={() => {
                                    setUserToAssign(user);
                                    setAssignDialogOpen(true);
                                  }}
                                  sx={{
                                    borderColor: PRIMARY_COLOR,
                                    color: PRIMARY_COLOR,
                                  }}
                                >
                                  Assign
                                </Button>
                              ) : (
                                <Typography
                                  variant="caption"
                                  color="text.disabled"
                                >
                                  N/A
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell align="center">
                              <Stack
                                direction="row"
                                spacing={1}
                                justifyContent="center"
                              >
                                {canView && (
                                  <Tooltip title="View Password">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleViewPassword(user)}
                                      sx={{
                                        bgcolor: alpha("#ff9800", 0.1),
                                        color: "#ff9800",
                                      }}
                                    >
                                      <Visibility fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}

                                {canEdit && (
                                  <Tooltip title="Edit User">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleEditUser(user)}
                                      sx={{
                                        bgcolor: alpha(PRIMARY_COLOR, 0.1),
                                        color: PRIMARY_COLOR,
                                      }}
                                    >
                                      <Edit fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}

                                {canDelete && (
                                  <Tooltip title="Delete User">
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        setUserToDelete(user);
                                        setDeleteDialogOpen(true);
                                      }}
                                      sx={{
                                        bgcolor: alpha("#f44336", 0.1),
                                        color: "#f44336",
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
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={filteredUsers.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          )
        ) : (
          // Mobile Card View
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            {loading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : filteredUsers.length === 0 ? (
              <EmptyState
                onClearFilters={handleClearFilters}
                hasFilters={activeFilterCount > 0}
                canAddUser={canAddUser}
                onAddUser={() => navigate("/add-user")}
              />
            ) : (
              <>
                {filteredUsers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((user) => (
                    <MobileUserCard
                      key={user._id}
                      user={user}
                      onEdit={handleEditUser}
                      onToggleStatus={handleToggleStatus}
                      onAssign={(user) => {
                        setUserToAssign(user);
                        setAssignDialogOpen(true);
                      }}
                      onViewPassword={handleViewPassword}
                      onDelete={(user) => {
                        setUserToDelete(user);
                        setDeleteDialogOpen(true);
                      }}
                      currentUserRole={userRole}
                      currentUserId={currentUser?._id}
                      statusLoading={statusLoading}
                    />
                  ))}
                <Box display="flex" justifyContent="center" mt={2}>
                  <TablePagination
                    component="div"
                    count={filteredUsers.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25]}
                  />
                </Box>
              </>
            )}
          </Box>
        )}
      </Paper>

      {/* Edit User Modal */}
      <EditUserModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setUserToEdit(null);
        }}
        user={userToEdit}
        onSave={handleSaveEditedUser}
        currentUserRole={userRole}
        currentUser={currentUser}
      />

      {/* Password View Dialog */}
      <PasswordViewDialog
        open={passwordDialogOpen}
        onClose={() => {
          setPasswordDialogOpen(false);
          setUserToViewPassword(null);
        }}
        user={userToViewPassword}
        fetchAPI={safeFetchAPI}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
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
            <Typography variant="h6" fontWeight="700">
              Delete User
            </Typography>
            <IconButton onClick={() => setDeleteDialogOpen(false)} size="small" sx={{ color: "white" }}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ py: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 } }}>
          {userToDelete && (
            <Stack spacing={3}>
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                <Typography fontWeight={600}>
                  Warning: This action cannot be undone
                </Typography>
                <Typography variant="body2">
                  All user data will be permanently deleted.
                </Typography>
              </Alert>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar
                  sx={{
                    bgcolor: ROLE_CONFIG[userToDelete.role]?.color || PRIMARY_COLOR,
                    width: 60,
                    height: 60,
                  }}
                >
                  {userToDelete.firstName?.[0]}
                </Avatar>
                <Box>
                  <Typography fontWeight={600} variant="h6">
                    {userToDelete.firstName} {userToDelete.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {userToDelete.email} • {ROLE_CONFIG[userToDelete.role]?.label}
                  </Typography>
                </Box>
              </Stack>
              <Typography variant="body2">
                Are you sure you want to permanently delete this user?
              </Typography>
            </Stack>
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
            onClick={handleDeleteUser}
            variant="contained"
            color="error"
            fullWidth={isMobile}
            startIcon={<Delete />}
            sx={{ borderRadius: 2 }}
          >
            Delete User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Manager Dialog */}
      <Dialog
        open={assignDialogOpen}
        onClose={() => {
          setAssignDialogOpen(false);
          setUserToAssign(null);
          setSelectedManager("");
        }}
        maxWidth="sm"
        fullWidth
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
        <DialogTitle
          sx={{
            bgcolor: PRIMARY_COLOR,
            color: "white",
            pb: 2,
            px: { xs: 2, sm: 3 },
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" fontWeight="700">
              Assign Manager
            </Typography>
            <IconButton
              onClick={() => {
                setAssignDialogOpen(false);
                setUserToAssign(null);
                setSelectedManager("");
              }}
              size="small"
              sx={{ color: "white" }}
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ py: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 } }}>
          {userToAssign && (
            <Stack spacing={3}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar
                  sx={{
                    bgcolor: ROLE_CONFIG[userToAssign.role]?.color || PRIMARY_COLOR,
                    width: { xs: 48, sm: 60 },
                    height: { xs: 48, sm: 60 },
                  }}
                >
                  {userToAssign.firstName?.[0]}
                </Avatar>
                <Box>
                  <Typography fontWeight={600} variant="h6">
                    {userToAssign.firstName} {userToAssign.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {ROLE_CONFIG[userToAssign.role]?.label}
                  </Typography>
                </Box>
              </Stack>

              <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                <InputLabel>Select Manager</InputLabel>
                <Select
                  value={selectedManager}
                  onChange={(e) => setSelectedManager(e.target.value)}
                  label="Select Manager"
                  disabled={assignLoading}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="" disabled>
                    <em>Choose a manager</em>
                  </MenuItem>
                  {managers.length > 0 ? (
                    managers.map((manager) => (
                      <MenuItem key={manager._id} value={manager._id}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1.5}
                        >
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: ROLE_CONFIG[manager.role]?.color || PRIMARY_COLOR,
                            }}
                          >
                            {manager.firstName?.[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {manager.firstName} {manager.lastName}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {ROLE_CONFIG[manager.role]?.label}
                            </Typography>
                          </Box>
                        </Stack>
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>
                      <Typography color="text.secondary">
                        No managers available
                      </Typography>
                    </MenuItem>
                  )}
                </Select>
              </FormControl>

              {managers.length === 0 && (
                <Alert severity="warning" sx={{ borderRadius: 2 }}>
                  No active managers found. Please ensure there are active ZSM
                  or ASM users.
                </Alert>
              )}

              {userRole === "ASM" && (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  ASM can only assign team members to themselves.
                </Alert>
              )}
            </Stack>
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
            onClick={() => {
              setAssignDialogOpen(false);
              setUserToAssign(null);
              setSelectedManager("");
            }}
            variant="outlined"
            fullWidth={isMobile}
            disabled={assignLoading}
            sx={{
              borderRadius: 2,
              borderColor: PRIMARY_COLOR,
              color: PRIMARY_COLOR,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssignManager}
            variant="contained"
            fullWidth={isMobile}
            disabled={!selectedManager || assignLoading || managers.length === 0}
            sx={{
              bgcolor: PRIMARY_COLOR,
              borderRadius: 2,
              "&:hover": { bgcolor: SECONDARY_COLOR },
            }}
          >
            {assignLoading ? <CircularProgress size={24} /> : "Assign Manager"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{
          vertical: isMobile ? "top" : "bottom",
          horizontal: isMobile ? "center" : "right",
        }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%", borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

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
            sx={{
              height: 64,
              "& .MuiBottomNavigationAction-root": {
                color: "text.secondary",
                "&.Mui-selected": { color: PRIMARY_COLOR },
              },
            }}
          >
            <BottomNavigationAction
              label="Dashboard"
              icon={<Dashboard />}
              onClick={() => navigate("/dashboard")}
            />
            <BottomNavigationAction
              label="Users"
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
};

export default UserManagement;