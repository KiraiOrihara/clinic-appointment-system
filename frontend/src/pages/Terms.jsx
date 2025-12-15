import { FileText, CheckCircle, AlertCircle, Users, Shield } from 'lucide-react';

const Terms = () => {
  return (
    <div style={{minHeight: '100vh', backgroundColor: '#f9fafb'}}>
      {/* Header */}
      <div style={{background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 50%, #0d9488 100%)', padding: '3rem 1rem', position: 'relative', overflow: 'hidden'}}>
        <div style={{position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px'}} />
        <div style={{position: 'relative', maxWidth: '1280px', margin: '0 auto', textAlign: 'center'}}>
          <div style={{width: '4rem', height: '4rem', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem'}}>
            <FileText style={{height: '2rem', width: '2rem', color: 'white'}} />
          </div>
          <h1 style={{fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem'}}>
            Terms of Service
          </h1>
          <p style={{fontSize: '1.125rem', color: '#dbeafe', maxWidth: '48rem', margin: '0 auto'}}>
            Please read these terms carefully before using ClinicFinder for your healthcare appointments.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{maxWidth: '4xl', margin: '0 auto', padding: '3rem 1rem'}}>
        <div style={{backgroundColor: 'white', borderRadius: '1rem', padding: '3rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb'}}>
          <div style={{display: 'flex', flexDirection: 'column', gap: '3rem'}}>

            {/* Introduction */}
            <section>
              <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem'}}>Introduction</h2>
              <p style={{fontSize: '1rem', color: '#6b7280', lineHeight: '1.6'}}>
                Welcome to ClinicFinder. These Terms of Service govern your use of our healthcare 
                appointment booking platform in Mati City, Davao Oriental. By using our service, 
                you agree to these terms.
              </p>
            </section>

            {/* Services */}
            <section>
              <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem'}}>Our Services</h2>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem', marginTop: '1.5rem'}}>
                <div style={{display: 'flex', gap: '1rem'}}>
                  <div style={{width: '3rem', height: '3rem', backgroundColor: '#dbeafe', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
                    <CheckCircle style={{height: '1.5rem', width: '1.5rem', color: '#2563eb'}} />
                  </div>
                  <div>
                    <h3 style={{fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem'}}>Appointment Booking</h3>
                    <p style={{fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.6'}}>
                      Connect with healthcare providers and book appointments efficiently.
                    </p>
                  </div>
                </div>
                <div style={{display: 'flex', gap: '1rem'}}>
                  <div style={{width: '3rem', height: '3rem', backgroundColor: '#dcfce7', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
                    <Users style={{height: '1.5rem', width: '1.5rem', color: '#16a34a'}} />
                  </div>
                  <div>
                    <h3 style={{fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem'}}>Provider Directory</h3>
                    <p style={{fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.6'}}>
                      Access verified healthcare providers in Mati City.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* User Responsibilities */}
            <section>
              <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem'}}>User Responsibilities</h2>
              <ul style={{listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                <li style={{display: 'flex', alignItems: 'start', gap: '0.75rem'}}>
                  <div style={{width: '1.5rem', height: '1.5rem', backgroundColor: '#2563eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.125rem'}}>
                    <span style={{color: 'white', fontSize: '0.75rem', fontWeight: 'bold'}}>✓</span>
                  </div>
                  <span style={{fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.6'}}>Provide accurate and complete information</span>
                </li>
                <li style={{display: 'flex', alignItems: 'start', gap: '0.75rem'}}>
                  <div style={{width: '1.5rem', height: '1.5rem', backgroundColor: '#2563eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.125rem'}}>
                    <span style={{color: 'white', fontSize: '0.75rem', fontWeight: 'bold'}}>✓</span>
                  </div>
                  <span style={{fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.6'}}>Keep your account information secure</span>
                </li>
                <li style={{display: 'flex', alignItems: 'start', gap: '0.75rem'}}>
                  <div style={{width: '1.5rem', height: '1.5rem', backgroundColor: '#2563eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.125rem'}}>
                    <span style={{color: 'white', fontSize: '0.75rem', fontWeight: 'bold'}}>✓</span>
                  </div>
                  <span style={{fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.6'}}>Honor your scheduled appointments</span>
                </li>
                <li style={{display: 'flex', alignItems: 'start', gap: '0.75rem'}}>
                  <div style={{width: '1.5rem', height: '1.5rem', backgroundColor: '#2563eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.125rem'}}>
                    <span style={{color: 'white', fontSize: '0.75rem', fontWeight: 'bold'}}>✓</span>
                  </div>
                  <span style={{fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.6'}}>Use the service for legitimate healthcare purposes</span>
                </li>
              </ul>
            </section>

            {/* Medical Disclaimer */}
            <section>
              <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem'}}>Important Medical Disclaimer</h2>
              <div style={{backgroundColor: '#fef3c7', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #f59e0b'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem'}}>
                  <AlertCircle style={{height: '1.5rem', width: '1.5rem', color: '#d97706'}} />
                  <h3 style={{fontSize: '1.125rem', fontWeight: '600', color: '#92400e'}}>Emergency Care</h3>
                </div>
                <p style={{fontSize: '0.875rem', color: '#92400e', lineHeight: '1.6'}}>
                  ClinicFinder is NOT for medical emergencies. For emergency medical care, 
                  please call 911 or go to the nearest emergency room immediately.
                </p>
              </div>
            </section>

            {/* Cancellation Policy */}
            <section>
              <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem'}}>Cancellation Policy</h2>
              <div style={{backgroundColor: '#f8fafc', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #e5e7eb'}}>
                <ul style={{listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                  <li style={{fontSize: '0.875rem', color: '#6b7280', display: 'flex', alignItems: 'start', gap: '0.5rem'}}>
                    <span style={{color: '#2563eb', fontWeight: 'bold', marginRight: '0.5rem'}}>•</span>
                    Cancel at least 24 hours in advance for full refund
                  </li>
                  <li style={{fontSize: '0.875rem', color: '#6b7280', display: 'flex', alignItems: 'start', gap: '0.5rem'}}>
                    <span style={{color: '#2563eb', fontWeight: 'bold', marginRight: '0.5rem'}}>•</span>
                    Late cancellations may incur a fee
                  </li>
                  <li style={{fontSize: '0.875rem', color: '#6b7280', display: 'flex', alignItems: 'start', gap: '0.5rem'}}>
                    <span style={{color: '#2563eb', fontWeight: 'bold', marginRight: '0.5rem'}}>•</span>
                    No-shows may be charged the full appointment fee
                  </li>
                </ul>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem'}}>Limitation of Liability</h2>
              <p style={{fontSize: '1rem', color: '#6b7280', lineHeight: '1.6'}}>
                ClinicFinder acts as a platform connecting patients with healthcare providers. 
                We are not responsible for the medical care provided by healthcare professionals. 
                Our liability is limited to the platform fees paid for our services.
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem'}}>Contact Us</h2>
              <p style={{fontSize: '1rem', color: '#6b7280', lineHeight: '1.6', marginBottom: '1rem'}}>
                If you have questions about these Terms of Service, please contact us:
              </p>
              <div style={{backgroundColor: '#f8fafc', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #e5e7eb'}}>
                <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                  <div style={{fontSize: '0.875rem', color: '#6b7280'}}><strong>Email:</strong> legal@clinicfinder.ph</div>
                  <div style={{fontSize: '0.875rem', color: '#6b7280'}}><strong>Phone:</strong> (087) 388-4174</div>
                  <div style={{fontSize: '0.875rem', color: '#6b7280'}}><strong>Address:</strong> Central Business District, Mati City, Davao Oriental</div>
                </div>
              </div>
            </section>

            {/* Last Updated */}
            <div style={{padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e5e7eb'}}>
              <p style={{fontSize: '0.875rem', color: '#6b7280', textAlign: 'center'}}>
                Last updated: November 27, 2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Terms
