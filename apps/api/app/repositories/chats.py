"""Task 6: persist chats and messages in Supabase."""

from datetime import datetime, timezone
from uuid import uuid4

from supabase import Client

from app.schemas.chats import Chat, ChatSummary, Message, SendMessageResponse


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
            self.client.table("chat_history")
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
            self.client.table("chat_history")
            .select("chat_id, description, time_stamp, last_updated")
            .order("last_updated", desc=True)
            .execute()
            .data
        )
        return [_to_summary(row) for row in rows]

    def get_chat(self, chat_id: str) -> Chat:
        rows = (
            self.client.table("chat_history")
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
            self.client.table("chat_history")
            .update({"description": title})
            .eq("chat_id", chat_id)
            .execute()
        )
        return self.get_chat(chat_id)

    def append_exchange(self, chat_id: str, user_text: str, assistant_text: str) -> SendMessageResponse:
        # Separate timestamps 
        user_row = self._insert_message(chat_id, user_text, is_agent=False)
        assistant_row = self._insert_message(chat_id, assistant_text, is_agent=True)

        (
            self.client.table("chat_history")
            .update({"last_updated": assistant_row["time_stamp"]})
            .eq("chat_id", chat_id)
            .execute()
        )

        return SendMessageResponse(
            user_message=_to_message(user_row),
            assistant_message=_to_message(assistant_row),
        )

    def _insert_message(self, chat_id: str, content: str, is_agent: bool) -> dict:
        return (
            self.client.table("messages")
            .insert(
                {
                    "message_id": str(uuid4()),
                    "chat_id": chat_id,
                    "content": content,
                    "is_agent": is_agent,
                    "time_stamp": _now(),
                }
            )
            .execute()
            .data[0]
        )
