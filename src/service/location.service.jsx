// hooks/useLocation.js
import { useState, useCallback, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

export const useLocation = (options = {}) => {
  const {
    autoRequest = false,
    highAccuracy = true,
    timeout = 15000,
    maximumAge = 0,
  } = options;

  const { requestLocationWithPermission, getCurrentLocation, locationState } = useAuth();
  
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permissionState, setPermissionState] = useState('prompt');
  const [attempts, setAttempts] = useState(0);
  
  const timeoutRef = useRef(null);
  const mountedRef = useRef(true);

  // Cleanup
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Auto-request location if enabled
  useEffect(() => {
    if (autoRequest) {
      getLocation();
    }
  }, [autoRequest]);

  const getLocation = useCallback(async (retryCount = 0) => {
    if (!mountedRef.current) return;

    setLoading(true);
    setError(null);
    
    try {
      // First request permission if needed
      if (permissionState === 'prompt') {
        const permResult = await requestLocationWithPermission();
        
        if (!mountedRef.current) return;
        
        if (!permResult.success) {
          setPermissionState('denied');
          setError(permResult.error);
          setLoading(false);
          return { success: false, error: permResult.error };
        }
        
        setPermissionState('granted');
      }

      // Get current location
      const locationResult = await getCurrentLocation({
        enableHighAccuracy: highAccuracy,
        timeout,
        maximumAge,
      });

      if (!mountedRef.current) return;

      if (locationResult.success) {
        setLocation(locationResult);
        setError(null);
        setAttempts(0);
        return { success: true, data: locationResult };
      } else {
        // Handle specific error codes
        if (locationResult.code === 3 && retryCount < 2) {
          // Timeout - retry with lower accuracy
          timeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
              setAttempts(prev => prev + 1);
              getLocation(retryCount + 1);
            }
          }, 1000);
        } else {
          setError(locationResult.error);
          return { success: false, error: locationResult.error };
        }
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message);
        return { success: false, error: err.message };
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [requestLocationWithPermission, getCurrentLocation, highAccuracy, timeout, maximumAge, permissionState]);

  const getLocationWithRetry = useCallback(async (maxRetries = 3) => {
    let lastError = null;
    
    for (let i = 0; i < maxRetries; i++) {
      const result = await getLocation(i);
      if (result?.success) {
        return result;
      }
      lastError = result?.error;
      
      // Wait before retry (exponential backoff)
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
    
    return { success: false, error: lastError || 'Failed to get location after multiple attempts' };
  }, [getLocation]);

  const resetLocation = useCallback(() => {
    setLocation(null);
    setError(null);
    setAttempts(0);
    setPermissionState('prompt');
  }, []);

  return {
    location,
    loading,
    error,
    attempts,
    permissionState,
    getLocation,
    getLocationWithRetry,
    resetLocation,
    accuracy: location?.accuracy || null,
    coordinates: location ? { lat: location.lat, lng: location.lng } : null,
  };
};