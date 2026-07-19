/**
 * Email Service — Nodemailer
 * Falls back to Ethereal (test SMTP) in development.
 */

import nodemailer from "nodemailer";

let _transporter = null;

async function getTransporter() {
  if (_transporter) return _transporter;

  if (process.env.NODE_ENV === "production" && process.env.SMTP_HOST) {
    _transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST,
      port:   parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  } else {
    // Dev: log emails to console, don't actually send
    _transporter = { sendMail: async (opts) => {
      console.log(`📧 EMAIL (dev) → ${opts.to}\n   Subject: ${opts.subject}`);
      return { messageId: `dev-${Date.now()}` };
    }};
  }
  return _transporter;
}

const FROM = process.env.EMAIL_FROM || '"ARTIC Health Companion" <noreply@artic.health>';

export async function sendEmail({ to, subject, html, text }) {
  try {
    const t = await getTransporter();
    const info = await t.sendMail({ from: FROM, to, subject, html, text });
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    console.error("Email send failed:", err.message);
    return { sent: false, error: err.message };
  }
}

// ── Email templates ────────────────────────────────────────────────────────────

export function emailAppointmentConfirmation({ patientName, date, time, doctor, queueNumber, hospitalName }) {
  return {
    subject: `Appointment Confirmed — ${date} at ${time}`,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#027c8e">ARTIC Health Companion</h2>
      <p>Dear <strong>${patientName}</strong>,</p>
      <p>Your appointment has been confirmed:</p>
      <table style="border-collapse:collapse;width:100%">
        <tr><td style="padding:8px;border:1px solid #e5e7eb"><strong>Date</strong></td><td style="padding:8px;border:1px solid #e5e7eb">${date}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb"><strong>Time</strong></td><td style="padding:8px;border:1px solid #e5e7eb">${time}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb"><strong>Doctor</strong></td><td style="padding:8px;border:1px solid #e5e7eb">${doctor}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb"><strong>Queue Number</strong></td><td style="padding:8px;border:1px solid #e5e7eb">${queueNumber}</td></tr>
      </table>
      <p>Please arrive 15 minutes before your appointment time.</p>
      <p style="color:#6b7280;font-size:12px">${hospitalName} • Powered by ARTIC Health Companion</p>
    </div>`,
  };
}

export function emailPasswordReset({ name, resetLink, expiresIn }) {
  return {
    subject: "Password Reset — ARTIC Health Companion",
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#027c8e">Password Reset Request</h2>
      <p>Dear <strong>${name}</strong>,</p>
      <p>You requested a password reset. Click the button below to set a new password:</p>
      <p><a href="${resetLink}" style="background:#027c8e;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block">Reset Password</a></p>
      <p>This link expires in <strong>${expiresIn}</strong>.</p>
      <p>If you did not request this, ignore this email.</p>
    </div>`,
  };
}

export function emailWelcome({ name, email, role, tempPassword, loginUrl }) {
  return {
    subject: "Welcome to ARTIC Health Companion",
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#027c8e">Welcome to ARTIC Health Companion</h2>
      <p>Dear <strong>${name}</strong>,</p>
      <p>Your account has been created with the role: <strong>${role}</strong></p>
      <table style="border-collapse:collapse;width:100%">
        <tr><td style="padding:8px;border:1px solid #e5e7eb"><strong>Email</strong></td><td style="padding:8px;border:1px solid #e5e7eb">${email}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb"><strong>Temp Password</strong></td><td style="padding:8px;border:1px solid #e5e7eb">${tempPassword}</td></tr>
      </table>
      <p><a href="${loginUrl}" style="background:#027c8e;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block">Login Now</a></p>
      <p>Please change your password after first login.</p>
    </div>`,
  };
}

export function emailInvoice({ patientName, invoiceNumber, amount, items, dueDate }) {
  const rows = items.map(i => `<tr>
    <td style="padding:6px;border:1px solid #e5e7eb">${i.service_name}</td>
    <td style="padding:6px;border:1px solid #e5e7eb;text-align:right">RWF ${i.total?.toLocaleString()}</td>
  </tr>`).join("");
  return {
    subject: `Invoice #${invoiceNumber} — RWF ${amount?.toLocaleString()}`,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#027c8e">Invoice #${invoiceNumber}</h2>
      <p>Dear <strong>${patientName}</strong>,</p>
      <table style="border-collapse:collapse;width:100%;margin:16px 0">${rows}</table>
      <p><strong>Total: RWF ${amount?.toLocaleString()}</strong></p>
      <p>Due: ${dueDate || "On presentation"}</p>
      <p style="color:#6b7280;font-size:12px">Pay at cashier desk or via MTN MoMo / Airtel Money.</p>
    </div>`,
  };
}
