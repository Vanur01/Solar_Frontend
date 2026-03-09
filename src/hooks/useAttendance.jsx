// hooks/useAttendance.js
import { useState, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";

export const useAttendance = () => {
  const { user, fetchAPI, punchIn: authPunchIn, punchOut: authPunchOut } = useAuth();

  const [attendances, setAttendances] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [summary, setSummary] = useState({
    totalWorkHours: 0,
    avgWorkHours: 0,
    presentCount: 0,
    absentCount: 0,
    lateCount: 0,
    leaveCount: 0,
    holidayCount: 0,
  });

  // ── helpers ────────────────────────────────────────────────────────────────
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  // ── fetchAttendances ───────────────────────────────────────────────────────
  const fetchAttendances = useCallback(
    async (filters = {}) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== "") params.append(k, v);
        });
        const url = `/attendance/`;
        
        const res = await fetchAPI(url);

        if (res?.success && res?.result) {
          const {
            attendances: list = [],
            pagination: pg,
            summary: sm,
          } = res.result;
          
          setAttendances(list);
          setPagination(
            pg || {
              currentPage: 1,
              totalPages: 1,
              totalItems: list.length,
              itemsPerPage: 10,
            },
          );
          setSummary(sm || {});

          const todayStr = new Date().toDateString();
          const today = list.find((a) => new Date(a.date).toDateString() === todayStr) || null;
          setTodayAttendance(today);

          return res.result;
        }
        return null;
      } catch (err) {
        setError(err.message || "Failed to fetch attendance records");
        console.error("fetchAttendances:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchAPI],
  );

  // ── getMyAttendanceHistory ─────────────────────────────────────────────────
  const getMyAttendanceHistory = useCallback(
    async (filters = {}) => {
      if (!user?._id) return null;
      return fetchAttendances({ ...filters, userId: user._id });
    },
    [user, fetchAttendances],
  );

  // ── getTeamMembers ─────────────────────────────────────────────────────────
  const getTeamMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAPI("/user/getAllUsers");
      if (res?.success) {
        const all = res.result?.users || [];
        return all.filter((u) => u.role === "TEAM");
      }
      return [];
    } catch (err) {
      setError(err.message || "Failed to fetch team members");
      console.error("getTeamMembers:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [fetchAPI]);

  // ── getAttendanceById ──────────────────────────────────────────────────────
  const getAttendanceById = useCallback(
    async (id) => {
      if (!id) {
        setError("Attendance ID is required");
        return null;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await fetchAPI(`/attendance/${id}`);
        return res?.success ? res.result : null;
      } catch (err) {
        setError(err.message || "Failed to fetch attendance details");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchAPI],
  );

  // ── punchIn ────────────────────────────────────────────────────────────────
  const punchIn = useCallback(
    async (locationData) => {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      // Validate authPunchIn is available
      if (!authPunchIn) {
        const error = "Punch in function not available";
        console.error(error);
        setError(error);
        setLoading(false);
        return { success: false, error };
      }
      
      try {
        // Prepare the punch data
        const punchData = {
          latitude: locationData.latitude,
          longitude: locationData.longitude,
        };

        console.log("Calling authPunchIn with:", punchData); // Debug log
        const result = await authPunchIn(punchData);
        console.log("authPunchIn result:", result); // Debug log
        
        if (result?.success) {
          setSuccess(result.message || "Punch in successful");
          await fetchAttendances();
        } else {
          setError(result?.error || "Punch in failed");
        }
        return result;
      } catch (err) {
        console.error("Punch in error:", err);
        setError(err.message || "Punch in failed");
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [authPunchIn, fetchAttendances],
  );

  // ── punchOut ───────────────────────────────────────────────────────────────
  const punchOut = useCallback(
    async (locationData) => {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      // Validate authPunchOut is available
      if (!authPunchOut) {
        const error = "Punch out function not available";
        console.error(error);
        setError(error);
        setLoading(false);
        return { success: false, error };
      }
      
      try {
        // Prepare the punch data
        const punchData = {
          latitude: locationData.latitude,
          longitude: locationData.longitude,
        };

        console.log("Calling authPunchOut with:", punchData); // Debug log
        const result = await authPunchOut(punchData);
        console.log("authPunchOut result:", result); // Debug log
        
        if (result?.success) {
          setSuccess(result.message || "Punch out successful");
          await fetchAttendances();
        } else {
          setError(result?.error || "Punch out failed");
        }
        return result;
      } catch (err) {
        console.error("Punch out error:", err);
        setError(err.message || "Punch out failed");
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [authPunchOut, fetchAttendances],
  );

  // ── updateAttendance ───────────────────────────────────────────────────────
  const updateAttendance = useCallback(
    async (id, data) => {
      if (!id) {
        setError("Attendance ID is required");
        return { success: false, error: "Attendance ID is required" };
      }
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
        const res = await fetchAPI(`/attendance/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (res?.success) {
          setSuccess(res.message || "Attendance updated successfully");
          await fetchAttendances();
          return { success: true, data: res.result };
        }
        return { success: false, error: res?.message || "Update failed" };
      } catch (err) {
        setError(err.message || "Failed to update attendance");
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [fetchAPI, fetchAttendances],
  );

  // ── deleteAttendance ───────────────────────────────────────────────────────
  const deleteAttendance = useCallback(
    async (id) => {
      if (!id) {
        setError("Attendance ID is required");
        return { success: false, error: "Attendance ID is required" };
      }
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
        const res = await fetchAPI(`/attendance/${id}`, { method: "DELETE" });
        if (res?.success) {
          setSuccess(res.message || "Attendance deleted");
          await fetchAttendances();
          return { success: true };
        }
        return { success: false, error: res?.message || "Delete failed" };
      } catch (err) {
        setError(err.message || "Failed to delete attendance");
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [fetchAPI, fetchAttendances],
  );

  return {
    // state
    attendances,
    todayAttendance,
    loading,
    error,
    success,
    pagination,
    summary,
    // methods
    fetchAttendances,
    getMyAttendanceHistory,
    getTeamMembers,
    getAttendanceById,
    punchIn,
    punchOut,
    updateAttendance,
    deleteAttendance,
    clearMessages,
  };
};