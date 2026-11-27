
from uuid import UUID

from fastapi.testclient import TestClient

from app.dependencies import get_catalog_service
from app.main import app
from app.schemas.catalog import Resource, ResourceCreate, ResourceUpdate


SERVICE_ID = "11111111-1111-1111-1111-111111111111"


class FakeCatalogService:
    def __init__(self):
        self.resource = Resource(
            service_id=UUID(SERVICE_ID),
            service_name="Example Housing Service",
            description="Housing support",
            is_active=True,
        )

    def create_resource(self, resource: ResourceCreate):
        return self.resource

    def list_resources(self, limit=10, offset=0):
        return [self.resource]

    def get_resource(self, service_id):
        if str(service_id) != SERVICE_ID:
            raise LookupError()
        return self.resource

    def update_resource(self, service_id, resource: ResourceUpdate):
        if str(service_id) != SERVICE_ID:
            raise LookupError()
        if not resource.model_fields_set:
            raise ValueError("At least one field must be provided.")
        return self.resource.model_copy(
            update=resource.model_dump(exclude_unset=True)
        )

    def deactivate_resource(self, service_id):
        if str(service_id) != SERVICE_ID:
            raise LookupError()
        return self.resource.model_copy(update={"is_active": False})

    def reactivate_resource(self, service_id):
        if str(service_id) != SERVICE_ID:
            raise LookupError()
        return self.resource.model_copy(update={"is_active": True})


def test_catalog_routes():
    app.dependency_overrides[get_catalog_service] = lambda: FakeCatalogService()

    try:
        with TestClient(app) as client:
            create = client.post(
                "/services",
                json={"service_name": "Example Housing Service"},
            )
            assert create.status_code == 201

            listing = client.get("/services")
            assert listing.status_code == 200
            assert len(listing.json()) == 1

            details = client.get(f"/services/{SERVICE_ID}")
            assert details.status_code == 200

            update = client.patch(
                f"/services/{SERVICE_ID}",
                json={"description": "Updated"},
            )
            assert update.status_code == 200
            assert update.json()["description"] == "Updated"

            deactivate = client.patch(f"/services/{SERVICE_ID}/deactivate")
            assert deactivate.status_code == 200
            assert deactivate.json()["is_active"] is False

            reactivate = client.patch(f"/services/{SERVICE_ID}/reactivate")
            assert reactivate.status_code == 200
            assert reactivate.json()["is_active"] is True
    finally:
        app.dependency_overrides.clear()


def test_missing_resource_returns_404():
    app.dependency_overrides[get_catalog_service] = lambda: FakeCatalogService()

    try:
        with TestClient(app) as client:
            response = client.get(
                "/services/22222222-2222-2222-2222-222222222222"
            )
            assert response.status_code == 404
    finally:
        app.dependency_overrides.clear()


def test_empty_update_returns_400():
    app.dependency_overrides[get_catalog_service] = lambda: FakeCatalogService()

    try:
        with TestClient(app) as client:
            response = client.patch(f"/services/{SERVICE_ID}", json={})
            assert response.status_code == 400
    finally:
        app.dependency_overrides.clear()


def test_invalid_resource_id_returns_422():
    app.dependency_overrides[get_catalog_service] = lambda: FakeCatalogService()

    try:
        with TestClient(app) as client:
            response = client.get("/services/not-a-uuid")
            assert response.status_code == 422
    finally:
        app.dependency_overrides.clear()
