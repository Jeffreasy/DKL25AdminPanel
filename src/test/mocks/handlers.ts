import { http, HttpResponse } from 'msw'
import { mockUser, mockPhoto, mockAlbum, mockPartner, mockSponsor } from '../utils'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://dklemailservice.onrender.com'

export const handlers = [
  // Auth endpoints
  http.post(`${API_BASE_URL}/api/auth/login`, () => {
    return HttpResponse.json({
      token: 'mock-jwt-token',
      refresh_token: 'mock-refresh-token',
      user: mockUser(),
    })
  }),

  http.post(`${API_BASE_URL}/api/auth/refresh`, () => {
    return HttpResponse.json({
      token: 'new-mock-jwt-token',
      refresh_token: 'new-mock-refresh-token',
    })
  }),

  http.post(`${API_BASE_URL}/api/auth/logout`, () => {
    return HttpResponse.json({ success: true })
  }),

  http.get(`${API_BASE_URL}/api/auth/profile`, () => {
    return HttpResponse.json({
      ...mockUser(),
      permissions: [
        { resource: 'user', action: 'read' },
        { resource: 'user', action: 'write' }
      ],
      roles: [
        { id: '1', name: 'admin', description: 'Administrator' }
      ]
    })
  }),

  // Photos endpoints
  http.get(`${API_BASE_URL}/api/photos`, () => {
    return HttpResponse.json([
      mockPhoto(),
      mockPhoto({ id: '2', title: 'Photo 2' }),
    ])
  }),

  http.get(`${API_BASE_URL}/api/photos/:id`, ({ params }) => {
    return HttpResponse.json(mockPhoto({ id: params.id as string }))
  }),

  http.post(`${API_BASE_URL}/api/photos`, async ({ request }) => {
    const body = await request.json()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return HttpResponse.json(mockPhoto(body as any))
  }),

  http.put(`${API_BASE_URL}/api/photos/:id`, async ({ params, request }) => {
    const body = await request.json()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return HttpResponse.json(mockPhoto({ id: params.id as string, ...body as any }))
  }),

  http.delete(`${API_BASE_URL}/api/photos/:id`, () => {
    return HttpResponse.json({ success: true })
  }),

  // Albums endpoints
  http.get(`${API_BASE_URL}/api/albums`, () => {
    return HttpResponse.json([
      mockAlbum(),
      mockAlbum({ id: '2', title: 'Album 2' }),
    ])
  }),

  http.get(`${API_BASE_URL}/api/albums/:id`, ({ params }) => {
    return HttpResponse.json(mockAlbum({ id: params.id as string }))
  }),

  http.post(`${API_BASE_URL}/api/albums`, async ({ request }) => {
    const body = await request.json()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return HttpResponse.json(mockAlbum(body as any))
  }),

  http.put(`${API_BASE_URL}/api/albums/:id`, async ({ params, request }) => {
    const body = await request.json()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return HttpResponse.json(mockAlbum({ id: params.id as string, ...body as any }))
  }),

  http.delete(`${API_BASE_URL}/api/albums/:id`, () => {
    return HttpResponse.json({ success: true })
  }),

  // Partners endpoints
  http.get(`${API_BASE_URL}/api/partners`, () => {
    return HttpResponse.json([
      mockPartner(),
      mockPartner({ id: '2', name: 'Partner 2' }),
    ])
  }),

  // Sponsors endpoints
  http.get(`${API_BASE_URL}/api/sponsors`, () => {
    return HttpResponse.json([
      mockSponsor(),
      mockSponsor({ id: '2', name: 'Sponsor 2' }),
    ])
  }),

  // Permissions endpoints
  http.get(`${API_BASE_URL}/api/permissions`, () => {
    return HttpResponse.json([
      { id: '1', resource: 'contact', action: 'read' },
      { id: '2', resource: 'contact', action: 'write' },
    ])
  }),

  // Roles endpoints
  http.get(`${API_BASE_URL}/api/roles`, () => {
    return HttpResponse.json([
      { id: '1', name: 'admin', description: 'Administrator' },
      { id: '2', name: 'staff', description: 'Staff member' },
    ])
  }),
]

// Error handlers for testing error states
export const errorHandlers = [
  http.post(`${API_BASE_URL}/api/auth/login`, () => {
    return HttpResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    )
  }),

  http.get(`${API_BASE_URL}/api/photos`, () => {
    return HttpResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }),
]