# Coding sprint — October 31, 2026

## Sequence and goal

**First, finish the first coding sprint. Then start the seven new tasks below.** The first sprint establishes a working chat with fictional resources and saved history. The next sprint begins the Phase 1 resource catalog, service search, and referral-contact lookup that make the chat useful to staff. Use fictional information during development; staff still make referrals through existing channels.

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

**Start these after Part 1 is complete.** Each task is a separate, roughly **2.5-hour** assignment. Any teammate can take any row, work in their own branch, and meet its pass condition with local fixtures or fakes. No row requires another row to be finished first. Integration of the seven results happens after the individual tasks are reviewed.

### Shared contract for independent work

Use this contract for all seven tasks so people can work without waiting for a schema decision:

- A **service** has `service_id` (UUID), `name`, `description`, `keywords` (list of strings), `is_active`, `resource_type` (`internal` or `external`), and nullable `program_name`, `target_population`, `eligibility`, and `referral_instruction`.
- A **contact** has `person_id` (UUID), `service_id` (UUID), and nullable `person_name`, `person_email`, `person_phone`, `person_team`, and `person_service_description`. A service may have zero or more contacts.
- Search takes `query: str` and `limit: int` and returns ordered service summaries. Detail lookup takes `service_id: str` and returns one service with its contacts, or a not-found result. Unknown contact or referral details remain absent; no code invents them.

These fields extend the proposed model in `design/architecture_diagram.md` with eligibility and internal/external status from the Phase 1 product summary. The contract is fixed for this sprint; any change should be agreed by all task owners before implementation.

### Starter files and task locations

No shared starter implementation is required before people take these tasks. Each owner creates the files for their row in their own branch. Paths marked **new** and the `apps/api/migrations/` and `apps/api/tests/` directories do not exist on `main` yet.

| Task | Files to create or change | Scope and logic location (about 2.5 hours) | Local pass condition | Later integration point |
| --- | --- | --- | --- | --- |
| 1. **Catalog tables** | **New:** `apps/api/migrations/<timestamp>_services_people.sql` | Define `services` and `people` with UUID keys, `people.service_id` foreign key, string-array keywords, active and resource type fields, and nullable unknown fields. Use a timestamp after the first-sprint chat migration. Work only in SQL. | Apply to an empty local Postgres/Supabase database; insert and read one service with two contacts. | Database backing search and contact lookup. |
| 2. **Fictional catalog fixtures** | **New:** `apps/api/app/data/catalog.json` and `apps/api/tests/test_catalog_fixture.py` (or a validation script in `apps/api/`) | Store fictional services and contacts in JSON. Cover internal/external, active/inactive, multiple contacts, and missing details. Leave the first-sprint `resources.json` unchanged. | Check required fields, UUIDs, contact-to-service IDs, and coverage without Task 1's tables. | Seed data and repeatable search/display examples. |
| 3. **Service search ranking** | **New:** `apps/api/app/services/service_search.py` and `apps/api/tests/test_service_search.py` | Implement a pure `search_services(records, query, limit)` function. Filter inactive records; rank name, keyword, then description matches with deterministic ties; apply the limit. Keep database access out. | Inline-record tests cover known names, need/keyword matches, no match, inactive exclusion, and limit. | Rank candidate rows from the repository. |
| 4. **Service/contact detail lookup** | **New:** `apps/api/app/repositories/catalog.py` and `apps/api/tests/test_catalog_repository.py` | Put read-only `get_service(service_id)` in `CatalogRepository`. Read the service and its `people` rows in stable order, such as `person_id`. Leave `repositories/chats.py` alone. | Fake-client checks cover two ordered contacts, zero contacts, and an unknown ID; no Task 1 migration is needed. | Supply details and referral contacts. |
| 5. **Catalog API contract** | **New:** `apps/api/app/schemas/catalog.py`, `apps/api/app/routers/catalog.py`, `apps/api/tests/test_catalog_routes.py`; **change:** `apps/api/app/dependencies.py`, `apps/api/app/main.py` | Define typed summary, detail, and contact responses in the schema. Add `GET /services?q=...` and `GET /services/{service_id}` in the router; add an overridable provider dependency and register the router. Use a fake provider without importing Tasks 3 or 4. | Route checks cover a result list, empty search, detail with contacts, and 404. | HTTP boundary for the web app and repository wiring. |
| 6. **Service result display** | **New:** `apps/web/src/components/ServiceResult.tsx` | Define local TypeScript props matching the contract. Render name, program, description, instructions, and zero or more contacts. Keep the component off the chat page for this task. | Check one, multiple, and no contacts plus missing instructions using sample props; run `npm run typecheck`. | Present recommendations and contact details. |
| 7. **Agent catalog tool adapters** | **New:** `apps/api/app/services/catalog_provider.py`, `apps/api/app/services/catalog_tools.py`, `apps/api/tests/test_catalog_tools.py` | Put the `search(query, limit)`/`get_service(service_id)` provider interface in `catalog_provider.py`; put bounded, read-only tool functions and argument checks in `catalog_tools.py`. Test with a fake provider. | Cover results, no match/not found, empty query, and excessive limit; return only supplied catalog data. | Register tools with `ResourceAgent` during integration. |

Task 5's HTTP provider and Task 7's agent provider can each use a small local interface for testing. During integration, make both call the same catalog repository and response mapping. The current API test dependency is optional (`python -m pip install -e '.[dev]'` from `apps/api`); the web app has no component-test runner configured, so Task 6 can check its sample states in a local preview.

## Integration after individual tasks

Once the seven tasks pass locally, connect the catalog tables and fixtures to a read-only repository, connect that repository to the API and agent tools, and use the API response in the service display component. The search-ranking function can rank candidate rows from the repository. Then test the staff flow: ask about a need, inspect a specific service and its referral contact, ask a follow-up, and see an honest no-match or missing-contact answer. This integration is necessary for Phase 1, but it is not hidden inside any one 2.5-hour assignment.
