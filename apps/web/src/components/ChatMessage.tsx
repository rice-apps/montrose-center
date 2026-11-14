import type { ReactElement } from "react";
import type { Message } from "@/lib/api";

export type ChatMessageProps = { message: Message };

// Task 1: display one user or assistant message.
export declare function ChatMessage(props: ChatMessageProps): ReactElement;
