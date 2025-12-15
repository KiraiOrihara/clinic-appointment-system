import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clinicManagerService } from '../../services/api';
import ClinicSelector from '../../components/ClinicSelector';
import DoctorManagement from './DoctorManagement';
import ClinicServiceManagement from './ClinicServiceManagement';
import ClinicAppointments from './ClinicAppointments';
import ClinicSettings from './ClinicSettings';
import LogoutConfirmationModal from '../../components/LogoutConfirmationModal';
import { 
  Building2, Calendar, CheckCircle, XCircle, Clock, 
  Users, DollarSign, Settings, Activity, AlertCircle,
  Power, PowerOff, Plus, Edit, Trash2, Search, Stethoscope,
  Package, UserCircle
} from 'lucide-react';

// Simple Card components since we're not using the UI library
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow ${className}`}>{children}</div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`p-6 pb-4 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>{children}</h3>
);

const CardDescription = ({ children, className = "" }) => (
  <p className={`text-sm text-gray-600 ${className}`}>{children}</p>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

const Button = ({ children, variant = "default", onClick, className = "", ...props }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    destructive: "bg-red-600 text-white hover:bg-red-700", 
    outline: "border border-gray-300 bg-white hover:bg-gray-50"
  };
  return (
    <button 
      className={`${baseClasses} ${variants[variant]} px-4 py-2 ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

const Tabs = ({ children, value, onValueChange, className = "" }) => (
  <div className={className}>{children}</div>
);

const TabsList = ({ children, className = "" }) => (
  <div className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 ${className}`}>{children}</div>
);

const TabsTrigger = ({ children, value, onClick, isActive, className = "" }) => (
  <button 
    onClick={onClick}
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
      isActive ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
    } ${className}`}
  >
    {children}
  </button>
);

const TabsContent = ({ children, value, activeTab, className = "" }) => (
  <div className={value === activeTab ? className : 'hidden'}>{children}</div>
);

const ClinicManagerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [clinicStatus, setClinicStatus] = useState(false);
  const [selectedClinicId, setSelectedClinicId] = useState(null);
  const [managedClinics, setManagedClinics] = useState([]);
  const [logoutModal, setLogoutModal] = useState(false);

  useEffect(() => {
    loadManagedClinics();
  }, []);

  useEffect(() => {
    if (selectedClinicId) {
      loadDashboard();
    }
  }, [selectedClinicId]);

  const loadManagedClinics = async () => {
    try {
      console.log('Loading managed clinics...');
      const response = await clinicManagerService.getManagedClinics();
      console.log('Managed clinics response:', response);
      // Backend returns clinics array directly, not wrapped in response.clinics
      const clinics = Array.isArray(response) ? response : response.clinics || [];
      setManagedClinics(clinics);
      if (!selectedClinicId && clinics.length > 0) {
        setSelectedClinicId(clinics[0].id);
        console.log('Set selected clinic ID:', clinics[0].id);
      }
    } catch (error) {
      console.error('Failed to load managed clinics:', error);
    } finally {
      // Prevent infinite loading state if clinics fail to load
      setLoading(false);
    }
  };

  const handleClinicChange = (clinicId) => {
    console.log('Clinic changed to:', clinicId);
    setSelectedClinicId(clinicId);
  };

  const loadDashboard = async () => {
    try {
      console.log('Loading dashboard for clinic:', selectedClinicId);
      setLoading(true);
      // Pass selected clinic_id to filter dashboard data
      const data = await clinicManagerService.getDashboard(selectedClinicId);
      console.log('Dashboard data:', data);
      setDashboardData(data);
      
      // Get clinic status from the selected clinic
      const selectedClinic = data.selected_clinic;
      const status = selectedClinic?.status || 'open';
      setClinicStatus(status === 'open' || status === 'active');
      
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  };

  const [showStatusModal, setShowStatusModal] = useState(false);

  const handleToggleStatus = async () => {
    if (!selectedClinicId) {
      alert('Please select a clinic first');
      return;
    }
    setShowStatusModal(true);
  };

  const confirmToggleStatus = async () => {
    setShowStatusModal(false);
    
    if (!selectedClinicId) {
      alert('No clinic selected. Please select a clinic first.');
      return;
    }
    
    try {
      console.log('Toggling clinic status for ID:', selectedClinicId);
      const response = await clinicManagerService.toggleClinicStatus(selectedClinicId);
      console.log('Toggle response:', response);
      setClinicStatus(response.is_open || response.status === 'open');
      await loadDashboard(); // Refresh data
    } catch (error) {
      console.error('Failed to toggle clinic status:', error);
      alert('Failed to update clinic status. Please try again.');
    }
  };

  const handleLogout = () => {
    setLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    navigate('/admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-muted-foreground">Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  const { clinics, settings, stats, selected_clinic } = dashboardData || {};
  const clinic = selected_clinic || clinics?.find(c => c.id === selectedClinicId) || clinics?.[0];
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Building2 className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">
                  {dashboardData?.selected_clinic_name || dashboardData?.selected_clinic?.name || 'Clinic Manager Dashboard'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {user.firstName || 'Manager'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-80">
                <ClinicSelector onClinicChange={handleClinicChange} selectedClinicId={selectedClinicId} />
              </div>
              <Button
                variant={clinicStatus ? "default" : "destructive"}
                onClick={handleToggleStatus}
                className="flex items-center space-x-2"
              >
                {clinicStatus ? (
                  <>
                    <Power className="h-4 w-4" />
                    <span>Clinic Open</span>
                  </>
                ) : (
                  <>
                    <PowerOff className="h-4 w-4" />
                    <span>Clinic Closed</span>
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger 
              value="overview" 
              isActive={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="appointments"
              isActive={activeTab === 'appointments'}
              onClick={() => setActiveTab('appointments')}
            >
              Appointments
            </TabsTrigger>
            <TabsTrigger 
              value="doctors"
              isActive={activeTab === 'doctors'}
              onClick={() => setActiveTab('doctors')}
            >
              Doctors
            </TabsTrigger>
            <TabsTrigger 
              value="services"
              isActive={activeTab === 'services'}
              onClick={() => setActiveTab('services')}
            >
              Services
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" activeTab={activeTab} className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
                  <CheckCircle className="h-4 w-4 text-black" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-black">{stats?.pending_approvals || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Ready to check in
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.today_appointments || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Scheduled for today
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.total_appointments || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    All time appointments
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Week Appointments</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.week_appointments || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Scheduled this week
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Clinic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Current Clinic Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                    <p className="text-lg">{clinic?.name || 'Select a clinic'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Address</p>
                    <p className="text-lg">{clinic?.address || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <p className="text-lg">{clinic?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-lg">{clinic?.email || 'N/A'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Description</p>
                    <p className="text-lg">{clinic?.description || 'No description'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" activeTab={activeTab}>
            <ClinicAppointments clinicId={selectedClinicId} />
          </TabsContent>

          {/* Doctors Tab */}
          <TabsContent value="doctors" activeTab={activeTab}>
            <DoctorManagement clinicId={selectedClinicId} />
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" activeTab={activeTab}>
            <ClinicServiceManagement clinicId={selectedClinicId} />
          </TabsContent>

        </Tabs>
      </main>

      {/* Status Toggle Confirmation Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {clinicStatus ? 'Close Clinic?' : 'Open Clinic?'}
            </h3>
            <p className="text-gray-600 mb-6">
              {clinicStatus 
                ? 'Are you sure you want to close this clinic? Patients will not be able to book appointments until you reopen it.'
                : 'Are you sure you want to open this clinic? Patients will be able to book appointments immediately.'}
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowStatusModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant={clinicStatus ? "destructive" : "default"}
                onClick={confirmToggleStatus}
              >
                {clinicStatus ? 'Close Clinic' : 'Open Clinic'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <LogoutConfirmationModal
        isOpen={logoutModal}
        onClose={() => setLogoutModal(false)}
        onConfirm={confirmLogout}
        title="Clinic Manager Logout"
        message="Are you sure you want to logout from the clinic manager dashboard?"
      />
    </div>
  );
};

export default ClinicManagerDashboard;

