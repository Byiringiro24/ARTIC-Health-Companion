"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, ArrowRight, Building2, HeartPulse, ShieldCheck } from "lucide-react";

function humanize(segment: string) {
  if (!segment) return "Workspace";
  return segment
    .replace(/\[(.*?)\]/g, "$1")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getRouteContext(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const current = segments[segments.length - 1] ?? "dashboard";
  const title = humanize(current);
  const role = segments[0] ?? "dashboard";

  const baseDescription = `This ${title.toLowerCase()} workspace is now connected to the ARTIC Health Companion experience with role-aware navigation, patient context, and operational workflows.`;

  const roleMap: Record<string, { description: string; highlights: string[] }> = {
    accountant: {
      description: `${baseDescription} Finance teams can review billing, insurance claims, and payment posting from a single workspace.`,
      highlights: ["Claim reconciliation", "Invoice tracking", "Payment posting"],
    },
    admin: {
      description: `${baseDescription} Administrators can monitor governance, users, hospitals, and system settings in one place.`,
      highlights: ["User administration", "Hospital oversight", "Security controls"],
    },
    doctor: {
      description: `${baseDescription} Clinicians can manage appointments, prescriptions, referrals, and patient records without leaving the dashboard.`,
      highlights: ["Patient charts", "Prescription workflows", "Lab and imaging requests"],
    },
    laboratory: {
      description: `${baseDescription} Laboratory teams can track pending tests, results, and quality-control activities.`,
      highlights: ["Pending test queues", "Result entry", "Quality review"],
    },
    nurse: {
      description: `${baseDescription} Nursing staff can coordinate triage, medications, handover notes, and ward operations.`,
      highlights: ["Patient monitoring", "Medication administration", "Shift handover"],
    },
    pharmacist: {
      description: `${baseDescription} Pharmacy workflows are organized around inventory, dispensing, and prescription fulfillment.`,
      highlights: ["Inventory control", "Dispensing queues", "Drug management"],
    },
    receptionist: {
      description: `${baseDescription} Front-desk teams can manage appointments, registration, and queue flow efficiently.`,
      highlights: ["Patient registration", "Appointment booking", "Queue management"],
    },
    "patient-portal": {
      description: `${baseDescription} Patients can view appointments, bills, prescriptions, and telemedicine options from their portal.`,
      highlights: ["Appointment history", "Billing access", "Care updates"],
    },
    "store-manager": {
      description: `${baseDescription} Supply teams can manage inventory receipts, purchase orders, and supplier activity.`,
      highlights: ["Inventory intake", "Purchase orders", "Supplier records"],
    },
    hospitaladmin: {
      description: `${baseDescription} Hospital administrators can coordinate departments, services, staffing, and operational settings.`,
      highlights: ["Department setup", "Service catalog", "Staff administration"],
    },
    default: {
      description: baseDescription,
      highlights: ["Clinical workflows", "Operations", "Compliance"],
    },
  };

  const roleConfig = roleMap[role] ?? roleMap.default;

  return {
    title,
    description: roleConfig.description,
    highlights: roleConfig.highlights,
  };
}

export function RoutePageShell() {
  const pathname = usePathname();
  const { title, description, highlights } = getRouteContext(pathname);

  return (
    <main style={{ minHeight: "calc(100vh - 120px)", padding: "32px 24px" }}>
      <section className="panel" style={{ maxWidth: 960, margin: "0 auto", padding: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div>
            <p className="muted" style={{ marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.2em" }}>ARTIC Health Companion</p>
            <h1 style={{ margin: 0 }}>{title}</h1>
            <p style={{ marginTop: 10, color: "#475569", lineHeight: 1.7, maxWidth: 700 }}>{description}</p>
          </div>
          <Link className="button" href="/dashboard">
            Open workspace
            <ArrowRight size={16} style={{ marginLeft: 8 }} />
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginTop: 24 }}>
          <div className="panel" style={{ padding: 18 }}>
            <HeartPulse size={18} color="#027c8e" />
            <h3 style={{ margin: "10px 0 6px" }}>Clinical workflows</h3>
            <p className="muted" style={{ margin: 0 }}>Consultations, triage, ward operations, and care continuity.</p>
          </div>
          <div className="panel" style={{ padding: 18 }}>
            <Building2 size={18} color="#0f9f6e" />
            <h3 style={{ margin: "10px 0 6px" }}>Operations</h3>
            <p className="muted" style={{ margin: 0 }}>Queue management, staff coordination, and facility readiness.</p>
          </div>
          <div className="panel" style={{ padding: 18 }}>
            <ShieldCheck size={18} color="#b7791f" />
            <h3 style={{ margin: "10px 0 6px" }}>Compliance</h3>
            <p className="muted" style={{ margin: 0 }}>RBAC, audit trails, and MOH-friendly reporting structure.</p>
          </div>
        </div>

        <div className="panel" style={{ padding: 18, marginTop: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Activity size={18} color="#0f766e" />
            <h3 style={{ margin: 0 }}>Core focus areas</h3>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {highlights.map((item) => (
              <span key={item} className="muted" style={{ border: "1px solid #dbeafe", borderRadius: 999, padding: "6px 10px", background: "#f8fafc" }}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
