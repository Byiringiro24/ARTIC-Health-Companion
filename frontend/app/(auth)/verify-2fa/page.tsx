"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { useToast } from "@/lib/store";

export default function Verify2FAPage() {
  const router = useRouter();
  const { show } = useToast();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!code.trim() || code.trim().length < 6) {
      setError("Enter the 6-digit authentication code from your authenticator app.");
      return;
    }

    show("Two-factor authentication verified.", "success");
    router.push("/dashboard");
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p style={{ margin: 0, color: "#667085", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.18em" }}>Two-factor authentication</p>
        <h1 style={{ margin: "12px 0 0" }}>Enter your authentication code</h1>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <label className="field">Authentication code<input value={code} onChange={(event) => setCode(event.target.value)} inputMode="numeric" pattern="[0-9]*" required /></label>

        {error && <p className="status danger">{error}</p>}

        <button className="button" type="submit" style={{ width: "100%", marginTop: 24 }}>
          <ShieldCheck size={16} style={{ marginRight: 8 }} /> Verify code
        </button>
      </form>

      <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between", gap: 12 }}>
        <Link className="button ghost" href="/login"><ArrowLeft size={16} style={{ marginRight: 8 }} /> Back to login</Link>
        <Link href="/login" className="muted">Need help?</Link>
      </div>
    </div>
  );
}
