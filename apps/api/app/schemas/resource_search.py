"""Catalog fields returned by the search tool; contacts are loaded separately."""

from typing import Literal

from pydantic import BaseModel


class ResourceSearchResult(BaseModel):
    # UUID string, matching the service_id used by the catalog and web app.
    service_id: str
    name: str
    description: str
    resource_type: Literal["internal", "external"]
    program_name: str | None = None
    target_population: str | None = None
    eligibility: str | None = None
    referral_instruction: str | None = None
