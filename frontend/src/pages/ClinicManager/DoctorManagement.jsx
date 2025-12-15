import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, User, Mail, Phone, Stethoscope, DollarSign, Award } from 'lucide-react';
import { clinicManagerService } from '../../services/api';

const DoctorManagement = ({ clinicId }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    specialization: '',
    bio: '',
    license_number: '',
    years_experience: '',
    consultation_fee: '',
    status: 'active'
  });

  useEffect(() => {
    if (clinicId) {
      fetchDoctors();
    }
  }, [clinicId]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await clinicManagerService.getClinicDoctors(clinicId);
      console.log('Fetched doctors response:', response);
      // Backend returns doctors array directly, not wrapped in response.doctors
      const doctorsList = Array.isArray(response) ? response : response.doctors || [];
      console.log('Set doctors list:', doctorsList);
      // Log specific doctor status to debug
      const updatedDoctor = doctorsList.find(d => d.id === editingDoctor?.id);
      if (updatedDoctor) {
        console.log('Updated doctor status:', updatedDoctor.status);
      }
      setDoctors(doctorsList);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!clinicId) {
      alert('No clinic selected. Please select a clinic first.');
      return;
    }
    
    if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.specialization.trim()) {
      alert('First name, last name, and specialization are required.');
      return;
    }
    
    try {
      if (editingDoctor) {
        // First update the basic doctor info
        const updateData = {
          ...formData,
          clinic_id: clinicId
        };
        console.log('Updating doctor with data:', updateData);
        const result = await clinicManagerService.updateDoctor(editingDoctor.id, updateData);
        console.log('Update result:', result);
        
        // Then update the status separately using the dedicated endpoint
        if (formData.status !== editingDoctor.status) {
          console.log('Updating doctor status to:', formData.status);
          const statusResult = await clinicManagerService.updateDoctorStatus(editingDoctor.id, formData.status);
          console.log('Status update result:', statusResult);
        }
      } else {
        // Include clinic_id in the request
        const doctorData = {
          ...formData,
          clinic_id: clinicId
        };
        await clinicManagerService.addDoctor(doctorData);
      }
      
      setShowAddModal(false);
      setEditingDoctor(null);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        specialization: '',
        bio: '',
        license_number: '',
        years_experience: '',
        consultation_fee: '',
        status: 'active'
      });
      fetchDoctors();
    } catch (error) {
      console.error('Error saving doctor:', error);
    }
  };

  const handleEdit = (doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      first_name: doctor.first_name || '',
      last_name: doctor.last_name || '',
      email: doctor.email || '',
      phone: doctor.phone || '',
      specialization: doctor.specialization || '',
      bio: doctor.bio || '',
      license_number: doctor.license_number || '',
      years_experience: doctor.years_experience || '',
      consultation_fee: doctor.consultation_fee || '',
      status: doctor.status || 'active'
    });
    setShowAddModal(true);
  };

  const handleDelete = async (doctorId) => {
    if (window.confirm('Are you sure you want to remove this doctor? This action cannot be undone.')) {
      try {
        await clinicManagerService.removeDoctor(doctorId);
        fetchDoctors();
      } catch (error) {
        console.error('Error removing doctor:', error);
      }
    }
  };

  const DoctorCard = ({ doctor }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Dr. {doctor.first_name} {doctor.last_name}
            </h3>
            <p className="text-sm text-gray-600">{doctor.specialization}</p>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full ${
          doctor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {doctor.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Mail className="w-4 h-4 mr-2" />
          {doctor.email}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Phone className="w-4 h-4 mr-2" />
          {doctor.phone || 'Not provided'}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Stethoscope className="w-4 h-4 mr-2" />
          {doctor.license_number}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Award className="w-4 h-4 mr-2" />
          {doctor.years_experience} years experience
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <DollarSign className="w-4 h-4 mr-2" />
          ₱{doctor.consultation_fee} consultation fee
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => handleEdit(doctor)}
          className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
        >
          <Edit2 className="w-3 h-3 mr-1" />
          Edit
        </button>
        <button
          onClick={() => handleDelete(doctor.id)}
          className="flex items-center px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Remove
        </button>
      </div>
    </div>
  );

  if (loading && !doctors.length) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded-lg mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctor Management</h1>
          <p className="text-gray-600">Manage doctors for your clinic</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Doctor
        </button>
      </div>

      {/* Doctors Grid */}
      {doctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first doctor to this clinic.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Doctor
          </button>
        </div>
      )}

      {/* Add/Edit Doctor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                <input
                  type="text"
                  required
                  value={formData.specialization}
                  onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.years_experience}
                    onChange={(e) => setFormData({...formData, years_experience: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee (₱)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.consultation_fee}
                    onChange={(e) => setFormData({...formData, consultation_fee: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingDoctor(null);
                    setFormData({
                      first_name: '',
                      last_name: '',
                      email: '',
                      phone: '',
                      specialization: '',
                      bio: '',
                      license_number: '',
                      years_experience: '',
                      consultation_fee: '',
                      status: 'active'
                    });
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingDoctor ? 'Update Doctor' : 'Add Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorManagement;
