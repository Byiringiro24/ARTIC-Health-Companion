/**
 * Super Admin Service — Feature Flags, Subscriptions, Tenant Management
 */
import { v4 as uuidv4 } from "uuid";
import { getDb } from "../../database/connection.js";
import { NotFoundError, AppError } from "../../middleware/errorHandler.js";

// ── Default feature catalogue ─────────────────────────────────────────────────
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
  const where = status ? "WHERE far.status=?" : "";
  const params = status ? [status] : [];
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
  await db.prepare(`INSERT INTO hospitals (id,tenant_id,code,name,type,moh_code,email,phone,is_active) VALUES(?,?,?,?,?,?,?,?,1) ON CONFLICT(id) DO NOTHING`).run(id, tid, data.code||id, data.name, data.type||"district", data.mohCode||null, data.email||null, data.phone||null);
  // Create subscription
  const subId = `sub-${uuidv4().slice(0,8)}`;
  const tier = data.tier || "trial";
  const trialEnd = new Date(); trialEnd.setDate(trialEnd.getDate()+14);
  await db.prepare(`INSERT INTO subscriptions (id,hospital_id,tier,status,price_per_month,billing_email,trial_ends_at,created_by) VALUES(?,?,?,?,?,?,?,?)`).run(subId, id, tier, "active", data.pricePerMonth||null, data.billingEmail||data.email||null, tier==="trial"?trialEnd.toISOString():null, createdBy);
  // Auto-assign features based on tier
  await bulkSetTierFeatures(id, tier, createdBy);
  return db.prepare(`SELECT h.*, s.tier, s.status as sub_status FROM hospitals h LEFT JOIN subscriptions s ON s.hospital_id=h.id WHERE h.id=?`).get(id);
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
  const [hospitals, users, patients, pendingRequests, activeFeatures] = await Promise.all([
    db.prepare(`SELECT COUNT(*) as n FROM hospitals WHERE deleted_at IS NULL`).get(),
    db.prepare(`SELECT COUNT(*) as n FROM users WHERE deleted_at IS NULL AND is_active=1`).get(),
    db.prepare(`SELECT COUNT(*) as n FROM patients WHERE deleted_at IS NULL`).get(),
    db.prepare(`SELECT COUNT(*) as n FROM feature_access_requests WHERE status='pending'`).get(),
    db.prepare(`SELECT COUNT(*) as n FROM feature_flags WHERE default_status='active' AND is_active=1`).get(),
  ]);
  const tierCounts = await db.prepare(`SELECT tier, COUNT(*) as count FROM subscriptions GROUP BY tier`).all();
  return {
    totalHospitals: hospitals?.n || 0,
    activeUsers: users?.n || 0,
    totalPatients: patients?.n || 0,
    pendingRequests: pendingRequests?.n || 0,
    activeFeatures: activeFeatures?.n || 0,
    hospitalsByTier: tierCounts,
  };
}
