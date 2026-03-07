// services/attendanceService.js
import { authFetch, handleResponse, createFormData } from '../utils/apiUtils';

const API_BASE_URL = 'https://backend.sunergytechsolar.com/api/v1';

class AttendanceService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // ==================== PUNCH IN ====================
  async punchIn(data) {
    try {
      // data should already be FormData from the component
      const response = await authFetch(`${this.baseURL}/attendance/punch-in`, {
        method: 'POST',
        body: data
        // No Content-Type header - browser sets it with boundary
      });

      return await handleResponse(response);
    } catch (error) {
      throw this.handleError(error, 'Failed to punch in');
    }
  }

  // ==================== PUNCH OUT ====================
  async punchOut(data) {
    try {
      // data should already be FormData from the component
      const response = await authFetch(`${this.baseURL}/attendance/punch-out`, {
        method: 'POST',
        body: data
        // No Content-Type header - browser sets it with boundary
      });

      return await handleResponse(response);
    } catch (error) {
      throw this.handleError(error, 'Failed to punch out');
    }
  }

  // ==================== GET ALL ATTENDANCE ====================
  async getAllAttendance(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });

      const url = `${this.baseURL}/attendance${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await authFetch(url);
      
      return await handleResponse(response);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch attendance records');
    }
  }

  // ==================== GET ATTENDANCE BY ID ====================
  async getAttendanceById(id) {
    try {
      if (!id) throw new Error('Attendance ID is required');
      
      const response = await authFetch(`${this.baseURL}/attendance/${id}`);
      return await handleResponse(response);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch attendance record');
    }
  }

  // ==================== UPDATE ATTENDANCE ====================
  async updateAttendance(id, data) {
    try {
      if (!id) throw new Error('Attendance ID is required');

      const response = await authFetch(`${this.baseURL}/attendance/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      return await handleResponse(response);
    } catch (error) {
      throw this.handleError(error, 'Failed to update attendance');
    }
  }

  // ==================== DELETE ATTENDANCE ====================
  async deleteAttendance(id) {
    try {
      if (!id) throw new Error('Attendance ID is required');

      const response = await authFetch(`${this.baseURL}/attendance/${id}`, {
        method: 'DELETE'
      });

      return await handleResponse(response);
    } catch (error) {
      throw this.handleError(error, 'Failed to delete attendance');
    }
  }

  // ==================== GET TODAY'S ATTENDANCE ====================
  async getTodayAttendance() {
    try {
      const response = await authFetch(`${this.baseURL}/attendance/today`);
      return await handleResponse(response);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch today\'s attendance');
    }
  }

  // ==================== GET ATTENDANCE STATS ====================
  async getAttendanceStats(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });

      const url = `${this.baseURL}/attendance/stats${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await authFetch(url);
      
      return await handleResponse(response);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch attendance stats');
    }
  }

  // ==================== GET MY ATTENDANCE HISTORY ====================
  async getMyAttendanceHistory(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });

      const url = `${this.baseURL}/attendance/my-history${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await authFetch(url);
      
      return await handleResponse(response);
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch attendance history');
    }
  }

  // ==================== ERROR HANDLER ====================
  handleError(error, defaultMessage) {
    console.error('Attendance Service Error:', error);
    
    if (error.message) {
      return error;
    }
    
    return new Error(defaultMessage);
  }
}

const attendanceService = new AttendanceService();
export default attendanceService;