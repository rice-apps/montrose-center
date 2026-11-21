"""HTTP routes for chat creation, history, and messages."""

from collections.abc import Iterator
from contextlib import contextmanager

from fastapi import APIRouter, HTTPException

from app.dependencies import ChatServiceDep
from app.errors import AgentResponseError, ChatNotFound, InvalidChatInput
from app.schemas.chats import (
    Chat,
    ChatCreate,
    ChatSummary,
    ChatUpdate,
    MessageCreate,
    SendMessageResponse,
)

router = APIRouter(prefix="/chats", tags=["chats"])


@contextmanager
def _chat_errors() -> Iterator[None]:
    """Keep HTTP concerns outside the service and repository."""
    try:
        yield
    except InvalidChatInput as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except ChatNotFound as error:
        raise HTTPException(status_code=404, detail="Chat does not exist") from error
    except AgentResponseError as error:
        raise HTTPException(status_code=502, detail=str(error)) from error


@router.post("", response_model=Chat)
def create_chat(payload: ChatCreate, service: ChatServiceDep) -> Chat:
    with _chat_errors():
        return service.create_chat(payload.title)


@router.get("", response_model=list[ChatSummary])
def list_chats(service: ChatServiceDep) -> list[ChatSummary]:
    with _chat_errors():
        return service.list_chats()


@router.get("/detail", response_model=Chat)
def get_chat(chat_id: str, service: ChatServiceDep) -> Chat:
    with _chat_errors():
        return service.get_chat(chat_id)


@router.patch("", response_model=Chat)
def update_chat(chat_id: str, payload: ChatUpdate, service: ChatServiceDep) -> Chat:
    with _chat_errors():
        return service.update_chat_title(chat_id, payload.title)


@router.patch("/messages", response_model=SendMessageResponse)
async def send_message(
    chat_id: str, payload: MessageCreate, service: ChatServiceDep
) -> SendMessageResponse:
    with _chat_errors():
        return await service.send_message(chat_id, payload.content)
