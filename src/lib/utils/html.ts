/**
 * Process HTML content from rich text editor or Word paste.
 * - Preserves text-align styles on headings and paragraphs
 * - Removes dangerous tags (script, iframe, etc.)
 * - Keeps basic formatting (strong, em, ul, ol, li, h1-h6, p, br)
 * - Converts newlines to <br> if needed
 */
export function processHtmlContent(html: string | null | undefined): string {
  if (!html) return '';

  // If it's plain text with newlines, convert to <br>
  if (!/<[a-z][\s\S]*>/i.test(html)) {
    return html.replace(/\n/g, '<br />');
  }

  // Simple sanitization - remove dangerous tags and attributes
  let clean = html
    // Remove script tags and content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove iframe, object, embed, form tags
    .replace(/<(iframe|object|embed|form|input|button|textarea|select)\b[^>]*>/gi, '')
    .replace(/<\/(iframe|object|embed|form|input|button|textarea|select)>/gi, '')
    // Remove on* event handlers
    .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/\s*on\w+\s*=\s*[^\s>]+/gi, '')
    // Remove javascript: URLs
    .replace(/javascript:/gi, '');

  return clean;
}

/**
 * Create a brief description from full description (fallback for homepage)
 */
export function createBriefDescription(description: string | null | undefined, maxLength: number = 120): string {
  if (!description) return '';
  // Convert block-level tags and line breaks to spaces before stripping HTML
  const withSpaces = description
    .replace(/<\/p>/gi, ' ')
    .replace(/<\/div>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/li>/gi, ' ')
    .replace(/<\/h[1-6]>/gi, ' ');
  // Strip all remaining HTML tags
  const plain = withSpaces.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  if (plain.length <= maxLength) return plain;
  return plain.slice(0, maxLength).replace(/\s+\S*$/, '') + '...';
}
