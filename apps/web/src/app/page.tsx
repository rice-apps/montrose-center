"use client";

import { useEffect, useState, type ReactElement } from "react";
import { ChatSidebar } from "@/components/ChatSidebar";
import { LandingPage } from "@/components/landing-page";
import { ConversationPage } from "@/components/conversation-page";
import { createChat, getChat, listChats, sendMessage, type ChatSummary, type Message } from "@/lib/api";

export default function ChatPage(): ReactElement {
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [sidebarError, setSidebarError] = useState<string | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listChats()
      .then((savedChats) => {
        // Preserve any chat created while the initial list was loading.
        setChats((current) => [
          ...current,
          ...savedChats.filter((chat) => !current.some((item) => item.id === chat.id)),
        ]);
      })
      .catch((error) => {
        setSidebarError(error instanceof Error ? error.message : "Unable to load chats.");
      });
  }, []);

  const selectChat = async (id: string) => {
    if (sending || loadingChat) return;
    setLoadingChat(true);
    setError(null);
    try {
      const chat = await getChat(id);
      setChatId(chat.id);
      setMessages(chat.messages);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to load the chat.");
    } finally {
      setLoadingChat(false);
    }
  };

  const newChat = () => {
    if (sending || loadingChat) return;
    setChatId(null);
    setMessages([]);
    setError(null);
  };

  const send = async (content: string) => {
    if (!content.trim() || sending || loadingChat) return;
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
        const chat = await createChat(content.trim().slice(0, 80));
        currentId = chat.id;
        setChatId(currentId);
        setChats((current) => [
          { id: chat.id, title: chat.title, created_at: chat.created_at, updated_at: chat.updated_at },
          ...current,
        ]);
      }
      const response = await sendMessage(currentId, content.trim());
      setChats((current) => current.map((chat) =>
        chat.id === currentId ? { ...chat, updated_at: response.assistant_message.created_at } : chat,
      ));
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

  return (
    <div className="flex h-dvh overflow-hidden">
      <ChatSidebar
        chats={chats}
        activeChatId={chatId}
        onSelectChat={selectChat}
        onNewChat={newChat}
        disabled={sending || loadingChat}
        error={sidebarError}
      />
      <div className="min-w-0 flex-1 overflow-y-auto">
        {!error && messages.length === 0 ? (
          <LandingPage key={chatId ?? "new"} onSend={send} disabled={sending || loadingChat} />
        ) : (
          <ConversationPage
            key={chatId ?? "new"}
            messages={messages}
            sending={sending}
            disabled={loadingChat}
            error={error}
            onSend={send}
          />
        )}
      </div>
    </div>
  );
}
