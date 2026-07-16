import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type PagePlaceholderProps = {
  title: string;
  description?: string;
  backHref?: string;
};

export function PagePlaceholder({ title, description, backHref = "/dashboard" }: PagePlaceholderProps) {
  return (
    <main className="placeholder-page" style={{ minHeight: "calc(100vh - 120px)", padding: "60px 24px", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <section className="panel" style={{ maxWidth: 720, width: "100%", textAlign: "center", padding: 32 }}>
        <h1 style={{ marginBottom: 16 }}>{title}</h1>
        <p style={{ marginBottom: 24, color: "#475569", lineHeight: 1.7 }}>
          {description ?? "This ARTIC Health Companion page is under active development. The platform is structured to support live hospital workflows across clinical, administrative, and patient-facing services."}
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          <Link className="button" href={backHref}>
            Back to workspace
            <ArrowLeft size={16} style={{ marginLeft: 8 }} />
          </Link>
          <Link className="button secondary" href="/login">
            Return to login
          </Link>
        </div>
      </section>
    </main>
  );
}
