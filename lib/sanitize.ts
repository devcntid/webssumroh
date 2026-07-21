import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = ["p", "br", "strong", "em", "b", "i", "ul", "ol", "li", "a"];
const ALLOWED_ATTR = ["href", "target", "rel"];

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  });
}
