"use client";

import { useState, type ReactElement } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AttachmentPreview } from "@/components/AttachmentPreview";
import { AttachmentViewer } from "@/components/AttachmentViewer";
import type { UIMessage } from "@/lib/attachments";

export type ChatMessageProps = {
  message: UIMessage;
  /** True for the first message in the list (skips the top spacing). */
  isFirst?: boolean;
};

// Task 1: display one user or assistant message.
export function ChatMessage({
  message,
  isFirst = false,
}: ChatMessageProps): ReactElement {
  const isUser = message.role === "user";
  const attachments = message.attachments ?? [];
  const [viewing, setViewing] = useState<number | null>(null);
  const hasText = message.content.length > 0;

  return (
    <div
      className={`flex animate-message-in ${
        isUser
          ? "mb-4 justify-end origin-bottom-right"
          : "justify-start origin-bottom-left"
      }`}
    >
      <div
        className={`flex max-w-full flex-col gap-2 ${
          isUser ? `items-end ${isFirst ? "" : "mt-16"}` : "items-start"
        }`}
      >
        {attachments.length > 0 && (
          <div className="flex max-w-xl flex-wrap items-end justify-end gap-2">
            {attachments.map((a, i) => (
              <AttachmentPreview
                key={a.id}
                attachment={a}
                variant="message"
                onOpen={() => setViewing(i)}
              />
            ))}
          </div>
        )}
        <AttachmentViewer attachments={attachments} index={viewing} onIndexChange={setViewing} />
        {(hasText || !isUser) && (
          <div
            className={`max-w-full rounded-2xl px-4 py-3 transition-colors ${
              isUser ? "bg-[#EBEBEB] text-black" : "text-black"
            }`}
          >
            {isUser ? (
              <p className="text-black text-sm mt-1 leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
            ) : (
              <div className="chat-markdown text-black text-sm mt-1 leading-relaxed">
                <Markdown remarkPlugins={[remarkGfm]}>{message.content}</Markdown>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
