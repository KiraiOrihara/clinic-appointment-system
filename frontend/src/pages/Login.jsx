import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Eye, EyeOff, User, Stethoscope, Building, MapPin, Shield } from 'lucide-react';
import { userService } from '@/services/api';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  // Get redirect path - prioritize booking redirect, otherwise go to find-clinics
  const from = location.state?.from?.pathname || '/find-clinics';

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem('isAuthenticated');
      const user = localStorage.getItem('user');
      
      if (authStatus === 'true' && user) {
        try {
          const userData = JSON.parse(user);
          
          // Redirect based on user role
          if (userData.role === 'admin') {
            navigate('/admin/dashboard', { replace: true });
          } else {
            navigate(from, { replace: true });
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    };

    checkAuth();
  }, [navigate, from]);

  // If authenticated, don't render login form (will redirect)
  const authStatus = localStorage.getItem('isAuthenticated');
  const user = localStorage.getItem('user');
  
  if (authStatus === 'true' && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (activeTab === 'signin') {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      }
    } else {
      if (!formData.firstName) {
        newErrors.firstName = 'First name is required';
      }
      if (!formData.lastName) {
        newErrors.lastName = 'Last name is required';
      }
      if (!formData.phone) {
        newErrors.phone = 'Phone number is required';
      }
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
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
      let response;
      
      if (activeTab === 'signin') {
        // Login with real API validation
        response = await userService.login({
          email: formData.email,
          password: formData.password
        });
      } else {
        // Register with real API
        response = await userService.register({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          dateOfBirth: null // Send null instead of empty string
        });
      }
      
      // Normalize role to align with protected routes (backend may return "manager")
      const normalizedRole = response.user.role === 'manager' ? 'clinic_manager' : response.user.role;
      const normalizedUser = { ...response.user, role: normalizedRole };

      // Store user session data (no tokens needed)
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      localStorage.setItem('isAuthenticated', 'true');
      
      // Dispatch custom event to notify Layout component of login
      window.dispatchEvent(new Event('userLogin'));
      
      setSuccess(activeTab === 'signin' ? 'Login successful!' : 'Account created successfully!');
      
      // Role-based redirection after successful login/registration
      setTimeout(() => {
        // Role-based redirect
        if (normalizedRole === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else if (normalizedRole === 'clinic_manager') {
          navigate('/clinic-manager/dashboard', { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      }, 1000);
      
    } catch (error) {
      console.error('Authentication error:', error);
      setErrors({
        general: error.message || 'Authentication failed. Please try again.'
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="rounded-full bg-blue-600 p-3">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <span className="text-3xl font-bold text-blue-600">ClinicFinder</span>
          </div>
          <p className="text-gray-600">
            Your trusted healthcare booking platform
          </p>
        </div>

        {/* Auth Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center bg-white">
            <CardTitle className="text-2xl text-gray-900">Welcome Back</CardTitle>
            <CardDescription className="text-gray-600">
              Sign in to your account or create a new one to book appointments
            </CardDescription>
          </CardHeader>
          <CardContent className="bg-white">
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">{success}</span>
                </div>
              </div>
            )}

            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-600">{errors.general}</span>
                </div>
              </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="space-y-4">
                <TabsContent value="signin" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-gray-700">Email Address</Label>
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`border-gray-300 focus:border-blue-500 ${errors.email ? 'border-red-500' : ''}`}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-gray-700">Password</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={`border-gray-300 focus:border-blue-500 ${errors.password ? 'border-red-500' : ''} pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="remember" name="remember" className="rounded border-gray-300" />
                      <Label htmlFor="remember" className="text-sm text-gray-700">Remember me</Label>
                    </div>
                    <Button type="button" variant="link" className="text-sm p-0 h-auto text-blue-600">
                      Forgot password?
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4 mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-firstName" className="text-gray-700">First Name</Label>
                      <Input
                        id="signup-firstName"
                        name="firstName"
                        type="text"
                        placeholder="Juan"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className={`border-gray-300 focus:border-blue-500 ${errors.firstName ? 'border-red-500' : ''}`}
                      />
                      {errors.firstName && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.firstName}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-lastName" className="text-gray-700">Last Name</Label>
                      <Input
                        id="signup-lastName"
                        name="lastName"
                        type="text"
                        placeholder="Dela Cruz"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className={`border-gray-300 focus:border-blue-500 ${errors.lastName ? 'border-red-500' : ''}`}
                      />
                      {errors.lastName && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-gray-700">Email Address</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`border-gray-300 focus:border-blue-500 ${errors.email ? 'border-red-500' : ''}`}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-phone" className="text-gray-700">Phone Number</Label>
                    <Input
                      id="signup-phone"
                      name="phone"
                      type="tel"
                      placeholder="+63 912 345 6789"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`border-gray-300 focus:border-blue-500 ${errors.phone ? 'border-red-500' : ''}`}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-gray-700">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={`border-gray-300 focus:border-blue-500 ${errors.password ? 'border-red-500' : ''} pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm" className="text-gray-700">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-confirm"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className={`border-gray-300 focus:border-blue-500 ${errors.confirmPassword ? 'border-red-500' : ''} pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="terms" name="terms" className="rounded border-gray-300" required />
                    <Label htmlFor="terms" className="text-sm text-gray-700">
                      I agree to the Terms of Service and Privacy Policy
                    </Label>
                  </div>
                </TabsContent>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      {activeTab === 'signin' ? 'Signing in...' : 'Creating account...'}
                    </div>
                  ) : (
                    activeTab === 'signin' ? 'Sign In' : 'Create Account'
                  )}
                </Button>
              </form>
            </Tabs>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {activeTab === 'signin' ? "Don't have an account? " : "Already have an account? "}
                <Button
                  type="button"
                  variant="link"
                  className="text-sm p-0 h-auto text-blue-600"
                  onClick={() => setActiveTab(activeTab === 'signin' ? 'signup' : 'signin')}
                >
                  {activeTab === 'signin' ? 'Sign up' : 'Sign in'}
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Secure authentication powered by industry-standard encryption</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
