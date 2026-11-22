"use client";

import { useState, type KeyboardEvent } from "react";
import styles from "./landingpage.module.css";

interface LandingPageProps {
  onSend: (content: string) => void | Promise<void>;
  disabled?: boolean;
}

function ArrowUpIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        d="M9 14.5V3.5M4 8.5l5-5 5 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LandingPage({ onSend, disabled = false }: LandingPageProps) {
  const [value, setValue] = useState("");
  const canSend = !disabled && value.trim().length > 0;

  async function submit() {
    if (!canSend) return;
    try {
      await onSend(value.trim());
      setValue("");
    } catch {
      // The chat page displays send errors.
    }
  }

  // Enter sends; Shift+Enter adds a new line
  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void submit();
    }
  }

  const textarea = (
    <textarea
      className={styles.textarea}
      placeholder="Ask anything..."
      aria-label="Ask anything"
      rows={1}
      disabled={disabled}
      autoFocus
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
    />
  );

  const sendButton = (
    <button type="submit" className={styles.send} disabled={!canSend} aria-label="Send">
      <ArrowUpIcon />
    </button>
  );

  return (
    <main className={styles.page}>
      <h1 className={styles.heading}>What can I help you with?</h1>
      <form
        className={styles.inputBox}
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        {textarea}
        <div className={styles.actions}>{sendButton}</div>
      </form>
    </main>
  );
}
