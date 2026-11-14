# Coding sprint — October 31, 2026

## Sequence and goal

**First, finish the first coding sprint. Then start the seven new tasks below.** The first sprint establishes a working chat with fictional resources and saved history. The next sprint adds a small, fictional service catalog that staff can search in the web app and use to look up referral contacts. Use fictional information during development; staff still make referrals through existing channels.

This status is based on the `origin` branches reviewed October 30, 2026 and the [first coding sprint guide](first-coding-sprint.md). A branch draft is not finished merely because code exists on the branch; it needs to work with the rest of the application.

## Part 1 — Finish the first coding sprint

`main` has the request-scoped chat dependency injection and shared Supabase client setup, but still shows a placeholder web page. Only `/health` is active. The remaining first-sprint work is:

| Original task | Current branch/status | Finish before starting the new sprint |
| --- | --- | --- |
| 1. Message component | `nacho/chatinput` has a renderer. | Integrate it with user and assistant messages returned by the API. |
| 2. Sidebar component | `sidebar-component` lists sample chats. | Load real conversations, select one, and make New Chat create/select a conversation. |
| 3. Input component | `nacho/chatinput` submits text, but its page produces a timed canned reply. | Send the question to the API, show loading and recoverable errors, and display the real reply. |
| 4. Chat API | `api-setup` has backend and frontend drafts. | Give create, list, get, rename, and send distinct backend routes; fix path IDs, methods, and the frontend base URL and request bodies. |
| 5. Chat logic | No implementation branch; methods on `main` are signatures. | Load history, call the agent, save the exchange, and handle missing chats and failures. |
| 6. Persistence | `folashewa` has a Supabase repository draft. | Commit a `chats`/`messages` schema, align its queries to that schema, and verify ordered reads and writes. |
| 7. Simple agent | `simple-agent` has a fictional catalog prompt and model-call draft. | Match the dependency provider's constructor, use the configured model, avoid import-time credential failures, and pass saved history to the model. |

The two UI branches both modify `apps/web/src/app/page.tsx`; combine those changes into one page. The first sprint is complete when a developer can create a chat, ask about the fictional resources, receive a grounded reply, ask a follow-up, refresh and reopen the conversation, and see an honest response when the fictional data has no answer. This is the completion target from the first-sprint guide, not one of the seven new tasks.

## Part 2 — Seven independent tasks for the next sprint

**Start these after Part 1 is complete.** The next sprint has **three backend tasks and four frontend tasks**, each about **2.5 hours**. Each owner can finish a row in their own branch using inline sample data or a fake provider. Connecting the rows is a separate integration step.

This sprint uses a JSON catalog so the team can deliver a visible search and contact lookup with less setup. A Supabase catalog migration and chat-agent catalog tools can follow after this workflow has been reviewed with staff. The first-sprint `apps/api/app/data/resources.json` remains the chat agent's fictional prompt data for now.

### Shared contract

Use the same field names across the JSON, API, and web app:

- A service has `service_id` (UUID), `name`, `description`, `keywords` (strings), `is_active`, and `resource_type` (`internal` or `external`). `program_name`, `target_population`, `eligibility`, and `referral_instruction` may be null.
- A contact has `person_id` (UUID) and nullable `person_name`, `person_email`, `person_phone`, `person_team`, and `person_service_description`. Each service has a `contacts` array, which may be empty.
- `GET /services?q=...` returns an ordered list of active service summaries. `GET /services/{service_id}` returns one service with its contacts, or 404. Unknown instructions or contact details stay null and are labeled plainly in the UI.

### Tasks, files, and pass conditions

All listed files are new unless marked **change**. Owners create their files in their own branches; no shared starter implementation is needed first. The `apps/api/tests/` directory does not exist on `main` yet.

| Task | Files to create or change | Work and logic location | Done when |
| --- | --- | --- | --- |
| 1. **Fictional catalog data** (backend) | `apps/api/app/data/catalog.json`; `apps/api/tests/test_catalog_fixture.py` | Add a few fictional services with nested contacts. Include internal and external services, an inactive service, multiple contacts, and missing referral details. Keep the first-sprint resource file separate. | A small check validates required fields and UUIDs; all records are fictional. |
| 2. **Catalog search and lookup** (backend) | `apps/api/app/services/catalog.py`; `apps/api/tests/test_catalog.py` | Write pure functions to search a passed list of services and look up one by ID. Search only active services; match name, keywords, and description in a stable order; apply a result limit. Do not read a database or import Task 1's file in these functions. | Inline-data tests cover a name match, keyword match, no match, inactive exclusion, limit, and unknown ID. |
| 3. **Catalog API** (backend) | `apps/api/app/schemas/catalog.py`, `apps/api/app/routers/catalog.py`, `apps/api/tests/test_catalog_routes.py`; **change:** `apps/api/app/main.py` | Define typed summary, detail, and contact responses. Add the two read-only routes, define an overridable catalog provider in the router, and register it in `main.py`. Route checks use a fake provider without waiting for Tasks 1 or 2. | Route checks cover results, empty search, detail with contacts, and 404. |
| 4. **Web catalog API client** (frontend) | `apps/web/src/lib/catalog.ts` | Define TypeScript types for the shared response shapes and functions to request the search and detail routes. Use `NEXT_PUBLIC_API_BASE_URL` as the existing web API contract specifies. Handle failed responses with a useful error. | Typecheck passes; a small mock-response check or local call confirms both functions read the expected shapes. |
| 5. **Search box and states** (frontend) | `apps/web/src/components/ServiceSearch.tsx` | Build a standalone search form that accepts a query and calls an `onSearch` prop. Show loading, error, and no-results states from props. Do not wire the page or API here. | With sample props, a user can submit a query and see each state clearly. |
| 6. **Service result card** (frontend) | `apps/web/src/components/ServiceCard.tsx` | Build a standalone card for a service summary: name, program when present, description, and internal/external label. Provide an `onSelect` prop for opening details. | Sample cards show internal and external services, a missing program, and a working select action. |
| 7. **Contact detail panel** (frontend) | `apps/web/src/components/ServiceDetail.tsx` | Build a standalone detail view for one service, its referral instruction, and its contacts. Label missing instructions and contact information plainly. | Sample details show one, multiple, and no contacts without inventing information. |

The API's optional test dependency can be installed with `python -m pip install -e '.[dev]'` from `apps/api`. The web app has no component-test runner configured; frontend owners can check sample states in a local preview and run `npm run typecheck`.

## Integration after individual tasks

Connect the JSON file to the search/lookup functions and API routes. Then add a catalog page at `apps/web/src/app/services/page.tsx` that uses the web API client and the three new components. Test a staff flow: search for a need, choose a service, inspect known referral contacts, and see clear no-match and missing-detail states. Link to the catalog from the chat page once the first-sprint UI is stable.

This produces a usable, read-only catalog search in the web app. Moving the catalog to Supabase and letting the chat agent use catalog tools are later steps, after the team validates the catalog fields and staff experience.
