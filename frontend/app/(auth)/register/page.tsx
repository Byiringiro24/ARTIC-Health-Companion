"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, ArrowLeft } from "lucide-react";
import { useToast } from "@/lib/store";

export default function RegisterPage() {
  const router = useRouter();
  const { show } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setError("Please complete all fields before continuing.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    show("Registration request submitted. Your account will be provisioned by administrators.", "success");
    router.push("/login");
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p style={{ margin: 0, color: "#667085", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.18em" }}>Create account</p>
        <h1 style={{ margin: "12px 0 0" }}>Request access to ARTIC Health Companion</h1>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }}>
          <label className="field">First name<input value={firstName} onChange={(event) => setFirstName(event.target.value)} required /></label>
          <label className="field">Last name<input value={lastName} onChange={(event) => setLastName(event.target.value)} required /></label>
        </div>

        <label className="field" style={{ display: "block", marginTop: 16 }}>
          Email address
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16, marginTop: 16 }}>
          <label className="field">Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} /></label>
          <label className="field">Confirm password<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required minLength={8} /></label>
        </div>

        {error && <p className="status danger">{error}</p>}

        <button className="button" type="submit" style={{ width: "100%", marginTop: 24 }}>
          <UserPlus size={16} style={{ marginRight: 8 }} /> Request access
        </button>
      </form>

      <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between", gap: 12 }}>
        <Link className="button ghost" href="/login"><ArrowLeft size={16} style={{ marginRight: 8 }} /> Back to login</Link>
        <Link href="/login" className="muted">Already have an account?</Link>
      </div>
    </div>
  );
}
