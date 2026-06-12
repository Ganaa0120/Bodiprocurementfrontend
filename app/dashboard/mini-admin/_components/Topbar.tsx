export function Topbar({
  title, userName, ini, pendingCount,
}: {
  title: string;
  userName: string;
  ini: string;
  pendingCount: number;
}) {
  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 40,
      background: "rgba(10,14,26,0.85)", backdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      padding: "14px 32px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div>
        <h1 style={{
          fontSize: 20, fontWeight: 700, color: "white",
          margin: 0, letterSpacing: "-0.3px",
        }}>{title}</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
          Welcome back, {userName.split(" ")[0]}
        </p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {pendingCount > 0 && (
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "4px 12px", borderRadius: 30,
            background: "rgba(245,158,11,0.12)",
            border: "1px solid rgba(245,158,11,0.2)",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b" }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#f59e0b" }}>
              {pendingCount} хүлээгдэж буй
            </span>
          </div>
        )}
        <div style={{
          width: 38, height: 38, borderRadius: 14,
          background: "linear-gradient(145deg, #4f46e5, #7c3aed)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, fontWeight: 700, color: "white",
          boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
        }}>{ini}</div>
      </div>
    </div>
  );
}