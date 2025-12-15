import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, Filter, Search } from 'lucide-react';
import { clinicManagerService } from '../../services/api';

const ClinicAppointments = ({ clinicId }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    date: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0
  });

  useEffect(() => {
    if (clinicId) {
      fetchAppointments();
    }
  }, [clinicId, filters]);

  const normalizeStatus = (status) => {
    if (status === 'pending_approval') return 'scheduled';
    return status;
  };

  const extractAppointments = (response) => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response.appointments)) return response.appointments;
    if (Array.isArray(response.results)) return response.results;
    return [];
  };

  const fetchAppointments = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        per_page: pagination.per_page,
        clinic_id: clinicId
      };
      if (filters.date) params.date = filters.date;

      const response = await clinicManagerService.getAppointments(params);
      const rawAppointments = extractAppointments(response);
      const normalized = rawAppointments.map((appt) => ({
        ...appt,
        status: normalizeStatus(appt.status)
      }));

      const searched = filters.search
        ? normalized.filter((appt) => {
            const fullName = `${appt.user?.first_name || ''} ${appt.user?.last_name || ''}`.toLowerCase();
            return fullName.includes(filters.search.toLowerCase());
          })
        : normalized;

      if (Array.isArray(response?.data) || Array.isArray(response?.appointments)) {
        setAppointments(searched);
        setPagination({
          current_page: response.current_page || response.meta?.current_page || 1,
          last_page: response.last_page || response.meta?.last_page || 1,
          per_page: response.per_page || response.meta?.per_page || 20,
          total: response.total || response.meta?.total || searched.length
        });
      } else {
        setAppointments(searched);
        setPagination({
          current_page: 1,
          last_page: 1,
          per_page: searched.length || 0,
          total: searched.length || 0
        });
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApprove = async (appointmentId) => {
    try {
      await clinicManagerService.approveAppointment(appointmentId);
      fetchAppointments(pagination.current_page);
    } catch (error) {
      console.error('Error approving appointment:', error);
    }
  };

  const handleReject = async (appointmentId) => {
    const reason = prompt('Please enter rejection reason:');
    if (reason) {
      try {
        await clinicManagerService.rejectAppointment(appointmentId, { reason });
        fetchAppointments(pagination.current_page);
      } catch (error) {
        console.error('Error rejecting appointment:', error);
      }
    }
  };

  
  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-green-100 text-green-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'checked_in': return 'bg-indigo-100 text-indigo-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled': return <CheckCircle className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'checked_in': return <Clock className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const AppointmentCard = ({ appointment }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {appointment.first_name} {appointment.last_name}
            </h3>
            <p className="text-sm text-gray-600">{appointment.email}</p>
          </div>
        </div>
        <span className={`inline-flex items-center px-3 py-1 text-sm rounded-full ${getStatusColor(appointment.status)}`}>
          {getStatusIcon(appointment.status)}
          <span className="ml-1">{appointment.status.replace('_', ' ').toUpperCase()}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          {appointment.appointment_date}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-2" />
          {appointment.appointment_time}
        </div>
        <div className="text-sm text-gray-600">
          {appointment.service || 'General Consultation'}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-1">Reason for visit:</p>
        <p className="text-sm text-gray-600">{appointment.reason}</p>
      </div>
    </div>
  );

  if (loading && !appointments.length) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded-lg mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Appointment Management</h1>
        <p className="text-gray-600">Manage appointments for your clinic</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center">
            <Filter className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>

          <input
            type="date"
            value={filters.date}
            onChange={(e) => handleFilterChange('date', e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Select date"
          />

          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search by patient name..."
                className="w-full pl-10 pr-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            onClick={() => setFilters({ date: '', search: '' })}
            className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Appointments List */}
      {appointments.length > 0 ? (
        <>
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.last_page > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                Showing {appointments.length} of {pagination.total} appointments
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => fetchAppointments(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm">
                  Page {pagination.current_page} of {pagination.last_page}
                </span>
                <button
                  onClick={() => fetchAppointments(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.last_page}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
          <p className="text-gray-600">
            {Object.values(filters).some(v => v) 
              ? 'Try adjusting your filters to see more results.' 
              : 'There are no appointments scheduled for this clinic.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ClinicAppointments;
