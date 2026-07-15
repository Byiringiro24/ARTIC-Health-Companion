import Link from "next/link";
import { ArrowRight, Building2, HeartPulse, ShieldCheck, WifiOff } from "lucide-react";

export default function Home() {
  return (
    <main className="landing">
      <nav className="landing-nav">
        <div className="brand">
          <span className="brand-mark">A</span>
          <span>ARTIC Health Companion</span>
        </div>
        <Link className="button ghost" href="/login">
          Login <ArrowRight size={18} />
        </Link>
      </nav>

      <section className="landing-hero">
        <h1>ARTIC Health Companion</h1>
        <p>
          A complete hospital management platform for Rwanda-ready and internationally aligned care: patient records,
          clinical workflows, billing, insurance, pharmacy, laboratory, surveillance, interoperability, and role-based
          access from hospital leadership to the patient portal.
        </p>
        <div className="landing-actions">
          <Link className="button" href="/login">
            Login to your workspace <ArrowRight size={18} />
          </Link>
          <a className="button secondary" href="#capabilities">
            View platform scope
          </a>
        </div>
      </section>

      <section id="capabilities" className="landing-strip" aria-label="Platform capabilities">
        <div className="landing-metric">
          <HeartPulse size={22} />
          <strong>Clinical</strong>
          <span>CDS, eRx, triage, nursing, inpatient, telemedicine</span>
        </div>
        <div className="landing-metric">
          <Building2 size={22} />
          <strong>Operations</strong>
          <span>Queues, beds, assets, maintenance, pharmacy stock</span>
        </div>
        <div className="landing-metric">
          <ShieldCheck size={22} />
          <strong>Compliance</strong>
          <span>RBAC, audit trails, PBF, MOH reports, FHIR/ICD</span>
        </div>
        <div className="landing-metric">
          <WifiOff size={22} />
          <strong>Resilience</strong>
          <span>Offline-ready design, backups, sync planning, alerts</span>
        </div>
      </section>
    </main>
  );
}
