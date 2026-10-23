"""Task 6: persist chats and messages in Supabase."""

from supabase import Client

from app.schemas.chats import Chat, ChatSummary, SendMessageResponse


class ChatRepository:
    def __init__(self, client: Client) -> None: ...

    # TODO: read and write the Supabase chats and messages tables.
    def create_chat(self, title: str) -> Chat: ...

    def list_chats(self) -> list[ChatSummary]: ...

    def get_chat(self, chat_id: str) -> Chat: ...

    def update_chat_title(self, chat_id: str, title: str) -> Chat: ...

    def append_exchange(self, chat_id: str, user_text: str, assistant_text: str) -> SendMessageResponse: ...
