# CacheFlow / CreatorLoom Data Model

This document specifies the PostgreSQL relational schema, indexes, security model, and Remote Procedure Calls (RPC) for the AI-Native Creator Marketplace backend built on Supabase.

---

## 1. Custom Types & Enums

```sql
create type public.user_role as enum ('creator', 'brand', 'admin');
create type public.aspect_ratio as enum ('9:16', '16:9', '1:1', '4:5', '21:9');
create type public.reproducibility_kind as enum ('verified_deterministic', 'partially_reproducible', 'exploratory');
create type public.commercial_clearance_status as enum ('cleared', 'flagged', 'pending_review');
create type public.brief_status as enum ('draft', 'published', 'in_review', 'awarded', 'completed');
create type public.base_model_policy as enum ('indemnified_only', 'permissive_open', 'any_commercial');
create type public.proposal_status as enum ('submitted', 'shortlisted', 'accepted', 'declined');
create type public.engagement_status as enum ('active', 'in_review', 'completed', 'disputed');
create type public.milestone_status as enum ('pending', 'in_progress', 'submitted', 'approved', 'paid');
```

---

## 2. Table Specifications

### 2.1 `profiles`
Extends `auth.users` with marketplace identity, verification signals, skills, and ratings.

| Column | Type | Constraints / Default | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | Primary Key, `references auth.users(id) on delete cascade` | User ID matching Supabase Auth |
| `role` | `public.user_role` | `not null default 'creator'` | Primary marketplace role |
| `email` | `text` | `not null unique` | Account email address |
| `full_name` | `text` | `not null` | Legal/real full name |
| `display_name` | `text` | `not null` | Public moniker |
| `handle` | `text` | `not null unique` | Vanity handle (e.g. `@artemis_ai`) |
| `avatar_url` | `text` | `null` | Storage URL to profile avatar |
| `avatar_gradient` | `jsonb` | `default '["#8B93FF", "#06B6D4"]'::jsonb` | Fallback avatar color gradient |
| `bio` | `text` | `default ''` | Short professional biography |
| `location` | `text` | `default ''` | City / Country |
| `website` | `text` | `null` | Portfolio or personal site |
| `verified_identity` | `boolean` | `default false` | Government / stripe identity verified |
| `deterministic_pipeline` | `boolean` | `default false` | Proven ComfyUI reproducible workflows |
| `commercial_clearance_cleared`| `boolean` | `default false` | Certified copyright indemnified pipelines |
| `rating` | `numeric(3, 2)` | `default 5.00 check (rating between 1.00 and 5.00)` | Client average star rating |
| `review_count` | `integer` | `default 0 check (review_count >= 0)` | Total client reviews |
| `completed_projects` | `integer` | `default 0 check (completed_projects >= 0)` | Finished client engagements |
| `repeat_hire_rate` | `integer` | `default 0 check (repeat_hire_rate between 0 and 100)` | Repeat client percentage |
| `hourly_rate_usd` | `numeric(10, 2)` | `default 100.00 check (hourly_rate_usd >= 0)` | Hourly consulting rate |
| `day_rate_usd` | `numeric(10, 2)` | `default 800.00 check (day_rate_usd >= 0)` | Full day project rate |
| `primary_tools` | `text[]` | `default array[]::text[]` | Tool IDs (e.g. `['comfyui', 'flux_1_dev', 'runway_gen3']`) |
| `specializations` | `text[]` | `default array[]::text[]` | Niche specializations (e.g. `['Camera Motion Control']`) |
| `portfolio_score` | `integer` | `default 0` | Auto-computed aggregate portfolio score |
| `tsv` | `tsvector` | `null` | Full-text search document vector |
| `created_at` | `timestamptz` | `default now() not null` | Creation timestamp |
| `updated_at` | `timestamptz` | `default now() not null` | Last updated timestamp |

---

### 2.2 `portfolio_items`
Proof-of-work generative assets with full workflow provenance and commercial clearances.

| Column | Type | Constraints / Default | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | Primary Key, `default gen_random_uuid()` | Asset unique ID |
| `creator_id` | `uuid` | `not null references public.profiles(id) on delete cascade` | Creator profile reference |
| `title` | `text` | `not null` | Asset title |
| `description` | `text` | `default ''` | Workflow description & brief |
| `aspect_ratio` | `public.aspect_ratio` | `not null default '16:9'` | Display ratio |
| `video_url` | `text` | `null` | Video media storage URL |
| `thumbnail_url` | `text` | `null` | Poster thumbnail storage URL |
| `poster_gradient` | `jsonb` | `default '["#16161A", "#8B93FF"]'::jsonb` | Dynamic gradient fallback |
| `base_models` | `text[]` | `default array[]::text[]` | Models utilized (FLUX, SDXL, Kling, etc.) |
| `tools` | `text[]` | `default array[]::text[]` | Complete software toolchain |
| `reproducibility_score` | `integer` | `default 100 check (reproducibility_score between 0 and 100)` | Determinism percentage |
| `reproducibility_kind` | `public.reproducibility_kind` | `not null default 'verified_deterministic'` | Execution reproducibility class |
| `commercial_clearance_status` | `public.commercial_clearance_status` | `not null default 'cleared'` | License audit verdict |
| `copyrighted_ip_scan` | `text` | `not null check (copyrighted_ip_scan in ('clean', 'flagged'))` | Trademark scan verdict |
| `node_graph_data` | `jsonb` | `default '{}'::jsonb` | ComfyUI nodes, edges, downloadable workflow |
| `created_at` | `timestamptz` | `default now() not null` | Creation timestamp |
| `updated_at` | `timestamptz` | `default now() not null` | Last update |

---

### 2.3 `pipeline_stages`
Granular generation steps inside a portfolio item proving prompt & node provenance.

| Column | Type | Constraints / Default | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | Primary Key, `default gen_random_uuid()` | Stage ID |
| `portfolio_item_id` | `uuid` | `not null references public.portfolio_items(id) on delete cascade` | Parent item |
| `stage_order` | `integer` | `not null check (stage_order >= 0)` | 1-indexed order |
| `stage_name` | `text` | `not null` | E.g. "Keyframe Generation" |
| `tool_name` | `text` | `not null` | E.g. "FLUX.1 Dev" |
| `model_hash` | `text` | `not null` | Checkpoint SHA-256 hash |
| `seed` | `bigint` | `not null` | Deterministic RNG seed |
| `prompt` | `text` | `not null` | Positive prompt |
| `negative_prompt` | `text` | `default ''` | Negative prompt / exclusions |
| `lora_weights` | `jsonb` | `default '[]'::jsonb` | Array of `{ name, weight }` |
| `duration_sec` | `numeric(6, 2)` | `default 0.00` | Compute runtime |
| `cost_usd` | `numeric(6, 2)` | `default 0.00` | Compute API cost |
| `output_preview_gradient` | `jsonb` | `default '["#16161A", "#8B93FF"]'::jsonb` | Stage preview gradient |
| `output_preview_caption` | `text` | `default ''` | Stage milestone caption |
| `created_at` | `timestamptz` | `default now() not null` | Creation timestamp |

---

### 2.4 `creative_briefs`
Brand client project requirements with negative constraints, deliverables, and escrow milestone budgets.

| Column | Type | Constraints / Default | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | Primary Key, `default gen_random_uuid()` | Brief unique ID |
| `brand_id` | `uuid` | `not null references public.profiles(id) on delete cascade` | Client profile |
| `brand_name` | `text` | `not null` | Client company / agency name |
| `brand_avatar` | `text` | `null` | Brand logo URL |
| `brand_avatar_gradient` | `jsonb` | `default '["#16161A", "#8B93FF"]'::jsonb` | Fallback brand avatar gradient |
| `title` | `text` | `not null` | Campaign brief title |
| `description` | `text` | `not null` | Detailed description |
| `objective` | `text` | `default ''` | Campaign goal & KPIs |
| `target_audience` | `text` | `default ''` | Demographics & persona |
| `aspect_ratios` | `text[]` | `not null` | Required frame ratios |
| `duration_sec` | `integer` | `not null default 30` | Target spot length |
| `budget_min` | `numeric(10, 2)` | `not null check (budget_min >= 0)` | Lower budget band |
| `budget_max` | `numeric(10, 2)` | `not null check (budget_max >= budget_min)` | Upper budget band |
| `currency` | `text` | `default 'USD'` | Currency code |
| `deadline` | `text` | `not null` | Delivery deadline ISO string |
| `status` | `public.brief_status` | `not null default 'published'` | Lifecycle state |
| `base_model_policy` | `public.base_model_policy` | `not null default 'any_commercial'` | Legal IP compliance standard |
| `required_tools` | `text[]` | `default array[]::text[]` | Mandated generation engines |
| `negative_constraints` | `jsonb` | `default '[]'::jsonb` | Excluded aesthetics and brand defects |
| `deliverables` | `jsonb` | `default '[]'::jsonb` | Formats, resolutions, master assets |
| `milestones` | `jsonb` | `default '[]'::jsonb` | Escrow payment phases |
| `proposal_count` | `integer` | `default 0 check (proposal_count >= 0)` | Total creator submissions |
| `tsv` | `tsvector` | `null` | Full-text search vector |
| `created_at` | `timestamptz` | `default now() not null` | Creation timestamp |
| `updated_at` | `timestamptz` | `default now() not null` | Last modification |

---

### 2.5 `proposals`
Creator pitches submitted against published creative briefs.

| Column | Type | Constraints / Default | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | Primary Key, `default gen_random_uuid()` | Proposal unique ID |
| `brief_id` | `uuid` | `not null references public.creative_briefs(id) on delete cascade` | Target brief |
| `creator_id` | `uuid` | `not null references public.profiles(id) on delete cascade` | Pitching creator |
| `pitch_text` | `text` | `not null` | Proposal narrative & methodology |
| `proposed_budget` | `numeric(10, 2)` | `not null check (proposed_budget > 0)` | Total proposed price |
| `proposed_timeline_days` | `integer` | `not null check (proposed_timeline_days > 0)` | Estimated turnaround in days |
| `portfolio_item_ids` | `uuid[]` | `default array[]::uuid[]` | Proof-of-work references |
| `milestone_breakdown` | `jsonb` | `default '[]'::jsonb` | Proposed payout percentages |
| `status` | `public.proposal_status` | `not null default 'submitted'` | Proposal state |
| `created_at` | `timestamptz` | `default now() not null` | Submission timestamp |
| `updated_at` | `timestamptz` | `default now() not null` | Status update timestamp |

---

### 2.6 `engagements`
Funded project contracts between a brand and an awarded creator with escrow lock.

| Column | Type | Constraints / Default | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | Primary Key, `default gen_random_uuid()` | Engagement unique ID |
| `brief_id` | `uuid` | `null references public.creative_briefs(id) on delete set null` | Originating brief |
| `proposal_id` | `uuid` | `null references public.proposals(id) on delete set null` | Awarded proposal |
| `brand_id` | `uuid` | `not null references public.profiles(id)` | Client party |
| `creator_id` | `uuid` | `not null references public.profiles(id)` | Hired creator party |
| `title` | `text` | `not null` | Engagement title |
| `total_amount` | `numeric(10, 2)` | `not null check (total_amount >= 0)` | Contract value |
| `escrow_funded` | `numeric(10, 2)` | `not null default 0.00 check (escrow_funded >= 0)` | Funds secured in escrow |
| `status` | `public.engagement_status` | `not null default 'active'` | Delivery lifecycle state |
| `current_milestone_index` | `integer` | `default 0 check (current_milestone_index >= 0)` | Active review milestone |
| `milestones` | `jsonb` | `default '[]'::jsonb` | Milestone phases, deliverables, releases |
| `created_at` | `timestamptz` | `default now() not null` | Contract creation timestamp |
| `updated_at` | `timestamptz` | `default now() not null` | Last modification |

---

### 2.7 `engagement_messages`
Encrypted/secure conversation thread and delivery reviews between engagement participants.

| Column | Type | Constraints / Default | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | Primary Key, `default gen_random_uuid()` | Message unique ID |
| `engagement_id` | `uuid` | `not null references public.engagements(id) on delete cascade` | Parent engagement |
| `sender_id` | `uuid` | `not null references public.profiles(id)` | Message author |
| `message` | `text` | `not null` | Content body |
| `attachments` | `text[]` | `default array[]::text[]` | Signed storage URLs to deliverables/reviews |
| `created_at` | `timestamptz` | `default now() not null` | Sent timestamp |

---

## 3. Storage Buckets & Policies

| Bucket | Access | Max Size | Allowed MIME Types | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `avatars` | Public Read | 2 MB | `image/jpeg`, `image/png`, `image/webp`, `image/svg+xml` | Creator & Brand avatars |
| `portfolio-media` | Public Read | 50 MB | `video/mp4`, `video/webm`, `image/jpeg`, `image/png`, `image/webp` | Generative proof-of-work master assets |
| `thumbnails` | Public Read | 5 MB | `image/jpeg`, `image/png`, `image/webp` | Card posters & scrub previews |
| `deliverables` | Private | 100 MB | `application/zip`, `video/mp4`, `video/quicktime`, `image/png`, `application/json` | Secure client asset handoffs & ComfyUI graphs |

---

## 4. Search RPC `search_creators`

### Function Signature:
```sql
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
)
```

---

## 5. Security & Row Level Security (RLS) Matrix

| Table | Operation | Public / Anonymous | Creator | Brand | Admin |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`profiles`** | SELECT | Read all creators | Read all creators & own profile | Read all creators & own profile | Read all |
| | UPDATE | Forbidden | Update own profile (`auth.uid() = id`) | Update own profile (`auth.uid() = id`) | Update all |
| **`portfolio_items`** | SELECT | Read all | Read all | Read all | Read all |
| | INSERT / UPDATE / DELETE | Forbidden | Only own items (`auth.uid() = creator_id`) | Forbidden | Manage all |
| **`pipeline_stages`** | SELECT | Read all | Read all | Read all | Read all |
| | INSERT / UPDATE / DELETE | Forbidden | Only stages of own items | Forbidden | Manage all |
| **`creative_briefs`** | SELECT | Published briefs | Published briefs | Published briefs + own drafts | Read all |
| | INSERT / UPDATE / DELETE | Forbidden | Forbidden | Only own briefs (`auth.uid() = brand_id`) | Manage all |
| **`proposals`** | SELECT | Forbidden | Own submitted proposals | Proposals for own briefs | Read all |
| | INSERT / UPDATE | Forbidden | Own submitted proposals | Forbidden | Manage all |
| **`engagements`** | SELECT / UPDATE | Forbidden | Only if `auth.uid() = creator_id` | Only if `auth.uid() = brand_id` | Manage all |
| **`engagement_messages`**| SELECT / INSERT | Forbidden | Only if creator in engagement | Only if brand in engagement | Manage all |
