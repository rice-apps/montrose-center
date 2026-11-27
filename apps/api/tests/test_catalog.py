
from types import SimpleNamespace
from uuid import UUID

import pytest

from app.repositories.resources import ResourceRepository
from app.schemas.catalog import ResourceCreate, ResourceUpdate
from app.services.catalog import CatalogService


SERVICE_ID = UUID("11111111-1111-1111-1111-111111111111")


def resource_row(**changes):
    row = {
        "service_id": str(SERVICE_ID),
        "service_name": "Example Housing Service",
        "description": "Housing support",
        "referral_instruction": None,
        "target_population": None,
        "keywords": ["housing"],
        "program_name": None,
        "is_active": True,
    }
    return {**row, **changes}


class FakeQuery:
    def __init__(self, client):
        self.client = client
        self.calls = []

    def select(self, *args):
        self.calls.append(("select", args))
        return self

    def insert(self, data):
        self.calls.append(("insert", data))
        return self

    def update(self, data):
        self.calls.append(("update", data))
        return self

    def eq(self, column, value):
        self.calls.append(("eq", column, value))
        return self

    def order(self, column):
        self.calls.append(("order", column))
        return self

    def range(self, start, end):
        self.calls.append(("range", start, end))
        return self

    def execute(self):
        return SimpleNamespace(data=self.client.results.pop(0))


class FakeClient:
    def __init__(self, *results):
        self.results = list(results)
        self.queries = []

    def table(self, name):
        assert name == "services"
        query = FakeQuery(self)
        self.queries.append(query)
        return query


def test_create_resource():
    client = FakeClient([resource_row()])
    resource = ResourceCreate(service_name="Example Housing Service")

    result = ResourceRepository(client).create_resource(resource)

    assert result.service_name == "Example Housing Service"
    assert ("insert", resource.model_dump() | {"is_active": True}) in client.queries[0].calls


def test_list_active_resources():
    client = FakeClient([resource_row()])
    resources = ResourceRepository(client).list_resources()

    assert len(resources) == 1
    assert ("eq", "is_active", True) in client.queries[0].calls
    assert ("range", 0, 9) in client.queries[0].calls


def test_get_resource():
    client = FakeClient([resource_row()])
    result = ResourceRepository(client).get_resource(SERVICE_ID)

    assert result.service_id == SERVICE_ID
    assert ("eq", "service_id", str(SERVICE_ID)) in client.queries[0].calls
    assert ("eq", "is_active", True) in client.queries[0].calls


def test_get_missing_resource():
    client = FakeClient([])

    with pytest.raises(LookupError):
        ResourceRepository(client).get_resource(SERVICE_ID)


def test_update_resource():
    client = FakeClient([resource_row(description="Updated description")])
    update = ResourceUpdate(description="Updated description")

    result = ResourceRepository(client).update_resource(SERVICE_ID, update)

    assert result.description == "Updated description"
    assert ("update", {"description": "Updated description"}) in client.queries[0].calls


def test_empty_update():
    client = FakeClient()
    service = CatalogService(ResourceRepository(client))

    with pytest.raises(ValueError):
        service.update_resource(SERVICE_ID, ResourceUpdate())


def test_deactivate_resource():
    client = FakeClient([resource_row(is_active=False)])

    result = ResourceRepository(client).deactivate_resource(SERVICE_ID)

    assert result.is_active is False
    assert ("update", {"is_active": False}) in client.queries[0].calls


def test_reactivate_resource():
    client = FakeClient([resource_row(is_active=True)])

    result = ResourceRepository(client).reactivate_resource(SERVICE_ID)

    assert result.is_active is True
    assert ("update", {"is_active": True}) in client.queries[0].calls


def test_missing_update():
    client = FakeClient([])

    with pytest.raises(LookupError):
        ResourceRepository(client).update_resource(
            SERVICE_ID, ResourceUpdate(description="Updated")
        )


def test_invalid_name():
    from pydantic import ValidationError

    with pytest.raises(ValidationError):
        ResourceCreate(service_name="   ")
