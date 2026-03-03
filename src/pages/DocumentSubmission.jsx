// pages/DocumentSubmissionPage.jsx
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
  Card,
  Grid,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  CardContent,
  Tooltip,
  InputAdornment,
  Pagination,
  Avatar,
  alpha,
  useTheme,
  useMediaQuery,
  Paper,
  Divider,
  LinearProgress,
  FormHelperText,
  Menu,
  Skeleton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tab,
  Tabs,
  Badge,
} from "@mui/material";
import {
  Search,
  Download,
  Edit,
  Visibility,
  Close,
  CheckCircle,
  Clear,
  Refresh,
  Cancel,
  PendingActions,
  Verified,
  FileCopy,
  FolderOpen,
  PictureAsPdf,
  Image as ImageIcon,
  InsertDriveFile,
  Launch,
  PictureAsPdfOutlined,
  DescriptionOutlined,
  GetApp,
  AccountBalance,
  Badge as BadgeIcon,
  CloudUpload,
  Delete,
  CreditCard,
  CloudDownload,
  Add,
  ZoomIn,
  ZoomOut,
  RotateLeft,
  RotateRight,
  Fullscreen,
  FullscreenExit,
  Person,
  CalendarToday,
  Email,
  Phone,
  LocationOn,
  Note,
  Warning,
  FilterList,
  Tune,
  ArrowUpward,
  ArrowDownward,
  Description,
  Save,
  ArrowForward,
  ArrowBack,
  MoreVert,
  TrendingUp,
  Assignment,
  Business,
  HowToReg,
  LocalAtm,
  Build,
  Error as ErrorIcon,
  Check,
  Home,
  ReceiptLong,
  AttachFile,
  AccessTime,
  Security,
  SupervisorAccount,
  Groups,
  AdminPanelSettings,
  WorkspacePremium,
  AddPhotoAlternate,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  format,
  isValid,
  parseISO,
  isWithinInterval,
  startOfDay,
  endOfDay,
} from "date-fns";
import { useNavigate } from "react-router-dom";
import AlertTitle from "@mui/material/AlertTitle";

// ========== CONSTANTS & CONFIGURATION ==========
const PRIMARY = "#4569ea";
const SECONDARY = "#3451b3";
const ITEMS_PER_PAGE_OPTIONS = [5, 10, 25, 50];
const DEFAULT_ITEMS_PER_PAGE = 10;
const ALLOWED_ROLES = ["Head_office", "ZSM", "ASM", "TEAM"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "application/pdf",
];

// Lead Status Configuration for Document Submission Page
const LEAD_STATUS_OPTIONS = [
  "Document Submission",
  "Bank at Pending",
  "Missed Leads",
];

const LEAD_STATUS_CONFIG = {
  "Document Submission": {
    bg: "#fff3e0",
    color: "#4569ea",
    icon: <Description sx={{ fontSize: 16 }} />,
    description: "Documents submitted for verification",
  },
  "Bank at Pending": {
    bg: "#ffebee",
    color: "#4569ea",
    icon: <PendingActions sx={{ fontSize: 16 }} />,
    description: "Waiting for bank approval",
  },
  "Missed Leads": {
    bg: "#ffebee",
    color: "#4569ea",
    icon: <Cancel sx={{ fontSize: 16 }} />,
    description: "Lead lost or not converted",
  },
};

// Document Status Configuration
const DOCUMENT_STATUS_CONFIG = {
  submitted: {
    bg: "#e3f2fd",
    color: "#3451b3",
    label: "Submitted",
    icon: <CheckCircle sx={{ fontSize: 16 }} />,
  },
  pending: {
    bg: "#fff3e0",
    color: "#3451b3",
    label: "Pending",
    icon: <PendingActions sx={{ fontSize: 16 }} />,
  },
  rejected: {
    bg: "#ffebee",
    color: "#3451b3",
    label: "Rejected",
    icon: <Cancel sx={{ fontSize: 16 }} />,
  },
};

// Role Configuration
const ROLE_CONFIG = {
  Head_office: {
    label: "Head Office",
    color: "#3451b3",
    icon: <AdminPanelSettings sx={{ fontSize: 16 }} />,
  },
  ZSM: {
    label: "Zone Sales Manager",
    color: "#3451b3",
    icon: <WorkspacePremium sx={{ fontSize: 16 }} />,
  },
  ASM: {
    label: "Area Sales Manager",
    color: "#3451b3",
    icon: <SupervisorAccount sx={{ fontSize: 16 }} />,
  },
  TEAM: {
    label: "Team Member",
    color: "#3451b3",
    icon: <Groups sx={{ fontSize: 16 }} />,
  },
};

// ========== HELPER FUNCTIONS ==========
const hasAccess = (userRole) => ALLOWED_ROLES.includes(userRole);

const getUserPermissions = (userRole) => ({
  canView: ["Head_office", "ZSM", "ASM", "TEAM"].includes(userRole),
  canEdit: ["Head_office", "ZSM", "ASM", "TEAM"].includes(userRole),
  canDelete: userRole === "Head_office",
  canManage: ["Head_office", "ZSM", "ASM", "TEAM"].includes(userRole),
  canSeeAll: ["Head_office", "ZSM", "ASM", "TEAM"].includes(userRole),
  canSeeOwn: userRole === "TEAM",
  canUpdateStatus: ["Head_office", "ZSM", "ASM", "TEAM"].includes(userRole),
});

const getDocumentStatusColor = (status) => {
  const normalizedStatus = status?.toLowerCase();
  return (
    DOCUMENT_STATUS_CONFIG[normalizedStatus] || {
      bg: "#f5f5f5",
      color: "#757575",
      label: "Not Submitted",
      icon: <PendingActions sx={{ fontSize: 16 }} />,
    }
  );
};

const getLeadStatusConfig = (status) => {
  return (
    LEAD_STATUS_CONFIG[status] || {
      bg: "#f5f5f5",
      color: "#616161",
      icon: <Warning sx={{ fontSize: 16 }} />,
      description: "Unknown status",
    }
  );
};

const getRoleConfig = (role) => {
  return (
    ROLE_CONFIG[role] || {
      label: "Unknown",
      color: "#757575",
      icon: <Person sx={{ fontSize: 16 }} />,
    }
  );
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const formatDate = (dateString, formatStr = "dd MMM yyyy, hh:mm a") => {
  if (!dateString) return "Not set";
  try {
    const date = parseISO(dateString);
    return isValid(date) ? format(date, formatStr) : "Invalid Date";
  } catch {
    return "Invalid Date";
  }
};

// ========== FILE UPLOAD FIELD COMPONENT ==========
const FileUploadField = React.memo(
  ({ label, field, value, onFileChange, onRemove, validationErrors }) => {
    const fileInputRef = useRef(null);

    const handleBoxClick = useCallback(() => {
      fileInputRef.current?.click();
    }, []);

    const handleFileSelect = useCallback(
      (event) => {
        onFileChange(field, event);
      },
      [field, onFileChange],
    );

    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
          {label}
        </Typography>
        {value?.preview || value?.url ? (
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{
                border: "1px solid",
                borderColor: validationErrors[field] ? "error.main" : "#e0e0e0",
                borderRadius: 2,
                p: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                bgcolor: "#f9f9f9",
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{ flex: 1 }}
              >
                {value.preview ? (
                  <img
                    src={value.preview}
                    alt="Preview"
                    style={{
                      width: 40,
                      height: 40,
                      objectFit: "cover",
                      borderRadius: 4,
                    }}
                  />
                ) : value.url ? (
                  <DescriptionOutlined sx={{ color: PRIMARY, fontSize: 40 }} />
                ) : (
                  <ImageIcon sx={{ color: PRIMARY, fontSize: 40 }} />
                )}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" noWrap>
                    {value.file?.name ||
                      (value.url ? label : "No file selected")}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {value.file
                      ? formatFileSize(value.file.size)
                      : value.url
                        ? "Existing document"
                        : "Click to upload"}
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Tooltip title="Remove">
                  <IconButton
                    size="small"
                    onClick={() => onRemove(field)}
                    color="error"
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>
            {validationErrors[field] && (
              <FormHelperText error>{validationErrors[field]}</FormHelperText>
            )}
          </Box>
        ) : (
          <Box
            sx={{
              border: "2px dashed",
              borderColor: validationErrors[field] ? "error.main" : "#e0e0e0",
              borderRadius: 2,
              p: 3,
              textAlign: "center",
              bgcolor: "#f9f9f9",
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": {
                borderColor: PRIMARY,
                bgcolor: alpha(PRIMARY, 0.05),
              },
            }}
            onClick={handleBoxClick}
          >
            <CloudUpload sx={{ fontSize: 48, color: "#bdbdbd", mb: 1 }} />
            <Typography color="text.secondary">
              Click to upload {label}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Supports JPG, PNG, PDF (Max 5MB)
            </Typography>
          </Box>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          style={{ display: "none" }}
          onChange={handleFileSelect}
        />
      </Box>
    );
  },
);

FileUploadField.displayName = "FileUploadField";

// ========== IMAGE VIEWER MODAL ==========
const ImageViewerModal = React.memo(({ open, onClose, imageUrl, title }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const handleZoomIn = useCallback(
    () => setZoom((prev) => Math.min(prev + 0.25, 3)),
    [],
  );
  const handleZoomOut = useCallback(
    () => setZoom((prev) => Math.max(prev - 0.25, 0.5)),
    [],
  );
  const handleRotateRight = useCallback(
    () => setRotation((prev) => (prev + 90) % 360),
    [],
  );
  const handleRotateLeft = useCallback(
    () => setRotation((prev) => (prev - 90) % 360),
    [],
  );
  const handleReset = useCallback(() => {
    setZoom(1);
    setRotation(0);
  }, []);

  const handleClose = useCallback(() => {
    handleReset();
    onClose();
  }, [handleReset, onClose]);

  const isImage = useMemo(
    () => imageUrl && /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(imageUrl),
    [imageUrl],
  );

  const handleDownload = useCallback(() => {
    if (!imageUrl) return;
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `document_${Date.now()}`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [imageUrl]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={fullscreen ? false : "lg"}
      fullWidth
      fullScreen={fullscreen}
      PaperProps={fullscreen ? { style: { margin: 0, height: "100vh" } } : {}}
    >
      <DialogTitle
        sx={{
          bgcolor: alpha(PRIMARY, 0.05),
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pr: 2,
          py: 1.5,
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          {title || "Document Viewer"}
        </Typography>
        <Box display="flex" gap={1}>
          <Tooltip title={fullscreen ? "Exit Fullscreen" : "Fullscreen"}>
            <IconButton onClick={() => setFullscreen(!fullscreen)} size="small">
              {fullscreen ? <FullscreenExit /> : <Fullscreen />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Download">
            <IconButton onClick={handleDownload} size="small">
              <GetApp />
            </IconButton>
          </Tooltip>
          <Tooltip title="Close">
            <IconButton onClick={handleClose} size="small">
              <Close />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>
      <DialogContent
        sx={{
          p: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: fullscreen ? "#000" : "transparent",
          minHeight: fullscreen ? "calc(100vh - 64px)" : 400,
        }}
      >
        {isImage ? (
          <Box
            sx={{
              position: "relative",
              overflow: "auto",
              maxWidth: "100%",
              maxHeight: fullscreen ? "100vh" : "70vh",
              p: fullscreen ? 0 : 2,
            }}
          >
            <img
              src={imageUrl}
              alt="Document"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transition: "transform 0.3s ease",
                maxWidth: "100%",
                maxHeight: fullscreen ? "100vh" : "70vh",
                display: "block",
                margin: "0 auto",
              }}
            />
          </Box>
        ) : (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <DescriptionOutlined
              sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Document Preview Not Available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This file type cannot be previewed. Please download to view.
            </Typography>
            <Button
              variant="contained"
              startIcon={<GetApp />}
              onClick={handleDownload}
              sx={{
                mt: 2,
                bgcolor: PRIMARY,
                "&:hover": { bgcolor: SECONDARY },
              }}
            >
              Download Document
            </Button>
          </Box>
        )}
      </DialogContent>
      {isImage && (
        <DialogActions
          sx={{
            bgcolor: "background.paper",
            borderTop: 1,
            borderColor: "divider",
            justifyContent: "center",
            gap: 1,
            py: 1.5,
          }}
        >
          <Tooltip title="Zoom In">
            <IconButton onClick={handleZoomIn} size="small">
              <ZoomIn />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom Out">
            <IconButton onClick={handleZoomOut} size="small">
              <ZoomOut />
            </IconButton>
          </Tooltip>
          <Tooltip title="Rotate Right">
            <IconButton onClick={handleRotateRight} size="small">
              <RotateRight />
            </IconButton>
          </Tooltip>
          <Tooltip title="Rotate Left">
            <IconButton onClick={handleRotateLeft} size="small">
              <RotateLeft />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reset">
            <IconButton onClick={handleReset} size="small">
              <Refresh />
            </IconButton>
          </Tooltip>
          <Typography variant="caption" sx={{ ml: 2, color: "text.secondary" }}>
            {Math.round(zoom * 100)}% • {rotation}°
          </Typography>
        </DialogActions>
      )}
    </Dialog>
  );
});

ImageViewerModal.displayName = "ImageViewerModal";

// ========== DOCUMENT CARD COMPONENT ==========
const DocumentCard = React.memo(
  ({ title, url, icon, filename, onView, onDownload }) => {
    const handleView = useCallback(() => {
      if (onView) onView(url, title);
    }, [onView, url, title]);

    const handleDownload = useCallback(() => {
      if (onDownload) onDownload(url, filename);
    }, [onDownload, url, filename]);

    return (
      <Card
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 2,
          height: "100%",
          width: "350px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          {icon}
          <Typography variant="body2" fontWeight={600} noWrap>
            {title}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ mt: "auto" }}>
          <Button
            fullWidth
            size="small"
            variant="outlined"
            startIcon={<Visibility />}
            onClick={handleView}
            sx={{
              borderColor: PRIMARY,
              color: PRIMARY,
              "&:hover": {
                borderColor: PRIMARY,
                bgcolor: alpha(PRIMARY, 0.05),
              },
            }}
          >
            View
          </Button>
          <Button
            fullWidth
            size="small"
            variant="contained"
            startIcon={<GetApp />}
            onClick={handleDownload}
            sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: SECONDARY } }}
          >
            Download
          </Button>
        </Stack>
      </Card>
    );
  },
);

DocumentCard.displayName = "DocumentCard";

// ========== LEAD STATUS UPDATE MODAL ==========
const LeadStatusUpdateModal = React.memo(
  ({ open, onClose, lead, onStatusUpdate, showSnackbar }) => {
    const { fetchAPI, user } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const [loading, setLoading] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState("");
    const [errors, setErrors] = useState({});

    const leadStatusConfig = useMemo(
      () => getLeadStatusConfig(lead?.status),
      [lead?.status],
    );

    useEffect(() => {
      if (open && lead) {
        setSelectedStatus(lead.status || "");
        setErrors({});
      }
    }, [open, lead]);

    const handleSubmit = useCallback(async () => {
      if (!selectedStatus) {
        setErrors({ status: "Please select a status" });
        return;
      }

      if (selectedStatus === lead?.status) {
        onClose();
        return;
      }

      setLoading(true);
      try {
        const updateData = {
          status: selectedStatus,
          updatedBy: user?._id,
          updatedByRole: user?.role,
        };

        const response = await fetchAPI(`/lead/updateLead/${lead._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        });

        if (response.success) {
          showSnackbar("Lead status updated successfully", "success");
          onStatusUpdate(response.result);
          onClose();
        } else {
          throw new Error(response.message || "Failed to update status");
        }
      } catch (error) {
        console.error("Error updating lead status:", error);
        setErrors({ submit: error.message });
        showSnackbar(error.message || "Failed to update status", "error");
      } finally {
        setLoading(false);
      }
    }, [
      selectedStatus,
      lead,
      user,
      fetchAPI,
      showSnackbar,
      onStatusUpdate,
      onClose,
    ]);

    const handleClose = useCallback(() => {
      setSelectedStatus("");
      setErrors({});
      onClose();
    }, [onClose]);

    const availableStatuses = useMemo(
      () => LEAD_STATUS_OPTIONS.filter((status) => status !== lead?.status),
      [lead?.status],
    );

    if (!lead) return null;

    return (
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ bgcolor: alpha(PRIMARY, 0.05), pb: 2 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: `${PRIMARY}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: PRIMARY,
                }}
              >
                <TrendingUp sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Update Lead Status
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {lead?.firstName} {lead?.lastName}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={handleClose} size="medium">
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ py: 3 }}>
          <Stack spacing={3}>
            {errors.submit && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {errors.submit}
              </Alert>
            )}

            <Box>
              <Typography
                variant="subtitle2"
                fontWeight={600}
                gutterBottom
                sx={{ mt: 2 }}
              >
                Current Status
              </Typography>
              <Chip
                label={lead?.status || "Unknown"}
                icon={leadStatusConfig.icon}
                sx={{
                  bgcolor: leadStatusConfig.bg,
                  color: leadStatusConfig.color,
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  px: 1,
                }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: "block" }}
              >
                {leadStatusConfig.description}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                New Status *
              </Typography>
              <FormControl fullWidth size="small" error={!!errors.status}>
                <Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    Select new status
                  </MenuItem>
                  {availableStatuses.map((status) => {
                    const config = getLeadStatusConfig(status);
                    return (
                      <MenuItem key={status} value={status}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1.5}
                        >
                          {config.icon}
                          <Box>
                            <Typography variant="body2">{status}</Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {config.description}
                            </Typography>
                          </Box>
                        </Stack>
                      </MenuItem>
                    );
                  })}
                </Select>
                {errors.status && (
                  <FormHelperText>{errors.status}</FormHelperText>
                )}
              </FormControl>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{ p: 3, pt: 2, borderTop: 1, borderColor: "divider", gap: 2 }}
        >
          <Button
            onClick={handleClose}
            variant="outlined"
            size="large"
            disabled={loading}
            sx={{
              borderColor: PRIMARY,
              color: PRIMARY,
              "&:hover": {
                borderColor: PRIMARY,
                bgcolor: alpha(PRIMARY, 0.05),
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            size="large"
            disabled={
              loading || !selectedStatus || selectedStatus === lead?.status
            }
            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
            sx={{
              bgcolor: PRIMARY,
              px: 4,
              "&:hover": { bgcolor: SECONDARY },
              "&.Mui-disabled": {
                bgcolor: "#ccc",
              },
            }}
          >
            {loading ? "Updating..." : "Update Status"}
          </Button>
        </DialogActions>
      </Dialog>
    );
  },
);

LeadStatusUpdateModal.displayName = "LeadStatusUpdateModal";

// ========== VIEW LEAD MODAL ==========
const ViewLeadModal = React.memo(
  ({ open, onClose, lead, userRole, showSnackbar, handleViewDocument }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [activeTab, setActiveTab] = useState(0);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [leadDetails, setLeadDetails] = useState(null);

    const userRoleConfig = useMemo(() => getRoleConfig(userRole), [userRole]);

    useEffect(() => {
      if (open && lead?._id) {
        setLeadDetails(lead);
      }
    }, [open, lead]);

    const handleTabChange = (event, newValue) => {
      setActiveTab(newValue);
    };

    const handleDownload = (url, filename) => {
      if (!url) {
        showSnackbar("No document available to download", "error");
        return;
      }
      const link = document.createElement("a");
      link.href = url;
      link.download = filename || "document";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    if (!lead) return null;

    const displayData = leadDetails || lead;

    const tabs = [
      {
        label: "Basic Info",
        icon: <Person />,
        content: (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 2, width: "450px" }}>
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      marginBottom: "20px",
                      color: PRIMARY,
                    }}
                  >
                    <Person /> Personal Information
                  </Typography>
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Full Name
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {displayData.firstName} {displayData.lastName}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1">
                        {displayData.email || "Not set"}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Phone
                      </Typography>
                      <Typography variant="body1">
                        {displayData.phone || "Not set"}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Address
                      </Typography>
                      <Typography variant="body1">
                        {displayData.address || "Not set"}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        City
                      </Typography>
                      <Typography variant="body1">
                        {displayData.city || "Not set"}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} sx={{ width: "450px" }}>
              <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      marginBottom: "20px",
                      color: PRIMARY,
                    }}
                  >
                    <Description /> Document Information
                  </Typography>
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Document Status
                      </Typography>
                      <Chip
                        label={
                          getDocumentStatusColor(displayData.documentStatus)
                            .label
                        }
                        icon={
                          getDocumentStatusColor(displayData.documentStatus)
                            .icon
                        }
                        size="small"
                        sx={{
                          bgcolor: getDocumentStatusColor(
                            displayData.documentStatus,
                          ).bg,
                          color: getDocumentStatusColor(
                            displayData.documentStatus,
                          ).color,
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Lead Status
                      </Typography>
                      <Chip
                        label={displayData.status || "Unknown"}
                        icon={getLeadStatusConfig(displayData.status).icon}
                        size="small"
                        sx={{
                          bgcolor: getLeadStatusConfig(displayData.status).bg,
                          color: getLeadStatusConfig(displayData.status).color,
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Submission Date
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(displayData.documentSubmissionDate)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Created Date
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(displayData.createdAt)}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ),
      },
      {
        label: "Documents",
        icon: <FolderOpen />,
        content: (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Uploaded Documents
            </Typography>
            <Grid container spacing={2}>
              {displayData.aadhaar?.url && (
                <Grid item xs={12} sm={6} md={4}>
                  <DocumentCard
                    title="Aadhaar Card"
                    url={displayData.aadhaar.url}
                    icon={<BadgeIcon sx={{ color: PRIMARY }} />}
                    filename="aadhaar-card"
                    onView={handleViewDocument}
                    onDownload={handleDownload}
                  />
                </Grid>
              )}
              {displayData.panCard?.url && (
                <Grid item xs={12} sm={6} md={4}>
                  <DocumentCard
                    title="PAN Card"
                    url={displayData.panCard.url}
                    icon={<CreditCard sx={{ color: PRIMARY }} />}
                    filename="pan-card"
                    onView={handleViewDocument}
                    onDownload={handleDownload}
                  />
                </Grid>
              )}
              {displayData.passbook?.url && (
                <Grid item xs={12} sm={6} md={4}>
                  <DocumentCard
                    title="Bank Passbook"
                    url={displayData.passbook.url}
                    icon={<ReceiptLong sx={{ color: PRIMARY }} />}
                    filename="passbook"
                    onView={handleViewDocument}
                    onDownload={handleDownload}
                  />
                </Grid>
              )}
              {displayData.uploadDocument?.url && (
                <Grid item xs={12} sm={6} md={4}>
                  <DocumentCard
                    title="Registration Document"
                    url={displayData.uploadDocument.url}
                    icon={<PictureAsPdf sx={{ color: PRIMARY }} />}
                    filename="registration-document"
                    onView={handleViewDocument}
                    onDownload={handleDownload}
                  />
                </Grid>
              )}
              {displayData.otherDocuments?.map((doc, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <DocumentCard
                    title={doc.name || `Other Document ${index + 1}`}
                    url={doc.url}
                    icon={<InsertDriveFile sx={{ color: PRIMARY }} />}
                    filename={doc.name}
                    onView={handleViewDocument}
                    onDownload={handleDownload}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        ),
      },
      {
        label: "Notes",
        icon: <Note />,
        content: (
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Document Notes
              </Typography>
              {displayData.documentNotes ? (
                <Paper
                  sx={{
                    p: 3,
                    bgcolor: "grey.50",
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "grey.300",
                  }}
                >
                  <Typography
                    variant="body1"
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {displayData.documentNotes}
                  </Typography>
                </Paper>
              ) : (
                <Typography color="text.secondary" sx={{ py: 4 }}>
                  No notes available
                </Typography>
              )}
            </CardContent>
          </Card>
        ),
      },
    ];

    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{ sx: { borderRadius: 3, maxHeight: "90vh" } }}
      >
        <DialogTitle
          sx={{
            bgcolor: PRIMARY,
            color: "white",
            pb: 2,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: "white", color: PRIMARY }}>
                {displayData.firstName?.[0] || "L"}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {displayData.firstName} {displayData.lastName}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Lead Details • Complete Information
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={onClose} size="small" sx={{ color: "white" }}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                "& .MuiTab-root": {
                  minHeight: 64,
                  py: 1.5,
                },
              }}
            >
              {tabs.map((tab, index) => (
                <Tab
                  key={index}
                  icon={tab.icon}
                  label={tab.label}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                  }}
                />
              ))}
            </Tabs>
          </Box>

          <Box sx={{ p: 3, maxHeight: "60vh", overflow: "auto" }}>
            {loadingDetails ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight={200}
              >
                <CircularProgress sx={{ color: PRIMARY }} />
              </Box>
            ) : (
              tabs[activeTab].content
            )}
          </Box>
        </DialogContent>

        <DialogActions
          sx={{ p: 3, pt: 0, borderTop: 1, borderColor: "divider" }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            width="100%"
          >
            <Chip
              label={userRoleConfig.label}
              icon={userRoleConfig.icon}
              size="small"
              sx={{
                bgcolor: `${userRoleConfig.color}15`,
                color: userRoleConfig.color,
                fontWeight: 600,
              }}
            />
            <Button
              onClick={onClose}
              variant="contained"
              sx={{
                borderRadius: 2,
                mt: 2,
                bgcolor: PRIMARY,
                "&:hover": { bgcolor: SECONDARY },
              }}
            >
              Close
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    );
  },
);

ViewLeadModal.displayName = "ViewLeadModal";

// ========== EDIT LEAD MODAL (UPDATED WITH CORRECT UPLOAD ENDPOINT) ==========
const EditLeadModal = React.memo(
  ({ open, onClose, lead, onSave, userRole, showSnackbar }) => {
    const { fetchAPI } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [formData, setFormData] = useState({
      documentStatus: "pending",
      aadhaar: { file: null, url: "", preview: null },
      panCard: { file: null, url: "", preview: null },
      passbook: { file: null, url: "", preview: null },
      otherDocuments: [],
      documentSubmissionDate: null,
      documentNotes: "",
    });
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
      if (open && lead) {
        setFormData({
          documentStatus: lead.documentStatus || "pending",
          aadhaar: {
            file: null,
            url: lead.aadhaar?.url || "",
            preview: lead.aadhaar?.url || null,
          },
          panCard: {
            file: null,
            url: lead.panCard?.url || "",
            preview: lead.panCard?.url || null,
          },
          passbook: {
            file: null,
            url: lead.passbook?.url || "",
            preview: lead.passbook?.url || null,
          },
          otherDocuments: lead.otherDocuments || [],
          documentSubmissionDate: lead.documentSubmissionDate
            ? parseISO(lead.documentSubmissionDate)
            : null,
          documentNotes: lead.documentNotes || "",
        });
        setValidationErrors({});
        setUploadProgress(0);
      }
    }, [open, lead]);

    const validateFile = (file) => {
      if (file.size > MAX_FILE_SIZE) {
        return "File size should be less than 5MB";
      }
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return "Only JPG, PNG and PDF files are allowed";
      }
      return "";
    };

    const handleFileChange = useCallback(
      (field, event) => {
        const file = event.target.files[0];
        if (!file) return;

        const error = validateFile(file);
        if (error) {
          showSnackbar(error, "error");
          return;
        }

        const preview = file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : null;

        setFormData((prev) => ({
          ...prev,
          [field]: { ...prev[field], file, preview },
        }));

        // Clear validation error
        setValidationErrors((prev) => ({ ...prev, [field]: "" }));
      },
      [showSnackbar],
    );

    const handleRemoveFile = useCallback((field) => {
      setFormData((prev) => ({
        ...prev,
        [field]: { file: null, url: "", preview: null },
      }));
    }, []);

    const handleAddOtherDocument = useCallback(
      (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const error = validateFile(file);
        if (error) {
          showSnackbar(error, "error");
          return;
        }

        const preview = file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : null;
        const newDoc = { file, name: file.name, url: "", preview };

        setFormData((prev) => ({
          ...prev,
          otherDocuments: [...prev.otherDocuments, newDoc],
        }));
      },
      [showSnackbar],
    );

    const handleRemoveOtherDocument = useCallback((index) => {
      setFormData((prev) => ({
        ...prev,
        otherDocuments: prev.otherDocuments.filter((_, i) => i !== index),
      }));
    }, []);

    const validateForm = useCallback(() => {
      const errors = {};

      if (!formData.documentStatus) {
        errors.documentStatus = "Document status is required";
      }

      if (formData.aadhaar.file) {
        const error = validateFile(formData.aadhaar.file);
        if (error) errors.aadhaar = error;
      }
      if (formData.panCard.file) {
        const error = validateFile(formData.panCard.file);
        if (error) errors.panCard = error;
      }
      if (formData.passbook.file) {
        const error = validateFile(formData.passbook.file);
        if (error) errors.passbook = error;
      }

      setValidationErrors(errors);
      return Object.keys(errors).length === 0;
    }, [formData]);

    const handleSubmit = useCallback(async () => {
      if (!validateForm()) {
        showSnackbar("Please fix the errors in the form", "error");
        return;
      }

      setLoading(true);
      setUploadProgress(0);

      try {
        const formDataToSend = new FormData();

        // Append files if they exist
        if (formData.aadhaar.file) {
          formDataToSend.append("aadhaar", formData.aadhaar.file);
        }
        if (formData.panCard.file) {
          formDataToSend.append("panCard", formData.panCard.file);
        }
        if (formData.passbook.file) {
          formDataToSend.append("passbook", formData.passbook.file);
        }

        // Append other documents
        formData.otherDocuments.forEach((doc) => {
          if (doc.file) {
            formDataToSend.append("otherDocuments", doc.file);
          }
        });

        if (formData.documentNotes) {
          formDataToSend.append("documentNotes", formData.documentNotes);
        }

        // Prepare JSON data for other fields
        const jsonData = {
          documentStatus: formData.documentStatus,
        };

        if (formData.documentSubmissionDate) {
          jsonData.documentSubmissionDate = format(
            formData.documentSubmissionDate,
            "yyyy-MM-dd",
          );
        }

        // Append JSON data as a string
        formDataToSend.append("data", JSON.stringify(jsonData));

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 500);

        // Use the correct upload endpoint
        const response = await fetchAPI(
          `/lead/upload/${lead._id}/upload-documents`,
          {
            method: "PUT",
            body: formDataToSend,
            // Don't set Content-Type header - let browser set it with boundary
          },
        );

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (response?.success) {
          showSnackbar("Documents uploaded successfully", "success");
          onSave(response.result);
          // Close modal after a short delay to show 100% progress
          setTimeout(() => onClose(), 500);
        } else {
          throw new Error(response?.message || "Failed to upload documents");
        }
      } catch (error) {
        console.error("Error uploading documents:", error);
        showSnackbar(error.message || "Failed to upload documents", "error");
      } finally {
        setLoading(false);
        setUploadProgress(0);
      }
    }, [formData, validateForm, lead, fetchAPI, showSnackbar, onSave, onClose]);

    // Cleanup preview URLs
    useEffect(() => {
      return () => {
        if (
          formData.aadhaar.preview &&
          formData.aadhaar.preview.startsWith("blob:")
        ) {
          URL.revokeObjectURL(formData.aadhaar.preview);
        }
        if (
          formData.panCard.preview &&
          formData.panCard.preview.startsWith("blob:")
        ) {
          URL.revokeObjectURL(formData.panCard.preview);
        }
        if (
          formData.passbook.preview &&
          formData.passbook.preview.startsWith("blob:")
        ) {
          URL.revokeObjectURL(formData.passbook.preview);
        }
        formData.otherDocuments.forEach((doc) => {
          if (doc.preview && doc.preview.startsWith("blob:")) {
            URL.revokeObjectURL(doc.preview);
          }
        });
      };
    }, [formData]);

    if (!lead) return null;

    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ bgcolor: alpha(PRIMARY, 0.05), pb: 2 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: `${PRIMARY}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: PRIMARY,
                }}
              >
                <CloudUpload sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Upload Documents
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {lead.firstName} {lead.lastName}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={onClose} size="medium" disabled={loading}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ py: 3 }}>
          <Stack spacing={4} sx={{ mt: 2 }}>
            {/* Upload Progress Bar */}
            {loading && uploadProgress > 0 && (
              <Box sx={{ width: "100%", mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Uploading: {uploadProgress}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={uploadProgress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    "& .MuiLinearProgress-bar": {
                      bgcolor: PRIMARY,
                    },
                  }}
                />
              </Box>
            )}

            {/* Document Status */}
            <FormControl
              fullWidth
              size="small"
              error={!!validationErrors.documentStatus}
            >
              <InputLabel>Document Status</InputLabel>
              <Select
                value={formData.documentStatus}
                label="Document Status"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    documentStatus: e.target.value,
                  }))
                }
                disabled={loading}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="submitted">Submitted</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
              {validationErrors.documentStatus && (
                <FormHelperText>
                  {validationErrors.documentStatus}
                </FormHelperText>
              )}
            </FormControl>

            {/* Date Picker */}
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Document Submission Date"
                value={formData.documentSubmissionDate}
                onChange={(newValue) =>
                  setFormData((prev) => ({
                    ...prev,
                    documentSubmissionDate: newValue,
                  }))
                }
                disabled={loading}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                  },
                }}
              />
            </LocalizationProvider>

            {/* Required Documents */}
            <Typography variant="subtitle1" fontWeight={600}>
              Required Documents
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <FileUploadField
                  label="Aadhaar Card"
                  field="aadhaar"
                  value={formData.aadhaar}
                  onFileChange={handleFileChange}
                  onRemove={handleRemoveFile}
                  validationErrors={validationErrors}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FileUploadField
                  label="PAN Card"
                  field="panCard"
                  value={formData.panCard}
                  onFileChange={handleFileChange}
                  onRemove={handleRemoveFile}
                  validationErrors={validationErrors}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FileUploadField
                  label="Passbook"
                  field="passbook"
                  value={formData.passbook}
                  onFileChange={handleFileChange}
                  onRemove={handleRemoveFile}
                  validationErrors={validationErrors}
                />
              </Grid>
            </Grid>

            {/* Other Documents */}
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Other Documents ({formData.otherDocuments.length})
              </Typography>
              {formData.otherDocuments.length > 0 && (
                <Stack spacing={2} sx={{ mb: 3 }}>
                  {formData.otherDocuments.map((doc, index) => (
                    <Paper
                      key={index}
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        borderColor: "grey.300",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={2}>
                        {doc.preview ? (
                          <img
                            src={doc.preview}
                            alt={doc.name}
                            style={{
                              width: 40,
                              height: 40,
                              objectFit: "cover",
                              borderRadius: 4,
                            }}
                          />
                        ) : doc.url ? (
                          <DescriptionOutlined
                            sx={{ color: PRIMARY, fontSize: 40 }}
                          />
                        ) : (
                          <ImageIcon sx={{ color: PRIMARY, fontSize: 40 }} />
                        )}
                        <Box>
                          <Typography
                            variant="body2"
                            fontWeight={500}
                            noWrap
                            sx={{ maxWidth: 200 }}
                          >
                            {doc.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {doc.file
                              ? formatFileSize(doc.file.size)
                              : "Existing document"}
                          </Typography>
                        </Box>
                      </Stack>
                      <IconButton
                        onClick={() => handleRemoveOtherDocument(index)}
                        color="error"
                        size="small"
                        disabled={loading}
                      >
                        <Delete />
                      </IconButton>
                    </Paper>
                  ))}
                </Stack>
              )}
              <Button
                variant="outlined"
                startIcon={<AddPhotoAlternate />}
                onClick={() =>
                  document.getElementById("other-docs-file").click()
                }
                fullWidth
                disabled={loading}
                sx={{
                  py: 2,
                  borderColor: PRIMARY,
                  color: PRIMARY,
                  "&:hover": {
                    borderColor: PRIMARY,
                    bgcolor: alpha(PRIMARY, 0.05),
                  },
                }}
              >
                Add More Documents
              </Button>
              <input
                type="file"
                id="other-docs-file"
                accept="image/*,application/pdf"
                style={{ display: "none" }}
                onChange={handleAddOtherDocument}
                multiple
              />
            </Box>

            {/* Notes */}
            <TextField
              label="Document Notes"
              value={formData.documentNotes}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  documentNotes: e.target.value,
                }))
              }
              fullWidth
              multiline
              rows={4}
              placeholder="Add any comments or notes..."
              variant="outlined"
              disabled={loading}
            />
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{ p: 3, pt: 2, borderTop: 1, borderColor: "divider", gap: 2 }}
        >
          <Button
            onClick={onClose}
            variant="outlined"
            size="large"
            disabled={loading}
            sx={{
              borderColor: PRIMARY,
              color: PRIMARY,
              "&:hover": {
                borderColor: PRIMARY,
                bgcolor: alpha(PRIMARY, 0.05),
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            size="large"
            disabled={loading}
            startIcon={
              loading ? <CircularProgress size={20} /> : <CloudUpload />
            }
            sx={{
              bgcolor: PRIMARY,
              px: 4,
              "&:hover": {
                bgcolor: SECONDARY,
              },
              "&.Mui-disabled": {
                bgcolor: "#ccc",
              },
            }}
          >
            {loading ? "Uploading..." : "Upload Documents"}
          </Button>
        </DialogActions>
      </Dialog>
    );
  },
);

EditLeadModal.displayName = "EditLeadModal";

// ========== LOADING SKELETON ==========
const LoadingSkeleton = () => (
  <Box sx={{ p: 3 }}>
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {[1, 2, 3, 4].map((item) => (
        <Grid item xs={6} sm={3} key={item}>
          <Skeleton
            variant="rectangular"
            height={120}
            sx={{ borderRadius: 2 }}
          />
        </Grid>
      ))}
    </Grid>
    <Skeleton
      variant="rectangular"
      height={400}
      sx={{ borderRadius: 2, mb: 2 }}
    />
    <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
  </Box>
);

// ========== MAIN COMPONENT ==========
export default function DocumentSubmissionPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { fetchAPI, user, getUserRole } = useAuth();
  const userRole = getUserRole();
  const userPermissions = useMemo(
    () => getUserPermissions(userRole),
    [userRole],
  );

  const isXSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const isSmall = useMediaQuery(theme.breakpoints.between("sm", "md"));

  // State Management
  const [period, setPeriod] = useState("Today");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Data State
  const [documentsData, setDocumentsData] = useState({
    documents: [],
    summary: {
      totalDocuments: 0,
      submittedDocuments: 0,
      pendingDocuments: 0,
      rejectedDocuments: 0,
    },
  });

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [leadStatusFilter, setLeadStatusFilter] = useState("All");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    startDate: null,
    endDate: null,
  });
  const [dateFilterError, setDateFilterError] = useState("");

  // Sorting & Pagination
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);

  // Modal States
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [statusUpdateModalOpen, setStatusUpdateModalOpen] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedActionLead, setSelectedActionLead] = useState(null);

  // Snackbar Handler
  const showSnackbar = useCallback((message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  // Fetch Data
  const fetchDocumentsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      const today = new Date();

      if (period === "Today") {
        params.append("startDate", format(today, "yyyy-MM-dd"));
        params.append("endDate", format(today, "yyyy-MM-dd"));
      } else if (period === "This Week") {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        params.append("startDate", format(weekAgo, "yyyy-MM-dd"));
        params.append("endDate", format(today, "yyyy-MM-dd"));
      } else if (period === "This Month") {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        params.append("startDate", format(monthAgo, "yyyy-MM-dd"));
        params.append("endDate", format(today, "yyyy-MM-dd"));
      }

      const response = await fetchAPI(
        `/lead/DocumentSummary?${params.toString()}`,
      );

      if (response?.success) {
        const data = response.result || {};
        const rawDocuments = data.documents || [];

        let filteredDocs = rawDocuments;
        if (userRole === "TEAM" && user?._id) {
          filteredDocs = rawDocuments.filter(
            (doc) =>
              doc.assignedTo === user._id ||
              doc.assignedManager === user._id ||
              doc.assignedUser?._id === user._id ||
              doc.createdBy === user._id,
          );
        }

        const totalDocuments = filteredDocs.length;
        const submittedDocuments = filteredDocs.filter(
          (doc) => doc.documentStatus?.toLowerCase() === "submitted",
        ).length;
        const pendingDocuments = filteredDocs.filter(
          (doc) => doc.documentStatus?.toLowerCase() === "pending",
        ).length;
        const rejectedDocuments = filteredDocs.filter(
          (doc) => doc.documentStatus?.toLowerCase() === "rejected",
        ).length;

        setDocumentsData({
          documents: filteredDocs,
          summary: {
            totalDocuments,
            submittedDocuments,
            pendingDocuments,
            rejectedDocuments,
          },
        });
      } else {
        throw new Error(response?.message || "Failed to fetch documents data");
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
      setError(err.message || "Network error. Please try again.");
      showSnackbar(err.message || "Failed to fetch documents data", "error");
    } finally {
      setLoading(false);
    }
  }, [period, fetchAPI, userRole, user, showSnackbar]);

  // Apply Filters
  const applyFilters = useCallback(() => {
    try {
      let filtered = [...documentsData.documents];

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(
          (doc) =>
            (doc.firstName?.toLowerCase() || "").includes(query) ||
            (doc.lastName?.toLowerCase() || "").includes(query) ||
            (doc.email?.toLowerCase() || "").includes(query) ||
            (doc.phone || "").includes(query),
        );
      }

      // Document Status filter
      if (statusFilter !== "All") {
        filtered = filtered.filter(
          (doc) => doc.documentStatus === statusFilter,
        );
      }

      // Lead Status filter
      if (leadStatusFilter !== "All") {
        filtered = filtered.filter((doc) => doc.status === leadStatusFilter);
      }

      // Date filter
      if (
        dateFilter.startDate &&
        isValid(dateFilter.startDate) &&
        dateFilter.endDate &&
        isValid(dateFilter.endDate)
      ) {
        const start = startOfDay(new Date(dateFilter.startDate));
        const end = endOfDay(new Date(dateFilter.endDate));

        filtered = filtered.filter((doc) => {
          try {
            const docDate = doc.documentSubmissionDate
              ? parseISO(doc.documentSubmissionDate)
              : doc.createdAt
                ? parseISO(doc.createdAt)
                : null;
            if (!docDate || !isValid(docDate)) return false;
            return isWithinInterval(docDate, { start, end });
          } catch {
            return false;
          }
        });
      }

      // Sorting
      if (sortConfig.key) {
        filtered.sort((a, b) => {
          let aVal = a[sortConfig.key];
          let bVal = b[sortConfig.key];

          if (
            sortConfig.key === "documentSubmissionDate" ||
            sortConfig.key === "createdAt"
          ) {
            aVal = aVal ? parseISO(aVal) : new Date(0);
            bVal = bVal ? parseISO(bVal) : new Date(0);
          } else if (sortConfig.key === "firstName") {
            aVal = `${a.firstName || ""} ${a.lastName || ""}`.toLowerCase();
            bVal = `${b.firstName || ""} ${b.lastName || ""}`.toLowerCase();
          }

          if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
          if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
          return 0;
        });
      }

      return filtered;
    } catch (err) {
      console.error("Filter error:", err);
      showSnackbar("Error applying filters", "error");
      return documentsData.documents;
    }
  }, [
    documentsData.documents,
    searchQuery,
    statusFilter,
    leadStatusFilter,
    dateFilter,
    sortConfig,
    showSnackbar,
  ]);

  // Effects
  useEffect(() => {
    if (hasAccess(userRole)) {
      fetchDocumentsData();
    }
  }, [fetchDocumentsData, userRole]);

  useEffect(() => {
    if (dateFilter.startDate && dateFilter.endDate) {
      const from = new Date(dateFilter.startDate);
      const to = new Date(dateFilter.endDate);
      const error = from > to ? "Start date cannot be after end date" : "";
      setDateFilterError(error);
    } else {
      setDateFilterError("");
    }
  }, [dateFilter.startDate, dateFilter.endDate]);

  // Handlers
  const handleSort = useCallback((key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  const handleViewClick = useCallback(
    (document) => {
      if (!document?._id) {
        showSnackbar("Invalid document data", "error");
        return;
      }
      setSelectedDocument(document);
      setViewModalOpen(true);
    },
    [showSnackbar],
  );

  const handleEditClick = useCallback(
    (document) => {
      if (!document?._id) {
        showSnackbar("Invalid document data", "error");
        return;
      }
      if (!userPermissions.canEdit) {
        showSnackbar(
          "You don't have permission to edit this document",
          "error",
        );
        return;
      }
      setSelectedDocument(document);
      setEditModalOpen(true);
    },
    [userPermissions, showSnackbar],
  );

  const handleStatusUpdateClick = useCallback(
    (document) => {
      if (!document?._id) {
        showSnackbar("Invalid document data", "error");
        return;
      }
      if (!userPermissions.canUpdateStatus) {
        showSnackbar(
          "You don't have permission to update lead status",
          "error",
        );
        return;
      }
      setSelectedDocument(document);
      setStatusUpdateModalOpen(true);
    },
    [userPermissions, showSnackbar],
  );

  const handleStatusUpdate = useCallback(
    async (updatedLead) => {
      try {
        await fetchDocumentsData();
        showSnackbar("Lead status updated successfully", "success");
      } catch (err) {
        console.error("Error after status update:", err);
        showSnackbar("Failed to refresh data", "error");
      }
    },
    [fetchDocumentsData, showSnackbar],
  );

  const handleLeadUpdate = useCallback(
    async (updatedLead) => {
      try {
        await fetchDocumentsData();
        showSnackbar("Documents uploaded successfully", "success");
      } catch (err) {
        console.error("Error after document upload:", err);
        showSnackbar("Failed to refresh data", "error");
      }
    },
    [fetchDocumentsData, showSnackbar],
  );

  const handleActionMenuOpen = useCallback((event, document) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedActionLead(document);
  }, []);

  const handleActionMenuClose = useCallback(() => {
    setActionMenuAnchor(null);
    setSelectedActionLead(null);
  }, []);

  const handleActionSelect = useCallback(
    (action) => {
      if (!selectedActionLead) return;

      switch (action) {
        case "view":
          handleViewClick(selectedActionLead);
          break;
        case "edit":
          handleEditClick(selectedActionLead);
          break;
        case "update_status":
          handleStatusUpdateClick(selectedActionLead);
          break;
        default:
          break;
      }

      handleActionMenuClose();
    },
    [
      selectedActionLead,
      handleViewClick,
      handleEditClick,
      handleStatusUpdateClick,
      handleActionMenuClose,
    ],
  );

  const handleViewDocument = useCallback(
    (documentUrl, documentName = "Document") => {
      if (!documentUrl) {
        showSnackbar("No document available to view", "error");
        return;
      }
      setCurrentImageUrl(documentUrl);
      setImageViewerOpen(true);
    },
    [showSnackbar],
  );

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setStatusFilter("All");
    setLeadStatusFilter("All");
    setDateFilter({ startDate: null, endDate: null });
    setDateFilterError("");
    setSortConfig({ key: null, direction: "asc" });
    setPage(0);
    if (showFilterPanel) setShowFilterPanel(false);
  }, [showFilterPanel]);

  // Memoized Computed Values
  const filteredDocuments = useMemo(() => applyFilters(), [applyFilters]);

  const paginatedDocuments = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredDocuments.slice(start, start + rowsPerPage);
  }, [filteredDocuments, page, rowsPerPage]);

  const totalPages = useMemo(
    () => Math.ceil(filteredDocuments.length / rowsPerPage),
    [filteredDocuments.length, rowsPerPage],
  );

  const summaryCards = useMemo(
    () => [
      {
        label: "Total Documents",
        value: documentsData.summary.totalDocuments,
        color: PRIMARY,
        icon: <DescriptionOutlined />,
        subText: "All documents",
      },
      {
        label: "Submitted",
        value: documentsData.summary.submittedDocuments,
        color: PRIMARY,
        icon: <CheckCircle />,
        subText: "Submitted documents",
      },
      {
        label: "Pending",
        value: documentsData.summary.pendingDocuments,
        color: PRIMARY,
        icon: <PendingActions />,
        subText: "Pending documents",
      },
      {
        label: "Rejected",
        value: documentsData.summary.rejectedDocuments,
        color: PRIMARY,
        icon: <Cancel />,
        subText: "Rejected documents",
      },
    ],
    [documentsData.summary],
  );

  // Access Check
  if (!hasAccess(userRole)) {
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
        <Alert severity="error" sx={{ maxWidth: 500 }}>
          <AlertTitle>Access Denied</AlertTitle>
          You don't have permission to access this page.
          <Button
            sx={{ mt: 2 }}
            variant="contained"
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard
          </Button>
        </Alert>
      </Box>
    );
  }

  if (loading && documentsData.documents.length === 0) {
    return <LoadingSkeleton />;
  }

  if (error && documentsData.documents.length === 0) {
    return (
      <Box sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={fetchDocumentsData}
              sx={{ color: PRIMARY }}
            >
              Retry
            </Button>
          }
        >
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      {/* Modals */}
      <ImageViewerModal
        open={imageViewerOpen}
        onClose={() => setImageViewerOpen(false)}
        imageUrl={currentImageUrl}
        title="Document Preview"
      />

      <ViewLeadModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        lead={selectedDocument}
        userRole={userRole}
        showSnackbar={showSnackbar}
        handleViewDocument={handleViewDocument}
      />

      <EditLeadModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        lead={selectedDocument}
        onSave={handleLeadUpdate}
        userRole={userRole}
        showSnackbar={showSnackbar}
      />

      <LeadStatusUpdateModal
        open={statusUpdateModalOpen}
        onClose={() => setStatusUpdateModalOpen(false)}
        lead={selectedDocument}
        onStatusUpdate={handleStatusUpdate}
        showSnackbar={showSnackbar}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%", color:"#fff"}}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            minWidth: 200,
          },
        }}
      >
        <MenuItem onClick={() => handleActionSelect("view")}>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          View Details
        </MenuItem>
        {userPermissions.canEdit && (
          <MenuItem onClick={() => handleActionSelect("edit")}>
            <ListItemIcon>
              <Edit fontSize="small" />
            </ListItemIcon>
            Edit
          </MenuItem>
        )}
        {userPermissions.canUpdateStatus && (
          <MenuItem onClick={() => handleActionSelect("update_status")}>
            <ListItemIcon>
              <TrendingUp fontSize="small" />
            </ListItemIcon>
            Update Status
          </MenuItem>
        )}
      </Menu>

      {/* Main Content */}
      <Box sx={{ p: { xs: 2, sm: 3 }, minHeight: "100vh" }}>
        {/* Header */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ mb: 4 }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          <Box>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Document Submission Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track and manage all document submissions and their status
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={fetchDocumentsData}
              disabled={loading}
              sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: SECONDARY } }}
            >
              Refresh
            </Button>
          </Box>
        </Stack>

        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {summaryCards.map((card, index) => (
            <Grid item xs={6} sm={3} key={index}>
              <Card
                sx={{
                  borderRadius: 3,
                  overflow: "visible",
                  position: "relative",
                  width: "277px",
                  border: `1px solid ${alpha(card.color, 0.1)}`,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
              >
                <CardContent sx={{ p: 3 }}>
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
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          bgcolor: `${card.color}15`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: card.color,
                        }}
                      >
                        {card.icon}
                      </Box>
                      <Typography
                        variant="h4"
                        fontWeight={700}
                        sx={{ color: card.color }}
                      >
                        {card.value}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {card.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {card.subText}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Filters Card */}
        <Card sx={{ borderRadius: 3, mb: 4, overflow: "visible" }}>
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={3}>
              {/* Top Filters Row */}
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                justifyContent="space-between"
                alignItems={{ xs: "stretch", md: "center" }}
              >
                <Box sx={{ width: { xs: "100%", md: 300 } }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search by name, email or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                      endAdornment: searchQuery && (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setSearchQuery("")}
                          >
                            <Close sx={{ color: PRIMARY }} />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <Stack direction="row" spacing={2} flexWrap="wrap">
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Period</InputLabel>
                    <Select
                      value={period}
                      label="Period"
                      onChange={(e) => setPeriod(e.target.value)}
                    >
                      <MenuItem value="Today">Today</MenuItem>
                      <MenuItem value="This Week">This Week</MenuItem>
                      <MenuItem value="This Month">This Month</MenuItem>
                      <MenuItem value="All">All Time</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Document Status</InputLabel>
                    <Select
                      value={statusFilter}
                      label="Document Status"
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <MenuItem value="All">All Status</MenuItem>
                      <MenuItem value="submitted">Submitted</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="rejected">Rejected</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    variant="outlined"
                    startIcon={<Tune />}
                    onClick={() => setShowFilterPanel(!showFilterPanel)}
                    sx={{
                      display: { xs: "none", sm: "flex" },
                      borderColor: PRIMARY,
                      color: PRIMARY,
                      "&:hover": {
                        borderColor: PRIMARY,
                        bgcolor: alpha(PRIMARY, 0.05),
                      },
                    }}
                  >
                    {showFilterPanel ? "Hide Filters" : "More Filters"}
                  </Button>
                </Stack>
              </Stack>

              {/* Advanced Filter Panel */}
              {showFilterPanel && (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    borderColor: "divider",
                    bgcolor: "grey.50",
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Advanced Filters
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <DatePicker
                        label="Start Date"
                        value={dateFilter.startDate}
                        onChange={(newValue) =>
                          setDateFilter((prev) => ({
                            ...prev,
                            startDate: newValue,
                          }))
                        }
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: "small",
                            error: !!dateFilterError,
                            helperText: dateFilterError,
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <DatePicker
                        label="End Date"
                        value={dateFilter.endDate}
                        onChange={(newValue) =>
                          setDateFilter((prev) => ({
                            ...prev,
                            endDate: newValue,
                          }))
                        }
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: "small",
                            error: !!dateFilterError,
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                  <Stack
                    direction="row"
                    spacing={2}
                    justifyContent="flex-end"
                    sx={{ mt: 3 }}
                  >
                    <Button
                      variant="outlined"
                      onClick={handleClearFilters}
                      startIcon={<Clear />}
                      sx={{
                        borderColor: PRIMARY,
                        color: PRIMARY,
                        "&:hover": {
                          borderColor: PRIMARY,
                          bgcolor: alpha(PRIMARY, 0.05),
                        },
                      }}
                    >
                      Clear All
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => setShowFilterPanel(false)}
                      sx={{
                        bgcolor: PRIMARY,
                        "&:hover": { bgcolor: SECONDARY },
                      }}
                    >
                      Apply Filters
                    </Button>
                  </Stack>
                </Paper>
              )}

              {/* Active Filters */}
              {(searchQuery ||
                statusFilter !== "All" ||
                leadStatusFilter !== "All" ||
                dateFilter.startDate ||
                dateFilter.endDate) && (
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Active Filters:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {searchQuery && (
                      <Chip
                        label={`Search: ${searchQuery}`}
                        size="small"
                        onDelete={() => setSearchQuery("")}
                        sx={{
                          bgcolor: PRIMARY,
                          color: "white",
                          "& .MuiChip-deleteIcon": {
                            color: "white",
                          },
                        }}
                      />
                    )}
                    {statusFilter !== "All" && (
                      <Chip
                        label={`Doc Status: ${statusFilter}`}
                        size="small"
                        onDelete={() => setStatusFilter("All")}
                        sx={{
                          bgcolor: PRIMARY,
                          color: "white",
                          "& .MuiChip-deleteIcon": {
                            color: "white",
                          },
                        }}
                      />
                    )}
                    {leadStatusFilter !== "All" && (
                      <Chip
                        label={`Lead Status: ${leadStatusFilter}`}
                        size="small"
                        onDelete={() => setLeadStatusFilter("All")}
                        sx={{
                          bgcolor: PRIMARY,
                          color: "white",
                          "& .MuiChip-deleteIcon": {
                            color: "white",
                          },
                        }}
                      />
                    )}
                    {dateFilter.startDate && (
                      <Chip
                        label={`From: ${format(
                          dateFilter.startDate,
                          "dd MMM yyyy",
                        )}`}
                        size="small"
                        onDelete={() =>
                          setDateFilter((prev) => ({
                            ...prev,
                            startDate: null,
                          }))
                        }
                        sx={{
                          bgcolor: PRIMARY,
                          color: "white",
                          "& .MuiChip-deleteIcon": {
                            color: "white",
                          },
                        }}
                      />
                    )}
                    {dateFilter.endDate && (
                      <Chip
                        label={`To: ${format(
                          dateFilter.endDate,
                          "dd MMM yyyy",
                        )}`}
                        size="small"
                        onDelete={() =>
                          setDateFilter((prev) => ({
                            ...prev,
                            endDate: null,
                          }))
                        }
                        sx={{
                          bgcolor: PRIMARY,
                          color: "white",
                          "& .MuiChip-deleteIcon": {
                            color: "white",
                          },
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
                        borderColor: PRIMARY,
                        color: PRIMARY,
                        "&:hover": {
                          bgcolor: alpha(PRIMARY, 0.05),
                        },
                      }}
                    />
                  </Stack>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
          <CardContent sx={{ p: 0 }}>
            {/* Header */}
            <Box
              sx={{
                p: 3,
                borderBottom: 1,
                borderColor: "divider",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Typography variant="h6" fontWeight={600}>
                Document Submissions ({filteredDocuments.length})
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Show:
                </Typography>
                <Select
                  size="small"
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setPage(0);
                  }}
                  sx={{ minWidth: 100 }}
                >
                  {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </Stack>
            </Box>

            {/* Table Container */}
            <TableContainer
              sx={{
                maxHeight: { xs: "60vh", md: "70vh" },
                position: "relative",
              }}
            >
              {loading && documentsData.documents.length > 0 && (
                <LinearProgress
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    "& .MuiLinearProgress-bar": {
                      bgcolor: PRIMARY,
                    },
                  }}
                />
              )}

              <Table stickyHeader size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Lead Details
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => handleSort("documentSubmissionDate")}
                        endIcon={
                          sortConfig.key === "documentSubmissionDate" ? (
                            sortConfig.direction === "asc" ? (
                              <ArrowUpward fontSize="small" />
                            ) : (
                              <ArrowDownward fontSize="small" />
                            )
                          ) : null
                        }
                        sx={{
                          justifyContent: "flex-start",
                          fontWeight: 600,
                          color: "inherit",
                          "&:hover": {
                            bgcolor: "transparent",
                          },
                        }}
                      >
                        Submission Date
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Document Status
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Lead Status
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Actions
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedDocuments.length > 0 ? (
                    paginatedDocuments.map((document) => {
                      const docStatusConfig = getDocumentStatusColor(
                        document.documentStatus,
                      );
                      const leadStatusConfig = getLeadStatusConfig(
                        document.status,
                      );

                      return (
                        <TableRow
                          key={document._id}
                          hover
                          sx={{
                            "&:hover": {
                              bgcolor: alpha(PRIMARY, 0.02),
                            },
                          }}
                        >
                          {/* Lead Details */}
                          <TableCell>
                            <Stack spacing={1}>
                              <Typography variant="subtitle2" fontWeight={600}>
                                {document.firstName} {document.lastName}
                              </Typography>
                              <Stack spacing={0.5}>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                    color: "text.secondary",
                                  }}
                                >
                                  <Email fontSize="inherit" />
                                  {document.email || "No email"}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                    color: "text.secondary",
                                  }}
                                >
                                  <Phone fontSize="inherit" />
                                  {document.phone || "No phone"}
                                </Typography>
                              </Stack>
                            </Stack>
                          </TableCell>

                          {/* Submission Date */}
                          <TableCell>
                            <Stack spacing={0.5}>
                              <Typography variant="body2">
                                {formatDate(document.documentSubmissionDate)}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {formatDate(document.createdAt, "dd MMM yyyy")}
                              </Typography>
                            </Stack>
                          </TableCell>

                          {/* Document Status */}
                          <TableCell>
                            <Chip
                              label={docStatusConfig.label}
                              icon={docStatusConfig.icon}
                              size="small"
                              sx={{
                                bgcolor: docStatusConfig.bg,
                                color: docStatusConfig.color,
                                fontWeight: 600,
                                minWidth: 100,
                              }}
                            />
                          </TableCell>

                          {/* Lead Status */}
                          <TableCell>
                            <Tooltip
                              title={leadStatusConfig.description}
                              arrow
                              placement="top"
                            >
                              <Chip
                                label={document.status || "Unknown"}
                                icon={leadStatusConfig.icon}
                                size="small"
                                sx={{
                                  bgcolor: leadStatusConfig.bg,
                                  color: leadStatusConfig.color,
                                  fontWeight: 600,
                                  minWidth: 120,
                                  cursor: "pointer",
                                }}
                              />
                            </Tooltip>
                          </TableCell>

                          {/* Actions */}
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Tooltip title="View Details" arrow>
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewClick(document)}
                                  sx={{
                                    bgcolor: alpha(PRIMARY, 0.1),
                                    color: PRIMARY,
                                    "&:hover": {
                                      bgcolor: alpha(PRIMARY, 0.2),
                                    },
                                  }}
                                >
                                  <Visibility fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              {userPermissions.canEdit && (
                                <Tooltip title="Upload Documents" arrow>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleEditClick(document)}
                                    sx={{
                                      bgcolor: alpha(PRIMARY, 0.1),
                                      color: PRIMARY,
                                      "&:hover": {
                                        bgcolor: alpha(PRIMARY, 0.2),
                                      },
                                    }}
                                  >
                                    <CloudUpload fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}

                              {userPermissions.canUpdateStatus && (
                                <Tooltip title="Update Status" arrow>
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      handleStatusUpdateClick(document)
                                    }
                                    sx={{
                                      bgcolor: alpha(PRIMARY, 0.1),
                                      color: PRIMARY,
                                      "&:hover": {
                                        bgcolor: alpha(PRIMARY, 0.2),
                                      },
                                    }}
                                  >
                                    <TrendingUp fontSize="small" />
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
                      <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                        <Box sx={{ textAlign: "center" }}>
                          <DescriptionOutlined
                            sx={{
                              fontSize: 64,
                              color: "text.disabled",
                              mb: 2,
                            }}
                          />
                          <Typography
                            variant="h6"
                            color="text.secondary"
                            gutterBottom
                          >
                            No documents found
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {searchQuery ||
                            statusFilter !== "All" ||
                            leadStatusFilter !== "All" ||
                            dateFilter.startDate ||
                            dateFilter.endDate
                              ? "Try adjusting your filters"
                              : "No documents have been submitted yet"}
                          </Typography>
                          {(searchQuery ||
                            statusFilter !== "All" ||
                            leadStatusFilter !== "All" ||
                            dateFilter.startDate ||
                            dateFilter.endDate) && (
                            <Button
                              variant="outlined"
                              onClick={handleClearFilters}
                              sx={{
                                mt: 2,
                                borderColor: PRIMARY,
                                color: PRIMARY,
                                "&:hover": {
                                  borderColor: PRIMARY,
                                  bgcolor: alpha(PRIMARY, 0.05),
                                },
                              }}
                            >
                              Clear All Filters
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {filteredDocuments.length > 0 && (
              <Box
                sx={{
                  p: 2,
                  borderTop: 1,
                  borderColor: "divider",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 2,
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    bgcolor: alpha(PRIMARY, 0.1),
                    color: PRIMARY,
                    px: 2,
                    py: 1,
                    borderRadius: 4,
                  }}
                >
                  Showing{" "}
                  {Math.min(page * rowsPerPage + 1, filteredDocuments.length)}{" "}
                  to{" "}
                  {Math.min((page + 1) * rowsPerPage, filteredDocuments.length)}{" "}
                  of {filteredDocuments.length} entries
                </Typography>
                <Pagination
                  count={totalPages}
                  page={page + 1}
                  onChange={(event, value) => setPage(value - 1)}
                  color="primary"
                  showFirstButton
                  showLastButton
                  siblingCount={1}
                  boundaryCount={1}
                  size={isSmall ? "small" : "medium"}
                  sx={{
                    "& .MuiPaginationItem-root": {
                      borderRadius: 2,
                      "&.Mui-selected": {
                        bgcolor: PRIMARY,
                        color: "white",
                        "&:hover": {
                          bgcolor: SECONDARY,
                        },
                      },
                    },
                  }}
                />
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Footer Note */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 3, display: "block", textAlign: "center" }}
        >
          Last updated: {formatDate(new Date().toISOString())} •{" "}
          {documentsData.summary.totalDocuments} total documents
        </Typography>
      </Box>
    </LocalizationProvider>
  );
}
