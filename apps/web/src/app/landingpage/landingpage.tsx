"use client";

import { useState, type KeyboardEvent } from "react";
import styles from "./landingpage.module.css";

interface LandingPageProps {
  onSend?: (content: string) => void | Promise<void>;
  onAttach?: () => void;
}

function PlusIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
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

export function LandingPage({ onSend, onAttach }: LandingPageProps) {
  const [value, setValue] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const canSend = value.trim().length > 0;
  // Once the first message is sent, the input docks to the bottom as a single-row bar
  const docked = messages.length > 0;

  function submit() {
    if (!canSend) return;
    const content = value.trim();
    setMessages((prev) => [...prev, content]);
    onSend?.(content);
    setValue("");
  }

  // Enter sends; Shift+Enter adds a new line
  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  const textarea = (
    <textarea
      className={styles.textarea}
      placeholder="Ask anything..."
      aria-label="Ask anything"
      rows={1}
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
    <main className={docked ? styles.chatPage : styles.page}>
      {docked ? (
        <div className={styles.thread}>
          {messages.map((m, i) => (
            <p key={i} className={styles.userMessage}>
              {m}
            </p>
          ))}
        </div>
      ) : (
        <h1 className={styles.heading}>What can I help you with?</h1>
      )}

      <form
        className={docked ? styles.bar : styles.inputBox}
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        {docked ? (
          <>
            <button type="button" className={styles.barAttach} onClick={onAttach} aria-label="Attach">
              <PlusIcon size={20} />
            </button>
            {textarea}
            {sendButton}
          </>
        ) : (
          <>
            {textarea}
            <div className={styles.actions}>
              <button type="button" className={styles.attach} onClick={onAttach}>
                <PlusIcon />
                Attach
              </button>
              {sendButton}
            </div>
          </>
        )}
      </form>
    </main>
  );
}
