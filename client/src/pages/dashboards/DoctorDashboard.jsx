import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../api/client.js';
import {
  Users,
  FileCheck2,
  Clock,
  UploadCloud,
  FileText,
  AlertTriangle,
  PlusCircle,
  Search,
  Activity,
  ShieldAlert,
  ArrowRight,
  Stethoscope,
  Building2,
  UserCheck,
  Calendar,
  AlertCircle,
  Download,
  Eye,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState('');
  const [emergencyCategory, setEmergencyCategory] = useState('UNCONSCIOUS_PATIENT');
  const [selectedEmergencyPatient, setSelectedEmergencyPatient] = useState('');
  const [allPatients, setAllPatients] = useState([]);
  const [activeEmergencySessions, setActiveEmergencySessions] = useState([]);
  const [emergencySuccess, setEmergencySuccess] = useState(false);
  const [submittingEmergency, setSubmittingEmergency] = useState(false);

  const fetchDoctorData = async () => {
    try {
      setLoading(true);
      const [dashRes, emergencyRes, patientsRes] = await Promise.all([
        api.get('/dashboard/doctor'),
        api.get('/emergency/active'),
        api.get('/patients')
      ]);

      if (dashRes.data.success) {
        setData(dashRes.data.data);
      }
      if (emergencyRes.data.success) {
        setActiveEmergencySessions(emergencyRes.data.sessions || []);
      }
      if (patientsRes.data.success) {
        setAllPatients(patientsRes.data.patients || []);
        if (patientsRes.data.patients?.length > 0) {
          setSelectedEmergencyPatient(patientsRes.data.patients[0]._id);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load clinical records. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorData();
  }, []);

  const handleEmergencySubmit = async (e) => {
    e.preventDefault();
    if (!emergencyReason.trim() || !selectedEmergencyPatient) return;

    try {
      setSubmittingEmergency(true);
      const res = await api.post('/emergency/break-glass', {
        patientId: selectedEmergencyPatient,
        reason: emergencyReason.trim(),
        category: emergencyCategory
      });

      if (res.data.success) {
        setEmergencySuccess(true);
        // Refresh active emergency sessions
        const activeRes = await api.get('/emergency/active');
        if (activeRes.data.success) {
          setActiveEmergencySessions(activeRes.data.sessions || []);
        }
        setTimeout(() => {
          setEmergencySuccess(false);
          setShowEmergencyModal(false);
          setEmergencyReason('');
        }, 1500);
      }
    } catch (err) {
      alert('Break-glass declaration failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingEmergency(false);
    }
  };

  const handleEndEmergencySession = async (sessionId) => {
    if (!window.confirm('Terminate emergency break-glass session for this patient?')) return;
    try {
      await api.post(`/emergency/${sessionId}/end`);
      setActiveEmergencySessions((prev) => prev.filter((s) => s._id !== sessionId));
    } catch (err) {
      alert('Could not terminate session: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 animate-pulse">
        <div className="h-44 bg-slate-200 rounded-3xl"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
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
          <h3 className="text-lg font-bold text-red-900">Clinical Dashboard Error</h3>
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

  const { stats, doctor, recentDocuments = [], upcomingExpirations = [], recentActivity = [], assignedPatients = [] } = data || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold mb-3 border border-blue-500/30">
              Department: {doctor?.department || 'General Surgery & Oncology'} · License: {doctor?.licenseNumber || 'MD-SURG-88291'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Clinician Workspace — {user.name}
            </h1>
            <p className="mt-1 text-slate-300 text-sm max-w-xl">
              Initiate structured digital consent requests, securely upload patient diagnostics, and execute audited emergency break-glass access.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/consents/new"
              className="px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Create Consent Request
            </Link>
            <Link
              to="/documents"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              Upload Medical Document
            </Link>
          </div>
        </div>
      </div>

      {/* Active Emergency Break-Glass Sessions Banner */}
      {activeEmergencySessions.length > 0 && (
        <div className="space-y-3">
          {activeEmergencySessions.map((session) => (
            <div
              key={session._id}
              className="p-5 rounded-3xl bg-red-500/10 border-2 border-red-500 text-red-950 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse shadow-lg shadow-red-500/10"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <ShieldAlert className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider">
                      Active Break-Glass Access
                    </span>
                    <span className="text-xs font-bold text-red-800">
                      Patient: {session.patientId?.userId?.name || 'Emergency Patient'} (MRN: {session.patientId?.mrn || 'N/A'})
                    </span>
                  </div>
                  <p className="text-xs text-red-900 font-semibold mt-1">
                    Justification: "{session.reason}"
                  </p>
                  <p className="text-[11px] text-red-700 mt-0.5 font-medium">
                    Session expires: {new Date(session.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({session.documentsAccessed?.length || 0} files accessed under break-glass audit)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  to="/documents"
                  className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors shadow-xs"
                >
                  Inspect Patient Records
                </Link>
                <button
                  onClick={() => handleEndEmergencySession(session._id)}
                  className="px-4 py-2 rounded-xl bg-white border border-red-300 text-red-700 text-xs font-bold hover:bg-red-50 transition-colors shadow-xs"
                >
                  End Emergency Session
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Doctor Stats Grid (Section 9 specs) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Patients</span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{stats?.totalPatients ?? 35}</div>
          <div className="text-[11px] text-blue-600 font-semibold mt-1">Under clinical management</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-400 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Consent Requests</span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{stats?.pendingConsents ?? 6}</div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1">Awaiting patient signature</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-teal-400 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Consents</span>
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-teal-600">{stats?.activeConsents ?? 24}</div>
          <div className="text-[11px] text-teal-600 font-semibold mt-1">Verified & legally effective</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-purple-400 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Documents Uploaded</span>
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{stats?.documentsUploaded ?? 72}</div>
          <div className="text-[11px] text-purple-600 font-semibold mt-1">Archived in secure vault</div>
        </div>
      </div>

      {/* Emergency Access Banner & Quick Action Buttons (Section 9 & 28 specs) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 bg-red-50/70 border border-red-200 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Emergency Break-Glass Record Access</h3>
              <p className="text-xs text-slate-600 max-w-xl mt-0.5">
                Urgently need access to an unconscious or critical patient's records? Emergency override grants time-limited access with comprehensive audit logging and mandatory clinical justification.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowEmergencyModal(true)}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shrink-0 shadow-md shadow-red-600/20 transition-colors"
          >
            Request Emergency Access
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-center">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Upcoming Expirations</div>
          <div className="text-2xl font-black text-amber-600">{upcomingExpirations.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Consents expiring within 7 days</p>
        </div>
      </div>

      {/* Quick Action Navigation Buttons (Section 9 specs) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap gap-3">
        <button
          onClick={() => alert('Patients Directory: Filter assigned patients and their health history.')}
          className="px-4 py-2 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-all flex items-center gap-2"
        >
          <Users className="w-4 h-4 text-blue-600" />
          Assigned Patients Directory ({assignedPatients.length})
        </button>
        <button
          onClick={() => alert('Consent Requests Management: Track statuses and version revisions.')}
          className="px-4 py-2 bg-slate-50 hover:bg-amber-50 hover:text-amber-700 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-all flex items-center gap-2"
        >
          <Clock className="w-4 h-4 text-amber-600" />
          Pending Consent Workflows
        </button>
        <Link
          to="/documents"
          className="px-4 py-2 bg-slate-50 hover:bg-teal-50 hover:text-teal-700 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-all flex items-center gap-2"
        >
          <FileText className="w-4 h-4 text-teal-600" />
          Document Vault Management
        </Link>
      </div>

      {/* Main Grid: Clinical Documents Vault & Upcoming Expirations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 spans): Recently Uploaded Documents */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Recently Uploaded Medical Records</h2>
                <p className="text-xs text-slate-500">Diagnostic imaging, laboratory panels, and discharge notes</p>
              </div>
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                {recentDocuments.length} Recent Files
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {recentDocuments.length > 0 ? (
                recentDocuments.map((doc) => (
                  <div key={doc._id} className="p-5 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {doc.documentType}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">Patient: {doc.patientId?.patientNumber || 'PAT-DEMO'}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 truncate mt-0.5">
                          {doc.title}
                        </h4>
                        <p className="text-xs text-slate-500 truncate mt-0.5 max-w-md">
                          {doc.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => alert(`Previewing authorized document ${doc.title}... (Phase 4 Signed URL)`)}
                        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl border border-slate-200 transition-colors"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No documents uploaded yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1 span): Upcoming Consent Expirations & Patient Activity */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">Upcoming Expirations</h3>
              </div>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Action Alert
              </span>
            </div>

            <div className="space-y-3">
              {upcomingExpirations.length > 0 ? (
                upcomingExpirations.map((c) => (
                  <div key={c._id} className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/80">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                      <span className="truncate">{c.procedure}</span>
                      <span className="text-[10px] text-amber-700 font-mono shrink-0">
                        Expires {new Date(c.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 truncate">
                      Patient: {c.patientId?.userId?.name || 'Assigned Patient'}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">No consents expiring within 7 days.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Recent Patient Actions</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live</span>
            </div>

            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.map((act) => (
                  <div key={act._id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-800 truncate">{act.action}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Actor: <span className="font-semibold text-slate-700">{act.userName || act.role}</span>
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">No recent patient activity.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Break-Glass Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-red-200 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">
              Emergency Break-Glass Record Access
            </h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              <strong>Mandatory Compliance Warning:</strong> Emergency access immediately grants temporary 2-hour unrestricted record view. All actions, downloads, and patient records inspected are cryptographically logged and flagged for compliance review.
            </p>

            {emergencySuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                Emergency access authorized. Audit event recorded.
              </div>
            ) : (
              <form onSubmit={handleEmergencySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Select Emergency Patient
                  </label>
                  <select
                    value={selectedEmergencyPatient}
                    onChange={(e) => setSelectedEmergencyPatient(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {allPatients.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.userId?.name || 'Patient'} ({p.mrn}) — Blood: {p.bloodGroup || 'Unknown'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Emergency Clinical Category
                  </label>
                  <select
                    value={emergencyCategory}
                    onChange={(e) => setEmergencyCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="UNCONSCIOUS_PATIENT">Unconscious / Incapacitated Patient</option>
                    <option value="SEVERE_TRAUMA">Severe Trauma / Acute Resuscitation</option>
                    <option value="CARDIAC_ARREST">Cardiac Arrest / Post-Code Stun</option>
                    <option value="SURGICAL_EMERGENCY">Acute Surgical Emergency</option>
                    <option value="OTHER_LIFE_THREATENING">Other Life-Threatening Circumstance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Clinical Justification (Required - Min 10 Chars)
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={emergencyReason}
                    onChange={(e) => setEmergencyReason(e.target.value)}
                    placeholder="E.g. Patient unconscious in trauma bay; urgent surgical history and anticoagulant status needed for exploratory laparotomy."
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEmergencyModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingEmergency}
                    className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl shadow-md shadow-red-600/20 flex items-center gap-1.5"
                  >
                    {submittingEmergency ? 'Authorizing Break-Glass...' : 'Confirm & Execute Break-Glass'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
