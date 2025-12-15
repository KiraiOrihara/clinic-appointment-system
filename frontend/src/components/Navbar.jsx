import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Shield, Menu, X, User, LogOut } from 'lucide-react'
import LogoutConfirmationModal from './LogoutConfirmationModal'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [logoutModal, setLogoutModal] = useState(false)
  const navigate = useNavigate()

  // Check auth on every render to ensure state is always current
  const currentAuthStatus = localStorage.getItem('isAuthenticated') === 'true'
  const currentUserData = localStorage.getItem('user')
  const currentIsAuthenticated = currentAuthStatus && currentUserData
  
  // Debug logging
  console.log('Navbar Auth State:', {
    currentAuthStatus,
    currentUserData: currentUserData ? 'exists' : 'null',
    currentIsAuthenticated,
    localStorageAuth: localStorage.getItem('isAuthenticated'),
    localStorageUser: localStorage.getItem('user')
  })

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    
    // Check authentication status
    const checkAuth = () => {
      const authStatus = localStorage.getItem('isAuthenticated')
      const userData = localStorage.getItem('user')
      
      if (authStatus === 'true' && userData) {
        try {
          const parsedUser = JSON.parse(userData)
          // Don't show navbar for admin users
          if (parsedUser.role === 'admin') {
            setIsAuthenticated(false)
            setUser(null)
            return
          }
          setIsAuthenticated(true)
          setUser(parsedUser)
        } catch (error) {
          console.error('Error parsing user data:', error)
          setIsAuthenticated(false)
          setUser(null)
        }
      } else {
        setIsAuthenticated(false)
        setUser(null)
      }
    }

    checkAuth()

    // Listen for storage changes (login/logout)
    const handleStorageChange = (e) => {
      if (e.key === 'isAuthenticated' || e.key === 'user') {
        checkAuth()
      }
    }

    // Also listen for custom events
    const handleUserLogin = () => {
      setTimeout(checkAuth, 100)
    }

    const handleUserLogout = () => {
      setTimeout(checkAuth, 100)
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('userLogin', handleUserLogin)
    window.addEventListener('userLogout', handleUserLogout)
    
    // Check periodically for auth changes (fallback)
    const interval = setInterval(checkAuth, 500)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('userLogin', handleUserLogin)
      window.removeEventListener('userLogout', handleUserLogout)
      clearInterval(interval)
    }
  }, [])

  const handleLogout = () => {
    setLogoutModal(true)
  }

  const confirmLogout = () => {
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setUser(null)
    navigate('/')
  }

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  // Don't render navbar for admin users
  let currentUser = null
  if (currentIsAuthenticated && currentUserData) {
    try {
      currentUser = JSON.parse(currentUserData)
    } catch (error) {
      console.error('Error parsing user data:', error)
    }
  }
  
  if (currentUser?.role === 'admin') {
    return null
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Enhanced Design */}
          <NavLink 
            to="/" 
            className="flex items-center space-x-3 group"
            onClick={closeMenu}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className={`text-xl font-bold transition-colors duration-300 ${
              scrolled ? 'text-gray-900 group-hover:text-blue-600' : 'text-white group-hover:text-blue-200'
            }`}>
              ClinicFinder
            </span>
          </NavLink>

          {/* Desktop Navigation - Enhanced Design */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Guest Navigation */}
            {!currentIsAuthenticated ? (
              <>
                <NavLink 
                  to="/" 
                  className={({ isActive }) => 
                    `font-medium transition-all duration-300 relative py-2 ${
                      isActive 
                        ? scrolled 
                          ? 'text-blue-600' 
                          : 'text-white'
                        : scrolled 
                          ? 'text-gray-600 hover:text-gray-900' 
                          : 'text-blue-100 hover:text-white'
                    }`
                  }
                >
                  Home
                  <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transform transition-transform duration-300 ${
                    scrolled ? 'scale-x-100' : 'scale-x-0'
                  }`} />
                </NavLink>
                <NavLink 
                  to="/find-clinics" 
                  className={({ isActive }) => 
                    `font-medium transition-all duration-300 relative py-2 ${
                      isActive 
                        ? scrolled 
                          ? 'text-blue-600' 
                          : 'text-white'
                        : scrolled 
                          ? 'text-gray-600 hover:text-gray-900' 
                          : 'text-blue-100 hover:text-white'
                    }`
                  }
                >
                  Find Clinics
                  <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transform transition-transform duration-300 ${
                    scrolled ? 'scale-x-100' : 'scale-x-0'
                  }`} />
                </NavLink>
                <NavLink 
                  to="/about" 
                  className={({ isActive }) => 
                    `font-medium transition-all duration-300 relative py-2 ${
                      isActive 
                        ? scrolled 
                          ? 'text-blue-600' 
                          : 'text-white'
                        : scrolled 
                          ? 'text-gray-600 hover:text-gray-900' 
                          : 'text-blue-100 hover:text-white'
                    }`
                  }
                >
                  About
                  <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transform transition-transform duration-300 ${
                    scrolled ? 'scale-x-100' : 'scale-x-0'
                  }`} />
                </NavLink>
                <NavLink 
                  to="/login" 
                  className="px-6 py-2 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-lg hover:from-slate-700 hover:to-slate-800 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                >
                  Sign In
                </NavLink>
              </>
            ) : (
              /* Logged-in User Navigation */
              <>
                <NavLink 
                  to="/find-clinics" 
                  className={({ isActive }) => 
                    `font-medium transition-all duration-300 relative py-2 ${
                      isActive 
                        ? scrolled 
                          ? 'text-blue-600' 
                          : 'text-white'
                        : scrolled 
                          ? 'text-gray-600 hover:text-gray-900' 
                          : 'text-blue-100 hover:text-white'
                    }`
                  }
                >
                  Find Clinics
                  <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transform transition-transform duration-300 ${
                    scrolled ? 'scale-x-100' : 'scale-x-0'
                  }`} />
                </NavLink>
                <NavLink 
                  to="/my-appointments" 
                  className={({ isActive }) => 
                    `font-medium transition-all duration-300 relative py-2 ${
                      isActive 
                        ? scrolled 
                          ? 'text-blue-600' 
                          : 'text-white'
                        : scrolled 
                          ? 'text-gray-600 hover:text-gray-900' 
                          : 'text-blue-100 hover:text-white'
                    }`
                  }
                >
                  My Appointments
                  <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transform transition-transform duration-300 ${
                    scrolled ? 'scale-x-100' : 'scale-x-0'
                  }`} />
                </NavLink>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <User className="w-4 h-4" />
                    <span className={scrolled ? 'text-gray-700' : 'text-white'}>
                      {currentUser?.firstName || currentUser?.first_name || 'User'}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className={`px-4 py-2 rounded-lg transition-all duration-300 font-medium flex items-center space-x-2 ${
                      scrolled 
                        ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' 
                        : 'text-white hover:bg-white/20'
                    }`}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button - Enhanced Design */}
          <button
            onClick={toggleMenu}
            className={`md:hidden p-2 rounded-xl transition-all duration-300 ${
              scrolled 
                ? 'text-gray-600 hover:bg-gray-100' 
                : 'text-white hover:bg-white/20'
            }`}
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation - Enhanced Design */}
        <div className={`md:hidden transition-all duration-300 ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className={`py-4 space-y-2 rounded-2xl mt-2 border transition-all duration-300 ${
            scrolled 
              ? 'bg-white shadow-xl border-gray-200' 
              : 'bg-white/95 backdrop-blur-md shadow-2xl border-white/20'
          }`}>
            {/* Guest Mobile Navigation */}
            {!currentIsAuthenticated ? (
              <>
                <NavLink 
                  to="/" 
                  className={({ isActive }) => 
                    `block px-6 py-3 font-medium transition-all duration-300 ${
                      isActive 
                        ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                  onClick={closeMenu}
                >
                  Home
                </NavLink>
                <NavLink 
                  to="/find-clinics" 
                  className={({ isActive }) => 
                    `block px-6 py-3 font-medium transition-all duration-300 ${
                      isActive 
                        ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                  onClick={closeMenu}
                >
                  Find Clinics
                </NavLink>
                <NavLink 
                  to="/about" 
                  className={({ isActive }) => 
                    `block px-6 py-3 font-medium transition-all duration-300 ${
                      isActive 
                        ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                  onClick={closeMenu}
                >
                  About
                </NavLink>
                <div className="px-6 pt-2">
                  <NavLink 
                    to="/login" 
                    className="block w-full px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl hover:from-slate-700 hover:to-slate-800 transition-all duration-300 font-medium text-center shadow-lg"
                    onClick={closeMenu}
                  >
                    Sign In
                  </NavLink>
                </div>
              </>
            ) : (
              /* Logged-in User Mobile Navigation */
              <>
                <NavLink 
                  to="/find-clinics" 
                  className={({ isActive }) => 
                    `block px-6 py-3 font-medium transition-all duration-300 ${
                      isActive 
                        ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                  onClick={closeMenu}
                >
                  Find Clinics
                </NavLink>
                <NavLink 
                  to="/my-appointments" 
                  className={({ isActive }) => 
                    `block px-6 py-3 font-medium transition-all duration-300 ${
                      isActive 
                        ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                  onClick={closeMenu}
                >
                  My Appointments
                </NavLink>
                <div className="px-6 py-3 border-t">
                  <div className="flex items-center space-x-2 text-sm text-gray-700 mb-3">
                    <User className="w-4 h-4" />
                    <span>{currentUser?.firstName || currentUser?.first_name || 'User'}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full px-6 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-all duration-300 font-medium text-center"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <LogoutConfirmationModal
        isOpen={logoutModal}
        onClose={() => setLogoutModal(false)}
        onConfirm={confirmLogout}
        title="User Logout"
        message="Are you sure you want to logout from your account?"
      />
    </nav>
  )
}

export default Navbar
