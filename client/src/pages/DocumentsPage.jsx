import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/client.js';
import {
  FileText,
  Search,
  Filter,
  UploadCloud,
  Download,
  Eye,
  Clock,
  User,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  X,
  FileCode,
  Calendar,
  Layers,
  ZoomIn,
  ZoomOut,
  Sparkles,
  ExternalLink,
  ChevronRight,
  HardDrive,
  Copy,
  Check,
  Scan
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Blood Report',
  'MRI',
  'CT Scan',
  'X-Ray',
  'Prescription',
  'Discharge Summary',
  'Surgery Report',
  'Consent',
  'Insurance',
  'Other'
];

export default function DocumentsPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientsList, setPatientsList] = useState([]);

  // Preview Modal State
  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewZoom, setPreviewZoom] = useState(100);
  const [previewTab, setPreviewTab] = useState('visual');
  const [ocrRunning, setOcrRunning] = useState(false);
  const [copiedOcr, setCopiedOcr] = useState(false);

  // Upload Modal State (for Doctors & Admins)
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({
    patientId: '',
    documentType: 'Blood Report',
    title: '',
    description: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Version History Modal State
  const [versionHistoryDoc, setVersionHistoryDoc] = useState(null);
  const [versionHistoryList, setVersionHistoryList] = useState([]);

  const isClinicianOrAdmin = user?.role === 'DOCTOR' || user?.role === 'ADMIN';

  async function fetchDocuments() {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (selectedCategory !== 'All') params.documentType = selectedCategory;
      if (search.trim()) params.search = search.trim();
      if (selectedPatientId) params.patientId = selectedPatientId;

      const res = await api.get('/documents', { params });
      if (res.data.success) {
        setDocuments(res.data.documents);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load medical documents.');
    } finally {
      setLoading(false);
    }
  }

  // Load patient list if doctor/admin for upload and filter
  useEffect(() => {
    if (isClinicianOrAdmin) {
      api.get('/patients')
        .then((res) => {
          if (res.data.success) {
            setPatientsList(res.data.patients);
            if (res.data.patients.length > 0 && !uploadFormData.patientId) {
              setUploadFormData((prev) => ({ ...prev, patientId: res.data.patients[0]._id }));
            }
          }
        })
        .catch((err) => console.warn('Could not fetch patients list:', err));
    }
  }, [isClinicianOrAdmin]);

  useEffect(() => {
    fetchDocuments();
  }, [selectedCategory, selectedPatientId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDocuments();
  };

  // Preview Document Handler (Section 12)
  const handleOpenPreview = async (doc) => {
    setPreviewDoc(doc);
    setPreviewZoom(100);
    setPreviewTab('visual');
    setPreviewLoading(true);
    setPreviewUrl('');

    try {
      const res = await api.get(`/documents/${doc._id}/download`);
      if (res.data.success) {
        setPreviewUrl(res.data.downloadUrl);
      }
    } catch (err) {
      alert('Failed to obtain authorized document preview URL: ' + (err.response?.data?.message || err.message));
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleRunOcr = async () => {
    if (!previewDoc) return;
    try {
      setOcrRunning(true);
      const res = await api.post(`/documents/${previewDoc._id}/ocr`);
      if (res.data.success) {
        setPreviewDoc((prev) => ({ ...prev, extractedText: res.data.extractedText }));
        setDocuments((prev) =>
          prev.map((d) => (d._id === previewDoc._id ? { ...d, extractedText: res.data.extractedText } : d))
        );
      }
    } catch (err) {
      alert('OCR extraction failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setOcrRunning(false);
    }
  };

  const handleCopyOcr = () => {
    if (!previewDoc?.extractedText) return;
    navigator.clipboard.writeText(previewDoc.extractedText);
    setCopiedOcr(true);
    setTimeout(() => setCopiedOcr(false), 2000);
  };

  // Download Document Handler
  const handleDownload = async (doc) => {
    try {
      const res = await api.get(`/documents/${doc._id}/download`);
      if (res.data.success && res.data.downloadUrl) {
        const link = document.createElement('a');
        link.href = res.data.downloadUrl;
        link.download = res.data.fileName || `${doc.title}.pdf`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      alert('Unable to generate authorized download token: ' + (err.response?.data?.message || err.message));
    }
  };

  // View Version History (Section 14)
  const handleOpenVersionHistory = async (doc) => {
    setVersionHistoryDoc(doc);
    try {
      const res = await api.get(`/documents/${doc._id}`);
      if (res.data.success) {
        setVersionHistoryList(res.data.versionHistory || [doc]);
      }
    } catch (err) {
      setVersionHistoryList([doc]);
    }
  };

  // Upload Document Handler (Section 13)
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setUploadError('');
    if (!selectedFile) {
      setUploadError('Please choose a file to upload.');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('patientId', uploadFormData.patientId);
      formData.append('documentType', uploadFormData.documentType);
      formData.append('title', uploadFormData.title);
      formData.append('description', uploadFormData.description);
      formData.append('file', selectedFile);

      const res = await api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setUploadSuccess(true);
        setTimeout(() => {
          setUploadSuccess(false);
          setShowUploadModal(false);
          setSelectedFile(null);
          setUploadFormData((prev) => ({ ...prev, title: '', description: '' }));
          fetchDocuments();
        }, 1500);
      }
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Document upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const getCategoryColor = (type) => {
    switch (type) {
      case 'MRI':
      case 'CT Scan':
      case 'X-Ray':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Blood Report':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Prescription':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Discharge Summary':
      case 'Surgery Report':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-cyan-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 text-xs font-semibold mb-3 border border-teal-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              Private Encrypted Medical Document Vault
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Medical Documents & Reports Library
            </h1>
            <p className="mt-1 text-slate-300 text-sm max-w-xl">
              Access your verified laboratory results, diagnostic imaging, radiology, prescriptions, and historical surgical summaries.
            </p>
          </div>

          {isClinicianOrAdmin && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-teal-500/25 flex items-center gap-2 shrink-0"
            >
              <UploadCloud className="w-4 h-4" />
              Upload Medical Document
            </button>
          )}
        </div>
      </div>

      {/* Search and Category Filter Bar (Section 11 specs) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search documents by title, description, or keyword..."
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shrink-0"
            >
              Search
            </button>
          </form>

          {/* Clinician Patient Selector Filter */}
          {isClinicianOrAdmin && patientsList.length > 0 && (
            <div className="w-full md:w-64">
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                <option value="">All Patient Records</option>
                {patientsList.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.userId?.name || 'Patient'} ({p.patientNumber})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Category Pills (Section 11 categories) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                selectedCategory === cat
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid / Table View */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-56 bg-slate-200 rounded-3xl"></div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-lg mx-auto">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
          <h3 className="text-base font-bold text-red-900">{error}</h3>
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No medical documents found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Try adjusting your search query or selecting a different clinical category filter.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('All');
              setSelectedPatientId('');
            }}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div
              key={doc._id}
              className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-6 flex flex-col justify-between group"
            >
              <div>
                {/* Top Row: Type Badge + Version */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-lg border ${getCategoryColor(doc.documentType)}`}>
                    {doc.documentType}
                  </span>
                  <button
                    onClick={() => handleOpenVersionHistory(doc)}
                    className="flex items-center gap-1 text-[11px] font-mono font-bold text-slate-500 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 px-2 py-0.5 rounded-md transition-colors"
                    title="Click to view version history"
                  >
                    <Layers className="w-3 h-3" />
                    v{doc.version}.0
                  </button>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-teal-700 transition-colors">
                  {doc.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {doc.description || 'Verified clinical diagnostic report stored in encrypted vault.'}
                </p>

                {/* Meta details */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500 font-medium">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      Uploaded By:
                    </span>
                    <span className="font-semibold text-slate-700 truncate max-w-[140px]">
                      {doc.uploadedBy?.name || 'Physician'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Upload Date:
                    </span>
                    <span className="font-mono text-slate-700">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                      File Size:
                    </span>
                    <span className="font-mono text-slate-700">
                      {(doc.fileSize / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons (Section 11 specs: [View] and [Download]) */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => handleOpenPreview(doc)}
                  className="flex-1 py-2 px-3 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-teal-50 hover:text-teal-700 border border-slate-200 rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Preview
                </button>
                <button
                  onClick={() => handleDownload(doc)}
                  className="py-2 px-3 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition-all flex items-center justify-center gap-1.5"
                  title="Generate signed download link"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL (Section 12 specs) */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header info (Section 12: Document Type, Uploaded By, Date, Version, Patient, Access Level) */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {previewDoc.documentType}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">v{previewDoc.version}.0</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Access Level: Encrypted Patient Vault
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">{previewDoc.title}</h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(previewDoc)}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200"
                  title="Close preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Metadata Strip */}
            <div className="px-6 py-2.5 bg-slate-100/70 border-b border-slate-200 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-600">
              <div>
                Uploaded By: <strong className="text-slate-800">{previewDoc.uploadedBy?.name || 'Physician'}</strong>
              </div>
              <div>
                Upload Date: <strong className="text-slate-800">{new Date(previewDoc.createdAt).toLocaleDateString()}</strong>
              </div>
              <div>
                Patient: <strong className="text-slate-800">{previewDoc.patientId?.patientNumber || 'PAT-CURRENT'}</strong>
              </div>
              <div className="flex items-center gap-2 text-teal-700 font-mono text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" /> Time-Limited Signed URL (AES-256)
              </div>
            </div>

            {/* View Selector Tabs */}
            <div className="px-6 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewTab('visual')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                    previewTab === 'visual'
                      ? 'bg-white text-teal-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Visual Document Stream
                </button>
                <button
                  onClick={() => setPreviewTab('ocr')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1.5 ${
                    previewTab === 'ocr'
                      ? 'bg-white text-teal-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Scan className="w-3.5 h-3.5 text-teal-600" />
                  Optical Character Recognition (OCR)
                  {previewDoc.extractedText && (
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                  )}
                </button>
              </div>

              {previewTab === 'ocr' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyOcr}
                    disabled={!previewDoc.extractedText}
                    className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors flex items-center gap-1 font-semibold text-[11px]"
                  >
                    {copiedOcr ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
                    {copiedOcr ? 'Copied!' : 'Copy Text'}
                  </button>
                  <button
                    onClick={handleRunOcr}
                    disabled={ocrRunning}
                    className="px-2.5 py-1 rounded-md bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 transition-colors flex items-center gap-1 font-semibold text-[11px]"
                  >
                    <Scan className={`w-3 h-3 ${ocrRunning ? 'animate-spin' : ''}`} />
                    {ocrRunning ? 'Scanning...' : 'Re-Run OCR'}
                  </button>
                </div>
              )}
            </div>

            {/* Content Preview Canvas */}
            {previewTab === 'visual' ? (
              <div className="flex-1 overflow-auto p-6 bg-slate-900 flex items-center justify-center min-h-[350px]">
                {previewLoading ? (
                  <div className="text-center text-white space-y-3">
                    <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs font-semibold text-slate-300">Generating secure pre-signed stream...</p>
                  </div>
                ) : previewDoc.mimeType === 'application/pdf' ? (
                  <div className="w-full h-full min-h-[480px] bg-white rounded-xl overflow-hidden shadow-inner flex flex-col items-center justify-center p-8 text-center">
                    <FileText className="w-16 h-16 text-teal-600 mb-3" />
                    <h4 className="text-base font-bold text-slate-800">{previewDoc.title}</h4>
                    <p className="text-xs text-slate-500 max-w-md mt-1 mb-6">
                      {previewDoc.description || 'This is a certified PDF diagnostic record.'}
                    </p>
                    <div className="flex items-center gap-3">
                      <a
                        href={previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open Full Screen PDF Viewer
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-full max-h-full flex items-center justify-center p-4">
                    <img
                      src={previewUrl}
                      alt={previewDoc.title}
                      style={{ transform: `scale(${previewZoom / 100})` }}
                      className="max-h-[500px] object-contain rounded-xl shadow-lg transition-transform"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 overflow-auto p-6 bg-slate-50 min-h-[350px]">
                <div className="max-w-3xl mx-auto space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <Scan className="w-4 h-4 text-teal-600" />
                        Extracted Clinical Text Content
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Optical character recognition processed via Tesseract.js engine
                      </p>
                    </div>
                    {previewDoc.extractedText && (
                      <span className="text-[11px] font-mono text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                        {previewDoc.extractedText.split(/\s+/).filter(Boolean).length} words · {previewDoc.extractedText.length} chars
                      </span>
                    )}
                  </div>

                  {ocrRunning ? (
                    <div className="py-16 text-center space-y-3">
                      <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-xs font-bold text-slate-700">Analyzing optical document text with Tesseract...</p>
                      <p className="text-[11px] text-slate-400">Processing visual pixels into searchable clinical data</p>
                    </div>
                  ) : previewDoc.extractedText ? (
                    <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
                      <pre className="font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed select-all">
                        {previewDoc.extractedText}
                      </pre>
                    </div>
                  ) : (
                    <div className="py-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 p-8">
                      <Scan className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-700">No Optical Text Extracted Yet</p>
                      <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                        Click below to run Tesseract character recognition and make this document fully searchable across the clinical portal.
                      </p>
                      <button
                        onClick={handleRunOcr}
                        className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition-colors shadow-xs"
                      >
                        Run Tesseract OCR Scan
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Footer with Controls */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Audit Status:</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                  ACCESS_EVENT_RECORDED
                </span>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT UPLOAD MODAL (Section 13 specs) */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Upload Medical Document</h3>
                  <p className="text-xs text-slate-500">Secure S3 vault upload with audit logging</p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadSuccess ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2 animate-in zoom-in-95">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-base font-bold text-emerald-950">Document Uploaded Successfully!</h4>
                <p className="text-xs text-emerald-700">Metadata archived to MongoDB, file secured in S3 vault, and patient notified.</p>
              </div>
            ) : (
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                {uploadError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    {uploadError}
                  </div>
                )}

                {/* Patient Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Select Target Patient
                  </label>
                  <select
                    required
                    value={uploadFormData.patientId}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, patientId: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    {patientsList.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.userId?.name || 'Patient'} ({p.patientNumber}) · {p.bloodGroup || 'Blood: Unknown'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Document Type Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Clinical Document Type
                  </label>
                  <select
                    required
                    value={uploadFormData.documentType}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, documentType: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Document Title / Report Heading
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadFormData.title}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, title: e.target.value })}
                    placeholder="E.g. Lumbar Spine MRI Report (L4-L5)"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Tip: Reusing an existing title automatically creates an incremental revision (v2.0, v3.0).
                  </span>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Clinical Summary / Description
                  </label>
                  <textarea
                    rows={2}
                    value={uploadFormData.description}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, description: e.target.value })}
                    placeholder="E.g. Axial and sagittal T1/T2 weighted sequences showing mild disc protrusion..."
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                {/* File Dropzone */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Upload File (PDF, PNG, JPG - max 15MB)
                  </label>
                  <input
                    type="file"
                    required
                    accept=".pdf,image/png,image/jpeg,image/jpg"
                    onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer border border-dashed border-slate-300 p-2 rounded-2xl bg-slate-50"
                  />
                  {selectedFile && (
                    <div className="mt-1 text-[11px] text-teal-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </div>
                  )}
                </div>

                {/* Submit Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md shadow-teal-600/20 disabled:opacity-50 flex items-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Uploading to Vault...
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4" />
                        Secure & Upload File
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* VERSION HISTORY MODAL (Section 14 specs) */}
      {versionHistoryDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900">Document Revision History</h3>
              </div>
              <button
                onClick={() => setVersionHistoryDoc(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Audited lineage for <strong className="text-slate-800">{versionHistoryDoc.title}</strong>:
            </p>

            <div className="space-y-2.5">
              {versionHistoryList.map((ver, idx) => (
                <div
                  key={ver._id}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                        Version {ver.version}.0
                      </span>
                      {idx === 0 && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                          CURRENT ACTIVE
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Uploaded by: <strong>{ver.uploadedBy?.name || 'Clinician'}</strong> on {new Date(ver.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setVersionHistoryDoc(null);
                      handleOpenPreview(ver);
                    }}
                    className="p-2 text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-xl"
                    title="Preview this version"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setVersionHistoryDoc(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
