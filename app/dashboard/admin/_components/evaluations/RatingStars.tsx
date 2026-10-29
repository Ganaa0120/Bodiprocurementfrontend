"use client";
// 100 онооны үнэлгээг 5 одоор харуулна (жишээ: 83 → ★★★★☆ 4.2)
import React from "react";

export const toStars = (score100: number | null | undefined) =>
  score100 == null ? null : Math.round((score100 / 20) * 10) / 10;

export function RatingStars({
  score,
  count,
  size = 14,
  showValue = true,
  emptyLabel = "Үнэлгээгүй",
}: {
  /** 0–100 оноо */
  score: number | null | undefined;
  /** Хэдэн ажилд суурилсан (заавал биш) */
  count?: number | null;
  size?: number;
  showValue?: boolean;
  emptyLabel?: string;
}) {
  const stars = toStars(score);
  if (stars == null) {
    return <span style={{ fontSize: size - 2, color: "#64748b" }}>{emptyLabel}</span>;
  }
  return (
    <span
      title={`${stars} / 5 (${score} / 100)${count ? ` · ${count} ажил` : ""}`}
      style={{ display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}
    >
      <span style={{ display: "inline-flex", gap: 1 }} aria-label={`${stars} од`}>
        {[1, 2, 3, 4, 5].map((i) => {
          const fill = Math.max(0, Math.min(1, stars - (i - 1)));
          return (
            <span key={i} style={{ position: "relative", width: size, height: size, lineHeight: 0 }}>
              <Star size={size} color="rgba(148,163,184,0.35)" />
              <span style={{ position: "absolute", inset: 0, width: `${fill * 100}%`, overflow: "hidden" }}>
                <Star size={size} color="#fbbf24" />
              </span>
            </span>
          );
        })}
      </span>
      {showValue && (
        <span style={{ fontSize: size - 1, fontWeight: 700, color: "#fbbf24" }}>
          {stars.toFixed(1)}
          {count != null && <span style={{ fontWeight: 400, color: "#64748b" }}> ({count})</span>}
        </span>
      )}
    </span>
  );
}

function Star({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M12 2.5l2.94 6.1 6.56.9-4.78 4.6 1.16 6.6L12 17.6l-5.88 3.1 1.16-6.6L2.5 9.5l6.56-.9L12 2.5z" />
    </svg>
  );
}