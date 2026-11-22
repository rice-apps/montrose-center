"use client";

import { useEffect, useRef, type ReactElement } from "react";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import type { Message } from "@/lib/api";

interface ConversationPageProps {
  messages: Message[];
  sending: boolean;
  error: string | null;
  onSend: (content: string) => void | Promise<void>;
}

export function ConversationPage({
  messages,
  sending,
  error,
  onSend,
}: ConversationPageProps): ReactElement {
  const chatWindowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const chatWindow = chatWindowRef.current;
    if (chatWindow) chatWindow.scrollTop = chatWindow.scrollHeight;
  }, [messages, sending]);

  return (
    <main className="flex h-dvh flex-col bg-[#F3F3F3]">
      <div ref={chatWindowRef} className="chat-scroll flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl px-6 pb-10 pt-10">
          <div className="flex flex-col" aria-live="polite">
            {messages.map((message, index) => (
              <ChatMessage key={message.id} message={message} isFirst={index === 0} />
            ))}
            {sending && <p className="px-2 py-4 text-sm text-[#666666]">Waiting for a reply…</p>}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-6 pb-6">
        {error && (
          <p role="alert" className="mb-3 text-sm text-red-700">{error}</p>
        )}
        <ChatInput onSend={onSend} disabled={sending || !!error} />
      </div>
    </main>
  );
}
