"""Service behavior with protocol-shaped fakes; no database or model credentials."""

import asyncio
from unittest.mock import Mock, call

import pytest

from app.errors import AgentResponseError, ChatNotFound, InvalidChatInput
from app.interfaces import ChatRepositoryProtocol, ResourceAgentProtocol
from app.schemas.chats import Chat, Message
from app.services.chats import ChatService

CHAT_ID = "11111111-1111-1111-1111-111111111111"
TIMESTAMP = "2026-11-21T12:00:00+00:00"


def message(role: str, content: str, message_id: str) -> Message:
    return Message(
        id=message_id, chat_id=CHAT_ID, role=role,
        content=content, created_at=TIMESTAMP,
    )


@pytest.fixture
def setup_service():
    repository = Mock(spec=ChatRepositoryProtocol)
    agent = Mock(spec=ResourceAgentProtocol)
    chat = Chat(
        id=CHAT_ID, title="Housing", created_at=TIMESTAMP,
        updated_at=TIMESTAMP, messages=[],
    )
    repository.get_chat.return_value = chat
    repository.create_chat.return_value = chat
    repository.list_chats.return_value = []
    repository.update_chat_title.return_value = chat
    agent.respond.return_value = "Contact the housing team."
    return ChatService(repository, agent), repository, agent, chat


def test_create_and_rename_trim_titles(setup_service):
    service, repository, _, chat = setup_service
    assert service.create_chat("  Housing  ") is chat
    repository.create_chat.assert_called_once_with("Housing")
    assert service.update_chat_title(CHAT_ID, "  New title\n") is chat
    repository.update_chat_title.assert_called_once_with(CHAT_ID, "New title")


def test_reads_return_repository_results(setup_service):
    service, repository, _, chat = setup_service
    assert service.list_chats() == []
    assert service.get_chat(CHAT_ID) is chat
    repository.get_chat.assert_called_once_with(CHAT_ID)


@pytest.mark.parametrize("title", ["", " \n\t "])
@pytest.mark.parametrize("operation", ["create", "rename"])
def test_blank_titles_do_not_reach_storage(setup_service, title, operation):
    service, repository, _, _ = setup_service
    with pytest.raises(InvalidChatInput):
        if operation == "create":
            service.create_chat(title)
        else:
            service.update_chat_title(CHAT_ID, title)
    assert repository.mock_calls == []


def test_send_passes_history_and_saves_exchange_after_generation(setup_service):
    service, repository, agent, chat = setup_service
    chat.messages = [
        message("user", "Housing help?", "old-user"),
        message("assistant", "Try the housing team.", "old-assistant"),
    ]
    user = message("user", "Who should I contact?", "new-user")
    assistant = message("assistant", "Contact the housing team.", "new-assistant")
    repository.insert_message.side_effect = [user, assistant]

    async def respond(history, content):
        assert history == chat.messages
        assert content == user.content
        repository.insert_message.assert_not_called()
        return assistant.content

    agent.respond.side_effect = respond
    response = asyncio.run(service.send_message(CHAT_ID, "  Who should I contact?  "))

    assert response.user_message is user
    assert response.assistant_message is assistant
    agent.respond.assert_awaited_once_with(chat.messages, user.content)
    assert repository.insert_message.call_args_list == [
        call(CHAT_ID, user.content, is_agent=False),
        call(CHAT_ID, assistant.content, is_agent=True),
    ]
    assert len(chat.messages) == 2  # The service does not append the question to history twice.


def test_blank_message_skips_database_and_agent(setup_service):
    service, repository, agent, _ = setup_service
    with pytest.raises(InvalidChatInput):
        asyncio.run(service.send_message(CHAT_ID, " \n "))
    assert repository.mock_calls == []
    agent.respond.assert_not_awaited()


def test_missing_chat_skips_agent_and_writes(setup_service):
    service, repository, agent, _ = setup_service
    repository.get_chat.side_effect = ChatNotFound("Missing")
    with pytest.raises(ChatNotFound):
        asyncio.run(service.send_message(CHAT_ID, "Question"))
    agent.respond.assert_not_awaited()
    repository.insert_message.assert_not_called()


def test_model_failure_does_not_save_messages_or_expose_provider_details(setup_service):
    service, repository, agent, _ = setup_service
    failure = RuntimeError("private provider diagnostic")
    agent.respond.side_effect = failure
    with pytest.raises(AgentResponseError) as caught:
        asyncio.run(service.send_message(CHAT_ID, "Question"))
    assert caught.value.__cause__ is failure
    assert "private provider diagnostic" not in str(caught.value)
    repository.insert_message.assert_not_called()


@pytest.mark.parametrize("answer", ["", " \n ", None])
def test_unusable_reply_does_not_save_messages(setup_service, answer):
    service, repository, agent, _ = setup_service
    agent.respond.return_value = answer
    with pytest.raises(AgentResponseError):
        asyncio.run(service.send_message(CHAT_ID, "Question"))
    repository.insert_message.assert_not_called()


def test_cancellation_is_not_converted_to_a_model_failure(setup_service):
    service, repository, agent, _ = setup_service
    agent.respond.side_effect = asyncio.CancelledError()
    with pytest.raises(asyncio.CancelledError):
        asyncio.run(service.send_message(CHAT_ID, "Question"))
    repository.insert_message.assert_not_called()


def test_storage_read_failure_skips_agent(setup_service):
    service, repository, agent, _ = setup_service
    repository.get_chat.side_effect = RuntimeError("Database unavailable")
    with pytest.raises(RuntimeError, match="Database unavailable"):
        asyncio.run(service.send_message(CHAT_ID, "Question"))
    agent.respond.assert_not_awaited()
    repository.insert_message.assert_not_called()


def test_failed_first_write_does_not_attempt_assistant_write(setup_service):
    service, repository, _, _ = setup_service
    repository.insert_message.side_effect = RuntimeError("Database unavailable")
    with pytest.raises(RuntimeError, match="Database unavailable"):
        asyncio.run(service.send_message(CHAT_ID, "Question"))
    assert repository.insert_message.call_count == 1
