import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/client.js';
import {
  FileCheck2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  Sparkles,
  ArrowRight,
  PlusCircle,
  Search,
  Filter,
  Calendar,
  User,
  ShieldCheck,
  AlertCircle,
  Layers,
  ChevronRight,
  FileText
} from 'lucide-react';

export default function ConsentsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [search, setSearch] = useState('');

  const isDoctorOrAdmin = user?.role === 'DOCTOR' || user?.role === 'ADMIN';

  async function fetchConsents() {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (activeTab !== 'ALL') {
        params.status = activeTab;
      }
      const res = await api.get('/consents', { params });
      if (res.data.success) {
        setConsents(res.data.consents);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load consent agreements.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchConsents();
  }, [activeTab]);

  const filteredConsents = consents.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.procedure?.toLowerCase().includes(q) ||
      c.purpose?.toLowerCase().includes(q) ||
      c.doctorId?.userId?.name?.toLowerCase().includes(q) ||
      c.patientId?.patientNumber?.toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Active & Signed
          </span>
        );
      case 'SENT':
      case 'VIEWED':
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Action Required
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3.5 h-3.5" /> Declined
          </span>
        );
      case 'REVOKED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <AlertOctagon className="w-3.5 h-3.5" /> Revoked / Withdrawn
          </span>
        );
      case 'EXPIRED':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <Clock className="w-3.5 h-3.5" /> Expired
          </span>
        );
    }
  };

  const getExpiryDays = (expiresAt) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    if (days < 0) return 'Expired';
    if (days === 0) return 'Expires today';
    return `Expires in ${days} days`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 text-xs font-semibold mb-3 border border-teal-500/30">
              <FileCheck2 className="w-3.5 h-3.5" />
              Informed Consent & AI Comprehension Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Clinical Consent Agreements
            </h1>
            <p className="mt-1 text-slate-300 text-sm max-w-xl">
              Transparent digital informed consent workflows with cryptographic version control, plain-language AI explanation, and auditable digital signatures.
            </p>
          </div>

          {isDoctorOrAdmin && (
            <Link
              to="/consents/new"
              className="px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-teal-500/25 flex items-center gap-2 shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              Create Consent Request
            </Link>
          )}
        </div>
      </div>

      {/* Tabs & Search Filter Bar (Section 16 specs) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search consents by procedure, clinical purpose, or physician..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Total Agreements: <strong className="text-slate-800">{filteredConsents.length}</strong>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'ALL', label: 'All Agreements' },
            { id: 'SENT', label: 'Pending Action' },
            { id: 'ACTIVE', label: 'Active & Signed' },
            { id: 'REJECTED', label: 'Declined' },
            { id: 'REVOKED', label: 'Revoked' },
            { id: 'EXPIRED', label: 'Expired' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                activeTab === tab.id
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Consent Agreements Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-200 rounded-3xl"></div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-lg mx-auto">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
          <h3 className="text-base font-bold text-red-900">{error}</h3>
        </div>
      ) : filteredConsents.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No consent agreements found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            No agreements match the selected status filter.
          </p>
          <button
            onClick={() => {
              setActiveTab('ALL');
              setSearch('');
            }}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
          >
            Show All Consents
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredConsents.map((consent) => (
            <div
              key={consent._id}
              className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-6 sm:p-7 flex flex-col justify-between"
            >
              <div>
                {/* Status + Version + Expiration pill */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(consent.status)}
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                      Version {consent.version}.0
                    </span>
                  </div>

                  <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                    {getExpiryDays(consent.expiresAt)}
                  </span>
                </div>

                {/* Procedure Title */}
                <h3 className="text-lg font-bold text-slate-900 mb-1.5 leading-snug">
                  {consent.procedure}
                </h3>

                {/* Purpose */}
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                  <strong>Clinical Purpose:</strong> {consent.purpose}
                </p>

                {/* Doctor and Patient Meta */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600 mb-5">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Attending Clinician</span>
                    <span className="font-bold text-slate-800 truncate block">
                      {consent.doctorId?.userId?.name || 'Dr. Robert Chen, MD'}
                    </span>
                    <span className="text-[10px] text-slate-500">{consent.doctorId?.department || 'Surgery'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Patient Subject</span>
                    <span className="font-bold text-slate-800 truncate block">
                      {consent.patientId?.userId?.name || 'Patient'}
                    </span>
                    <span className="text-[10px] font-mono text-teal-600">{consent.patientId?.patientNumber || 'PAT-CURRENT'}</span>
                  </div>
                </div>

                {/* AI Feature Indicator */}
                <div className="flex items-center gap-2 text-[11px] text-teal-800 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200 mb-5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>Gemini AI simplification & terminology clarification enabled</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  Issued: {new Date(consent.sentAt || consent.createdAt).toLocaleDateString()}
                </span>
                <Link
                  to={`/consents/${consent._id}`}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md shadow-teal-600/20 transition-all flex items-center gap-1.5"
                >
                  {consent.status === 'SENT' || consent.status === 'VIEWED' || consent.status === 'UNDER_REVIEW'
                    ? 'Review & Decide with AI'
                    : 'View Agreement Details'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
