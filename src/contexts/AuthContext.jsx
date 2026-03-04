// contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from "react";

const AuthContext = createContext({});

const API_BASE_URL = "http://localhost:9001/api/v1";

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
  const [locationState, setLocationState] = useState({
    permission: null,
    coords: null,
    accuracy: null,
    error: null,
    isWatching: false
  });
  const [attendance, setAttendance] = useState(null);
  
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
    };
  }, []);

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
      // Check permission status if available
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

      // Trigger permission prompt
      const result = await new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocationState(prev => ({
              ...prev,
              permission: 'granted',
              coords: {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              },
              accuracy: position.coords.accuracy,
              error: null
            }));
            resolve({ 
              success: true, 
              coords: {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy
              }
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
        
        // Backup timeout
        const timeoutId = setTimeout(() => {
          reject({ code: 3, message: 'Location timeout' });
        }, geolocationOptions.timeout + 1000);

        // Clear timeout if position found
        return () => clearTimeout(timeoutId);
      });

      setLocationState(prev => ({
        ...prev,
        coords: {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        },
        accuracy: position.coords.accuracy,
        error: null
      }));

      return {
        success: true,
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        speed: position.coords.speed,
        heading: position.coords.heading,
        timestamp: position.timestamp,
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
  }, []);

  // Get location with intelligent fallbacks
  const getLocationSmart = useCallback(async () => {
    setLocationState(prev => ({ ...prev, isWatching: true }));
    
    // Try high accuracy first
    let result = await getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
    
    if (result.success) {
      setLocationState(prev => ({ ...prev, isWatching: false }));
      return result;
    }

    // If timeout, try low accuracy
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

    // Last resort - IP location
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

  // Start watching position
  const startWatchingPosition = useCallback((onUpdate, onError) => {
    if (!navigator.geolocation) {
      onError?.('Geolocation not supported');
      return null;
    }

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

    return watchIdRef.current;
  }, []);

  // Stop watching position
  const stopWatchingPosition = useCallback(() => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setLocationState(prev => ({ ...prev, isWatching: false }));
    }
  }, []);

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

  // ============ LOGIN - IMPROVED ============
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchAPI("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });

      console.log("Login raw response:", response);

      // Handle different response structures
      let token, userData;

      // Check if response has result wrapper (like your API)
      if (response?.result) {
        token = response.result.token;
        userData = response.result.user || response.result;
      } 
      // Check if response has data wrapper
      else if (response?.data) {
        token = response.data.token;
        userData = response.data;
      }
      // Check if response has token directly
      else if (response?.token) {
        token = response.token;
        userData = response;
      }
      // Check if response has user object with token inside
      else if (response?.user?.token) {
        token = response.user.token;
        userData = response.user;
      }
      // Check if response is the user object itself with token
      else if (response?._id && response?.token) {
        token = response.token;
        userData = response;
      }
      else {
        console.error("Unexpected response format:", response);
        throw new Error("Invalid response format from server");
      }

      if (!token) {
        throw new Error("No authentication token received");
      }

      // Clean user data (remove sensitive fields)
      const cleanUserData = { ...userData };
      delete cleanUserData.token;
      delete cleanUserData.refreshToken;

      // Store in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(cleanUserData));

      // Update state
      setUser(cleanUserData);
      setSuccess("Login successful");
      
      // Return success with user data and token
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
      
      // Determine error type
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
    localStorage.clear();
    sessionStorage.clear();
    setUser(null);
    setError(null);
    setSuccess(null);
    setAttendance(null);
    stopWatchingPosition();
  }, [stopWatchingPosition]);

  // Punch In
  const punchIn = useCallback(async (latitude, longitude, source = 'gps') => {
    try {
      const response = await fetchAPI("/attendance/punch-in", {
        method: "POST",
        body: JSON.stringify({ latitude, longitude })
      });

      if (response.success || response.result) {
        const attendanceData = {
          status: 'ON DUTY',
          punchInTime: new Date().toISOString(),
          punchOutTime: null,
          location: { latitude, longitude },
          source
        };
        setAttendance(attendanceData);
        localStorage.setItem("attendance", JSON.stringify(attendanceData));
        
        return { success: true, data: attendanceData };
      }
      
      throw new Error(response.message || "Punch in failed");
      
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [fetchAPI]);

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
          location: { latitude, longitude }
        };
        setAttendance(attendanceData);
        localStorage.setItem("attendance", JSON.stringify(attendanceData));
        
        return { success: true, data: attendanceData };
      }
      
      throw new Error(response.message || "Punch out failed");
      
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [fetchAPI, attendance]);

  // ============ VISIT METHODS ============

  /**
   * Create a new visit with photo upload
   * @param {Object} visitData - Visit data object
   * @param {string} visitData.locationName - Name of the location
   * @param {number} visitData.latitude - Latitude coordinate
   * @param {number} visitData.longitude - Longitude coordinate
   * @param {string} visitData.remarks - Optional remarks
   * @param {File} photoFile - Photo file to upload
   * @returns {Promise<Object>} API response
   */
  const createVisit = useCallback(async (visitData, photoFile) => {
    try {
      setLoading(true);
      setError(null);

      // Validate required fields
      if (!visitData.locationName) {
        throw new Error('Location name is required');
      }
      if (!visitData.latitude || !visitData.longitude) {
        throw new Error('Location coordinates are required');
      }
      if (!photoFile) {
        throw new Error('Photo is required');
      }

      // Validate file type
      if (!photoFile.type.startsWith('image/')) {
        throw new Error('Please upload an image file');
      }

      // Validate file size (max 10MB)
      if (photoFile.size > 10 * 1024 * 1024) {
        throw new Error('Image size should be less than 10MB');
      }

      // Create FormData
      const formData = new FormData();
      formData.append('locationName', visitData.locationName);
      formData.append('latitude', visitData.latitude.toString());
      formData.append('longitude', visitData.longitude.toString());
      
      if (visitData.remarks) {
        formData.append('remarks', visitData.remarks);
      }
      
      formData.append('photos', photoFile);

      // Make API call
      const response = await fetchAPI('/visit/', {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type, let browser set it with boundary
        }
      });

      if (response.success && response.result) {
        setSuccess('Visit created successfully');
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
  }, [fetchAPI]);

  /**
   * Get all visits with filters
   * @param {Object} filters - Query filters
   * @param {number} filters.page - Page number
   * @param {number} filters.limit - Items per page
   * @param {string} filters.status - Filter by status
   * @param {string} filters.startDate - Start date
   * @param {string} filters.endDate - End date
   * @returns {Promise<Object>} API response
   */
  const getVisits = useCallback(async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await safeFetchAPI(`/visit?${queryParams}`);
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [safeFetchAPI]);

  /**
   * Get visit by ID
   * @param {string} visitId - Visit ID
   * @returns {Promise<Object>} API response
   */
  const getVisitById = useCallback(async (visitId) => {
    try {
      const response = await safeFetchAPI(`/visit/${visitId}`);
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [safeFetchAPI]);

  /**
   * Update visit
   * @param {string} visitId - Visit ID
   * @param {Object} updateData - Data to update
   * @param {File} [photoFile] - Optional new photo
   * @returns {Promise<Object>} API response
   */
  const updateVisit = useCallback(async (visitId, updateData, photoFile = null) => {
    try {
      setLoading(true);

      let body;
      const options = {
        method: 'PUT',
      };

      if (photoFile) {
        // If updating with photo, use FormData
        const formData = new FormData();
        Object.keys(updateData).forEach(key => {
          if (updateData[key] !== undefined && updateData[key] !== null) {
            formData.append(key, updateData[key].toString());
          }
        });
        formData.append('photos', photoFile);
        body = formData;
      } else {
        // If no photo, use JSON
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

  /**
   * Delete visit
   * @param {string} visitId - Visit ID
   * @returns {Promise<Object>} API response
   */
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

  /**
   * Verify visit
   * @param {string} visitId - Visit ID
   * @param {boolean} verified - Verification status
   * @param {string} notes - Verification notes
   * @returns {Promise<Object>} API response
   */
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

  /**
   * Get visit stats
   * @returns {Promise<Object>} API response
   */
  const getVisitStats = useCallback(async () => {
    const response = await safeFetchAPI("/visit/stats");
    return response;
  }, [safeFetchAPI]);

  /**
   * Get recent visits
   * @param {number} limit - Number of recent visits to fetch
   * @returns {Promise<Object>} API response
   */
  const getRecentVisits = useCallback(async (limit = 5) => {
    const response = await safeFetchAPI(`/visit/recent?limit=${limit}`);
    return response;
  }, [safeFetchAPI]);

  /**
   * Check-in to a visit
   * @param {string} visitId - Visit ID
   * @param {Object} checkInData - Check-in data with coordinates
   * @returns {Promise<Object>} API response
   */
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

  /**
   * Check-out from a visit
   * @param {string} visitId - Visit ID
   * @param {Object} checkOutData - Check-out data with coordinates
   * @returns {Promise<Object>} API response
   */
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