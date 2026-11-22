"use client";

import { ChatInput, type ChatInputProps } from "@/components/ChatInput";
import styles from "./landing-page.module.css";

export function LandingPage({ onSend, disabled }: ChatInputProps) {
  return (
    <main className={styles.page}>
      <h1 className={styles.heading}>What can I help you with?</h1>
      <div className={styles.inputBox}>
        <ChatInput onSend={onSend} disabled={disabled} />
      </div>
    </main>
  );
}
