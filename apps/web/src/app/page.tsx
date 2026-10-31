"use client";

import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import { TypingIndicator } from "@/components/TypingIndicator";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Message } from "@/lib/api";
import type { Attachment, UIMessage } from "@/lib/attachments";

function makeMessage(
  role: Message["role"],
  content: string,
  attachments?: Attachment[],
): UIMessage {
  return {
    id: crypto.randomUUID(),
    chat_id: "local",
    role,
    content,
    created_at: new Date().toISOString(),
    attachments,
  };
}

/** How close (px) to the bottom still counts as "following" the conversation. */
const STICK_THRESHOLD = 120;

export default function Page() {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [thinking, setThinking] = useState(false);
  const [streamingId, setStreamingId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  // Follow new content only while the user is at (or near) the bottom,
  // so scrolling up to read history isn't hijacked.
  const stickToBottom = useRef(true);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  // Track whether the user has scrolled away from the bottom.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
      stickToBottom.current = distance < STICK_THRESHOLD;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Whenever the content grows (new message, typing indicator, streamed words),
  // glide down to keep the latest text in view.
  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const ro = new ResizeObserver(() => {
      if (stickToBottom.current) scrollToBottom("smooth");
    });
    ro.observe(content);
    return () => ro.disconnect();
  }, [scrollToBottom]);

  const handleSend = (content: string, attachments: Attachment[]) => {
    stickToBottom.current = true; // sending always brings you back down
    setMessages((prev) => [...prev, makeMessage("user", content, attachments)]);
    setThinking(true);

    setTimeout(() => {
      const reply = makeMessage(
        "assistant",
        "Thanks for your message! Unfortunately the server is not up and running. Please message us for help! Thanks for your message! Unfortunately the server is not up and running. Please message us for help!",
      );
      setMessages((prev) => [...prev, reply]);
      setStreamingId(reply.id);
      setThinking(false);
    }, 4000);
  };

  const handleStreamEnd = useCallback(() => setStreamingId(null), []);

  return (
    <main className="text-slate-700 p-4">
      <div className="grid grid-cols-[23%_1fr] align-center">
        <section>
          <h1 className="p-4 font-bold text-[#202020]">M</h1>
        </section>
        <section className="flex flex-col justify-between h-[96vh] bg-[#f3f3f3] py-5 px-24 rounded-3xl">
          <h2 className="pl-4 pt-4 text-[20px] text-[#202020] font-semibold capitalize mb-2">
            Program recommendations
          </h2>
          <div
            ref={scrollRef}
            className="chat-scroll flex-1 overflow-y-auto overscroll-contain p-4 [mask-image:linear-gradient(to_bottom,transparent,black_24px,black_calc(100%-24px),transparent)]"
          >
            <div
              ref={contentRef}
              className="flex flex-col gap-3 py-2"
              aria-live="polite"
            >
              {messages.map((m, i) => (
                <ChatMessage
                  key={m.id}
                  message={m}
                  isFirst={i === 0}
                  stream={m.id === streamingId}
                  onStreamEnd={handleStreamEnd}
                />
              ))}
              {thinking && <TypingIndicator />}
            </div>
          </div>
          <ChatInput onSend={handleSend} disabled={thinking || !!streamingId} />
        </section>
      </div>
    </main>
  );
}
