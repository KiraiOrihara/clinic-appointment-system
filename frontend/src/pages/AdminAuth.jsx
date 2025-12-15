import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, AlertCircle, CheckCircle, Building } from 'lucide-react';
import { userService } from '@/services/api';

const AdminAuth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  // Check if admin is already authenticated
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem('isAuthenticated');
      const user = localStorage.getItem('user');
      
      if (authStatus === 'true' && user) {
        try {
          const userData = JSON.parse(user);
          
          const role = userData.role === 'manager' ? 'clinic_manager' : userData.role;

          // If user is admin, redirect to admin dashboard
          if (role === 'admin') {
            navigate('/admin/dashboard', { replace: true });
          } else if (role === 'clinic_manager') {
            // If user is clinic manager, redirect to clinic manager dashboard
            navigate('/clinic-manager/dashboard', { replace: true });
          } else {
            // If regular user tries to access admin login, redirect to home
            navigate('/', { replace: true });
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    };

    checkAuth();
  }, [navigate]);

  // If authenticated admin, don't render login form (will redirect)
  const authStatus = localStorage.getItem('isAuthenticated');
  const user = localStorage.getItem('user');
  
  if (authStatus === 'true' && user) {
      try {
        const userData = JSON.parse(user);
        const role = userData.role === 'manager' ? 'clinic_manager' : userData.role;
        if (role === 'admin') {
          return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
                <p className="text-muted-foreground">Redirecting to admin dashboard...</p>
              </div>
            </div>
          );
        } else if (role === 'clinic_manager') {
          return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
                <p className="text-muted-foreground">Redirecting to clinic manager dashboard...</p>
              </div>
            </div>
          );
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
  }

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Admin email is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Admin password is required';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    setSuccess('');
    
    try {
      // Use admin API authentication
      const response = await userService.adminLogin(
        {
          email: formData.email,
          password: formData.password
        },
        { skipAuthRedirect: true }
      );
      
      // Normalize role (trim, lower case, convert legacy "manager" to "clinic_manager")
      const rawRole = (response.user.role || '').trim().toLowerCase();
      const normalizedRole = rawRole === 'manager' ? 'clinic_manager' : rawRole;

      // Check if user has admin or clinic_manager role
      if (normalizedRole !== 'admin' && normalizedRole !== 'clinic_manager') {
        setErrors({ general: 'Access denied. Admin or Clinic Manager privileges required.' });
        return;
      }
      
      // Store authentication data (normalize role before storing)
      const normalizedUser = { ...response.user, role: normalizedRole };
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      localStorage.setItem('isAuthenticated', 'true');
      
      setSuccess('Authentication successful! Redirecting...');
      
      // Redirect based on role (hard replace to avoid history back to admin)
      if (normalizedRole === 'admin') {
        window.location.replace('/admin/dashboard');
      } else if (normalizedRole === 'clinic_manager') {
        window.location.replace('/clinic-manager/dashboard');
      }
      
    } catch (error) {
      console.error('Admin authentication error:', error);
      setErrors({
        general: error.message || 'Authentication failed. Please check your credentials.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="rounded-full bg-destructive p-3">
              <Building className="h-8 w-8 text-destructive-foreground" />
            </div>
            <span className="text-3xl font-bold text-destructive">Admin Portal</span>
          </div>
          <p className="text-muted-foreground">
            ClinicFinder Administration System
          </p>
        </div>

        {/* Admin Auth Card */}
        <Card className="shadow-xl border-destructive/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Admin & Clinic Manager Access</CardTitle>
            <CardDescription>
              Enter your administrator or clinic manager credentials to access the management system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success && (
              <div className="bg-success/10 border border-success/20 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-sm text-success">{success}</span>
                </div>
              </div>
            )}

            {errors.general && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="text-sm text-destructive">{errors.general}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Admin Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="arizarhenzon@gmail.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-password">Admin Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="Enter admin password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={errors.password ? 'border-destructive' : ''}
                />
                {errors.password && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.password}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent"></div>
                    'Authenticating...'
                  </div>
                ) : (
                  'Access Admin Portal'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button
                type="button"
                variant="link"
                className="text-sm p-0 h-auto"
                onClick={() => navigate('/')}
              >
                ← Back to Patient Portal
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Lock className="h-4 w-4" />
            <span>Secure Admin Access</span>
          </div>
          <p>This portal is for authorized clinic administrators only</p>
        </div>
      </div>
    </div>
  );
};

export default AdminAuth;
