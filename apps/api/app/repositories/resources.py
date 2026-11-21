"""Read active services for the agent's catalog prompt."""

from supabase import Client

from app.schemas.resource_search import ResourceSearchResult


class ResourceRepository:
    def __init__(self, client: Client) -> None:
        self.client = client

    def list_active(self, limit: int, offset: int = 0) -> list[ResourceSearchResult]:
        rows = (
            self.client.table("services")
            .select("service_name, description, referral_instruction, target_population, keywords, is_active")
            .eq("is_active", True)
            .order("service_name")
            .order("service_id")
            .range(offset, offset + limit - 1)
            .execute()
            .data
        )
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
