export function Th({ h }: { h: string }) {
  return (
    <th style={{
      textAlign: "left", padding: "12px 16px",
      fontSize: 11, fontWeight: 600, color: "#64748b",
      textTransform: "uppercase", letterSpacing: "0.08em",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      whiteSpace: "nowrap",
    }}>
      {h}
    </th>
  );
}