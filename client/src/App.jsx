import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';

import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';

import PatientDashboard from './pages/dashboards/PatientDashboard.jsx';
import DoctorDashboard from './pages/dashboards/DoctorDashboard.jsx';
import AdminDashboard from './pages/dashboards/AdminDashboard.jsx';
import AuditorDashboard from './pages/dashboards/AuditorDashboard.jsx';
import DocumentsPage from './pages/DocumentsPage.jsx';
import ConsentsPage from './pages/ConsentsPage.jsx';
import ConsentReaderPage from './pages/ConsentReaderPage.jsx';
import CreateConsentPage from './pages/CreateConsentPage.jsx';
import AuditTrailPage from './pages/AuditTrailPage.jsx';

function RoleRedirect() {
  const { user, loading, getDashboardRoute } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={getDashboardRoute(user.role)} replace />;
}

function MainLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainLayout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Role Protected Routes */}
          <Route
            path="/patient/dashboard"
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/auditor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['AUDITOR']}>
                <AuditorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents"
            element={
              <ProtectedRoute allowedRoles={['PATIENT', 'DOCTOR', 'ADMIN', 'AUDITOR']}>
                <DocumentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consents"
            element={
              <ProtectedRoute allowedRoles={['PATIENT', 'DOCTOR', 'ADMIN', 'AUDITOR']}>
                <ConsentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consents/new"
            element={
              <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}>
                <CreateConsentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consents/:id"
            element={
              <ProtectedRoute allowedRoles={['PATIENT', 'DOCTOR', 'ADMIN', 'AUDITOR']}>
                <ConsentReaderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/audit-trail"
            element={
              <ProtectedRoute allowedRoles={['PATIENT', 'DOCTOR', 'ADMIN', 'AUDITOR']}>
                <AuditTrailPage />
              </ProtectedRoute>
            }
          />

          {/* General portal redirect */}
          <Route path="/dashboard" element={<RoleRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    </AuthProvider>
  );
}
