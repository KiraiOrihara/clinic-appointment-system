import { Link } from 'react-router-dom'
import { Heart, Shield, Users, Award, MapPin, Phone, Mail, Target, Zap, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

const About = () => {
  return (
    <div style={{minHeight: '100vh', backgroundColor: '#f9fafb'}}>
      {/* Hero Section */}
      <div style={{background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 50%, #0d9488 100%)', padding: '4rem 1rem', position: 'relative', overflow: 'hidden'}}>
        <div style={{position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px'}} />
        <div style={{position: 'relative', maxWidth: '1280px', margin: '0 auto', textAlign: 'center'}}>
          <div style={{width: '4rem', height: '4rem', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem'}}>
            <Heart style={{height: '2rem', width: '2rem', color: 'white'}} />
          </div>
          <h1 style={{fontSize: '3rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem'}}>
            About ClinicFinder
          </h1>
          <p style={{fontSize: '1.25rem', color: '#dbeafe', maxWidth: '48rem', margin: '0 auto'}}>
            Making healthcare accessible and convenient for the Mati City community through innovative technology
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div style={{maxWidth: '1280px', margin: '0 auto', padding: '4rem 1rem'}}>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', marginBottom: '4rem'}}>
          <div>
            <h2 style={{fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem'}}>Our Mission</h2>
            <p style={{fontSize: '1.125rem', color: '#6b7280', lineHeight: '1.6', marginBottom: '1rem'}}>
              ClinicFinder was founded with a simple goal: to make healthcare appointments 
              as easy and accessible as possible for the people of Davao Oriental. We believe that 
              finding and booking healthcare should not be a complicated process.
            </p>
            <p style={{fontSize: '1.125rem', color: '#6b7280', lineHeight: '1.6', marginBottom: '1rem'}}>
              Through our innovative platform, we connect patients with healthcare providers 
              in Mati City, providing real-time availability, transparent information, 
              and seamless booking experiences.
            </p>
            <p style={{fontSize: '1.125rem', color: '#6b7280', lineHeight: '1.6'}}>
              Whether you need a routine check-up, specialized care, or urgent medical 
              attention, ClinicFinder helps you find the right care at the right time.
            </p>
          </div>
          <div style={{backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb'}}>
            <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                <div style={{width: '3rem', height: '3rem', backgroundColor: '#dbeafe', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <Target style={{height: '1.5rem', width: '1.5rem', color: '#2563eb'}} />
                </div>
                <div>
                  <h3 style={{fontSize: '1.125rem', fontWeight: 'bold', color: '#111827'}}>Our Vision</h3>
                  <p style={{fontSize: '0.875rem', color: '#6b7280'}}>Healthcare accessible to every resident of Mati City</p>
                </div>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                <div style={{width: '3rem', height: '3rem', backgroundColor: '#dcfce7', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <Shield style={{height: '1.5rem', width: '1.5rem', color: '#16a34a'}} />
                </div>
                <div>
                  <h3 style={{fontSize: '1.125rem', fontWeight: 'bold', color: '#111827'}}>Quality Care</h3>
                  <p style={{fontSize: '0.875rem', color: '#6b7280'}}>Connecting you with verified healthcare providers</p>
                </div>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                <div style={{width: '3rem', height: '3rem', backgroundColor: '#fef3c7', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <Zap style={{height: '1.5rem', width: '1.5rem', color: '#d97706'}} />
                </div>
                <div>
                  <h3 style={{fontSize: '1.125rem', fontWeight: 'bold', color: '#111827'}}>Fast & Easy</h3>
                  <p style={{fontSize: '0.875rem', color: '#6b7280'}}>Book appointments in seconds, not hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div style={{marginBottom: '4rem'}}>
          <h2 style={{fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '2rem', textAlign: 'center'}}>Why Choose ClinicFinder?</h2>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem'}}>
            <div style={{backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', textAlign: 'center'}}>
              <div style={{width: '4rem', height: '4rem', backgroundColor: '#dbeafe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem'}}>
                <CheckCircle style={{height: '2rem', width: '2rem', color: '#2563eb'}} />
              </div>
              <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem'}}>Verified Clinics</h3>
              <p style={{fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.6'}}>All healthcare providers are thoroughly verified and licensed to ensure quality care for our community.</p>
            </div>
            <div style={{backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', textAlign: 'center'}}>
              <div style={{width: '4rem', height: '4rem', backgroundColor: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem'}}>
                <Zap style={{height: '2rem', width: '2rem', color: '#16a34a'}} />
              </div>
              <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem'}}>Instant Booking</h3>
              <p style={{fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.6'}}>Book appointments in real-time with instant confirmation and reminders.</p>
            </div>
            <div style={{backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', textAlign: 'center'}}>
              <div style={{width: '4rem', height: '4rem', backgroundColor: '#fef3c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem'}}>
                <Users style={{height: '2rem', width: '2rem', color: '#d97706'}} />
              </div>
              <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem'}}>Community Focused</h3>
              <p style={{fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.6'}}>Built specifically for the Mati City community with local healthcare providers.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div style={{background: 'linear-gradient(135deg, #2563eb 0%, #0d9488 100%)', borderRadius: '1rem', padding: '3rem', textAlign: 'center', color: 'white'}}>
          <h2 style={{fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem'}}>Ready to Experience Better Healthcare?</h2>
          <p style={{fontSize: '1.125rem', marginBottom: '2rem', opacity: 0.9}}>Join thousands of Mati City residents who trust ClinicFinder for their healthcare needs.</p>
          <div style={{display: 'flex', gap: '1rem', justifyContent: 'center'}}>
            <Link to="/find-clinics">
              <Button style={{padding: '0.75rem 2rem', background: 'white', color: '#2563eb', border: 'none', borderRadius: '0.5rem', fontWeight: '600'}}>
                Find Clinics
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
