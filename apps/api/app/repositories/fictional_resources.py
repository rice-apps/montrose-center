"""Temporary fictional catalog until Task 5's Supabase ResourceRepository exists.

Satisfies ResourceRepositoryProtocol so dependencies.py can swap in the real repository later.
"""

from app.schemas.resource_search import ResourceSearchResult

FICTIONAL_PROGRAMS = [
    ResourceSearchResult(
        program_name="Example Housing Navigation",
        active=True,
        how_to_refer="Email the intake team with the client's housing goals.",
        population_served="Adults seeking housing support",
        eligibility_criteria="Adults 18 and older",
        program_contacts="Example Intake Team, housing@invalid.example",
        program_definition="Fictional help exploring housing options and applications.",
        keywords=["housing", "rent", "shelter"],
    ),
    ResourceSearchResult(
        program_name="Example Counseling Intake",
        active=True,
        how_to_refer="Submit the example referral form.",
        population_served="Adults seeking counseling",
        eligibility_criteria="",  # deliberately missing
        program_contacts="Example Counseling Desk, counseling@invalid.example",
        program_definition="Fictional first conversation about counseling needs and preferences.",
        keywords=["counseling", "therapy", "mental health"],
    ),
    ResourceSearchResult(
        program_name="Example Legal Clinic",
        active=True,
        how_to_refer="Call the clinic line to book a consultation.",
        population_served="Adults needing legal information",
        eligibility_criteria="Income-based; confirm with the clinic",
        program_contacts="Example Legal Line, 555-0100",
        program_definition="Fictional walk-in legal information sessions.",
        keywords=["legal", "name change", "documents"],
    ),
    ResourceSearchResult(
        program_name="Example Retired Support Group",
        active=False,  # inactive programs must never reach the prompt
        how_to_refer="No longer accepting referrals.",
        population_served="Adults seeking peer support",
        eligibility_criteria="None",
        program_contacts="Example Groups Team, groups@invalid.example",
        program_definition="Fictional peer support group that has ended.",
        keywords=["support group"],
    ),
]


class FictionalResourceRepository:
    def list_active(self, limit: int, offset: int = 0) -> list[ResourceSearchResult]:
        active = sorted((p for p in FICTIONAL_PROGRAMS if p.active), key=lambda p: p.program_name)
        return active[offset : offset + limit]
