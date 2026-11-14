'use client';
import { ChatSidebar } from "@/components/ChatSidebar";
import type { ChatSummary } from "@/lib/api";
import { useState } from "react";

export default function Page() {
  const fakeChats: ChatSummary[] = [
    {id: "1", title: "the", created_at: "now", updated_at: "2026-10-25T09:00:00-06:00"},
    {id: "2", title: "this", created_at: "now", updated_at: "2026-11-14T13:00:00-06:00"},
    {id: "3", title: "boys", created_at: "now", updated_at: "2026-09-15T12:00:00-06:00"},
    {id: "4", title: "one", created_at: "now", updated_at: "2026-11-13T22:00:00-06:00"},
    {id: "5", title: "is", created_at: "now", updated_at: "2026-11-10T10:00:00-06:00"},
    {id: "6", title: "for", created_at: "now", updated_at: "2026-11-10T10:00:00-06:00"},
    {id: "7", title: "with", created_at: "now", updated_at: "2026-09-15T12:00:00-06:00"},
    {id: "8", title: "the", created_at: "now", updated_at: "2026-09-15T12:00:00-06:00"},
    {id: "9", title: "boomin", created_at: "now", updated_at: "2026-08-15T12:00:00-06:00"},
    {id: "10", title: "system", created_at: "now", updated_at: "2026-08-15T12:00:00-06:00"},
  ];

  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const handleSelect = (chatId: string) => {
    setActiveChatId(chatId)
  }
  const handleNewChat = () => {
    setActiveChatId(null)
   }

  return (
    <main style={{ display: "flex", backgroundColor: "gray", padding: "16px", gap: "10px"}}>
      <ChatSidebar chats={fakeChats} 
      activeChatId={activeChatId} 
      onSelectChat={handleSelect} 
      onNewChat={handleNewChat}/>
      <p>chat's id: {activeChatId}</p>
    </main>
  );
}
