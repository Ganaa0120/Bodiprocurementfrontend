"use client";
import { Clock, Eye, Zap } from "lucide-react";
import { getTypeCfg } from "./types";

interface Props {
  ann: any;
  onClick: (id: string) => void;
}

export default function AnnouncementCard({ ann, onClick }: Props) {
  const tc = getTypeCfg(ann.ann_type);
  const isDeadlinePassed = ann.deadline && new Date(ann.deadline) < new Date();

  return (
    <div
      onClick={() => onClick(ann.id)}
      style={{
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(10px)",
        borderRadius: 20,
        padding: "20px 22px",
        border: `1px solid ${tc.border || "rgba(255,255,255,0.08)"}`,
        borderLeft: `3px solid ${tc.color || "#818cf8"}`,
        boxShadow: `0 2px 8px rgba(0,0,0,0.2), 0 0 0 1px ${tc.color || "#818cf8"}05`,
        cursor: "pointer",
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.boxShadow = `0 8px 24px rgba(0,0,0,0.4), 0 0 20px ${tc.color || "#818cf8"}15`;
        el.style.transform = "translateY(-2px)";
        el.style.borderColor = `${tc.color || "#818cf8"}40`;
        el.style.background = "rgba(255,255,255,0.05)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.boxShadow = `0 2px 8px rgba(0,0,0,0.2), 0 0 0 1px ${tc.color || "#818cf8"}05`;
        el.style.transform = "translateY(0)";
        el.style.borderColor = tc.border || "rgba(255,255,255,0.08)";
        el.style.background = "rgba(255,255,255,0.03)";
      }}
    >
      {/* Background glow for special types */}
      {ann.ann_type === "rfq" && (
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${tc.color || "#818cf8"}10, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
      )}

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 16,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            flexShrink: 0,
            background: tc.bg || `rgba(99,102,241,0.12)`,
            border: `1px solid ${tc.border || "rgba(99,102,241,0.25)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
          }}
        >
          {tc.emoji || "📢"}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Badges */}
          <div
            style={{
              display: "flex",
              gap: 6,
              flexWrap: "wrap" as const,
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                padding: "3px 10px",
                borderRadius: 99,
                background: tc.bg || "rgba(99,102,241,0.12)",
                color: tc.color || "#a5b4fc",
                border: `1px solid ${tc.border || "rgba(99,102,241,0.25)"}`,
                letterSpacing: "0.02em",
              }}
            >
              {tc.label || ann.ann_type}
            </span>

            {ann.is_urgent && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: 99,
                  background: "rgba(239,68,68,0.12)",
                  color: "#fca5a5",
                  border: "1px solid rgba(239,68,68,0.25)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Zap size={10} style={{ fill: "#fca5a5" }} /> Яаралтай
              </span>
            )}

            {isDeadlinePassed && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  padding: "3px 10px",
                  borderRadius: 99,
                  background: "rgba(148,163,184,0.08)",
                  color: "rgba(148,163,184,0.6)",
                  border: "1px solid rgba(148,163,184,0.15)",
                }}
              >
                Дууссан
              </span>
            )}
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "rgba(255,255,255,0.9)",
              marginBottom: 6,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap" as const,
              letterSpacing: "-0.01em",
            }}
          >
            {ann.title || "Нэргүй зарлал"}
          </div>

          {/* Description */}
          {ann.description && (
            <p
              style={{
                fontSize: 12,
                color: "rgba(148,163,184,0.6)",
                margin: "0 0 8px",
                lineHeight: 1.5,
                overflow: "hidden",
                display: "-webkit-box" as const,
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical" as const,
              }}
            >
              {ann.description
                .replace(/<[^>]*>/g, " ")
                .replace(/\s+/g, " ")
                .trim()
                .slice(0, 130)}
            </p>
          )}

          {/* Info chips */}
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap" as const,
              alignItems: "center",
            }}
          >
            {ann.category_name && (
              <span
                style={{
                  fontSize: 11,
                  color: "rgba(148,163,184,0.5)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                📁 {ann.category_name}
              </span>
            )}

            {(ann.budget_from || ann.budget_to) && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#34d399",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  background: "rgba(16,185,129,0.08)",
                  padding: "3px 10px",
                  borderRadius: 8,
                  border: "1px solid rgba(16,185,129,0.2)",
                }}
              >
                💰 {ann.budget_from?.toLocaleString()}
                {ann.budget_to
                  ? ` — ${ann.budget_to.toLocaleString()}`
                  : ""}{" "}
                <span style={{ fontWeight: 400, opacity: 0.7 }}>
                  {ann.currency || "MNT"}
                </span>
              </span>
            )}

            {ann.deadline && (
              <span
                style={{
                  fontSize: 11,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  color: isDeadlinePassed ? "#f87171" : "rgba(148,163,184,0.5)",
                }}
              >
                <Clock size={11} />
                {new Date(ann.deadline).toLocaleDateString("mn-MN")}
              </span>
            )}

            {ann.ann_type === "rfq" && ann.rfq_quantity && (
              <span
                style={{
                  fontSize: 11,
                  color: "rgba(148,163,184,0.5)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                📦 {ann.rfq_quantity} {ann.rfq_unit}
              </span>
            )}
          </div>
        </div>

        {/* Right side - Date + Action */}
        <div
          style={{ flexShrink: 0, textAlign: "right" as const, minWidth: 80 }}
        >
          <div
            style={{
              fontSize: 10,
              color: "rgba(148,163,184,0.4)",
              marginBottom: 4,
            }}
          >
            {new Date(ann.created_at).toLocaleDateString("mn-MN")}
          </div>
          {ann.created_by_name && (
            <div style={{ fontSize: 10, color: "rgba(148,163,184,0.3)" }}>
              {ann.created_by_name}
            </div>
          )}
          <div
            style={{
              marginTop: 10,
              fontSize: 11,
              fontWeight: 600,
              color: tc.color || "#a5b4fc",
              display: "flex",
              alignItems: "center",
              gap: 4,
              justifyContent: "flex-end",
              opacity: 0.8,
            }}
          >
            <Eye size={12} />
            Харах
          </div>
        </div>
      </div>
    </div>
  );
}
