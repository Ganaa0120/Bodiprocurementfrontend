"use client";
import { useEffect, useState, type ComponentType } from "react";
import {
  Loader2,
  FileText,
  Search,
  RefreshCw,
  Sparkles,
  Megaphone,
} from "lucide-react";
import AnnouncementCard from "./AnnouncementCard";
import AnnouncementDetailModal from "./AnnouncementDetailModal";
import BidModal from "./BidModal";
import { API, getTypeCfg, TYPE_CFG } from "./types";

const TABS = [
  { key: "all", label: "Бүгд", icon: "📋" },
  { key: "open", label: "Нээлттэй", icon: "🌐" },
  { key: "targeted", label: "Хаалттай", icon: "🔒" },
  { key: "rfq", label: "Үнийн санал", icon: "💰" },
];

const TypedBidModal = BidModal as ComponentType<{
  selected: any;
  user: any;
  onClose: () => void;
}>;

export default function PersonAnnouncementsPage() {
  const [anns, setAnns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeF, setTypeF] = useState("all");
  const [selected, setSelected] = useState<any>(null);
  const [detLoading, setDetLoading] = useState(false);
  const [bidModal, setBidModal] = useState(false);
  const [user, setUser] = useState<any>(null);

  const load = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    try {
      const p = new URLSearchParams({ status: "published", limit: "100" });
      const d = await fetch(`${API}/api/announcements?${p}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json());
      if (d.success) setAnns(d.announcements ?? []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) {
      try {
        setUser(JSON.parse(u));
      } catch {}
    }
    load();
  }, []);

  const openDetail = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setDetLoading(true);
    try {
      const d = await fetch(`${API}/api/announcements/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json());
      if (d.success) setSelected(d.announcement);
    } catch {
    } finally {
      setDetLoading(false);
    }
  };

  const counts = {
    all: anns.length,
    open: anns.filter((a) => a.ann_type === "open").length,
    targeted: anns.filter((a) => a.ann_type === "targeted").length,
    rfq: anns.filter((a) => a.ann_type === "rfq").length,
  };

  const filtered = anns.filter((a) => {
    const matchType = typeF === "all" || a.ann_type === typeF;
    const q = search.toLowerCase();
    const matchQ =
      !q ||
      a.title?.toLowerCase().includes(q) ||
      a.description?.toLowerCase().includes(q);
    return matchType && matchQ;
  });

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "0" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.94) translateY(8px) }
          to   { opacity: 1; transform: scale(1) translateY(0) }
        }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes glow { 0%,100% { box-shadow: 0 0 5px rgba(99,102,241,0.2); } 50% { box-shadow: 0 0 20px rgba(99,102,241,0.4); } }
      `}</style>

      {/* Modals */}
      {(selected || detLoading) && (
        <AnnouncementDetailModal
          selected={selected}
          detLoading={detLoading}
          onClose={() => setSelected(null)}
          onBid={() => {
            setBidModal(true);
          }}
        />
      )}

      {/* BidModal — заавал нэмнэ! */}
      {bidModal && selected && (
        <TypedBidModal
          selected={selected}
          user={user}
          onClose={() => {
            setBidModal(false);
            setSelected(null); // detail modal-ыг ч хаана
          }}
        />
      )}

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 6,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background:
                "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))",
              border: "1px solid rgba(99,102,241,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Megaphone size={18} style={{ color: "#a5b4fc" }} />
          </div>
          <div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "rgba(255,255,255,0.92)",
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              Зарлалууд
            </h1>
            <p
              style={{
                fontSize: 12,
                color: "rgba(148,163,184,0.5)",
                margin: "2px 0 0",
              }}
            >
              Нийт нийтлэгдсэн худалдан авалтын зарлалууд
            </p>
          </div>
        </div>
      </div>

      {/* Tabs + Search Row */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 20,
          flexWrap: "wrap" as const,
          alignItems: "center",
        }}
      >
        {TABS.map(({ key, label, icon }) => {
          const tc = key === "all" ? null : getTypeCfg(key);
          const cnt = counts[key as keyof typeof counts];
          const active = typeF === key;
          return (
            <button
              key={key}
              onClick={() => setTypeF(key)}
              style={{
                padding: "9px 16px",
                borderRadius: 12,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                gap: 6,
                border: active
                  ? `1.5px solid ${tc?.color ?? "rgba(129,140,248,0.5)"}`
                  : "1px solid rgba(255,255,255,0.08)",
                background: active
                  ? `${tc?.color ?? "rgba(99,102,241,0.15)"}20`
                  : "rgba(255,255,255,0.03)",
                color: active
                  ? (tc?.color ?? "#a5b4fc")
                  : "rgba(148,163,184,0.6)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.8)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.color = "rgba(148,163,184,0.6)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                }
              }}
            >
              <span style={{ fontSize: 15 }}>{icon}</span>
              {label}
              {cnt > 0 && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 99,
                    lineHeight: "16px",
                    background: active
                      ? (tc?.color ?? "#6366f1")
                      : "rgba(255,255,255,0.06)",
                    color: active ? "white" : "rgba(148,163,184,0.6)",
                  }}
                >
                  {cnt}
                </span>
              )}
            </button>
          );
        })}

        {/* Search + Refresh */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <div style={{ position: "relative" }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "rgba(148,163,184,0.4)",
                pointerEvents: "none",
              }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Зарлал хайх..."
              style={{
                padding: "9px 14px 9px 36px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.1)",
                fontSize: 12,
                outline: "none",
                background: "rgba(255,255,255,0.04)",
                color: "rgba(255,255,255,0.85)",
                width: 200,
                boxSizing: "border-box" as const,
                transition: "all 0.2s",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)";
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              }}
            />
          </div>
          <button
            onClick={load}
            style={{
              padding: "9px 12px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.04)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
            }}
          >
            <RefreshCw
              size={14}
              style={{
                color: "rgba(148,163,184,0.5)",
                animation: loading ? "spin 1s linear infinite" : undefined,
              }}
            />
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 80,
            gap: 12,
          }}
        >
          <Loader2
            size={28}
            style={{ color: "#a5b4fc", animation: "spin .8s linear infinite" }}
          />
          <span style={{ fontSize: 13, color: "rgba(148,163,184,0.5)" }}>
            Зарлалуудыг ачаалж байна...
          </span>
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center" as const,
            padding: "80px 20px",
            background: "rgba(255,255,255,0.03)",
            borderRadius: 24,
            border: "1px solid rgba(255,255,255,0.06)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <FileText size={28} style={{ color: "rgba(148,163,184,0.3)" }} />
          </div>
          <p
            style={{
              fontSize: 14,
              color: "rgba(148,163,184,0.5)",
              margin: 0,
              fontWeight: 500,
            }}
          >
            {search
              ? "Хайлтад тохирох зарлал олдсонгүй"
              : "Зарлал байхгүй байна"}
          </p>
          <p
            style={{
              fontSize: 12,
              color: "rgba(148,163,184,0.3)",
              margin: "4px 0 0",
            }}
          >
            {search
              ? "Өөр түлхүүр үгээр хайна уу"
              : "Шинэ зарлал нийтлэгдэх үед энд харагдах болно"}
          </p>
        </div>
      ) : (
        <div
          style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}
        >
          {filtered.map((a, idx) => (
            <div
              key={a.id}
              style={{ animation: `slideUp 0.3s ease ${idx * 0.05}s both` }}
            >
              <AnnouncementCard ann={a} onClick={openDetail} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
