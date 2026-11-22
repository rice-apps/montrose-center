"use client";

import { useEffect, useRef, useState, type SyntheticEvent, type ReactElement } from "react";
import { ArrowUp } from "lucide-react";

export type ChatInputProps = {
  disabled?: boolean;
  onSend: (content: string) => void | Promise<void>;
};

export function ChatInput({ disabled, onSend }: ChatInputProps): ReactElement {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  useEffect(() => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [input]);

  const canSend = !disabled && input.trim().length > 0;

  const sendMessage = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (!canSend) return;

    const content = input;
    setInput("");
    try {
      await onSend(content.trim());
    } catch {
      // The parent displays the error. Restore the draft if sending fails.
      setInput(content);
    }
  };

  return (
    <form className="relative order-2" onSubmit={sendMessage}>
      <div className="flex w-full items-end gap-1 rounded-[28px] border border-[#E5E5E5] bg-white p-2 text-slate-800 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)]">
        <textarea
          ref={inputRef}
          rows={1}
          aria-label="Message"
          className="mx-1 min-h-9 max-h-40 w-full resize-none overflow-y-auto border-none bg-transparent py-1.5 text-[15px] leading-6 text-slate-800 shadow-none outline-none placeholder:text-[#8a8a8a] placeholder:transition-opacity focus:placeholder:opacity-60"
          placeholder="Ask anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              void sendMessage(e);
            }
          }}
          disabled={disabled}
        />
        <button
          type="submit"
          aria-label="Send message"
          disabled={!canSend}
          className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#202020] text-white transition-all duration-200 ease-out hover:scale-105 active:scale-90 disabled:cursor-default disabled:opacity-20 disabled:hover:scale-100"
        >
          <ArrowUp className="size-5" strokeWidth={2.25} />
        </button>
      </div>
    </form>
  );
}
