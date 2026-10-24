/**
 * Frontend API file, routes to the Python backend in order to perform various tasks
 * Written by Peter Golovakov :P
 */

export type Message = {
  id: string;
  chat_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export type ChatSummary = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

export type Chat = ChatSummary & { messages: Message[] };

export type SendMessageResponse = {
  user_message: Message;
  assistant_message: Message;
};

async function request<T>(init?: RequestInit): Promise<T> {
  /**
   * Helper function to send HTTP requests to the backend and handle errors
   */
  const response = await fetch("INSERT URL HERE/chats", init); // PUT URL HERE

  if (!response.ok) {
    let detail = (await response.json()).detail;
    throw new Error(detail);
  }

  return (await response.json()) as T;
}

export function createChat(title?: string): Promise<Chat> {
  /**
   * Creates a new chat by sending a POST request
   */
  return request<Chat>({ method: "POST", 
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }) });
}

export function listChats(): Promise<ChatSummary[]> {
  /**
   * Retrieves a list of chats by sending a GET request
   */
  return request<ChatSummary[]>({ method: "GET",
    headers: { "Content-Type": "application/json" },
   });
}

export function getChat(chatId: string): Promise<Chat> {
  /**
   * Retrieves the current chat by sending a GET request
   */
  return request<Chat>({ method: "GET", 
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId }) });
}

export function updateChatTitle(chatId: string, title: string): Promise<Chat> {
  /**
   * Updates the title of a chat by sending a PUT request
   */
  return request<Chat>({ method: "PUT", 
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, title }) });
}

export function sendMessage(chatId: string, content: string): Promise<SendMessageResponse> {
  /**
   * Sends a message in a chat by sending a PUT request
   */
  return request<SendMessageResponse>({ method: "PUT", 
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, content })});
}
