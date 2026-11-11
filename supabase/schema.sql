-- COGNIVIA initial schema. Run in the Supabase SQL Editor after creating a project.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.exercise_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_key text not null,
  score integer not null default 0 check (score >= 0),
  accuracy numeric(5,2) check (accuracy is null or (accuracy >= 0 and accuracy <= 100)),
  duration_ms integer check (duration_ms is null or duration_ms >= 0),
  completed_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists exercise_sessions_user_completed_idx
  on public.exercise_sessions (user_id, completed_at desc);

alter table public.profiles enable row level security;
alter table public.exercise_sessions enable row level security;

create policy "Users can read their own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "Users can insert their own profile"
  on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Users can read their own exercise sessions"
  on public.exercise_sessions for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own exercise sessions"
  on public.exercise_sessions for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own exercise sessions"
  on public.exercise_sessions for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own exercise sessions"
  on public.exercise_sessions for delete to authenticated
  using ((select auth.uid()) = user_id);
