"""Coordinate chat persistence and reply generation."""

import asyncio

from app.errors import AgentResponseError, InvalidChatInput
from app.interfaces import ChatRepositoryProtocol, ResourceAgentProtocol
from app.schemas.chats import Chat, ChatSummary, SendMessageResponse


class ChatService:
    def __init__(
        self, repository: ChatRepositoryProtocol, agent: ResourceAgentProtocol
    ) -> None:
        self.repository = repository
        self.agent = agent

    def create_chat(self, title: str) -> Chat:
        return self.repository.create_chat(self._nonblank(title, "Title"))

    def list_chats(self) -> list[ChatSummary]:
        return self.repository.list_chats()

    def get_chat(self, chat_id: str) -> Chat:
        return self.repository.get_chat(chat_id)

    def update_chat_title(self, chat_id: str, title: str) -> Chat:
        return self.repository.update_chat_title(chat_id, self._nonblank(title, "Title"))

    async def send_message(self, chat_id: str, content: str) -> SendMessageResponse:
        content = self._nonblank(content, "Message")
        # The repository uses a synchronous client; keep its I/O off the event loop.
        chat = await asyncio.to_thread(self.repository.get_chat, chat_id)
        try:
            answer = await self.agent.respond(chat.messages, content)
        except Exception as error:
            raise AgentResponseError("Unable to generate a reply. Please try again.") from error

        if not isinstance(answer, str) or not answer.strip():
            raise AgentResponseError("The agent returned an empty reply. Please try again.")

        # Model failures must not leave a user message without a reply in storage.
        return await asyncio.to_thread(self._save_exchange, chat_id, content, answer)

    def _save_exchange(self, chat_id: str, content: str, answer: str) -> SendMessageResponse:
        # These are separate writes in the existing repository, not a transaction.
        user_message = self.repository.insert_message(chat_id, content, is_agent=False)
        assistant_message = self.repository.insert_message(chat_id, answer, is_agent=True)
        return SendMessageResponse(
            user_message=user_message,
            assistant_message=assistant_message,
        )

    @staticmethod
    def _nonblank(value: str, field: str) -> str:
        value = value.strip()
        if not value:
            raise InvalidChatInput(f"{field} must not be blank.")
        return value
