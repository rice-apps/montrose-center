"""Task 3: ranked Supabase search, separate from resource list/detail reads."""

from typing import Any

from supabase import Client

from app.schemas.resource_search import ResourceSearchResult


def _to_search_result(row: dict[str, Any]) -> ResourceSearchResult:
    """Map one returned program row, preserving unknown fields as None."""
    # TODO: map the source column names to ResourceSearchResult's Python fields.
    # Preserve Keyword1 through Keyword10 separately; do not invent missing values.
    raise NotImplementedError("Search result mapping is not implemented")


class ResourceSearchRepository:
    def __init__(self, client: Client) -> None:
        self.client = client

    def search_services(self, query: str, limit: int = 10) -> list[ResourceSearchResult]:
        """Return ranked active programs for a validated query and limit."""
        # TODO: call the Supabase search function/query agreed on for this task.
        # Search Program Name, Program Definition, and Keyword1 through Keyword10.
        # Exact program-name matches first, then text rank; do not search contacts.
        # Confirm a stable database row key for ties; the supplied fields have no ID.
        # Filter to Active = true and apply the limit in the database.
        # Map rows with _to_search_result, preserving order; no matches returns [].
        # Let database failures propagate instead of reporting them as no matches.
        raise NotImplementedError("Supabase resource search is not implemented")
