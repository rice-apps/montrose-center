"""Proposed search result derived from docs/coding-sprint-11-07.md.

This is a consumer-facing subset of the planned service catalog, not a schema
introspected from Supabase. Confirm the fields with the catalog/search owners.
Contacts are loaded separately; keywords and is_active are query/filter inputs.
"""

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
