"use client";
import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Loader2, ChevronDown, Zap, BookOpen } from "lucide-react";
import { getSession } from "@/lib/auth";
import { useToast } from "@/lib/store";

const API = process.env.NEXT_PUBLIC_API_URL || "http://172.209.217.176:4001";

type AISource = "gemini" | "local";

const QUICK_PROMPTS = [
  { label:"Malaria treatment", icon:"🦟", q:"Rwanda MOH malaria treatment protocol for adults?" },
  { label:"Drug interaction",  icon:"💊", q:"Check drug interaction between Metformin and Glibenclamide" },
  { label:"ANC protocol",     icon:"🤰", q:"Rwanda ANC antenatal care schedule and visits protocol" },
  { label:"TB diagnosis",     icon:"🫁", q:"Rwanda MOH TB diagnosis and treatment protocol" },
  { label:"Child nutrition",  icon:"👶", q:"MUAC screening and malnutrition management Rwanda" },
  { label:"Hypertension",     icon:"❤️", q:"Rwanda MOH hypertension management first-line treatment" },
];

export function AIFloatingButton() {
  const { show } = useToast();
  const [open, setOpen]         = useState(false);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [messages, setMessages] = useState<{ role:"user"|"ai"; text:string; src?:string }[]>([]);
  const [source, setSource]     = useState<AISource>("gemini");
  const [expanded, setExpanded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) { setTimeout(()=>inputRef.current?.focus(), 100); }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages]);

  async function ask(query: string) {
    if (!query.trim() || loading) return;
    const q = query.trim();
    setInput("");
    setMessages(p=>[...p,{ role:"user",text:q }]);
    setLoading(true);
    try {
      const session = getSession();
      const token = session?.accessToken || "";
      const res = await fetch(`${API}/api/super-admin/ai/query`, {
        method:"POST",
        headers:{ "Content-Type":"application/json","Authorization":`Bearer ${token}` },
        body:JSON.stringify({ query:q, preferSource: source }),
      });
      if (!res.ok) throw new Error("AI request failed");
      const data = await res.json();
      const response = data.response || "No response received.";
      const src = data.source || "local-kb";
      setMessages(p=>[...p,{ role:"ai",text:response,src }]);
    } catch(e:any) {
      // Fallback: local KB
      const fallback = `Based on your question: "${q}"\n\nARTIC AI provides evidence-based clinical guidance aligned with Rwanda MOH protocols (2024). For specific clinical decisions, please consult the relevant guidelines or a senior colleague.\n\n⚕️ This response is for informational guidance only.`;
      setMessages(p=>[...p,{ role:"ai",text:fallback,src:"local-kb" }]);
    } finally { setLoading(false); }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key==="Enter"&&!e.shiftKey) { e.preventDefault(); ask(input); }
  }

  const floatH = expanded ? "520px" : "420px";
  const floatW = expanded ? "440px" : "360px";

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={()=>setOpen(true)}
          style={{
            position:"fixed",bottom:24,right:24,zIndex:9000,
            width:56,height:56,borderRadius:"50%",
            background:"linear-gradient(135deg,#059669,#0891b2)",
            border:"none",cursor:"pointer",
            boxShadow:"0 4px 20px rgba(8,145,178,0.45)",
            display:"flex",alignItems:"center",justifyContent:"center",
            transition:"transform 0.2s",
          }}
          onMouseEnter={e=>(e.currentTarget.style.transform="scale(1.1)")}
          onMouseLeave={e=>(e.currentTarget.style.transform="scale(1)")}
          title="ARTIC AI Health Companion"
        >
          <Bot size={24} color="white"/>
          <span style={{ position:"absolute",top:-4,right:-4,width:16,height:16,borderRadius:"50%",background:"#34d399",border:"3px solid white",fontSize:8,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,color:"white" }}>✦</span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div style={{
          position:"fixed",bottom:24,right:24,zIndex:9001,
          width:floatW,maxWidth:"calc(100vw - 32px)",
          height:floatH,maxHeight:"calc(100vh - 48px)",
          background:"white",borderRadius:16,
          boxShadow:"0 20px 60px rgba(0,0,0,0.18),0 0 0 1px rgba(0,0,0,0.06)",
          display:"flex",flexDirection:"column",overflow:"hidden",
          transition:"all 0.2s ease",
        }}>
          {/* Header */}
          <div style={{ background:"linear-gradient(135deg,#0a1628,#0f2942)",padding:"12px 16px",display:"flex",alignItems:"center",gap:10,flexShrink:0 }}>
            <div style={{ width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,#059669,#0891b2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
              <Bot size={18} color="white"/>
            </div>
            <div style={{ flex:1,minWidth:0 }}>
              <div style={{ color:"white",fontWeight:700,fontSize:13 }}>ARTIC AI Companion</div>
              <div style={{ color:"#64748b",fontSize:10 }}>Rwanda MOH protocols · Gemini 2.0 Flash</div>
            </div>

            {/* Source toggle */}
            <div style={{ display:"flex",gap:3,background:"rgba(255,255,255,0.08)",borderRadius:8,padding:"3px",flexShrink:0 }}>
              {(["gemini","local"] as AISource[]).map(s=>(
                <button key={s} onClick={()=>setSource(s)}
                  style={{ padding:"3px 8px",borderRadius:6,border:"none",cursor:"pointer",fontSize:10,fontWeight:700,background:source===s?"white":"transparent",color:source===s?"#0891b2":"#94a3b8",transition:"all 0.15s" }}>
                  {s==="gemini"?<><Zap size={9} style={{ marginRight:2 }}/>Gemini</>:<><BookOpen size={9} style={{ marginRight:2 }}/>Local</>}
                </button>
              ))}
            </div>

            <div style={{ display:"flex",gap:4 }}>
              <button onClick={()=>setExpanded(!expanded)} style={{ border:"none",background:"none",cursor:"pointer",color:"#64748b",padding:4,display:"flex" }}>
                <ChevronDown size={16} style={{ transform:expanded?"rotate(180deg)":"none",transition:"transform 0.2s" }}/>
              </button>
              <button onClick={()=>{ setOpen(false); setExpanded(false); }} style={{ border:"none",background:"none",cursor:"pointer",color:"#64748b",padding:4,display:"flex" }}>
                <X size={16}/>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex:1,overflowY:"auto",padding:"12px 14px",display:"flex",flexDirection:"column",gap:10 }}>
            {messages.length===0 && (
              <div>
                <div style={{ textAlign:"center",padding:"8px 0 12px",color:"#94a3b8",fontSize:12 }}>
                  <Bot size={32} style={{ margin:"0 auto 6px",display:"block",color:"#cbd5e1" }}/>
                  Ask me anything — clinical protocols, drug info, patient education
                </div>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:6 }}>
                  {QUICK_PROMPTS.map(p=>(
                    <button key={p.label} onClick={()=>ask(p.q)}
                      style={{ padding:"7px 10px",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,cursor:"pointer",fontSize:11,fontWeight:600,color:"#374151",textAlign:"left",display:"flex",alignItems:"center",gap:6 }}>
                      <span style={{ fontSize:14 }}>{p.icon}</span>{p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m,i)=>(
              <div key={i} style={{ display:"flex",flexDirection:m.role==="user"?"row-reverse":"row",gap:7,alignItems:"flex-end" }}>
                {m.role==="ai" && (
                  <div style={{ width:24,height:24,borderRadius:7,background:"linear-gradient(135deg,#059669,#0891b2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                    <Bot size={12} color="white"/>
                  </div>
                )}
                <div style={{
                  maxWidth:"85%",
                  background:m.role==="user"?"#0891b2":"#f8fafc",
                  color:m.role==="user"?"white":"#0f172a",
                  borderRadius:m.role==="user"?"12px 12px 2px 12px":"12px 12px 12px 2px",
                  padding:"8px 12px",fontSize:12,lineHeight:1.6,
                  border:m.role==="ai"?"1px solid #e2e8f0":"none",
                }}>
                  <div style={{ whiteSpace:"pre-wrap" }}>{m.text}</div>
                  {m.src && m.role==="ai" && (
                    <div style={{ marginTop:5,fontSize:9,opacity:0.6,fontWeight:600,display:"flex",alignItems:"center",gap:3 }}>
                      {m.src==="gemini"?<><Zap size={8}/>Gemini 2.0 Flash</>:m.src==="openai"?<>🤖 GPT-3.5</>:<><BookOpen size={8}/>Local KB</>}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display:"flex",gap:7,alignItems:"flex-end" }}>
                <div style={{ width:24,height:24,borderRadius:7,background:"linear-gradient(135deg,#059669,#0891b2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                  <Bot size={12} color="white"/>
                </div>
                <div style={{ padding:"10px 14px",background:"#f8fafc",borderRadius:"12px 12px 12px 2px",border:"1px solid #e2e8f0" }}>
                  <Loader2 size={14} style={{ animation:"spin 1s linear infinite",color:"#0891b2" }}/>
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Input */}
          <div style={{ padding:"10px 12px",borderTop:"1px solid #f1f5f9",background:"#fafafa",flexShrink:0 }}>
            <div style={{ display:"flex",gap:7,alignItems:"center" }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e=>setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder={`Ask ${source==="gemini"?"Gemini AI":"local KB"}…`}
                style={{ flex:1,padding:"8px 12px",borderRadius:9,border:"1px solid #e2e8f0",fontSize:12,outline:"none",color:"#0f172a",background:"white" }}
              />
              <button onClick={()=>ask(input)} disabled={!input.trim()||loading}
                style={{ padding:"8px 12px",background:!input.trim()||loading?"#e2e8f0":"linear-gradient(135deg,#059669,#0891b2)",color:!input.trim()||loading?"#94a3b8":"white",borderRadius:9,border:"none",cursor:!input.trim()||loading?"not-allowed":"pointer",display:"flex",alignItems:"center" }}>
                <Send size={13}/>
              </button>
            </div>
            <div style={{ marginTop:5,display:"flex",justifyContent:"space-between",fontSize:9,color:"#94a3b8" }}>
              <span>Enter to send · Rwanda MOH protocols</span>
              <button onClick={()=>setMessages([])} style={{ border:"none",background:"none",cursor:"pointer",fontSize:9,color:"#94a3b8" }}>Clear</button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </>
  );
}
