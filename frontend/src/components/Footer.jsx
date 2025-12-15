import { Link } from 'react-router-dom'
import { Shield, Phone, Mail, MapPin } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-slate-800 to-slate-900 text-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Logo and Description */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">ClinicFinder</span>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Your trusted partner in finding quality healthcare in Mati City and Davao Oriental. Fast, secure, and reliable.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Services</h3>
            <div className="space-y-3">
              <div className="text-gray-300 hover:text-white transition-colors duration-300 cursor-default">
                General Practice
              </div>
              <div className="text-gray-300 hover:text-white transition-colors duration-300 cursor-default">
                Emergency Care
              </div>
              <div className="text-gray-300 hover:text-white transition-colors duration-300 cursor-default">
                Pediatric Care
              </div>
              <div className="text-gray-300 hover:text-white transition-colors duration-300 cursor-default">
                Dental Services
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Contact Info</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-300">
                <MapPin className="h-5 w-5 text-blue-400" />
                <span>Mati City, Davao Oriental</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Phone className="h-5 w-5 text-blue-400" />
                <span>+63 (XXX) XXX-XXXX</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Mail className="h-5 w-5 text-blue-400" />
                <span>info@clinicfinder.ph</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              © 2024 ClinicFinder. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors duration-300">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors duration-300">
                Terms of Service
              </Link>
              <Link to="/contact" className="text-gray-400 hover:text-white transition-colors duration-300">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
