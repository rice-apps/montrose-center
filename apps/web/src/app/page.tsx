"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import { createChat, getChat, listChats, sendMessage, type Message } from "@/lib/api";

export default function ChatPage(): ReactElement {
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const chatWindow = chatWindowRef.current;
    if (chatWindow) chatWindow.scrollTop = chatWindow.scrollHeight;
  }, [messages, sending]);

  useEffect(() => {
    async function loadLatestChat() {
      try {
        const chats = await listChats();
        // The API orders conversations by last_updated, newest first.
        const latestChat = chats[0];
        if (!latestChat) {
          setChatId(null);
          setMessages([]);
          return;
        }
        const chat = await getChat(latestChat.id);
        setChatId(chat.id);
        setMessages(chat.messages);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Unable to load the chat.");
      } finally {
        setLoading(false);
      }
    }

    void loadLatestChat();
  }, []);

  const send = async (content: string) => {
    if (!content.trim() || loading || sending) return;
    setSending(true);
    setError(null);
    const pendingMessage: Message = {
      id: crypto.randomUUID(),
      chat_id: chatId ?? "",
      role: "user",
      content: content.trim(),
      created_at: new Date().toISOString(),
    };
    setMessages((previous) => [...previous, pendingMessage]);
    try {
      let currentId = chatId;
      if (!currentId) {
        const chat = await createChat();
        currentId = chat.id;
        setChatId(currentId);
      }
      const response = await sendMessage(currentId, content.trim());
      setMessages((previous) => [
        ...previous.map((message) =>
          message.id === pendingMessage.id ? response.user_message : message,
        ),
        response.assistant_message,
      ]);
    } catch (error) {
      setMessages((previous) => previous.filter((message) => message.id !== pendingMessage.id));
      const detail = error instanceof Error ? error.message : "Unable to send the message.";
      setError(`${detail} Your message may already be saved. Refresh the page before sending again.`);
      throw error; // Keep the composer's draft when the request fails.
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="flex h-dvh flex-col bg-[#F3F3F3]">
      <div ref={chatWindowRef} className="chat-scroll flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl px-6 pb-10 pt-10">
          <h1 className="mb-10 px-2 text-2xl font-semibold text-[#202020]">Chat</h1>

          <div className="flex flex-col" aria-live="polite">
            {loading && <p className="px-2 text-sm text-[#666666]">Loading chat…</p>}
            {!loading && !error && messages.length === 0 && (
              <p className="px-2 text-sm text-[#666666]">Start a conversation.</p>
            )}
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
        <ChatInput onSend={send} disabled={loading || sending || !!error} />
      </div>
    </main>
  );
}
