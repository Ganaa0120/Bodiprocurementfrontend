export const STATUS_CFG: Record<
  string,
  { label: string; color: string; bg: string; dot: string }
> = {
  approved: {
    label: "Зөвшөөрсөн",
    color: "#34d399",
    bg: "rgba(52,211,153,0.1)",
    dot: "#34d399",
  },
  pending: {
    label: "Хүлээгдэж",
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.1)",
    dot: "#fbbf24",
  },
  rejected: {
    label: "Татгалзсан",
    color: "#f87171",
    bg: "rgba(248,113,113,0.1)",
    dot: "#f87171",
  },
  active: {
    label: "Идэвхтэй",
    color: "#34d399",
    bg: "rgba(52,211,153,0.1)",
    dot: "#34d399",
  },
  inactive: {
    label: "Идэвхгүй",
    color: "#64748b",
    bg: "rgba(100,116,139,0.1)",
    dot: "#64748b",
  },
  returned: {
    label: "Буцаагдсан",
    color: "#fb923c",
    bg: "rgba(251,146,60,0.1)",
    dot: "#fb923c",
  },
};

export function Badge({ status }: { status: string }) {
  const c = STATUS_CFG[status] ?? STATUS_CFG.pending;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 99,
        background: c.bg,
        fontSize: 11,
        fontWeight: 600,
        color: c.color,
        border: `1px solid ${c.color}22`,
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: c.dot,
          boxShadow: `0 0 6px ${c.dot}`,
        }}
      />
      {c.label}
    </span>
  );
}

export function Th({ h }: { h: string }) {
  return (
    <th
      style={{
        textAlign: "left",
        padding: "10px 16px",
        fontSize: 10,
        fontWeight: 700,
        color: "rgba(148,163,184,0.6)",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        whiteSpace: "nowrap",
        background: "rgba(15,22,41,0.8)",
      }}
    >
      {h}
    </th>
  );
}
