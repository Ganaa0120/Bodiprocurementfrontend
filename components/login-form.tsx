"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  User,
  Building2,
} from "lucide-react";

type Tab = "super_admin" | "individual" | "organization";

const TABS = [
  { key: "super_admin", label: "Супер Админ", icon: ShieldCheck },
  { key: "individual", label: "Хувь хүн", icon: User },
  { key: "organization", label: "Байгуулга", icon: Building2 },
] as const;

// API endpoints per role
const LOGIN_ENDPOINTS: Record<Tab, string> = {
  super_admin: "/api/super-admins/login",
  individual: "/api/individuals/login",
  organization: "/api/organizations/login",
};

// Dashboard redirect per role
const DASHBOARDS: Record<Tab, string> = {
  super_admin: "/dashboard/admin",
  individual: "/dashboard/individual",
  organization: "/dashboard/organization",
};

export function LoginForm() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("super_admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = (tab: Tab) => {
    setActiveTab(tab);
    setEmail("");
    setPassword("");
    setError("");
    setShowPw(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) return setError("И-мэйл хаягаа оруулна уу");
    if (!password.trim()) return setError("Нууц үгээ оруулна уу");

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${LOGIN_ENDPOINTS[activeTab]}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Нэвтрэх үед алдаа гарлаа");
        return;
      }

      // Store token + user info
      localStorage.setItem(`${activeTab}_token`, data.token);
      localStorage.setItem(
        `${activeTab}_user`,
        JSON.stringify(data.admin ?? data.user),
      );

      router.push(DASHBOARDS[activeTab]);
    } catch {
      setError("Серверт холбогдох боломжгүй байна");
    } finally {
      setLoading(false);
    }
  };

  const placeholders: Record<Tab, { email: string; pw: string }> = {
    super_admin: { email: "admin@bodigroup.mn", pw: "••••••••" },
    individual: { email: "user@mail.mn", pw: "••••••••" },
    organization: { email: "info@company.mn", pw: "••••••••" },
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Heading */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Нэвтрэх</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Эрхийн төрлөө сонгоод нэвтэрнэ үү
        </p>
      </div>

      {/* Tabs */}
      <div
        className="flex rounded-xl p-1 gap-1"
        style={{
          background: "rgba(199,210,254,0.18)",
          border: "1px solid rgba(199,210,254,0.5)",
        }}
      >
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => reset(key)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all duration-200",
              activeTab === key
                ? "text-white shadow-sm"
                : "text-neutral-500 hover:text-neutral-700",
            )}
            style={
              activeTab === key
                ? {
                    background: "linear-gradient(135deg, #0C72BA, #1e90d6)",
                    boxShadow: "0 2px 8px rgba(12,114,186,0.35)",
                  }
                : {}
            }
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{label.split(" ")[0]}</span>
          </button>
        ))}
      </div>

      {/* Role badge */}
      <div className="flex items-center gap-2">
        {(() => {
          const tab = TABS.find((t) => t.key === activeTab)!;
          const Icon = tab.icon;
          return (
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
              style={{
                background: "rgba(12,114,186,0.08)",
                color: "#0C72BA",
                border: "1px solid rgba(12,114,186,0.15)",
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label} эрхээр нэвтэрч байна
            </span>
          );
        })()}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email" className="text-sm font-medium">
            И-мэйл хаяг
          </Label>
          <Input
            id="email"
            type="email"
            placeholder={placeholders[activeTab].email}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            autoComplete="email"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password" className="text-sm font-medium">
            Нууц үг
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPw ? "text" : "password"}
              placeholder={placeholders[activeTab].pw}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              className="pr-10"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPw ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="group/btn relative h-10 w-full rounded-md font-medium text-white transition-all duration-300 hover:opacity-90 disabled:opacity-70 mt-1"
          style={{
            background: "linear-gradient(135deg, #0C72BA 0%, #1e90d6 100%)",
            boxShadow: "0 4px 15px rgba(12,114,186,0.28)",
          }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Нэвтэрч байна...
            </span>
          ) : (
            "Нэвтрэх →"
          )}
        </button>

        {/* Register link — not for super admin */}
        {activeTab !== "super_admin" && (
          <p className="text-center text-xs text-muted-foreground">
            Бүртгэл үгүй юу?{" "}
            <a
              href={
                activeTab === "individual"
                  ? "/register/person"
                  : "/register/organization"
              }
              className="text-[#0C72BA] font-medium hover:underline"
            >
              Бүртгүүлэх
            </a>
          </p>
        )}
      </form>
    </div>
  );
}
