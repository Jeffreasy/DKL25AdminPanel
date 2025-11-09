// Re-export types from global types
export type {
  Notulen,
  NotulenCreateRequest,
  NotulenUpdateRequest,
  NotulenVersie,
  AgendaItem,
  Besluit,
  Actiepunt,
  NotulenFilters,
  NotulenSearchParams,
  NotulenListResponse
} from '@/types/notulen'

// Import for alias
import type { NotulenVersie } from '@/types/notulen'

// Alias for backward compatibility
export type NotulenVersion = NotulenVersie
