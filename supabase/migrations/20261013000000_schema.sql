-- ==============================================================================
-- CacheFlow / CreatorLoom Supabase Schema Migration
-- Complete relational model, enums, constraints, indexes, triggers, RLS, and RPC
-- ==============================================================================

-- 1. Enable Required Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. Custom Enumerations
do $$ begin
  create type public.user_role as enum ('creator', 'brand', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.aspect_ratio as enum ('9:16', '16:9', '1:1', '4:5', '21:9');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.reproducibility_kind as enum ('verified_deterministic', 'partially_reproducible', 'exploratory');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.commercial_clearance_status as enum ('cleared', 'flagged', 'pending_review');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.brief_status as enum ('draft', 'published', 'in_review', 'awarded', 'completed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.base_model_policy as enum ('indemnified_only', 'permissive_open', 'any_commercial');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.proposal_status as enum ('submitted', 'shortlisted', 'accepted', 'declined');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.engagement_status as enum ('active', 'in_review', 'completed', 'disputed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.milestone_status as enum ('pending', 'in_progress', 'submitted', 'approved', 'paid');
exception when duplicate_object then null; end $$;

-- 3. Core Tables

-- 3.1 Profiles Table (Extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'creator',
  email text not null unique,
  full_name text not null,
  display_name text not null,
  handle text not null unique,
  avatar_url text,
  avatar_gradient jsonb default '["#8B93FF", "#06B6D4"]'::jsonb,
  bio text default '',
  location text default '',
  website text,
  verified_identity boolean default false,
  deterministic_pipeline boolean default false,
  commercial_clearance_cleared boolean default false,
  rating numeric(3, 2) default 5.00 check (rating between 1.00 and 5.00),
  review_count integer default 0 check (review_count >= 0),
  completed_projects integer default 0 check (completed_projects >= 0),
  repeat_hire_rate integer default 0 check (repeat_hire_rate between 0 and 100),
  hourly_rate_usd numeric(10, 2) default 100.00 check (hourly_rate_usd >= 0),
  day_rate_usd numeric(10, 2) default 800.00 check (day_rate_usd >= 0),
  primary_tools text[] default array[]::text[],
  specializations text[] default array[]::text[],
  portfolio_score integer default 0,
  tsv tsvector,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 3.2 Portfolio Items Table
create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text default '',
  aspect_ratio public.aspect_ratio not null default '16:9',
  video_url text,
  thumbnail_url text,
  poster_gradient jsonb default '["#16161A", "#8B93FF"]'::jsonb,
  base_models text[] default array[]::text[],
  tools text[] default array[]::text[],
  reproducibility_score integer default 100 check (reproducibility_score between 0 and 100),
  reproducibility_kind public.reproducibility_kind not null default 'verified_deterministic',
  commercial_clearance_status public.commercial_clearance_status not null default 'cleared',
  copyrighted_ip_scan text not null default 'clean' check (copyrighted_ip_scan in ('clean', 'flagged')),
  node_graph_data jsonb not null default '{}'::jsonb,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 3.3 Pipeline Stages Table
create table if not exists public.pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  portfolio_item_id uuid not null references public.portfolio_items(id) on delete cascade,
  stage_order integer not null check (stage_order >= 0),
  stage_name text not null,
  tool_name text not null,
  model_hash text not null,
  seed bigint not null,
  prompt text not null,
  negative_prompt text default '',
  lora_weights jsonb default '[]'::jsonb,
  duration_sec numeric(6, 2) default 0.00,
  cost_usd numeric(6, 2) default 0.00,
  output_preview_gradient jsonb default '["#16161A", "#8B93FF"]'::jsonb,
  output_preview_caption text default '',
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 3.4 Creative Briefs Table
create table if not exists public.creative_briefs (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.profiles(id) on delete cascade,
  brand_name text not null,
  brand_avatar text,
  brand_avatar_gradient jsonb default '["#16161A", "#8B93FF"]'::jsonb,
  title text not null,
  description text not null,
  objective text default '',
  target_audience text default '',
  aspect_ratios text[] not null,
  duration_sec integer not null default 30,
  budget_min numeric(10, 2) not null check (budget_min >= 0),
  budget_max numeric(10, 2) not null check (budget_max >= budget_min),
  currency text default 'USD',
  deadline text not null,
  status public.brief_status not null default 'published',
  base_model_policy public.base_model_policy not null default 'any_commercial',
  required_tools text[] default array[]::text[],
  negative_constraints jsonb default '[]'::jsonb,
  deliverables jsonb default '[]'::jsonb,
  milestones jsonb default '[]'::jsonb,
  proposal_count integer default 0 check (proposal_count >= 0),
  tsv tsvector,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 3.5 Proposals Table
create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  brief_id uuid not null references public.creative_briefs(id) on delete cascade,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  pitch_text text not null,
  proposed_budget numeric(10, 2) not null check (proposed_budget > 0),
  proposed_timeline_days integer not null check (proposed_timeline_days > 0),
  portfolio_item_ids uuid[] default array[]::uuid[],
  milestone_breakdown jsonb default '[]'::jsonb,
  status public.proposal_status not null default 'submitted',
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,
  unique (brief_id, creator_id)
);

-- 3.6 Engagements Table
create table if not exists public.engagements (
  id uuid primary key default gen_random_uuid(),
  brief_id uuid references public.creative_briefs(id) on delete set null,
  proposal_id uuid references public.proposals(id) on delete set null,
  brand_id uuid not null references public.profiles(id),
  creator_id uuid not null references public.profiles(id),
  title text not null,
  total_amount numeric(10, 2) not null check (total_amount >= 0),
  escrow_funded numeric(10, 2) not null default 0.00 check (escrow_funded >= 0),
  status public.engagement_status not null default 'active',
  current_milestone_index integer default 0 check (current_milestone_index >= 0),
  milestones jsonb default '[]'::jsonb,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 3.7 Engagement Messages Table
create table if not exists public.engagement_messages (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  sender_id uuid not null references public.profiles(id),
  message text not null,
  attachments text[] default array[]::text[],
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 4. Indexes (B-tree, GIN for arrays, and GIN for tsvectors)

-- B-Tree foreign key & query indexes
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_rating on public.profiles(rating desc);
create index if not exists idx_profiles_hourly_rate on public.profiles(hourly_rate_usd);
create index if not exists idx_portfolio_creator_id on public.portfolio_items(creator_id);
create index if not exists idx_pipeline_stages_item_id on public.pipeline_stages(portfolio_item_id, stage_order);
create index if not exists idx_briefs_brand_id on public.creative_briefs(brand_id);
create index if not exists idx_briefs_status on public.creative_briefs(status);
create index if not exists idx_proposals_brief_id on public.proposals(brief_id);
create index if not exists idx_proposals_creator_id on public.proposals(creator_id);
create index if not exists idx_engagements_brand_id on public.engagements(brand_id);
create index if not exists idx_engagements_creator_id on public.engagements(creator_id);
create index if not exists idx_engagements_status on public.engagements(status);
create index if not exists idx_messages_engagement on public.engagement_messages(engagement_id, created_at);

-- GIN Indexes for array filtering
create index if not exists idx_profiles_primary_tools_gin on public.profiles using gin (primary_tools);
create index if not exists idx_profiles_specializations_gin on public.profiles using gin (specializations);
create index if not exists idx_portfolio_tools_gin on public.portfolio_items using gin (tools);
create index if not exists idx_portfolio_base_models_gin on public.portfolio_items using gin (base_models);
create index if not exists idx_briefs_aspect_ratios_gin on public.creative_briefs using gin (aspect_ratios);
create index if not exists idx_briefs_required_tools_gin on public.creative_briefs using gin (required_tools);

-- GIN Indexes for Full-Text Search
create index if not exists idx_profiles_tsv_gin on public.profiles using gin (tsv);
create index if not exists idx_briefs_tsv_gin on public.creative_briefs using gin (tsv);

-- 5. Helper Functions & Triggers

-- 5.1 Updated At Trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create or replace trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace trigger trg_portfolio_items_updated_at
  before update on public.portfolio_items
  for each row execute function public.set_updated_at();

create or replace trigger trg_creative_briefs_updated_at
  before update on public.creative_briefs
  for each row execute function public.set_updated_at();

create or replace trigger trg_proposals_updated_at
  before update on public.proposals
  for each row execute function public.set_updated_at();

create or replace trigger trg_engagements_updated_at
  before update on public.engagements
  for each row execute function public.set_updated_at();

-- 5.2 Tsvector Update Trigger for Profiles
create or replace function public.update_profiles_tsv()
returns trigger as $$
begin
  new.tsv = setweight(to_tsvector('english', coalesce(new.display_name, '')), 'A') ||
            setweight(to_tsvector('english', coalesce(new.handle, '')), 'A') ||
            setweight(to_tsvector('english', coalesce(new.full_name, '')), 'B') ||
            setweight(to_tsvector('english', array_to_string(coalesce(new.specializations, '{}'::text[]), ' ')), 'B') ||
            setweight(to_tsvector('english', array_to_string(coalesce(new.primary_tools, '{}'::text[]), ' ')), 'C') ||
            setweight(to_tsvector('english', coalesce(new.bio, '') || ' ' || coalesce(new.location, '')), 'D');
  return new;
end;
$$ language plpgsql;

create or replace trigger trg_profiles_tsv
  before insert or update on public.profiles
  for each row execute function public.update_profiles_tsv();

-- 5.3 Tsvector Update Trigger for Creative Briefs
create or replace function public.update_briefs_tsv()
returns trigger as $$
begin
  new.tsv = setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
            setweight(to_tsvector('english', coalesce(new.brand_name, '')), 'B') ||
            setweight(to_tsvector('english', array_to_string(coalesce(new.required_tools, '{}'::text[]), ' ')), 'B') ||
            setweight(to_tsvector('english', coalesce(new.description, '') || ' ' || coalesce(new.objective, '') || ' ' || coalesce(new.target_audience, '')), 'C');
  return new;
end;
$$ language plpgsql;

create or replace trigger trg_briefs_tsv
  before insert or update on public.creative_briefs
  for each row execute function public.update_briefs_tsv();

-- 5.4 Portfolio Score Recompute Trigger
create or replace function public.recompute_creator_portfolio_score()
returns trigger as $$
declare
  target_creator_id uuid;
  avg_repro numeric;
  cleared_count integer;
  item_count integer;
  final_score integer;
begin
  if (tg_op = 'DELETE') then
    target_creator_id := old.creator_id;
  else
    target_creator_id := new.creator_id;
  end if;

  select
    coalesce(avg(reproducibility_score), 0),
    count(*) filter (where commercial_clearance_status = 'cleared' and copyrighted_ip_scan = 'clean'),
    count(*)
  into avg_repro, cleared_count, item_count
  from public.portfolio_items
  where creator_id = target_creator_id;

  if item_count = 0 then
    final_score := 0;
  else
    -- Composite formula: 60% reproducibility average + 25% cleared proportion + 15% item count bonus (capped at 10 items)
    final_score := round(
      (avg_repro * 0.60) +
      ((cleared_count::numeric / item_count::numeric) * 100 * 0.25) +
      (least(item_count, 10)::numeric * 1.5)
    );
  end if;

  update public.profiles
  set portfolio_score = final_score
  where id = target_creator_id;

  return null;
end;
$$ language plpgsql;

create or replace trigger trg_recompute_portfolio_score
  after insert or update or delete on public.portfolio_items
  for each row execute function public.recompute_creator_portfolio_score();

-- 5.5 Proposal Count Trigger on Creative Briefs
create or replace function public.update_brief_proposal_count()
returns trigger as $$
declare
  target_brief_id uuid;
begin
  if (tg_op = 'DELETE') then
    target_brief_id := old.brief_id;
  else
    target_brief_id := new.brief_id;
  end if;

  update public.creative_briefs
  set proposal_count = (
    select count(*) from public.proposals where brief_id = target_brief_id
  )
  where id = target_brief_id;

  return null;
end;
$$ language plpgsql;

create or replace trigger trg_proposal_count
  after insert or delete on public.proposals
  for each row execute function public.update_brief_proposal_count();

-- 6. Row Level Security (RLS) Policies

alter table public.profiles enable row level security;
alter table public.portfolio_items enable row level security;
alter table public.pipeline_stages enable row level security;
alter table public.creative_briefs enable row level security;
alter table public.proposals enable row level security;
alter table public.engagements enable row level security;
alter table public.engagement_messages enable row level security;

-- Helper function to check if current user is admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- 6.1 Profiles Policies
-- Public can read all published creator profiles, users can see their own profile, admin can see all
create policy "Profiles are viewable by public or owner"
  on public.profiles for select
  using (
    role = 'creator'
    or auth.uid() = id
    or public.is_admin()
  );

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

-- 6.2 Portfolio Items Policies
-- Public read for all portfolio items
create policy "Portfolio items are viewable by everyone"
  on public.portfolio_items for select
  using (true);

-- Creators can only insert, update, delete their own portfolio items
create policy "Creators can insert their own portfolio items"
  on public.portfolio_items for insert
  with check (auth.uid() = creator_id or public.is_admin());

create policy "Creators can update their own portfolio items"
  on public.portfolio_items for update
  using (auth.uid() = creator_id or public.is_admin())
  with check (auth.uid() = creator_id or public.is_admin());

create policy "Creators can delete their own portfolio items"
  on public.portfolio_items for delete
  using (auth.uid() = creator_id or public.is_admin());

-- 6.3 Pipeline Stages Policies
-- Public read
create policy "Pipeline stages are viewable by everyone"
  on public.pipeline_stages for select
  using (true);

-- Creators can modify stages belonging to their own portfolio items
create policy "Creators can manage stages of their items"
  on public.pipeline_stages for insert
  with check (
    exists (
      select 1 from public.portfolio_items
      where id = portfolio_item_id and creator_id = auth.uid()
    ) or public.is_admin()
  );

create policy "Creators can update stages of their items"
  on public.pipeline_stages for update
  using (
    exists (
      select 1 from public.portfolio_items
      where id = portfolio_item_id and creator_id = auth.uid()
    ) or public.is_admin()
  );

create policy "Creators can delete stages of their items"
  on public.pipeline_stages for delete
  using (
    exists (
      select 1 from public.portfolio_items
      where id = portfolio_item_id and creator_id = auth.uid()
    ) or public.is_admin()
  );

-- 6.4 Creative Briefs Policies
-- Public can read published briefs; brands can read their own drafts; admin can read all
create policy "Published briefs are viewable by public"
  on public.creative_briefs for select
  using (
    status = 'published'
    or auth.uid() = brand_id
    or public.is_admin()
  );

-- Brands can insert and edit only their own briefs
create policy "Brands can insert their own briefs"
  on public.creative_briefs for insert
  with check (auth.uid() = brand_id or public.is_admin());

create policy "Brands can update their own briefs"
  on public.creative_briefs for update
  using (auth.uid() = brand_id or public.is_admin())
  with check (auth.uid() = brand_id or public.is_admin());

create policy "Brands can delete their own briefs"
  on public.creative_briefs for delete
  using (auth.uid() = brand_id or public.is_admin());

-- 6.5 Proposals Policies
-- Creators view their own; brands view proposals submitted to their briefs; admin can view all
create policy "Proposals viewable by creator or brief owner"
  on public.proposals for select
  using (
    auth.uid() = creator_id
    or exists (
      select 1 from public.creative_briefs
      where id = brief_id and brand_id = auth.uid()
    )
    or public.is_admin()
  );

create policy "Creators can insert proposals"
  on public.proposals for insert
  with check (auth.uid() = creator_id or public.is_admin());

create policy "Creators can update their own proposals"
  on public.proposals for update
  using (auth.uid() = creator_id or public.is_admin())
  with check (auth.uid() = creator_id or public.is_admin());

-- 6.6 Engagements Policies
-- Only participants (brand and creator) or admin can view engagement
create policy "Engagements visible only to participants"
  on public.engagements for select
  using (
    auth.uid() = brand_id
    or auth.uid() = creator_id
    or public.is_admin()
  );

create policy "Participants can update engagements"
  on public.engagements for update
  using (
    auth.uid() = brand_id
    or auth.uid() = creator_id
    or public.is_admin()
  );

-- 6.7 Engagement Messages Policies
-- Visible only to the engagement participants
create policy "Messages viewable by engagement participants"
  on public.engagement_messages for select
  using (
    exists (
      select 1 from public.engagements
      where id = engagement_id and (brand_id = auth.uid() or creator_id = auth.uid())
    ) or public.is_admin()
  );

create policy "Participants can insert messages"
  on public.engagement_messages for insert
  with check (
    auth.uid() = sender_id
    and (
      exists (
        select 1 from public.engagements
        where id = engagement_id and (brand_id = auth.uid() or creator_id = auth.uid())
      ) or public.is_admin()
    )
  );

-- 7. Search RPC: search_creators
create or replace function public.search_creators(
  filters jsonb default '{}'::jsonb,
  sort text default 'relevance',
  page int default 1,
  page_size int default 12
)
returns table (
  id uuid,
  handle text,
  display_name text,
  full_name text,
  avatar_url text,
  avatar_gradient jsonb,
  bio text,
  location text,
  rating numeric,
  review_count integer,
  completed_projects integer,
  repeat_hire_rate integer,
  hourly_rate_usd numeric,
  day_rate_usd numeric,
  primary_tools text[],
  specializations text[],
  verified_identity boolean,
  deterministic_pipeline boolean,
  commercial_clearance_cleared boolean,
  portfolio_score integer,
  matched_skill_count integer,
  verified_tool_count integer,
  relevance_rank real,
  top_portfolio_thumbnails jsonb,
  total_count bigint
) as $$
declare
  v_query text := trim(coalesce(filters->>'query', ''));
  v_tools text[] := array(select jsonb_array_elements_text(coalesce(filters->'tools', '[]'::jsonb)));
  v_specs text[] := array(select jsonb_array_elements_text(coalesce(filters->'specializations', '[]'::jsonb)));
  v_verified_identity boolean := (filters->>'verified_identity')::boolean;
  v_deterministic boolean := (filters->>'deterministic_pipeline')::boolean;
  v_commercial boolean := (filters->>'commercial_clearance_cleared')::boolean;
  v_max_rate numeric := (filters->>'max_hourly_rate')::numeric;
  v_min_rating numeric := (filters->>'min_rating')::numeric;
  v_offset int := greatest(0, (page - 1) * page_size);
begin
  return query
  with filtered_creators as (
    select
      p.id as c_id,
      p.handle as c_handle,
      p.display_name as c_display_name,
      p.full_name as c_full_name,
      p.avatar_url as c_avatar_url,
      p.avatar_gradient as c_avatar_gradient,
      p.bio as c_bio,
      p.location as c_location,
      p.rating as c_rating,
      p.review_count as c_review_count,
      p.completed_projects as c_completed_projects,
      p.repeat_hire_rate as c_repeat_hire_rate,
      p.hourly_rate_usd as c_hourly_rate_usd,
      p.day_rate_usd as c_day_rate_usd,
      p.primary_tools as c_primary_tools,
      p.specializations as c_specializations,
      p.verified_identity as c_verified_identity,
      p.deterministic_pipeline as c_deterministic_pipeline,
      p.commercial_clearance_cleared as c_commercial_clearance_cleared,
      p.portfolio_score as c_portfolio_score,
      -- Matched skills count (intersection of creator specializations with filter specializations)
      case
        when cardinality(v_specs) > 0 then
          (select count(*)::int from unnest(p.specializations) s where s = any(v_specs))
        else
          cardinality(p.specializations)
      end as c_matched_skill_count,
      -- Verified tools count (tools matching verified list)
      (select count(*)::int from unnest(p.primary_tools) t where t in ('flux_1_dev', 'comfyui', 'runway_gen3', 'kling_v1_5', 'topaz_video_ai')) as c_verified_tool_count,
      -- Relevance rank calculation
      case
        when v_query <> '' then
          ts_rank_cd(p.tsv, plainto_tsquery('english', v_query))
        else
          (p.rating * 0.4 + (p.portfolio_score::real / 100.0) * 0.6)
      end as c_relevance_rank
    from public.profiles p
    where p.role = 'creator'
      and (v_query = '' or p.tsv @@ plainto_tsquery('english', v_query) or p.display_name ilike '%' || v_query || '%' or p.handle ilike '%' || v_query || '%')
      and (cardinality(v_tools) = 0 or p.primary_tools && v_tools)
      and (cardinality(v_specs) = 0 or p.specializations && v_specs)
      and (v_verified_identity is null or p.verified_identity = v_verified_identity)
      and (v_deterministic is null or p.deterministic_pipeline = v_deterministic)
      and (v_commercial is null or p.commercial_clearance_cleared = v_commercial)
      and (v_max_rate is null or p.hourly_rate_usd <= v_max_rate)
      and (v_min_rating is null or p.rating >= v_min_rating)
  ),
  counted as (
    select count(*) as total from filtered_creators
  ),
  sorted_creators as (
    select
      fc.*,
      cnt.total as full_total_count
    from filtered_creators fc
    cross join counted cnt
    order by
      case when sort = 'rate_asc' then fc.c_hourly_rate_usd end asc,
      case when sort = 'rate_desc' then fc.c_hourly_rate_usd end desc,
      case when sort = 'rating' then fc.c_rating end desc,
      case when sort = 'portfolio_score' then fc.c_portfolio_score end desc,
      case when sort = 'completed_projects' then fc.c_completed_projects end desc,
      fc.c_relevance_rank desc,
      fc.c_portfolio_score desc
    limit page_size
    offset v_offset
  )
  select
    sc.c_id as id,
    sc.c_handle as handle,
    sc.c_display_name as display_name,
    sc.c_full_name as full_name,
    sc.c_avatar_url as avatar_url,
    sc.c_avatar_gradient as avatar_gradient,
    sc.c_bio as bio,
    sc.c_location as location,
    sc.c_rating as rating,
    sc.c_review_count as review_count,
    sc.c_completed_projects as completed_projects,
    sc.c_repeat_hire_rate as repeat_hire_rate,
    sc.c_hourly_rate_usd as hourly_rate_usd,
    sc.c_day_rate_usd as day_rate_usd,
    sc.c_primary_tools as primary_tools,
    sc.c_specializations as specializations,
    sc.c_verified_identity as verified_identity,
    sc.c_deterministic_pipeline as deterministic_pipeline,
    sc.c_commercial_clearance_cleared as commercial_clearance_cleared,
    sc.c_portfolio_score as portfolio_score,
    sc.c_matched_skill_count as matched_skill_count,
    sc.c_verified_tool_count as verified_tool_count,
    sc.c_relevance_rank as relevance_rank,
    -- Top 3 portfolio thumbnails JSON
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', pi.id,
            'title', pi.title,
            'aspect_ratio', pi.aspect_ratio,
            'thumbnail_url', pi.thumbnail_url,
            'video_url', pi.video_url,
            'poster_gradient', pi.poster_gradient
          )
        )
        from (
          select *
          from public.portfolio_items pi_sub
          where pi_sub.creator_id = sc.c_id
          order by pi_sub.reproducibility_score desc, pi_sub.created_at desc
          limit 3
        ) pi
      ),
      '[]'::jsonb
    ) as top_portfolio_thumbnails,
    sc.full_total_count as total_count
  from sorted_creators sc;
end;
$$ language plpgsql stable;
