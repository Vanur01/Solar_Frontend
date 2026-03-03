// pages/ReportsPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  useTheme,
  useMediaQuery,
  LinearProgress,
  Snackbar,
  Paper,
  alpha,
  Avatar,
  Tooltip,
  Badge,
  Fade,
  Zoom,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import {
  BarChart,
  PieChart,
  Build,
  TrendingUp,
  Download,
  Visibility,
  Assessment,
  Close,
  CloudDownload,
  InsertDriveFile,
  Refresh,
  CheckCircle,
  Error,
  Downloading,
  People,
  ReceiptLong,
  AttachMoney,
  CalendarToday,
  Schedule,
  Info,
  FilterList,
  Search,
  Clear,
  ArrowUpward,
  ArrowDownward,
  Sort,
  DateRange,
  Category,
  Person,
  Email,
  Phone,
  Home,
  LocationOn,
  Business,
  Assignment,
  AssignmentInd,
  SupervisorAccount,
  Groups,
  AdminPanelSettings,
  WorkspacePremium,
  Receipt,
  Money,
  TrendingDown,
  TrendingFlat,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { format, parseISO, isValid, subDays, subMonths } from "date-fns";

const PRIMARY_COLOR = "#4569ea";
const SECONDARY_COLOR = "#1a237e";

// Role-based access control with proper visibility rules
const ROLE_ACCESS = {
  Head_office: {
    level: 1,
    label: "Head Office",
    icon: <AdminPanelSettings />,
    canAccess: ["leads", "installation", "expenses"],
    visibility: "all",
    description: "View all reports across organization",
  },
  ZSM: {
    level: 2,
    label: "Zone Sales Manager",
    icon: <WorkspacePremium />,
    canAccess: ["leads", "installation", "expenses"],
    visibility: "zone",
    description: "View zone-wide reports",
  },
  ASM: {
    level: 3,
    label: "Area Sales Manager",
    icon: <SupervisorAccount />,
    canAccess: ["leads", "installation", "expenses"],
    visibility: "team",
    description: "View own and team members' data",
  },
  TEAM: {
    level: 4,
    label: "Team Member",
    icon: <Groups />,
    canAccess: ["leads", "installation", "expenses"],
    visibility: "own",
    description: "View only own data",
  },
};

// Report configurations with enhanced metadata
const REPORT_CONFIGS = [
  {
    key: "leads",
    title: "Leads Report",
    description: "Lead tracking and pipeline performance",
    icon: <TrendingUp />,
    endpoint: "/report/leads",
    color: PRIMARY_COLOR,
    bgColor: alpha(PRIMARY_COLOR, 0.1),
    columns: [
      { field: "firstName", label: "First Name", type: "string" },
      { field: "lastName", label: "Last Name", type: "string" },
      { field: "email", label: "Email", type: "email" },
      { field: "phone", label: "Phone", type: "phone" },
      { field: "status", label: "Status", type: "status" },
      { field: "source", label: "Source", type: "string" },
      { field: "assignedManager", label: "Assigned ASM", type: "user" },
      { field: "assignedUser", label: "Assigned TEAM", type: "user" },
      { field: "createdAt", label: "Created Date", type: "date" },
      { field: "city", label: "City", type: "string" },
    ],
  },
  {
    key: "installation",
    title: "Installation Report",
    description: "Installation completion metrics and progress",
    icon: <Build />,
    endpoint: "/report/installations",
    color: "#4caf50",
    bgColor: alpha("#4caf50", 0.1),
    columns: [
      { field: "customerName", label: "Customer", type: "string" },
      { field: "status", label: "Status", type: "status" },
      { field: "installationDate", label: "Installation Date", type: "date" },
      {
        field: "installationStatus",
        label: "Installation Status",
        type: "status",
      },
      { field: "assignedTeam", label: "Assigned Team", type: "user" },
      { field: "completionDate", label: "Completion Date", type: "date" },
      { field: "address", label: "Address", type: "string" },
    ],
  },
  {
    key: "expenses",
    title: "Expenses Report",
    description: "Expense tracking and approval status",
    icon: <ReceiptLong />,
    endpoint: "/report/expenses",
    color: "#ff9800",
    bgColor: alpha("#ff9800", 0.1),
    columns: [
      { field: "title", label: "Title", type: "string" },
      { field: "amount", label: "Amount", type: "amount" },
      { field: "category", label: "Category", type: "string" },
      { field: "status", label: "Status", type: "status" },
      { field: "createdBy", label: "Created By", type: "user" },
      { field: "expenseDate", label: "Expense Date", type: "date" },
      { field: "approvedBy", label: "Approved By", type: "user" },
      { field: "description", label: "Description", type: "string" },
    ],
  },
];

// Mobile Card Component
const MobileReportCard = ({
  report,
  data,
  stats,
  onView,
  onDownload,
  downloading,
}) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        mb: 2,
        borderRadius: 3,
        overflow: "hidden",
        border: `1px solid ${alpha(report.color, 0.2)}`,
        position: "relative",
      }}
    >
      {downloading && (
        <LinearProgress
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            bgcolor: alpha(report.color, 0.1),
            "& .MuiLinearProgress-bar": { bgcolor: report.color },
          }}
        />
      )}

      <CardContent sx={{ p: 2.5 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: report.bgColor,
              color: report.color,
              width: 48,
              height: 48,
            }}
          >
            {report.icon}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              {report.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {report.description}
            </Typography>
          </Box>
        </Box>

        {/* Stats */}
        {stats && (
          <Box
            sx={{
              bgcolor: alpha(report.color, 0.05),
              borderRadius: 2,
              p: 2,
              mb: 2,
            }}
          >
            {Object.entries(stats).map(([key, value]) => (
              <Box
                key={key}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  {key.replace(/([A-Z])/g, " $1").trim()}:
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{ color: report.color }}
                >
                  {value}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {/* Record Count */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <InsertDriveFile
              sx={{ color: alpha(report.color, 0.5), fontSize: 18 }}
            />
            <Typography variant="body2" color="text.secondary">
              {data?.length || 0} records
            </Typography>
          </Box>
          <Chip
            label={ROLE_ACCESS[stats?.role]?.label || "View"}
            size="small"
            sx={{
              bgcolor: alpha(PRIMARY_COLOR, 0.1),
              color: PRIMARY_COLOR,
              fontSize: "0.7rem",
            }}
          />
        </Box>

        {/* Actions */}
        <Stack direction="row" spacing={1}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => onDownload(report.key)}
            disabled={downloading || !data?.length}
            startIcon={<Download />}
            size="small"
            sx={{
              bgcolor: report.color,
              borderRadius: 2,
              "&:hover": { bgcolor: SECONDARY_COLOR },
              "&:disabled": { bgcolor: alpha(report.color, 0.3) },
            }}
          >
            {downloading ? "..." : "Download"}
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => onView(report.key)}
            disabled={!data?.length}
            startIcon={<Visibility />}
            size="small"
            sx={{
              borderColor: report.color,
              color: report.color,
              borderRadius: 2,
              "&:hover": {
                borderColor: SECONDARY_COLOR,
                bgcolor: alpha(report.color, 0.05),
              },
            }}
          >
            View
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

// Desktop Report Card
const DesktopReportCard = ({
  report,
  data,
  stats,
  onView,
  onDownload,
  downloading,
}) => {
  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        bgcolor: "white",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        border: `1px solid ${alpha(report.color, 0.1)}`,
        position: "relative",
        overflow: "hidden",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          transform: "translateY(-2px)",
          borderColor: report.color,
        },
      }}
    >
      {downloading && (
        <LinearProgress
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            bgcolor: alpha(report.color, 0.1),
            "& .MuiLinearProgress-bar": { bgcolor: report.color },
          }}
        />
      )}

      <CardContent sx={{ p: 3 }}>
        {/* Header with Icon */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              bgcolor: report.bgColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: report.color,
            }}
          >
            {React.cloneElement(report.icon, { sx: { fontSize: 28 } })}
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              {report.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {report.description}
            </Typography>
          </Box>
        </Box>

        {/* Stats */}
        {stats && (
          <Box sx={{ mb: 2 }}>
            {Object.entries(stats).map(([key, value]) => (
              <Box
                key={key}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {key.replace(/([A-Z])/g, " $1").trim()}:
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight={600}
                  sx={{ color: report.color }}
                >
                  {value}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Record Count */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <InsertDriveFile
              sx={{ color: alpha(report.color, 0.5), fontSize: 20 }}
            />
            <Typography variant="body2" color="text.secondary">
              {data?.length || 0} records
            </Typography>
          </Box>
          <Chip
            label="CSV"
            size="small"
            sx={{
              bgcolor: alpha(report.color, 0.1),
              color: report.color,
              fontSize: "0.7rem",
            }}
          />
        </Box>

        {/* Action Buttons */}
        <Stack direction="row" spacing={1}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => onDownload(report.key)}
            disabled={downloading || !data?.length}
            startIcon={<Download />}
            sx={{
              bgcolor: report.color,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { bgcolor: SECONDARY_COLOR },
              "&:disabled": { bgcolor: alpha(report.color, 0.3) },
            }}
          >
            {downloading ? "Downloading..." : "Download"}
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => onView(report.key)}
            disabled={!data?.length}
            startIcon={<Visibility />}
            sx={{
              borderColor: report.color,
              color: report.color,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              "&:hover": {
                borderColor: SECONDARY_COLOR,
                bgcolor: alpha(report.color, 0.05),
              },
            }}
          >
            View
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

// Report Details Modal
const ReportDetailsModal = ({ open, onClose, report, data, userRole }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    field: null,
    direction: "asc",
  });

  if (!data || !report) return null;

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const term = searchTerm.toLowerCase();
    return data.filter((row) =>
      Object.values(row).some((val) =>
        val?.toString().toLowerCase().includes(term),
      ),
    );
  }, [data, searchTerm]);

  const sortedData = useMemo(() => {
    if (!sortConfig.field) return filteredData;
    return [...filteredData].sort((a, b) => {
      let aVal = a[sortConfig.field];
      let bVal = b[sortConfig.field];

      if (
        sortConfig.field.includes("Date") ||
        sortConfig.field.includes("At")
      ) {
        aVal = aVal ? new Date(aVal) : new Date(0);
        bVal = bVal ? new Date(bVal) : new Date(0);
      }

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const paginatedData = sortedData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const handleSort = (field) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const formatCellValue = (value, column) => {
    if (!value && value !== 0) return "—";

    switch (column.type) {
      case "date":
        return formatDate(value);
      case "amount":
        return `₹${Number(value).toLocaleString()}`;
      case "user":
        if (typeof value === "object") {
          return (
            `${value.firstName || ""} ${value.lastName || ""}`.trim() || "—"
          );
        }
        return value;
      case "status":
        return (
          <Chip
            label={value}
            size="small"
            sx={{
              bgcolor: alpha(PRIMARY_COLOR, 0.1),
              color: PRIMARY_COLOR,
              fontSize: "0.7rem",
              height: 24,
            }}
          />
        );
      default:
        return value;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 3,
          overflow: "hidden",
          height: isMobile ? "100%" : "auto",
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: PRIMARY_COLOR,
          color: "white",
          py: 2,
          px: { xs: 2, sm: 3 },
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {React.cloneElement(report.icon, { sx: { color: "white" } })}
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {report.title}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {filteredData.length} records • {userRole} view
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: "white" }}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Search Bar */}
        <Box
          sx={{ p: { xs: 2, sm: 3 }, borderBottom: 1, borderColor: "divider" }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Search in report..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "text.secondary", fontSize: 20 }} />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm("")}>
                    <Close fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Table */}
        {paginatedData.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8, px: 2 }}>
            <Assessment sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              {searchTerm ? "No matching records found" : "No data available"}
            </Typography>
            {searchTerm && (
              <Button
                variant="text"
                onClick={() => setSearchTerm("")}
                sx={{ mt: 2, color: PRIMARY_COLOR }}
              >
                Clear Search
              </Button>
            )}
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: "50vh", overflow: "auto" }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {report.columns.map((col) => (
                    <TableCell
                      key={col.field}
                      sx={{
                        bgcolor: alpha(PRIMARY_COLOR, 0.05),
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        cursor: "pointer",
                      }}
                      onClick={() => handleSort(col.field)}
                    >
                      <Box display="flex" alignItems="center" gap={0.5}>
                        {col.label}
                        {sortConfig.field === col.field &&
                          (sortConfig.direction === "asc" ? (
                            <ArrowUpward sx={{ fontSize: 16 }} />
                          ) : (
                            <ArrowDownward sx={{ fontSize: 16 }} />
                          ))}
                      </Box>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map((row, index) => (
                  <TableRow
                    key={index}
                    hover
                    sx={{
                      "&:hover": { bgcolor: alpha(PRIMARY_COLOR, 0.02) },
                    }}
                  >
                    {report.columns.map((col) => (
                      <TableCell
                        key={col.field}
                        sx={{
                          whiteSpace: "nowrap",
                          maxWidth: 200,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {formatCellValue(row[col.field], col)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Pagination */}
        {filteredData.length > 0 && (
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
            <Typography variant="body2" color="text.secondary">
              Showing {page * rowsPerPage + 1} to{" "}
              {Math.min((page + 1) * rowsPerPage, filteredData.length)} of{" "}
              {filteredData.length} entries
            </Typography>
            <TablePagination
              component="div"
              count={filteredData.length}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
              sx={{ m: 0 }}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          p: { xs: 2, sm: 3 },
          bgcolor: "grey.50",
          borderTop: 1,
          borderColor: "divider",
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          fullWidth={isMobile}
          sx={{
            borderRadius: 2,
            px: 4,
            borderColor: PRIMARY_COLOR,
            color: PRIMARY_COLOR,
            "&:hover": {
              borderColor: SECONDARY_COLOR,
              bgcolor: alpha(PRIMARY_COLOR, 0.05),
            },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Utility function to format dates
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const parsedDate = parseISO(dateString);
    return isValid(parsedDate)
      ? format(parsedDate, "MMM dd, yyyy")
      : "Invalid date";
  } catch {
    return "Invalid date";
  }
};

export default function ReportsPage() {
  const { user, fetchAPI } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const userRole = user?.role || "TEAM";
  const roleConfig = ROLE_ACCESS[userRole] || ROLE_ACCESS.TEAM;

  // State management
  const [loading, setLoading] = useState(true);
  const [reportsData, setReportsData] = useState({});
  const [reportsStats, setReportsStats] = useState({});
  const [downloading, setDownloading] = useState({});
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [dateRange, setDateRange] = useState("month");
  const [anchorEl, setAnchorEl] = useState(null);

  // Filter reports based on role access
  const accessibleReports = REPORT_CONFIGS.filter((report) =>
    roleConfig.canAccess.includes(report.key),
  );

  // Show snackbar message
  const showSnackbar = useCallback((message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  // Fetch all reports data
  const fetchAllReports = useCallback(async () => {
    setLoading(true);
    try {
      const results = {};
      const stats = {};

      for (const report of accessibleReports) {
        try {
          // Add date range filter based on role
          let endpoint = report.endpoint;
          const params = new URLSearchParams();

          if (dateRange === "today") {
            params.append("fromDate", format(new Date(), "yyyy-MM-dd"));
            params.append("toDate", format(new Date(), "yyyy-MM-dd"));
          } else if (dateRange === "week") {
            params.append(
              "fromDate",
              format(subDays(new Date(), 7), "yyyy-MM-dd"),
            );
            params.append("toDate", format(new Date(), "yyyy-MM-dd"));
          } else if (dateRange === "month") {
            params.append(
              "fromDate",
              format(subMonths(new Date(), 1), "yyyy-MM-dd"),
            );
            params.append("toDate", format(new Date(), "yyyy-MM-dd"));
          }

          const queryString = params.toString();
          if (queryString) {
            endpoint += `?${queryString}`;
          }

          const response = await fetchAPI(endpoint);

          if (response?.success) {
            const result = response.result || {};

            // Handle different response structures
            let data = [];
            if (report.key === "leads") {
              data = result.leads || [];
              stats[report.key] = {
                totalLeads: result.summary?.totalLeads || data.length,
                activeLeads: result.summary?.activeLeads || 0,
                convertedLeads: result.summary?.convertedLeads || 0,
                role: userRole,
              };
            } else if (report.key === "installation") {
              data = result.installations || [];
              stats[report.key] = {
                total: result.summary?.total || data.length,
                completed: result.summary?.completed || 0,
                pending: result.summary?.pending || 0,
                role: userRole,
              };
            } else if (report.key === "expenses") {
              data = result.expenses || [];
              stats[report.key] = {
                total: result.summary?.totalExpenses || data.length,
                amount: `₹${(result.summary?.totalAmount || 0).toLocaleString()}`,
                approved: result.summary?.approved?.count || 0,
                pending: result.summary?.pending?.count || 0,
                role: userRole,
              };
            }

            results[report.key] = data;
          } else {
            results[report.key] = [];
            console.error(
              `Failed to fetch ${report.title}:`,
              response?.message,
            );
          }
        } catch (error) {
          console.error(`Error fetching ${report.title}:`, error);
          results[report.key] = [];
        }
      }

      setReportsData(results);
      setReportsStats(stats);
    } catch (error) {
      console.error("Error fetching reports:", error);
      showSnackbar("Failed to load reports", "error");
    } finally {
      setLoading(false);
    }
  }, [accessibleReports, fetchAPI, dateRange, userRole, showSnackbar]);

  // Initial fetch
  useEffect(() => {
    fetchAllReports();
  }, [fetchAllReports, dateRange]);

  // Handle view report
  const handleView = (reportKey) => {
    const report = accessibleReports.find((r) => r.key === reportKey);
    setSelectedReport({
      ...report,
      data: reportsData[reportKey] || [],
    });
    setViewModalOpen(true);
  };

  // Handle download report
  const handleDownload = async (reportKey) => {
    const report = accessibleReports.find((r) => r.key === reportKey);
    const data = reportsData[reportKey] || [];

    if (data.length === 0) {
      showSnackbar("No data available to download", "warning");
      return;
    }

    setDownloading((prev) => ({ ...prev, [reportKey]: true }));

    try {
      await downloadCSV(report, data);
      showSnackbar(`${report.title} downloaded successfully!`, "success");
    } catch (error) {
      console.error("Download failed:", error);
      showSnackbar(`Failed to download ${report.title}`, "error");
    } finally {
      setDownloading((prev) => ({ ...prev, [reportKey]: false }));
    }
  };

  // Handle bulk download
  const handleBulkDownload = async () => {
    const reportsWithData = accessibleReports.filter(
      (r) => reportsData[r.key]?.length > 0,
    );

    if (reportsWithData.length === 0) {
      showSnackbar("No data available to download", "warning");
      return;
    }

    setAnchorEl(null);

    for (const report of reportsWithData) {
      await handleDownload(report.key);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    showSnackbar("All reports downloaded successfully!", "success");
  };

  // Download CSV function
  const downloadCSV = async (report, data) => {
    const headers = report.columns.map((col) => col.label);
    const rows = data.map((item) =>
      report.columns
        .map((col) => {
          let value = item[col.field];

          if (typeof value === "object" && value !== null) {
            if (col.type === "user") {
              value = `${value.firstName || ""} ${value.lastName || ""}`.trim();
            } else {
              value = JSON.stringify(value);
            }
          }

          if (col.type === "date" && value) {
            value = formatDate(value);
          }

          if (col.type === "amount" && value) {
            value = `₹${value}`;
          }

          const escapedValue = String(value || "").replace(/"/g, '""');
          return value?.toString().includes(",")
            ? `"${escapedValue}"`
            : escapedValue;
        })
        .join(","),
    );

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${report.title.replace(/\s+/g, "_")}_${format(
      new Date(),
      "yyyy-MM-dd",
    )}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle menu open
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle date range change
  const handleDateRangeChange = (range) => {
    setDateRange(range);
    handleMenuClose();
  };

  // Loading skeletons
  if (loading && !Object.keys(reportsData).length) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={3}>
          <Skeleton
            variant="rectangular"
            height={60}
            sx={{ borderRadius: 2 }}
          />
          <Grid container spacing={3}>
            {[1, 2, 3].map((i) => (
              <Grid item xs={12} md={4} key={i}>
                <Skeleton
                  variant="rectangular"
                  height={300}
                  sx={{ borderRadius: 3 }}
                />
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        bgcolor: "#ffffff",
        minHeight: "100vh",
      }}
    >
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
            variant={isMobile ? "h6" : "h5"}
            fontWeight={700}
            gutterBottom
            sx={{ color: PRIMARY_COLOR }}
          >
            Reports Dashboard
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
          >
            <Typography variant="body2" color="text.secondary">
              Viewing as:
            </Typography>
            <Chip
              icon={roleConfig.icon}
              label={roleConfig.label}
              size="small"
              sx={{
                bgcolor: alpha(PRIMARY_COLOR, 0.1),
                color: PRIMARY_COLOR,
                fontWeight: 600,
              }}
            />
            <Typography variant="caption" color="text.secondary">
              • {roleConfig.description}
            </Typography>
          </Stack>
        </Box>

        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
          {/* Date Range Filter */}
          <Button
            variant="outlined"
            startIcon={<DateRange />}
            onClick={handleMenuOpen}
            size={isMobile ? "small" : "medium"}
            sx={{
              borderColor: PRIMARY_COLOR,
              color: PRIMARY_COLOR,
              "&:hover": {
                borderColor: SECONDARY_COLOR,
                bgcolor: alpha(PRIMARY_COLOR, 0.05),
              },
            }}
          >
            {dateRange === "today"
              ? "Today"
              : dateRange === "week"
                ? "This Week"
                : "This Month"}
          </Button>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: { borderRadius: 2, minWidth: 150 },
            }}
          >
            <MenuItem onClick={() => handleDateRangeChange("today")}>
              <ListItemText>Today</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleDateRangeChange("week")}>
              <ListItemText>This Week</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleDateRangeChange("month")}>
              <ListItemText>This Month</ListItemText>
            </MenuItem>
          </Menu>

          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchAllReports}
            disabled={loading}
            size={isMobile ? "small" : "medium"}
            sx={{
              borderColor: PRIMARY_COLOR,
              color: PRIMARY_COLOR,
              "&:hover": {
                borderColor: SECONDARY_COLOR,
                bgcolor: alpha(PRIMARY_COLOR, 0.05),
              },
            }}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            startIcon={<CloudDownload />}
            onClick={handleBulkDownload}
            disabled={
              loading ||
              accessibleReports.every((r) => !reportsData[r.key]?.length)
            }
            size={isMobile ? "small" : "medium"}
            sx={{
              bgcolor: PRIMARY_COLOR,
              "&:hover": { bgcolor: SECONDARY_COLOR },
            }}
          >
            {isMobile ? "Download" : "Download All"}
          </Button>
        </Stack>
      </Stack>

      {/* Reports Grid */}
      {accessibleReports.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Assessment
            sx={{ fontSize: 64, color: alpha(PRIMARY_COLOR, 0.3), mb: 2 }}
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No reports available for your role
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Contact your administrator for access.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {accessibleReports.map((report) => (
            <Grid item xs={12} md={4} key={report.key}>
              {isMobile ? (
                <MobileReportCard
                  report={report}
                  data={reportsData[report.key]}
                  stats={reportsStats[report.key]}
                  onView={handleView}
                  onDownload={handleDownload}
                  downloading={downloading[report.key]}
                />
              ) : (
                <DesktopReportCard
                  report={report}
                  data={reportsData[report.key]}
                  stats={reportsStats[report.key]}
                  onView={handleView}
                  onDownload={handleDownload}
                  downloading={downloading[report.key]}
                />
              )}
            </Grid>
          ))}
        </Grid>
      )}

      {/* Empty State */}
      {!loading &&
        accessibleReports.length > 0 &&
        accessibleReports.every((r) => !reportsData[r.key]?.length) && (
          <Box sx={{ textAlign: "center", py: 8, mt: 4 }}>
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                bgcolor: alpha(PRIMARY_COLOR, 0.05),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 3,
              }}
            >
              <Info sx={{ fontSize: 60, color: alpha(PRIMARY_COLOR, 0.3) }} />
            </Box>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No data available for the selected period
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Try changing the date range or check back later.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchAllReports}
              sx={{
                borderColor: PRIMARY_COLOR,
                color: PRIMARY_COLOR,
                "&:hover": {
                  borderColor: SECONDARY_COLOR,
                  bgcolor: alpha(PRIMARY_COLOR, 0.05),
                },
              }}
            >
              Refresh Data
            </Button>
          </Box>
        )}

      {/* Footer */}
      <Box
        sx={{
          mt: 6,
          pt: 3,
          borderTop: `1px solid ${alpha(PRIMARY_COLOR, 0.1)}`,
          textAlign: "center",
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Logged in as: {user?.firstName} {user?.lastName} • Role:{" "}
          {roleConfig.label} • Reports: {accessibleReports.length} • Last
          updated: {format(new Date(), "MMM dd, yyyy HH:mm")}
        </Typography>
      </Box>

      {/* View Details Modal */}
      <ReportDetailsModal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedReport(null);
        }}
        report={selectedReport}
        data={selectedReport?.data || []}
        userRole={roleConfig.label}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            width: "100%",
            color: "#fff",
            bgcolor:
              snackbar.severity === "success" ? PRIMARY_COLOR : undefined,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
