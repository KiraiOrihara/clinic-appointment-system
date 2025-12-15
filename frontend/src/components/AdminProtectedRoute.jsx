import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { userService } from '@/services/api';

const normalizeRole = (role) => {
  const lowered = (role || '').trim().toLowerCase();
  return lowered === 'manager' ? 'clinic_manager' : lowered;
};

const AdminProtectedRoute = ({ children }) => {
  const [state, setState] = useState({ loading: true, allowed: false, redirect: null });

  useEffect(() => {
    let isMounted = true;
    const checkSession = async () => {
      try {
        const admin = await userService.getCurrentAdmin(); // relies on admin session cookie
        const role = normalizeRole(admin?.role);
        if (!isMounted) return;

        if (role === 'admin') {
          setState({ loading: false, allowed: true, redirect: null });
        } else if (role === 'clinic_manager') {
          setState({ loading: false, allowed: false, redirect: '/clinic-manager/dashboard' });
        } else {
          setState({ loading: false, allowed: false, redirect: '/admin' });
        }
      } catch (err) {
        if (!isMounted) return;
        // No admin session -> send to admin login
        setState({ loading: false, allowed: false, redirect: '/admin' });
      }
    };
    checkSession();
    return () => { isMounted = false; };
  }, []);

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (state.redirect) {
    return <Navigate to={state.redirect} replace />;
  }

  if (!state.allowed) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
