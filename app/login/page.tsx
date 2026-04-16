"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    const N = 45;
    type P = { x: number; y: number; vx: number; vy: number; r: number };
    const pts: P[] = Array.from({ length: N }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2 + 1,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 150) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(12,114,186,${0.12 * (1 - d / 150)})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }
      pts.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(12,114,186,0.25)";
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return (
    <canvas
      ref={ref}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}

function Field({
  id,
  label,
  type,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const isPw = type === "password";
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-[11px] font-semibold tracking-widest uppercase transition-colors duration-200"
        style={{
          fontFamily: "Inter, sans-serif",
          color: focused ? "#0C72BA" : "rgba(30,40,60,0.45)",
        }}
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={isPw && showPw ? "text" : type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete={isPw ? "current-password" : "email"}
          className="w-full bg-white/60 rounded-xl px-4 py-3 text-sm outline-none transition-all duration-300 pr-10"
          style={{
            fontFamily: "Inter, sans-serif",
            color: "#1a2336",
            border: focused
              ? "1.5px solid #0C72BA"
              : "1.5px solid rgba(12,114,186,0.15)",
            boxShadow: focused
              ? "0 0 0 3px rgba(12,114,186,0.1), 0 2px 8px rgba(12,114,186,0.08)"
              : "0 1px 4px rgba(0,0,0,0.05)",
            backdropFilter: "blur(8px)",
          }}
        />
        {isPw && (
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: "rgba(30,40,60,0.3)" }}
          >
            {showPw ? (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeOpacity="0.25"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loadingMain, setLoadingMain] = useState(false);
  const [loadingInner, setLoadingInner] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 80);
  }, []);

  const isLoading = loadingMain || loadingInner;

  const validate = () => {
    if (!email.trim() || !password.trim()) {
      setError("И-мэйл болон нууц үгээ оруулна уу");
      return false;
    }
    setError("");
    return true;
  };

  // ── Нэвтрэх → нийлүүлэгч (хувь хүн → байгааллага) ──────────────
  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validate()) return;
    setLoadingMain(true);
    try {
      // ── 1. Хувь хүн ──────────────────────────────────────────
      const res1 = await fetch(`${API}/api/persons/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data1 = await res1.json();
      if (res1.ok && data1.success) {
        localStorage.setItem("token", data1.token);
        localStorage.setItem(
          "user",
          JSON.stringify({ ...data1.user, role: "individual" }),
        );
        router.push("/dashboard/person");
        return;
      }

      // ── 2. Байгааллага ────────────────────────────────────────
      const res2 = await fetch(`${API}/api/organizations/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data2 = await res2.json();
      if (res2.ok && data2.success) {
        localStorage.setItem("token", data2.token);
        localStorage.setItem(
          "user",
          JSON.stringify({ ...data2.organization, role: "company" }),
        );
        router.push("/dashboard/company");
        return;
      }

      setError("И-мэйл эсвэл нууц үг буруу байна");
    } catch {
      setError("Серверт холбогдох боломжгүй байна");
    } finally {
      setLoadingMain(false);
    }
  };

  // ── Дотоод хэрэглэгчээр нэвтрэх → супер админ / админ ──────────
  const handleInnerUser = async () => {
    if (!validate()) return;
    setLoadingInner(true);
    try {
      const res = await fetch(`${API}/api/super-admins/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem("super_admin_token", data.token);
        localStorage.setItem("super_admin_user", JSON.stringify(data.admin));
        // Role-д тулгуурлан redirect хийнэ
        const role = data.admin?.role;
        if (role === "super_admin") {
          router.push("/dashboard/admin");
        } else {
          // mini admin / sub_admin
          router.push("/dashboard/mini-admin");
        }
        return;
      }
      setError(data.message ?? "И-мэйл эсвэл нууц үг буруу байна");
    } catch {
      setError("Серверт холбогдох боломжгүй байна");
    } finally {
      setLoadingInner(false);
    }
  };

  const fade = (delay: number) => ({
    transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(16px)",
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        .lp-root, .lp-root * { font-family: 'Inter', sans-serif !important; }
        @keyframes float-slow { 0%,100%{transform:translateY(0px) scale(1)} 50%{transform:translateY(-18px) scale(1.03)} }
        @keyframes float-med  { 0%,100%{transform:translateY(0px)}          50%{transform:translateY(-12px)} }
        @keyframes shimmer-blue { 0%{background-position:-200% center} 100%{background-position:200% center} }
        .orb1{animation:float-slow 7s ease-in-out infinite}
        .orb2{animation:float-med  9s ease-in-out infinite 1.5s}
        .orb3{animation:float-slow 6s ease-in-out infinite 3s}
        .shimmer-text{
          background:linear-gradient(90deg,#0C72BA,#38bdf8,#0284c7,#0C72BA);
          background-size:200% auto;
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;
          animation:shimmer-blue 4s linear infinite;font-weight:700;
        }
        input::placeholder{color:rgba(30,40,80,0.25)}
      `}</style>

      <main
        className="lp-root min-h-screen w-full relative overflow-hidden flex items-center justify-center"
        style={{ background: "#f0f4ff" }}
      >
        <img
          src="/images/bgs.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.18 }}
        />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 20% 30%, rgba(186,220,255,0.5) 0%, transparent 65%)," +
              "radial-gradient(ellipse 60% 55% at 80% 75%, rgba(196,232,255,0.4) 0%, transparent 60%)," +
              "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(240,247,255,0.6) 0%, transparent 70%)",
          }}
        />

        <ParticleCanvas />

        <div
          className="orb1 absolute top-[-100px] left-[-80px] w-[420px] h-[420px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(12,114,186,0.12), transparent 70%)",
          }}
        />
        <div
          className="orb2 absolute bottom-[-80px] right-[-60px] w-[360px] h-[360px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(56,189,248,0.1), transparent 70%)",
          }}
        />
        <div
          className="orb3 absolute top-[40%] right-[12%] w-[200px] h-[200px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(12,114,186,0.08), transparent 70%)",
          }}
        />

        <div className="relative z-10 w-full mx-4" style={{ maxWidth: 460 }}>
          <div
            className="rounded-3xl overflow-hidden p-8 md:p-10"
            style={{
              background: "rgba(255,255,255,0.62)",
              backdropFilter: "blur(32px)",
              WebkitBackdropFilter: "blur(32px)",
              border: "1.5px solid rgba(255,255,255,0.85)",
              boxShadow:
                "0 24px 64px rgba(12,114,186,0.1), 0 4px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(255,255,255,0.9) inset",
            }}
          >
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-2/3 rounded-full"
              style={{
                background:
                  "linear-gradient(90deg,transparent,#0C72BA,#38bdf8,transparent)",
              }}
            />

            <div
              style={fade(0)}
              className="flex items-center justify-between mb-8"
            >
              <a href="/">
                <img
                  src="/images/Bodi-Group-logo-PNG-ENG-blue.png"
                  alt="Бодь Групп"
                  className="h-8 w-auto object-contain hover:opacity-80 transition-opacity"
                />
              </a>
              <span
                className="text-[11px] font-medium tracking-widest uppercase px-3 py-1.5 rounded-full"
                style={{
                  color: "#0C72BA",
                  background: "rgba(12,114,186,0.08)",
                  border: "1px solid rgba(12,114,186,0.15)",
                }}
              >
                Платформ
              </span>
            </div>

            <div style={fade(100)} className="mb-8">
              <h1
                className="text-[34px] font-bold leading-tight mb-2"
                style={{ color: "#0f1e3a", letterSpacing: "-0.02em" }}
              >
                Системд <span className="shimmer-text">нэвтрэх</span>
              </h1>
              <p
                className="text-sm font-light"
                style={{ color: "rgba(15,30,58,0.45)" }}
              >
                Бодь Группын худалдан авалтын платформд тавтай морилно уу
              </p>
            </div>

            <form onSubmit={handleLogin}>
              <div style={fade(180)} className="space-y-4 mb-6">
                <Field
                  id="email"
                  label="Имэйл хаяг"
                  type="email"
                  placeholder="name@company.mn"
                  value={email}
                  onChange={(v) => {
                    setEmail(v);
                    setError("");
                  }}
                />
                <Field
                  id="password"
                  label="Нууц үг"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(v) => {
                    setPassword(v);
                    setError("");
                  }}
                />
              </div>

              <div style={fade(220)} className="flex justify-end mb-5">
                <a
                  href="#"
                  className="text-[12px] font-medium transition-colors duration-200"
                  style={{ color: "rgba(12,114,186,0.5)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#0C72BA")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "rgba(12,114,186,0.5)")
                  }
                >
                  Нууц үг мартсан уу?
                </a>
              </div>

              {error && (
                <div
                  className="mb-4 px-4 py-2.5 rounded-xl text-[13px] font-medium"
                  style={{
                    background: "rgba(239,68,68,0.06)",
                    border: "1px solid rgba(239,68,68,0.18)",
                    color: "#dc2626",
                  }}
                >
                  {error}
                </div>
              )}

              <div style={fade(260)} className="space-y-3">
                {/* Нэвтрэх → нийлүүлэгч (хувь хүн / байгааллага) */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="relative w-full py-3.5 rounded-xl text-[14px] font-semibold text-white overflow-hidden transition-all duration-300 disabled:opacity-60 cursor-pointer"
                  style={{
                    background:
                      "linear-gradient(135deg,#0a4d8c 0%,#0C72BA 50%,#1590e0 100%)",
                    boxShadow:
                      "0 4px 20px rgba(12,114,186,0.35),0 1px 0 rgba(255,255,255,0.15) inset",
                  }}
                >
                  <span
                    className="absolute inset-x-0 top-0 h-px pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)",
                    }}
                  />
                  {loadingMain ? (
                    <span className="flex items-center justify-center gap-2">
                      <Spinner />
                      Нэвтэрч байна…
                    </span>
                  ) : (
                    "Нэвтрэх"
                  )}
                </button>

                <div className="flex items-center gap-3">
                  <div
                    className="flex-1 h-px"
                    style={{ background: "rgba(12,114,186,0.1)" }}
                  />
                  <span
                    className="text-[11px] font-medium tracking-widest uppercase"
                    style={{ color: "rgba(15,30,58,0.3)" }}
                  >
                    эсвэл
                  </span>
                  <div
                    className="flex-1 h-px"
                    style={{ background: "rgba(12,114,186,0.1)" }}
                  />
                </div>

                {/* Дотоод хэрэглэгчээр нэвтрэх → супер админ / админ */}
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleInnerUser}
                  className="relative w-full py-3.5 rounded-xl text-[14px] font-medium transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                  style={{
                    background: "rgba(12,114,186,0.05)",
                    border: "1.5px solid rgba(12,114,186,0.18)",
                    color: "rgba(12,60,100,0.7)",
                  }}
                  onMouseEnter={(e) => {
                    const b = e.currentTarget as HTMLButtonElement;
                    b.style.background = "rgba(12,114,186,0.1)";
                    b.style.borderColor = "rgba(12,114,186,0.4)";
                    b.style.color = "#0C72BA";
                    b.style.boxShadow = "0 4px 16px rgba(12,114,186,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    const b = e.currentTarget as HTMLButtonElement;
                    b.style.background = "rgba(12,114,186,0.05)";
                    b.style.borderColor = "rgba(12,114,186,0.18)";
                    b.style.color = "rgba(12,60,100,0.7)";
                    b.style.boxShadow = "none";
                  }}
                >
                  {loadingInner ? (
                    <>
                      <Spinner />
                      Нэвтэрч байна…
                    </>
                  ) : (
                    <>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="opacity-70"
                      >
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      Дотоод хэрэглэгчээр нэвтрэх
                    </>
                  )}
                </button>
              </div>
            </form>

            <div
              style={fade(340)}
              className="mt-8 flex items-center justify-between"
            >
              <p
                className="text-[12px] font-normal"
                style={{ color: "rgba(15,30,58,0.3)" }}
              >
                © 2026 Бодь Групп ХХК
              </p>
              <a
                href="/register"
                className="text-[12px] font-semibold transition-all duration-200"
                style={{
                  color: "#0C72BA",
                  padding: "6px 14px",
                  borderRadius: 8,
                  border: "1px solid rgba(12,114,186,0.3)",
                  background: "rgba(12,114,186,0.06)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(12,114,186,0.12)";
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "#0C72BA";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(12,114,186,0.06)";
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "rgba(12,114,186,0.3)";
                }}
              >
                Бүртгүүлэх →
              </a>
            </div>

            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-1/2 rounded-full"
              style={{
                background:
                  "linear-gradient(90deg,transparent,#38bdf8,transparent)",
              }}
            />
          </div>

          <div
            style={fade(420)}
            className="mt-5 flex items-center justify-center gap-8"
          >
            {[
              { v: "30+", l: "Жил" },
              { v: "14", l: "Компани" },
              { v: "3000+", l: "Ажилтан" },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <div
                  className="text-[15px] font-bold"
                  style={{ color: "#0C72BA" }}
                >
                  {s.v}
                </div>
                <div
                  className="text-[11px] font-medium tracking-widest uppercase"
                  style={{ color: "rgba(15,30,58,0.35)" }}
                >
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
