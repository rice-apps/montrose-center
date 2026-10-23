import type { ReactElement } from "react";
import type { ChatSummary } from "@/lib/api";

export type ChatSidebarProps = {
  chats: ChatSummary[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
};

// Task 2: list chats and let the user select or create one.
export declare function ChatSidebar(props: ChatSidebarProps): ReactElement;
