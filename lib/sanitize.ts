import sanitizeHtmlLib from "sanitize-html";

const ALLOWED_TAGS = ["p", "br", "strong", "em", "b", "i", "ul", "ol", "li", "a"];

/**
 * Sanitize rich-text HTML before storing or rendering.
 * Uses sanitize-html (Node-compatible) — isomorphic-dompurify breaks on Vercel
 * due to jsdom / ESM require conflicts.
 */
export function sanitizeHtml(dirty: string): string {
  return sanitizeHtmlLib(dirty, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "target", "rel"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtmlLib.simpleTransform("a", {
        rel: "noopener noreferrer",
        target: "_blank",
      }),
    },
  });
}
