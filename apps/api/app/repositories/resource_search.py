"""Task 3: ranked Supabase search, separate from resource list/detail reads."""

from typing import Any

from supabase import Client

from app.schemas.resource_search import ResourceSearchResult


def _to_search_result(row: dict[str, Any]) -> ResourceSearchResult:
    """Map one returned service row, preserving unknown fields as None."""
    # TODO: map catalog fields to ResourceSearchResult without generated defaults.
    raise NotImplementedError("Search result mapping is not implemented")


class ResourceSearchRepository:
    def __init__(self, client: Client) -> None:
        self.client = client

    def search_services(self, query: str, limit: int = 10) -> list[ResourceSearchResult]:
        """Return ranked active services for a validated query and limit."""
        # TODO: call the Supabase search function/query agreed on for this task.
        # Search name, keywords, and description; do not search people/contact data.
        # Exact-name matches first, then text rank, then service_id for stable ties.
        # Filter inactive services and apply the limit in the database.
        # Map rows with _to_search_result, preserving order; no matches returns [].
        # Let database failures propagate instead of reporting them as no matches.
        raise NotImplementedError("Supabase resource search is not implemented")
