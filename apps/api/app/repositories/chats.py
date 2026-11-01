from datetime import datetime, timedelta, timezone
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


def _new_message(chat_id: str, content: str, is_agent: bool, at: datetime) -> dict:
    return {
        "message_id": str(uuid4()),
        "chat_id": chat_id,
        "content": content,
        "is_agent": is_agent,
        "time_stamp": at.isoformat(),
    }


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

    def append_exchange(self, chat_id: str, user_text: str, assistant_text: str) -> SendMessageResponse:
        sent_at = datetime.now(timezone.utc)
        answered_at = sent_at + timedelta(microseconds=1)
        rows = (
            self.client.table("messages")
            .insert(
                [
                    _new_message(chat_id, user_text, is_agent=False, at=sent_at),
                    _new_message(chat_id, assistant_text, is_agent=True, at=answered_at),
                ]
            )
            .execute()
            .data
        )
        user_row = next(row for row in rows if not row["is_agent"])
        assistant_row = next(row for row in rows if row["is_agent"])

        (
            self.client.table("chats")
            .update({"last_updated": answered_at.isoformat()})
            .eq("chat_id", chat_id)
            .execute()
        )

        return SendMessageResponse(
            user_message=_to_message(user_row),
            assistant_message=_to_message(assistant_row),
        )
