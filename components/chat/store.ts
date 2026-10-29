"use client";
import { useSyncExternalStore } from "react";
import type {
  Attachment,
  ChatEventName,
  ChatMessage,
  ConversationEventPayload,
  ConversationSummary,
  LastMessagePreview,
  MeInfo,
  MemberRef,
  MessageEventPayload,
  ReadEventPayload,
  ReplyPreview,
  TypingPayload,
} from "@/lib/chat/types";
import { ApiError, chatApi } from "./api";
import { RealtimeClient, type ConnState } from "./realtime-client";
import { randomId, refKey, sameRef } from "./format";

export interface ThreadState {
  items: ChatMessage[];
  hasMoreBefore: boolean;
  loading: boolean;
  loadingOlder: boolean;
  loaded: boolean;
  error: string | null;
}

export interface ChatState {
  me: MeInfo | null;
  bootError: string | null;
  convs: Record<string, ConversationSummary>;
  order: string[];
  convCursor: string | null;
  convHasMore: boolean;
  convLoading: boolean;
  convLoaded: boolean;
  scope: "mine" | "all";
  activeId: string | null;
  threads: Record<string, ThreadState>;
  typing: Record<string, Record<string, { name: string; until: number }>>;
  drafts: Record<string, string>;
  connection: ConnState;
  toast: { id: number; text: string } | null;
  /** Чатын цонх дэлгэц дээр нээлттэй эсэх (widget хаалттай үед уншсанд тооцохгүй) */
  uiVisible: boolean;
  /** Notification дээр дарахад widget-ийг нээх хүсэлт */
  openRequest: number;
}

const EMPTY_THREAD: ThreadState = {
  items: [],
  hasMoreBefore: true,
  loading: false,
  loadingOlder: false,
  loaded: false,
  error: null,
};

const initialState: ChatState = {
  me: null,
  bootError: null,
  convs: {},
  order: [],
  convCursor: null,
  convHasMore: true,
  convLoading: false,
  convLoaded: false,
  scope: "mine",
  activeId: null,
  threads: {},
  typing: {},
  drafts: {},
  connection: "connecting",
  toast: null,
  uiVisible: true,
  openRequest: 0,
};

const errText = (e: unknown) => (e instanceof Error ? e.message : "Алдаа гарлаа");
const isVisible = () => typeof document === "undefined" || document.visibilityState === "visible";
const realOnly = (items: ChatMessage[]) => items.filter((m) => !m.status);

function sortOrder(convs: Record<string, ConversationSummary>): string[] {
  return Object.values(convs)
    .sort((a, b) =>
      a.lastMessageAt === b.lastMessageAt ? b.id.localeCompare(a.id) : b.lastMessageAt.localeCompare(a.lastMessageAt),
    )
    .map((c) => c.id);
}

export function mergeMessages(existing: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
  const byId = new Map<string, ChatMessage>();
  const pending: ChatMessage[] = [];
  for (const m of existing) (m.status ? pending.push(m) : byId.set(m.id, m));
  for (const m of incoming) byId.set(m.id, m);
  const confirmed = new Set<string>();
  byId.forEach((m) => m.clientId && confirmed.add(m.clientId));
  const sorted = Array.from(byId.values()).sort((a, b) => (a.cursor < b.cursor ? -1 : a.cursor > b.cursor ? 1 : 0));
  return [...sorted, ...pending.filter((p) => !p.clientId || !confirmed.has(p.clientId))];
}

export function messageToPreview(m: ChatMessage): LastMessagePreview {
  return {
    id: m.id,
    kind: m.kind,
    body: m.deleted ? "" : m.body.slice(0, 200),
    sender: m.sender,
    senderName: m.senderName,
    attachmentKind: m.deleted || !m.attachments.length ? null : m.attachments.every((a) => a.isImage) ? "image" : "file",
    attachmentCount: m.deleted ? 0 : m.attachments.length,
    deleted: m.deleted,
    createdAt: m.createdAt,
  };
}

const isMuted = (c: ConversationSummary) => !!c.mutedUntil && new Date(c.mutedUntil).getTime() > Date.now();

export class ChatStore {
  state: ChatState = initialState;
  private listeners = new Set<() => void>();
  private rt: RealtimeClient | null = null;
  private timers: ReturnType<typeof setInterval>[] = [];
  private readTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private lastTypingSent = new Map<string, number>();
  private cleanup: (() => void)[] = [];
  private started = false;
  private gen = 0;
  private toastSeq = 0;

  subscribe = (l: () => void) => {
    this.listeners.add(l);
    return () => {
      this.listeners.delete(l);
    };
  };
  getState = () => this.state;

  private set(patch: Partial<ChatState> | ((s: ChatState) => Partial<ChatState>)) {
    const p = typeof patch === "function" ? patch(this.state) : patch;
    this.state = { ...this.state, ...p };
    this.listeners.forEach((l) => l());
  }

  private patchThread(id: string, fn: (t: ThreadState) => Partial<ThreadState>) {
    this.set((s) => {
      const t = s.threads[id] ?? EMPTY_THREAD;
      return { threads: { ...s.threads, [id]: { ...t, ...fn(t) } } };
    });
  }

  private patchConv(id: string, fn: (c: ConversationSummary) => Partial<ConversationSummary>) {
    this.set((s) => {
      const c = s.convs[id];
      if (!c) return {};
      const convs = { ...s.convs, [id]: { ...c, ...fn(c) } };
      return { convs, order: sortOrder(convs) };
    });
  }

  private upsertConvs(list: ConversationSummary[]) {
    if (!list.length) return;
    this.set((s) => {
      const convs = { ...s.convs };
      for (const c of list) convs[c.id] = c;
      return { convs, order: sortOrder(convs) };
    });
  }

  showToast(text: string) {
    const id = ++this.toastSeq;
    this.set({ toast: { id, text } });
    setTimeout(() => {
      if (this.state.toast?.id === id) this.set({ toast: null });
    }, 3500);
  }

  private get meRef(): MemberRef | null {
    const a = this.state.me?.actor;
    return a ? { type: a.type, id: a.id } : null;
  }

  // ───────────── lifecycle ─────────────

  async start() {
    if (this.started) return;
    this.started = true;
    const g = ++this.gen; // React StrictMode-ийн давхар mount-оос хамгаална
    try {
      const me = await chatApi.me();
      if (g !== this.gen) return;
      this.set({ me, bootError: null });
    } catch (e) {
      if (g !== this.gen) return;
      this.set({ bootError: errText(e) });
      this.started = false;
      return;
    }

    await this.loadConversations(true);
    if (g !== this.gen) return;

    const me = this.meRef!;
    this.rt = new RealtimeClient(me, {
      onEvent: (ev, d) => this.handleEvent(ev, d),
      onTyping: (cid, d) => this.handleTyping(cid, d),
      onState: (c) => this.set({ connection: c }),
      onResync: () => this.resync(),
    });
    const live = this.rt.start();
    if (!live) {
      this.rt = null;
      this.set({ connection: "polling" });
      this.timers.push(setInterval(() => isVisible() && this.refreshFirstPage(), 10_000));
      this.timers.push(
        setInterval(() => {
          const id = this.state.activeId;
          if (id && isVisible()) this.syncNewer(id);
        }, 4_000),
      );
    } else if (this.state.activeId) {
      this.rt.watchConversation(this.state.activeId);
    }

    const beat = () => isVisible() && chatApi.heartbeat().catch(() => {});
    beat();
    this.timers.push(setInterval(beat, 45_000));
    this.timers.push(setInterval(() => this.pruneTyping(), 1_500));

    const onVis = () => {
      if (!isVisible()) return;
      beat();
      this.resync();
      if (this.state.activeId) this.markReadSoon(this.state.activeId);
    };
    document.addEventListener("visibilitychange", onVis);
    this.cleanup.push(() => document.removeEventListener("visibilitychange", onVis));
  }

  stop() {
    this.started = false;
    this.gen++;
    // Өөр хэрэглэгчээр нэвтрэхэд өмнөх хүний чат санах ойд үлдэхгүй
    this.state = { ...initialState };
    this.listeners.forEach((l) => l());
    this.rt?.stop();
    this.rt = null;
    this.timers.forEach(clearInterval);
    this.timers = [];
    this.readTimers.forEach(clearTimeout);
    this.readTimers.clear();
    this.cleanup.forEach((f) => f());
    this.cleanup = [];
  }

  private async resync() {
    await this.refreshFirstPage();
    const id = this.state.activeId;
    if (id) await this.syncNewer(id);
  }

  // ───────────── conversations ─────────────

  async loadConversations(reset = false) {
    const s = this.state;
    if (s.convLoading || (!reset && !s.convHasMore)) return;
    this.set({ convLoading: true });
    try {
      const res = await chatApi.conversations({ scope: s.scope, cursor: reset ? null : s.convCursor });
      this.set((st) => {
        const convs = reset ? {} : { ...st.convs };
        for (const c of res.items) convs[c.id] = c;
        if (reset && st.activeId && st.convs[st.activeId] && !convs[st.activeId]) {
          convs[st.activeId] = st.convs[st.activeId];
        }
        return {
          convs,
          order: sortOrder(convs),
          convCursor: res.nextCursor,
          convHasMore: !!res.nextCursor,
          convLoaded: true,
          convLoading: false,
        };
      });
    } catch (e) {
      this.set({ convLoading: false, convLoaded: true });
      this.showToast(errText(e));
    }
  }

  async refreshFirstPage() {
    try {
      const res = await chatApi.conversations({ scope: this.state.scope });
      this.upsertConvs(res.items);
    } catch {
      /* чимээгүй */
    }
  }

  async setScope(scope: "mine" | "all") {
    if (this.state.scope === scope) return;
    this.set({ scope, convs: {}, order: [], convCursor: null, convHasMore: true, convLoaded: false });
    await this.loadConversations(true);
  }

  async refreshConversation(id: string) {
    try {
      const { conversation } = await chatApi.conversation(id);
      this.upsertConvs([conversation]);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) this.dropConversation(id);
    }
  }

  private dropConversation(id: string) {
    this.set((s) => {
      const convs = { ...s.convs };
      delete convs[id];
      const threads = { ...s.threads };
      delete threads[id];
      return { convs, threads, order: sortOrder(convs), activeId: s.activeId === id ? null : s.activeId };
    });
    if (this.state.activeId === null) this.rt?.watchConversation(null);
  }

  open(id: string | null) {
    this.set({ activeId: id });
    this.rt?.watchConversation(id);
    if (!id) return;
    if (!this.state.convs[id]) this.refreshConversation(id);
    const t = this.state.threads[id];
    if (!t?.loaded) this.loadInitial(id);
    else this.syncNewer(id);
    this.markReadSoon(id);
  }

  async createConversation(input: {
    kind: "direct" | "group";
    members: MemberRef[];
    title?: string;
    announcementId?: string | null;
  }): Promise<ConversationSummary> {
    const { conversation } = await chatApi.create(input);
    this.upsertConvs([conversation]);
    this.open(conversation.id);
    return conversation;
  }

  /**
   * Баруун доод буланд байрлах чатын цонхыг (ChatWidget) нээж, тухайн чатыг шууд харуулна.
   * Хуудаснаас гаралгүйгээр чат нээхэд ашиглана (зарлал дээрх "Чат" товч г.м.).
   */
  openInWidget(conv: ConversationSummary | string) {
    const id = typeof conv === "string" ? conv : conv.id;
    if (typeof conv !== "string") this.upsertConvs([conv]);
    this.set((s) => ({ openRequest: s.openRequest + 1 }));
    this.open(id);
  }

  async updateConversation(id: string, body: { title?: string | null; announcementId?: string | null }) {
    const { conversation } = await chatApi.update(id, body);
    this.upsertConvs([conversation]);
  }

  async addMembers(id: string, members: MemberRef[]) {
    const { conversation } = await chatApi.addMembers(id, members);
    this.upsertConvs([conversation]);
  }

  async removeMember(id: string, m: MemberRef) {
    await chatApi.removeMember(id, m);
    const me = this.meRef;
    if (me && sameRef(me, m)) this.dropConversation(id);
    else await this.refreshConversation(id);
  }

  async setRole(id: string, m: MemberRef, role: "admin" | "member") {
    const { conversation } = await chatApi.setRole(id, m, role);
    this.upsertConvs([conversation]);
  }

  async setMute(id: string, until: string | null) {
    const res = await chatApi.setMute(id, until);
    this.patchConv(id, () => ({ mutedUntil: res.mutedUntil ?? null }));
  }

  async deleteConversation(id: string, hard: boolean) {
    await chatApi.remove(id, hard);
    this.dropConversation(id);
  }

  // ───────────── messages ─────────────

  private async loadInitial(id: string) {
    this.patchThread(id, () => ({ loading: true, error: null }));
    try {
      const res = await chatApi.messages(id, { limit: 40 });
      this.patchThread(id, (t) => ({
        items: mergeMessages(t.items, res.messages),
        hasMoreBefore: res.hasMoreBefore,
        loading: false,
        loaded: true,
      }));
      this.markReadSoon(id);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return this.dropConversation(id);
      this.patchThread(id, () => ({ loading: false, error: errText(e) }));
    }
  }

  async loadOlder(id: string) {
    const t = this.state.threads[id];
    if (!t || !t.loaded || t.loadingOlder || !t.hasMoreBefore) return;
    const first = realOnly(t.items)[0];
    if (!first) return;
    this.patchThread(id, () => ({ loadingOlder: true }));
    try {
      const res = await chatApi.messages(id, { before: first.cursor, limit: 40 });
      this.patchThread(id, (tt) => ({
        items: mergeMessages(tt.items, res.messages),
        hasMoreBefore: res.hasMoreBefore,
        loadingOlder: false,
      }));
    } catch (e) {
      this.patchThread(id, () => ({ loadingOlder: false }));
      this.showToast(errText(e));
    }
  }

  async syncNewer(id: string) {
    const t = this.state.threads[id];
    if (!t?.loaded) return this.loadInitial(id);
    let last = realOnly(t.items).at(-1);
    if (!last) return this.loadInitial(id);
    try {
      for (let i = 0; i < 5; i++) {
        const res = await chatApi.messages(id, { after: last.cursor, limit: 100 });
        if (res.messages.length) {
          this.patchThread(id, (tt) => ({ items: mergeMessages(tt.items, res.messages) }));
          const newest = res.messages.at(-1)!;
          this.applyPreview(id, newest);
          last = newest;
        }
        if (!res.hasMoreAfter) break;
      }
      this.markReadSoon(id);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) this.dropConversation(id);
    }
  }

  private applyPreview(convId: string, m: ChatMessage) {
    const c = this.state.convs[convId];
    if (!c) return;
    if (c.lastMessage && c.lastMessage.id !== m.id && c.lastMessage.createdAt > m.createdAt) return;
    this.patchConv(convId, (cc) => ({
      lastMessage: messageToPreview(m),
      lastMessageAt: m.createdAt > cc.lastMessageAt ? m.createdAt : cc.lastMessageAt,
    }));
  }

  async send(convId: string, input: { body: string; attachments: Attachment[]; replyTo: ChatMessage | null }) {
    const me = this.state.me;
    if (!me) return;
    const clientId = randomId();
    const replyTo: ReplyPreview | null = input.replyTo
      ? {
          id: input.replyTo.id,
          body: input.replyTo.body.slice(0, 200),
          sender: input.replyTo.sender,
          senderName: input.replyTo.senderName,
          deleted: input.replyTo.deleted,
          hidden: false,
          hasAttachments: input.replyTo.attachments.length > 0,
        }
      : null;
    const optimistic: ChatMessage = {
      id: `tmp_${clientId}`,
      conversationId: convId,
      sender: { type: me.actor.type, id: me.actor.id },
      senderName: me.displayName,
      kind: "text",
      body: input.body,
      attachments: input.attachments,
      replyTo,
      reactions: [],
      editedAt: null,
      deleted: false,
      createdAt: new Date().toISOString(),
      cursor: "~",
      clientId,
      status: "sending",
    };
    this.patchThread(convId, (t) => ({ items: [...t.items, optimistic] }));
    this.applyPreview(convId, optimistic);
    this.set((s) => ({ drafts: { ...s.drafts, [convId]: "" } }));
    await this.deliver(convId, optimistic);
  }

  private async deliver(convId: string, m: ChatMessage) {
    try {
      const { message } = await chatApi.send(convId, {
        body: m.body,
        attachments: m.attachments,
        replyToId: m.replyTo?.id ?? null,
        clientId: m.clientId!,
      });
      this.patchThread(convId, (t) => ({ items: mergeMessages(t.items, [message]) }));
      this.applyPreview(convId, message);
      this.patchConv(convId, (c) => ({
        unread: 0,
        members: c.members.map((p) => (this.meRef && sameRef(p, this.meRef) ? { ...p, lastReadAt: message.createdAt } : p)),
      }));
    } catch (e) {
      this.patchThread(convId, (t) => ({
        items: t.items.map((x) => (x.clientId === m.clientId && x.status ? { ...x, status: "failed", error: errText(e) } : x)),
      }));
    }
  }

  async retry(convId: string, clientId: string) {
    const m = this.state.threads[convId]?.items.find((x) => x.clientId === clientId && x.status === "failed");
    if (!m) return;
    this.patchThread(convId, (t) => ({
      items: t.items.map((x) => (x === m ? { ...x, status: "sending", error: undefined } : x)),
    }));
    await this.deliver(convId, m);
  }

  discard(convId: string, clientId: string) {
    this.patchThread(convId, (t) => ({ items: t.items.filter((x) => !(x.clientId === clientId && x.status)) }));
  }

  private replaceMessage(m: ChatMessage) {
    if (this.state.threads[m.conversationId]) {
      this.patchThread(m.conversationId, (t) => ({ items: mergeMessages(t.items, [m]) }));
    }
    const c = this.state.convs[m.conversationId];
    if (c?.lastMessage?.id === m.id) this.patchConv(m.conversationId, () => ({ lastMessage: messageToPreview(m) }));
  }

  async edit(m: ChatMessage, body: string) {
    try {
      const { message } = await chatApi.edit(m.id, body);
      this.replaceMessage(message);
    } catch (e) {
      this.showToast(errText(e));
    }
  }

  async unsend(m: ChatMessage) {
    try {
      const { message } = await chatApi.unsend(m.id);
      this.replaceMessage(message);
    } catch (e) {
      this.showToast(errText(e));
    }
  }

  async react(m: ChatMessage, emoji: string) {
    const me = this.meRef;
    if (!me) return;
    const mine = m.reactions.find((r) => sameRef(r, me));
    const next = mine?.emoji === emoji ? null : emoji;
    const optimistic: ChatMessage = {
      ...m,
      reactions: [...m.reactions.filter((r) => !sameRef(r, me)), ...(next ? [{ ...me, emoji: next }] : [])],
    };
    this.replaceMessage(optimistic);
    try {
      const { message } = await chatApi.react(m.id, next);
      this.replaceMessage(message);
    } catch (e) {
      this.replaceMessage(m);
      this.showToast(errText(e));
    }
  }

  setUiVisible(v: boolean) {
    if (this.state.uiVisible === v) return;
    this.set({ uiVisible: v });
    if (v && this.state.activeId) this.markReadSoon(this.state.activeId);
  }

  setDraft(convId: string, text: string) {
    this.set((s) => ({ drafts: { ...s.drafts, [convId]: text } }));
  }

  // ───────────── read receipts ─────────────

  markReadSoon(id: string) {
    clearTimeout(this.readTimers.get(id));
    this.readTimers.set(
      id,
      setTimeout(() => this.markRead(id), 350),
    );
  }

  private async markRead(id: string) {
    const s = this.state;
    const me = this.meRef;
    const c = s.convs[id];
    const t = s.threads[id];
    if (!me || !c || !c.isMember || !t?.loaded || s.activeId !== id || !s.uiVisible || !isVisible()) return;
    const last = realOnly(t.items).at(-1);
    if (!last) return;
    const mine = c.members.find((p) => sameRef(p, me));
    if (c.unread === 0 && mine?.lastReadAt && mine.lastReadAt >= last.createdAt) return;

    this.patchConv(id, (cc) => ({
      unread: 0,
      members: cc.members.map((p) => (sameRef(p, me) ? { ...p, lastReadAt: last.createdAt } : p)),
    }));
    try {
      await chatApi.markRead(id, last.id);
    } catch {
      /* дараагийн удаа дахин оролдоно */
    }
  }

  // ───────────── typing ─────────────

  notifyTyping(convId: string) {
    const me = this.state.me;
    if (!me || !this.rt) return;
    const now = Date.now();
    if (now - (this.lastTypingSent.get(convId) ?? 0) < 2500) return;
    this.lastTypingSent.set(convId, now);
    this.rt.sendTyping(convId, { type: me.actor.type, id: me.actor.id, name: me.displayName });
  }

  private handleTyping(convId: string, d: TypingPayload) {
    const me = this.meRef;
    if (!d || (me && sameRef(d, me))) return;
    this.set((s) => ({
      typing: {
        ...s.typing,
        [convId]: { ...(s.typing[convId] ?? {}), [refKey(d)]: { name: d.name, until: Date.now() + 4000 } },
      },
    }));
  }

  private clearTyping(convId: string, who: MemberRef) {
    const t = this.state.typing[convId];
    if (!t?.[refKey(who)]) return;
    this.set((s) => {
      const next = { ...(s.typing[convId] ?? {}) };
      delete next[refKey(who)];
      return { typing: { ...s.typing, [convId]: next } };
    });
  }

  private pruneTyping() {
    const now = Date.now();
    let changed = false;
    const typing: ChatState["typing"] = {};
    for (const [cid, map] of Object.entries(this.state.typing)) {
      const kept: Record<string, { name: string; until: number }> = {};
      for (const [k, v] of Object.entries(map)) {
        if (v.until > now) kept[k] = v;
        else changed = true;
      }
      typing[cid] = kept;
    }
    if (changed) this.set({ typing });
  }

  // ───────────── realtime events ─────────────

  private async handleEvent(ev: ChatEventName, data: unknown) {
    switch (ev) {
      case "message:new":
      case "message:update": {
        const p = data as MessageEventPayload;
        let m = p.message;
        if (!m && p.stub) {
          try {
            m = (await chatApi.message(p.stub.messageId)).message;
          } catch {
            return;
          }
        }
        if (m) this.onIncomingMessage(m, ev === "message:new");
        return;
      }
      case "conversation:upsert": {
        const p = data as ConversationEventPayload;
        await this.refreshConversation(p.conversationId);
        return;
      }
      case "conversation:remove": {
        const p = data as ConversationEventPayload;
        const wasActive = this.state.activeId === p.conversationId;
        this.dropConversation(p.conversationId);
        if (wasActive) this.showToast("Энэ чат устгагдсан эсвэл та группээс хасагдсан байна");
        return;
      }
      case "read": {
        const p = data as ReadEventPayload;
        const me = this.meRef;
        this.patchConv(p.conversationId, (c) => ({
          unread: me && sameRef(p.member, me) ? 0 : c.unread,
          members: c.members.map((x) =>
            sameRef(x, p.member) && (!x.lastReadAt || x.lastReadAt < p.lastReadAt) ? { ...x, lastReadAt: p.lastReadAt } : x,
          ),
        }));
        return;
      }
    }
  }

  private onIncomingMessage(m: ChatMessage, isNew: boolean) {
    const me = this.meRef;
    const fromMe = !!me && sameRef(m.sender, me);
    const convId = m.conversationId;

    if (this.state.threads[convId]?.loaded) {
      this.patchThread(convId, (t) => ({ items: mergeMessages(t.items, [m]) }));
    }

    const c = this.state.convs[convId];
    if (!c) {
      if (isNew) this.refreshConversation(convId);
      return;
    }

    if (!isNew) {
      if (c.lastMessage?.id === m.id) this.patchConv(convId, () => ({ lastMessage: messageToPreview(m) }));
      return;
    }

    this.applyPreview(convId, m);
    this.clearTyping(convId, m.sender);

    const viewing = this.state.activeId === convId && this.state.uiVisible && isVisible();
    if (!fromMe && m.kind === "text") {
      if (viewing) this.markReadSoon(convId);
      else this.patchConv(convId, (cc) => ({ unread: Math.min(cc.unread + 1, 99) }));
      if (!viewing && !isMuted(c)) this.notify(c, m);
    }
  }

  private notify(c: ConversationSummary, m: ChatMessage) {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    try {
      const body = m.deleted
        ? "Мессеж"
        : m.body || (m.attachments.length ? (m.attachments.every((a) => a.isImage) ? "Зураг илгээсэн" : "Файл илгээсэн") : "");
      const n = new Notification(c.kind === "group" ? c.title : m.senderName, {
        body: c.kind === "group" ? `${m.senderName}: ${body}` : body,
        tag: c.id,
      });
      n.onclick = () => {
        window.focus();
        this.set((s) => ({ openRequest: s.openRequest + 1 }));
        this.open(c.id);
        n.close();
      };
    } catch {
      /* зарим browser-т зөвхөн service worker-ээр ажиллана */
    }
  }
}

let singleton: ChatStore | null = null;
export function getChatStore(): ChatStore {
  if (!singleton) singleton = new ChatStore();
  return singleton;
}

export function useChat<T>(selector: (s: ChatState) => T): T {
  const store = getChatStore();
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.state),
    () => selector(store.state),
  );
}