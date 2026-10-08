import React from 'react';
import { ShieldCheck, Lock, AlertCircle, HeartHandshake } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-sm mt-auto">
      {/* Disclaimer Banner */}
      <div className="bg-slate-950/60 border-b border-slate-800 py-3.5 px-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex items-start sm:items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
          <p>
            <strong className="text-slate-200">Clinical Safety Notice:</strong> ConsentIQ is a secure patient consent and document platform. The AI comprehension assistant generates explanations for informational understanding only and never provides medical diagnoses, treatment decisions, or formal clinical advice. Consult your licensed physician for all personal health decisions.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-white">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">ConsentIQ Platform</span>
            </div>
            <p className="text-slate-400 text-xs max-w-md leading-relaxed mb-4">
              A high-security, patient-centric healthcare platform engineered for transparent digital informed consent, encrypted medical document vaults, automated audit logging, and AI-assisted patient comprehension.
            </p>
            <div className="flex items-center gap-3 text-xs text-teal-400">
              <span className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
                <Lock className="w-3.5 h-3.5 text-teal-400" /> AES-256 Encrypted
              </span>
              <span className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> RBAC & Strict Audit
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Governance & Roles</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><span className="text-slate-300 font-medium">Patient Portal:</span> Informed Consent & Records</li>
              <li><span className="text-slate-300 font-medium">Doctor Portal:</span> Uploads & Consent Issuance</li>
              <li><span className="text-slate-300 font-medium">Administrator:</span> System & RBAC Governance</li>
              <li><span className="text-slate-300 font-medium">Auditor:</span> Immutable Access Logs</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Security Architecture</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>End-to-End Audit Trail</li>
              <li>Time-Limited Signed Object URLs</li>
              <li>Emergency Break-Glass Protocol</li>
              <li>Real-Time Anomaly Rule Engine</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} ConsentIQ Healthcare Systems. Synthetic / demo healthcare environment.</p>
          <p className="flex items-center gap-1 text-slate-400">
            Engineered with <HeartHandshake className="w-3.5 h-3.5 text-teal-400 inline" /> for transparent patient consent
          </p>
        </div>
      </div>
    </footer>
  );
}
