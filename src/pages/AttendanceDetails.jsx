// pages/AttendanceDetails.jsx (Updated with Mobile View)
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
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
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  Close,
  AccessTime,
  LocationOn,
  PhotoLibrary,
  Edit,
  Delete,
  Save,
  Cancel,
  Person,
  CalendarToday,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useAttendance } from '../hooks/useAttendance';
import { format, parseISO } from 'date-fns';

const PRIMARY_COLOR = "#4569ea";

const InfoItem = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5),
  backgroundColor: alpha(theme.palette.primary.main, 0.03),
  borderRadius: theme.spacing(2),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
}));

const PhotoPreview = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  cursor: 'pointer',
  border: `2px solid ${alpha(PRIMARY_COLOR, 0.2)}`,
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    borderColor: PRIMARY_COLOR
  },
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  }
}));

const StatusChip = ({ status, size = "small" }) => {
  const getConfig = () => {
    switch (status) {
      case 'present':
        return { bg: alpha('#4caf50', 0.1), color: '#4caf50', icon: <CheckCircle />, label: 'Present' };
      case 'absent':
        return { bg: alpha('#f44336', 0.1), color: '#f44336', icon: <ErrorIcon />, label: 'Absent' };
      case 'late':
        return { bg: alpha('#ff9800', 0.1), color: '#ff9800', icon: <Warning />, label: 'Late' };
      case 'leave':
        return { bg: alpha('#9c27b0', 0.1), color: '#9c27b0', icon: <Person />, label: 'Leave' };
      case 'holiday':
        return { bg: alpha('#2196f3', 0.1), color: '#2196f3', icon: <CalendarToday />, label: 'Holiday' };
      default:
        return { bg: alpha('#4caf50', 0.1), color: '#4caf50', icon: <CheckCircle />, label: status };
    }
  };

  const config = getConfig();

  return (
    <Chip
      size={size}
      label={config.label}
      icon={config.icon}
      sx={{
        bgcolor: config.bg,
        color: config.color,
        fontWeight: 600,
        '& .MuiChip-icon': { color: config.color },
      }}
    />
  );
};

export default function AttendanceDetails({ 
  open, 
  onClose, 
  attendance, 
  canEdit = false,
  canDelete = false,
  onEdit,
  onDelete
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { updateAttendance } = useAttendance();
  
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [photoViewOpen, setPhotoViewOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  if (!attendance) return null;

  const formatTime = (timestamp) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleEdit = () => {
    setEditedData({
      status: attendance.status,
      remarks: attendance.punchIn?.remarks || ''
    });
    setEditMode(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const result = await updateAttendance(attendance.id, editedData);
      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Attendance updated successfully',
          severity: 'success'
        });
        setEditMode(false);
        if (onEdit) onEdit(result.data);
      } else {
        setSnackbar({
          open: true,
          message: result.error || 'Failed to update attendance',
          severity: 'error'
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'An error occurred',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(attendance);
      onClose();
    }
  };

  const handleViewPhoto = (photo) => {
    setSelectedPhoto(photo);
    setPhotoViewOpen(true);
  };

  const getPhotos = () => {
    const photos = [];
    if (attendance.punchIn?.photos) {
      photos.push(...attendance.punchIn.photos);
    }
    if (attendance.punchOut?.photos) {
      photos.push(...attendance.punchOut.photos);
    }
    return photos;
  };

  const photos = getPhotos();

  return (
    <>
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
            maxHeight: isMobile ? '100%' : '90vh',
          }
        }}
        TransitionComponent={isMobile ? Slide : Fade}
        transitionDuration={300}
      >
        <DialogTitle sx={{ 
          bgcolor: PRIMARY_COLOR,
          color: 'white',
          pb: 2,
          px: { xs: 2, sm: 3 },
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: 'white', color: PRIMARY_COLOR, width: 40, height: 40 }}>
                {attendance.user?.name?.charAt(0) || 'U'}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {attendance.user?.name || 'Attendance Details'}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  ID: {attendance.id?.slice(-8) || 'N/A'}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ py: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 } }}>
          <Stack spacing={3}>
            {/* User Info */}
            <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {attendance.user?.email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {attendance.user?.employeeId || 'No Employee ID'}
                </Typography>
              </Box>
              {!editMode && (
                <StatusChip status={attendance.status || 'present'} />
              )}
            </Box>

            {/* Date Info */}
            <Paper sx={{ p: 2, bgcolor: alpha(PRIMARY_COLOR, 0.02), borderRadius: 2 }}>
              <Stack spacing={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <CalendarToday sx={{ color: PRIMARY_COLOR, fontSize: 20 }} />
                  <Typography variant="body1" fontWeight={600}>
                    {formatDate(attendance.date)}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <AccessTime sx={{ color: PRIMARY_COLOR, fontSize: 20 }} />
                  <Typography variant="body2">
                    Work Duration: <strong>{attendance.workHoursFormatted || '00:00'}</strong> hours
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {/* Edit Mode Status */}
            {editMode && (
              <Paper sx={{ p: 2, bgcolor: alpha('#ff9800', 0.05), borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, color: '#ff9800' }}>
                  Edit Attendance
                </Typography>
                <Stack spacing={2}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={editedData.status}
                      onChange={(e) => setEditedData({ ...editedData, status: e.target.value })}
                      label="Status"
                    >
                      <MenuItem value="present">Present</MenuItem>
                      <MenuItem value="absent">Absent</MenuItem>
                      <MenuItem value="late">Late</MenuItem>
                      <MenuItem value="leave">Leave</MenuItem>
                      <MenuItem value="holiday">Holiday</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Remarks"
                    multiline
                    rows={2}
                    value={editedData.remarks}
                    onChange={(e) => setEditedData({ ...editedData, remarks: e.target.value })}
                    fullWidth
                  />
                </Stack>
              </Paper>
            )}

            {/* Punch In/Out Times */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <InfoItem>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    PUNCH IN
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="success.main">
                    {formatTime(attendance.punchIn?.time)}
                  </Typography>
                  {attendance.punchIn?.address && (
                    <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                      <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {attendance.punchIn.address}
                      </Typography>
                    </Box>
                  )}
                  {attendance.punchIn?.remarks && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      <strong>Remarks:</strong> {attendance.punchIn.remarks}
                    </Typography>
                  )}
                </InfoItem>
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoItem>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    PUNCH OUT
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color={attendance.punchOut?.time ? 'warning.main' : 'text.secondary'}>
                    {attendance.punchOut?.time ? formatTime(attendance.punchOut.time) : 'Not punched out'}
                  </Typography>
                  {attendance.punchOut?.address && (
                    <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                      <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {attendance.punchOut.address}
                      </Typography>
                    </Box>
                  )}
                  {attendance.punchOut?.remarks && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      <strong>Remarks:</strong> {attendance.punchOut.remarks}
                    </Typography>
                  )}
                </InfoItem>
              </Grid>
            </Grid>

            {/* Location Details */}
            <Paper sx={{ p: 2, bgcolor: alpha(PRIMARY_COLOR, 0.02), borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
                Location Details
              </Typography>
              <Grid container spacing={2}>
                {attendance.punchIn?.location && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">Punch In Coordinates</Typography>
                    <Typography variant="body2">
                      Lat: {attendance.punchIn.location.lat.toFixed(6)}<br />
                      Lng: {attendance.punchIn.location.lng.toFixed(6)}
                    </Typography>
                  </Grid>
                )}
                {attendance.punchOut?.location && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">Punch Out Coordinates</Typography>
                    <Typography variant="body2">
                      Lat: {attendance.punchOut.location.lat.toFixed(6)}<br />
                      Lng: {attendance.punchOut.location.lng.toFixed(6)}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>

            {/* Photos */}
            {photos.length > 0 && (
              <Paper sx={{ p: 2, bgcolor: alpha(PRIMARY_COLOR, 0.02), borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
                  Photos ({photos.length})
                </Typography>
                <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1 }}>
                  {photos.map((photo, index) => (
                    <PhotoPreview key={index} onClick={() => handleViewPhoto(photo)}>
                      <img src={photo.url} alt={`Attendance photo ${index + 1}`} />
                    </PhotoPreview>
                  ))}
                </Stack>
              </Paper>
            )}

            {/* Action Buttons */}
            {(canEdit || canDelete) && (
              <Box display="flex" gap={2} justifyContent="flex-end">
                {editMode ? (
                  <>
                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={() => setEditMode(false)}
                      sx={{
                        borderRadius: 2,
                        borderColor: PRIMARY_COLOR,
                        color: PRIMARY_COLOR,
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSave}
                      disabled={loading}
                      sx={{
                        borderRadius: 2,
                        bgcolor: PRIMARY_COLOR,
                        "&:hover": { bgcolor: "#1a237e" },
                      }}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </>
                ) : (
                  <>
                    {canEdit && (
                      <Button
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={handleEdit}
                        sx={{
                          borderRadius: 2,
                          borderColor: PRIMARY_COLOR,
                          color: PRIMARY_COLOR,
                        }}
                      >
                        Edit
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<Delete />}
                        onClick={handleDelete}
                        sx={{ borderRadius: 2 }}
                      >
                        Delete
                      </Button>
                    )}
                  </>
                )}
              </Box>
            )}
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Photo View Dialog */}
      <Dialog
        open={photoViewOpen}
        onClose={() => setPhotoViewOpen(false)}
        maxWidth="lg"
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 3,
            margin: isMobile ? 0 : 24,
          }
        }}
        TransitionComponent={isMobile ? Slide : Fade}
        transitionDuration={300}
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton
            onClick={() => setPhotoViewOpen(false)}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              zIndex: 10,
            }}
          >
            <Close />
          </IconButton>
          <img
            src={selectedPhoto?.url}
            alt="Attendance"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              maxHeight: '90vh',
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{
          vertical: isMobile ? "top" : "bottom",
          horizontal: isMobile ? "center" : "right",
        }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}