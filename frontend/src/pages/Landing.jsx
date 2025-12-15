import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Search, Shield, Clock, Award, User, Calendar } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const Landing = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    setIsAuthenticated(authStatus === 'true');
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      navigate(`/find-clinics?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/login', { state: { from: { pathname: '/find-clinics', search: `?search=${encodeURIComponent(searchQuery)}` } } });
    }
  };

  const handleBookAppointment = () => {
    if (isAuthenticated) {
      navigate('/find-clinics');
    } else {
      navigate('/login', { state: { from: { pathname: '/find-clinics' } } });
    }
  };

  const handleMyAppointments = () => {
    if (isAuthenticated) {
      navigate('/my-appointments');
    } else {
      navigate('/login', { state: { from: { pathname: '/my-appointments' } } });
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-slate-700 to-slate-900 px-4 py-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
              <Shield className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">Secure • Private • Verified</span>
            </div>
            
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Find Healthcare Clinics
              <br />
              in Mati City
            </h1>
            
            <p className="mx-auto mb-8 max-w-2xl text-lg text-white/90 sm:text-xl">
              Book appointments with verified healthcare providers in Davao Oriental, Philippines. 
              Fast, secure, and hassle-free healthcare access.
            </p>

            {/* Auth CTA Section */}
            <div className="mb-8">
              {isAuthenticated ? (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" onClick={handleBookAppointment} className="bg-white text-blue-600 hover:bg-gray-100">
                    <Search className="mr-2 h-5 w-5" />
                    Find Clinics
                  </Button>
                  <Button size="lg" variant="outline" onClick={handleMyAppointments} className="border-white text-white hover:bg-white hover:text-blue-600">
                    <Calendar className="mr-2 h-5 w-5" />
                    My Appointments
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/login">
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                      <User className="mr-2 h-5 w-5" />
                      Sign Up to Book
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                      Sign In
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mx-auto max-w-2xl">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search for clinics, doctors, or specialties..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 text-lg bg-white/90 backdrop-blur-sm border-white/20"
                  />
                </div>
                <Button type="submit" size="lg" className="px-8">
                  Search
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose ClinicFinder?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience healthcare booking made simple with our comprehensive platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="rounded-full bg-blue-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Verified Clinics</h3>
                <p className="text-gray-600">
                  All healthcare providers are thoroughly verified and licensed professionals
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="rounded-full bg-green-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
                <p className="text-gray-600">
                  Book appointments in seconds with our intuitive booking system
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="rounded-full bg-purple-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Real-time Availability</h3>
                <p className="text-gray-600">
                  See up-to-date schedules and book available slots instantly
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Get started with ClinicFinder in 3 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="rounded-full bg-blue-100 w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <User className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Create Account</h3>
              <p className="text-gray-600">
                Sign up for free and create your profile to access healthcare services
              </p>
            </div>

            <div className="text-center">
              <div className="rounded-full bg-blue-100 w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Search className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Find Clinic</h3>
              <p className="text-gray-600">
                Search and compare clinics, read reviews, and check availability
              </p>
            </div>

            <div className="text-center">
              <div className="rounded-full bg-blue-100 w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Book Appointment</h3>
              <p className="text-gray-600">
                Book your appointment instantly and receive confirmation
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-gradient-to-r from-slate-700 to-slate-900">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Take Control of Your Healthcare?
          </h2>
          <p className="text-lg text-white/90 mb-8">
            Join thousands of patients who trust ClinicFinder for their healthcare needs
          </p>
          
          {isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleBookAppointment} className="bg-white text-blue-600 hover:bg-gray-100">
                <Search className="mr-2 h-5 w-5" />
                Find Clinics Now
              </Button>
              <Button size="lg" variant="outline" onClick={handleMyAppointments} className="border-white text-white hover:bg-white hover:text-blue-600">
                <Calendar className="mr-2 h-5 w-5" />
                My Appointments
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                <User className="mr-2 h-5 w-5" />
                Get Started Now
              </Button>
            </Link>
          )}
        </div>
      </section>
    </>
  );
};

export default Landing;
