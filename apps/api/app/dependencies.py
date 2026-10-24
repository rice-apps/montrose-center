"""Request-scoped chat services using the application's shared Supabase client."""

from typing import Annotated

from fastapi import Depends, HTTPException, Request
from supabase import Client

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
) -> ChatRepository:
    return ChatRepository(client)


def get_resource_agent() -> ResourceAgent:
    return ResourceAgent()


def get_chat_service(
    repository: Annotated[ChatRepository, Depends(get_chat_repository)],
    agent: Annotated[ResourceAgent, Depends(get_resource_agent)],
) -> ChatService:
    return ChatService(repository, agent)


# FastAPI reuses the result within one request; the next request gets a new service.
ChatServiceDep = Annotated[ChatService, Depends(get_chat_service)]
