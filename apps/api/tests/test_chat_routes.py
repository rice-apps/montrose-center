"""Exercise the HTTP contract through the real service and dependency providers."""

from unittest.mock import Mock
from uuid import uuid4

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.dependencies import get_chat_repository, get_resource_agent
from app.errors import ChatNotFound
from app.interfaces import ResourceAgentProtocol
from app.routers.chats import router
from app.schemas.chats import Chat, ChatSummary, Message

TIMESTAMP = "2026-11-21T12:00:00+00:00"


class MemoryRepository:
    def __init__(self):
        self.chats: dict[str, Chat] = {}

    def create_chat(self, title):
        chat = Chat(
            id=str(uuid4()), title=title, created_at=TIMESTAMP,
            updated_at=TIMESTAMP, messages=[],
        )
        self.chats[chat.id] = chat
        return chat

    def list_chats(self):
        return [ChatSummary(**chat.model_dump()) for chat in self.chats.values()]

    def get_chat(self, chat_id):
        if chat_id not in self.chats:
            raise ChatNotFound("Missing")
        return self.chats[chat_id].model_copy(deep=True)

    def update_chat_title(self, chat_id, title):
        self.get_chat(chat_id)
        self.chats[chat_id].title = title
        return self.get_chat(chat_id)

    def insert_message(self, chat_id, content, is_agent):
        self.get_chat(chat_id)
        message = Message(
            id=str(uuid4()), chat_id=chat_id,
            role="assistant" if is_agent else "user",
            content=content, created_at=TIMESTAMP,
        )
        self.chats[chat_id].messages.append(message)
        return message


@pytest.fixture
def client_and_agent():
    app = FastAPI()
    app.include_router(router)
    repository = MemoryRepository()
    agent = Mock(spec=ResourceAgentProtocol)
    agent.respond.return_value = "Try the housing team."
    app.dependency_overrides[get_chat_repository] = lambda: repository
    app.dependency_overrides[get_resource_agent] = lambda: agent
    with TestClient(app) as client:
        yield client, agent


def test_create_send_follow_up_rename_and_reopen(client_and_agent):
    client, agent = client_and_agent
    created = client.post("/chats", json={})
    assert created.status_code == 200
    chat_id = created.json()["id"]
    assert created.json()["title"] == "New chat"
    assert created.json()["messages"] == []

    first = client.patch("/chats/messages", params={"chat_id": chat_id}, json={"content": "Housing help?"})
    assert first.status_code == 200
    assert first.json()["user_message"]["role"] == "user"
    assert first.json()["assistant_message"]["role"] == "assistant"
    agent.respond.assert_awaited_once_with([], "Housing help?")

    agent.respond.return_value = "Ask the housing coordinator."
    follow_up = client.patch("/chats/messages", params={"chat_id": chat_id}, json={"content": "Who do I contact?"})
    assert follow_up.status_code == 200
    history, question = agent.respond.await_args.args
    assert [m.content for m in history] == ["Housing help?", "Try the housing team."]
    assert question == "Who do I contact?"

    renamed = client.patch("/chats", params={"chat_id": chat_id}, json={"title": " Housing "})
    assert renamed.status_code == 200
    assert renamed.json()["title"] == "Housing"
    listing = client.get("/chats")
    assert listing.status_code == 200
    assert listing.json()[0]["id"] == chat_id
    assert listing.json()[0]["title"] == "Housing"
    reopened = client.get("/chats/detail", params={"chat_id": chat_id})
    assert reopened.status_code == 200
    assert [m["content"] for m in reopened.json()["messages"]] == [
        "Housing help?", "Try the housing team.",
        "Who do I contact?", "Ask the housing coordinator.",
    ]


@pytest.mark.parametrize("method,path,payload", [
    ("get", "/chats/detail", None),
    ("patch", "/chats", {"title": "Renamed"}),
    ("patch", "/chats/messages", {"content": "Question"}),
])
def test_missing_chat_returns_404(client_and_agent, method, path, payload):
    client, agent = client_and_agent
    response = client.request(method, path, params={"chat_id": "missing"}, json=payload)
    assert response.status_code == 404
    assert response.json() == {"detail": "Chat does not exist"}
    agent.respond.assert_not_awaited()


@pytest.mark.parametrize("method,path,payload", [
    ("post", "/chats", {"title": " \n"}),
    ("patch", "/chats", {"title": " \n"}),
    ("patch", "/chats/messages", {"content": " \n"}),
])
def test_blank_input_returns_400(client_and_agent, method, path, payload):
    client, agent = client_and_agent
    response = client.request(method, path, params={"chat_id": "unused"}, json=payload)
    assert response.status_code == 400
    agent.respond.assert_not_awaited()


def test_model_failure_returns_502_and_leaves_history_unchanged(client_and_agent):
    client, agent = client_and_agent
    chat_id = client.post("/chats", json={}).json()["id"]
    agent.respond.side_effect = RuntimeError("private provider diagnostic")
    response = client.patch("/chats/messages", params={"chat_id": chat_id}, json={"content": "Question"})
    assert response.status_code == 502
    assert "private provider diagnostic" not in response.text
    assert client.get("/chats/detail", params={"chat_id": chat_id}).json()["messages"] == []
