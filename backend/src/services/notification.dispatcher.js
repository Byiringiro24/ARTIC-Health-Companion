/**
 * Notification Dispatcher
 * Sends to the right channels: in-app (DB) + SMS + Email + WebSocket push.
 * Always saves to DB first; SMS/Email are best-effort.
 */

import { getDb } from "../database/connection.js";
import { v4 as uuidv4 } from "uuid";
import { sendSMS, smsAppointmentBooked, smsAppointmentReminder, smsPrescriptionReady, smsPaymentConfirmed, smsInvoiceGenerated, smsCriticalResult } from "./sms.service.js";
import { sendEmail, emailAppointmentConfirmation, emailInvoice, emailPasswordReset, emailWelcome, emailClaimRejected } from "./email.service.js";
import { emitNotification, emitCriticalAlert } from "../modules/realtime/socket.js";

// ── Core: save notification to DB ─────────────────────────────────────────────
async function saveNotification({ tenantId, userId, patientId, type, title, message, channel = "in-app", metadata }) {
  const db = getDb();
  const id = `notif-${uuidv4().slice(0, 8)}`;
  try {
    await db.prepare(`
      INSERT INTO notifications (id,tenant_id,user_id,patient_id,type,title,message,channel,status,metadata)
      VALUES (?,?,?,?,?,?,?,?,'delivered',?)
    `).run(id, tenantId||null, userId||null, patientId||null, type, title, message, channel,
      metadata ? JSON.stringify(metadata) : null);
    // Push via WebSocket if user is online
    if (userId) emitNotification(userId, { id, type, title, message });
  } catch (err) {
    console.error("Notification save failed:", err.message);
  }
  return id;
}

// ── EVENT HANDLERS ─────────────────────────────────────────────────────────────

/** Appointment booked — SMS + Email + in-app */
export async function notifyAppointmentBooked({ patient, doctor, date, time, queueNumber, tenantId, userId }) {
  const title   = "Appointment Confirmed";
  const message = `Your appointment with ${doctor} on ${date} at ${time} is confirmed. Queue: ${queueNumber}.`;

  await saveNotification({ tenantId, userId, patientId: patient.id, type: "success", title, message, channel: "in-app" });

  if (patient.phone) {
    sendSMS(patient.phone, smsAppointmentBooked(patient.fullName, date, time, doctor, queueNumber)).catch(console.error);
  }
  if (patient.email) {
    const { subject, html } = emailAppointmentConfirmation(patient.fullName, date, time, doctor, queueNumber);
    sendEmail({ to: patient.email, subject, html }).catch(console.error);
  }
}

/** Appointment reminder (24h before) */
export async function notifyAppointmentReminder({ patient, doctor, date, time, tenantId, userId }) {
  if (patient.phone) {
    sendSMS(patient.phone, smsAppointmentReminder(patient.fullName, date, time, doctor)).catch(console.error);
  }
  await saveNotification({ tenantId, userId, patientId: patient.id, type: "info",
    title: "Appointment Reminder", message: `Your appointment with ${doctor} is tomorrow ${date} at ${time}.`, channel: "sms" });
}

/** Critical lab result — SMS + in-app instant push to doctor */
export async function notifyCriticalLabResult({ doctorId, doctorName, doctorPhone, patientName, testName, resultValue, tenantId }) {
  const title   = "🚨 Critical Lab Result";
  const message = `CRITICAL: ${testName} for ${patientName} — ${resultValue}. Immediate review required.`;

  await saveNotification({ tenantId, userId: doctorId, type: "danger", title, message, channel: "in-app" });

  // Direct WebSocket push (bypasses DB poll)
  emitCriticalAlert(doctorId, { testName, patientName, resultValue });

  if (doctorPhone) {
    sendSMS(doctorPhone, smsCriticalResult(doctorName, patientName, testName, resultValue)).catch(console.error);
  }
}

/** Prescription ready for pickup */
export async function notifyPrescriptionReady({ patient, drugs, tenantId, userId }) {
  const drugList = drugs.map(d => d.drug || d).join(", ");
  await saveNotification({ tenantId, userId, patientId: patient.id, type: "info",
    title: "Prescription Ready", message: `Your prescription (${drugList}) is ready at the pharmacy.`, channel: "in-app" });
  if (patient.phone) {
    sendSMS(patient.phone, smsPrescriptionReady(patient.fullName, drugList)).catch(console.error);
  }
}

/** Invoice generated */
export async function notifyInvoiceGenerated({ patient, invoiceNumber, amount, items, tenantId, userId }) {
  await saveNotification({ tenantId, userId, patientId: patient.id, type: "info",
    title: "New Invoice", message: `Invoice #${invoiceNumber} for RWF ${amount.toLocaleString()} generated.`, channel: "in-app" });
  if (patient.phone) sendSMS(patient.phone, smsInvoiceGenerated(patient.fullName, amount, invoiceNumber)).catch(console.error);
  if (patient.email) {
    const { subject, html } = emailInvoice(patient.fullName, invoiceNumber, amount, items || []);
    sendEmail({ to: patient.email, subject, html }).catch(console.error);
  }
}

/** Payment confirmed */
export async function notifyPaymentConfirmed({ patient, amount, receiptNumber, tenantId, userId }) {
  await saveNotification({ tenantId, userId, patientId: patient.id, type: "success",
    title: "Payment Confirmed", message: `RWF ${amount.toLocaleString()} received. Receipt: ${receiptNumber}.`, channel: "in-app" });
  if (patient.phone) sendSMS(patient.phone, smsPaymentConfirmed(patient.fullName, amount, receiptNumber)).catch(console.error);
}

/** Insurance claim rejected */
export async function notifyClaimRejected({ patient, invoiceNumber, reason, provider, tenantId, userId }) {
  await saveNotification({ tenantId, userId, patientId: patient.id, type: "warning",
    title: "Insurance Claim Rejected", message: `Claim #${invoiceNumber} rejected by ${provider}: ${reason}`, channel: "in-app" });
  if (patient.email) {
    const { subject, html } = emailClaimRejected(patient.fullName, invoiceNumber, reason, provider);
    sendEmail({ to: patient.email, subject, html }).catch(console.error);
  }
}

/** Low stock alert to pharmacist/store manager */
export async function notifyLowStock({ drugName, currentQty, reorderLevel, hospitalId, tenantId }) {
  const db = getDb();
  const managers = await db.prepare(`
    SELECT u.id FROM users u
    JOIN roles r ON r.id=u.role_id
    WHERE r.name IN ('pharmacist','store-manager') AND u.hospital_id=? AND u.is_active=1 AND u.deleted_at IS NULL
  `).all(hospitalId);

  const message = `Low stock: ${drugName} — ${currentQty} units remaining (reorder at ${reorderLevel}).`;
  for (const m of managers) {
    await saveNotification({ tenantId, userId: m.id, type: "warning", title: "Low Stock Alert", message, channel: "in-app" });
  }
}

/** Welcome email for new user */
export async function notifyWelcome({ firstName, email, tempPassword }) {
  const { subject, html } = emailWelcome(firstName, email, tempPassword);
  sendEmail({ to: email, subject, html }).catch(console.error);
}

/** Password reset email */
export async function notifyPasswordReset({ firstName, email, resetLink }) {
  const { subject, html } = emailPasswordReset(firstName, resetLink);
  return sendEmail({ to: email, subject, html });
}
