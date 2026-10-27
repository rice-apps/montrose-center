# Phase 1 architecture diagram

This is the **target architecture for Phase 1**, based on the [first coding sprint flow](first-coding-sprint.md) and the Phase 1 resource discovery roadmap. It is a design proposal, not a diagram of working code: the repository currently has a placeholder web page and chat method signatures, while only the API health endpoint is active.

## System overview

```mermaid
flowchart LR
    Staff["Montrose Center staff"]

    subgraph System["Resource discovery tool — built by RiceApps"]
        UI["Staff web app<br/>Next.js"]
        API["Backend API<br/>FastAPI"]
        UI <-->|"Chat requests, results, and history"| API
    end

    subgraph Providers["Externally provided services"]
        DB[("One Supabase database<br/>resource catalog + chat history")]
        LLM["LLM provider"]
    end

    Referral["Existing referral channels"]

    Staff <-->|"Describe needs, ask follow-ups, review services and contacts"| UI
    API <-->|"Read catalog; save and load conversations"| DB
    API <-->|"Generate answers from relevant catalog data and chat context"| LLM
    Staff -->|"Initiate a referral after choosing a service"| Referral
```

The web app and backend API are the system we build. Supabase hosts **one database** containing several related tables; the LLM is a separate provider. Internal and external *resources* are catalog entries in that database, not separate infrastructure providers. Referral messages continue through the staff's existing channels, outside this tool.

The backend is responsible for retrieving relevant services and programs, carrying conversation context into follow-up answers, and returning specific recommendations with reasons and available referral contacts. It should say when no suitable resource is found or when contact details are missing. Staff choose the service and initiate the referral themselves. A full catalog, filters, named-resource search, ranking, and confidence scores are P1 extensions; the same system boundary supports them without implying they are part of the first sprint.

## Proposed Supabase data model

The schema below expands the single database in the overview. It adapts the supplied Services, People, Chat History, and Messages sketch: `programs` makes the parent-program relationship explicit; `contacts` covers either a person or a team; and `service_contacts` allows several contacts per service without duplicating service rows. An external resource may have no Montrose Center parent program.

```mermaid
erDiagram
    PROGRAMS |o--o{ SERVICES : groups
    SERVICES ||--o{ SERVICE_CONTACTS : has
    CONTACTS ||--o{ SERVICE_CONTACTS : serves
    CHATS ||--o{ MESSAGES : contains

    PROGRAMS {
        uuid program_id PK
        string name
        string description
    }
    SERVICES {
        uuid service_id PK
        uuid program_id FK
        string name
        string description
        string scope
        string target_population
        string eligibility
        string referral_instruction
        boolean is_active
        string keywords
    }
    CONTACTS {
        uuid contact_id PK
        string name
        string contact_type
        string email
        string phone
        string team
    }
    SERVICE_CONTACTS {
        uuid service_id FK
        uuid contact_id FK
        string service_description
    }
    CHATS {
        uuid chat_id PK
        string title
        datetime created_at
        datetime updated_at
    }
    MESSAGES {
        uuid message_id PK
        uuid chat_id FK
        string role
        string content
        datetime created_at
    }
```

`services.scope` distinguishes internal from external resources. `services.program_id` is optional for external resources. `service_contacts` should have a unique `(service_id, contact_id)` pair; its `service_description` describes that contact's role for that service. `messages.role` is `user` or `assistant`, matching the current API types and serving the purpose of the sketch's `Is_Agent` field. The sketch's `Chat History.Person_ID` is deferred because the Phase 1 scaffold has no staff identity or authentication model; chats and messages can still preserve context within a conversation.

## Planned API surface

The backend exposes chat operations to the web app. The first sprint already defines these method signatures and response shapes, but has not registered or implemented the chat routes.

| Operation | Purpose |
| --- | --- |
| `POST /chats`, `GET /chats` | Start a conversation or list saved conversations. |
| `GET /chats/{chat_id}`, `PATCH /chats/{chat_id}` | Read a conversation or update its title. |
| `POST /chats/{chat_id}/messages` | Ask a question or follow-up and receive the saved user and assistant messages. |

The Phase 1 response must also present the recommended service, parent program when applicable, reason for the match, referral instructions, and available contacts. The exact structured response contract for those details is still to be designed. Catalog browsing and filtering endpoints belong to P1. No endpoint sends a referral.
