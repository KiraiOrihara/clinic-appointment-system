import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, User, Star, Phone, Video, AlertCircle } from "lucide-react";
import { appointmentService } from "@/services/api";
import { 
  Modal, 
  ModalFooter, 
  ModalSection, 
  ModalInfo, 
  ConfirmationModal, 
  FormModal,
  SuccessModal 
} from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const MyAppointments = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [appointments, setAppointments] = useState({ upcoming: [], past: [] });
  const [loading, setLoading] = useState(true);

  // Modal states
  const [rescheduleModal, setRescheduleModal] = useState({ isOpen: false, appointment: null, loading: false });
  const [cancelModal, setCancelModal] = useState({ isOpen: false, appointment: null, loading: false });
  const [reviewModal, setReviewModal] = useState({ isOpen: false, appointment: null });
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', message: '' });

  // Form states
  const [rescheduleForm, setRescheduleForm] = useState({ date: '', time: '' });
  const [reviewForm, setReviewForm] = useState({ rating: '5', review: '' });

  // Fetch appointments from database
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        
        // Get current user from localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        if (!user.id) {
          console.log('No user found, redirecting to login');
          navigate('/login');
          return;
        }
        
        // Fetch user's appointments from database
        const userAppointments = await appointmentService.getUserAppointments();
        
        // Separate upcoming and past appointments
        const now = new Date();
        const upcoming = userAppointments.filter(apt => {
          const aptDate = new Date(apt.appointment_date);
          return aptDate >= now && apt.status !== 'cancelled' && apt.status !== 'completed';
        });
        
        const past = userAppointments.filter(apt => {
          const aptDate = new Date(apt.appointment_date);
          return aptDate < now || apt.status === 'completed';
        });
        
        setAppointments({ upcoming, past });
        
      } catch (error) {
        console.error('Error fetching appointments:', error);
        setAppointments({ upcoming: [], past: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [navigate]);

  // Handle appointment actions
  const handleReschedule = (appointment) => {
    console.log('Reschedule appointment:', appointment);
    setRescheduleModal({ 
      isOpen: true, 
      appointment: appointment,
      form: { date: appointment.appointment_date || '', time: appointment.appointment_time || '' }
    });
  };

  const handleCancel = (appointment) => {
    console.log('Cancel appointment:', appointment);
    setCancelModal({ 
      isOpen: true, 
      appointment: appointment 
    });
  };

  const handleLeaveReview = (appointment) => {
    console.log('Leave review for appointment:', appointment);
    setReviewModal({ 
      isOpen: true, 
      appointment: appointment 
    });
  };

  // Modal action handlers
  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    const { appointment } = rescheduleModal;
    
    try {
      // Show loading state
      setRescheduleModal(prev => ({ ...prev, loading: true }));
      
      // Call real API to reschedule appointment
      const response = await appointmentService.rescheduleAppointment(
        appointment.id,
        rescheduleForm.date,
        rescheduleForm.time
      );
      
      // Close reschedule modal
      setRescheduleModal({ isOpen: false, appointment: null, loading: false });
      
      // Show success modal
      setSuccessModal({
        isOpen: true,
        title: 'Appointment Rescheduled',
        message: `Your appointment at ${appointment.clinic?.name || appointment.clinic_name} has been successfully rescheduled to:\nDate: ${rescheduleForm.date}\nTime: ${rescheduleForm.time}\n\nA confirmation email will be sent to you.`
      });
      
      // Refresh appointments from database to reflect changes
      const updatedAppointments = await appointmentService.getUserAppointments();
      const now = new Date();
      const upcoming = updatedAppointments.filter(apt => {
        const aptDate = new Date(apt.appointment_date);
        return aptDate >= now && apt.status !== 'cancelled' && apt.status !== 'completed';
      });
      const past = updatedAppointments.filter(apt => {
        const aptDate = new Date(apt.appointment_date);
        return aptDate < now || apt.status === 'completed';
      });
      
      setAppointments({ upcoming, past });
      
    } catch (error) {
      console.error('Reschedule error:', error);
      setRescheduleModal(prev => ({ ...prev, loading: false }));
      
      // Show error modal
      setSuccessModal({
        isOpen: true,
        title: 'Reschedule Failed',
        message: `Failed to reschedule appointment: ${error.message}\n\nPlease try again or contact support.`
      });
    }
  };

  const handleCancelConfirm = async () => {
    const { appointment } = cancelModal;
    
    try {
      // Show loading state
      setCancelModal(prev => ({ ...prev, loading: true }));
      
      // Call real API to cancel appointment
      const response = await appointmentService.cancelAppointment(appointment.id);
      
      // Close cancel modal
      setCancelModal({ isOpen: false, appointment: null, loading: false });
      
      // Show success modal
      setSuccessModal({
        isOpen: true,
        title: 'Appointment Cancelled',
        message: `Your appointment at ${appointment.clinic?.name || appointment.clinic_name} on ${appointment.appointment_date} has been cancelled.\n\nA cancellation confirmation will be sent to your email.`
      });
      
      // Refresh appointments from database to reflect changes
      const updatedAppointments = await appointmentService.getUserAppointments();
      const now = new Date();
      const upcoming = updatedAppointments.filter(apt => {
        const aptDate = new Date(apt.appointment_date);
        return aptDate >= now && apt.status !== 'cancelled' && apt.status !== 'completed';
      });
      const past = updatedAppointments.filter(apt => {
        const aptDate = new Date(apt.appointment_date);
        return aptDate < now || apt.status === 'completed' || apt.status === 'cancelled';
      });
      
      setAppointments({ upcoming, past });
      
    } catch (error) {
      console.error('Cancel error:', error);
      setCancelModal(prev => ({ ...prev, loading: false }));
      
      // Show error modal
      setSuccessModal({
        isOpen: true,
        title: 'Cancellation Failed',
        message: `Failed to cancel appointment: ${error.message}\n\nPlease try again or contact support.`
      });
    }
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    const { appointment } = reviewModal;
    
    // Simulate API call
    setReviewModal({ isOpen: false, appointment: null });
    setSuccessModal({
      isOpen: true,
      title: 'Review Submitted',
      message: `Thank you for your review of ${appointment.clinic?.name || appointment.clinic_name}!\n\nRating: ${reviewForm.rating} stars\nReview: "${reviewForm.review}"\n\nYour feedback helps us improve our services.`
    });
  };

  const AppointmentCard = ({ appointment, isUpcoming }) => (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{appointment.clinic?.name || appointment.clinic_name || 'Unknown Clinic'}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <User className="h-4 w-4" />
              {appointment.service || 'General Consultation'}
            </CardDescription>
          </div>
          <Badge 
            variant={appointment.status === 'approved' || appointment.status === 'confirmed' ? 'default' : 
                    appointment.status === 'completed' ? 'secondary' : 
                    appointment.status === 'scheduled' || appointment.status === 'pending_approval' ? 'default' : 'destructive'}
            style={appointment.status === 'scheduled' || appointment.status === 'pending_approval' ? { backgroundColor: '#22c55e', color: 'white' } : {}}
          >
            {appointment.status === 'approved' || appointment.status === 'confirmed' ? 'Confirmed' : 
             appointment.status === 'completed' ? 'Completed' : 
             appointment.status === 'scheduled' || appointment.status === 'pending_approval' ? 'Scheduled' : 
             appointment.status || 'Pending'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {appointment.appointment_date ? new Date(appointment.appointment_date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }) : 'Date not set'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{appointment.appointment_time || 'Time not set'}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {(() => {
                const address = appointment.clinic_address || '';
                // Replace New York addresses with Mati City equivalents
                if (address.includes('New York') || address.includes('NY')) {
                  // Map clinic names to Mati City addresses
                  const clinicAddressMap = {
                    'City Medical Center': 'Poblacion, Mati City, Davao Oriental',
                    'Family Health Clinic': 'Don Martiniano Street, Poblacion, Mati City, Davao Oriental',
                    'Specialty Care Center': 'National Highway, Poblacion, Mati City, Davao Oriental',
                    'Davao Oriental Provincial Medical Center': 'Poblacion, Mati City, Davao Oriental',
                    'St. Camillus Hospital of Mati Foundation': 'Don Martiniano Street, Poblacion, Mati City, Davao Oriental',
                    'Mati Medical Specialist & Diagnostic Center': 'National Highway, Poblacion, Mati City, Davao Oriental',
                    'Mati City Health Office': 'City Hall Compound, Poblacion, Mati City, Davao Oriental',
                    'Mati Doctors Hospital': 'Rizal Street, Poblacion, Mati City, Davao Oriental',
                    'Davao Oriental Medical Clinic': 'National Highway, Mati City, Davao Oriental'
                  };
                  return clinicAddressMap[appointment.clinic?.name || appointment.clinic_name] || 'Mati City, Davao Oriental';
                }
                return address || 'Mati City, Davao Oriental';
              })()}
            </span>
          </div>
          {appointment.phone && appointment.phone !== 'N/A' && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{appointment.phone}</span>
            </div>
          )}
        </div>
        
        {appointment.reason && (
          <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
            <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Reason</p>
              <p className="text-sm text-muted-foreground">{appointment.reason}</p>
            </div>
          </div>
        )}
        
        {!isUpcoming && appointment.status === 'completed' && (
          <div className="flex items-center gap-2 pt-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <Button variant="outline" size="sm" onClick={() => handleLeaveReview(appointment)}>Leave Review</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">Loading appointments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">My Appointments</h1>
          <p className="text-muted-foreground">Manage your upcoming and past appointments</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">
              Upcoming ({appointments.upcoming.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({appointments.past.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-6">
            {appointments.upcoming.length > 0 ? (
              appointments.upcoming.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} isUpcoming={true} />
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No upcoming appointments</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    You don't have any upcoming appointments scheduled.
                  </p>
                  <Button onClick={() => window.location.href = '/find-clinics'}>
                    Book an Appointment
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            {appointments.past.length > 0 ? (
              appointments.past.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} isUpcoming={false} />
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No past appointments</h3>
                  <p className="text-muted-foreground text-center">
                    Your appointment history will appear here once you have completed appointments.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Reschedule Modal */}
      <FormModal
        isOpen={rescheduleModal.isOpen}
        onClose={() => setRescheduleModal({ isOpen: false, appointment: null, loading: false })}
        title="Reschedule Appointment"
        onSubmit={handleRescheduleSubmit}
        onCancel={() => setRescheduleModal({ isOpen: false, appointment: null, loading: false })}
        submitText={rescheduleModal.loading ? "Rescheduling..." : "Reschedule"}
        cancelText="Cancel"
        disabled={rescheduleModal.loading}
      >
        <ModalSection title="Appointment Details">
          <ModalInfo label="Clinic" value={rescheduleModal.appointment?.clinic?.name || rescheduleModal.appointment?.clinic_name || ''} />
          <ModalInfo label="Service" value={rescheduleModal.appointment?.service || 'General Consultation'} />
          <ModalInfo label="Current Date" value={rescheduleModal.appointment?.appointment_date || ''} />
          <ModalInfo label="Current Time" value={rescheduleModal.appointment?.appointment_time || ''} />
        </ModalSection>
        
        <ModalSection title="New Schedule">
          <div className="space-y-4">
            <div>
              <Label htmlFor="reschedule-date">New Date</Label>
              <Input
                id="reschedule-date"
                type="date"
                value={rescheduleForm.date}
                onChange={(e) => setRescheduleForm(prev => ({ ...prev, date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div>
              <Label htmlFor="reschedule-time">New Time</Label>
              <Input
                id="reschedule-time"
                type="time"
                value={rescheduleForm.time}
                onChange={(e) => setRescheduleForm(prev => ({ ...prev, time: e.target.value }))}
                required
              />
            </div>
          </div>
        </ModalSection>
      </FormModal>

      {/* Cancel Confirmation Modal */}
      <ConfirmationModal
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal({ isOpen: false, appointment: null, loading: false })}
        title="Cancel Appointment"
        message={`Are you sure you want to cancel your appointment at ${cancelModal.appointment?.clinic?.name || cancelModal.appointment?.clinic_name} on ${cancelModal.appointment?.appointment_date} at ${cancelModal.appointment?.appointment_time}?\n\nThis action cannot be undone and you will need to book a new appointment if you need care.`}
        onConfirm={handleCancelConfirm}
        onCancel={() => setCancelModal({ isOpen: false, appointment: null, loading: false })}
        confirmText={cancelModal.loading ? "Cancelling..." : "Cancel Appointment"}
        cancelText="Keep Appointment"
        variant="danger"
        disabled={cancelModal.loading}
      />

      {/* Review Modal */}
      <FormModal
        isOpen={reviewModal.isOpen}
        onClose={() => setReviewModal({ isOpen: false, appointment: null })}
        title="Leave a Review"
        onSubmit={handleReviewSubmit}
        onCancel={() => setReviewModal({ isOpen: false, appointment: null })}
        submitText="Submit Review"
        cancelText="Cancel"
      >
        <ModalSection title="Appointment Information">
          <ModalInfo label="Clinic" value={reviewModal.appointment?.clinic?.name || reviewModal.appointment?.clinic_name || ''} />
          <ModalInfo label="Service" value={reviewModal.appointment?.service || 'General Consultation'} />
          <ModalInfo label="Date" value={reviewModal.appointment?.appointment_date || ''} />
        </ModalSection>
        
        <ModalSection title="Your Review">
          <div className="space-y-4">
            <div>
              <Label htmlFor="rating">Rating</Label>
              <select
                id="rating"
                value={reviewForm.rating}
                onChange={(e) => setReviewForm(prev => ({ ...prev, rating: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
                <option value="4">⭐⭐⭐⭐ Good</option>
                <option value="3">⭐⭐⭐ Average</option>
                <option value="2">⭐⭐ Poor</option>
                <option value="1">⭐ Very Poor</option>
              </select>
            </div>
            <div>
              <Label htmlFor="review">Your Review</Label>
              <Textarea
                id="review"
                value={reviewForm.review}
                onChange={(e) => setReviewForm(prev => ({ ...prev, review: e.target.value }))}
                placeholder="Share your experience with this clinic..."
                rows={4}
                required
              />
            </div>
          </div>
        </ModalSection>
      </FormModal>

      {/* Success Modal */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, title: '', message: '' })}
        onConfirm={() => setSuccessModal({ isOpen: false, title: '', message: '' })}
        title={successModal.title}
        message={successModal.message}
        confirmText="OK"
      />
    </div>
  );
};

export default MyAppointments;
