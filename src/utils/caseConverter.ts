/**
 * Utility functions for converting between camelCase and snake_case
 * Useful for mapping between TypeScript interfaces and database schemas
 */

/**
 * Convert a snake_case string to camelCase
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * Convert a camelCase string to snake_case
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

/**
 * Convert all keys in an object from snake_case to camelCase
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function keysToCamel<T = any>(obj: any): T {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (Array.isArray(obj)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return obj.map(item => keysToCamel(item)) as any
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = snakeToCamel(key)
      acc[camelKey] = keysToCamel(obj[key])
      return acc
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }, {} as any)
  }

  return obj
}

/**
 * Convert all keys in an object from camelCase to snake_case
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function keysToSnake<T = any>(obj: any): T {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (Array.isArray(obj)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return obj.map(item => keysToSnake(item)) as any
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = camelToSnake(key)
      acc[snakeKey] = keysToSnake(obj[key])
      return acc
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }, {} as any)
  }

  return obj
}

/**
 * Type-safe mapper for converting database records to TypeScript interfaces
 * 
 * @example
 * ```typescript
 * interface DbRecord {
 *   is_active: boolean
 *   created_at: string
 * }
 * 
 * interface AppRecord {
 *   isActive: boolean
 *   createdAt: string
 * }
 * 
 * const dbRecord: DbRecord = { is_active: true, created_at: '2024-01-01' }
 * const appRecord = keysToCamel<AppRecord>(dbRecord)
 * // Result: { isActive: true, createdAt: '2024-01-01' }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapDbToApp<TApp, TDb = any>(dbRecord: TDb): TApp {
  return keysToCamel<TApp>(dbRecord)
}

/**
 * Type-safe mapper for converting TypeScript interfaces to database records
 * 
 * @example
 * ```typescript
 * interface AppRecord {
 *   isActive: boolean
 *   createdAt: string
 * }
 * 
 * interface DbRecord {
 *   is_active: boolean
 *   created_at: string
 * }
 * 
 * const appRecord: AppRecord = { isActive: true, createdAt: '2024-01-01' }
 * const dbRecord = mapAppToDb<DbRecord>(appRecord)
 * // Result: { is_active: true, created_at: '2024-01-01' }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapAppToDb<TDb, TApp = any>(appRecord: TApp): TDb {
  return keysToSnake<TDb>(appRecord)
}