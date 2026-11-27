"""Read active services for the agent's catalog prompt."""

from uuid import UUID

from supabase import Client

from app.schemas.catalog import Resource, ResourceCreate, ResourceUpdate
from app.schemas.resource_search import ResourceSearchResult


class ResourceRepository:
    def __init__(self, client: Client) -> None:
        self.client = client

    def list_active(self) -> list[ResourceSearchResult]:
        rows = []
        # Page through Supabase's response cap without limiting the catalog.
        while True:
            page = (
                self.client.table("services")
                .select("service_name, description, referral_instruction, target_population, keywords, is_active")
                .eq("is_active", True)
                .order("service_name")
                .order("service_id")
                .range(len(rows), len(rows) + 999)
                .execute()
                .data
            )
            if not page:
                break
            rows.extend(page)
        return [
            ResourceSearchResult(
                program_name=row["service_name"],
                active=row["is_active"],
                program_definition=row["description"] or "",
                how_to_refer=row["referral_instruction"] or "",
                population_served=row["target_population"] or "",
                keywords=row["keywords"] or [],
                # This table stores eligibility in descriptions and contact
                # details in referral instructions, not separate text columns.
                eligibility_criteria="",
                program_contacts="",
            )
            for row in rows
        ]



    def create_resource(self, resource: ResourceCreate) -> Resource:
        data = resource.model_dump()
        
        # Assumption: New resources are active by default.
        data["is_active"] = True

        result = (
            self.client.table("services")
            .insert(data)
            .execute()
        )

        return Resource(**result.data[0])

    def list_resources(self, limit: int = 10, offset: int = 0) -> list[Resource]:
        result = (
            self.client.table("services")
            .select("*")
            .eq("is_active", True)
            .order("service_name")
            .order("service_id")
            .range(offset, offset + limit - 1)
            .execute()
        )

        return [Resource(**row) for row in result.data]

    def get_resource(self, service_id: UUID) -> Resource:
        result = (
            self.client.table("services")
            .select("*")
            .eq("service_id", str(service_id))
            .eq("is_active", True)
            .execute()
        )

        if not result.data:
            raise LookupError("Resource not found.")

        return Resource(**result.data[0])

    def update_resource(
        self, service_id: UUID, resource: ResourceUpdate
    ) -> Resource:
        data = resource.model_dump(exclude_unset=True)

        if not data:
            raise ValueError("At least one field must be provided.")

        if data.get("service_name", "") is None:
            raise ValueError("Service name cannot be null.")

        # Assumption: Inactive resources can still be updated.
        result = (
            self.client.table("services")
            .update(data)
            .eq("service_id", str(service_id))
            .execute()
        )

        if not result.data:
            raise LookupError("Resource not found.")

        return Resource(**result.data[0])

    def deactivate_resource(self, service_id: UUID) -> Resource:
        # Assumption: Repeated deactivation is allowed.
        result = (
            self.client.table("services")
            .update({"is_active": False})
            .eq("service_id", str(service_id))
            .execute()
        )

        if not result.data:
            raise LookupError("Resource not found.")

        return Resource(**result.data[0])

    def reactivate_resource(self, service_id: UUID) -> Resource:
        # Assumption: Repeated reactivation is allowed.
        result = (
            self.client.table("services")
            .update({"is_active": True})
            .eq("service_id", str(service_id))
            .execute()
        )

        if not result.data:
            raise LookupError("Resource not found.")

        return Resource(**result.data[0])
