from datetime import datetime, timezone
from uuid import uuid4

from supabase import Client, PostgrestAPIError

from app.schemas.chats import Chat, ChatSummary, Message

# Postgres error code for a foreign key violation.
FOREIGN_KEY_VIOLATION = "23503"


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _to_summary(row: dict) -> ChatSummary:
    return ChatSummary(
        id=row["chat_id"],
        # right now the description is holding the chat title 
        title=row["description"] or "", 
        created_at=row["time_stamp"],
        updated_at=row["last_updated"],
    )


def _to_message(row: dict) -> Message:
    return Message(
        id=row["message_id"],
        chat_id=row["chat_id"],
        role="assistant" if row["is_agent"] else "user",
        content=row["content"],
        created_at=row["time_stamp"],
    )


class ChatRepository:
    def __init__(self, client: Client) -> None:
        self.client = client

    def create_chat(self, title: str) -> Chat:
        now = _now()
        row = (
            self.client.table("chats")
            .insert(
                {
                    "chat_id": str(uuid4()),
                    "description": title,
                    "time_stamp": now,
                    "last_updated": now,
                }
            )
            .execute()
            .data[0]
        )
        return Chat(**_to_summary(row).model_dump(), messages=[])

    def list_chats(self) -> list[ChatSummary]:
        rows = (
            self.client.table("chats")
            .select("chat_id, description, time_stamp, last_updated")
            .order("last_updated", desc=True)
            .execute()
            .data
        )
        return [_to_summary(row) for row in rows]

    def get_chat(self, chat_id: str) -> Chat:
        rows = (
            self.client.table("chats")
            .select("*, messages(*)")
            .eq("chat_id", chat_id)
            .order("time_stamp", foreign_table="messages")
            .execute()
            .data
        )
        if not rows:
            # Placeholder for now if chat is not found 
            print(f"Chat {chat_id} not found")
            raise LookupError(f"Chat {chat_id} not found")

        row = rows[0]
        return Chat(
            **_to_summary(row).model_dump(),
            messages=[_to_message(m) for m in row["messages"]],
        )

    def update_chat_title(self, chat_id: str, title: str) -> Chat:
        (
            self.client.table("chats")
            .update({"description": title})
            .eq("chat_id", chat_id)
            .execute()
        )
        return self.get_chat(chat_id)

    def insert_message(self, chat_id: str, content: str, is_agent: bool) -> Message:
        sent_at = _now()
        try:
            row = (
                self.client.table("messages")
                .insert(
                    {
                        "message_id": str(uuid4()),
                        "chat_id": chat_id,
                        "content": content,
                        "is_agent": is_agent,
                        "time_stamp": sent_at,
                    }
                )
                .execute()
                .data[0]
            )
        except PostgrestAPIError as error:
            if error.code == FOREIGN_KEY_VIOLATION:  # no chat has this chat_id
                raise LookupError(f"Chat {chat_id} not found") from error
            raise

        # Sending a message moves the chat to the top of the sidebar.
        (
            self.client.table("chats")
            .update({"last_updated": sent_at})
            .eq("chat_id", chat_id)
            .execute()
        )
        return _to_message(row)
