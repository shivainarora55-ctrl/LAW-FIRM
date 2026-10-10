-- =====================================================================
-- Law firm site: complete Supabase schema (run ONCE in SQL Editor)
-- Paste the whole file into a NEW query and click Run.
-- No secrets in this file: safe to commit to GitHub (supabase/schema.sql).
-- =====================================================================

-- ---------- PART A: tables, functions, indexes ----------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  password_hash text not null,
  email_verified_at timestamptz,
  address text,
  city text,
  state text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index users_email_key on public.users (lower(email));

create table public.email_otps (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  code_hash text not null,
  attempts int not null default 0,
  expires_at timestamptz not null,
  last_sent_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index email_otps_email_idx on public.email_otps (lower(email));

create table public.admins (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  role text not null default 'lawyer' check (role in ('lawyer')),
  password_hash text not null,
  created_at timestamptz not null default now()
);
create unique index admins_email_key on public.admins (lower(email));

create table public.matter_counters (
  year int primary key,
  last_number int not null default 0
);

create or replace function public.next_matter_ref()
returns text
language plpgsql
set search_path = ''
as $$
declare
  y int := extract(year from now())::int;
  n int;
begin
  insert into public.matter_counters (year, last_number)
  values (y, 1)
  on conflict (year) do update
    set last_number = public.matter_counters.last_number + 1
  returning last_number into n;
  return 'LF-' || y || '-' || lpad(n::text, 4, '0');
end;
$$;

create table public.matters (
  id uuid primary key default gen_random_uuid(),
  ref text not null unique default public.next_matter_ref(),
  user_id uuid not null references public.users(id) on delete restrict,
  title text not null check (char_length(title) between 5 and 120),
  practice_area text not null,
  description text not null check (char_length(description) between 20 and 3000),
  urgency text not null default 'normal' check (urgency in ('normal','urgent')),
  preferred_contact text not null default 'phone' check (preferred_contact in ('phone','email')),
  opposing_party text,
  status text not null default 'submitted'
    check (status in ('submitted','under-review','accepted','in-progress','on-hold','closed','declined')),
  assigned_to uuid references public.admins(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.matter_status_history (
  id uuid primary key default gen_random_uuid(),
  matter_id uuid not null references public.matters(id) on delete cascade,
  status text not null,
  admin_id uuid references public.admins(id) on delete set null,
  at timestamptz not null default now()
);

create table public.matter_updates (
  id uuid primary key default gen_random_uuid(),
  matter_id uuid not null references public.matters(id) on delete cascade,
  text text not null,
  author_name text not null,
  created_at timestamptz not null default now()
);

create table public.requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete restrict,
  matter_id uuid references public.matters(id) on delete set null,
  type text not null check (type in ('callback','consultation','status-update','document')),
  message text not null check (char_length(message) between 10 and 1000),
  status text not null default 'open' check (status in ('open','in-progress','resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.request_replies (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  text text not null,
  author_name text not null,
  created_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete restrict,
  matter_id uuid references public.matters(id) on delete set null,
  original_name text not null,
  storage_path text not null unique,
  mime_type text not null,
  size_bytes int not null check (size_bytes > 0 and size_bytes <= 4194304),
  uploaded_by text not null default 'client' check (uploaded_by in ('client','firm')),
  uploaded_by_admin_id uuid references public.admins(id) on delete set null,
  shared_with_client boolean not null default true,
  uploaded_at timestamptz not null default now()
);

create extension if not exists btree_gist with schema extensions;

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.users(id) on delete restrict,
  matter_id uuid references public.matters(id) on delete set null,
  admin_id uuid not null references public.admins(id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  duration_min int not null check (duration_min in (30, 45, 60)),
  mode text not null check (mode in ('in-person','phone','video')),
  location text,
  notes text,
  status text not null default 'scheduled' check (status in ('scheduled','completed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint appointments_ends_after_start check (ends_at > starts_at),
  constraint appointments_no_overlap exclude using gist (
    admin_id with =,
    tstzrange(starts_at, ends_at) with &&
  ) where (status = 'scheduled')
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.users(id) on delete cascade,
  matter_id uuid references public.matters(id) on delete cascade,
  admin_id uuid references public.admins(id) on delete set null,
  text text not null,
  created_at timestamptz not null default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  type text not null check (type in ('Article','Blog')),
  excerpt text not null check (char_length(excerpt) <= 200),
  body text not null,
  cover_image text,
  status text not null default 'draft' check (status in ('draft','published')),
  author_id uuid references public.admins(id) on delete set null,
  author_name text not null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.admins(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id text,
  at timestamptz not null default now()
);

create index matters_user_idx on public.matters (user_id);
create index matters_status_idx on public.matters (status);
create index matter_updates_matter_idx on public.matter_updates (matter_id);
create index matter_history_matter_idx on public.matter_status_history (matter_id);
create index requests_user_idx on public.requests (user_id);
create index requests_status_idx on public.requests (status);
create index request_replies_request_idx on public.request_replies (request_id);
create index documents_user_idx on public.documents (user_id);
create index documents_matter_idx on public.documents (matter_id);
create index appointments_client_idx on public.appointments (client_id);
create index appointments_starts_idx on public.appointments (starts_at);
create index notes_client_idx on public.notes (client_id);
create index posts_published_idx on public.posts (status, published_at desc);

create trigger users_set_updated before update on public.users
  for each row execute function public.set_updated_at();
create trigger matters_set_updated before update on public.matters
  for each row execute function public.set_updated_at();
create trigger requests_set_updated before update on public.requests
  for each row execute function public.set_updated_at();
create trigger appointments_set_updated before update on public.appointments
  for each row execute function public.set_updated_at();
create trigger posts_set_updated before update on public.posts
  for each row execute function public.set_updated_at();

-- ---------- PART B: lock the database down (server-only access) ----------

do $$
declare t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke execute on all functions in schema public from public, anon, authenticated;

grant usage on schema public to service_role;
grant select, insert, update, delete on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;

alter default privileges for role postgres in schema public
  grant select, insert, update, delete on tables to service_role;
alter default privileges for role postgres in schema public
  grant usage, select on sequences to service_role;

-- ---------- PART C: private file storage buckets ----------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('documents', 'documents', false, 4194304,
    array['application/pdf','application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/jpeg','image/png']),
  ('blog-images', 'blog-images', false, 2097152,
    array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

-- ---------- CHECK (run after the above succeeds) ----------
-- select tablename, rowsecurity from pg_tables where schemaname = 'public' order by 1;
-- select id, public from storage.buckets;
