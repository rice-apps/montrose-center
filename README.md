# Montrose Center: first sprint scaffold

This repository contains only the first sprint's chat project scaffold. The task files provide **signatures and short TODO comments, without implementations**. The page is a placeholder, and the chat API routes are not registered yet. Fictional data for the agent task is in `apps/api/app/data/resources.json`.

## Seven starter tasks

| Task | File | What to build |
| --- | --- | --- |
| 1. Message component | `apps/web/src/components/ChatMessage.tsx` | Render one chat message. |
| 2. Sidebar component | `apps/web/src/components/ChatSidebar.tsx` | Show chats and selection controls. |
| 3. Input component | `apps/web/src/components/ChatInput.tsx` | Collect and submit a message. |
| 4. Chat API | `apps/api/app/routers/chats.py`, `apps/web/src/lib/api.ts` | Create, list, read, rename, and message chats. |
| 5. Chat logic | `apps/api/app/services/chats.py` | Coordinate the repository and agent. |
| 6. Persistence | `apps/api/app/repositories/chats.py` | Save chats and messages in SQLite. |
| 7. Agent | `apps/api/app/services/agent.py` | Put dummy data in the system prompt and call an LLM. |

`apps/api/app/schemas/chats.py` defines the data shapes shared by the backend functions. The frontend types in `apps/web/src/lib/api.ts` mirror those shapes.

## Structure

```text
apps/
  web/
    src/app/                  Minimal Next.js page and layout
    src/components/           Three chat component signatures
    src/lib/api.ts            API client signatures and types
  api/
    app/main.py              Minimal FastAPI app and health endpoint
    app/routers/chats.py     Chat route signatures
    app/schemas/chats.py     Request and response types
    app/services/chats.py    Chat workflow signatures
    app/services/agent.py    Prompt and model signatures
    app/repositories/chats.py SQLite signatures
    app/data/resources.json  Fictional resources
```

## Setup

Use Node.js 22 and Python 3.11 or newer. From `apps/api`, run `python3 -m venv .venv`, activate it, install with `python -m pip install -e .`, then start `python -m uvicorn app.main:app --reload`. From `apps/web`, run `npm ci` and `npm run dev`.

The scaffold starts, but the seven tasks must be implemented before chat works. When implementing Task 7, configure `MODEL_NAME` and keep `OPENAI_API_KEY` on the backend. Do not use real client information in the fictional sprint data or demo chat.
