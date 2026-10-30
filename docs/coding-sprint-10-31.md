# Coding sprint — October 31, 2026

## Goal

Complete the first working staff chat flow using **fictional** resources, while laying one small piece of groundwork for the Phase 1 service catalog. By the end of the sprint, a developer should be able to create a chat, ask a resource question, receive a grounded answer, ask a follow-up, refresh, and reopen the conversation. An unsupported question should produce an honest “not in the catalog” answer. Staff still make referrals through existing channels.

This plan is based on `origin` branches fetched October 30, 2026 and the [first coding sprint](first-coding-sprint.md). A branch draft is not considered complete until it is integrated and its pass condition below is met.

## Current status

`main` remains a scaffold: the web page is a placeholder, the chat API has no registered routes, and the chat service, repository, and agent methods are signatures. `/health` works. The request-scoped dependency injection and shared Supabase client setup are already merged from `codex/chat-service-di`. No feature branch below has been merged into `main`.

| First-sprint task | Branch | Status on branch | Gap to a working flow |
| --- | --- | --- | --- |
| 1. Message component | `nacho/chatinput` | Draft renderer for user and assistant messages | Integrate with saved messages rather than the branch's local sample conversation. |
| 2. Sidebar component | `sidebar-component` | Lists sample chats and calls selection callback | New Chat callback is empty; load, select, and reopen real chats. |
| 3. Input component | `nacho/chatinput` | Submits trimmed text and shows a loading state | Page currently returns a timed canned reply; connect it to the API and handle errors. |
| 4. Chat API | `api-setup` | Route and fetch drafts | Backend has duplicate `GET /chats` and `PUT /chats` routes instead of chat-specific paths; frontend has a placeholder URL and puts IDs in request bodies, including a GET body. |
| 5. Chat logic | No branch | Not implemented | Coordinate repository reads/writes, history, and the agent; handle missing chats and failures. |
| 6. Persistence | `folashewa` | Supabase repository draft | It assumes `chat_history` and `messages` tables with specific columns, while the sprint guide calls for `chats` and `messages`; no schema migration is committed. Verify ordering, missing-chat behavior, and writes. |
| 7. Simple agent | `simple-agent` | Fictional catalog prompt and model call draft | Its constructor requires a model but the dependency provider calls `ResourceAgent()`; module import requires `GEMINI_*` values while the project dependencies and example environment use OpenAI. |

The two UI branches both edit `apps/web/src/app/page.tsx`, so their page changes must be combined. The repository contains no committed tests or Supabase migrations. The Phase 1 catalog search, service detail, and contact lookup shown in `design/search-and-agent-flow.md` are still future work.

## Seven tasks for this sprint

Each task is sized for **one person working up to 2.5 hours**. Keep work to the named files and pass condition. Use fakes or dependency overrides where another task is still in progress. Small tests are part of each task when they verify behavior; a working demo is the final shared check.

### 1. Fix the chat HTTP contract

**Start from:** `api-setup`.

**Work:** Register distinct FastAPI routes: `POST /chats`, `GET /chats`, `GET /chats/{chat_id}`, `PATCH /chats/{chat_id}`, and `POST /chats/{chat_id}/messages`. Correct `apps/web/src/lib/api.ts` to use `NEXT_PUBLIC_API_BASE_URL`, path IDs, and matching methods and JSON bodies. Keep the existing schema shapes.

**Pass condition:** The OpenAPI route list has all five distinct operations. With `get_chat_service` overridden by a fake, each route calls the intended service method and returns the expected shape. The frontend sends no body with GET requests.

**Depends on:** Existing schemas and dependency injection only. Coordinate the API contract with Tasks 4 and 6.

### 2. Make chat persistence reproducible

**Start from:** `folashewa`.

**Work:** Commit SQL for `chats` and `messages` tables with keys, timestamps, chat/message relationship, and a stable message ordering field or timestamp plus ID tie-breaker. Adapt `ChatRepository` to that committed schema, including create, list, get with ordered messages, update title, and append exchange. Use the first-sprint `Chat` and `Message` response shapes.

**Pass condition:** A teammate can create the tables from the committed SQL. A focused repository check covers create → append exchange → ordered read, plus a missing chat. Missing IDs raise a defined error that Task 1 can map to 404.

**Depends on:** Existing schemas. Do not assume an undocumented live table layout.

### 3. Make the fictional resource agent usable by the API

**Start from:** `simple-agent`.

**Work:** Keep the prompt grounded in `apps/api/app/data/resources.json`, but align model setup with `MODEL_NAME` and `OPENAI_API_KEY` in the example environment and installed Pydantic AI dependency. Avoid reading required credentials at module import so `/health` can start without them. Preserve the `ResourceAgent()` constructor expected by `get_resource_agent`; pass saved history into the model call.

**Pass condition:** Importing `app.main` without model credentials succeeds. A fake model test confirms the catalog and prior messages reach the agent, and an unsupported question is instructed to say the answer is unavailable rather than invent a contact.

**Depends on:** Existing fictional resource file and message schema.

### 4. Implement the chat service

**Start from:** `apps/api/app/services/chats.py` on `main`.

**Work:** Implement create, list, get, and title update as repository delegation. For send, load the chat and ordered history, call `ResourceAgent.respond(history, content)`, then save and return the user and assistant messages. Define how missing chats and agent errors propagate; do not return a successful exchange if saving fails.

**Pass condition:** Tests with fake repository and agent prove the follow-up call receives prior messages in order, saves the returned answer, and handles a missing chat without calling the model.

**Depends on:** Repository and agent method contracts from Tasks 2 and 3; implementations can be developed with fakes.

### 5. Combine the chat UI components

**Start from:** `nacho/chatinput` and `sidebar-component`.

**Work:** Bring `ChatSidebar`, `ChatMessage`, `ChatInput`, and their needed styles into one reusable chat workspace component. Give it chats, active chat, messages, loading/error state, and action callbacks as props. Preserve the useful UI from both branches but do not copy either demo page into the finished app; Task 6 owns page state and API calls.

**Pass condition:** With fixed fixture props, the workspace displays chats and messages, highlights the selected chat, shows empty/loading/error states, and invokes select, new, and send callbacks. No timed canned answer is included.

**Depends on:** Component drafts; Task 6 supplies live API wiring.

### 6. Connect the page to real chat requests

**Start from:** The workspace component from Task 5 and the client functions from Task 1.

**Work:** Replace the scaffold `page.tsx` with state and API calls for loading the chat list, creating/selecting a chat, loading its messages, and sending a question. Keep the selected chat ID across refresh (for example, in the URL or local storage), reload it, and show recoverable API errors. Disable repeat sends while a request is in flight.

**Pass condition:** Against a fake HTTP API, create → send → follow-up → refresh → reopen works without sample data or canned replies. A failed send leaves the user able to retry.

**Depends on:** Tasks 1 and 5; use a fake API while Tasks 2–4 finish.

### 7. Commit the Phase 1 service catalog schema

**Start from:** The service and contact model in `design/search-and-agent-flow.md` and `design/architecture_diagram.md`.

**Work:** Add a separate SQL migration for `services` and `people` with service name, parent program, description, keywords, active status, eligibility, referral instructions, and contact fields linked by `service_id`. Add an index suitable for the planned active-service name/keyword/description search. Document which fields may be missing and use only fictional sample rows if seeding is needed.

**Pass condition:** The migration applies to an empty Supabase/Postgres database, a sample active service can be read with its referral contact, and inactive services can be excluded by a query. This task adds the data foundation; it does not build the search UI or LLM tools.

**Depends on:** No chat task. This is the first directly reusable Phase 1 catalog deliverable.

## Integration order and final check

Tasks 1, 2, 3, and 7 can start in parallel. Task 4 uses the contracts from 2 and 3. Task 5 combines the UI drafts; Task 6 uses 1 and 5. After integration, run the API and web app with test configuration and the fictional resources, then demonstrate: create chat, grounded answer, follow-up with history, refresh and reopen, and an honest no-answer response. Record any failure as remaining sprint work rather than marking its component complete.
