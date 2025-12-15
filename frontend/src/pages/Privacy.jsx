import { Shield, Lock, Eye, Database, UserCheck, FileText } from 'lucide-react'

const Privacy = () => {
  return (
    <div style={{minHeight: '100vh', backgroundColor: '#f9fafb'}}>
      {/* Header */}
      <div style={{background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 50%, #0d9488 100%)', padding: '3rem 1rem', position: 'relative', overflow: 'hidden'}}>
        <div style={{position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px'}} />
        <div style={{position: 'relative', maxWidth: '1280px', margin: '0 auto', textAlign: 'center'}}>
          <div style={{width: '4rem', height: '4rem', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem'}}>
            <Shield style={{height: '2rem', width: '2rem', color: 'white'}} />
          </div>
          <h1 style={{fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem'}}>
            Privacy Policy
          </h1>
          <p style={{fontSize: '1.125rem', color: '#dbeafe', maxWidth: '48rem', margin: '0 auto'}}>
            Your privacy is important to us. Learn how we collect, use, and protect your information.
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
                ClinicFinder is committed to protecting your personal information and privacy. This Privacy Policy 
                explains how we collect, use, and safeguard your data when you use our healthcare appointment 
                booking platform in Mati City.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem'}}>Information We Collect</h2>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem', marginTop: '1.5rem'}}>
                <div style={{display: 'flex', gap: '1rem'}}>
                  <div style={{width: '3rem', height: '3rem', backgroundColor: '#dbeafe', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
                    <UserCheck style={{height: '1.5rem', width: '1.5rem', color: '#2563eb'}} />
                  </div>
                  <div>
                    <h3 style={{fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem'}}>Personal Information</h3>
                    <p style={{fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.6'}}>
                      Name, contact details, date of birth, and health information required for appointments.
                    </p>
                  </div>
                </div>
                <div style={{display: 'flex', gap: '1rem'}}>
                  <div style={{width: '3rem', height: '3rem', backgroundColor: '#dcfce7', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
                    <Database style={{height: '1.5rem', width: '1.5rem', color: '#16a34a'}} />
                  </div>
                  <div>
                    <h3 style={{fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem'}}>Usage Data</h3>
                    <p style={{fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.6'}}>
                      How you use our platform, appointment history, and preferences.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem'}}>How We Use Your Information</h2>
              <ul style={{listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                <li style={{display: 'flex', alignItems: 'start', gap: '0.75rem'}}>
                  <div style={{width: '1.5rem', height: '1.5rem', backgroundColor: '#2563eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.125rem'}}>
                    <span style={{color: 'white', fontSize: '0.75rem', fontWeight: 'bold'}}>✓</span>
                  </div>
                  <span style={{fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.6'}}>To facilitate healthcare appointments and communications</span>
                </li>
                <li style={{display: 'flex', alignItems: 'start', gap: '0.75rem'}}>
                  <div style={{width: '1.5rem', height: '1.5rem', backgroundColor: '#2563eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.125rem'}}>
                    <span style={{color: 'white', fontSize: '0.75rem', fontWeight: 'bold'}}>✓</span>
                  </div>
                  <span style={{fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.6'}}>To improve our services and user experience</span>
                </li>
                <li style={{display: 'flex', alignItems: 'start', gap: '0.75rem'}}>
                  <div style={{width: '1.5rem', height: '1.5rem', backgroundColor: '#2563eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.125rem'}}>
                    <span style={{color: 'white', fontSize: '0.75rem', fontWeight: 'bold'}}>✓</span>
                  </div>
                  <span style={{fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.6'}}>To send appointment reminders and important updates</span>
                </li>
                <li style={{display: 'flex', alignItems: 'start', gap: '0.75rem'}}>
                  <div style={{width: '1.5rem', height: '1.5rem', backgroundColor: '#2563eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.125rem'}}>
                    <span style={{color: 'white', fontSize: '0.75rem', fontWeight: 'bold'}}>✓</span>
                  </div>
                  <span style={{fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.6'}}>To ensure platform security and prevent fraud</span>
                </li>
              </ul>
            </section>

            {/* Data Protection */}
            <section>
              <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem'}}>Data Protection</h2>
              <div style={{backgroundColor: '#f8fafc', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #e5e7eb'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem'}}>
                  <Lock style={{height: '1.5rem', width: '1.5rem', color: '#2563eb'}} />
                  <h3 style={{fontSize: '1.125rem', fontWeight: '600', color: '#111827'}}>Security Measures</h3>
                </div>
                <p style={{fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.6'}}>
                  We implement industry-standard security measures including encryption, secure servers, 
                  and regular security audits to protect your personal health information.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h2 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem'}}>Contact Us</h2>
              <p style={{fontSize: '1rem', color: '#6b7280', lineHeight: '1.6', marginBottom: '1rem'}}>
                If you have questions about this Privacy Policy or how we handle your data, please contact us:
              </p>
              <div style={{backgroundColor: '#f8fafc', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #e5e7eb'}}>
                <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                  <div style={{fontSize: '0.875rem', color: '#6b7280'}}><strong>Email:</strong> privacy@clinicfinder.ph</div>
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

export default Privacy
