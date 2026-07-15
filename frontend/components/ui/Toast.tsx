"use client";
import { useToast } from "@/lib/store";
import { CheckCircle, AlertTriangle, Info, XCircle, X } from "lucide-react";

export function ToastContainer() {
  const { toasts, dismiss } = useToast();
  if (!toasts.length) return null;
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10 }}>
      {toasts.map((t) => {
        const colors: Record<string, { bg: string; border: string; color: string }> = {
          success: { bg: "#edf7ee", border: "#0f9f6e", color: "#236d32" },
          error: { bg: "#fff0ed", border: "#c23b22", color: "#c23b22" },
          warning: { bg: "#fff7e6", border: "#b7791f", color: "#b7791f" },
          info: { bg: "#e8f4fd", border: "#027c8e", color: "#027c8e" },
        };
        const c = colors[t.type] ?? colors.info;
        const Icon = t.type === "success" ? CheckCircle : t.type === "error" ? XCircle : t.type === "warning" ? AlertTriangle : Info;
        return (
          <div key={t.id} style={{ minWidth: 300, maxWidth: 420, background: c.bg, border: `1px solid ${c.border}`, borderRadius: 10, padding: "13px 16px", display: "flex", alignItems: "flex-start", gap: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
            <Icon size={18} color={c.color} style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ flex: 1, fontSize: 14, color: "#10202a" }}>{t.message}</span>
            <button type="button" style={{ border: "none", background: "none", cursor: "pointer", color: "#60717c", padding: 0 }} onClick={() => dismiss(t.id)}>
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
