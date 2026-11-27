
from uuid import UUID

from pydantic import BaseModel, field_validator


# Assumption: Active status is changed through separate operations.
# Assumption: Contact relationships are not edited here.


class ResourceCreate(BaseModel):
    service_name: str
    description: str | None = None
    referral_instruction: str | None = None
    target_population: str | None = None
    keywords: list[str] | None = None
    program_name: str | None = None

    @field_validator("service_name")
    @classmethod
    def check_name(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Service name cannot be blank.")
        return value.strip()


class ResourceUpdate(BaseModel):
    service_name: str | None = None
    description: str | None = None
    referral_instruction: str | None = None
    target_population: str | None = None
    keywords: list[str] | None = None
    program_name: str | None = None

    @field_validator("service_name")
    @classmethod
    def check_name(cls, value: str | None) -> str | None:
        if value is not None:
            if not value.strip():
                raise ValueError("Service name cannot be blank.")
            return value.strip()
        return None


class Resource(BaseModel):
    service_id: UUID
    service_name: str
    description: str | None = None
    referral_instruction: str | None = None
    target_population: str | None = None
    keywords: list[str] | None = None
    program_name: str | None = None
    is_active: bool | None = None
