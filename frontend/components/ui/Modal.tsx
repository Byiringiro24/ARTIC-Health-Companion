"use client";
import { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  footer?: React.ReactNode;
}

export function Modal({ open, onClose, title, children, size = "md", footer }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;
  const widths = { sm: 480, md: 640, lg: 800, xl: 1000 };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(16,32,42,0.55)", backdropFilter: "blur(4px)" }} onClick={onClose} />
      <div style={{ position: "relative", width: "100%", maxWidth: widths[size], background: "white", borderRadius: 12, boxShadow: "0 24px 64px rgba(0,0,0,0.18)", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid var(--line)", flexShrink: 0 }}>
          <strong style={{ fontSize: 18 }}>{title}</strong>
          <button type="button" style={{ border: "none", background: "none", cursor: "pointer", color: "#60717c", padding: 4 }} onClick={onClose}><X size={18} /></button>
        </div>
        <div style={{ padding: "22px", overflowY: "auto", flex: 1 }}>{children}</div>
        {footer && <div style={{ padding: "16px 22px", borderTop: "1px solid var(--line)", flexShrink: 0 }}>{footer}</div>}
      </div>
    </div>
  );
}
