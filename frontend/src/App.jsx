import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './index.css' // FORCE CSS LOAD
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import AdminProtectedRoute from './components/AdminProtectedRoute'
import ClinicManagerProtectedRoute from './components/ClinicManagerProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import AdminAuth from './pages/AdminAuth'
import Profile from './pages/Profile'
import MyAppointments from './pages/MyAppointments'
import FindClinics from './pages/FindClinics-Free'
import ClinicDetails from './pages/ClinicDetails'
import ReservationFlow from './pages/ReservationFlow'
import AdminDashboard from './pages/Admin/Dashboard_with_modals'
import ClinicManagerDashboard from './pages/ClinicManager/Dashboard'
import About from './pages/About'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import DesignTest from './pages/DesignTest'

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout><Landing /></Layout>} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<Layout><About /></Layout>} />
        <Route path="/find-clinics" element={<Layout><FindClinics /></Layout>} />
        <Route path="/privacy" element={<Layout><Privacy /></Layout>} />
        <Route path="/terms" element={<Layout><Terms /></Layout>} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminAuth />} />
        <Route path="/admin/login" element={<AdminAuth />} />
        <Route path="/admin/dashboard" element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        } />
        
        {/* Clinic Manager Routes */}
        <Route path="/clinic-manager/dashboard" element={
          <ClinicManagerProtectedRoute>
            <ClinicManagerDashboard />
          </ClinicManagerProtectedRoute>
        } />
        
        {/* Protected Patient Routes */}
        <Route path="/design-test" element={
          <ProtectedRoute>
            <DesignTest />
          </ProtectedRoute>
        } />
        <Route path="/clinic/:id" element={
          <ProtectedRoute>
            <Layout><ClinicDetails /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/book/:clinicId" element={
          <ProtectedRoute>
            <Layout><ReservationFlow /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/my-appointments" element={
          <ProtectedRoute>
            <Layout><MyAppointments /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout><Profile /></Layout>
          </ProtectedRoute>
        } />
        
        {/* Legacy Routes - Redirect to Login */}
        <Route path="/auth" element={<Login />} />
        <Route path="/signup" element={<Login />} />
      </Routes>
    </Router>
  )
}

export default App
