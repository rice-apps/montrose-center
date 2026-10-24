"use client";

import { useState, type ReactElement } from "react";
import { ArrowUp } from "lucide-react";

export type ChatInputProps = {
  disabled?: boolean;
  onSend: (content: string) => void | Promise<void>;
};

// Task 3: collect a message and call onSend when submitted.
export function ChatInput({ disabled, onSend }: ChatInputProps): ReactElement {
  const [input, setInput] = useState("");

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    const text = input.trim();
    if (!text || disabled) return;

    onSend(text);
    setInput("");
  };

  return (
    <form className="order-2" onSubmit={sendMessage}>
      <div className="p-4 pr-3 text-lg text-slate-800 w-full bg-white rounded-full flex flex-row items-center justify-between h-15 border-2 border-slate-100 drop-shadow-slate-100 drop-shadow-xl">
        <input
          type="text"
          className="border-none mx-2 shadow-none outline-none w-full placeholder:text-slate-500 text-slate-800"
          placeholder="Ask away..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={disabled}
        />
        <button
          type="submit"
          disabled={disabled}
          className="disabled:opacity-20"
        >
          <ArrowUp className="p-2 size-9 flex justify-center items-center text-white bg-[#3566F0] rounded-full" />
        </button>
      </div>
    </form>
  );
}
