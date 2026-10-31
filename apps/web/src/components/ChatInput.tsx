"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type DragEvent,
  type SyntheticEvent,
  type ReactElement,
} from "react";
import { ArrowUp, FilePlusCorner, Image as ImageIcon, Plus } from "lucide-react";
import { AttachmentPreview } from "@/components/AttachmentPreview";
import { AttachmentViewer } from "@/components/AttachmentViewer";
import { toAttachment, type Attachment } from "@/lib/attachments";

export type ChatInputProps = {
  disabled?: boolean;
  onSend: (content: string, attachments: Attachment[]) => void | Promise<void>;
};

const MAX_ATTACHMENTS = 10;

// Task 3: get the message and call onSend when submitted.
export function ChatInput({ disabled, onSend }: ChatInputProps): ReactElement {
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [viewing, setViewing] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Refocus once the assistant has finished replying.
  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  // Close the menu on outside click or Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (e: PointerEvent) => {
      if (!formRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const addFiles = (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;
    // Copy the files out *now*: a FileList is live and gets emptied when the
    // picker is reset (e.target.value = ""), which can happen before React
    // runs the state updater below.
    const room = MAX_ATTACHMENTS - attachments.length;
    const added = Array.from(files).slice(0, Math.max(room, 0)).map(toAttachment);
    if (added.length === 0) return;
    setAttachments((prev) => [...prev, ...added]);
    inputRef.current?.focus();
  };

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
    e.target.value = ""; // allow picking the same file again
    setMenuOpen(false);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const gone = prev.find((a) => a.id === id);
      if (gone) URL.revokeObjectURL(gone.url);
      return prev.filter((a) => a.id !== id);
    });
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const files = Array.from(e.clipboardData.files);
    if (files.length) {
      e.preventDefault();
      addFiles(files);
    }
  };

  const onDrop = (e: DragEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const canSend = !disabled && (input.trim().length > 0 || attachments.length > 0);

  const sendMessage = (e: SyntheticEvent) => {
    e.preventDefault();
    if (!canSend) return;

    // Object URLs stay alive: the sent message keeps showing the previews.
    onSend(input.trim(), attachments);
    setInput("");
    setAttachments([]);
  };

  const menuItem =
    "flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] text-[#202020] transition-colors hover:bg-[#f3f3f3] [&_svg]:size-5 [&_svg]:shrink-0";

  return (
    <form
      ref={formRef}
      className="relative order-2"
      onSubmit={sendMessage}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false);
      }}
      onDrop={onDrop}
    >
      <input ref={photoInputRef} type="file" accept="image/*" multiple hidden onChange={onPick} />
      <input ref={fileInputRef} type="file" multiple hidden onChange={onPick} />

      {menuOpen && (
        <div
          role="menu"
          className="absolute bottom-full left-0 z-10 mb-2 w-60 origin-bottom-left animate-fade-in rounded-3xl border border-[#E5E5E5] bg-white p-2 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.18)]"
        >
          <button type="button" role="menuitem" className={menuItem} onClick={() => photoInputRef.current?.click()}>
            <ImageIcon strokeWidth={1.75} />
            Add photos
          </button>
          <button type="button" role="menuitem" className={menuItem} onClick={() => fileInputRef.current?.click()}>
            <FilePlusCorner strokeWidth={1.75} />
            Add files
          </button>
        </div>
      )}

      <div
        className={`flex w-full flex-col rounded-[28px] border bg-white p-2 text-slate-800 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out ${
          dragging ? "border-[#202020] border-dashed bg-[#fafafa]" : "border-[#E5E5E5]"
        }`}
      >
        {attachments.length > 0 && (
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
            {attachments.map((a, i) => (
              <AttachmentPreview
                key={a.id}
                attachment={a}
                onOpen={() => setViewing(i)}
                onRemove={() => removeAttachment(a.id)}
              />
            ))}
          </div>
        )}

        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Add attachments"
            aria-expanded={menuOpen}
            className={`flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-all duration-300 hover:bg-[#f3f3f3] active:scale-90 ${
              menuOpen ? "rotate-45 bg-[#f3f3f3]" : ""
            }`}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <Plus className="size-5 text-[#202020]" />
          </button>
          <input
            ref={inputRef}
            type="text"
            className="mx-1 w-full border-none bg-transparent text-[15px] text-slate-800 shadow-none outline-none placeholder:text-[#8a8a8a] placeholder:transition-opacity focus:placeholder:opacity-60"
            placeholder={dragging ? "Drop files to attach" : "Ask anything..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPaste={onPaste}
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
      </div>

      <AttachmentViewer attachments={attachments} index={viewing} onIndexChange={setViewing} />
    </form>
  );
}
