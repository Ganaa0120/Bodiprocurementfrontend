"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Нүүр", hash: false },
  { href: "#features", label: "Бодлого", hash: true },
  { href: "#HowItWorks", label: "Дүрэм журам", hash: true },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeHash, setActiveHash] = useState<string>("");
  const pathname = usePathname();

  const isActive = (href: string, hash: boolean) => {
    if (!hash) return pathname === href && activeHash === "";
    return activeHash === href;
  };

  const handleClick = (href: string, hash: boolean) => {
    if (hash) {
      setActiveHash(href);
    } else {
      setActiveHash("");
    }
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          onClick={() => setActiveHash("")}
          className="flex items-center gap-2 font-semibold text-foreground text-lg"
        >
          <img
            src="/images/Bodi-Group-logo-PNG-ENG-blue.png"
            alt="Logo"
            className="w-32 h-auto"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(({ href, label, hash }) => (
            <Link
              key={href}
              href={href}
              onClick={() => handleClick(href, hash)}
              className={cn(
                "text-sm font-medium transition-colors relative pb-0.5",
                isActive(href, hash)
                  ? "text-[#0C72BA]"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
              {isActive(href, hash) && (
                <span className="absolute -bottom-[1px] left-0 right-0 h-0.5 rounded-full bg-[#0C72BA]" />
              )}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href="/login"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-md bg-[#0C72BA] text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Нэвтрэх →
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-background border-b border-border px-6 pb-4 flex flex-col gap-1">
          {navLinks.map(({ href, label, hash }) => (
            <Link
              key={href}
              href={href}
              onClick={() => handleClick(href, hash)}
              className={cn(
                "text-sm font-medium py-2.5 px-3 rounded-lg transition-colors",
                isActive(href, hash)
                  ? "text-[#0C72BA] bg-blue-50"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/login"
            className="mt-2 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-md bg-[#0C72BA] text-primary-foreground text-sm font-semibold justify-center"
          >
            Нэвтрэх →
          </Link>
        </div>
      )}
    </header>
  );
}
