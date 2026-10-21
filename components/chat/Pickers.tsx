"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Building2, Check, FileText, Search, ShieldCheck, User, X } from "lucide-react";
import type { AnnouncementRef, MemberInfo, MemberRef } from "@/lib/chat/types";
import { chatApi } from "./api";
import { Avatar } from "./Avatar";
import { refKey } from "./format";
import { C } from "./styles";
import { Spinner, inputStyle } from "./ui";

function useDebounced<T>(value: T, ms = 250): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

type Kind = "all" | "admin" | "person" | "company";

export function DirectoryPicker({
  multiple,
  selected,
  onChange,
  exclude = [],
  allowSuppliers,
  autoFocus,
}: {
  multiple: boolean;
  selected: MemberInfo[];
  onChange: (next: MemberInfo[]) => void;
  exclude?: MemberRef[];
  allowSuppliers: boolean;
  autoFocus?: boolean;
}) {
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<Kind>("all");
  const [items, setItems] = useState<MemberInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dq = useDebounced(q);
  const reqId = useRef(0);

  useEffect(() => {
    const id = ++reqId.current;
    setLoading(true);
    setError(null);
    chatApi
      .directory(dq, allowSuppliers ? kind : "admin")
      .then((r) => id === reqId.current && setItems(r.items))
      .catch((e) => id === reqId.current && setError(e.message))
      .finally(() => id === reqId.current && setLoading(false));
  }, [dq, kind, allowSuppliers]);

  const excluded = new Set(exclude.map(refKey));
  const sel = new Set(selected.map(refKey));
  const visible = items.filter((m) => !excluded.has(refKey(m)));

  const toggle = (m: MemberInfo) => {
    if (sel.has(refKey(m))) onChange(selected.filter((x) => refKey(x) !== refKey(m)));
    else onChange(multiple ? [...selected, m] : [m]);
  };

  const admins = visible.filter((m) => m.type === "admin");
  const persons = visible.filter((m) => m.type === "person");
  const companies = visible.filter((m) => m.type === "company");

  const renderRow = (m: MemberInfo) => {
    const on = sel.has(refKey(m));
    return (
      <button
        key={refKey(m)}
        type="button"
        className="bc-pick"
        onClick={() => toggle(m)}
        aria-pressed={on}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 11,
          width: "100%",
          padding: "8px 8px",
          border: "none",
          borderRadius: 10,
          background: on ? C.blueSoft : "transparent",
          color: "inherit",
          textAlign: "left",
          cursor: "pointer",
        }}
      >
        <Avatar name={m.name} type={m.type} id={m.id} src={m.avatarUrl} size={36} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {m.name}
          </div>
          {m.subtitle && (
            <div style={{ fontSize: 11.5, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {m.subtitle}
            </div>
          )}
        </div>
        <span
          aria-hidden
          style={{
            width: 20,
            height: 20,
            borderRadius: multiple ? 6 : 99,
            border: `2px solid ${on ? C.blue : C.borderStrong}`,
            background: on ? C.blue : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {on && <Check size={12} color="#fff" strokeWidth={3} />}
        </span>
      </button>
    );
  };

  return (
    <div>
      {selected.length > 0 && multiple && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {selected.map((m) => (
            <span
              key={refKey(m)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "3px 6px 3px 4px",
                borderRadius: 99,
                background: C.blueSoft,
                color: C.blueText,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <Avatar name={m.name} type={m.type} id={m.id} size={20} />
              {m.name}
              <button
                type="button"
                aria-label={`${m.name}-г хасах`}
                onClick={() => toggle(m)}
                style={{ border: "none", background: "none", color: "inherit", cursor: "pointer", display: "flex", padding: 0 }}
              >
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div style={{ position: "relative", marginBottom: 10 }}>
        <Search size={15} style={{ position: "absolute", left: 12, top: 11, color: C.faint }} />
        <input
          className="bc-input"
          autoFocus={autoFocus}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={allowSuppliers ? "Нэр, имэйл, компаниар хайх" : "Ажилтны нэр, имэйлээр хайх"}
          aria-label="Хүн хайх"
          style={{ ...inputStyle, paddingLeft: 36 }}
        />
      </div>

      {allowSuppliers && (
        <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
          {(
            [
              ["all", "Бүгд", null],
              ["admin", "Ажилтан", <ShieldCheck key="a" size={12} />],
              ["person", "Хувь хүн", <User key="u" size={12} />],
              ["company", "Компани", <Building2 key="b" size={12} />],
            ] as const
          ).map(([k, label, icon]) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              aria-pressed={kind === k}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 11px",
                borderRadius: 99,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                border: `1px solid ${kind === k ? "transparent" : C.border}`,
                background: kind === k ? C.blueSoft : "transparent",
                color: kind === k ? C.blueText : C.muted,
              }}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="bc-scroll" style={{ maxHeight: 320, overflowY: "auto", margin: "0 -6px", padding: "0 6px" }}>
        {loading && !items.length && (
          <div style={{ display: "flex", justifyContent: "center", padding: 20 }}>
            <Spinner />
          </div>
        )}
        {error && <div style={{ color: C.red, fontSize: 12.5, padding: 8 }}>{error}</div>}
        {!loading && !error && visible.length === 0 && (
          <div style={{ color: C.muted, fontSize: 13, padding: "18px 8px", textAlign: "center" }}>
            {q ? `"${q}" нэртэй хэрэглэгч олдсонгүй` : "Хэрэглэгч алга"}
          </div>
        )}
        {admins.length > 0 && (
          <>
            {allowSuppliers && kind === "all" && <GroupLabel icon={<ShieldCheck size={12} />}>Ажилтан</GroupLabel>}
            {admins.map(renderRow)}
          </>
        )}
        {persons.length > 0 && (
          <>
            {kind === "all" && <GroupLabel icon={<User size={12} />}>Хувь хүн нийлүүлэгч</GroupLabel>}
            {persons.map(renderRow)}
          </>
        )}
        {companies.length > 0 && (
          <>
            {kind === "all" && <GroupLabel icon={<Building2 size={12} />}>Компани нийлүүлэгч</GroupLabel>}
            {companies.map(renderRow)}
          </>
        )}
      </div>
    </div>
  );
}

function GroupLabel({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 600, color: C.faint, padding: "10px 8px 4px" }}>
      {icon}
      {children}
    </div>
  );
}

export function AnnouncementPicker({
  value,
  onChange,
}: {
  value: AnnouncementRef | null;
  onChange: (v: AnnouncementRef | null) => void;
}) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<AnnouncementRef[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dq = useDebounced(q);
  const reqId = useRef(0);

  useEffect(() => {
    if (!open) return;
    const id = ++reqId.current;
    setLoading(true);
    chatApi
      .announcements(dq)
      .then((r) => id === reqId.current && setItems(r.items))
      .catch(() => id === reqId.current && setItems([]))
      .finally(() => id === reqId.current && setLoading(false));
  }, [dq, open]);

  if (value) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "9px 10px",
          borderRadius: 10,
          background: C.amberSoft,
          color: C.amber,
          fontSize: 13,
        }}
      >
        <FileText size={15} style={{ flexShrink: 0 }} />
        <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600 }}>
          {value.title}
        </span>
        <button
          type="button"
          onClick={() => onChange(null)}
          aria-label="Тендерийн холбоос салгах"
          style={{ border: "none", background: "none", color: "inherit", cursor: "pointer", display: "flex", padding: 2 }}
        >
          <X size={15} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <input
        className="bc-input"
        value={q}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        placeholder="Тендер/зарын нэр эсвэл дугаараар хайх"
        aria-label="Тендер хайх"
        style={inputStyle}
      />
      {open && (
        <div className="bc-scroll" style={{ maxHeight: 180, overflowY: "auto", marginTop: 6 }}>
          {loading && (
            <div style={{ padding: 10, display: "flex", justifyContent: "center" }}>
              <Spinner size={16} />
            </div>
          )}
          {!loading && items.length === 0 && (
            <div style={{ fontSize: 12.5, color: C.muted, padding: 8 }}>Тохирох тендер олдсонгүй</div>
          )}
          {!loading &&
            items.map((a) => (
              <button
                key={a.id}
                type="button"
                className="bc-pick"
                onClick={() => {
                  onChange(a);
                  setOpen(false);
                  setQ("");
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  padding: "8px 8px",
                  border: "none",
                  borderRadius: 8,
                  background: "transparent",
                  color: C.text2,
                  fontSize: 13,
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <FileText size={14} style={{ color: C.amber, flexShrink: 0 }} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title}</span>
                <span style={{ marginLeft: "auto", fontSize: 11, color: C.faint, flexShrink: 0 }}>#{a.id}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
