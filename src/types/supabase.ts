export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "creator" | "brand" | "admin";
export type AspectRatio = "9:16" | "16:9" | "1:1" | "4:5" | "21:9";
export type ReproducibilityKind = "verified_deterministic" | "partially_reproducible" | "exploratory";
export type CommercialClearanceStatus = "cleared" | "flagged" | "pending_review";
export type BriefStatus = "draft" | "published" | "in_review" | "awarded" | "completed";
export type BaseModelPolicy = "indemnified_only" | "permissive_open" | "any_commercial";
export type ProposalStatus = "submitted" | "shortlisted" | "accepted" | "declined";
export type EngagementStatus = "active" | "in_review" | "completed" | "disputed";
export type MilestoneStatus = "pending" | "in_progress" | "submitted" | "approved" | "paid";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          email: string;
          full_name: string;
          display_name: string;
          handle: string;
          avatar_url: string | null;
          avatar_gradient: Json | null;
          bio: string;
          location: string;
          website: string | null;
          verified_identity: boolean;
          deterministic_pipeline: boolean;
          commercial_clearance_cleared: boolean;
          rating: number;
          review_count: number;
          completed_projects: number;
          repeat_hire_rate: number;
          hourly_rate_usd: number;
          day_rate_usd: number;
          primary_tools: string[];
          specializations: string[];
          portfolio_score: number;
          tsv: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: UserRole;
          email: string;
          full_name: string;
          display_name: string;
          handle: string;
          avatar_url?: string | null;
          avatar_gradient?: Json | null;
          bio?: string;
          location?: string;
          website?: string | null;
          verified_identity?: boolean;
          deterministic_pipeline?: boolean;
          commercial_clearance_cleared?: boolean;
          rating?: number;
          review_count?: number;
          completed_projects?: number;
          repeat_hire_rate?: number;
          hourly_rate_usd?: number;
          day_rate_usd?: number;
          primary_tools?: string[];
          specializations?: string[];
          portfolio_score?: number;
          tsv?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          email?: string;
          full_name?: string;
          display_name?: string;
          handle?: string;
          avatar_url?: string | null;
          avatar_gradient?: Json | null;
          bio?: string;
          location?: string;
          website?: string | null;
          verified_identity?: boolean;
          deterministic_pipeline?: boolean;
          commercial_clearance_cleared?: boolean;
          rating?: number;
          review_count?: number;
          completed_projects?: number;
          repeat_hire_rate?: number;
          hourly_rate_usd?: number;
          day_rate_usd?: number;
          primary_tools?: string[];
          specializations?: string[];
          portfolio_score?: number;
          tsv?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      portfolio_items: {
        Row: {
          id: string;
          creator_id: string;
          title: string;
          description: string;
          aspect_ratio: AspectRatio;
          video_url: string | null;
          thumbnail_url: string | null;
          poster_gradient: Json | null;
          base_models: string[];
          tools: string[];
          reproducibility_score: number;
          reproducibility_kind: ReproducibilityKind;
          commercial_clearance_status: CommercialClearanceStatus;
          copyrighted_ip_scan: "clean" | "flagged";
          node_graph_data: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          creator_id: string;
          title: string;
          description?: string;
          aspect_ratio?: AspectRatio;
          video_url?: string | null;
          thumbnail_url?: string | null;
          poster_gradient?: Json | null;
          base_models?: string[];
          tools?: string[];
          reproducibility_score?: number;
          reproducibility_kind?: ReproducibilityKind;
          commercial_clearance_status?: CommercialClearanceStatus;
          copyrighted_ip_scan?: "clean" | "flagged";
          node_graph_data?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          creator_id?: string;
          title?: string;
          description?: string;
          aspect_ratio?: AspectRatio;
          video_url?: string | null;
          thumbnail_url?: string | null;
          poster_gradient?: Json | null;
          base_models?: string[];
          tools?: string[];
          reproducibility_score?: number;
          reproducibility_kind?: ReproducibilityKind;
          commercial_clearance_status?: CommercialClearanceStatus;
          copyrighted_ip_scan?: "clean" | "flagged";
          node_graph_data?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      pipeline_stages: {
        Row: {
          id: string;
          portfolio_item_id: string;
          stage_order: number;
          stage_name: string;
          tool_name: string;
          model_hash: string;
          seed: number;
          prompt: string;
          negative_prompt: string;
          lora_weights: Json;
          duration_sec: number;
          cost_usd: number;
          output_preview_gradient: Json | null;
          output_preview_caption: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          portfolio_item_id: string;
          stage_order: number;
          stage_name: string;
          tool_name: string;
          model_hash: string;
          seed: number;
          prompt: string;
          negative_prompt?: string;
          lora_weights?: Json;
          duration_sec?: number;
          cost_usd?: number;
          output_preview_gradient?: Json | null;
          output_preview_caption?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          portfolio_item_id?: string;
          stage_order?: number;
          stage_name?: string;
          tool_name?: string;
          model_hash?: string;
          seed?: number;
          prompt?: string;
          negative_prompt?: string;
          lora_weights?: Json;
          duration_sec?: number;
          cost_usd?: number;
          output_preview_gradient?: Json | null;
          output_preview_caption?: string;
          created_at?: string;
        };
      };
      creative_briefs: {
        Row: {
          id: string;
          brand_id: string;
          brand_name: string;
          brand_avatar: string | null;
          brand_avatar_gradient: Json | null;
          title: string;
          description: string;
          objective: string;
          target_audience: string;
          aspect_ratios: string[];
          duration_sec: number;
          budget_min: number;
          budget_max: number;
          currency: string;
          deadline: string;
          status: BriefStatus;
          base_model_policy: BaseModelPolicy;
          required_tools: string[];
          negative_constraints: Json;
          deliverables: Json;
          milestones: Json;
          proposal_count: number;
          tsv: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          brand_id: string;
          brand_name: string;
          brand_avatar?: string | null;
          brand_avatar_gradient?: Json | null;
          title: string;
          description: string;
          objective?: string;
          target_audience?: string;
          aspect_ratios: string[];
          duration_sec?: number;
          budget_min: number;
          budget_max: number;
          currency?: string;
          deadline: string;
          status?: BriefStatus;
          base_model_policy?: BaseModelPolicy;
          required_tools?: string[];
          negative_constraints?: Json;
          deliverables?: Json;
          milestones?: Json;
          proposal_count?: number;
          tsv?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          brand_id?: string;
          brand_name?: string;
          brand_avatar?: string | null;
          brand_avatar_gradient?: Json | null;
          title?: string;
          description?: string;
          objective?: string;
          target_audience?: string;
          aspect_ratios?: string[];
          duration_sec?: number;
          budget_min?: number;
          budget_max?: number;
          currency?: string;
          deadline?: string;
          status?: BriefStatus;
          base_model_policy?: BaseModelPolicy;
          required_tools?: string[];
          negative_constraints?: Json;
          deliverables?: Json;
          milestones?: Json;
          proposal_count?: number;
          tsv?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      proposals: {
        Row: {
          id: string;
          brief_id: string;
          creator_id: string;
          pitch_text: string;
          proposed_budget: number;
          proposed_timeline_days: number;
          portfolio_item_ids: string[];
          milestone_breakdown: Json;
          status: ProposalStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          brief_id: string;
          creator_id: string;
          pitch_text: string;
          proposed_budget: number;
          proposed_timeline_days: number;
          portfolio_item_ids?: string[];
          milestone_breakdown?: Json;
          status?: ProposalStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          brief_id?: string;
          creator_id?: string;
          pitch_text?: string;
          proposed_budget?: number;
          proposed_timeline_days?: number;
          portfolio_item_ids?: string[];
          milestone_breakdown?: Json;
          status?: ProposalStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
      engagements: {
        Row: {
          id: string;
          brief_id: string | null;
          proposal_id: string | null;
          brand_id: string;
          creator_id: string;
          title: string;
          total_amount: number;
          escrow_funded: number;
          status: EngagementStatus;
          current_milestone_index: number;
          milestones: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          brief_id?: string | null;
          proposal_id?: string | null;
          brand_id: string;
          creator_id: string;
          title: string;
          total_amount: number;
          escrow_funded?: number;
          status?: EngagementStatus;
          current_milestone_index?: number;
          milestones?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          brief_id?: string | null;
          proposal_id?: string | null;
          brand_id?: string;
          creator_id?: string;
          title?: string;
          total_amount?: number;
          escrow_funded?: number;
          status?: EngagementStatus;
          current_milestone_index?: number;
          milestones?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      engagement_messages: {
        Row: {
          id: string;
          engagement_id: string;
          sender_id: string;
          message: string;
          attachments: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          engagement_id: string;
          sender_id: string;
          message: string;
          attachments?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          engagement_id?: string;
          sender_id?: string;
          message?: string;
          attachments?: string[];
          created_at?: string;
        };
      };
    };
    Functions: {
      search_creators: {
        Args: {
          filters?: Json;
          sort?: string;
          page?: number;
          page_size?: number;
        };
        Returns: {
          id: string;
          handle: string;
          display_name: string;
          full_name: string;
          avatar_url: string | null;
          avatar_gradient: Json | null;
          bio: string;
          location: string;
          rating: number;
          review_count: number;
          completed_projects: number;
          repeat_hire_rate: number;
          hourly_rate_usd: number;
          day_rate_usd: number;
          primary_tools: string[];
          specializations: string[];
          verified_identity: boolean;
          deterministic_pipeline: boolean;
          commercial_clearance_cleared: boolean;
          portfolio_score: number;
          matched_skill_count: number;
          verified_tool_count: number;
          relevance_rank: number;
          top_portfolio_thumbnails: Json;
          total_count: number;
        }[];
      };
    };
    Enums: {
      user_role: UserRole;
      aspect_ratio: AspectRatio;
      reproducibility_kind: ReproducibilityKind;
      commercial_clearance_status: CommercialClearanceStatus;
      brief_status: BriefStatus;
      base_model_policy: BaseModelPolicy;
      proposal_status: ProposalStatus;
      engagement_status: EngagementStatus;
      milestone_status: MilestoneStatus;
    };
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
