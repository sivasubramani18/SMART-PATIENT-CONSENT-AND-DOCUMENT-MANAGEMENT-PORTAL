import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading, isAuthenticated, getDashboardRoute } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-medium text-slate-600">Verifying secure credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-200">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Restricted</h2>
          <p className="text-slate-600 text-sm mb-6">
            Your role (<span className="font-semibold text-slate-800">{user.role}</span>) does not have authorization to view this area.
          </p>
          <Link
            to={getDashboardRoute(user.role)}
            className="inline-flex items-center justify-center w-full px-5 py-2.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-all shadow-md shadow-teal-600/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go to Your Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
