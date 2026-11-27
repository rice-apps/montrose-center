
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query

from app.dependencies import CatalogServiceDep
from app.schemas.catalog import Resource, ResourceCreate, ResourceUpdate

# Assumption: Resource operations use /services endpoints.
router = APIRouter(prefix="/services", tags=["services"])


@router.post("", response_model=Resource, status_code=201)
def create_resource(
    resource: ResourceCreate,
    service: CatalogServiceDep,
):
    return service.create_resource(resource)


@router.get("", response_model=list[Resource])
def list_resources(
    service: CatalogServiceDep,
    limit: int = Query(default=10, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    return service.list_resources(limit, offset)


@router.get("/{service_id}", response_model=Resource)
def get_resource(
    service_id: UUID,
    service: CatalogServiceDep,
):
    try:
        return service.get_resource(service_id)
    except LookupError:
        raise HTTPException(status_code=404, detail="Resource not found.") from None


@router.patch("/{service_id}", response_model=Resource)
def update_resource(
    service_id: UUID,
    resource: ResourceUpdate,
    service: CatalogServiceDep,
):
    try:
        return service.update_resource(service_id, resource)
    except LookupError:
        raise HTTPException(status_code=404, detail="Resource not found.") from None
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from None


@router.patch("/{service_id}/deactivate", response_model=Resource)
def deactivate_resource(
    service_id: UUID,
    service: CatalogServiceDep,
):
    try:
        return service.deactivate_resource(service_id)
    except LookupError:
        raise HTTPException(status_code=404, detail="Resource not found.") from None


@router.patch("/{service_id}/reactivate", response_model=Resource)
def reactivate_resource(
    service_id: UUID,
    service: CatalogServiceDep,
):
    try:
        return service.reactivate_resource(service_id)
    except LookupError:
        raise HTTPException(status_code=404, detail="Resource not found.") from None
