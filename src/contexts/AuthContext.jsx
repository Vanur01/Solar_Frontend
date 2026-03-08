// contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from "react";

const AuthContext = createContext({});
const API_BASE_URL = "http://localhost:9001/api/v1";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [locationState, setLocationState] = useState({
    permission: null,
    coords: null,
    accuracy: null,
    error: null,
    isWatching: false,
    lastUpdate: null,
    source: null,
  });

  const watchIdRef = useRef(null);

  // Check if user is authenticated
  const isAuthenticated = useCallback(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    
    if (!token || !savedUser) return false;
    
    try {
      const parsedUser = JSON.parse(savedUser);
      return !!(parsedUser && parsedUser.email && parsedUser.role);
    } catch {
      return false;
    }
  }, []);

  // Check if stored attendance is from today
  const isValidAttendance = useCallback((attendanceData) => {
    if (!attendanceData || !attendanceData.punchInTime) return false;
    
    const punchInDate = new Date(attendanceData.punchInTime);
    const today = new Date();
    
    return (
      punchInDate.getDate() === today.getDate() &&
      punchInDate.getMonth() === today.getMonth() &&
      punchInDate.getFullYear() === today.getFullYear()
    );
  }, []);

  // Initialize from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");
        const savedAttendance = localStorage.getItem("attendance");

        if (token && savedUser && isAuthenticated()) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);

          // Check if stored attendance is valid for today
          if (savedAttendance) {
            const parsedAttendance = JSON.parse(savedAttendance);
            
            if (isValidAttendance(parsedAttendance)) {
              setAttendance(parsedAttendance);
              
              // Verify with server that attendance is still valid
              try {
                const response = await fetch(`${API_BASE_URL}/attendance/current`, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                const data = await response.json();
                
                if (data.success && data.result) {
                  setAttendance(data.result);
                  localStorage.setItem("attendance", JSON.stringify(data.result));
                } else {
                  localStorage.removeItem("attendance");
                  setAttendance(null);
                }
              } catch (error) {
                console.error("Failed to verify attendance:", error);
              }
            } else {
              localStorage.removeItem("attendance");
              setAttendance(null);
            }
          }
        }
      } catch (error) {
        console.error("Init error:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [isAuthenticated, isValidAttendance]);

  // Clean up location watch
  useEffect(() => {
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation?.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // API helper
  const fetchAPI = useCallback(async (endpoint, options = {}) => {
    const token = localStorage.getItem("token");
    
    const config = {
      ...options,
      headers: {
        ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.clear();
          setUser(null);
          setAttendance(null);
          window.location.href = '/login';
        }
        throw new Error(data.message || "Request failed");
      }

      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }, []);

  // Safe API call
  const safeFetchAPI = useCallback(async (endpoint, options = {}) => {
    try {
      const result = await fetchAPI(endpoint, options);
      return { success: true, ...result };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Request failed",
      };
    }
  }, [fetchAPI]);

  // ========== ENHANCED LOCATION METHODS ==========

  // Check if browser supports geolocation
  const checkGeolocationSupport = useCallback(() => {
    if (!navigator.geolocation) {
      return {
        supported: false,
        error: "Geolocation is not supported by your browser. Please use a modern browser or enter location manually."
      };
    }
    return { supported: true };
  }, []);

  // Request location with proper permission popup
  const requestLocationWithPermission = useCallback(async (options = {}) => {
    const support = checkGeolocationSupport();
    if (!support.supported) {
      return { success: false, error: support.error, code: 0 };
    }

    // Default options for high accuracy
    const geolocationOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
      ...options
    };

    return new Promise((resolve) => {
      // This will trigger the browser's permission popup
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData = {
            success: true,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: position.timestamp,
            source: "gps_high",
          };

          setLocationState(prev => ({
            ...prev,
            permission: "granted",
            coords: { lat: position.coords.latitude, lng: position.coords.longitude },
            accuracy: position.coords.accuracy,
            error: null,
            lastUpdate: new Date().toISOString(),
            source: "gps_high",
          }));

          resolve(locationData);
        },
        (error) => {
          console.error("Location error:", error);
          
          let errorMessage = "Failed to get your location";
          let errorCode = error.code;
          
          switch (error.code) {
            case 1: // PERMISSION_DENIED
              errorMessage = "Location access denied. Please allow location access in your browser settings and try again. You can also enter location manually.";
              break;
            case 2: // POSITION_UNAVAILABLE
              errorMessage = "Location unavailable. Please check your GPS signal or internet connection and try again.";
              break;
            case 3: // TIMEOUT
              errorMessage = "Location request timed out. Please try again or enter location manually.";
              break;
            default:
              errorMessage = error.message || "Failed to get location";
          }

          setLocationState(prev => ({
            ...prev,
            permission: error.code === 1 ? "denied" : "prompt",
            error: errorMessage,
          }));

          resolve({ 
            success: false, 
            error: errorMessage,
            code: errorCode 
          });
        },
        geolocationOptions
      );
    });
  }, [checkGeolocationSupport]);

  // Get current position (for punch in/out)
  const getCurrentLocation = useCallback(async (options = {}) => {
    const support = checkGeolocationSupport();
    if (!support.supported) {
      return { success: false, error: support.error };
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData = {
            success: true,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
            source: "gps",
          };

          setLocationState(prev => ({
            ...prev,
            coords: { lat: position.coords.latitude, lng: position.coords.longitude },
            accuracy: position.coords.accuracy,
            error: null,
            lastUpdate: new Date().toISOString(),
          }));

          resolve(locationData);
        },
        (error) => {
          let errorMessage = "Failed to get location";
          let errorCode = error.code;
          
          switch (error.code) {
            case 1: errorMessage = "Location permission denied"; break;
            case 2: errorMessage = "Location unavailable"; break;
            case 3: errorMessage = "Location request timed out"; break;
            default: errorMessage = error.message;
          }

          resolve({ success: false, error: errorMessage, code: errorCode });
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
          ...options
        }
      );
    });
  }, [checkGeolocationSupport]);

  // Start watching position
  const startWatchingPosition = useCallback((onUpdate, onError, options = {}) => {
    const support = checkGeolocationSupport();
    if (!support.supported) {
      onError?.(support.error);
      return null;
    }

    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const locationData = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };

        setLocationState(prev => ({
          ...prev,
          coords: { lat: position.coords.latitude, lng: position.coords.longitude },
          accuracy: position.coords.accuracy,
          isWatching: true,
          lastUpdate: new Date().toISOString(),
        }));

        onUpdate?.(locationData);
      },
      (error) => {
        let errorMessage = "Location tracking error";
        switch (error.code) {
          case 1: errorMessage = "Location permission denied"; break;
          case 2: errorMessage = "Location unavailable"; break;
          case 3: errorMessage = "Location timeout"; break;
        }
        onError?.(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
        ...options
      }
    );

    return watchIdRef.current;
  }, [checkGeolocationSupport]);

  const stopWatchingPosition = useCallback(() => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setLocationState(prev => ({ ...prev, isWatching: false }));
  }, []);

  // ========== ATTENDANCE METHODS ==========

  const punchIn = useCallback(async (latitude, longitude, source = "gps") => {
    try {
      // Validate coordinates
      if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
        return { success: false, error: "Invalid coordinates" };
      }

      setLoading(true);
      
      const response = await fetchAPI("/attendance/punch-in", {
        method: "POST",
        body: JSON.stringify({
          latitude: parseFloat(latitude.toFixed(6)),
          longitude: parseFloat(longitude.toFixed(6)),
          source,
          accuracy: locationState.accuracy,
        }),
      });

      const attendanceData = {
        status: "ON DUTY",
        punchInTime: new Date().toISOString(),
        punchOutTime: null,
        location: { latitude, longitude },
        accuracy: locationState.accuracy,
        source,
        ...(response.result || {}),
      };

      setAttendance(attendanceData);
      localStorage.setItem("attendance", JSON.stringify(attendanceData));

      return { success: true, data: attendanceData };
    } catch (err) {
      console.error("Punch in error:", err);
      return { success: false, error: err.message || "Failed to punch in" };
    } finally {
      setLoading(false);
    }
  }, [fetchAPI, locationState.accuracy]);

  const punchOut = useCallback(async (latitude, longitude) => {
    try {
      // Validate coordinates
      if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
        return { success: false, error: "Invalid coordinates" };
      }

      setLoading(true);

      const response = await fetchAPI("/attendance/punch-out", {
        method: "POST",
        body: JSON.stringify({
          latitude: parseFloat(latitude.toFixed(6)),
          longitude: parseFloat(longitude.toFixed(6)),
          accuracy: locationState.accuracy,
        }),
      });

      const attendanceData = {
        status: "OFF DUTY",
        punchInTime: attendance?.punchInTime,
        punchOutTime: new Date().toISOString(),
        location: { latitude, longitude },
        accuracy: locationState.accuracy,
        ...(response.result || {}),
      };

      setAttendance(attendanceData);
      localStorage.setItem("attendance", JSON.stringify(attendanceData));
      stopWatchingPosition();

      return { success: true, data: attendanceData };
    } catch (err) {
      console.error("Punch out error:", err);
      return { success: false, error: err.message || "Failed to punch out" };
    } finally {
      setLoading(false);
    }
  }, [fetchAPI, attendance, stopWatchingPosition, locationState.accuracy]);

  // Check current attendance status
  const checkAttendanceStatus = useCallback(async () => {
    try {
      const response = await safeFetchAPI("/attendance/current");
      
      if (response.success && response.result) {
        setAttendance(response.result);
        localStorage.setItem("attendance", JSON.stringify(response.result));
        return { success: true, data: response.result };
      } else {
        localStorage.removeItem("attendance");
        setAttendance(null);
        return { success: false, message: "No active attendance" };
      }
    } catch (error) {
      console.error("Failed to check attendance:", error);
      return { success: false, error: error.message };
    }
  }, [safeFetchAPI]);

  // ========== AUTH METHODS ==========

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchAPI("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const token = response.result?.token || response.token;
      const userData = response.result?.user || response.result || response;

      if (!token) throw new Error("No token received");

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);
      setSuccess("Login successful");

      return { success: true, user: userData, token };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    stopWatchingPosition();
    localStorage.clear();
    setUser(null);
    setAttendance(null);
    setLocationState({
      permission: null,
      coords: null,
      accuracy: null,
      error: null,
      isWatching: false,
      lastUpdate: null,
      source: null,
    });
  }, [stopWatchingPosition]);

  // ========== VISIT METHODS ==========

  const createVisit = useCallback(async (visitData, photoFile) => {
    try {
      const formData = new FormData();
      formData.append("locationName", visitData.locationName);
      formData.append("latitude", parseFloat(visitData.latitude).toFixed(6));
      formData.append("longitude", parseFloat(visitData.longitude).toFixed(6));
      if (visitData.remarks) formData.append("remarks", visitData.remarks);
      if (visitData.visitDate) formData.append("visitDate", visitData.visitDate);
      formData.append("photos", photoFile);

      const response = await fetchAPI("/visit/", {
        method: "POST",
        body: formData,
      });

      return { success: true, data: response.result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [fetchAPI]);

  const getVisits = useCallback(async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return await safeFetchAPI(`/visit?${queryParams}`);
  }, [safeFetchAPI]);

  const getVisitById = useCallback(async (visitId) => {
    return await safeFetchAPI(`/visit/${visitId}`);
  }, [safeFetchAPI]);

  const updateVisit = useCallback(async (visitId, updateData, photoFile = null) => {
    try {
      let body;
      const options = { method: "PUT" };

      if (photoFile) {
        const formData = new FormData();
        Object.keys(updateData).forEach(key => {
          if (updateData[key] !== undefined) {
            formData.append(key, updateData[key].toString());
          }
        });
        if (photoFile) formData.append("photos", photoFile);
        body = formData;
      } else {
        options.headers = { "Content-Type": "application/json" };
        body = JSON.stringify(updateData);
      }

      options.body = body;
      const response = await fetchAPI(`/visit/${visitId}`, options);
      return { success: true, data: response.result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [fetchAPI]);

  const deleteVisit = useCallback(async (visitId) => {
    try {
      await fetchAPI(`/visit/${visitId}`, { method: "DELETE" });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [fetchAPI]);

  const completeVisit = useCallback(async (visitId) => {
    try {
      const response = await fetchAPI(`/visit/${visitId}/complete`, { method: "PATCH" });
      return { success: true, data: response.result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [fetchAPI]);

  const verifyVisit = useCallback(async (visitId) => {
    try {
      const response = await fetchAPI(`/visit/${visitId}/verify`, { method: "PATCH" });
      return { success: true, data: response.result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [fetchAPI]);

  const cancelVisit = useCallback(async (visitId, reason) => {
    try {
      const response = await fetchAPI(`/visit/${visitId}/cancel`, {
        method: "PATCH",
        body: JSON.stringify({ reason }),
      });
      return { success: true, data: response.result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [fetchAPI]);

  // ========== STATS METHODS ==========

  const getVisitStats = useCallback(async () => {
    return await safeFetchAPI("/visit/stats/overview");
  }, [safeFetchAPI]);

  const getRecentVisits = useCallback(async (limit = 5) => {
    return await safeFetchAPI(`/visit/activity/recent?limit=${limit}`);
  }, [safeFetchAPI]);

  const getTeamPerformance = useCallback(async (page = 1, limit = 10, sortBy = "distance", sortOrder = "desc", startDate, endDate) => {
    let url = `/visit/performance/team?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    return await safeFetchAPI(url);
  }, [safeFetchAPI]);

  const getMyPerformance = useCallback(async (startDate, endDate) => {
    return await safeFetchAPI(`/visit/performance/me?startDate=${startDate}&endDate=${endDate}`);
  }, [safeFetchAPI]);

  const getTeamMemberPerformance = useCallback(async (memberId) => {
    return await safeFetchAPI(`/visit/performance/team-member/${memberId}`);
  }, [safeFetchAPI]);

  // ========== ROLE HELPERS ==========

  const getUserRole = useCallback(() => user?.role || null, [user]);
  const isTeamMember = useCallback(() => user?.role === "TEAM", [user]);
  const isManager = useCallback(() => ["ZSM", "ASM", "Head_office"].includes(user?.role), [user]);

  const value = {
    // User
    user,
    loading,
    error,
    success,
    attendance,

    // Location
    locationState,
    requestLocationWithPermission,
    getCurrentLocation,
    startWatchingPosition,
    stopWatchingPosition,
    checkGeolocationSupport,

    // Auth
    login,
    logout,
    fetchAPI,
    safeFetchAPI,
    isAuthenticated,
    checkAttendanceStatus,

    // Attendance
    punchIn,
    punchOut,

    // Visits
    createVisit,
    getVisits,
    getVisitById,
    updateVisit,
    deleteVisit,
    completeVisit,
    verifyVisit,
    cancelVisit,

    // Stats
    getVisitStats,
    getRecentVisits,
    getTeamPerformance,
    getMyPerformance,
    getTeamMemberPerformance,

    // Role helpers
    getUserRole,
    isTeamMember,
    isManager,

    // Setters
    setError,
    setSuccess,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;