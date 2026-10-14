-- ==============================================================================
-- Migration: 20261013000005_creator_ingestion_and_compliance.sql
-- Description: Adds tables and columns for compliant creator-owned media import,
-- unclaimed discovered creator profiles, immutable ingestion logs,
-- opt-out suppression list, single-invite rate limits, and DSAR requests.
-- ==============================================================================

-- 1. Extend Portfolio Items with Import & Embed Provenance
alter table if exists public.portfolio_items
  add column if not exists is_imported boolean not null default false,
  add column if not exists source_url text,
  add column if not exists platform text,
  add column if not exists embed_url text,
  add column if not exists attribution jsonb default '{}'::jsonb;

-- 2. Extend Profiles with Claimed/Discovered Status
alter table if exists public.profiles
  add column if not exists is_claimed boolean not null default true,
  add column if not exists claim_status text check (claim_status in ('unclaimed', 'pending_verification', 'claimed')) default 'claimed',
  add column if not exists claim_verification_code text,
  add column if not exists source_platform text,
  add column if not exists source_profile_url text;

create index if not exists idx_profiles_is_claimed on public.profiles(is_claimed);
create index if not exists idx_profiles_claim_status on public.profiles(claim_status);

-- 3. Ingestion Logs Table (GDPR Art. 30 Records of Processing Activities)
create table if not exists public.ingestion_logs (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  timestamp timestamptz not null default now(),
  legal_basis text not null,
  admin_id text not null,
  target_handle text not null,
  records_count integer not null default 0,
  metadata jsonb default '{}'::jsonb
);

alter table public.ingestion_logs enable row level security;

-- Admin read-only policy for ingestion logs; append-only
create policy "Admins can view ingestion logs"
  on public.ingestion_logs for select
  using (public.is_admin());

create policy "System and admins can append ingestion logs"
  on public.ingestion_logs for insert
  with check (auth.role() = 'service_role' or public.is_admin());

-- 4. Permanent Suppression List (GDPR Art. 21 Right to Object)
create table if not exists public.suppression_list (
  id uuid primary key default gen_random_uuid(),
  identity_hash text not null unique,
  source_platform text not null,
  source_profile_url text not null,
  opt_out_timestamp timestamptz not null default now(),
  reason text not null default 'creator_opt_out',
  status text not null default 'suppressed'
);

alter table public.suppression_list enable row level security;

create policy "Admins and service role can manage suppression list"
  on public.suppression_list for all
  using (auth.role() = 'service_role' or public.is_admin());

create policy "Public can check suppression status via function"
  on public.suppression_list for select
  using (true);

-- 5. Creator Outreach & Invitation Rate Limiting (Strict 1 Invite Ever)
create table if not exists public.creator_invitations (
  id uuid primary key default gen_random_uuid(),
  creator_profile_id text not null unique,
  target_contact_channel text not null,
  invite_token text not null unique,
  sent_at timestamptz not null default now(),
  status text not null default 'sent' check (status in ('sent', 'accepted', 'declined')),
  last_activity_at timestamptz default now()
);

alter table public.creator_invitations enable row level security;

create policy "Admins can manage creator invitations"
  on public.creator_invitations for all
  using (auth.role() = 'service_role' or public.is_admin());

-- 6. Data Subject Access Requests (DSAR: GDPR Art. 15, 16, 17)
create table if not exists public.dsar_requests (
  id uuid primary key default gen_random_uuid(),
  requester_email text not null,
  request_type text not null check (request_type in ('access', 'rectification', 'erasure')),
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed')),
  details text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.dsar_requests enable row level security;

create policy "Admins can manage DSAR requests"
  on public.dsar_requests for all
  using (auth.role() = 'service_role' or public.is_admin());

create policy "Users can insert DSAR requests"
  on public.dsar_requests for insert
  with check (true);
