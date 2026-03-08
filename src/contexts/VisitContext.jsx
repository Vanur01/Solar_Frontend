// contexts/VisitContext.js
import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext";

const VisitContext = createContext({});
const API_BASE_URL = "http://localhost:9001/api/v1";

export const useVisit = () => {
  const context = useContext(VisitContext);
  if (!context) throw new Error("useVisit must be used within a VisitProvider");
  return context;
};

export const VisitProvider = ({ children }) => {
  const { fetchAPI, safeFetchAPI, user } = useAuth();
  const [visitLoading, setVisitLoading] = useState(false);
  const [visitError, setVisitError] = useState(null);
  const [recentVisits, setRecentVisits] = useState([]);
  const [visitStats, setVisitStats] = useState({
    visitsToday: 0,
    totalVisits: 0,
    totalDistanceKm: 0,
    totalTravelTimeMinutes: 0,
    totalCompletedVisits: 0,
  });

  // Cache for API responses
  const statsCache = useRef({ data: null, timestamp: null });
  const visitsCache = useRef({ data: null, timestamp: null });
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // ========== VISIT METHODS ==========

  const createVisit = useCallback(async (visitData, photoFile) => {
    setVisitLoading(true);
    setVisitError(null);
    
    try {
      const formData = new FormData();
      
      // Append all visit data
      Object.keys(visitData).forEach(key => {
        if (visitData[key] !== undefined && visitData[key] !== null) {
          if (key === 'latitude' || key === 'longitude') {
            formData.append(key, parseFloat(visitData[key]).toFixed(6));
          } else {
            formData.append(key, visitData[key].toString());
          }
        }
      });
      
      // Append photo if exists
      if (photoFile) {
        formData.append("photos", photoFile);
      }

      const response = await fetchAPI("/visit/", {
        method: "POST",
        body: formData,
      });

      // Clear caches on new visit
      statsCache.current = { data: null, timestamp: null };
      visitsCache.current = { data: null, timestamp: null };

      return { success: true, data: response.result };
    } catch (err) {
      setVisitError(err.message);
      return { success: false, error: err.message };
    } finally {
      setVisitLoading(false);
    }
  }, [fetchAPI]);

  const getVisits = useCallback(async (filters = {}, skipCache = false) => {
    // Check cache first
    if (!skipCache && visitsCache.current.data && 
        Date.now() - visitsCache.current.timestamp < CACHE_DURATION) {
      return { success: true, result: visitsCache.current.data };
    }

    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await safeFetchAPI(`/visit?${queryParams}`);
      
      if (response.success) {
        visitsCache.current = {
          data: response.result,
          timestamp: Date.now()
        };
        setRecentVisits(response.result);
      }
      
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [safeFetchAPI]);

  const getVisitById = useCallback(async (visitId) => {
    return await safeFetchAPI(`/visit/${visitId}`);
  }, [safeFetchAPI]);

  const updateVisit = useCallback(async (visitId, updateData, photoFile = null) => {
    setVisitLoading(true);
    
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
      
      // Clear cache
      visitsCache.current = { data: null, timestamp: null };
      
      return { success: true, data: response.result };
    } catch (err) {
      setVisitError(err.message);
      return { success: false, error: err.message };
    } finally {
      setVisitLoading(false);
    }
  }, [fetchAPI]);

  const deleteVisit = useCallback(async (visitId) => {
    setVisitLoading(true);
    
    try {
      await fetchAPI(`/visit/${visitId}`, { method: "DELETE" });
      
      // Clear cache
      visitsCache.current = { data: null, timestamp: null };
      statsCache.current = { data: null, timestamp: null };
      
      return { success: true };
    } catch (err) {
      setVisitError(err.message);
      return { success: false, error: err.message };
    } finally {
      setVisitLoading(false);
    }
  }, [fetchAPI]);

  const completeVisit = useCallback(async (visitId) => {
    setVisitLoading(true);
    
    try {
      const response = await fetchAPI(`/visit/${visitId}/complete`, { method: "PATCH" });
      
      // Clear cache
      visitsCache.current = { data: null, timestamp: null };
      statsCache.current = { data: null, timestamp: null };
      
      return { success: true, data: response.result };
    } catch (err) {
      setVisitError(err.message);
      return { success: false, error: err.message };
    } finally {
      setVisitLoading(false);
    }
  }, [fetchAPI]);

  const verifyVisit = useCallback(async (visitId) => {
    setVisitLoading(true);
    
    try {
      const response = await fetchAPI(`/visit/${visitId}/verify`, { method: "PATCH" });
      
      // Clear cache
      visitsCache.current = { data: null, timestamp: null };
      
      return { success: true, data: response.result };
    } catch (err) {
      setVisitError(err.message);
      return { success: false, error: err.message };
    } finally {
      setVisitLoading(false);
    }
  }, [fetchAPI]);

  const cancelVisit = useCallback(async (visitId, reason) => {
    setVisitLoading(true);
    
    try {
      const response = await fetchAPI(`/visit/${visitId}/cancel`, {
        method: "PATCH",
        body: JSON.stringify({ reason }),
      });
      
      // Clear cache
      visitsCache.current = { data: null, timestamp: null };
      
      return { success: true, data: response.result };
    } catch (err) {
      setVisitError(err.message);
      return { success: false, error: err.message };
    } finally {
      setVisitLoading(false);
    }
  }, [fetchAPI]);

  // ========== STATS METHODS ==========

  const getVisitStats = useCallback(async (skipCache = false) => {
    // Check cache first
    if (!skipCache && statsCache.current.data && 
        Date.now() - statsCache.current.timestamp < CACHE_DURATION) {
      return { success: true, result: statsCache.current.data };
    }

    try {
      const response = await safeFetchAPI("/visit/stats/overview");
      
      if (response.success) {
        statsCache.current = {
          data: response.result,
          timestamp: Date.now()
        };
        setVisitStats(response.result);
      }
      
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [safeFetchAPI]);

  const getRecentVisits = useCallback(async (limit = 10, skipCache = false) => {
    if (!skipCache && visitsCache.current.data && 
        Date.now() - visitsCache.current.timestamp < CACHE_DURATION) {
      return { success: true, result: visitsCache.current.data };
    }

    try {
      const response = await safeFetchAPI(`/visit/activity/recent?limit=${limit}`);
      
      if (response.success) {
        visitsCache.current = {
          data: response.result,
          timestamp: Date.now()
        };
        setRecentVisits(response.result);
      }
      
      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [safeFetchAPI]);

  const getTeamPerformance = useCallback(async (params = {}) => {
    const {
      page = 1,
      limit = 10,
      sortBy = "distance",
      sortOrder = "desc",
      startDate,
      endDate,
      memberId
    } = params;

    let url = memberId 
      ? `/visit/performance/team-member/${memberId}`
      : `/visit/performance/team`;
    
    const queryParams = new URLSearchParams();
    queryParams.append('page', page);
    queryParams.append('limit', limit);
    queryParams.append('sortBy', sortBy);
    queryParams.append('sortOrder', sortOrder);
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    
    return await safeFetchAPI(`${url}?${queryParams.toString()}`);
  }, [safeFetchAPI]);

  const getMyPerformance = useCallback(async (startDate, endDate) => {
    return await safeFetchAPI(`/visit/performance/me?startDate=${startDate}&endDate=${endDate}`);
  }, [safeFetchAPI]);

  const getTeamMemberPerformance = useCallback(async (memberId) => {
    return await safeFetchAPI(`/visit/performance/team-member/${memberId}`);
  }, [safeFetchAPI]);

  // Clear cache manually (useful after updates)
  const clearVisitCache = useCallback(() => {
    statsCache.current = { data: null, timestamp: null };
    visitsCache.current = { data: null, timestamp: null };
  }, []);

  const value = {
    // State
    visitLoading,
    visitError,
    recentVisits,
    visitStats,
    
    // CRUD Operations
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
    clearVisitCache,
  };

  return (
    <VisitContext.Provider value={value}>
      {children}
    </VisitContext.Provider>
  );
};

export default VisitProvider;