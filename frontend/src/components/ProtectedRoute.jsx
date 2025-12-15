import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Login from '../pages/Login';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const authStatus = localStorage.getItem('isAuthenticated');
      const user = localStorage.getItem('user');
      
      if (authStatus === 'true' && user) {
        try {
          const userData = JSON.parse(user);
          
          // Check if user is admin trying to access regular user routes
          if (userData.role === 'admin') {
            // Redirect admins to admin dashboard instead of showing login
            navigate('/admin/dashboard', { replace: true });
            return;
          }
          
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error parsing user data:', error);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
        // Redirect to login with return path
        navigate('/login', { 
          state: { from: location },
          replace: true 
        });
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [navigate, location]);

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
    return <Login />;
  }

  return children;
};

export default ProtectedRoute;
