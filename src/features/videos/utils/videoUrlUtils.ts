/**
 * Video URL utility functions
 * Handles URL validation and embed URL generation for Streamable video platform
 *
 * Backend Documentation: All videos are hosted on Streamable
 * - Embed URL: https://streamable.com/e/{video_id}
 * - Thumbnail: https://cdn-cf-east.streamable.com/image/{video_id}.jpg
 * - No API key needed for public videos
 *
 * Legacy support for YouTube and Vimeo URLs is maintained for backwards compatibility
 */

export type SupportedPlatform = 'streamable' | 'youtube' | 'vimeo' | 'unknown'

/**
 * Detects which platform a video URL belongs to
 */
export function detectVideoPlatform(url: string): SupportedPlatform {
  try {
    const videoUrl = new URL(url)
    const hostname = videoUrl.hostname.toLowerCase()

    // Primary platform: Streamable (as per backend documentation)
    if (hostname.includes('streamable.com')) {
      return 'streamable'
    }
    // Legacy support for other platforms
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      return 'youtube'
    }
    if (hostname.includes('vimeo.com')) {
      return 'vimeo'
    }
    return 'unknown'
  } catch {
    return 'unknown'
  }
}

/**
 * Extracts video ID from YouTube URL
 */
function extractYouTubeId(url: URL): string | null {
  if (url.hostname.includes('youtu.be')) {
    return url.pathname.slice(1)
  }
  return url.searchParams.get('v')
}

/**
 * Extracts video ID from Vimeo URL
 */
function extractVimeoId(url: URL): string | null {
  const pathParts = url.pathname.split('/')
  return pathParts[pathParts.length - 1] || null
}

/**
 * Extracts video ID from Streamable URL
 */
function extractStreamableId(url: URL): string | null {
  const pathParts = url.pathname.split('/')
  return pathParts[pathParts.length - 1] || null
}

/**
 * Converts a video URL to its embeddable version
 * Primary use: Streamable videos (as per backend integration)
 */
export function getVideoEmbedUrl(url: string): string {
  try {
    const videoUrl = new URL(url)
    const platform = detectVideoPlatform(url)

    switch (platform) {
      case 'streamable': {
        const videoId = extractStreamableId(videoUrl)
        return videoId ? `https://streamable.com/e/${videoId}` : url
      }
      // Legacy support
      case 'youtube': {
        const videoId = extractYouTubeId(videoUrl)
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url
      }
      case 'vimeo': {
        const videoId = extractVimeoId(videoUrl)
        return videoId ? `https://player.vimeo.com/video/${videoId}` : url
      }
      default:
        return url
    }
  } catch {
    return url
  }
}

/**
 * Validates if a URL is from a supported video platform
 * Primary validation: Streamable URLs
 * Legacy support: YouTube and Vimeo URLs
 */
export function isValidVideoUrl(url: string): boolean {
  if (!url) return false
  
  try {
    const videoUrl = new URL(url)
    const platform = detectVideoPlatform(url)
    return platform !== 'unknown' && !!videoUrl.protocol.match(/^https?:/)
  } catch {
    return false
  }
}

/**
 * Gets a user-friendly platform name
 */
export function getPlatformDisplayName(url: string): string {
  const platform = detectVideoPlatform(url)
  switch (platform) {
    case 'streamable':
      return 'Streamable'
    case 'youtube':
      return 'YouTube'
    case 'vimeo':
      return 'Vimeo'
    default:
      return 'Onbekend platform'
  }
}

/**
 * Generates Streamable thumbnail URL from video ID
 * According to backend documentation: https://cdn-cf-east.streamable.com/image/{video_id}.jpg
 */
export function getStreamableThumbnail(videoId: string): string {
  return `https://cdn-cf-east.streamable.com/image/${videoId}.jpg`
}

/**
 * Extracts video ID from Streamable URL for thumbnail generation
 */
export function extractVideoIdFromUrl(url: string): string | null {
  try {
    const videoUrl = new URL(url)
    const platform = detectVideoPlatform(url)
    
    if (platform === 'streamable') {
      return extractStreamableId(videoUrl)
    }
    
    return null
  } catch {
    return null
  }
}