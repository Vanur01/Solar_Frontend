// contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from "react";
import io from 'socket.io-client';

const AuthContext = createContext({});
const API_BASE_URL = "https://backend.sunergytechsolar.com/api/v1";
const SOCKET_URL = "https://backend.sunergytechsolar.com";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [locationState, setLocationState] = useState({
    permission: null,
    coords: null,
    accuracy: null,
    error: null,
    isWatching: false,
    isOnline: false
  });
  const [attendance, setAttendance] = useState(null);
  
  const watchIdRef = useRef(null);
  const locationIntervalRef = useRef(null);

  // Initialize Socket.IO connection
  const initializeSocket = useCallback(() => {
    if (!user?._id) return null;

    const token = localStorage.getItem("token");
    const socketInstance = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
      setLocationState(prev => ({ ...prev, isOnline: true }));
      
      // Join user's room
      socketInstance.emit('user:online', { 
        userId: user._id,
        role: user.role 
      });
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setLocationState(prev => ({ ...prev, isOnline: false }));
    });

    socketInstance.on('users:online', (users) => {
      setOnlineUsers(users);
    });

    socketInstance.on('location:update', (data) => {
      // Handle real-time location updates from other users
      console.log('Location update received:', data);
    });

    socketInstance.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(socketInstance);
    return socketInstance;
  }, [user]);

  // Cleanup socket on unmount or logout
  useEffect(() => {
    if (user) {
      const socketInstance = initializeSocket();
      return () => {
        if (socketInstance) {
          socketInstance.disconnect();
        }
      };
    }
  }, [user, initializeSocket]);

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

  // Initialize from localStorage
  useEffect(() => {
    const initAuth = () => {
      try {
        const token = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");
        const savedAttendance = localStorage.getItem("attendance");
        
        if (token && savedUser && isAuthenticated()) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
        }

        if (savedAttendance) {
          setAttendance(JSON.parse(savedAttendance));
        }
      } catch (error) {
        console.error('Init error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [isAuthenticated]);

  // Clean up location watch on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation?.clearWatch(watchIdRef.current);
      }
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
      }
    };
  }, []);

  // Send location update via socket
  const sendLocationUpdate = useCallback((location) => {
    if (socket?.connected && user?._id) {
      socket.emit('location:update', {
        userId: user._id,
        location: {
          lat: location.lat,
          lng: location.lng,
          accuracy: location.accuracy,
          speed: location.speed,
          heading: location.heading,
          timestamp: new Date().toISOString()
        },
        attendance: attendance?.status || 'OFF DUTY'
      });
    }
  }, [socket, user, attendance]);

  // Request location permission with modern approach
  const requestLocationPermission = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocationState(prev => ({
        ...prev,
        permission: 'unsupported',
        error: 'Geolocation not supported'
      }));
      return { 
        success: false, 
        error: 'Geolocation not supported',
        type: 'unsupported'
      };
    }

    try {
      if (navigator.permissions?.query) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        
        if (permission.state === 'denied') {
          setLocationState(prev => ({ ...prev, permission: 'denied' }));
          return {
            success: false,
            error: 'Location access denied. Please enable in browser settings.',
            type: 'denied',
            permanent: true
          };
        }
      }

      const result = await new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const locationData = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
              speed: position.coords.speed,
              heading: position.coords.heading
            };

            setLocationState(prev => ({
              ...prev,
              permission: 'granted',
              coords: locationData,
              accuracy: position.coords.accuracy,
              error: null
            }));

            resolve({ 
              success: true, 
              ...locationData
            });
          },
          (error) => {
            let errorMessage = 'Location permission denied';
            if (error.code === 1) errorMessage = 'Location access denied';
            else if (error.code === 2) errorMessage = 'Location unavailable';
            else if (error.code === 3) errorMessage = 'Location timeout';
            
            setLocationState(prev => ({
              ...prev,
              permission: 'denied',
              error: errorMessage
            }));
            resolve({ success: false, error: errorMessage, code: error.code });
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
          }
        );
      });
      
      return result;
    } catch (error) {
      console.error('Location permission error:', error);
      return { success: false, error: 'Failed to request location' };
    }
  }, []);

  // Smart location fetching with fallbacks
  const getCurrentPosition = useCallback(async (options = {}) => {
    if (!navigator.geolocation) {
      return { success: false, error: 'Geolocation not supported' };
    }

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    };

    const geolocationOptions = { ...defaultOptions, ...options };

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, geolocationOptions);
        
        const timeoutId = setTimeout(() => {
          reject({ code: 3, message: 'Location timeout' });
        }, geolocationOptions.timeout + 1000);

        return () => clearTimeout(timeoutId);
      });

      const locationData = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        speed: position.coords.speed,
        heading: position.coords.heading,
        timestamp: position.timestamp
      };

      setLocationState(prev => ({
        ...prev,
        coords: locationData,
        accuracy: position.coords.accuracy,
        error: null
      }));

      // Send real-time update via socket
      sendLocationUpdate(locationData);

      return {
        success: true,
        ...locationData,
        source: 'gps'
      };
    } catch (error) {
      console.error('Get position error:', error);
      
      let errorMessage = 'Failed to get location';
      let errorType = 'UNKNOWN';
      
      if (error.code === 1) {
        errorMessage = 'Location permission denied';
        errorType = 'PERMISSION_DENIED';
      } else if (error.code === 2) {
        errorMessage = 'Location unavailable';
        errorType = 'POSITION_UNAVAILABLE';
      } else if (error.code === 3) {
        errorMessage = 'Location timeout - trying fallback...';
        errorType = 'TIMEOUT';
      }
      
      setLocationState(prev => ({ ...prev, error: errorMessage }));
      
      return { 
        success: false, 
        error: errorMessage,
        errorType,
        code: error.code 
      };
    }
  }, [sendLocationUpdate]);

  // Get location with intelligent fallbacks
  const getLocationSmart = useCallback(async () => {
    setLocationState(prev => ({ ...prev, isWatching: true }));
    
    let result = await getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
    
    if (result.success) {
      setLocationState(prev => ({ ...prev, isWatching: false }));
      return result;
    }

    if (result.errorType === 'TIMEOUT') {
      result = await getCurrentPosition({ 
        enableHighAccuracy: false, 
        timeout: 8000,
        maximumAge: 60000 
      });
      
      if (result.success) {
        setLocationState(prev => ({ ...prev, isWatching: false }));
        return {
          ...result,
          source: 'network',
          accuracy: 'low'
        };
      }
    }

    try {
      const ipResponse = await fetch('https://ipapi.co/json/');
      const ipData = await ipResponse.json();
      
      if (ipData.latitude && ipData.longitude) {
        setLocationState(prev => ({ ...prev, isWatching: false }));
        return {
          success: true,
          lat: ipData.latitude,
          lng: ipData.longitude,
          source: 'ip',
          accuracy: 'ip',
          city: ipData.city,
          region: ipData.region
        };
      }
    } catch (ipError) {
      console.error('IP location failed:', ipError);
    }

    setLocationState(prev => ({ ...prev, isWatching: false }));
    return {
      success: false,
      error: 'Unable to get location',
      suggestions: [
        'Enable GPS on your device',
        'Move to an open area',
        'Check location permissions',
        'Try manual entry'
      ]
    };
  }, [getCurrentPosition]);

  // Start watching position with real-time updates
  const startWatchingPosition = useCallback((onUpdate, onError, interval = 5000) => {
    if (!navigator.geolocation) {
      onError?.('Geolocation not supported');
      return null;
    }

    // Use watchPosition for continuous tracking
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const locationData = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed,
          heading: position.coords.heading,
          timestamp: position.timestamp
        };
        
        setLocationState(prev => ({
          ...prev,
          coords: locationData,
          accuracy: position.coords.accuracy,
          isWatching: true
        }));

        // Send real-time update via socket
        sendLocationUpdate(locationData);
        
        onUpdate?.(locationData);
      },
      (error) => {
        console.error('Watch position error:', error);
        onError?.(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    // Also send periodic updates as backup
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
    }

    locationIntervalRef.current = setInterval(async () => {
      const result = await getCurrentPosition({ enableHighAccuracy: true, timeout: 5000 });
      if (result.success) {
        sendLocationUpdate(result);
      }
    }, interval);

    return watchIdRef.current;
  }, [sendLocationUpdate, getCurrentPosition]);

  // Stop watching position
  const stopWatchingPosition = useCallback(() => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }
    setLocationState(prev => ({ ...prev, isWatching: false }));
    
    // Notify others that user stopped tracking
    if (socket?.connected && user?._id) {
      socket.emit('location:stop', { userId: user._id });
    }
  }, [socket, user]);

  // API call helper
  const fetchAPI = useCallback(async (endpoint, options = {}) => {
    const token = localStorage.getItem("token");
    
    const config = {
      ...options,
      headers: {
        ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      }
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw {
          message: data.message || 'Request failed',
          status: response.status,
          data
        };
      }

      return data;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw { message: 'Network error - check your connection', type: 'NETWORK' };
      }
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
        error: error.message || 'Request failed',
        status: error.status,
        type: error.type
      };
    }
  }, [fetchAPI]);

  // Login
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchAPI("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });

      let token, userData;

      if (response?.result) {
        token = response.result.token;
        userData = response.result.user || response.result;
      } else if (response?.data) {
        token = response.data.token;
        userData = response.data;
      } else if (response?.token) {
        token = response.token;
        userData = response;
      } else if (response?.user?.token) {
        token = response.user.token;
        userData = response.user;
      } else if (response?._id && response?.token) {
        token = response.token;
        userData = response;
      } else {
        console.error("Unexpected response format:", response);
        throw new Error("Invalid response format from server");
      }

      if (!token) {
        throw new Error("No authentication token received");
      }

      const cleanUserData = { ...userData };
      delete cleanUserData.token;
      delete cleanUserData.refreshToken;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(cleanUserData));

      setUser(cleanUserData);
      setSuccess("Login successful");
      
      return { 
        success: true, 
        user: cleanUserData,
        token,
        role: cleanUserData.role 
      };
      
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.message || "Login failed";
      setError(errorMessage);
      
      let errorType = 'LOGIN_ERROR';
      if (err.message?.includes('Network')) {
        errorType = 'NETWORK_ERROR';
      } else if (err.message?.includes('permission') || err.message?.includes('403')) {
        errorType = 'PERMISSION_DENIED';
      } else if (err.message?.includes('401')) {
        errorType = 'UNAUTHORIZED';
      }
      
      return { 
        success: false, 
        error: errorMessage,
        errorType
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = useCallback(() => {
    // Notify others about logout
    if (socket?.connected && user?._id) {
      socket.emit('user:offline', { userId: user._id });
    }

    // Disconnect socket
    if (socket) {
      socket.disconnect();
    }

    // Stop location tracking
    stopWatchingPosition();

    // Clear storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Reset state
    setUser(null);
    setError(null);
    setSuccess(null);
    setAttendance(null);
    setSocket(null);
    setOnlineUsers([]);
    setLocationState({
      permission: null,
      coords: null,
      accuracy: null,
      error: null,
      isWatching: false,
      isOnline: false
    });
  }, [socket, user, stopWatchingPosition]);

  // Punch In
  const punchIn = useCallback(async (latitude, longitude, source = 'gps') => {
    try {
      const response = await fetchAPI("/attendance/punch-in", {
        method: "POST",
        body: JSON.stringify({ latitude, longitude, source })
      });

      if (response.success || response.result) {
        const attendanceData = {
          status: 'ON DUTY',
          punchInTime: new Date().toISOString(),
          punchOutTime: null,
          location: { latitude, longitude },
          source,
          ...(response.result || {})
        };
        setAttendance(attendanceData);
        localStorage.setItem("attendance", JSON.stringify(attendanceData));

        // Notify via socket
        if (socket?.connected) {
          socket.emit('attendance:update', {
            userId: user?._id,
            status: 'ON DUTY',
            timestamp: new Date().toISOString()
          });
        }
        
        return { success: true, data: attendanceData };
      }
      
      throw new Error(response.message || "Punch in failed");
      
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [fetchAPI, socket, user]);

  // Punch Out
  const punchOut = useCallback(async (latitude, longitude) => {
    try {
      const response = await fetchAPI("/attendance/punch-out", {
        method: "POST",
        body: JSON.stringify({ latitude, longitude })
      });

      if (response.success || response.result) {
        const attendanceData = {
          status: 'OFF DUTY',
          punchInTime: attendance?.punchInTime,
          punchOutTime: new Date().toISOString(),
          location: { latitude, longitude },
          ...(response.result || {})
        };
        setAttendance(attendanceData);
        localStorage.setItem("attendance", JSON.stringify(attendanceData));

        // Notify via socket
        if (socket?.connected) {
          socket.emit('attendance:update', {
            userId: user?._id,
            status: 'OFF DUTY',
            timestamp: new Date().toISOString()
          });
        }

        // Stop tracking when punching out
        stopWatchingPosition();
        
        return { success: true, data: attendanceData };
      }
      
      throw new Error(response.message || "Punch out failed");
      
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [fetchAPI, attendance, socket, user, stopWatchingPosition]);

  // Create visit
  const createVisit = useCallback(async (visitData, photoFile) => {
    try {
      setLoading(true);
      setError(null);

      if (!visitData.locationName) {
        throw new Error('Location name is required');
      }
      if (!visitData.latitude || !visitData.longitude) {
        throw new Error('Location coordinates are required');
      }
      if (!photoFile) {
        throw new Error('Photo is required');
      }

      if (!photoFile.type.startsWith('image/')) {
        throw new Error('Please upload an image file');
      }

      if (photoFile.size > 10 * 1024 * 1024) {
        throw new Error('Image size should be less than 10MB');
      }

      const formData = new FormData();
      formData.append('locationName', visitData.locationName);
      formData.append('latitude', visitData.latitude.toString());
      formData.append('longitude', visitData.longitude.toString());
      
      if (visitData.remarks) {
        formData.append('remarks', visitData.remarks);
      }
      
      formData.append('photos', photoFile);

      const response = await fetchAPI('/visit/', {
        method: 'POST',
        body: formData,
      });

      if (response.success && response.result) {
        setSuccess('Visit created successfully');

        // Notify via socket
        if (socket?.connected) {
          socket.emit('visit:created', {
            userId: user?._id,
            visit: response.result,
            timestamp: new Date().toISOString()
          });
        }

        return { 
          success: true, 
          data: response.result,
          message: response.message 
        };
      } else {
        throw new Error(response.message || 'Failed to create visit');
      }
    } catch (err) {
      console.error('Create visit error:', err);
      setError(err.message || 'Failed to create visit');
      return { 
        success: false, 
        error: err.message || 'Failed to create visit' 
      };
    } finally {
      setLoading(false);
    }
  }, [fetchAPI, socket, user]);

  // Get visits
  const getVisits = useCallback(async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await safeFetchAPI(`/visit?${queryParams}`);
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [safeFetchAPI]);

  // Get visit by ID
  const getVisitById = useCallback(async (visitId) => {
    try {
      const response = await safeFetchAPI(`/visit/${visitId}`);
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [safeFetchAPI]);

  // Update visit
  const updateVisit = useCallback(async (visitId, updateData, photoFile = null) => {
    try {
      setLoading(true);

      let body;
      const options = {
        method: 'PUT',
      };

      if (photoFile) {
        const formData = new FormData();
        Object.keys(updateData).forEach(key => {
          if (updateData[key] !== undefined && updateData[key] !== null) {
            formData.append(key, updateData[key].toString());
          }
        });
        formData.append('photos', photoFile);
        body = formData;
      } else {
        options.headers = { 'Content-Type': 'application/json' };
        body = JSON.stringify(updateData);
      }

      options.body = body;

      const response = await fetchAPI(`/visit/${visitId}`, options);
      
      if (response.success && response.result) {
        setSuccess('Visit updated successfully');
        return { success: true, data: response.result };
      } else {
        throw new Error(response.message || 'Failed to update visit');
      }
    } catch (err) {
      console.error('Update visit error:', err);
      setError(err.message || 'Failed to update visit');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [fetchAPI]);

  // Delete visit
  const deleteVisit = useCallback(async (visitId) => {
    try {
      const response = await fetchAPI(`/visit/${visitId}`, {
        method: 'DELETE'
      });

      if (response.success) {
        setSuccess('Visit deleted successfully');
        return { success: true, message: response.message };
      } else {
        throw new Error(response.message || 'Failed to delete visit');
      }
    } catch (err) {
      console.error('Delete visit error:', err);
      setError(err.message || 'Failed to delete visit');
      return { success: false, error: err.message };
    }
  }, [fetchAPI]);

  // Verify visit
  const verifyVisit = useCallback(async (visitId, verified = true, notes = '') => {
    try {
      const response = await fetchAPI(`/visit/${visitId}/verify`, {
        method: 'PUT',
        body: JSON.stringify({ verified, notes })
      });

      if (response.success) {
        setSuccess(`Visit ${verified ? 'verified' : 'unverified'} successfully`);
        return { success: true, data: response.result };
      } else {
        throw new Error(response.message || 'Failed to verify visit');
      }
    } catch (err) {
      console.error('Verify visit error:', err);
      setError(err.message || 'Failed to verify visit');
      return { success: false, error: err.message };
    }
  }, [fetchAPI]);

  // Get visit stats
  const getVisitStats = useCallback(async () => {
    const response = await safeFetchAPI("/visit/stats/overview");
    return response;
  }, [safeFetchAPI]);

  // Get recent visits
  const getRecentVisits = useCallback(async (limit = 5) => {
    const response = await safeFetchAPI(`/visit/activity/recent?limit=${limit}`);
    return response;
  }, [safeFetchAPI]);

  // Check-in to visit
  const checkInToVisit = useCallback(async (visitId, checkInData) => {
    try {
      const response = await fetchAPI(`/visit/${visitId}/checkin`, {
        method: 'POST',
        body: JSON.stringify(checkInData)
      });

      if (response.success) {
        setSuccess('Checked in successfully');
        return { success: true, data: response.result };
      } else {
        throw new Error(response.message || 'Failed to check in');
      }
    } catch (err) {
      console.error('Check-in error:', err);
      setError(err.message || 'Failed to check in');
      return { success: false, error: err.message };
    }
  }, [fetchAPI]);

  // Check-out from visit
  const checkOutFromVisit = useCallback(async (visitId, checkOutData) => {
    try {
      const response = await fetchAPI(`/visit/${visitId}/checkout`, {
        method: 'POST',
        body: JSON.stringify(checkOutData)
      });

      if (response.success) {
        setSuccess('Checked out successfully');
        return { success: true, data: response.result };
      } else {
        throw new Error(response.message || 'Failed to check out');
      }
    } catch (err) {
      console.error('Check-out error:', err);
      setError(err.message || 'Failed to check out');
      return { success: false, error: err.message };
    }
  }, [fetchAPI]);

  // Get team performance
  const getTeamPerformance = useCallback(async (page = 1, limit = 10, sortBy = 'distance', sortOrder = 'desc') => {
    const response = await safeFetchAPI(`/visit/performance/team?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`);
    return response;
  }, [safeFetchAPI]);

  // Get my performance
  const getMyPerformance = useCallback(async (startDate, endDate) => {
    const response = await safeFetchAPI(`/visit/performance/me?startDate=${startDate}&endDate=${endDate}`);
    return response;
  }, [safeFetchAPI]);

  // Export data
  const exportData = useCallback(async () => {
    try {
      const response = await fetchAPI('/visit/export/data');
      if (response.success && response.result) {
        return { success: true, data: response.result };
      }
      return { success: false, error: 'Failed to export data' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [fetchAPI]);

  // Get user role
  const getUserRole = useCallback(() => {
    return user?.role || null;
  }, [user]);

  // Check if user can view all teams
  const canViewAllTeams = useCallback(() => {
    const role = user?.role;
    return role === 'Head_office' || role === 'ZSM';
  }, [user]);

  // Check if user can manage team
  const canManageTeam = useCallback(() => {
    const role = user?.role;
    return role === 'Head_office' || role === 'ZSM' || role === 'ASM';
  }, [user]);

  const value = {
    // User state
    user,
    loading,
    error,
    success,
    attendance,
    
    // Socket state
    socket,
    onlineUsers,
    
    // Location state
    locationState,
    
    // Auth methods
    login,
    logout,
    fetchAPI,
    safeFetchAPI,
    isAuthenticated,
    getUserRole,
    canViewAllTeams,
    canManageTeam,
    
    // Location methods
    requestLocationPermission,
    getCurrentPosition,
    getLocationSmart,
    startWatchingPosition,
    stopWatchingPosition,
    
    // Attendance methods
    punchIn,
    punchOut,
    
    // Visit CRUD methods
    createVisit,
    getVisits,
    getVisitById,
    updateVisit,
    deleteVisit,
    verifyVisit,
    
    // Visit specific methods
    getVisitStats,
    getRecentVisits,
    checkInToVisit,
    checkOutFromVisit,
    
    // Performance methods
    getTeamPerformance,
    getMyPerformance,
    exportData,
    
    // Helpers
    setError,
    setSuccess
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};