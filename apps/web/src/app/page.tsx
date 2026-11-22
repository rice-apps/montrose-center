"use client";

import { useState, type ReactElement } from "react";
import { LandingPage } from "@/components/landing-page";
import { ConversationPage } from "@/components/conversation-page";
import { createChat, sendMessage, type Message } from "@/lib/api";

export default function ChatPage(): ReactElement {
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async (content: string) => {
    if (!content.trim() || sending) return;
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
      setError(`${detail} Your message may already be saved. Refresh the page to start a new chat.`);
      throw error; // Keep the composer's draft when the request fails.
    } finally {
      setSending(false);
    }
  };

  if (!error && messages.length === 0) {
    return <LandingPage onSend={send} disabled={sending} />;
  }

  return (
    <ConversationPage
      messages={messages}
      sending={sending}
      error={error}
      onSend={send}
    />
  );
}
