/**
 * Email Service — Nodemailer
 * Sends real emails when SMTP_HOST + SMTP_USER + SMTP_PASS are configured.
 * Falls back to console logging when credentials are not set (dev mode).
 *
 * Supports: Gmail, Outlook, SendGrid, AWS SES, Mailgun, any SMTP server.
 * See docs/EMAIL-SETUP.md for full configuration guide.
 */

import nodemailer from "nodemailer";

let _transporter = null;

// Generate a secure random password
export function generateSecurePassword(length = 12) {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const special = "!@#$%^&*";
  const all = upper + lower + digits + special;
  let pw = upper[Math.floor(Math.random()*upper.length)]
         + lower[Math.floor(Math.random()*lower.length)]
         + digits[Math.floor(Math.random()*digits.length)]
         + special[Math.floor(Math.random()*special.length)];
  for (let i = 4; i < length; i++) pw += all[Math.floor(Math.random()*all.length)];
  return pw.split("").sort(()=>Math.random()-0.5).join("");
}

async function getTransporter() {
  // Don't cache a broken/missing-credentials transporter — re-check each time
  // until we successfully connect, then cache it
  if (_transporter && _transporter._verified) return _transporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  // Debug: log presence of credentials (never log the actual password)
  console.log(`📧 Email init — host:${host||"MISSING"} user:${user||"MISSING"} pass:${pass?"SET ("+pass.length+"chars)":"MISSING"}`);

  // Use real SMTP if all three credentials are set
  if (host && user && pass) {
    try {
      const t = nodemailer.createTransport({
        host,
        port:   parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth:   { user, pass },
        tls:    { rejectUnauthorized: false },
        pool:   true,
        maxConnections: 5,
      });
      await t.verify();
      t._verified = true;
      _transporter = t;
      console.log(`✅ Email service ready — ${host} (${user})`);
      return _transporter;
    } catch (err) {
      console.warn(`⚠️  Email SMTP connect failed (${host}): ${err.message}`);
      console.warn("   Falling back to console logging.");
      _transporter = null; // allow retry next call
    }
  }

  // Fallback: log to console (no real send)
  if (!_transporter) {
    _transporter = {
      sendMail: async (opts) => {
        console.log("📧 ─────────────────────────────────────────────");
        console.log(`📧 EMAIL (dev/no-smtp) → ${opts.to}`);
        console.log(`   Subject: ${opts.subject}`);
        if (opts.text) console.log(`   Body: ${opts.text.slice(0,200)}…`);
        console.log("📧 ─────────────────────────────────────────────");
        return { messageId: `dev-${Date.now()}` };
      },
    };
  }

  return _transporter;
}

const FROM = process.env.EMAIL_FROM
  || `"${process.env.EMAIL_FROM_NAME||"ARTIC Health Companion"}" <${process.env.EMAIL_FROM_ADDRESS||"noreply@artic.health"}>`;

export async function sendEmail({ to, subject, html, text }) {
  try {
    const t = await getTransporter();
    const info = await t.sendMail({
      from: FROM, to, subject,
      html,
      text: text || html?.replace(/<[^>]*>/g, ""),
      headers: { "X-Mailer": "ARTIC Health Companion" },
    });
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
    subject: `Your ARTIC HMS Account — Login Credentials`,
    html: `<div style="font-family:sans-serif;max-width:620px;margin:0 auto;background:#f8fafc;padding:20px">
      <div style="background:linear-gradient(135deg,#0891b2,#7c3aed);padding:20px;border-radius:12px;text-align:center;margin-bottom:16px">
        <h1 style="color:white;margin:0;font-size:20px">🏥 ARTIC Health Companion</h1>
      </div>
      <div style="background:white;padding:22px;border-radius:12px;border:1px solid #e2e8f0">
        <h2 style="color:#0f172a;margin:0 0 12px">Hello, <strong>${name}</strong> 👋</h2>
        <p style="color:#374151;line-height:1.6">Your account has been created on <strong>ARTIC Health Companion</strong> with role: <strong>${role}</strong></p>

        <div style="background:#f8fafc;border:2px solid #0891b2;border-radius:10px;padding:16px;margin:16px 0">
          <div style="fontWeight:700;color:#0891b2;marginBottom:10px;font-size:13px">🔑 YOUR LOGIN CREDENTIALS</div>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:6px 0;color:#64748b;font-size:13px">Email</td><td style="padding:6px 0;font-weight:700;color:#0f172a">${email}</td></tr>
            <tr><td style="padding:6px 0;color:#64748b;font-size:13px">Auto-Password</td><td style="padding:6px 0;font-weight:800;color:#d97706;font-family:monospace;font-size:15px">${tempPassword}</td></tr>
          </table>
        </div>

        <div style="background:#fff7ed;border:1px solid #fde68a;border-radius:8px;padding:12px;margin:12px 0;font-size:13px;color:#92400e">
          ⚠️ <strong>Security Notice:</strong> This auto-generated password is temporary. You can use it to log in OR set your own password — your choice.
        </div>

        <div style="display:flex;gap:10px;margin:16px 0">
          <a href="${loginUrl}/login" style="display:inline-block;background:#0891b2;color:white;padding:10px 20px;text-decoration:none;border-radius:8px;font-weight:700;font-size:13px">🔐 Login with Auto-Password</a>
        </div>

        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px;font-size:12px;color:#065f46;margin-top:12px">
          ✅ Your data is protected under Rwanda Data Protection Law (2021)<br>
          ✅ Never share your password with anyone<br>
          ✅ Support: <a href="mailto:support@artic.health" style="color:#059669">support@artic.health</a>
        </div>
      </div>
      <p style="color:#94a3b8;font-size:11px;text-align:center;margin-top:12px">ARTIC Health Companion · Automated message — do not reply</p>
    </div>`,
    text: `ARTIC Health Companion — Account Created\n\nHello ${name},\nEmail: ${email}\nAuto-Password: ${tempPassword}\nRole: ${role}\n\nLogin: ${loginUrl}/login\n\nChange your password after first login.`,
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

export function emailHospitalWelcome({ hospitalName, mohCode, tier, loginUrl, adminEmail, tempPassword, expiryDate }) {
  return {
    subject: `Welcome to ARTIC HMS — ${hospitalName} is now registered`,
    html: `<div style="font-family:sans-serif;max-width:620px;margin:0 auto;background:#f8fafc;padding:24px">
      <div style="background:linear-gradient(135deg,#0891b2,#7c3aed);padding:24px;border-radius:12px;text-align:center;margin-bottom:20px">
        <h1 style="color:white;margin:0;font-size:22px">🏥 ARTIC Health Companion</h1>
        <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:14px">Hospital Management System</p>
      </div>

      <div style="background:white;padding:24px;border-radius:12px;border:1px solid #e2e8f0">
        <h2 style="color:#0f172a;margin:0 0 16px">Welcome — <strong>${hospitalName}</strong></h2>
        <p style="color:#374151;line-height:1.6">Your hospital has been successfully registered on the ARTIC Health Companion platform. Here are your registration details:</p>

        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr style="background:#f8fafc">
            <td style="padding:10px 14px;border:1px solid #e2e8f0;font-weight:600;color:#374151;width:40%">Hospital Name</td>
            <td style="padding:10px 14px;border:1px solid #e2e8f0;color:#0f172a">${hospitalName}</td>
          </tr>
          <tr>
            <td style="padding:10px 14px;border:1px solid #e2e8f0;font-weight:600;color:#374151">MOH Code</td>
            <td style="padding:10px 14px;border:1px solid #e2e8f0;color:#0891b2;font-weight:700;font-family:monospace;font-size:15px">${mohCode}</td>
          </tr>
          <tr style="background:#f8fafc">
            <td style="padding:10px 14px;border:1px solid #e2e8f0;font-weight:600;color:#374151">Subscription Tier</td>
            <td style="padding:10px 14px;border:1px solid #e2e8f0"><span style="background:#ecfeff;color:#0891b2;padding:2px 10px;border-radius:20px;font-weight:700">${tier}</span></td>
          </tr>
          <tr>
            <td style="padding:10px 14px;border:1px solid #e2e8f0;font-weight:600;color:#374151">Admin Login</td>
            <td style="padding:10px 14px;border:1px solid #e2e8f0;color:#0f172a">${adminEmail}</td>
          </tr>
          <tr style="background:#fff7ed">
            <td style="padding:10px 14px;border:1px solid #e2e8f0;font-weight:600;color:#374151">Temporary Password</td>
            <td style="padding:10px 14px;border:1px solid #e2e8f0;font-family:monospace;font-weight:700;color:#d97706">${tempPassword}</td>
          </tr>
          <tr>
            <td style="padding:10px 14px;border:1px solid #e2e8f0;font-weight:600;color:#374151">Trial Expires</td>
            <td style="padding:10px 14px;border:1px solid #e2e8f0;color:#0f172a">${expiryDate}</td>
          </tr>
        </table>

        <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;margin:16px 0">
          <strong style="color:#d97706">⚠️ Security Notice:</strong>
          <p style="color:#92400e;margin:6px 0 0;font-size:13px">You must change this temporary password on your first login. Your MOH code is unique and cannot be transferred. Keep it confidential.</p>
        </div>

        <div style="text-align:center;margin:20px 0">
          <a href="${loginUrl}" style="background:linear-gradient(135deg,#0891b2,#7c3aed);color:white;padding:12px 28px;text-decoration:none;border-radius:8px;display:inline-block;font-weight:700;font-size:15px">
            🔐 Login & Change Password
          </a>
        </div>

        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px 16px">
          <p style="color:#065f46;margin:0;font-size:13px;line-height:1.6">
            ✅ Your hospital data is protected under Rwanda Data Protection Law (2021)<br>
            ✅ All patient records remain confidential and HIPAA-equivalent compliant<br>
            ✅ 24/7 technical support: <a href="mailto:support@artic.health" style="color:#059669">support@artic.health</a>
          </p>
        </div>
      </div>

      <p style="color:#94a3b8;font-size:11px;text-align:center;margin-top:16px">ARTIC Health Companion · Powered by ARTIC Health Technology Rwanda<br>This is an automated message. Do not reply directly to this email.</p>
    </div>`,
    text: `Welcome to ARTIC HMS!\n\nHospital: ${hospitalName}\nMOH Code: ${mohCode}\nTier: ${tier}\nLogin: ${adminEmail}\nTemp Password: ${tempPassword}\nExpiry: ${expiryDate}\n\nLogin at: ${loginUrl}\n\nChange your password on first login!`,
  };
}

export function emailHospitalPasswordSetup({ name, hospitalName, setupLink, expiresIn }) {
  return {
    subject: `Set Up Your ARTIC HMS Password — ${hospitalName}`,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:linear-gradient(135deg,#0891b2,#7c3aed);padding:20px;border-radius:12px;text-align:center;margin-bottom:16px">
        <h1 style="color:white;margin:0;font-size:20px">🔐 ARTIC Health Companion</h1>
      </div>
      <div style="background:white;padding:22px;border-radius:12px;border:1px solid #e2e8f0">
        <h2 style="color:#0f172a">Hello, <strong>${name}</strong></h2>
        <p>Your account has been created for <strong>${hospitalName}</strong> on ARTIC Health Companion.</p>
        <p>Click the button below to set up your password and activate your account:</p>
        <div style="text-align:center;margin:20px 0">
          <a href="${setupLink}" style="background:#0891b2;color:white;padding:12px 26px;text-decoration:none;border-radius:8px;display:inline-block;font-weight:700">
            ✅ Set My Password
          </a>
        </div>
        <p style="color:#64748b;font-size:13px">This link expires in <strong>${expiresIn}</strong>. If you did not expect this email, contact your hospital administrator.</p>
      </div>
    </div>`,
  };
}
