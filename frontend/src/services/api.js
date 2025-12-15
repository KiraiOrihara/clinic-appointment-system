// API Service for ClinicFinder Backend
// Replace these with your actual API endpoints

// Allow overriding the backend URL via Vite env, fallback to local node backend (3001)
// Normalize so devs can pass either http://host:port or http://host:port/api
const rawBase = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3001';
const sanitizedBase = rawBase.replace(/\/+$/, '').replace(/\/api$/, ''); // drop trailing slash and lone /api
const ROOT_API_URL = sanitizedBase;
const API_BASE_URL = `${ROOT_API_URL}/api`;
const CLINIC_MANAGER_BASE_URL = ROOT_API_URL;

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const skipAuthRedirect = options.skipAuthRedirect || false;
  const baseUrl = options.baseUrl || API_BASE_URL;
  try {
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };
    
    // Include credentials for session cookies
    const response = await fetch(`${baseUrl}${endpoint}`, {
      headers: defaultHeaders,
      credentials: 'include', // Include cookies for session-based auth
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Handle 401 unauthorized specifically - redirect to login
      if (response.status === 401 && !skipAuthRedirect) {
        // Clear any local storage data
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        
        // If not already on login page, redirect
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      
      const errorMessage = errorData.error || errorData.message || `HTTP error! status: ${response.status}`;
      const error = new Error(errorMessage);
      error.response = { data: errorData, status: response.status };
      throw error;
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// User Management APIs
export const userService = {
  // Get all users (admin only)
  getAllUsers: () => apiCall('/admin/users'),
  
  // Login user (session-based)
  login: async (credentials, options = {}) => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      skipAuthRedirect: options.skipAuthRedirect ?? true, // avoid redirect on bad creds
    });
  },

  // Admin/Clinic Manager login (session-based)
  adminLogin: async (credentials, options = {}) => {
    return apiCall('/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      skipAuthRedirect: options.skipAuthRedirect ?? true, // avoid redirect on bad creds
    });
  },

  // Register user (session-based)
  register: async (userData) => {
    return apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Logout user (session-based)
  logout: async () => {
    return apiCall('/auth/logout', {
      method: 'POST',
    });
  },

  // Get current user (session-based)
  getCurrentUser: async () => {
    return apiCall('/auth/me', { skipAuthRedirect: true });
  },

  // Get current admin (session-based)
  getCurrentAdmin: async () => {
    return apiCall('/auth/admin-me', { skipAuthRedirect: true });
  },

  // Admin logout (session-based)
  adminLogout: async () => {
    return apiCall('/auth/admin-logout', {
      method: 'POST',
    });
  },

  // Multi-Clinic Management Methods
  getManagedClinics: () => apiCall('/clinic-manager/managed-clinics'),
  selectClinic: (clinicId) => apiCall('/clinic-manager/select-clinic', {
    method: 'POST',
    body: JSON.stringify({ clinic_id: clinicId }),
  }),
};

// Clinic Management APIs
export const clinicService = {
  // Get all clinics
  getAllClinics: async () => {
    try {
      // Get real data from API which includes doctors and services
      const realData = await apiCall('/clinics', { skipAuthRedirect: true });
      return realData;
    } catch (error) {
      console.error('Error fetching clinics:', error);
      return [];
    }
  },

  // Public clinic services (no auth, used by patient booking)
  getClinicServices: async (clinicId) => {
    return apiCall(`/clinics/${clinicId}/services`, { baseUrl: API_BASE_URL, skipAuthRedirect: true });
  },
  
  // Get clinic by ID
  getClinicById: (clinicId) => apiCall(`/clinics/${clinicId}`, { skipAuthRedirect: true }),
  
  // Get clinic map data (for map markers)
  getMapData: () => apiCall('/clinics/map-data', { skipAuthRedirect: true }),
  
  // Search clinics
  searchClinics: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/clinics/search?${queryString}`, { skipAuthRedirect: true });
  },
  
  // Add new clinic
  addClinic: (clinicData) => apiCall('/admin/clinics', {
    method: 'POST',
    body: JSON.stringify(clinicData),
  }),
  
  // Update clinic
  updateClinic: (clinicId, clinicData) => apiCall(`/admin/clinics/${clinicId}`, {
    method: 'PUT',
    body: JSON.stringify(clinicData),
  }),
};

// Appointment Management APIs
export const appointmentService = {
  // Get all appointments (admin)
  getAllAppointments: () => apiCall('/admin/appointments'),
  
  // Get user appointments
  getUserAppointments: () => apiCall('/appointments'),
  
  // Book appointment (requires authenticated patient session)
  bookAppointment: (appointmentData) => apiCall('/appointments', {
    method: 'POST',
    body: JSON.stringify(appointmentData),
  }),
  
  // Update appointment
  updateAppointment: (appointmentId, appointmentData) => apiCall(`/appointments/${appointmentId}`, {
    method: 'PUT',
    body: JSON.stringify(appointmentData),
  }),
  
  // Cancel appointment
  cancelAppointment: (appointmentId) => apiCall(`/appointments/${appointmentId}/cancel`, {
    method: 'PATCH',
  }),
  
  // Reschedule appointment
  rescheduleAppointment: (appointmentId, date, time) => apiCall(`/appointments/${appointmentId}/reschedule`, {
    method: 'PATCH',
    body: JSON.stringify({ date, time }),
  }),
};

// Admin Dashboard APIs
export const adminService = {
  // Get dashboard stats
  getDashboardStats: () => apiCall('/admin/dashboard/stats'),
  
  // Get system analytics
  getAnalytics: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/admin/analytics?${queryString}`);
  },
  
  // Get system alerts
  getSystemAlerts: () => apiCall('/admin/alerts'),
  
  // Delete user
  deleteUser: (userId) => apiCall(`/admin/users/${userId}`, {
    method: 'DELETE',
  }),
  
  // Delete appointment
  deleteAppointment: (appointmentId) => apiCall(`/admin/appointments/${appointmentId}`, {
    method: 'DELETE',
  }),
  
  // Export data
  exportData: (type, params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/admin/export/${type}?${queryString}`);
  },
  
  // Clinic Managers management
  getClinicManagers: () => apiCall('/admin/clinic-managers'),
  createClinicManager: (managerData) => apiCall('/admin/clinic-managers', {
    method: 'POST',
    body: JSON.stringify(managerData),
  }),
  updateClinicManager: (managerId, managerData) => apiCall(`/admin/clinic-managers/${managerId}`, {
    method: 'PUT',
    body: JSON.stringify(managerData),
  }),
  deactivateClinicManager: (managerId) => apiCall(`/admin/clinic-managers/${managerId}/deactivate`, {
    method: 'PATCH',
  }),
};

// Clinic Manager APIs
export const clinicManagerService = {
  // Get dashboard overview
  getDashboard: (clinicId = null) => {
    const url = clinicId 
      ? `/clinic-manager/dashboard?clinic_id=${clinicId}`
      : '/clinic-manager/dashboard';
    return apiCall(url, { baseUrl: CLINIC_MANAGER_BASE_URL, skipAuthRedirect: true });
  },
  
  // Clinic management
  getClinic: () => apiCall('/clinic-manager/clinic', { baseUrl: CLINIC_MANAGER_BASE_URL }),
  updateClinic: (clinicData) => apiCall('/clinic-manager/clinic', {
    method: 'PUT',
    body: JSON.stringify(clinicData),
    baseUrl: CLINIC_MANAGER_BASE_URL,
  }),
  toggleClinicStatus: (clinicId) => apiCall('/clinic-manager/clinic/toggle-status', {
    method: 'POST',
    body: JSON.stringify({ clinic_id: clinicId }),
    baseUrl: CLINIC_MANAGER_BASE_URL,
  }),
  updateSettings: (settings) => apiCall('/clinic-manager/clinic/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
    baseUrl: CLINIC_MANAGER_BASE_URL,
  }),
  
  // Appointments
  getAppointments: (params) => {
    const queryString = new URLSearchParams(params || {}).toString();
    return apiCall(`/clinic-manager/appointments?${queryString}`, { baseUrl: CLINIC_MANAGER_BASE_URL });
  },
  getPendingAppointments: () => apiCall('/clinic-manager/appointments/pending', { baseUrl: CLINIC_MANAGER_BASE_URL }),
  approveAppointment: (appointmentId) => apiCall(`/clinic-manager/appointments/${appointmentId}/approve`, {
    method: 'POST',
    baseUrl: CLINIC_MANAGER_BASE_URL,
  }),
  rejectAppointment: (appointmentId, rejectionReason) => apiCall(`/clinic-manager/appointments/${appointmentId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ rejection_reason: rejectionReason }),
    baseUrl: CLINIC_MANAGER_BASE_URL,
  }),
  checkInAppointment: (appointmentId) => apiCall(`/clinic-manager/appointments/${appointmentId}/check-in`, {
    method: 'POST',
    baseUrl: CLINIC_MANAGER_BASE_URL,
  }),
  completeAppointment: (appointmentId) => apiCall(`/clinic-manager/appointments/${appointmentId}/complete`, {
    method: 'POST',
    baseUrl: CLINIC_MANAGER_BASE_URL,
  }),
  
  // Service types
  getServiceTypes: () => apiCall('/clinic-manager/services'),
  createServiceType: (serviceData) => apiCall('/clinic-manager/services', {
    method: 'POST',
    body: JSON.stringify(serviceData),
  }),
  updateServiceType: (serviceId, serviceData) => apiCall(`/clinic-manager/services/${serviceId}`, {
    method: 'PUT',
    body: JSON.stringify(serviceData),
  }),
  deleteServiceType: (serviceId) => apiCall(`/clinic-manager/services/${serviceId}`, {
    method: 'DELETE',
  }),
  
  // Doctor schedules
  getDoctorSchedules: () => apiCall('/clinic-manager/schedules'),
  saveDoctorSchedule: (scheduleData) => apiCall('/clinic-manager/schedules', {
    method: 'POST',
    body: JSON.stringify(scheduleData),
  }),
  
  // Analytics
  getAnalytics: (params) => {
    const queryString = new URLSearchParams(params || {}).toString();
    return apiCall(`/clinic-manager/analytics?${queryString}`);
  },

  // Multi-Clinic Management
  getManagedClinics: () => apiCall('/clinic-manager/managed-clinics', { baseUrl: CLINIC_MANAGER_BASE_URL }),
  selectClinic: (clinicId) => apiCall('/clinic-manager/select-clinic', {
    method: 'POST',
    body: JSON.stringify({ clinic_id: clinicId }),
    baseUrl: CLINIC_MANAGER_BASE_URL,
  }),

  // Clinic-Specific Doctor Management
  getClinicDoctors: (clinicId = null) => {
    const url = clinicId 
      ? `/clinic-manager/clinic/doctors?clinic_id=${clinicId}`
      : '/clinic-manager/clinic/doctors';
    return apiCall(url, { baseUrl: CLINIC_MANAGER_BASE_URL });
  },
  addDoctor: (doctorData) => apiCall('/clinic-manager/clinic/doctors', {
    method: 'POST',
    body: JSON.stringify(doctorData),
    baseUrl: CLINIC_MANAGER_BASE_URL,
  }),
  updateDoctor: (doctorId, doctorData) => apiCall(`/clinic-manager/clinic/doctors/${doctorId}`, {
    method: 'PUT',
    body: JSON.stringify(doctorData),
    baseUrl: CLINIC_MANAGER_BASE_URL,
  }),
  removeDoctor: (doctorId) => apiCall(`/clinic-manager/clinic/doctors/${doctorId}`, {
    method: 'DELETE',
    baseUrl: CLINIC_MANAGER_BASE_URL,
  }),

  updateDoctorStatus: (doctorId, status) => apiCall(`/clinic-manager/clinic/doctors/${doctorId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
    baseUrl: CLINIC_MANAGER_BASE_URL,
  }),

  // Clinic-Specific Service Management
  getClinicServices: (clinicId = null) => {
    const url = clinicId 
      ? `/clinic-manager/clinic/services?clinic_id=${clinicId}`
      : '/clinic-manager/clinic/services';
    return apiCall(url, { baseUrl: CLINIC_MANAGER_BASE_URL });
  },
  addService: (serviceData) => apiCall('/clinic-manager/clinic/services', {
    method: 'POST',
    body: JSON.stringify(serviceData),
    baseUrl: CLINIC_MANAGER_BASE_URL,
  }),
  updateService: (serviceId, serviceData) => apiCall(`/clinic-manager/clinic/services/${serviceId}`, {
    method: 'PUT',
    body: JSON.stringify(serviceData),
    baseUrl: CLINIC_MANAGER_BASE_URL,
  }),
  removeService: (serviceId, clinicId) => apiCall(`/clinic-manager/clinic/services/${serviceId}?clinic_id=${clinicId}`, {
    method: 'DELETE',
    baseUrl: CLINIC_MANAGER_BASE_URL,
  }),

  // Clinic-Specific Appointment Management
  getClinicAppointments: (params) => {
    const queryString = new URLSearchParams(params || {}).toString();
    return apiCall(`/clinic-manager/clinic/appointments?${queryString}`, { baseUrl: CLINIC_MANAGER_BASE_URL });
  },
};

export default {
  api: apiCall,
  userService,
  clinicService,
  appointmentService,
  adminService,
  clinicManagerService,
};
