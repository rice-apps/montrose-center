"""First sprint FastAPI entry point."""

import os
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client
from supabase.lib.client_options import SyncClientOptions

from app.routers.chats import router as chats_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    app.state.supabase = None
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SECRET_KEY")
    if not url or not key:
        # Keep the scaffold and /health usable before Supabase is configured.
        yield
        return

    # One connection pool per worker, closed when the application shuts down.
    with httpx.Client(timeout=120) as http_client:
        app.state.supabase = create_client(
            url,
            key,
            options=SyncClientOptions(
                httpx_client=http_client,
                auto_refresh_token=False,
                persist_session=False,
            ),
        )
        try:
            yield
        finally:
            app.state.supabase = None


app = FastAPI(title="Montrose Chat Starter", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("WEB_ORIGIN", "http://localhost:3000")],
    allow_methods=["GET", "POST", "PATCH"],
    allow_headers=["Content-Type"],
)
app.include_router(chats_router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
