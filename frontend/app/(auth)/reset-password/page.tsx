"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { useToast } from "@/lib/store";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { show } = useToast();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!token.trim() || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    show("Your password has been reset. Please sign in with your new credentials.", "success");
    router.push("/login");
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p style={{ margin: 0, color: "#667085", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.18em" }}>Reset password</p>
        <h1 style={{ margin: "12px 0 0" }}>Securely update your account password</h1>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <label className="field">Reset token<input value={token} onChange={(event) => setToken(event.target.value)} required /></label>
        <label className="field">New password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} /></label>
        <label className="field">Confirm new password<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required minLength={8} /></label>

        {error && <p className="status danger">{error}</p>}

        <button className="button" type="submit" style={{ width: "100%", marginTop: 24 }}>
          <ShieldCheck size={16} style={{ marginRight: 8 }} /> Reset password
        </button>
      </form>

      <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between", gap: 12 }}>
        <Link className="button ghost" href="/login"><ArrowLeft size={16} style={{ marginRight: 8 }} /> Back to login</Link>
        <Link href="/login" className="muted">Return to sign in</Link>
      </div>
    </div>
  );
}
