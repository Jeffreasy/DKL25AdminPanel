/**
 * Base entity types for reducing redundancy across the application
 */

/**
 * Base entity with common fields present in all database entities
 */
export interface BaseEntity {
  id: string
  created_at: string
  updated_at: string
}

/**
 * Entity that can be shown/hidden on the public website
 */
export interface VisibleEntity extends BaseEntity {
  visible: boolean
}

/**
 * Entity that has an order/position in a list
 */
export interface OrderedEntity extends VisibleEntity {
  order_number: number
}

/**
 * Entity with basic information (name, description, etc.)
 */
export interface NamedEntity extends OrderedEntity {
  name: string
  description?: string | null
}

/**
 * Entity with logo/image
 */
export interface LogoEntity extends NamedEntity {
  logo?: string | null
  website?: string | null
}

/**
 * Generic form data type that omits database-managed fields
 */
export type FormData<T extends BaseEntity> = Omit<T, 'id' | 'created_at' | 'updated_at'>

/**
 * Generic create data type (partial form data)
 */
export type CreateData<T extends BaseEntity> = Partial<FormData<T>>

/**
 * Generic update data type (partial form data)
 */
export type UpdateData<T extends BaseEntity> = Partial<FormData<T>>