"use client";
import { Clock } from "lucide-react";
import { getTypeCfg } from "./types";

interface Props {
  ann: any;
  onClick: (id: string) => void;
}

export default function AnnouncementCard({ ann, onClick }: Props) {
  const tc = getTypeCfg(ann.ann_type);

  return (
    <div
      onClick={() => onClick(ann.id)}
      style={{
        background: "white",
        borderRadius: 16,
        padding: "18px 20px",
        border: `1px solid ${tc.border}`,
        borderLeft: `3px solid ${tc.color}`,
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        cursor: "pointer",
        transition: "all .15s",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.boxShadow = "0 6px 20px rgba(0,0,0,0.09)";
        el.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
        el.style.transform = "translateY(0)";
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            flexShrink: 0,
            background: tc.bg,
            border: `1px solid ${tc.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
          }}
        >
          {tc.emoji}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              gap: 6,
              flexWrap: "wrap" as const,
              marginBottom: 5,
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: 99,
                background: tc.bg,
                color: tc.color,
                border: `1px solid ${tc.border}`,
              }}
            >
              {tc.label}
            </span>
            {ann.is_urgent && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 99,
                  background: "#fef2f2",
                  color: "#ef4444",
                  border: "1px solid #fecaca",
                }}
              >
                ⚡ Яаралтай
              </span>
            )}
          </div>

          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#0f172a",
              marginBottom: 5,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap" as const,
            }}
          >
            {ann.title}
          </div>

          {ann.description && (
            <p
              style={{
                fontSize: 12,
                color: "#64748b",
                margin: "0 0 6px",
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
                .slice(0, 120)}
            </p>
          )}

          <div
            style={{ display: "flex", gap: 14, flexWrap: "wrap" as const }}
          >
            {ann.category_name && (
              <span style={{ fontSize: 11, color: "#94a3b8" }}>
                📁 {ann.category_name}
              </span>
            )}
            {(ann.budget_from || ann.budget_to) && (
              <span style={{ fontSize: 11, color: "#94a3b8" }}>
                💰 {ann.budget_from?.toLocaleString()}
                {ann.budget_to ? ` — ${ann.budget_to.toLocaleString()}` : ""}{" "}
                {ann.currency}
              </span>
            )}
            {ann.deadline && (
              <span
                style={{
                  fontSize: 11,
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  color:
                    new Date(ann.deadline) < new Date() ? "#ef4444" : "#94a3b8",
                }}
              >
                <Clock size={10} />
                {new Date(ann.deadline).toLocaleDateString("mn-MN")}
              </span>
            )}
            {ann.ann_type === "rfq" && ann.rfq_quantity && (
              <span style={{ fontSize: 11, color: "#94a3b8" }}>
                📦 {ann.rfq_quantity} {ann.rfq_unit}
              </span>
            )}
          </div>
        </div>

        <div style={{ flexShrink: 0, textAlign: "right" as const }}>
          <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 4 }}>
            {new Date(ann.created_at).toLocaleDateString("mn-MN")}
          </div>
          {ann.created_by_name && (
            <div style={{ fontSize: 10, color: "#cbd5e1" }}>
              {ann.created_by_name}
            </div>
          )}
          <div
            style={{
              marginTop: 8,
              fontSize: 11,
              fontWeight: 600,
              color: tc.color,
              display: "flex",
              alignItems: "center",
              gap: 3,
              justifyContent: "flex-end",
            }}
          >
            Харах →
          </div>
        </div>
      </div>
    </div>
  );
}