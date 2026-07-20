"use client";
import { useState } from "react";
import { Key, ShieldCheck, Eye, EyeOff, CheckCircle, Mail, Lock } from "lucide-react";
import { getSession } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || "http://172.209.217.176:4001";

type Step = 1 | 2 | 3;

interface Props {
  user: any;
  show: (msg: string, type?: string) => void;
  onSuccess: () => void;
}

export function OTPPasswordChange({ user, show, onSuccess }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [currentPw, setCurrentPw] = useState("");
  const [otp, setOtp] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailHint, setEmailHint] = useState("");

  const pwStrength = newPw.length >= 12 ? "Strong" : newPw.length >= 8 ? "Good" : newPw.length >= 6 ? "Weak" : "";
  const pwColor = pwStrength === "Strong" ? "#059669" : pwStrength === "Good" ? "#d97706" : "#dc2626";
  const pwPct = pwStrength === "Strong" ? 100 : pwStrength === "Good" ? 65 : pwStrength === "Weak" ? 30 : 0;

  async function requestOTP() {
    if (!currentPw) { show("Enter your current password","error"); return; }
    setLoading(true);
    try {
      const session = getSession();
      const res = await fetch(`${API}/api/auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.accessToken}` },
        body: JSON.stringify({ currentPassword: currentPw }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmailHint(data.hint || "Check your email");
        setStep(2);
        show(`✅ OTP sent — ${data.hint}`, "success");
      } else {
        show(data.message || "Failed to send OTP", "error");
      }
    } catch { show("Server error — try again", "error"); }
    finally { setLoading(false); }
  }

  async function confirmOTP() {
    if (!otp || otp.length !== 6) { show("Enter the 6-digit OTP from your email","error"); return; }
    if (!newPw || newPw.length < 8) { show("Password must be at least 8 characters","error"); return; }
    if (newPw !== confirmPw) { show("Passwords do not match","error"); return; }
    setLoading(true);
    try {
      const session = getSession();
      const res = await fetch(`${API}/api/auth/confirm-password-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.accessToken}` },
        body: JSON.stringify({ otp, newPassword: newPw }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep(3);
        show("✅ Password changed successfully! Logging you out…", "success");
        setTimeout(() => { onSuccess(); }, 2500);
      } else {
        show(data.message || "Invalid OTP or expired", "error");
      }
    } catch { show("Server error — try again","error"); }
    finally { setLoading(false); }
  }

  const stepStyle = (s: number) => ({
    display:"flex" as const, alignItems:"center" as const, gap:6,
    padding:"6px 14px", borderRadius:20, fontSize:11, fontWeight:700,
    background: step === s ? "#0891b2" : step > s ? "#059669" : "#f1f5f9",
    color: step >= s ? "white" : "#94a3b8",
  });

  return (
    <div>
      {/* Step indicators */}
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:22 }}>
        <div style={stepStyle(1)}>{step > 1 ? <CheckCircle size={12}/> : <Lock size={12}/>} Current Password</div>
        <div style={{ width:24, height:2, background:"#e2e8f0" }}/>
        <div style={stepStyle(2)}>{step > 2 ? <CheckCircle size={12}/> : <Mail size={12}/>} Verify OTP</div>
        <div style={{ width:24, height:2, background:"#e2e8f0" }}/>
        <div style={stepStyle(3)}><Key size={12}/> New Password</div>
      </div>

      {step === 1 && (
        <div style={{ maxWidth:440 }}>
          <div style={{ background:"#f0f9ff",border:"1px solid #bae6fd",borderRadius:9,padding:"10px 14px",marginBottom:16,fontSize:12,color:"#0369a1",lineHeight:1.6 }}>
            🔐 Enter your <strong>current password</strong> to verify your identity. An OTP will be sent to <strong>{user?.email || "your email"}</strong>.
          </div>
          <label style={{ fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:5 }}>Current Password</label>
          <div style={{ position:"relative", marginBottom:14 }}>
            <input type={showPw?"text":"password"} value={currentPw} onChange={e=>setCurrentPw(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&requestOTP()}
              placeholder="Enter your current password"
              style={{ width:"100%",padding:"10px 38px 10px 12px",borderRadius:9,border:"1px solid #e2e8f0",fontSize:13,color:"#0f172a",outline:"none",boxSizing:"border-box" as const }}/>
            <button type="button" onClick={()=>setShowPw(!showPw)}
              style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",border:"none",background:"none",cursor:"pointer",color:"#64748b",display:"flex" }}>
              {showPw?<EyeOff size={16}/>:<Eye size={16}/>}
            </button>
          </div>
          <button onClick={requestOTP} disabled={loading||!currentPw}
            style={{ display:"flex",alignItems:"center",gap:7,padding:"11px 22px",background:loading||!currentPw?"#e2e8f0":"linear-gradient(135deg,#059669,#0891b2)",color:loading||!currentPw?"#94a3b8":"white",borderRadius:10,border:"none",cursor:loading||!currentPw?"not-allowed":"pointer",fontSize:13,fontWeight:700 }}>
            <Mail size={14}/>{loading ? "Sending OTP…" : "Send Verification Code"}
          </button>
        </div>
      )}

      {step === 2 && (
        <div style={{ maxWidth:440 }}>
          <div style={{ background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:9,padding:"10px 14px",marginBottom:16,fontSize:12,color:"#065f46",lineHeight:1.6 }}>
            📧 A 6-digit code was sent to <strong>{emailHint || user?.email}</strong>. It expires in 10 minutes.
          </div>
          <label style={{ fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:5 }}>6-Digit OTP Code</label>
          <input value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,"").slice(0,6))}
            placeholder="000000"
            style={{ width:"100%",padding:"12px",borderRadius:9,border:"2px solid #e2e8f0",fontSize:22,fontWeight:800,letterSpacing:10,textAlign:"center",color:"#0891b2",outline:"none",marginBottom:14,boxSizing:"border-box" as const }}/>
          <label style={{ fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:5 }}>New Password <span style={{ color:"#94a3b8",fontWeight:400 }}>(min 8 chars)</span></label>
          <input type={showPw?"text":"password"} value={newPw} onChange={e=>setNewPw(e.target.value)}
            placeholder="Strong new password"
            style={{ width:"100%",padding:"10px 12px",borderRadius:9,border:"1px solid #e2e8f0",fontSize:13,color:"#0f172a",outline:"none",marginBottom:6,boxSizing:"border-box" as const }}/>
          {newPw && (<div style={{ marginBottom:12 }}>
            <div style={{ display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3 }}>
              <span style={{ color:"#64748b" }}>Strength</span>
              <span style={{ fontWeight:700,color:pwColor }}>{pwStrength}</span>
            </div>
            <div style={{ height:4,background:"#f1f5f9",borderRadius:4,overflow:"hidden" }}>
              <div style={{ height:"100%",width:`${pwPct}%`,background:pwColor,borderRadius:4,transition:"width 0.3s" }}/>
            </div>
          </div>)}
          <label style={{ fontSize:12,fontWeight:600,color:"#374151",display:"block",marginBottom:5 }}>Confirm New Password</label>
          <input type={showPw?"text":"password"} value={confirmPw} onChange={e=>setConfirmPw(e.target.value)}
            placeholder="Re-enter new password"
            style={{ width:"100%",padding:"10px 12px",borderRadius:9,border:`1px solid ${confirmPw&&confirmPw!==newPw?"#fca5a5":confirmPw&&confirmPw===newPw&&newPw.length>=8?"#86efac":"#e2e8f0"}`,fontSize:13,color:"#0f172a",outline:"none",marginBottom:14,boxSizing:"border-box" as const }}/>
          {confirmPw && confirmPw !== newPw && <div style={{ fontSize:11,color:"#dc2626",marginBottom:10 }}>✗ Passwords don't match</div>}
          {confirmPw && confirmPw === newPw && newPw.length >= 8 && <div style={{ fontSize:11,color:"#059669",marginBottom:10 }}>✓ Passwords match</div>}
          <div style={{ display:"flex",gap:8 }}>
            <button onClick={()=>setStep(1)} style={{ padding:"10px 16px",borderRadius:9,border:"1px solid #e2e8f0",background:"white",cursor:"pointer",fontSize:12,fontWeight:600,color:"#374151" }}>← Back</button>
            <button onClick={confirmOTP} disabled={loading||!otp||otp.length!==6||!newPw||newPw!==confirmPw||newPw.length<8}
              style={{ display:"flex",alignItems:"center",gap:7,padding:"10px 22px",background:loading||!otp||newPw!==confirmPw||newPw.length<8?"#e2e8f0":"linear-gradient(135deg,#059669,#0891b2)",color:loading||!otp||newPw!==confirmPw||newPw.length<8?"#94a3b8":"white",borderRadius:9,border:"none",cursor:"pointer",fontSize:13,fontWeight:700,flex:1 }}>
              <Key size={14}/>{loading?"Changing password…":"Change Password"}
            </button>
          </div>
          <button onClick={()=>{setCurrentPw("");setOtp("");setNewPw("");setConfirmPw("");requestOTP();}} style={{ marginTop:10,fontSize:11,color:"#0891b2",border:"none",background:"none",cursor:"pointer",textDecoration:"underline" }}>Resend OTP</button>
        </div>
      )}

      {step === 3 && (
        <div style={{ textAlign:"center",padding:"24px 0" }}>
          <div style={{ width:64,height:64,borderRadius:"50%",background:"#dcfce7",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px" }}>
            <CheckCircle size={32} style={{ color:"#059669" }}/>
          </div>
          <div style={{ fontSize:16,fontWeight:800,color:"#0f172a",marginBottom:6 }}>Password Changed Successfully!</div>
          <div style={{ fontSize:12,color:"#64748b",lineHeight:1.6 }}>
            A confirmation email has been sent to <strong>{user?.email}</strong>.<br/>
            All sessions have been revoked. Redirecting to login…
          </div>
        </div>
      )}
    </div>
  );
}
