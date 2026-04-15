"use client";
import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  Building2, User, CheckCircle2, ExternalLink,
  Loader2, RefreshCw, AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type Tab  = "organization" | "individual";
type Step = "form" | "otp" | "consent" | "done";

// ── Password strength checker ─────────────────────────────────────
function checkPassword(pw: string) {
  return {
    length:  pw.length >= 8,
    upper:   /[A-Z]/.test(pw),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw),
  };
}

function isValidPassword(pw: string) {
  const c = checkPassword(pw);
  return c.length && c.upper && c.special;
}

// ── Shared UI ─────────────────────────────────────────────────────
function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative z-10 rounded-2xl p-8", className)} style={{
      background:"rgba(255,255,255,0.72)", border:"1px solid rgba(255,255,255,0.85)",
      backdropFilter:"blur(28px)",
      boxShadow:"0 8px 32px rgba(99,102,241,.10),0 2px 8px rgba(0,0,0,.06),0 0 0 1px rgba(255,255,255,.9) inset",
    }}>
      {children}
    </div>
  );
}

function AccentLine() {
  return <div className="absolute -top-px left-1/2 -translate-x-1/2 h-px w-3/4 rounded-full"
    style={{ background:"linear-gradient(90deg,transparent,#818cf8,#60a5fa,transparent)" }}/>;
}

function BottomAccent() {
  return <div className="absolute -bottom-px left-1/2 -translate-x-1/2 h-px w-1/2 rounded-full"
    style={{ background:"linear-gradient(90deg,transparent,#60a5fa,transparent)" }}/>;
}

function SubmitBtn({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button type="submit" disabled={loading}
      className="w-full h-11 rounded-xl font-semibold text-white text-sm transition-all hover:shadow-lg hover:shadow-indigo-200 disabled:opacity-70"
      style={{ background:"linear-gradient(135deg,#6366f1 0%,#818cf8 50%,#60a5fa 100%)", boxShadow:"0 4px 15px rgba(99,102,241,.30)" }}>
      {loading
        ? <span className="flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin"/>Илгээж байна...</span>
        : `${label} →`}
    </button>
  );
}

function Field({ label, id, type = "text", placeholder, value, onChange, error }: {
  label: string; id: string; type?: string; placeholder: string;
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; error?: string;
}) {
  return (
    <div className="flex flex-col space-y-1 w-full">
      <label htmlFor={id} className="text-neutral-600 text-sm font-medium">{label}</label>
      <input id={id} type={type} placeholder={placeholder} value={value} onChange={onChange}
        className={cn("w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all bg-white/70",
          "border focus:border-indigo-400 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]",
          error ? "border-red-300" : "border-indigo-100")}
        style={{ color:"#1a2336" }}/>
      {error && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11}/>{error}</p>}
    </div>
  );
}

function PasswordField({ label, id, value, onChange, error }: {
  label: string; id: string;
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; error?: string;
}) {
  const [show, setShow] = useState(false);
  const checks = checkPassword(value);
  const rules = [
    { key: "length"  as const, label: "Хамгийн багадаа 8 тэмдэгт" },
    { key: "upper"   as const, label: "Том үсэг (A-Z) орсон байх" },
    { key: "special" as const, label: "Тусгай тэмдэгт (!@#$ гэх мэт)" },
  ];

  return (
    <div className="flex flex-col space-y-1 w-full">
      <label htmlFor={id} className="text-neutral-600 text-sm font-medium">{label}</label>
      <div className="relative">
        <input id={id} type={show ? "text" : "password"}
          placeholder="••••••••" value={value} onChange={onChange}
          className={cn("w-full rounded-xl px-3.5 py-2.5 pr-10 text-sm outline-none transition-all bg-white/70",
            "border focus:border-indigo-400 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]",
            error ? "border-red-300" : "border-indigo-100")}
          style={{ color:"#1a2336" }}/>
        <button type="button" onClick={() => setShow(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors">
          {show ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
              <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          )}
        </button>
      </div>
      {/* Strength rules */}
      {value.length > 0 && (
        <div className="space-y-1 pt-1">
          {rules.map(r => (
            <div key={r.key} className="flex items-center gap-2">
              <div className={cn("w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 transition-all",
                checks[r.key] ? "bg-emerald-500" : "bg-neutral-200")}>
                {checks[r.key] && (
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <path d="M5 13l4 4L19 7"/>
                  </svg>
                )}
              </div>
              <span className={cn("text-xs transition-colors",
                checks[r.key] ? "text-emerald-600" : "text-neutral-400")}>
                {r.label}
              </span>
            </div>
          ))}
        </div>
      )}
      {error && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11}/>{error}</p>}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
export default function SignupFormDemo() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("organization");
  const [step,      setStep]      = useState<Step>("form");

  const [orgRegnum,    setOrgRegnum]    = useState("");
  const [orgName,      setOrgName]      = useState("");
  const [orgEmail,     setOrgEmail]     = useState("");
  const [orgPassword,  setOrgPassword]  = useState("");
  const [orgPassword2, setOrgPassword2] = useState("");
  const [orgErrors,    setOrgErrors]    = useState<Record<string,string>>({});

  const [perRegister,  setPerRegister]  = useState("");
  const [perEmail,     setPerEmail]     = useState("");
  const [perPassword,  setPerPassword]  = useState("");
  const [perPassword2, setPerPassword2] = useState("");
  const [perErrors,    setPerErrors]    = useState<Record<string,string>>({});

  const [otp,      setOtp]      = useState("");
  const [otpError, setOtpError] = useState("");
  const [timer,    setTimer]    = useState(0);
  const [expired,  setExpired]  = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [check1,  setCheck1]  = useState(false);
  const [check2,  setCheck2]  = useState(false);
  const [loading, setLoading] = useState(false);

  const currentEmail = activeTab === "organization" ? orgEmail : perEmail;

  useEffect(() => {
    if (timer <= 0) return;
    timerRef.current = setTimeout(() => {
      setTimer(t => {
        if (t - 1 <= 0) setExpired(true);
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [timer]);

  const handlePerRegisterChange = (v: string) => {
    const upper = v.toUpperCase();
    let result = "";
    for (let i = 0; i < upper.length && result.length < 10; i++) {
      const ch = upper[i];
      if (result.length < 2) {
        if (/[А-ЯӨҮЁ]/.test(ch)) result += ch;
      } else {
        if (/\d/.test(ch)) result += ch;
      }
    }
    setPerRegister(result);
    setPerErrors(p => ({ ...p, register: "" }));
  };

  const sendOtp = async (): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/otp/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Имэйл илгээхэд алдаа гарлаа");
      setOtp(""); setOtpError(""); setExpired(false); setTimer(60);
      return true;
    } catch (err: any) {
      setOtpError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleOrgSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string,string> = {};
    if (!orgRegnum || orgRegnum.length !== 7)
      errs.regnum = "7 оронтой тоо оруулна уу";
    if (!orgName.trim())
      errs.name = "Байгууллагын нэр шаардлагатай";
    if (!orgEmail.trim() || !/\S+@\S+\.\S+/.test(orgEmail))
      errs.email = "И-мэйл буруу байна";
    if (!isValidPassword(orgPassword))
      errs.password = "Нууц үг шаардлага хангахгүй байна";
    if (orgPassword !== orgPassword2)
      errs.password2 = "Нууц үг таарахгүй байна";
    setOrgErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const ok = await sendOtp();
    if (ok) setStep("otp");
  };

  const handlePerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string,string> = {};
    if (!/^[А-ЯӨҮЁ]{2}\d{8}$/.test(perRegister))
      errs.register = "2 монгол үсэг + 8 тоо (АБ12345678)";
    if (!perEmail.trim() || !/\S+@\S+\.\S+/.test(perEmail))
      errs.email = "И-мэйл буруу байна";
    if (!isValidPassword(perPassword))
      errs.password = "Нууц үг шаардлага хангахгүй байна";
    if (perPassword !== perPassword2)
      errs.password2 = "Нууц үг таарахгүй байна";
    setPerErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const ok = await sendOtp();
    if (ok) setStep("otp");
  };

  const verifyOtp = async () => {
    if (expired) { setOtpError("Кодны хугацаа дууссан. Дахин илгээнэ үү."); return; }
    if (otp.length !== 6) { setOtpError("6 оронтой код оруулна уу"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/otp/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentEmail, code: otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Код буруу байна");
      setOtpError("");
      setStep("consent");
    } catch (err: any) {
      setOtpError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => { setOtp(""); setOtpError(""); await sendOtp(); };

  const finalSubmit = async () => {
    if (!check1 || !check2) return;
    setLoading(true); setOtpError("");
    try {
      if (activeTab === "organization") {
        const res = await fetch(`${API}/api/organizations/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            register_number: orgRegnum,
            company_name:    orgName,
            email:           orgEmail,
            password:        orgPassword,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Бүртгэхэд алдаа гарлаа");
        if (data.token) localStorage.setItem("token", data.token);
        if (data.organization)
          localStorage.setItem("user", JSON.stringify({ ...data.organization, role:"company" }));
        setStep("done");
        setTimeout(() => router.push("/dashboard/company/profile?edit=true"), 1800);
      } else {
        const res = await fetch(`${API}/api/persons/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            register_number: perRegister,
            email:           perEmail,
            password:        perPassword,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Бүртгэхэд алдаа гарлаа");
        if (data.token) localStorage.setItem("token", data.token);
        if (data.user)
          localStorage.setItem("user", JSON.stringify({ ...data.user, role:"individual" }));
        setStep("done");
        setTimeout(() => router.push("/dashboard/person/profile?edit=true"), 1800);
      }
    } catch (err: any) {
      setOtpError(err.message || "Серверийн алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const canVerify = otp.length === 6 && !expired && !loading;

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      <img src="/images/bgs.jpg" alt="bg"
        className="absolute inset-0 w-full h-full object-cover object-center"/>
      <div className="absolute inset-0" style={{
        background:"linear-gradient(135deg,rgba(224,231,255,.55) 0%,rgba(219,234,254,.45) 50%,rgba(237,233,254,.50) 100%)"
      }}/>
      <div className="absolute top-12 right-20 w-28 h-28 rounded-full border border-white/40"/>
      <div className="absolute top-12 right-20 w-[72px] h-[72px] m-7 rounded-full border border-white/30"/>
      <div className="absolute bottom-12 left-14 w-20 h-20 rounded-full border border-white/40"/>
      <div className="absolute bottom-12 left-14 w-12 h-12 m-4 rounded-full border border-white/30"/>

      {/* ══ FORM ══════════════════════════════════════════════════ */}
      {step === "form" && (
        <GlassCard className="w-full max-w-md my-10">
          <AccentLine/>
          <a href="/"><img src="/images/Bodi-Group-logo-PNG-ENG-blue.png" alt="Бодь Групп"
            className="h-8 w-auto object-contain hover:opacity-80 transition-opacity my-4"/></a>
          <h2 className="text-xl font-bold text-neutral-800">Бүртгэл үүсгэх</h2>
          <p className="mt-1 text-sm text-neutral-500">Бүртгэлийн төрлөө сонгоно уу</p>

          {/* Tabs */}
          <div className="mt-5 mb-6 flex rounded-xl p-1 gap-1"
            style={{ background:"rgba(255,255,255,0.5)", border:"1px solid rgba(199,210,254,0.6)" }}>
            {([
              { key:"organization", label:"Байгуулга", icon:Building2 },
              { key:"individual",   label:"Хувь хүн",  icon:User },
            ] as const).map(({ key, label, icon:Icon }) => (
              <button key={key} type="button" onClick={() => setActiveTab(key)}
                className={cn("flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  activeTab===key ? "text-white shadow-sm" : "text-neutral-500 hover:text-neutral-700")}
                style={activeTab===key ? { background:"linear-gradient(135deg,#6366f1,#60a5fa)", boxShadow:"0 2px 8px rgba(99,102,241,.35)" } : {}}>
                <Icon className="w-4 h-4"/>{label}
              </button>
            ))}
          </div>

          {/* ── ORG FORM ── */}
          {activeTab === "organization" && (
            <form className="space-y-4" onSubmit={handleOrgSubmit}>
              <div className="flex flex-col space-y-1">
                <label className="text-neutral-600 text-sm font-medium">
                  Байгааллагын регистрийн дугаар *
                </label>
                <input
                  value={orgRegnum}
                  onChange={e => { setOrgRegnum(e.target.value.replace(/\D/g,"").slice(0,7)); setOrgErrors(p=>({...p,regnum:""})); }}
                  placeholder="1234567" maxLength={7} inputMode="numeric"
                  className={cn("w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all bg-white/70 border font-mono tracking-widest text-center text-base",
                    "focus:border-indigo-400 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]",
                    orgErrors.regnum ? "border-red-300" : "border-indigo-100")}
                  style={{ color:"#1a2336" }}/>
                <div className="flex gap-1 pt-1">
                  {Array.from({length:7},(_,i)=>(
                    <div key={i} className={cn("flex-1 h-0.5 rounded-full transition-all duration-300",
                      orgRegnum[i] ? "bg-indigo-400" : "bg-indigo-100")}/>
                  ))}
                </div>
                {orgErrors.regnum && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11}/>{orgErrors.regnum}</p>}
              </div>

              <Field label="Байгууллагын нэр *" id="org-name" type="text"
                placeholder="Бодь Трейд ХХК"
                value={orgName} onChange={e=>{setOrgName(e.target.value);setOrgErrors(p=>({...p,name:""}));}}
                error={orgErrors.name}/>
              <Field label="Байгааллагын и-мэйл *" id="org-email" type="email"
                placeholder="info@company.mn"
                value={orgEmail} onChange={e=>{setOrgEmail(e.target.value);setOrgErrors(p=>({...p,email:""}));}}
                error={orgErrors.email}/>
              <PasswordField label="Нууц үг *" id="org-pw"
                value={orgPassword} onChange={e=>{setOrgPassword(e.target.value);setOrgErrors(p=>({...p,password:""}));}}
                error={orgErrors.password}/>
              <PasswordField label="Нууц үг давтах *" id="org-pw2"
                value={orgPassword2} onChange={e=>{setOrgPassword2(e.target.value);setOrgErrors(p=>({...p,password2:""}));}}
                error={orgErrors.password2}/>
              <SubmitBtn loading={loading} label="Байгааллагаар бүртгүүлэх"/>
            </form>
          )}

          {/* ── INDIVIDUAL FORM ── */}
          {activeTab === "individual" && (
            <form className="space-y-4" onSubmit={handlePerSubmit}>
              <div className="flex flex-col space-y-1">
                <label className="text-neutral-600 text-sm font-medium">Регистрийн дугаар *</label>
                <input
                  value={perRegister}
                  onChange={e => handlePerRegisterChange(e.target.value)}
                  placeholder="АБ12345678" maxLength={10}
                  className={cn("w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all bg-white/70 border font-mono tracking-widest text-center text-base",
                    "focus:border-indigo-400 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]",
                    perErrors.register ? "border-red-300" : "border-indigo-100")}
                  style={{ color:"#1a2336" }}/>
                <div className="flex gap-1 pt-1">
                  {Array.from({length:10},(_,i)=>(
                    <div key={i} className={cn("flex-1 h-0.5 rounded-full transition-all duration-300",
                      perRegister[i] ? i < 2 ? "bg-purple-400" : "bg-indigo-400" : "bg-indigo-100")}/>
                  ))}
                </div>
                <p className="text-[11px] text-neutral-400">
                  <span className="text-purple-500 font-semibold">АБ</span> — монгол үсэг + <span className="text-indigo-500 font-semibold">12345678</span> — 8 тоо
                </p>
                {perErrors.register && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11}/>{perErrors.register}</p>}
              </div>

              <Field label="И-мэйл хаяг *" id="per-email" type="email"
                placeholder="example@mail.mn"
                value={perEmail} onChange={e=>{setPerEmail(e.target.value);setPerErrors(p=>({...p,email:""}));}}
                error={perErrors.email}/>
              <PasswordField label="Нууц үг *" id="per-pw"
                value={perPassword} onChange={e=>{setPerPassword(e.target.value);setPerErrors(p=>({...p,password:""}));}}
                error={perErrors.password}/>
              <PasswordField label="Нууц үг давтах *" id="per-pw2"
                value={perPassword2} onChange={e=>{setPerPassword2(e.target.value);setPerErrors(p=>({...p,password2:""}));}}
                error={perErrors.password2}/>
              <SubmitBtn loading={loading} label="Хувь хүнээр бүртгүүлэх"/>
            </form>
          )}
          <BottomAccent/>
        </GlassCard>
      )}

      {/* ══ OTP ══════════════════════════════════════════════════ */}
      {step === "otp" && (
        <GlassCard className="w-full max-w-sm">
          <AccentLine/>
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background:"linear-gradient(135deg,#6366f1,#60a5fa)", boxShadow:"0 0 24px rgba(99,102,241,.3)" }}>
              <span className="text-white text-2xl">✉</span>
            </div>
            <h2 className="text-lg font-bold text-neutral-800">И-мэйл баталгаажуулалт</h2>
            <p className="text-sm text-neutral-500 mt-1">
              <span className="font-semibold text-indigo-600">{currentEmail}</span> хаяг руу код илгээлээ
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-neutral-600 text-sm font-medium">6 оронтой код *</label>
              <input
                value={otp}
                onChange={e=>{setOtp(e.target.value.replace(/\D/g,"").slice(0,6));setOtpError("");}}
                placeholder="• • • • • •"
                maxLength={6} inputMode="numeric" autoFocus disabled={expired || loading}
                className={cn("mt-1.5 w-full rounded-xl border px-3.5 py-3 outline-none transition-all",
                  "text-center text-2xl tracking-[0.5em] font-bold bg-white/80",
                  "focus:border-indigo-400 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]",
                  expired ? "border-red-200 bg-red-50/50 cursor-not-allowed opacity-50"
                    : otpError ? "border-red-300"
                    : otp.length===6 ? "border-emerald-400"
                    : "border-indigo-100")}
                style={{ color:"#1a2336" }}/>
              {(otpError || expired) && (
                <div className="mt-2 flex items-start gap-2 px-3 py-2 rounded-lg"
                  style={{ background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.18)" }}>
                  <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5"/>
                  <p className="text-xs text-red-600 font-medium">
                    {expired ? "Кодны хугацаа дууссан. Доорх товчийг дарж шинэ код авна уу." : otpError}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className={cn("flex items-center gap-1.5 text-sm font-medium",
                expired ? "text-red-400" : timer > 0 ? "text-indigo-500" : "text-neutral-400")}>
                <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0",
                  expired ? "bg-red-400" : timer > 0 ? "bg-indigo-400 animate-pulse" : "bg-neutral-300")}/>
                {expired ? "Хугацаа дууссан" : timer > 0 ? `${timer} секунд` : "Хугацаа дууссан"}
              </div>
              {(timer === 0 || expired) && (
                <button type="button" onClick={resendOtp} disabled={loading}
                  className="flex items-center gap-1.5 text-sm font-semibold transition-colors disabled:opacity-40 text-indigo-500 hover:text-indigo-700">
                  {loading ? <Loader2 size={13} className="animate-spin"/> : <RefreshCw size={13}/>}
                  Дахин илгээх
                </button>
              )}
            </div>

            {timer > 0 && !expired && (
              <div className="h-1 rounded-full bg-indigo-100 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-400 transition-all duration-1000"
                  style={{ width:`${(timer/60)*100}%` }}/>
              </div>
            )}

            <button onClick={verifyOtp} disabled={!canVerify}
              className={cn("w-full h-11 rounded-xl font-semibold text-white text-sm transition-all relative overflow-hidden",
                canVerify ? "hover:shadow-lg hover:shadow-indigo-200" : "cursor-not-allowed opacity-40")}
              style={{ background:"linear-gradient(135deg,#6366f1,#60a5fa)", boxShadow:canVerify?"0 4px 15px rgba(99,102,241,.3)":"none" }}>
              {loading
                ? <span className="flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin"/> Шалгаж байна...</span>
                : expired ? "⏰ Хугацаа дууссан" : "Баталгаажуулах →"}
            </button>

            <button onClick={()=>{setStep("form");setOtp("");setOtpError("");setExpired(false);}}
              className="w-full text-sm text-neutral-400 hover:text-indigo-500 transition-colors">
              ← Буцах
            </button>
          </div>
          <BottomAccent/>
        </GlassCard>
      )}

      {/* ══ CONSENT ══════════════════════════════════════════════ */}
      {step === "consent" && (
        <GlassCard className="w-full max-w-md">
          <AccentLine/>
          <p className="text-center text-xs font-semibold text-amber-500 tracking-widest mb-3">АНХААРУУЛГА</p>
          <a href="/policy" target="_blank"
            className="flex items-center gap-1 text-sm text-indigo-500 hover:text-indigo-700 font-medium mb-4 transition-colors">
            Дүрэм Журам Нууцлалын бодлого танилцах * <ExternalLink className="w-3.5 h-3.5"/>
          </a>
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 text-sm text-neutral-700 leading-relaxed mb-5 space-y-3">
            <p>Та <strong>Бодь Группийн худалдан авалтын платформд</strong> нийлүүлэгчээр бүртгүүлэхээр хандаж байна.</p>
            <p>Та манай бодлого, журам, нууцлалын дүрэмтэй уншиж танилцсаны дараа нэвтрэхийг зөвлөж байна.</p>
          </div>
          {otpError && (
            <div className="mb-4 px-3 py-2.5 rounded-xl flex items-start gap-2"
              style={{ background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.2)" }}>
              <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5"/>
              <p className="text-xs font-medium" style={{ color:"#dc2626" }}>{otpError}</p>
            </div>
          )}
          <div className="space-y-3 mb-6">
            {[
              { checked:check1, toggle:()=>setCheck1(!check1), label:"Үнэн зөв мэдээлэл оруулсан" },
              { checked:check2, toggle:()=>setCheck2(!check2), label:"Бодлого журамтай танилцсан" },
            ].map(({ checked, toggle, label }) => (
              <label key={label} className="flex items-center gap-3 cursor-pointer group">
                <div onClick={toggle}
                  className={cn("w-5 h-5 rounded flex items-center justify-center border-2 transition-colors flex-shrink-0",
                    checked ? "bg-indigo-500 border-indigo-500" : "border-indigo-200 group-hover:border-indigo-400")}>
                  {checked && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                </div>
                <span className="text-sm text-neutral-700">{label}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={()=>{setStep("form");setOtpError("");}}
              className="flex-1 h-10 rounded-xl border border-indigo-200 text-sm font-medium text-neutral-600 hover:bg-indigo-50 transition-colors">
              Цуцлах
            </button>
            <button onClick={finalSubmit} disabled={!check1||!check2||loading}
              className="flex-1 h-10 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50"
              style={{ background:"linear-gradient(135deg,#6366f1,#60a5fa)", boxShadow:"0 4px 15px rgba(99,102,241,.3)" }}>
              {loading ? "Илгээж байна..." : "Бүртгүүлэх"}
            </button>
          </div>
          <BottomAccent/>
        </GlassCard>
      )}

      {/* ══ DONE ═════════════════════════════════════════════════ */}
      {step === "done" && (
        <GlassCard className="w-full max-w-sm text-center">
          <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color:"#6366f1" }}/>
          <h2 className="text-xl font-bold text-neutral-800 mb-2">Бүртгэл амжилттай!</h2>
          <p className="text-sm text-neutral-500">Dashboard руу шилжиж байна...</p>
          <div className="mt-5 w-full h-1.5 rounded-full bg-indigo-100 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-400"
              style={{ animation:"grow 1.8s linear forwards" }}/>
          </div>
          <style>{`@keyframes grow{from{width:0%}to{width:100%}}`}</style>
        </GlassCard>
      )}
    </div>
  );
}