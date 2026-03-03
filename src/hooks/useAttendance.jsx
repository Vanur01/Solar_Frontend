import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useAttendance = () => {
  const { user, fetchAPI, safeFetchAPI, getUserRole } = useAuth();
  const [attendances, setAttendances] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [summary, setSummary] = useState({
    totalWorkHours: 0,
    avgWorkHours: 0,
    presentCount: 0,
    absentCount: 0,
    lateCount: 0,
    leaveCount: 0,
    holidayCount: 0
  });

  const userRole = getUserRole();

  // Fetch all attendances with filters
  const fetchAttendances = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetchAPI(`/attendance/?${queryParams.toString()}`);
      
      if (response?.success && response?.result) {
        setAttendances(response.result.attendances || []);
        setPagination(response.result.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: response.result.attendances?.length || 0,
          itemsPerPage: 10
        });
        setSummary(response.result.summary || {});
        
        // Check for today's attendance
        const today = new Date().toDateString();
        const todayAtt = response.result.attendances?.find(a => 
          new Date(a.date).toDateString() === today
        );
        setTodayAttendance(todayAtt);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch attendance records');
      console.error('Fetch attendances error:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchAPI]);

  // Get my attendance history (for TEAM members)
  const getMyAttendanceHistory = useCallback(async (filters = {}) => {
    if (!user?._id) return;
    return fetchAttendances({ ...filters, userId: user._id });
  }, [user, fetchAttendances]);

  // Get attendance by ID
  const getAttendanceById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchAPI(`/attendance/${id}`);
      if (response?.success) {
        return response.result;
      }
      return null;
    } catch (err) {
      setError(err.message || 'Failed to fetch attendance details');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchAPI]);

  // Punch In
  const punchIn = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // Ensure formData has the required fields
      if (!(formData instanceof FormData)) {
        const newFormData = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          newFormData.append(key, value);
        });
        formData = newFormData;
      }

      const response = await fetchAPI('/attendance/punch-in', {
        method: 'POST',
        body: formData,
        headers: {} // Let browser set content-type for FormData
      });

      if (response?.success) {
        setSuccess(response.message || 'Punch in successful');
        // Refresh attendance data
        await fetchAttendances();
        return { success: true, data: response.result };
      }
      return { success: false, error: 'Punch in failed' };
    } catch (err) {
      setError(err.message || 'Punch in failed');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [fetchAPI, fetchAttendances]);

  // Punch Out
  const punchOut = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // Ensure formData has the required fields
      if (!(formData instanceof FormData)) {
        const newFormData = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          newFormData.append(key, value);
        });
        formData = newFormData;
      }

      const response = await fetchAPI('/attendance/punch-out', {
        method: 'POST',
        body: formData,
        headers: {} // Let browser set content-type for FormData
      });

      if (response?.success) {
        setSuccess(response.message || 'Punch out successful');
        // Refresh attendance data
        await fetchAttendances();
        return { success: true, data: response.result };
      }
      return { success: false, error: 'Punch out failed' };
    } catch (err) {
      setError(err.message || 'Punch out failed');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [fetchAPI, fetchAttendances]);

  // Update attendance (for managers)
  const updateAttendance = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetchAPI(`/attendance/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });

      if (response?.success) {
        setSuccess(response.message || 'Attendance updated successfully');
        await fetchAttendances();
        return { success: true, data: response.result };
      }
      return { success: false, error: 'Update failed' };
    } catch (err) {
      setError(err.message || 'Failed to update attendance');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [fetchAPI, fetchAttendances]);

  // Delete attendance (Head Office only)
  const deleteAttendance = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetchAPI(`/attendance/${id}`, {
        method: 'DELETE'
      });

      if (response?.success) {
        setSuccess(response.message || 'Attendance deleted successfully');
        await fetchAttendances();
        return { success: true };
      }
      return { success: false, error: 'Delete failed' };
    } catch (err) {
      setError(err.message || 'Failed to delete attendance');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [fetchAPI, fetchAttendances]);

  // Get attendance stats
  const fetchStats = useCallback(async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetchAPI(`/attendance/stats?${queryParams.toString()}`);
      if (response?.success) {
        setSummary(response.result || {});
      }
    } catch (err) {
      console.error('Fetch stats error:', err);
    }
  }, [fetchAPI]);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  return {
    // State
    attendances,
    todayAttendance,
    loading,
    error,
    success,
    pagination,
    summary,
    
    // Methods
    fetchAttendances,
    getMyAttendanceHistory,
    getAttendanceById,
    punchIn,
    punchOut,
    updateAttendance,
    deleteAttendance,
    fetchStats,
    clearMessages
  };
};