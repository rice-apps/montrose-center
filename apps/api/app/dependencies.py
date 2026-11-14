"""Dependency providers for the resource agent."""

import os
from typing import Annotated

from fastapi import Depends
from pydantic_ai.models import Model, infer_model

from app.services.agent import ResourceAgent


def get_model() -> Model:
    """Create the model selected by application configuration."""
    model_name = os.getenv("MODEL_NAME", "").strip()

    if not model_name:
        raise RuntimeError("MODEL_NAME is not configured.")

    return infer_model(model_name)


def get_resource_agent(
    model: Annotated[Model, Depends(get_model)],
) -> ResourceAgent:
    """Give the configured model to the resource agent."""
    return ResourceAgent(model=model)