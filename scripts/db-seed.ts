import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import {
  DEMO_ACCOUNTS,
  generateSeedCreators,
  generateSeedPortfolioItems,
  generateSeedBriefs,
  generateSeedProposalsAndEngagements,
  generateSeedEngagementLayer,
} from "./seed-data";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

async function seedDatabase() {
  console.log("============================================================");
  console.log("CACHEFLOW / CREATORLOOM DATABASE SEED");
  console.log("============================================================");

  console.log("Generating realistic synthetic seed entities...");

  const creators = generateSeedCreators();
  const portfolioItems = generateSeedPortfolioItems(creators);
  const briefs = generateSeedBriefs();
  const { proposals, engagements } = generateSeedProposalsAndEngagements(creators, briefs);

  console.log(`- Created ${creators.length} realistic creators (varied rates, tools, locations)`);
  console.log(`- Created ${portfolioItems.length} portfolio items (3 per creator, 360 pipeline stages)`);
  console.log(`- Created ${briefs.length} creative briefs from varied brands`);
  console.log(`- Created ${proposals.length} proposals across briefs`);
  console.log(`- Created ${engagements.length} funded active and completed engagements`);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && serviceRoleKey && !supabaseUrl.includes("placeholder")) {
    console.log("\nConnecting to Supabase via Admin Client (Service Role)...");
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(supabaseUrl, serviceRoleKey);

      // 1. Seed demo auth users
      console.log("Upserting demo auth users...");
      for (const account of Object.values(DEMO_ACCOUNTS)) {
        await supabase.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true,
          user_metadata: {
            full_name: account.fullName,
            handle: account.handle,
            role: account.role,
          },
        }).catch(() => null);
      }

      // 2. Upsert profiles
      console.log(`Upserting ${creators.length} profiles...`);
      for (const c of creators) {
        await supabase.from("profiles").upsert({
          id: c.id,
          role: c.role,
          email: c.email,
          full_name: c.fullName,
          display_name: c.displayName,
          handle: c.handle,
          avatar_url: c.avatarUrl,
          avatar_gradient: c.avatarGradient,
          bio: c.bio,
          location: c.location,
          website: c.website,
          verified_identity: c.verifiedIdentity,
          deterministic_pipeline: c.deterministicPipeline,
          commercial_clearance_cleared: c.commercialClearanceCleared,
          rating: c.rating,
          review_count: c.reviewCount,
          completed_projects: c.completedProjects,
          repeat_hire_rate: c.repeatHireRate,
          hourly_rate_usd: c.hourlyRateUsd,
          day_rate_usd: c.dayRateUsd,
          primary_tools: c.primaryTools,
          specializations: c.specializations,
          portfolio_score: c.portfolioScore,
        });
      }

      // 3. Upsert portfolio items and stages
      console.log(`Upserting ${portfolioItems.length} portfolio items...`);
      for (const item of portfolioItems) {
        await supabase.from("portfolio_items").upsert({
          id: item.id,
          creator_id: item.creatorId,
          title: item.title,
          description: item.description,
          aspect_ratio: item.aspectRatio,
          video_url: item.videoUrl,
          thumbnail_url: item.thumbnailUrl,
          poster_gradient: item.posterGradient,
          base_models: item.baseModels,
          tools: item.tools,
          reproducibility_score: item.reproducibilityScore,
          reproducibility_kind: item.reproducibilityKind,
          commercial_clearance_status: item.commercialClearanceStatus,
          copyrighted_ip_scan: item.copyrightedIpScan,
          node_graph_data: item.nodeGraphData,
        });

        for (const stage of item.stages) {
          await supabase.from("pipeline_stages").upsert({
            id: stage.id,
            portfolio_item_id: item.id,
            stage_order: stage.stageOrder,
            stage_name: stage.stageName,
            tool_name: stage.toolName,
            model_hash: stage.modelHash,
            seed: stage.seed,
            prompt: stage.prompt,
            negative_prompt: stage.negativePrompt,
            lora_weights: stage.loraWeights,
            duration_sec: stage.durationSec,
            cost_usd: stage.costUsd,
            output_preview_caption: stage.outputPreviewCaption,
          });
        }
      }

      // 4. Upsert briefs
      console.log(`Upserting ${briefs.length} creative briefs...`);
      for (const b of briefs) {
        await supabase.from("creative_briefs").upsert({
          id: b.id,
          brand_id: b.brandId,
          brand_name: b.brandName,
          brand_avatar: b.brandAvatar,
          brand_avatar_gradient: b.brandAvatarGradient,
          title: b.title,
          description: b.description,
          objective: b.objective,
          target_audience: b.targetAudience,
          aspect_ratios: b.aspectRatios,
          duration_sec: b.durationSec,
          budget_min: b.budgetMin,
          budget_max: b.budgetMax,
          currency: b.currency,
          deadline: b.deadline,
          status: b.status,
          base_model_policy: b.baseModelPolicy,
          required_tools: b.requiredTools,
          negative_constraints: b.negativeConstraints,
          deliverables: b.deliverables,
          milestones: b.milestones,
        });
      }

      console.log("Supabase remote database seeding complete!");
    } catch (err: unknown) {
      console.warn("Remote seeding warning:", err instanceof Error ? err.message : err);
    }
  } else {
    const { notifications, follows, boards, events } = generateSeedEngagementLayer(creators, briefs);
    console.log(`- Created ${notifications.length} smart alert notifications`);
    console.log(`- Created ${follows.length} creator follow relationships`);
    console.log(`- Created ${boards.length} curated talent and brief boards`);

    // Write local snapshot
    const outputDir = path.join(process.cwd(), "supabase");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const snapshotPath = path.join(outputDir, "seed-snapshot.json");
    fs.writeFileSync(
      snapshotPath,
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          creatorsCount: creators.length,
          portfolioItemsCount: portfolioItems.length,
          briefsCount: briefs.length,
          proposalsCount: proposals.length,
          engagementsCount: engagements.length,
          notificationsCount: notifications.length,
          boardsCount: boards.length,
          followsCount: follows.length,
          demoAccounts: DEMO_ACCOUNTS,
          creators,
          portfolioItems,
          briefs,
          proposals,
          engagements,
          notifications,
          follows,
          boards,
          events,
        },
        null,
        2
      )
    );
    console.log(`Saved local idempotent seed snapshot to ${snapshotPath}`);
  }

  // Print Demo Account Credentials
  console.log("\n============================================================");
  console.log("DEMO ACCOUNTS READY FOR REVIEW & TESTING:");
  console.log("============================================================");
  console.log("1. CREATOR DEMO ACCOUNT:");
  console.log(`   Email:    ${DEMO_ACCOUNTS.creator.email}`);
  console.log(`   Password: ${DEMO_ACCOUNTS.creator.password}`);
  console.log(`   Role:     ${DEMO_ACCOUNTS.creator.role}`);
  console.log(`   Handle:   @${DEMO_ACCOUNTS.creator.handle}`);
  console.log("------------------------------------------------------------");
  console.log("2. BRAND DEMO ACCOUNT:");
  console.log(`   Email:    ${DEMO_ACCOUNTS.brand.email}`);
  console.log(`   Password: ${DEMO_ACCOUNTS.brand.password}`);
  console.log(`   Role:     ${DEMO_ACCOUNTS.brand.role}`);
  console.log(`   Handle:   @${DEMO_ACCOUNTS.brand.handle}`);
  console.log("------------------------------------------------------------");
  console.log("3. ADMIN DEMO ACCOUNT:");
  console.log(`   Email:    ${DEMO_ACCOUNTS.admin.email}`);
  console.log(`   Password: ${DEMO_ACCOUNTS.admin.password}`);
  console.log(`   Role:     ${DEMO_ACCOUNTS.admin.role}`);
  console.log(`   Handle:   @${DEMO_ACCOUNTS.admin.handle}`);
  console.log("============================================================\n");
}

seedDatabase().catch((err) => {
  console.error("Error seeding database:", err);
  process.exit(1);
});
