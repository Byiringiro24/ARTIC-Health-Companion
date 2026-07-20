"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useToast } from "@/lib/store";

const API = process.env.NEXT_PUBLIC_API_URL || "http://172.209.217.176:4001";

export default function ForgotPasswordPage() {
  const { show } = useToast();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle"|"loading"|"sent"|"error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Please enter your email address."); return; }
    setStatus("loading");
    try {
      const res = await fetch(`${API}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("sent");
        show("Reset link sent — check your inbox", "success");
      } else {
        setError(data.message || "Something went wrong. Please try again.");
        setStatus("error");
      }
    } catch {
      setError("Could not connect to server. Please try again.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div>
        <div style={{ textAlign:"center",padding:"32px 0" }}>
          <CheckCircle2 size={52} style={{ color:"#059669",margin:"0 auto 16px",display:"block" }}/>
          <h2 style={{ margin:"0 0 8px",color:"#0f172a" }}>Check your inbox</h2>
          <p style={{ color:"#64748b",lineHeight:1.7,maxWidth:380,margin:"0 auto" }}>
            If <strong>{email}</strong> is registered, you will receive a password reset link shortly.
            The link expires in <strong>1 hour</strong>.
          </p>
          <div style={{ marginTop:24,display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap" }}>
            <Link className="button" href="/login" style={{ textDecoration:"none" }}>Back to Login</Link>
            <button className="button secondary" onClick={()=>setStatus("idle")}>Try another email</button>
          </div>
          <p style={{ marginTop:16,fontSize:12,color:"#94a3b8" }}>
            Didn&apos;t receive it? Check spam/junk folder, or contact <a href="mailto:support@artic.health" style={{ color:"#0891b2" }}>support@artic.health</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <p style={{ margin:0,color:"#667085",fontSize:12,textTransform:"uppercase",letterSpacing:"0.18em" }}>Forgot password</p>
        <h1 style={{ margin:"12px 0 0" }}>Reset your ARTIC account</h1>
        <p style={{ margin:"8px 0 0",color:"#64748b",lineHeight:1.6 }}>
          Enter your email and we&apos;ll send a secure link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <label className="field">
          Email address
          <input
            type="email"
            value={email}
            onChange={e=>setEmail(e.target.value)}
            placeholder="you@hospital.rw"
            required
            autoFocus
          />
        </label>

        {error && <p className="status danger">{error}</p>}

        <button className="button" type="submit" disabled={status==="loading"} style={{ width:"100%",marginTop:20 }}>
          <Mail size={16} style={{ marginRight:8 }}/>
          {status==="loading" ? "Sending…" : "Send Reset Link"}
        </button>
      </form>

      <div style={{ marginTop:24,display:"flex",justifyContent:"space-between",gap:12 }}>
        <Link className="button ghost" href="/login">
          <ArrowLeft size={16} style={{ marginRight:8 }}/> Back to login
        </Link>
        <Link className="muted" href="/login">Remembered password?</Link>
      </div>
    </div>
  );
}
