import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

// Mock Data Factories
export const mockUser = (overrides = {}) => ({
  id: '1',
  email: 'test@dekoninklijkeloop.nl',
  role: 'admin',
  permissions: ['admin:access'],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

export const mockPhoto = (overrides = {}) => ({
  id: '1',
  title: 'Test Photo',
  description: 'Test Description',
  url: 'https://example.com/photo.jpg',
  visible: true,
  year: 2024,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

export const mockAlbum = (overrides = {}) => ({
  id: '1',
  title: 'Test Album',
  description: 'Test Description',
  cover_photo: 'https://example.com/cover.jpg',
  visible: true,
  year: 2024,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

export const mockVideo = (overrides = {}) => ({
  id: '1',
  title: 'Test Video',
  url: 'https://youtube.com/watch?v=test',
  visible: true,
  order_number: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

export const mockPartner = (overrides = {}) => ({
  id: '1',
  name: 'Test Partner',
  logo: 'https://example.com/logo.png',
  website: 'https://example.com',
  tier: 'gold' as const,
  order_number: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

export const mockSponsor = (overrides = {}) => ({
  id: '1',
  name: 'Test Sponsor',
  logo: 'https://example.com/logo.png',
  website: 'https://example.com',
  tier: 'gold' as const,
  order_number: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

export const mockMessage = (overrides = {}) => ({
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  message: 'Test message content',
  created_at: new Date().toISOString(),
  ...overrides,
})

export const mockRegistration = (overrides = {}) => ({
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  phone: '0612345678',
  created_at: new Date().toISOString(),
  ...overrides,
})

export const mockNewsletter = (overrides = {}) => ({
  id: '1',
  subject: 'Test Newsletter',
  content: 'Test content',
  sent_at: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

export const mockRole = (overrides = {}) => ({
  id: '1',
  name: 'admin',
  description: 'Administrator role',
  created_at: new Date().toISOString(),
  ...overrides,
})

export const mockPermission = (overrides = {}) => ({
  id: '1',
  resource: 'contact',
  action: 'read',
  description: 'Read contact messages',
  is_system_permission: false,
  ...overrides,
})

// Mock Auth Context
export const mockAuthContext = (overrides = {}) => ({
  user: null,
  loading: false,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  login: vi.fn(),
  logout: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  refreshToken: vi.fn(),
  ...overrides,
})

// Helper to wait for async updates
export const waitForLoadingToFinish = () =>
  new Promise((resolve) => setTimeout(resolve, 0))

export * from '@testing-library/react'
export { customRender as render }