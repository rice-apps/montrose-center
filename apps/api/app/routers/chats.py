"""Task 4: add HTTP routes for the chat contract below."""

from fastapi import APIRouter

from app.schemas.chats import Chat, ChatCreate, ChatSummary, ChatUpdate, MessageCreate, SendMessageResponse

router = APIRouter(prefix="/chats", tags=["chats"])


# TODO: register these with GET, POST, and PATCH decorators and call ChatService.
def create_chat(payload: ChatCreate) -> Chat: ...


def list_chats() -> list[ChatSummary]: ...


def get_chat(chat_id: str) -> Chat: ...


def update_chat(chat_id: str, payload: ChatUpdate) -> Chat: ...


async def send_message(chat_id: str, payload: MessageCreate) -> SendMessageResponse: ...
