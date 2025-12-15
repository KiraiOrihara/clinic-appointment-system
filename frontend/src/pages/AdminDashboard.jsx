import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Building2, Users, LogOut, Plus, Edit2, Trash2, X,
  Mail, Phone, MapPin, Globe, FileText, CheckCircle, XCircle
} from 'lucide-react';
import { adminService, clinicManagerService } from '../services/api';
import LogoutConfirmationModal from '../components/LogoutConfirmationModal';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [clinics, setClinics] = useState([]);
  const [clinicManagers, setClinicManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const [modalType, setModalType] = useState(null); // 'clinic', 'manager', 'addManager'
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadData();
  }, [activeSection]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeSection === 'clinics') {
        const response = await fetch('http://localhost:8000/api/clinics');
        const data = await response.json();
        setClinics(data);
      } else if (activeSection === 'managers') {
        await loadClinicManagers();
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClinicManagers = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/admin/users');
      const data = await response.json();
      const managers = data.filter(user => 
        user.role === 'clinic_manager' || user.role === 'manager'
      );
      setClinicManagers(managers);
    } catch (error) {
      console.error('Error loading clinic managers:', error);
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

  const openModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    if (type === 'addManager') {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        password: ''
      });
    } else if (item) {
      setFormData({ ...item });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType(null);
    setSelectedItem(null);
    setFormData({});
  };

  const handleSaveManager = async (e) => {
    e.preventDefault();
    try {
      // Implementation for adding/updating manager
      alert('Manager saved successfully');
      closeModal();
      loadClinicManagers();
    } catch (error) {
      console.error('Error saving manager:', error);
      alert('Failed to save manager');
    }
  };

  const handleDeleteManager = async (managerId) => {
    if (window.confirm('Are you sure you want to mark this manager as inactive?')) {
      try {
        // Soft delete - mark as inactive
        await fetch(`http://localhost:8000/api/admin/users/${managerId}`, {
          method: 'DELETE'
        });
        loadClinicManagers();
      } catch (error) {
        console.error('Error deleting manager:', error);
        alert('Failed to delete manager');
      }
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Clinics</p>
              <p className="text-3xl font-bold text-gray-900">{clinics.length}</p>
            </div>
            <Building2 className="w-12 h-12 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Clinic Managers</p>
              <p className="text-3xl font-bold text-gray-900">{clinicManagers.length}</p>
            </div>
            <Users className="w-12 h-12 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Clinics</p>
              <p className="text-3xl font-bold text-gray-900">
                {clinics.filter(c => c.status === 'open' || c.status === 'active').length}
              </p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-600">No recent activity</p>
        </div>
      </div>
    </div>
  );

  const renderClinics = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Clinics Overview</h2>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clinics.map((clinic) => (
            <div
              key={clinic.id}
              onClick={() => openModal('clinic', clinic)}
              className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Building2 className="w-8 h-8 text-blue-500" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{clinic.name}</h3>
                    <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full mt-1 ${
                      clinic.status === 'open' || clinic.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {clinic.status === 'open' || clinic.status === 'active' ? 'Open' : 'Closed'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  {clinic.address}
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  {clinic.phone}
                </div>
                {clinic.email && (
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    {clinic.email}
                  </div>
                )}
                {clinic.doctor_count > 0 && (
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    {clinic.doctor_count} {clinic.doctor_count === 1 ? 'Doctor' : 'Doctors'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderManagers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Clinic Managers</h2>
        <button
          onClick={() => openModal('addManager')}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Clinic Manager
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clinic Assigned</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clinicManagers.map((manager) => (
                <tr key={manager.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {manager.first_name} {manager.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {manager.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {manager.phone || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {manager.managed_clinic_id ? `Clinic #${manager.managed_clinic_id}` : 'Multiple'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openModal('manager', manager)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit2 className="w-4 h-4 inline" />
                    </button>
                    <button
                      onClick={() => handleDeleteManager(manager.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderModal = () => {
    if (!showModal) return null;

    if (modalType === 'clinic') {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Clinic Details</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={formData.name || selectedItem?.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <textarea
                  value={formData.address || selectedItem?.address || ''}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="text"
                    value={formData.phone || selectedItem?.phone || ''}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={formData.email || selectedItem?.email || ''}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => alert('Save functionality to be implemented')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (modalType === 'addManager' || modalType === 'manager') {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">
                {modalType === 'addManager' ? 'Add Clinic Manager' : 'Edit Clinic Manager'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSaveManager} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.first_name || ''}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.last_name || ''}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email || ''}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              {modalType === 'addManager' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password *</label>
                  <input
                    type="password"
                    required
                    value={formData.password || ''}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              )}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {modalType === 'addManager' ? 'Add Manager' : 'Update Manager'}
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>
        <nav className="mt-6">
          <button
            onClick={() => setActiveSection('overview')}
            className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-100 transition-colors ${
              activeSection === 'overview' ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : 'text-gray-700'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Overview
          </button>
          <button
            onClick={() => setActiveSection('managers')}
            className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-100 transition-colors ${
              activeSection === 'managers' ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : 'text-gray-700'
            }`}
          >
            <Users className="w-5 h-5 mr-3" />
            Clinic Managers
          </button>
          <button
            onClick={() => setActiveSection('clinics')}
            className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-100 transition-colors ${
              activeSection === 'clinics' ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : 'text-gray-700'
            }`}
          >
            <Building2 className="w-5 h-5 mr-3" />
            Clinics
          </button>
        </nav>
        <div className="absolute bottom-0 w-64 p-6 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-6 py-3 text-left text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {activeSection === 'overview' && renderOverview()}
        {activeSection === 'managers' && renderManagers()}
        {activeSection === 'clinics' && renderClinics()}
      </div>

      {/* Modal */}
      {renderModal()}

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
