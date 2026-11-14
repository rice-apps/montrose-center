"""Search results using the program fields supplied by the project owner.

Python field names use snake_case. The repository maps source column names to
these fields; database identifiers and storage types have not been inspected.
"""

from pydantic import BaseModel


class ResourceSearchResult(BaseModel):
    program_name: str
    active: bool
    how_to_refer: str
    population_served: str
    eligibility_criteria: str
    program_contacts: str
    program_definition: str
    keywords: list[str]
