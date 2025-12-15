import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { userService } from '@/services/api';

const ClinicManagerProtectedRoute = ({ children }) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const checkSession = async () => {
      try {
        const admin = await userService.getCurrentAdmin(); // uses admin-login session
        const role = (admin?.role || '').trim().toLowerCase() === 'manager'
          ? 'clinic_manager'
          : (admin?.role || '').trim().toLowerCase();
        if (!isMounted) return;

        if (role === 'clinic_manager') {
          setIsAuthenticated(true);
        } else if (role === 'admin') {
          // admin should not be here
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        if (!isMounted) return;
        setIsAuthenticated(false);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    checkSession();
    return () => { isMounted = false; };
  }, [location]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }

  return children;
};

export default ClinicManagerProtectedRoute;

