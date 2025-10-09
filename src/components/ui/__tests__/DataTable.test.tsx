import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import { DataTable, Column } from '../DataTable'

interface TestUser {
  id: string
  name: string
  email: string
  role: string
  active: boolean
}

const mockUsers: TestUser[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', active: true },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'User', active: false },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'Editor', active: true },
]

const defaultColumns: Column<TestUser>[] = [
  { key: 'name', header: 'Name', accessor: 'name' },
  { key: 'email', header: 'Email', accessor: 'email' },
  { key: 'role', header: 'Role', accessor: 'role' },
]

describe('DataTable', () => {
  describe('Rendering', () => {
    it('renders table with data', () => {
      render(
        <DataTable
          data={mockUsers}
          columns={defaultColumns}
          keyExtractor={(user) => user.id}
        />
      )

      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('jane@example.com')).toBeInTheDocument()
      expect(screen.getByText('Editor')).toBeInTheDocument()
    })

    it('renders column headers', () => {
      render(
        <DataTable
          data={mockUsers}
          columns={defaultColumns}
          keyExtractor={(user) => user.id}
        />
      )

      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('Role')).toBeInTheDocument()
    })

    it('renders all rows', () => {
      render(
        <DataTable
          data={mockUsers}
          columns={defaultColumns}
          keyExtractor={(user) => user.id}
        />
      )

      mockUsers.forEach(user => {
        expect(screen.getByText(user.name)).toBeInTheDocument()
      })
    })

    it('renders custom cell content with render function', () => {
      const columns: Column<TestUser>[] = [
        {
          key: 'status',
          header: 'Status',
          render: (user) => (
            <span data-testid={`status-${user.id}`}>
              {user.active ? 'Active' : 'Inactive'}
            </span>
          ),
        },
      ]

      render(
        <DataTable
          data={mockUsers}
          columns={columns}
          keyExtractor={(user) => user.id}
        />
      )

      expect(screen.getByTestId('status-1')).toHaveTextContent('Active')
      expect(screen.getByTestId('status-2')).toHaveTextContent('Inactive')
    })
  })

  describe('Empty States', () => {
    it('shows empty message when no data', () => {
      render(
        <DataTable
          data={[]}
          columns={defaultColumns}
          keyExtractor={(user) => user.id}
        />
      )

      expect(screen.getByText('Geen data beschikbaar')).toBeInTheDocument()
    })

    it('shows custom empty message', () => {
      render(
        <DataTable
          data={[]}
          columns={defaultColumns}
          keyExtractor={(user) => user.id}
          emptyMessage="No users found"
        />
      )

      expect(screen.getByText('No users found')).toBeInTheDocument()
    })

    it('does not render table when empty', () => {
      const { container } = render(
        <DataTable
          data={[]}
          columns={defaultColumns}
          keyExtractor={(user) => user.id}
        />
      )

      expect(container.querySelector('table')).not.toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('shows loading spinner when loading', () => {
      const { container } = render(
        <DataTable
          data={mockUsers}
          columns={defaultColumns}
          keyExtractor={(user) => user.id}
          loading={true}
        />
      )

      const spinner = container.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('does not render table when loading', () => {
      const { container } = render(
        <DataTable
          data={mockUsers}
          columns={defaultColumns}
          keyExtractor={(user) => user.id}
          loading={true}
        />
      )

      expect(container.querySelector('table')).not.toBeInTheDocument()
    })

    it('renders table after loading completes', () => {
      const { rerender } = render(
        <DataTable
          data={mockUsers}
          columns={defaultColumns}
          keyExtractor={(user) => user.id}
          loading={true}
        />
      )

      rerender(
        <DataTable
          data={mockUsers}
          columns={defaultColumns}
          keyExtractor={(user) => user.id}
          loading={false}
        />
      )

      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('calls onRowClick when row is clicked', async () => {
      const user = userEvent.setup()
      const onRowClick = vi.fn()

      render(
        <DataTable
          data={mockUsers}
          columns={defaultColumns}
          keyExtractor={(item) => item.id}
          onRowClick={onRowClick}
        />
      )

      const firstRow = screen.getByText('John Doe').closest('tr')
      await user.click(firstRow!)

      expect(onRowClick).toHaveBeenCalledTimes(1)
      expect(onRowClick).toHaveBeenCalledWith(mockUsers[0], 0)
    })

    it('does not call onRowClick when not provided', async () => {
      const user = userEvent.setup()

      render(
        <DataTable
          data={mockUsers}
          columns={defaultColumns}
          keyExtractor={(item) => item.id}
        />
      )

      const firstRow = screen.getByText('John Doe').closest('tr')
      await user.click(firstRow!)

      // Should not throw error
      expect(firstRow).toBeInTheDocument()
    })

    it('applies cursor-pointer class when onRowClick is provided', () => {
      render(
        <DataTable
          data={mockUsers}
          columns={defaultColumns}
          keyExtractor={(item) => item.id}
          onRowClick={vi.fn()}
        />
      )

      const firstRow = screen.getByText('John Doe').closest('tr')
      expect(firstRow).toHaveClass('cursor-pointer')
    })
  })

  describe('Styling Options', () => {
    it('applies striped styling by default', () => {
      render(
        <DataTable
          data={mockUsers}
          columns={defaultColumns}
          keyExtractor={(item) => item.id}
        />
      )

      const rows = screen.getAllByRole('row').slice(1) // Skip header row
      expect(rows[0]).toHaveClass('bg-white')
      expect(rows[1]).toHaveClass('bg-gray-50')
    })

    it('disables striped styling when striped=false', () => {
      render(
        <DataTable
          data={mockUsers}
          columns={defaultColumns}
          keyExtractor={(item) => item.id}
          striped={false}
        />
      )

      const rows = screen.getAllByRole('row').slice(1)
      expect(rows[0]).not.toHaveClass('bg-white')
    })

    it('applies hoverable class by default', () => {
      render(
        <DataTable
          data={mockUsers}
          columns={defaultColumns}
          keyExtractor={(item) => item.id}
        />
      )

      const firstRow = screen.getByText('John Doe').closest('tr')
      expect(firstRow).toHaveClass('hover:bg-gray-100')
    })

    it('disables hoverable when hoverable=false', () => {
      render(
        <DataTable
          data={mockUsers}
          columns={defaultColumns}
          keyExtractor={(item) => item.id}
          hoverable={false}
        />
      )

      const firstRow = screen.getByText('John Doe').closest('tr')
      expect(firstRow).not.toHaveClass('hover:bg-gray-100')
    })

    it('applies bordered class when bordered=true', () => {
      const { container } = render(
        <DataTable
          data={mockUsers}
          columns={defaultColumns}
          keyExtractor={(item) => item.id}
          bordered={true}
        />
      )

      const table = container.querySelector('table')
      expect(table).toHaveClass('border')
    })

    it('applies compact padding when compact=true', () => {
      render(
        <DataTable
          data={mockUsers}
          columns={defaultColumns}
          keyExtractor={(item) => item.id}
          compact={true}
        />
      )

      const firstCell = screen.getByText('John Doe')
      expect(firstCell).toHaveClass('px-3', 'py-2')
    })

    it('applies default padding when compact=false', () => {
      render(
        <DataTable
          data={mockUsers}
          columns={defaultColumns}
          keyExtractor={(item) => item.id}
          compact={false}
        />
      )

      const firstCell = screen.getByText('John Doe')
      expect(firstCell).toHaveClass('px-6', 'py-4')
    })

    it('applies custom className', () => {
      const { container } = render(
        <DataTable
          data={mockUsers}
          columns={defaultColumns}
          keyExtractor={(item) => item.id}
          className="custom-table-class"
        />
      )

      const table = container.querySelector('table')
      expect(table).toHaveClass('custom-table-class')
    })
  })

  describe('Column Configuration', () => {
    it('applies column width', () => {
      const columns: Column<TestUser>[] = [
        { key: 'name', header: 'Name', accessor: 'name', width: '200px' },
      ]

      render(
        <DataTable
          data={mockUsers}
          columns={columns}
          keyExtractor={(item) => item.id}
        />
      )

      const header = screen.getByText('Name')
      expect(header).toHaveStyle({ width: '200px' })
    })

    it('applies left alignment by default', () => {
      render(
        <DataTable
          data={mockUsers}
          columns={defaultColumns}
          keyExtractor={(item) => item.id}
        />
      )

      const cell = screen.getByText('John Doe')
      expect(cell).toHaveClass('text-left')
    })

    it('applies center alignment', () => {
      const columns: Column<TestUser>[] = [
        { key: 'role', header: 'Role', accessor: 'role', align: 'center' },
      ]

      render(
        <DataTable
          data={mockUsers}
          columns={columns}
          keyExtractor={(item) => item.id}
        />
      )

      const cell = screen.getByText('Admin')
      expect(cell).toHaveClass('text-center')
    })

    it('applies right alignment', () => {
      const columns: Column<TestUser>[] = [
        { key: 'role', header: 'Role', accessor: 'role', align: 'right' },
      ]

      render(
        <DataTable
          data={mockUsers}
          columns={columns}
          keyExtractor={(item) => item.id}
        />
      )

      const cell = screen.getByText('Admin')
      expect(cell).toHaveClass('text-right')
    })

    it('renders dash for null values', () => {
      const dataWithNull = [
        { id: '1', name: 'John', email: null as any, role: 'Admin', active: true },
      ]

      const columns: Column<TestUser>[] = [
        { key: 'email', header: 'Email', accessor: 'email' },
      ]

      render(
        <DataTable
          data={dataWithNull}
          columns={columns}
          keyExtractor={(item) => item.id}
        />
      )

      expect(screen.getByText('-')).toBeInTheDocument()
    })

    it('renders dash for undefined values', () => {
      const dataWithUndefined = [
        { id: '1', name: 'John', email: undefined as any, role: 'Admin', active: true },
      ]

      const columns: Column<TestUser>[] = [
        { key: 'email', header: 'Email', accessor: 'email' },
      ]

      render(
        <DataTable
          data={dataWithUndefined}
          columns={columns}
          keyExtractor={(item) => item.id}
        />
      )

      expect(screen.getByText('-')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('uses proper table structure', () => {
      render(
        <DataTable
          data={mockUsers}
          columns={defaultColumns}
          keyExtractor={(item) => item.id}
        />
      )

      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(screen.getAllByRole('row')).toHaveLength(mockUsers.length + 1) // +1 for header
      expect(screen.getAllByRole('columnheader')).toHaveLength(defaultColumns.length)
    })

    it('uses scope attribute on headers', () => {
      render(
        <DataTable
          data={mockUsers}
          columns={defaultColumns}
          keyExtractor={(item) => item.id}
        />
      )

      const headers = screen.getAllByRole('columnheader')
      headers.forEach(header => {
        expect(header).toHaveAttribute('scope', 'col')
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles single row', () => {
      render(
        <DataTable
          data={[mockUsers[0]]}
          columns={defaultColumns}
          keyExtractor={(item) => item.id}
        />
      )

      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
    })

    it('handles many columns', () => {
      const manyColumns: Column<TestUser>[] = [
        { key: 'id', header: 'ID', accessor: 'id' },
        { key: 'name', header: 'Name', accessor: 'name' },
        { key: 'email', header: 'Email', accessor: 'email' },
        { key: 'role', header: 'Role', accessor: 'role' },
        { key: 'active', header: 'Active', accessor: 'active' },
      ]

      render(
        <DataTable
          data={mockUsers}
          columns={manyColumns}
          keyExtractor={(item) => item.id}
        />
      )

      expect(screen.getAllByRole('columnheader')).toHaveLength(5)
    })

    it('handles complex render functions', () => {
      const columns: Column<TestUser>[] = [
        {
          key: 'actions',
          header: 'Actions',
          render: (user) => (
            <div>
              <button onClick={() => console.log('edit', user.id)}>Edit</button>
              <button onClick={() => console.log('delete', user.id)}>Delete</button>
            </div>
          ),
        },
      ]

      render(
        <DataTable
          data={mockUsers}
          columns={columns}
          keyExtractor={(item) => item.id}
        />
      )

      expect(screen.getAllByText('Edit')).toHaveLength(mockUsers.length)
      expect(screen.getAllByText('Delete')).toHaveLength(mockUsers.length)
    })

    it('handles data updates', () => {
      const { rerender } = render(
        <DataTable
          data={mockUsers}
          columns={defaultColumns}
          keyExtractor={(item) => item.id}
        />
      )

      expect(screen.getAllByRole('row')).toHaveLength(4) // 3 data + 1 header

      const updatedUsers = [...mockUsers, { id: '4', name: 'New User', email: 'new@example.com', role: 'User', active: true }]

      rerender(
        <DataTable
          data={updatedUsers}
          columns={defaultColumns}
          keyExtractor={(item) => item.id}
        />
      )

      expect(screen.getAllByRole('row')).toHaveLength(5) // 4 data + 1 header
      expect(screen.getByText('New User')).toBeInTheDocument()
    })
  })
})