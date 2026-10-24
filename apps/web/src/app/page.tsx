'use client';
import { ChatSidebar } from "@/components/ChatSidebar";
import type { ChatSummary } from "@/lib/api";
import { useState } from "react";

export default function Page() {
  const fakeChats: ChatSummary[] = [
    {id: "1", title: "hello", created_at: "now", updated_at: "later"},
    {id: "2", title: "world", created_at: "now", updated_at: "later"},
    {id: "3", title: "it's", created_at: "now", updated_at: "later"},
    {id: "4", title: "me", created_at: "now", updated_at: "later"},
  ];

  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const handleSelect = (chatId: string) => {
    setActiveChatId(chatId)
  }

  return (
    <main>
      <h1>Montrose resource chat</h1>
      <p>First sprint scaffold. Build the chat page from the component signatures in src/components.</p>
      <ChatSidebar chats={fakeChats} 
      activeChatId={activeChatId} 
      onSelectChat={handleSelect} 
      onNewChat={()=> {}}/>
      <p>chat's id: {activeChatId}</p>
    </main>
  );
}
