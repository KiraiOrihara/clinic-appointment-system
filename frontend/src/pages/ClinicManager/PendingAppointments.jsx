import { useState, useEffect } from 'react';
import { clinicManagerService } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle, XCircle, Calendar, Clock, User, 
  Mail, Phone, AlertCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const PendingAppointments = ({ onRefresh }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectDialog, setRejectDialog] = useState({ open: false, appointment: null, reason: '' });

  useEffect(() => {
    loadPendingAppointments();
  }, []);

  const loadPendingAppointments = async () => {
    try {
      setLoading(true);
      const data = await clinicManagerService.getPendingAppointments();
      setAppointments(data);
    } catch (error) {
      console.error('Failed to load pending appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (appointmentId) => {
    try {
      await clinicManagerService.approveAppointment(appointmentId);
      await loadPendingAppointments();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Failed to approve appointment:', error);
      alert('Failed to approve appointment. Please try again.');
    }
  };

  const handleReject = async () => {
    if (!rejectDialog.reason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      await clinicManagerService.rejectAppointment(
        rejectDialog.appointment.id,
        rejectDialog.reason
      );
      setRejectDialog({ open: false, appointment: null, reason: '' });
      await loadPendingAppointments();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Failed to reject appointment:', error);
      alert('Failed to reject appointment. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    // Handle both "HH:mm:ss" and "HH:mm" formats
    const time = timeString.split(':').slice(0, 2).join(':');
    return time;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Pending Appointments</CardTitle>
          <CardDescription>
            Review and approve or reject appointment requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No pending appointments</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <Card key={appointment.id} className="border-l-4 border-l-yellow-500">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="bg-yellow-50">
                            Pending Approval
                          </Badge>
                          <span className="text-sm font-medium">{appointment.service}</span>
                        </div>
                        
                        <div className="grid gap-2 md:grid-cols-2">
                          <div className="flex items-center space-x-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{formatDate(appointment.appointment_date)}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{formatTime(appointment.appointment_time)}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{appointment.first_name} {appointment.last_name}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{appointment.email}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{appointment.phone}</span>
                          </div>
                        </div>

                        {appointment.reason && (
                          <div className="mt-2 p-2 bg-muted rounded">
                            <p className="text-sm font-medium">Reason:</p>
                            <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(appointment.id)}
                          className="flex items-center space-x-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Approve</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setRejectDialog({ 
                            open: true, 
                            appointment, 
                            reason: '' 
                          })}
                          className="flex items-center space-x-2"
                        >
                          <XCircle className="h-4 w-4" />
                          <span>Reject</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => 
        setRejectDialog({ ...rejectDialog, open })
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Appointment</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this appointment request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Rejection Reason</label>
              <Textarea
                value={rejectDialog.reason}
                onChange={(e) => setRejectDialog({ ...rejectDialog, reason: e.target.value })}
                placeholder="Enter reason for rejection..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setRejectDialog({ open: false, appointment: null, reason: '' })}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Reject Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PendingAppointments;

