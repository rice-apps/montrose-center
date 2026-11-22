"""Coordinate chat persistence and reply generation."""

from app.interfaces import ChatRepositoryProtocol, ResourceAgentProtocol
from app.schemas.chats import Chat, ChatSummary, SendMessageResponse


class ChatService:
    def __init__(
        self, repository: ChatRepositoryProtocol, agent: ResourceAgentProtocol
    ) -> None:
        self.repository = repository
        self.agent = agent

    def create_chat(self, title: str) -> Chat:
        return self.repository.create_chat(title)

    def list_chats(self) -> list[ChatSummary]:
        return self.repository.list_chats()

    def get_chat(self, chat_id: str) -> Chat:
        return self.repository.get_chat(chat_id)

    def update_chat_title(self, chat_id: str, title: str) -> Chat:
        return self.repository.update_chat_title(chat_id, title)

    def send_message(self, chat_id: str, content: str) -> SendMessageResponse:
        # Load prior history before saving so the new prompt is sent to the agent once.
        chat = self.repository.get_chat(chat_id)
        user_message = self.repository.insert_message(chat_id, content, is_agent=False)
        answer = self.agent.respond(chat.messages, content)
        assistant_message = self.repository.insert_message(chat_id, answer, is_agent=True)
        return SendMessageResponse(
            user_message=user_message,
            assistant_message=assistant_message,
        )
