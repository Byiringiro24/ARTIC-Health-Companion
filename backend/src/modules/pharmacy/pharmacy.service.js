/**
 * Pharmacy Service — prescriptions, dispensing, drug inventory, FEFO.
 */
import { v4 as uuidv4 } from "uuid";
import { getDb } from "../../database/connection.js";
import { NotFoundError, AppError, ConflictError } from "../../middleware/errorHandler.js";

const T = "tenant-001", H = "hosp-001";

// ── Prescriptions ──────────────────────────────────────────────────────────────
export async function getPrescriptions({ page=1, limit=20, patientId, status, tenantId, hospitalId } = {}) {
  const db = getDb(); const offset = (page-1)*limit;
  const where = ["p.deleted_at IS NULL","p.tenant_id=?","p.hospital_id=?"];
  const params = [tenantId||T, hospitalId||H];
  if (patientId) { where.push("p.patient_id=?"); params.push(patientId); }
  if (status)    { where.push("p.status=?");     params.push(status); }
  const cond = where.join(" AND ");
  const total = (await db.prepare(`SELECT COUNT(*) as n FROM prescriptions p WHERE ${cond}`).get(...params))?.n ?? 0;
  const rows  = await db.prepare(`
    SELECT p.*,
           pt.first_name||' '||pt.last_name as patient_name, pt.mrn,
           u.first_name||' '||u.last_name as doctor_name
    FROM prescriptions p
    LEFT JOIN patients pt ON pt.id=p.patient_id
    LEFT JOIN users    u  ON u.id=p.doctor_id
    WHERE ${cond} ORDER BY p.created_at DESC LIMIT ? OFFSET ?
  `).all(...params, limit, offset);
  return { data: rows.map(fmtRx), meta: { total, page:+page, limit:+limit, totalPages: Math.ceil(total/limit) } };
}

export async function getPrescriptionById(id) {
  const db = getDb();
  const p  = await db.prepare(`
    SELECT p.*,
           pt.first_name||' '||pt.last_name as patient_name, pt.mrn, pt.allergies,
           u.first_name||' '||u.last_name as doctor_name,
           d.first_name||' '||d.last_name as dispensed_by_name
    FROM prescriptions p
    LEFT JOIN patients pt ON pt.id=p.patient_id
    LEFT JOIN users    u  ON u.id=p.doctor_id
    LEFT JOIN users    d  ON d.id=p.dispensed_by
    WHERE p.id=? AND p.deleted_at IS NULL
  `).get(id);
  if (!p) throw new NotFoundError("Prescription");
  return fmtRx(p);
}

export async function createPrescription(data, createdBy, tenantId, hospitalId) {
  const db = getDb(); const id = `rx-${uuidv4().slice(0,8)}`;
  await db.prepare(`
    INSERT INTO prescriptions (id,tenant_id,hospital_id,patient_id,appointment_id,note_id,doctor_id,items,status)
    VALUES (?,?,?,?,?,?,?,?,?)
  `).run(id, tenantId||T, hospitalId||H, data.patientId, data.appointmentId||null,
    data.noteId||null, createdBy, JSON.stringify(data.items||[]), "active");
  return getPrescriptionById(id);
}

export async function dispensePrescription(id, userId) {
  const db = getDb();
  const rx = await db.prepare(`SELECT * FROM prescriptions WHERE id=? AND deleted_at IS NULL`).get(id);
  if (!rx) throw new NotFoundError("Prescription");
  if (rx.status !== "active") throw new AppError(`Prescription is already '${rx.status}'`, 422, "INVALID_STATUS");

  const items = JSON.parse(rx.items || "[]");
  // Find FEFO inventory for each item and deduct (best-effort)
  for (const item of items) {
    const inv = await db.prepare(`
      SELECT di.* FROM drug_inventory di
      JOIN drug_catalogue dc ON dc.id=di.drug_id
      WHERE (LOWER(dc.generic_name) LIKE ? OR LOWER(dc.brand_names) LIKE ?)
        AND di.quantity >= ? AND di.hospital_id=?
      ORDER BY di.expiry_date ASC LIMIT 1
    `).get(`%${item.drug.toLowerCase()}%`, `%${item.drug.toLowerCase()}%`, item.quantity||1, rx.hospital_id);

    if (inv) {
      await db.prepare(`UPDATE drug_inventory SET quantity=quantity-?, updated_at=datetime('now') WHERE id=?`)
        .run(item.quantity||1, inv.id);
      await db.prepare(`
        INSERT INTO dispensing_log (id,prescription_id,inventory_id,patient_id,pharmacist_id,drug_name,quantity)
        VALUES (?,?,?,?,?,?,?)
      `).run(`disp-${uuidv4().slice(0,8)}`, id, inv.id, rx.patient_id, userId, item.drug, item.quantity||1);
    }
  }

  await db.prepare(`UPDATE prescriptions SET status='dispensed', dispensed_by=?, dispensed_at=datetime('now'), updated_at=datetime('now') WHERE id=?`)
    .run(userId, id);
  return getPrescriptionById(id);
}

// ── Drug Inventory ─────────────────────────────────────────────────────────────
export async function getDrugInventory({ page=1, limit=50, search, tenantId, hospitalId } = {}) {
  const db = getDb(); const offset = (page-1)*limit;
  const where = ["di.hospital_id=?"];
  const params = [hospitalId||H];
  if (search) {
    where.push("(LOWER(dc.generic_name) LIKE ? OR LOWER(dc.brand_names) LIKE ?)");
    params.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`);
  }
  const cond = where.join(" AND ");
  const rows  = await db.prepare(`
    SELECT di.*, dc.generic_name, dc.category, dc.controlled, dc.reorder_level
    FROM drug_inventory di
    JOIN drug_catalogue dc ON dc.id=di.drug_id
    WHERE ${cond}
    ORDER BY di.expiry_date ASC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);
  return rows.map(fmtInv);
}

export async function receiveStock(data, userId, tenantId, hospitalId) {
  const db = getDb();
  // Upsert drug catalogue entry
  let drug = await db.prepare(`SELECT id FROM drug_catalogue WHERE LOWER(generic_name)=LOWER(?) AND tenant_id=?`)
    .get(data.genericName, tenantId||T);
  if (!drug) {
    const did = `drug-${uuidv4().slice(0,8)}`;
    await db.prepare(`INSERT INTO drug_catalogue (id,tenant_id,generic_name,category,controlled) VALUES (?,?,?,?,?)`)
      .run(did, tenantId||T, data.genericName, data.category||"Other", data.controlled?1:0);
    drug = { id: did };
  }
  const id = `inv-${uuidv4().slice(0,8)}`;
  await db.prepare(`
    INSERT INTO drug_inventory (id,tenant_id,hospital_id,drug_id,batch_number,manufacturer,expiry_date,quantity,unit_cost,selling_price,location,supplier,received_by)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(id, tenantId||T, hospitalId||H, drug.id, data.batchNumber, data.manufacturer||null,
    data.expiryDate, data.quantity, data.unitCost||null, data.sellingPrice||null,
    data.location||null, data.supplier||null, userId);
  return { id, ...data, drugId: drug.id };
}

// ── Low stock check ────────────────────────────────────────────────────────────
export async function getLowStockAlerts(hospitalId) {
  const db = getDb();
  return db.prepare(`
    SELECT di.*, dc.generic_name, dc.reorder_level, dc.controlled
    FROM drug_inventory di
    JOIN drug_catalogue dc ON dc.id=di.drug_id
    WHERE di.hospital_id=? AND di.quantity <= dc.reorder_level
    ORDER BY di.quantity ASC
  `).all(hospitalId||H);
}

// ── Format ─────────────────────────────────────────────────────────────────────
function fmtRx(p) {
  return {
    id:p.id, patientId:p.patient_id, patientName:p.patient_name, mrn:p.mrn,
    allergies: safeJson(p.allergies)||[],
    appointmentId:p.appointment_id, noteId:p.note_id,
    doctorId:p.doctor_id, doctorName:p.doctor_name,
    status:p.status, items:safeJson(p.items)||[],
    dispensedBy:p.dispensed_by, dispensedByName:p.dispensed_by_name, dispensedAt:p.dispensed_at,
    tenantId:p.tenant_id, hospitalId:p.hospital_id,
    createdAt:p.created_at, updatedAt:p.updated_at,
  };
}
function fmtInv(i) {
  return {
    id:i.id, drugId:i.drug_id, genericName:i.generic_name, category:i.category,
    controlled:Boolean(i.controlled), reorderLevel:i.reorder_level,
    batchNumber:i.batch_number, manufacturer:i.manufacturer,
    expiryDate:i.expiry_date, quantity:i.quantity,
    unitCost:i.unit_cost, sellingPrice:i.selling_price, location:i.location,
    supplier:i.supplier, receivedAt:i.received_at,
    lowStock: i.quantity <= (i.reorder_level||50),
    nearExpiry: new Date(i.expiry_date) <= new Date(Date.now() + 30*24*60*60*1000),
  };
}
function safeJson(v){try{return v?JSON.parse(v):null;}catch{return v;}}
