import type { ReactElement } from "react";
import type { Message } from "@/lib/api";

export type ChatMessageProps = {
  message: Message;
};

// Task 1: display one user or assistant message.
export function ChatMessage({ message }: ChatMessageProps): ReactElement {
  const isUser = message.role === "user";
  const time = new Date(message.created_at).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-3 py-2 ${
          isUser ? "bg-[#3566F0] text-white" : "bg-slate-100 text-slate-800"
        }`}
      >
        <p>{message.content}</p>
        <span className="text-xs opacity-70">{time}</span>
      </div>
    </div>
  );
}
