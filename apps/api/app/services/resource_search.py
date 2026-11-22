"""Task 3: search entry point for the agent tool and catalog API."""

from app.interfaces import ResourceSearchRepositoryProtocol
from app.schemas.resource_search import ResourceSearchResult


class ResourceSearchService:
    def __init__(self, repository: ResourceSearchRepositoryProtocol) -> None:
        self.repository = repository

    def search_services(self, query: str, limit: int = 10) -> list[ResourceSearchResult]:
        """Validate a search request and return ordered catalog results."""
        # TODO: strip query whitespace and reject a blank query with ValueError.
        # Require an integer limit from 1 to 20 (reject booleans and out-of-range values).
        # Delegate to repository.search_services(query, limit) and preserve ordering.
        # This method returns catalog facts; the agent generates the explanation.
        raise NotImplementedError("Resource search service is not implemented")
