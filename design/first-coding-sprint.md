# First coding sprint

## Purpose

Build the foundation for a staff chat interface that will eventually help Montrose Center staff discover services and find referral contacts. This sprint uses a small **fictional** resource file. It does not yet implement the full Phase 1 search experience.

## Planned flow

```mermaid
flowchart TB
    Staff["Staff member asks about a need"] --> UI["Chat UI in Next.js"]
    UI --> API["Chat endpoints in FastAPI"]
    API --> Service["Chat service"]
    Service --> History[(Supabase chats and messages)]
    Service --> Agent["Resource agent"]
    Dummy["Fictional resource JSON for sprint"] --> Agent
    Agent --> LLM["LLM"]
    LLM --> Agent
    Agent --> Service
    Service --> API
    API --> UI
    UI --> Review["Staff reviews service and contact"]
    Review --> Referral["Staff uses existing referral channel"]
    Catalog[(Supabase service catalog in Phase 1)] -.-> Agent
```

The diagram shows the intended flow, **not current behavior**. The code currently contains task signatures; the chat UI, chat endpoints, persistence, and model call still need implementation. In Phase 1, the resource catalog should provide specific services, their parent programs, eligibility details, referral instructions, and contacts. The staff member decides which resource to use and initiates any referral outside this tool.

## Starter tasks

| # | Task | Sprint work | Connection to Phase 1 |
| --- | --- | --- | --- |
| 1 | Message component | Render user and assistant messages. | Presents recommendations, explanations, and contact details clearly. |
| 2 | Sidebar component | List conversations and select or start a chat. | Helps staff return to a resource search and compare options. |
| 3 | Input component | Let staff send a question or follow-up. | Supports natural-language needs and refinements. |
| 4 | Chat API | Define frontend requests and backend endpoints for chats and messages. | Connects the staff interface to search and response logic. |
| 5 | Chat logic | Coordinate history, agent calls, and responses. | Provides the flow needed for follow-up questions. |
| 6 | Persistence | Save chats and messages in Supabase. | Supports conversation continuity for follow-up questions. |
| 7 | Simple agent | Build a system prompt with fictional resources and call an LLM. | Tests the answer format before connecting the real service catalog. |

The starting signatures are in `apps/web/src/components/`, `apps/web/src/lib/api.ts`, and `apps/api/app/{routers,services,repositories}/`. Request and response shapes are in `apps/api/app/schemas/chats.py`.

## Sprint completion target

A developer should be able to start a chat, ask about the fictional resources, receive a reply based on that data, ask a follow-up, and reopen the conversation after a refresh. The demo should show when the fictional data does not contain an answer. 
