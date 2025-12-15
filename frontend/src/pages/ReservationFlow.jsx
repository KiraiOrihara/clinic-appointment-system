import { useState, useEffect } from 'react'
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom'
import { MapPin, Phone, Calendar, Clock, User, Mail, Shield, CheckCircle, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { appointmentService, clinicService } from '@/services/api'

const ReservationFlow = () => {
  const { clinicId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { date, time } = location.state || {}
  
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    service: '',
    serviceId: null,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    reason: '',
    insurance: '',
    emergencyContact: '',
    emergencyPhone: '',
    selectedDate: date || '',
    selectedTime: time || ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [clinic, setClinic] = useState(null)
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [validationErrors, setValidationErrors] = useState({})
  const [timeSlotConflict, setTimeSlotConflict] = useState({ isOpen: false, details: null })
  const isClinicClosed = clinic && !['open'].includes((clinic.status || '').toLowerCase())

  // Fetch clinic data and services
  useEffect(() => {
    const fetchClinicData = async () => {
      try {
        setLoading(true)
        // Fetch clinic details
        const clinicData = await clinicService.getClinicById(clinicId)
        setClinic(clinicData)
        
        // Fetch clinic-specific services via public clinic endpoint (no auth required)
        const servicesResponse = await clinicService.getClinicServices(clinicId);
        const servicesData = servicesResponse?.services || servicesResponse || [];
        setServices(servicesData || []);
      } catch (error) {
        console.error('Error fetching clinic data:', error)
        // Fallback to default clinic
        setClinic({
          id: parseInt(clinicId),
          name: 'Clinic',
          address: '',
          phone: ''
        })
        setServices([])
      } finally {
        setLoading(false)
      }
    }
    
    if (clinicId) {
      fetchClinicData()
    }
  }, [clinicId])

  const insuranceOptions = [
    'PhilHealth',
    'Maxicare',
    'MediCard',
    'Intellicare',
    'None'
  ]

  const availableTimeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM'
  ]

  // Get today's date for min date attribute
  const today = new Date().toISOString().split('T')[0]

  // Validation functions
  const validateDateTimeFields = () => {
    const errors = {}
    
    if (!formData.selectedDate) {
      errors.selectedDate = 'Please select an appointment date'
    }
    
    if (!formData.selectedTime) {
      errors.selectedTime = 'Please select an appointment time'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validatePersonalInfoFields = () => {
    const errors = {}
    
    if (!formData.firstName || formData.firstName.trim() === '') {
      errors.firstName = 'Please enter your first name'
    }
    
    if (!formData.lastName || formData.lastName.trim() === '') {
      errors.lastName = 'Please enter your last name'
    }
    
    if (!formData.email || formData.email.trim() === '') {
      errors.email = 'Please enter your email address'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }
    
    if (!formData.dateOfBirth) {
      errors.dateOfBirth = 'Please enter your date of birth'
    }
    
    if (!formData.insurance) {
      errors.insurance = 'Please select an insurance option'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const isDateTimeValid = () => {
    return formData.selectedDate && formData.selectedTime
  }

  const isPersonalInfoValid = () => {
    return formData.firstName && 
           formData.lastName && 
           formData.email && 
           formData.dateOfBirth &&
           formData.insurance &&
           /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: ''
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      if (isClinicClosed) {
        alert('This clinic is currently closed. Booking is unavailable.')
        setIsSubmitting(false)
        return
      }
      // Get current user from localStorage (optional for guest booking)
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Guest booking - no login required
      
      // Validate required fields
      if (!formData.selectedDate) {
        alert('Please select an appointment date');
        setIsSubmitting(false);
        return;
      }
      if (!formData.selectedTime) {
        alert('Please select an appointment time');
        setIsSubmitting(false);
        return;
      }
      if (!formData.service) {
        alert('Please select a service');
        setIsSubmitting(false);
        return;
      }

      // Convert time from 12-hour format (2:30 PM) to 24-hour format (14:30)
      const convertTo24Hour = (time12h) => {
        if (!time12h) return null;
        const [time, modifier] = time12h.split(' ');
        let [hours, minutes] = time.split(':');
        if (hours === '12') {
          hours = '00';
        }
        if (modifier === 'PM') {
          hours = parseInt(hours, 10) + 12;
        }
        return `${hours.toString().padStart(2, '0')}:${minutes || '00'}`;
      };

      // Create appointment data using backend's expected camelCase payload
      const appointmentData = {
        clinicId: parseInt(clinicId, 10),
        service: formData.service, // required
        date: formData.selectedDate, // required
        time: convertTo24Hour(formData.selectedTime) || formData.selectedTime, // required
        firstName: formData.firstName || user.firstName || '',
        lastName: formData.lastName || user.lastName || '',
        email: formData.email || user.email, // required
        phone: formData.phone || user.phone || null,
        dateOfBirth: formData.dateOfBirth || null,
        reason: formData.reason || formData.service || '',
        insurance: formData.insurance || null,
      };
      
      // Debug logging
      console.log('📧 Appointment Data Being Sent:');
      console.log('   Clinic ID:', appointmentData.clinicId);
      console.log('   Service:', appointmentData.service);
      console.log('   Date:', appointmentData.appointment_date);
      console.log('   Time:', appointmentData.appointment_time);
      console.log('   Email:', appointmentData.email);
      console.log('   Full data:', appointmentData);
      
      // Save appointment to database
      const response = await appointmentService.bookAppointment(appointmentData);
      
      if (response) {
        setCurrentStep(4); // Success step
      } else {
        alert('Failed to create appointment. Please try again.');
      }
      
    } catch (error) {
      console.error('Error creating appointment:', error);
      const errorMessage = error.message || 'Failed to create appointment';
      const detailedError = error.response?.data?.error || errorMessage;
      
      // Handle time slot conflict specifically
      if (error.response?.data?.error === 'time_slot_conflict') {
        setTimeSlotConflict({
          isOpen: true,
          details: error.response.data.details
        });
      } else {
        console.error('Detailed error:', detailedError);
        alert(`Error creating appointment: ${detailedError}. Please check the console for more details.`);
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => {
    // Prevent navigation if clinic is closed
    if (isClinicClosed) {
      alert('This clinic is currently closed. Booking is unavailable.')
      return
    }
    
    // Validate date and time fields for step 1
    if (currentStep === 1) {
      if (!validateDateTimeFields()) {
        return // Don't proceed if validation fails
      }
    }
    
    // Validate personal information fields for step 2
    if (currentStep === 2) {
      if (!validatePersonalInfoFields()) {
        return // Don't proceed if validation fails
      }
    }
    
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const steps = [
    { id: 1, title: 'Service Selection', description: 'Choose your appointment type' },
    { id: 2, title: 'Personal Information', description: 'Provide your details' },
    { id: 3, title: 'Confirmation', description: 'Review and book' },
    { id: 4, title: 'Success', description: 'Appointment confirmed' }
  ]

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
            <div>
              <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem'}}>Select Service</h3>
              {loading ? (
                <div style={{textAlign: 'center', padding: '2rem'}}>Loading services...</div>
              ) : services.length === 0 ? (
                <div style={{textAlign: 'center', padding: '2rem', color: '#6b7280'}}>No services available for this clinic.</div>
              ) : (
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem'}}>
                  {services.map(service => (
                    <button
                      key={service.id || service.name}
                      onClick={() => setFormData({...formData, service: service.name, serviceId: service.id})}
                      style={{
                        padding: '1rem',
                        border: formData.service === service.name ? '2px solid #2563eb' : '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        backgroundColor: formData.service === service.name ? '#eff6ff' : 'white',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <CheckCircle style={{height: '1rem', width: '1rem', color: formData.service === service.name ? '#2563eb' : '#d1d5db'}} />
                        <div>
                          <span style={{fontSize: '0.875rem', fontWeight: '500', color: '#374151', display: 'block'}}>{service.name}</span>
                          {service.description && (
                            <span style={{fontSize: '0.75rem', color: '#6b7280', display: 'block', marginTop: '0.25rem'}}>{service.description}</span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem'}}>Select Date & Time</h3>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem'}}>
                <div>
                  <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem'}}>Preferred Date</label>
                  <Input
                    name="selectedDate"
                    type="date"
                    value={formData.selectedDate}
                    onChange={handleInputChange}
                    min={today}
                    style={{
                      width: '100%',
                      border: validationErrors.selectedDate ? '2px solid #ef4444' : '1px solid #d1d5db'
                    }}
                  />
                  {validationErrors.selectedDate && (
                    <div style={{color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem'}}>
                      {validationErrors.selectedDate}
                    </div>
                  )}
                </div>
                <div>
                  <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem'}}>Preferred Time</label>
                  <select
                    name="selectedTime"
                    value={formData.selectedTime}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: validationErrors.selectedTime ? '2px solid #ef4444' : '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      color: validationErrors.selectedTime ? '#ef4444' : '#374151'
                    }}
                  >
                    <option value="">Select a time</option>
                    {availableTimeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                  {validationErrors.selectedTime && (
                    <div style={{color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem'}}>
                      {validationErrors.selectedTime}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        )

      case 2:
        return (
          <div style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
            <div>
              <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem'}}>Personal Information</h3>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem'}}>
                <div>
                  <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem'}}>First Name</label>
                  <Input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter first name"
                    style={{
                      width: '100%',
                      border: validationErrors.firstName ? '2px solid #ef4444' : '1px solid #d1d5db'
                    }}
                  />
                  {validationErrors.firstName && (
                    <div style={{color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem'}}>
                      {validationErrors.firstName}
                    </div>
                  )}
                </div>
                <div>
                  <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem'}}>Last Name</label>
                  <Input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter last name"
                    style={{
                      width: '100%',
                      border: validationErrors.lastName ? '2px solid #ef4444' : '1px solid #d1d5db'
                    }}
                  />
                  {validationErrors.lastName && (
                    <div style={{color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem'}}>
                      {validationErrors.lastName}
                    </div>
                  )}
                </div>
                <div>
                  <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem'}}>Email</label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email"
                    style={{
                      width: '100%',
                      border: validationErrors.email ? '2px solid #ef4444' : '1px solid #d1d5db'
                    }}
                  />
                  {validationErrors.email && (
                    <div style={{color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem'}}>
                      {validationErrors.email}
                    </div>
                  )}
                </div>
                <div>
                  <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem'}}>Date of Birth</label>
                  <Input
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    placeholder="dd/mm/yyyy"
                    style={{
                      width: '100%',
                      border: validationErrors.dateOfBirth ? '2px solid #ef4444' : '1px solid #d1d5db'
                    }}
                  />
                  {validationErrors.dateOfBirth && (
                    <div style={{color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem'}}>
                      {validationErrors.dateOfBirth}
                    </div>
                  )}
                </div>
                <div>
                  <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem'}}>Address</label>
                  <Input
                    name="address"
                    value={formData.address || ''}
                    onChange={handleInputChange}
                    placeholder="Enter your address"
                    style={{
                      width: '100%',
                      border: validationErrors.address ? '2px solid #ef4444' : '1px solid #d1d5db'
                    }}
                  />
                  {validationErrors.address && (
                    <div style={{color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem'}}>
                      {validationErrors.address}
                    </div>
                  )}
                </div>
                <div>
                  <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem'}}>Insurance</label>
                  <select
                    name="insurance"
                    value={formData.insurance}
                    onChange={handleInputChange}
                    style={{
                      width: '100%', 
                      padding: '0.5rem', 
                      border: validationErrors.insurance ? '2px solid #ef4444' : '1px solid #e5e7eb', 
                      borderRadius: '0.375rem', 
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="">Select insurance</option>
                    {insuranceOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  {validationErrors.insurance && (
                    <div style={{color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem'}}>
                      {validationErrors.insurance}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem'}}>Reason for Visit</h3>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                placeholder="Please describe your symptoms or reason for visit..."
                style={{
                  width: '100%', 
                  minHeight: '100px', 
                  padding: '0.75rem', 
                  border: validationErrors.reason ? '2px solid #ef4444' : '1px solid #e5e7eb', 
                  borderRadius: '0.5rem', 
                  resize: 'vertical'
                }}
              />
              {validationErrors.reason && (
                <div style={{color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem'}}>
                  {validationErrors.reason}
                </div>
              )}
            </div>

          </div>
        )

      case 3:
        return (
          <div style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
            <div>
              <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem'}}>Review Your Appointment</h3>
              
              <div style={{backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', border: '1px solid #e5e7eb', marginBottom: '1rem'}}>
                <h4 style={{fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '1rem'}}>Clinic Information</h4>
                <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                  <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                    <strong>Clinic:</strong> {clinic?.name || 'Loading...'}
                  </div>
                  <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                    <strong>Address:</strong> {clinic?.address || 'Loading...'}
                  </div>
                  <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                    <strong>Phone:</strong> {clinic?.phone || 'Loading...'}
                  </div>
                </div>
              </div>

              <div style={{backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', border: '1px solid #e5e7eb'}}>
                <h4 style={{fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '1rem'}}>Personal Information</h4>
                <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                  <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                    <strong>Name:</strong> {formData.firstName} {formData.lastName}
                  </div>
                  <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                    <strong>Email:</strong> {formData.email}
                  </div>
                  <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                    <strong>Date of Birth:</strong> {formData.dateOfBirth || 'Not specified'}
                  </div>
                  <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                    <strong>Address:</strong> {formData.address || 'Not specified'}
                  </div>
                  <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                    <strong>Insurance:</strong> {formData.insurance || 'Not specified'}
                  </div>
                </div>
              </div>
            </div>

            <div style={{backgroundColor: '#fef3c7', borderRadius: '0.5rem', padding: '1rem', border: '1px solid #f59e0b'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem'}}>
                <AlertCircle style={{height: '1rem', width: '1rem', color: '#d97706'}} />
                <span style={{fontSize: '0.875rem', fontWeight: '600', color: '#92400e'}}>Important Information</span>
              </div>
              <ul style={{fontSize: '0.875rem', color: '#92400e', margin: 0, paddingLeft: '1.5rem'}}>
                <li>Please arrive 15 minutes before your appointment</li>
                <li>Bring valid ID and insurance card</li>
                <li>Cancellation must be made at least 24 hours in advance</li>
              </ul>
            </div>
          </div>
        )

      case 4:
        return (
          <div style={{textAlign: 'center', padding: '2rem'}}>
            <div style={{width: '4rem', height: '4rem', backgroundColor: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem'}}>
              <CheckCircle style={{height: '2rem', width: '2rem', color: '#16a34a'}} />
            </div>
            <h3 style={{fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem'}}>Appointment Booked!</h3>
            <p style={{fontSize: '1rem', color: '#6b7280', marginBottom: '2rem', maxWidth: '32rem', margin: '0 auto 2rem'}}>
              Your appointment has been successfully booked. You will receive a confirmation email shortly with all the details.
            </p>
            
            <div style={{backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', border: '1px solid #e5e7eb', marginBottom: '2rem', textAlign: 'left'}}>
              <h4 style={{fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '1rem'}}>Appointment Summary</h4>
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                  <strong>Clinic:</strong> {clinic?.name || 'Loading...'}
                </div>
                <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                  <strong>Service:</strong> {formData.service}
                </div>
                <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                  <strong>Date:</strong> {formData.selectedDate ? new Date(formData.selectedDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }) : 'Not selected'}
                </div>
                <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                  <strong>Time:</strong> {formData.selectedTime || 'Not selected'}
                </div>
                <div style={{fontSize: '0.875rem', color: '#6b7280'}}>
                  <strong>Patient:</strong> {formData.firstName} {formData.lastName}
                </div>
              </div>
            </div>

            <div style={{display: 'flex', gap: '1rem', justifyContent: 'center'}}>
              <Link to="/my-appointments">
                <Button style={{padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #2563eb 0%, #0d9488 100%)', color: 'white', border: 'none', borderRadius: '0.5rem'}}>
                  View My Appointments
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" style={{padding: '0.75rem 1.5rem', border: '1px solid #e5e7eb', color: '#6b7280', backgroundColor: 'white', borderRadius: '0.5rem'}}>
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div style={{minHeight: '100vh', backgroundColor: '#f9fafb'}}>
      {/* Header */}
      <div style={{background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 50%, #0d9488 100%)', padding: '2rem 1rem', position: 'relative', overflow: 'hidden'}}>
        <div style={{position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px'}} />
        <div style={{position: 'relative', maxWidth: '1280px', margin: '0 auto'}}>
                    
          <h1 style={{fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem'}}>
            Book Appointment
          </h1>
          <p style={{color: '#dbeafe', fontSize: '1rem'}}>
            {clinic?.name || 'Loading...'} - {clinic?.address || 'Loading...'}
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div style={{maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem'}}>
        {isClinicClosed && (
          <div style={{padding: '1rem', marginBottom: '1.5rem', borderRadius: '0.75rem', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B'}}>
            <strong>Clinic Closed.</strong> Booking is temporarily unavailable for this clinic.
          </div>
        )}
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem'}}>
          {steps.map((step, index) => (
            <div key={step.id} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1}}>
              <div style={{
                width: '2rem',
                height: '2rem',
                borderRadius: '50%',
                backgroundColor: currentStep >= step.id ? '#2563eb' : '#e5e7eb',
                color: currentStep >= step.id ? 'white' : '#6b7280',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}>
                {step.id}
              </div>
              <div style={{textAlign: 'center'}}>
                <div style={{fontSize: '0.875rem', fontWeight: '600', color: currentStep >= step.id ? '#111827' : '#6b7280'}}>
                  {step.title}
                </div>
                <div style={{fontSize: '0.75rem', color: '#6b7280'}}>
                  {step.description}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  left: '50%',
                  width: '100%',
                  height: '2px',
                  backgroundColor: currentStep > step.id ? '#2563eb' : '#e5e7eb',
                  zIndex: -1
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Form Content */}
        <div style={{backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', marginBottom: '2rem'}}>
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        {currentStep < 4 && (
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              style={{padding: '0.75rem 1.5rem', border: '1px solid #e5e7eb', color: '#6b7280', backgroundColor: 'white', borderRadius: '0.5rem', opacity: currentStep === 1 ? 0.5 : 1}}
            >
              <ArrowLeft style={{height: '1rem', width: '1rem', marginRight: '0.5rem'}} />
              Previous
            </Button>

            {currentStep === 3 ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || isClinicClosed}
                style={{padding: '0.75rem 2rem', background: 'linear-gradient(135deg, #2563eb 0%, #0d9488 100%)', color: 'white', border: 'none', borderRadius: '0.5rem'}}
              >
                {isSubmitting ? 'Booking...' : 'Confirm Appointment'}
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                disabled={
                  isClinicClosed ||
                  (currentStep === 1 && (!formData.service || !isDateTimeValid())) ||
                  (currentStep === 2 && !isPersonalInfoValid())
                }
                style={{padding: '0.75rem 2rem', background: 'linear-gradient(135deg, #2563eb 0%, #0d9488 100%)', color: 'white', border: 'none', borderRadius: '0.5rem', opacity: 
                  (isClinicClosed ||
                   (currentStep === 1 && (!formData.service || !isDateTimeValid())) || 
                   (currentStep === 2 && !isPersonalInfoValid())) ? 0.5 : 1
                }}
              >
                Next
                <ArrowRight style={{height: '1rem', width: '1rem', marginLeft: '0.5rem'}} />
              </Button>
            )}
          </div>
        )}
      </div>
      
      {/* Time Slot Conflict Modal */}
      {timeSlotConflict.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem'}}>
              <AlertCircle style={{height: '1.5rem', width: '1.5rem', color: '#dc2626'}} />
              <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', margin: 0}}>
                Time Slot Already Booked
              </h3>
            </div>
            
            <p style={{color: '#6b7280', marginBottom: '1.5rem', lineHeight: '1.5'}}>
              This time slot is already booked. Please choose a different time for your appointment.
            </p>
            
            {timeSlotConflict.details && (
              <div style={{
                backgroundColor: '#fef3c7',
                border: '1px solid #f59e0b',
                borderRadius: '0.5rem',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{fontSize: '0.875rem', color: '#92400e', marginBottom: '0.5rem'}}>
                  <strong>Booking Details:</strong>
                </div>
                <div style={{fontSize: '0.75rem', color: '#92400e'}}>
                  <div>Date: {timeSlotConflict.details.date}</div>
                  <div>Time: {timeSlotConflict.details.time}</div>
                  <div>Clinic ID: {timeSlotConflict.details.clinic_id}</div>
                </div>
              </div>
            )}
            
            <div style={{display: 'flex', gap: '1rem', justifyContent: 'flex-end'}}>
              <button
                onClick={() => setTimeSlotConflict({ isOpen: false, details: null })}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: '1px solid #d1d5db',
                  backgroundColor: 'white',
                  color: '#6b7280',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Choose Different Time
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReservationFlow
