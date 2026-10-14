/**
 * Seed Dataset Taxonomy, Fictional Entities, and Cultural Dictionaries
 * Strictly synthetic fictional data for CacheFlow demo profiles.
 */

import { Specialization, ToolCategory } from "@/types/schema";

// ============================================================================
// 1. Catalog Tools & Realistic Production Pipelines
// ============================================================================

export interface ToolDef {
  id: string;
  name: string;
  category: ToolCategory;
  vendor: string;
}

export const CATALOG_TOOLS: readonly ToolDef[] = [
  { id: "flux-1-dev", name: "FLUX.1 [dev]", category: "image_gen", vendor: "Black Forest Labs" },
  { id: "flux-1-pro", name: "FLUX.1 [pro]", category: "image_gen", vendor: "Black Forest Labs" },
  { id: "sdxl-base", name: "SDXL 1.0", category: "image_gen", vendor: "Stability AI" },
  { id: "midjourney-v7", name: "Midjourney v7", category: "image_gen", vendor: "Midjourney" },
  { id: "runway-gen3", name: "Runway Gen-3 Alpha", category: "video_gen", vendor: "Runway" },
  { id: "runway-gen4", name: "Runway Gen-4", category: "video_gen", vendor: "Runway" },
  { id: "kling-1-5", name: "Kling 1.5", category: "video_gen", vendor: "Kuaishou" },
  { id: "luma-dream-machine", name: "Luma Dream Machine", category: "video_gen", vendor: "Luma AI" },
  { id: "veo-2", name: "Veo 2", category: "video_gen", vendor: "Google DeepMind" },
  { id: "pika-2", name: "Pika 2.0", category: "video_gen", vendor: "Pika Labs" },
  { id: "animatediff", name: "AnimateDiff", category: "video_gen", vendor: "AnimateDiff Open" },
  { id: "comfy-ui", name: "ComfyUI", category: "workflow_engine", vendor: "Comfy Org" },
  { id: "forge-webui", name: "SD WebUI Forge", category: "workflow_engine", vendor: "lllyasviel" },
  { id: "invoke-ai", name: "InvokeAI", category: "workflow_engine", vendor: "Invoke" },
  { id: "topaz-video-ai", name: "Topaz Video AI", category: "upscaler", vendor: "Topaz Labs" },
  { id: "elevenlabs", name: "ElevenLabs Voice & SFX", category: "audio", vendor: "ElevenLabs" },
  { id: "live-portrait", name: "LivePortrait", category: "lipsync", vendor: "KwaiVGI" },
  { id: "heygen", name: "HeyGen AI", category: "lipsync", vendor: "HeyGen" },
  { id: "nerf-studio", name: "Nerfstudio", category: "3d", vendor: "Nerfstudio Team" },
  { id: "davinci-resolve", name: "DaVinci Resolve Studio", category: "editing", vendor: "Blackmagic Design" },
] as const;

export const TOOL_IDS = CATALOG_TOOLS.map((t) => t.id);

// Verified realistic production pipelines
export const REALISTIC_TOOL_PAIRINGS: readonly (readonly string[])[] = [
  ["comfy-ui", "flux-1-dev", "davinci-resolve"],
  ["midjourney-v7", "runway-gen3", "topaz-video-ai"],
  ["comfy-ui", "sdxl-base", "animatediff", "davinci-resolve"],
  ["elevenlabs", "heygen", "topaz-video-ai"],
  ["flux-1-pro", "runway-gen4", "topaz-video-ai"],
  ["comfy-ui", "flux-1-dev", "live-portrait", "elevenlabs"],
  ["kling-1-5", "topaz-video-ai", "davinci-resolve"],
  ["luma-dream-machine", "elevenlabs", "davinci-resolve"],
  ["veo-2", "davinci-resolve", "topaz-video-ai"],
  ["pika-2", "midjourney-v7", "elevenlabs"],
  ["comfy-ui", "nerf-studio", "davinci-resolve"],
  ["invoke-ai", "sdxl-base", "topaz-video-ai"],
  ["forge-webui", "flux-1-dev", "topaz-video-ai"],
];

// ============================================================================
// 2. The 12 Required Marketplace Specializations
// ============================================================================

export const MARKETPLACE_SPECIALIZATIONS: readonly Specialization[] = [
  "AI film/short film",
  "AI animation (2D/3D/anime)",
  "product ads",
  "music videos",
  "fashion/lookbook",
  "social shorts",
  "explainer/educational",
  "game assets/concept art",
  "architecture/real estate visualization",
  "brand mascots/characters",
  "podcast/audio and voice",
  "VFX/upscaling/restoration",
] as const;

// ============================================================================
// 3. Platform Skills Taxonomy ($\ge 12$ creators each)
// ============================================================================

export const PLATFORM_SKILLS = [
  "Prompt Engineering & Latent Guidance",
  "LoRA Training & Character Fine-Tuning",
  "Consistent Multi-Shot Character Rigging",
  "ComfyUI Node Graph Architecture",
  "ControlNet (Depth / Canny / OpenPose)",
  "Audio-Driven Lip-Sync & Phoneme Mapping",
  "Neural Frame Interpolation & Upscaling",
  "Camera Path Choreography & Motion Vectors",
  "3D Gaussian Splatting & NeRF Capture",
  "Neural Voice Cloning & Sound Design",
  "IP-Adapter & Reference Conditioning",
  "Post-Production Grading & Compositing",
] as const;

export type PlatformSkill = (typeof PLATFORM_SKILLS)[number];

// ============================================================================
// 4. Cultural Demographics (24 Countries, 16 Timezones, 14 Languages)
// ============================================================================

export interface CulturalHub {
  country: string;
  city: string;
  timezone: string;
  primaryLanguage: string;
  firstNames: string[];
  lastNames: string[];
}

export const CULTURAL_HUBS: readonly CulturalHub[] = [
  {
    country: "Japan",
    city: "Tokyo, Japan",
    timezone: "UTC+09:00",
    primaryLanguage: "Japanese",
    firstNames: ["Ren", "Aoi", "Kaito", "Hana", "Haruto", "Yuna", "Souta", "Mei"],
    lastNames: ["Takahashi", "Watanabe", "Ito", "Nakamura", "Kobayashi", "Yamamoto", "Saito"],
  },
  {
    country: "Germany",
    city: "Berlin, Germany",
    timezone: "UTC+01:00",
    primaryLanguage: "German",
    firstNames: ["Lukas", "Mia", "Finn", "Hannah", "Leon", "Emilia", "Jonas"],
    lastNames: ["Weber", "Müller", "Schneider", "Fischer", "Becker", "Hoffmann"],
  },
  {
    country: "United Kingdom",
    city: "London, UK",
    timezone: "UTC+00:00",
    primaryLanguage: "English",
    firstNames: ["Arthur", "Florence", "Oliver", "Amelia", "George", "Isla", "Harry"],
    lastNames: ["Sterling", "Pendleton", "Vance", "Thorne", "Wright", "MacDonald"],
  },
  {
    country: "United States",
    city: "San Francisco, CA",
    timezone: "UTC-08:00",
    primaryLanguage: "English",
    firstNames: ["Julian", "Sienna", "Marcus", "Aria", "Miles", "Chloe", "Dashiell"],
    lastNames: ["Rivera", "Chen", "Kaufman", "Vance", "Mercer", "Lin", "Reed"],
  },
  {
    country: "United States",
    city: "Denver, CO",
    timezone: "UTC-07:00",
    primaryLanguage: "English",
    firstNames: ["Caleb", "Maya", "Logan", "Brooke", "Wyatt", "Harper"],
    lastNames: ["Sinclair", "Hawthorne", "Carver", "West", "Bennett"],
  },
  {
    country: "Canada",
    city: "Montreal, Canada",
    timezone: "UTC-05:00",
    primaryLanguage: "French",
    firstNames: ["Étienne", "Camille", "Mathieu", "Béatrice", "Laurent", "Noémie"],
    lastNames: ["Tremblay", "Gagnon", "Roy", "Bouchard", "Gauthier", "Morin"],
  },
  {
    country: "South Korea",
    city: "Seoul, South Korea",
    timezone: "UTC+09:00",
    primaryLanguage: "Korean",
    firstNames: ["Min-jun", "Seo-yeon", "Do-hyun", "Ji-woo", "Ha-joon", "Eun-ji"],
    lastNames: ["Kim", "Lee", "Park", "Choi", "Jung", "Kang"],
  },
  {
    country: "Brazil",
    city: "São Paulo, Brazil",
    timezone: "UTC-03:00",
    primaryLanguage: "Portuguese",
    firstNames: ["Mateo", "Valentina", "Thiago", "Beatriz", "Lucas", "Mariana"],
    lastNames: ["Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira"],
  },
  {
    country: "France",
    city: "Paris, France",
    timezone: "UTC+01:00",
    primaryLanguage: "French",
    firstNames: ["Gabriel", "Inès", "Raphaël", "Léa", "Louis", "Manon"],
    lastNames: ["Dupont", "Mercier", "Laurent", "Moreau", "Simon", "Michel"],
  },
  {
    country: "Chile",
    city: "Santiago, Chile",
    timezone: "UTC-04:00",
    primaryLanguage: "Spanish",
    firstNames: ["Matías", "Isidora", "Benjamín", "Florencia", "Agustín"],
    lastNames: ["Muñoz", "Rojas", "Díaz", "Pérez", "Soto", "Contreras"],
  },
  {
    country: "Netherlands",
    city: "Amsterdam, Netherlands",
    timezone: "UTC+01:00",
    primaryLanguage: "Dutch",
    firstNames: ["Daan", "Sanne", "Bram", "Fleur", "Lars", "Tess"],
    lastNames: ["De Jong", "Van Dijk", "Bakker", "Janssen", "Visser"],
  },
  {
    country: "Australia",
    city: "Melbourne, Australia",
    timezone: "UTC+10:00",
    primaryLanguage: "English",
    firstNames: ["Lachlan", "Harper", "Koa", "Matilda", "Cooper", "Ruby"],
    lastNames: ["Callaghan", "O'Connor", "Mitchell", "Thornton", "Dunne"],
  },
  {
    country: "Singapore",
    city: "Singapore",
    timezone: "UTC+08:00",
    primaryLanguage: "English",
    firstNames: ["Khai", "Shermaine", "Zhi-Wei", "Rachel", "Bryan", "Mei-Ling"],
    lastNames: ["Tan", "Lim", "Wee", "Teo", "Khoo", "Goh"],
  },
  {
    country: "UAE",
    city: "Dubai, UAE",
    timezone: "UTC+04:00",
    primaryLanguage: "Arabic",
    firstNames: ["Zayd", "Nour", "Tariq", "Layla", "Faris", "Mariam"],
    lastNames: ["Al-Mansoor", "Al-Hashimi", "Qasim", "Siddiqui", "Mirza"],
  },
  {
    country: "Kenya",
    city: "Nairobi, Kenya",
    timezone: "UTC+03:00",
    primaryLanguage: "English",
    firstNames: ["Jabari", "Amani", "Kofi", "Zola", "Tendai", "Nia"],
    lastNames: ["Mwangi", "Kiprono", "Ochieng", "Kariuki", "Wanjiku"],
  },
  {
    country: "Thailand",
    city: "Bangkok, Thailand",
    timezone: "UTC+07:00",
    primaryLanguage: "Thai",
    firstNames: ["Somchai", "Apinya", "Kittisak", "Malee", "Thanakorn"],
    lastNames: ["Saelim", "Prasert", "Rattana", "Chaiyaporn", "Suksom"],
  },
  {
    country: "Taiwan",
    city: "Taipei, Taiwan",
    timezone: "UTC+08:00",
    primaryLanguage: "Mandarin",
    firstNames: ["Bo-Yu", "Yu-Ting", "Cheng-Han", "Yi-Shan", "Guan-Yu"],
    lastNames: ["Chang", "Hsu", "Huang", "Chen", "Kuo"],
  },
  {
    country: "New Zealand",
    city: "Auckland, New Zealand",
    timezone: "UTC+12:00",
    primaryLanguage: "English",
    firstNames: ["Rawiri", "Aroha", "Finn", "Kiri", "Brodie", "Talia"],
    lastNames: ["Te Kawa", "Henare", "MacKenzie", "Tawhai", "Ellis"],
  },
  {
    country: "Nigeria",
    city: "Lagos, Nigeria",
    timezone: "UTC+01:00",
    primaryLanguage: "English",
    firstNames: ["Amara", "Tunde", "Zainab", "Chinedu", "Simi", "Femi"],
    lastNames: ["Okafor", "Adeyemi", "Eze", "Balogun", "Mensah", "Oladipo"],
  },
  {
    country: "India",
    city: "Bengaluru, India",
    timezone: "UTC+05:30",
    primaryLanguage: "Hindi",
    firstNames: ["Arjun", "Ananya", "Rohan", "Diya", "Kabir", "Isha"],
    lastNames: ["Patel", "Sharma", "Nair", "Iyer", "Chowdhury", "Mehta"],
  },
  {
    country: "Mexico",
    city: "Mexico City, Mexico",
    timezone: "UTC-06:00",
    primaryLanguage: "Spanish",
    firstNames: ["Gael", "Ximena", "Emiliano", "Camila", "Santiago", "Renata"],
    lastNames: ["Morales", "Guerrero", "Reyes", "Salazar", "Mendoza"],
  },
  {
    country: "South Africa",
    city: "Cape Town, South Africa",
    timezone: "UTC+02:00",
    primaryLanguage: "English",
    firstNames: ["Liam", "Lindiwe", "Sipho", "Kayla", "Zubair", "Chloe"],
    lastNames: ["Van Zyl", "Botha", "Ndlovu", "Naidoo", "Pillay"],
  },
  {
    country: "Argentina",
    city: "Buenos Aires, Argentina",
    timezone: "UTC-03:00",
    primaryLanguage: "Spanish",
    firstNames: ["Facundo", "Delfina", "Bautista", "Catalina", "Joaquín"],
    lastNames: ["Roldán", "Ferreyra", "Cabral", "Ledesma", "Benítez"],
  },
  {
    country: "United States",
    city: "Honolulu, HI",
    timezone: "UTC-10:00",
    primaryLanguage: "English",
    firstNames: ["Keanu", "Leilani", "Kai", "Moana", "Koa", "Mahina"],
    lastNames: ["Kalani", "Akana", "Kealoha", "Kamaka", "Palakiko"],
  },
];

// ============================================================================
// 5. Natural Voice Bio Archetypes (Distinct, 2-4 sentences, NO templates)
// ============================================================================

export const BIO_ARCHETYPES = [
  "Specializing in luxury fashion lookbooks and editorial character consistency. I build proprietary ComfyUI LoRAs that preserve fabric textures, drape physics, and couture lighting across multi-scene runs. Every campaign deliverable is fully cleared with indemnified enterprise checkpoints.",
  "Commercial animator and technical director crafting 3D and anime shorts with flawless temporal coherence. My custom AnimateDiff and LivePortrait nodes eradicate flicker, allowing fast vertical turnarounds for global brands. Based in Tokyo, working with broadcast and social studios.",
  "Cinematographer turned generative AI filmmaker. I construct camera motion paths using ControlNet depth maps and optical flow vectors in DaVinci Resolve. When you need authentic cinematic lighting and lens aberration instead of generic diffusion mush, we speak the same language.",
  "Lead architect of virtual product launches and cinematic automotive spots. Utilizing FLUX.1 Pro and custom geometry meshes, I render photo-real packshots with mathematically verifiable reflections. Over 40 commercial client deliverables cleared for global television and billboard campaigns.",
  "Music video director exploring the borderlands of generative psychedelia and tight audio-reactive beat cuts. I pair Runway Gen-4 with custom audio spectrogram triggers to build rhythmically locked visual journeys. Previous works featured across streaming festivals and viral label drops.",
  "Social-first creative technologist obsessed with 9:16 vertical retention and viral hooks. I optimize rendering pipelines for sub-48-hour turnarounds without ever sacrificing high-end color grading. Trusted by DTC brands and venture-backed startups looking for scalable video velocity.",
  "Bridging complex educational topics with kinetic typography, AI avatars, and multi-track audio engineering. My explainers transform dense technical whitepapers into lucid, engaging motion pieces. Certified deterministic DAGs ensure all charts and branding stay 100% compliant.",
  "Concept artist and worldbuilder producing turnkey asset packs for indie and AAA game studios. From isometric tilemaps to full 360-degree character model sheets, I train bespoke LoRAs that match art direction within pixel-perfect tolerance. Available for deep narrative collaborations.",
  "Architectural visualizer specializing in photorealistic daylight simulation and environmental atmosphere. I translate CAD blueprints and SketchUp volumes into rich cinematic walkthroughs with seasonal lighting cycles. Proudly delivering uncompressed 4K master files with clean commercial rights.",
  "Brand mascot sculptor crafting enduring synthetic characters with emotional depth. My proprietary multi-angle turnaround workflows guarantee exact facial proportions and wardrobe fidelity across dozens of episodic marketing spots. Let us bring your IP to life.",
  "Audio engineer and voice architect combining neural voice cloning with tactile Foley sound design. I turn silent AI video generation into thunderous, room-shaking cinematic experiences with pristine binaural audio. Serving podcast studios, gaming houses, and trailer editors.",
  "Senior VFX restoration specialist focused on neural super-resolution, grain synthesis, and temporal de-flicker. I take rough model generations and elevate them to broadcast 4K DCI mastering standards using Topaz and deep node compositing. No artifact escapes uncorrected.",
] as const;

// ============================================================================
// 6. Fictional Brand Catalog (40 Brands / Agencies)
// ============================================================================

export interface SeedBrand {
  id: string;
  name: string;
  handle: string;
  industry: string;
  avatarGradient: [string, string];
  description: string;
  website: string;
}

export const SEED_BRANDS: readonly SeedBrand[] = [
  { id: "brand-01", name: "Lumina Haute Couture", handle: "lumina_fashion", industry: "Luxury Fashion", avatarGradient: ["#8B5CF6", "#EC4899"], description: "Parisian luxury fashion house pioneering digital haute-couture and generative runway presentations.", website: "https://lumina-couture.example.com" },
  { id: "brand-02", name: "Aether Dynamics", handle: "aether_aero", industry: "Aerospace & Tech", avatarGradient: ["#3B82F6", "#06B6D4"], description: "Next-generation sustainable aerospace lab designing atmospheric orbital propulsion visual concepts.", website: "https://aetherdynamics.example.com" },
  { id: "brand-03", name: "Apex Interactive", handle: "apex_interactive", industry: "Game Development", avatarGradient: ["#F97316", "#EF4444"], description: "Independent AAA game studio crafting rich procedural sci-fi roleplaying worlds.", website: "https://apex-games.example.com" },
  { id: "brand-04", name: "Saffron Botanicals", handle: "saffron_botanicals", industry: "Skincare & Wellness", avatarGradient: ["#10B981", "#F59E0B"], description: "Clean organic skincare utilizing rare Himalayan adaptogens and micro-encapsulated botanicals.", website: "https://saffronbotanicals.example.com" },
  { id: "brand-05", name: "Velocity Electric Vehicles", handle: "velocity_ev", industry: "Automotive", avatarGradient: ["#6366F1", "#14B8A6"], description: "Design-forward luxury electric mobility firm known for sculptural Scandinavian vehicle silhouettes.", website: "https://velocity-ev.example.com" },
  { id: "brand-06", name: "Pulse Energy Labs", handle: "pulse_energy", industry: "Beverage & Sports", avatarGradient: ["#EF4444", "#FACC15"], description: "Clean nootropic hydration and sparkling energy beverages designed for esports and endurance athletes.", website: "https://pulseenergy.example.com" },
  { id: "brand-07", name: "Kinetix Audio Systems", handle: "kinetix_sound", industry: "Consumer Hardware", avatarGradient: ["#1F2937", "#6B7280"], description: "Boutique spatial audio headphones and planar magnetic monitors with artisan brushed titanium finishes.", website: "https://kinetixaudio.example.com" },
  { id: "brand-08", name: "Arcadia Real Estate", handle: "arcadia_living", industry: "Luxury Real Estate", avatarGradient: ["#D97706", "#92400E"], description: "Ultra-luxury architectural developments set along Mediterranean cliffs and Scandinavian coastlines.", website: "https://arcadialuxury.example.com" },
  { id: "brand-09", name: "Chronos Horology", handle: "chronos_watches", industry: "Luxury Watches", avatarGradient: ["#4B5563", "#D1D5DB"], description: "Swiss mechanical timepieces celebrating astronomical celestial complications and skeleton tourbillons.", website: "https://chronos-watches.example.com" },
  { id: "brand-10", name: "Neon Horizon Records", handle: "neon_horizon", industry: "Music Label", avatarGradient: ["#EC4899", "#8B5CF6"], description: "Independent synthwave, cyberpunk, and hyper-pop music label producing world-building visuals.", website: "https://neonhorizon.example.com" },
  { id: "brand-11", name: "Helios Solar Architecture", handle: "helios_solar", industry: "CleanTech", avatarGradient: ["#F59E0B", "#10B981"], description: "Integrating solar-harvesting photovoltaic glass into architectural skyscrapers worldwide.", website: "https://heliossolar.example.com" },
  { id: "brand-12", name: "Mirai Robotics", handle: "mirai_robotics", industry: "AI & Robotics", avatarGradient: ["#0284C7", "#38BDF8"], description: "Humanoid companion and warehouse logistics robotics company headquartered in Osaka.", website: "https://mirairobotics.example.com" },
  { id: "brand-13", name: "Terra Verde Superfoods", handle: "terra_verde", industry: "Organic Food", avatarGradient: ["#059669", "#84CC16"], description: "Regenerative agriculture superfood powders and ethical cold-pressed oils.", website: "https://terraverde.example.com" },
  { id: "brand-14", name: "Verve Media Agency", handle: "verve_agency", industry: "Creative Agency", avatarGradient: ["#9333EA", "#C084FC"], description: "High-growth DTC agency driving performance TikTok and Reels campaigns for consumer brands.", website: "https://verveagency.example.com" },
  { id: "brand-15", name: "Zephyr Ultralight Gear", handle: "zephyr_outdoor", industry: "Outdoor Apparel", avatarGradient: ["#0EA5E9", "#10B981"], description: "Zero-compromise alpine mountaineering jackets and storm-tested ultralight tents.", website: "https://zephyroutdoor.example.com" },
  { id: "brand-16", name: "Prism Optics", handle: "prism_eyewear", industry: "Eyewear & Fashion", avatarGradient: ["#F43F5E", "#FB7185"], description: "Japanese titanium optical frames and chromatic gradient sunglasses crafted in Sabae.", website: "https://prismoptics.example.com" },
  { id: "brand-17", name: "Onyx Coffee Roasters", handle: "onyx_roasters", industry: "Specialty Coffee", avatarGradient: ["#78350F", "#B45309"], description: "Single-origin fermentation experimental coffees sourced directly from smallholder farms.", website: "https://onyxroasters.example.com" },
  { id: "brand-18", name: "Strata Spatial Computing", handle: "strata_spatial", industry: "Spatial VR/AR", avatarGradient: ["#6366F1", "#A855F7"], description: "Spatial holographic operating systems and mixed reality enterprise collaboration tools.", website: "https://strataspatial.example.com" },
  { id: "brand-19", name: "Solstice Spirits", handle: "solstice_distillery", industry: "Artisan Spirits", avatarGradient: ["#B45309", "#FBBF24"], description: "Botanical coastal gin and small-batch agave spirits infused with foraged kelp and citrus peel.", website: "https://solsticespirits.example.com" },
  { id: "brand-20", name: "Neural Foundry", handle: "neural_foundry", industry: "Developer Tools", avatarGradient: ["#1E293B", "#334155"], description: "Open compute orchestration platform for fine-tuning diffusion and multimodal transformer models.", website: "https://neuralfoundry.example.com" },
  { id: "brand-21", name: "Crestline Financial", handle: "crestline_fin", industry: "Fintech", avatarGradient: ["#0F172A", "#38BDF8"], description: "Algorithmic treasury management and international cross-border FX settlements.", website: "https://crestline.example.com" },
  { id: "brand-22", name: "Biome Nutrition", handle: "biome_health", industry: "Nutraceuticals", avatarGradient: ["#15803D", "#86EFAC"], description: "Personalized microbiome prebiotic formulations and longevity peptides.", website: "https://biomenutrition.example.com" },
  { id: "brand-23", name: "Forma Architectural Tile", handle: "forma_surfaces", industry: "Interior Design", avatarGradient: ["#78716C", "#D6D3D1"], description: "Handcrafted architectural terracotta, fluted concrete tiles, and glazed volcanic stone.", website: "https://formatile.example.com" },
  { id: "brand-24", name: "Echo Wave Soundscapes", handle: "echowave_media", industry: "Podcast Network", avatarGradient: ["#831843", "#F472B6"], description: "Award-winning investigative audio documentaries and spatial fiction podcasts.", website: "https://echowave.example.com" },
  { id: "brand-25", name: "Siren Swimwear", handle: "siren_swim", industry: "Resort Fashion", avatarGradient: ["#0D9488", "#2DD4BF"], description: "Recycled ocean-bound plastic swimwear and sculptural resort apparel.", website: "https://sirenswim.example.com" },
  { id: "brand-26", name: "Kurogane Steel Works", handle: "kurogane_forge", industry: "Culinary Hardware", avatarGradient: ["#374151", "#9CA3AF"], description: "Damascus steel kitchen knives forged in Sakai, Japan using blue super carbon steel.", website: "https://kuroganesteel.example.com" },
  { id: "brand-27", name: "OmniPet Health", handle: "omnipet_care", industry: "Pet Wellness", avatarGradient: ["#EA580C", "#FDBA74"], description: "Veterinary-developed fresh whole food subscriptions and cellular joint mobility supplements.", website: "https://omnipet.example.com" },
  { id: "brand-28", name: "Vortex Gaming Gear", handle: "vortex_gaming", industry: "Esports Hardware", avatarGradient: ["#991B1B", "#F87171"], description: "Ultralight carbon fiber gaming mice and rapid-trigger magnetic Hall effect keyboards.", website: "https://vortexgear.example.com" },
  { id: "brand-29", name: "Aura Meditation", handle: "aura_mindfulness", industry: "Mental Wellness", avatarGradient: ["#4338CA", "#818CF8"], description: "Neuroscience-backed breathwork and generative ambient soundscapes for deep focus.", website: "https://aurameditation.example.com" },
  { id: "brand-30", name: "Equinox Electric Bikes", handle: "equinox_mobility", industry: "Urban Transit", avatarGradient: ["#047857", "#34D399"], description: "Belt-driven urban commuter e-bikes with integrated GPS security and automatic gearboxes.", website: "https://equinoxbikes.example.com" },
  { id: "brand-31", name: "Starlight Hospitality Group", handle: "starlight_hotels", industry: "Boutique Hotels", avatarGradient: ["#1E1B4B", "#C084FC"], description: "Bespoke desert glamping pavilions and secluded architectural forest cabins.", website: "https://starlighthotels.example.com" },
  { id: "brand-32", name: "Bravura Classical Ensemble", handle: "bravura_ensemble", industry: "Performing Arts", avatarGradient: ["#701A75", "#E879F9"], description: "Modern chamber orchestra staging immersive spatial audiovisual concerts across Europe.", website: "https://bravura.example.com" },
  { id: "brand-33", name: "Nova Clean Energy", handle: "nova_power", industry: "Renewable Energy", avatarGradient: ["#0E7490", "#67E8F9"], description: "Next-generation deep geothermal heat drilling and grid-scale sodium battery arrays.", website: "https://novapower.example.com" },
  { id: "brand-34", name: "Mythic Lore Publishing", handle: "mythic_lore", industry: "Fantasy & Sci-Fi", avatarGradient: ["#831843", "#FB7185"], description: "Illustrated high-fantasy collector books and graphic novel world anthologies.", website: "https://mythiclore.example.com" },
  { id: "brand-35", name: "Vanguard Tactical", handle: "vanguard_tactical", industry: "Security & Tech", avatarGradient: ["#18181B", "#71717A"], description: "Autonomous drone defense mapping and perimeter security computer vision.", website: "https://vanguardtactical.example.com" },
  { id: "brand-36", name: "Nectar Wine Guild", handle: "nectar_wines", industry: "Natural Wine", avatarGradient: ["#881337", "#FB7185"], description: "Biodynamic unfiltered pét-nat wines produced from ancestral amphora clay vessels.", website: "https://nectarwine.example.com" },
  { id: "brand-37", name: "Alloy Heavy Machinery", handle: "alloy_industrial", industry: "Industrial Robotics", avatarGradient: ["#C2410C", "#FB923C"], description: "Autonomous electric mining haulers and zero-emission construction loaders.", website: "https://alloymachinery.example.com" },
  { id: "brand-38", name: "Silk & Stone Interiors", handle: "silk_stone", industry: "High-End Interiors", avatarGradient: ["#57534E", "#A8A29E"], description: "Minimalist Japanese-Scandinavian (Japandi) bespoke furniture and tactile linen drapery.", website: "https://silkstone.example.com" },
  { id: "brand-39", name: "Hyperion Satellite Telecom", handle: "hyperion_sat", industry: "Telecommunications", avatarGradient: ["#1E3A8A", "#60A5FA"], description: "Low Earth orbit laser-mesh satellite constellations delivering gigabit oceanic connectivity.", website: "https://hyperionsat.example.com" },
  { id: "brand-40", name: "Zest Botanical Tonics", handle: "zest_tonics", industry: "Functional Beverages", avatarGradient: ["#A21CAF", "#F472B6"], description: "Sparkling bitter aperitifs brewed from gentian root, blood orange, and California bay laurel.", website: "https://zesttonics.example.com" },
];

// ============================================================================
// 7. Gradient Palettes for Avatars & Visual Artworks
// ============================================================================

export const GRADIENT_PALETTES: readonly (readonly [string, string])[] = [
  ["#8B5CF6", "#06B6D4"],
  ["#EC4899", "#8B5CF6"],
  ["#3B82F6", "#10B981"],
  ["#F59E0B", "#EF4444"],
  ["#6366F1", "#EC4899"],
  ["#14B8A6", "#3B82F6"],
  ["#F97316", "#F59E0B"],
  ["#A855F7", "#3B82F6"],
  ["#06B6D4", "#3B82F6"],
  ["#10B981", "#14B8A6"],
  ["#84CC16", "#10B981"],
  ["#F43F5E", "#FB7185"],
  ["#0284C7", "#6366F1"],
  ["#7C3AED", "#DB2777"],
  ["#D97706", "#B45309"],
  ["#059669", "#0D9488"],
  ["#4F46E5", "#9333EA"],
  ["#2563EB", "#0891B2"],
  ["#BE185D", "#7C2D12"],
  ["#15803D", "#4D7C0F"],
];
