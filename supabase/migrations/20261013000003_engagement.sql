-- ==============================================================================
-- 20261013000003_engagement.sql
-- Engagement Layer, Personalized Home Feed, Showcase, Notifications,
-- Creator Gamification (Levels & Badges), Follows, and Boards
-- ==============================================================================

-- 1. Extend profiles with gamification and quiet-hours fields
alter table public.profiles
  add column if not exists creator_level text default 'Rising' check (creator_level in ('Rising', 'Pro', 'Elite')),
  add column if not exists badges jsonb default '[]'::jsonb,
  add column if not exists profile_strength_score integer default 65 check (profile_strength_score between 0 and 100),
  add column if not exists median_response_time_min integer default 45 check (median_response_time_min >= 0),
  add column if not exists quiet_hours_enabled boolean default false,
  add column if not exists quiet_hours_start text default '22:00',
  add column if not exists quiet_hours_end text default '08:00',
  add column if not exists quiet_hours_timezone text default 'UTC';

-- 2. Interaction Events Table (Feeds recommendations and tracks views/saves/dismisses)
create table if not exists public.interaction_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  event_type text not null check (event_type in ('view', 'save', 'dismiss', 'like', 'follow', 'unfollow', 'swipe', 'brief_view', 'brief_dismiss', 'board_add', 'showcase_action')),
  target_type text not null check (target_type in ('brief', 'creator', 'portfolio_item', 'workflow', 'board')),
  target_id text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_events_user_type on public.interaction_events (user_id, event_type);
create index if not exists idx_events_target on public.interaction_events (target_type, target_id);
create index if not exists idx_events_created on public.interaction_events (created_at desc);

alter table public.interaction_events enable row level security;

create policy "Users can view own events"
  on public.interaction_events for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Users can insert own events"
  on public.interaction_events for insert
  with check (auth.uid() = user_id or user_id is null or public.is_admin());

-- 3. Follows Table
create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  primary key (follower_id, following_id)
);

create index if not exists idx_follows_following on public.follows (following_id);
create index if not exists idx_follows_follower on public.follows (follower_id);

alter table public.follows enable row level security;

create policy "Follows viewable by everyone"
  on public.follows for select
  using (true);

create policy "Users can follow creators"
  on public.follows for insert
  with check (auth.uid() = follower_id or public.is_admin());

create policy "Users can unfollow creators"
  on public.follows for delete
  using (auth.uid() = follower_id or public.is_admin());

-- 4. Boards (Collections) and Board Items
create table if not exists public.boards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text default '',
  is_public boolean default true,
  cover_image_url text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_boards_user on public.boards (user_id);

alter table public.boards enable row level security;

create policy "Public boards viewable by all, private only by owner"
  on public.boards for select
  using (is_public = true or auth.uid() = user_id or public.is_admin());

create policy "Users can create their own boards"
  on public.boards for insert
  with check (auth.uid() = user_id or public.is_admin());

create policy "Users can update their own boards"
  on public.boards for update
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

create policy "Users can delete their own boards"
  on public.boards for delete
  using (auth.uid() = user_id or public.is_admin());

create table if not exists public.board_items (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  item_type text not null check (item_type in ('portfolio_item', 'creator', 'brief')),
  item_id text not null,
  notes text default '',
  created_at timestamptz default timezone('utc'::text, now()) not null,
  unique (board_id, item_type, item_id)
);

create index if not exists idx_board_items_board on public.board_items (board_id);

alter table public.board_items enable row level security;

create policy "Board items viewable if board viewable"
  on public.board_items for select
  using (
    exists (
      select 1 from public.boards b
      where b.id = board_id and (b.is_public = true or b.user_id = auth.uid() or public.is_admin())
    )
  );

create policy "Users can manage items in their own boards"
  on public.board_items for insert
  with check (
    exists (
      select 1 from public.boards b
      where b.id = board_id and (b.user_id = auth.uid() or public.is_admin())
    )
  );

create policy "Users can remove items from their own boards"
  on public.board_items for delete
  using (
    exists (
      select 1 from public.boards b
      where b.id = board_id and (b.user_id = auth.uid() or public.is_admin())
    )
  );

-- 5. Portfolio Likes Table
create table if not exists public.portfolio_likes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  portfolio_item_id uuid not null references public.portfolio_items(id) on delete cascade,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  primary key (user_id, portfolio_item_id)
);

alter table public.portfolio_likes enable row level security;

create policy "Portfolio likes viewable by everyone"
  on public.portfolio_likes for select
  using (true);

create policy "Users can like portfolio items"
  on public.portfolio_likes for insert
  with check (auth.uid() = user_id or public.is_admin());

create policy "Users can unlike portfolio items"
  on public.portfolio_likes for delete
  using (auth.uid() = user_id or public.is_admin());

-- 6. Notifications Table (Supabase Realtime enabled)
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('brief_match', 'proposal_received', 'invite_received', 'stage_change', 'message', 'creator_verified', 'saved_search', 'level_upgraded', 'system')),
  title text not null,
  body text not null,
  data jsonb default '{}'::jsonb,
  read boolean default false not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_notifications_user on public.notifications (user_id, read, created_at desc);

alter table public.notifications enable row level security;

create policy "Users can view their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Users can update their own notifications"
  on public.notifications for update
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

create policy "Users can delete their own notifications"
  on public.notifications for delete
  using (auth.uid() = user_id or public.is_admin());

create policy "System and users can insert notifications"
  on public.notifications for insert
  with check (true);

-- Enable Supabase Realtime for notifications
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.notifications;
  end if;
exception
  when others then null;
end $$;

-- 7. Notification Preferences Table
create table if not exists public.notification_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  brief_matches boolean default true not null,
  proposals boolean default true not null,
  invites boolean default true not null,
  stage_changes boolean default true not null,
  messages boolean default true not null,
  creator_verified boolean default true not null,
  saved_searches boolean default true not null,
  weekly_digest boolean default true not null,
  quiet_hours_enabled boolean default false not null,
  quiet_hours_start text default '22:00' not null,
  quiet_hours_end text default '08:00' not null,
  quiet_hours_timezone text default 'UTC' not null,
  rate_limit_per_hour integer default 20 not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.notification_preferences enable row level security;

create policy "Users can view their own preferences"
  on public.notification_preferences for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Users can update their own preferences"
  on public.notification_preferences for update
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

create policy "Users can insert their own preferences"
  on public.notification_preferences for insert
  with check (auth.uid() = user_id or public.is_admin());

-- 8. RPC: calculate_brief_creator_match_score
create or replace function public.calculate_brief_creator_match_score(
  p_creator_id uuid,
  p_brief_id uuid
)
returns jsonb as $$
declare
  v_creator record;
  v_brief record;
  v_score int := 0;
  v_reasons text[] := array[]::text[];
  v_shared_tools text[];
  v_tool_count int := 0;
begin
  select * into v_creator from public.profiles where id = p_creator_id;
  select * into v_brief from public.creative_briefs where id = p_brief_id;

  if v_creator is null or v_brief is null then
    return jsonb_build_object('score', 0, 'reasons', '[]'::jsonb);
  end if;

  -- 1. Tool Overlap (40 pts)
  select array_agg(t) into v_shared_tools
  from unnest(v_creator.primary_tools) t
  where t = any(v_brief.required_tools);

  v_tool_count := coalesce(array_length(v_shared_tools, 1), 0);
  if v_tool_count > 0 then
    v_score := v_score + least(40, v_tool_count * 15);
    v_reasons := array_append(v_reasons, 'Tool match: ' || array_to_string(v_shared_tools, ', '));
  end if;

  -- 2. Budget Fit (25 pts)
  if v_creator.day_rate_usd is not null and v_creator.day_rate_usd > 0 then
    if v_brief.budget_min <= (v_creator.day_rate_usd * 3) and v_brief.budget_max >= v_creator.day_rate_usd then
      v_score := v_score + 25;
      v_reasons := array_append(v_reasons, 'Budget aligns with your day rate ($' || v_creator.day_rate_usd::text || '/day)');
    elsif v_brief.budget_max >= v_creator.day_rate_usd then
      v_score := v_score + 15;
    end if;
  else
    v_score := v_score + 15;
  end if;

  -- 3. Verification & Determinism (20 pts)
  if v_creator.deterministic_pipeline and v_brief.base_model_policy in ('permissive_open', 'indemnified_only') then
    v_score := v_score + 15;
    v_reasons := array_append(v_reasons, 'Verified deterministic pipeline required');
  end if;
  if v_creator.commercial_clearance_cleared then
    v_score := v_score + 5;
  end if;

  -- 4. Rating & Track Record (15 pts)
  if v_creator.rating >= 4.80 then
    v_score := v_score + 15;
    v_reasons := array_append(v_reasons, 'Top-tier rating (' || v_creator.rating::text || '★)');
  elsif v_creator.rating >= 4.50 then
    v_score := v_score + 10;
  end if;

  -- Cap at 98% (realistic upper bound)
  v_score := greatest(35, least(98, v_score));

  return jsonb_build_object(
    'score', v_score,
    'reasons', to_jsonb(v_reasons)
  );
end;
$$ language plpgsql stable;

-- 9. RPC: get_personalized_creator_feed
create or replace function public.get_personalized_creator_feed(
  p_creator_id uuid,
  p_limit int default 10,
  p_offset int default 0
)
returns table (
  brief_id uuid,
  title text,
  brand_name text,
  brand_avatar text,
  brand_avatar_gradient jsonb,
  budget_min numeric,
  budget_max numeric,
  currency text,
  deadline text,
  required_tools text[],
  match_score int,
  match_reasons jsonb,
  created_at timestamptz
) as $$
begin
  return query
  with dismissed as (
    select target_id from public.interaction_events
    where user_id = p_creator_id and event_type in ('dismiss', 'brief_dismiss') and target_type = 'brief'
  )
  select
    b.id as brief_id,
    b.title,
    b.brand_name,
    b.brand_avatar,
    b.brand_avatar_gradient,
    b.budget_min,
    b.budget_max,
    b.currency,
    b.deadline,
    b.required_tools,
    coalesce((match_calc.calc->>'score')::int, 75) as match_score,
    coalesce(match_calc.calc->'reasons', '[]'::jsonb) as match_reasons,
    b.created_at
  from public.creative_briefs b
  cross join lateral (
    select public.calculate_brief_creator_match_score(p_creator_id, b.id) as calc
  ) match_calc
  where b.status = 'published'
    and b.id::text not in (select target_id from dismissed)
  order by match_score desc, b.created_at desc
  limit p_limit offset p_offset;
end;
$$ language plpgsql stable;

-- 10. RPC: compute_creator_level_and_strength
create or replace function public.compute_creator_level_and_strength(p_creator_id uuid)
returns jsonb as $$
declare
  v_c record;
  v_level text := 'Rising';
  v_badges jsonb := '[]'::jsonb;
  v_strength int := 50;
  v_suggestions jsonb := '[]'::jsonb;
  v_next_reqs jsonb := '{}'::jsonb;
  v_badge_list text[] := array[]::text[];
begin
  select * into v_c from public.profiles where id = p_creator_id;
  if v_c is null then
    return jsonb_build_object('level', 'Rising', 'strength', 50, 'badges', '[]'::jsonb, 'suggestions', '[]'::jsonb);
  end if;

  -- 1. Compute Badges
  if v_c.completed_projects >= 1 then
    v_badge_list := array_append(v_badge_list, 'first_delivery');
  end if;
  if v_c.deterministic_pipeline then
    v_badge_list := array_append(v_badge_list, 'verified_workflow');
  end if;
  if v_c.rating >= 4.90 and v_c.review_count >= 3 then
    v_badge_list := array_append(v_badge_list, 'five_star_streak');
  end if;
  if v_c.median_response_time_min <= 60 then
    v_badge_list := array_append(v_badge_list, 'fast_responder');
  end if;

  -- 2. Compute Level
  if v_c.completed_projects >= 5 and v_c.rating >= 4.90 and v_c.deterministic_pipeline then
    v_level := 'Elite';
    v_next_reqs := jsonb_build_object(
      'current', 'Elite',
      'next', 'Maximum Level Reached',
      'progress_pct', 100,
      'requirements_remaining', '[]'::jsonb
    );
  elsif v_c.completed_projects >= 2 and v_c.rating >= 4.70 then
    v_level := 'Pro';
    v_next_reqs := jsonb_build_object(
      'current', 'Pro',
      'next', 'Elite',
      'progress_pct', 65,
      'requirements_remaining', jsonb_build_array(
        'Complete ' || greatest(0, 5 - v_c.completed_projects)::text || ' more client engagements',
        'Maintain a 4.90+ star rating (current: ' || v_c.rating::text || ')',
        'Verify ComfyUI deterministic workflow'
      )
    );
  else
    v_level := 'Rising';
    v_next_reqs := jsonb_build_object(
      'current', 'Rising',
      'next', 'Pro',
      'progress_pct', 35,
      'requirements_remaining', jsonb_build_array(
        'Complete ' || greatest(0, 2 - v_c.completed_projects)::text || ' client engagements',
        'Receive 2+ client reviews with 4.7+ rating',
        'Complete identity verification'
      )
    );
  end if;

  -- 3. Compute Profile Strength Score & Suggestions
  v_strength := 40;
  if v_c.bio is not null and length(v_c.bio) > 20 then v_strength := v_strength + 10;
  else v_suggestions := v_suggestions || jsonb_build_object('text', 'Write a detailed bio highlighting your generation specialty', 'gain', 10);
  end if;

  if array_length(v_c.primary_tools, 1) >= 3 then v_strength := v_strength + 15;
  else v_suggestions := v_suggestions || jsonb_build_object('text', 'List 3 or more primary generation tools', 'gain', 15);
  end if;

  if v_c.deterministic_pipeline then v_strength := v_strength + 15;
  else v_suggestions := v_suggestions || jsonb_build_object('text', 'Add a verified ComfyUI workflow to your top item', 'gain', 15);
  end if;

  if v_c.verified_identity then v_strength := v_strength + 10;
  else v_suggestions := v_suggestions || jsonb_build_object('text', 'Verify your government identity for the trust badge', 'gain', 10);
  end if;

  if v_c.commercial_clearance_cleared then v_strength := v_strength + 10;
  else v_suggestions := v_suggestions || jsonb_build_object('text', 'Upload license audit verification for commercial briefs', 'gain', 10);
  end if;

  return jsonb_build_object(
    'level', v_level,
    'badges', to_jsonb(v_badge_list),
    'profile_strength_score', least(100, v_strength),
    'next_level_progress', v_next_reqs,
    'suggestions', v_suggestions
  );
end;
$$ language plpgsql stable;
