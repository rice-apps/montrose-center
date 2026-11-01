# ChatRepository logic against a fake Supabase client (no network)

from datetime import datetime
from types import SimpleNamespace
from uuid import UUID

import pytest

from app.repositories.chats import ChatRepository

CHAT_ID = "11111111-1111-1111-1111-111111111111"


class FakeQuery:
    # Records each builder call, like `.insert(...)` or `.eq(...)`, and returns the next queued result.

    def __init__(self, client: "FakeClient", table: str) -> None:
        self.client = client
        self.table = table
        self.calls: list[tuple[str, tuple, dict]] = []

    def _record(self, name: str, *args, **kwargs) -> "FakeQuery":
        self.calls.append((name, args, kwargs))
        return self

    def select(self, *args, **kwargs):
        return self._record("select", *args, **kwargs)

    def insert(self, *args, **kwargs):
        return self._record("insert", *args, **kwargs)

    def update(self, *args, **kwargs):
        return self._record("update", *args, **kwargs)

    def eq(self, *args, **kwargs):
        return self._record("eq", *args, **kwargs)

    def order(self, *args, **kwargs):
        return self._record("order", *args, **kwargs)

    def execute(self) -> SimpleNamespace:
        result = self.client.results.pop(0)
        if callable(result):  # lets a test build the result from what was sent
            result = result(self)
        return SimpleNamespace(data=result)

    def arg(self, name: str):
        """First argument of the first call named `name`."""
        return next(args[0] for call, args, _ in self.calls if call == name)


class FakeClient:
    def __init__(self, *results) -> None:
        self.results = list(results)  # one `.data` result per `.execute()`, in order
        self.queries: list[FakeQuery] = []

    def table(self, name: str) -> FakeQuery:
        query = FakeQuery(self, name)
        self.queries.append(query)
        return query


def chat_row(**overrides) -> dict:
    row = {
        "chat_id": CHAT_ID,
        "person_id": None,
        "description": "Housing options",
        "time_stamp": "2026-10-31T16:00:00+00:00",
        "last_updated": "2026-10-31T16:05:00+00:00",
    }
    return {**row, **overrides}


def message_row(message_id: str, is_agent: bool, content: str, time_stamp: str) -> dict:
    return {
        "message_id": message_id,
        "chat_id": CHAT_ID,
        "is_agent": is_agent,
        "content": content,
        "time_stamp": time_stamp,
    }


def test_create_chat_inserts_row_and_returns_empty_chat():
    client = FakeClient([chat_row(description="New chat")])

    chat = ChatRepository(client).create_chat("New chat")

    query = client.queries[0]
    payload = query.arg("insert")
    assert query.table == "chats"
    assert payload["description"] == "New chat"
    assert payload["time_stamp"] == payload["last_updated"]
    UUID(payload["chat_id"])  # raises if the generated ID is not a valid UUID
    assert chat.id == CHAT_ID
    assert chat.title == "New chat"
    assert chat.messages == []


def test_missing_description_becomes_empty_title():
    client = FakeClient([chat_row(description=None)])

    chat = ChatRepository(client).create_chat("ignored")

    assert chat.title == ""


def test_list_chats_orders_by_last_updated_newest_first():
    client = FakeClient([chat_row(), chat_row(chat_id="22222222-2222-2222-2222-222222222222")])

    chats = ChatRepository(client).list_chats()

    query = client.queries[0]
    assert query.table == "chats"
    assert ("order", ("last_updated",), {"desc": True}) in query.calls
    assert [c.id for c in chats] == [CHAT_ID, "22222222-2222-2222-2222-222222222222"]
    assert chats[0].created_at == "2026-10-31T16:00:00+00:00"
    assert chats[0].updated_at == "2026-10-31T16:05:00+00:00"


def test_list_chats_with_no_rows_returns_empty_list():
    client = FakeClient([])

    assert ChatRepository(client).list_chats() == []


def test_get_chat_includes_messages_in_order_with_roles():
    messages = [
        message_row("m1", False, "Where is housing help?", "2026-10-31T16:01:00+00:00"),
        message_row("m2", True, "Try Example Housing Navigation.", "2026-10-31T16:01:00.000001+00:00"),
    ]
    client = FakeClient([chat_row(messages=messages)])

    chat = ChatRepository(client).get_chat(CHAT_ID)

    query = client.queries[0]
    assert query.arg("select") == "*, messages(*)"
    assert ("eq", ("chat_id", CHAT_ID), {}) in query.calls
    assert ("order", ("time_stamp",), {"foreign_table": "messages"}) in query.calls
    assert [(m.role, m.content) for m in chat.messages] == [
        ("user", "Where is housing help?"),
        ("assistant", "Try Example Housing Navigation."),
    ]
    assert chat.messages[0].id == "m1"
    assert chat.messages[0].created_at == "2026-10-31T16:01:00+00:00"


def test_get_chat_missing_raises_lookup_error():
    client = FakeClient([])

    with pytest.raises(LookupError):
        ChatRepository(client).get_chat(CHAT_ID)


def test_update_chat_title_changes_only_description():
    client = FakeClient([chat_row(description="Renamed")], [chat_row(description="Renamed", messages=[])])

    chat = ChatRepository(client).update_chat_title(CHAT_ID, "Renamed")

    update = client.queries[0]
    assert update.table == "chats"
    assert update.arg("update") == {"description": "Renamed"}  # last_updated is untouched
    assert ("eq", ("chat_id", CHAT_ID), {}) in update.calls
    assert chat.title == "Renamed"


def test_update_chat_title_missing_raises_lookup_error():
    client = FakeClient([], [])  # update matches nothing, then the re-read finds nothing

    with pytest.raises(LookupError):
        ChatRepository(client).update_chat_title(CHAT_ID, "Renamed")


def test_append_exchange_saves_both_messages_in_one_insert():
    # The insert returns exactly the rows it was sent, the way Supabase does.
    client = FakeClient(lambda query: [dict(row) for row in query.arg("insert")], [chat_row()])

    response = ChatRepository(client).append_exchange(CHAT_ID, "Question?", "Answer.")

    messages_query, chats_query = client.queries
    inserted = messages_query.arg("insert")
    assert messages_query.table == "messages"
    assert len(client.queries) == 2  # one insert for both messages, one chat update
    assert [(row["is_agent"], row["content"]) for row in inserted] == [(False, "Question?"), (True, "Answer.")]
    assert all(row["chat_id"] == CHAT_ID for row in inserted)

    asked = datetime.fromisoformat(inserted[0]["time_stamp"])
    answered = datetime.fromisoformat(inserted[1]["time_stamp"])
    assert answered > asked  # the answer always sorts after the question
    assert asked.tzinfo is not None  # timestamps carry a timezone

    assert chats_query.table == "chats"
    assert chats_query.arg("update") == {"last_updated": inserted[1]["time_stamp"]}
    assert response.user_message.role == "user"
    assert response.user_message.content == "Question?"
    assert response.assistant_message.role == "assistant"
    assert response.assistant_message.content == "Answer."


def test_append_exchange_matches_rows_even_if_returned_out_of_order():
    returned = [
        message_row("m2", True, "Answer.", "2026-10-31T16:01:00.000001+00:00"),
        message_row("m1", False, "Question?", "2026-10-31T16:01:00+00:00"),
    ]
    client = FakeClient(returned, [chat_row()])

    response = ChatRepository(client).append_exchange(CHAT_ID, "Question?", "Answer.")

    assert response.user_message.id == "m1"
    assert response.assistant_message.id == "m2"
