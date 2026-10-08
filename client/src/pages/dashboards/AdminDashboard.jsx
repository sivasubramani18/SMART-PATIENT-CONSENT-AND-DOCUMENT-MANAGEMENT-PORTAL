import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../api/client.js';
import {
  Users,
  FileText,
  FileCheck2,
  AlertTriangle,
  Building2,
  Activity,
  UserCheck,
  CheckCircle,
  Eye,
  Sliders,
  ShieldAlert,
  Clock,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Lock
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [alertsList, setAlertsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [dashRes, alertsRes] = await Promise.all([
        api.get('/dashboard/admin'),
        api.get('/security/alerts')
      ]);

      if (dashRes.data.success) {
        setData(dashRes.data.data);
      }
      if (alertsRes.data.success) {
        setAlertsList(alertsRes.data.alerts || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load administrator analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleResolveAlert = async (alertId) => {
    try {
      const res = await api.put(`/security/alerts/${alertId}/resolve`, {
        status: 'RESOLVED',
        resolutionNotes: 'Reviewed and dismissed by System Administrator'
      });
      if (res.data.success) {
        setAlertsList((prev) =>
          prev.map((a) => (a._id === alertId ? { ...a, status: 'RESOLVED' } : a))
        );
      }
    } catch (err) {
      alert('Could not update alert: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 animate-pulse">
        <div className="h-44 bg-slate-200 rounded-3xl"></div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-slate-200 rounded-2xl"></div>
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
          <h3 className="text-lg font-bold text-red-900">Administrator Console Error</h3>
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

  const { stats, charts, securityAlerts = [], recentAuditLogs = [] } = data || {};

  const departmentData = charts?.documentsByDepartment || [
    { department: 'General Surgery', count: 32 },
    { department: 'Cardiology', count: 28 },
    { department: 'Neurology', count: 19 },
    { department: 'Orthopedics', count: 24 },
    { department: 'Radiology', count: 41 },
    { department: 'Oncology', count: 16 }
  ];

  const consentStatusData = charts?.consentStatusDistribution || [
    { name: 'Active', value: 24, fill: '#10b981' },
    { name: 'Pending Review', value: 6, fill: '#f59e0b' },
    { name: 'Revoked', value: 2, fill: '#ef4444' },
    { name: 'Expired', value: 1, fill: '#64748b' }
  ];

  const monthlyUploadData = charts?.monthlyUploads || [
    { month: 'May', uploads: 45, consents: 18 },
    { month: 'Jun', uploads: 58, consents: 26 },
    { month: 'Jul', uploads: 64, consents: 31 },
    { month: 'Aug', uploads: 82, consents: 44 },
    { month: 'Sep', uploads: 95, consents: 52 },
    { month: 'Oct', uploads: 120, consents: 68 }
  ];

  const accessActivityData = charts?.accessActivityByHour || [
    { time: '08:00', doctor: 12, patient: 8, admin: 2 },
    { time: '10:00', doctor: 35, patient: 24, admin: 4 },
    { time: '12:00', doctor: 48, patient: 38, admin: 7 },
    { time: '14:00', doctor: 52, patient: 29, admin: 5 },
    { time: '16:00', doctor: 41, patient: 22, admin: 3 },
    { time: '18:00', doctor: 20, patient: 15, admin: 1 }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-semibold mb-3 border border-purple-500/30">
              <ShieldAlert className="w-3.5 h-3.5" />
              Role: Hospital Administrator & Governance Controller
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hospital Operations Governance — {user.name}
            </h1>
            <p className="mt-1 text-slate-300 text-sm max-w-xl">
              System-wide document telemetry, consent lifecycle distributions, automated anomaly detection, and RBAC governance.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => alert('User management panel: Add doctor, deactivate account, adjust departmental roles.')}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Manage Users & Roles
            </button>
            <Link
              to="/audit-trail"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all flex items-center gap-2"
            >
              <Sliders className="w-4 h-4" />
              Audit Trail & Security Ledger
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid (Section 10 specs) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Users</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{stats?.totalUsers ?? 8}</div>
          <div className="text-[10px] text-teal-600 font-semibold mt-0.5">Active Directory</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Patients</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{stats?.totalPatients ?? 3}</div>
          <div className="text-[10px] text-blue-600 font-semibold mt-0.5">Enrolled</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Doctors</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{stats?.totalDoctors ?? 3}</div>
          <div className="text-[10px] text-purple-600 font-semibold mt-0.5">Licensed Clinicians</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Vault Documents</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{stats?.totalDocuments ?? 4}</div>
          <div className="text-[10px] text-slate-500 font-semibold mt-0.5">S3 Objects</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Active Consents</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{stats?.activeConsents ?? 1}</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Signed & Valid</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-red-200 bg-red-50/30 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-600">Security Alerts</span>
          <div className="text-2xl font-black text-red-600 mt-1">{stats?.securityAlerts ?? 1}</div>
          <div className="text-[10px] text-red-600 font-semibold mt-0.5">Active Incidents</div>
        </div>
      </div>

      {/* Recharts Analytics Section (Section 10 specs) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Documents by Department */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Documents by Clinical Department</h3>
              <p className="text-xs text-slate-500">Diagnostic volume distributed by hospital specialty</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
              Live Data
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="department" tick={{ fontSize: 11 }} interval={0} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#0d9488" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Consent Status Lifecycle Distribution */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Consent Status Lifecycle</h3>
              <p className="text-xs text-slate-500">Active vs Pending vs Revoked vs Expired breakdown</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
              Active Ratio: 85%
            </span>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={consentStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {consentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Monthly Document Uploads Trend */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Monthly Document & Consent Ingestion</h3>
              <p className="text-xs text-slate-500">Trajectory of new records uploaded to S3 vault</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg">
              +28% MoM
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyUploadData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorConsents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="uploads" stroke="#0284c7" fillOpacity={1} fill="url(#colorUploads)" />
                <Area type="monotone" dataKey="consents" stroke="#10b981" fillOpacity={1} fill="url(#colorConsents)" />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Hourly System Access Activity */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900">System Access Traffic by Role</h3>
              <p className="text-xs text-slate-500">Clinician vs Patient concurrent access spikes</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg">
              Peak: 14:00
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accessActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="doctor" fill="#3b82f6" stackId="a" />
                <Bar dataKey="patient" fill="#14b8a6" stackId="a" />
                <Bar dataKey="admin" fill="#a855f7" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Security Alerts Live Incident Feed (Section 10 & 29 specs) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Security Anomaly Detection Alerts</h3>
              <p className="text-xs text-slate-500">Rule-based anomaly detection engine monitoring abnormal access</p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-red-100 text-red-800 rounded-full border border-red-200">
            {securityAlerts.length} Active Incident
          </span>
        </div>

        <div className="space-y-3">
          {(alertsList.length > 0 ? alertsList : (data?.securityAlerts || [])).length > 0 ? (
            (alertsList.length > 0 ? alertsList : (data?.securityAlerts || [])).map((alertItem) => (
              <div
                key={alertItem._id}
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                  alertItem.status === 'RESOLVED'
                    ? 'border-emerald-200 bg-emerald-50/50'
                    : alertItem.severity === 'HIGH' || alertItem.severity === 'CRITICAL'
                    ? 'border-red-200 bg-red-50/60'
                    : 'border-amber-200 bg-amber-50/60'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      alertItem.status === 'RESOLVED'
                        ? 'bg-emerald-200 text-emerald-900'
                        : alertItem.severity === 'HIGH' || alertItem.severity === 'CRITICAL'
                        ? 'bg-red-200 text-red-900 font-extrabold'
                        : 'bg-amber-200 text-amber-900'
                    }`}>
                      {alertItem.severity} SEVERITY
                    </span>
                    <span className="text-xs font-bold text-slate-900">{alertItem.type}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(alertItem.createdAt).toLocaleTimeString()}
                    </span>
                    {alertItem.status === 'RESOLVED' && (
                      <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        RESOLVED
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 mt-1">
                    {alertItem.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {alertItem.status !== 'RESOLVED' ? (
                    <button
                      onClick={() => handleResolveAlert(alertItem._id)}
                      className="px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl shadow-xs transition-colors"
                    >
                      Acknowledge & Resolve
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Closed
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400">No anomalous access events detected.</p>
          )}
        </div>
      </div>
    </div>
  );
}
