import { useAuth } from '../contexts/AuthContext';

// Base API URL
const API_BASE_URL = "http://localhost:9001/api/v1";

// Custom hook for visit API calls
export const useVisitApi = () => {
  const { fetchAPI, user } = useAuth();

  // Get user role for conditional logic
  const userRole = user?.role;

  // Create a new visit
  const createVisit = async (visitData, files = []) => {
    const formData = new FormData();
    
    // Append all visit data
    Object.keys(visitData).forEach(key => {
      if (key === 'contactPerson' || key === 'metadata') {
        formData.append(key, JSON.stringify(visitData[key]));
      } else if (visitData[key] !== undefined && visitData[key] !== null) {
        formData.append(key, visitData[key]);
      }
    });

    // Append files
    files.forEach(file => {
      formData.append('photos', file);
    });

    return fetchAPI('/visits', {
      method: 'POST',
      body: formData
    });
  };

  // Check-in to a visit
  const checkInVisit = async (visitId, locationData, files = []) => {
    const formData = new FormData();
    
    Object.keys(locationData).forEach(key => {
      if (locationData[key] !== undefined && locationData[key] !== null) {
        formData.append(key, locationData[key]);
      }
    });

    files.forEach(file => {
      formData.append('photos', file);
    });

    return fetchAPI(`/visits/${visitId}/checkin`, {
      method: 'POST',
      body: formData
    });
  };

  // Check-out from a visit
  const checkOutVisit = async (visitId, checkoutData, files = []) => {
    const formData = new FormData();
    
    Object.keys(checkoutData).forEach(key => {
      if (checkoutData[key] !== undefined && checkoutData[key] !== null) {
        formData.append(key, checkoutData[key]);
      }
    });

    files.forEach(file => {
      formData.append('photos', file);
    });

    return fetchAPI(`/visits/${visitId}/checkout`, {
      method: 'POST',
      body: formData
    });
  };

  // Get all visits with filters
  const getVisits = async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        queryParams.append(key, filters[key]);
      }
    });

    return fetchAPI(`/visits?${queryParams.toString()}`);
  };

  // Get visit by ID
  const getVisitById = async (visitId) => {
    return fetchAPI(`/visits/${visitId}`);
  };

  // Get recent visits for a user
  const getRecentVisits = async (userId, limit = 5) => {
    return fetchAPI(`/visits/user/${userId}/recent?limit=${limit}`);
  };

  // Get visits by date range
  const getVisitsByDateRange = async (userId, startDate, endDate) => {
    return fetchAPI(`/visits/user/${userId}/range?startDate=${startDate}&endDate=${endDate}`);
  };

  // Update visit
  const updateVisit = async (visitId, updateData, files = []) => {
    const formData = new FormData();
    
    Object.keys(updateData).forEach(key => {
      if (key === 'contactPerson' || key === 'metadata') {
        formData.append(key, JSON.stringify(updateData[key]));
      } else if (updateData[key] !== undefined && updateData[key] !== null) {
        formData.append(key, updateData[key]);
      }
    });

    files.forEach(file => {
      formData.append('photos', file);
    });

    return fetchAPI(`/visits/${visitId}`, {
      method: 'PUT',
      body: formData
    });
  };

  // Verify visit (ZSM, ASM, Head_office only)
  const verifyVisit = async (visitId, verified = true, notes = '') => {
    return fetchAPI(`/visits/${visitId}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ verified, notes })
    });
  };

  // Bulk verify visits (ZSM, ASM, Head_office only)
  const bulkVerifyVisits = async (visitIds, verified = true, notes = '') => {
    return fetchAPI('/visits/bulk/verify', {
      method: 'POST',
      body: JSON.stringify({ visitIds, verified, notes })
    });
  };

  // Delete visit (Head_office only)
  const deleteVisit = async (visitId) => {
    return fetchAPI(`/visits/${visitId}`, {
      method: 'DELETE'
    });
  };

  // Get visit statistics
  const getVisitStats = async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        queryParams.append(key, filters[key]);
      }
    });

    return fetchAPI(`/visits/stats?${queryParams.toString()}`);
  };

  // Export visits to CSV
  const exportVisits = async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        queryParams.append(key, filters[key]);
      }
    });

    return fetchAPI(`/visits/export?${queryParams.toString()}`);
  };

  // Check if user can verify visits
  const canVerify = () => {
    return ['Head_office', 'ZSM', 'ASM'].includes(userRole);
  };

  // Check if user can delete visits
  const canDelete = () => {
    return userRole === 'Head_office';
  };

  // Check if user can view all data
  const canViewAll = () => {
    return ['Head_office', 'ZSM'].includes(userRole);
  };

  // Check if user can manage team
  const canManageTeam = () => {
    return ['Head_office', 'ZSM', 'ASM'].includes(userRole);
  };

  return {
    createVisit,
    checkInVisit,
    checkOutVisit,
    getVisits,
    getVisitById,
    getRecentVisits,
    getVisitsByDateRange,
    updateVisit,
    verifyVisit,
    bulkVerifyVisits,
    deleteVisit,
    getVisitStats,
    exportVisits,
    canVerify,
    canDelete,
    canViewAll,
    canManageTeam,
    userRole
  };
};