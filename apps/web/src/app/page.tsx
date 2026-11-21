"use client";

import { useState, type ReactElement } from "react";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import type { Attachment, UIMessage } from "@/lib/attachments";

export default function ChatPage(): ReactElement {
  const [messages, setMessages] = useState<UIMessage[]>([]);

  // Show messages locally until this page is wired to the chat API.
  const send = (content: string, attachments: Attachment[]) => {
    if (!content.trim() && attachments.length === 0) return;
    const message: UIMessage = {
      id: crypto.randomUUID(),
      chat_id: "local",
      role: "user",
      content: content.trim(),
      created_at: new Date().toISOString(),
      attachments,
    };
    setMessages((prev) => [...prev, message]);
  };

  return (
    <main className="flex h-dvh flex-col bg-[#F3F3F3]">
      <div className="chat-scroll flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl px-6 pb-10 pt-10">
          <h1 className="mb-10 px-2 text-2xl font-semibold text-[#202020]">
            Chat
          </h1>

          <div className="flex flex-col" aria-live="polite">
            {messages.length === 0 && (
              <p className="px-2 text-sm text-[#666666]">Start a conversation.</p>
            )}
            {messages.map((message, index) => (
              <ChatMessage key={message.id} message={message} isFirst={index === 0} />
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-6 pb-6">
        <ChatInput onSend={send} />
      </div>
    </main>
  );
}
