"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { surveillance } from "@/lib/data";
import { SectionHeader, DataTable } from "@/components/ui/shared";

const COLORS = ["#027c8e", "#0f9f6e", "#c23b22", "#b7791f"];

export function SurveillanceModule() {
  return (
    <div className="grid">
      <div className="grid cols-2">
        <section className="panel">
          <SectionHeader title="Disease Surveillance — IDSR" badge="Weekly report" />
          <DataTable
            headers={["Disease", "Cases (this week)", "Trend", "Reporting Requirement"]}
            rows={surveillance.map((s) => [s.disease, String(s.cases), s.change, s.deadline])}
          />
        </section>

        <section className="panel">
          <SectionHeader title="Case Trends" badge="Last 7 days" />
          <ResponsiveContainer width="100%" height={220}>
            <LineChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#dce5ea" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              {surveillance.slice(0, 3).map((s, i) => (
                <Line
                  key={s.disease}
                  type="monotone"
                  data={s.trend.map((v, d) => ({ day: `D${d + 1}`, cases: v }))}
                  dataKey="cases"
                  name={s.disease}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </section>
      </div>
    </div>
  );
}
