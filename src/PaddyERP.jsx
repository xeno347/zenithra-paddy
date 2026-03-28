import { useState, useEffect, useRef } from "react";

// ── Recharts ────────────────────────────────────────────────────────────────
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";

// ════════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ════════════════════════════════════════════════════════════════════════════
const C = {
  primary:   "#5B4CDB",   // rich violet (like H-care purple)
  primary2:  "#7B6EF6",
  accent:    "#00C896",   // green accent
  gold:      "#F5A623",
  red:       "#F45B69",
  bg:        "#F4F6FB",
  white:     "#FFFFFF",
  sidebar:   "#FFFFFF",
  text:      "#1A1D2E",
  muted:     "#8B90A7",
  border:    "#E8EAF2",
  cardSh:    "0 2px 16px rgba(91,76,219,0.08)",
};

const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'DM Sans',sans-serif;background:${C.bg};color:${C.text}}
  input,select,textarea{font-family:'DM Sans',sans-serif}
  ::-webkit-scrollbar{width:4px;height:4px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:#D0D3E8;border-radius:4px}
  @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
  .fade-up{animation:fadeUp .4s ease both}
  .fade-up-1{animation:fadeUp .4s .08s ease both}
  .fade-up-2{animation:fadeUp .4s .16s ease both}
  .fade-up-3{animation:fadeUp .4s .24s ease both}
  .fade-up-4{animation:fadeUp .4s .32s ease both}
`;

// ════════════════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════════════════
function genCreds(name) {
  const slug = (name || "paddy").toLowerCase().replace(/\s+/g, "").slice(0, 8);
  const id   = slug + Math.floor(1000 + Math.random() * 9000);
  const pass = "Paddy@" + Math.floor(100 + Math.random() * 900);
  return { id, pass };
}

function Badge({ color = C.primary, bg, children, style }) {
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:4,
      background: bg || color + "18",
      color,
      fontSize:11, fontWeight:600, padding:"3px 9px",
      borderRadius:20, letterSpacing:.2, ...style
    }}>{children}</span>
  );
}

function Card({ children, style, className }) {
  return (
    <div className={className} style={{
      background: C.white, borderRadius:16,
      boxShadow: C.cardSh, padding:20, ...style
    }}>{children}</div>
  );
}

function StatCard({ icon, label, value, color, sub, className }) {
  return (
    <Card className={className} style={{ display:"flex", alignItems:"center", gap:14 }}>
      <div style={{
        width:52, height:52, borderRadius:14,
        background: color + "18",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:22, flexShrink:0
      }}>{icon}</div>
      <div>
        <div style={{ fontSize:22, fontWeight:700, color: C.text }}>{value}</div>
        <div style={{ fontSize:12, color: C.muted, marginTop:2 }}>{label}</div>
        {sub && <div style={{ fontSize:11, color, marginTop:2, fontWeight:600 }}>{sub}</div>}
      </div>
      <div style={{ marginLeft:"auto", color: C.muted, fontSize:18, cursor:"pointer" }}>···</div>
    </Card>
  );
}

function Input({ label, type="text", placeholder, value, onChange, style, options, required }) {
  const s = {
    width:"100%", padding:"10px 13px", borderRadius:9,
    border: `1.5px solid ${C.border}`, fontSize:13,
    outline:"none", background:"#FAFBFF", color: C.text,
    transition:"border .2s",
  };
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5, ...style }}>
      <label style={{ fontSize:12, fontWeight:600, color: C.muted }}>{label}{required && <span style={{color:C.red}}> *</span>}</label>
      {type === "select" ? (
        <select value={value} onChange={e=>onChange(e.target.value)}
          style={s} onFocus={e=>e.target.style.borderColor=C.primary}
          onBlur={e=>e.target.style.borderColor=C.border}>
          <option value="">Select…</option>
          {options.map(o=><option key={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} placeholder={placeholder} value={value}
          onChange={e=>onChange(e.target.value)} style={s}
          onFocus={e=>e.target.style.borderColor=C.primary}
          onBlur={e=>e.target.style.borderColor=C.border}
        />
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PORTAL 1 — ONBOARDING
// ════════════════════════════════════════════════════════════════════════════
function StepIndicator({ current, total }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:0, marginBottom:32 }}>
      {Array.from({length:total}).map((_,i) => (
        <div key={i} style={{ display:"flex", alignItems:"center" }}>
          <div style={{
            width:32, height:32, borderRadius:"50%",
            background: i < current ? C.primary : i === current ? C.primary : C.border,
            color: i <= current ? "#fff" : C.muted,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:13, fontWeight:700,
            boxShadow: i === current ? `0 0 0 4px ${C.primary}28` : "none",
            transition:"all .3s",
          }}>{i < current ? "✓" : i+1}</div>
          {i < total-1 && <div style={{
            width:48, height:2,
            background: i < current ? C.primary : C.border,
            transition:"background .3s",
          }} />}
        </div>
      ))}
    </div>
  );
}

const STEP_LABELS = [
  "Way of Working", "Area of Collection", "Capacity",
  "Collection Window", "Equipment", "OPEX Budget"
];

function OnboardPortal({ onSubmit }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    // Step 0
    companyName:"", operationType:"Mechanical harvesting", shiftSchedule:"Single shift (8h)", workingDays:"6",
    // Step 1
    zone:"", district:"Durg", state:"Chhattisgarh", gps:"21.1900, 81.2849",
    totalArea:"", plots:"", variety:"Swarna (MTU 7029)",
    // Step 2
    yieldPerAcre:"", totalTarget:"", dailyCapacity:"", storageCapacity:"",
    // Step 3
    sowingDate:"", harvestStart:"", harvestEnd:"", cycleNumber:"1",
    // Step 4
    equipment:[{type:"Combine harvester", model:"", capacity:"", qty:"1"}],
    // Step 5
    seedCost:"", fertCost:"", labourSow:"", labourHarvest:"",
    machineryFuel:"", transport:"", irrigation:"", misc:"",
  });
  const [submitted, setSubmitted] = useState(false);
  const [creds, setCreds] = useState(null);

  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const setEq = (i,k,v) => setForm(f=>{
    const eq=[...f.equipment]; eq[i]={...eq[i],[k]:v}; return {...f,equipment:eq};
  });
  const addEq = () => setForm(f=>({...f,equipment:[...f.equipment,{type:"Tractor",model:"",capacity:"",qty:"1"}]}));
  const rmEq  = (i) => setForm(f=>({...f,equipment:f.equipment.filter((_,j)=>j!==i)}));

  const totalOPEX = ["seedCost","fertCost","labourSow","labourHarvest","machineryFuel","transport","irrigation","misc"]
    .reduce((s,k)=>(s + (parseFloat(form[k])||0)), 0);

  function handleSubmit() {
    const c = genCreds(form.companyName || "PaddyOps");
    setCreds(c);
    setSubmitted(true);
    localStorage.setItem("paddyERP_creds", JSON.stringify(c));
    localStorage.setItem("paddyERP_form", JSON.stringify({...form, totalOPEX}));
  }

  if (submitted && creds) return (
    <div style={{
      minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      background:`linear-gradient(135deg, ${C.primary} 0%, #8B7FFF 100%)`,
    }}>
      <Card style={{ maxWidth:480, width:"100%", textAlign:"center", padding:40 }} className="fade-up">
        <div style={{ fontSize:56, marginBottom:16 }}>🎉</div>
        <h2 style={{ fontSize:24, fontWeight:700, marginBottom:8 }}>Portal Activated!</h2>
        <p style={{ color:C.muted, marginBottom:28, fontSize:14 }}>Your paddy operations portal is ready. Use the credentials below to log in.</p>
        <div style={{ background:C.bg, borderRadius:12, padding:20, marginBottom:24 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
            <span style={{ fontSize:12, color:C.muted }}>Login ID</span>
            <span style={{ fontFamily:"'DM Mono',monospace", fontWeight:600, color:C.primary, fontSize:14 }}>{creds.id}</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between" }}>
            <span style={{ fontSize:12, color:C.muted }}>Password</span>
            <span style={{ fontFamily:"'DM Mono',monospace", fontWeight:600, color:C.primary, fontSize:14 }}>{creds.pass}</span>
          </div>
        </div>
        <button onClick={()=>onSubmit(form, creds, totalOPEX)} style={{
          background:C.primary, color:"#fff", border:"none",
          borderRadius:10, padding:"13px 32px", fontSize:14, fontWeight:700,
          cursor:"pointer", width:"100%",
          boxShadow:`0 4px 20px ${C.primary}44`,
        }}>Go to Login Portal →</button>
      </Card>
    </div>
  );

  const inputRow = (children) => (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>{children}</div>
  );

  const stepContent = [
    // Step 0 — Way of Working
    <div key={0}>
      <p style={{ fontSize:13, color:C.muted, marginBottom:20 }}>Tell us how your paddy operation runs day-to-day.</p>
      {inputRow(<>
        <Input label="Company / Project Name" required value={form.companyName} onChange={v=>set("companyName",v)} placeholder="e.g. Sai Agro Durg" />
        <Input label="Operation Type" type="select" value={form.operationType} onChange={v=>set("operationType",v)}
          options={["Mechanical harvesting","Manual harvesting","Semi-mechanical","Direct seeded rice (DSR)"]} />
      </>)}
      {inputRow(<>
        <Input label="Shift Schedule" type="select" value={form.shiftSchedule} onChange={v=>set("shiftSchedule",v)}
          options={["Single shift (8h)","Double shift (16h)","24/7 continuous"]} />
        <Input label="Working Days / Week" type="number" value={form.workingDays} onChange={v=>set("workingDays",v)} placeholder="6" />
      </>)}
      {inputRow(<>
        <Input label="Labour Type" type="select" value={form.labourType||""} onChange={v=>set("labourType",v)}
          options={["Contract labour","Own farm labour","Mixed"]} />
        <Input label="Irrigation Type" type="select" value={form.irrigationType||""} onChange={v=>set("irrigationType",v)}
          options={["Canal / flood irrigation","Borewell / drip","Rain-fed"]} />
      </>)}
    </div>,

    // Step 1 — Area of Collection
    <div key={1}>
      <p style={{ fontSize:13, color:C.muted, marginBottom:20 }}>Define the geographic scope of your paddy collection area.</p>
      {inputRow(<>
        <Input label="Village / Zone Name" required value={form.zone} onChange={v=>set("zone",v)} placeholder="e.g. Durg Block North" />
        <Input label="District" value={form.district} onChange={v=>set("district",v)} placeholder="Durg" />
      </>)}
      {inputRow(<>
        <Input label="State" value={form.state} onChange={v=>set("state",v)} placeholder="Chhattisgarh" />
        <Input label="GPS Coordinates (lat, lng)" value={form.gps} onChange={v=>set("gps",v)} placeholder="21.1900, 81.2849" />
      </>)}
      {inputRow(<>
        <Input label="Total Area (acres)" required type="number" value={form.totalArea} onChange={v=>set("totalArea",v)} placeholder="200" />
        <Input label="Number of Plots / Khasra" type="number" value={form.plots} onChange={v=>set("plots",v)} placeholder="12" />
      </>)}
      <div style={{ marginBottom:14 }}>
        <Input label="Paddy Variety" type="select" value={form.variety} onChange={v=>set("variety",v)}
          options={["Swarna (MTU 7029)","MTU 1010","IR-64","Dubraj (GI)","DRR Dhan 45","Other"]} />
      </div>
    </div>,

    // Step 2 — Capacity
    <div key={2}>
      <p style={{ fontSize:13, color:C.muted, marginBottom:20 }}>Set your production and storage capacity targets.</p>
      {inputRow(<>
        <Input label="Expected Yield (qtl/acre)" required type="number" value={form.yieldPerAcre} onChange={v=>set("yieldPerAcre",v)} placeholder="18" />
        <Input label="Total Target Output (tonnes)" required type="number" value={form.totalTarget} onChange={v=>set("totalTarget",v)} placeholder="1200" />
      </>)}
      {inputRow(<>
        <Input label="Daily Harvest Capacity (acres/day)" type="number" value={form.dailyCapacity} onChange={v=>set("dailyCapacity",v)} placeholder="10" />
        <Input label="Storage Capacity (tonnes)" type="number" value={form.storageCapacity} onChange={v=>set("storageCapacity",v)} placeholder="300" />
      </>)}
    </div>,

    // Step 3 — Collection Window
    <div key={3}>
      <p style={{ fontSize:13, color:C.muted, marginBottom:20 }}>Set your crop calendar for this cycle.</p>
      {inputRow(<>
        <Input label="Sowing Date" required type="date" value={form.sowingDate} onChange={v=>set("sowingDate",v)} />
        <Input label="Harvest Start Date" required type="date" value={form.harvestStart} onChange={v=>set("harvestStart",v)} />
      </>)}
      {inputRow(<>
        <Input label="Harvest End Date" type="date" value={form.harvestEnd} onChange={v=>set("harvestEnd",v)} />
        <Input label="Cut / Cycle Number" type="number" value={form.cycleNumber} onChange={v=>set("cycleNumber",v)} placeholder="1" />
      </>)}
    </div>,

    // Step 4 — Equipment
    <div key={4}>
      <p style={{ fontSize:13, color:C.muted, marginBottom:20 }}>Register all machinery and equipment for this project.</p>
      {form.equipment.map((eq,i)=>(
        <div key={i} style={{
          display:"grid", gridTemplateColumns:"1.5fr 1.5fr 1fr 0.7fr 32px",
          gap:10, marginBottom:10, alignItems:"end",
        }}>
          <Input label={i===0?"Type":""} type="select" value={eq.type} onChange={v=>setEq(i,"type",v)}
            options={["Combine harvester","Thresher","Tractor","Reaper","Dryer","Weighbridge","Transport truck","Other"]} />
          <Input label={i===0?"Model / ID":""} value={eq.model} onChange={v=>setEq(i,"model",v)} placeholder="e.g. JD W70" />
          <Input label={i===0?"Capacity (qtl/hr)":""} type="number" value={eq.capacity} onChange={v=>setEq(i,"capacity",v)} placeholder="40" />
          <Input label={i===0?"Qty":""} type="number" value={eq.qty} onChange={v=>setEq(i,"qty",v)} placeholder="1" />
          <button onClick={()=>rmEq(i)} style={{
            marginTop: i===0?20:0, border:"none", background:C.red+"18",
            color:C.red, borderRadius:8, width:32, height:36,
            cursor:"pointer", fontSize:16, flexShrink:0,
          }}>×</button>
        </div>
      ))}
      <button onClick={addEq} style={{
        background:"none", border:`1.5px dashed ${C.primary}`,
        color:C.primary, borderRadius:9, padding:"8px 16px",
        fontSize:12, fontWeight:600, cursor:"pointer", marginTop:4,
      }}>+ Add equipment row</button>
    </div>,

    // Step 5 — OPEX
    <div key={5}>
      <p style={{ fontSize:13, color:C.muted, marginBottom:20 }}>Enter your projected costs for this cut / cycle (₹).</p>
      {inputRow(<>
        <Input label="Seed Cost (₹)" type="number" value={form.seedCost} onChange={v=>set("seedCost",v)} placeholder="45,000" />
        <Input label="Fertiliser & Pesticide (₹)" type="number" value={form.fertCost} onChange={v=>set("fertCost",v)} placeholder="1,20,000" />
      </>)}
      {inputRow(<>
        <Input label="Labour — Sowing (₹)" type="number" value={form.labourSow} onChange={v=>set("labourSow",v)} placeholder="80,000" />
        <Input label="Labour — Harvesting (₹)" type="number" value={form.labourHarvest} onChange={v=>set("labourHarvest",v)} placeholder="1,50,000" />
      </>)}
      {inputRow(<>
        <Input label="Machinery / Fuel (₹)" type="number" value={form.machineryFuel} onChange={v=>set("machineryFuel",v)} placeholder="90,000" />
        <Input label="Transport & Storage (₹)" type="number" value={form.transport} onChange={v=>set("transport",v)} placeholder="60,000" />
      </>)}
      {inputRow(<>
        <Input label="Irrigation Cost (₹)" type="number" value={form.irrigation} onChange={v=>set("irrigation",v)} placeholder="40,000" />
        <Input label="Misc / Overhead (₹)" type="number" value={form.misc} onChange={v=>set("misc",v)} placeholder="25,000" />
      </>)}
      <div style={{
        background:`linear-gradient(135deg,${C.primary}12,${C.accent}10)`,
        borderRadius:12, padding:16, marginTop:8,
        border:`1.5px solid ${C.primary}22`,
      }}>
        <div style={{ fontSize:12, color:C.muted }}>Total Project OPEX (auto-calculated)</div>
        <div style={{ fontSize:24, fontWeight:700, color:C.primary, marginTop:4 }}>
          ₹{totalOPEX.toLocaleString("en-IN")}
        </div>
      </div>
    </div>,
  ];

  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex" }}>
      {/* Left panel */}
      <div style={{
        width:320, background:`linear-gradient(160deg,${C.primary} 0%,#8B7FFF 100%)`,
        color:"#fff", padding:40, display:"flex", flexDirection:"column", flexShrink:0,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:48 }}>
          <div style={{ fontSize:28 }}>🌾</div>
          <div>
            <div style={{ fontSize:18, fontWeight:700 }}>PaddyERP</div>
            <div style={{ fontSize:11, opacity:.7 }}>Operations Platform</div>
          </div>
        </div>
        <div style={{ flex:1 }}>
          {STEP_LABELS.map((l,i)=>(
            <div key={i} style={{
              display:"flex", alignItems:"center", gap:12, marginBottom:20,
              opacity: i === step ? 1 : i < step ? .9 : .45,
            }}>
              <div style={{
                width:28, height:28, borderRadius:"50%",
                background: i < step ? C.accent : i === step ? "#fff" : "rgba(255,255,255,0.2)",
                color: i < step ? "#fff" : i === step ? C.primary : "#fff",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:12, fontWeight:700, flexShrink:0,
              }}>{i < step ? "✓" : i+1}</div>
              <div>
                <div style={{ fontSize:13, fontWeight: i===step?700:500 }}>{l}</div>
                {i === step && <div style={{ fontSize:11, opacity:.75, marginTop:1 }}>Current step</div>}
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize:11, opacity:.6, marginTop:20 }}>
          All data stays local — no backend required.
        </div>
      </div>

      {/* Right content */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:40 }}>
        <div style={{ maxWidth:640, width:"100%" }} className="fade-up">
          <div style={{ marginBottom:28 }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.primary, letterSpacing:.8, marginBottom:6, textTransform:"uppercase" }}>
              Step {step+1} of {STEP_LABELS.length}
            </div>
            <h2 style={{ fontSize:26, fontWeight:700, marginBottom:4 }}>{STEP_LABELS[step]}</h2>
          </div>

          <Card style={{ padding:28, marginBottom:24 }}>
            {stepContent[step]}
          </Card>

          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <button onClick={()=>setStep(s=>Math.max(0,s-1))} disabled={step===0} style={{
              background:"none", border:`1.5px solid ${C.border}`,
              borderRadius:10, padding:"11px 24px", fontSize:13, fontWeight:600,
              cursor: step===0 ? "not-allowed" : "pointer", color: step===0 ? C.muted : C.text,
            }}>← Back</button>

            {step < STEP_LABELS.length-1 ? (
              <button onClick={()=>setStep(s=>s+1)} style={{
                background:C.primary, color:"#fff", border:"none",
                borderRadius:10, padding:"11px 28px", fontSize:13, fontWeight:700,
                cursor:"pointer", boxShadow:`0 4px 20px ${C.primary}44`,
              }}>Continue →</button>
            ) : (
              <button onClick={handleSubmit} style={{
                background:`linear-gradient(135deg,${C.primary},${C.accent})`,
                color:"#fff", border:"none", borderRadius:10,
                padding:"11px 28px", fontSize:13, fontWeight:700,
                cursor:"pointer", boxShadow:`0 4px 20px ${C.primary}44`,
              }}>Submit & Activate Portal 🚀</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PORTAL 2 — LOGIN
// ════════════════════════════════════════════════════════════════════════════
function LoginPortal({ savedCreds, onLogin }) {
  const [id, setId]     = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr]   = useState("");
  const [show, setShow] = useState(false);

  function handleLogin() {
    if (!savedCreds) { setErr("No account found. Complete onboarding first."); return; }
    if (id === savedCreds.id && pass === savedCreds.pass) { onLogin(); }
    else { setErr("Invalid credentials. Check your login ID and password."); }
  }

  return (
    <div style={{
      minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      background:`linear-gradient(135deg,#F4F6FB 0%,#EBE8FF 100%)`,
    }}>
      <div style={{ display:"flex", gap:60, alignItems:"center", maxWidth:880, width:"100%", padding:24 }}>
        {/* Left brand */}
        <div style={{ flex:1 }} className="fade-up">
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:32 }}>
            <div style={{
              width:48, height:48, borderRadius:14,
              background:C.primary, display:"flex", alignItems:"center",
              justifyContent:"center", fontSize:24,
            }}>🌾</div>
            <div>
              <div style={{ fontSize:22, fontWeight:700, color:C.text }}>PaddyERP</div>
              <div style={{ fontSize:12, color:C.muted }}>Operations Portal</div>
            </div>
          </div>
          <h1 style={{ fontSize:36, fontWeight:700, lineHeight:1.25, color:C.text, marginBottom:16 }}>
            Your paddy ops,<br /><span style={{ color:C.primary }}>fully in control.</span>
          </h1>
          <p style={{ fontSize:14, color:C.muted, lineHeight:1.7 }}>
            Log in to access your personalised dashboard — OPEX tracking, harvest analytics, tonnage graphs, and field mapping, all configured from your onboarding data.
          </p>
          <div style={{ display:"flex", gap:12, marginTop:24 }}>
            {["🌱 Harvest Tracking","📊 OPEX Analytics","🗺 Field Mapping"].map(t=>(
              <Badge key={t} color={C.primary} style={{ fontSize:11 }}>{t}</Badge>
            ))}
          </div>
        </div>

        {/* Right login card */}
        <Card style={{ width:360, padding:32, flexShrink:0 }} className="fade-up-1">
          <h2 style={{ fontSize:20, fontWeight:700, marginBottom:4 }}>Welcome back</h2>
          <p style={{ fontSize:13, color:C.muted, marginBottom:24 }}>Enter the credentials from your onboarding</p>

          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:12, fontWeight:600, color:C.muted, display:"block", marginBottom:5 }}>Login ID</label>
            <input value={id} onChange={e=>setId(e.target.value)}
              placeholder="Your generated login ID"
              style={{
                width:"100%", padding:"11px 13px", borderRadius:9, fontSize:13,
                border:`1.5px solid ${C.border}`, outline:"none", background:"#FAFBFF",
              }}
              onFocus={e=>e.target.style.borderColor=C.primary}
              onBlur={e=>e.target.style.borderColor=C.border}
              onKeyDown={e=>e.key==="Enter"&&handleLogin()}
            />
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={{ fontSize:12, fontWeight:600, color:C.muted, display:"block", marginBottom:5 }}>Password</label>
            <div style={{ position:"relative" }}>
              <input value={pass} onChange={e=>setPass(e.target.value)}
                type={show?"text":"password"} placeholder="Your generated password"
                style={{
                  width:"100%", padding:"11px 40px 11px 13px", borderRadius:9, fontSize:13,
                  border:`1.5px solid ${C.border}`, outline:"none", background:"#FAFBFF",
                }}
                onFocus={e=>e.target.style.borderColor=C.primary}
                onBlur={e=>e.target.style.borderColor=C.border}
                onKeyDown={e=>e.key==="Enter"&&handleLogin()}
              />
              <span onClick={()=>setShow(s=>!s)} style={{
                position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
                cursor:"pointer", fontSize:16, color:C.muted,
              }}>{show?"🙈":"👁"}</span>
            </div>
          </div>

          {err && <div style={{
            background:C.red+"15", color:C.red,
            borderRadius:8, padding:"9px 12px", fontSize:12, fontWeight:600, marginBottom:14,
          }}>{err}</div>}

          {savedCreds && (
            <div style={{
              background:C.primary+"10", borderRadius:9, padding:"10px 12px",
              marginBottom:16, fontSize:12,
            }}>
              <span style={{ color:C.muted }}>ID: </span>
              <span style={{ fontFamily:"'DM Mono',monospace", color:C.primary, fontWeight:600 }}>{savedCreds.id}</span>
              <span style={{ color:C.muted, marginLeft:12 }}>Pass: </span>
              <span style={{ fontFamily:"'DM Mono',monospace", color:C.primary, fontWeight:600 }}>{savedCreds.pass}</span>
            </div>
          )}

          <button onClick={handleLogin} style={{
            width:"100%", background:C.primary, color:"#fff", border:"none",
            borderRadius:10, padding:"13px", fontSize:14, fontWeight:700,
            cursor:"pointer", boxShadow:`0 4px 20px ${C.primary}44`,
          }}>Log In →</button>

          <p style={{ textAlign:"center", marginTop:16, fontSize:12, color:C.muted }}>
            Don't have credentials?{" "}
            <span onClick={()=>window.location.reload()} style={{ color:C.primary, fontWeight:600, cursor:"pointer" }}>
              Go to onboarding
            </span>
          </p>
        </Card>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PORTAL 3 — DASHBOARD
// ════════════════════════════════════════════════════════════════════════════

// Tooltip for charts
const CustomTooltip = ({ active, payload, label, unit="" }) => {
  if (active && payload?.length) return (
    <div style={{
      background:"#1A1D2E", color:"#fff", borderRadius:10,
      padding:"8px 14px", fontSize:12, boxShadow:"0 4px 20px rgba(0,0,0,0.2)",
    }}>
      <div style={{ fontWeight:700, marginBottom:4 }}>{label}</div>
      {payload.map((p,i)=>(
        <div key={i} style={{ color:p.color, marginBottom:2 }}>
          {p.name}: <b>{p.value}{unit}</b>
        </div>
      ))}
    </div>
  );
  return null;
};

// Generate mock daily data based on form
function genDailyData(form) {
  const daily = parseFloat(form.dailyCapacity)||10;
  const yieldPer = parseFloat(form.yieldPerAcre)||18;
  const expected = Math.round(daily * yieldPer);
  return Array.from({length:30},(_,i)=>({
    day: `D${i+1}`,
    expected,
    actual: Math.round(expected * (0.82 + Math.random()*0.28)),
  }));
}

function genOPEXData(form) {
  return [
    { name:"Seed", budget:+(form.seedCost)||45000, spent:Math.round((+(form.seedCost)||45000)*0.92) },
    { name:"Fertiliser", budget:+(form.fertCost)||120000, spent:Math.round((+(form.fertCost)||120000)*0.78) },
    { name:"Labour-S", budget:+(form.labourSow)||80000, spent:Math.round((+(form.labourSow)||80000)*0.96) },
    { name:"Labour-H", budget:+(form.labourHarvest)||150000, spent:Math.round((+(form.labourHarvest)||150000)*0.68) },
    { name:"Machinery", budget:+(form.machineryFuel)||90000, spent:Math.round((+(form.machineryFuel)||90000)*0.85) },
    { name:"Transport", budget:+(form.transport)||60000, spent:Math.round((+(form.transport)||60000)*0.61) },
    { name:"Irrigation", budget:+(form.irrigation)||40000, spent:Math.round((+(form.irrigation)||40000)*0.44) },
    { name:"Misc", budget:+(form.misc)||25000, spent:Math.round((+(form.misc)||25000)*0.50) },
  ];
}

// Mini donut-like progress ring
function Ring({ pct, size=80, stroke=8, color=C.primary, label }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct/100) * circ;
  return (
    <div style={{ position:"relative", width:size, height:size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`} />
      </svg>
      <div style={{
        position:"absolute", inset:0, display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
      }}>
        <div style={{ fontSize:16, fontWeight:700, color: C.text }}>{pct}%</div>
        {label && <div style={{ fontSize:9, color:C.muted, marginTop:1 }}>{label}</div>}
      </div>
    </div>
  );
}

// Map component (SVG-based schematic map of Chhattisgarh area)
function SchematicMap({ form }) {
  const plots = parseInt(form.plots)||4;
  const pts = Array.from({length:Math.min(plots,8)},(_,i)=>({
    x: 60 + (i%4)*80 + Math.random()*30,
    y: 60 + Math.floor(i/4)*80 + Math.random()*30,
    label:`Plot ${i+1}`,
    active: i < Math.ceil(plots*0.6),
  }));
  return (
    <div style={{ position:"relative", height:220, borderRadius:12, overflow:"hidden", background:"#EBF5F0" }}>
      <svg width="100%" height="100%" viewBox="0 0 400 220" style={{ position:"absolute" }}>
        {/* road grid */}
        {[60,140,220].map(y=><line key={y} x1={0} y1={y} x2={400} y2={y} stroke="#C8E6D9" strokeWidth={1} strokeDasharray="6 4"/>)}
        {[80,160,240,320].map(x=><line key={x} x1={x} y1={0} x2={x} y2={220} stroke="#C8E6D9" strokeWidth={1} strokeDasharray="6 4"/>)}
        {/* region shade */}
        <rect x={30} y={30} width={340} height={160} rx={12} fill={C.accent+"14"} stroke={C.accent} strokeWidth={1.5} strokeDasharray="8 4"/>
        {/* plots */}
        {pts.map((p,i)=>(
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={14} fill={p.active?C.primary+"22":C.gold+"22"}
              stroke={p.active?C.primary:C.gold} strokeWidth={2}/>
            <circle cx={p.x} cy={p.y} r={5} fill={p.active?C.primary:C.gold}/>
            <text x={p.x} y={p.y+24} textAnchor="middle" fontSize={9} fill={C.muted}>{p.label}</text>
          </g>
        ))}
        {/* origin label */}
        <rect x={12} y={8} width={90} height={18} rx={5} fill={C.primary}/>
        <text x={57} y={20} textAnchor="middle" fontSize={10} fill="#fff" fontWeight="700">
          {form.district||"Durg"}, {form.state||"CG"}
        </text>
      </svg>
      <div style={{
        position:"absolute", bottom:10, right:10,
        background:"#fff", borderRadius:8, padding:"6px 10px", fontSize:10, color:C.muted,
      }}>
        <span style={{ marginRight:10 }}><span style={{ color:C.primary, fontWeight:700 }}>●</span> Active</span>
        <span><span style={{ color:C.gold, fontWeight:700 }}>●</span> Pending</span>
      </div>
    </div>
  );
}

function Dashboard({ form, totalOPEX, onLogout }) {
  const dailyData  = useRef(genDailyData(form)).current;
  const opexData   = useRef(genOPEXData(form)).current;
  const [now]      = useState(new Date());

  const harvested    = dailyData.slice(0,20).reduce((s,d)=>s+d.actual,0);
  const target       = parseFloat(form.totalTarget)||1200;
  const cycleProgress= Math.min(100, Math.round((harvested/(target*10))*100));
  const totalBudget  = totalOPEX || opexData.reduce((s,d)=>s+d.budget,0);
  const totalSpent   = opexData.reduce((s,d)=>s+d.spent,0);
  const opexPct      = Math.round((totalSpent/totalBudget)*100);
  const todayAct     = dailyData[19]?.actual || 0;
  const todayExp     = dailyData[19]?.expected || 0;
  const onTrack      = opexPct < 90 && todayAct >= todayExp * 0.9;

  const mspFloor = 2100;
  const mspReal  = 2183;

  // Trend line last 10 days
  const trendData = dailyData.slice(20).map((d,i)=>({...d, day:`D${21+i}`}));

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:C.bg }}>
      {/* Sidebar */}
      <aside style={{
        width:240, background:C.white, borderRight:`1px solid ${C.border}`,
        display:"flex", flexDirection:"column", position:"fixed",
        top:0, left:0, bottom:0, zIndex:100,
        boxShadow:"2px 0 20px rgba(91,76,219,0.06)",
      }}>
        <div style={{
          padding:"24px 20px 20px", borderBottom:`1px solid ${C.border}`,
          display:"flex", alignItems:"center", gap:10,
        }}>
          <div style={{
            width:38, height:38, borderRadius:11, background:C.primary,
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:20,
          }}>🌾</div>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:C.text }}>PaddyERP</div>
            <div style={{ fontSize:11, color:C.muted }}>{form.companyName||"Ops Portal"}</div>
          </div>
        </div>

        <nav style={{ padding:"16px 12px", flex:1 }}>
          {/* Only Dashboard tab as requested */}
          <div style={{
            display:"flex", alignItems:"center", gap:10,
            padding:"10px 12px", borderRadius:10,
            background:`linear-gradient(135deg,${C.primary},${C.primary2})`,
            color:"#fff", fontWeight:600, fontSize:13, cursor:"pointer",
            boxShadow:`0 4px 14px ${C.primary}44`,
          }}>
            <span style={{ fontSize:17 }}>◉</span> Dashboard
          </div>
        </nav>

        {/* User card at bottom */}
        <div style={{
          padding:"16px", borderTop:`1px solid ${C.border}`,
          display:"flex", alignItems:"center", gap:10,
        }}>
          <div style={{
            width:34, height:34, borderRadius:"50%",
            background:`linear-gradient(135deg,${C.primary},${C.accent})`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:14, color:"#fff", fontWeight:700, flexShrink:0,
          }}>{(form.companyName||"P")[0].toUpperCase()}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:12, fontWeight:600, color:C.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
              {form.companyName||"Paddy Ops"}
            </div>
            <div style={{ fontSize:11, color:C.muted }}>Admin</div>
          </div>
          <button onClick={onLogout} style={{
            background:"none", border:"none", cursor:"pointer",
            fontSize:16, color:C.muted, padding:4,
          }} title="Logout">⏻</button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ marginLeft:240, flex:1, display:"flex", flexDirection:"column" }}>
        {/* Topbar */}
        <div style={{
          background:C.white, borderBottom:`1px solid ${C.border}`,
          padding:"14px 28px", display:"flex", alignItems:"center", gap:14,
          position:"sticky", top:0, zIndex:50,
          boxShadow:"0 2px 12px rgba(91,76,219,0.05)",
        }}>
          <div style={{
            flex:1, display:"flex", alignItems:"center", gap:10,
            background:C.bg, borderRadius:9, padding:"9px 14px", maxWidth:320,
          }}>
            <span style={{ fontSize:14, color:C.muted }}>🔍</span>
            <input placeholder="Search…" style={{
              border:"none", background:"none", outline:"none",
              fontSize:13, color:C.text, width:"100%",
            }}/>
          </div>
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:16 }}>
            <div style={{
              fontSize:12, color:C.muted, background:C.bg,
              padding:"6px 12px", borderRadius:8,
            }}>
              {form.variety||"Swarna"} · Cycle {form.cycleNumber||1}
            </div>
            <Badge color={onTrack?C.accent:C.gold}>
              {onTrack?"✓ On Track":"⚠ Watch"}
            </Badge>
            <div style={{
              width:34, height:34, borderRadius:"50%",
              background:`linear-gradient(135deg,${C.primary},${C.accent})`,
              display:"flex", alignItems:"center", justifyContent:"center",
              color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer",
            }}>{(form.companyName||"P")[0]}</div>
            <div style={{ fontSize:13, fontWeight:600, color:C.text }}>
              {form.companyName||"Admin"} ∨
            </div>
          </div>
        </div>

        {/* Dashboard content */}
        <div style={{ padding:28 }}>
          {/* Stat cards */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:22 }} className="fade-up">
            <StatCard icon="🌾" label="Total Procured (MTD)" value={`${harvested.toLocaleString("en-IN")} qtl`} color={C.primary} sub={`${cycleProgress}% of target`} />
            <StatCard icon="📅" label="Today's Harvest" value={`${todayAct} qtl`} color={C.accent} sub={todayAct>=todayExp?"On target":"Below target"} />
            <StatCard icon="₹" label="OPEX Spent" value={`₹${(totalSpent/100000).toFixed(2)}L`} color={C.gold} sub={`${opexPct}% of ₹${(totalBudget/100000).toFixed(2)}L`} />
            <StatCard icon="📐" label="Total Area" value={`${form.totalArea||"—"} ac`} color={C.red} sub={`${form.plots||"—"} plots registered`} />
          </div>

          {/* Row 2 */}
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:16, marginBottom:16 }} className="fade-up-1">
            {/* Expected vs Actual bar chart */}
            <Card>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                <div style={{ fontSize:14, fontWeight:700 }}>Expected vs Actual Tonnage</div>
                <div style={{ display:"flex", gap:12 }}>
                  <Badge color={C.primary}>Expected</Badge>
                  <Badge color={C.accent}>Actual</Badge>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dailyData.slice(10,20)} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
                  <XAxis dataKey="day" tick={{ fontSize:10, fill:C.muted }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize:10, fill:C.muted }} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CustomTooltip unit=" qtl"/>}/>
                  <Bar dataKey="expected" name="Expected" fill={C.primary+"55"} radius={[4,4,0,0]}/>
                  <Bar dataKey="actual" name="Actual" fill={C.accent} radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* OPEX health */}
            <Card>
              <div style={{ fontSize:14, fontWeight:700, marginBottom:16 }}>OPEX Health</div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                <Ring pct={opexPct} color={opexPct>90?C.red:opexPct>75?C.gold:C.accent} label="used"/>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:11, color:C.muted }}>Budget</div>
                  <div style={{ fontSize:16, fontWeight:700, color:C.text }}>₹{(totalBudget/100000).toFixed(2)}L</div>
                  <div style={{ fontSize:11, color:C.muted, marginTop:8 }}>Spent</div>
                  <div style={{ fontSize:16, fontWeight:700, color:C.primary }}>₹{(totalSpent/100000).toFixed(2)}L</div>
                </div>
              </div>
              {/* Is OPEX systematic? */}
              <div style={{
                background: onTrack ? C.accent+"15" : C.gold+"15",
                borderRadius:10, padding:12,
                border:`1px solid ${onTrack?C.accent:C.gold}33`,
              }}>
                <div style={{ fontSize:12, fontWeight:700, color: onTrack?C.accent:C.gold, marginBottom:4 }}>
                  {onTrack?"✓ Working Systematically":"⚠ Review Recommended"}
                </div>
                <div style={{ fontSize:11, color:C.muted, lineHeight:1.5 }}>
                  {onTrack
                    ? "All cost heads are within budget. Daily harvest is on target."
                    : "Some cost categories are nearing their limits. Monitor closely."}
                </div>
              </div>
            </Card>
          </div>

          {/* Row 3 — Line chart + Donut + Map */}
          <div style={{ display:"grid", gridTemplateColumns:"1.4fr 0.9fr 1.2fr", gap:16, marginBottom:16 }} className="fade-up-2">
            {/* Per-day tonnage line */}
            <Card>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                <div style={{ fontSize:14, fontWeight:700 }}>Per-Day Tonnage Trend</div>
                <Badge color={C.muted} bg={C.border}>30-day cycle</Badge>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="tGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.primary} stopOpacity={0.25}/>
                      <stop offset="95%" stopColor={C.primary} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
                  <XAxis dataKey="day" tick={{ fontSize:9, fill:C.muted }} axisLine={false} tickLine={false} interval={4}/>
                  <YAxis tick={{ fontSize:9, fill:C.muted }} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CustomTooltip unit=" qtl"/>}/>
                  <Area type="monotone" dataKey="actual" name="Actual" stroke={C.primary} strokeWidth={2.5} fill="url(#tGrad)" dot={false}/>
                  <Line type="monotone" dataKey="expected" name="Expected" stroke={C.gold} strokeWidth={1.5} strokeDasharray="5 3" dot={false}/>
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Donut — cycle split */}
            <Card style={{ display:"flex", flexDirection:"column" }}>
              <div style={{ fontSize:14, fontWeight:700, marginBottom:16 }}>Cycle Progress</div>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flex:1, justifyContent:"center" }}>
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={[
                      {name:"Done",value:cycleProgress},
                      {name:"Left",value:100-cycleProgress},
                    ]} cx="50%" cy="50%" innerRadius={50} outerRadius={72} dataKey="value" startAngle={90} endAngle={-270}>
                      <Cell fill={C.primary}/>
                      <Cell fill={C.border}/>
                    </Pie>
                    <Tooltip/>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ fontSize:28, fontWeight:700, color:C.primary, marginTop:-8 }}>{cycleProgress}%</div>
                <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>Harvested</div>
              </div>
              <div style={{
                display:"flex", justifyContent:"space-between",
                marginTop:12, paddingTop:12, borderTop:`1px solid ${C.border}`,
              }}>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:14, fontWeight:700, color:C.text }}>{harvested.toLocaleString("en-IN")}</div>
                  <div style={{ fontSize:10, color:C.muted }}>qtl done</div>
                </div>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:14, fontWeight:700, color:C.text }}>{Math.max(0,target*10-harvested).toLocaleString("en-IN")}</div>
                  <div style={{ fontSize:10, color:C.muted }}>qtl left</div>
                </div>
              </div>
            </Card>

            {/* MSP card */}
            <Card>
              <div style={{ fontSize:14, fontWeight:700, marginBottom:14 }}>MSP Realisation</div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:16 }}>
                <div>
                  <div style={{ fontSize:11, color:C.muted }}>Your avg rate</div>
                  <div style={{ fontSize:28, fontWeight:700, color:C.primary }}>₹{mspReal}/qtl</div>
                </div>
                <Badge color={C.accent}>+₹{mspReal-mspFloor} above MSP</Badge>
              </div>
              <div style={{ marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}>
                  <span style={{ color:C.muted }}>MSP Floor (Govt.)</span>
                  <span style={{ fontWeight:600 }}>₹{mspFloor}/qtl</span>
                </div>
                <div style={{ height:6, borderRadius:4, background:C.border }}>
                  <div style={{ width:"100%", height:"100%", borderRadius:4, background:C.border }}/>
                </div>
              </div>
              <div style={{ marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}>
                  <span style={{ color:C.muted }}>Market rate</span>
                  <span style={{ fontWeight:600, color:C.accent }}>₹{mspReal}/qtl</span>
                </div>
                <div style={{ height:6, borderRadius:4, background:C.border, overflow:"hidden" }}>
                  <div style={{ width:`${Math.round((mspReal/2500)*100)}%`, height:"100%", borderRadius:4, background:C.accent }}/>
                </div>
              </div>
              <div style={{ marginTop:12, fontSize:12, color:C.muted, lineHeight:1.6 }}>
                Variety: <b style={{ color:C.text }}>{form.variety||"Swarna"}</b><br/>
                District mandi: <b style={{ color:C.text }}>{form.district||"Durg"}</b>
              </div>
            </Card>
          </div>

          {/* Row 4 — Field map + OPEX bar + Activity */}
          <div style={{ display:"grid", gridTemplateColumns:"1.5fr 1fr", gap:16, marginBottom:16 }} className="fade-up-3">
            {/* Field mapping */}
            <Card>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                <div style={{ fontSize:14, fontWeight:700 }}>Field Mapping</div>
                <Badge color={C.primary}>{form.zone||"Durg North"}</Badge>
              </div>
              <SchematicMap form={form}/>
              <div style={{
                display:"flex", gap:20, marginTop:12,
                paddingTop:12, borderTop:`1px solid ${C.border}`,
              }}>
                <div><div style={{ fontSize:16, fontWeight:700 }}>{form.totalArea||"—"}</div><div style={{ fontSize:11, color:C.muted }}>Total acres</div></div>
                <div><div style={{ fontSize:16, fontWeight:700 }}>{form.plots||"—"}</div><div style={{ fontSize:11, color:C.muted }}>Plots</div></div>
                <div><div style={{ fontSize:16, fontWeight:700 }}>{form.gps||"—"}</div><div style={{ fontSize:11, color:C.muted }}>GPS centroid</div></div>
              </div>
            </Card>

            {/* OPEX breakdown */}
            <Card>
              <div style={{ fontSize:14, fontWeight:700, marginBottom:14 }}>OPEX Breakdown</div>
              {opexData.map((d,i)=>{
                const pct = Math.round((d.spent/d.budget)*100);
                const col = pct>92?C.red:pct>80?C.gold:C.accent;
                return (
                  <div key={i} style={{ marginBottom:10 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, marginBottom:3 }}>
                      <span style={{ color:C.muted }}>{d.name}</span>
                      <span style={{ fontWeight:600, color:col }}>{pct}%</span>
                    </div>
                    <div style={{ height:5, borderRadius:3, background:C.border, overflow:"hidden" }}>
                      <div style={{ width:`${Math.min(100,pct)}%`, height:"100%", borderRadius:3, background:col, transition:"width .6s ease" }}/>
                    </div>
                  </div>
                );
              })}
            </Card>
          </div>

          {/* Row 5 — Activity + Equipment summary */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }} className="fade-up-4">
            <Card>
              <div style={{ fontSize:14, fontWeight:700, marginBottom:14 }}>Recent Activity</div>
              {[
                {dot:C.accent, text:"Combine H-02 completed Plot 7B", time:"1h ago"},
                {dot:C.gold,   text:`Weighbridge entry: 24 qtl @ ₹${mspReal}`, time:"3h ago"},
                {dot:C.accent, text:`${todayAct} qtl harvested today — log closed`, time:"5h ago"},
                {dot:C.red,    text:"Thresher T-01 flagged — belt failure", time:"1d ago"},
                {dot:C.accent, text:"Lot #87 dispatched to mandi", time:"1d ago"},
              ].map((a,i)=>(
                <div key={i} style={{
                  display:"flex", alignItems:"center", gap:10,
                  padding:"9px 0", borderBottom:i<4?`1px solid ${C.border}`:"none",
                }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:a.dot, flexShrink:0 }}/>
                  <div style={{ flex:1, fontSize:12.5, color:C.text }}>{a.text}</div>
                  <div style={{ fontSize:11, color:C.muted, whiteSpace:"nowrap" }}>{a.time}</div>
                </div>
              ))}
            </Card>

            <Card>
              <div style={{ fontSize:14, fontWeight:700, marginBottom:14 }}>Equipment Summary</div>
              {form.equipment.map((eq,i)=>(
                <div key={i} style={{
                  display:"flex", alignItems:"center", gap:12,
                  padding:"9px 0", borderBottom:i<form.equipment.length-1?`1px solid ${C.border}`:"none",
                }}>
                  <div style={{
                    width:34, height:34, borderRadius:9,
                    background:C.primary+"15", display:"flex",
                    alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0,
                  }}>🚜</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600 }}>{eq.model||eq.type}</div>
                    <div style={{ fontSize:11, color:C.muted }}>{eq.type} · {eq.capacity||"—"} qtl/hr</div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:3 }}>
                    <Badge color={C.accent}>Qty: {eq.qty||1}</Badge>
                  </div>
                </div>
              ))}
              {(!form.equipment || form.equipment.length===0) && (
                <div style={{ color:C.muted, fontSize:13, textAlign:"center", padding:"20px 0" }}>No equipment registered.</div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [screen, setScreen] = useState("onboard"); // onboard | login | dashboard
  const [formData, setFormData]   = useState(null);
  const [savedCreds, setSavedCreds] = useState(null);
  const [totalOPEX, setTotalOPEX] = useState(0);

  // On mount, check if creds already exist
  useEffect(()=>{
    try {
      const c = JSON.parse(localStorage.getItem("paddyERP_creds")||"null");
      const f = JSON.parse(localStorage.getItem("paddyERP_form")||"null");
      if (c) { setSavedCreds(c); setFormData(f); setScreen("login"); }
    } catch {}
  },[]);

  function handleOnboardSubmit(form, creds, opex) {
    setFormData(form);
    setSavedCreds(creds);
    setTotalOPEX(opex);
    setScreen("login");
  }

  function handleLogin() {
    const f = formData || JSON.parse(localStorage.getItem("paddyERP_form")||"{}");
    setFormData(f);
    setTotalOPEX(f.totalOPEX||0);
    setScreen("dashboard");
  }

  function handleLogout() {
    setScreen("login");
  }

  function handleReset() {
    localStorage.removeItem("paddyERP_creds");
    localStorage.removeItem("paddyERP_form");
    setSavedCreds(null); setFormData(null);
    setScreen("onboard");
  }

  return (
    <>
      <style>{globalStyle}</style>
      {screen === "onboard" && (
        <OnboardPortal onSubmit={handleOnboardSubmit}/>
      )}
      {screen === "login" && (
        <LoginPortal savedCreds={savedCreds} onLogin={handleLogin}/>
      )}
      {screen === "dashboard" && formData && (
        <Dashboard form={formData} totalOPEX={totalOPEX} onLogout={handleLogout}/>
      )}
    </>
  );
}
