
from uuid import UUID

from app.schemas.catalog import Resource, ResourceCreate, ResourceUpdate
from app.interfaces import CatalogRepositoryProtocol


class CatalogService:
    def __init__(self, repository: CatalogRepositoryProtocol):
        self.repository = repository

    def create_resource(self, resource: ResourceCreate) -> Resource:
        return self.repository.create_resource(resource)

    # Assumption: Catalog pages can contain up to 100 resources.

    def list_resources(self, limit: int = 10, offset: int = 0) -> list[Resource]:
        if limit < 1 or limit > 100:
            raise ValueError("Limit must be between 1 and 100.")

        if offset < 0:
            raise ValueError("Offset cannot be negative.")

        return self.repository.list_resources(limit, offset)

    def get_resource(self, service_id: UUID) -> Resource:
        return self.repository.get_resource(service_id)

    def update_resource(
        self, service_id: UUID, resource: ResourceUpdate
    ) -> Resource:
        data = resource.model_dump(exclude_unset=True)

        if not data:
            raise ValueError("At least one field must be provided.")

        if "service_name" in data and data["service_name"] is None:
            raise ValueError("Service name cannot be null.")

        return self.repository.update_resource(service_id, resource)

    def deactivate_resource(self, service_id: UUID) -> Resource:
        return self.repository.deactivate_resource(service_id)

    def reactivate_resource(self, service_id: UUID) -> Resource:
        return self.repository.reactivate_resource(service_id)
