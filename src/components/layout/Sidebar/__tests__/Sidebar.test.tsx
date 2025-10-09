import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Sidebar } from '../index'
import { SidebarProvider } from '../../../../providers/SidebarProvider'

// Mock child components
vi.mock('../DesktopSidebar', () => ({
  DesktopSidebar: () => <div data-testid="desktop-sidebar">Desktop Sidebar</div>,
}))

vi.mock('../TabletSidebar', () => ({
  TabletSidebar: () => <div data-testid="tablet-sidebar">Tablet Sidebar</div>,
}))

vi.mock('../MobileSidebar', () => ({
  MobileSidebar: () => <div data-testid="mobile-sidebar">Mobile Sidebar</div>,
}))

describe('Sidebar', () => {
  const renderSidebar = () => {
    return render(
      <BrowserRouter>
        <SidebarProvider>
          <Sidebar />
        </SidebarProvider>
      </BrowserRouter>
    )
  }

  it('renders sidebar component', () => {
    renderSidebar()
    
    // At least one sidebar variant should be rendered
    const sidebars = [
      screen.queryByTestId('desktop-sidebar'),
      screen.queryByTestId('tablet-sidebar'),
      screen.queryByTestId('mobile-sidebar'),
    ]
    
    const renderedSidebars = sidebars.filter(s => s !== null)
    expect(renderedSidebars.length).toBeGreaterThan(0)
  })

  it('renders within sidebar provider', () => {
    const { container } = renderSidebar()
    
    expect(container.firstChild).toBeTruthy()
  })

  it('integrates with router', () => {
    const { container } = renderSidebar()
    
    expect(container).toBeInTheDocument()
  })
})