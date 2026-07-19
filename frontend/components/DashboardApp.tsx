"use client";

import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle, AlertTriangle, ArrowUpRight, Bell, CheckCircle,
  Download, Eye, Info, LogOut, Plus, Search, Send, Smartphone, X,
  CheckCircle2, Clock, Printer,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

import { getSession, logout } from "@/lib/auth";
import {
  auditLogs, beds, bloodUnits, demoUsers, kpis,
  navModules, notifications, patientTimeline, queueEntries,
  revenueByDepartment, roleDefinitions, staff, surveillance, weeklyRevenue,
} from "@/lib/data";
import {
  usePatientStore, useAppointmentStore, useInventoryStore,
  useLabStore, useBillingStore, useToast, useNotificationStore, useKPIStore,
} from "@/lib/store";
import { Modal } from "@/components/ui/Modal";
import { DataTable, SectionHeader, StatCard } from "@/components/ui/shared";
import { AccountantDashboard } from "@/components/dashboard/AccountantDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { AmbulanceDashboard } from "@/components/dashboard/AmbulanceDashboard";
import { CashierDashboard } from "@/components/dashboard/CashierDashboard";
import { DataOfficerDashboard } from "@/components/dashboard/DataOfficerDashboard";
import { DoctorDashboard } from "@/components/dashboard/DoctorDashboard";
import { HospitalManagerDashboard } from "@/components/dashboard/HospitalManagerDashboard";
import { HrDashboard } from "@/components/dashboard/HrDashboard";
import { InsuranceOfficerDashboard } from "@/components/dashboard/InsuranceOfficerDashboard";
import { LabDashboard } from "@/components/dashboard/LabDashboard";
import { MedicalDirectorDashboard } from "@/components/dashboard/MedicalDirectorDashboard";
import { NurseDashboard } from "@/components/dashboard/NurseDashboard";
import { PatientDashboard } from "@/components/dashboard/PatientDashboard";
import { PharmacistDashboard } from "@/components/dashboard/PharmacistDashboard";
import { QualityDashboard } from "@/components/dashboard/QualityDashboard";
import { RadiologyDashboard } from "@/components/dashboard/RadiologyDashboard";
import { ReceptionDashboard } from "@/components/dashboard/ReceptionDashboard";
import { StoreManagerDashboard } from "@/components/dashboard/StoreManagerDashboard";

// ── Module imports ────────────────────────────────────────────────────────────
import { ConsultationModule } from "@/components/modules/ConsultationModule";
import { NursingModule }      from "@/components/modules/NursingModule";
import { PharmacyModule }     from "@/components/modules/PharmacyModule";
import { LaboratoryModule }   from "@/components/modules/LaboratoryModule";
import { RadiologyModule }    from "@/components/modules/RadiologyModule";
import { InpatientModule }    from "@/components/modules/InpatientModule";
import { BillingModule }      from "@/components/modules/BillingModule";
import { InsuranceModule }    from "@/components/modules/InsuranceModule";
import { InventoryModule }    from "@/components/modules/InventoryModule";
import { ProcurementModule }  from "@/components/modules/ProcurementModule";
import { HRModule }           from "@/components/modules/HRModule";
import { AmbulanceModule }    from "@/components/modules/AmbulanceModule";
import { BloodBankModule }    from "@/components/modules/BloodBankModule";
import { MortuaryModule }     from "@/components/modules/MortuaryModule";
import { AssetsModule }       from "@/components/modules/AssetsModule";
import { TelemedicineModule } from "@/components/modules/TelemedicineModule";
import { NotificationsModule }from "@/components/modules/NotificationsModule";
import { ReportsModule }      from "@/components/modules/ReportsModule";
import { SurveillanceModule } from "@/components/modules/SurveillanceModule";
import { InteroperabilityModule } from "@/components/modules/InteroperabilityModule";
import { QualityModule }      from "@/components/modules/QualityModule";
import { AIModule }           from "@/components/modules/AIModule";
import { MultiTenantModule }  from "@/components/modules/MultiTenantModule";
import { AuditModule }        from "@/components/modules/AuditModule";
import { PatientPortal }      from "@/components/modules/PatientPortal";
import { SettingsModule }     from "@/components/modules/SettingsModule";

import type { AppUser, Appointment, ModuleKey, Patient } from "@/types/hms";

const COLORS = ["#027c8e", "#0f9f6e", "#5b5fc7", "#b7791f", "#c23b22", "#0ea5e9"];

// ─────────────────────────────────────────────────────────────────────────────
// SHELL
// ─────────────────────────────────────────────────────────────────────────────
export function DashboardApp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { show } = useToast();
  const [user, setUser] = useState<AppUser | null>(null);
  const [activeModule, setActiveModule] = useState<ModuleKey>("overview");
  const [query, setQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { setPatients, fetchPatients } = usePatientStore();
  const { setAppointments, fetchAppointments } = useAppointmentStore();
  const { fetchLabRequests } = useLabStore();
  const { fetchInvoices } = useBillingStore();
  const { fetchNotifications, unreadCount } = useNotificationStore();
  const { kpis: liveKpis, fetchKPIs } = useKPIStore();

  useEffect(() => {
    const session = getSession();
    if (!session) { router.replace("/login"); return; }
    setUser(session);
    const roleDef = roleDefinitions[session.role] ?? roleDefinitions.doctor;
    // Honour ?module= deep-link param if the role has access to it
    const deepLink = searchParams?.get("module") as ModuleKey | null;
    const defaultModule = roleDef.modules[0] ?? "overview";
    const startModule = (deepLink && roleDef.modules.includes(deepLink)) ? deepLink : defaultModule;
    setActiveModule(startModule);
  }, [router]);

  // Hydrate real data from API on mount (falls back to demo data silently)
  useEffect(() => {
    if (!user?.accessToken) return;
    const today = new Date().toISOString().slice(0, 10);
    fetchPatients();
    fetchAppointments({ date: today, limit: "100" });
    fetchLabRequests({ limit: "50" });
    fetchInvoices({ limit: "50" });
    fetchNotifications();
    fetchKPIs();
  }, [user?.accessToken]);

  const availableModules = useMemo(() => {
    if (!user) return [];
    return roleDefinitions[user.role].modules.map((key) => navModules[key]);
  }, [user]);


  const handleLogout = useCallback(() => {
    logout();
    show("Logged out", "info");
    router.push("/login");
  }, [router, show]);

  if (!user) {
    return (
      <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center" }}>
          <span className="brand-mark">A</span>
          <p className="muted" style={{ marginTop: 12 }}>Loading secure workspace…</p>
        </div>
      </main>
    );
  }

  const role   = roleDefinitions[user.role] ?? roleDefinitions.doctor;
  const active = navModules[activeModule];
  const unread = unreadCount || notifications.filter((n) => n.type === "danger" || n.type === "warning").length;

  return (
    <main className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">A</span>
          {sidebarOpen && <span>ARTIC Health</span>}
        </div>
        {sidebarOpen && <span className="role-pill">{role.label}</span>}
        <nav className="nav-list" aria-label="Modules">
          {availableModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <button
                key={mod.key}
                className={`nav-item${activeModule === mod.key ? " active" : ""}`}
                type="button"
                title={mod.label}
                onClick={() => setActiveModule(mod.key)}
              >
                <Icon size={18} />
                {sidebarOpen && <span>{mod.label}</span>}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <section className="main">
        {/* Top bar */}
        <header className="topbar">
          <div className="actions-row">
            <button
              type="button"
              className="button secondary"
              style={{ minWidth: 0, padding: "0 12px" }}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <span style={{ fontSize: 18 }}>☰</span>
            </button>
            <select
              className="mobile-nav"
              value={activeModule}
              onChange={(e) => setActiveModule(e.target.value as ModuleKey)}
            >
              {availableModules.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
            </select>
          </div>

          <label style={{ position: "relative", flex: "1 1 0", maxWidth: 440 }}>
            <Search size={16} style={{ left: 11, position: "absolute", top: 12, color: "#60717c" }} />
            <input
              className="search"
              style={{ paddingLeft: 36, width: "100%" }}
              placeholder="Search patients, invoices, results…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>

          <div className="actions-row">
            <span className="badge">{user.facility}</span>

            {/* Notifications */}
            <div style={{ position: "relative" }}>
              <button
                className="button secondary"
                type="button"
                style={{ position: "relative", minWidth: 0, padding: "0 12px" }}
                onClick={() => setNotifOpen(!notifOpen)}
              >
                <Bell size={17} />
                {unread > 0 && (
                  <span style={{ position: "absolute", top: -5, right: -5, background: "#c23b22", color: "white", borderRadius: "50%", width: 17, height: 17, fontSize: 10, display: "grid", placeItems: "center", fontWeight: 800 }}>
                    {unread}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div style={{ position: "absolute", right: 0, top: 52, width: 360, background: "white", border: "1px solid var(--line)", borderRadius: 12, boxShadow: "0 16px 48px rgba(0,0,0,0.14)", zIndex: 200 }}>
                  <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong>Notifications</strong>
                    <button type="button" style={{ border: "none", background: "none", cursor: "pointer" }} onClick={() => setNotifOpen(false)}><X size={16} /></button>
                  </div>
                  <div style={{ maxHeight: 360, overflowY: "auto" }}>
                    {notifications.map((n) => (
                      <div key={n.id} style={{ padding: "12px 18px", borderBottom: "1px solid var(--line)", display: "flex", gap: 10 }}>
                        {n.type === "danger"  ? <AlertCircle size={17} color="#c23b22" /> :
                         n.type === "warning" ? <AlertTriangle size={17} color="#b7791f" /> :
                         n.type === "success" ? <CheckCircle size={17} color="#0f9f6e" /> :
                                               <Info size={17} color="#027c8e" />}
                        <div style={{ flex: 1 }}>
                          <strong style={{ fontSize: 13 }}>{n.title}</strong>
                          <p style={{ margin: "3px 0 0", fontSize: 12, color: "#60717c" }}>{n.message}</p>
                          <p style={{ margin: "4px 0 0", fontSize: 11, color: "#a0b0bc" }}>{n.sentAt} · {n.channel}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button className="button" type="button" onClick={handleLogout}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="content">
          <div className="page-title">
            <div>
              <h1>{active.label}</h1>
              <p>{active.description}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <strong>{user.name}</strong>
              <p className="muted" style={{ margin: "3px 0 0", fontSize: 13 }}>
                {user.department} · {user.facility}
              </p>
            </div>
          </div>

          <ModuleRenderer user={user} module={activeModule} query={query} />
        </div>
      </section>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODULE ROUTER
// ─────────────────────────────────────────────────────────────────────────────
function ModuleRenderer({ user, module, query }: { user: AppUser; module: ModuleKey; query: string }) {
  switch (module) {
    case "overview":         return <OverviewModule user={user} />;
    case "admin":            return <AdminModule />;
    case "patients":         return <PatientsModule user={user} query={query} />;
    case "appointments":     return <AppointmentsModule user={user} />;
    case "queue":            return <QueueModule />;
    case "consultations":    return <ConsultationModule user={user} />;
    case "nursing":          return <NursingModule />;
    case "pharmacy":         return <PharmacyModule />;
    case "laboratory":       return <LaboratoryModule />;
    case "radiology":        return <RadiologyModule />;
    case "inpatient":        return <InpatientModule />;
    case "billing":          return <BillingModule user={user} />;
    case "insurance":        return <InsuranceModule />;
    case "inventory":        return <InventoryModule />;
    case "procurement":      return <ProcurementModule />;
    case "hr":               return <HRModule />;
    case "ambulance":        return <AmbulanceModule />;
    case "blood-bank":       return <BloodBankModule />;
    case "mortuary":         return <MortuaryModule />;
    case "assets":           return <AssetsModule />;
    case "telemedicine":     return <TelemedicineModule user={user} />;
    case "notifications":    return <NotificationsModule />;
    case "reports":          return <ReportsModule />;
    case "surveillance":     return <SurveillanceModule />;
    case "interoperability": return <InteroperabilityModule />;
    case "quality":          return <QualityModule />;
    case "ai":               return <AIModule />;
    case "multi-tenant":     return <MultiTenantModule />;
    case "audit":            return <AuditModule />;
    case "patient-portal":   return <PatientPortal user={user} />;
    case "settings":         return <SettingsModule />;
    default:                 return <OverviewModule user={user} />;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// OVERVIEW
// ─────────────────────────────────────────────────────────────────────────────
function OverviewModule({ user }: { user: AppUser }) {
  switch (user.role) {
    case "doctor":
      return <DoctorDashboard user={user} />;
    case "nurse":
      return <NurseDashboard user={user} />;
    case "pharmacist":
      return <PharmacistDashboard user={user} />;
    case "laboratory":
      return <LabDashboard user={user} />;
    case "receptionist":
      return <ReceptionDashboard user={user} />;
    case "accountant":
      return <AccountantDashboard user={user} />;
    case "cashier":
      return <CashierDashboard user={user} />;
    case "insurance-officer":
      return <InsuranceOfficerDashboard user={user} />;
    case "system-admin":
      return <AdminDashboard user={user} />;
    case "hospital-manager":
      return <HospitalManagerDashboard user={user} />;
    case "medical-director":
      return <MedicalDirectorDashboard user={user} />;
    case "radiology":
      return <RadiologyDashboard user={user} />;
    case "hr-manager":
      return <HrDashboard user={user} />;
    case "store-manager":
      return <StoreManagerDashboard user={user} />;
    case "quality-officer":
      return <QualityDashboard user={user} />;
    case "data-officer":
      return <DataOfficerDashboard user={user} />;
    case "ambulance-driver":
      return <AmbulanceDashboard user={user} />;
    case "patient":
      return <PatientDashboard user={user} />;
    default:
      break;
  }

  const { appointments } = useAppointmentStore();
  const { items } = useInventoryStore();
  const lowStock = items.filter((i) => i.quantity <= i.reorderLevel);

  return (
    <div className="grid">
      <div className="grid cols-4">
        {kpis.map((k) => <StatCard key={k.label} label={k.label} value={k.value} trend={k.trend} tone={k.tone} />)}
      </div>

      <div className="grid cols-2">
        <section className="panel">
          <SectionHeader title="Weekly Revenue (RWF)" badge="This week" />
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={weeklyRevenue}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#027c8e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#027c8e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#dce5ea" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(v: number) => `${(v / 1e6).toFixed(1)}M`} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => [`RWF ${v.toLocaleString()}`, "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke="#027c8e" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </section>

        <section className="panel">
          <SectionHeader title="Revenue by Department" badge="Today" />
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie
                data={revenueByDepartment} dataKey="revenue" nameKey="department"
                cx="50%" cy="50%" outerRadius={80}
                label={({ department, percent }: { department: string; percent: number }) =>
                  `${department} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {revenueByDepartment.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => `RWF ${v.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </section>
      </div>

      <div className="grid cols-2">
        <section className="panel">
          <SectionHeader title="Live Patient Queue" badge={`${queueEntries.length} active`} />
          <DataTable
            headers={["Token", "Patient", "Department", "Priority", "Wait", "Status"]}
            rows={queueEntries.map((q) => [q.token, q.patientName, q.department, q.priority, q.waitMinutes === 0 ? "Now" : `${q.waitMinutes} min`, q.status])}
            statusCol={5} priorityCol={3}
            priorityMap={{ Emergency: "danger", Urgent: "warn", Routine: "" }}
          />
        </section>

        <section className="panel">
          <SectionHeader title="Operational Alerts"
            action={<button className="button" type="button"><Send size={14} /> Notify teams</button>} />
          <ul className="compact-list">
            {lowStock.map((item) => (
              <li key={item.id}>
                <div>
                  <strong style={{ fontSize: 13 }}>{item.name}</strong>
                  <p className="muted" style={{ margin: "2px 0 0", fontSize: 12 }}>Stock: {item.quantity} / Reorder: {item.reorderLevel}</p>
                </div>
                <span className="status warn">Low Stock</span>
              </li>
            ))}
            <li><span>MOH surveillance package 78% complete</span><span className="status warn">Reports</span></li>
            <li><span>Critical lab result awaiting doctor acknowledgement</span><span className="status danger">Lab</span></li>
          </ul>
        </section>
      </div>

      <section className="panel">
        <SectionHeader title="Today's Appointments" badge={`${appointments.length} scheduled`} />
        <DataTable
          headers={["Time", "Patient", "Clinician", "Department", "Type", "Priority", "Queue", "Status"]}
          rows={appointments.map((a) => [a.time, a.patient, a.clinician, a.department, a.type, a.priority, a.queue, a.status])}
          statusCol={7} priorityCol={5}
          priorityMap={{ Emergency: "danger", Urgent: "warn", Routine: "" }}
        />
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN
// ─────────────────────────────────────────────────────────────────────────────
function AdminModule() {
  const { show } = useToast();
  const [showNewUser, setShowNewUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "doctor", dept: "", facility: "Kigali District Hospital" });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newUser.name || !newUser.email) { show("Name and email are required", "error"); return; }
    show(`User ${newUser.name} created`, "success");
    setShowNewUser(false);
    setNewUser({ name: "", email: "", role: "doctor", dept: "", facility: "Kigali District Hospital" });
  }

  return (
    <div className="grid">
      <div className="grid cols-2">
        <section className="panel">
          <SectionHeader title="Users & Roles" badge={`${demoUsers.length} users`}
            action={<button className="button" type="button" onClick={() => setShowNewUser(true)}><Plus size={14} /> New user</button>} />
          <DataTable
            headers={["Name", "Role", "Department", "Facility", "Status"]}
            rows={demoUsers.map((u) => [u.name, roleDefinitions[u.role].label, u.department, u.facility, "Active"])}
            statusCol={4}
          />
        </section>
        <section className="panel">
          <SectionHeader title="Security Controls" badge="Enforced" />
          <ul className="compact-list">
            {[["JWT refresh token rotation","Active"],["MFA — TOTP + SMS OTP","Configured"],["Session timeout 30 min","Enabled"],["Brute-force lockout (5 attempts)","Enabled"],["Rate limiting 100 req/min","Enforced"],["Tenant data isolation","Active"],["Audit trail 7-year retention","Running"],["Daily encrypted backup 02:00","Scheduled"],["TLS 1.3 in transit","Enforced"],["AES-256 at rest","Enabled"]].map(([label, status]) => (
              <li key={label}><span style={{ fontSize: 13 }}>{label}</span><span className="status">{status}</span></li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid cols-3">
        {[
          { title: "System Health", items: ["PostgreSQL — Connected ✓", "Redis Cache — OK ✓", "Bull Queue — 3 jobs pending", "API P95 — 142ms", "Last backup — 02:00 today ✓"] },
          { title: "Active Tenants", items: ["Kigali District Hospital — 42 users", "CHUK University Hospital — 118 users", "Musanze District Hospital — 31 users", "Rwamagana Provincial — 27 users", "Huye District Hospital — 22 users"] },
          { title: "Integration Status", items: ["NID/NIDA API — Connected ✓", "RSSB Insurance — Live ✓", "Africa's Talking SMS — Active ✓", "MTN MoMo API — Live ✓", "FHIR R4 Endpoint — Ready ✓"] },
        ].map(({ title, items }) => (
          <section className="panel" key={title}>
            <SectionHeader title={title} />
            <ul className="compact-list">
              {items.map((i) => <li key={i}><span style={{ fontSize: 13 }}>{i}</span><CheckCircle2 size={14} color="#0f9f6e" /></li>)}
            </ul>
          </section>
        ))}
      </div>

      <Modal open={showNewUser} onClose={() => setShowNewUser(false)} title="Create New User"
        footer={<div className="actions-row"><button className="button" type="submit" form="new-user-form"><CheckCircle2 size={14} /> Create User</button><button className="button secondary" type="button" onClick={() => setShowNewUser(false)}>Cancel</button></div>}>
        <form id="new-user-form" onSubmit={handleCreate} className="form-grid">
          <label className="field">Full Name *<input required value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} /></label>
          <label className="field">Email *<input required type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} /></label>
          <label className="field">Role
            <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
              {Object.entries(roleDefinitions).map(([k, def]) => <option key={k} value={k}>{def.label}</option>)}
            </select>
          </label>
          <label className="field">Department<input value={newUser.dept} onChange={(e) => setNewUser({ ...newUser, dept: e.target.value })} /></label>
          <label className="field" style={{ gridColumn: "1/-1" }}>Facility<input value={newUser.facility} onChange={(e) => setNewUser({ ...newUser, facility: e.target.value })} /></label>
          <label className="field">Temporary Password<input type="password" defaultValue="TempPass2026!" /></label>
        </form>
      </Modal>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PATIENTS
// ─────────────────────────────────────────────────────────────────────────────
function PatientsModule({ user, query }: { user: AppUser; query: string }) {
  const { patients, add, select, selected } = usePatientStore();
  const { show } = useToast();
  const [registerModal, setRegisterModal] = useState(false);
  const [detailMode, setDetailMode] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", dob: "", gender: "Female" as "Male" | "Female" | "Other",
    phone: "", email: "", nid: "", province: "Kigali", district: "", sector: "",
    insurance: "RSSB" as "RSSB" | "Mutuelle" | "Private" | "Self-pay" | "International",
    insuranceNumber: "", bloodGroup: "O+" as Patient["bloodGroup"],
    allergies: "", chronicConditions: "",
    emergencyName: "", emergencyPhone: "", emergencyRelation: "",
  });

  const visible = (user.role === "patient" ? patients.filter((p) => p.id === user.patientId) : patients)
    .filter((p) => !query || p.name.toLowerCase().includes(query.toLowerCase()) || p.mrn.toLowerCase().includes(query.toLowerCase()) || p.nid.includes(query) || p.phone.includes(query));

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    const id  = `p-${Date.now()}`;
    const year = new Date().getFullYear();
    const mrn  = `MRN-${year}-${String(patients.length + 1).padStart(4, "0")}`;
    const age  = form.dob ? year - new Date(form.dob).getFullYear() : 0;
    add({
      id, mrn, name: `${form.firstName} ${form.lastName}`.trim(),
      nid: form.nid || "—", age, dob: form.dob, gender: form.gender,
      phone: form.phone, email: form.email,
      address: { province: form.province, district: form.district, sector: form.sector },
      insurance: form.insurance, insuranceNumber: form.insuranceNumber,
      bloodGroup: form.bloodGroup,
      allergies: form.allergies ? form.allergies.split(",").map((s) => s.trim()).filter(Boolean) : [],
      chronicConditions: form.chronicConditions ? form.chronicConditions.split(",").map((s) => s.trim()).filter(Boolean) : [],
      currentMedications: [],
      emergencyContact: { name: form.emergencyName, relationship: form.emergencyRelation, phone: form.emergencyPhone },
      status: "Active", registeredAt: new Date().toISOString().split("T")[0],
    });
    show(`Patient ${form.firstName} ${form.lastName} registered — ${mrn}`, "success");
    setRegisterModal(false);
    setForm({ firstName:"",lastName:"",dob:"",gender:"Female",phone:"",email:"",nid:"",province:"Kigali",district:"",sector:"",insurance:"RSSB",insuranceNumber:"",bloodGroup:"O+",allergies:"",chronicConditions:"",emergencyName:"",emergencyPhone:"",emergencyRelation:"" });
  }

  if (detailMode && selected) {
    return (
      <div className="grid">
        <div className="actions-row">
          <button className="button secondary" type="button" onClick={() => { setDetailMode(false); select(null); }}>← Back to Registry</button>
          {selected.allergies.length > 0 && <span className="status danger" style={{ marginLeft: "auto" }}>⚠ Allergies: {selected.allergies.join(", ")}</span>}
        </div>
        <div className="grid cols-3">
          <section className="panel">
            <SectionHeader title="Demographics" />
            <ul className="compact-list">
              {[["MRN",selected.mrn],["Name",selected.name],["DOB",selected.dob],["Age/Sex",`${selected.age}y / ${selected.gender}`],["NID",selected.nid],["Phone",selected.phone],["Email",selected.email??"—"],["Address",`${selected.address.sector}, ${selected.address.district}`],["Registered",selected.registeredAt]].map(([k,v])=>(
                <li key={k}><span className="muted" style={{fontSize:13}}>{k}</span><strong style={{fontSize:13}}>{v}</strong></li>
              ))}
            </ul>
          </section>
          <section className="panel">
            <SectionHeader title="Medical Summary" />
            <ul className="compact-list">
              <li><span>Blood Group</span><strong style={{color:"#c23b22",fontSize:16}}>{selected.bloodGroup}</strong></li>
              <li><span>Insurance</span><span className="status">{selected.insurance} · {selected.insuranceNumber||"—"}</span></li>
              <li><span>Allergies</span><strong>{selected.allergies.join(", ")||"None known"}</strong></li>
              <li><span>Conditions</span><strong>{selected.chronicConditions.join(", ")||"None"}</strong></li>
              <li><span>Status</span><span className="status">{selected.status}</span></li>
            </ul>
          </section>
          <section className="panel">
            <SectionHeader title="Emergency Contact" />
            <ul className="compact-list">
              <li><span>Name</span><strong>{selected.emergencyContact.name}</strong></li>
              <li><span>Relation</span><strong>{selected.emergencyContact.relationship}</strong></li>
              <li><span>Phone</span><strong>{selected.emergencyContact.phone}</strong></li>
            </ul>
            <div className="actions-row" style={{marginTop:16}}>
              <button className="button" type="button"><Plus size={14}/> New visit</button>
              <button className="button secondary" type="button"><Printer size={14}/> Print card</button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="grid">
      <section className="panel">
        <SectionHeader title="Patient Registry" badge={`${visible.length} records`}
          action={<>
            <button className="button" type="button" onClick={() => setRegisterModal(true)}><Plus size={14}/> Register patient</button>
            <button className="button secondary" type="button"><Smartphone size={14}/> Verify NID</button>
            <button className="button secondary" type="button"><Download size={14}/> Export CSV</button>
          </>} />
        <div className="table-wrap">
          <table>
            <thead><tr>{["MRN","Patient","Age/Sex","NID","Insurance","Blood","Allergies","Conditions","Status",""].map((h)=><th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {visible.length === 0 ? (
                <tr><td colSpan={10} style={{textAlign:"center",padding:32,color:"#60717c"}}>No patients found{query?` matching "${query}"`:""}.</td></tr>
              ) : visible.map((p) => (
                <tr key={p.id} style={{cursor:"pointer"}} onClick={() => { select(p); setDetailMode(true); }}>
                  <td><code style={{fontSize:12,background:"#eef5f6",padding:"2px 6px",borderRadius:4}}>{p.mrn}</code></td>
                  <td><strong>{p.name}</strong></td>
                  <td>{p.age}y / {p.gender}</td>
                  <td style={{fontSize:12}}>{p.nid}</td>
                  <td><span className="status">{p.insurance}</span></td>
                  <td><strong style={{color:"#c23b22"}}>{p.bloodGroup}</strong></td>
                  <td style={{fontSize:12}}>{p.allergies.join(", ")||"None"}</td>
                  <td style={{fontSize:12}}>{p.chronicConditions.join(", ")||"None"}</td>
                  <td><span className="status">{p.status}</span></td>
                  <td><button type="button" style={{border:"none",background:"none",cursor:"pointer",color:"#027c8e"}} onClick={(e)=>{e.stopPropagation();select(p);setDetailMode(true);}}><Eye size={15}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Modal open={registerModal} onClose={() => setRegisterModal(false)} title="Register New Patient" size="lg"
        footer={<div className="actions-row"><button className="button" type="submit" form="reg-form"><CheckCircle2 size={14}/> Register Patient</button><button className="button secondary" type="button" onClick={() => setRegisterModal(false)}>Cancel</button></div>}>
        <form id="reg-form" onSubmit={handleRegister}>
          <div style={{marginBottom:12}}><strong style={{color:"#027c8e"}}>Personal Information</strong></div>
          <div className="form-grid" style={{marginBottom:18}}>
            <label className="field">First Name *<input required value={form.firstName} onChange={(e)=>setForm({...form,firstName:e.target.value})}/></label>
            <label className="field">Last Name *<input required value={form.lastName} onChange={(e)=>setForm({...form,lastName:e.target.value})}/></label>
            <label className="field">Date of Birth *<input required type="date" value={form.dob} onChange={(e)=>setForm({...form,dob:e.target.value})}/></label>
            <label className="field">Gender <select value={form.gender} onChange={(e)=>setForm({...form,gender:e.target.value as "Male"|"Female"|"Other"})}><option>Male</option><option>Female</option><option>Other</option></select></label>
            <label className="field">Phone *<input required value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})} placeholder="+250 788 000 000"/></label>
            <label className="field">Email<input type="email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})}/></label>
            <label className="field">NID<input value={form.nid} onChange={(e)=>setForm({...form,nid:e.target.value})} maxLength={16}/></label>
            <label className="field">Blood Group <select value={form.bloodGroup} onChange={(e)=>setForm({...form,bloodGroup:e.target.value as Patient["bloodGroup"]})}>{["O+","O-","A+","A-","B+","B-","AB+","AB-"].map((g)=><option key={g}>{g}</option>)}</select></label>
          </div>
          <div style={{marginBottom:12}}><strong style={{color:"#027c8e"}}>Address &amp; Insurance</strong></div>
          <div className="form-grid" style={{marginBottom:18}}>
            <label className="field">Province <select value={form.province} onChange={(e)=>setForm({...form,province:e.target.value})}>{["Kigali","Eastern","Western","Northern","Southern"].map((p)=><option key={p}>{p}</option>)}</select></label>
            <label className="field">District<input value={form.district} onChange={(e)=>setForm({...form,district:e.target.value})}/></label>
            <label className="field">Insurance <select value={form.insurance} onChange={(e)=>setForm({...form,insurance:e.target.value as typeof form.insurance})}>{["RSSB","Mutuelle","Private","Self-pay","International"].map((p)=><option key={p}>{p}</option>)}</select></label>
            <label className="field">Insurance Number<input value={form.insuranceNumber} onChange={(e)=>setForm({...form,insuranceNumber:e.target.value})}/></label>
          </div>
          <div style={{marginBottom:12}}><strong style={{color:"#027c8e"}}>Medical &amp; Emergency</strong></div>
          <div className="form-grid">
            <label className="field" style={{gridColumn:"1/-1"}}>Allergies (comma-separated)<input value={form.allergies} onChange={(e)=>setForm({...form,allergies:e.target.value})} placeholder="Penicillin, Sulfa"/></label>
            <label className="field" style={{gridColumn:"1/-1"}}>Chronic Conditions (comma-separated)<input value={form.chronicConditions} onChange={(e)=>setForm({...form,chronicConditions:e.target.value})} placeholder="Hypertension, Diabetes"/></label>
            <label className="field">Emergency Name<input value={form.emergencyName} onChange={(e)=>setForm({...form,emergencyName:e.target.value})}/></label>
            <label className="field">Relationship<input value={form.emergencyRelation} onChange={(e)=>setForm({...form,emergencyRelation:e.target.value})}/></label>
            <label className="field">Emergency Phone<input value={form.emergencyPhone} onChange={(e)=>setForm({...form,emergencyPhone:e.target.value})}/></label>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// APPOINTMENTS
// ─────────────────────────────────────────────────────────────────────────────
function AppointmentsModule({ user }: { user: AppUser }) {
  const { appointments, add } = useAppointmentStore();
  const { patients } = usePatientStore();
  const { show } = useToast();
  const [bookModal, setBookModal] = useState(false);
  const [form, setForm] = useState({
    patientId: "", clinician: "Dr. Grace Mukamana", department: "Internal Medicine",
    date: new Date().toISOString().split("T")[0], time: "09:00",
    type: "Consultation" as Appointment["type"], priority: "Routine" as Appointment["priority"], notes: "",
  });

  const visible = user.role === "patient" ? appointments.filter((a) => a.patientId === user.patientId) : appointments;

  function handleBook(e: React.FormEvent) {
    e.preventDefault();
    const patient = patients.find((p) => p.id === form.patientId);
    if (!patient) { show("Select a valid patient", "error"); return; }
    const queue = `${form.department.substring(0, 2).toUpperCase()}-${String(Math.floor(Math.random() * 900) + 100)}`;
    add({ id: `a-${Date.now()}`, patientId: patient.id, patient: patient.name, clinician: form.clinician, department: form.department, date: form.date, time: form.time, type: form.type, status: "Scheduled", queue, priority: form.priority, notes: form.notes });
    show(`Appointment booked — ${patient.name} on ${form.date} at ${form.time}`, "success");
    setBookModal(false);
  }

  return (
    <div className="grid">
      <div className="grid cols-4">
        <StatCard label="Scheduled"   value={String(visible.filter((a)=>a.status==="Scheduled").length)}   tone="good" icon={<CheckCircle2 size={22} color="#027c8e"/>}/>
        <StatCard label="Checked In"  value={String(visible.filter((a)=>a.status==="Checked In").length)}  tone="good" icon={<CheckCircle2 size={22} color="#0f9f6e"/>}/>
        <StatCard label="In Progress" value={String(visible.filter((a)=>["Triage","In Progress"].includes(a.status)).length)} tone="warn" icon={<Clock size={22} color="#b7791f"/>}/>
        <StatCard label="Completed"   value={String(visible.filter((a)=>a.status==="Completed").length)}   tone="good" icon={<ArrowUpRight size={22} color="#5b5fc7"/>}/>
      </div>
      <section className="panel">
        <SectionHeader title="Appointment Schedule" badge={`${visible.length} total`}
          action={<><button className="button" type="button" onClick={()=>setBookModal(true)}><Plus size={14}/> Book appointment</button><button className="button secondary" type="button"><Download size={14}/> Export</button></>} />
        <DataTable
          headers={["Time","Date","Patient","Clinician","Dept","Type","Priority","Queue","Status"]}
          rows={visible.map((a)=>[a.time,a.date,a.patient,a.clinician,a.department,a.type,a.priority,a.queue,a.status])}
          statusCol={8} priorityCol={6} priorityMap={{Emergency:"danger",Urgent:"warn",Routine:""}}
        />
      </section>

      <Modal open={bookModal} onClose={()=>setBookModal(false)} title="Book Appointment"
        footer={<div className="actions-row"><button className="button" type="submit" form="appt-form"><CheckCircle2 size={14}/> Confirm booking</button><button className="button secondary" type="button" onClick={()=>setBookModal(false)}>Cancel</button></div>}>
        <form id="appt-form" onSubmit={handleBook} className="form-grid">
          <label className="field" style={{gridColumn:"1/-1"}}>Patient *
            <select required value={form.patientId} onChange={(e)=>setForm({...form,patientId:e.target.value})}>
              <option value="">— Select patient —</option>
              {patients.map((p)=><option key={p.id} value={p.id}>{p.name} · {p.mrn}</option>)}
            </select>
          </label>
          <label className="field">Clinician <select value={form.clinician} onChange={(e)=>setForm({...form,clinician:e.target.value})}>{demoUsers.filter((u)=>u.role==="doctor"||u.role==="medical-director").map((d)=><option key={d.id}>{d.name}</option>)}</select></label>
          <label className="field">Department <select value={form.department} onChange={(e)=>setForm({...form,department:e.target.value})}>{["Internal Medicine","Pediatrics","Emergency","Maternity","Surgery","Cardiology","ENT","Ophthalmology","Dermatology","Orthopedics"].map((d)=><option key={d}>{d}</option>)}</select></label>
          <label className="field">Date *<input required type="date" value={form.date} onChange={(e)=>setForm({...form,date:e.target.value})}/></label>
          <label className="field">Time *<input required type="time" value={form.time} onChange={(e)=>setForm({...form,time:e.target.value})}/></label>
          <label className="field">Type <select value={form.type} onChange={(e)=>setForm({...form,type:e.target.value as Appointment["type"]})}>{["Consultation","Follow-up","Emergency","Surgery","Laboratory","Radiology","Procedure","Telemedicine"].map((t)=><option key={t}>{t}</option>)}</select></label>
          <label className="field">Priority <select value={form.priority} onChange={(e)=>setForm({...form,priority:e.target.value as Appointment["priority"]})}><option>Routine</option><option>Urgent</option><option>Emergency</option></select></label>
          <label className="field" style={{gridColumn:"1/-1"}}>Notes<input value={form.notes} onChange={(e)=>setForm({...form,notes:e.target.value})} placeholder="Reason for visit…"/></label>
        </form>
      </Modal>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// QUEUE
// ─────────────────────────────────────────────────────────────────────────────
function QueueModule() {
  const { show } = useToast();
  const [queue, setQueue] = useState(queueEntries);

  function callNext(token: string) {
    setQueue((q) => q.map((e) => e.token === token ? { ...e, status: "Calling" as const } : e));
    show(`Calling patient — ${token}`, "info");
  }

  return (
    <div className="grid cols-2">
      <section className="panel">
        <SectionHeader title="Live Queue" badge={`${queue.length} waiting`}
          action={<button className="button" type="button"><Plus size={14}/> Walk-in</button>} />
        <DataTable
          headers={["Token","Patient","Dept","Triage","Wait","Priority","Status"]}
          rows={queue.map((q)=>[q.token,q.patientName,q.department,q.triageLevel?`Level ${q.triageLevel}`:"—",q.waitMinutes===0?"Calling":`${q.waitMinutes} min`,q.priority,q.status])}
          statusCol={6} priorityCol={5} priorityMap={{Emergency:"danger",Urgent:"warn",Routine:""}}
        />
      </section>
      <section className="panel">
        <SectionHeader title="Queue Display — TV Feed" badge="Live" />
        <div style={{display:"grid",gap:10}}>
          {queue.map((q)=>(
            <div key={q.token} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 18px",borderRadius:10,background:q.priority==="Emergency"?"#fff0ed":q.priority==="Urgent"?"#fff7e6":"#f0fdf9",border:`1px solid ${q.priority==="Emergency"?"#c23b2244":q.priority==="Urgent"?"#b7791f44":"#0f9f6e44"}`}}>
              <div>
                <strong style={{fontSize:26}}>{q.token}</strong>
                <p style={{margin:"2px 0 0",fontSize:13,color:"#60717c"}}>{q.patientName} — {q.department}</p>
              </div>
              <div style={{textAlign:"right",display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end"}}>
                <span className={`status${q.priority==="Emergency"?" danger":q.priority==="Urgent"?" warn":""}`}>{q.priority}</span>
                <p style={{margin:0,fontSize:12,color:"#60717c"}}>{q.waitMinutes===0?"Calling now":`Est. ${q.waitMinutes} min`}</p>
                {q.status!=="Calling" && <button className="button secondary" type="button" style={{fontSize:12,padding:"4px 10px",minHeight:0}} onClick={()=>callNext(q.token)}>Call patient</button>}
                {q.status==="Calling" && <span className="status">Calling…</span>}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
