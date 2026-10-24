import type { ReactElement } from "react";

export function TypingIndicator(): ReactElement {
  return (
    <div
      className="flex justify-start px-4 py-2"
      aria-label="Assistant is typing"
    >
      <div className="flex gap-1.5">
        <span className="size-1.5 rounded-full bg-slate-300 animate-dot" />
        <span className="size-1.5 rounded-full bg-slate-300 animate-dot [animation-delay:0.15s]" />
        <span className="size-1.5 rounded-full bg-slate-300 animate-dot [animation-delay:0.3s]" />
      </div>
    </div>
  );
}
