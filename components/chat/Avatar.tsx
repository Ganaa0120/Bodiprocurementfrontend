"use client";
import { Users } from "lucide-react";
import type { ConversationSummary, MemberRef, MemberType } from "@/lib/chat/types";
import { colorFor, initials, sameRef } from "./format";
import { C } from "./styles";

/** Хүн = дугуй, компани = бөөрөнхий дөрвөлжин — нэг харахад ялгагдана */
export function Avatar({
  name,
  type,
  id,
  src,
  size = 36,
  online,
  ring = C.panel,
}: {
  name: string;
  type: MemberType;
  id: string;
  src?: string | null;
  size?: number;
  online?: boolean;
  ring?: string;
}) {
  const radius = type === "company" ? Math.round(size * 0.28) : size / 2;
  const dot = Math.max(8, Math.round(size * 0.28));
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          style={{ width: size, height: size, borderRadius: radius, objectFit: "cover", display: "block" }}
        />
      ) : (
        <div
          aria-hidden
          style={{
            width: size,
            height: size,
            borderRadius: radius,
            background: colorFor(`${type}:${id}`),
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: Math.round(size * 0.38),
            fontWeight: 700,
            letterSpacing: "0.02em",
          }}
        >
          {initials(name)}
        </div>
      )}
      {online && (
        <span
          aria-label="Идэвхтэй"
          style={{
            position: "absolute",
            right: -1,
            bottom: -1,
            width: dot,
            height: dot,
            borderRadius: "50%",
            background: C.green,
            border: `2px solid ${ring}`,
          }}
        />
      )}
    </div>
  );
}

export function ConvAvatar({
  conv,
  me,
  size = 44,
  ring,
}: {
  conv: ConversationSummary;
  me: MemberRef;
  size?: number;
  ring?: string;
}) {
  const others = conv.members.filter((m) => !sameRef(m, me));
  if (conv.kind === "direct") {
    const o = others[0];
    if (!o) return <Avatar name={conv.title} type="admin" id={conv.id} size={size} ring={ring} />;
    return <Avatar name={o.name} type={o.type} id={o.id} src={o.avatarUrl} size={size} online={o.online} ring={ring} />;
  }
  if (conv.avatarUrl) return <Avatar name={conv.title} type="admin" id={conv.id} src={conv.avatarUrl} size={size} ring={ring} />;

  const anyOnline = others.some((m) => m.online);
  const [a, b] = others;
  if (!a) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: C.raised,
          color: C.muted,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Users size={size * 0.45} />
      </div>
    );
  }
  const small = Math.round(size * 0.68);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <div style={{ position: "absolute", top: 0, right: 0 }}>
        <Avatar name={(b ?? a).name} type={(b ?? a).type} id={(b ?? a).id} src={(b ?? a).avatarUrl} size={small} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          borderRadius: a.type === "company" ? Math.round(small * 0.28) + 2 : "50%",
          border: `2px solid ${ring ?? C.panel}`,
        }}
      >
        <Avatar name={a.name} type={a.type} id={a.id} src={a.avatarUrl} size={small - 4} />
      </div>
      {anyOnline && (
        <span
          style={{
            position: "absolute",
            right: -1,
            bottom: -1,
            width: 11,
            height: 11,
            borderRadius: "50%",
            background: C.green,
            border: `2px solid ${ring ?? C.panel}`,
          }}
        />
      )}
    </div>
  );
}
