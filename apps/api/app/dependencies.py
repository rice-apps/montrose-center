"""Request-scoped providers for the chat router (not application singletons)."""

import os
from collections.abc import Iterator
from typing import Annotated

import httpx
from fastapi import Depends
from supabase import Client, create_client
from supabase.lib.client_options import SyncClientOptions

from app.repositories.chats import ChatRepository
from app.services.agent import ResourceAgent
from app.services.chats import ChatService


def get_supabase_client() -> Iterator[Client]:
    # Read configuration on demand so /health can run without database credentials.
    url = os.environ["SUPABASE_URL"]
    key = os.environ["SUPABASE_SECRET_KEY"]
    with httpx.Client(timeout=120) as http_client:
        yield create_client(
            url,
            key,
            options=SyncClientOptions(
                httpx_client=http_client,
                auto_refresh_token=False,
                persist_session=False,
            ),
        )


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
