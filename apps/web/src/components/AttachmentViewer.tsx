"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Download, FileText, X } from "lucide-react";
import { fileExtension, formatBytes, type Attachment } from "@/lib/attachments";

type Props = {
  attachments: Attachment[];
  /** Index of the attachment being shown, or null when closed. */
  index: number | null;
  onIndexChange: (index: number | null) => void;
};

function isPdf(a: Attachment): boolean {
  return a.type === "application/pdf" || a.name.toLowerCase().endsWith(".pdf");
}

/** Full-screen modal for previewing attachments without leaving the chat. */
export function AttachmentViewer({
  attachments,
  index,
  onIndexChange,
}: Props): ReactElement | null {
  const [mounted, setMounted] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => setMounted(true), []);

  const open = index !== null && index >= 0 && index < attachments.length;
  const count = attachments.length;

  // Keyboard: Esc closes, arrows step through. Also lock page scroll.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onIndexChange(null);
      else if (e.key === "ArrowRight" && count > 1) onIndexChange((index! + 1) % count);
      else if (e.key === "ArrowLeft" && count > 1) onIndexChange((index! - 1 + count) % count);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, index, count, onIndexChange]);

  // Keep focus in our UI (not inside a PDF iframe) so Esc/arrows keep working.
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => closeRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open, index]);

  if (!mounted || !open) return null;

  const a = attachments[index!];
  const navButton =
    "absolute top-1/2 z-10 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-90";

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={a.name}
      className="fixed inset-0 z-50 flex animate-fade-in flex-col bg-black/70 backdrop-blur-sm"
      onClick={() => onIndexChange(null)}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between gap-4 px-5 py-4 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{a.name}</p>
          <p className="text-xs text-white/60">
            {fileExtension(a.name)} · {formatBytes(a.size)}
            {count > 1 && ` · ${index! + 1} of ${count}`}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <a
            href={a.url}
            download={a.name}
            aria-label="Download"
            className="flex size-10 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Download className="size-5" />
          </a>
          <button
            type="button"
            ref={closeRef}
            aria-label="Close"
            onClick={() => onIndexChange(null)}
            className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20 active:scale-90"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-6 sm:px-20">
        {count > 1 && (
          <button
            type="button"
            aria-label="Previous"
            className={`${navButton} left-4`}
            onClick={(e) => {
              e.stopPropagation();
              onIndexChange((index! - 1 + count) % count);
            }}
          >
            <ChevronLeft className="size-6" />
          </button>
        )}

        <div key={a.id} className="flex max-h-full max-w-full animate-message-in" onClick={(e) => e.stopPropagation()}>
          {a.kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element -- local object URL
            <img
              src={a.url}
              alt={a.name}
              className="max-h-[calc(100vh-7rem)] max-w-full rounded-2xl object-contain shadow-2xl"
            />
          ) : isPdf(a) ? (
            <iframe
              src={a.url}
              title={a.name}
              // Chrome's PDF viewer grabs focus once loaded; take it back so Esc still closes.
              onLoad={() => {
                closeRef.current?.focus();
                setTimeout(() => closeRef.current?.focus(), 250);
              }}
              className="h-[calc(100vh-7rem)] w-[min(900px,90vw)] rounded-2xl bg-white shadow-2xl"
            />
          ) : (
            <div className="flex w-80 flex-col items-center gap-4 rounded-3xl bg-white p-8 text-center shadow-2xl">
              <span className="flex size-16 items-center justify-center rounded-2xl bg-[#EBEBEB] text-[#202020]">
                <FileText className="size-8" strokeWidth={1.5} />
              </span>
              <div className="min-w-0 max-w-full">
                <p className="truncate font-medium text-[#202020]">{a.name}</p>
                <p className="text-sm text-[#8a8a8a]">No preview available</p>
              </div>
              <a
                href={a.url}
                download={a.name}
                className="flex items-center gap-2 rounded-full bg-[#202020] px-4 py-2 text-sm text-white transition-transform hover:scale-105 active:scale-95"
              >
                <Download className="size-4" />
                Download
              </a>
            </div>
          )}
        </div>

        {count > 1 && (
          <button
            type="button"
            aria-label="Next"
            className={`${navButton} right-4`}
            onClick={(e) => {
              e.stopPropagation();
              onIndexChange((index! + 1) % count);
            }}
          >
            <ChevronRight className="size-6" />
          </button>
        )}
      </div>
    </div>,
    document.body,
  );
}
