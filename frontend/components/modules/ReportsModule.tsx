"use client";

import { Download, FileText } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { weeklyRevenue, revenueByDepartment } from "@/lib/data";
import { useToast } from "@/lib/store";
import { SectionHeader, StatCard } from "@/components/ui/shared";

export function ReportsModule() {
  const { show } = useToast();

  const kpiRows = [
    { label: "Outpatients today", value: "148", trend: "+12 vs yesterday" },
    { label: "Bed occupancy", value: "82%", trend: "Target: 70–85%" },
    { label: "Lab TAT avg", value: "2.6 hrs", trend: "Target: < 4 hrs" },
    { label: "Claim approval", value: "91%", trend: "Target: > 85%" },
  ] as const;

  const reportSections = [
    {
      title: "MOH Reports", badge: "MOH",
      items: ["Form A — OPD Statistics", "Form B — IPD Statistics", "Form C — Disease Reports", "Form D — MCH Services", "Form E — HIV/AIDS"],
    },
    {
      title: "PBF Indicators", badge: "PBF",
      items: ["Antenatal care visits", "Institutional deliveries", "Child vaccination coverage", "Malaria case management", "HIV/TB performance"],
    },
    {
      title: "Management Reports", badge: "Finance",
      items: ["Daily cash reconciliation", "Revenue by department", "Insurance claims aging", "Drug consumption report", "Staff attendance summary"],
    },
  ];

  return (
    <div className="grid">
      <div className="grid cols-4">
        {kpiRows.map((k) => <StatCard key={k.label} label={k.label} value={k.value} trend={k.trend} tone="good" />)}
      </div>

      <div className="grid cols-2">
        <section className="panel">
          <SectionHeader title="Weekly Revenue Trend" badge="This week" />
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dce5ea" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(v: number) => `${(v / 1e6).toFixed(1)}M`} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => [`RWF ${v.toLocaleString()}`, "Revenue"]} />
              <Line type="monotone" dataKey="revenue" stroke="#027c8e" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </section>

        <section className="panel">
          <SectionHeader title="Revenue by Department" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueByDepartment}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dce5ea" />
              <XAxis dataKey="department" tick={{ fontSize: 10 }} />
              <YAxis tickFormatter={(v: number) => `${(v / 1e6).toFixed(1)}M`} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => `RWF ${v.toLocaleString()}`} />
              <Bar dataKey="revenue" fill="#0f9f6e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>

      <div className="grid cols-3">
        {reportSections.map(({ title, badge, items }) => (
          <section className="panel" key={title}>
            <SectionHeader title={title} badge={badge} />
            <ul className="compact-list">
              {items.map((item) => (
                <li key={item} style={{ justifyContent: "flex-start", gap: 10 }}>
                  <FileText size={14} color="#60717c" />
                  <span style={{ fontSize: 13, flex: 1 }}>{item}</span>
                  <button type="button" style={{ border: "none", background: "none", cursor: "pointer", color: "#027c8e" }}
                    onClick={() => show(`${item} — exported`, "success")}>
                    <Download size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
