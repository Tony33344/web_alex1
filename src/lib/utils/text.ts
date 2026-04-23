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

  if (youtubePattern.test(text)) {
    const match = text.match(youtubePattern);
    if (match?.[1]) {
      return `<iframe
        class="my-4 aspect-video w-full max-w-3xl rounded-lg"
        src="https://www.youtube.com/embed/${match[1]}"
        title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
      ></iframe>`;
    }
  }

  const videoUrl = text.match(supabasePattern)?.[0] || text.match(videoPattern)?.[0];
  if (videoUrl) {
    return `<video controls class="my-4 aspect-video w-full max-w-3xl rounded-lg" preload="metadata">
      <source src="${videoUrl}" type="video/mp4">
      Your browser does not support the video tag. <a href="${videoUrl}" target="_blank" rel="noopener noreferrer">Click here to view the video</a>.
    </video>`;
  }

  return text;
}

/**
 * Process content: embed videos and convert newlines to HTML.
 * This combines video embedding with nl2br for comprehensive content formatting.
 */
export function processContent(text: string): string {
  if (!text) return '';

  // Preserve explicit HTML content as-is, but still allow embedded media URLs.
  if (/<\/?(?:p|div|br|ul|ol|li|h[1-6]|table|blockquote|iframe|video)\b/i.test(text)) {
    return embedVideos(text);
  }

  const lines = text.split(/\n+/).map((line) => line.trim());

  return lines
    .filter(Boolean)
    .map((line) => {
      const embedded = embedVideos(line);
      if (embedded !== line) return embedded;
      return `<p>${line.replace(/\n/g, '<br>')}</p>`;
    })
    .join('');
}
