/**
 * Billing Service — invoices, payments, insurance splits, reconciliation.
 */
import { v4 as uuidv4 } from "uuid";
import { getDb } from "../../database/connection.js";
import { NotFoundError, AppError } from "../../middleware/errorHandler.js";

const T = "tenant-001", H = "hosp-001";

function nextInvoiceNumber(db, hospitalId) {
  const year = new Date().getFullYear();
  const row  = db.prepare(`SELECT invoice_number FROM invoices WHERE hospital_id=? ORDER BY created_at DESC LIMIT 1`).get(hospitalId||H);
  const seq  = row ? parseInt((row.invoice_number.split("-")[2])||"0", 10) + 1 : 1;
  return `INV-${year}-${String(seq).padStart(4,"0")}`;
}

// ── Invoices ───────────────────────────────────────────────────────────────────
export async function getInvoices({ page=1, limit=20, patientId, status, tenantId, hospitalId } = {}) {
  const db = getDb(); const offset = (page-1)*limit;
  const where = ["i.deleted_at IS NULL","i.tenant_id=?","i.hospital_id=?"];
  const params = [tenantId||T, hospitalId||H];
  if (patientId) { where.push("i.patient_id=?"); params.push(patientId); }
  if (status)    { where.push("i.status=?");     params.push(status); }
  const cond = where.join(" AND ");
  const total = (await db.prepare(`SELECT COUNT(*) as n FROM invoices i WHERE ${cond}`).get(...params))?.n ?? 0;
  const rows  = await db.prepare(`
    SELECT i.*, p.first_name||' '||p.last_name as patient_name, p.mrn,
           p.insurance_provider, p.insurance_number
    FROM invoices i
    LEFT JOIN patients p ON p.id=i.patient_id
    WHERE ${cond} ORDER BY i.created_at DESC LIMIT ? OFFSET ?
  `).all(...params, limit, offset);
  return { data: await Promise.all(rows.map(r => fmtInvoice(db, r))), meta: { total, page:+page, limit:+limit, totalPages: Math.ceil(total/limit) } };
}

export async function getInvoiceById(id) {
  const db = getDb();
  const i  = await db.prepare(`
    SELECT i.*, p.first_name||' '||p.last_name as patient_name, p.mrn,
           p.insurance_provider, p.insurance_number
    FROM invoices i LEFT JOIN patients p ON p.id=i.patient_id
    WHERE i.id=? AND i.deleted_at IS NULL
  `).get(id);
  if (!i) throw new NotFoundError("Invoice");
  return fmtInvoice(db, i);
}

export async function createInvoice(data, createdBy, tenantId, hospitalId) {
  const db = getDb();
  const id = `inv-${uuidv4().slice(0,8)}`;
  const invNumber = nextInvoiceNumber(db, hospitalId);
  const items = data.items || [];

  // Calculate totals with insurance split
  const patient = data.patientId ? await db.prepare(`SELECT insurance_provider, insurance_type FROM patients WHERE id=?`).get(data.patientId) : null;
  const coverRate = insuranceCoverRate(patient?.insurance_provider || data.payer);

  let subtotal = 0, insuranceCover = 0, patientCopay = 0;
  for (const item of items) {
    const itemTotal = (item.quantity||1) * item.unitPrice;
    const itemCover = +(itemTotal * coverRate).toFixed(2);
    item.total          = itemTotal;
    item.insuranceCover = itemCover;
    item.patientCopay   = +(itemTotal - itemCover).toFixed(2);
    subtotal      += itemTotal;
    insuranceCover += itemCover;
    patientCopay  += item.patientCopay;
  }

  await db.prepare(`
    INSERT INTO invoices (id,invoice_number,tenant_id,hospital_id,patient_id,appointment_id,
      payer,subtotal,insurance_cover,patient_copay,total,paid,balance,status,created_by)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,0,?,?,?)
  `).run(id, invNumber, tenantId||T, hospitalId||H, data.patientId, data.appointmentId||null,
    data.payer||patient?.insurance_provider||"self-pay",
    subtotal, insuranceCover, patientCopay, subtotal, patientCopay,
    patientCopay > 0 ? "unpaid" : "insurance",
    createdBy);

  for (const item of items) {
    await db.prepare(`
      INSERT INTO invoice_items (id,invoice_id,service_name,category,quantity,unit_price,total,insurance_cover,patient_copay)
      VALUES (?,?,?,?,?,?,?,?,?)
    `).run(`ii-${uuidv4().slice(0,8)}`, id, item.service, item.category||"General",
      item.quantity||1, item.unitPrice, item.total, item.insuranceCover, item.patientCopay);
  }
  return getInvoiceById(id);
}

// ── Payment ────────────────────────────────────────────────────────────────────
export async function recordPayment(invoiceId, data, cashierId) {
  const db = getDb();
  const inv = await db.prepare(`SELECT * FROM invoices WHERE id=? AND deleted_at IS NULL`).get(invoiceId);
  if (!inv) throw new NotFoundError("Invoice");
  if (inv.status === "paid") throw new AppError("Invoice is already fully paid", 422, "ALREADY_PAID");

  const payId = `pay-${uuidv4().slice(0,8)}`;
  await db.prepare(`
    INSERT INTO payments (id,invoice_id,patient_id,amount,method,reference,cashier_id)
    VALUES (?,?,?,?,?,?,?)
  `).run(payId, invoiceId, inv.patient_id, data.amount, data.method, data.reference||null, cashierId);

  const newPaid    = inv.paid + data.amount;
  const newBalance = Math.max(0, inv.balance - data.amount);
  const newStatus  = newBalance <= 0 ? "paid" : "partially-paid";
  await db.prepare(`UPDATE invoices SET paid=?, balance=?, status=?, updated_at=datetime('now') WHERE id=?`)
    .run(newPaid, newBalance, newStatus, invoiceId);
  return getInvoiceById(invoiceId);
}

// ── Daily reconciliation ───────────────────────────────────────────────────────
export async function getDailyReconciliation(date, hospitalId) {
  const db = getDb(); const d = date || new Date().toISOString().slice(0,10);
  const payments = await db.prepare(`
    SELECT method, SUM(amount) as total, COUNT(*) as count
    FROM payments WHERE date(paid_at)=? AND invoice_id IN (SELECT id FROM invoices WHERE hospital_id=?)
    GROUP BY method
  `).all(d, hospitalId||H);
  const invoicesRaised = (await db.prepare(`SELECT COUNT(*) as n, SUM(total) as sum FROM invoices WHERE date(created_at)=? AND hospital_id=?`).get(d, hospitalId||H));
  return { date:d, invoicesRaised: invoicesRaised?.n||0, totalInvoiced: invoicesRaised?.sum||0, paymentsByMethod: payments, totalCollected: payments.reduce((a,p)=>a+p.total,0) };
}

// Insurance cover rates by provider (Rwanda defaults)
function insuranceCoverRate(provider) {
  const rates = { RSSB:0.85, Mutuelle:0.85, Private:0.70, Corporate:0.80 };
  return rates[provider] || 0;
}

async function fmtInvoice(db, i) {
  const items = await db.prepare(`SELECT * FROM invoice_items WHERE invoice_id=?`).all(i.id);
  const pmts  = await db.prepare(`SELECT * FROM payments WHERE invoice_id=? ORDER BY paid_at DESC`).all(i.id);
  return {
    id:i.id, invoiceNumber:i.invoice_number,
    patientId:i.patient_id, patientName:i.patient_name, mrn:i.mrn,
    insuranceProvider:i.insurance_provider, insuranceNumber:i.insurance_number,
    appointmentId:i.appointment_id, payer:i.payer,
    insuranceClaimStatus:i.insurance_claim_status,
    subtotal:i.subtotal, insuranceCover:i.insurance_cover,
    patientCopay:i.patient_copay, total:i.total, paid:i.paid, balance:i.balance,
    status:i.status, dueDate:i.due_date, notes:i.notes,
    items, payments:pmts,
    tenantId:i.tenant_id, hospitalId:i.hospital_id,
    createdAt:i.created_at, updatedAt:i.updated_at,
  };
}
