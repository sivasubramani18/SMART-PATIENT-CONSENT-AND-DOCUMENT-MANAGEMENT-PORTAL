import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  UserCheck,
  Stethoscope,
  HeartHandshake,
  ShieldAlert,
  Eye,
  Check
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, getDashboardRoute } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      const from = location.state?.from?.pathname;
      const targetRoute = from || getDashboardRoute(result.user.role);
      navigate(targetRoute, { replace: true });
    } else {
      setError(result.message);
    }
  };

  const handleQuickDemoLogin = async (demoEmail, demoRole) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setError('');
    setLoading(true);

    const result = await login(demoEmail, 'Password123!');
    setLoading(false);

    if (result.success) {
      navigate(getDashboardRoute(result.user.role), { replace: true });
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 gradient-hero">
      <div className="max-w-xl w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-teal-500/25 mb-4">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Sign In to ConsentIQ
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Secure clinical authentication with role-based access control
          </p>
        </div>

        {/* Quick Demo Credentials Panel */}
        <div className="bg-white/90 backdrop-blur rounded-2xl border border-teal-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
              1-Click Demo Accounts (Development & Review)
            </span>
            <span className="text-[11px] font-mono text-slate-400">Password: Password123!</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickDemoLogin('patient@hospital.demo', 'PATIENT')}
              className="flex items-center justify-start gap-2.5 p-2.5 rounded-xl border border-teal-100 bg-teal-50/50 hover:bg-teal-100/70 text-left transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-teal-500 text-white flex items-center justify-center shrink-0">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-teal-900 leading-tight">Patient Portal</div>
                <div className="text-[10px] text-teal-700 truncate">patient@hospital.demo</div>
              </div>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickDemoLogin('doctor@hospital.demo', 'DOCTOR')}
              className="flex items-center justify-start gap-2.5 p-2.5 rounded-xl border border-blue-100 bg-blue-50/50 hover:bg-blue-100/70 text-left transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Stethoscope className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-blue-900 leading-tight">Doctor Portal</div>
                <div className="text-[10px] text-blue-700 truncate">doctor@hospital.demo</div>
              </div>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickDemoLogin('admin@hospital.demo', 'ADMIN')}
              className="flex items-center justify-start gap-2.5 p-2.5 rounded-xl border border-purple-100 bg-purple-50/50 hover:bg-purple-100/70 text-left transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-purple-900 leading-tight">Hospital Admin</div>
                <div className="text-[10px] text-purple-700 truncate">admin@hospital.demo</div>
              </div>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickDemoLogin('auditor@hospital.demo', 'AUDITOR')}
              className="flex items-center justify-start gap-2.5 p-2.5 rounded-xl border border-amber-100 bg-amber-50/50 hover:bg-amber-100/70 text-left transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0">
                <Eye className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-amber-900 leading-tight">Auditor Portal</div>
                <div className="text-[10px] text-amber-700 truncate">auditor@hospital.demo</div>
              </div>
            </button>
          </div>
        </div>

        {/* Manual Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
              <div>
                <p className="font-semibold">Authentication Error</p>
                <p className="text-xs mt-0.5 text-red-600">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Hospital Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@hospital.demo"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Password
                </label>
                <span className="text-xs text-teal-600 hover:underline cursor-pointer">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center py-3 px-4 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md shadow-teal-600/20 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In to Portal
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              Need a new patient or clinician account?{' '}
              <Link to="/register" className="font-semibold text-teal-600 hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
