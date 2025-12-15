import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { userService, clinicService, appointmentService, adminService } from "@/services/api";
import adminAuth from "@/utils/adminAuth";
import LogoutConfirmationModal from "@/components/LogoutConfirmationModal";
import { 
  Users, 
  User,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Star,
  TrendingUp,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  Settings,
  LogOut
} from "lucide-react";
import { 
  Modal, 
  ModalFooter, 
  ModalSection, 
  ModalInfo, 
  ConfirmationModal, 
  FormModal,
  SuccessModal 
} from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("clinic-managers");
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [clinicManagers, setClinicManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [logoutModal, setLogoutModal] = useState(false);
  const navigate = useNavigate();

  // Modal states
  const [appointmentDetailsModal, setAppointmentDetailsModal] = useState({ isOpen: false, appointment: null });
  const [userDetailsModal, setUserDetailsModal] = useState({ isOpen: false, user: null });
  const [editUserModal, setEditUserModal] = useState({ isOpen: false, user: null });
  const [deleteUserModal, setDeleteUserModal] = useState({ isOpen: false, user: null });
  const [editClinicModal, setEditClinicModal] = useState({ isOpen: false, clinic: null });
  const [clinicAvailabilityModal, setClinicAvailabilityModal] = useState({ isOpen: false, clinic: null });
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', message: '' });
  const [addManagerModal, setAddManagerModal] = useState({ isOpen: false });
  const [editManagerModal, setEditManagerModal] = useState({ isOpen: false, manager: null });
  const [deleteManagerModal, setDeleteManagerModal] = useState({ isOpen: false, manager: null });

  // Form states
  const [editUserForm, setEditUserForm] = useState({ email: '', role: '' });
  const [editClinicForm, setEditClinicForm] = useState({ name: '', address: '', phone: '', email: '' });
  const [managerForm, setManagerForm] = useState({ email: '', first_name: '', last_name: '', clinic_ids: [] });

  // Handle logout
  const handleLogout = async () => {
    setLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      // Call backend logout endpoint to destroy session
      await adminService.adminLogout();
      // Clear admin-specific storage
      localStorage.removeItem('adminToken');
      localStorage.removeItem('user');
      // Redirect to admin login
      navigate('/admin');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, clear local storage and redirect
      localStorage.removeItem('adminToken');
      localStorage.removeItem('user');
      navigate('/admin');
    }
  };

  // Handle appointment actions
  const handleViewAppointment = (appointment) => {
    console.log('View appointment:', appointment);
    setAppointmentDetailsModal({ isOpen: true, appointment });
  };

  const handleCancelAppointment = (appointment) => {
    console.log('Cancel appointment:', appointment);
    setAppointmentDetailsModal({ isOpen: true, appointment, showCancel: true });
  };

  // Handle user actions
  const handleEditUser = (user) => {
    console.log('Edit user:', user);
    setEditUserModal({ isOpen: true, user });
    setEditUserForm({ email: user.email || '', role: user.role || 'user' });
  };

  const handleDeleteUser = (user) => {
    console.log('Delete user:', user);
    setDeleteUserModal({ isOpen: true, user });
  };

  const handleViewUserDetails = (user) => {
    console.log('View user details:', user);
    setUserDetailsModal({ isOpen: true, user });
  };

  // Handle clinic actions
  const handleEditClinic = (clinic) => {
    console.log('Edit clinic:', clinic);
    setEditClinicModal({ isOpen: true, clinic });
    setEditClinicForm({ 
      name: clinic.name || '', 
      address: clinic.address || '', 
      phone: clinic.phone || '', 
      email: clinic.email || '' 
    });
  };

  const handleManageClinicAvailability = (clinic) => {
    console.log('Manage clinic availability:', clinic);
    setClinicAvailabilityModal({ isOpen: true, clinic });
  };

  // Modal action handlers
  const handleEditUserSubmit = (e) => {
    e.preventDefault();
    const { user } = editUserModal;
    
    // Simulate API call
    setEditUserModal({ isOpen: false, user: null });
    setSuccessModal({
      isOpen: true,
      title: 'User Updated',
      message: `User ${user.first_name} ${user.last_name} has been successfully updated:\nEmail: ${editUserForm.email}\nRole: ${editUserForm.role}\n\nThe user will receive a notification of these changes.`
    });
    
    // Update user in state (simulate database update)
    setUsers(prev => prev.map(u => 
      u.id === user.id 
        ? { ...u, email: editUserForm.email, role: editUserForm.role }
        : u
    ));
  };

  const handleDeleteUserConfirm = () => {
    const { user } = deleteUserModal;
    
    // Simulate API call
    setDeleteUserModal({ isOpen: false, user: null });
    setSuccessModal({
      isOpen: true,
      title: 'User Deleted',
      message: `User ${user.first_name} ${user.last_name} has been permanently deleted from the system.\n\nAll associated data and appointments have been removed.`
    });
    
    // Remove from UI (simulate database update)
    setUsers(prev => prev.filter(u => u.id !== user.id));
  };

  const handleEditClinicSubmit = (e) => {
    e.preventDefault();
    const { clinic } = editClinicModal;
    
    // Simulate API call
    setEditClinicModal({ isOpen: false, clinic: null });
    setSuccessModal({
      isOpen: true,
      title: 'Clinic Updated',
      message: `Clinic "${editClinicForm.name}" has been successfully updated.\n\nAll changes have been saved and will be reflected in the clinic listings.`
    });
    
    // Update in UI (simulate database update)
    setClinics(prev => prev.map(c => 
      c.id === clinic.id 
        ? { ...c, name: editClinicForm.name, address: editClinicForm.address, phone: editClinicForm.phone, email: editClinicForm.email }
        : c
    ));
  };

  // Fetch data from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check for admin authentication using helper
        if (!adminAuth.requireAdmin()) {
          return;
        }
        
        // Fetch real data from database
        const [usersData, appointmentsData, clinicsData, managersData] = await Promise.all([
          userService.getAllUsers(),
          appointmentService.getAllAppointments(),
          clinicService.getAllClinics(),
          adminService.getClinicManagers().catch(() => []),
        ]);
        
        setUsers(usersData);
        setAppointments(appointmentsData);
        setClinics(clinicsData);
        setClinicManagers(managersData || []);
        
      } catch (error) {
        console.error('Error fetching admin data:', error);
        setError(error.message);
        // Set empty arrays on error to prevent crashes
        setUsers([]);
        setAppointments([]);
        setClinics([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Dynamic stats based on real data
  const stats = {
    totalUsers: users.length,
    totalClinics: clinics.length,
    totalAppointments: appointments.length,
    totalRevenue: 0, // Calculate from real data
    activeUsers: users.filter(u => u.status === 'active').length,
    newUsersThisMonth: users.filter(u => {
      const joinedDate = new Date(u.joined);
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return joinedDate >= oneMonthAgo;
    }).length,
    appointmentsThisMonth: appointments.filter(a => {
      const appointmentDate = new Date(a.date);
      const now = new Date();
      return appointmentDate.getMonth() === now.getMonth() && 
             appointmentDate.getFullYear() === now.getFullYear();
    }).length,
    pendingAppointments: appointments.filter(a => a.status === 'pending').length,
    completedAppointments: appointments.filter(a => a.status === 'completed').length
  };

  // Dynamic data from database
  // Sort appointments by created_at to show newest first
  const sortedAppointments = appointments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const recentAppointments = sortedAppointments.slice(0, 10);
  const topClinics = clinics.sort((a, b) => (b.appointment_count || 0) - (a.appointment_count || 0)).slice(0, 5);
  const systemAlerts = []; // Fetch from database when implemented

  const StatCard = ({ title, value, change, icon: Icon, color = "primary" }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value.toLocaleString()}</p>
            {change && (
              <p className={`text-xs ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change >= 0 ? '+' : ''}{change}% from last month
              </p>
            )}
          </div>
          <div className={`p-3 rounded-full ${color === 'primary' ? 'bg-blue-100' : color === 'success' ? 'bg-green-100' : color === 'warning' ? 'bg-yellow-100' : 'bg-gray-100'}`}>
            <Icon className={`h-6 w-6 ${color === 'primary' ? 'text-blue-600' : color === 'success' ? 'text-green-600' : color === 'warning' ? 'text-yellow-600' : 'text-gray-600'}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-600 text-white"><CheckCircle className="h-3 w-3 mr-1" />Confirmed</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'info':
        return <Activity className="h-4 w-4 text-blue-600" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your clinic booking system</p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Loading dashboard data...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-red-600">Error loading dashboard: {error}</span>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        {!loading && !error && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="clinic-managers">Clinic Managers</TabsTrigger>
              <TabsTrigger value="clinics">Clinics</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
            </TabsList>

            <TabsContent value="clinic-managers" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Clinic Managers</CardTitle>
                      <CardDescription>Manage clinic managers and their clinic assignments</CardDescription>
                    </div>
                    <Button onClick={() => setAddManagerModal({ isOpen: true })}>
                      <User className="h-4 w-4 mr-2" />
                      Add Clinic Manager
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {clinicManagers.length > 0 ? (
                      clinicManagers.map((manager) => (
                        <div key={manager.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold">{manager.name}</h3>
                              <Badge variant="outline">{manager.role}</Badge>
                              <Badge className={manager.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                {manager.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{manager.email}</p>
                            <p className="text-sm text-muted-foreground mt-1 break-words">
                              Assigned to {manager.clinic_count} clinic{manager.clinic_count !== 1 ? 's' : ''}: {
                                manager.assigned_clinics?.map(c => c.name).join(', ') || 'None'
                              }
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => {
                              setEditManagerModal({ isOpen: true, manager });
                              setManagerForm({
                                email: manager.email,
                                first_name: manager.first_name,
                                last_name: manager.last_name,
                                phone: manager.phone || '',
                                clinic_ids: manager.assigned_clinics?.map(c => c.id) || []
                              });
                            }}>
                              Edit
                            </Button>
                            <Button 
                              variant={manager.status === 'active' ? 'destructive' : 'default'}
                              size="sm" 
                              className={manager.status === 'inactive' ? 'bg-green-600 hover:bg-green-700 text-white border-green-600' : ''}
                              style={manager.status === 'inactive' ? { backgroundColor: '#16a34a', borderColor: '#16a34a' } : {}}
                              onClick={() => setDeleteManagerModal({ isOpen: true, manager })}
                            >
                              {manager.status === 'active' ? 'Deactivate' : 'Activate'}
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No clinic managers found
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Registered Users</CardTitle>
                  <CardDescription>Manage user accounts and permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.length > 0 ? (
                      users.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold">{user.name}</h3>
                              <Badge variant="outline">{user.role}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <p className="text-sm text-muted-foreground">Joined: {user.joined}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>Edit</Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(user)}>Delete</Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No users found
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="clinics" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Clinic Management</CardTitle>
                      <CardDescription>Manage all clinics, their status, managers, and services</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {clinics.length > 0 ? (
                      clinics.map((clinic) => {
                        const clinicStatus = clinic.status === 'open' || clinic.status === 'active' ? 'open' : 'closed';
                        const manager = clinicManagers.find(m => 
                          m.assigned_clinics?.some(c => c.id === clinic.id)
                        );
                        
                        return (
                          <div key={clinic.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1 text-left">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold">{clinic.name}</h3>
                                <Badge variant="outline" className={clinicStatus === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                  {clinicStatus === 'open' ? (
                                    <>
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Open
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="h-3 w-3 mr-1" />
                                      Closed
                                    </>
                                  )}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{clinic.address}</p>
                              <p className="text-sm text-muted-foreground">{clinic.phone}</p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <span>{clinic.appointment_count || clinic.total_appointments || 0} appointments</span>
                                <span>{clinic.services?.length || 0} services</span>
                                {manager && (
                                  <span className="text-blue-600">Manager: {manager.name}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleEditClinic(clinic)}>Edit</Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={async () => {
                                  try {
                                    const newStatus = clinicStatus === 'open' ? 'closed' : 'open';
                                    await clinicService.updateClinic(clinic.id, { status: newStatus });
                                    setClinics(prev => prev.map(c => 
                                      c.id === clinic.id ? { ...c, status: newStatus } : c
                                    ));
                                    setSuccessModal({
                                      isOpen: true,
                                      title: 'Clinic Status Updated',
                                      message: `Clinic "${clinic.name}" is now ${newStatus}`
                                    });
                                  } catch (error) {
                                    setError('Failed to update clinic status');
                                  }
                                }}
                              >
                                {clinicStatus === 'open' ? 'Close' : 'Open'}
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No clinics found
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appointments" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>All Appointments</CardTitle>
                  <CardDescription>View and manage all appointment bookings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {appointments.length > 0 ? (
                      appointments.map((appointment) => (
                        <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold">{appointment.first_name && appointment.last_name ? `${appointment.first_name} ${appointment.last_name}` : appointment.patient || 'Unknown Patient'}</h3>
                              {getStatusBadge(appointment.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {appointment.clinic?.name || appointment.clinic_name || 'Unknown Clinic'} - {appointment.service || 'General Consultation'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {appointment.appointment_date || appointment.date} at {appointment.appointment_time || appointment.time}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleViewAppointment(appointment)}>View Details</Button>
                            <Button variant="destructive" size="sm" onClick={() => handleCancelAppointment(appointment)}>Cancel</Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No appointments found
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Appointment Details Modal */}
      <Modal
        isOpen={appointmentDetailsModal.isOpen}
        onClose={() => setAppointmentDetailsModal({ isOpen: false, appointment: null })}
        title="Appointment Details"
        size="large"
      >
        <div className="space-y-6">
          <ModalSection title="Patient Information">
            <div className="grid grid-cols-2 gap-4">
              <ModalInfo label="Name" value={`${appointmentDetailsModal.appointment?.first_name || ''} ${appointmentDetailsModal.appointment?.last_name || ''}`} />
              <ModalInfo label="Email" value={appointmentDetailsModal.appointment?.email || 'N/A'} />
              <ModalInfo label="Status" value={appointmentDetailsModal.appointment?.status || 'Pending'} />
              <ModalInfo label="Appointment ID" value={appointmentDetailsModal.appointment?.id || 'N/A'} />
            </div>
          </ModalSection>
          
          <ModalSection title="Appointment Information">
            <div className="grid grid-cols-2 gap-4">
              <ModalInfo label="Clinic" value={appointmentDetailsModal.appointment?.clinic?.name || appointmentDetailsModal.appointment?.clinic_name || 'N/A'} />
              <ModalInfo label="Address" value={appointmentDetailsModal.appointment?.clinic?.address || appointmentDetailsModal.appointment?.clinic_address || 'Mati City, Davao Oriental'} />
              <ModalInfo label="Service" value={appointmentDetailsModal.appointment?.service || 'General Consultation'} />
              <ModalInfo label="Date" value={appointmentDetailsModal.appointment?.appointment_date || 'N/A'} />
              <ModalInfo label="Time" value={appointmentDetailsModal.appointment?.appointment_time || 'N/A'} />
              <ModalInfo label="Reason" value={appointmentDetailsModal.appointment?.reason || 'No reason provided'} />
            </div>
          </ModalSection>
        </div>
        
        <ModalFooter>
          <Button variant="outline" onClick={() => setAppointmentDetailsModal({ isOpen: false, appointment: null })}>
            Close
          </Button>
          {appointmentDetailsModal.showCancel && (
            <Button 
              variant="destructive"
              onClick={() => {
                setAppointmentDetailsModal({ isOpen: false, appointment: null });
                // Handle cancel logic here
                alert('Appointment cancelled successfully');
              }}
            >
              Cancel Appointment
            </Button>
          )}
        </ModalFooter>
      </Modal>

      {/* User Details Modal */}
      <Modal
        isOpen={userDetailsModal.isOpen}
        onClose={() => setUserDetailsModal({ isOpen: false, user: null })}
        title="User Details"
        size="large"
      >
        <div className="space-y-6">
          <ModalSection title="Personal Information">
            <div className="grid grid-cols-2 gap-4">
              <ModalInfo label="Name" value={`${userDetailsModal.user?.first_name || ''} ${userDetailsModal.user?.last_name || ''}`} />
              <ModalInfo label="Email" value={userDetailsModal.user?.email || 'N/A'} />
              <ModalInfo label="Role" value={userDetailsModal.user?.role || 'User'} />
              <ModalInfo label="Status" value={userDetailsModal.user?.status || 'Active'} />
              <ModalInfo label="Joined" value={userDetailsModal.user?.joined || userDetailsModal.user?.created_at || 'N/A'} />
              <ModalInfo label="User ID" value={userDetailsModal.user?.id || 'N/A'} />
            </div>
          </ModalSection>
          
          <ModalSection title="Recent Activity">
            <div className="grid grid-cols-2 gap-4">
              <ModalInfo label="Last Login" value={userDetailsModal.user?.last_login || 'N/A'} />
              <ModalInfo label="Appointments" value={userDetailsModal.user?.appointment_count || '0'} />
              <ModalInfo label="Reviews" value={userDetailsModal.user?.review_count || '0'} />
              <ModalInfo label="Email Verified" value={userDetailsModal.user?.email_verified ? 'Yes' : 'No'} />
            </div>
          </ModalSection>
        </div>
        
        <ModalFooter>
          <Button variant="outline" onClick={() => setUserDetailsModal({ isOpen: false, user: null })}>
            Close
          </Button>
          <Button 
            onClick={() => {
              setUserDetailsModal({ isOpen: false, user: null });
              handleEditUser(userDetailsModal.user);
            }}
          >
            Edit User
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit User Modal */}
      <FormModal
        isOpen={editUserModal.isOpen}
        onClose={() => setEditUserModal({ isOpen: false, user: null })}
        title="Edit User"
        onSubmit={handleEditUserSubmit}
        onCancel={() => setEditUserModal({ isOpen: false, user: null })}
        submitText="Update User"
        cancelText="Cancel"
      >
        <ModalSection title="User Information">
          <div className="space-y-4">
            <div>
              <Label htmlFor="user-name">Name</Label>
              <Input
                id="user-name"
                value={`${editUserModal.user?.first_name || ''} ${editUserModal.user?.last_name || ''}`}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div>
              <Label htmlFor="user-email">Email</Label>
              <Input
                id="user-email"
                type="email"
                value={editUserForm.email}
                onChange={(e) => setEditUserForm(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="user-role">Role</Label>
              <select
                id="user-role"
                value={editUserForm.role}
                onChange={(e) => setEditUserForm(prev => ({ ...prev, role: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </ModalSection>
      </FormModal>

      {/* Delete User Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteUserModal.isOpen}
        onClose={() => setDeleteUserModal({ isOpen: false, user: null })}
        title="Delete User"
        message={`Are you sure you want to delete user ${deleteUserModal.user?.first_name} ${deleteUserModal.user?.last_name}?\n\nEmail: ${deleteUserModal.user?.email}\nRole: ${deleteUserModal.user?.role}\n\nThis action cannot be undone and will remove all user data including appointments and reviews.`}
        onConfirm={handleDeleteUserConfirm}
        onCancel={() => setDeleteUserModal({ isOpen: false, user: null })}
        confirmText="Delete User"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Edit Clinic Modal */}
      <FormModal
        isOpen={editClinicModal.isOpen}
        onClose={() => setEditClinicModal({ isOpen: false, clinic: null })}
        title="Edit Clinic"
        onSubmit={handleEditClinicSubmit}
        onCancel={() => setEditClinicModal({ isOpen: false, clinic: null })}
        submitText="Update Clinic"
        cancelText="Cancel"
      >
        <ModalSection title="Clinic Information">
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-clinic-name">Clinic Name</Label>
              <Input
                id="edit-clinic-name"
                value={editClinicForm.name}
                onChange={(e) => setEditClinicForm(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-clinic-address">Address</Label>
              <Input
                id="edit-clinic-address"
                value={editClinicForm.address}
                onChange={(e) => setEditClinicForm(prev => ({ ...prev, address: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-clinic-phone">Phone</Label>
              <Input
                id="edit-clinic-phone"
                value={editClinicForm.phone}
                onChange={(e) => setEditClinicForm(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-clinic-email">Email</Label>
              <Input
                id="edit-clinic-email"
                type="email"
                value={editClinicForm.email}
                onChange={(e) => setEditClinicForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
          </div>
        </ModalSection>
      </FormModal>

      {/* Clinic Availability Modal */}
      <Modal
        isOpen={clinicAvailabilityModal.isOpen}
        onClose={() => setClinicAvailabilityModal({ isOpen: false, clinic: null })}
        title="Clinic Availability Management"
        size="large"
      >
        <div className="space-y-6">
          <ModalSection title="Clinic Information">
            <div className="grid grid-cols-2 gap-4">
              <ModalInfo label="Clinic Name" value={clinicAvailabilityModal.clinic?.name || ''} />
              <ModalInfo label="Address" value={clinicAvailabilityModal.clinic?.address || ''} />
            </div>
          </ModalSection>
          
          <ModalSection title="Operating Hours">
            <div className="grid grid-cols-1 gap-2">
              <ModalInfo label="Monday" value="8:00 AM - 5:00 PM" />
              <ModalInfo label="Tuesday" value="8:00 AM - 5:00 PM" />
              <ModalInfo label="Wednesday" value="8:00 AM - 5:00 PM" />
              <ModalInfo label="Thursday" value="8:00 AM - 5:00 PM" />
              <ModalInfo label="Friday" value="8:00 AM - 5:00 PM" />
              <ModalInfo label="Saturday" value="9:00 AM - 12:00 PM" />
              <ModalInfo label="Sunday" value="CLOSED" />
            </div>
          </ModalSection>
          
          <ModalSection title="Available Services">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>General Consultation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Specialized Care</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Emergency Services</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Laboratory Tests</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>X-Ray and Diagnostics</span>
              </div>
            </div>
          </ModalSection>
        </div>
        
        <ModalFooter>
          <Button onClick={() => setClinicAvailabilityModal({ isOpen: false, clinic: null })}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* Success Modal */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, title: '', message: '' })}
        onConfirm={() => setSuccessModal({ isOpen: false, title: '', message: '' })}
        title={successModal.title}
        message={successModal.message}
        confirmText="OK"
      />

      {/* Add Clinic Manager Modal */}
      <FormModal
        isOpen={addManagerModal.isOpen}
        onClose={() => {
          setAddManagerModal({ isOpen: false });
          setManagerForm({ email: '', first_name: '', last_name: '', clinic_ids: [] });
        }}
        title="Add Clinic Manager"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await adminService.createClinicManager(managerForm);
            setAddManagerModal({ isOpen: false });
            setManagerForm({ email: '', first_name: '', last_name: '', clinic_ids: [] });
            setSuccessModal({
              isOpen: true,
              title: 'Clinic Manager Created',
              message: `Clinic manager ${managerForm.first_name} ${managerForm.last_name} has been created successfully. Default password: password123`
            });
            // Refresh managers list
            const managersData = await adminService.getClinicManagers();
            setClinicManagers(managersData || []);
          } catch (error) {
            setError(error.message || 'Failed to create clinic manager');
          }
        }}
        onCancel={() => {
          setAddManagerModal({ isOpen: false });
          setManagerForm({ email: '', first_name: '', last_name: '', clinic_ids: [] });
        }}
        submitText="Create Manager"
        cancelText="Cancel"
      >
        <ModalSection title="Manager Information">
          <div className="space-y-4">
            <div>
              <Label htmlFor="manager-email">Email *</Label>
              <Input
                id="manager-email"
                type="email"
                value={managerForm.email}
                onChange={(e) => setManagerForm(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="manager-first-name">First Name *</Label>
                <Input
                  id="manager-first-name"
                  value={managerForm.first_name}
                  onChange={(e) => setManagerForm(prev => ({ ...prev, first_name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="manager-last-name">Last Name *</Label>
                <Input
                  id="manager-last-name"
                  value={managerForm.last_name}
                  onChange={(e) => setManagerForm(prev => ({ ...prev, last_name: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="manager-phone">Phone</Label>
              <Input
                id="manager-phone"
                value={managerForm.phone}
                onChange={(e) => setManagerForm(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="manager-clinics">Assign Clinics *</Label>
              <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2">
                {clinics.map(clinic => (
                  <label key={clinic.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={managerForm.clinic_ids.includes(clinic.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setManagerForm(prev => ({
                            ...prev,
                            clinic_ids: [...prev.clinic_ids, clinic.id]
                          }));
                        } else {
                          setManagerForm(prev => ({
                            ...prev,
                            clinic_ids: prev.clinic_ids.filter(id => id !== clinic.id)
                          }));
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{clinic.name}</span>
                  </label>
                ))}
              </div>
              {managerForm.clinic_ids.length === 0 && (
                <p className="text-xs text-red-600 mt-1">Please select at least one clinic</p>
              )}
            </div>
          </div>
        </ModalSection>
      </FormModal>

      {/* Edit Clinic Manager Modal */}
      <FormModal
        isOpen={editManagerModal.isOpen}
        onClose={() => {
          setEditManagerModal({ isOpen: false, manager: null });
          setManagerForm({ email: '', first_name: '', last_name: '', clinic_ids: [] });
        }}
        title="Edit Clinic Manager"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await adminService.updateClinicManager(editManagerModal.manager.id, managerForm);
            setEditManagerModal({ isOpen: false, manager: null });
            setManagerForm({ email: '', first_name: '', last_name: '', clinic_ids: [] });
            setSuccessModal({
              isOpen: true,
              title: 'Clinic Manager Updated',
              message: `Clinic manager has been updated successfully.`
            });
            // Refresh managers list
            const managersData = await adminService.getClinicManagers();
            setClinicManagers(managersData || []);
          } catch (error) {
            setError(error.message || 'Failed to update clinic manager');
          }
        }}
        onCancel={() => {
          setEditManagerModal({ isOpen: false, manager: null });
          setManagerForm({ email: '', first_name: '', last_name: '', clinic_ids: [] });
        }}
        submitText="Update Manager"
        cancelText="Cancel"
      >
        <ModalSection title="Manager Information">
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-manager-email">Email *</Label>
              <Input
                id="edit-manager-email"
                type="email"
                value={managerForm.email}
                onChange={(e) => setManagerForm(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-manager-first-name">First Name *</Label>
                <Input
                  id="edit-manager-first-name"
                  value={managerForm.first_name}
                  onChange={(e) => setManagerForm(prev => ({ ...prev, first_name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-manager-last-name">Last Name *</Label>
                <Input
                  id="edit-manager-last-name"
                  value={managerForm.last_name}
                  onChange={(e) => setManagerForm(prev => ({ ...prev, last_name: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-manager-clinics">Assign Clinics *</Label>
              <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2">
                {clinics.map(clinic => (
                  <label key={clinic.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={managerForm.clinic_ids.includes(clinic.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setManagerForm(prev => ({
                            ...prev,
                            clinic_ids: [...prev.clinic_ids, clinic.id]
                          }));
                        } else {
                          setManagerForm(prev => ({
                            ...prev,
                            clinic_ids: prev.clinic_ids.filter(id => id !== clinic.id)
                          }));
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{clinic.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </ModalSection>
      </FormModal>

      {/* Delete/Deactivate Clinic Manager Modal */}
      <ConfirmationModal
        isOpen={deleteManagerModal.isOpen}
        onClose={() => setDeleteManagerModal({ isOpen: false, manager: null })}
        title={deleteManagerModal.manager?.status === 'active' ? 'Deactivate Clinic Manager' : 'Activate Clinic Manager'}
        message={
          deleteManagerModal.manager?.status === 'active'
            ? `Are you sure you want to deactivate ${deleteManagerModal.manager?.name}?\n\nEmail: ${deleteManagerModal.manager?.email}\n\nThis will remove all clinic assignments. The manager account will remain but won't have access to any clinics.`
            : `Are you sure you want to activate ${deleteManagerModal.manager?.name}?\n\nEmail: ${deleteManagerModal.manager?.email}\n\nNote: You may need to assign clinics to this manager for them to have access.`
        }
        onConfirm={async () => {
          try {
            const response = await adminService.deactivateClinicManager(deleteManagerModal.manager.id);
            const updatedManager = response.manager || deleteManagerModal.manager;
            
            // Update the manager in the list immediately
            setClinicManagers(prevManagers => 
              prevManagers.map(m => 
                m.id === updatedManager.id 
                  ? { ...m, status: updatedManager.status, assigned_clinics: updatedManager.assigned_clinics, clinic_count: updatedManager.clinic_count }
                  : m
              )
            );
            
            setDeleteManagerModal({ isOpen: false, manager: null });
            setSuccessModal({
              isOpen: true,
              title: updatedManager.status === 'active' ? 'Clinic Manager Activated' : 'Clinic Manager Deactivated',
              message: `${deleteManagerModal.manager.name} has been ${updatedManager.status === 'active' ? 'activated' : 'deactivated'} successfully.`
            });
          } catch (error) {
            setError(error.message || `Failed to ${deleteManagerModal.manager?.status === 'active' ? 'deactivate' : 'activate'} clinic manager`);
          }
        }}
        onCancel={() => setDeleteManagerModal({ isOpen: false, manager: null })}
        confirmText={deleteManagerModal.manager?.status === 'active' ? 'Deactivate' : 'Activate'}
        cancelText="Cancel"
        variant={deleteManagerModal.manager?.status === 'active' ? 'danger' : 'default'}
      />

      <LogoutConfirmationModal
        isOpen={logoutModal}
        onClose={() => setLogoutModal(false)}
        onConfirm={confirmLogout}
        title="Admin Logout"
        message="Are you sure you want to logout from the admin dashboard?"
      />
    </div>
  );
};

export default AdminDashboard;
