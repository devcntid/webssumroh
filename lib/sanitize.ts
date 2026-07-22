const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "em",
  "b",
  "i",
  "ul",
  "ol",
  "li",
  "a",
]);

/**
 * Lightweight HTML sanitizer for admin rich text.
 * Zero native/ESM deps — isomorphic-dompurify and sanitize-html both break on
 * Vercel Turbopack serverless (ERR_REQUIRE_ESM).
 *
 * Allows: p, br, strong, em, b, i, ul, ol, li, a[href|target|rel]
 * Strips scripts, event handlers, and unsafe URL schemes.
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty) return "";

  let html = dirty
    .replace(/<\s*(script|style)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\0/g, "");

  // Unwrap unsafe anchors (keep text content)
  html = html.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (_m, attrs: string, text: string) => {
    const href = pickAttr(attrs, "href");
    if (!href || !isSafeHref(href)) return text;
    const target = pickAttr(attrs, "target");
    const safeTarget = target === "_blank" ? ' target="_blank"' : "";
    return `<a href="${escapeAttr(href)}" rel="noopener noreferrer"${safeTarget}>${text}</a>`;
  });

  let openAnchors = 0;

  html = html.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)\/?>/g, (match, rawName: string, rawAttrs: string) => {
    const name = rawName.toLowerCase();
    const isClosing = match.startsWith("</");

    if (!ALLOWED_TAGS.has(name)) return "";

    if (name === "br") {
      return isClosing ? "" : "<br />";
    }

    if (name === "a") {
      if (isClosing) {
        if (openAnchors <= 0) return "";
        openAnchors -= 1;
        return "</a>";
      }
      // Anchors should already be normalized above; any leftover open <a> is dropped.
      const href = pickAttr(rawAttrs, "href");
      if (!href || !isSafeHref(href)) return "";
      openAnchors += 1;
      const target = pickAttr(rawAttrs, "target");
      const safeTarget = target === "_blank" ? ' target="_blank"' : "";
      return `<a href="${escapeAttr(href)}" rel="noopener noreferrer"${safeTarget}>`;
    }

    if (isClosing) return `</${name}>`;
    return `<${name}>`;
  });

  // Close any unbalanced anchors
  if (openAnchors > 0) {
    html += "</a>".repeat(openAnchors);
  }

  return html;
}

function pickAttr(attrBlob: string, name: string): string | null {
  const re = new RegExp(
    `\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`,
    "i"
  );
  const m = attrBlob.match(re);
  if (!m) return null;
  return decodeBasicEntities(m[1] ?? m[2] ?? m[3] ?? "").trim();
}

function isSafeHref(href: string): boolean {
  const value = href.trim();
  if (!value) return false;
  if (value.startsWith("#")) return false;
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*\s*:/.test(value)) {
    return /^(https?:|mailto:)/i.test(value);
  }
  return true;
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function decodeBasicEntities(value: string): string {
  return value
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&");
}
