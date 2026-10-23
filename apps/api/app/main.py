"""First sprint FastAPI entry point."""

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.chats import router as chats_router

app = FastAPI(title="Montrose Chat Starter")
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
