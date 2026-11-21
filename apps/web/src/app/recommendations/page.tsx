"use client";

import { useState, type ReactElement } from "react";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import {
  ProgramRecommendation,
  type ProgramRecommendationData,
} from "@/components/ProgramRecommendation";
import type { UIMessage } from "@/lib/attachments";

// Placeholder content: nothing on this page calls the API yet.
const SAMPLE_MESSAGES: UIMessage[] = [
  message("m1", "user", "Text.............."),
  message("m2", "assistant", "Absolutely.........."),
  message("m3", "user", "What are your suggestions based on my case?"),
  message("m4", "assistant", "Here are three beginner-friendly options to explore."),
];

function message(id: string, role: UIMessage["role"], content: string): UIMessage {
  return { id, chat_id: "sample", role, content, created_at: new Date(0).toISOString() };
}

export default function RecommendationsPage(): ReactElement {
  const [messages, setMessages] = useState<UIMessage[]>(SAMPLE_MESSAGES);
  // Recommended programs for each bot reply, keyed by message id. Empty until the agent returns them.
  const [recommendations] = useState<Record<string, ProgramRecommendationData[]>>({});
  // Open card as "messageId:programId", so the same program under two replies opens separately.
  const [openKey, setOpenKey] = useState<string | null>(null);

  // Placeholder: show the new message locally until this page is wired to the chat API.
  const send = (content: string) => {
    if (!content) return;
    setMessages((prev) => [...prev, message(crypto.randomUUID(), "user", content)]);
  };

  return (
    <main className="flex h-dvh flex-col bg-[#F3F3F3]">
      <div className="chat-scroll flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl px-6 pb-10 pt-10">
          <h1 className="mb-10 px-2 text-2xl font-semibold text-[#202020]">
            Program Recommendations
          </h1>

          <div className="flex flex-col">
            {messages.map((m, i) => {
              const programs = recommendations[m.id] ?? [];

              return (
                <div key={m.id}>
                  <ChatMessage message={m} isFirst={i === 0} />

                  {/* Cards appear under the bot reply that recommended them. */}
                  {programs.length > 0 && (
                    <div className="mt-1 max-w-3xl space-y-3">
                      {programs.map((program, index) => {
                        const cardKey = `${m.id}:${program.id}`;
                        return (
                          <ProgramRecommendation
                            key={cardKey}
                            index={index + 1}
                            program={program}
                            open={openKey === cardKey}
                            onToggle={() => setOpenKey(openKey === cardKey ? null : cardKey)}
                          />
                        );
                      })}

                      <div className="flex gap-2 pt-1">
                        {["Compare these", "Show more options"].map((label) => (
                          <button
                            key={label}
                            type="button"
                            className="cursor-pointer rounded-xl border border-[#E5E5E5] bg-[#F3F3F3] px-3 py-2.5 text-sm text-[#202020] transition-colors hover:bg-white"
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-6 pb-6">
        <ChatInput onSend={send} />
      </div>
    </main>
  );
}
