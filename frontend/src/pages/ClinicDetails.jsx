import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Globe, Star, Clock, Calendar, Users, Shield, ChevronRight, Hospital, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { designTokens, standardClasses, inlineStyles } from '../design-tokens'
import { clinicService } from '../services/api'

const ClinicDetails = () => {
  const { id } = useParams()
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [clinic, setClinic] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch clinic and services data
  useEffect(() => {
    const fetchClinicData = async () => {
      if (!id) {
        setLoading(false)
        return
      }
      
      try {
        setLoading(true)
        
        // Fetch clinic details
        const clinicData = await clinicService.getClinicById(id)
        setClinic(clinicData)
      } catch (error) {
        console.error('Error fetching clinic data:', error)
        setClinic(null)
      } finally {
        setLoading(false)
      }
    }

    fetchClinicData()
  }, [id])

  const availableTimeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '7:00 PM', '7:30 PM'
  ]

  const today = new Date()
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  
  // Show loading state while fetching data
  if (loading) {
    return (
      <div style={{minHeight: '100vh', backgroundColor: designTokens.colors.background, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{textAlign: 'center'}}>
          <div style={{width: '2rem', height: '2rem', border: '2px solid #2563eb', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem'}}></div>
          <p style={{color: designTokens.colors.text.primary}}>Loading clinic details...</p>
        </div>
      </div>
    )
  }

  // Show error state if clinic not found
  if (!clinic) {
    return (
      <div style={{minHeight: '100vh', backgroundColor: designTokens.colors.background, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{textAlign: 'center'}}>
          <h1 style={{fontSize: '1.5rem', fontWeight: 'bold', color: designTokens.colors.text.primary, marginBottom: '1rem'}}>Clinic Not Found</h1>
          <p style={{color: '#6b7280', marginBottom: '1rem'}}>The clinic you're looking for doesn't exist or has been removed.</p>
          <Link to="/find-clinics">
            <Button>Back to Clinics</Button>
          </Link>
        </div>
      </div>
    )
  }
  
  const generateDateOptions = () => {
    const dates = []
    for (let i = 0; i < 14; i++) {
      const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000)
      dates.push(date.toISOString().split('T')[0])
    }
    return dates
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  return (
    <div style={{minHeight: '100vh', backgroundColor: designTokens.colors.background}}>
      {/* Hero Section */}
      <div style={{background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 50%, #0d9488 100%)', padding: '3rem 1rem', position: 'relative', overflow: 'hidden'}}>
        <div style={{position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px'}} />
        <div style={{position: 'relative', maxWidth: '1280px', margin: '0 auto', padding: '0 1rem'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '2rem'}}>
            <div style={{flex: 1}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem'}}>
                <div style={{padding: '0.25rem 0.75rem', backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', borderRadius: designTokens.borderRadius.full, fontSize: '0.75rem', fontWeight: '500'}}>
                  Verified Clinic
                </div>
                <div style={{padding: '0.25rem 0.75rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: designTokens.borderRadius.full, fontSize: '0.75rem', fontWeight: '500'}}>
                  Open Now
                </div>
              </div>
              
              <h1 style={{fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem'}}>
                {clinic.name}
              </h1>
              
              <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                  <Star style={{height: '1.25rem', width: '1.25rem', fill: '#fbbf24', color: '#fbbf24'}} />
                  <span style={{fontSize: '1.125rem', fontWeight: 'bold', color: 'white'}}>{clinic.average_rating || 0}</span>
                  <span style={{color: '#dbeafe'}}>({clinic.review_count || 0} reviews)</span>
                </div>
              </div>
              
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dbeafe', marginBottom: '1rem'}}>
                <MapPin style={{height: '1.25rem', width: '1.25rem'}} />
                <span style={{fontSize: '1rem'}}>{clinic.address}</span>
              </div>
              
              <div style={{display: 'flex', gap: '1rem'}}>
                <Link to={`/book/${id}`}>
                  <Button style={{padding: '0.75rem 2rem', background: 'white', color: '#2563eb', border: 'none', borderRadius: designTokens.borderRadius.md, fontWeight: '600'}}>
                    Book Appointment
                  </Button>
                </Link>
                <Button variant="outline" style={{padding: '0.75rem 1rem', border: '1px solid white', color: 'white', backgroundColor: 'transparent', borderRadius: designTokens.borderRadius.md}}>
                  <Hospital style={{height: '1rem', width: '1rem', marginRight: '0.5rem'}} />
                  Save Clinic
                </Button>
                <Button variant="outline" style={{padding: '0.75rem 1rem', border: '1px solid white', color: 'white', backgroundColor: 'transparent', borderRadius: designTokens.borderRadius.md}}>
                  <Share2 style={{height: '1rem', width: '1rem', marginRight: '0.5rem'}} />
                  Share
                </Button>
              </div>
            </div>
            
            <div style={{backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', borderRadius: '1rem', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.2)'}}>
              <h3 style={{fontSize: '1.125rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem'}}>Quick Info</h3>
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dbeafe'}}>
                  <Phone style={{height: '1rem', width: '1rem'}} />
                  <span style={{fontSize: '0.875rem'}}>{clinic.phone || 'Not available'}</span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dbeafe'}}>
                  <Mail style={{height: '1rem', width: '1rem'}} />
                  <span style={{fontSize: '0.875rem'}}>{clinic.email || 'Not available'}</span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dbeafe'}}>
                  <Globe style={{height: '1rem', width: '1rem'}} />
                  <span style={{fontSize: '0.875rem'}}>{clinic.website || 'Not available'}</span>
                </div>
                <div style={{padding: '0.5rem 0.75rem', backgroundColor: 'rgba(220,252,231,0.2)', color: '#dcfce7', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: '500', textAlign: 'center'}}>
                  24/7 Emergency Services Available
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem'}}>
        {/* Left Column */}
        <div style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
          {/* About Section */}
          <div style={{backgroundColor: 'white', borderRadius: designTokens.borderRadius.lg, padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb'}}>
            <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: designTokens.colors.text.primary, marginBottom: '1rem'}}>About This Clinic</h2>
            <p style={{color: '#6b7280', lineHeight: '1.6', marginBottom: '1.5rem'}}>
              {clinic.description || 'A trusted healthcare provider serving the community with quality medical services and compassionate care.'}
            </p>
            
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem'}}>
              <div style={{padding: '1rem', backgroundColor: designTokens.colors.background, borderRadius: designTokens.borderRadius.md}}>
                <Users style={{height: '1.25rem', width: '1.25rem', color: '#2563eb', marginBottom: '0.5rem'}} />
                <h4 style={{fontSize: '0.875rem', fontWeight: '600', color: designTokens.colors.text.primary, marginBottom: '0.25rem'}}>Experienced Staff</h4>
                <p style={{fontSize: '0.75rem', color: '#6b7280'}}>Board-certified physicians and nurses</p>
              </div>
              <div style={{padding: '1rem', backgroundColor: designTokens.colors.background, borderRadius: designTokens.borderRadius.md}}>
                <Shield style={{height: '1.25rem', width: '1.25rem', color: '#2563eb', marginBottom: '0.5rem'}} />
                <h4 style={{fontSize: '0.875rem', fontWeight: '600', color: designTokens.colors.text.primary, marginBottom: '0.25rem'}}>Quality Care</h4>
                <p style={{fontSize: '0.75rem', color: '#6b7280'}}>High standards of medical care</p>
              </div>
            </div>
          </div>

          {/* Services Section */}
          <div style={{backgroundColor: 'white', borderRadius: designTokens.borderRadius.lg, padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb'}}>
            <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: designTokens.colors.text.primary, marginBottom: '1rem'}}>Services & Specialties</h2>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem'}}>
              {clinic && clinic.services && clinic.services.map((service, index) => (
                <div key={index} style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', backgroundColor: designTokens.colors.background, borderRadius: designTokens.borderRadius.md}}>
                  <ChevronRight style={{height: '1rem', width: '1rem', color: '#2563eb'}} />
                  <span style={{fontSize: '0.875rem', color: designTokens.colors.text.primary}}>{service}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hours Section */}
          <div style={{backgroundColor: 'white', borderRadius: designTokens.borderRadius.lg, padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb'}}>
            <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: designTokens.colors.text.primary, marginBottom: '1rem'}}>Operating Hours</h2>
            <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: designTokens.colors.background, borderRadius: designTokens.borderRadius.md}}>
                <span style={{fontSize: '0.875rem', fontWeight: '500', color: designTokens.colors.text.primary}}>Monday - Friday</span>
                <span style={{fontSize: '0.875rem', color: '#6b7280'}}>8:00 AM - 8:00 PM</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: designTokens.colors.background, borderRadius: designTokens.borderRadius.md}}>
                <span style={{fontSize: '0.875rem', fontWeight: '500', color: designTokens.colors.text.primary}}>Saturday</span>
                <span style={{fontSize: '0.875rem', color: '#6b7280'}}>9:00 AM - 5:00 PM</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: designTokens.colors.background, borderRadius: designTokens.borderRadius.md}}>
                <span style={{fontSize: '0.875rem', fontWeight: '500', color: designTokens.colors.text.primary}}>Sunday</span>
                <span style={{fontSize: '0.875rem', color: '#6b7280'}}>10:00 AM - 4:00 PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
          {/* Quick Booking */}
          <div style={{backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb'}}>
            <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem'}}>Quick Booking</h3>
            
            <div style={{marginBottom: '1rem'}}>
              <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem'}}>Select Date</label>
              <select 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', backgroundColor: 'white', fontSize: '0.875rem'}}
              >
                <option value="">Choose a date</option>
                {generateDateOptions().map(date => (
                  <option key={date} value={date}>{formatDate(date)}</option>
                ))}
              </select>
            </div>

            <div style={{marginBottom: '1.5rem'}}>
              <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem'}}>Select Time</label>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem'}}>
                {availableTimeSlots.map(time => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    style={{
                      padding: '0.5rem',
                      border: selectedTime === time ? '2px solid #2563eb' : '1px solid #e5e7eb',
                      borderRadius: '0.375rem',
                      backgroundColor: selectedTime === time ? '#eff6ff' : 'white',
                      color: '#374151',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <Link to={`/book/${id}`}>
              <Button style={{width: '100%', padding: '0.75rem', background: 'linear-gradient(135deg, #2563eb 0%, #0d9488 100%)', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '600'}}>
                Continue Booking
              </Button>
            </Link>
          </div>

          {/* Additional Info */}
          <div style={{backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb'}}>
            <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem'}}>Additional Information</h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              <div>
                <h4 style={{fontSize: '0.875rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem'}}>Insurance Accepted</h4>
                <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem'}}>
                  {['PhilHealth', 'Maxicare', 'MediCard'].map(insurance => (
                    <span key={insurance} style={{padding: '0.25rem 0.75rem', backgroundColor: '#f3f4f6', color: '#374151', borderRadius: '9999px', fontSize: '0.75rem'}}>
                      {insurance}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 style={{fontSize: '0.875rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem'}}>Amenities</h4>
                <div style={{display: 'flex', flexDirection: 'column', gap: '0.25rem'}}>
                  <div style={{fontSize: '0.875rem', color: '#6b7280'}}>🚗 {mockClinic.parking}</div>
                  <div style={{fontSize: '0.875rem', color: '#6b7280'}}>♿ {mockClinic.accessibility}</div>
                </div>
              </div>
              
              <div>
                <h4 style={{fontSize: '0.875rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem'}}>Languages</h4>
                <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem'}}>
                  {mockClinic.languages.map(language => (
                    <span key={language} style={{padding: '0.25rem 0.75rem', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '9999px', fontSize: '0.75rem'}}>
                      {language}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClinicDetails
