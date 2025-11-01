import { describe, it, expect } from 'vitest'
import {
  detectVideoPlatform,
  getVideoEmbedUrl,
  isValidVideoUrl,
  getPlatformDisplayName,
  getStreamableThumbnail,
  extractVideoIdFromUrl
} from '../videoUrlUtils'

describe('videoUrlUtils', () => {
  describe('detectVideoPlatform', () => {
    it('detects Streamable URLs (primary platform)', () => {
      expect(detectVideoPlatform('https://streamable.com/abc123')).toBe('streamable')
      expect(detectVideoPlatform('https://www.streamable.com/abc123')).toBe('streamable')
      expect(detectVideoPlatform('https://streamable.com/e/q9ngqu')).toBe('streamable')
    })

    it('detects YouTube URLs (legacy support)', () => {
      expect(detectVideoPlatform('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('youtube')
      expect(detectVideoPlatform('https://youtube.com/watch?v=dQw4w9WgXcQ')).toBe('youtube')
      expect(detectVideoPlatform('https://youtu.be/dQw4w9WgXcQ')).toBe('youtube')
    })

    it('detects Vimeo URLs (legacy support)', () => {
      expect(detectVideoPlatform('https://vimeo.com/123456789')).toBe('vimeo')
      expect(detectVideoPlatform('https://www.vimeo.com/123456789')).toBe('vimeo')
    })

    it('returns unknown for unsupported platforms', () => {
      expect(detectVideoPlatform('https://example.com/video')).toBe('unknown')
      expect(detectVideoPlatform('not-a-url')).toBe('unknown')
    })
  })

  describe('getVideoEmbedUrl', () => {
    it('converts Streamable URL to embed URL (primary)', () => {
      const result = getVideoEmbedUrl('https://streamable.com/q9ngqu')
      expect(result).toBe('https://streamable.com/e/q9ngqu')
    })

    it('handles already embedded Streamable URLs', () => {
      const result = getVideoEmbedUrl('https://streamable.com/e/q9ngqu')
      expect(result).toBe('https://streamable.com/e/q9ngqu')
    })

    it('converts YouTube URLs (legacy support)', () => {
      expect(getVideoEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'))
        .toBe('https://www.youtube.com/embed/dQw4w9WgXcQ')
      expect(getVideoEmbedUrl('https://youtu.be/dQw4w9WgXcQ'))
        .toBe('https://www.youtube.com/embed/dQw4w9WgXcQ')
    })

    it('converts Vimeo URLs (legacy support)', () => {
      const result = getVideoEmbedUrl('https://vimeo.com/123456789')
      expect(result).toBe('https://player.vimeo.com/video/123456789')
    })

    it('returns original URL for unsupported platforms', () => {
      const url = 'https://example.com/video'
      expect(getVideoEmbedUrl(url)).toBe(url)
    })

    it('returns original URL for invalid URLs', () => {
      const url = 'not-a-url'
      expect(getVideoEmbedUrl(url)).toBe(url)
    })
  })

  describe('isValidVideoUrl', () => {
    it('validates Streamable URLs (primary platform)', () => {
      expect(isValidVideoUrl('https://streamable.com/q9ngqu')).toBe(true)
      expect(isValidVideoUrl('https://streamable.com/e/q9ngqu')).toBe(true)
      expect(isValidVideoUrl('https://www.streamable.com/abc123')).toBe(true)
    })

    it('validates YouTube URLs (legacy support)', () => {
      expect(isValidVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true)
      expect(isValidVideoUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(true)
    })

    it('validates Vimeo URLs (legacy support)', () => {
      expect(isValidVideoUrl('https://vimeo.com/123456789')).toBe(true)
    })

    it('rejects unsupported platforms', () => {
      expect(isValidVideoUrl('https://example.com/video')).toBe(false)
    })

    it('rejects invalid URLs', () => {
      expect(isValidVideoUrl('not-a-url')).toBe(false)
      expect(isValidVideoUrl('')).toBe(false)
    })

    it('rejects non-http(s) protocols', () => {
      expect(isValidVideoUrl('ftp://youtube.com/watch?v=test')).toBe(false)
    })
  })

  describe('getPlatformDisplayName', () => {
    it('returns display name for Streamable', () => {
      expect(getPlatformDisplayName('https://streamable.com/q9ngqu')).toBe('Streamable')
    })

    it('returns display name for YouTube', () => {
      expect(getPlatformDisplayName('https://www.youtube.com/watch?v=test')).toBe('YouTube')
    })

    it('returns display name for Vimeo', () => {
      expect(getPlatformDisplayName('https://vimeo.com/123456789')).toBe('Vimeo')
    })

    it('returns unknown for unsupported platforms', () => {
      expect(getPlatformDisplayName('https://example.com/video')).toBe('Onbekend platform')
    })
  })

  describe('getStreamableThumbnail', () => {
    it('generates correct Streamable thumbnail URL', () => {
      const thumbnail = getStreamableThumbnail('q9ngqu')
      expect(thumbnail).toBe('https://cdn-cf-east.streamable.com/image/q9ngqu.jpg')
    })

    it('generates thumbnail for different video IDs', () => {
      expect(getStreamableThumbnail('tt6k80')).toBe('https://cdn-cf-east.streamable.com/image/tt6k80.jpg')
      expect(getStreamableThumbnail('0o2qf9')).toBe('https://cdn-cf-east.streamable.com/image/0o2qf9.jpg')
    })
  })

  describe('extractVideoIdFromUrl', () => {
    it('extracts video ID from Streamable URL', () => {
      expect(extractVideoIdFromUrl('https://streamable.com/q9ngqu')).toBe('q9ngqu')
      expect(extractVideoIdFromUrl('https://streamable.com/e/q9ngqu')).toBe('q9ngqu')
    })

    it('returns null for non-Streamable URLs', () => {
      expect(extractVideoIdFromUrl('https://youtube.com/watch?v=test')).toBeNull()
      expect(extractVideoIdFromUrl('https://vimeo.com/123456789')).toBeNull()
    })

    it('returns null for invalid URLs', () => {
      expect(extractVideoIdFromUrl('not-a-url')).toBeNull()
      expect(extractVideoIdFromUrl('')).toBeNull()
    })
  })
})