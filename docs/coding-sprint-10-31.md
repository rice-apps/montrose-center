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

| # | Independent task | Scope for about 2.5 hours | Local pass condition | Later integration point |
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
