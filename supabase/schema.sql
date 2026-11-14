-- AI Risk Competency app: one table holds every record (week progress, ratings, review items...).
-- Run once in Supabase: SQL Editor > New query > paste > Run.

create table if not exists public.app_records (
  user_id           uuid        not null default auth.uid() references auth.users(id) on delete cascade,
  id                text        not null,
  data              jsonb       not null default '{}'::jsonb,
  updated_at        timestamptz not null,                 -- when the record was edited (set by the device)
  deleted           boolean     not null default false,
  server_updated_at timestamptz not null default now(),   -- when the server received it (used for pulling changes)
  primary key (user_id, id)
);

create index if not exists app_records_user_server_updated
  on public.app_records (user_id, server_updated_at);

-- Keep server_updated_at accurate on every write.
create or replace function public.app_records_touch()
returns trigger language plpgsql as $$
begin
  new.server_updated_at := now();
  return new;
end $$;

drop trigger if exists app_records_touch on public.app_records;
create trigger app_records_touch
  before insert or update on public.app_records
  for each row execute function public.app_records_touch();

-- Row-level security: each signed-in user can only see and change their own rows.
alter table public.app_records enable row level security;

drop policy if exists "own rows: select" on public.app_records;
drop policy if exists "own rows: insert" on public.app_records;
drop policy if exists "own rows: update" on public.app_records;
drop policy if exists "own rows: delete" on public.app_records;

create policy "own rows: select" on public.app_records for select to authenticated using (auth.uid() = user_id);
create policy "own rows: insert" on public.app_records for insert to authenticated with check (auth.uid() = user_id);
create policy "own rows: update" on public.app_records for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows: delete" on public.app_records for delete to authenticated using (auth.uid() = user_id);
