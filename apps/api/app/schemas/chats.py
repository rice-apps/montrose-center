"""Shared request and response shapes for the first sprint."""

from typing import Literal

from pydantic import BaseModel


class ChatCreate(BaseModel):
    title: str = "New chat"


class ChatUpdate(BaseModel):
    title: str


class MessageCreate(BaseModel):
    content: str


class Message(BaseModel):
    id: str
    chat_id: str
    role: Literal["user", "assistant"]
    content: str
    created_at: str


class ChatSummary(BaseModel):
    id: str
    title: str
    created_at: str
    updated_at: str


class Chat(ChatSummary):
    messages: list[Message]


class SendMessageResponse(BaseModel):
    user_message: Message
    assistant_message: Message
