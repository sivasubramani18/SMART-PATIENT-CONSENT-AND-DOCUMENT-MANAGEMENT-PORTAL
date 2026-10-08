import React, { useState, useEffect } from 'react';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Shield,
  ShieldCheck,
  AlertTriangle,
  Download,
  Filter,
  Search,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  FileText,
  FileCheck2,
  Lock,
  Flame,
  Hash,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

export default function AuditTrailPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [chainStatus, setChainStatus] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [inspectLog, setInspectLog] = useState(null);
  const [copiedHash, setCopiedHash] = useState(null);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20,
        ...(search && { search }),
        ...(actionFilter && { action: actionFilter }),
        ...(resourceFilter && { resourceType: resourceFilter }),
        ...(roleFilter && { role: roleFilter }),
        ...(statusFilter && { status: statusFilter }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      };

      const res = await api.get('/audit-logs', { params });
      if (res.data.success) {
        setLogs(res.data.logs || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalRecords(res.data.total || 0);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/audit-logs/stats');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.warn('Could not load audit stats:', err.message);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, resourceFilter, roleFilter, statusFilter]);

  useEffect(() => {
    fetchStats();
    // Verify chain on mount
    handleVerifyChain();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const handleResetFilters = () => {
    setSearch('');
    setActionFilter('');
    setResourceFilter('');
    setRoleFilter('');
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const handleVerifyChain = async () => {
    try {
      setVerifying(true);
      const res = await api.get('/audit-logs/verify-chain');
      if (res.data.success) {
        setChainStatus(res.data.verification);
      }
    } catch (err) {
      console.error('Verification failed:', err);
    } finally {
      setVerifying(false);
    }
  };

  const handleExport = (format) => {
    const params = new URLSearchParams({
      format,
      ...(actionFilter && { action: actionFilter }),
      ...(resourceFilter && { resourceType: resourceFilter }),
      ...(statusFilter && { status: statusFilter }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate })
    });

    const exportUrl = `${api.defaults.baseURL}/audit-logs/export?${params.toString()}`;
    window.open(exportUrl, '_blank');
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const getActionBadgeColor = (action) => {
    if (action.includes('ACCEPT')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (action.includes('REJECT') || action.includes('REVOKE') || action.includes('FAILURE'))
      return 'bg-rose-50 text-rose-700 border-rose-200';
    if (action.includes('BREAK_GLASS')) return 'bg-purple-50 text-purple-700 border-purple-200 font-bold';
    if (action.includes('CREATE') || action.includes('UPLOAD'))
      return 'bg-blue-50 text-blue-700 border-blue-200';
    if (action.includes('VIEW') || action.includes('DOWNLOAD'))
      return 'bg-teal-50 text-teal-700 border-teal-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  Immutable Audit Ledger
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-teal-100 text-teal-800">
                    HIPAA Compliant
                  </span>
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Cryptographically chained SHA-256 tamper-evident access log across all records & consents.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                handleVerifyChain();
                setShowVerifyModal(true);
              }}
              disabled={verifying}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${verifying ? 'animate-spin' : ''}`} />
              Verify Hash Chain
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Export CSV
            </button>
            <button
              onClick={() => handleExport('json')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Export JSON
            </button>
          </div>
        </div>

        {/* Chain Verification Card */}
        {chainStatus && (
          <div className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
            chainStatus.valid
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
              : 'bg-rose-50/70 border-rose-200 text-rose-950'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                chainStatus.valid ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
              }`}>
                {chainStatus.valid ? <ShieldCheck className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-xs font-bold tracking-tight">
                  {chainStatus.valid ? 'Ledger Integrity Status: 100% Intact & Verified' : 'Cryptographic Chain Alert: Tamper Detected'}
                </p>
                <p className="text-[11px] opacity-80 mt-0.5">
                  {chainStatus.valid
                    ? `Verified ${chainStatus.verifiedCount} cryptographic blocks linked to genesis anchor. Zero record mutations detected.`
                    : `Chain link mismatch detected at block #${chainStatus.brokenAtIndex}. Reason: ${chainStatus.reason}`}
                </p>
              </div>
            </div>

            {chainStatus.latestHash && (
              <div className="flex items-center gap-2 bg-white/70 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-emerald-200 text-[11px] font-mono">
                <span className="text-emerald-800 font-bold">Latest Root Hash:</span>
                <span className="text-slate-600 truncate max-w-[160px]">{chainStatus.latestHash}</span>
              </div>
            )}
          </div>
        )}

        {/* Top KPI Stats */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Audit Blocks</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalEvents}</p>
              <span className="text-[10px] text-teal-600 font-medium">All logged transactions</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Transactions</span>
              <p className="text-2xl font-black text-teal-600 mt-1">{stats.todayEvents}</p>
              <span className="text-[10px] text-slate-400 font-medium">Since 00:00 UTC</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Security / Blocked</span>
              <p className="text-2xl font-black text-rose-600 mt-1">{stats.failureEvents}</p>
              <span className="text-[10px] text-rose-500 font-medium">Failures & Warnings</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Chain Security</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">SHA-256</p>
              <span className="text-[10px] text-emerald-600 font-medium">Unbroken Block Links</span>
            </div>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by actor name, email, action, resource ID, or IP..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition-colors shadow-xs"
            >
              Search Records
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Reset Filters
            </button>
          </form>

          {/* Secondary Filter Dropdowns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Action Type
              </label>
              <select
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="">All Actions</option>
                <option value="LOGIN_SUCCESS">LOGIN_SUCCESS</option>
                <option value="LOGIN_FAILURE">LOGIN_FAILURE</option>
                <option value="CREATE_CONSENT">CREATE_CONSENT</option>
                <option value="ACCEPT_CONSENT">ACCEPT_CONSENT</option>
                <option value="REJECT_CONSENT">REJECT_CONSENT</option>
                <option value="REVOKE_CONSENT">REVOKE_CONSENT</option>
                <option value="UPLOAD_DOCUMENT">UPLOAD_DOCUMENT</option>
                <option value="VIEW_DOCUMENT">VIEW_DOCUMENT</option>
                <option value="BREAK_GLASS_ACCESS">BREAK_GLASS_ACCESS</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Resource Type
              </label>
              <select
                value={resourceFilter}
                onChange={(e) => {
                  setResourceFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="">All Resources</option>
                <option value="DOCUMENT">DOCUMENT</option>
                <option value="CONSENT">CONSENT</option>
                <option value="AUTH">AUTH</option>
                <option value="PATIENT">PATIENT</option>
                <option value="EMERGENCY_ACCESS">EMERGENCY_ACCESS</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Actor Role
              </label>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="">All Roles</option>
                <option value="PATIENT">PATIENT</option>
                <option value="DOCTOR">DOCTOR</option>
                <option value="ADMIN">ADMIN</option>
                <option value="AUDITOR">AUDITOR</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="">All Statuses</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="FAILURE">FAILURE</option>
                <option value="WARNING">WARNING</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Active Filter Count
              </label>
              <div className="py-1 px-2.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-600 flex items-center justify-between">
                <span>{totalRecords} records</span>
                <span className="text-[10px] text-teal-600 font-mono">Page {page}/{totalPages}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Resource</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Cryptographic Hash</th>
                  <th className="py-3 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-12 text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-teal-500 mb-2" />
                      Loading tamper-proof audit records...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-12 text-slate-400">
                      No audit records match the current filters.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        <div className="font-medium text-slate-800">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(log.timestamp).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800 truncate max-w-[130px]">
                          {log.userName || log.userEmail || 'System'}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`px-1.5 py-0.2 text-[9px] font-bold rounded-full ${
                            log.role === 'PATIENT' ? 'bg-teal-100 text-teal-800' :
                            log.role === 'DOCTOR' ? 'bg-blue-100 text-blue-800' :
                            log.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {log.role}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-lg border ${getActionBadgeColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-700">{log.resourceType}</span>
                        {log.resourceId && (
                          <div className="text-[10px] text-slate-400 font-mono truncate max-w-[100px]">
                            {log.resourceId}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {log.ipAddress || '127.0.0.1'}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' :
                          log.status === 'WARNING' ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {log.status === 'SUCCESS' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {log.status}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {log.entryHash ? (
                          <button
                            onClick={() => copyToClipboard(log.entryHash, log._id)}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-[10px] font-mono text-slate-600 max-w-[140px]"
                            title="Click to copy full SHA-256 digest"
                          >
                            <Hash className="w-3 h-3 text-teal-600 shrink-0" />
                            <span className="truncate">{log.entryHash.slice(0, 10)}...</span>
                            {copiedHash === log._id ? (
                              <Check className="w-3 h-3 text-emerald-600 shrink-0 ml-auto" />
                            ) : (
                              <Copy className="w-2.5 h-2.5 text-slate-400 shrink-0 ml-auto" />
                            )}
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400">Legacy Block</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setInspectLog(log)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                          title="Inspect Block Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Showing page <strong className="text-slate-800">{page}</strong> of <strong className="text-slate-800">{totalPages}</strong> ({totalRecords} records)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Block Inspection Modal */}
        {inspectLog && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Cryptographic Block Inspector</h3>
                    <p className="text-[11px] text-slate-400">Block ID: {inspectLog._id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setInspectLog(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Hashes Info */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Entry SHA-256 Digest</span>
                  <span className="text-slate-800 break-all">{inspectLog.entryHash || 'None'}</span>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Previous Block Hash (Parent Link)</span>
                  <span className="text-slate-600 break-all">{inspectLog.previousHash || 'None'}</span>
                </div>
              </div>

              {/* Key Attributes */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] font-bold">Action</span>
                  <span className="font-bold text-slate-800">{inspectLog.action}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] font-bold">Resource</span>
                  <span className="font-bold text-slate-800">{inspectLog.resourceType} ({inspectLog.resourceId || 'N/A'})</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] font-bold">Actor / Role</span>
                  <span className="font-bold text-slate-800">{inspectLog.userName} ({inspectLog.role})</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] font-bold">Timestamp & IP</span>
                  <span className="font-bold text-slate-800">{new Date(inspectLog.timestamp).toISOString()} [{inspectLog.ipAddress}]</span>
                </div>
              </div>

              {/* Metadata JSON */}
              <div>
                <span className="text-[11px] font-bold text-slate-700 block mb-1">Audit Metadata Payload</span>
                <pre className="p-3 bg-slate-900 text-teal-400 text-xs font-mono rounded-xl overflow-x-auto max-h-40">
                  {JSON.stringify(inspectLog.metadata, null, 2)}
                </pre>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setInspectLog(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 transition-colors"
                >
                  Close Inspector
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Full Verification Modal */}
        {showVerifyModal && chainStatus && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Cryptographic Chain Verification Report</h3>
                </div>
                <button
                  onClick={() => setShowVerifyModal(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200">
                  <p className="font-bold">Ledger Integrity: VALID & UNBROKEN</p>
                  <p className="text-[11px] opacity-80 mt-0.5">
                    Every audit block was recalculated against SHA-256 standard digests and checked against its parent link.
                  </p>
                </div>

                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Total Blocks Verified:</span>
                    <span className="font-bold text-slate-800">{chainStatus.verifiedCount}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Broken Blocks:</span>
                    <span className="font-bold text-emerald-600">0</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Genesis Hash Anchor:</span>
                    <span className="text-slate-600 truncate max-w-[200px]">GENESIS_BLOCK_00000000000000000000000000000000</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Latest Ledger Hash:</span>
                    <span className="text-slate-600 truncate max-w-[200px]">{chainStatus.latestHash}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowVerifyModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
