export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2 text-foreground font-semibold text-base">
          <img
            src="/images/Bodi-Group-logo-PNG-ENG-blue.png"
            alt="Logo"
            className="w-32 h-auto"
          />
        </div>
        <nav className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
          <a href="/" className="hover:text-foreground transition-colors">
            Нүүр
          </a>
          <a
            href="#features"
            className="hover:text-foreground transition-colors"
          >
            Бодлого
          </a>
          <a
            href="#pricing"
            className="hover:text-foreground transition-colors"
          >
            Дүрэм журам
          </a>
          <a href="#blog" className="hover:text-foreground transition-colors">
            Холбоо барих
          </a>
        </nav>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Бодь Групп ХХК бүх эрх хуулиар
          хамгаалагдсан.
        </p>
      </div>
    </footer>
  );
}

import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";

export function CtaSection() {
  return (
    <div className="relative mx-auto flex w-full max-w-7xl items-center justify-center">
      <DottedGlowBackground
        className="pointer-events-none mask-radial-to-90% mask-radial-at-center opacity-20 dark:opacity-100"
        opacity={1}
        gap={10}
        radius={1.6}
        colorLightVar="--color-neutral-500"
        glowColorLightVar="--color-neutral-600"
        colorDarkVar="--color-neutral-500"
        glowColorDarkVar="--color-sky-800"
        backgroundOpacity={0}
        speedMin={0.3}
        speedMax={1.6}
        speedScale={1}
      />

      <div className="relative z-10 flex w-full flex-col items-center justify-between space-y-6 px-8 py-16 text-center md:flex-row">
        <div>
          <h2 className="text-center text-4xl font-normal tracking-tight text-slate-700 sm:text-5xl md:text-left dark:text-neutral-400">
            Та бидэнтэй хамтран{" "}
            <span className="font-bold dark:text-white">
              ажиллахад бэлэн үү
            </span>
            ?
          </h2>
          <p className="mt-4 max-w-lg text-center text-base text-neutral-600 md:text-left dark:text-neutral-300">
            Бодь Групп-ийн худалдан авалтын системд бүртгүүлж, урт хугацааны
            найдвартай түншлэлийг эхлүүлнэ үү.
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <a
            href="/register"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#0C72BA] text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity shadow-lg"
          >
            Бүртгэл үүсгэх →
          </a>
        </div>
      </div>
    </div>
  );
}
