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

### Starter files and code locations

No shared starter implementation is required before people take these tasks. The contract above is the starting point; each owner creates the files listed for their task in their own branch. Paths marked **new** do not exist on `main` yet. The `apps/api/migrations/` and `apps/api/tests/` directories also need to be created by the first task that uses them. Keep the new catalog code separate from the first-sprint chat stubs until the integration step below.

| Task | Files to create or change | Put the logic here |
| --- | --- | --- |
| 1. Catalog tables | **New:** `apps/api/migrations/<timestamp>_services_people.sql` | Define `services` and `people`, UUID primary keys, `people.service_id` foreign key, `keywords` as a string array, `is_active` and `resource_type`, and nullable fields from the shared contract. Use a timestamp that sorts after the first-sprint `chats`/`messages` migration. No Python files need to change for this task. |
| 2. Fictional catalog fixtures | **New:** `apps/api/app/data/catalog.json`; **new:** `apps/api/tests/test_catalog_fixture.py` or a small validation script in `apps/api/` | Store fictional service and contact records in the JSON file. In the check, validate required fields, UUIDs, contact-to-service IDs, and the requested coverage. Leave `apps/api/app/data/resources.json` alone; it belongs to the first-sprint agent. |
| 3. Service search ranking | **New:** `apps/api/app/services/service_search.py`; **new:** `apps/api/tests/test_service_search.py` | Put a pure `search_services(records, query, limit)` function in the service module. Filter inactive records, rank name then keyword then description matches with deterministic tie-breaking, and cap the result count. Tests use inline records; this module must not open a database connection. |
| 4. Service/contact detail lookup | **New:** `apps/api/app/repositories/catalog.py`; **new:** `apps/api/tests/test_catalog_repository.py` | Put `get_service(service_id)` and the Supabase reads in a separate `CatalogRepository`. Read `services` by `service_id`, then `people` by the same ID in a stable order such as `person_id`; return a service with a contact list or a not-found result. Test with a fake client. Do not change `repositories/chats.py`. |
| 5. Catalog API contract | **New:** `apps/api/app/schemas/catalog.py`, `apps/api/app/routers/catalog.py`, `apps/api/tests/test_catalog_routes.py`; **change:** `apps/api/app/dependencies.py`, `apps/api/app/main.py` | Define typed service-summary, service-detail, and contact responses in the schema. Put `GET /services?q=...` and `GET /services/{service_id}` in the router, with query/limit and ID handling, then register the router in `main.py`. Add an overridable catalog provider dependency in `dependencies.py`; route tests supply a fake provider, so this task does not import Tasks 3 or 4. |
| 6. Service result display | **New:** `apps/web/src/components/ServiceResult.tsx` | Define local TypeScript props matching the shared contract and render name, program, description, referral instructions, and zero or more contacts. Use local sample props to check the required states. Keep it standalone; do not change `apps/web/src/app/page.tsx` or call the API in this task. |
| 7. Agent catalog tool adapters | **New:** `apps/api/app/services/catalog_tools.py`, `apps/api/app/services/catalog_provider.py`, `apps/api/tests/test_catalog_tools.py` | Put the provider interface with `search(query, limit)` and `get_service(service_id)` in `catalog_provider.py`. Put bounded, read-only `search_services` and `get_service` adapters and argument checks in `catalog_tools.py`. Tests pass a fake provider. Registering the tools with `ResourceAgent` in `apps/api/app/services/agent.py` happens during integration. |

These are ownership boundaries for parallel branches, not seven extra prerequisites. Task 5's HTTP provider and Task 7's agent provider can each use a small local interface for their tests; during integration, make both call the same catalog repository and response mapping. The current API test dependency is optional (`python -m pip install -e '.[dev]'` from `apps/api`); the web app has no component-test runner configured, so Task 6 can verify its sample states with a local preview and `npm run typecheck`.

| # | Independent task | Scope | Local pass condition | Later integration point |
| --- | --- | --- | --- | --- |
| 1 | **Catalog tables** | Add a migration for `services` and `people` using the shared contract, with keys, contact foreign key, and nullable unknown fields. Work only in migration files. | Apply the migration to an empty local Postgres/Supabase database; insert and read one service with two contacts. | The database backing search and contact lookup. |
| 2 | **Fictional catalog fixtures** | Add a standalone JSON fixture under `apps/api/app/data/` with a few fictional service and contact records matching the contract. Cover internal/external, active/inactive, multiple contacts, and missing contact information. Do not change the existing first-sprint `resources.json`. | A local validation script or test checks required fields and UUIDs; all records are fictional. This task does not need Task 1's tables. | Seed data and repeatable examples for search and display checks. |
| 3 | **Service search ranking** | Add a pure function that takes service records and a query, filters inactive records, ranks name/keyword/description matches deterministically, and applies a result limit. Keep database access outside this task. | Tests with inline records cover a known-name match, a need/keyword match, no match, inactive exclusion, and limit. | Search logic that a later repository adapter can apply to catalog candidates. |
| 4 | **Service/contact detail lookup** | Add a read-only repository function for fetching one service and its linked contacts by ID using the fixed table/field contract. Use a fake Supabase client for local checks; do not modify the chat repository. | Fake-client checks cover two contacts in stable order, zero contacts, and an unknown ID. No Task 1 migration is needed to run these checks. | Supplies the detail and referral-contact data behind a selected service. |
| 5 | **Catalog API contract** | Add typed response models plus `GET /services?q=...` and `GET /services/{service_id}` routes. Inject a small fake catalog provider for checks; do not import unfinished Task 3 or 4 code. | Route checks cover a result list, an empty search, one detail with contacts, and 404 for an unknown ID. | Stable HTTP boundary for the web app and later repository wiring. |
| 6 | **Service result display** | Add a standalone web component with local TypeScript props matching the shared contract. Show name, program, description, referral instructions, and zero or more contacts; use inline fixtures. Do not wire the chat page. | It renders one, multiple, and no contacts and labels missing instructions plainly. No API from Task 5 is required. | Presentation for recommendations and contact lookup in the staff UI. |
| 7 | **Agent catalog tool adapters** | Add bounded, read-only `search_services` and `get_service` tool functions behind a provider interface matching the shared search/detail signatures. Test with a fake provider; leave model registration and live database wiring for integration. | Tests cover normal results, no match/not found, empty query, and an excessive limit. The tools return only supplied catalog data. | Allows the first-sprint chat agent to use catalog retrieval later. |

## Integration after individual tasks

Once the seven tasks pass locally, connect the catalog tables and fixtures to a read-only repository, connect that repository to the API and agent tools, and use the API response in the service display component. The search-ranking function can rank candidate rows from the repository. Then test the staff flow: ask about a need, inspect a specific service and its referral contact, ask a follow-up, and see an honest no-match or missing-contact answer. This integration is necessary for Phase 1, but it is not hidden inside any one 2.5-hour assignment.
