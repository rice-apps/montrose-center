"""Backend contracts, independent of FastAPI and external service clients.

Implementations satisfy these protocols by providing matching methods; they do
not need to inherit from them. Constructors and implementation details stay out
of the contracts so providers can supply real implementations or test doubles.
"""

from typing import Protocol

from app.schemas.chats import Chat, ChatSummary, Message, SendMessageResponse


class ChatRepositoryProtocol(Protocol):
    """Persistence operations needed by the chat service."""

    def create_chat(self, title: str) -> Chat: ...

    def list_chats(self) -> list[ChatSummary]: ...

    def get_chat(self, chat_id: str) -> Chat: ...

    def update_chat_title(self, chat_id: str, title: str) -> Chat: ...

    def insert_message(self, chat_id: str, content: str, is_agent: bool) -> Message: ...


class ResourceAgentProtocol(Protocol):
    """Reply generation needed by the chat service."""

    async def respond(self, history: list[Message], user_text: str) -> str: ...


class ChatServiceProtocol(Protocol):
    """Chat operations exposed to HTTP handlers."""

    def create_chat(self, title: str) -> Chat: ...

    def list_chats(self) -> list[ChatSummary]: ...

    def get_chat(self, chat_id: str) -> Chat: ...

    def update_chat_title(self, chat_id: str, title: str) -> Chat: ...

    async def send_message(self, chat_id: str, content: str) -> SendMessageResponse: ...
