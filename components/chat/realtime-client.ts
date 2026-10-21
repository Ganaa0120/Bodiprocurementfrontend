"use client";
// supplier-backend дээрх Socket.io-той холбогдоно.
// Server талд: холбогдмогц хэрэглэгчийг өөрийн room-д оруулж, чатын event-үүдийг тэр room руу илгээнэ.
import { io, type Socket } from "socket.io-client";
import { CHAT_EVENTS, type ChatEventName, type MemberRef, type TypingPayload } from "@/lib/chat/types";
import { API_BASE, authToken } from "./api";

export type ConnState = "connecting" | "connected" | "disconnected" | "polling";

export interface RealtimeHandlers {
  onEvent: (event: ChatEventName, data: unknown) => void;
  onTyping: (conversationId: string, data: TypingPayload) => void;
  onState: (s: ConnState) => void;
  /** Холболт тасраад сэргэх үед — алдагдсан event-үүдийг нөхөж татна */
  onResync: () => void;
}

export class RealtimeClient {
  private socket: Socket | null = null;
  private convId: string | null = null;

  constructor(
    private me: MemberRef,
    private h: RealtimeHandlers,
  ) {}

  /** false буцаавал realtime унтраалттай — store polling ашиглана */
  start(): boolean {
    if (process.env.NEXT_PUBLIC_CHAT_REALTIME === "off") return false;

    const token = authToken();
    this.socket = io(API_BASE, {
      path: "/socket.io",
      withCredentials: true,
      auth: token ? { token } : {},
      transports: ["websocket", "polling"],
      reconnectionDelayMax: 10_000,
    });

    let dropped = false;
    this.h.onState("connecting");

    this.socket.on("connect", () => {
      this.h.onState("connected");
      if (this.convId) this.socket?.emit("conv:join", this.convId);
      if (dropped) {
        dropped = false;
        this.h.onResync();
      }
    });
    this.socket.on("disconnect", () => {
      dropped = true;
      this.h.onState("disconnected");
    });
    this.socket.on("connect_error", () => {
      dropped = true;
      this.h.onState("disconnected");
    });

    for (const ev of CHAT_EVENTS) this.socket.on(ev, (d: unknown) => this.h.onEvent(ev, d));

    this.socket.on("typing", (d: TypingPayload & { conversationId: string }) => {
      if (d?.conversationId) this.h.onTyping(d.conversationId, d);
    });
    return true;
  }

  watchConversation(id: string | null) {
    if (this.convId === id) return;
    if (this.convId) this.socket?.emit("conv:leave", this.convId);
    this.convId = id;
    if (id) this.socket?.emit("conv:join", id);
  }

  sendTyping(id: string, _payload: TypingPayload) {
    // Хэн бичиж байгааг server token-оос өөрөө тодорхойлно (хуурамч нэр илгээх боломжгүй)
    if (this.convId === id && this.socket?.connected) this.socket.emit("typing", { conversationId: id });
  }

  stop() {
    this.socket?.disconnect();
    this.socket = null;
    this.convId = null;
  }
}
