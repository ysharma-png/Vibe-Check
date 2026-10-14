/**
 * Robust Input Sanitization & Stored XSS Protection
 *
 * Sanitizes rich text, descriptions, creative briefs, creator bios, and chat messages.
 * Enforces:
 * 1. Complete elimination of executable tags: <script>, <style>, <iframe>, <object>, <embed>, <svg>, <math>
 * 2. Neutralization of inline event handlers: onload, onerror, onclick, onmouseover, etc.
 * 3. Stripping of dangerous URI schemes: javascript:, data:text/html, vbscript:
 * 4. Safe escaping of plain text before rendering
 */

// Complete script/style block pattern including inner content
const SCRIPT_STYLE_BLOCKS_REGEX = /<\s*(script|style|iframe|object|embed|svg|math|applet)\b[\s\S]*?<\s*\/\s*\1\s*>/gi;

// Dangerous HTML tag pattern (self-closing or dangling)
const DANGEROUS_TAGS_REGEX = /<\s*\/?\s*(script|style|iframe|object|embed|svg|math|applet|meta|link|base|form|input|button)\b[^>]*>/gi;

// Inline event handlers pattern (e.g. onload=..., onerror=...)
const EVENT_HANDLER_REGEX = /\s+on[a-z0-9_-]+\s*=\s*(['"][^'"]*['"]|[^\s>]+)/gi;

// Dangerous URI schemes pattern
const DANGEROUS_URI_REGEX = /(javascript|vbscript|data\s*:\s*text\/html)\s*:/gi;

// Allowed safe HTML tags: b, i, em, strong, p, br, ul, ol, li, code, pre, a
const SAFE_TAG_ALLOWLIST = new Set([
  "b",
  "i",
  "em",
  "strong",
  "p",
  "br",
  "ul",
  "ol",
  "li",
  "code",
  "pre",
  "a",
]);

/**
 * Escapes HTML special characters for strict plain-text rendering.
 */
export function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Sanitizes rich-text input by removing all dangerous tags, scripts, and event handlers.
 * Preserves safe structural tags if specified.
 */
export function sanitizeRichText(dirtyHtml: string): string {
  if (!dirtyHtml || typeof dirtyHtml !== "string") return "";

  let cleaned = dirtyHtml;

  // 1. Remove dangerous executable tag blocks (including inner content)
  cleaned = cleaned.replace(SCRIPT_STYLE_BLOCKS_REGEX, "");
  cleaned = cleaned.replace(DANGEROUS_TAGS_REGEX, "");

  // 2. Remove any inline event handlers (onerror, onload, etc.)
  cleaned = cleaned.replace(EVENT_HANDLER_REGEX, "");

  // 3. Remove dangerous URI schemes (javascript:, etc.)
  cleaned = cleaned.replace(DANGEROUS_URI_REGEX, "blocked-scheme:");

  // 4. Clean attributes on any remaining tags, ensuring links have rel="noopener noreferrer"
  cleaned = cleaned.replace(/<([a-z0-9]+)([^>]*)>/gi, (match, tagName: string, rawAttrs: string) => {
    const lowerTag = tagName.toLowerCase();
    if (!SAFE_TAG_ALLOWLIST.has(lowerTag)) {
      // Disallowed tag - escape or strip
      return "";
    }

    if (lowerTag === "a") {
      // Extract href if safe
      const hrefMatch = /href\s*=\s*['"]([^'"]*)['"]/i.exec(rawAttrs);
      if (hrefMatch && hrefMatch[1]) {
        const href = hrefMatch[1].trim();
        if (/^(https?:\/\/|\/|mailto:)/i.test(href) && !DANGEROUS_URI_REGEX.test(href)) {
          return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">`;
        }
      }
      return "<a>";
    }

    return `<${lowerTag}>`;
  });

  return cleaned.trim();
}

/**
 * Sanitizes single-line fields such as titles, handles, names, and tags.
 */
export function sanitizePlainText(text: string): string {
  if (!text || typeof text !== "string") return "";
  // Strip all tags completely and trim whitespace
  return text
    .replace(/<[^>]*>?/gm, "")
    .replace(/[\r\n\t]+/g, " ")
    .trim();
}
