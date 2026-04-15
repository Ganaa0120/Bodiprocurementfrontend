"use client";
import { Users, Building2, ShieldCheck, Bell, Clock, UserCheck, Activity, ArrowUpRight, RefreshCw, Eye, Search, TrendingUp } from "lucide-react";
import { Badge, Th } from "./Badge";

const MONTHLY = [
  {m:"1",i:28,c:12},{m:"2",i:35,c:18},{m:"3",i:42,c:22},{m:"4",i:38,c:25},
  {m:"5",i:55,c:30},{m:"6",i:60,c:35},{m:"7",i:48,c:28},{m:"8",i:70,c:42},
  {m:"9",i:65,c:38},{m:"10",i:80,c:50},{m:"11",i:90,c:58},{m:"12",i:95,c:62},
];

function MiniChart() {
  const mx = Math.max(...MONTHLY.map(d=>d.i+d.c));
  const W=580,H=140,PL=4,PB=18,PT=4,PR=4,cW=W-PL-PR,cH=H-PT-PB,bW=cW/MONTHLY.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", height:"100%" }}>
      <defs>
        <linearGradient id="gbi" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.5"/>
        </linearGradient>
        <linearGradient id="gbc" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#059669" stopOpacity="0.5"/>
        </linearGradient>
      </defs>
      {[0,40,80].map(v=>(
        <line key={v} x1={PL} x2={W-PR} y1={PT+cH-(v/mx)*cH} y2={PT+cH-(v/mx)*cH}
          stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="4,4"/>
      ))}
      {MONTHLY.map((d,i)=>{
        const x=PL+i*bW,iH=(d.i/mx)*cH,cH2=(d.c/mx)*cH,g=1.5,bw=(bW-g*3)/2;
        return (
          <g key={i}>
            <rect x={x+g} y={PT+cH-iH} width={bw} height={iH} rx="3" fill="url(#gbi)"/>
            <rect x={x+g*2+bw} y={PT+cH-cH2} width={bw} height={cH2} rx="3" fill="url(#gbc)"/>
            <text x={x+bW/2} y={H-3} textAnchor="middle" fontSize="7" fill="rgba(148,163,184,0.4)">{d.m}</text>
          </g>
        );
      })}
    </svg>
  );
}

function DonutChart({ data }: { data: any }) {
  const vals = [
    { v: data?.total_individuals||0, c:"#3b82f6" },
    { v: data?.total_companies||0,   c:"#34d399" },
    { v: data?.total_mini_admins||0, c:"#fbbf24" },
  ];
  const tot = vals.reduce((s,d)=>s+d.v,0)||1;
  let a=-90; const R=38,cx=50,cy=50;
  const arcs = vals.map(d=>{
    const deg=(d.v/tot)*360,r1=(a*Math.PI)/180,r2=((a+deg)*Math.PI)/180;
    const x1=cx+R*Math.cos(r1),y1=cy+R*Math.sin(r1),x2=cx+R*Math.cos(r2),y2=cy+R*Math.sin(r2);
    const path=`M${cx} ${cy} L${x1} ${y1} A${R} ${R} 0 ${deg>180?1:0} 1 ${x2} ${y2}Z`;
    a+=deg; return {...d,path};
  });
  return (
    <svg viewBox="0 0 100 100" style={{ width:100, height:100, flexShrink:0 }}>
      {arcs.map((a,i)=><path key={i} d={a.path} fill={a.c} stroke="#0d1526" strokeWidth="1.5"/>)}
      <circle cx={cx} cy={cy} r={24} fill="#0d1526"/>
      <text x={cx} y={cy-3} textAnchor="middle" fontSize="11" fontWeight="800" fill="rgba(255,255,255,0.9)">{tot}</text>
      <text x={cx} y={cy+9} textAnchor="middle" fontSize="6" fill="rgba(148,163,184,0.5)">нийт</text>
    </svg>
  );
}

type Props = { data: any; search: string; setSearch: (v:string)=>void; onDetail: (id:string)=>void };

export function DashboardTab({ data, search, setSearch, onDetail }: Props) {
  const s = data.dashStats;

  const STAT_CARDS = [
    { label:"Нийт хувь хүн",  value: s?.total_individuals ?? "—",  icon:Users,      color:"#3b82f6", glow:"rgba(59,130,246,0.15)"  },
    { label:"Компаниуд",       value: s?.total_companies   ?? "—",  icon:Building2,  color:"#34d399", glow:"rgba(52,211,153,0.15)"  },
    { label:"Мини админ",      value: s?.total_mini_admins ?? "—",  icon:ShieldCheck,color:"#a78bfa", glow:"rgba(167,139,250,0.15)" },
    { label:"Идэвхтэй зар",   value: s?.active_announcements??"—", icon:Bell,       color:"#fbbf24", glow:"rgba(251,191,36,0.15)"  },
  ];

  return (
    <div className="page-in" style={{ display:"flex", flexDirection:"column", gap:20 }}>

      {/* Stat cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
        {STAT_CARDS.map(({ label, value, icon:Icon, color, glow }) => (
          <div key={label} style={{ background:"#0d1526", border:"1px solid rgba(255,255,255,0.06)", borderRadius:18, padding:20, position:"relative", overflow:"hidden", transition:"all .2s", cursor:"default" }}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=`${color}33`;(e.currentTarget as HTMLElement).style.transform="translateY(-2px)";}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor="rgba(255,255,255,0.06)";(e.currentTarget as HTMLElement).style.transform="translateY(0)";}}>
            <div style={{ position:"absolute", top:-20, right:-20, width:80, height:80, borderRadius:"50%", background:glow, filter:"blur(20px)" }}/>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
              <div style={{ width:40, height:40, borderRadius:12, background:`${color}18`, display:"flex", alignItems:"center", justifyContent:"center", border:`1px solid ${color}22` }}>
                <Icon size={18} style={{ color }}/>
              </div>
              <TrendingUp size={13} style={{ color:"rgba(148,163,184,0.2)" }}/>
            </div>
            <div style={{ fontSize:26, fontWeight:800, color:"rgba(255,255,255,0.92)", lineHeight:1 }}>{value}</div>
            <div style={{ fontSize:11, color:"rgba(148,163,184,0.5)", marginTop:5 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:14 }}>
        <div style={{ background:"#0d1526", border:"1px solid rgba(255,255,255,0.06)", borderRadius:18, padding:"20px 20px 12px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div>
              <p style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.85)", margin:0 }}>Бүртгэлийн динамик</p>
              <p style={{ fontSize:11, color:"rgba(148,163,184,0.45)", margin:"3px 0 0" }}>2026 оны сараар</p>
            </div>
            <div style={{ display:"flex", gap:14 }}>
              {[{c:"#3b82f6",l:"Хувь хүн"},{c:"#34d399",l:"Компани"}].map(l=>(
                <div key={l.l} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"rgba(148,163,184,0.5)" }}>
                  <span style={{ width:8, height:8, borderRadius:2, background:l.c }}/>
                  {l.l}
                </div>
              ))}
            </div>
          </div>
          <div style={{ height:140 }}><MiniChart/></div>
        </div>

        <div style={{ background:"#0d1526", border:"1px solid rgba(255,255,255,0.06)", borderRadius:18, padding:20 }}>
          <p style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.85)", margin:"0 0 4px" }}>Хуваарилалт</p>
          <p style={{ fontSize:11, color:"rgba(148,163,184,0.45)", margin:"0 0 16px" }}>Одоогийн байдлаар</p>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <DonutChart data={s}/>
            <div style={{ display:"flex", flexDirection:"column", gap:9, flex:1 }}>
              {[
                { l:"Хувь хүн", v:s?.total_individuals||0, c:"#3b82f6" },
                { l:"Компани",  v:s?.total_companies||0,   c:"#34d399" },
                { l:"Админ",    v:s?.total_mini_admins||0, c:"#fbbf24" },
              ].map(d=>{
                const tot=(s?.total_individuals||0)+(s?.total_companies||0)+(s?.total_mini_admins||0)||1;
                return (
                  <div key={d.l}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                      <span style={{ fontSize:11, color:"rgba(148,163,184,0.5)", display:"flex", alignItems:"center", gap:5 }}>
                        <span style={{ width:5, height:5, borderRadius:"50%", background:d.c }}/>
                        {d.l}
                      </span>
                      <span style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.7)" }}>{d.v}</span>
                    </div>
                    <div style={{ height:3, borderRadius:99, background:"rgba(255,255,255,0.05)", overflow:"hidden" }}>
                      <div style={{ height:"100%", borderRadius:99, background:d.c, width:`${(d.v/tot)*100}%`, transition:"width .6s ease" }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recent + mini stats */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 260px", gap:14 }}>
        <div style={{ background:"#0d1526", border:"1px solid rgba(255,255,255,0.06)", borderRadius:18, overflow:"hidden" }}>
          <div style={{ padding:"16px 20px", borderBottom:"1px solid rgba(255,255,255,0.04)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <p style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.85)", margin:0 }}>Сүүлийн бүртгэлүүд</p>
              <p style={{ fontSize:11, color:"rgba(148,163,184,0.4)", margin:"2px 0 0" }}>Хувь хүний нийлүүлэгчид</p>
            </div>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <div style={{ position:"relative" }}>
                <Search size={12} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"rgba(148,163,184,0.35)" }}/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Хайх..." className="gi" style={{ width:130, height:34, fontSize:12 }}/>
              </div>
              <button onClick={data.fetchRecent} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:8, padding:"6px 8px", cursor:"pointer", display:"flex", color:"rgba(148,163,184,0.5)" }}>
                <RefreshCw size={12} style={{ animation:data.recentLoading?"spin 1s linear infinite":undefined }}/>
              </button>
            </div>
          </div>
          {data.recentLoading ? (
            <div style={{ display:"flex", justifyContent:"center", padding:32 }}>
              <div style={{ width:20, height:20, border:"2px solid rgba(59,130,246,0.3)", borderTopColor:"#3b82f6", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
            </div>
          ) : (
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead><tr><Th h="Нэр"/><Th h="Регистр"/><Th h="Статус"/><Th h="Огноо"/><Th h=""/></tr></thead>
              <tbody>
                {data.recentPersons.filter((r: any)=>{
                  const q=search.toLowerCase();
                  return !q||`${r.last_name??""} ${r.first_name??""} ${r.email}`.toLowerCase().includes(q);
                }).map((p: any,i: number)=>{
                  const nm=[p.last_name,p.first_name].filter(Boolean).join(" ")||p.email;
                  const colors=["#3b82f6","#34d399","#a78bfa","#fbbf24","#fb923c"];
                  const c=colors[i%colors.length];
                  return (
                    <tr key={p.id} className="tr" style={{ cursor:"pointer" }} onClick={()=>onDetail(p.id)}>
                      <td style={{ padding:"10px 16px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <div style={{ width:30, height:30, borderRadius:8, background:`${c}18`, border:`1px solid ${c}22`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:c, flexShrink:0 }}>
                            {(p.first_name?.[0]??p.email[0]).toUpperCase()}
                          </div>
                          <span style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.82)" }}>{nm}</span>
                        </div>
                      </td>
                      <td style={{ padding:"10px 16px", fontSize:11, fontFamily:"monospace", color:"rgba(148,163,184,0.45)" }}>{p.register_number||"—"}</td>
                      <td style={{ padding:"10px 16px" }}><Badge status={p.status}/></td>
                      <td style={{ padding:"10px 16px", fontSize:11, color:"rgba(148,163,184,0.4)" }}>{p.created_at?new Date(p.created_at).toLocaleDateString("mn-MN"):"—"}</td>
                      <td style={{ padding:"10px 16px" }}>
                        <button className="icon-btn" onClick={e=>{e.stopPropagation();onDetail(p.id);}}>
                          <Eye size={12} style={{ color:"rgba(96,165,250,0.7)" }}/>
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {data.recentPersons.length===0&&(
                  <tr><td colSpan={5} style={{ padding:"28px 16px", textAlign:"center", fontSize:12, color:"rgba(148,163,184,0.3)" }}>Бүртгэл байхгүй</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Mini stat cards */}
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {[
            { l:"Нийт",        v:data.recentPersons.length, icon:Users,    c:"#3b82f6" },
            { l:"Хүлээгдэж",  v:data.recentPersons.filter((x:any)=>x.status==="pending").length,  icon:Clock,    c:"#fbbf24" },
            { l:"Идэвхтэй",   v:data.recentPersons.filter((x:any)=>x.status==="active").length,   icon:UserCheck,c:"#34d399" },
            { l:"Буцаагдсан", v:data.recentPersons.filter((x:any)=>x.status==="returned").length, icon:Activity, c:"#f87171" },
          ].map(({ l,v,icon:Icon,c }) => (
            <div key={l} style={{ background:"#0d1526", border:"1px solid rgba(255,255,255,0.06)", borderRadius:14, padding:"13px 16px", display:"flex", alignItems:"center", gap:12, transition:"all .2s" }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=`${c}33`;}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor="rgba(255,255,255,0.06)";}}>
              <div style={{ width:34, height:34, borderRadius:10, background:`${c}12`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, border:`1px solid ${c}18` }}>
                <Icon size={15} style={{ color:c }}/>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:20, fontWeight:800, color:"rgba(255,255,255,0.88)", lineHeight:1 }}>{v}</div>
                <div style={{ fontSize:10, color:"rgba(148,163,184,0.45)", marginTop:3 }}>{l}</div>
              </div>
              <ArrowUpRight size={13} style={{ color:"rgba(148,163,184,0.15)" }}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}