// pages/ExpensesPage.jsx (Updated with Fuel Auto Calculation)
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
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
  SwipeableDrawer,
  Slide,
  Collapse,
  alpha,
  FormHelperText,
  Radio,
  RadioGroup,
  FormControlLabel,
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
  Person,
  Email,
  Phone,
  Receipt,
  QrCodeScanner,
  Print,
  Share,
  Bookmark,
  BookmarkBorder,
  FilterAlt,
  ExpandMore,
  ExpandLess,
  ViewModule,
  Dashboard as DashboardIcon,
  Schedule,
  FiberManualRecord,
  Clear,
  CurrencyRupee,
  TwoWheeler,
  DirectionsCar,
  EvStation,
  LocalGasStation as FuelIcon,
  Speed,
  Calculate,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import {
  format,
  parseISO,
  isToday,
  isThisWeek,
  isThisMonth,
  isThisYear,
  subWeeks,
  subMonths,
} from "date-fns";
import { useNavigate } from "react-router-dom";

// New Color Theme - Clean and Modern
const COLORS = {
  primary: {
    main: "#4569ea",
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
  },
};

// Fuel Rate Configuration
const FUEL_RATES = {
  Bike: {
    Petrol: 2.5,
    Electric: 0.8,
  },
  Car: {
    Petrol: 4.5,
    Diesel: 4.0,
    CNG: 3.2,
    Electric: 1.2,
  },
};

// Vehicle Types
const VEHICLE_TYPES = [
  { value: "None", label: "Select Vehicle", icon: null },
  { value: "Bike", label: "Bike", icon: <TwoWheeler /> },
  { value: "Car", label: "Car", icon: <DirectionsCar /> },
];

// Fuel Types
const FUEL_TYPES = {
  Bike: [
    { value: "None", label: "Select Fuel" },
    { value: "Petrol", label: "Petrol", icon: <FuelIcon /> },
    { value: "Electric", label: "Electric", icon: <EvStation /> },
  ],
  Car: [
    { value: "None", label: "Select Fuel" },
    { value: "Petrol", label: "Petrol", icon: <FuelIcon /> },
    { value: "Diesel", label: "Diesel", icon: <FuelIcon /> },
    { value: "CNG", label: "CNG", icon: <FuelIcon /> },
    { value: "Electric", label: "Electric", icon: <EvStation /> },
  ],
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
  Food: {
    color: "#059669",
    icon: <Restaurant sx={{ fontSize: 18 }} />,
    bg: "#ecfdf5",
    label: "Food",
  },
  Accommodation: {
    color: "#7c3aed",
    icon: <Hotel sx={{ fontSize: 18 }} />,
    bg: "#f5f3ff",
    label: "Accommodation",
  },
  Fuel: {
    color: "#ea580c",
    icon: <LocalGasStation sx={{ fontSize: 18 }} />,
    bg: "#fff7ed",
    label: "Fuel",
  },
  Software: {
    color: "#0891b2",
    icon: <Wifi sx={{ fontSize: 18 }} />,
    bg: "#ecfeff",
    label: "Software",
  },
  Hardware: {
    color: "#4f46e5",
    icon: <Build sx={{ fontSize: 18 }} />,
    bg: "#eef2ff",
    label: "Hardware",
  },
  Office: {
    color: "#b45309",
    icon: <Inventory sx={{ fontSize: 18 }} />,
    bg: "#fffbeb",
    label: "Office",
  },
  Miscellaneous: {
    color: COLORS.neutral[500],
    icon: <ListAlt sx={{ fontSize: 18 }} />,
    bg: COLORS.neutral[100],
    label: "Miscellaneous",
  },
};

// Time Periods
const TIME_PERIODS = [
  { value: "today", label: "Today", icon: <Today sx={{ fontSize: 18 }} /> },
  {
    value: "week",
    label: "This Week",
    icon: <DateRange sx={{ fontSize: 18 }} />,
  },
  {
    value: "month",
    label: "This Month",
    icon: <CalendarToday sx={{ fontSize: 18 }} />,
  },
  {
    value: "quarter",
    label: "This Quarter",
    icon: <Timeline sx={{ fontSize: 18 }} />,
  },
  {
    value: "year",
    label: "This Year",
    icon: <CalendarToday sx={{ fontSize: 18 }} />,
  },
  {
    value: "custom",
    label: "Custom Range",
    icon: <DateRange sx={{ fontSize: 18 }} />,
  },
];

// Period Options for Mobile Filter
const PERIOD_OPTIONS = [
  { value: "today", label: "Today", icon: <Today /> },
  { value: "week", label: "This Week", icon: <DateRange /> },
  { value: "month", label: "This Month", icon: <CalendarToday /> },
  { value: "year", label: "This Year", icon: <CalendarToday /> },
  { value: "all", label: "All Time", icon: <DateRange /> },
];

// ========== MOBILE FILTER DRAWER ==========
const MobileFilterDrawer = ({
  open,
  onClose,
  filters,
  onFilterChange,
  onReset,
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
            borderBottom: `1px solid ${alpha(COLORS.primary.main, 0.1)}`,
          }}
        >
          <Box>
            <Typography
              variant="h6"
              fontWeight="700"
              color={COLORS.primary.main}
            >
              Filter Expenses
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {activeFilterCount} active filter{activeFilterCount !== 1 && "s"}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ bgcolor: alpha(COLORS.primary.main, 0.1) }}
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
                border: `1px solid ${alpha(COLORS.primary.main, 0.1)}`,
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  p: 2,
                  bgcolor: alpha(COLORS.primary.main, 0.02),
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onClick={() => toggleSection("search")}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Search sx={{ color: COLORS.primary.main, fontSize: 20 }} />
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
                    placeholder="Search by title or description..."
                    value={filters.search}
                    onChange={(e) => onFilterChange("search", e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search
                            sx={{ color: "text.secondary", fontSize: 20 }}
                          />
                        </InputAdornment>
                      ),
                      endAdornment: filters.search && (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => onFilterChange("search", "")}
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
                border: `1px solid ${alpha(COLORS.primary.main, 0.1)}`,
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  p: 2,
                  bgcolor: alpha(COLORS.primary.main, 0.02),
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onClick={() => toggleSection("period")}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <DateRange
                    sx={{ color: COLORS.primary.main, fontSize: 20 }}
                  />
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
                            filters.period === option.value
                              ? "contained"
                              : "outlined"
                          }
                          onClick={() => onFilterChange("period", option.value)}
                          startIcon={option.icon}
                          size="small"
                          sx={{
                            bgcolor:
                              filters.period === option.value
                                ? COLORS.primary.main
                                : "transparent",
                            color:
                              filters.period === option.value
                                ? "#fff"
                                : COLORS.primary.main,
                            borderColor: COLORS.primary.main,
                            "&:hover": {
                              bgcolor:
                                filters.period === option.value
                                  ? COLORS.primary.dark
                                  : alpha(COLORS.primary.main, 0.1),
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

            {/* Category Section */}
            <Paper
              elevation={0}
              sx={{
                border: `1px solid ${alpha(COLORS.primary.main, 0.1)}`,
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  p: 2,
                  bgcolor: alpha(COLORS.primary.main, 0.02),
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onClick={() => toggleSection("category")}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <FilterAlt
                    sx={{ color: COLORS.primary.main, fontSize: 20 }}
                  />
                  <Typography variant="subtitle2" fontWeight={600}>
                    Category
                  </Typography>
                </Stack>
                {expandedSection === "category" ? (
                  <ExpandLess />
                ) : (
                  <ExpandMore />
                )}
              </Box>
              <Collapse in={expandedSection === "category"}>
                <Box sx={{ p: 2 }}>
                  <FormControl fullWidth size="small">
                    <Select
                      value={filters.category}
                      onChange={(e) =>
                        onFilterChange("category", e.target.value)
                      }
                      displayEmpty
                    >
                      <MenuItem value="all">All Categories</MenuItem>
                      {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                        <MenuItem key={key} value={key}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                          >
                            <Box sx={{ color: config.color }}>
                              {config.icon}
                            </Box>
                            <span>{config.label}</span>
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
                border: `1px solid ${alpha(COLORS.primary.main, 0.1)}`,
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  p: 2,
                  bgcolor: alpha(COLORS.primary.main, 0.02),
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onClick={() => toggleSection("status")}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <CheckCircle
                    sx={{ color: COLORS.primary.main, fontSize: 20 }}
                  />
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
                      value={filters.status}
                      onChange={(e) => onFilterChange("status", e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                        <MenuItem key={key} value={key}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                          >
                            {config.icon}
                            <span>{config.label}</span>
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Collapse>
            </Paper>

            {/* Sort Section */}
            <Paper
              elevation={0}
              sx={{
                border: `1px solid ${alpha(COLORS.primary.main, 0.1)}`,
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  p: 2,
                  bgcolor: alpha(COLORS.primary.main, 0.02),
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onClick={() => toggleSection("sort")}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <FilterAlt
                    sx={{ color: COLORS.primary.main, fontSize: 20 }}
                  />
                  <Typography variant="subtitle2" fontWeight={600}>
                    Sort By
                  </Typography>
                </Stack>
                {expandedSection === "sort" ? <ExpandLess /> : <ExpandMore />}
              </Box>
              <Collapse in={expandedSection === "sort"}>
                <Box sx={{ p: 2 }}>
                  <FormControl fullWidth size="small">
                    <Select
                      value={filters.sortBy}
                      onChange={(e) => onFilterChange("sortBy", e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value="-createdAt">Newest First</MenuItem>
                      <MenuItem value="createdAt">Oldest First</MenuItem>
                      <MenuItem value="-amount">Highest Amount</MenuItem>
                      <MenuItem value="amount">Lowest Amount</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Collapse>
            </Paper>
          </Stack>
        </Box>

        {/* Action Buttons */}
        <Box
          sx={{
            p: 3,
            borderTop: `1px solid ${alpha(COLORS.primary.main, 0.1)}`,
            bgcolor: "#fff",
          }}
        >
          <Stack direction="row" spacing={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                onReset();
                onClose();
              }}
              startIcon={<Clear />}
              sx={{
                borderColor: COLORS.primary.main,
                color: COLORS.primary.main,
                "&:hover": {
                  bgcolor: alpha(COLORS.primary.main, 0.05),
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
                bgcolor: COLORS.primary.main,
                "&:hover": {
                  bgcolor: COLORS.primary.dark,
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

// Skeleton Loader
const ExpenseCardSkeleton = () => (
  <Card sx={{ mb: 2, borderRadius: 3 }}>
    <CardContent sx={{ p: 3 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
      >
        <Box display="flex" gap={2}>
          <Skeleton
            variant="circular"
            width={48}
            height={48}
            sx={{ bgcolor: COLORS.neutral[200] }}
          />
          <Box>
            <Skeleton
              variant="text"
              width={160}
              height={24}
              sx={{ bgcolor: COLORS.neutral[200] }}
            />
            <Skeleton
              variant="text"
              width={100}
              height={20}
              sx={{ bgcolor: COLORS.neutral[200] }}
            />
          </Box>
        </Box>
        <Skeleton
          variant="text"
          width={100}
          height={32}
          sx={{ bgcolor: COLORS.neutral[200] }}
        />
      </Box>
      <Box mt={2}>
        <Skeleton
          variant="text"
          width="100%"
          height={20}
          sx={{ bgcolor: COLORS.neutral[200] }}
        />
        <Skeleton
          variant="text"
          width="80%"
          height={20}
          sx={{ bgcolor: COLORS.neutral[200] }}
        />
      </Box>
    </CardContent>
  </Card>
);

// Stat Card Component
const StatCard = ({
  icon,
  title,
  value,
  subtitle,
  color = COLORS.primary.main,
  trend,
  index,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
                sx: { fontSize: { xs: 14, sm: 18, md: 20 } },
              })}
            </Box>
            {trend && (
              <Chip
                size="small"
                icon={trend > 0 ? <TrendingUp /> : <TrendingDown />}
                label={`${Math.abs(trend)}%`}
                sx={{
                  borderRadius: 2,
                  bgcolor:
                    trend > 0
                      ? alpha(COLORS.success.main, 0.1)
                      : alpha(COLORS.error.main, 0.1),
                  color: trend > 0 ? COLORS.success.main : COLORS.error.main,
                  height: 24,
                  "& .MuiChip-icon": { fontSize: 12, color: "inherit" },
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
              {title}
            </Typography>
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{
                color: color,
                fontSize: { xs: "1rem", sm: "1.3rem", md: "1.5rem" },
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <CurrencyRupee sx={{ fontSize: "inherit" }} />
              {value}
            </Typography>
            {subtitle && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: { xs: "0.6rem", sm: "0.7rem" } }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>
      </Paper>
    </Fade>
  );
};

// Mobile Expense Card (Updated with expandable details)
const MobileExpenseCard = ({ expense, onMenuOpen, onView, index }) => {
  const [expanded, setExpanded] = useState(false);
  const status = expense.status || "Pending";
  const category = expense.category || "Miscellaneous";
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
  const categoryConfig =
    CATEGORY_CONFIG[category] || CATEGORY_CONFIG.Miscellaneous;

  const getTimeAgo = (dateString) => {
    const date = parseISO(dateString);
    if (isToday(date)) return "Today";
    if (isThisWeek(date)) return "This week";
    if (isThisMonth(date)) return "This month";
    return format(date, "MMM dd, yyyy");
  };

  const initials =
    expense.createdBy?.name?.charAt(0) ||
    expense.createdBy?.email?.charAt(0) ||
    "U";

  // Check if fuel expense
  const isFuel = expense.category === "Fuel";
  const hasFuelDetails =
    isFuel &&
    expense.vehicleType &&
    expense.fuelType &&
    expense.kilometersTraveled;

  return (
    <Fade in={true} timeout={500 + index * 50}>
      <Paper
        sx={{
          mb: 1.5,
          borderRadius: 3,
          border: `1px solid ${alpha(categoryConfig.color, 0.2)}`,
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
                  bgcolor: alpha(categoryConfig.color, 0.1),
                  color: categoryConfig.color,
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                }}
              >
                {categoryConfig.icon}
              </Avatar>
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight="700"
                  sx={{ color: COLORS.neutral[800] }}
                >
                  {expense.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ID: {expense._id?.slice(-8) || "N/A"}
                </Typography>
              </Box>
            </Box>
            <IconButton
              size="small"
              onClick={() => setExpanded(!expanded)}
              sx={{
                transform: expanded ? "rotate(180deg)" : "none",
                transition: "transform 0.3s",
                bgcolor: alpha(categoryConfig.color, 0.1),
              }}
            >
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>

          {/* Quick Info */}
          <Grid container spacing={1} sx={{ mb: 1.5 }}>
            <Grid item xs={6}>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <CurrencyRupee
                  sx={{ fontSize: 14, color: alpha(COLORS.primary.main, 0.6) }}
                />
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{ color: COLORS.primary.main }}
                >
                  {expense.amount?.toLocaleString()}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={6}>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <CalendarToday
                  sx={{ fontSize: 14, color: alpha(COLORS.primary.main, 0.6) }}
                />
                <Typography variant="caption">
                  {getTimeAgo(expense.createdAt)}
                </Typography>
              </Stack>
            </Grid>
          </Grid>

          {/* Status and Category Chips */}
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1.5 }}>
            <Chip
              size="small"
              label={categoryConfig.label}
              sx={{
                bgcolor: alpha(categoryConfig.color, 0.1),
                color: categoryConfig.color,
                fontWeight: 600,
                height: 24,
                fontSize: "0.7rem",
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
                fontWeight: 600,
                height: 24,
                fontSize: "0.7rem",
                "& .MuiChip-icon": { fontSize: 14 },
              }}
            />
          </Box>

          {/* Creator Info */}
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar
              sx={{
                width: 24,
                height: 24,
                fontSize: "0.65rem",
                bgcolor: COLORS.neutral[500],
                borderRadius: 1.5,
              }}
            >
              {initials}
            </Avatar>
            <Typography variant="caption" color={COLORS.neutral[600]}>
              {expense.createdBy?.name ||
                expense.createdBy?.email?.split("@")[0] ||
                "Unknown"}
            </Typography>
          </Box>

          {/* Fuel Details Preview (if expanded) */}
          {!expanded && isFuel && hasFuelDetails && (
            <Box sx={{ mt: 1.5, display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Chip
                size="small"
                icon={<TwoWheeler sx={{ fontSize: 12 }} />}
                label={`${expense.vehicleType} • ${expense.fuelType}`}
                sx={{
                  bgcolor: alpha(COLORS.neutral[500], 0.1),
                  color: COLORS.neutral[700],
                  height: 22,
                  fontSize: "0.65rem",
                }}
              />
              <Chip
                size="small"
                icon={<Speed sx={{ fontSize: 12 }} />}
                label={`${expense.kilometersTraveled} km`}
                sx={{
                  bgcolor: alpha(COLORS.neutral[500], 0.1),
                  color: COLORS.neutral[700],
                  height: 22,
                  fontSize: "0.65rem",
                }}
              />
            </Box>
          )}

          {/* Expanded Details */}
          <Collapse in={expanded}>
            <Box
              sx={{
                mt: 2,
                pt: 2,
                borderTop: `1px solid ${alpha(categoryConfig.color, 0.1)}`,
              }}
            >
              {/* Fuel Details (if applicable) */}
              {isFuel && (
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    gutterBottom
                  >
                    Fuel Details
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={4}>
                      <Paper
                        sx={{
                          p: 1,
                          bgcolor: alpha(COLORS.warning.main, 0.05),
                          borderRadius: 1.5,
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          Vehicle
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {expense.vehicleType || "N/A"}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={4}>
                      <Paper
                        sx={{
                          p: 1,
                          bgcolor: alpha(COLORS.warning.main, 0.05),
                          borderRadius: 1.5,
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          Fuel Type
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {expense.fuelType || "N/A"}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={4}>
                      <Paper
                        sx={{
                          p: 1,
                          bgcolor: alpha(COLORS.warning.main, 0.05),
                          borderRadius: 1.5,
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          Distance
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {expense.kilometersTraveled || 0} km
                        </Typography>
                      </Paper>
                    </Grid>
                    {expense.fuelRatePerKm && (
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">
                          Rate: ₹{expense.fuelRatePerKm}/km • Calculated
                          automatically
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}

              {/* Description */}
              {expense.description && (
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Description
                  </Typography>
                  <Typography variant="body2">{expense.description}</Typography>
                </Box>
              )}

              {/* Location */}
              {expense.location && (
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Location
                  </Typography>
                  <Typography variant="body2">
                    {expense.location.address ||
                      `Lat: ${expense.location.lat?.toFixed(4)}, Lng: ${expense.location.lng?.toFixed(4)}`}
                  </Typography>
                </Box>
              )}

              {/* Dates */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Created
                  </Typography>
                  <Typography variant="body2">
                    {format(parseISO(expense.createdAt), "dd MMM yyyy")}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Updated
                  </Typography>
                  <Typography variant="body2">
                    {expense.updatedAt
                      ? format(parseISO(expense.updatedAt), "dd MMM yyyy")
                      : "N/A"}
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
                  onClick={() => onView(expense)}
                  sx={{
                    bgcolor: COLORS.primary.main,
                    borderRadius: 2,
                    "&:hover": { bgcolor: COLORS.primary.dark },
                  }}
                >
                  View
                </Button>
                <IconButton
                  size="small"
                  onClick={(e) => onMenuOpen(e, expense)}
                  sx={{
                    bgcolor: alpha(COLORS.primary.main, 0.1),
                    color: COLORS.primary.main,
                    borderRadius: 2,
                    width: 40,
                  }}
                >
                  <MoreVert />
                </IconButton>
              </Stack>
            </Box>
          </Collapse>
        </Box>
      </Paper>
    </Fade>
  );
};

// Desktop Table Row
const DesktopTableRow = ({ expense, onMenuOpen }) => {
  const status = expense.status || "Pending";
  const category = expense.category || "Miscellaneous";
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
  const categoryConfig =
    CATEGORY_CONFIG[category] || CATEGORY_CONFIG.Miscellaneous;

  // Check if fuel expense
  const isFuel = expense.category === "Fuel";

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
            {isFuel && expense.vehicleType && (
              <Typography
                variant="caption"
                color={COLORS.neutral[500]}
                sx={{ display: "block" }}
              >
                {expense.vehicleType} • {expense.fuelType} •{" "}
                {expense.kilometersTraveled} km
              </Typography>
            )}
          </Box>
        </Box>
      </TableCell>
      <TableCell>
        <Typography
          fontWeight="600"
          sx={{
            color: COLORS.primary.main,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          <CurrencyRupee sx={{ fontSize: 16 }} />
          {expense.amount?.toLocaleString()}
        </Typography>
        {isFuel && expense.fuelRatePerKm && (
          <Typography variant="caption" color={COLORS.neutral[500]}>
            ₹{expense.fuelRatePerKm}/km
          </Typography>
        )}
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
              marginLeft: "6px",
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
              borderRadius: 1.5,
            }}
          >
            {expense.createdBy?.name?.charAt(0) ||
              expense.createdBy?.email?.charAt(0) ||
              "U"}
          </Avatar>
          <Typography variant="body2" color={COLORS.neutral[700]}>
            {expense.createdBy?.name ||
              expense.createdBy?.email?.split("@")[0] ||
              "Unknown"}
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

// Expense Modal Component with Fuel Fields
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
  const [calculatedAmount, setCalculatedAmount] = useState(null);
  const [errors, setErrors] = useState({});

  // Check if category is Fuel
  const isFuel = formData.category === "Fuel";

  // Get available fuel types based on vehicle
  const availableFuelTypes = useMemo(() => {
    if (!isFuel || !formData.vehicleType || formData.vehicleType === "None")
      return [];
    return FUEL_TYPES[formData.vehicleType] || [];
  }, [isFuel, formData.vehicleType]);

  // Calculate amount when fuel details change
  useEffect(() => {
    if (
      isFuel &&
      formData.vehicleType &&
      formData.vehicleType !== "None" &&
      formData.fuelType &&
      formData.fuelType !== "None" &&
      formData.kilometersTraveled &&
      formData.kilometersTraveled > 0
    ) {
      const rate = FUEL_RATES[formData.vehicleType]?.[formData.fuelType];
      if (rate) {
        const amount = formData.kilometersTraveled * rate;
        setCalculatedAmount(amount);
        setFormData((prev) => ({ ...prev, amount: amount.toString() }));
      }
    } else if (isFuel) {
      setCalculatedAmount(null);
    }
  }, [
    isFuel,
    formData.vehicleType,
    formData.fuelType,
    formData.kilometersTraveled,
    setFormData,
  ]);

  // Validate fuel fields
  const validateFuelFields = () => {
    if (!isFuel) return true;

    const newErrors = {};

    if (!formData.vehicleType || formData.vehicleType === "None") {
      newErrors.vehicleType = "Vehicle type is required";
    }
    if (!formData.fuelType || formData.fuelType === "None") {
      newErrors.fuelType = "Fuel type is required";
    }
    if (!formData.kilometersTraveled || formData.kilometersTraveled <= 0) {
      newErrors.kilometersTraveled = "Kilometers must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission with validation
  const handleSubmit = () => {
    if (isFuel && !validateFuelFields()) {
      return;
    }
    onSubmit();
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
          bgcolor: COLORS.primary.main,
          color: "white",
          pb: 2,
          px: { xs: 2, sm: 3 },
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              sx={{
                bgcolor: "white",
                color: COLORS.primary.main,
                width: { xs: 40, sm: 48 },
                height: { xs: 40, sm: 48 },
              }}
            >
              <ReceiptLong sx={{ fontSize: { xs: 20, sm: 24 } }} />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {selectedExpense ? "Edit Expense" : "New Expense"}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {selectedExpense
                  ? "Update expense details"
                  : "Create a new expense"}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: "white" }}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ py: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 } }}>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            fullWidth
            label="Title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            size={isMobile ? "small" : "medium"}
            required
            sx={{
              "& .MuiOutlinedInput-root": { borderRadius: 2 },
            }}
          />

          <FormControl fullWidth size={isMobile ? "small" : "medium"} required>
            <InputLabel>Category</InputLabel>
            <Select
              value={formData.category}
              onChange={(e) => {
                // Reset fuel fields when category changes
                if (e.target.value !== "Fuel") {
                  setFormData({
                    ...formData,
                    category: e.target.value,
                    vehicleType: "None",
                    fuelType: "None",
                    kilometersTraveled: 0,
                  });
                  setErrors({});
                } else {
                  setFormData({ ...formData, category: e.target.value });
                }
              }}
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

          {/* Fuel Fields - Only show when category is Fuel */}
          {isFuel && (
            <>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: alpha(COLORS.warning.main, 0.05),
                  borderRadius: 2,
                  border: `1px solid ${alpha(COLORS.warning.main, 0.2)}`,
                }}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  sx={{
                    color: COLORS.warning.main,
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Calculate sx={{ fontSize: 20 }} />
                  Fuel Auto-Calculation
                </Typography>

                <Grid container spacing={2}>
                  {/* Vehicle Type */}
                  <Grid item xs={12} sm={6}>
                    <FormControl
                      fullWidth
                      size="small"
                      error={!!errors.vehicleType}
                    >
                      <InputLabel>Vehicle Type *</InputLabel>
                      <Select
                        value={formData.vehicleType || "None"}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            vehicleType: e.target.value,
                            fuelType: "None", // Reset fuel type when vehicle changes
                          });
                          if (errors.vehicleType) {
                            setErrors({ ...errors, vehicleType: null });
                          }
                        }}
                        label="Vehicle Type *"
                      >
                        {VEHICLE_TYPES.map((v) => (
                          <MenuItem
                            key={v.value}
                            value={v.value}
                            disabled={v.value === "None"}
                          >
                            <Box display="flex" alignItems="center" gap={1}>
                              {v.icon}
                              <span>{v.label}</span>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.vehicleType && (
                        <FormHelperText>{errors.vehicleType}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>

                  {/* Fuel Type */}
                  <Grid item xs={12} sm={6}>
                    <FormControl
                      fullWidth
                      size="small"
                      disabled={
                        !formData.vehicleType || formData.vehicleType === "None"
                      }
                      error={!!errors.fuelType}
                    >
                      <InputLabel>Fuel Type *</InputLabel>
                      <Select
                        value={formData.fuelType || "None"}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            fuelType: e.target.value,
                          });
                          if (errors.fuelType) {
                            setErrors({ ...errors, fuelType: null });
                          }
                        }}
                        label="Fuel Type *"
                      >
                        {availableFuelTypes.map((f) => (
                          <MenuItem
                            key={f.value}
                            value={f.value}
                            disabled={f.value === "None"}
                          >
                            <Box display="flex" alignItems="center" gap={1}>
                              {f.icon}
                              <span>{f.label}</span>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.fuelType && (
                        <FormHelperText>{errors.fuelType}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>

                  {/* Kilometers Traveled */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Kilometers Traveled *"
                      type="number"
                      value={formData.kilometersTraveled || ""}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        setFormData({ ...formData, kilometersTraveled: value });
                        if (errors.kilometersTraveled) {
                          setErrors({ ...errors, kilometersTraveled: null });
                        }
                      }}
                      size="small"
                      error={!!errors.kilometersTraveled}
                      helperText={errors.kilometersTraveled}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Speed
                              sx={{ fontSize: 18, color: COLORS.neutral[500] }}
                            />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">km</InputAdornment>
                        ),
                        inputProps: { min: 0, step: 0.1 },
                      }}
                    />
                  </Grid>

                  {/* Calculated Amount Preview */}
                  {calculatedAmount !== null && (
                    <Grid item xs={12}>
                      <Alert
                        severity="info"
                        sx={{
                          borderRadius: 2,
                          bgcolor: alpha(COLORS.info.main, 0.1),
                        }}
                      >
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography variant="body2">
                            Calculated Amount:
                          </Typography>
                          <Typography
                            variant="h6"
                            fontWeight={700}
                            sx={{
                              color: COLORS.primary.main,
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <CurrencyRupee sx={{ fontSize: 18 }} />
                            {calculatedAmount.toFixed(2)}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          Rate: ₹
                          {
                            FUEL_RATES[formData.vehicleType]?.[
                              formData.fuelType
                            ]
                          }
                          /km × {formData.kilometersTraveled} km
                        </Typography>
                      </Alert>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </>
          )}

          {/* Amount Field - Hidden/Disabled for Fuel */}
          {!isFuel ? (
            <TextField
              fullWidth
              label="Amount (₹)"
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              size={isMobile ? "small" : "medium"}
              required
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CurrencyRupee
                      sx={{ fontSize: 18, color: COLORS.neutral[500] }}
                    />
                  </InputAdornment>
                ),
                inputProps: { min: 0, step: 1 },
              }}
            />
          ) : (
            <TextField
              fullWidth
              label="Amount (₹) - Auto Calculated"
              type="number"
              value={formData.amount || ""}
              disabled
              size={isMobile ? "small" : "medium"}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: alpha(COLORS.neutral[100], 0.5),
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CurrencyRupee
                      sx={{ fontSize: 18, color: COLORS.neutral[500] }}
                    />
                  </InputAdornment>
                ),
              }}
            />
          )}

          <TextField
            fullWidth
            label="Description"
            multiline
            rows={isMobile ? 2 : 3}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            size={isMobile ? "small" : "medium"}
            placeholder="Add additional details..."
            sx={{
              "& .MuiOutlinedInput-root": { borderRadius: 2 },
            }}
          />

          <Box>
            <Typography
              variant="subtitle2"
              gutterBottom
              fontWeight="500"
              sx={{ color: COLORS.neutral[700] }}
            >
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
              <input
                type="file"
                hidden
                accept="image/*,.pdf"
                onChange={handleFileSelect}
              />
            </Button>

            {(selectedFile || filePreview) && (
              <Alert
                severity="info"
                sx={{
                  mt: 2,
                  borderRadius: 2,
                  bgcolor: alpha(COLORS.info.main, 0.1),
                }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  {filePreview ? (
                    <img
                      src={filePreview}
                      alt="Preview"
                      style={{
                        width: 40,
                        height: 40,
                        objectFit: "cover",
                        borderRadius: 6,
                      }}
                    />
                  ) : (
                    <AttachFile sx={{ fontSize: 20 }} />
                  )}
                  <Typography
                    variant="body2"
                    noWrap
                    sx={{ color: COLORS.neutral[700] }}
                  >
                    {selectedFile?.name || "File selected"}
                  </Typography>
                </Box>
              </Alert>
            )}
          </Box>
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
            borderColor: COLORS.primary.main,
            color: COLORS.primary.main,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          fullWidth={isMobile}
          disabled={
            !formData.title ||
            (!isFuel && (!formData.amount || formData.amount <= 0)) ||
            !formData.category ||
            loading
          }
          sx={{
            borderRadius: 2,
            bgcolor: COLORS.primary.main,
            "&:hover": { bgcolor: COLORS.primary.dark },
          }}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: "white" }} />
          ) : selectedExpense ? (
            "Update"
          ) : (
            "Create"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// View Expense Modal with Fuel Details
const ViewExpenseModal = ({ open, onClose, expense }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!expense) return null;

  const status = expense.status || "Pending";
  const category = expense.category || "Miscellaneous";
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
  const categoryConfig =
    CATEGORY_CONFIG[category] || CATEGORY_CONFIG.Miscellaneous;
  const isFuel = expense.category === "Fuel";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
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
          bgcolor: COLORS.primary.main,
          color: "white",
          pb: 2,
          px: { xs: 2, sm: 3 },
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              sx={{
                bgcolor: "white",
                color: COLORS.primary.main,
                width: { xs: 40, sm: 48 },
                height: { xs: 40, sm: 48 },
              }}
            >
              <ReceiptLong sx={{ fontSize: { xs: 20, sm: 24 } }} />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {expense.title}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Expense Details • {expense._id?.slice(-8)}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: "white" }}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ py: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 } }}>
        <Stack spacing={3}>
          {/* Header */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            flexWrap="wrap"
            gap={2}
          >
            <Box>
              <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                <Chip
                  size="small"
                  label={categoryConfig.label}
                  icon={categoryConfig.icon}
                  sx={{
                    bgcolor: alpha(categoryConfig.color, 0.1),
                    color: categoryConfig.color,
                    fontWeight: 600,
                    borderRadius: 2,
                  }}
                />
                <Chip
                  size="small"
                  label={statusConfig.label}
                  icon={statusConfig.icon}
                  sx={{
                    bgcolor: statusConfig.bg,
                    color: statusConfig.color,
                    fontWeight: 600,
                    borderRadius: 2,
                  }}
                />
                {isFuel && expense.vehicleType && (
                  <Chip
                    size="small"
                    icon={<TwoWheeler sx={{ fontSize: 14 }} />}
                    label={`${expense.vehicleType}`}
                    sx={{
                      bgcolor: alpha(COLORS.warning.main, 0.1),
                      color: COLORS.warning.main,
                      fontWeight: 600,
                      borderRadius: 2,
                    }}
                  />
                )}
              </Box>
            </Box>
            <Typography
              variant="h4"
              fontWeight="700"
              sx={{
                color: COLORS.primary.main,
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <CurrencyRupee sx={{ fontSize: 28 }} />
              {expense.amount?.toLocaleString()}
            </Typography>
          </Box>

          <Divider />

          {/* Details Grid */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography
                variant="subtitle2"
                fontWeight="600"
                color={COLORS.neutral[600]}
                gutterBottom
              >
                Date
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <CalendarToday
                  sx={{ fontSize: 16, color: COLORS.primary.main }}
                />
                <Typography sx={{ color: COLORS.neutral[800] }}>
                  {format(parseISO(expense.createdAt), "MMMM dd, yyyy")}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography
                variant="subtitle2"
                fontWeight="600"
                color={COLORS.neutral[600]}
                gutterBottom
              >
                Created By
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Avatar
                  sx={{
                    width: 28,
                    height: 28,
                    bgcolor: COLORS.neutral[500],
                    borderRadius: 1.5,
                    fontSize: "0.75rem",
                  }}
                >
                  {expense.createdBy?.name?.charAt(0) ||
                    expense.createdBy?.email?.charAt(0) ||
                    "U"}
                </Avatar>
                <Box>
                  <Typography
                    variant="body2"
                    fontWeight="500"
                    sx={{ color: COLORS.neutral[800] }}
                  >
                    {expense.createdBy?.name || "Unknown"}
                  </Typography>
                  <Typography variant="caption" color={COLORS.neutral[500]}>
                    {expense.createdBy?.email}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Fuel Details Section */}
            {isFuel && (
              <Grid item xs={12}>
                <Typography
                  variant="subtitle2"
                  fontWeight="600"
                  color={COLORS.neutral[600]}
                  gutterBottom
                >
                  Fuel Details
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    borderColor: alpha(COLORS.warning.main, 0.3),
                    bgcolor: alpha(COLORS.warning.main, 0.02),
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        Vehicle Type
                      </Typography>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        {expense.vehicleType === "Bike" ? (
                          <TwoWheeler
                            sx={{ fontSize: 16, color: COLORS.warning.main }}
                          />
                        ) : expense.vehicleType === "Car" ? (
                          <DirectionsCar
                            sx={{ fontSize: 16, color: COLORS.warning.main }}
                          />
                        ) : null}
                        <Typography variant="body2" fontWeight={600}>
                          {expense.vehicleType || "N/A"}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        Fuel Type
                      </Typography>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        {expense.fuelType === "Electric" ? (
                          <EvStation
                            sx={{ fontSize: 16, color: COLORS.warning.main }}
                          />
                        ) : (
                          <FuelIcon
                            sx={{ fontSize: 16, color: COLORS.warning.main }}
                          />
                        )}
                        <Typography variant="body2" fontWeight={600}>
                          {expense.fuelType || "N/A"}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        Distance
                      </Typography>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Speed
                          sx={{ fontSize: 16, color: COLORS.warning.main }}
                        />
                        <Typography variant="body2" fontWeight={600}>
                          {expense.kilometersTraveled || 0} km
                        </Typography>
                      </Box>
                    </Grid>
                    {expense.fuelRatePerKm && (
                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography variant="body2" color="text.secondary">
                            Rate per km:
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{ color: COLORS.primary.main }}
                          >
                            ₹{expense.fuelRatePerKm}/km
                          </Typography>
                        </Box>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          mt={0.5}
                        >
                          <Typography variant="body2" color="text.secondary">
                            Calculation:
                          </Typography>
                          <Typography variant="body2">
                            {expense.kilometersTraveled} km × ₹
                            {expense.fuelRatePerKm}/km = ₹{expense.amount}
                          </Typography>
                        </Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ mt: 1, display: "block" }}
                        >
                          * Amount automatically calculated
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              </Grid>
            )}

            {expense.description && (
              <Grid item xs={12}>
                <Typography
                  variant="subtitle2"
                  fontWeight="600"
                  color={COLORS.neutral[600]}
                  gutterBottom
                >
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
                  <Typography sx={{ color: COLORS.neutral[700] }}>
                    {expense.description}
                  </Typography>
                </Paper>
              </Grid>
            )}

            {expense.location && (
              <Grid item xs={12}>
                <Typography
                  variant="subtitle2"
                  fontWeight="600"
                  color={COLORS.neutral[600]}
                  gutterBottom
                >
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
                    <LocationOn
                      sx={{ fontSize: 18, color: COLORS.primary.main }}
                    />
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
                <Typography
                  variant="subtitle2"
                  fontWeight="600"
                  color={COLORS.neutral[600]}
                  gutterBottom
                >
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
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    fontWeight="600"
                    sx={{ color: COLORS.error.main }}
                  >
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
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    fontWeight="600"
                    sx={{ color: COLORS.success.main }}
                  >
                    Approved By
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: COLORS.success.main }}
                  >
                    {expense.approvedBy?.name || "Unknown"} on{" "}
                    {expense.approvedAt &&
                      format(parseISO(expense.approvedAt), "MMM dd, yyyy")}
                  </Typography>
                  {expense.approverRemarks && (
                    <Typography
                      variant="body2"
                      sx={{ color: COLORS.success.main, mt: 0.5 }}
                    >
                      Remarks: {expense.approverRemarks}
                    </Typography>
                  )}
                </Alert>
              </Grid>
            )}
          </Grid>
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
          variant="contained"
          fullWidth={isMobile}
          sx={{
            borderRadius: 2,
            bgcolor: COLORS.primary.main,
            "&:hover": { bgcolor: COLORS.primary.dark },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Loading Skeleton
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

// Empty State
const EmptyState = ({ onClearFilters, hasFilters, canCreate, onCreate }) => (
  <Box sx={{ textAlign: "center", py: 8, px: 2 }}>
    <Box
      sx={{
        width: 120,
        height: 120,
        borderRadius: "50%",
        bgcolor: alpha(COLORS.primary.main, 0.1),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mx: "auto",
        mb: 3,
      }}
    >
      <ReceiptLong sx={{ fontSize: 48, color: COLORS.primary.main }} />
    </Box>
    <Typography variant="h6" fontWeight={600} gutterBottom>
      No expenses found
    </Typography>
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ mb: 3, maxWidth: 400, mx: "auto" }}
    >
      {hasFilters
        ? "No expenses match your current filters. Try adjusting your search criteria."
        : canCreate
          ? "Get started by creating your first expense"
          : "No expenses available"}
    </Typography>
    {hasFilters && (
      <Button
        variant="contained"
        onClick={onClearFilters}
        startIcon={<Clear />}
        sx={{
          bgcolor: COLORS.primary.main,
          "&:hover": { bgcolor: COLORS.primary.dark },
        }}
      >
        Clear All Filters
      </Button>
    )}
    {!hasFilters && canCreate && (
      <Button
        variant="contained"
        onClick={onCreate}
        startIcon={<Add />}
        sx={{
          bgcolor: COLORS.primary.main,
          "&:hover": { bgcolor: COLORS.primary.dark },
        }}
      >
        Create Expense
      </Button>
    )}
  </Box>
);

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
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [actionType, setActionType] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedExpenseForMenu, setSelectedExpenseForMenu] = useState(null);
  const [viewMode, setViewMode] = useState(isMobile ? "card" : "table");
  const [navValue, setNavValue] = useState(0);

  // Refs
  const containerRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    description: "",
    latitude: "",
    longitude: "",
    vehicleType: "None",
    fuelType: "None",
    kilometersTraveled: 0,
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

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category !== "all") count++;
    if (filters.status !== "all") count++;
    if (filters.period !== "month") count++;
    return count;
  }, [filters.search, filters.category, filters.status, filters.period]);

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
      setLoading((prev) => ({ ...prev, expenses: true }));

      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.status !== "all" && { status: filters.status }),
        ...(filters.category !== "all" && { category: filters.category }),
        ...(filters.period !== "custom" &&
          filters.period !== "all" && { period: filters.period }),
        ...(filters.startDate &&
          filters.endDate &&
          filters.period === "custom" && {
            startDate: filters.startDate.toISOString(),
            endDate: filters.endDate.toISOString(),
          }),
        sortBy: filters.sortBy.replace("-", ""),
        sortOrder: filters.sortBy.startsWith("-") ? "desc" : "asc",
      });

      const response = await safeFetchAPI(`/expense/getAll?${params}`);

      if (response?.success) {
        setExpenses(response.result.expenses || []);
        setPagination((prev) => ({
          ...prev,
          totalPages: response.result.pagination?.totalPages || 1,
          totalItems: response.result.pagination?.total || 0,
        }));
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
      showSnackbar("Failed to fetch expenses", "error");
    } finally {
      setLoading((prev) => ({ ...prev, expenses: false }));
    }
  }, [
    isAuthenticated,
    safeFetchAPI,
    pagination.page,
    pagination.limit,
    filters,
  ]);

  // Fetch Stats
  const fetchStats = useCallback(async () => {
    if (!isAuthenticated()) return;

    try {
      setLoading((prev) => ({ ...prev, stats: true }));
      const response = await safeFetchAPI(
        `/expense/stats?period=${filters.period}`,
      );
      if (response?.success) {
        setStats(
          response.result || {
            byStatus: [],
            totals: { totalExpenses: 0, grandTotal: 0 },
          },
        );
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading((prev) => ({ ...prev, stats: false }));
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

    if (!formData.title || !formData.category) {
      showSnackbar("Please fill all required fields", "error");
      return;
    }

    // For non-fuel expenses, amount is required
    if (
      formData.category !== "Fuel" &&
      (!formData.amount || formData.amount <= 0)
    ) {
      showSnackbar("Please enter a valid amount", "error");
      return;
    }

    // For fuel expenses, validate fuel fields
    if (formData.category === "Fuel") {
      if (
        !formData.vehicleType ||
        formData.vehicleType === "None" ||
        !formData.fuelType ||
        formData.fuelType === "None" ||
        !formData.kilometersTraveled ||
        formData.kilometersTraveled <= 0
      ) {
        showSnackbar("Please fill all fuel details", "error");
        return;
      }
    }

    try {
      setLoading((prev) => ({ ...prev, action: true }));

      const submitData = new FormData();
      submitData.append("title", formData.title);

      // For fuel expenses, amount is calculated on server
      if (formData.category !== "Fuel") {
        submitData.append("amount", parseFloat(formData.amount));
      }

      submitData.append("category", formData.category);
      submitData.append("description", formData.description || "");

      // Add fuel fields if category is Fuel
      if (formData.category === "Fuel") {
        submitData.append("vehicleType", formData.vehicleType);
        submitData.append("fuelType", formData.fuelType);
        submitData.append("kilometersTraveled", formData.kilometersTraveled);
      }

      if (formData.latitude && formData.longitude) {
        submitData.append("latitude", formData.latitude);
        submitData.append("longitude", formData.longitude);
      }

      if (selectedFile) {
        submitData.append("billAttachment", selectedFile);
      }

      const endpoint = selectedExpense
        ? `/expense/update/${selectedExpense._id}`
        : "/expense/create";
      const method = selectedExpense ? "PUT" : "POST";

      const response = await fetchAPI(endpoint, {
        method,
        body: submitData,
        headers: {},
      });

      if (response?.success) {
        showSnackbar(
          selectedExpense
            ? "Expense updated successfully"
            : "Expense created successfully",
          "success",
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
      setLoading((prev) => ({ ...prev, action: false }));
    }
  };

  // Status Update (Approve/Reject)
  const handleStatusUpdate = async () => {
    if (!isAuthenticated() || !canUpdateStatus || !selectedExpense) return;

    try {
      setLoading((prev) => ({ ...prev, action: true }));

      const endpoint =
        actionType === "approve"
          ? `/expense/approve/${selectedExpense._id}`
          : `/expense/reject/${selectedExpense._id}`;

      const body =
        actionType === "reject"
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
      setLoading((prev) => ({ ...prev, action: false }));
    }
  };

  // Delete Expense
  const handleDelete = async () => {
    if (!isAuthenticated() || !canDelete || !selectedExpense) return;

    try {
      setLoading((prev) => ({ ...prev, action: true }));

      const response = await fetchAPI(
        `/expense/delete/${selectedExpense._id}`,
        {
          method: "DELETE",
        },
      );

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
      setLoading((prev) => ({ ...prev, action: false }));
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
      vehicleType: expense.vehicleType || "None",
      fuelType: expense.fuelType || "None",
      kilometersTraveled: expense.kilometersTraveled || 0,
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
      vehicleType: "None",
      fuelType: "None",
      kilometersTraveled: 0,
    });
    setSelectedFile(null);
    setFilePreview(null);
    setSelectedExpense(null);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
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
    setPagination((prev) => ({ ...prev, page: 1 }));
    setOpenFilterDrawer(false);
  };

  const handleChangePage = (event, newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleChangeRowsPerPage = (event) => {
    setPagination((prev) => ({
      ...prev,
      limit: parseInt(event.target.value, 10),
      page: 1,
    }));
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
  }, [
    filters.period,
    filters.status,
    filters.category,
    filters.sortBy,
    pagination.page,
    pagination.limit,
  ]);

  // Calculate Display Stats
  const displayStats = useMemo(() => {
    const totalExpenses = expenses.length;
    const totalAmount = expenses.reduce(
      (sum, exp) => sum + (exp.amount || 0),
      0,
    );
    const approvedCount = expenses.filter(
      (exp) => exp.status === "Approved",
    ).length;
    const pendingCount = expenses.filter(
      (exp) => exp.status === "Pending",
    ).length;
    const approvedAmount = expenses
      .filter((exp) => exp.status === "Approved")
      .reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const pendingAmount = expenses
      .filter((exp) => exp.status === "Pending")
      .reduce((sum, exp) => sum + (exp.amount || 0), 0);

    return {
      totalExpenses,
      totalAmount,
      approvedCount,
      pendingCount,
      approvedAmount,
      pendingAmount,
    };
  }, [expenses]);

  // Loading state
  if (loading.expenses && expenses.length === 0) {
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
        open={openFilterDrawer}
        onClose={() => setOpenFilterDrawer(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        activeFilterCount={activeFilterCount}
      />

      {/* Header with Gradient Background */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.dark} 100%)`,
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
              Expense Management
            </Typography>
            <Typography
              variant="body2"
              sx={{
                opacity: 0.9,
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              }}
            >
              Track and manage all expense claims
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            {isMobile && (
              <>
                <Button
                  variant="contained"
                  startIcon={<FilterAlt />}
                  onClick={() => setOpenFilterDrawer(true)}
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
                {canCreate && (
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => {
                      resetForm();
                      setOpenModal(true);
                    }}
                    size="small"
                    sx={{
                      bgcolor: "rgba(255,255,255,0.2)",
                      color: "#fff",
                      "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                    }}
                  >
                    New
                  </Button>
                )}
              </>
            )}
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={() => {
                fetchExpenses();
                fetchStats();
              }}
              disabled={loading.expenses}
              size={isMobile ? "small" : "medium"}
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                color: "#fff",
                "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
              }}
            >
              Refresh
            </Button>
            {canCreate && !isMobile && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  resetForm();
                  setOpenModal(true);
                }}
                size={isMobile ? "small" : "medium"}
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "#fff",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                }}
              >
                New Expense
              </Button>
            )}
          </Box>
        </Stack>
      </Paper>

      {/* Main Content */}
      <Box sx={{ p: { xs: 0, sm: 0 } }}>
        {/* Stats Cards */}
        <Grid container spacing={isMobile ? 1.5 : 2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={6} md={3}>
            <StatCard
              icon={<ReceiptLong />}
              title="Total Expenses"
              value={displayStats.totalExpenses}
              color={COLORS.primary.main}
              index={0}
            />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <StatCard
              icon={<CheckCircle />}
              title="Approved"
              value={displayStats.approvedCount}
              color={COLORS.success.main}
              index={1}
            />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <StatCard
              icon={<PendingActions />}
              title="Pending"
              value={displayStats.pendingCount}
              color={COLORS.warning.main}
              index={2}
            />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <StatCard
              icon={<TrendingUp />}
              title="Average"
              value={
                expenses.length
                  ? `₹${(displayStats.totalAmount / expenses.length).toFixed(0)}`
                  : "0"
              }
              color={COLORS.info.main}
              index={3}
            />
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper sx={{ borderRadius: 3, mb: 2, overflow: "hidden" }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => {
              setActiveTab(newValue);
              handleFilterChange(
                "status",
                tabs[newValue].value !== "all" ? tabs[newValue].value : "all",
              );
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
              <Tab
                key={index}
                icon={tab.icon}
                iconPosition="start"
                label={tab.label}
              />
            ))}
          </Tabs>
        </Paper>

        {/* Mobile Search Bar */}
        {isMobile && (
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search expenses..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                endAdornment: filters.search && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => handleFilterChange("search", "")}
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
        )}

        {/* Desktop Search and Filters */}
        {!isMobile && (
          <Paper sx={{ p: 2, borderRadius: 3, mb: 2 }}>
            <Box display="flex" gap={1}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search expenses..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search
                        sx={{ fontSize: 20, color: COLORS.neutral[400] }}
                      />
                    </InputAdornment>
                  ),
                  endAdornment: filters.search && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => handleFilterChange("search", "")}
                      >
                        <Close
                          sx={{ fontSize: 16, color: COLORS.neutral[400] }}
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.category}
                  onChange={(e) =>
                    handleFilterChange("category", e.target.value)
                  }
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

              <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel>Period</InputLabel>
                <Select
                  value={filters.period}
                  onChange={(e) => handleFilterChange("period", e.target.value)}
                  label="Period"
                  sx={{ borderRadius: 2 }}
                >
                  {TIME_PERIODS.map((p) => (
                    <MenuItem key={p.value} value={p.value}>
                      {p.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                  displayEmpty
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="-createdAt">Newest First</MenuItem>
                  <MenuItem value="createdAt">Oldest First</MenuItem>
                  <MenuItem value="-amount">Highest Amount</MenuItem>
                  <MenuItem value="amount">Lowest Amount</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {activeFilterCount > 0 && (
              <Box sx={{ mt: 2 }}>
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
                      onDelete={() => handleFilterChange("search", "")}
                      sx={{
                        bgcolor: alpha(COLORS.primary.main, 0.1),
                        color: COLORS.primary.main,
                      }}
                    />
                  )}
                  {filters.category !== "all" && (
                    <Chip
                      label={`Category: ${CATEGORY_CONFIG[filters.category]?.label}`}
                      size="small"
                      onDelete={() => handleFilterChange("category", "all")}
                      sx={{
                        bgcolor: alpha(COLORS.primary.main, 0.1),
                        color: COLORS.primary.main,
                      }}
                    />
                  )}
                  {filters.status !== "all" && (
                    <Chip
                      label={`Status: ${filters.status}`}
                      size="small"
                      onDelete={() => handleFilterChange("status", "all")}
                      sx={{
                        bgcolor: alpha(COLORS.primary.main, 0.1),
                        color: COLORS.primary.main,
                      }}
                    />
                  )}
                  {filters.period !== "month" && (
                    <Chip
                      label={`Period: ${PERIOD_OPTIONS.find((p) => p.value === filters.period)?.label}`}
                      size="small"
                      onDelete={() => handleFilterChange("period", "month")}
                      sx={{
                        bgcolor: alpha(COLORS.primary.main, 0.1),
                        color: COLORS.primary.main,
                      }}
                    />
                  )}
                  <Chip
                    label="Clear All"
                    size="small"
                    variant="outlined"
                    onClick={handleResetFilters}
                    deleteIcon={<Close />}
                    onDelete={handleResetFilters}
                    sx={{
                      borderColor: COLORS.primary.main,
                      color: COLORS.primary.main,
                    }}
                  />
                </Stack>
              </Box>
            )}
          </Paper>
        )}

        {/* Content */}
        {loading.expenses ? (
          <Box>
            {[...Array(3)].map((_, i) => (
              <ExpenseCardSkeleton key={i} />
            ))}
          </Box>
        ) : expenses.length === 0 ? (
          <EmptyState
            onClearFilters={handleResetFilters}
            hasFilters={activeFilterCount > 0}
            canCreate={canCreate}
            onCreate={() => {
              resetForm();
              setOpenModal(true);
            }}
          />
        ) : (
          <>
            {isMobile || viewMode === "card" ? (
              <Box>
                {expenses.map((expense, index) => (
                  <MobileExpenseCard
                    key={expense._id}
                    expense={expense}
                    onMenuOpen={handleMenuOpen}
                    onView={(exp) => {
                      setSelectedExpense(exp);
                      setOpenViewModal(true);
                    }}
                    index={index}
                  />
                ))}
              </Box>
            ) : (
              <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
                <TableContainer>
                  <Table>
                    <TableHead
                      sx={{ bgcolor: alpha(COLORS.primary.main, 0.05) }}
                    >
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Expense</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          Created By
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          Actions
                        </TableCell>
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
              <Box
                sx={{
                  mt: 3,
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.totalItems,
                  )}{" "}
                  of {pagination.totalItems}
                </Typography>
                <Pagination
                  count={pagination.totalPages}
                  page={pagination.page}
                  onChange={handleChangePage}
                  color="primary"
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    "& .MuiPaginationItem-root": {
                      borderRadius: 2,
                      "&.Mui-selected": {
                        bgcolor: COLORS.primary.main,
                        color: "#fff",
                      },
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Mobile FAB */}
      {isMobile && canCreate && (
        <Zoom in={true}>
          <Fab
            color="primary"
            aria-label="add"
            onClick={() => {
              resetForm();
              setOpenModal(true);
            }}
            sx={{
              position: "fixed",
              bottom: 80,
              right: 16,
              zIndex: 1000,
              bgcolor: COLORS.primary.main,
              "&:hover": { bgcolor: COLORS.primary.dark },
              boxShadow: `0 4px 12px ${alpha(COLORS.primary.main, 0.3)}`,
            }}
          >
            <Add />
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
            borderTop: `1px solid ${alpha(COLORS.primary.main, 0.1)}`,
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
                "&.Mui-selected": { color: COLORS.primary.main },
              },
            }}
          >
            <BottomNavigationAction label="Expenses" icon={<ReceiptLong />} />
            <BottomNavigationAction
              label="Dashboard"
              icon={<DashboardIcon />}
            />
          </BottomNavigation>
        </Paper>
      )}

      {/* Drawers and Modals */}
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

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 180,
          },
        }}
      >
        <MenuItem onClick={() => handleMenuAction("view")} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <Visibility sx={{ fontSize: 18 }} />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>

        {selectedExpenseForMenu?.status === "Pending" &&
          canEdit &&
          (selectedExpenseForMenu.createdBy?._id === user?._id ||
            userRole === "Head_office") && (
            <MenuItem onClick={() => handleMenuAction("edit")} sx={{ py: 1.5 }}>
              <ListItemIcon>
                <Edit sx={{ fontSize: 18 }} />
              </ListItemIcon>
              <ListItemText>Edit</ListItemText>
            </MenuItem>
          )}

        {canUpdateStatus && selectedExpenseForMenu?.status === "Pending" && (
          <>
            <Divider />
            <MenuItem
              onClick={() => handleMenuAction("approve")}
              sx={{ py: 1.5, color: COLORS.success.main }}
            >
              <ListItemIcon>
                <CheckCircle
                  sx={{ fontSize: 18, color: COLORS.success.main }}
                />
              </ListItemIcon>
              <ListItemText>Approve</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => handleMenuAction("reject")}
              sx={{ py: 1.5, color: COLORS.error.main }}
            >
              <ListItemIcon>
                <Cancel sx={{ fontSize: 18, color: COLORS.error.main }} />
              </ListItemIcon>
              <ListItemText>Reject</ListItemText>
            </MenuItem>
          </>
        )}

        {canDelete && (
          <>
            <Divider />
            <MenuItem
              onClick={() => handleMenuAction("delete")}
              sx={{ py: 1.5, color: COLORS.error.main }}
            >
              <ListItemIcon>
                <Delete sx={{ fontSize: 18, color: COLORS.error.main }} />
              </ListItemIcon>
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
          sx: { borderRadius: 3 },
        }}
        fullScreen={isMobile}
        TransitionComponent={isMobile ? Slide : Fade}
        transitionDuration={300}
      >
        <DialogTitle sx={{ bgcolor: COLORS.primary.main, color: "white" }}>
          <Typography variant="h6" fontWeight="600">
            {actionType === "approve" ? "Approve Expense" : "Reject Expense"}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Alert
            severity={actionType === "approve" ? "info" : "warning"}
            sx={{ mb: 2, borderRadius: 2 }}
          >
            {actionType === "approve"
              ? "Are you sure you want to approve this expense?"
              : "Are you sure you want to reject this expense?"}
          </Alert>
          {selectedExpense && (
            <Box>
              <Typography variant="subtitle1" fontWeight="600">
                {selectedExpense.title}
              </Typography>
              <Typography
                variant="h6"
                fontWeight="700"
                sx={{
                  color: COLORS.primary.main,
                  mt: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <CurrencyRupee sx={{ fontSize: 20 }} />
                {selectedExpense.amount?.toLocaleString()}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            p: 3,
            pt: 0,
            gap: 2,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <Button
            onClick={() => setOpenApproveDialog(false)}
            disabled={loading.action}
            fullWidth={isMobile}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleStatusUpdate}
            disabled={loading.action}
            variant="contained"
            fullWidth={isMobile}
            sx={{
              borderRadius: 2,
              bgcolor:
                actionType === "approve"
                  ? COLORS.success.main
                  : COLORS.error.main,
              "&:hover": {
                bgcolor:
                  actionType === "approve"
                    ? COLORS.success.dark
                    : COLORS.error.dark,
              },
            }}
          >
            {loading.action ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : actionType === "approve" ? (
              "Approve"
            ) : (
              "Reject"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => !loading.action && setOpenDeleteDialog(false)}
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
        fullScreen={isMobile}
        TransitionComponent={isMobile ? Slide : Fade}
        transitionDuration={300}
      >
        <DialogTitle sx={{ bgcolor: COLORS.error.main, color: "white" }}>
          <Typography variant="h6" fontWeight="600">
            Delete Expense
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            This action cannot be undone.
          </Alert>
          {selectedExpense && (
            <Box>
              <Typography variant="subtitle1" fontWeight="600">
                {selectedExpense.title}
              </Typography>
              <Typography
                variant="h6"
                fontWeight="700"
                sx={{
                  color: COLORS.primary.main,
                  mt: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <CurrencyRupee sx={{ fontSize: 20 }} />
                {selectedExpense.amount?.toLocaleString()}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            p: 3,
            pt: 0,
            gap: 2,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            disabled={loading.action}
            fullWidth={isMobile}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={loading.action}
            variant="contained"
            fullWidth={isMobile}
            sx={{
              borderRadius: 2,
              bgcolor: COLORS.error.main,
              "&:hover": { bgcolor: COLORS.error.dark },
            }}
          >
            {loading.action ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : (
              "Delete"
            )}
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
          sx={{ width: "100%", borderRadius: 2, color: "#fff" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
