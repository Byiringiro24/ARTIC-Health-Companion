/**
 * SMS Service — Africa's Talking (Rwanda: MTN + Airtel)
 * Falls back to console.log in development if credentials not set.
 */

const AT_API_KEY  = process.env.AT_API_KEY  || "";
const AT_USERNAME = process.env.AT_USERNAME || "sandbox";
const AT_SENDER   = process.env.AT_SENDER   || "";
const IS_DEV      = process.env.NODE_ENV !== "production" || !AT_API_KEY;

let _at = null;

function getClient() {
  if (_at) return _at;
  if (IS_DEV) return null;
  try {
    const AfricasTalking = require("africastalking");
    _at = AfricasTalking({ apiKey: AT_API_KEY, username: AT_USERNAME });
    return _at;
  } catch { return null; }
}

/**
 * Send SMS to one or more phone numbers.
 * @param {string|string[]} to — Rwandan phone(s): +250788123456
 * @param {string} message
 */
export async function sendSMS(to, message) {
  const numbers = Array.isArray(to) ? to : [to];
  const valid   = numbers.filter(n => n && n.length >= 10);
  if (!valid.length) return { sent: 0 };

  if (IS_DEV) {
    console.log(`📱 SMS (dev) → ${valid.join(", ")}\n   ${message}`);
    return { sent: valid.length, dev: true };
  }

  try {
    const client = getClient();
    if (!client) throw new Error("Africa's Talking client not initialised");
    const result = await client.SMS.send({
      to: valid,
      message,
      from: AT_SENDER || undefined,
    });
    return { sent: result.SMSMessageData?.Recipients?.length || 0, result };
  } catch (err) {
    console.error("SMS send failed:", err.message);
    return { sent: 0, error: err.message };
  }
}

// ── Templated messages ─────────────────────────────────────────────────────────

export function smsAppointmentBooked(patientName, date, time, doctor, queueNumber) {
  return `ARTIC HMS: Dear ${patientName}, your appointment with ${doctor} on ${date} at ${time} is confirmed. Queue: ${queueNumber}. Kigali District Hospital.`;
}

export function smsAppointmentReminder(patientName, date, time, doctor) {
  return `ARTIC HMS: Reminder — ${patientName}, your appointment with ${doctor} is tomorrow ${date} at ${time}. Please arrive 15 min early.`;
}

export function smsPrescriptionReady(patientName, drugList) {
  return `ARTIC HMS: Dear ${patientName}, your prescription (${drugList}) is ready for collection at the pharmacy.`;
}

export function smsInvoiceGenerated(patientName, amount, invoiceNumber) {
  return `ARTIC HMS: Dear ${patientName}, invoice #${invoiceNumber} for RWF ${amount.toLocaleString()} has been generated. Pay at cashier or via MoMo.`;
}

export function smsPaymentConfirmed(patientName, amount, receiptNumber) {
  return `ARTIC HMS: Payment confirmed. Dear ${patientName}, RWF ${amount.toLocaleString()} received. Receipt: ${receiptNumber}. Thank you.`;
}

export function smsCriticalResult(doctorName, patientName, testName, value) {
  return `ARTIC HMS CRITICAL: ${doctorName}, patient ${patientName} has a critical ${testName} result: ${value}. Immediate review required.`;
}
