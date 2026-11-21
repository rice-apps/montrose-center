"use client";

import { useEffect, useState, type ReactElement } from "react";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import { createChat, getChat, listChats, sendMessage, type Message } from "@/lib/api";

export default function ChatPage(): ReactElement {
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const [composerKey, setComposerKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    async function loadLatestChat() {
      try {
        const chats = await listChats();
        if (cancelled) return;
        // The API orders conversations by last_updated, newest first.
        const latestChat = chats[0];
        if (!latestChat) {
          setChatId(null);
          setMessages([]);
          return;
        }
        const chat = await getChat(latestChat.id);
        if (!cancelled) {
          setChatId(chat.id);
          setMessages(chat.messages);
        }
      } catch (error) {
        if (!cancelled) {
          setError(error instanceof Error ? error.message : "Unable to load the chat.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadLatestChat();
    return () => { cancelled = true; };
  }, [reload]);

  const newChat = () => {
    setChatId(null);
    setMessages([]);
    setError(null);
    setComposerKey((value) => value + 1);
  };

  const send = async (content: string) => {
    if (!content.trim() || loading || sending) return;
    setSending(true);
    setError(null);
    try {
      let currentId = chatId;
      if (!currentId) {
        const chat = await createChat();
        currentId = chat.id;
        setChatId(currentId);
      }
      const response = await sendMessage(currentId, content.trim());
      setMessages((previous) => [
        ...previous,
        response.user_message,
        response.assistant_message,
      ]);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Unable to send the message.";
      setError(`${detail} Your message may already be saved. Reload the chat before sending again.`);
      throw error; // Keep the composer's draft when the request fails.
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="flex h-dvh flex-col bg-[#F3F3F3]">
      <div className="chat-scroll flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl px-6 pb-10 pt-10">
          <div className="mb-10 flex items-center justify-between px-2">
            <h1 className="text-2xl font-semibold text-[#202020]">Chat</h1>
            <button
              type="button"
              onClick={newChat}
              disabled={loading || sending}
              className="rounded-xl border border-[#E5E5E5] bg-white px-4 py-2 text-sm disabled:opacity-50"
            >
              New chat
            </button>
          </div>

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
          <div role="alert" className="mb-3 text-sm text-red-700">
            <p>{error}</p>
            <button type="button" className="mt-1 underline" onClick={() => setReload((value) => value + 1)}>
              Reload chat
            </button>
          </div>
        )}
        <ChatInput key={composerKey} onSend={send} disabled={loading || sending || !!error} allowAttachments={false} />
      </div>
    </main>
  );
}
