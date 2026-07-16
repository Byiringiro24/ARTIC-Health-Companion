"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, ArrowLeft } from "lucide-react";
import { useToast } from "@/lib/store";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { show } = useToast();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter a valid email address.");
      return;
    }

    setStatus("sent");
    show("Password reset instructions are on their way.", "success");
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p style={{ margin: 0, color: "#667085", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.18em" }}>Forgot password</p>
        <h1 style={{ margin: "12px 0 0" }}>Reset access to your ARTIC account</h1>
      </div>

      {status === "sent" ? (
        <div style={{ padding: 24, borderRadius: 16, background: "#eff6ff", border: "1px solid #c7d2fe" }}>
          <p style={{ margin: 0, fontWeight: 600 }}>Check your inbox</p>
          <p style={{ margin: "12px 0 0", color: "#334155" }}>
            If we recognize <strong>{email}</strong>, we&apos;ll send password reset instructions shortly.
          </p>
          <button className="button" style={{ marginTop: 20 }} type="button" onClick={() => router.push("/login")}>Back to login</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <p style={{ color: "#475569", lineHeight: 1.7 }}>Enter your email and we&apos;ll send a secure link so you can reset your password.</p>

          <label className="field" style={{ display: "block", marginTop: 20 }}>
            Email address
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>

          {error && <p className="status danger">{error}</p>}

          <button className="button" type="submit" style={{ width: "100%", marginTop: 20 }}>
            <Mail size={16} style={{ marginRight: 8 }} /> Send reset link
          </button>
        </form>
      )}

      <div style={{ marginTop: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <Link className="button ghost" href="/login">
          <ArrowLeft size={16} style={{ marginRight: 8 }} /> Back to login
        </Link>
        <Link className="muted" href="/login">
          Remembered credentials?
        </Link>
      </div>
    </div>
  );
}
