"use client";
import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/lib/store";

const API = process.env.NEXT_PUBLIC_API_URL || "http://172.209.217.176:4001";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { show } = useToast();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [status, setStatus] = useState<"idle"|"loading"|"done"|"error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const t = searchParams?.get("token");
    if (t) setToken(t);
  }, [searchParams]);

  const strength = password.length >= 12 ? "Strong" : password.length >= 8 ? "Good" : password.length >= 6 ? "Weak" : "";
  const strengthColor = strength === "Strong" ? "#059669" : strength === "Good" ? "#d97706" : "#dc2626";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!token.trim()) { setError("Reset token is missing. Please use the link from your email."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setStatus("loading");
    try {
      const res = await fetch(`${API}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim(), newPassword: password }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("done");
        show("Password reset! You can now log in.", "success");
        setTimeout(() => router.push("/login"), 3000);
      } else {
        setError(data.message || "Reset failed. The link may be expired.");
        setStatus("error");
      }
    } catch {
      setError("Could not connect to server. Please try again.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div style={{ textAlign:"center",padding:"32px 0" }}>
        <CheckCircle2 size={52} style={{ color:"#059669",margin:"0 auto 16px",display:"block" }}/>
        <h2 style={{ margin:"0 0 8px",color:"#0f172a" }}>Password reset!</h2>
        <p style={{ color:"#64748b" }}>Your password has been changed. Redirecting to login…</p>
        <Link className="button" href="/login" style={{ display:"inline-flex",marginTop:20,textDecoration:"none" }}>Go to Login</Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <p style={{ margin:0,color:"#667085",fontSize:12,textTransform:"uppercase",letterSpacing:"0.18em" }}>Reset password</p>
        <h1 style={{ margin:"12px 0 0" }}>Set your new password</h1>
        <p style={{ margin:"8px 0 0",color:"#64748b",lineHeight:1.6 }}>Choose a strong password — at least 8 characters.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Token field — pre-filled from URL, show if empty */}
        {!searchParams?.get("token") && (
          <label className="field">
            Reset token <span style={{ fontSize:11,color:"#94a3b8" }}>(from your email)</span>
            <input value={token} onChange={e=>setToken(e.target.value)} required placeholder="Paste token here"/>
          </label>
        )}

        <label className="field">
          New password
          <div style={{ position:"relative" }}>
            <input
              type={showPw?"text":"password"}
              value={password}
              onChange={e=>setPassword(e.target.value)}
              required minLength={8}
              placeholder="At least 8 characters"
              style={{ paddingRight:40 }}
            />
            <button type="button" onClick={()=>setShowPw(!showPw)} style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",border:"none",background:"none",cursor:"pointer",color:"#64748b",display:"flex" }}>
              {showPw?<EyeOff size={16}/>:<Eye size={16}/>}
            </button>
          </div>
          {password && <span style={{ fontSize:11,fontWeight:600,color:strengthColor }}>Strength: {strength}</span>}
        </label>

        <label className="field">
          Confirm new password
          <input
            type={showPw?"text":"password"}
            value={confirm}
            onChange={e=>setConfirm(e.target.value)}
            required minLength={8}
            placeholder="Re-enter password"
          />
          {confirm && password !== confirm && <span style={{ fontSize:11,color:"#dc2626" }}>Passwords don&apos;t match</span>}
          {confirm && password === confirm && confirm.length >= 8 && <span style={{ fontSize:11,color:"#059669" }}>✓ Passwords match</span>}
        </label>

        {error && <p className="status danger">{error}</p>}

        <button className="button" type="submit" disabled={status==="loading"||password!==confirm||password.length<8} style={{ width:"100%",marginTop:20 }}>
          <ShieldCheck size={16} style={{ marginRight:8 }}/>
          {status==="loading" ? "Resetting…" : "Reset Password"}
        </button>
      </form>

      <div style={{ marginTop:24,display:"flex",justifyContent:"space-between",gap:12 }}>
        <Link className="button ghost" href="/login">
          <ArrowLeft size={16} style={{ marginRight:8 }}/> Back to login
        </Link>
        <Link className="muted" href="/forgot-password">Request new link</Link>
      </div>
    </div>
  );
}
