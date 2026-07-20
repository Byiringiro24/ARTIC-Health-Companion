/**
 * Super Admin Service — Feature Flags, Subscriptions, Tenant Management
 */
import { v4 as uuidv4 } from "uuid";
import { getDb } from "../../database/connection.js";
import { NotFoundError, AppError } from "../../middleware/errorHandler.js";

// ── MOH Code Generator ───────────────────────────────────────────────────────
function generateMOHCode(name, type) {
  // Format: RW-{TYPE_PREFIX}-{YEAR}-{SEQ4}
  // e.g. RW-DH-2026-0042 (District Hospital)
  const typeMap = {
    district: "DH", referral: "RH", teaching: "TH",
    health_center: "HC", clinic: "CL", private: "PH",
    dispensary: "DS", other: "GH",
  };
  const prefix = typeMap[type] || "GH";
  const year = new Date().getFullYear();
  const seq = Math.floor(Math.random() * 9000) + 1000; // 4-digit random
  return `RW-${prefix}-${year}-${seq}`;
}

async function uniqueMOHCode(db, name, type) {
  // Generate and guarantee uniqueness
  let code; let attempts = 0;
  do {
    code = generateMOHCode(name, type);
    const exists = await db.prepare(`SELECT id FROM hospitals WHERE moh_code=?`).get(code);
    if (!exists) break;
    attempts++;
  } while (attempts < 20);
  return code;
}


const DEFAULT_FEATURES = [
  { id:"ff-01", name:"patients",        label:"Patient Management",       category:"Core",          icon:"👥",  tier:"basic",   status:"active",  order:1 },
  { id:"ff-02", name:"appointments",    label:"Appointment Booking",      category:"Core",          icon:"📅",  tier:"basic",   status:"active",  order:2 },
  { id:"ff-03", name:"consultations",   label:"EMR / Consultation",       category:"Clinical",      icon:"🩺",  tier:"basic",   status:"active",  order:3 },
  { id:"ff-04", name:"pharmacy",        label:"Pharmacy Management",      category:"Clinical",      icon:"💊",  tier:"basic",   status:"active",  order:4 },
  { id:"ff-05", name:"laboratory",      label:"Laboratory",               category:"Clinical",      icon:"🔬",  tier:"basic",   status:"active",  order:5 },
  { id:"ff-06", name:"billing",         label:"Billing & Payments",       category:"Finance",       icon:"💰",  tier:"basic",   status:"active",  order:6 },
  { id:"ff-07", name:"insurance",       label:"Insurance Claims",         category:"Finance",       icon:"🏦",  tier:"basic",   status:"active",  order:7 },
  { id:"ff-08", name:"radiology",       label:"Radiology",                category:"Clinical",      icon:"📡",  tier:"premium", status:"active",  order:8 },
  { id:"ff-09", name:"inpatient",       label:"Inpatient & Beds",         category:"Clinical",      icon:"🛏️",  tier:"premium", status:"active",  order:9 },
  { id:"ff-10", name:"nursing",         label:"Nursing & Triage",         category:"Clinical",      icon:"❤️",  tier:"basic",   status:"active",  order:10 },
  { id:"ff-11", name:"inventory",       label:"Inventory & Procurement",  category:"Operations",    icon:"📦",  tier:"basic",   status:"active",  order:11 },
  { id:"ff-12", name:"hr",             label:"Human Resources",          category:"Operations",    icon:"👔",  tier:"premium", status:"active",  order:12 },
  { id:"ff-13", name:"ambulance",       label:"Ambulance Dispatch",       category:"Emergency",     icon:"🚑",  tier:"premium", status:"active",  order:13 },
  { id:"ff-14", name:"blood-bank",      label:"Blood Bank",               category:"Clinical",      icon:"🩸",  tier:"premium", status:"active",  order:14 },
  { id:"ff-15", name:"reports",         label:"Reports & KPIs",           category:"Analytics",     icon:"📊",  tier:"basic",   status:"active",  order:15 },
  { id:"ff-16", name:"surveillance",    label:"Disease Surveillance",     category:"Public Health", icon:"🦠",  tier:"premium", status:"active",  order:16 },
  { id:"ff-17", name:"quality",         label:"Quality Management",       category:"Compliance",    icon:"✅",  tier:"premium", status:"active",  order:17 },
  { id:"ff-18", name:"telemedicine",    label:"Telemedicine",             category:"Digital",       icon:"📱",  tier:"premium", status:"locked",  order:18, msg:"Requires Pro subscription." },
  { id:"ff-19", name:"ai",             label:"AI Clinical Decision Support",category:"AI",         icon:"🤖",  tier:"pro",     status:"locked",  order:19, msg:"AI features require Pro tier." },
  { id:"ff-20", name:"ai-drug-check",   label:"AI Drug Interaction Checker",category:"AI",         icon:"💊🤖",tier:"pro",     status:"locked",  order:20, msg:"Requires Pro subscription." },
  { id:"ff-21", name:"ai-voice",        label:"AI Voice-to-Text Notes",   category:"AI",           icon:"🎤",  tier:"pro",     status:"locked",  order:21, msg:"Requires Pro subscription." },
  { id:"ff-22", name:"ai-analytics",    label:"AI Predictive Analytics",  category:"AI",           icon:"📈🤖",tier:"pro",     status:"locked",  order:22, msg:"Requires Pro subscription.", approval:true },
  { id:"ff-23", name:"vaccination",     label:"Vaccination Registry",     category:"Registry",     icon:"💉",  tier:"basic",   status:"active",  order:23 },
  { id:"ff-24", name:"birth-registry",  label:"Birth Registration",       category:"Registry",     icon:"👶",  tier:"basic",   status:"active",  order:24 },
  { id:"ff-25", name:"death-registry",  label:"Death Registration",       category:"Registry",     icon:"📋",  tier:"basic",   status:"active",  order:25 },
  { id:"ff-26", name:"anc",            label:"ANC Register",             category:"Registry",     icon:"🤰",  tier:"basic",   status:"active",  order:26 },
  { id:"ff-27", name:"family-planning", label:"Family Planning Register", category:"Registry",     icon:"👨‍👩‍👧", tier:"basic",   status:"active",  order:27 },
  { id:"ff-28", name:"multi-tenant",    label:"Multi-Hospital Network",   category:"Enterprise",   icon:"🏥",  tier:"enterprise",status:"locked",order:28, msg:"Enterprise plan only.", approval:true },
  { id:"ff-29", name:"white-label",     label:"White-Label Branding",     category:"Enterprise",   icon:"🎨",  tier:"enterprise",status:"locked",order:29, msg:"Enterprise plan only.", approval:true },
  { id:"ff-30", name:"fhir",           label:"FHIR R4 Interoperability", category:"Integration",  icon:"🔗",  tier:"pro",     status:"locked",  order:30, msg:"Requires Pro subscription." },
  { id:"ff-31", name:"audit",          label:"Full Audit Trail",         category:"Security",     icon:"🔒",  tier:"basic",   status:"active",  order:31 },
];

export async function seedFeatureFlags() {
  const db = getDb();
  const existing = await db.prepare(`SELECT COUNT(*) as n FROM feature_flags`).get();
  if (existing?.n > 0) return;
  const ins = db.prepare(`INSERT INTO feature_flags (id,name,label,description,category,icon,default_status,tier_required,requires_approval,access_message,sort_order) VALUES(?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING`);
  for (const f of DEFAULT_FEATURES) {
    await ins.run(f.id, f.name, f.label, f.label, f.category, f.icon,
      f.status||"active", f.tier||"basic", f.approval?1:0, f.msg||null, f.order||0);
  }
  console.log(`✅  Seeded ${DEFAULT_FEATURES.length} feature flags`);
}

// ── Feature Flags ─────────────────────────────────────────────────────────────
export async function getAllFeatureFlags({ category, tier, status } = {}) {
  const db = getDb(); const where = []; const params = [];
  if (category) { where.push("category=?"); params.push(category); }
  if (tier)     { where.push("tier_required=?"); params.push(tier); }
  if (status)   { where.push("default_status=?"); params.push(status); }
  const cond = where.length ? "WHERE " + where.join(" AND ") : "";
  return db.prepare(`SELECT * FROM feature_flags ${cond} ORDER BY sort_order ASC, category ASC`).all(...params);
}

export async function updateFeatureFlag(id, data) {
  const db = getDb();
  const f = await db.prepare(`SELECT id FROM feature_flags WHERE id=?`).get(id);
  if (!f) throw new NotFoundError("Feature flag");
  const fields = []; const vals = [];
  const map = { label:"label", description:"description", defaultStatus:"default_status",
    tierRequired:"tier_required", requiresApproval:"requires_approval", accessMessage:"access_message",
    contactEmail:"contact_email", contactPhone:"contact_phone",
    usageLimitDefault:"usage_limit_default", isPaidAddon:"is_paid_addon",
    addonPrice:"addon_price", isActive:"is_active" };
  for (const [k, col] of Object.entries(map)) {
    if (data[k] !== undefined) { fields.push(`${col}=?`); vals.push(data[k]); }
  }
  if (!fields.length) return db.prepare(`SELECT * FROM feature_flags WHERE id=?`).get(id);
  fields.push("updated_at=CURRENT_TIMESTAMP"); vals.push(id);
  await db.prepare(`UPDATE feature_flags SET ${fields.join(",")} WHERE id=?`).run(...vals);
  return db.prepare(`SELECT * FROM feature_flags WHERE id=?`).get(id);
}

// ── Hospital Feature Access ───────────────────────────────────────────────────
export async function getHospitalFeatures(hospitalId) {
  const db = getDb();
  const rows = await db.prepare(`
    SELECT ff.*, hfa.access_status, hfa.usage_count, hfa.usage_limit, hfa.expires_at, hfa.id as access_id
    FROM feature_flags ff
    LEFT JOIN hospital_feature_access hfa ON hfa.feature_id=ff.id AND hfa.hospital_id=?
    WHERE ff.is_active=1 ORDER BY ff.sort_order
  `).all(hospitalId);
  return rows.map(r => ({
    ...r,
    effectiveStatus: r.access_status ?? (r.default_status === "active" ? "active" : "locked"),
  }));
}

export async function setHospitalFeatureAccess(hospitalId, featureId, status, approvedBy, options = {}) {
  const db = getDb();
  const existing = await db.prepare(`SELECT id FROM hospital_feature_access WHERE hospital_id=? AND feature_id=?`).get(hospitalId, featureId);
  if (existing) {
    await db.prepare(`UPDATE hospital_feature_access SET access_status=?,approved_by=?,approved_at=CURRENT_TIMESTAMP,expires_at=?,usage_limit=?,notes=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(status, approvedBy, options.expiresAt||null, options.usageLimit||null, options.notes||null, existing.id);
  } else {
    const id = `hfa-${uuidv4().slice(0,8)}`;
    await db.prepare(`INSERT INTO hospital_feature_access (id,hospital_id,feature_id,access_status,approved_by,approved_at,expires_at,usage_limit,notes) VALUES(?,?,?,?,?,CURRENT_TIMESTAMP,?,?,?)`).run(id, hospitalId, featureId, status, approvedBy, options.expiresAt||null, options.usageLimit||null, options.notes||null);
  }
  return getHospitalFeatures(hospitalId);
}

export async function bulkSetTierFeatures(hospitalId, tier, approvedBy) {
  const db = getDb();
  const tierOrder = { trial:0, basic:1, premium:2, pro:3, enterprise:4 };
  const tierLevel = tierOrder[tier] ?? 0;
  const features = await db.prepare(`SELECT id, tier_required, default_status FROM feature_flags WHERE is_active=1`).all();
  for (const f of features) {
    const featureTierLevel = tierOrder[f.tier_required] ?? 0;
    const status = (featureTierLevel <= tierLevel && f.default_status !== "locked") ? "active" : "locked";
    await setHospitalFeatureAccess(hospitalId, f.id, status, approvedBy);
  }
}

// ── Feature Access Requests ───────────────────────────────────────────────────
export async function getAccessRequests({ status } = {}) {
  const db = getDb();
  // "all" means no filter; otherwise filter by specific status
  const where = (status && status !== "all") ? "WHERE far.status=?" : "";
  const params = (status && status !== "all") ? [status] : [];
  return db.prepare(`
    SELECT far.*, ff.name as feature_name, ff.label as feature_label, ff.icon,
           h.name as hospital_name, h.id as hospital_id,
           u.first_name||' '||u.last_name as requested_by_name, u.job_title
    FROM feature_access_requests far
    JOIN feature_flags ff ON ff.id=far.feature_id
    JOIN hospitals h ON h.id=far.hospital_id
    JOIN users u ON u.id=far.requested_by
    ${where} ORDER BY far.created_at DESC
  `).all(...params);
}

export async function submitAccessRequest(hospitalId, featureId, requestedBy, reason) {
  const db = getDb();
  const existing = await db.prepare(`SELECT id FROM feature_access_requests WHERE hospital_id=? AND feature_id=? AND status='pending'`).get(hospitalId, featureId);
  if (existing) throw new AppError("A pending request already exists for this feature", 409, "DUPLICATE_REQUEST");
  const id = `far-${uuidv4().slice(0,8)}`;
  await db.prepare(`INSERT INTO feature_access_requests (id,hospital_id,feature_id,requested_by,status,reason) VALUES(?,?,?,?,?,?)`).run(id, hospitalId, featureId, requestedBy, "pending", reason||null);
  return db.prepare(`SELECT far.*, ff.label as feature_label, h.name as hospital_name FROM feature_access_requests far JOIN feature_flags ff ON ff.id=far.feature_id JOIN hospitals h ON h.id=far.hospital_id WHERE far.id=?`).get(id);
}

export async function resolveAccessRequest(requestId, decision, adminId, adminNotes, options = {}) {
  const db = getDb();
  const req = await db.prepare(`SELECT * FROM feature_access_requests WHERE id=?`).get(requestId);
  if (!req) throw new NotFoundError("Access request");
  if (req.status !== "pending") throw new AppError("Request already resolved", 422, "ALREADY_RESOLVED");
  await db.prepare(`UPDATE feature_access_requests SET status=?,admin_notes=?,approved_by=?,approved_at=CURRENT_TIMESTAMP,expires_at=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(decision, adminNotes||null, adminId, options.expiresAt||null, requestId);
  if (decision === "approved") {
    await setHospitalFeatureAccess(req.hospital_id, req.feature_id, "active", adminId, options);
  }
  return getAccessRequests({ status: "pending" });
}

// ── Hospitals Management ──────────────────────────────────────────────────────
export async function getAllHospitals({ page=1, limit=20, search, tier } = {}) {
  const db = getDb(); const offset = (page-1)*limit;
  const where = ["h.deleted_at IS NULL"]; const params = [];
  if (search) { where.push("LOWER(h.name) LIKE ?"); params.push(`%${search.toLowerCase()}%`); }
  if (tier)   { where.push("s.tier=?"); params.push(tier); }
  const cond = where.join(" AND ");
  const total = (await db.prepare(`SELECT COUNT(*) as n FROM hospitals h LEFT JOIN subscriptions s ON s.hospital_id=h.id WHERE ${cond}`).get(...params))?.n ?? 0;
  const rows = await db.prepare(`
    SELECT h.*, s.tier, s.status as sub_status, s.expires_at,
           (SELECT COUNT(*) FROM users u WHERE u.hospital_id=h.id AND u.deleted_at IS NULL AND u.is_active=1) as active_users,
           (SELECT COUNT(*) FROM hospital_feature_access hfa WHERE hfa.hospital_id=h.id AND hfa.access_status='active') as active_features
    FROM hospitals h
    LEFT JOIN subscriptions s ON s.hospital_id=h.id
    WHERE ${cond}
    ORDER BY h.name
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);
  return { data: rows, meta: { total, page:+page, limit:+limit, totalPages: Math.ceil(total/limit) } };
}

export async function createHospital(data, createdBy) {
  const db = getDb();
  const id = `hosp-${uuidv4().slice(0,8)}`;
  const tid = "tenant-001";

  // Auto-generate unique MOH code if not provided
  const mohCode = data.mohCode?.trim() || await uniqueMOHCode(db, data.name, data.type || "district");

  await db.prepare(`INSERT INTO hospitals (id,tenant_id,code,name,type,moh_code,email,phone,is_active) VALUES(?,?,?,?,?,?,?,?,1) ON CONFLICT(id) DO NOTHING`)
    .run(id, tid, data.code || id, data.name, data.type || "district", mohCode, data.email || null, data.phone || null);

  // Create subscription
  const subId = `sub-${uuidv4().slice(0,8)}`;
  const tier = data.tier || "trial";
  const trialEnd = new Date(); trialEnd.setDate(trialEnd.getDate() + 14);
  await db.prepare(`INSERT INTO subscriptions (id,hospital_id,tier,status,price_per_month,billing_email,trial_ends_at,created_by) VALUES(?,?,?,?,?,?,?,?)`)
    .run(subId, id, tier, "active", data.pricePerMonth || null, data.billingEmail || data.email || null, tier === "trial" ? trialEnd.toISOString() : null, createdBy);

  // Auto-assign features based on tier
  await bulkSetTierFeatures(id, tier, createdBy);

  const hospital = await db.prepare(`SELECT h.*, s.tier, s.status as sub_status FROM hospitals h LEFT JOIN subscriptions s ON s.hospital_id=h.id WHERE h.id=?`).get(id);

  // Send welcome email to hospital email if provided
  if (data.email) {
    try {
      const { sendEmail, emailHospitalWelcome } = await import("../../services/email.service.js");
      const loginUrl = process.env.FRONTEND_URL || "http://172.209.217.176:3001";
      await sendEmail({
        to: data.email,
        ...emailHospitalWelcome({
          hospitalName: data.name,
          mohCode,
          tier: tier.charAt(0).toUpperCase() + tier.slice(1),
          loginUrl,
          adminEmail: data.adminEmail || data.email,
          tempPassword: data.tempPassword || "ChangeMe@2026!",
          expiryDate: trialEnd.toLocaleDateString("en-RW"),
        }),
      });
    } catch (e) { console.warn("Hospital welcome email failed:", e.message); }
  }

  return { ...hospital, moh_code: mohCode };
}

export async function updateHospitalSubscription(hospitalId, tier, adminId) {
  const db = getDb();
  await db.prepare(`UPDATE subscriptions SET tier=?,updated_at=CURRENT_TIMESTAMP WHERE hospital_id=?`).run(tier, hospitalId);
  await bulkSetTierFeatures(hospitalId, tier, adminId);
  return db.prepare(`SELECT h.*, s.tier, s.status as sub_status FROM hospitals h LEFT JOIN subscriptions s ON s.hospital_id=h.id WHERE h.id=?`).get(hospitalId);
}

// ── Subscription Invoices ─────────────────────────────────────────────────────
export async function getSubscriptionInvoices({ hospitalId, status } = {}) {
  const db = getDb(); const where = []; const params = [];
  if (hospitalId) { where.push("si.hospital_id=?"); params.push(hospitalId); }
  if (status)     { where.push("si.status=?"); params.push(status); }
  const cond = where.length ? "WHERE "+where.join(" AND ") : "";
  return db.prepare(`
    SELECT si.*, h.name as hospital_name, s.tier
    FROM subscription_invoices si
    JOIN hospitals h ON h.id=si.hospital_id
    LEFT JOIN subscriptions s ON s.hospital_id=si.hospital_id
    ${cond} ORDER BY si.created_at DESC
  `).all(...params);
}

export async function createSubscriptionInvoice(hospitalId, amount, createdBy, options = {}) {
  const db = getDb(); const id = `sinv-${uuidv4().slice(0,8)}`;
  const ref = `INV-SYS-${new Date().getFullYear()}-${uuidv4().slice(0,6).toUpperCase()}`;
  await db.prepare(`INSERT INTO subscription_invoices (id,hospital_id,invoice_ref,amount,currency,status,period_start,period_end,notes) VALUES(?,?,?,?,?,?,?,?,?)`).run(id, hospitalId, ref, amount, options.currency||"USD", "pending", options.periodStart||null, options.periodEnd||null, options.notes||null);
  return db.prepare(`SELECT * FROM subscription_invoices WHERE id=?`).get(id);
}

// ── System Stats ──────────────────────────────────────────────────────────────
export async function getSystemStats() {
  const db = getDb();

  // PRIVACY: Only aggregated counts — NO individual patient data
  const [hospitals, users, patientCount, pendingRequests, activeFeatures] = await Promise.all([
    db.prepare(`SELECT COUNT(*) as n FROM hospitals WHERE deleted_at IS NULL`).get(),
    db.prepare(`SELECT COUNT(*) as n FROM users WHERE deleted_at IS NULL AND is_active=1`).get(),
    // Patient count is aggregated — no names, no NID, no clinical data
    db.prepare(`SELECT COUNT(*) as n FROM patients WHERE deleted_at IS NULL`).get(),
    db.prepare(`SELECT COUNT(*) as n FROM feature_access_requests WHERE status='pending'`).get(),
    db.prepare(`SELECT COUNT(*) as n FROM feature_flags WHERE default_status='active' AND is_active=1`).get(),
  ]);

  const tierCounts = await db.prepare(`SELECT tier, COUNT(*) as count FROM subscriptions GROUP BY tier`).all();

  // Revenue from subscription invoices (aggregated — no individual patient data)
  const revenueStats = await db.prepare(`
    SELECT
      COALESCE(SUM(CASE WHEN status='paid' THEN amount ELSE 0 END), 0) as total_paid,
      COALESCE(SUM(CASE WHEN status='pending' THEN amount ELSE 0 END), 0) as total_pending,
      COALESCE(SUM(CASE WHEN status='overdue' THEN amount ELSE 0 END), 0) as total_overdue,
      COALESCE(SUM(amount), 0) as total_invoiced,
      COUNT(*) as invoice_count,
      COUNT(CASE WHEN status='paid' THEN 1 END) as paid_count
    FROM subscription_invoices
  `).get();

  // Monthly revenue (last 6 months)
  const monthlyRevenue = await db.prepare(`
    SELECT TO_CHAR(created_at::timestamp, 'YYYY-MM') as month,
           COALESCE(SUM(CASE WHEN status='paid' THEN amount ELSE 0 END), 0) as revenue,
           COUNT(*) as invoices
    FROM subscription_invoices
    WHERE created_at::timestamp >= CURRENT_TIMESTAMP - INTERVAL '6 months'
    GROUP BY TO_CHAR(created_at::timestamp, 'YYYY-MM')
    ORDER BY month ASC
  `).all();

  // Technical KPIs only (no patient clinical data)
  const todayAppts = await db.prepare(`SELECT COUNT(*) as n FROM appointments WHERE appointment_date::date = CURRENT_DATE`).get();
  const todayLabs  = await db.prepare(`SELECT COUNT(*) as n FROM lab_requests WHERE ordered_at::date = CURRENT_DATE`).get();

  return {
    // System health
    totalHospitals:    hospitals?.n  || 0,
    activeUsers:       users?.n      || 0,
    // Aggregated counts only — NO individual patient data per Rwanda DPL
    totalPatients:     patientCount?.n || 0,
    pendingRequests:   pendingRequests?.n || 0,
    activeFeatures:    activeFeatures?.n || 0,
    hospitalsByTier:   tierCounts,
    // Technical stats (aggregated, non-identifiable)
    todayAppointments: todayAppts?.n || 0,
    todayLabTests:     todayLabs?.n  || 0,
    // Revenue (subscription billing — aggregated, not clinical)
    revenue: {
      totalPaid:     Number(revenueStats?.total_paid    || 0),
      totalPending:  Number(revenueStats?.total_pending || 0),
      totalOverdue:  Number(revenueStats?.total_overdue || 0),
      totalInvoiced: Number(revenueStats?.total_invoiced|| 0),
      invoiceCount:  Number(revenueStats?.invoice_count || 0),
      paidCount:     Number(revenueStats?.paid_count    || 0),
      monthly:       monthlyRevenue || [],
    },
    privacyNote: "All patient counts are aggregated. Individual patient data is not accessible to Super Admin per Rwanda Data Protection Law (2021).",
  };
}

// ── Bulk Feature Operations ───────────────────────────────────────────────────
export async function bulkUpdateFeatureFlags(updates) {
  if (!Array.isArray(updates)) throw new AppError("Expected array of updates", 400, "INVALID_INPUT");
  const results = [];
  for (const u of updates) {
    if (!u.id) continue;
    try { results.push(await updateFeatureFlag(u.id, u)); } catch { /* skip invalid */ }
  }
  return { updated: results.length, results };
}

export async function importFeatureFlags(features, importedBy) {
  if (!Array.isArray(features)) throw new AppError("Expected array of features", 400, "INVALID_INPUT");
  const db = getDb(); let created = 0; let updated = 0;
  for (const f of features) {
    if (!f.name || !f.label) continue;
    const existing = await db.prepare(`SELECT id FROM feature_flags WHERE name=?`).get(f.name);
    if (existing) { await updateFeatureFlag(existing.id, f); updated++; }
    else {
      const id = f.id || `ff-${uuidv4().slice(0,8)}`;
      await db.prepare(`INSERT INTO feature_flags (id,name,label,description,category,icon,default_status,tier_required,requires_approval,access_message,sort_order) VALUES(?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING`)
        .run(id, f.name, f.label, f.description||f.label, f.category||"Other", f.icon||"⚙️", f.defaultStatus||f.default_status||"active", f.tierRequired||f.tier_required||"basic", f.requiresApproval||0, f.accessMessage||f.access_message||null, f.sort_order||0);
      created++;
    }
  }
  return { imported: created + updated, created, updated };
}

// ── Hospital detail, update, delete ──────────────────────────────────────────
export async function getHospitalById(hospitalId) {
  const db = getDb();
  const h = await db.prepare(`
    SELECT h.*, s.tier, s.status as sub_status, s.price_per_month, s.expires_at, s.trial_ends_at,
           (SELECT COUNT(*) FROM users u WHERE u.hospital_id=h.id AND u.deleted_at IS NULL AND u.is_active=1) as active_users,
           (SELECT COUNT(*) FROM hospital_feature_access hfa WHERE hfa.hospital_id=h.id AND hfa.access_status='active') as active_features
    FROM hospitals h
    LEFT JOIN subscriptions s ON s.hospital_id=h.id
    WHERE h.id=? AND h.deleted_at IS NULL
  `).get(hospitalId);
  if (!h) throw new NotFoundError("Hospital");
  return h;
}

export async function updateHospital(hospitalId, data) {
  const db = getDb();
  const h = await db.prepare(`SELECT id FROM hospitals WHERE id=? AND deleted_at IS NULL`).get(hospitalId);
  if (!h) throw new NotFoundError("Hospital");
  const fields = []; const vals = [];
  const map = { name:"name", email:"email", phone:"phone", type:"type", mohCode:"moh_code", address:"address", website:"website" };
  for (const [k, col] of Object.entries(map)) {
    if (data[k] !== undefined) { fields.push(`${col}=?`); vals.push(data[k]); }
  }
  if (!fields.length) return getHospitalById(hospitalId);
  fields.push("updated_at=CURRENT_TIMESTAMP"); vals.push(hospitalId);
  await db.prepare(`UPDATE hospitals SET ${fields.join(",")} WHERE id=?`).run(...vals);
  return getHospitalById(hospitalId);
}

export async function softDeleteHospital(hospitalId, adminId) {
  const db = getDb();
  await db.prepare(`UPDATE hospitals SET deleted_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(hospitalId);
  await db.prepare(`UPDATE subscriptions SET status='cancelled',updated_at=CURRENT_TIMESTAMP WHERE hospital_id=?`).run(hospitalId);
}

// ── Invoice detail + status update ───────────────────────────────────────────
export async function getInvoiceById(invoiceId) {
  const db = getDb();
  const inv = await db.prepare(`SELECT si.*, h.name as hospital_name, s.tier FROM subscription_invoices si JOIN hospitals h ON h.id=si.hospital_id LEFT JOIN subscriptions s ON s.hospital_id=si.hospital_id WHERE si.id=?`).get(invoiceId);
  if (!inv) throw new NotFoundError("Invoice");
  return inv;
}

export async function updateInvoiceStatus(invoiceId, status, adminId) {
  const db = getDb();
  const inv = await db.prepare(`SELECT id FROM subscription_invoices WHERE id=?`).get(invoiceId);
  if (!inv) throw new NotFoundError("Invoice");
  const paidAt = status === "paid" ? "CURRENT_TIMESTAMP" : "NULL";
  await db.prepare(`UPDATE subscription_invoices SET status=?,paid_at=${status==="paid"?"CURRENT_TIMESTAMP":"NULL"},updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(status, invoiceId);
  return getInvoiceById(invoiceId);
}

// ── Tier Configurations ───────────────────────────────────────────────────────
const DEFAULT_TIER_CONFIGS = {
  trial:      { price: 0,    maxUsers: 3,   support: "email",     features: ["patients","appointments","billing"], trialDays: 14 },
  basic:      { price: 50,   maxUsers: 10,  support: "email",     features: ["patients","appointments","billing","laboratory","pharmacy","nursing"] },
  premium:    { price: 120,  maxUsers: 30,  support: "priority",  features: ["all_basic","radiology","inpatient","insurance","reports","surveillance"] },
  pro:        { price: 250,  maxUsers: 100, support: "24/7",      features: ["all_premium","ai","telemedicine","fhir","blood-bank"] },
  enterprise: { price: null, maxUsers: null,support: "dedicated", features: ["all","white-label","multi-tenant"] },
};

export async function getTierConfigs() {
  const db = getDb();
  // Try to load from DB first (so edits persist)
  try {
    const rows = await db.prepare(`SELECT tier, config FROM tier_configs`).all();
    if (rows.length > 0) {
      return rows.map(r => ({ tier: r.tier, ...JSON.parse(r.config) }));
    }
  } catch { /* table may not exist yet — fall back to defaults */ }
  return Object.entries(DEFAULT_TIER_CONFIGS).map(([tier, config]) => ({ tier, ...config }));
}

export async function updateTierConfig(tier, data) {
  const db = getDb();
  try {
    await db.prepare(`CREATE TABLE IF NOT EXISTS tier_configs (tier TEXT PRIMARY KEY, config TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run();
    const existing = await db.prepare(`SELECT tier FROM tier_configs WHERE tier=?`).get(tier);
    const config = JSON.stringify({ ...DEFAULT_TIER_CONFIGS[tier], ...data });
    if (existing) { await db.prepare(`UPDATE tier_configs SET config=?,updated_at=CURRENT_TIMESTAMP WHERE tier=?`).run(config, tier); }
    else { await db.prepare(`INSERT INTO tier_configs (tier,config) VALUES(?,?)`).run(tier, config); }
    return { tier, ...JSON.parse(config) };
  } catch(e) { throw new AppError(`Failed to update tier config: ${e.message}`, 500, "DB_ERROR"); }
}

// ── System Audit Logs (no clinical data) ─────────────────────────────────────
export async function getSystemAuditLogs({ page=1, limit=50, action, module, dateFrom, dateTo } = {}) {
  const db = getDb();
  const offset = (page-1)*limit;
  const where = []; const params = [];
  // Only show system-level actions, NOT clinical data
  where.push("(al.module IN ('auth','super-admin','privacy-guard','feature-flags') OR al.result='denied')");
  if (action)   { where.push("al.action=?"); params.push(action); }
  if (module)   { where.push("al.module=?"); params.push(module); }
  if (dateFrom) { where.push("al.created_at>=?"); params.push(dateFrom); }
  if (dateTo)   { where.push("al.created_at<=?"); params.push(dateTo); }
  const cond = where.length ? "WHERE " + where.join(" AND ") : "";
  const total = (await db.prepare(`SELECT COUNT(*) as n FROM audit_logs al ${cond}`).get(...params))?.n ?? 0;
  const rows  = await db.prepare(`SELECT al.id,al.user_email,al.user_role,al.action,al.module,al.result,al.reason,al.ip_address,al.created_at FROM audit_logs al ${cond} ORDER BY al.created_at DESC LIMIT ? OFFSET ?`).all(...params, limit, offset);
  return { data: rows, meta: { total, page:+page, limit:+limit, totalPages: Math.ceil(total/limit) } };
}

// ── AI Companion — Gemini-powered with system context + local KB fallback ──────
export async function processAIQuery(query, userId) {
  if (!query?.trim()) throw new AppError("Query is required", 400, "INVALID_INPUT");

  let response;
  const GEMINI_KEY = process.env.GEMINI_API_KEY;

  // Try Gemini 2.5 Flash first (most capable, fast)
  if (GEMINI_KEY) {
    try {
      const db = getDb();
      const [hospCount, userCount, featCount] = await Promise.all([
        db.prepare(`SELECT COUNT(*) as n FROM hospitals WHERE deleted_at IS NULL`).get(),
        db.prepare(`SELECT COUNT(*) as n FROM users WHERE deleted_at IS NULL AND is_active=1`).get(),
        db.prepare(`SELECT COUNT(*) as n FROM feature_flags WHERE default_status='active'`).get(),
      ]);

      const systemInstruction = `You are the ARTIC Health Companion AI, an intelligent assistant integrated into a hospital management system serving ${hospCount?.n||0} hospitals with ${userCount?.n||0} active healthcare users in Rwanda.

You have expert knowledge of:
- Rwanda Ministry of Health (MOH) clinical protocols and guidelines (2024 edition)
- Rwanda Essential Medicines List and National Drug Formulary
- Rwanda Integrated Health Management Information System (iHMIS)
- WHO guidelines adapted for Rwanda context
- East Africa regional health standards
- Rwanda Data Protection Law (equivalent to HIPAA privacy rules)
- Hospital administration, staffing, billing, quality management

The system has ${featCount?.n||0} active features. Answer questions about clinical guidance, health education, medication information, Rwanda MOH protocols, hospital operations, staffing, billing, insurance, quality, and administrative management.

Privacy rules: Never generate, infer, or discuss individual patient data. All responses must be appropriate for healthcare professionals. Recommend consultation with qualified medical professionals for clinical decisions.

Be concise, practical, and evidence-based. Use Rwanda-specific context when relevant.`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: [{ role:"user", parts: [{ text: query }] }],
          generationConfig: { temperature:0.4, maxOutputTokens:800, topP:0.95 },
          safetySettings: [
            { category:"HARM_CATEGORY_HARASSMENT", threshold:"BLOCK_MEDIUM_AND_ABOVE" },
            { category:"HARM_CATEGORY_DANGEROUS_CONTENT", threshold:"BLOCK_MEDIUM_AND_ABOVE" },
          ],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          response = text + "\n\n⚕️ *Powered by ARTIC AI with Rwanda MOH protocols. Verify clinical decisions with qualified professionals.*";
        }
      } else {
        const errData = await res.json().catch(()=>({}));
        console.warn("Gemini API error:", res.status, errData?.error?.message);
      }
    } catch (e) { console.warn("Gemini call failed, using local KB:", e.message); }
  }

  // Try OpenAI as secondary fallback
  if (!response && process.env.OPENAI_API_KEY) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role:"system", content:"You are ARTIC AI, a hospital management assistant for Rwanda. Provide guidance on clinical protocols, operations, and administration. Never access individual patient data." },
            { role:"user", content: query },
          ],
          max_tokens: 600, temperature: 0.4,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        response = data.choices?.[0]?.message?.content || "";
        if (response) response += "\n\n⚕️ Powered by ARTIC AI with Rwanda MOH protocols.";
      }
    } catch (e) { console.warn("OpenAI fallback failed:", e.message); }
  }

  // Local KB fallback
  if (!response) {
    const q = query.toLowerCase();
    let matched = AI_KB.default;
    for (const [key, val] of Object.entries(AI_KB)) {
      if (key !== "default" && q.includes(key)) { matched = val; break; }
    }
    response = `Regarding your query about "${query}":\n\n${matched}\n\n⚕️ Local knowledge base response aligned with Rwanda MOH protocols. All clinical decisions require qualified medical professional review.`;
  }

  // Persist to DB
  try {
    const db = getDb();
    await db.prepare(`CREATE TABLE IF NOT EXISTS ai_query_history (id TEXT PRIMARY KEY, user_id TEXT, query TEXT NOT NULL, response TEXT NOT NULL, source TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run();
    const src = process.env.GEMINI_API_KEY?"gemini":process.env.OPENAI_API_KEY?"openai":"local-kb";
    await db.prepare(`INSERT INTO ai_query_history (id,user_id,query,response,source) VALUES(?,?,?,?,?)`).run(`aiq-${uuidv4().slice(0,8)}`, userId||null, query, response, src);
  } catch { /* non-blocking */ }

  const source = process.env.GEMINI_API_KEY?"gemini":process.env.OPENAI_API_KEY?"openai":"local-kb";
  return { query, response, timestamp: new Date().toISOString(), source };
}
const AI_KB = {
  "malaria": "Rwanda MOH malaria treatment: Adults - Artemether-Lumefantrine (AL) 6-dose regimen. Children by weight. Confirm with current RBC guidelines.",
  "medication": "Refer to Rwanda MOH Drug Formulary (latest edition). Consult clinical pharmacist for complex dosing. Always verify allergies and interactions.",
  "clinical": "Rwanda MOH Clinical Protocols (2024 edition) are authoritative. Follow ACLS/ATLS adapted for Rwanda context in emergencies.",
  "drug interaction": "Use Rwanda National Formulary + WHO DDI checker. Monitor: warfarin, aminoglycosides, NSAIDs with renal impairment.",
  "health education": "Rwanda MOH Community Health Education guidelines: participatory approaches, local languages, culturally appropriate materials (kinyarwanda).",
  "nutrition": "Rwanda Nutrition Policy (2018-2022): MUAC screening standard. SAM/MAM protocols per MOH guidelines. Community-based management preferred.",
  "mental health": "Rwanda Mental Health Policy: community-based care. iHSI+, VHT programs. Referral pathways per district hospital protocols.",
  "hypertension": "Rwanda MOH HTN protocol: lifestyle modification first. First-line: ACE inhibitor or Calcium channel blocker. Target BP <140/90 mmHg.",
  "diabetes": "Rwanda MOH diabetes guidelines: Metformin first-line for T2DM. HbA1c target <7%. Regular foot exam, eye screening, renal monitoring.",
  "hiv": "RINDA UBUZIMA: Universal test and treat. Dolutegravir-based regimens first-line. Viral load monitoring every 6 months. PMTCT services.",
  "tb": "Rwanda TB Program: standard DOTS. 2HRZE/4HR regimen. DST for retreatment cases. Integrated HIV-TB care at facility level.",
  "maternal": "Rwanda Safe Motherhood: ANC 8 visits (WHO 2016 model). Skilled birth attendance target 99%. Emergency obstetric care at district hospitals.",
  "vaccination": "Rwanda EPI schedule: BCG at birth, OPV 6/10/14 weeks, Penta 6/10/14 weeks, PCV13, Rota, MR at 9 months. HPV at age 12.",
  "default": "ARTIC AI provides evidence-based guidance aligned with Rwanda MOH Clinical Protocols (2024) and WHO guidelines. For detailed clinical guidance, consult the Rwanda Integrated Clinic Manual or your facility medical director.",
};

export async function getAIHistory(userId, { limit=20 } = {}) {
  try {
    const db = getDb();
    await db.prepare(`CREATE TABLE IF NOT EXISTS ai_query_history (id TEXT PRIMARY KEY, user_id TEXT, query TEXT NOT NULL, response TEXT NOT NULL, source TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run();
    return db.prepare(`SELECT id,query,response,source,created_at FROM ai_query_history WHERE user_id=? ORDER BY created_at DESC LIMIT ?`).all(userId, +limit);
  } catch { return []; }
}

// ── Chat Users (non-clinical listing) ────────────────────────────────────────
export async function getActiveChatUsers() {
  const db = getDb();
  return db.prepare(`
    SELECT u.id, u.first_name||' '||u.last_name as name, r.name as role,
           h.name as hospital, u.email,
           SUBSTRING(u.first_name,1,1)||SUBSTRING(u.last_name,1,1) as initials
    FROM users u
    JOIN roles r ON r.id=u.role_id
    JOIN hospitals h ON h.id=u.hospital_id
    WHERE u.deleted_at IS NULL AND u.is_active=1
      AND r.name != 'system-admin'
    ORDER BY r.name, u.first_name
  `).all();
}
