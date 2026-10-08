import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/client.js';
import {
  FileCheck2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Layers,
  ArrowLeft,
  HelpCircle,
  Check,
  Lock,
  Calendar,
  User,
  HeartPulse,
  Brain,
  Search,
  KeyRound,
  Download,
  AlertTriangle,
  CornerDownRight,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

export default function ConsentReaderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [consent, setConsent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // AI Assistance States
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState(null);
  const [activeTab, setActiveTab] = useState('clinical'); // 'clinical' or 'ai'

  // Term Clarification States
  const [termQuery, setTermQuery] = useState('');
  const [termResult, setTermResult] = useState(null);
  const [termLoading, setTermLoading] = useState(false);

  // Comprehension Quiz States
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Confirmation & OTP Signature States
  const [confirmReviewed, setConfirmReviewed] = useState(false);
  const [confirmAiTool, setConfirmAiTool] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [demoOtp, setDemoOtp] = useState('');
  const [userOtpInput, setUserOtpInput] = useState('');
  const [signing, setSigning] = useState(false);
  const [signSuccess, setSignSuccess] = useState(false);

  // Revocation / Withdrawal Modal
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [revokeReason, setRevokeReason] = useState('');
  const [revoking, setRevoking] = useState(false);

  useEffect(() => {
    async function loadConsent() {
      try {
        setLoading(true);
        const res = await api.get(`/consents/${id}`);
        if (res.data.success) {
          setConsent(res.data.consent);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to retrieve consent agreement.');
      } finally {
        setLoading(false);
      }
    }
    loadConsent();
  }, [id]);

  // AI Explanation Trigger (Section 19)
  const handleExplainWithAI = async () => {
    try {
      setAiLoading(true);
      const res = await api.post(`/consents/${id}/explain`);
      if (res.data.success) {
        setAiExplanation(res.data);
        setActiveTab('ai');
      }
    } catch (err) {
      alert('Unable to generate AI explanation: ' + (err.response?.data?.message || err.message));
    } finally {
      setAiLoading(false);
    }
  };

  // Term Clarification Trigger (Section 20)
  const handleExplainTerm = async (termToLookup) => {
    const term = termToLookup || termQuery;
    if (!term.trim()) return;

    try {
      setTermLoading(true);
      const res = await api.post(`/consents/explain-term`, {
        term: term.trim(),
        context: consent?.description || ''
      });
      if (res.data.success) {
        setTermResult(res.data);
      }
    } catch (err) {
      alert('Could not explain term: ' + (err.response?.data?.message || err.message));
    } finally {
      setTermLoading(false);
    }
  };

  // Comprehension Quiz Trigger (Section 22)
  const handleLoadQuiz = async () => {
    try {
      setQuizLoading(true);
      const res = await api.post(`/consents/${id}/questions`);
      if (res.data.success) {
        setQuizQuestions(res.data.questions || []);
      }
    } catch (err) {
      alert('Could not generate comprehension quiz: ' + (err.response?.data?.message || err.message));
    } finally {
      setQuizLoading(false);
    }
  };

  // Accept Flow: Step 1 (Show OTP Modal, Section 23)
  const handleInitiateAccept = () => {
    if (!confirmReviewed || !confirmAiTool) {
      alert('Please check both confirmation boxes acknowledging you have reviewed the clinical details.');
      return;
    }
    // Generate 6-digit demo verification OTP
    const generatedOtp = String(Math.floor(100000 + Math.random() * 900000));
    setDemoOtp(generatedOtp);
    setUserOtpInput(generatedOtp); // prefilled for quick 1-click test
    setShowSignModal(true);
  };

  // Accept Flow: Step 2 (Submit Signature)
  const handleConfirmSignature = async (e) => {
    e.preventDefault();
    try {
      setSigning(true);
      const res = await api.post(`/consents/${id}/accept`, {
        verificationMethod: 'DIGITAL_OTP',
        otpCode: userOtpInput,
        comprehensionAnswers: Object.entries(quizAnswers).map(([qId, ans]) => ({
          question: qId,
          selectedAnswer: String(ans)
        }))
      });

      if (res.data.success) {
        setSignSuccess(true);
        setTimeout(() => {
          setShowSignModal(false);
          setConsent(res.data.consent);
        }, 1500);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Digital signature failed.');
    } finally {
      setSigning(false);
    }
  };

  // Decline Flow
  const handleRejectConsent = async () => {
    if (!confirm('Are you sure you wish to decline this consent request? Your doctor will be notified.')) return;

    try {
      const res = await api.post(`/consents/${id}/reject`);
      if (res.data.success) {
        setConsent(res.data.consent);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not decline consent.');
    }
  };

  // Revocation Flow (Section 24)
  const handleConfirmRevoke = async (e) => {
    e.preventDefault();
    try {
      setRevoking(true);
      const res = await api.post(`/consents/${id}/revoke`, { reason: revokeReason });
      if (res.data.success) {
        setShowRevokeModal(false);
        setConsent(res.data.consent);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Withdrawal request failed.');
    } finally {
      setRevoking(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-6 animate-pulse">
        <div className="h-28 bg-slate-200 rounded-3xl" />
        <div className="h-96 bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  if (error || !consent) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-red-50 border border-red-200 p-8 rounded-3xl">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-red-900">{error || 'Agreement not found'}</h3>
          <Link to="/consents" className="mt-4 inline-block text-xs font-bold text-red-700 underline">
            Return to Consent Agreements
          </Link>
        </div>
      </div>
    );
  }

  const isPending = consent.status === 'SENT' || consent.status === 'VIEWED' || consent.status === 'UNDER_REVIEW';
  const isActive = consent.status === 'ACTIVE' || consent.status === 'ACCEPTED';
  const isPatient = user?.role === 'PATIENT';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/consents"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Consent Agreements
        </Link>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            Version {consent.version}.0
          </span>
          <span className="text-xs font-mono text-slate-400">ID: {consent._id.slice(-8)}</span>
        </div>
      </div>

      {/* Main Consent Document Card (Section 18 specs) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Document Header */}
        <div className="p-6 sm:p-8 bg-slate-50/70 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                Informed Clinical Consent Agreement
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                {consent.procedure}
              </h1>
            </div>

            {/* Status Indicator Badge */}
            <div className="shrink-0">
              {isActive ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Active & Signed
                </div>
              ) : isPending ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2 text-amber-800 text-xs font-bold">
                  <Clock className="w-5 h-5 text-amber-600" />
                  Pending Patient Review
                </div>
              ) : (
                <div className="p-3 bg-slate-100 border border-slate-200 rounded-2xl flex items-center gap-2 text-slate-700 text-xs font-bold">
                  {consent.status}
                </div>
              )}
            </div>
          </div>

          {/* Clinical metadata bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-200/60 text-xs text-slate-600">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Attending Clinician</span>
              <strong className="text-slate-900">{consent.doctorId?.userId?.name || 'Dr. Robert Chen, MD'}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Clinical Specialty</span>
              <strong className="text-slate-900">{consent.doctorId?.department || 'General Surgery'}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Patient Subject</span>
              <strong className="text-slate-900">{consent.patientId?.userId?.name || 'Eleanor Vance'}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Valid Until</span>
              <strong className="text-amber-800 font-mono">{new Date(consent.expiresAt).toLocaleDateString()}</strong>
            </div>
          </div>
        </div>

        {/* View Mode Toggle: Official Clinical Document vs AI Simplified View */}
        <div className="px-6 sm:px-8 py-3 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('clinical')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'clinical'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Original Clinical Text
            </button>
            <button
              onClick={() => {
                if (!aiExplanation) handleExplainWithAI();
                else setActiveTab('ai');
              }}
              disabled={aiLoading}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'ai'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-teal-700 bg-teal-50 hover:bg-teal-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {aiLoading ? 'Translating with AI...' : 'Plain English AI Explanation'}
            </button>
          </div>

          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
            AES-256 Cryptographic Record Integrity
          </span>
        </div>

        {/* Document Body */}
        <div className="p-6 sm:p-8 space-y-8">
          {activeTab === 'ai' && aiExplanation ? (
            /* AI Simplified Explanation Display (Section 19) */
            <div className="bg-teal-50/70 border border-teal-200 rounded-3xl p-6 sm:p-8 space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between pb-4 border-b border-teal-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-teal-950">AI Plain-Language Translation</h3>
                    <p className="text-[11px] text-teal-700">Powered by Google Gemini Clinical Language Model</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('clinical')}
                  className="text-xs font-bold text-teal-800 hover:underline"
                >
                  View Original Clinical Content
                </button>
              </div>

              {/* AI Notice / Disclaimer Banner (Section 19 specs) */}
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Notice:</strong> {aiExplanation.disclaimer}
                </p>
              </div>

              {/* Formatted AI Explanation text */}
              <div className="prose prose-teal max-w-none text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line space-y-4">
                {aiExplanation.explanation}
              </div>
            </div>
          ) : (
            /* Official Clinical Source Text (Section 18 specs) */
            <div className="space-y-8">
              {/* Clinical Purpose */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Clinical Purpose & Rationale
                </h3>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                  {consent.purpose}
                </div>
              </div>

              {/* Procedure Description */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Detailed Surgical / Procedural Method
                </h3>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed">
                  {consent.description}
                </div>
              </div>

              {/* Expected Benefits */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-3 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" /> Expected Clinical Benefits
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {consent.benefits?.map((benefit, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-teal-50/50 border border-teal-200/80 text-xs text-teal-950 font-medium flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Known Risks */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-red-700 mb-3 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600" /> Possible Risks & Complications
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {consent.risks?.map((risk, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-red-50/50 border border-red-200/80 text-xs text-red-950 font-medium flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <span>{risk}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alternatives */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-3">
                  Medically Valid Alternatives
                </h3>
                <div className="space-y-2">
                  {consent.alternatives?.map((alt, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-200/80 text-xs text-blue-950">
                      • {alt}
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Information */}
              {consent.additionalInformation && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Pre-Procedure Instructions & Preparation
                  </h3>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                    {consent.additionalInformation}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* INTERACTIVE MEDICAL TERM EXPLANATION TOOL (Section 20) */}
          <div className="p-6 rounded-3xl border border-indigo-200 bg-indigo-50/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Ask AI About Any Medical Term</h3>
              </div>
              <span className="text-[10px] font-bold text-indigo-700 uppercase bg-indigo-100 px-2 py-0.5 rounded">
                Section 20 Feature
              </span>
            </div>

            <p className="text-xs text-slate-600">
              Click a common clinical term below or enter any term from this form to get an everyday explanation:
            </p>

            {/* Quick Term Badges */}
            <div className="flex flex-wrap gap-2">
              {['Laparoscopic', 'Anesthesia', 'Cholecystectomy', 'Calculi', 'Hematoma', 'Endoscopy'].map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTermQuery(t);
                    handleExplainTerm(t);
                  }}
                  className="px-3 py-1 bg-white hover:bg-indigo-100 text-indigo-800 rounded-xl text-xs font-bold border border-indigo-200 transition-colors"
                >
                  "{t}"
                </button>
              ))}
            </div>

            {/* Manual Term Query Bar */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={termQuery}
                onChange={(e) => setTermQuery(e.target.value)}
                placeholder="Type any medical word (e.g. Laparoscopic, Intubation)..."
                className="flex-1 px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                onClick={() => handleExplainTerm(termQuery)}
                disabled={termLoading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors"
              >
                {termLoading ? 'Clarifying...' : 'Explain Term'}
              </button>
            </div>

            {/* Term Explanation Output */}
            {termResult && (
              <div className="p-4 bg-white rounded-2xl border border-indigo-200 shadow-xs animate-in fade-in space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-indigo-950 font-mono">
                    Definition of "{termResult.term}":
                  </span>
                  <span className="text-[10px] text-slate-400">Educational Assistance</span>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed">{termResult.explanation}</p>
              </div>
            )}
          </div>

          {/* CONSENT COMPREHENSION CHECK (Section 22) */}
          <div className="p-6 rounded-3xl border border-slate-200 bg-slate-50/60 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900">Optional Comprehension Self-Check</h3>
              </div>
              {quizQuestions.length === 0 && (
                <button
                  onClick={handleLoadQuiz}
                  disabled={quizLoading}
                  className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  {quizLoading ? 'Generating Check...' : 'Start Comprehension Check'}
                </button>
              )}
            </div>

            <p className="text-xs text-slate-600">
              Verify your personal understanding of the key risks and goals before signing.
              <span className="text-[11px] text-slate-400 block mt-0.5">
                * Note: This assistance feature helps you self-verify your grasp of the document; it does not replace a doctor-patient discussion.
              </span>
            </p>

            {quizQuestions.length > 0 && (
              <div className="space-y-4 pt-2">
                {quizQuestions.map((q, idx) => (
                  <div key={idx} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
                    <p className="text-xs font-bold text-slate-900">{idx + 1}. {q.question}</p>
                    <div className="space-y-1.5">
                      {q.options.map((opt, optIdx) => (
                        <label
                          key={optIdx}
                          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 text-xs text-slate-700 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name={`quiz_${q.id || idx}`}
                            checked={quizAnswers[q.id || idx] === optIdx}
                            onChange={() => setQuizAnswers({ ...quizAnswers, [q.id || idx]: optIdx })}
                            className="text-teal-600 focus:ring-teal-500"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>

                    {quizSubmitted && (
                      <div className="pt-2 text-xs font-semibold text-teal-800">
                        {quizAnswers[q.id || idx] === q.correctIndex ? (
                          <span className="text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Correct comprehension: {q.explanation}
                          </span>
                        ) : (
                          <span className="text-amber-700">
                            Please note: {q.explanation}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                <button
                  onClick={() => setQuizSubmitted(true)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
                >
                  Check Answers
                </button>
              </div>
            )}
          </div>

          {/* SIGNATURE / DECISION SECTION (Section 18 & 23) */}
          {isPending && isPatient && (
            <div className="p-6 sm:p-8 rounded-3xl border-2 border-teal-200 bg-teal-50/40 space-y-5">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-teal-950">
                Patient Confirmation & Decision
              </h3>
              <p className="text-xs text-slate-600">
                Review the confirmations below before completing your decision:
              </p>

              {/* Unselected Checkboxes (Section 18 specs) */}
              <div className="space-y-3">
                <label className="flex items-start gap-3 text-xs text-slate-800 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmReviewed}
                    onChange={(e) => setConfirmReviewed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                  />
                  <span>
                    I have reviewed the information provided, including the procedure description, clinical benefits, potential risks, and available alternatives.
                  </span>
                </label>

                <label className="flex items-start gap-3 text-xs text-slate-800 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmAiTool}
                    onChange={(e) => setConfirmAiTool(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                  />
                  <span>
                    I understand that the AI explanation is only an educational assistance tool and does not replace consultation with my licensed physician.
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-teal-200/80 flex flex-col sm:flex-row items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleRejectConsent}
                  className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-red-700 bg-white hover:bg-red-50 border border-red-200 rounded-xl transition-colors"
                >
                  Decline Consent
                </button>
                <button
                  type="button"
                  onClick={handleInitiateAccept}
                  disabled={!confirmReviewed || !confirmAiTool}
                  className="w-full sm:w-auto px-7 py-3 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md shadow-teal-600/25 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Accept & Sign with Digital OTP
                </button>
              </div>
            </div>
          )}

          {/* ACTIVE SIGNED AUDIT SUMMARY (Section 23 metadata display) */}
          {isActive && consent.signatureMetadata && (
            <div className="p-6 rounded-3xl bg-emerald-50/70 border border-emerald-200 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200 text-emerald-950 font-bold">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Digital Signature Certificate (Section 23)
                </span>
                <span className="font-mono text-[10px] text-emerald-700">VERIFIED</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] text-slate-700">
                <div>
                  <span className="text-slate-400 block text-[9px]">METHOD</span>
                  <strong>{consent.signatureMetadata.verificationMethod}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">TIMESTAMP</span>
                  <strong>{new Date(consent.signatureMetadata.timestamp || consent.acceptedAt).toLocaleString()}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">SIGNER IP</span>
                  <strong>{consent.signatureMetadata.ipAddress || '127.0.0.1'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">CRYPTO HASH</span>
                  <span className="truncate block max-w-[120px] text-emerald-700">
                    {consent.signatureMetadata.signatureHash}
                  </span>
                </div>
              </div>

              {/* Right of withdrawal button (Section 24) */}
              {isPatient && (
                <div className="pt-3 border-t border-emerald-200 flex justify-end">
                  <button
                    onClick={() => setShowRevokeModal(true)}
                    className="px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-red-700 bg-white border border-slate-300 rounded-xl transition-colors"
                  >
                    Withdraw / Revoke This Consent
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* DIGITAL OTP SIGNING MODAL (Section 23 specs) */}
      {showSignModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-teal-200">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4">
              <KeyRound className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Confirm Digital Signature
            </h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              To verify and bind your digital signature to version <strong>v{consent.version}.0</strong>, confirm the secure one-time passcode below.
            </p>

            {signSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in zoom-in-95">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Consent accepted and cryptographic signature registered!
              </div>
            ) : (
              <form onSubmit={handleConfirmSignature} className="space-y-4">
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-800 font-mono flex items-center justify-between">
                  <span>Demo Security Code:</span>
                  <span className="font-black text-sm tracking-widest bg-white px-2 py-0.5 rounded border border-teal-200">
                    {demoOtp}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Enter Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={userOtpInput}
                    onChange={(e) => setUserOtpInput(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    className="w-full text-center tracking-widest font-mono text-base font-bold py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowSignModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={signing}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md shadow-teal-600/20 disabled:opacity-50 flex items-center gap-2"
                  >
                    {signing ? 'Signing Cryptographically...' : 'Confirm Digital Signature'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* REVOKE / WITHDRAWAL MODAL (Section 24 specs) */}
      {showRevokeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-red-200">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <AlertOctagon className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Withdraw Consent Agreement
            </h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              <strong>Clinical Notice:</strong> Withdrawing consent revokes permission for scheduled future procedures. This will immediately update your medical record and alert your physician.
            </p>

            <form onSubmit={handleConfirmRevoke} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Reason for Revocation
                </label>
                <textarea
                  required
                  rows={3}
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  placeholder="E.g. Desiring a second opinion or seeking alternative medical observation."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRevokeModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Keep Consent Active
                </button>
                <button
                  type="submit"
                  disabled={revoking}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-600/20"
                >
                  {revoking ? 'Revoking Agreement...' : 'Confirm Revocation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
