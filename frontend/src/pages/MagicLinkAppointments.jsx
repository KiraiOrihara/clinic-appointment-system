import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Shield, 
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Download
} from 'lucide-react';

const MagicLinkAppointments = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from API using the magic link
    const storedBooking = localStorage.getItem(`booking_${bookingId}`);
    if (storedBooking) {
      setBooking(JSON.parse(storedBooking));
    }
    setLoading(false);
  }, [bookingId]);

  const handleCancelAppointment = () => {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      // In a real app, this would call an API
      const updatedBooking = { ...booking, status: 'cancelled' };
      setBooking(updatedBooking);
      localStorage.setItem(`booking_${bookingId}`, JSON.stringify(updatedBooking));
      alert('Appointment cancelled successfully');
    }
  };

  const handleReschedule = () => {
    // In a real app, this would navigate to rescheduling flow
    alert('Rescheduling feature would open here');
  };

  const handleDownloadReceipt = () => {
    // In a real app, this would generate a PDF
    alert('Receipt download would start here');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading your appointment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="rounded-full bg-destructive/10 p-3 w-16 h-16 mx-auto mb-4">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Link Expired</h2>
            <p className="text-muted-foreground mb-4">
              This magic link has expired or is invalid.
            </p>
            <Button onClick={() => navigate('/')}>Return to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-success">Confirmed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'completed':
        return <Badge className="bg-info">Completed</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-gradient-hero px-4 py-8 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center text-white">
            <h1 className="text-3xl font-bold sm:text-4xl">
              My Appointment
            </h1>
            <p className="mt-2 text-lg text-white/90">
              Manage your appointment - no login required
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Appointment Details</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <div className="space-y-6">
                {/* Status Card */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold">Booking Reference</h2>
                        <p className="text-2xl font-mono text-primary">{booking.id}</p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(booking.status)}
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Clinic & Service Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Clinic & Service
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold mb-2">{booking.clinic.name}</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{booking.clinic.address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>(082) 123-4567</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>info@clinic.com</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Service Details</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{booking.service}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{booking.date} at {booking.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>Dr. Maria Santos</span>
                          </div>
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
              </div>
            </TabsContent>

            <TabsContent value="actions">
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>
                      Manage your appointment with these options
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button 
                        onClick={handleReschedule} 
                        className="w-full"
                        disabled={booking.status !== 'confirmed'}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Reschedule Appointment
                      </Button>
                      <Button 
                        onClick={handleCancelAppointment} 
                        variant="destructive"
                        className="w-full"
                        disabled={booking.status !== 'confirmed'}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Cancel Appointment
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button variant="outline" className="w-full">
                        <Phone className="h-4 w-4 mr-2" />
                        Call Clinic
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Mail className="h-4 w-4 mr-2" />
                        Email Clinic
                      </Button>
                    </div>

                    <Button 
                      onClick={handleDownloadReceipt} 
                      variant="outline" 
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Receipt
                    </Button>
                  </CardContent>
                </Card>

                {/* Important Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                  Important Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Before Your Visit</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Arrive 15 minutes early for registration</li>
                      <li>• Bring a valid ID and insurance card</li>
                      <li>• List any medications you're currently taking</li>
                      <li>• Bring any relevant medical records</li>
                    </ul>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Cancellation Policy</h4>
                    <p className="text-sm text-muted-foreground">
                      Free cancellation up to 24 hours before your appointment. 
                      Late cancellations may incur a fee.
                    </p>
                  </div>
                </CardContent>
              </Card>
              </div>
            </TabsContent>

            <TabsContent value="history">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Appointment History</CardTitle>
                    <CardDescription>
                      Timeline of your appointment activities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-success p-1">
                          <CheckCircle className="h-3 w-3 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">Appointment Confirmed</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(booking.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-primary p-1">
                          <Mail className="h-3 w-3 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">Confirmation Email Sent</p>
                          <p className="text-sm text-muted-foreground">
                            Magic link sent to {booking.guestInfo.email}
                          </p>
                        </div>
                      </div>

                      {booking.status === 'cancelled' && (
                        <div className="flex items-start gap-3">
                          <div className="rounded-full bg-destructive p-1">
                            <XCircle className="h-3 w-3 text-white" />
                          </div>
                          <div>
                            <p className="font-medium">Appointment Cancelled</p>
                            <p className="text-sm text-muted-foreground">
                              Cancelled by patient
                            </p>
                          </div>
                        </div>
                      )}

                      {booking.status === 'completed' && (
                        <div className="flex items-start gap-3">
                          <div className="rounded-full bg-info p-1">
                            <CheckCircle className="h-3 w-3 text-white" />
                          </div>
                          <div>
                            <p className="font-medium">Appointment Completed</p>
                            <p className="text-sm text-muted-foreground">
                              Service provided successfully
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default MagicLinkAppointments;
