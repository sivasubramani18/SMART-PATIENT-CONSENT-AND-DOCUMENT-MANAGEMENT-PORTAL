import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Document from '../models/Document.js';
import Consent from '../models/Consent.js';
import AuditLog from '../models/AuditLog.js';
import Notification from '../models/Notification.js';
import SecurityAlert from '../models/SecurityAlert.js';
import { connectDB } from '../config/db.js';

export async function seedDatabase() {
  console.log('[Seed] Starting database seeding...');
  await connectDB();

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Patient.deleteMany({}),
    Doctor.deleteMany({}),
    Document.deleteMany({}),
    Consent.deleteMany({}),
    AuditLog.deleteMany({}),
    Notification.deleteMany({}),
    SecurityAlert.deleteMany({})
  ]);
  console.log('[Seed] Cleared existing collections.');

  const defaultPassword = 'Password123!';
  const hashedPassword = await User.hashPassword(defaultPassword);

  // 1. Seed Core Demo Users
  const adminUser = await User.create({
    name: 'Sarah Jenkins (Chief Admin)',
    email: 'admin@hospital.demo',
    passwordHash: hashedPassword,
    role: 'ADMIN',
    status: 'ACTIVE'
  });

  const doctorUser = await User.create({
    name: 'Dr. Robert Chen, MD',
    email: 'doctor@hospital.demo',
    passwordHash: hashedPassword,
    role: 'DOCTOR',
    status: 'ACTIVE'
  });

  const doctorProfile = await Doctor.create({
    userId: doctorUser._id,
    department: 'General Surgery & Oncology',
    licenseNumber: 'MD-SURG-88291',
    specialization: 'Minimally Invasive Surgery',
    status: 'ACTIVE'
  });

  // Additional Doctors
  const doctor2 = await User.create({
    name: 'Dr. Priya Sharma, MD',
    email: 'priya.sharma@hospital.demo',
    passwordHash: hashedPassword,
    role: 'DOCTOR',
    status: 'ACTIVE'
  });
  await Doctor.create({
    userId: doctor2._id,
    department: 'Cardiology',
    licenseNumber: 'MD-CARD-44102',
    specialization: 'Interventional Cardiology',
    status: 'ACTIVE'
  });

  const doctor3 = await User.create({
    name: 'Dr. Marcus Vance, MD',
    email: 'marcus.vance@hospital.demo',
    passwordHash: hashedPassword,
    role: 'DOCTOR',
    status: 'ACTIVE'
  });
  await Doctor.create({
    userId: doctor3._id,
    department: 'Neurology',
    licenseNumber: 'MD-NEUR-77319',
    specialization: 'Cerebrovascular Specialist',
    status: 'ACTIVE'
  });

  // Patient Core Demo User
  const patientUser = await User.create({
    name: 'Eleanor Vance',
    email: 'patient@hospital.demo',
    passwordHash: hashedPassword,
    role: 'PATIENT',
    status: 'ACTIVE'
  });

  const patientProfile = await Patient.create({
    userId: patientUser._id,
    patientNumber: 'PAT-2026-0042',
    dateOfBirth: new Date('1988-06-14'),
    gender: 'Female',
    bloodGroup: 'O+',
    contact: {
      phone: '+1 (555) 234-5678',
      address: '742 Evergreen Terrace',
      city: 'Metro City',
      postalCode: '90210'
    },
    allergies: ['Penicillin', 'Latex'],
    emergencyContact: {
      name: 'Thomas Vance',
      relationship: 'Spouse',
      phone: '+1 (555) 876-5432'
    }
  });

  // Additional Patients
  const patient2 = await User.create({
    name: 'David Miller',
    email: 'david.miller@hospital.demo',
    passwordHash: hashedPassword,
    role: 'PATIENT',
    status: 'ACTIVE'
  });
  const patient2Profile = await Patient.create({
    userId: patient2._id,
    patientNumber: 'PAT-2026-0043',
    dateOfBirth: new Date('1975-03-22'),
    gender: 'Male',
    bloodGroup: 'A+',
    contact: { phone: '+1 (555) 345-6789' }
  });

  const patient3 = await User.create({
    name: 'Aisha Al-Mansoor',
    email: 'aisha.m@hospital.demo',
    passwordHash: hashedPassword,
    role: 'PATIENT',
    status: 'ACTIVE'
  });
  const patient3Profile = await Patient.create({
    userId: patient3._id,
    patientNumber: 'PAT-2026-0044',
    dateOfBirth: new Date('1994-11-09'),
    gender: 'Female',
    bloodGroup: 'B-',
    contact: { phone: '+1 (555) 456-7890' }
  });

  // Auditor Core Demo User
  const auditorUser = await User.create({
    name: 'Gregory Scott (Lead Compliance Officer)',
    email: 'auditor@hospital.demo',
    passwordHash: hashedPassword,
    role: 'AUDITOR',
    status: 'ACTIVE'
  });

  // 2. Seed Medical Documents for Eleanor Vance (Patient)
  const docsData = [
    {
      patientId: patientProfile._id,
      uploadedBy: doctorUser._id,
      documentType: 'MRI',
      title: 'Lumbar Spine MRI Report (L4-L5)',
      description: 'Axial and sagittal T1/T2 weighted sequences showing mild disc protrusion at L4-L5 without cord compression.',
      s3Key: 'documents/demo/mri_lumbar_spine_001.pdf',
      mimeType: 'application/pdf',
      fileSize: 2458000,
      version: 1,
      status: 'ACTIVE'
    },
    {
      patientId: patientProfile._id,
      uploadedBy: doctorUser._id,
      documentType: 'Blood Report',
      title: 'Comprehensive Metabolic Panel & CBC',
      description: 'Complete blood count and renal liver function test. Fasting glucose slightly elevated (108 mg/dL).',
      s3Key: 'documents/demo/cbc_metabolic_panel_002.pdf',
      mimeType: 'application/pdf',
      fileSize: 845000,
      version: 1,
      status: 'ACTIVE'
    },
    {
      patientId: patientProfile._id,
      uploadedBy: doctorUser._id,
      documentType: 'Prescription',
      title: 'Post-Consultation Prescription - Ciprofloxacin & NSAID',
      description: 'Standard 7-day prophylactic course following minor diagnostic procedure.',
      s3Key: 'documents/demo/prescription_cipro_003.pdf',
      mimeType: 'application/pdf',
      fileSize: 420000,
      version: 1,
      status: 'ACTIVE'
    },
    {
      patientId: patientProfile._id,
      uploadedBy: doctorUser._id,
      documentType: 'Discharge Summary',
      title: 'Day Surgery Discharge Summary',
      description: 'Uncomplicated ambulatory recovery. Follow-up consultation scheduled in 14 days.',
      s3Key: 'documents/demo/discharge_summary_004.pdf',
      mimeType: 'application/pdf',
      fileSize: 1120000,
      version: 1,
      status: 'ACTIVE'
    }
  ];

  const createdDocs = await Document.insertMany(docsData);

  // 3. Seed Consents
  const consent1 = await Consent.create({
    patientId: patientProfile._id,
    doctorId: doctorProfile._id,
    procedure: 'Laparoscopic Cholecystectomy (Gallbladder Removal)',
    purpose: 'Elective surgical excision of symptomatic gallbladder containing recurrent calculi (gallstones).',
    description: 'The surgical procedure involves making 3-4 small incisions (0.5 to 1 cm) in the abdominal wall. A laparoscope (specialized camera rod) and precision instruments are inserted under general anesthesia. Carbon dioxide gas will gently inflate the abdomen to provide optimal visualization. The cystic duct and artery will be clipped, and the gallbladder dissected free and extracted through an incision port.',
    benefits: [
      'Permanent relief from biliary colic, pain, and gallstone indigestion',
      'Significantly lower risk of future gallbladder infection (cholecystitis) or gallstone pancreatitis',
      'Minimally invasive approach enables faster recovery (1-2 weeks) compared to open laparotomy'
    ],
    risks: [
      'Postoperative wound infection or minor hematoma at port incision sites (approx. 1-2%)',
      'Adverse reaction to general anesthesia agents (anaphylaxis or respiratory depression)',
      'Potential injury to common bile duct, duodenum, or adjacent vascular structures (0.3%) requiring conversion to open laparotomy',
      'Transient shoulder tip discomfort caused by retained intra-abdominal CO2 gas'
    ],
    alternatives: [
      'Watchful waiting with strict dietary fat restriction (carries recurring risk of acute cholecystitis)',
      'Oral bile acid dissolution therapy (Ursodiol), applicable only to small radiolucent cholesterol stones with high recurrence rate'
    ],
    additionalInformation: 'Patient instructed to remain nil-by-mouth (fasting) starting 8 hours prior to the procedure. Pre-anesthetic assessment verified.',
    version: 1,
    status: 'SENT',
    sentAt: new Date(Date.now() - 2 * 3600 * 1000),
    expiresAt: new Date(Date.now() + 5 * 24 * 3600 * 1000)
  });

  const consent2 = await Consent.create({
    patientId: patientProfile._id,
    doctorId: doctorProfile._id,
    procedure: 'Diagnostic Colonoscopy and Polypectomy',
    purpose: 'Direct endoscopic visualization of lower gastrointestinal tract with potential snare polypectomy.',
    description: 'A flexible colonoscope will be introduced through the rectum to examine the entire large intestine up to the cecum. If mucosal polyps are encountered, cold snare or electrocautery resection will be performed.',
    benefits: ['Early detection and removal of pre-cancerous adenomatous polyps', 'Definitive diagnostic histopathology evaluation'],
    risks: ['Bowel wall perforation (<0.1%)', 'Delayed bleeding from polypectomy site (0.5%)', 'Mild sedation drowsiness'],
    alternatives: ['CT Colonography (virtual colonoscopy), which does not allow tissue biopsy or direct polyp removal'],
    version: 1,
    status: 'ACTIVE',
    sentAt: new Date(Date.now() - 10 * 24 * 3600 * 1000),
    viewedAt: new Date(Date.now() - 9 * 24 * 3600 * 1000),
    acceptedAt: new Date(Date.now() - 8 * 24 * 3600 * 1000),
    expiresAt: new Date(Date.now() + 20 * 24 * 3600 * 1000),
    signatureMetadata: {
      patientConfirmed: true,
      verificationMethod: 'DIGITAL_OTP',
      ipAddress: '192.168.1.104',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      timestamp: new Date(Date.now() - 8 * 24 * 3600 * 1000),
      signatureHash: 'sha256-a9f4c389472e04e9c8b71d9f01ab24ee5903b29c'
    }
  });

  // 4. Seed Audit Logs
  await AuditLog.insertMany([
    {
      userId: adminUser._id,
      userEmail: adminUser.email,
      userName: adminUser.name,
      role: 'ADMIN',
      action: 'SYSTEM_BOOT',
      resourceType: 'SYSTEM',
      resourceId: 'SYS-INIT',
      ipAddress: '127.0.0.1',
      status: 'SUCCESS',
      timestamp: new Date(Date.now() - 24 * 3600 * 1000)
    },
    {
      userId: doctorUser._id,
      userEmail: doctorUser.email,
      userName: doctorUser.name,
      role: 'DOCTOR',
      patientId: patientProfile._id,
      action: 'UPLOAD_DOCUMENT',
      resourceType: 'DOCUMENT',
      resourceId: createdDocs[0]._id.toString(),
      ipAddress: '10.0.4.15',
      status: 'SUCCESS',
      metadata: { title: createdDocs[0].title },
      timestamp: new Date(Date.now() - 12 * 3600 * 1000)
    },
    {
      userId: doctorUser._id,
      userEmail: doctorUser.email,
      userName: doctorUser.name,
      role: 'DOCTOR',
      patientId: patientProfile._id,
      action: 'CREATE_CONSENT',
      resourceType: 'CONSENT',
      resourceId: consent1._id.toString(),
      ipAddress: '10.0.4.15',
      status: 'SUCCESS',
      metadata: { procedure: consent1.procedure },
      timestamp: new Date(Date.now() - 2 * 3600 * 1000)
    },
    {
      userId: patientUser._id,
      userEmail: patientUser.email,
      userName: patientUser.name,
      role: 'PATIENT',
      patientId: patientProfile._id,
      action: 'ACCEPT_CONSENT',
      resourceType: 'CONSENT',
      resourceId: consent2._id.toString(),
      ipAddress: '192.168.1.104',
      status: 'SUCCESS',
      metadata: { version: 1 },
      timestamp: new Date(Date.now() - 8 * 24 * 3600 * 1000)
    }
  ]);

  // 5. Seed Notifications
  await Notification.insertMany([
    {
      userId: patientUser._id,
      title: 'New Consent Request Pending Review',
      message: `Dr. Robert Chen submitted a consent request for "${consent1.procedure}". Please review and verify comprehension.`,
      type: 'CONSENT_REQUEST',
      read: false,
      link: `/patient/consents/${consent1._id}`
    },
    {
      userId: patientUser._id,
      title: 'New Diagnostic Record Available',
      message: 'Lumbar Spine MRI Report (L4-L5) has been uploaded to your secure document vault.',
      type: 'DOCUMENT_UPLOAD',
      read: true,
      link: '/patient/documents'
    },
    {
      userId: doctorUser._id,
      title: 'Consent Digitally Signed',
      message: `Patient Eleanor Vance digitally accepted the consent agreement for ${consent2.procedure}.`,
      type: 'CONSENT_ACCEPTED',
      read: true,
      link: '/doctor/consents'
    }
  ]);

  // 6. Seed Security Alerts
  await SecurityAlert.create({
    userId: doctorUser._id,
    type: 'UNUSUAL_ACCESS_SPIKE',
    severity: 'MEDIUM',
    description: '5 patient records accessed in under 4 minutes from off-campus subnet.',
    count: 5,
    timePeriod: '4m',
    status: 'INVESTIGATING',
    metadata: { subnet: '198.51.100.0/24' }
  });

  console.log('[Seed] Seeding completed successfully!');
  console.log('----------------------------------------------------');
  console.log('Demo Accounts Created:');
  console.log(`  Admin:    admin@hospital.demo    / ${defaultPassword}`);
  console.log(`  Doctor:   doctor@hospital.demo   / ${defaultPassword}`);
  console.log(`  Patient:  patient@hospital.demo  / ${defaultPassword}`);
  console.log(`  Auditor:  auditor@hospital.demo  / ${defaultPassword}`);
  console.log('----------------------------------------------------');
}

// If executed directly from command line
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Seed Error]:', err);
      process.exit(1);
    });
}
