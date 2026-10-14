-- ==============================================================================
-- Security Enhancements, Audit Logging, and Privilege Escalation Guards
-- ==============================================================================

-- 1. Immutable Audit Log Table
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  actor_role public.user_role not null default 'creator',
  action text not null,
  target_type text not null,
  target_id text not null,
  before_state jsonb,
  after_state jsonb,
  ip_hash text not null default 'anonymous',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.audit_logs enable row level security;

-- Admin read-only access to audit logs
create policy "Admins can view audit logs"
  on public.audit_logs for select
  using (public.is_admin());

-- System insert policy
create policy "System can insert audit logs"
  on public.audit_logs for insert
  with check (true);

-- No update or delete policies (immutable audit trail)

-- 2. Verification Requests Table
create table if not exists public.verification_requests (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  request_type text not null check (request_type in ('identity', 'deterministic_pipeline', 'commercial_clearance')),
  evidence_notes text not null default '',
  evidence_urls text[] default array[]::text[],
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  review_notes text default '',
  created_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.verification_requests enable row level security;

create policy "Creators can view their own verification requests"
  on public.verification_requests for select
  using (auth.uid() = creator_id or public.is_admin());

create policy "Creators can submit verification requests"
  on public.verification_requests for insert
  with check (auth.uid() = creator_id or public.is_admin());

create policy "Admins can update verification requests"
  on public.verification_requests for update
  using (public.is_admin())
  with check (public.is_admin());

-- 3. Active Sessions Tracking Table
create table if not exists public.user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  user_agent text not null default 'Unknown Device',
  ip_hash text not null default 'anonymous',
  last_active_at timestamptz default timezone('utc'::text, now()) not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.user_sessions enable row level security;

create policy "Users can view their own sessions"
  on public.user_sessions for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Users can delete their own sessions"
  on public.user_sessions for delete
  using (auth.uid() = user_id or public.is_admin());

-- 4. Soft Delete Column on Profiles
alter table public.profiles
  add column if not exists deleted_at timestamptz;

-- 5. Privilege Escalation Prevention Trigger
create or replace function public.prevent_privilege_escalation()
returns trigger as $$
begin
  -- If not an admin, block any changes to role, verified badges, or portfolio score
  if not public.is_admin() then
    if new.role is distinct from old.role then
      raise exception 'Privilege escalation rejected: users cannot modify their own role.';
    end if;

    if new.verified_identity is distinct from old.verified_identity or
       new.deterministic_pipeline is distinct from old.deterministic_pipeline or
       new.commercial_clearance_cleared is distinct from old.commercial_clearance_cleared then
      raise exception 'Permission denied: verification badges can only be granted by platform administrators.';
    end if;

    if new.portfolio_score is distinct from old.portfolio_score then
      raise exception 'Permission denied: portfolio trust score is computed server-side only.';
    end if;
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_prevent_privilege_escalation on public.profiles;

create trigger trg_prevent_privilege_escalation
  before update on public.profiles
  for each row execute function public.prevent_privilege_escalation();
