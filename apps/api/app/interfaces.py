"""Backend contracts, independent of FastAPI and external service clients.

Implementations satisfy these protocols by providing matching methods; they do
not need to inherit from them. Constructors and implementation details stay out
of the contracts so providers can supply real implementations or test doubles.
"""

from typing import Protocol

from app.schemas.chats import Chat, ChatSummary, Message, SendMessageResponse
from app.schemas.resource_search import ResourceSearchResult


class ChatRepositoryProtocol(Protocol):
    """Persistence operations needed by the chat service."""

    def create_chat(self, title: str) -> Chat: ...

    def list_chats(self) -> list[ChatSummary]: ...

    def get_chat(self, chat_id: str) -> Chat: ...

    def update_chat_title(self, chat_id: str, title: str) -> Chat: ...

    def insert_message(self, chat_id: str, content: str, is_agent: bool) -> Message: ...


class ResourceAgentProtocol(Protocol):
    """Reply generation needed by the chat service."""

    def respond(self, history: list[Message], user_text: str) -> str: ...


class ChatServiceProtocol(Protocol):
    """Chat operations exposed to HTTP handlers."""

    def create_chat(self, title: str) -> Chat: ...

    def list_chats(self) -> list[ChatSummary]: ...

    def get_chat(self, chat_id: str) -> Chat: ...

    def update_chat_title(self, chat_id: str, title: str) -> Chat: ...

    def send_message(self, chat_id: str, content: str) -> SendMessageResponse: ...


class ResourceRepositoryProtocol(Protocol):
    """Catalog reads needed by the agent prompt"""

    def list_active(self, limit: int, offset: int = 0) -> list[ResourceSearchResult]:
        """Return up to `limit` active programs starting at `offset`, in a stable order."""
        ...


class ResourceSearchRepositoryProtocol(Protocol):
    """Ranked catalog reads needed by the search service."""

    def search_services(self, query: str, limit: int = 10) -> list[ResourceSearchResult]: ...


class ResourceSearchServiceProtocol(Protocol):
    """Validated search operation exposed to the agent tool and catalog API."""

    def search_services(self, query: str, limit: int = 10) -> list[ResourceSearchResult]: ...
