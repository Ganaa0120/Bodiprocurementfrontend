"use client";
import ChatApp from "@/components/chat/ChatApp";

export default function ChatPage() {
  return (
    <div style={{ padding: 16 }}>
      <ChatApp height="calc(100vh - 32px)" announcementHref={(id) => `/dashboard/admin?tab=announcements&id=${id}`} />
    </div>
  );
}