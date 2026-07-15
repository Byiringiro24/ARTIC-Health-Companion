"use client";

import { AlertTriangle, ArrowUpRight, AlertCircle } from "lucide-react";

// ─── DataTable ──────────────────────────────────────────────────────────────
export function DataTable({
  headers,
  rows,
  statusCol,
  priorityCol,
  priorityMap,
  flagCol,
  onRowClick,
  emptyMessage = "No records found",
}: {
  headers: string[];
  rows: string[][];
  statusCol?: number;
  priorityCol?: number;
  priorityMap?: Record<string, string>;
  flagCol?: number;
  onRowClick?: (row: string[]) => void;
  emptyMessage?: string;
}) {
  const tone = (v: string) => {
    const s = v.toLowerCase();
    if (
      ["danger", "low stock", "critical", "denied", "overdue", "unpaid", "failed", "no-show", "level 1", "level 2", "pending id"].some(
        (k) => s.includes(k)
      )
    )
      return "danger";
    if (
      ["warn", "partial", "pending", "due", "submitted", "review", "triage", "waiting", "cleaning", "calibration", "near", "deferred", "on hold"].some(
        (k) => s.includes(k)
      )
    )
      return "warn";
    return "";
  };

  const flagTone = (v: string) => {
    const s = v.toLowerCase();
    return s.includes("critical") ? "danger" : s.includes("high") || s.includes("low") || s.includes("abnormal") ? "warn" : "";
  };

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={headers.length} style={{ textAlign: "center", color: "#60717c", padding: 32 }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr
                key={i}
                onClick={() => onRowClick?.(row)}
                style={onRowClick ? { cursor: "pointer" } : undefined}
                onMouseEnter={(e) => {
                  if (onRowClick) (e.currentTarget as HTMLElement).style.background = "#f7f9fb";
                }}
                onMouseLeave={(e) => {
                  if (onRowClick) (e.currentTarget as HTMLElement).style.background = "";
                }}
              >
                {row.map((cell, j) => (
                  <td key={j}>
                    {statusCol === j ? (
                      <span className={`status ${tone(cell)}`}>{cell}</span>
                    ) : priorityCol === j && priorityMap ? (
                      <span className={`status${priorityMap[cell] ? ` ${priorityMap[cell]}` : ""}`}>{cell}</span>
                    ) : flagCol === j ? (
                      <span className={`status${flagTone(cell) ? ` ${flagTone(cell)}` : ""}`}>{cell}</span>
                    ) : (
                      cell
                    )}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── StatCard ───────────────────────────────────────────────────────────────
export function StatCard({
  label,
  value,
  trend,
  tone,
  icon,
}: {
  label: string;
  value: string;
  trend?: string;
  tone?: "good" | "warn" | "danger";
  icon?: React.ReactNode;
}) {
  return (
    <div className="card metric">
      <div>
        <span className="muted" style={{ fontSize: 13 }}>
          {label}
        </span>
        <strong style={{ color: tone === "danger" ? "#c23b22" : tone === "warn" ? "#b7791f" : undefined }}>{value}</strong>
        {trend && (
          <p className="muted" style={{ fontSize: 12, margin: "4px 0 0" }}>
            {trend}
          </p>
        )}
      </div>
      {icon ?? (tone === "danger" ? (
        <AlertTriangle color="#c23b22" size={22} />
      ) : tone === "warn" ? (
        <AlertCircle color="#b7791f" size={22} />
      ) : (
        <ArrowUpRight color="#0f9f6e" size={22} />
      ))}
    </div>
  );
}

// ─── SectionHeader ──────────────────────────────────────────────────────────
export function SectionHeader({
  title,
  badge,
  action,
}: {
  title: string;
  badge?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="module-header">
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <h2 style={{ margin: 0 }}>{title}</h2>
        {badge && <span className="badge">{badge}</span>}
      </div>
      {action && <div className="actions-row">{action}</div>}
    </div>
  );
}
