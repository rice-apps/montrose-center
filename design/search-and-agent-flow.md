# Phase 1 search and agent flows

These diagrams describe the **intended Phase 1 behavior**, not the current first-sprint implementation. The repository still has agent and chat method stubs and a fictional JSON catalog. The [architecture diagram](architecture_diagram.md) shows the overall system boundary and proposed Supabase tables.

## 1. Resource search and referral lookup

```mermaid
flowchart TD
    A["Staff enters a need, a service name, or a follow-up"] --> B{"Follow-up about earlier results?"}
    B -->|Yes| C["Resolve references such as 'the second one' to previously shown service IDs"]
    B -->|No| D["Identify search terms and explicit filters"]
    C --> C2{"Asks about one specific service?"}
    C2 -->|Yes| L
    C2 -->|No, refine results| D
    D --> E["Search active services in Supabase<br/>Rank name and keyword matches above description matches"]
    E --> F{"Suitable candidates found?"}
    F -->|No| G["Say no suitable service was found<br/>Invite a revised search"]
    F -->|Yes| H["Fetch service fields for candidate IDs"]
    H --> I["Explain possible fit using retrieved fields<br/>State what the data does not establish"]
    I --> J["Show service cards<br/>Name, program, description, target population, reason, gaps"]
    J --> K["Staff opens a service"]
    K --> L["Fetch the current service, linked contacts, and referral instructions"]
    L --> M{"Contact and instructions present?"}
    M -->|Yes| N["Show exact stored contacts and instructions"]
    M -->|Partly or no| O["Show available facts and label missing details plainly"]
    N --> P["Staff initiates referral through an existing channel"]
```

The initial retrieval method is ranked full-text search over `services.name`, `services.keywords`, and `services.description`, with active services only. A known name should receive strong priority. Explicit constraints, such as an age group or internal versus external scope, should narrow results only when the catalog supports them. Compare results with real staff questions before adding semantic or hybrid search; [Supabase full-text search](https://supabase.com/docs/guides/database/full-text-search) supports ranking, while [hybrid search](https://supabase.com/docs/guides/ai/hybrid-search) adds embeddings and a second retrieval path.

The explanation may be generated, but the card's service fields, contact details, and referral instructions come from database rows. Opening a card fetches the latest detail rather than trusting an earlier chat answer. The tool does not send referrals.

## 2. Agent orchestration and tool calls

```mermaid
flowchart TD
    A["Staff sends a prompt or follow-up<br/>with a browser-held chat ID"]
    B["API loads chat history and prior result IDs<br/>from Supabase"]
    C["API resolves references such as<br/>'the second one' when needed"]
    D["Agent gives the prompt and context<br/>to the LLM"]
    E["LLM requests a tool call<br/>search_services or get_service"]
    F["Backend validates the request<br/>and runs the allowed tool"]
    G["Supabase returns active service records<br/>and any missing-field status"]
    H["Agent gives the tool result to the LLM"]
    I{"Need another tool call?<br/>Bounded loop"}
    J["LLM returns service IDs and explanations<br/>or reports no match"]
    K["API checks returned IDs<br/>against the tool results"]
    L{"Suitable result?"}
    M["API reads current facts and builds<br/>cards with grounded explanations"]
    N["Explain the gap and invite a new search"]
    O["Save the exchange and ordered result IDs<br/>in Supabase"]
    P["Web displays the response"]
    Q["API fetches current contacts<br/>and referral instructions"]
    R["Web shows exact stored details<br/>and labels missing information"]

    A --> B --> C --> D --> E --> F --> G --> H --> I
    I -->|Yes| E
    I -->|No| J --> K --> L
    L -->|Yes| M --> O
    L -->|No| N --> O
    O --> P
    P -->|Card opened or details requested| Q --> R
```

The agent can choose among **allowlisted backend tools**; it does not connect directly to Supabase. `search_services` handles a need, a known name, or a refined query. `get_service` retrieves a specific service when a follow-up refers to a prior result. The backend validates tool arguments and checks references to earlier results. It builds service cards and contact answers from database records, so the LLM's job is to interpret the request, choose a tool, and explain why retrieved services may fit. It cannot invent a contact or referral instruction. A simple known-service lookup can skip the LLM when no interpretation is needed.

For follow-ups such as “who handles referrals for the second one?”, the backend needs the **ordered service IDs shown in the earlier answer**, not just the assistant's prose. Persisting those IDs with the assistant response is a proposed extension to the current chat schema. The browser-held chat ID identifies the prototype conversation; it is not a staff identity or a link to the referral-contact table.
