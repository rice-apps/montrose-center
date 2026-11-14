"""Bind backend interfaces to request-scoped implementations.

The Supabase client is shared for the application's lifetime. Override these
provider functions with app.dependency_overrides to substitute implementations.
"""

from typing import Annotated

from fastapi import Depends, HTTPException, Request
from supabase import Client

from app.interfaces import ChatRepositoryProtocol, ChatServiceProtocol, ResourceAgentProtocol
from app.repositories.chats import ChatRepository
from app.services.agent import ResourceAgent
from app.services.chats import ChatService


def get_supabase_client(request: Request) -> Client:
    client = request.app.state.supabase
    if client is None:
        raise HTTPException(status_code=503, detail="Supabase is not configured")
    return client


def get_chat_repository(
    client: Annotated[Client, Depends(get_supabase_client)],
) -> ChatRepositoryProtocol:
    return ChatRepository(client)


def get_resource_agent() -> ResourceAgentProtocol:
    return ResourceAgent()


def get_chat_service(
    repository: Annotated[ChatRepositoryProtocol, Depends(get_chat_repository)],
    agent: Annotated[ResourceAgentProtocol, Depends(get_resource_agent)],
) -> ChatServiceProtocol:
    return ChatService(repository, agent)


# FastAPI reuses the result within one request; the next request gets a new service.
ChatServiceDep = Annotated[ChatServiceProtocol, Depends(get_chat_service)]
