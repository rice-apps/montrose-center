"""Task 5: coordinate chat persistence and the agent."""

from app.interfaces import ChatRepositoryProtocol, ResourceAgentProtocol
from app.schemas.chats import Chat, ChatSummary, SendMessageResponse


class ChatService:
    def __init__(
        self, repository: ChatRepositoryProtocol, agent: ResourceAgentProtocol
    ) -> None:
        self.repository = repository
        self.agent = agent

    # TODO: implement chat creation, reads, title updates, and message handling.
    def create_chat(self, title: str) -> Chat: ...

    def list_chats(self) -> list[ChatSummary]: ...

    def get_chat(self, chat_id: str) -> Chat: ...

    def update_chat_title(self, chat_id: str, title: str) -> Chat: ...

    async def send_message(self, chat_id: str, content: str) -> SendMessageResponse: ...
