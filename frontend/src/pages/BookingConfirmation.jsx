import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Shield, 
  CheckCircle,
  Printer,
  Share
} from 'lucide-react';

const BookingConfirmation = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    // In a real app, this would fetch from API
    const storedBooking = localStorage.getItem(`booking_${bookingId}`);
    if (storedBooking) {
      setBooking(JSON.parse(storedBooking));
    }
  }, [bookingId]);

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="rounded-full bg-destructive/10 p-3 w-16 h-16 mx-auto mb-4">
              <Shield className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Booking Not Found</h2>
            <p className="text-muted-foreground mb-4">
              This booking confirmation link is invalid or has expired.
            </p>
            <Button onClick={() => navigate('/')}>Return to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleManageAppointment = () => {
    navigate(`/my-appointments/${bookingId}`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Appointment Confirmation',
        text: `My appointment at ${booking.clinic.name} on ${booking.date}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-gradient-success px-4 py-8 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center text-white">
            <div className="rounded-full bg-white/20 p-3 w-16 h-16 mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold sm:text-4xl">
              Booking Confirmed!
            </h1>
            <p className="mt-2 text-lg text-white/90">
              Your appointment has been successfully scheduled
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Details */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Booking Reference */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Booking Reference</h2>
                  <p className="text-2xl font-mono text-primary">{booking.id}</p>
                </div>
                <Badge className="bg-success">Confirmed</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Appointment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Appointment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium">{booking.clinic.name}</p>
                      <p className="text-sm text-muted-foreground">{booking.service}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{booking.clinic.address}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {new Date(booking.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{booking.time}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{booking.guestInfo.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{booking.guestInfo.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{booking.guestInfo.phone}</span>
              </div>
            </CardContent>
          </Card>

          {/* Important Information */}
          <Card>
            <CardHeader>
              <CardTitle>Important Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Magic Link Sent</h4>
                <p className="text-sm text-muted-foreground">
                  A confirmation email with a magic link has been sent to {booking.guestInfo.email}. 
                  Use this link to manage your appointment - no login required!
                </p>
              </div>
              
              <div className="space-y-2 text-sm">
                <h4 className="font-medium">Before Your Visit:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Arrive 15 minutes early for registration</li>
                  <li>• Bring a valid ID and insurance card (if applicable)</li>
                  <li>• List any medications you're currently taking</li>
                  <li>• Bring any relevant medical records</li>
                </ul>
              </div>

              <div className="space-y-2 text-sm">
                <h4 className="font-medium">Cancellation Policy:</h4>
                <p className="text-muted-foreground">
                  Free cancellation up to 24 hours before your appointment. 
                  Late cancellations may incur a fee.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={handleManageAppointment} className="flex-1">
              Manage Appointment
            </Button>
            <Button onClick={handleShare} variant="outline" className="flex-1">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button onClick={handlePrint} variant="outline" className="flex-1">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>

          {/* Additional Options */}
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold mb-2">Need Help?</h3>
              <p className="text-muted-foreground mb-4">
                Contact the clinic directly if you have questions about your appointment.
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="outline" size="sm">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Clinic
                </Button>
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
