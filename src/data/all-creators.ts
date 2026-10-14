/**
 * Aggregated creator and portfolio repository
 * Exposes the full 140+ seeded demo creator dataset for discovery and directory browsing,
 * while maintaining referential integrity with base fixtures.
 */

import { CREATORS as BASE_CREATORS } from "./creators";
import { PORTFOLIO_ITEMS as BASE_PORTFOLIO } from "./portfolio";
import { BRIEFS as BASE_BRIEFS } from "./briefs";
export const ALL_CREATORS = BASE_CREATORS;
export const ALL_PORTFOLIO_ITEMS = BASE_PORTFOLIO;
export const ALL_BRIEFS = BASE_BRIEFS;
