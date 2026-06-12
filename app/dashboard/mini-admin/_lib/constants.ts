export const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export const tok = () => {
  const adminUser = localStorage.getItem("super_admin_user");
  if (adminUser) return localStorage.getItem("super_admin_token") || "";
  const user = localStorage.getItem("user");
  if (user) {
    try {
      const parsed = JSON.parse(user);
      if (["admin", "sub_admin", "super_admin"].includes(parsed.role)) {
        return localStorage.getItem("token") || "";
      }
    } catch {}
  }
  return "";
};

export const authH = () => ({ Authorization: `Bearer ${tok()}` });
export const jsonH = () => ({ "Content-Type": "application/json", ...authH() });

export const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  approved: { label: "Зөвшөөрсөн", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  pending: { label: "Хүлээгдэж", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  active: { label: "Идэвхтэй", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  inactive: { label: "Идэвхгүй", color: "#94a3b8", bg: "rgba(148,163,184,0.1)" },
  returned: { label: "Буцаагдсан", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
};