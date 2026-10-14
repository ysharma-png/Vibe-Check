-- ==============================================================================
-- Migration: 20261013000004_demo_flag.sql
-- Description: Adds is_demo metadata flag to profiles, portfolio_items,
-- and creative_briefs to support idempotent seed dataset management
-- and subtle UI demo badging.
-- ==============================================================================

alter table if exists public.profiles
  add column if not exists is_demo boolean not null default false,
  add column if not exists skills text[] default array[]::text[];

alter table if exists public.portfolio_items
  add column if not exists is_demo boolean not null default false,
  add column if not exists view_count integer default 0;

alter table if exists public.creative_briefs
  add column if not exists is_demo boolean not null default false;

alter table if exists public.proposals
  add column if not exists is_demo boolean not null default false;

alter table if exists public.engagements
  add column if not exists is_demo boolean not null default false;

-- Indexes for rapid selective wiping of synthetic demo accounts
create index if not exists idx_profiles_is_demo on public.profiles(is_demo);
create index if not exists idx_portfolio_items_is_demo on public.portfolio_items(is_demo);
create index if not exists idx_creative_briefs_is_demo on public.creative_briefs(is_demo);
