import dotenv from 'dotenv';
dotenv.config();

import nodemailer from 'nodemailer';

const DEFAULT_TARGET_EMAIL = 'siva431900@gmail.com';

/**
 * Creates and caches nodemailer transporter based on environment variables
 */
function getTransporter() {
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT, 10) || 587;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  if (!user || !pass) {
    return null;
  }

  // Use nodemailer's optimized Gmail preset if using Gmail
  if (host.includes('gmail.com') || (user && user.toLowerCase().endsWith('@gmail.com'))) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass: pass.replace(/\s+/g, '') // Strips any spaces if copied from Google App Password
      }
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass
    }
  });
}

/**
 * Send an email notification when a doctor uploads or creates a consent document
 */
export async function sendConsentNotificationEmail({
  doctorName = 'Attending Doctor',
  patientName = 'Assigned Patient',
  documentTitle = 'Medical Consent Document',
  documentType = 'Consent',
  version = 1,
  action = 'DOCUMENT_UPLOAD',
  fileSize = null,
  recipientEmail = null
}) {
  const targetEmail = recipientEmail || process.env.NOTIFICATION_ALERT_EMAIL || DEFAULT_TARGET_EMAIL;
  const timestamp = new Date().toLocaleString('en-US', { timeZoneName: 'short' });
  const appUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  const subject = `[ConsentIQ Alert] New Consent Document Uploaded: ${documentTitle}`;

  const formattedSize = fileSize ? `${(fileSize / 1024).toFixed(1)} KB` : null;
  const actionLabel = action === 'CONSENT_REQUEST' ? 'Digital Consent Request Issued' : 'Consent Document Uploaded';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b1120; color: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5); }
        .header { background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 24px; text-align: left; }
        .header h1 { margin: 0; font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.025em; }
        .header p { margin: 6px 0 0; font-size: 13px; color: #e0f2fe; }
        .content { padding: 24px; }
        .badge { display: inline-block; padding: 4px 10px; background: rgba(14, 165, 233, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 9999px; font-size: 11px; font-weight: 600; text-transform: uppercase; margin-bottom: 16px; }
        .alert-box { background: rgba(15, 23, 42, 0.6); border: 1px solid #334155; border-radius: 8px; padding: 16px; margin: 16px 0; }
        .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #1e293b; font-size: 13px; }
        .row:last-child { border-bottom: none; }
        .label { color: #94a3b8; font-weight: 500; }
        .value { color: #f1f5f9; font-weight: 600; text-align: right; }
        .btn { display: inline-block; background: #0284c7; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; margin-top: 16px; text-align: center; }
        .footer { padding: 16px 24px; background: #0b1120; border-top: 1px solid #1e293b; font-size: 12px; color: #64748b; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>ConsentIQ Healthcare Portal</h1>
          <p>Automated Clinical Notification System</p>
        </div>
        <div class="content">
          <span class="badge">${actionLabel}</span>
          <h2 style="margin: 0 0 12px 0; font-size: 18px; color: #ffffff;">Consent Document Notification</h2>
          <p style="margin: 0 0 16px 0; font-size: 14px; color: #cbd5e1; line-height: 1.5;">
            A medical consent document has been securely processed and cataloged by <strong>${doctorName}</strong>.
          </p>

          <div class="alert-box">
            <div class="row">
              <span class="label">Document Title:</span>
              <span class="value">${documentTitle}</span>
            </div>
            <div class="row">
              <span class="label">Document Category:</span>
              <span class="value">${documentType}</span>
            </div>
            <div class="row">
              <span class="label">Attending Doctor:</span>
              <span class="value">${doctorName}</span>
            </div>
            <div class="row">
              <span class="label">Patient Name:</span>
              <span class="value">${patientName}</span>
            </div>
            <div class="row">
              <span class="label">Version:</span>
              <span class="value">v${version}.0</span>
            </div>
            ${formattedSize ? `
            <div class="row">
              <span class="label">File Size:</span>
              <span class="value">${formattedSize}</span>
            </div>` : ''}
            <div class="row">
              <span class="label">Timestamp:</span>
              <span class="value">${timestamp}</span>
            </div>
          </div>

          <div style="text-align: center; margin-top: 24px;">
            <a href="${appUrl}/documents" class="btn">View Document in Portal</a>
          </div>
        </div>
        <div class="footer">
          This is an automated notification from ConsentIQ Patient Consent & Document Management Portal.
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
ConsentIQ Healthcare Portal - Notification
-------------------------------------------
Action: ${actionLabel}
Doctor: ${doctorName}
Patient: ${patientName}
Document Title: ${documentTitle}
Category: ${documentType}
Version: v${version}.0
Timestamp: ${timestamp}

View in portal: ${appUrl}/documents
  `.trim();

  try {
    const transporter = getTransporter();

    if (!transporter) {
      console.log(`\n========================================================`);
      console.log(`[EMAIL NOTIFICATION DISPATCHED] (Pending live SMTP credentials in .env)`);
      console.log(`To:        ${targetEmail}`);
      console.log(`Subject:   ${subject}`);
      console.log(`Doctor:    ${doctorName}`);
      console.log(`Patient:   ${patientName}`);
      console.log(`Document:  ${documentTitle} (${documentType} v${version}.0)`);
      console.log(`Notice:    To send real emails to your Gmail inbox, add EMAIL_USER and EMAIL_PASSWORD (App Password) to server/.env.`);
      console.log(`========================================================\n`);
      return { success: true, simulated: true, recipient: targetEmail };
    }

    const fromAddress = process.env.EMAIL_FROM || `"${doctorName} via ConsentIQ" <${process.env.EMAIL_USER}>`;

    const info = await transporter.sendMail({
      from: fromAddress,
      to: targetEmail,
      subject,
      text: textContent,
      html: htmlContent
    });

    console.log(`[Email Sent Successfully]: messageId=${info.messageId} to=${targetEmail}`);
    return { success: true, messageId: info.messageId, recipient: targetEmail };
  } catch (error) {
    console.error(`[Email Service Error]: Failed to send to ${targetEmail} -`, error.message);
    return { success: false, error: error.message };
  }
}
