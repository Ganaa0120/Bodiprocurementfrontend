import { STATUS_CFG } from "../_lib/constants";

export function Badge({ s }: { s: string }) {
  const c = STATUS_CFG[s] ?? STATUS_CFG.pending;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 12px", borderRadius: 30, background: c.bg,
      fontSize: 11, fontWeight: 600, color: c.color,
      border: `1px solid ${c.color}20`,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%", background: c.color,
      }} />
      {c.label}
    </span>
  );
}