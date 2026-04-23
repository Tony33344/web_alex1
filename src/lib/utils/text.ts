/**
 * Convert plain-text newlines to HTML <br> tags.
 * If the text already contains HTML block tags, return as-is.
 */
export function nl2br(text: string): string {
  if (!text) return '';
  // If text already contains HTML block elements, assume it's formatted HTML
  if (/<\/?(?:p|div|br|ul|ol|li|h[1-6]|table|blockquote)\b/i.test(text)) {
    return text;
  }
  // Convert double newlines to paragraph breaks, single newlines to <br>
  return text
    .split(/\n\n+/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
    .join('');
}

/**
 * Embed video URLs as HTML video tags.
 * Supports MP4 videos from Supabase storage and other direct video URLs.
 */
export function embedVideos(text: string): string {
  if (!text) return '';
  
  // Match video URLs (MP4, WebM, OGG) from Supabase storage and other sources
  // Pattern matches URLs ending with video extensions
  const videoPattern = /(https?:\/\/[^\s<>"]+\.(?:mp4|webm|ogg|mov)(?:\?[^\s<>"]*)?)/gi;
  
  return text.replace(videoPattern, (url) => {
    return `<video controls class="w-full max-w-3xl rounded-lg my-4" preload="metadata">
      <source src="${url}" type="video/mp4">
      Your browser does not support the video tag.
    </video>`;
  });
}

/**
 * Process content: embed videos and convert newlines to HTML.
 * This combines video embedding with nl2br for comprehensive content formatting.
 */
export function processContent(text: string): string {
  if (!text) return '';
  
  // First embed videos
  const withVideos = embedVideos(text);
  
  // Then apply nl2br
  return nl2br(withVideos);
}
