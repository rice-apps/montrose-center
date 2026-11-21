"use client";

import { useEffect, useRef, useState, type SyntheticEvent, type ReactElement } from "react";
import { ArrowUp } from "lucide-react";

export type ChatInputProps = {
  disabled?: boolean;
  onSend: (content: string) => void | Promise<void>;
};

export function ChatInput({ disabled, onSend }: ChatInputProps): ReactElement {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  const canSend = !disabled && input.trim().length > 0;

  const sendMessage = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (!canSend) return;

    try {
      await onSend(input.trim());
      setInput("");
    } catch {
      // The parent displays the error. Keep the draft if sending fails.
    }
  };

  return (
    <form className="relative order-2" onSubmit={sendMessage}>
      <div className="flex w-full items-center gap-1 rounded-[28px] border border-[#E5E5E5] bg-white p-2 text-slate-800 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)]">
        <input
          ref={inputRef}
          type="text"
          className="mx-1 w-full border-none bg-transparent text-[15px] text-slate-800 shadow-none outline-none placeholder:text-[#8a8a8a] placeholder:transition-opacity focus:placeholder:opacity-60"
          placeholder="Ask anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
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
