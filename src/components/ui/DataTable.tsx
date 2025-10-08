import React, { ReactNode } from 'react'

/**
 * Generic reusable data table component
 * Provides consistent styling and functionality for tabular data
 */

export interface Column<T> {
  key: string
  header: string | ReactNode
  render?: (item: T, index: number) => ReactNode
  accessor?: keyof T
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
}

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyExtractor: (item: T, index: number) => string | number
  onRowClick?: (item: T, index: number) => void
  emptyMessage?: string
  loading?: boolean
  striped?: boolean
  hoverable?: boolean
  bordered?: boolean
  compact?: boolean
  className?: string
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  emptyMessage = 'Geen data beschikbaar',
  loading = false,
  striped = true,
  hoverable = true,
  bordered = false,
  compact = false,
  className = ''
}: DataTableProps<T>) {
  // Build table classes
  const tableClasses = [
    'min-w-full divide-y divide-gray-200',
    bordered && 'border border-gray-200',
    className
  ].filter(Boolean).join(' ')

  const rowClasses = (index: number) => [
    striped && index % 2 === 0 ? 'bg-white' : 'bg-gray-50',
    hoverable && 'hover:bg-gray-100 transition-colors',
    onRowClick && 'cursor-pointer',
  ].filter(Boolean).join(' ')

  const cellPadding = compact ? 'px-3 py-2' : 'px-6 py-4'

  // Render cell content
  const renderCell = (column: Column<T>, item: T, index: number) => {
    if (column.render) {
      return column.render(item, index)
    }
    if (column.accessor) {
      const value = item[column.accessor]
      return value !== null && value !== undefined ? String(value) : '-'
    }
    return '-'
  }

  // Get alignment class
  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center': return 'text-center'
      case 'right': return 'text-right'
      default: return 'text-left'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className={tableClasses}>
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`${cellPadding} text-xs font-medium text-gray-500 uppercase tracking-wider ${getAlignClass(column.align)}`}
                style={{ width: column.width }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((item, index) => (
            <tr
              key={keyExtractor(item, index)}
              className={rowClasses(index)}
              onClick={() => onRowClick?.(item, index)}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`${cellPadding} text-sm text-gray-900 ${getAlignClass(column.align)}`}
                >
                  {renderCell(column, item, index)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * Example usage:
 * 
 * ```typescript
 * interface User {
 *   id: string
 *   name: string
 *   email: string
 *   role: string
 *   active: boolean
 * }
 * 
 * function UsersTable({ users }: { users: User[] }) {
 *   const columns: Column<User>[] = [
 *     {
 *       key: 'name',
 *       header: 'Name',
 *       accessor: 'name',
 *       sortable: true
 *     },
 *     {
 *       key: 'email',
 *       header: 'Email',
 *       accessor: 'email'
 *     },
 *     {
 *       key: 'role',
 *       header: 'Role',
 *       accessor: 'role',
 *       align: 'center'
 *     },
 *     {
 *       key: 'status',
 *       header: 'Status',
 *       render: (user) => (
 *         <span className={user.active ? 'text-green-600' : 'text-red-600'}>
 *           {user.active ? 'Active' : 'Inactive'}
 *         </span>
 *       ),
 *       align: 'center'
 *     },
 *     {
 *       key: 'actions',
 *       header: 'Actions',
 *       render: (user) => (
 *         <button onClick={() => editUser(user)}>Edit</button>
 *       ),
 *       align: 'right'
 *     }
 *   ]
 * 
 *   return (
 *     <DataTable
 *       data={users}
 *       columns={columns}
 *       keyExtractor={(user) => user.id}
 *       onRowClick={(user) => console.log('Clicked:', user)}
 *       emptyMessage="No users found"
 *     />
 *   )
 * }
 * ```
 */