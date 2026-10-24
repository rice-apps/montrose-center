"use client";

import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import { TypingIndicator } from "@/components/TypingIndicator";
import { useEffect, useState } from "react";
import type { Message } from "@/lib/api";

function makeMessage(role: Message["role"], content: string): Message {
  return {
    id: crypto.randomUUID(),
    chat_id: "local",
    role,
    content,
    created_at: new Date().toISOString(),
  };
}

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinking, setThinking] = useState(false);

  const handleSend = (content: string) => {
    setMessages((prev) => [...prev, makeMessage("user", content)]);
    setThinking(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        makeMessage(
          "assistant",
          "Thanks for your message! Unfortunately the server is not up and running. Please message us for help!",
        ),
      ]);
      setThinking(false);
    }, 4000);
  };

  // Runs after every render where `messages` changed, so it always sees the latest array.
  useEffect(() => {
    console.log(messages);
  }, [messages]);

  return (
    <main className="text-slate-700">
      <h1 className="p-4 font-bold text-[#3566F0]">M</h1>
      <section className="max-w-2xl mx-auto flex flex-col justify-between h-[90vh]">
        <div className="flex-1 overflow-y-auto flex flex-col gap-3 p-4">
          {messages.map((m) => (
            <ChatMessage key={m.id} message={m} />
          ))}
          {thinking && <TypingIndicator />}
        </div>
        <ChatInput onSend={handleSend} disabled={thinking} />
      </section>
    </main>
  );
}
