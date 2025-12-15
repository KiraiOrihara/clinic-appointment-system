import React, { useState, useEffect } from 'react';
import { Building2, Users, Calendar, DollarSign, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import ClinicSelector from '../../components/ClinicSelector';
import { clinicManagerService } from '../../services/api';

const MultiClinicDashboard = () => {
  const [selectedClinicId, setSelectedClinicId] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedClinicId) {
      fetchDashboardData();
    }
  }, [selectedClinicId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await clinicManagerService.getDashboard();
      setDashboardData(response);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClinicChange = (clinicId) => {
    setSelectedClinicId(clinicId);
  };

  const StatCard = ({ icon: Icon, title, value, change, changeType, color = 'blue' }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className={`flex items-center text-sm ${
              changeType === 'positive' ? 'text-green-600' : 'text-red-600'
            }`}>
              {changeType === 'positive' ? '↑' : '↓'} {change}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  if (loading && !dashboardData) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded-lg mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header with Clinic Selector */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clinic Manager Dashboard</h1>
          <p className="text-gray-600">Manage your clinics and operations</p>
        </div>
        <div className="w-80">
          <ClinicSelector onClinicChange={handleClinicChange} selectedClinicId={selectedClinicId} />
        </div>
      </div>

      {dashboardData && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={Calendar}
              title="Today's Appointments"
              value={dashboardData.stats?.today_appointments || 0}
              color="blue"
            />
            <StatCard
              icon={Clock}
              title="Scheduled"
              value={dashboardData.stats?.pending_approvals || 0}
              color="green"
            />
            <StatCard
              icon={Users}
              title="Total Patients"
              value={dashboardData.stats?.total_appointments || 0}
              color="green"
            />
            <StatCard
              icon={DollarSign}
              title="Today's Revenue"
              value={`$${dashboardData.stats?.revenue_today || 0}`}
              color="purple"
            />
          </div>

          {/* Recent Activity and Notifications */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Appointments */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Appointments</h2>
              </div>
              <div className="p-6">
                {dashboardData.stats?.recent_appointments?.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.stats.recent_appointments.slice(0, 5).map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${
                            appointment.status === 'confirmed' || appointment.status === 'scheduled' ? 'bg-emerald-100' :
                            appointment.status === 'pending' ? 'bg-yellow-100' :
                            appointment.status === 'cancelled' ? 'bg-red-100' : 'bg-gray-100'
                          }`}>
                            {appointment.status === 'confirmed' || appointment.status === 'scheduled' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> :
                             appointment.status === 'pending' ? <Clock className="w-4 h-4 text-yellow-600" /> :
                             appointment.status === 'cancelled' ? <XCircle className="w-4 h-4 text-red-600" /> :
                             <Clock className="w-4 h-4 text-gray-600" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {appointment.user?.first_name} {appointment.user?.last_name}
                            </p>
                            <p className="text-xs text-gray-500">{appointment.appointment_date} at {appointment.appointment_time}</p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          appointment.status === 'confirmed' || appointment.status === 'scheduled' ? 'bg-emerald-100 text-emerald-800' :
                          appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {(appointment.status === 'pending_approval' ? 'scheduled' : appointment.status)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent appointments</p>
                )}
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {/* Scheduled Appointments */}
                  {dashboardData.notifications?.pending_approvals?.length > 0 && (
                    <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Scheduled Visits</p>
                          <p className="text-xs text-gray-600">Ready for today and upcoming dates</p>
                        </div>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">
                        {dashboardData.notifications.pending_approvals.length}
                      </span>
                    </div>
                  )}

                  {/* Today's Appointments */}
                  {dashboardData.notifications?.today_appointments?.length > 0 && (
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Today's Schedule</p>
                          <p className="text-xs text-gray-600">Appointments scheduled for today</p>
                        </div>
                      </div>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {dashboardData.notifications.today_appointments.length}
                      </span>
                    </div>
                  )}

                  {/* Urgent Cancellations */}
                  {dashboardData.notifications?.urgent_cancellations?.length > 0 && (
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <XCircle className="w-5 h-5 text-red-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Urgent Cancellations</p>
                          <p className="text-xs text-gray-600">Recent cancellations requiring attention</p>
                        </div>
                      </div>
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                        {dashboardData.notifications.urgent_cancellations.length}
                      </span>
                    </div>
                  )}

                  {(!dashboardData.notifications?.pending_approvals?.length &&
                    !dashboardData.notifications?.today_appointments?.length &&
                    !dashboardData.notifications?.urgent_cancellations?.length) && (
                    <p className="text-gray-500 text-center py-4">No new notifications</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MultiClinicDashboard;
