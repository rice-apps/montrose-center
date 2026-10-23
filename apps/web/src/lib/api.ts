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

// Task 4 (web): implement requests to the chat endpoints.
export declare function createChat(title?: string): Promise<Chat>;
export declare function listChats(): Promise<ChatSummary[]>;
export declare function getChat(chatId: string): Promise<Chat>;
export declare function updateChatTitle(chatId: string, title: string): Promise<Chat>;
export declare function sendMessage(chatId: string, content: string): Promise<SendMessageResponse>;
