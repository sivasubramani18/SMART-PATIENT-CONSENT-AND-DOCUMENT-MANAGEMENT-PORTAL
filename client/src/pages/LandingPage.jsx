import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  ShieldCheck,
  FileText,
  Brain,
  Lock,
  History,
  AlertOctagon,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Stethoscope,
  HeartPulse,
  Eye,
  FileCheck
} from 'lucide-react';

export default function LandingPage() {
  const { user, getDashboardRoute } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 gradient-hero border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-6 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Next-Generation Healthcare Transparency & AI Assistance</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Secure Healthcare. <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Smarter Consent.</span> Better Patient Understanding.
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed font-normal">
              A secure platform for digital consent, medical document management, transparent access tracking, and AI-assisted patient understanding.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <Link
                  to={getDashboardRoute(user.role)}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-lg shadow-teal-600/25 transition-all transform hover:-translate-y-0.5"
                >
                  Return to Your Dashboard ({user.role})
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-lg shadow-teal-600/25 transition-all transform hover:-translate-y-0.5"
                  >
                    Open Portal Login
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-xs transition-all"
                  >
                    Register New Account
                  </Link>
                </>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
              <div className="bg-white/80 backdrop-blur p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="text-2xl font-black text-slate-900">100%</div>
                <div className="text-xs text-slate-500 font-medium">Digital Consent Versioning</div>
              </div>
              <div className="bg-white/80 backdrop-blur p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="text-2xl font-black text-teal-600">Zero Trust</div>
                <div className="text-xs text-slate-500 font-medium">Role-Based Access Control</div>
              </div>
              <div className="bg-white/80 backdrop-blur p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="text-2xl font-black text-cyan-600">Gemini AI</div>
                <div className="text-xs text-slate-500 font-medium">Medical Term Translation</div>
              </div>
              <div className="bg-white/80 backdrop-blur p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="text-2xl font-black text-slate-900">Immutable</div>
                <div className="text-xs text-slate-500 font-medium">Audit Trail Logging</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why This Platform Section */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-teal-600">The Problem Solved</h2>
            <p className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">
              Bridging the Critical Healthcare Information Gap
            </p>
            <p className="mt-3 text-slate-600 text-sm">
              Traditional paper consent is often signed without full comprehension. ConsentIQ brings transparency, digital validation, and patient empowerment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Eliminate Paper Blindspots</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Replaces scattered paper consent forms with version-controlled digital documents where changes require explicit re-confirmation.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center mb-4">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Plain Language AI Assistance</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Transforms intimidating clinical jargon into clear, patient-friendly explanations and interactive comprehension quizzes without altering clinical facts.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                <History className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Unbreakable Accountability</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Every document preview, download, consent acceptance, and emergency access is cryptographically time-stamped and logged for auditor review.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role-Based Workflow Section */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-teal-600">Unified Architecture</h2>
            <p className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">
              Four Specialized Portals Built For Clinical Trust
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Patient Portal */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Patient Portal</h3>
                <p className="text-xs text-slate-500 mb-4">Empowered health control</p>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-500" /> Read procedures in plain English</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-500" /> AI medical term breakdown</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-500" /> Digital OTP signature & verification</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-500" /> Right to revoke consent anytime</li>
                </ul>
              </div>
            </div>

            {/* Doctor Portal */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Doctor Portal</h3>
                <p className="text-xs text-slate-500 mb-4">Streamlined clinical consents</p>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> Create structured consent forms</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> Upload diagnostic documents to S3</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> Track patient signature status</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> Emergency break-glass access</li>
                </ul>
              </div>
            </div>

            {/* Administrator */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Hospital Admin</h3>
                <p className="text-xs text-slate-500 mb-4">System governance & policies</p>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-purple-500" /> Manage clinicians and patients</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-purple-500" /> Real-time security anomaly alerts</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-purple-500" /> Departmental usage statistics</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-purple-500" /> Emergency policy management</li>
                </ul>
              </div>
            </div>

            {/* Auditor */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                  <Eye className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Compliance Auditor</h3>
                <p className="text-xs text-slate-500 mb-4">Read-only oversight</p>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-amber-500" /> Full immutable audit trail query</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-amber-500" /> Filter by doctor, patient, timestamp</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-amber-500" /> Verify consent version signatures</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-amber-500" /> Cannot modify clinical records</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Compliance Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 max-w-2xl">
              <span className="inline-block px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-semibold mb-4 border border-teal-500/30">
                AI Safety by Design
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-4">
                Empowering Comprehension, Never Replacing Clinical Judgment
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                ConsentIQ strictly restricts artificial intelligence to simplification, translation, and comprehension questions. Our AI cannot formulate medical diagnoses, adjust risk percentages, or advise patients whether to consent.
              </p>
              <div className="flex flex-wrap gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" /> No AI Diagnosis
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" /> No Treatment Prescribing
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" /> Strict Source Document Grounding
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
