import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, User, Phone, Mail, MapPin, Shield, CheckCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { clinicService } from '../services/api';

const GuestBooking = () => {
  const navigate = useNavigate();
  const { clinicId } = useParams();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({
    clinicId: clinicId ? parseInt(clinicId) : null,
    service: '',
    date: '',
    time: '',
    guestInfo: {
      name: '',
      email: '',
      phone: ''
    }
  });
  const [clinic, setClinic] = useState(null);
  const [services, setServices] = useState([]);

  // Fetch clinic and services data
  useEffect(() => {
    const fetchClinicData = async () => {
      if (!clinicId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch clinic details
        const clinicData = await clinicService.getClinicById(clinicId);
        setClinic(clinicData);
        
        // Fetch clinic-specific services using the same API as clinic manager
        const servicesData = await clinicService.getClinicServices(clinicId);
        setServices(servicesData || []);
      } catch (error) {
        console.error('Error fetching clinic data:', error);
        setClinic(null);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClinicData();
  }, [clinicId]);

  const availableSlots = [
    { date: '2024-12-01', times: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'] },
    { date: '2024-12-02', times: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'] },
    { date: '2024-12-03', times: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'] }
  ];

  const handleServiceSelect = (service) => {
    setBookingData({ ...bookingData, service });
    setStep(2);
  };

  const handleDateTimeSelect = (date, time) => {
    setBookingData({ ...bookingData, date, time });
    setStep(3);
  };

  const handleGuestInfoSubmit = (e) => {
    e.preventDefault();
    // Simulate booking creation
    const bookingId = Math.random().toString(36).substr(2, 9);
    
    // In a real app, this would send an email with magic link
    const magicLink = `/my-appointments/${bookingId}`;
    
    // Store booking data (in real app, this would be in database)
    localStorage.setItem(`booking_${bookingId}`, JSON.stringify({
      ...bookingData,
      id: bookingId,
      clinic,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    }));
    
    navigate(`/booking-confirmation/${bookingId}`);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Select a Service</h2>
        <p className="text-muted-foreground">Choose the type of appointment you need</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => (
          <Card key={service.id} className="cursor-pointer hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="rounded-full bg-primary/10 p-3">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{service.name}</h3>
                  <p className="text-sm text-muted-foreground">{service.description || 'Professional consultation'}</p>
                </div>
              </div>
              <Button 
                className="w-full mt-4" 
                onClick={() => handleServiceSelect(service.name)}
              >
                Select
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Select Date & Time</h2>
        <p className="text-muted-foreground">Choose when you'd like to visit</p>
      </div>
      
      <div className="space-y-4">
        {availableSlots.map((slot) => (
          <Card key={slot.date}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {new Date(slot.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {slot.times.map((time) => (
                  <Button
                    key={time}
                    variant="outline"
                    size="sm"
                    onClick={() => handleDateTimeSelect(slot.date, time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Your Information</h2>
        <p className="text-muted-foreground">No account required - just your basic details</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Booking Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="font-medium">{clinic.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="text-sm text-muted-foreground">{clinic.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">{bookingData.service}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm">{bookingData.date} at {bookingData.time}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleGuestInfoSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            placeholder="Juan Dela Cruz"
            value={bookingData.guestInfo.name}
            onChange={(e) => setBookingData({
              ...bookingData, 
              guestInfo: { ...bookingData.guestInfo, name: e.target.value }
            })}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            placeholder="juan@example.com"
            value={bookingData.guestInfo.email}
            onChange={(e) => setBookingData({
              ...bookingData, 
              guestInfo: { ...bookingData.guestInfo, email: e.target.value }
            })}
            required
          />
          <p className="text-sm text-muted-foreground">
            We'll send a confirmation email with appointment details
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+63 912 345 6789"
            value={bookingData.guestInfo.phone}
            onChange={(e) => setBookingData({
              ...bookingData, 
              guestInfo: { ...bookingData.guestInfo, phone: e.target.value }
            })}
            required
          />
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-success mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">No Account Required</p>
              <p className="text-muted-foreground">
                You'll receive a magic link in your email to manage this appointment
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setStep(2)}
            className="flex-1"
          >
            Back
          </Button>
          <Button type="submit" className="flex-1">
            Confirm Booking
          </Button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-gradient-hero px-4 py-8 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center text-white">
            <h1 className="text-3xl font-bold sm:text-4xl">
              Guest Booking
            </h1>
            <p className="mt-2 text-lg text-white/90">
              Book your appointment without creating an account
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center mb-8">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 1 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
            }`}>
              1
            </div>
            <div className={`w-16 h-1 ${
              step >= 2 ? 'bg-primary' : 'bg-muted'
            }`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 2 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
            }`}>
              2
            </div>
            <div className={`w-16 h-1 ${
              step >= 3 ? 'bg-primary' : 'bg-muted'
            }`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step >= 3 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
            }`}>
              3
            </div>
          </div>

          <Card>
            <CardContent className="p-8">
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GuestBooking;
