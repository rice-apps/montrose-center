# Architecture

## Responsibilities

- Next.js and TypeScript: public, staff, and admin interfaces.
- Supabase Auth: planned staff authentication.
- FastAPI: API validation, authorization, business rules, and reporting.
- Supabase Postgres: persistent data, constraints, and row-level security.
- Pydantic: request and response schemas.
- Pydantic AI: optional assistant, added after core workflows.

## Request flow

1. A visitor browses public pages; staff sign in through Supabase Auth.
2. Next.js calls FastAPI, attaching an access token to protected requests.
3. FastAPI validates the token, payload, and permission for the operation.
4. Business services call repositories to read or write Supabase Postgres.
5. FastAPI returns an explicit response model for the UI.

Keep business rules in FastAPI. Use user-scoped database access where appropriate; privileged credentials bypass RLS and require explicit backend authorization. Route names alone are not access controls.

The optional assistant should call narrowly permitted backend tools. It must not independently decide eligibility or receive sensitive records by default.

## Implementation status

This repository is a descriptive scaffold. Authentication, endpoints, database schema, UI, and agent behavior are not implemented.
