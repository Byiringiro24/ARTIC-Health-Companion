import { PatientRegistrationForm } from "@/components/dashboard/PatientRegistrationForm";

export default function Page() {
  return (
    <main style={{ padding: "28px 24px", maxWidth: 1180, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <p className="muted" style={{ margin: 0 }}>Clinic intake and longitudinal medical record</p>
        <h1 style={{ margin: "6px 0 0" }}>Patient Registration & Medical Record</h1>
      </div>
      <PatientRegistrationForm />
    </main>
  );
}
