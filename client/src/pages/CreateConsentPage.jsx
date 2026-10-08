import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/client.js';
import {
  FileCheck2,
  PlusCircle,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Calendar,
  User,
  ShieldCheck,
  Stethoscope,
  ClipboardList
} from 'lucide-react';

const CLINICAL_TEMPLATES = {
  appendectomy: {
    procedure: 'Laparoscopic Appendectomy',
    purpose: 'Emergency surgical excision of acutely inflamed vermiform appendix (appendicitis).',
    description: 'Under general anesthesia, 3 keyhole incisions (0.5 to 1 cm) will be made in the abdomen. A laparoscopic camera and surgical instruments will be inserted. Carbon dioxide gas will inflate the abdominal space. The appendix base will be ligated and extracted safely.',
    benefits: 'Prevents appendix rupture, systemic sepsis, and generalized peritonitis.\nMinimal postoperative scarring and fast hospital discharge (1-2 days).',
    risks: 'Wound infection or intra-abdominal abscess (<2%).\nBleeding or hematoma at incision port sites.\nAdverse reaction to general anesthesia agents.\nConversion to open laparotomy if severe adhesions exist.',
    alternatives: 'Conservative intravenous antibiotic treatment alone (carries high 1-year recurrence rate).',
    additionalInformation: 'Patient must remain fasting (NPO) prior to procedure. Pre-anesthesia airway assessment complete.'
  },
  cholecystectomy: {
    procedure: 'Laparoscopic Cholecystectomy (Gallbladder Removal)',
    purpose: 'Elective surgical excision of symptomatic gallbladder with recurrent gallstones (cholelithiasis).',
    description: 'Under general anesthesia, 3-4 small laparoscopic incisions are made in the abdominal wall. The cystic duct and cystic artery are clipped, and the gallbladder dissected free from the liver bed and extracted through an umbilical port.',
    benefits: 'Permanent elimination of biliary colic pain and gallstone indigestion.\nSignificantly reduces future risks of acute cholecystitis, gallstone pancreatitis, and obstructive jaundice.',
    risks: 'Minor wound infection or bruising at port sites (1-2%).\nPotential bile duct injury or bile leak (0.3%).\nAnesthesia-related complications.\nTransient shoulder discomfort from carbon dioxide gas.',
    alternatives: 'Watchful waiting with strict low-fat diet.\nOral bile acid dissolution therapy (Ursodiol), limited to small cholesterol stones with high relapse rate.',
    additionalInformation: 'Nil by mouth 8 hours prior. Preoperative electrocardiogram and liver panel verified.'
  },
  colonoscopy: {
    procedure: 'Diagnostic Colonoscopy and Polypectomy',
    purpose: 'Direct endoscopic visualization of lower gastrointestinal tract with potential polypectomy.',
    description: 'A flexible colonoscope will be introduced through the rectum to inspect the entire large intestine up to the cecum. If mucosal polyps are encountered, cold snare or electrocautery resection will be performed.',
    benefits: 'Early detection and removal of pre-cancerous adenomatous polyps.\nDefinitive diagnostic histopathology evaluation.',
    risks: 'Bowel wall perforation (<0.1%).\nDelayed bleeding from polypectomy site (0.5%).\nMild sedation drowsiness.',
    alternatives: 'CT Colonography (virtual colonoscopy), which does not allow tissue biopsy or direct polyp removal.',
    additionalInformation: 'Complete oral bowel prep solution the evening prior. Arrange accompanied transport home.'
  }
};

export default function CreateConsentPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form State
  const [patientId, setPatientId] = useState('');
  const [procedure, setProcedure] = useState('');
  const [purpose, setPurpose] = useState('');
  const [description, setDescription] = useState('');
  const [benefits, setBenefits] = useState('');
  const [risks, setRisks] = useState('');
  const [alternatives, setAlternatives] = useState('');
  const [additionalInformation, setAdditionalInformation] = useState('');
  const [expiresAt, setExpiresAt] = useState(
    new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );

  useEffect(() => {
    async function loadPatients() {
      try {
        setLoadingPatients(true);
        const res = await api.get('/patients');
        if (res.data.success && res.data.patients.length > 0) {
          setPatients(res.data.patients);
          setPatientId(res.data.patients[0]._id);
        }
      } catch (err) {
        console.warn('Could not load patients list:', err);
      } finally {
        setLoadingPatients(false);
      }
    }
    loadPatients();
  }, []);

  const handleApplyTemplate = (key) => {
    const tpl = CLINICAL_TEMPLATES[key];
    if (tpl) {
      setProcedure(tpl.procedure);
      setPurpose(tpl.purpose);
      setDescription(tpl.description);
      setBenefits(tpl.benefits);
      setRisks(tpl.risks);
      setAlternatives(tpl.alternatives);
      setAdditionalInformation(tpl.additionalInformation);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!patientId || !procedure.trim() || !purpose.trim() || !description.trim()) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/consents', {
        patientId,
        procedure: procedure.trim(),
        purpose: purpose.trim(),
        description: description.trim(),
        benefits: benefits.split('\n').filter(Boolean),
        risks: risks.split('\n').filter(Boolean),
        alternatives: alternatives.split('\n').filter(Boolean),
        additionalInformation: additionalInformation.trim(),
        expiresAt
      });

      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/consents');
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create consent request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/consents"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Consent Agreements
        </Link>

        <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          Clinician Authorization Active
        </span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-10 space-y-6">
        <div>
          <div className="w-11 h-11 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mb-3">
            <Stethoscope className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Create Digital Consent Request
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Specify procedure information, risks, and benefits. The patient will review this alongside AI comprehension assistance.
          </p>
        </div>

        {/* Quick Clinical Template Selector */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Pre-Fill from Clinical Template:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleApplyTemplate('cholecystectomy')}
              className="px-3 py-1.5 bg-white hover:bg-teal-50 hover:text-teal-700 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-xs transition-colors"
            >
              Gallbladder Removal (Cholecystectomy)
            </button>
            <button
              type="button"
              onClick={() => handleApplyTemplate('appendectomy')}
              className="px-3 py-1.5 bg-white hover:bg-teal-50 hover:text-teal-700 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-xs transition-colors"
            >
              Laparoscopic Appendectomy
            </button>
            <button
              type="button"
              onClick={() => handleApplyTemplate('colonoscopy')}
              className="px-3 py-1.5 bg-white hover:bg-teal-50 hover:text-teal-700 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-xs transition-colors"
            >
              Diagnostic Colonoscopy
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            {error}
          </div>
        )}

        {success ? (
          <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-3xl text-center space-y-2 animate-in zoom-in-95">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-base font-bold text-emerald-950">Consent Request Dispatched Successfully!</h3>
            <p className="text-xs text-emerald-700">Patient has been notified and can now review and sign the agreement.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Target Patient & Expiry Date Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Target Patient Subject *
                </label>
                <select
                  required
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.userId?.name || 'Patient'} ({p.patientNumber}) · {p.bloodGroup || 'Blood: Unknown'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Consent Expiry Date *
                </label>
                <input
                  type="date"
                  required
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>
            </div>

            {/* Procedure Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Procedure / Treatment Name *
              </label>
              <input
                type="text"
                required
                value={procedure}
                onChange={(e) => setProcedure(e.target.value)}
                placeholder="E.g. Laparoscopic Cholecystectomy (Gallbladder Removal)"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            {/* Purpose */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Clinical Purpose & Diagnosis *
              </label>
              <input
                type="text"
                required
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="E.g. Elective surgical excision of symptomatic gallbladder with gallstones"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Detailed Clinical Method & Description *
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the surgical steps, anesthesia type, and anatomical scope..."
                className="w-full p-3.5 text-xs bg-slate-50 border border-slate-200 rounded-xl leading-relaxed"
              />
            </div>

            {/* Benefits & Risks (Side by Side) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-teal-800 mb-1">
                  Expected Clinical Benefits (One per line)
                </label>
                <textarea
                  rows={4}
                  value={benefits}
                  onChange={(e) => setBenefits(e.target.value)}
                  placeholder="Relief from pain&#10;Prevention of future infections&#10;Faster return to routine activities"
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-red-800 mb-1">
                  Known Risks & Potential Complications (One per line)
                </label>
                <textarea
                  rows={4}
                  value={risks}
                  onChange={(e) => setRisks(e.target.value)}
                  placeholder="Postoperative wound infection (<1-2%)&#10;Bleeding or minor hematoma&#10;Reaction to anesthesia"
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl leading-relaxed"
                />
              </div>
            </div>

            {/* Alternatives */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-blue-800 mb-1">
                Medically Valid Alternatives (One per line)
              </label>
              <textarea
                rows={2}
                value={alternatives}
                onChange={(e) => setAlternatives(e.target.value)}
                placeholder="Watchful observation with low-fat diet&#10;Oral medication where medically appropriate"
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl leading-relaxed"
              />
            </div>

            {/* Pre-Op Instructions */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Pre-Procedure Preparation & Fasting Instructions
              </label>
              <input
                type="text"
                value={additionalInformation}
                onChange={(e) => setAdditionalInformation(e.target.value)}
                placeholder="E.g. Fasting starting 8 hours prior. Stop blood thinners 3 days in advance."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <Link
                to="/consents"
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md shadow-teal-600/20 disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? 'Dispatching Consent Agreement...' : 'Issue Consent to Patient'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
