"use client";

import {
  Facebook,
  Instagram,
  Linkedin,
  MoreVertical,
  Twitter,
  Youtube,
} from "lucide-react";

function AnalyticsCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-card rounded-2xl shadow-xl border border-border p-4 w-52 ${className}`}
    >
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        Бүртгэл үүсгэх алхам
      </p>
      <div className="space-y-2.5">
        {[
          {
            platform: "1-р шат",
            title: "Бүртгэл үүсгэх",
            time: "",
            location: "эхний шатны мэдээлэл",
          },
          {
            platform: "2-р шат",
            title: "Ерөнхий мэдээлэл",
            time: "",
            location: "дэлгэрэнгүй мэдээлэл",
          },
          {
            platform: "3-р шат",
            title: "Худалдан авалтад оролцох",
            time: "",
            location: "Сонгон оролцох",
          },
        ].map((item, i) => (
          <div key={i} className="border-l-2 border-primary pl-2.5">
            <p className="text-[9px] text-muted-foreground">{item.platform}</p>
            <p className="text-[11px] font-semibold text-foreground leading-tight">
              {item.title}
            </p>
            <p className="text-[9px] text-muted-foreground">
              {item.time} | {item.location}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SocialCard({ className = "" }: { className?: string }) {
  const socials = [
    {
      bg: "bg-[#1877F2]",
      label: "Facebook",
      icon: <Facebook className="w-4 h-4 text-white" />,
    },
    {
      bg: "bg-black",
      label: "Twitter",
      icon: <Twitter className="w-4 h-4 text-white" />,
    },
    {
      bg: "bg-[#FF0000]",
      label: "YouTube",
      icon: <Youtube className="w-4 h-4 text-white" />,
    },
    {
      bg: "bg-gradient-to-br from-[#f09433] via-[#dc2743] to-[#cc2366]",
      label: "Instagram",
      icon: <Instagram className="w-4 h-4 text-white" />,
    },
    {
      bg: "bg-[#0A66C2]",
      label: "LinkedIn",
      icon: <Linkedin className="w-4 h-4 text-white" />,
    },
  ];

  return (
    <div
      className={`bg-card rounded-2xl shadow-xl border border-border p-4 w-64 ${className}`}
    >
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        Биднийг дагаарай
      </p>

      <div className="flex gap-2">
        {socials.map((s, i) => (
          <div
            key={i}
            className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shadow-md cursor-pointer hover:scale-105 transition`}
            aria-label={s.label}
          >
            {s.icon}
          </div>
        ))}
      </div>
    </div>
  );
}
function InterviewCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-card rounded-2xl shadow-xl border border-border p-3 w-52 ${className}`}
    >
      {[
        {
          initials: "1",
          name: "Хүсэлт илгээх",
          note: "админаас хянах",
          color: "bg-primary",
        },
        {
          initials: "2",
          name: "Хүсэлт хариу ирэх",
          note: "систэмд майл хариу ирнэ",
          color: "bg-emerald-500",
        },
      ].map((item, i) => (
        <div
          key={i}
          className={`flex items-center gap-3 ${i > 0 ? "mt-2 pt-2 border-t border-border" : ""}`}
        >
          <div
            className={`w-8 h-8 rounded-full ${item.color} flex items-center justify-center shrink-0 ring-2 ring-[#0C72BA] ring-offset-1`}
          >
            <span className="text-[10px] font-bold text-white">
              {item.initials}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-foreground truncate">
              {item.name}
            </p>
            <p className="text-[10px] text-muted-foreground">{item.note}</p>
          </div>
          <MoreVertical className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        </div>
      ))}
    </div>
  );
}

function LogoFloat({
  size = "lg",
  className = "",
}: {
  size?: "sm" | "lg";
  className?: string;
}) {
  const outer = size === "lg" ? "w-20 h-20" : "w-14 h-14";
  const inner = size === "lg" ? "w-10 h-10" : "w-7 h-7";
  return (
    <div
      className={`${outer} bg-card rounded-3xl shadow-2xl border border-border flex items-center justify-center ${className}`}
    >
      <img
        src="/images/logosolo.png"
        alt="Logo"
        className={`${inner} object-contain`}
      />
    </div>
  );
}

export function Hero() {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        minHeight: "calc(100vh - 64px)",
        backgroundImage:
          "radial-gradient(circle, oklch(0.65 0.02 250 / 0.35) 1px, transparent 1px)",
        backgroundSize: "22px 22px",
        backgroundColor: "oklch(0.968 0.004 247)",
      }}
    >
      {/* Rounded inner container */}
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-0">
        <div
          className="relative rounded-3xl border border-border overflow-hidden flex flex-col items-center"
          style={{
            backgroundColor: "oklch(0.985 0.002 250 / 0.75)",
            minHeight: "calc(100vh - 120px)",
          }}
        >
          {/* ── Center content ── */}
          <div className="relative z-10 flex flex-col items-center text-center px-6 pt-16 pb-10 max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#0C72BA]/40 bg-[#0C72BA]/10 text-[#0C72BA] text-sm font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-[#0C72BA] animate-pulse" />
              Нийлүүлэгч та манай системд бүртгүүлснээр тендер, үнийн саналд
              оролцох боломжтой.
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl font-extrabold text-foreground text-balance leading-[1.1] tracking-tight text-slate-700">
              Бодь Групп-ийн худалдан авалтын платформ
            </h1>

            {/* Sub-text */}
            <p className="mt-6 text-base md:text-lg text-muted-foreground leading-relaxed max-w-3xl text-balance">
              Бодь Групп-ийн худалдан авалтын систем нь группийн хэмжээнд бараа,
              ажил, үйлчилгээ худалдан авах үйл явцыг ил тод, үр ашигтай,
              нэгдсэн байдлаар зохион байгуулах зорилготой.
            </p>

            {/* CTA */}
            <a
              href="/register"
              className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#0C72BA] text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity shadow-lg"
            >
              Бүртгэл үүсгэх →
            </a>
          </div>

          {/* ── Floating cards — only on lg screens ── */}
          <div className="hidden lg:block absolute inset-0 pointer-events-none">
            {/* Top-left logo */}
            <div className="absolute top-10 left-10 -rotate-6">
              <LogoFloat size="lg" />
            </div>

            {/* Top-right logo */}
            <div className="absolute top-14 right-14 rotate-6">
              <LogoFloat size="sm" />
            </div>

            {/* Left — analytics */}
            <div className="absolute bottom-12 left-6 -rotate-6">
              <AnalyticsCard />
            </div>

            {/* Left — social beneath analytics */}
            <div className="absolute bottom-0 left-44 -rotate-3">
              <SocialCard />
            </div>

            {/* Right — small analytics */}
            <div className="absolute bottom-10 right-52 rotate-2">
              <div className="bg-card rounded-2xl shadow-xl border border-border p-3 w-44">
                <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Хянах самбар
                </p>
                <div className="space-y-2">
                  {[
                    {
                      title: "Бүх урилга харах",
                      time: "10:30",
                      location: "илгээсэн",
                    },
                    {
                      title: "Илгээсэн хүсэлтүүд",
                      time: "4:30",
                      location: "илгээсэн",
                    },
                    {
                      title: "Шинэ худалдан авалт",
                      time: "18:30",
                      location: "шинэ",
                    },
                  ].map((item, i) => (
                    <div key={i} className="border-l-2 border-primary pl-2">
                      <p className="text-[10px] font-medium text-foreground leading-tight">
                        {item.title}
                      </p>
                      <p className="text-[8px] text-muted-foreground">
                        {item.time} | {item.location}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — interview card */}
            <div className="absolute bottom-8 right-4 rotate-3">
              <InterviewCard />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
