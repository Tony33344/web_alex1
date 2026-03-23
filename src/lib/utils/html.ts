import DOMPurify from 'isomorphic-dompurify';

/**
 * Process HTML content from rich text editor or Word paste.
 * - Preserves text-align styles on headings and paragraphs
 * - Removes Word-specific XML/conditional comments
 * - Keeps basic formatting (strong, em, ul, ol, li, h1-h6, p, br)
 * - Converts newlines to <br> if needed
 */
export function processHtmlContent(html: string | null | undefined): string {
  if (!html) return '';

  // If it's plain text with newlines, convert to <br>
  if (!/<[a-z][\s\S]*>/i.test(html)) {
    return html.replace(/\n/g, '<br />');
  }

  // Clean with DOMPurify, allowing text-align styles
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'div', 'br', 'span',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'strong', 'b', 'em', 'i', 'u',
      'ul', 'ol', 'li',
      'a', 'img',
      'blockquote', 'code', 'pre',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'style', 'class'],
    ALLOWED_STYLES: ['text-align'],
    KEEP_CONTENT: true,
  });

  return clean;
}

/**
 * Create a brief description from full description (fallback for homepage)
 */
export function createBriefDescription(description: string | null | undefined, maxLength: number = 120): string {
  if (!description) return '';
  // Strip HTML tags
  const plain = description.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  if (plain.length <= maxLength) return plain;
  return plain.slice(0, maxLength).replace(/\s+\S*$/, '') + '...';
}
