"use client";

import type { ReactElement } from "react";
import { X } from "lucide-react";
import { fileExtension, type Attachment } from "@/lib/attachments";

type Props = {
  attachment: Attachment;
  /** Shows the remove button when provided. */
  onRemove?: () => void;
  /** Called when the tile is clicked (opens the viewer). */
  onOpen?: () => void;
  /** "composer" = tiles in the input box, "message" = tiles in the chat log. */
  variant?: "composer" | "message";
};

/** "Mitsutani-Literature-1985" -> "Mitsutani-…ature-1985" */
function truncateMiddle(text: string, max = 22): string {
  if (text.length <= max) return text;
  const keep = max - 1;
  const head = Math.ceil(keep / 2);
  return `${text.slice(0, head)}…${text.slice(text.length - (keep - head))}`;
}

function baseName(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}

export function AttachmentPreview({
  attachment,
  onRemove,
  onOpen,
  variant = "composer",
}: Props): ReactElement {
  const isImage = attachment.kind === "image";
  const size = variant === "composer" ? "size-28" : isImage ? "size-40" : "size-28";

  return (
    <div className={`group relative ${size} shrink-0 animate-fade-in`}>
      <button
        type="button"
        onClick={onOpen}
        title={attachment.name}
        aria-label={`Open ${attachment.name}`}
        className="block size-full cursor-pointer overflow-hidden rounded-2xl bg-[#EBEBEB] outline-offset-2 transition-colors hover:bg-[#E3E3E3]"
      >
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- local object URL
          <img
            src={attachment.url}
            alt={attachment.name}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <span className="flex size-full flex-col justify-between p-3 text-left">
            <span className="text-xs font-medium tracking-wide text-[#666666]">
              {fileExtension(attachment.name)}
            </span>
            <span className="line-clamp-2 break-all text-[13px] leading-snug text-[#202020]">
              {truncateMiddle(baseName(attachment.name))}
            </span>
          </span>
        )}
      </button>

      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${attachment.name}`}
          className="absolute right-1.5 top-1.5 flex size-6 cursor-pointer items-center justify-center rounded-full bg-[#202020]/75 text-white opacity-100 backdrop-blur-sm transition-all hover:bg-[#202020] active:scale-90 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
        >
          <X className="size-3.5" strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}
