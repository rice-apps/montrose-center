# integration test: runs ChatRepository against the real Supabase table
# runs only when SUPABASE_URL and SUPABASE_SECRET_KEY are set, either exported or in apps/api/.env
# otherwise it is skipped - it creates one test chat and deletes it afterward

import os
from collections.abc import Iterator
from pathlib import Path

import pytest
from supabase import Client, create_client

from app.repositories.chats import ChatRepository

ENV_FILE = Path(__file__).resolve().parents[1] / ".env"


def _settings() -> dict[str, str]:
    settings: dict[str, str] = {}
    if ENV_FILE.exists():
        for line in ENV_FILE.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, value = line.split("=", 1)
                settings[key.strip()] = value.strip().strip("\"'")
    settings.update({k: v for k, v in os.environ.items() if k.startswith("SUPABASE_")})
    return settings


SETTINGS = _settings()

pytestmark = pytest.mark.skipif(
    not (SETTINGS.get("SUPABASE_URL") and SETTINGS.get("SUPABASE_SECRET_KEY")),
    reason="Supabase credentials not configured",
)


@pytest.fixture
def client() -> Client:
    return create_client(SETTINGS["SUPABASE_URL"].rstrip("/"), SETTINGS["SUPABASE_SECRET_KEY"])


@pytest.fixture
def repo(client: Client) -> Iterator[ChatRepository]:
    repo = ChatRepository(client)
    created: list[str] = []
    original_create = repo.create_chat

    def create_and_track(title: str):
        chat = original_create(title)
        created.append(chat.id)
        return chat

    repo.create_chat = create_and_track
    yield repo
    # Deleting a chat also deletes its messages (on delete cascade).
    for chat_id in created:
        client.table("chats").delete().eq("chat_id", chat_id).execute()


def test_chat_round_trip(repo: ChatRepository):
    chat = repo.create_chat("TEST chat (safe to delete)")
    assert chat.messages == []
    assert chat.created_at.endswith("+00:00")  # stored with a timezone

    repo.append_exchange(chat.id, "TEST question", "TEST answer")
    repo.append_exchange(chat.id, "TEST follow-up", "TEST follow-up answer")
    saved = repo.get_chat(chat.id)

    assert [(m.role, m.content) for m in saved.messages] == [
        ("user", "TEST question"),
        ("assistant", "TEST answer"),
        ("user", "TEST follow-up"),
        ("assistant", "TEST follow-up answer"),
    ]
    assert saved.updated_at > chat.updated_at  # sending a message moves last_updated

    renamed = repo.update_chat_title(chat.id, "TEST renamed")
    assert renamed.title == "TEST renamed"
    assert renamed.updated_at == saved.updated_at  # renaming does not
    assert len(renamed.messages) == 4

    assert repo.list_chats()[0].id == chat.id  # most recently updated first


def test_missing_chat_raises_lookup_error(repo: ChatRepository):
    with pytest.raises(LookupError):
        repo.get_chat("00000000-0000-0000-0000-000000000000")


def test_deleting_chat_deletes_its_messages(repo: ChatRepository, client: Client):
    chat = repo.create_chat("TEST cascade (safe to delete)")
    repo.append_exchange(chat.id, "TEST question", "TEST answer")

    client.table("chats").delete().eq("chat_id", chat.id).execute()

    remaining = client.table("messages").select("message_id").eq("chat_id", chat.id).execute().data
    assert remaining == []
