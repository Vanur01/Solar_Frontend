import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  Card,
  Grid,
  Stack,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  FormControl,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
  Snackbar,
  CircularProgress,
  InputLabel,
  InputAdornment,
  Pagination,
  Paper,
  Avatar,
  useTheme,
  Drawer,
  ListItemIcon,
  ListItemText,
  Divider,
  Fab,
  Zoom,
  Skeleton,
  Badge,
  CardContent,
  CardActions,
  useMediaQuery,
  Container,
  AppBar,
  Toolbar,
  Modal,
  Backdrop,
  Fade,
  Select,
  Tooltip,
  BottomNavigation,
  BottomNavigationAction,
  alpha,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  Download,
  Add,
  Edit,
  Delete,
  Visibility,
  Close,
  CheckCircle,
  Cancel,
  PendingActions,
  MoreVert,
  Refresh,
  CloudUpload,
  AttachFile,
  PictureAsPdf,
  Description,
  Image as ImageIcon,
  Today,
  DateRange,
  CalendarToday,
  Timeline,
  LocationOn,
  LocalGasStation,
  Wifi,
  Restaurant,
  Hotel,
  Build,
  ListAlt,
  Flight,
  Search,
  Inventory,
  FilterList,
  GridView,
  ViewList,
  ArrowBack,
  ArrowForward,
  Check,
  Warning,
  Info,
  Error,
  Menu as MenuIcon,
  ReceiptLong,
  Dashboard,
  TrendingUp,
  TrendingDown,
  AttachMoney,
  Person,
  Email,
  Phone,
  Receipt,
  QrCodeScanner,
  Print,
  Share,
  Bookmark,
  BookmarkBorder,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import {
  format,
  parseISO,
  isToday,
  isThisWeek,
  isThisMonth,
  isThisYear,
} from "date-fns";
import { useNavigate } from "react-router-dom";

// New Color Theme - Clean and Modern
const COLORS = {
  primary: {
    main: "#2563eb",
    light: "#60a5fa",
    dark: "#1d4ed8",
    bg: "#eff6ff",
  },
  success: {
    main: "#059669",
    light: "#34d399",
    dark: "#047857",
    bg: "#ecfdf5",
  },
  warning: {
    main: "#d97706",
    light: "#fbbf24",
    dark: "#b45309",
    bg: "#fffbeb",
  },
  error: {
    main: "#dc2626",
    light: "#f87171",
    dark: "#b91c1c",
    bg: "#fef2f2",
  },
  info: {
    main: "#2563eb",
    light: "#60a5fa",
    dark: "#1d4ed8",
    bg: "#eff6ff",
  },
  neutral: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
  }
};

// Status Configuration
const STATUS_CONFIG = {
  Approved: {
    color: COLORS.success.main,
    bg: COLORS.success.bg,
    icon: <CheckCircle sx={{ fontSize: 18 }} />,
    label: "Approved",
  },
  Pending: {
    color: COLORS.warning.main,
    bg: COLORS.warning.bg,
    icon: <PendingActions sx={{ fontSize: 18 }} />,
    label: "Pending",
  },
  Rejected: {
    color: COLORS.error.main,
    bg: COLORS.error.bg,
    icon: <Cancel sx={{ fontSize: 18 }} />,
    label: "Rejected",
  },
};

// Category Configuration
const CATEGORY_CONFIG = {
  Travel: { 
    color: "#2563eb", 
    icon: <Flight sx={{ fontSize: 18 }} />, 
    bg: "#eff6ff",
    label: "Travel"
  },
  Food: { 
    color: "#059669", 
    icon: <Restaurant sx={{ fontSize: 18 }} />, 
    bg: "#ecfdf5",
    label: "Food"
  },
  Accommodation: { 
    color: "#7c3aed", 
    icon: <Hotel sx={{ fontSize: 18 }} />, 
    bg: "#f5f3ff",
    label: "Accommodation"
  },
  Fuel: { 
    color: "#ea580c", 
    icon: <LocalGasStation sx={{ fontSize: 18 }} />, 
    bg: "#fff7ed",
    label: "Fuel"
  },
  Software: { 
    color: "#0891b2", 
    icon: <Wifi sx={{ fontSize: 18 }} />, 
    bg: "#ecfeff",
    label: "Software"
  },
  Hardware: { 
    color: "#4f46e5", 
    icon: <Build sx={{ fontSize: 18 }} />, 
    bg: "#eef2ff",
    label: "Hardware"
  },
  Office: { 
    color: "#b45309", 
    icon: <Inventory sx={{ fontSize: 18 }} />, 
    bg: "#fffbeb",
    label: "Office"
  },
  Miscellaneous: { 
    color: COLORS.neutral[500], 
    icon: <ListAlt sx={{ fontSize: 18 }} />, 
    bg: COLORS.neutral[100],
    label: "Miscellaneous"
  },
};

// Time Periods
const TIME_PERIODS = [
  { value: "today", label: "Today", icon: <Today sx={{ fontSize: 18 }} /> },
  { value: "week", label: "This Week", icon: <DateRange sx={{ fontSize: 18 }} /> },
  { value: "month", label: "This Month", icon: <CalendarToday sx={{ fontSize: 18 }} /> },
  { value: "quarter", label: "This Quarter", icon: <Timeline sx={{ fontSize: 18 }} /> },
  { value: "year", label: "This Year", icon: <CalendarToday sx={{ fontSize: 18 }} /> },
  { value: "custom", label: "Custom Range", icon: <DateRange sx={{ fontSize: 18 }} /> },
];

// Skeleton Loader
const ExpenseCardSkeleton = () => (
  <Card sx={{ mb: 2, borderRadius: 3 }}>
    <CardContent sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box display="flex" gap={2}>
          <Skeleton variant="circular" width={48} height={48} sx={{ bgcolor: COLORS.neutral[200] }} />
          <Box>
            <Skeleton variant="text" width={160} height={24} sx={{ bgcolor: COLORS.neutral[200] }} />
            <Skeleton variant="text" width={100} height={20} sx={{ bgcolor: COLORS.neutral[200] }} />
          </Box>
        </Box>
        <Skeleton variant="text" width={100} height={32} sx={{ bgcolor: COLORS.neutral[200] }} />
      </Box>
      <Box mt={2}>
        <Skeleton variant="text" width="100%" height={20} sx={{ bgcolor: COLORS.neutral[200] }} />
        <Skeleton variant="text" width="80%" height={20} sx={{ bgcolor: COLORS.neutral[200] }} />
      </Box>
    </CardContent>
  </Card>
);

// Stat Card Component
const StatCard = ({ icon, title, value, subtitle, color = COLORS.primary.main, trend }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: `1px solid ${COLORS.neutral[200]}`,
        transition: "all 0.2s",
        height:"150px",
        "&:hover": {
          borderColor: color,
          boxShadow: `0 4px 12px ${alpha(color, 0.15)}`,
        },
      }}
    >
      <CardContent sx={{ p: isMobile ? 2 : 2.5 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Avatar
            sx={{
              bgcolor: alpha(color, 0.1),
              color: color,
              width: isMobile ? 40 : 44,
              height: isMobile ? 40 : 44,
              borderRadius: 2,
            }}
          >
            {icon}
          </Avatar>
          {trend && (
            <Chip
              size="small"
              icon={trend > 0 ? <TrendingUp /> : <TrendingDown />}
              label={`${Math.abs(trend)}%`}
              sx={{
                borderRadius: 2,
                bgcolor: trend > 0 ? alpha(COLORS.success.main, 0.1) : alpha(COLORS.error.main, 0.1),
                color: trend > 0 ? COLORS.success.main : COLORS.error.main,
                height: 24,
                "& .MuiChip-icon": { fontSize: 14, color: "inherit" },
              }}
            />
          )}
        </Box>
        <Typography variant="body2" color={COLORS.neutral[600]} sx={{ mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="h6" fontWeight="700" sx={{ color: COLORS.neutral[800] }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color={COLORS.neutral[500]}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

// Mobile Expense Card
const MobileExpenseCard = ({ expense, onMenuOpen, onView }) => {
  const status = expense.status || "Pending";
  const category = expense.category || "Miscellaneous";
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
  const categoryConfig = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.Miscellaneous;

  const getTimeAgo = (dateString) => {
    const date = parseISO(dateString);
    if (isToday(date)) return "Today";
    if (isThisWeek(date)) return "This week";
    if (isThisMonth(date)) return "This month";
    return format(date, "MMM dd, yyyy");
  };

  return (
    <Card
      sx={{
        mb: 2,
        borderRadius: 3,
        border: `1px solid ${COLORS.neutral[200]}`,
        transition: "all 0.2s",
        "&:hover": {
          borderColor: COLORS.primary.main,
          boxShadow: `0 4px 12px ${alpha(COLORS.primary.main, 0.1)}`,
        },
      }}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box display="flex" gap={1.5}>
            <Avatar
              sx={{
                bgcolor: alpha(categoryConfig.color, 0.1),
                color: categoryConfig.color,
                width: 44,
                height: 44,
                borderRadius: 2,
              }}
            >
              {categoryConfig.icon}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="600" sx={{ color: COLORS.neutral[800] }}>
                {expense.title}
              </Typography>
              <Box display="flex" alignItems="center" gap={0.5}>
                <Today sx={{ fontSize: 14, color: COLORS.neutral[400] }} />
                <Typography variant="caption" color={COLORS.neutral[500]}>
                  {getTimeAgo(expense.createdAt)}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box display="flex" alignItems="center">
            <Typography variant="h6" fontWeight="700" sx={{ color: COLORS.primary.main, mr: 1 }}>
              ₹{expense.amount?.toLocaleString()}
            </Typography>
            <IconButton 
              size="small" 
              onClick={(e) => onMenuOpen(e, expense)}
              sx={{ color: COLORS.neutral[500] }}
            >
              <MoreVert sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </Box>

        {/* Description */}
        {expense.description && (
          <Typography 
            variant="body2" 
            color={COLORS.neutral[600]} 
            sx={{ mt: 1.5, ml: 7 }}
          >
            {expense.description.length > 50
              ? `${expense.description.substring(0, 50)}...`
              : expense.description}
          </Typography>
        )}

        {/* Chips */}
        <Box display="flex" gap={1} flexWrap="wrap" sx={{ mt: 1.5, ml: 7 }}>
          <Chip
            size="small"
            label={categoryConfig.label}
            sx={{
              bgcolor: alpha(categoryConfig.color, 0.1),
              color: categoryConfig.color,
              fontWeight: 500,
              height: 26,
              fontSize: "0.75rem",
              borderRadius: 2,
              border: `1px solid ${alpha(categoryConfig.color, 0.2)}`,
            }}
          />
          <Chip
            size="small"
            label={statusConfig.label}
            icon={statusConfig.icon}
            sx={{
              bgcolor: statusConfig.bg,
              color: statusConfig.color,
              fontWeight: 500,
              height: 26,
              fontSize: "0.75rem",
              borderRadius: 2,
              border: `1px solid ${alpha(statusConfig.color, 0.2)}`,
              "& .MuiChip-icon": { 
                fontSize: 14, 
                color: statusConfig.color,
                marginLeft: '6px',
              },
            }}
          />
        </Box>

        {/* Footer */}
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar
              sx={{
                width: 28,
                height: 28,
                fontSize: "0.75rem",
                bgcolor: COLORS.neutral[500],
                borderRadius: 2,
              }}
            >
              {expense.createdBy?.name?.charAt(0) || expense.createdBy?.email?.charAt(0) || "U"}
            </Avatar>
            <Typography variant="caption" color={COLORS.neutral[600]}>
              {expense.createdBy?.name || expense.createdBy?.email?.split("@")[0] || "Unknown"}
            </Typography>
          </Box>
          <Button
            size="small"
            onClick={() => onView(expense)}
            sx={{
              textTransform: "none",
              color: COLORS.primary.main,
              fontWeight: 500,
              fontSize: "0.75rem",
              "&:hover": {
                bgcolor: alpha(COLORS.primary.main, 0.05),
              },
            }}
          >
            View Details
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

// Desktop Table Row
const DesktopTableRow = ({ expense, onMenuOpen }) => {
  const status = expense.status || "Pending";
  const category = expense.category || "Miscellaneous";
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
  const categoryConfig = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.Miscellaneous;

  return (
    <TableRow 
      hover 
      sx={{ 
        "&:last-child td": { borderBottom: 0 },
        "&:hover": {
          bgcolor: alpha(COLORS.primary.main, 0.02),
        },
      }}
    >
      <TableCell>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar
            sx={{
              bgcolor: alpha(categoryConfig.color, 0.1),
              color: categoryConfig.color,
              width: 40,
              height: 40,
              borderRadius: 2,
            }}
          >
            {categoryConfig.icon}
          </Avatar>
          <Box>
            <Typography fontWeight="600" sx={{ color: COLORS.neutral[800] }}>
              {expense.title}
            </Typography>
            {expense.description && (
              <Typography variant="caption" color={COLORS.neutral[500]}>
                {expense.description.slice(0, 40)}...
              </Typography>
            )}
          </Box>
        </Box>
      </TableCell>
      <TableCell>
        <Typography fontWeight="600" sx={{ color: COLORS.primary.main }}>
          ₹{expense.amount?.toLocaleString()}
        </Typography>
      </TableCell>
      <TableCell>
        <Chip
          size="small"
          label={categoryConfig.label}
          sx={{
            bgcolor: alpha(categoryConfig.color, 0.1),
            color: categoryConfig.color,
            fontWeight: 500,
            fontSize: "0.75rem",
            borderRadius: 2,
            border: `1px solid ${alpha(categoryConfig.color, 0.2)}`,
          }}
        />
      </TableCell>
      <TableCell>
        <Typography variant="body2" color={COLORS.neutral[700]}>
          {format(parseISO(expense.createdAt), "MMM dd, yyyy")}
        </Typography>
      </TableCell>
      <TableCell>
        <Chip
          size="small"
          label={statusConfig.label}
          icon={statusConfig.icon}
          sx={{
            bgcolor: statusConfig.bg,
            color: statusConfig.color,
            fontWeight: 500,
            fontSize: "0.75rem",
            borderRadius: 2,
            border: `1px solid ${alpha(statusConfig.color, 0.2)}`,
            "& .MuiChip-icon": { 
              fontSize: 14, 
              color: statusConfig.color,
              marginLeft: '6px',
            },
          }}
        />
      </TableCell>
      <TableCell>
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar
            sx={{
              width: 28,
              height: 28,
              fontSize: "0.75rem",
              bgcolor: COLORS.neutral[500],
              borderRadius: 2,
            }}
          >
            {expense.createdBy?.name?.charAt(0) || expense.createdBy?.email?.charAt(0) || "U"}
          </Avatar>
          <Typography variant="body2" color={COLORS.neutral[700]}>
            {expense.createdBy?.name || expense.createdBy?.email?.split("@")[0] || "Unknown"}
          </Typography>
        </Box>
      </TableCell>
      <TableCell align="right">
        <IconButton 
          size="small" 
          onClick={(e) => onMenuOpen(e, expense)}
          sx={{ color: COLORS.neutral[500] }}
        >
          <MoreVert sx={{ fontSize: 20 }} />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

// Filter Drawer Component
const FilterDrawer = ({ open, onClose, filters, onFilterChange, onReset }) => (
  <Drawer
    anchor="bottom"
    open={open}
    onClose={onClose}
    PaperProps={{
      sx: {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        maxHeight: "90vh",
      },
    }}
  >
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight="600" sx={{ color: COLORS.neutral[800] }}>
          Filters
        </Typography>
        <IconButton onClick={onClose} sx={{ color: COLORS.neutral[500] }}>
          <Close />
        </IconButton>
      </Box>

      <Stack spacing={2.5}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search expenses..."
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ fontSize: 20, color: COLORS.neutral[400] }} />
              </InputAdornment>
            ),
          }}
        />

        <FormControl fullWidth size="small">
          <InputLabel sx={{ color: COLORS.neutral[600] }}>Category</InputLabel>
          <Select
            value={filters.category}
            onChange={(e) => onFilterChange("category", e.target.value)}
            label="Category"
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value="all">All Categories</MenuItem>
            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
              <MenuItem key={key} value={key}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box sx={{ color: config.color }}>{config.icon}</Box>
                  <span>{config.label}</span>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel sx={{ color: COLORS.neutral[600] }}>Status</InputLabel>
          <Select
            value={filters.status}
            onChange={(e) => onFilterChange("status", e.target.value)}
            label="Status"
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value="all">All Status</MenuItem>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <MenuItem key={key} value={key}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box sx={{ color: config.color }}>{config.icon}</Box>
                  <span>{config.label}</span>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel sx={{ color: COLORS.neutral[600] }}>Period</InputLabel>
          <Select
            value={filters.period}
            onChange={(e) => onFilterChange("period", e.target.value)}
            label="Period"
            sx={{ borderRadius: 2 }}
          >
            {TIME_PERIODS.map((period) => (
              <MenuItem key={period.value} value={period.value}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box sx={{ color: COLORS.neutral[600] }}>{period.icon}</Box>
                  <span>{period.label}</span>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {filters.period === "custom" && (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={filters.startDate}
              onChange={(date) => onFilterChange("startDate", date)}
              slotProps={{ 
                textField: { 
                  size: "small", 
                  fullWidth: true,
                  sx: { borderRadius: 2 }
                } 
              }}
            />
            <DatePicker
              label="End Date"
              value={filters.endDate}
              onChange={(date) => onFilterChange("endDate", date)}
              slotProps={{ 
                textField: { 
                  size: "small", 
                  fullWidth: true,
                  sx: { borderRadius: 2 }
                } 
              }}
            />
          </LocalizationProvider>
        )}

        <Box display="flex" gap={2} mt={2}>
          <Button 
            fullWidth 
            variant="outlined" 
            onClick={onReset} 
            startIcon={<Refresh />}
            sx={{ 
              borderRadius: 2,
              textTransform: "none",
              borderColor: COLORS.neutral[300],
              color: COLORS.neutral[700],
              "&:hover": {
                borderColor: COLORS.neutral[400],
                bgcolor: COLORS.neutral[50],
              },
            }}
          >
            Reset
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={onClose}
            sx={{ 
              borderRadius: 2,
              textTransform: "none",
              bgcolor: COLORS.primary.main,
              "&:hover": { bgcolor: COLORS.primary.dark },
            }}
          >
            Apply
          </Button>
        </Box>
      </Stack>
    </Box>
  </Drawer>
);

// Expense Modal Component
const ExpenseModal = ({
  open,
  onClose,
  onSubmit,
  formData,
  setFormData,
  selectedExpense,
  loading,
  handleFileSelect,
  filePreview,
  selectedFile,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: { 
          timeout: 500,
          sx: { bgcolor: alpha(COLORS.neutral[900], 0.5) }
        },
      }}
    >
      <Fade in={open}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: isMobile ? "95%" : 550,
            maxHeight: "90vh",
            overflow: "auto",
            bgcolor: "white",
            borderRadius: 3,
            boxShadow: 24,
            p: 3,
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight="600" sx={{ color: COLORS.neutral[800] }}>
              {selectedExpense ? "Edit Expense" : "Create New Expense"}
            </Typography>
            <IconButton onClick={onClose} sx={{ color: COLORS.neutral[500] }}>
              <Close />
            </IconButton>
          </Box>

          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              size="small"
              required
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
                "& .MuiInputLabel-root": { color: COLORS.neutral[600] },
              }}
            />

            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              size="small"
              required
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
                "& .MuiInputLabel-root": { color: COLORS.neutral[600] },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoney sx={{ fontSize: 18, color: COLORS.neutral[500] }} />
                  </InputAdornment>
                ),
                inputProps: { min: 0, step: 1 },
              }}
            />

            <FormControl fullWidth size="small" required>
              <InputLabel sx={{ color: COLORS.neutral[600] }}>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                label="Category"
                sx={{ borderRadius: 2 }}
              >
                {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                  <MenuItem key={key} value={key}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Box sx={{ color: config.color }}>{config.icon}</Box>
                      <span>{config.label}</span>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              size="small"
              placeholder="Add additional details..."
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
                "& .MuiInputLabel-root": { color: COLORS.neutral[600] },
              }}
            />

            <Box>
              <Typography variant="subtitle2" gutterBottom fontWeight="500" sx={{ color: COLORS.neutral[700] }}>
                Location (Optional)
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Latitude"
                    type="number"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    size="small"
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    InputProps={{ inputProps: { step: 0.000001, min: -90, max: 90 } }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Longitude"
                    type="number"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    size="small"
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    InputProps={{ inputProps: { step: 0.000001, min: -180, max: 180 } }}
                  />
                </Grid>
              </Grid>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom fontWeight="500" sx={{ color: COLORS.neutral[700] }}>
                Bill Attachment
              </Typography>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUpload />}
                fullWidth
                sx={{ 
                  py: 1.5, 
                  borderRadius: 2,
                  textTransform: "none",
                  borderColor: COLORS.neutral[300],
                  color: COLORS.neutral[700],
                  "&:hover": {
                    borderColor: COLORS.primary.main,
                    bgcolor: alpha(COLORS.primary.main, 0.05),
                  },
                }}
              >
                Upload File
                <input type="file" hidden accept="image/*,.pdf" onChange={handleFileSelect} />
              </Button>

              {(selectedFile || filePreview) && (
                <Alert 
                  severity="info" 
                  sx={{ 
                    mt: 2, 
                    borderRadius: 2,
                    bgcolor: alpha(COLORS.info.main, 0.1),
                    color: COLORS.info.main,
                    "& .MuiAlert-icon": { color: COLORS.info.main },
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    {filePreview ? (
                      <img
                        src={filePreview}
                        alt="Preview"
                        style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6 }}
                      />
                    ) : (
                      <AttachFile sx={{ fontSize: 20 }} />
                    )}
                    <Typography variant="body2" noWrap sx={{ color: COLORS.neutral[700] }}>
                      {selectedFile?.name || "File selected"}
                    </Typography>
                  </Box>
                </Alert>
              )}
            </Box>
          </Stack>

          <Box display="flex" gap={2} justifyContent="flex-end" mt={4}>
            <Button 
              onClick={onClose} 
              disabled={loading}
              sx={{ 
                borderRadius: 2,
                textTransform: "none",
                color: COLORS.neutral[700],
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={onSubmit}
              disabled={!formData.title || !formData.amount || !formData.category || loading}
              variant="contained"
              sx={{ 
                borderRadius: 2,
                textTransform: "none",
                bgcolor: COLORS.primary.main,
                "&:hover": { bgcolor: COLORS.primary.dark },
                "&.Mui-disabled": {
                  bgcolor: COLORS.neutral[300],
                },
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : selectedExpense ? "Update" : "Create"}
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

// View Expense Modal
const ViewExpenseModal = ({ open, onClose, expense }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!expense) return null;

  const status = expense.status || "Pending";
  const category = expense.category || "Miscellaneous";
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
  const categoryConfig = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.Miscellaneous;

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{ 
        backdrop: { 
          timeout: 500,
          sx: { bgcolor: alpha(COLORS.neutral[900], 0.5) }
        } 
      }}
    >
      <Fade in={open}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: isMobile ? "95%" : 600,
            maxHeight: "90vh",
            overflow: "auto",
            bgcolor: "white",
            borderRadius: 1,
            boxShadow: 24,
            p: 3,
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight="600" sx={{ color: COLORS.neutral[800] }}>
              Expense Details
            </Typography>
            <IconButton onClick={onClose} sx={{ color: COLORS.neutral[500] }}>
              <Close />
            </IconButton>
          </Box>

          <Stack spacing={3}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="h5" fontWeight="700" sx={{ color: COLORS.neutral[800] }} gutterBottom>
                  {expense.title}
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  <Chip
                    size="small"
                    label={categoryConfig.label}
                    sx={{
                      bgcolor: alpha(categoryConfig.color, 0.1),
                      color: categoryConfig.color,
                      fontWeight: 500,
                      borderRadius: 2,
                      border: `1px solid ${alpha(categoryConfig.color, 0.2)}`,
                    }}
                  />
                  <Chip
                    size="small"
                    label={statusConfig.label}
                    icon={statusConfig.icon}
                    sx={{
                      bgcolor: statusConfig.bg,
                      color: statusConfig.color,
                      fontWeight: 500,
                      borderRadius: 2,
                      border: `1px solid ${alpha(statusConfig.color, 0.2)}`,
                      "& .MuiChip-icon": { color: statusConfig.color },
                    }}
                  />
                </Box>
              </Box>
              <Typography variant="h4" fontWeight="700" sx={{ color: COLORS.primary.main }}>
                ₹{expense.amount?.toLocaleString()}
              </Typography>
            </Box>

            <Divider sx={{ borderColor: COLORS.neutral[200] }} />

            {/* Details Grid */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" fontWeight="500" color={COLORS.neutral[600]} gutterBottom>
                  Date
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <CalendarToday sx={{ fontSize: 16, color: COLORS.primary.main }} />
                  <Typography sx={{ color: COLORS.neutral[800] }}>
                    {format(parseISO(expense.createdAt), "MMMM dd, yyyy")}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" fontWeight="500" color={COLORS.neutral[600]} gutterBottom>
                  Created By
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar 
                    sx={{ 
                      width: 28, 
                      height: 28, 
                      bgcolor: COLORS.neutral[500],
                      borderRadius: 2,
                      fontSize: "0.75rem"
                    }}
                  >
                    {expense.createdBy?.name?.charAt(0) || expense.createdBy?.email?.charAt(0) || "U"}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight="500" sx={{ color: COLORS.neutral[800] }}>
                      {expense.createdBy?.name || "Unknown"}
                    </Typography>
                    <Typography variant="caption" color={COLORS.neutral[500]}>
                      {expense.createdBy?.email}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {expense.description && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" fontWeight="500" color={COLORS.neutral[600]} gutterBottom>
                    Description
                  </Typography>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      borderRadius: 2,
                      borderColor: COLORS.neutral[200],
                      bgcolor: COLORS.neutral[50],
                    }}
                  >
                    <Typography sx={{ color: COLORS.neutral[700] }}>{expense.description}</Typography>
                  </Paper>
                </Grid>
              )}

              {expense.location && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" fontWeight="500" color={COLORS.neutral[600]} gutterBottom>
                    Location
                  </Typography>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      borderRadius: 2,
                      borderColor: COLORS.neutral[200],
                      bgcolor: COLORS.neutral[50],
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <LocationOn sx={{ fontSize: 18, color: COLORS.primary.main }} />
                      <Typography sx={{ color: COLORS.neutral[700] }}>
                        {expense.location.address ||
                          `Lat: ${expense.location.lat?.toFixed(6)}, Lng: ${expense.location.lng?.toFixed(6)}`}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              )}

              {expense.billAttachment && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" fontWeight="500" color={COLORS.neutral[600]} gutterBottom>
                    Bill Attachment
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AttachFile />}
                    onClick={() => window.open(expense.billAttachment, "_blank")}
                    fullWidth
                    sx={{ 
                      mt: 0.5, 
                      py: 1.5, 
                      borderRadius: 2,
                      textTransform: "none",
                      borderColor: COLORS.neutral[300],
                      color: COLORS.neutral[700],
                      "&:hover": {
                        borderColor: COLORS.primary.main,
                        bgcolor: alpha(COLORS.primary.main, 0.05),
                      },
                    }}
                  >
                    View Bill
                  </Button>
                </Grid>
              )}

              {expense.rejectionReason && (
                <Grid item xs={12}>
                  <Alert 
                    severity="error" 
                    sx={{ 
                      borderRadius: 2,
                      bgcolor: alpha(COLORS.error.main, 0.1),
                      "& .MuiAlert-icon": { color: COLORS.error.main },
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight="600" sx={{ color: COLORS.error.main }}>
                      Rejection Reason
                    </Typography>
                    <Typography variant="body2" sx={{ color: COLORS.error.main }}>
                      {expense.rejectionReason}
                    </Typography>
                  </Alert>
                </Grid>
              )}

              {expense.approvedBy && (
                <Grid item xs={12}>
                  <Alert 
                    severity="success" 
                    sx={{ 
                      borderRadius: 2,
                      bgcolor: alpha(COLORS.success.main, 0.1),
                      "& .MuiAlert-icon": { color: COLORS.success.main },
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight="600" sx={{ color: COLORS.success.main }}>
                      Approved By
                    </Typography>
                    <Typography variant="body2" sx={{ color: COLORS.success.main }}>
                      {expense.approvedBy?.name || "Unknown"} on{" "}
                      {expense.approvedAt && format(parseISO(expense.approvedAt), "MMM dd, yyyy")}
                    </Typography>
                    {expense.approverRemarks && (
                      <Typography variant="body2" sx={{ color: COLORS.success.main, mt: 0.5 }}>
                        Remarks: {expense.approverRemarks}
                      </Typography>
                    )}
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Stack>

          <Box display="flex" justifyContent="flex-end" mt={4}>
            <Button 
              onClick={onClose} 
              variant="contained"
              sx={{ 
                borderRadius: 2,
                textTransform: "none",
                bgcolor: COLORS.primary.main,
                "&:hover": { bgcolor: COLORS.primary.dark },
              }}
            >
              Close
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

// User Summary Modal
const UserSummaryModal = ({ open, onClose, userId, userName }) => {
  const { fetchAPI } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState("month");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const fetchSummary = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await fetchAPI(`/expense/user/${userId}/summary?period=${period}`);
      if (response?.success) {
        setSummary(response.result);
      }
    } catch (error) {
      console.error("Error fetching summary:", error);
    } finally {
      setLoading(false);
    }
  }, [userId, period, fetchAPI]);

  useEffect(() => {
    if (open) {
      fetchSummary();
    }
  }, [open, period, fetchSummary]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{ 
        backdrop: { 
          timeout: 500,
          sx: { bgcolor: alpha(COLORS.neutral[900], 0.5) }
        } 
      }}
    >
      <Fade in={open}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: isMobile ? "95%" : 600,
            maxHeight: "90vh",
            overflow: "auto",
            bgcolor: "white",
            borderRadius: 1,
            boxShadow: 24,
            p: 3,
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
              <Typography variant="h6" fontWeight="600" sx={{ color: COLORS.neutral[800] }}>
                Expense Summary
              </Typography>
              <Typography variant="body2" color={COLORS.neutral[600]}>
                {userName || "User"}
              </Typography>
            </Box>
            <IconButton onClick={onClose} sx={{ color: COLORS.neutral[500] }}>
              <Close />
            </IconButton>
          </Box>

          <Box mb={3}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: COLORS.neutral[600] }}>Period</InputLabel>
              <Select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                label="Period"
                sx={{ borderRadius: 2 }}
              >
                {TIME_PERIODS.map((p) => (
                  <MenuItem key={p.value} value={p.value}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box sx={{ color: COLORS.neutral[600] }}>{p.icon}</Box>
                      <span>{p.label}</span>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {loading ? (
            <Box textAlign="center" py={4}>
              <CircularProgress sx={{ color: COLORS.primary.main }} />
            </Box>
          ) : summary ? (
            <Stack spacing={3}>
              {/* Stats Cards */}
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Card sx={{ 
                    p: 2, 
                    textAlign: "center", 
                    borderRadius: 2,
                    border: `1px solid ${COLORS.neutral[200]}`,
                  }}>
                    <ReceiptLong sx={{ fontSize: 24, color: COLORS.primary.main, mb: 1 }} />
                    <Typography variant="h6" fontWeight="700" sx={{ color: COLORS.neutral[800] }}>
                      {summary.summary?.totalExpenses || 0}
                    </Typography>
                    <Typography variant="caption" color={COLORS.neutral[500]}>
                      Total
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={4}>
                  <Card sx={{ 
                    p: 2, 
                    textAlign: "center", 
                    borderRadius: 2,
                    border: `1px solid ${COLORS.neutral[200]}`,
                  }}>
                    <AttachMoney sx={{ fontSize: 24, color: COLORS.success.main, mb: 1 }} />
                    <Typography variant="h6" fontWeight="700" sx={{ color: COLORS.neutral[800] }}>
                      ₹{(summary.summary?.totalAmount || 0).toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color={COLORS.neutral[500]}>
                      Amount
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={4}>
                  <Card sx={{ 
                    p: 2, 
                    textAlign: "center", 
                    borderRadius: 2,
                    border: `1px solid ${COLORS.neutral[200]}`,
                  }}>
                    <TrendingUp sx={{ fontSize: 24, color: COLORS.info.main, mb: 1 }} />
                    <Typography variant="h6" fontWeight="700" sx={{ color: COLORS.neutral[800] }}>
                      ₹{(summary.summary?.averageAmount || 0).toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color={COLORS.neutral[500]}>
                      Average
                    </Typography>
                  </Card>
                </Grid>
              </Grid>

              {/* Status Breakdown */}
              <Box>
                <Typography variant="subtitle2" fontWeight="600" sx={{ color: COLORS.neutral[800], mb: 2 }}>
                  By Status
                </Typography>
                <Stack spacing={1}>
                  {Object.entries(summary.summary?.byStatus || {}).map(([status, data]) => (
                    <Box
                      key={status}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: STATUS_CONFIG[status]?.bg || COLORS.neutral[100],
                        border: `1px solid ${alpha(STATUS_CONFIG[status]?.color || COLORS.neutral[400], 0.2)}`,
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center" gap={1}>
                          {STATUS_CONFIG[status]?.icon}
                          <Typography variant="body2" fontWeight="500" sx={{ color: STATUS_CONFIG[status]?.color }}>
                            {status}
                          </Typography>
                        </Box>
                        <Box textAlign="right">
                          <Typography variant="body2" fontWeight="600" sx={{ color: COLORS.neutral[800] }}>
                            {data.count} items
                          </Typography>
                          <Typography variant="caption" color={COLORS.neutral[600]}>
                            ₹{data.total.toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Box>

              {/* Category Breakdown */}
              <Box>
                <Typography variant="subtitle2" fontWeight="600" sx={{ color: COLORS.neutral[800], mb: 2 }}>
                  By Category
                </Typography>
                <Stack spacing={1}>
                  {Object.entries(summary.summary?.byCategory || {}).map(([category, data]) => (
                    <Box
                      key={category}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: CATEGORY_CONFIG[category]?.bg || COLORS.neutral[100],
                        border: `1px solid ${alpha(CATEGORY_CONFIG[category]?.color || COLORS.neutral[400], 0.2)}`,
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box sx={{ color: CATEGORY_CONFIG[category]?.color }}>
                            {CATEGORY_CONFIG[category]?.icon}
                          </Box>
                          <Typography variant="body2" fontWeight="500" sx={{ color: COLORS.neutral[800] }}>
                            {CATEGORY_CONFIG[category]?.label || category}
                          </Typography>
                        </Box>
                        <Box textAlign="right">
                          <Typography variant="body2" fontWeight="600" sx={{ color: COLORS.neutral[800] }}>
                            {data.count} items
                          </Typography>
                          <Typography variant="caption" color={COLORS.neutral[600]}>
                            ₹{data.total.toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Box>

              {/* Recent Expenses */}
              {summary.recentExpenses?.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" fontWeight="600" sx={{ color: COLORS.neutral[800], mb: 2 }}>
                    Recent Expenses
                  </Typography>
                  <Stack spacing={1}>
                    {summary.recentExpenses.slice(0, 5).map((exp) => (
                      <Paper
                        key={exp._id}
                        variant="outlined"
                        sx={{ 
                          p: 1.5, 
                          borderRadius: 2,
                          borderColor: COLORS.neutral[200],
                        }}
                      >
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="body2" fontWeight="600" sx={{ color: COLORS.neutral[800] }}>
                              {exp.title}
                            </Typography>
                            <Typography variant="caption" color={COLORS.neutral[500]}>
                              {CATEGORY_CONFIG[exp.category]?.label || exp.category} • {format(parseISO(exp.expenseDate), "MMM dd")}
                            </Typography>
                          </Box>
                          <Typography fontWeight="600" sx={{ color: COLORS.primary.main }}>
                            ₹{exp.amount?.toLocaleString()}
                          </Typography>
                        </Box>
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          ) : (
            <Alert 
              severity="info" 
              sx={{ 
                borderRadius: 2,
                bgcolor: alpha(COLORS.info.main, 0.1),
                "& .MuiAlert-icon": { color: COLORS.info.main },
              }}
            >
              No summary data available
            </Alert>
          )}
        </Box>
      </Fade>
    </Modal>
  );
};

// Main Component
export default function ExpensesPage() {
  const { user, fetchAPI, isAuthenticated, safeFetchAPI } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const navigate = useNavigate();

  // State Management
  const [activeTab, setActiveTab] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState({
    byStatus: [],
    totals: { totalExpenses: 0, grandTotal: 0 },
  });
  const [loading, setLoading] = useState({
    expenses: true,
    stats: true,
    action: false,
  });
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    category: "all",
    period: "month",
    startDate: null,
    endDate: null,
    sortBy: "-createdAt",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: isMobile ? 5 : 10,
    totalPages: 1,
    totalItems: 0,
  });

  // UI States
  const [openFilterDrawer, setOpenFilterDrawer] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openUserSummaryModal, setOpenUserSummaryModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionType, setActionType] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedExpenseForMenu, setSelectedExpenseForMenu] = useState(null);
  const [viewMode, setViewMode] = useState(isMobile ? "card" : "table");
  const [navValue, setNavValue] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    description: "",
    latitude: "",
    longitude: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  // Feedback
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Permissions
  const userRole = user?.role || "";
  const canCreate = ["TEAM", "ASM", "ZSM", "Head_office"].includes(userRole);
  const canEdit = ["TEAM", "ASM", "ZSM", "Head_office"].includes(userRole);
  const canDelete = userRole === "Head_office";
  const canUpdateStatus = ["ASM", "ZSM", "Head_office"].includes(userRole);
  const canViewSummary = ["ASM", "ZSM", "Head_office"].includes(userRole);

  // Tabs
  const tabs = [
    { label: "All", value: "all", icon: <ReceiptLong /> },
    { label: "Pending", value: "Pending", icon: <PendingActions /> },
    { label: "Approved", value: "Approved", icon: <CheckCircle /> },
    { label: "Rejected", value: "Rejected", icon: <Cancel /> },
  ];

  // Fetch Expenses
  const fetchExpenses = useCallback(async () => {
    if (!isAuthenticated()) return;

    try {
      setLoading(prev => ({ ...prev, expenses: true }));

      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.status !== "all" && { status: filters.status }),
        ...(filters.category !== "all" && { category: filters.category }),
        ...(filters.period !== "custom" && filters.period !== "all" && { period: filters.period }),
        ...(filters.startDate && filters.endDate && filters.period === "custom" && {
          startDate: filters.startDate.toISOString(),
          endDate: filters.endDate.toISOString(),
        }),
        sortBy: filters.sortBy.replace("-", ""),
        sortOrder: filters.sortBy.startsWith("-") ? "desc" : "asc",
      });

      const response = await safeFetchAPI(`/expense/getAll?${params}`);

      if (response?.success) {
        setExpenses(response.result.expenses || []);
        setPagination(prev => ({
          ...prev,
          totalPages: response.result.pagination?.totalPages || 1,
          totalItems: response.result.pagination?.total || 0,
        }));
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
      showSnackbar("Failed to fetch expenses", "error");
    } finally {
      setLoading(prev => ({ ...prev, expenses: false }));
    }
  }, [isAuthenticated, safeFetchAPI, pagination.page, pagination.limit, filters]);

  // Fetch Stats
  const fetchStats = useCallback(async () => {
    if (!isAuthenticated()) return;

    try {
      setLoading(prev => ({ ...prev, stats: true }));
      const response = await safeFetchAPI(`/expense/stats?period=${filters.period}`);
      if (response?.success) {
        setStats(response.result || { byStatus: [], totals: { totalExpenses: 0, grandTotal: 0 } });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  }, [isAuthenticated, safeFetchAPI, filters.period]);

  // File Selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => setFilePreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  // Form Submit
  const handleSubmit = async () => {
    if (!isAuthenticated() || !canCreate) return;

    if (!formData.title || !formData.amount || !formData.category) {
      showSnackbar("Please fill all required fields", "error");
      return;
    }

    try {
      setLoading(prev => ({ ...prev, action: true }));

      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("amount", parseFloat(formData.amount));
      submitData.append("category", formData.category);
      submitData.append("description", formData.description || "");

      if (formData.latitude && formData.longitude) {
        submitData.append("latitude", formData.latitude);
        submitData.append("longitude", formData.longitude);
      }

      if (selectedFile) {
        submitData.append("billAttachment", selectedFile);
      }

      const endpoint = selectedExpense ? `/expense/update/${selectedExpense._id}` : "/expense/create";
      const method = selectedExpense ? "PUT" : "POST";

      const response = await fetchAPI(endpoint, {
        method,
        body: submitData,
        headers: {},
      });

      if (response?.success) {
        showSnackbar(
          selectedExpense ? "Expense updated successfully" : "Expense created successfully",
          "success"
        );
        setOpenModal(false);
        resetForm();
        fetchExpenses();
        fetchStats();
      } else {
        throw new Error(response?.message || "Operation failed");
      }
    } catch (error) {
      console.error("Error saving expense:", error);
      showSnackbar(error.message || "Operation failed", "error");
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  // Status Update (Approve/Reject)
  const handleStatusUpdate = async () => {
    if (!isAuthenticated() || !canUpdateStatus || !selectedExpense) return;

    try {
      setLoading(prev => ({ ...prev, action: true }));

      const endpoint = actionType === "approve"
        ? `/expense/approve/${selectedExpense._id}`
        : `/expense/reject/${selectedExpense._id}`;

      const body = actionType === "reject"
        ? { reason: "Rejected by approver" }
        : { remarks: "Approved" };

      const response = await fetchAPI(endpoint, {
        method: "PUT",
        body: JSON.stringify(body),
      });

      if (response?.success) {
        showSnackbar(`Expense ${actionType}d successfully`, "success");
        setOpenApproveDialog(false);
        setSelectedExpense(null);
        setActionType("");
        fetchExpenses();
        fetchStats();
      } else {
        throw new Error(response?.message || `${actionType} failed`);
      }
    } catch (error) {
      console.error(`Error ${actionType}ing expense:`, error);
      showSnackbar(error.message || `${actionType} failed`, "error");
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  // Delete Expense
  const handleDelete = async () => {
    if (!isAuthenticated() || !canDelete || !selectedExpense) return;

    try {
      setLoading(prev => ({ ...prev, action: true }));

      const response = await fetchAPI(`/expense/delete/${selectedExpense._id}`, {
        method: "DELETE",
      });

      if (response?.success) {
        showSnackbar("Expense deleted successfully", "success");
        setOpenDeleteDialog(false);
        setSelectedExpense(null);
        fetchExpenses();
        fetchStats();
      } else {
        throw new Error(response?.message || "Delete failed");
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      showSnackbar(error.message || "Delete failed", "error");
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  // Edit Handler
  const handleEdit = (expense) => {
    if (!canEdit) return;

    const isOwnExpense = expense.createdBy?._id === user?._id;
    const isPending = expense.status === "Pending";

    if (userRole !== "Head_office" && !isOwnExpense) {
      showSnackbar("You can only edit your own expenses", "error");
      return;
    }

    if (!isPending) {
      showSnackbar("Only pending expenses can be edited", "error");
      return;
    }

    setSelectedExpense(expense);
    setFormData({
      title: expense.title || "",
      amount: expense.amount?.toString() || "",
      category: expense.category || "",
      description: expense.description || "",
      latitude: expense.location?.lat || "",
      longitude: expense.location?.lng || "",
    });
    setSelectedFile(null);
    setFilePreview(expense.billAttachment || null);
    setOpenModal(true);
  };

  // Menu Handlers
  const handleMenuOpen = (event, expense) => {
    setAnchorEl(event.currentTarget);
    setSelectedExpenseForMenu(expense);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedExpenseForMenu(null);
  };

  const handleMenuAction = (action) => {
    handleMenuClose();
    
    if (action === "view") {
      setSelectedExpense(selectedExpenseForMenu);
      setOpenViewModal(true);
    } else if (action === "edit") {
      handleEdit(selectedExpenseForMenu);
    } else if (action === "approve") {
      setSelectedExpense(selectedExpenseForMenu);
      setActionType("approve");
      setOpenApproveDialog(true);
    } else if (action === "reject") {
      setSelectedExpense(selectedExpenseForMenu);
      setActionType("reject");
      setOpenApproveDialog(true);
    } else if (action === "delete") {
      setSelectedExpense(selectedExpenseForMenu);
      setOpenDeleteDialog(true);
    } else if (action === "userSummary") {
      setSelectedUser({
        id: selectedExpenseForMenu?.createdBy?._id,
        name: selectedExpenseForMenu?.createdBy?.name,
        email: selectedExpenseForMenu?.createdBy?.email,
      });
      setOpenUserSummaryModal(true);
    }
  };

  // Helper Functions
  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      amount: "",
      category: "",
      description: "",
      latitude: "",
      longitude: "",
    });
    setSelectedFile(null);
    setFilePreview(null);
    setSelectedExpense(null);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      status: "all",
      category: "all",
      period: "month",
      startDate: null,
      endDate: null,
      sortBy: "-createdAt",
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    setOpenFilterDrawer(false);
  };

  // Initial Data Fetch
  useEffect(() => {
    if (isAuthenticated()) {
      fetchExpenses();
      fetchStats();
    }
  }, [isAuthenticated, fetchExpenses, fetchStats]);

  // Update on Filter Change
  useEffect(() => {
    if (isAuthenticated()) {
      fetchExpenses();
    }
  }, [filters.period, filters.status, filters.category, filters.sortBy, pagination.page, pagination.limit]);

  // Calculate Display Stats
  const displayStats = useMemo(() => {
    const totalExpenses = expenses.length;
    const totalAmount = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const approvedCount = expenses.filter(exp => exp.status === "Approved").length;
    const pendingCount = expenses.filter(exp => exp.status === "Pending").length;
    const approvedAmount = expenses
      .filter(exp => exp.status === "Approved")
      .reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const pendingAmount = expenses
      .filter(exp => exp.status === "Pending")
      .reduce((sum, exp) => sum + (exp.amount || 0), 0);

    return { totalExpenses, totalAmount, approvedCount, pendingCount, approvedAmount, pendingAmount };
  }, [expenses]);

  return (
    <Box sx={{ minHeight: "100vh", marginLeft:"15px" }}>
      {/* Header */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "white",
          borderBottom: `1px solid ${COLORS.neutral[200]}`,
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton edge="start" sx={{ mr: 2, color: COLORS.neutral[700] }}>
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              color: COLORS.primary.main,
            }}
          >
            Expenses
          </Typography>

          {!isMobile && (
            <Box display="flex" gap={2}>
              {canViewSummary && (
                <Button
                  variant="outlined"
                  startIcon={<Person />}
                  onClick={() => setSelectedUser({ id: user?._id, name: user?.name })}
                  sx={{ 
                    borderRadius: 1,
                    textTransform: "none",
                    borderColor: COLORS.neutral[300],
                    color: COLORS.neutral[700],
                    "&:hover": {
                      borderColor: COLORS.primary.main,
                      bgcolor: alpha(COLORS.primary.main, 0.05),
                    },
                  }}
                >
                  My Summary
                </Button>
              )}
              
              {canCreate && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => {
                    resetForm();
                    setOpenModal(true);
                  }}
                  sx={{
                    borderRadius: 1,
                    textTransform: "none",
                    bgcolor: COLORS.primary.main,
                    "&:hover": { bgcolor: COLORS.primary.dark },
                  }}
                >
                  New Expense
                </Button>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 3, px: isMobile ? 2 : 3 }}>
        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={6} md={3}>
            <StatCard
              icon={<ReceiptLong sx={{ fontSize: 24 }} />}
              title="Total Expenses"
              value={displayStats.totalExpenses}
              color={COLORS.primary.main}
            />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <StatCard
              icon={<CheckCircle sx={{ fontSize: 24 }} />}
              title="Approved"
              value={displayStats.approvedCount}
              color={COLORS.success.main}
            />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <StatCard
              icon={<PendingActions sx={{ fontSize: 24 }} />}
              title="Pending"
              value={displayStats.pendingCount}
              color={COLORS.warning.main}
            />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <StatCard
              icon={<TrendingUp sx={{ fontSize: 24 }} />}
              title="Average"
              value={expenses.length ? `₹${(displayStats.totalAmount / expenses.length).toFixed(0)}` : "₹0"}
              color={COLORS.info.main}
            />
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper sx={{ borderRadius: 3, mb: 2, overflow: "hidden", border: `1px solid ${COLORS.neutral[200]}` }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => {
              setActiveTab(newValue);
              handleFilterChange("status", tabs[newValue].value !== "all" ? tabs[newValue].value : "all");
            }}
            variant={isMobile ? "scrollable" : "fullWidth"}
            scrollButtons={isMobile}
            allowScrollButtonsMobile
            sx={{
              minHeight: 56,
              "& .MuiTabs-indicator": { bgcolor: COLORS.primary.main },
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                minHeight: 56,
                fontSize: isMobile ? "0.875rem" : "1rem",
                color: COLORS.neutral[600],
                "&.Mui-selected": {
                  color: COLORS.primary.main,
                },
              },
            }}
          >
            {tabs.map((tab, index) => (
              <Tab key={index} icon={tab.icon} iconPosition="start" label={tab.label} />
            ))}
          </Tabs>
        </Paper>

        {/* Search and Filter Bar */}
        <Paper sx={{ 
          p: 2, 
          borderRadius: 2, 
          mb: 2,
          border: `1px solid ${COLORS.neutral[200]}`,
        }}>
          <Box display="flex" gap={1}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search expenses..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ fontSize: 20, color: COLORS.neutral[400] }} />
                  </InputAdornment>
                ),
                endAdornment: filters.search && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => handleFilterChange("search", "")}>
                      <Close sx={{ fontSize: 16, color: COLORS.neutral[400] }} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {!isMobile ? (
              <>
                <FormControl size="small" sx={{ minWidth: 130 }}>
                  <InputLabel sx={{ color: COLORS.neutral[600] }}>Category</InputLabel>
                  <Select
                    value={filters.category}
                    onChange={(e) => handleFilterChange("category", e.target.value)}
                    label="Category"
                    sx={{ borderRadius: 1 }}
                  >
                    <MenuItem value="all">All Categories</MenuItem>
                    {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                      <MenuItem key={key} value={key}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box sx={{ color: config.color }}>{config.icon}</Box>
                          <span>{config.label}</span>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 130 }}>
                  <InputLabel sx={{ color: COLORS.neutral[600] }}>Period</InputLabel>
                  <Select
                    value={filters.period}
                    onChange={(e) => handleFilterChange("period", e.target.value)}
                    label="Period"
                    sx={{ borderRadius: 1 }}
                  >
                    {TIME_PERIODS.map((p) => (
                      <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                    displayEmpty
                    sx={{ borderRadius: 1 }}
                  >
                    <MenuItem value="-createdAt">Newest First</MenuItem>
                    <MenuItem value="createdAt">Oldest First</MenuItem>
                    <MenuItem value="-amount">Highest Amount</MenuItem>
                    <MenuItem value="amount">Lowest Amount</MenuItem>
                  </Select>
                </FormControl>

                <Tooltip title={viewMode === "table" ? "Card View" : "Table View"}>
                  <IconButton
                    onClick={() => setViewMode(viewMode === "table" ? "card" : "table")}
                    sx={{ 
                      border: `1px solid ${COLORS.neutral[300]}`,
                      borderRadius: 1,
                      color: COLORS.neutral[700],
                      "&:hover": {
                        borderColor: COLORS.primary.main,
                        bgcolor: alpha(COLORS.primary.main, 0.05),
                      },
                    }}
                  >
                    {viewMode === "table" ? <GridView /> : <ViewList />}
                  </IconButton>
                </Tooltip>

                <Tooltip title="Reset Filters">
                  <IconButton
                    onClick={handleResetFilters}
                    sx={{ 
                      border: `1px solid ${COLORS.neutral[300]}`,
                      borderRadius: 1,
                      color: COLORS.neutral[700],
                      "&:hover": {
                        borderColor: COLORS.primary.main,
                        bgcolor: alpha(COLORS.primary.main, 0.05),
                      },
                    }}
                  >
                    <Refresh />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <>
                <Button
                  variant="outlined"
                  startIcon={<FilterList />}
                  onClick={() => setOpenFilterDrawer(true)}
                  sx={{ 
                    minWidth: "auto", 
                    px: 2,
                    borderRadius: 1,
                    textTransform: "none",
                    borderColor: COLORS.neutral[300],
                    color: COLORS.neutral[700],
                    "&:hover": {
                      borderColor: COLORS.primary.main,
                      bgcolor: alpha(COLORS.primary.main, 0.05),
                    },
                  }}
                >
                  Filter
                </Button>
                <IconButton
                  onClick={() => setViewMode(viewMode === "table" ? "card" : "table")}
                  sx={{ 
                    border: `1px solid ${COLORS.neutral[300]}`,
                    borderRadius: 2,
                    color: COLORS.neutral[700],
                    "&:hover": {
                      borderColor: COLORS.primary.main,
                      bgcolor: alpha(COLORS.primary.main, 0.05),
                    },
                  }}
                >
                  {viewMode === "table" ? <GridView /> : <ViewList />}
                </IconButton>
              </>
            )}
          </Box>
        </Paper>

        {/* Content */}
        {loading.expenses ? (
          <Box>
            {[...Array(3)].map((_, i) => (
              <ExpenseCardSkeleton key={i} />
            ))}
          </Box>
        ) : expenses.length === 0 ? (
          <Paper sx={{ 
            p: 6, 
            borderRadius: 3, 
            textAlign: "center",
            border: `1px solid ${COLORS.neutral[200]}`,
          }}>
            <ReceiptLong sx={{ fontSize: 60, color: COLORS.neutral[300], mb: 2 }} />
            <Typography variant="h6" fontWeight="600" sx={{ color: COLORS.neutral[800] }} gutterBottom>
              No expenses found
            </Typography>
            <Typography color={COLORS.neutral[600]} sx={{ mb: 3 }}>
              {filters.search || filters.category !== "all" || filters.status !== "all"
                ? "Try adjusting your filters"
                : canCreate
                  ? "Get started by creating your first expense"
                  : "No expenses available"}
            </Typography>
            {canCreate && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  resetForm();
                  setOpenModal(true);
                }}
                sx={{ 
                  borderRadius: 2,
                  textTransform: "none",
                  bgcolor: COLORS.primary.main,
                  "&:hover": { bgcolor: COLORS.primary.dark },
                }}
              >
                Create Expense
              </Button>
            )}
          </Paper>
        ) : (
          <>
            {isMobile || viewMode === "card" ? (
              <Box>
                {expenses.map((expense) => (
                  <MobileExpenseCard
                    key={expense._id}
                    expense={expense}
                    onMenuOpen={handleMenuOpen}
                    onView={(exp) => {
                      setSelectedExpense(exp);
                      setOpenViewModal(true);
                    }}
                  />
                ))}
              </Box>
            ) : (
              <Paper sx={{ 
                borderRadius: 3, 
                overflow: "hidden",
                border: `1px solid ${COLORS.neutral[200]}`,
              }}>
                <TableContainer>
                  <Table>
                    <TableHead sx={{ bgcolor: COLORS.neutral[50] }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, color: COLORS.neutral[700] }}>Expense</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: COLORS.neutral[700] }}>Amount</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: COLORS.neutral[700] }}>Category</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: COLORS.neutral[700] }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: COLORS.neutral[700] }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: COLORS.neutral[700] }}>Created By</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: COLORS.neutral[700] }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {expenses.map((expense) => (
                        <DesktopTableRow
                          key={expense._id}
                          expense={expense}
                          onMenuOpen={handleMenuOpen}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Box sx={{ 
                mt: 3, 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                flexWrap: "wrap", 
                gap: 2 
              }}>
                <Box display="flex" alignItems="center" gap={2}>
                  {!isMobile && (
                    <FormControl size="small" sx={{ minWidth: 100 }}>
                      <Select
                        value={pagination.limit}
                        onChange={(e) => setPagination(prev => ({ ...prev, limit: e.target.value, page: 1 }))}
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value={5}>5 / page</MenuItem>
                        <MenuItem value={10}>10 / page</MenuItem>
                        <MenuItem value={20}>20 / page</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                  <Typography variant="body2" color={COLORS.neutral[600]}>
                    Showing {(pagination.page - 1) * pagination.limit + 1} -{" "}
                    {Math.min(pagination.page * pagination.limit, pagination.totalItems)} of {pagination.totalItems}
                  </Typography>
                </Box>
                <Pagination
                  count={pagination.totalPages}
                  page={pagination.page}
                  onChange={(e, newPage) => setPagination(prev => ({ ...prev, page: newPage }))}
                  color="primary"
                  shape="rounded"
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    "& .MuiPaginationItem-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Container>

      {/* Mobile FAB */}
      {isMobile && canCreate && (
        <Fab
          color="primary"
          sx={{
            position: "fixed",
            bottom: 20,
            right: 20,
            bgcolor: COLORS.primary.main,
            "&:hover": { bgcolor: COLORS.primary.dark },
          }}
          onClick={() => {
            resetForm();
            setOpenModal(true);
          }}
        >
          <Add />
        </Fab>
      )}

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <Paper sx={{ 
          position: "fixed", 
          bottom: 0, 
          left: 0, 
          right: 0, 
          zIndex: 1000,
          borderTop: `1px solid ${COLORS.neutral[200]}`,
        }} elevation={3}>
          <BottomNavigation
            showLabels
            value={navValue}
            onChange={(event, newValue) => {
              setNavValue(newValue);
              if (newValue === 1 && canViewSummary) {
                setSelectedUser({ id: user?._id, name: user?.name });
                setOpenUserSummaryModal(true);
              }
            }}
            sx={{
              "& .MuiBottomNavigationAction-root": {
                color: COLORS.neutral[500],
                "&.Mui-selected": {
                  color: COLORS.primary.main,
                },
              },
            }}
          >
            <BottomNavigationAction label="Expenses" icon={<ReceiptLong />} />
            <BottomNavigationAction label="Summary" icon={<Person />} />
            <BottomNavigationAction label="Stats" icon={<TrendingUp />} />
          </BottomNavigation>
        </Paper>
      )}

      {/* Drawers and Modals */}
      <FilterDrawer
        open={openFilterDrawer}
        onClose={() => setOpenFilterDrawer(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      <ExpenseModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        selectedExpense={selectedExpense}
        loading={loading.action}
        handleFileSelect={handleFileSelect}
        filePreview={filePreview}
        selectedFile={selectedFile}
      />

      <ViewExpenseModal
        open={openViewModal}
        onClose={() => setOpenViewModal(false)}
        expense={selectedExpense}
      />

      <UserSummaryModal
        open={openUserSummaryModal}
        onClose={() => setOpenUserSummaryModal(false)}
        userId={selectedUser?.id}
        userName={selectedUser?.name}
      />

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{ 
          sx: { 
            borderRadius: 2,
            minWidth: 180,
            border: `1px solid ${COLORS.neutral[200]}`,
          } 
        }}
      >
        <MenuItem onClick={() => handleMenuAction("view")} sx={{ py: 1.5 }}>
          <ListItemIcon><Visibility sx={{ fontSize: 18, color: COLORS.neutral[600] }} /></ListItemIcon>
          <ListItemText sx={{ color: COLORS.neutral[700] }}>View Details</ListItemText>
        </MenuItem>

        {selectedExpenseForMenu?.status === "Pending" && canEdit &&
          (selectedExpenseForMenu.createdBy?._id === user?._id || userRole === "Head_office") && (
            <MenuItem onClick={() => handleMenuAction("edit")} sx={{ py: 1.5 }}>
              <ListItemIcon><Edit sx={{ fontSize: 18, color: COLORS.neutral[600] }} /></ListItemIcon>
              <ListItemText sx={{ color: COLORS.neutral[700] }}>Edit</ListItemText>
            </MenuItem>
          )}

        {canViewSummary && selectedExpenseForMenu?.createdBy?._id && (
          <MenuItem onClick={() => handleMenuAction("userSummary")} sx={{ py: 1.5 }}>
            <ListItemIcon><Person sx={{ fontSize: 18, color: COLORS.neutral[600] }} /></ListItemIcon>
            <ListItemText sx={{ color: COLORS.neutral[700] }}>User Summary</ListItemText>
          </MenuItem>
        )}

        {canUpdateStatus && selectedExpenseForMenu?.status === "Pending" && (
          <>
            <Divider sx={{ borderColor: COLORS.neutral[200] }} />
            <MenuItem onClick={() => handleMenuAction("approve")} sx={{ py: 1.5 }}>
              <ListItemIcon><CheckCircle sx={{ fontSize: 18, color: COLORS.success.main }} /></ListItemIcon>
              <ListItemText sx={{ color: COLORS.success.main }}>Approve</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleMenuAction("reject")} sx={{ py: 1.5 }}>
              <ListItemIcon><Cancel sx={{ fontSize: 18, color: COLORS.error.main }} /></ListItemIcon>
              <ListItemText sx={{ color: COLORS.error.main }}>Reject</ListItemText>
            </MenuItem>
          </>
        )}

        {canDelete && (
          <>
            <Divider sx={{ borderColor: COLORS.neutral[200] }} />
            <MenuItem onClick={() => handleMenuAction("delete")} sx={{ py: 1.5, color: COLORS.error.main }}>
              <ListItemIcon><Delete sx={{ fontSize: 18, color: COLORS.error.main }} /></ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Approve/Reject Dialog */}
      <Dialog 
        open={openApproveDialog} 
        onClose={() => !loading.action && setOpenApproveDialog(false)}
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="600" sx={{ color: COLORS.neutral[800] }}>
            {actionType === "approve" ? "Approve Expense" : "Reject Expense"}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Alert 
            severity={actionType === "approve" ? "info" : "warning"} 
            sx={{ 
              mb: 2, 
              borderRadius: 2,
              bgcolor: actionType === "approve" ? alpha(COLORS.info.main, 0.1) : alpha(COLORS.warning.main, 0.1),
              "& .MuiAlert-icon": { color: actionType === "approve" ? COLORS.info.main : COLORS.warning.main },
            }}
          >
            {actionType === "approve"
              ? "Are you sure you want to approve this expense?"
              : "Are you sure you want to reject this expense?"}
          </Alert>
          {selectedExpense && (
            <Box>
              <Typography variant="subtitle1" fontWeight="600" sx={{ color: COLORS.neutral[800] }}>
                {selectedExpense.title}
              </Typography>
              <Typography variant="h6" fontWeight="700" sx={{ color: COLORS.primary.main, mt: 1 }}>
                ₹{selectedExpense.amount?.toLocaleString()}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={() => setOpenApproveDialog(false)} 
            disabled={loading.action}
            sx={{ 
              borderRadius: 2,
              textTransform: "none",
              color: COLORS.neutral[700],
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleStatusUpdate}
            disabled={loading.action}
            variant="contained"
            sx={{ 
              borderRadius: 2,
              textTransform: "none",
              bgcolor: actionType === "approve" ? COLORS.success.main : COLORS.error.main,
              "&:hover": { 
                bgcolor: actionType === "approve" ? COLORS.success.dark : COLORS.error.dark,
              },
            }}
          >
            {loading.action ? <CircularProgress size={24} sx={{ color: "white" }} /> : actionType === "approve" ? "Approve" : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog 
        open={openDeleteDialog} 
        onClose={() => !loading.action && setOpenDeleteDialog(false)}
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="600" sx={{ color: COLORS.error.main }}>
            Delete Expense
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2, 
              borderRadius: 2,
              bgcolor: alpha(COLORS.error.main, 0.1),
              "& .MuiAlert-icon": { color: COLORS.error.main },
            }}
          >
            This action cannot be undone.
          </Alert>
          {selectedExpense && (
            <Box>
              <Typography variant="subtitle1" fontWeight="600" sx={{ color: COLORS.neutral[800] }}>
                {selectedExpense.title}
              </Typography>
              <Typography variant="h6" fontWeight="700" sx={{ color: COLORS.primary.main, mt: 1 }}>
                ₹{selectedExpense.amount?.toLocaleString()}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={() => setOpenDeleteDialog(false)} 
            disabled={loading.action}
            sx={{ 
              borderRadius: 2,
              textTransform: "none",
              color: COLORS.neutral[700],
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            disabled={loading.action} 
            variant="contained"
            sx={{ 
              borderRadius: 2,
              textTransform: "none",
              bgcolor: COLORS.error.main,
              "&:hover": { bgcolor: COLORS.error.dark },
            }}
          >
            {loading.action ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            width: "100%",
            borderRadius: 2,
            color: "#fff",
            bgcolor: snackbar.severity === "success" ? COLORS.success.main : COLORS.error.main,
            "& .MuiAlert-icon": { color: "#fff" },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}