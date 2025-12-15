import { Link, useNavigate } from 'react-router-dom';
import { Shield, Menu, X, User, LogOut, Settings, Calendar, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { userService } from '../services/api';
import LogoutConfirmationModal from './LogoutConfirmationModal';

const Layout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [logoutModal, setLogoutModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated via session (not admin session)
    const checkUserSession = async () => {
      try {
        const response = await userService.getCurrentUser();
        if (response && response.role === 'user') {
          setUser(response);
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('user', JSON.stringify(response));
        } else {
          setUser(null);
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('user');
        }
      } catch (error) {
        // No user session found
        setUser(null);
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('user');
      }
    };

    checkUserSession();

    // Listen for storage changes to update user state in real-time
    const handleStorageChange = () => {
      const authStatus = localStorage.getItem('isAuthenticated');
      const userData = localStorage.getItem('user');
      
      if (authStatus === 'true' && userData) {
        try {
          const user = JSON.parse(userData);
          if (user.role === 'user') {
            setUser(user);
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLogin', handleStorageChange); // Custom event for login
    window.addEventListener('userLogout', handleStorageChange); // Custom event for logout
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleStorageChange);
      window.removeEventListener('userLogout', handleStorageChange);
    };
  }, []);

  const handleLogout = async () => {
    setLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      // Call backend logout endpoint
      await userService.logout();
      // Clear local storage
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');
      // Update state
      setUser(null);
      // Navigate to home
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear local storage and navigate even if backend call fails
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');
      setUser(null);
      navigate('/');
    }
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const handleMyAppointments = () => {
    navigate('/my-appointments');
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          {/* Left Section - ClinicFinder Brand + Navigation */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <div className="rounded-full bg-gradient-to-br from-slate-600 to-slate-700 p-2">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <span className="hidden font-bold sm:inline-block text-xl">ClinicFinder</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              {!user ? (
                <>
                  <Link
                    to="/"
                    className="transition-colors hover:text-foreground/80 text-foreground"
                  >
                    Home
                  </Link>
                  <Link
                    to="/find-clinics"
                    className="transition-colors hover:text-foreground/80 text-foreground/60"
                  >
                    Find Clinics
                  </Link>
                  <Link
                    to="/about"
                    className="transition-colors hover:text-foreground/80 text-foreground/60"
                  >
                    About
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/find-clinics"
                    className="transition-colors hover:text-foreground/80 text-foreground/60"
                  >
                    Find Clinics
                  </Link>
                  <Link
                    to="/my-appointments"
                    className="transition-colors hover:text-foreground/80 text-foreground/60"
                  >
                    My Appointments
                  </Link>
                </>
              )}
            </nav>
          </div>
          
          {/* Right Section - Authentication OR User Info */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 text-sm hover:bg-accent"
                >
                  <div className="rounded-full bg-slate-100 p-1">
                    <User className="h-4 w-4 text-slate-600" />
                  </div>
                  <span className="font-medium">{user?.name || user?.firstName || user?.email?.split('@')[0] || 'Guest'}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
                
                {/* Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 rounded-md border bg-popover shadow-lg z-50">
                    <div className="p-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleProfile}
                        className="w-full justify-start text-sm"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Profile Settings
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleMyAppointments}
                        className="w-full justify-start text-sm"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        My Appointments
                      </Button>
                      <hr className="my-1" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="w-full justify-start text-sm text-destructive hover:text-destructive"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="text-sm">Sign In</Button>
                </Link>
                <Link to="/login">
                  <Button className="text-sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </div>
        
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="border-t bg-background md:hidden">
            <div className="container">
              <div className="flex flex-col space-y-3 py-4">
                {!user ? (
                  <>
                    <Link
                      to="/"
                      className="block px-2 py-1 text-lg font-medium transition-colors hover:text-foreground/80"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Home
                    </Link>
                    <Link
                      to="/find-clinics"
                      className="block px-2 py-1 text-lg font-medium transition-colors hover:text-foreground/80"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Find Clinics
                    </Link>
                    <Link
                      to="/about"
                      className="block px-2 py-1 text-lg font-medium transition-colors hover:text-foreground/80"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      About
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/find-clinics"
                      className="block px-2 py-1 text-lg font-medium transition-colors hover:text-foreground/80"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Find Clinics
                    </Link>
                    <Link
                      to="/my-appointments"
                      className="block px-2 py-1 text-lg font-medium transition-colors hover:text-foreground/80"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      My Appointments
                    </Link>
                  </>
                )}
                <div className="border-t pt-4">
                  {user ? (
                    <>
                      <div className="px-2 py-2">
                        <div className="flex items-center gap-2">
                          <div className="rounded-full bg-slate-100 p-2">
                            <User className="h-4 w-4 text-slate-600" />
                          </div>
                          <span className="text-sm font-medium">{user?.name || user?.firstName || 'Guest'}</span>
                        </div>
                      </div>
                      <Link to="/my-appointments" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start">
                          <Calendar className="mr-2 h-4 w-4" />
                          My Appointments
                        </Button>
                      </Link>
                      <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start">
                          <Settings className="mr-2 h-4 w-4" />
                          Profile Settings
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start">
                          Sign In
                        </Button>
                      </Link>
                      <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button className="w-full">Sign Up</Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      <LogoutConfirmationModal
        isOpen={logoutModal}
        onClose={() => setLogoutModal(false)}
        onConfirm={confirmLogout}
        title="User Logout"
        message="Are you sure you want to logout from your account?"
      />

      {/* Footer */}
      <footer className="border-t border-border bg-card px-4 py-8 sm:px-6 lg:px-8">
        <div className="container">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="rounded-full bg-gradient-to-br from-slate-600 to-slate-700 p-2">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">ClinicFinder</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your trusted partner in finding quality healthcare services in Mati City and Davao Oriental.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Support</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/privacy" className="text-muted-foreground hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-muted-foreground hover:text-foreground">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Info</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Mati City, Davao Oriental</p>
                <p>Philippines 8600</p>
                <p>Phone: (087) 388-4174</p>
                <p>Email: info@clinicfinder.ph</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 ClinicFinder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
