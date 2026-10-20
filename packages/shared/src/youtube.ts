const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtube-nocookie.com', 'youtube-nocookie.com']);
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

/**
 * The 11-character video id of a YouTube link, or null if it isn't one. Accepts watch links
 * (youtube.com/watch?v=…), short links (youtu.be/…), Shorts (youtube.com/shorts/…), live and embed links.
 */
export function youTubeId(link: string): string | null {
  let url: URL;
  try {
    url = new URL(link.trim());
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  if (!YOUTUBE_HOSTS.has(url.hostname.toLowerCase())) return null;

  const [first, second] = url.pathname.split('/').filter(Boolean);
  const id =
    url.hostname.endsWith('youtu.be') ? first
    : first === 'watch' ? url.searchParams.get('v')
    : first === 'shorts' || first === 'embed' || first === 'live' ? second
    : null;
  return id && VIDEO_ID.test(id) ? id : null;
}

/** True for a youtube.com/shorts/… link. */
export const isYouTubeShortsLink = (link: string) => /youtube\.com\/shorts\//i.test(link) && youTubeId(link) !== null;
