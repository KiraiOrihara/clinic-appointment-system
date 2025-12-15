// Admin Authentication Helper (Session-Based)
const getNormalizedRole = () => {
  try {
    const stored = localStorage.getItem('user');
    if (!stored) return '';
    const user = JSON.parse(stored);
    const rawRole = user?.role || '';
    const lowered = rawRole.trim().toLowerCase();
    return lowered === 'manager' ? 'clinic_manager' : lowered;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return '';
  }
};

export const adminAuth = {
  // Check if user is authenticated as admin/manager
  isAuthenticated: () => {
    return localStorage.getItem('isAuthenticated') === 'true';
  },

  // Get current user info
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },

  // Check if current user has admin role
  isAdmin: () => {
    return getNormalizedRole() === 'admin';
  },

  // Set authentication data (session-based)
  setAuth: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('isAuthenticated', 'true');
  },

  // Clear all authentication data
  clearAuth: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('token'); // Clean up old token data
    localStorage.removeItem('adminToken'); // Clean up old token data
    localStorage.removeItem('userToken'); // Clean up old token data
  },

  // Redirect to login if not authenticated
  requireAuth: () => {
    if (!adminAuth.isAuthenticated()) {
      window.location.href = '/login';
      return false;
    }
    return true;
  },

  // Redirect to admin login if not admin
  requireAdmin: () => {
    if (!adminAuth.isAuthenticated()) {
      window.location.href = '/admin';
      return false;
    }
    
    const role = getNormalizedRole();
    if (role === 'clinic_manager') {
      window.location.href = '/clinic-manager/dashboard';
      return false;
    }

    if (role !== 'admin') {
      // If user is logged in but not admin, redirect to patient login
      window.location.href = '/login';
      return false;
    }
    
    return true;
  }
};

export default adminAuth;
