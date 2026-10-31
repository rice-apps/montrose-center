import type { Message } from "@/lib/api";

/** A file the user picked in the composer. Lives only in the browser for now. */
export type Attachment = {
  id: string;
  name: string;
  size: number;
  type: string;
  /** Object URL used for previews. */
  url: string;
  kind: "image" | "file";
  file: File;
};

/** A message as the UI renders it: the API message plus local attachments. */
export type UIMessage = Message & { attachments?: Attachment[] };

export function toAttachment(file: File): Attachment {
  return {
    id: crypto.randomUUID(),
    name: file.name,
    size: file.size,
    type: file.type,
    url: URL.createObjectURL(file),
    kind: file.type.startsWith("image/") ? "image" : "file",
    file,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function fileExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(dot + 1).toUpperCase() : "FILE";
}
