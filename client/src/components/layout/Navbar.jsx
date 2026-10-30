import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Shield,
  FileText,
  UserCheck,
  Activity,
  LogOut,
  Bell,
  Menu,
  X,
  Lock,
  ChevronDown,
  AlertTriangle,
  FileCheck2,
  History
} from 'lucide-react';
import NotificationBell from './NotificationBell.jsx';

export default function Navbar() {
  const { user, logout, getDashboardRoute } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const roleColors = {
    PATIENT: 'bg-teal-100 text-teal-800 border-teal-200',
    DOCTOR: 'bg-blue-100 text-blue-800 border-blue-200',
    ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
    AUDITOR: 'bg-amber-100 text-amber-800 border-amber-200'
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Platform Name */}
          <div className="flex items-center space-x-3">
            <Link to={user ? getDashboardRoute(user.role) : '/'} className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                  ConsentIQ
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                </span>
                <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-400 -mt-1">
                  Medical Consent & Records
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {/* Role Badge */}
                <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${roleColors[user.role] || 'bg-slate-100 text-slate-700'}`}>
                  {user.role}
                </span>

                {/* Dashboard Nav Link */}
                <Link
                  to={getDashboardRoute(user.role)}
                  className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                    location.pathname.includes('/dashboard')
                      ? 'text-teal-700 bg-teal-50 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Dashboard
                </Link>

                {/* Documents & Consents: Patient & Doctor workflows */}
                {(user.role === 'PATIENT' || user.role === 'DOCTOR') && (
                  <>
                    <Link
                      to="/documents"
                      className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                        location.pathname.startsWith('/documents')
                          ? 'text-teal-700 bg-teal-50 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      {user.role === 'PATIENT' ? 'My Documents' : 'Documents'}
                    </Link>

                    <Link
                      to="/consents"
                      className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                        location.pathname.startsWith('/consents')
                          ? 'text-teal-700 bg-teal-50 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <FileCheck2 className="w-4 h-4 text-teal-600" />
                      {user.role === 'PATIENT' ? 'My Consents' : 'Consents'}
                    </Link>
                  </>
                )}

                {/* Audit Trail: strictly ADMIN and AUDITOR governance */}
                {(user.role === 'ADMIN' || user.role === 'AUDITOR') && (
                  <Link
                    to="/audit-trail"
                    className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                      location.pathname.startsWith('/audit-trail')
                        ? 'text-teal-700 bg-teal-50 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <History className="w-4 h-4 text-teal-600" />
                    Audit Trail
                  </Link>
                )}

                {/* In-App Notification Bell */}
                <NotificationBell />

                {/* User Dropdown / Menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-2 pl-3 pr-2 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                  >
                    <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                    <div className="text-xs">
                      <div className="font-semibold text-slate-800 leading-tight max-w-[120px] truncate">{user.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Signed in as</p>
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${roleColors[user.role]}`}>
                            {user.role}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 font-mono truncate mt-0.5">{user.email}</p>
                      </div>

                      <div className="pt-2 px-3">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-teal-600 px-3 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-xl transition-all shadow-sm shadow-teal-600/20"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="flex md:hidden items-center space-x-2">
            {user && (
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${roleColors[user.role]}`}>
                {user.role}
              </span>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
          {user ? (
            <>
              <div className="p-3 bg-slate-50 rounded-xl mb-2">
                <p className="text-xs text-slate-400">Authenticated user</p>
                <p className="text-sm font-bold text-slate-800">{user.name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
              <Link
                to={getDashboardRoute(user.role)}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-semibold text-slate-700 hover:text-teal-600 py-1.5"
              >
                Dashboard
              </Link>
              {(user.role === 'PATIENT' || user.role === 'DOCTOR') && (
                <>
                  <Link
                    to="/documents"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-semibold text-slate-700 hover:text-teal-600 py-1.5"
                  >
                    {user.role === 'PATIENT' ? 'My Medical Documents' : 'Patient Documents'}
                  </Link>
                  <Link
                    to="/consents"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-semibold text-slate-700 hover:text-teal-600 py-1.5"
                  >
                    {user.role === 'PATIENT' ? 'My Consents' : 'Digital Consents'}
                  </Link>
                </>
              )}
              {(user.role === 'ADMIN' || user.role === 'AUDITOR') && (
                <Link
                  to="/audit-trail"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-semibold text-slate-700 hover:text-teal-600 py-1.5"
                >
                  Audit Trail Ledger
                </Link>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full text-left text-sm font-semibold text-red-600 py-1.5 flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </>
          ) : (
            <div className="flex flex-col space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-semibold text-white bg-teal-600 rounded-xl"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
