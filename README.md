# Montrose Center resource discovery tool

The Phase 1 goal is to help Montrose Center staff find the right **internal or external service** for a client's needs and learn whom to contact for a referral. Staff currently rely on personal knowledge, a group chat, and exact-keyword search. That makes it hard to discover services across programs, especially for newer staff, and to find current referral contacts.

## Phase 1 product summary

- **Find a resource:** A staff member describes needs and preferences in natural language. The tool recommends specific services, names their parent programs, explains possible fit, and supports follow-up questions. If it cannot find a suitable service, it should say so.
- **Find a contact:** For a selected service, the tool shows the responsible person or team, contact details, and referral instructions. It should identify missing contact information clearly.
- **Explore programs:** Staff can ask about programs or types of support to learn what the Center offers beyond their own team.

New staff and experienced staff are the main users. The PRD also identifies administrators who want to understand usage. Phase 1 focuses on **resource discovery and contact lookup**; staff still initiate referrals through their existing communication channels. The first coding sprint does not include a public directory, authentication, SharePoint integration, or referral tracking.

## Current repository status

This is a **signature-only first-sprint scaffold**, not a working chat product. The chat components, API functions, persistence methods, and agent methods have TODO comments but no implementations. The web page is a placeholder, and only the API health endpoint is active. Chat persistence is planned for Supabase; the agent task uses fictional data in `apps/api/app/data/resources.json`.

See [the first coding sprint guide](design/first-coding-sprint.md) for the planned flow, the seven starter tasks, and how each task supports Phase 1.

## Start the scaffold locally

Use Node.js 22 and Python 3.11 or newer. Check the Python version used to create the virtual environment: an existing `.venv` made with Python 3.10 must be recreated. On this machine, `python3.14` is available; on another machine, replace it with any installed Python 3.11+ executable. In one terminal, start the API from the repository root:

```sh
cd apps/api
python3.14 -m venv --clear .venv
source .venv/bin/activate
python --version
python -m pip install -e .
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The API health check is at `http://localhost:8000/health`. In a second terminal, start the web app:

```sh
cd apps/web
npm ci
npm run dev
```

Open `http://localhost:3000` to see the placeholder page. The chat will not work until the sprint tasks are implemented. When building persistence, create the `chats` and `messages` tables in Supabase and set `SUPABASE_URL` and `SUPABASE_SECRET_KEY` in the backend environment. The [Supabase Python client](https://supabase.com/docs/reference/python/initializing) uses a project URL and key; [Supabase's key guide](https://supabase.com/docs/guides/getting-started/api-keys) says secret keys belong only in backend code. `apps/api/.env.example` and `apps/web/.env.example` list the other settings needed as the tasks are built; the API does not automatically load those files. Use fictional information during development.
