// Procurement portal-ийн одоогийн dark navy өнгөний системтэй нийцүүлсэн
export const C = {
  bg: "#0a1120",
  panel: "#0d1526",
  panel2: "#111c33",
  raised: "#16223d",
  border: "rgba(255,255,255,0.07)",
  borderStrong: "rgba(255,255,255,0.12)",
  text: "rgba(255,255,255,0.92)",
  text2: "rgba(255,255,255,0.72)",
  muted: "rgba(148,163,184,0.7)",
  faint: "rgba(148,163,184,0.42)",
  blue: "#3b82f6",
  blueHover: "#2563eb",
  blueText: "#60a5fa",
  blueSoft: "rgba(59,130,246,0.12)",
  bubbleOther: "#1a2642",
  red: "#f87171",
  redSoft: "rgba(239,68,68,0.12)",
  green: "#22c55e",
  amber: "#fbbf24",
  amberSoft: "rgba(245,158,11,0.12)",
};

export const FONT =
  '"Inter", "Segoe UI", system-ui, -apple-system, "Noto Sans", "Helvetica Neue", Arial, sans-serif';

export const CHAT_CSS = `
.bc-root, .bc-root * { box-sizing: border-box; }
.bc-root { font-family: ${FONT}; color: ${C.text}; -webkit-font-smoothing: antialiased; }
.bc-root button { font-family: inherit; }
.bc-root :focus-visible { outline: 2px solid ${C.blueText}; outline-offset: 2px; border-radius: 6px; }
.bc-scroll { scrollbar-width: thin; scrollbar-color: rgba(148,163,184,0.25) transparent; }
.bc-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
.bc-scroll::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.22); border-radius: 8px; }
.bc-scroll::-webkit-scrollbar-track { background: transparent; }
.bc-conv-item:hover { background: rgba(255,255,255,0.035); }
.bc-conv-item[data-active="true"] { background: ${C.blueSoft}; }
.bc-icon-btn:hover:not(:disabled) { background: rgba(255,255,255,0.07); color: ${C.text}; }
.bc-icon-btn:disabled { opacity: .4; cursor: default; }
.bc-row .bc-actions { opacity: 0; pointer-events: none; transition: opacity .12s; }
.bc-row:hover .bc-actions, .bc-row[data-open="true"] .bc-actions { opacity: 1; pointer-events: auto; }
@media (hover: none) { .bc-row .bc-actions { display: none; } .bc-row[data-open="true"] .bc-actions { display: flex; opacity: 1; pointer-events: auto; } }
.bc-menu-item:hover { background: rgba(255,255,255,0.06); }
.bc-pick:hover { background: rgba(255,255,255,0.04); }
.bc-link { color: inherit; text-decoration: underline; text-underline-offset: 2px; word-break: break-all; }
.bc-input::placeholder { color: ${C.faint}; }
.bc-dot { width: 6px; height: 6px; border-radius: 50%; background: ${C.muted}; display: inline-block; animation: bc-bounce 1.2s infinite ease-in-out; }
.bc-dot:nth-child(2) { animation-delay: .15s; } .bc-dot:nth-child(3) { animation-delay: .3s; }
@keyframes bc-bounce { 0%, 60%, 100% { transform: translateY(0); opacity: .5; } 30% { transform: translateY(-4px); opacity: 1; } }
@keyframes bc-spin { to { transform: rotate(360deg); } }
.bc-spin { animation: bc-spin .9s linear infinite; }
@keyframes bc-flash { 0% { background: ${C.amberSoft}; } 100% { background: transparent; } }
.bc-flash { animation: bc-flash 1.6s ease-out; }
@media (prefers-reduced-motion: reduce) { .bc-dot, .bc-spin, .bc-flash { animation: none; } }
`;
