import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../api/client.js';
import {
  Eye,
  ShieldCheck,
  Search,
  Filter,
  FileText,
  Clock,
  CheckCircle2,
  Lock,
  ArrowUpDown,
  RefreshCw,
  AlertCircle,
  XCircle,
  FileBadge,
  Calendar,
  X
} from 'lucide-react';

export default function AuditorDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  async function fetchLogs() {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedRole) params.role = selectedRole;
      if (selectedAction) params.action = selectedAction;

      const res = await api.get('/dashboard/auditor', { params });
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to retrieve compliance logs.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLogs();
  }, [selectedRole, selectedAction]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  const { stats, logs = [] } = data || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 text-xs font-semibold mb-3 border border-amber-500/30">
              <Eye className="w-3.5 h-3.5" />
              Role: Independent Compliance Auditor (Strict Read-Only)
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Audit & Compliance Explorer — {user.name}
            </h1>
            <p className="mt-1 text-slate-300 text-sm max-w-xl">
              Inspect immutable transaction records, verify consent versioning hashes, and evaluate emergency break-glass procedures.
            </p>
          </div>

          <div className="bg-amber-950/60 border border-amber-500/40 rounded-2xl p-4 text-xs text-amber-200 max-w-xs">
            <span className="font-bold flex items-center gap-1.5 text-amber-300 mb-1">
              <Lock className="w-3.5 h-3.5" /> Read-Only Safeguard Active
            </span>
            Auditors can query all historical records but cannot edit, delete, or override clinical records.
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Audit Events</span>
          <div className="text-3xl font-black text-slate-900 mt-1">{stats?.totalEvents ?? logs.length}</div>
          <div className="text-[11px] text-teal-600 font-semibold mt-0.5">Cryptographically logged</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Break-Glass Invocations</span>
          <div className="text-3xl font-black text-amber-600 mt-1">{stats?.emergencyEvents ?? 0}</div>
          <div className="text-[11px] text-amber-600 font-semibold mt-0.5">Emergency overrides</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Failed Access Invocations</span>
          <div className="text-3xl font-black text-red-600 mt-1">{stats?.failedAttempts ?? 0}</div>
          <div className="text-[11px] text-red-600 font-semibold mt-0.5">Blocked by RBAC / Bad Pass</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Matching Query Results</span>
          <div className="text-3xl font-black text-blue-600 mt-1">{logs.length}</div>
          <div className="text-[11px] text-blue-600 font-semibold mt-0.5">Displayed on page</div>
        </div>
      </div>

      {/* Filter and Search Bar (Section 27 specs) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by actor name, email, action, IP..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shrink-0"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
          >
            <option value="">All Roles</option>
            <option value="DOCTOR">Doctor</option>
            <option value="PATIENT">Patient</option>
            <option value="ADMIN">Admin</option>
            <option value="AUDITOR">Auditor</option>
          </select>

          {/* Action Filter */}
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
          >
            <option value="">All Actions</option>
            <option value="LOGIN_SUCCESS">LOGIN_SUCCESS</option>
            <option value="CREATE_CONSENT">CREATE_CONSENT</option>
            <option value="ACCEPT_CONSENT">ACCEPT_CONSENT</option>
            <option value="UPLOAD_DOCUMENT">UPLOAD_DOCUMENT</option>
            <option value="VIEW_DOCUMENT">VIEW_DOCUMENT</option>
          </select>

          <button
            onClick={() => {
              setSearch('');
              setSelectedRole('');
              setSelectedAction('');
              fetchLogs();
            }}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200"
            title="Reset Filters"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Audit Log Table (Section 27 specs) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Immutable Audit Record Feed</h3>
            <p className="text-xs text-slate-500">Chronological timestamped events with device IP origin</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg border border-amber-200">
            {logs.length} Total Retrieved
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Actor / User</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Action Event</th>
                <th className="px-5 py-3.5">Resource Domain</th>
                <th className="px-5 py-3.5">IP Address</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-mono text-slate-800 font-bold">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-slate-900 font-bold">{log.userName || log.userEmail || 'Anonymous'}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{log.userEmail}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {log.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 font-semibold">{log.resourceType}</td>
                    <td className="px-5 py-3.5 font-mono text-slate-500">{log.ipAddress || '127.0.0.1'}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                          log.status === 'SUCCESS'
                            ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                            : 'text-red-700 bg-red-50 border-red-200'
                        }`}
                      >
                        {log.status === 'SUCCESS' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {log.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-slate-500">
                    No audit events match your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Log Drawer Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileBadge className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">Audit Record Inspector</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100 font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">RECORD ID</span>
                  <span className="font-bold text-slate-800">{selectedLog._id}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">TIMESTAMP</span>
                  <span className="font-bold text-slate-800">{new Date(selectedLog.timestamp).toISOString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">ACTOR ROLE</span>
                  <span className="font-bold text-teal-700">{selectedLog.role}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">CLIENT IP</span>
                  <span className="font-bold text-slate-800">{selectedLog.ipAddress}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Action Event</span>
                <div className="p-2.5 bg-teal-50 border border-teal-200 rounded-xl text-teal-900 font-mono font-bold">
                  {selectedLog.action}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">User Agent Header</span>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-mono text-[11px] truncate">
                  {selectedLog.userAgent || 'system'}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Metadata Payload</span>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] overflow-x-auto max-h-36">
                  {JSON.stringify(selectedLog.metadata || {}, null, 2)}
                </pre>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
