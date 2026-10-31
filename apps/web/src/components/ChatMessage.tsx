"use client";

import { useEffect, useMemo, useRef, useState, type ReactElement } from "react";
import { AttachmentPreview } from "@/components/AttachmentPreview";
import { AttachmentViewer } from "@/components/AttachmentViewer";
import type { UIMessage } from "@/lib/attachments";

export type ChatMessageProps = {
  message: UIMessage;
  /** Reveal the text word by word, like it's being written. */
  stream?: boolean;
  /** Called once the streamed reveal finishes. */
  onStreamEnd?: () => void;
  /** True for the first message in the list (skips the top spacing). */
  isFirst?: boolean;
};

const WORD_INTERVAL_MS = 45;

function useStreamedWords(text: string, enabled: boolean, onDone?: () => void) {
  // Keep whitespace tokens so the original spacing/line breaks are preserved.
  const tokens = useMemo(() => text.split(/(\s+)/).filter(Boolean), [text]);
  const [count, setCount] = useState(enabled ? 0 : tokens.length);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (!enabled) {
      setCount(tokens.length);
      return;
    }
    setCount(0);
    let i = 0;
    const id = setInterval(() => {
      // Advance one word (plus the whitespace that follows it) per tick.
      i += 1;
      while (i < tokens.length && /^\s+$/.test(tokens[i])) i += 1;
      setCount(i);
      if (i >= tokens.length) {
        clearInterval(id);
        onDoneRef.current?.();
      }
    }, WORD_INTERVAL_MS);
    return () => clearInterval(id);
  }, [tokens, enabled]);

  return { tokens, count, done: count >= tokens.length };
}

// Task 1: display one user or assistant message.
export function ChatMessage({
  message,
  stream = false,
  onStreamEnd,
  isFirst = false,
}: ChatMessageProps): ReactElement {
  const isUser = message.role === "user";
  const shouldStream = stream && !isUser;
  const { tokens, count, done } = useStreamedWords(
    message.content,
    shouldStream,
    onStreamEnd,
  );

  const attachments = message.attachments ?? [];
  const [viewing, setViewing] = useState<number | null>(null);
  const hasText = message.content.length > 0;

  return (
    <div
      className={`flex animate-message-in ${
        isUser
          ? "justify-end origin-bottom-right"
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
              isUser ? "bg-[#EBEBEB] text-[#202020]" : "text-slate-800"
            }`}
          >
            {isUser || <h2 className="text-sm text-[#202020] font-medium">Bot</h2>}
            <p
              aria-hidden={shouldStream || undefined}
              className="text-[#666666] text-sm mt-1 leading-relaxed whitespace-pre-wrap"
            >
              {shouldStream
                ? tokens.slice(0, count).map((t, i) =>
                    /^\s+$/.test(t) ? (
                      t
                    ) : (
                      <span key={i} className="animate-word-in">
                        {t}
                      </span>
                    ),
                  )
                : message.content}
              {shouldStream && !done && (
                <span
                  aria-hidden
                  className="ml-1 inline-block size-1.5 rounded-full bg-[#202020] align-middle animate-caret"
                />
              )}
            </p>
            {shouldStream && <span className="sr-only">{message.content}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
