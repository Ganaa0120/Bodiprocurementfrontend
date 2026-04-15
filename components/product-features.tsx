"use client";

import { MoreHorizontal, CheckSquare, Info } from "lucide-react";

const candidates = [
  {
    name: "Нийлүүлэлт хийх хүсэлтийн хариу #1",
    note: "2026/03/01-нд ирсэн",
    avatar: "MG",
    avatarColor: "bg-blue-400",
    imgSrc: "/images/email.png",
  },
  {
    name: "Нийлүүлэлт хийх хүсэлтийн хариу #2",
    note: "2026/03/04-нд ирсэн",
    avatar: "GG",
    avatarColor: "bg-amber-400",
    imgSrc: "/images/email.png",
  },
  {
    name: "Нийлүүлэлт хийх хүсэлтийн хариу #3",
    note: "2026/03/07-нд ирсэн",
    avatar: "DL",
    avatarColor: "bg-emerald-400",
    imgSrc: "/images/email.png",
  },
];

const barData = [
  { day: "Даваа", value: 3, highlight: false },
  { day: "Мягмар", value: 4, highlight: false },
  { day: "Лхагва", value: 6, highlight: false },
  { day: "Пүрэв", value: 7, highlight: true },
  { day: "Баасан", value: 5, highlight: false },
  { day: "Бямба", value: 6, highlight: false },
  { day: "Ням", value: 4, highlight: false },
];
const maxBar = 8;

export function ProductFeatures() {
  return (
    <section id="products" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section label */}
        <div className="flex justify-center mb-6">
          <span className="px-4 py-1.5 rounded-full border border-border text-sm text-muted-foreground font-medium">
            мэдээлэл
          </span>
        </div>

        {/* Heading */}
        <h2 className="text-4xl md:text-5xl font-bold text-center text-foreground text-balance mb-4 text-slate-700">
          Нийлүүлэгчдэд зориулсан мэдээлэл
        </h2>
        <p className="text-center text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-14">
          Нийлүүлэгч та манай системд бүртгүүлснээр дараах боломжуудыг эдлэх
          боломжтой
        </p>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1 — Easy resume upload */}
          <div className="bg-card rounded-3xl border border-border p-7 flex flex-col gap-5 overflow-hidden relative">
            {/* Floating logo icon */}
            <div className="absolute -top-3 left-8 w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center border border-border">
              <img src="/images/logosolo.png" alt="Logo" className="w-8 h-8" />
            </div>

            {/* Google Drive card mockup */}
            <div className="mt-10 bg-background rounded-2xl border border-border p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                {/* Google Drive icon */}
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white border border-border shadow-sm">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                    <path d="M4.5 20l3.5-6h8l3.5 6H4.5Z" fill="#4285F4" />
                    <path d="M2 14L7.5 4l3 5.2L7 14H2Z" fill="#34A853" />
                    <path d="M16.5 4L22 14h-5l-3.5-6L16.5 4Z" fill="#FBBC05" />
                  </svg>
                </div>
                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="font-semibold text-foreground text-sm mb-0.5">
                Цаасгүй, хурдан, найдвартай цахим процесс
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>Эхний алхам</span>
                <span>Дуусах</span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#0C72BA]"
                  style={{ width: "86%" }}
                />
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Баримт бичгийг цахимаар илгээх
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Тендерт шаардлагатай баримт бичиг (саналын маягт, гэрээ,
                техникийн баримт бичиг) илгээх
              </p>
            </div>
          </div>

          {/* Card 2 — Track interview feedback */}
          <div className="bg-card rounded-3xl border border-border p-7 flex flex-col gap-5 overflow-hidden relative">
            {/* Stacked analytics cards behind */}
            <div className="relative h-52">
              {/* Back card (rotated) */}
              <div className="absolute inset-0 top-2 left-4 right-4 bg-blue-50 rounded-2xl border border-blue-100 opacity-60 rotate-3 origin-top-left" />
              {/* Middle card (slightly rotated) */}
              <div className="absolute inset-0 top-1 left-2 right-2 bg-slate-50 rounded-2xl border border-slate-100 opacity-80 rotate-1 origin-top-left" />
              {/* Front card — candidate list */}
              <div className="absolute inset-0 bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="px-4 py-2 bg-slate-50 border-b border-border">
                  <span className="text-xs font-medium text-muted-foreground">
                    Мэдэгдэлүүд
                  </span>
                </div>
                <div className="divide-y divide-border">
                  {candidates.map((c) => (
                    <div
                      key={c.name}
                      className="flex items-center gap-3 px-4 py-2.5"
                    >
                      <img
                        src={c.imgSrc}
                        alt={c.name}
                        className="w-8 h-8 object-contain flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {c.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {c.note}
                        </p>
                      </div>
                      <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Худалдан авалтын мэдээллийг цаг тухайд нь авах
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Сонгон шалгаруулалтын явц, үр дүнгийн мэдээ авах
              </p>
            </div>
          </div>

          {/* Card 3 — Rank interviewee effortlessly */}
          <div className="bg-card rounded-3xl border border-border p-7 flex flex-col gap-5 overflow-hidden relative">
            {/* Floating warning badge */}
            <div className="absolute top-6 right-6 z-10 flex items-center gap-2 bg-white border border-border rounded-xl shadow-md px-3 py-2">
              <CheckSquare className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-xs font-medium text-foreground whitespace-nowrap">
                Сонгон шалгаруулалтын <span className="font-bold">явцыг</span>,
                хянах.
              </span>
            </div>

            {/* Bar chart mockup */}
            <div className="bg-background rounded-2xl border border-border p-4 mt-2">
              <div className="flex items-center gap-2 mb-4">
                <svg
                  viewBox="0 0 16 16"
                  className="w-4 h-4 text-muted-foreground"
                  fill="currentColor"
                >
                  <rect x="2" y="6" width="3" height="8" rx="1" />
                  <rect x="6.5" y="3" width="3" height="11" rx="1" />
                  <rect x="11" y="1" width="3" height="13" rx="1" />
                </svg>
                <span className="text-xs font-semibold text-foreground">
                  Хугацаагаар хянах
                </span>
                <Info className="w-3.5 h-3.5 text-muted-foreground ml-0.5" />
              </div>

              {/* Y-axis labels + bars */}
              <div className="flex gap-1 items-end h-28 relative">
                {/* Y-axis */}
                <div className="flex flex-col justify-between h-full text-right pr-1 text-xs text-muted-foreground pb-4">
                  {[8, 4, 2, 0].map((v) => (
                    <span key={v}>{v}</span>
                  ))}
                </div>

                {/* Bars */}
                <div className="flex-1 flex items-end gap-1.5 h-full">
                  {barData.map((bar) => (
                    <div
                      key={bar.day}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      <div
                        className="relative w-full flex items-end"
                        style={{ height: "80px" }}
                      >
                        {bar.highlight && (
                          <div
                            className="absolute -top-5 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-bold px-1.5 py-0.5 rounded"
                            style={{ whiteSpace: "nowrap" }}
                          >
                            Дундаж
                          </div>
                        )}
                        <div
                          className={`w-full rounded-t-md transition-all ${bar.highlight ? "bg-[#F58220]" : "bg-[#F58220]/70"}`}
                          style={{ height: `${(bar.value / maxBar) * 80}px` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {bar.day}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Сонгон шалгаруулалт
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Тендерийн шат, шалгаруулалтын үе шат, үр дүнгийн мэдээллийг
                системээс хянах
              </p>
            </div>
          </div>

          {/* Card 4 — Easy social media integration */}
          <div className="bg-secondary rounded-3xl border border-dashed border-border p-7 flex flex-col gap-5 items-center justify-center text-center">
            {/* Social icons stacked */}
            <div className="flex items-center justify-center relative h-28 w-full">
              {/* Discord */}
              <div
                className="absolute w-16 h-16 rounded-2xl shadow-xl flex items-center justify-center"
                style={{
                  background: "#FF0000",
                  transform: "rotate(-18deg) translateX(-64px) translateY(8px)",
                }}
              >
                <svg viewBox="0 0 24 24" className="w-8 h-8" fill="white">
                  <path d="M23.498 6.186a2.995 2.995 0 0 0-2.11-2.11C19.39 3.5 12 3.5 12 3.5s-7.39 0-9.388.576a2.995 2.995 0 0 0-2.11 2.11C0 8.182 0 12 0 12s0 3.818.502 5.814a2.995 2.995 0 0 0 2.11 2.11C4.61 20.5 12 20.5 12 20.5s7.39 0 9.388-.576a2.995 2.995 0 0 0 2.11-2.11C24 15.818 24 12 24 12s0-3.818-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </div>
              {/* Instagram */}
              <div
                className="absolute w-16 h-16 rounded-2xl shadow-xl flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
                  transform: "rotate(-6deg) translateX(-18px) translateY(-4px)",
                }}
              >
                <svg viewBox="0 0 24 24" className="w-8 h-8" fill="white">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                </svg>
              </div>
              {/* Facebook */}
              <div
                className="absolute w-16 h-16 rounded-2xl shadow-xl flex items-center justify-center"
                style={{
                  background: "#1877F2",
                  transform: "rotate(6deg) translateX(28px) translateY(-4px)",
                }}
              >
                <svg viewBox="0 0 24 24" className="w-8 h-8" fill="white">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </div>
              {/* LinkedIn */}
              <div
                className="absolute w-16 h-16 rounded-2xl shadow-xl flex items-center justify-center"
                style={{
                  background: "#0A66C2",
                  transform: "rotate(16deg) translateX(76px) translateY(4px)",
                }}
              >
                <svg viewBox="0 0 24 24" className="w-8 h-8" fill="white">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Сошиал холбоосуудтай холбогдох
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Та манай сошиал холбоосуудаар дамжуулан мэдээ мэдээлэл авах
                боломжтой
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
