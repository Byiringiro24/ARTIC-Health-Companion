"use client";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import React from "react";

export const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background:"white",borderRadius:12,border:"1px solid #e2e8f0",boxShadow:"0 1px 4px rgba(0,0,0,0.05)",overflow:"hidden",...style }}>{children}</div>
);

export const CardHead = ({ title, sub, action }: { title:string; sub?:string; action?:React.ReactNode }) => (
  <div style={{ padding:"14px 18px",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10 }}>
    <div>
      <div style={{ fontWeight:700,fontSize:13,color:"#0f172a" }}>{title}</div>
      {sub && <div style={{ fontSize:10,color:"#94a3b8",marginTop:1 }}>{sub}</div>}
    </div>
    {action}
  </div>
);

export const StatusBadge = ({ label, color, bg }: { label:string; color:string; bg:string }) => (
  <span style={{ padding:"2px 10px",borderRadius:20,fontSize:11,fontWeight:600,background:bg,color,whiteSpace:"nowrap" }}>{label}</span>
);

export const KPICard = ({ label, value, icon, color, bg, trend, trendVal, sub }: any) => (
  <div style={{ background:"white",borderRadius:12,padding:"16px 18px",border:"1px solid #e2e8f0",borderTop:`3px solid ${color}`,boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8 }}>
      <div style={{ width:38,height:38,borderRadius:10,background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>{icon}</div>
      {trend && (
        <div style={{ display:"flex",alignItems:"center",gap:3,fontSize:11,fontWeight:600,color:trend==="up"?"#059669":"#dc2626" }}>
          {trend==="up"?<ArrowUpRight size={13}/>:<ArrowDownRight size={13}/>}{trendVal}
        </div>
      )}
    </div>
    <div style={{ fontSize:26,fontWeight:800,color }}>{value}</div>
    <div style={{ fontSize:11,color:"#64748b",marginTop:2,fontWeight:500 }}>{label}</div>
    {sub && <div style={{ fontSize:10,color:"#94a3b8",marginTop:1 }}>{sub}</div>}
  </div>
);

export const MiniBarChart = ({ data, color, height=60 }: { data:number[]; color:string; height?:number }) => {
  const max = Math.max(...data, 1);
  const w = 100 / data.length;
  return (
    <svg width="100%" height={height} style={{ overflow:"visible" }}>
      {data.map((v,i) => {
        const h = (v/max)*(height-8);
        return (
          <g key={i}>
            <rect x={`${i*w+w*0.1}%`} y={height-h} width={`${w*0.8}%`} height={h} fill={color} rx={3} opacity={0.85}/>
          </g>
        );
      })}
    </svg>
  );
};

export const SectionEmpty = ({ icon, title, desc }: { icon:string; title:string; desc:string }) => (
  <div style={{ textAlign:"center",padding:"52px 24px",background:"white",borderRadius:12,border:"1px solid #e2e8f0" }}>
    <div style={{ fontSize:44,marginBottom:12 }}>{icon}</div>
    <div style={{ fontSize:15,fontWeight:700,color:"#374151",marginBottom:6 }}>{title}</div>
    <div style={{ fontSize:13,color:"#94a3b8" }}>{desc}</div>
  </div>
);
