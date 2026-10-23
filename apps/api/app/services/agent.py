"""Task 7: build a prompt from fictional data and call an LLM."""

from pathlib import Path

from app.schemas.chats import Message


class ResourceAgent:
    def __init__(self, catalog_path: Path | None = None) -> None: ...

    # TODO: include the fictional catalog in a system prompt; avoid inventing contacts.
    def build_system_prompt(self) -> str: ...

    # TODO: send the current message and relevant chat history to the configured model.
    async def respond(self, history: list[Message], user_text: str) -> str: ...
