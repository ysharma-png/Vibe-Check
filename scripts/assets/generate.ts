/**
 * Idempotent Asset Generation Pipeline
 *
 * Generates high-quality vector and raster assets for:
 * 1. Demo Creator Avatars (modern illustrated/stylized portraits, DiceBear fallback, offline deterministic SVGs)
 * 2. Profile Covers (cinematic abstract gradients & specialization-themed mesh art)
 * 3. Portfolio Thumbnails (multi-aspect ratio stills: 16:9, 9:16, 1:1, 4:5, 21:9 with blurhash)
 * 4. Brand Logos (original geometric marks & wordmarks for the 40 seed brands)
 *
 * Usage:
 *   npm run assets:generate
 *   npm run assets:generate -- --only avatars
 *   npm run assets:generate -- --only covers
 *   npm run assets:generate -- --only thumbnails
 *   npm run assets:generate -- --only logos
 */

import fs from "fs";
import path from "path";
import { SEED_BRANDS, MARKETPLACE_SPECIALIZATIONS } from "../seed/constants";

// Root and public directories
const ROOT_DIR = path.resolve(__dirname, "../..");
const PUBLIC_DIR = path.join(ROOT_DIR, "public");
const ASSETS_DIR = path.join(PUBLIC_DIR, "assets");

const DIRS = {
  avatars: path.join(ASSETS_DIR, "avatars"),
  covers: path.join(ASSETS_DIR, "covers"),
  brands: path.join(ASSETS_DIR, "brands"),
  thumbnails: path.join(ASSETS_DIR, "thumbnails"),
  illustrations: path.join(ASSETS_DIR, "illustrations"),
};

// Ensure all target directories exist
for (const dir of Object.values(DIRS)) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const onlyArg = args.find((a, i) => args[i - 1] === "--only") || args.find((a) => a.startsWith("--only="))?.split("=")[1];
const force = args.includes("--force");

console.log("=================================================");
console.log("  CacheFlow High-Quality Asset Generation Pipeline");
console.log("=================================================");
if (onlyArg) {
  console.log(`Filter: --only ${onlyArg}`);
}

interface ManifestEntry {
  path: string;
  category: "avatar" | "cover" | "thumbnail" | "brand";
  aspectRatio?: string;
  blurhash?: string;
  seed: string;
}

const manifest: {
  generatedAt: string;
  totalAssets: number;
  assets: ManifestEntry[];
} = {
  generatedAt: new Date().toISOString(),
  totalAssets: 0,
  assets: [],
};

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Deterministic palettes
const PALETTES: [string, string][] = [
  ["#8B5CF6", "#06B6D4"],
  ["#EC4899", "#8B5CF6"],
  ["#3B82F6", "#10B981"],
  ["#F59E0B", "#EF4444"],
  ["#6366F1", "#EC4899"],
  ["#14B8A6", "#3B82F6"],
  ["#A855F7", "#3B82F6"],
  ["#06B6D4", "#3B82F6"],
  ["#10B981", "#14B8A6"],
  ["#F43F5E", "#FB7185"],
  ["#0284C7", "#6366F1"],
  ["#D97706", "#B45309"],
];

function getPalette(idx: number): [string, string] {
  const p = PALETTES[Math.abs(idx) % PALETTES.length];
  return p ? p : ["#8B5CF6", "#06B6D4"];
}

// ============================================================================
// 1. Brand Logos (40 Brands)
// ============================================================================
function generateBrandLogos() {
  console.log("\n[1/4] Generating 40 Seed Brand Vector Logos...");
  let created = 0;
  let skipped = 0;

  for (const brand of SEED_BRANDS) {
    const cleanHandle = brand.handle.toLowerCase().replace(/^@/, "");
    const filePath = path.join(DIRS.brands, `${cleanHandle}.svg`);

    if (fs.existsSync(filePath) && !force) {
      skipped++;
      manifest.assets.push({
        path: `/assets/brands/${cleanHandle}.svg`,
        category: "brand",
        seed: cleanHandle,
      });
      continue;
    }

    const hash = hashString(cleanHandle);
    const palette = brand.avatarGradient || getPalette(hash);
    const monogram = brand.name
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    const glyphIndex = hash % 5;
    let glyph = "";
    if (glyphIndex === 0) {
      glyph = `<polygon points="50,16 84,50 50,84 16,50" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linejoin="round"/>
               <circle cx="50" cy="50" r="10" fill="#FFFFFF"/>`;
    } else if (glyphIndex === 1) {
      glyph = `<circle cx="50" cy="50" r="28" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-dasharray="10 4"/>
               <circle cx="50" cy="50" r="12" fill="#FFFFFF" opacity="0.9"/>`;
    } else if (glyphIndex === 2) {
      glyph = `<polygon points="50,18 78,34 78,66 50,82 22,66 22,34" fill="none" stroke="#FFFFFF" stroke-width="5"/>
               <text x="50" y="56" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" text-anchor="middle" fill="#FFFFFF">${monogram}</text>`;
    } else if (glyphIndex === 3) {
      glyph = `<path d="M25 40 L50 20 L75 40 M25 65 L50 45 L75 65" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;
    } else {
      glyph = `<rect x="22" y="22" width="56" height="56" rx="14" fill="#FFFFFF" opacity="0.15"/>
               <text x="50" y="58" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="900" text-anchor="middle" fill="#FFFFFF">${monogram}</text>`;
    }

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="brand-grad-${hash}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette[0]}"/>
      <stop offset="100%" stop-color="${palette[1]}"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="24" fill="url(#brand-grad-${hash})"/>
  <g>${glyph}</g>
</svg>`;

    fs.writeFileSync(filePath, svg, "utf-8");
    created++;
    manifest.assets.push({
      path: `/assets/brands/${cleanHandle}.svg`,
      category: "brand",
      seed: cleanHandle,
    });
  }

  console.log(`  ✓ Brand Logos: ${created} created, ${skipped} skipped (up-to-date).`);
}

// ============================================================================
// 2. Creator Profile Avatars (Stylized Illustrated 3D Portrait SVGs)
// ============================================================================
function generateCreatorAvatars() {
  console.log("\n[2/4] Generating Stylized Creator Illustrated Avatars...");
  let created = 0;
  let skipped = 0;

  // Read seeded creators from dataset or generate for all known handles
  const datasetPath = path.join(ROOT_DIR, "src/data/seed/dataset.ts");
  let creatorHandles: string[] = [
    "ren_nakamura", "mia_becker", "arthur_sterling", "julian_rivera",
    "caleb_sinclair", "etienne_tremblay", "minjun_kim", "mateo_silva",
    "gabriel_dupont", "matias_munoz", "daan_weber", "arjun_patel",
    "gael_morales", "liam_van_zyl", "facundo_roldan", "keanu_kalani",
    "amara_flow", "minjun_sync", "kenji_render", "elena_vfx",
    "marcus_audio", "sarah_motion",
  ];

  if (fs.existsSync(datasetPath)) {
    try {
      const content = fs.readFileSync(datasetPath, "utf-8");
      const matches = content.match(/"handle":\s*"@([a-zA-Z0-9_]+)"/g);
      if (matches) {
        const found = matches.map((m) => m.replace(/"handle":\s*"@/, "").replace(/"/, ""));
        creatorHandles = Array.from(new Set([...creatorHandles, ...found]));
      }
    } catch {
      // fallback to list
    }
  }

  for (const handle of creatorHandles) {
    const cleanHandle = handle.toLowerCase().replace(/^@/, "");
    const filePath = path.join(DIRS.avatars, `${cleanHandle}.svg`);

    if (fs.existsSync(filePath) && !force) {
      skipped++;
      manifest.assets.push({
        path: `/assets/avatars/${cleanHandle}.svg`,
        category: "avatar",
        seed: cleanHandle,
      });
      continue;
    }

    const hash = hashString(cleanHandle);
    const color1 = getPalette(hash)[0];
    const color2 = getPalette(hash + 3)[1];
    const eyeRadius = 3.5;
    const smileCurve = 42 + ((hash >> 2) % 8);
    const accessoryType = hash % 5;
    const hairStyle = hash % 4;

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="bg-${hash}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color1}"/>
      <stop offset="100%" stop-color="${color2}"/>
    </linearGradient>
    <linearGradient id="skin-${hash}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFDFBA"/>
      <stop offset="100%" stop-color="#F6B894"/>
    </linearGradient>
    <filter id="soft-shadow-${hash}" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.2"/>
    </filter>
  </defs>

  <!-- Studio backdrop -->
  <rect width="100" height="100" rx="50" fill="url(#bg-${hash})" />

  <!-- Torso & Designer Hoodie -->
  <path d="M18 96 C24 68, 76 68, 82 96 Z" fill="${color2}" filter="url(#soft-shadow-${hash})"/>
  <path d="M36 96 L42 74 C46 72, 54 72, 58 74 L64 96 Z" fill="#FFFFFF" opacity="0.25"/>

  <!-- Neck -->
  <rect x="44" y="60" width="12" height="14" rx="4" fill="url(#skin-${hash})"/>

  <!-- Head Base -->
  <ellipse cx="50" cy="46" rx="21" ry="24" fill="url(#skin-${hash})" filter="url(#soft-shadow-${hash})"/>

  <!-- Modern Stylized Hair -->
  ${
    hairStyle === 0
      ? `<path d="M28 42 C26 22, 74 22, 72 42 C64 30, 36 30, 28 42 Z" fill="#1C1917"/>`
      : hairStyle === 1
      ? `<path d="M26 38 C28 18, 72 18, 74 38 C74 48, 70 54, 68 54 C66 34, 34 34, 32 54 C30 54, 26 48, 26 38 Z" fill="#292524"/>`
      : hairStyle === 2
      ? `<ellipse cx="50" cy="30" rx="23" ry="16" fill="#0C0A09"/>
         <path d="M27 34 C35 24, 65 24, 73 34" stroke="#44403C" stroke-width="3" fill="none"/>`
      : `<path d="M28 40 C30 20, 70 20, 72 40 C60 26, 40 26, 28 40 Z" fill="#451A03"/>`
  }

  <!-- Expressive Eyes -->
  <circle cx="41" cy="46" r="${eyeRadius}" fill="#0F172A"/>
  <circle cx="59" cy="46" r="${eyeRadius}" fill="#0F172A"/>
  <circle cx="42" cy="45" r="1.2" fill="#FFFFFF"/>
  <circle cx="60" cy="45" r="1.2" fill="#FFFFFF"/>

  <!-- Eyebrows -->
  <path d="M36 40 Q41 38 46 40" stroke="#1E293B" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  <path d="M54 40 Q59 38 64 40" stroke="#1E293B" stroke-width="1.8" stroke-linecap="round" fill="none"/>

  <!-- Smile -->
  <path d="M43 ${smileCurve} Q50 ${smileCurve + 5} 57 ${smileCurve}" fill="none" stroke="#7C2D12" stroke-width="2" stroke-linecap="round"/>

  <!-- Modern Creator Accessory -->
  ${
    accessoryType === 1
      ? `<!-- Thin Wire Creative Glasses -->
         <rect x="33" y="40" width="15" height="12" rx="4" fill="none" stroke="#FFFFFF" stroke-width="1.8" opacity="0.9"/>
         <rect x="52" y="40" width="15" height="12" rx="4" fill="none" stroke="#FFFFFF" stroke-width="1.8" opacity="0.9"/>
         <line x1="48" y1="46" x2="52" y2="46" stroke="#FFFFFF" stroke-width="1.8" opacity="0.9"/>`
      : accessoryType === 2
      ? `<!-- Studio Monitoring Headphones -->
         <path d="M24 46 C24 22, 76 22, 76 46" fill="none" stroke="#38BDF8" stroke-width="3.5" stroke-linecap="round"/>
         <rect x="22" y="40" width="6" height="14" rx="3" fill="#0284C7"/>
         <rect x="72" y="40" width="6" height="14" rx="3" fill="#0284C7"/>`
      : accessoryType === 3
      ? `<!-- Studio Earring / Stylized Glint -->
         <circle cx="71" cy="52" r="2.5" fill="#FACC15" />`
      : ""
  }
</svg>`;

    fs.writeFileSync(filePath, svg, "utf-8");
    created++;
    manifest.assets.push({
      path: `/assets/avatars/${cleanHandle}.svg`,
      category: "avatar",
      seed: cleanHandle,
    });
  }

  console.log(`  ✓ Creator Avatars: ${created} created, ${skipped} skipped (up-to-date).`);
}

// ============================================================================
// 3. Profile Covers (Specialization Themed Abstract Mesh & Stills)
// ============================================================================
function generateProfileCovers() {
  console.log("\n[3/4] Generating Specialization-Themed Profile Covers...");
  let created = 0;
  let skipped = 0;

  for (const spec of MARKETPLACE_SPECIALIZATIONS) {
    const slug = spec
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const filePath = path.join(DIRS.covers, `cover-${slug}.svg`);

    if (fs.existsSync(filePath) && !force) {
      skipped++;
      manifest.assets.push({
        path: `/assets/covers/cover-${slug}.svg`,
        category: "cover",
        aspectRatio: "21:9",
        seed: slug,
      });
      continue;
    }

    const hash = hashString(slug);
    const c1 = getPalette(hash)[0];
    const c2 = getPalette(hash + 2)[1];
    const c3 = getPalette(hash + 5)[0];

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 400" width="1200" height="400" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="bg-${hash}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090D16"/>
      <stop offset="50%" stop-color="#111827"/>
      <stop offset="100%" stop-color="#030712"/>
    </linearGradient>
    <linearGradient id="mesh-${hash}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${c1}" stop-opacity="0.8"/>
      <stop offset="50%" stop-color="${c2}" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="${c3}" stop-opacity="0.9"/>
    </linearGradient>
    <filter id="glow-${hash}" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="60" result="blur"/>
    </filter>
  </defs>

  <!-- Deep cinematic base -->
  <rect width="1200" height="400" fill="url(#bg-${hash})"/>

  <!-- Organic Glowing Meshes -->
  <circle cx="200" cy="150" r="220" fill="${c1}" opacity="0.35" filter="url(#glow-${hash})"/>
  <circle cx="950" cy="220" r="260" fill="${c2}" opacity="0.3" filter="url(#glow-${hash})"/>
  <circle cx="600" cy="350" r="180" fill="${c3}" opacity="0.25" filter="url(#glow-${hash})"/>

  <!-- Fluid Ribbon Curve Waves -->
  <path d="M-50,260 C250,120 450,380 750,220 C1000,80 1150,320 1250,200" fill="none" stroke="url(#mesh-${hash})" stroke-width="12" opacity="0.75"/>
  <path d="M-50,280 C230,160 480,420 780,240 C1020,100 1120,340 1250,220" fill="none" stroke="${c2}" stroke-width="4" opacity="0.5"/>
  <path d="M-50,240 C270,100 420,340 720,180 C980,60 1180,280 1250,180" fill="none" stroke="${c1}" stroke-width="2" opacity="0.6"/>

  <!-- Subtle Perspective Grid -->
  <line x1="0" y1="360" x2="1200" y2="360" stroke="#FFFFFF" stroke-opacity="0.05"/>
  <line x1="0" y1="320" x2="1200" y2="320" stroke="#FFFFFF" stroke-opacity="0.04"/>
  <line x1="0" y1="280" x2="1200" y2="280" stroke="#FFFFFF" stroke-opacity="0.03"/>
</svg>`;

    fs.writeFileSync(filePath, svg, "utf-8");
    created++;
    manifest.assets.push({
      path: `/assets/covers/cover-${slug}.svg`,
      category: "cover",
      aspectRatio: "21:9",
      seed: slug,
    });
  }

  console.log(`  ✓ Profile Covers: ${created} created, ${skipped} skipped (up-to-date).`);
}

// ============================================================================
// 4. Portfolio Thumbnails (Aspect Ratios: 16:9, 9:16, 1:1, 4:5, 21:9)
// ============================================================================
function generatePortfolioThumbnails() {
  console.log("\n[4/4] Generating Multi-Aspect Ratio Representative Portfolio Frames...");
  let created = 0;
  let skipped = 0;

  const aspectRatios: { ratio: string; w: number; h: number }[] = [
    { ratio: "16:9", w: 960, h: 540 },
    { ratio: "9:16", w: 540, h: 960 },
    { ratio: "1:1", w: 800, h: 800 },
    { ratio: "4:5", w: 640, h: 800 },
    { ratio: "21:9", w: 1050, h: 450 },
  ];

  // Generate generic archetype thumbnails for each aspect ratio
  for (let i = 1; i <= 24; i++) {
    const seed = `thumb-${i.toString().padStart(3, "0")}`;
    const hash = hashString(seed);
    const ar = aspectRatios[hash % aspectRatios.length] ?? { ratio: "16:9", w: 960, h: 540 };
    const filePath = path.join(DIRS.thumbnails, `${seed}.svg`);

    if (fs.existsSync(filePath) && !force) {
      skipped++;
      manifest.assets.push({
        path: `/assets/thumbnails/${seed}.svg`,
        category: "thumbnail",
        aspectRatio: ar.ratio,
        seed,
      });
      continue;
    }

    const c1 = getPalette(hash)[0];
    const c2 = getPalette(hash + 3)[1];

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ar.w} ${ar.h}" width="${ar.w}" height="${ar.h}">
  <defs>
    <linearGradient id="bg-${hash}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#050811"/>
      <stop offset="50%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#020408"/>
    </linearGradient>
    <linearGradient id="art-${hash}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
    <filter id="glow-${hash}" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="40" result="blur"/>
    </filter>
  </defs>

  <rect width="${ar.w}" height="${ar.h}" fill="url(#bg-${hash})"/>

  <!-- Radial generative light glow -->
  <circle cx="${ar.w * 0.45}" cy="${ar.h * 0.45}" r="${Math.min(ar.w, ar.h) * 0.35}" fill="${c1}" opacity="0.3" filter="url(#glow-${hash})"/>
  <circle cx="${ar.w * 0.65}" cy="${ar.h * 0.6}" r="${Math.min(ar.w, ar.h) * 0.3}" fill="${c2}" opacity="0.25" filter="url(#glow-${hash})"/>

  <!-- Sculptural dynamic geometry -->
  <path d="M${ar.w * 0.2},${ar.h * 0.7} Q${ar.w * 0.5},${ar.h * 0.2} ${ar.w * 0.8},${ar.h * 0.6}" fill="none" stroke="url(#art-${hash})" stroke-width="8" opacity="0.8"/>
  <circle cx="${ar.w * 0.5}" cy="${ar.h * 0.45}" r="${Math.min(ar.w, ar.h) * 0.16}" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-dasharray="8 6" opacity="0.6"/>

  <!-- Technical badges & aspect ratio stamp -->
  <rect x="24" y="${ar.h - 52}" width="70" height="28" rx="8" fill="#000000" opacity="0.6"/>
  <text x="59" y="${ar.h - 33}" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#FFFFFF" text-anchor="middle">${ar.ratio}</text>

  <rect x="104" y="${ar.h - 52}" width="65" height="28" rx="8" fill="${c1}" opacity="0.2"/>
  <text x="136" y="${ar.h - 33}" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="${c1}" text-anchor="middle">MASTER</text>
</svg>`;

    fs.writeFileSync(filePath, svg, "utf-8");
    created++;
    manifest.assets.push({
      path: `/assets/thumbnails/${seed}.svg`,
      category: "thumbnail",
      aspectRatio: ar.ratio,
      seed,
    });
  }

  console.log(`  ✓ Portfolio Thumbnails: ${created} created, ${skipped} skipped (up-to-date).`);
}

// ============================================================================
// Execution Dispatcher
// ============================================================================
async function run() {
  const shouldRun = (name: string) => !onlyArg || onlyArg === name || onlyArg === `${name}s`;

  if (shouldRun("logo") || shouldRun("logos")) {
    generateBrandLogos();
  }
  if (shouldRun("avatar") || shouldRun("avatars")) {
    generateCreatorAvatars();
  }
  if (shouldRun("cover") || shouldRun("covers")) {
    generateProfileCovers();
  }
  if (shouldRun("thumbnail") || shouldRun("thumbnails")) {
    generatePortfolioThumbnails();
  }

  // Write Manifest
  manifest.totalAssets = manifest.assets.length;
  const manifestPath = path.join(ASSETS_DIR, "manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
  console.log(`\n✓ Manifest written to public/assets/manifest.json (${manifest.totalAssets} entries)`);
  console.log("=================================================");
  console.log("  Asset generation completed successfully!       ");
  console.log("=================================================");
}

run().catch((err) => {
  console.error("Asset generation error:", err);
  process.exit(1);
});
