/**
 * Convert plain-text newlines to HTML <br> tags.
 * If the text already contains HTML block tags, return as-is.
 */
export function nl2br(text: string): string {
  if (!text) return '';
  // If text already contains HTML block elements, assume it's formatted HTML
  if (/<\/?(?:p|div|br|ul|ol|li|h[1-6]|table|blockquote|video)\b/i.test(text)) {
    return text;
  }
  // Convert double newlines to paragraph breaks, single newlines to <br>
  return text
    .split(/\n\n+/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
    .join('');
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

/**
 * Embed video URLs as HTML video tags or YouTube iframes.
 * Supports YouTube URLs and MP4 videos from Supabase storage and other direct video URLs.
 */
export function embedVideos(text: string): string {
  if (!text) return '';

  // Match YouTube URLs (various formats)
  const youtubePattern = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;

  // Match Supabase storage video URLs
  const supabasePattern = /https?:\/\/[a-zA-Z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\/[^\s<>"]+/i;

  // Match direct video URLs
  const videoPattern = /https?:\/\/[^\s<>"]+\.(?:mp4|webm|ogg|mov)(?:\?[^\s<>"]*)?/i;

  const withYouTube = text.replace(youtubePattern, (_match, videoId) => {
    return `<iframe
      class="my-4 aspect-video w-full max-w-3xl rounded-lg"
      src="https://www.youtube.com/embed/${videoId}"
      title="YouTube video player"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
    ></iframe>`;
  });

  const withSupabase = withYouTube.replace(supabasePattern, (url) => {
    return `<video controls class="my-4 aspect-video w-full max-w-3xl rounded-lg" preload="metadata">
      <source src="${url}" type="video/mp4">
      Your browser does not support the video tag. <a href="${url}" target="_blank" rel="noopener noreferrer">Click here to view the video</a>.
    </video>`;
  });

  return withSupabase.replace(videoPattern, (url) => {
    return `<video controls class="my-4 aspect-video w-full max-w-3xl rounded-lg" preload="metadata">
      <source src="${url}" type="video/mp4">
      Your browser does not support the video tag. <a href="${url}" target="_blank" rel="noopener noreferrer">Click here to view the video</a>.
    </video>`;
  });
}

/**
 * Process content: embed videos and convert newlines to HTML.
 * This combines video embedding with nl2br for comprehensive content formatting.
 */
export function processContent(text: string): string {
  if (!text) return '';

  const decoded = decodeHtmlEntities(text);

  // Preserve explicit HTML content as-is, but still allow embedded media URLs.
  if (/<\/?(?:p|div|br|ul|ol|li|h[1-6]|table|blockquote|iframe|video)\b/i.test(decoded)) {
    return embedVideos(decoded);
  }

  return decoded
    .split(/\n\n+/)
    .map((paragraph) => {
      const embedded = embedVideos(paragraph.trim());
      if (!embedded) return '';
      if (embedded.includes('<iframe') || embedded.includes('<video')) return embedded;
      return `<p>${embedded.replace(/\n/g, '<br>')}</p>`;
    })
    .filter(Boolean)
    .join('');
}
