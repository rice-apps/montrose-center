import type { ReactElement } from "react";

export type ChatInputProps = {
  disabled?: boolean;
  onSend: (content: string) => void | Promise<void>;
};

// Task 3: collect a message and call onSend when submitted.
export declare function ChatInput(props: ChatInputProps): ReactElement;
