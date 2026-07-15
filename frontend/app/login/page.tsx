"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import { demoUsers, roleDefinitions } from "@/lib/data";
import { login, loginAs } from "@/lib/auth";
import { useToast } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const { show } = useToast();
  const [email, setEmail] = useState("doctor@artic.health");
  const [password, setPassword] = useState("doctor123");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const user = login(email, password);
      setLoading(false);
      if (!user) {
        setError("Invalid credentials. Try one of the demo accounts below.");
        return;
      }
      show(`Welcome, ${user.name}!`, "success");
      router.push("/dashboard");
    }, 600);
  }

  function handleQuickLogin(user: typeof demoUsers[0]) {
    loginAs(user);
    show(`Logged in as ${user.name}`, "success");
    router.push("/dashboard");
  }

  return (
    <main className="login-page">
      <aside className="login-aside">
        <Link className="brand" href="/">
          <span className="brand-mark">A</span>
          <span>ARTIC Health Companion</span>
        </Link>
        <h1>One login. The right hospital workspace.</h1>
        <p>Authentication routes each person into the modules allowed by their role — keeping clinical, financial, operational, and patient data secured.</p>
        <div className="actions-row" style={{ marginTop: 24 }}>
          <span className="role-pill"><ShieldCheck size={14} /> Granular RBAC</span>
          <span className="role-pill"><LockKeyhole size={14} /> Audit-ready sessions</span>
        </div>
        <div style={{ marginTop: 32, padding: "16px", background: "rgba(255,255,255,0.08)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)" }}>
          <p style={{ margin: 0, fontSize: 13, opacity: 0.9 }}>🏥 <strong>18 roles</strong> · 30+ modules · Rwanda MOH compliant · HL7 FHIR ready</p>
        </div>
      </aside>

      <section className="login-form-wrap">
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <h2>Sign in</h2>
          <p className="muted">Use a demo account to explore the system.</p>

          <label className="field">
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" required />
          </label>
          <label className="field">
            Password
            <div style={{ position: "relative" }}>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type={showPw ? "text" : "password"} autoComplete="current-password" required style={{ paddingRight: 44 }} />
              <button type="button" style={{ position: "absolute", right: 12, top: 12, border: "none", background: "none", cursor: "pointer", color: "#60717c" }} onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          {error && <p className="status danger">{error}</p>}

          <button className="button" style={{ width: "100%", marginTop: 20, minHeight: 48, justifyContent: "center" }} type="submit" disabled={loading}>
            {loading ? "Signing in…" : <><span>Continue</span><ArrowRight size={18} /></>}
          </button>

          <div style={{ marginTop: 24 }}>
            <p className="muted" style={{ fontSize: 12, marginBottom: 10 }}>Quick demo login — click any role:</p>
            <div className="demo-grid">
              {demoUsers.map((user) => (
                <button className="demo-account" key={user.id} type="button" onClick={() => handleQuickLogin(user)}>
                  <strong>{roleDefinitions[user.role].label}</strong>
                  <br />
                  <span className="muted" style={{ fontSize: 12 }}>{user.email}</span>
                </button>
              ))}
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}
