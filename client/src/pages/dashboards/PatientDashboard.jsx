import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../api/client.js';
import {
  FileText,
  FileCheck2,
  Clock,
  Bell,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Download,
  Eye,
  CheckCircle2,
  Activity,
  Calendar,
  User,
  HeartPulse,
  ChevronRight,
  Filter,
  Search,
  ExternalLink
} from 'lucide-react';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        const res = await api.get('/dashboard/patient');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load patient records. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 animate-pulse">
        <div className="h-44 bg-slate-200 rounded-3xl"></div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-slate-200 rounded-2xl"></div>
          <div className="h-72 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-lg mx-auto">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-red-900">Health Record Loading Issue</h3>
          <p className="text-sm text-red-700 mt-1 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold shadow"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const { stats, recentDocuments = [], recentConsents = [], recentActivity = [], patient } = data || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-800 to-cyan-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 text-xs font-semibold mb-3 border border-teal-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              Patient ID: {patient?.patientNumber || 'PAT-2026-0042'} · Blood Group: {patient?.bloodGroup || 'O+'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Patient'}
            </h1>
            <p className="mt-1 text-slate-300 text-sm max-w-xl">
              Your patient health records, active surgical consents, and AI-powered terminology clarification hub.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('pending')}
              className="px-4 py-2.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-bold transition-all shadow-md shadow-teal-500/20 flex items-center gap-2"
            >
              <FileCheck2 className="w-4 h-4" />
              Pending Consent ({stats?.pendingConsents || 0} Action Required)
            </button>
          </div>
        </div>
      </div>

      {/* Top 5 Metric Cards (Section 8 specs) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Pending Consents */}
        <div
          onClick={() => setActiveTab('pending')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pending Consents</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{stats?.pendingConsents ?? 1}</div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1">Review procedure & risks</div>
        </div>

        {/* Medical Documents */}
        <div
          onClick={() => setActiveTab('documents')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-teal-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Medical Documents</span>
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{stats?.documents ?? 4}</div>
          <div className="text-[11px] text-teal-600 font-semibold mt-1">Vault stored records</div>
        </div>

        {/* Active Consents */}
        <div
          onClick={() => setActiveTab('active')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Consents</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600">{stats?.activeConsents ?? 1}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Legally effective</div>
        </div>

        {/* Expired Consents */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Expired Consents</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-700">{stats?.expiredConsents ?? 0}</div>
          <div className="text-[11px] text-slate-500 font-semibold mt-1">Past procedure window</div>
        </div>

        {/* Notifications */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Notifications</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-blue-600">{stats?.notifications ?? 1}</div>
          <div className="text-[11px] text-blue-600 font-semibold mt-1">Pending alerts</div>
        </div>
      </div>

      {/* Quick Action Navigation Bar (Section 8 specs) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Dashboard Overview
          </button>
          <Link
            to="/documents"
            className="px-4 py-2 rounded-xl text-xs font-bold transition-all text-slate-700 hover:bg-teal-50 hover:text-teal-700 border border-slate-200 flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-teal-600" />
            Open Documents Vault ({stats?.documents || 0})
          </Link>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'pending'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Pending Consents ({stats?.pendingConsents || 0})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'active'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Active Consents ({stats?.activeConsents || 0})
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Last synchronization: <span className="font-mono text-slate-700">Live</span>
        </div>
      </div>

      {/* Highlighted Pending Consent Banner with AI Assistance Preview */}
      {recentConsents.filter(c => c.status === 'SENT' || c.status === 'UNDER_REVIEW').map(consent => (
        <div key={consent._id} className="bg-amber-50/80 border border-amber-300 rounded-3xl p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-900 bg-amber-200 px-2 py-0.5 rounded-md">
                    Signature Required
                  </span>
                  <span className="text-xs font-mono text-slate-500">v{consent.version}.0</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                  {consent.procedure}
                </h3>
                <p className="text-xs text-slate-600">
                  Issued by {consent.doctorId?.userId?.name || 'Assigned Clinician'} · Expires{' '}
                  {new Date(consent.expiresAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-amber-800 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full shrink-0">
              Pending Patient Decision
            </span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed bg-white/80 p-4 rounded-2xl border border-amber-200/60 mb-4">
            <strong className="text-slate-900">Clinical Purpose:</strong> {consent.purpose}
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-teal-800 font-semibold bg-teal-100/70 px-3 py-1.5 rounded-xl border border-teal-200">
              <Sparkles className="w-4 h-4 text-teal-700 shrink-0" />
              <span>AI Plain-Language Translation & Terminology Explanation Ready</span>
            </div>
            <button
              onClick={() => alert(`Phase 5 will open digital consent agreement for "${consent.procedure}" with full Gemini AI explanation, term clarify, and OTP signature.`)}
              className="px-5 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2 shrink-0"
            >
              Review Consent & Explain with AI
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}

      {/* Main Grid: Recent Documents & Recent Access Activity (Section 8 specs) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 spans): Recent Documents */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Your Medical Documents Vault</h2>
                <p className="text-xs text-slate-500">Directly authorized clinical records & diagnostic reports</p>
              </div>
              <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
                {recentDocuments.length} Documents
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {recentDocuments.length > 0 ? (
                recentDocuments.map((doc) => (
                  <div key={doc._id} className="p-5 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                            {doc.documentType}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">v{doc.version}.0</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 truncate mt-0.5">
                          {doc.title}
                        </h4>
                        <p className="text-xs text-slate-500 truncate mt-0.5 max-w-md">
                          {doc.description || 'Uploaded by ' + (doc.uploadedBy?.name || 'Physician')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => alert(`Opening secure viewer for ${doc.title}... (Phase 4 Signed URL)`)}
                        className="p-2 text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-xl border border-slate-200 transition-colors"
                        title="Preview Document"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => alert(`Generating time-limited signed download URL for ${doc.title}... (Phase 4 Signed URL)`)}
                        className="p-2 text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-xl border border-slate-200 transition-colors"
                        title="Download Document"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No medical documents uploaded yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1 span): Recent Access Activity Transparency (Section 8 & 26 specs) */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900">Document Access Transparency</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Audit Log</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Real-time audit log of medical personnel and systems interacting with your records:
            </p>

            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.map((act) => (
                  <div key={act._id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-800 truncate">{act.action}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        By <span className="font-semibold text-slate-700">{act.userName || act.role}</span> ({act.role})
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">No recent access events recorded.</p>
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 text-center">
              <span className="text-xs text-teal-700 font-semibold flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> End-to-End Cryptographically Audited
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
