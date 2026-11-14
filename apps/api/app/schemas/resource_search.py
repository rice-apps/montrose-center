"""Search results using the program fields supplied by the project owner.

Python field names use snake_case. The repository maps source column names to
these fields; database identifiers and storage types have not been inspected.
"""

from pydantic import BaseModel


class ResourceSearchResult(BaseModel):
    program_name: str
    active: bool
    how_to_refer: str | None = None
    population_served: str | None = None
    eligibility_criteria: str | None = None
    program_contacts: str | None = None
    program_definition: str | None = None
    keyword1: str | None = None
    keyword2: str | None = None
    keyword3: str | None = None
    keyword4: str | None = None
    keyword5: str | None = None
    keyword6: str | None = None
    keyword7: str | None = None
    keyword8: str | None = None
    keyword9: str | None = None
    keyword10: str | None = None
