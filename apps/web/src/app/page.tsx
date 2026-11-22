"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";
import { ChatSidebar } from "@/components/ChatSidebar";
import { LandingPage } from "@/components/landing-page";
import { ConversationPage } from "@/components/conversation-page";
import { createChat, getChat, listChats, sendMessage, type ChatSummary, type Message } from "@/lib/api";

export default function ChatPage(): ReactElement {
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const chatLoadId = useRef(0);
  const activeChatId = useRef<string | null>(null);
  const pendingSend = useRef<{
    chatId: string | null;
    messages: Message[];
    error: string | null;
  } | null>(null);
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
    const loadId = ++chatLoadId.current;
    const request = pendingSend.current;
    setLoadingChat(true);
    setError(null);
    try {
      const chat = await getChat(id);
      if (loadId !== chatLoadId.current) return;
      activeChatId.current = chat.id;
      setChatId(chat.id);
      // Keep an in-flight message (or its completed reply) when returning to its chat.
      setMessages(request?.chatId === id ? request.messages : chat.messages);
      setError(request?.chatId === id ? request.error : null);
    } catch (error) {
      if (loadId !== chatLoadId.current) return;
      setError(error instanceof Error ? error.message : "Unable to load the chat.");
    } finally {
      if (loadId === chatLoadId.current) setLoadingChat(false);
    }
  };

  const newChat = () => {
    chatLoadId.current += 1;
    activeChatId.current = null;
    setLoadingChat(false);
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
    const loadId = chatLoadId.current;
    const request = { chatId, messages: [...messages, pendingMessage], error: null as string | null };
    pendingSend.current = request;
    const isCurrentChat = () => request.chatId !== null
      ? activeChatId.current === request.chatId
      : chatLoadId.current === loadId;
    setMessages(request.messages);
    try {
      let currentId = chatId;
      if (!currentId) {
        const chat = await createChat(content.trim().slice(0, 80));
        currentId = chat.id;
        request.chatId = currentId;
        if (chatLoadId.current === loadId) {
          activeChatId.current = currentId;
          setChatId(currentId);
        }
        setChats((current) => [
          { id: chat.id, title: chat.title, created_at: chat.created_at, updated_at: chat.updated_at },
          ...current,
        ]);
      }
      const response = await sendMessage(currentId, content.trim());
      setChats((current) => current.map((chat) =>
        chat.id === currentId ? { ...chat, updated_at: response.assistant_message.created_at } : chat,
      ));
      request.messages = [...messages, response.user_message, response.assistant_message];
      if (isCurrentChat()) setMessages(request.messages);
    } catch (error) {
      request.messages = messages;
      const detail = error instanceof Error ? error.message : "Unable to send the message.";
      request.error = `${detail} Your message may already be saved. Refresh the page to start a new chat.`;
      if (isCurrentChat()) {
        setMessages(request.messages);
        setError(request.error);
      }
      throw error; // Keep the composer's draft when the request fails.
    } finally {
      pendingSend.current = null;
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
        error={sidebarError}
      />
      <div className="min-w-0 flex-1 overflow-y-auto">
        {!error && messages.length === 0 ? (
          <LandingPage key={chatId ?? "new"} onSend={send} disabled={sending || loadingChat} />
        ) : (
          <ConversationPage
            key={chatId ?? "new"}
            messages={messages}
            sending={sending && pendingSend.current?.chatId === chatId}
            disabled={sending || loadingChat}
            error={error}
            onSend={send}
          />
        )}
      </div>
    </div>
  );
}
