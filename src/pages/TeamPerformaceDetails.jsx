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
  useMediaQuery
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
  Error as ErrorIcon
} from '@mui/icons-material';

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
  border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    borderColor: theme.palette.primary.main
  },
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  }
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
  const colors = {
    present: { bg: alpha('#4caf50', 0.1), color: '#4caf50', icon: CheckCircle },
    absent: { bg: alpha('#f44336', 0.1), color: '#f44336', icon: ErrorIcon },
    late: { bg: alpha('#ff9800', 0.1), color: '#ff9800', icon: Warning },
    leave: { bg: alpha('#9c27b0', 0.1), color: '#9c27b0', icon: Person },
    holiday: { bg: alpha('#2196f3', 0.1), color: '#2196f3', icon: CalendarToday }
  };
  const style = colors[status] || colors.present;
  const Icon = style.icon;
  
  return {
    backgroundColor: style.bg,
    color: style.color,
    fontWeight: 600,
    '& .MuiChip-icon': {
      color: style.color
    }
  };
});

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
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid', 
          borderColor: 'divider',
          bgcolor: 'white',
          p: 2,
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={700}>
              Attendance Details
            </Typography>
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={3}>
            {/* User Info */}
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: '#4569ea', width: 64, height: 64 }}>
                {attendance.user?.firstName?.charAt(0) || 'U'}
              </Avatar>
              <Box flex={1} sx={{ mt : 3}}>
                <Typography variant="h5" fontWeight={700}>
                  {attendance.user?.firstName || 'User'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {attendance.user?.email} • {attendance.user?.employeeId || 'No ID'}
                </Typography>
                <Box mt={1}>
                  <Chip
                    label={attendance.user?.role || 'TEAM'}
                    size="small"
                    sx={{ bgcolor: alpha('#4569ea', 0.1), color: '#4569ea' }}
                  />
                </Box>
              </Box>
              {!editMode && (
                <StatusChip
                  label={attendance.status || 'present'}
                  status={attendance.status}
                  icon={attendance.status === 'present' ? <CheckCircle /> : 
                         attendance.status === 'late' ? <Warning /> :
                         attendance.status === 'absent' ? <ErrorIcon /> :
                         <Person />}
                />
              )}
            </Box>

            {/* Date Info */}
            <Paper sx={{ p: 2, bgcolor: alpha('#4569ea', 0.02), borderRadius: 2 }}>
              <Stack spacing={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <CalendarToday sx={{ color: '#4569ea', fontSize: 20 }} />
                  <Typography variant="body1" fontWeight={600}>
                    {formatDate(attendance.date)}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <AccessTime sx={{ color: '#4569ea', fontSize: 20 }} />
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

            {/* Photos */}
            {photos.length > 0 && (
              <Paper sx={{ p: 2, bgcolor: alpha('#4569ea', 0.02), borderRadius: 2 }}>
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
                      sx={{ borderRadius: 2 }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSave}
                      disabled={loading}
                      sx={{ borderRadius: 2 }}
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
                        sx={{ borderRadius: 2 }}
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
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogContent sx={{ p: 1, position: 'relative' }}>
          <IconButton
            onClick={() => setPhotoViewOpen(false)}
            sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.5)', color: 'white' }}
          >
            <Close />
          </IconButton>
          <img
            src={selectedPhoto?.url}
            alt="Attendance"
            style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
          />
        </DialogContent>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}