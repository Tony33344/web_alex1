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
  const youtubePattern = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/gi;
  
  // Match Supabase storage video URLs
  const supabasePattern = /(https?:\/\/[a-zA-Z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\/[^\s<>"]+)/gi;
  
  // Match video URLs (MP4, WebM, OGG) from other sources
  const videoPattern = /(https?:\/\/[^\s<>"]+\.(?:mp4|webm|ogg|mov)(?:\?[^\s<>"]*)?)/gi;
  
  // First handle YouTube URLs
  text = text.replace(youtubePattern, (match, videoId) => {
    return `<iframe
      class="w-full max-w-3xl rounded-lg my-4 aspect-video"
      src="https://www.youtube.com/embed/${videoId}"
      title="YouTube video player"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
    ></iframe>`;
  });
  
  // Then handle Supabase storage URLs with proper video tag
  text = text.replace(supabasePattern, (url) => {
    return `<video controls class="w-full max-w-3xl rounded-lg my-4 aspect-video" preload="metadata">
      <source src="${url}" type="video/mp4">
      Your browser does not support the video tag. <a href="${url}" target="_blank" rel="noopener noreferrer">Click here to view the video</a>.
    </video>`;
  });
  
  // Then handle direct video URLs
  return text.replace(videoPattern, (url) => {
    return `<video controls class="w-full max-w-3xl rounded-lg my-4 aspect-video" preload="metadata">
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
  
  // First embed videos
  const withVideos = embedVideos(text);
  
  // Then apply nl2br
  return nl2br(withVideos);
}
