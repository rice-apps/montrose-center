"""Exercise interface-based DI through real FastAPI dependency resolution."""

from unittest.mock import create_autospec

from fastapi import FastAPI
from fastapi.testclient import TestClient
from supabase import Client

from app.dependencies import (
    ChatServiceDep,
    get_chat_repository,
    get_chat_service,
    get_resource_agent,
)
from app.interfaces import ChatRepositoryProtocol, ChatServiceProtocol, ResourceAgentProtocol
from app.repositories.chats import ChatRepository
from app.schemas.chats import ChatSummary
from app.services.chats import ChatService


def test_repository_and_agent_can_be_replaced_without_external_clients():
    app = FastAPI()
    repository = create_autospec(ChatRepositoryProtocol, instance=True)
    agent = create_autospec(ResourceAgentProtocol, instance=True)
    agent.respond.return_value = "A fictional resource"
    app.dependency_overrides[get_chat_repository] = lambda: repository
    app.dependency_overrides[get_resource_agent] = lambda: agent

    @app.get("/probe")
    async def probe(service: ChatServiceDep) -> dict[str, str]:
        assert isinstance(service, ChatService)
        assert service.repository is repository
        assert service.agent is agent
        return {"reply": await service.agent.respond([], "Find a resource")}

    with TestClient(app) as client:
        response = client.get("/probe")

    assert response.status_code == 200
    assert response.json() == {"reply": "A fictional resource"}
    agent.respond.assert_awaited_once_with([], "Find a resource")


def test_route_can_use_a_replacement_service():
    app = FastAPI()
    service = create_autospec(ChatServiceProtocol, instance=True)
    chat = ChatSummary(
        id="chat-1",
        title="Saved chat",
        created_at="2026-11-14T12:00:00Z",
        updated_at="2026-11-14T12:00:00Z",
    )
    service.list_chats.return_value = [chat]
    app.dependency_overrides[get_chat_service] = lambda: service

    @app.get("/chats")
    def list_chats(service: ChatServiceDep) -> list[ChatSummary]:
        return service.list_chats()

    with TestClient(app) as client:
        response = client.get("/chats")
        schema = client.get("/openapi.json")

    assert response.status_code == 200
    assert response.json() == [chat.model_dump()]
    assert schema.status_code == 200
    assert schema.json()["paths"]["/chats"]["get"].get("parameters", []) == []
    service.list_chats.assert_called_once_with()


def test_default_providers_keep_request_scope_and_share_supabase_client():
    app = FastAPI()
    supabase = create_autospec(Client, instance=True)
    app.state.supabase = supabase
    services: list[ChatService] = []

    @app.get("/probe")
    def probe(first: ChatServiceDep, second: ChatServiceDep) -> dict[str, bool]:
        assert first is second
        assert isinstance(first, ChatService)
        services.append(first)
        return {"ok": True}

    with TestClient(app) as client:
        assert client.get("/probe").status_code == 200
        assert client.get("/probe").status_code == 200

    first, second = services
    assert first is not second
    assert first.repository is not second.repository
    assert first.agent is not second.agent
    assert isinstance(first.repository, ChatRepository)
    assert isinstance(second.repository, ChatRepository)
    assert first.repository.client is supabase
    assert second.repository.client is supabase


def test_missing_supabase_still_returns_service_unavailable():
    app = FastAPI()
    app.state.supabase = None

    @app.get("/probe")
    def probe(service: ChatServiceDep) -> dict[str, bool]:
        return {"ok": True}

    with TestClient(app) as client:
        response = client.get("/probe")

    assert response.status_code == 503
    assert response.json() == {"detail": "Supabase is not configured"}
