-- Chat persistence tables (Task 6), matching the live Supabase project.
-- Requires the existing `people` table, which chats.person_id references.

create table public.chats (
  chat_id uuid primary key default gen_random_uuid(),
  -- Empty until staff profiles exist.
  person_id uuid references public.people (person_id),
  -- Holds the chat title for now.
  description text,
  -- When the chat started.
  time_stamp timestamptz not null default now(),
  -- When the last message was sent.
  last_updated timestamptz not null default now()
);

create table public.messages (
  message_id uuid primary key default gen_random_uuid(),
  -- Deleting a chat deletes its messages.
  chat_id uuid not null
    constraint messages_chat_id_fkey references public.chats (chat_id) on delete cascade,
  -- true = sent by the agent, false = sent by staff.
  is_agent boolean not null,
  -- Orders messages within a chat.
  time_stamp timestamptz not null default now(),
  content text not null
);

-- Opening a chat loads its messages in time order.
create index messages_chat_id_time_stamp_idx on public.messages (chat_id, time_stamp);
-- The sidebar lists the most recently updated chats first.
create index chats_last_updated_idx on public.chats (last_updated desc);
