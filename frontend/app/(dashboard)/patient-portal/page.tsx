"use client";

import { useEffect, useState } from "react";
import { getSession } from "@/lib/auth";
import { appointmentsApi, billingApi, labApi, pharmacyApi } from "@/lib/api/hms";
import { CalendarClock, FlaskConical, Pill, BadgeDollarSign, User } from "lucide-react";

export default function PatientPortalPage() {
  const [user, setUser]               = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [invoices, setInvoices]       = useState<any[]>([]);
  const [labResults, setLabResults]   = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const session = getSession();
    setUser(session);
    if (!session) return;

    Promise.all([
      appointmentsApi.list({ limit: "10" }),
      billingApi.listInvoices({ limit: "5" }),
      labApi.list({ limit: "10" }),
      pharmacyApi.listRx({ limit: "5", status: "active" }),
    ]).then(([appts, invs, labs, rxs]: any[]) => {
      setAppointments(appts?.data || []);
      setInvoices(invs?.data || []);
      setLabResults(labs?.data || []);
      setPrescriptions(rxs?.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding:32,color:"#60717c" }}>Loading your health portal…</div>;

  const nextAppt = appointments.find(a => a.status !== "Completed" && a.status !== "Cancelled");
  const unpaidBills = invoices.filter(i => i.status !== "paid" && i.status !== "Paid");
  const criticalLabs = labResults.filter(l => l.resultFlag?.toLowerCase().includes("critical") || l.flag?.toLowerCase().includes("critical"));

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
      {/* Greeting */}
      <div style={{ background:"linear-gradient(135deg,#027c8e,#0f9f6e)",color:"white",borderRadius:16,padding:"24px 28px" }}>
        <h1 style={{ margin:0,fontSize:20,fontWeight:700 }}>
          Welcome, {user?.firstName || user?.name?.split(" ")[0] || "Patient"} 👋
        </h1>
        <p style={{ margin:"8px 0 0",opacity:0.85,fontSize:14 }}>
          Your health companion — Kigali District Hospital
        </p>
        {nextAppt && (
          <div style={{ marginTop:16,background:"rgba(255,255,255,0.15)",borderRadius:10,padding:"12px 16px",fontSize:13 }}>
            <strong>Next Appointment:</strong> {nextAppt.doctorName || nextAppt.clinician} · {nextAppt.appointmentDate || nextAppt.date} at {nextAppt.startTime || nextAppt.time}
            <span style={{ marginLeft:8,background:"rgba(255,255,255,0.3)",borderRadius:6,padding:"2px 8px",fontSize:11 }}>
              Queue: {nextAppt.queueNumber || nextAppt.queue || "—"}
            </span>
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12 }}>
        {[
          { icon:CalendarClock, label:"Appointments", value:appointments.length, color:"#027c8e", sub:`${appointments.filter(a=>a.status!=="Completed").length} upcoming` },
          { icon:FlaskConical,  label:"Lab Results",  value:labResults.length,   color:"#5b5fc7", sub:criticalLabs.length>0?`${criticalLabs.length} critical`:"All normal" },
          { icon:Pill,          label:"Active Rx",    value:prescriptions.filter(r=>r.status==="active").length, color:"#0f9f6e", sub:"Prescriptions" },
          { icon:BadgeDollarSign,label:"Unpaid Bills", value:unpaidBills.length,  color:unpaidBills.length>0?"#c23b22":"#0f9f6e", sub:unpaidBills.length>0?`RWF ${unpaidBills.reduce((a:number,i:any)=>a+(i.balance||0),0).toLocaleString()}`:"All settled" },
        ].map(({ icon: Icon, label, value, color, sub }) => (
          <div key={label} style={{ background:"white",border:"1px solid var(--line,#e5)",borderRadius:12,padding:"16px 18px",borderLeft:`4px solid ${color}` }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:6 }}>
              <Icon size={16} color={color} />
              <span style={{ fontSize:12,color:"#6b7280" }}>{label}</span>
            </div>
            <div style={{ fontSize:26,fontWeight:700,color,lineHeight:1 }}>{value}</div>
            <div style={{ fontSize:12,color:"#9ca3af",marginTop:4 }}>{sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
        {/* Upcoming appointments */}
        <section style={{ background:"white",border:"1px solid var(--line,#e5)",borderRadius:12,padding:16 }}>
          <h3 style={{ margin:"0 0 12px",fontSize:15,fontWeight:700,display:"flex",alignItems:"center",gap:8 }}>
            <CalendarClock size={16} color="#027c8e" /> My Appointments
          </h3>
          {appointments.slice(0,5).map((a:any) => (
            <div key={a.id} style={{ padding:"10px 0",borderBottom:"1px solid var(--line,#e5)",fontSize:13 }}>
              <div style={{ display:"flex",justifyContent:"space-between" }}>
                <strong>{a.doctorName || a.clinician}</strong>
                <span style={{ fontSize:12,background:a.status==="Completed"?"#f0faf9":a.status==="Cancelled"?"#fff1f0":"#eff6ff",color:a.status==="Completed"?"#0f9f6e":a.status==="Cancelled"?"#c23b22":"#1d4ed8",borderRadius:6,padding:"2px 8px" }}>
                  {a.status}
                </span>
              </div>
              <div style={{ color:"#6b7280",fontSize:12,marginTop:2 }}>
                {a.appointmentDate || a.date} · {a.startTime || a.time} · {a.departmentName || a.department}
              </div>
            </div>
          ))}
          {appointments.length === 0 && <p style={{ color:"#9ca3af",fontSize:13 }}>No appointments yet.</p>}
        </section>

        {/* Lab results */}
        <section style={{ background:"white",border:"1px solid var(--line,#e5)",borderRadius:12,padding:16 }}>
          <h3 style={{ margin:"0 0 12px",fontSize:15,fontWeight:700,display:"flex",alignItems:"center",gap:8 }}>
            <FlaskConical size={16} color="#5b5fc7" /> My Lab Results
          </h3>
          {labResults.slice(0,5).map((r:any) => (
            <div key={r.id} style={{ padding:"10px 0",borderBottom:"1px solid var(--line,#e5)",fontSize:13 }}>
              <div style={{ display:"flex",justifyContent:"space-between" }}>
                <strong>{r.testName || r.test}</strong>
                {(r.resultFlag || r.flag) && (
                  <span style={{ fontSize:11,fontWeight:700,color:(r.resultFlag||r.flag).toLowerCase().includes("critical")?"#c23b22":"#b7791f",background:(r.resultFlag||r.flag).toLowerCase().includes("critical")?"#fff1f0":"#fffbeb",borderRadius:6,padding:"2px 8px" }}>
                    {r.resultFlag || r.flag}
                  </span>
                )}
              </div>
              <div style={{ color:"#6b7280",fontSize:12,marginTop:2 }}>
                {r.resultValue ? `${r.resultValue} ${r.resultUnit||""} · Ref: ${r.referenceRange||"—"}` : r.status}
              </div>
            </div>
          ))}
          {labResults.length === 0 && <p style={{ color:"#9ca3af",fontSize:13 }}>No lab results yet.</p>}
        </section>

        {/* Bills */}
        <section style={{ background:"white",border:"1px solid var(--line,#e5)",borderRadius:12,padding:16 }}>
          <h3 style={{ margin:"0 0 12px",fontSize:15,fontWeight:700,display:"flex",alignItems:"center",gap:8 }}>
            <BadgeDollarSign size={16} color="#b7791f" /> My Bills
          </h3>
          {invoices.slice(0,5).map((inv:any) => (
            <div key={inv.id} style={{ padding:"10px 0",borderBottom:"1px solid var(--line,#e5)",fontSize:13,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <div>
                <div><strong>{inv.invoiceNumber || inv.invoice_number}</strong></div>
                <div style={{ color:"#6b7280",fontSize:12 }}>RWF {(inv.total||inv.amount||0).toLocaleString()} · Balance: {(inv.balance||0).toLocaleString()}</div>
              </div>
              {inv.balance > 0 ? (
                <button style={{ padding:"6px 14px",background:"#027c8e",color:"white",border:"none",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600 }}>
                  Pay Now
                </button>
              ) : (
                <span style={{ color:"#0f9f6e",fontSize:12,fontWeight:600 }}>✓ Paid</span>
              )}
            </div>
          ))}
          {invoices.length === 0 && <p style={{ color:"#9ca3af",fontSize:13 }}>No invoices yet.</p>}
        </section>

        {/* Prescriptions */}
        <section style={{ background:"white",border:"1px solid var(--line,#e5)",borderRadius:12,padding:16 }}>
          <h3 style={{ margin:"0 0 12px",fontSize:15,fontWeight:700,display:"flex",alignItems:"center",gap:8 }}>
            <Pill size={16} color="#0f9f6e" /> My Prescriptions
          </h3>
          {prescriptions.slice(0,5).map((rx:any) => (
            <div key={rx.id} style={{ padding:"10px 0",borderBottom:"1px solid var(--line,#e5)",fontSize:13 }}>
              <div style={{ display:"flex",justifyContent:"space-between" }}>
                <strong>Dr. {rx.doctorName || "Doctor"}</strong>
                <span style={{ fontSize:11,background:rx.status==="dispensed"?"#f0faf9":"#eff6ff",color:rx.status==="dispensed"?"#0f9f6e":"#1d4ed8",borderRadius:6,padding:"2px 8px" }}>
                  {rx.status}
                </span>
              </div>
              <div style={{ color:"#6b7280",fontSize:12,marginTop:2 }}>
                {(rx.items||[]).slice(0,2).map((i:any)=>i.drug||i.genericName).join(", ")}
                {(rx.items||[]).length > 2 && ` +${rx.items.length-2} more`}
              </div>
            </div>
          ))}
          {prescriptions.length === 0 && <p style={{ color:"#9ca3af",fontSize:13 }}>No prescriptions yet.</p>}
        </section>
      </div>
    </div>
  );
}
