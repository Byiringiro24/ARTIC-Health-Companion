"use client";
/**
 * Shared OTP Password Change component — used across all portals.
 * Steps: 1) Enter current password → send OTP  2) Enter OTP  3) Set new password
 */
import { useState } from "react";
import { Key, Mail, CheckCircle, Eye, EyeOff, Shield } from "lucide-react";
import { getSession, logout } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || "http://172.209.217.176:4001";

type Step = "current" | "otp" | "newpw" | "done";

export function OTPPasswordChange({
  userEmail,
  onSuccess,
}: {
  userEmail?: string;
  onSuccess?: () => void;
}) {
  const [step,      setStep]      = useState<Step>("current");
  const [current,   setCurrent]   = useState("");
  const [otp,       setOtp]       = useState("");
  const [newPw,     setNewPw]     = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [loading,   setLoading]   = useState(false);
  const [showPw,    setShowPw]    = useState(false);
  const [hint,      setHint]      = useState("");
  const [toast,     setToast]     = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  }

  const strength = newPw.length >= 12 ? "Strong" : newPw.length >= 8 ? "Good" : newPw.length >= 6 ? "Weak" : "";
  const strengthColor = strength === "Strong" ? "#059669" : strength === "Good" ? "#d97706" : "#dc2626";
  const strengthPct   = strength === "Strong" ? 100 : strength === "Good" ? 65 : strength === "Weak" ? 30 : 0;

  async function requestOTP() {
    if (!current) { showToast("Enter your current password"); return; }
    setLoading(true);
    try {
      const s = getSession();
      const res = await fetch(`${API}/api/auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${s?.accessToken}` },
        body: JSON.stringify({ currentPassword: current }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.message || "Incorrect current password"); return; }
      setHint(data.hint || `OTP sent to ${userEmail || "your email"}`);
      setStep("otp");
      showToast("✅ OTP sent to your email — valid 10 minutes");
    } catch { showToast("Server error — try again"); }
    finally { setLoading(false); }
  }

  function verifyOTP() {
    if (otp.length !== 6) { showToast("Enter the full 6-digit code"); return; }
    setStep("newpw");
  }

  async function changePassword() {
    if (!newPw || newPw.length < 8) { showToast("Password must be at least 8 characters"); return; }
    if (newPw !== confirm) { showToast("Passwords do not match"); return; }
    setLoading(true);
    try {
      const s = getSession();
      const res = await fetch(`${API}/api/auth/confirm-password-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${s?.accessToken}` },
        body: JSON.stringify({ otp, newPassword: newPw }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.message || "Failed — try again"); setStep("otp"); return; }
      setStep("done");
      showToast("✅ Password changed! Logging you out…");
      if (onSuccess) onSuccess();
      setTimeout(() => { logout(); window.location.href = "/login"; }, 2500);
    } catch { showToast("Server error"); }
    finally { setLoading(false); }
  }

  function reset() { setStep("current"); setCurrent(""); setOtp(""); setNewPw(""); setConfirm(""); }

  const inp = (extra?: React.CSSProperties): React.CSSProperties => ({
    width: "100%", padding: "9px 11px", borderRadius: 8, border: "1px solid #e2e8f0",
    fontSize: 12, outline: "none", color: "#0f172a", boxSizing: "border-box", ...extra,
  });

  return (
    <div style={{ background: "white", borderRadius: 14, border: "2px solid #0891b2", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "13px 18px", background: "linear-gradient(135deg,#f0f9ff,#e0f2fe)", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 13, color: "#0f172a", display: "flex", alignItems: "center", gap: 6 }}>
            <Key size={14} style={{ color: "#0891b2" }} />Change Password — 3-Step Secure Verification
          </div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>Verify identity → OTP by email → New password</div>
        </div>
        <Shield size={22} style={{ color: "#0891b2", opacity: 0.4 }} />
      </div>

      <div style={{ padding: "18px 20px" }}>
        {/* Toast */}
        {toast && (
          <div style={{ marginBottom: 14, padding: "9px 13px", background: toast.startsWith("✅") ? "#f0fdf4" : "#fef2f2", borderRadius: 8, fontSize: 12, fontWeight: 600, color: toast.startsWith("✅") ? "#065f46" : "#dc2626", border: `1px solid ${toast.startsWith("✅") ? "#bbf7d0" : "#fca5a5"}` }}>
            {toast}
          </div>
        )}

        {/* Step indicators */}
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 20 }}>
          {(["current", "otp", "newpw"] as Step[]).map((s, i) => {
            const labels = ["Verify Identity", "Enter OTP", "New Password"];
            const done = step === "done" || (step === "otp" && i === 0) || (step === "newpw" && i < 2);
            const active = step === s;
            return (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 5, flex: 1 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flex: 1 }}>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: done ? "#059669" : active ? "#0891b2" : "#e2e8f0", color: done || active ? "white" : "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>
                    {done ? <CheckCircle size={13} /> : i + 1}
                  </div>
                  <div style={{ fontSize: 9, color: active ? "#0891b2" : done ? "#059669" : "#94a3b8", fontWeight: active || done ? 600 : 400, textAlign: "center", whiteSpace: "nowrap" }}>{labels[i]}</div>
                </div>
                {i < 2 && <div style={{ height: 2, flex: 0.4, background: done ? "#059669" : "#e2e8f0", borderRadius: 2, marginBottom: 14 }} />}
              </div>
            );
          })}
        </div>

        {/* Step 1: Current password */}
        {step === "current" && (
          <div style={{ maxWidth: 420 }}>
            <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 8, padding: "9px 12px", marginBottom: 14, fontSize: 12, color: "#0369a1" }}>
              🔐 Enter your current password. An OTP will be sent to <strong>{userEmail || "your registered email"}</strong>.
            </div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Current Password</label>
            <div style={{ position: "relative", marginBottom: 14 }}>
              <input type={showPw ? "text" : "password"} value={current} onChange={e => setCurrent(e.target.value)}
                onKeyDown={e => e.key === "Enter" && requestOTP()} placeholder="Enter current password"
                style={{ ...inp(), paddingRight: 38 }} />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer", color: "#64748b", display: "flex" }}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <button onClick={requestOTP} disabled={loading || !current}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", background: loading || !current ? "#e2e8f0" : "linear-gradient(135deg,#0891b2,#7c3aed)", color: loading || !current ? "#94a3b8" : "white", borderRadius: 9, border: "none", cursor: loading || !current ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 700 }}>
              <Mail size={13} />{loading ? "Sending OTP…" : "Verify & Send OTP to Email"}
            </button>
          </div>
        )}

        {/* Step 2: OTP */}
        {step === "otp" && (
          <div style={{ maxWidth: 420 }}>
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: "#065f46" }}>
              ✅ {hint} — valid for <strong>10 minutes</strong>.
            </div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>6-Digit Verification Code</label>
            <input type="text" inputMode="numeric" maxLength={6} value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              style={{ width: 200, padding: "12px 16px", borderRadius: 9, border: `2px solid ${otp.length === 6 ? "#059669" : "#e2e8f0"}`, fontSize: 24, fontWeight: 800, fontFamily: "monospace", letterSpacing: "0.3em", textAlign: "center", outline: "none", color: "#0f172a", boxSizing: "border-box", marginBottom: 14 }} />
            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 14 }}>
              Didn&apos;t receive it? <button onClick={reset} style={{ border: "none", background: "none", color: "#0891b2", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>Go back & resend</button>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={reset} style={{ padding: "8px 14px", border: "1px solid #e2e8f0", background: "white", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#374151" }}>← Back</button>
              <button onClick={verifyOTP} disabled={otp.length !== 6}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 20px", background: otp.length !== 6 ? "#e2e8f0" : "linear-gradient(135deg,#059669,#0891b2)", color: otp.length !== 6 ? "#94a3b8" : "white", borderRadius: 9, border: "none", cursor: otp.length !== 6 ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 700 }}>
                <CheckCircle size={13} />Verify OTP
              </button>
            </div>
          </div>
        )}

        {/* Step 3: New password */}
        {step === "newpw" && (
          <div style={{ maxWidth: 420 }}>
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "9px 12px", marginBottom: 14, fontSize: 12, color: "#065f46" }}>✅ Identity verified. Set your new password.</div>
            <div style={{ display: "grid", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>New Password <span style={{ color: "#94a3b8", fontWeight: 400 }}>(min 8 chars)</span></label>
                <div style={{ position: "relative" }}>
                  <input type={showPw ? "text" : "password"} value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Strong new password"
                    style={{ ...inp({ paddingRight: 38 }) }} />
                  <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer", color: "#64748b", display: "flex" }}>
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {newPw && (
                  <div style={{ marginTop: 5 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 2 }}>
                      <span style={{ color: "#64748b" }}>Password strength</span>
                      <span style={{ fontWeight: 700, color: strengthColor }}>{strength}</span>
                    </div>
                    <div style={{ height: 3, background: "#f1f5f9", borderRadius: 4 }}>
                      <div style={{ height: "100%", width: `${strengthPct}%`, background: strengthColor, borderRadius: 4, transition: "width 0.3s" }} />
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Confirm New Password</label>
                <input type={showPw ? "text" : "password"} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Re-enter new password"
                  style={inp({ border: `1px solid ${confirm && confirm !== newPw ? "#fca5a5" : confirm && confirm === newPw && newPw.length >= 8 ? "#86efac" : "#e2e8f0"}` })} />
                {confirm && confirm !== newPw && <div style={{ fontSize: 10, color: "#dc2626", marginTop: 2 }}>✗ Passwords don&apos;t match</div>}
                {confirm && confirm === newPw && newPw.length >= 8 && <div style={{ fontSize: 10, color: "#059669", marginTop: 2 }}>✓ Passwords match</div>}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setStep("otp")} style={{ padding: "8px 14px", border: "1px solid #e2e8f0", background: "white", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#374151" }}>← Back</button>
              <button onClick={changePassword} disabled={loading || !newPw || newPw !== confirm || newPw.length < 8}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 20px", background: loading || !newPw || newPw !== confirm || newPw.length < 8 ? "#e2e8f0" : "linear-gradient(135deg,#059669,#0891b2)", color: loading || !newPw || newPw !== confirm || newPw.length < 8 ? "#94a3b8" : "white", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                <Key size={13} />{loading ? "Changing…" : "Change Password"}
              </button>
            </div>
          </div>
        )}

        {/* Done */}
        {step === "done" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 44, marginBottom: 10 }}>✅</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#059669" }}>Password Changed Successfully!</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>Confirmation email sent. Logging you out…</div>
          </div>
        )}
      </div>
    </div>
  );
}
