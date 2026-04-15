"use client";
import { useEffect, useState } from "react";
import { Loader2, FileText, Search, RefreshCw } from "lucide-react";
import AnnouncementCard from "./AnnouncementCard";
import AnnouncementDetailModal from "./AnnouncementDetailModal";
import BidModal from "./BidModal";
import { API, getTypeCfg, TYPE_CFG } from "./types";

const TABS = [
  { key: "all", label: "Бүгд" },
  { key: "open", label: "Нээлттэй" },
  { key: "targeted", label: "Хаалттай" },
  { key: "rfq", label: "Үнийн санал" },
];

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
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.94) translateY(8px) }
          to   { opacity: 1; transform: scale(1) translateY(0) }
        }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
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

      {bidModal && selected && (
        <BidModal
          selected={selected}
          user={user}
          onClose={() => setBidModal(false)}
        />
      )}

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "#0f172a",
            margin: "0 0 4px",
          }}
        >
          Зарлалууд
        </h1>
        <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
          Нийт нийтлэгдсэн худалдан авалтын зарлалууд
        </p>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 16,
          flexWrap: "wrap" as const,
        }}
      >
        {TABS.map(({ key, label }) => {
          const tc = key === "all" ? null : getTypeCfg(key);
          const cnt = counts[key as keyof typeof counts];
          const active = typeF === key;
          return (
            <button
              key={key}
              onClick={() => setTypeF(key)}
              style={{
                padding: "8px 14px",
                borderRadius: 10,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 500,
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                gap: 6,
                border: active
                  ? `1.5px solid ${tc?.color ?? "#6366f1"}`
                  : "1.5px solid #e2e8f0",
                background: active ? `${tc?.color ?? "#6366f1"}10` : "white",
                color: active ? (tc?.color ?? "#6366f1") : "#64748b",
              }}
            >
              {tc && <span>{tc.emoji}</span>}
              {label}
              {cnt > 0 && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "1px 6px",
                    borderRadius: 99,
                    lineHeight: "16px",
                    background: active ? (tc?.color ?? "#6366f1") : "#f1f5f9",
                    color: active ? "white" : "#64748b",
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
              size={13}
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
              }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Хайх..."
              style={{
                padding: "8px 12px 8px 32px",
                borderRadius: 10,
                border: "1.5px solid #e2e8f0",
                fontSize: 12,
                outline: "none",
                background: "white",
                width: 180,
                boxSizing: "border-box" as const,
              }}
              onFocus={(e) =>
                ((e.target as HTMLElement).style.borderColor = "#6366f1")
              }
              onBlur={(e) =>
                ((e.target as HTMLElement).style.borderColor = "#e2e8f0")
              }
            />
          </div>
          <button
            onClick={load}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid #e2e8f0",
              background: "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <RefreshCw
              size={13}
              style={{
                color: "#64748b",
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
            justifyContent: "center",
            padding: 56,
            gap: 10,
          }}
        >
          <Loader2
            size={20}
            style={{ color: "#6366f1", animation: "spin .8s linear infinite" }}
          />
          <span style={{ fontSize: 13, color: "#94a3b8" }}>
            Ачаалж байна...
          </span>
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center" as const,
            padding: "56px 0",
            background: "white",
            borderRadius: 18,
            border: "1px solid #f1f5f9",
          }}
        >
          <FileText
            size={32}
            style={{
              color: "#e2e8f0",
              display: "block",
              margin: "0 auto 12px",
            }}
          />
          <p style={{ fontSize: 13, color: "#cbd5e1", margin: 0 }}>
            {search
              ? "Хайлтад тохирох зарлал олдсонгүй"
              : "Зарлал байхгүй байна"}
          </p>
        </div>
      ) : (
        <div
          style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}
        >
          {filtered.map((a) => (
            <AnnouncementCard key={a.id} ann={a} onClick={openDetail} />
          ))}
        </div>
      )}
    </div>
  );
}
