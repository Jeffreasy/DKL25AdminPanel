import { describe, it, expect } from 'vitest'
import { render } from '../../../test/utils'
import { LoadingGrid } from '../LoadingGrid'

describe('LoadingGrid', () => {
  it('renders correct number of skeleton items', () => {
    const { container } = render(<LoadingGrid count={6} />)
    
    // LoadingSkeleton components should be rendered
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBe(6)
  })

  it('applies photos variant grid layout', () => {
    const { container } = render(<LoadingGrid variant="photos" />)
    
    const grid = container.firstChild
    expect(grid).toHaveClass('grid')
  })

  it('applies albums variant grid layout', () => {
    const { container } = render(<LoadingGrid variant="albums" />)
    
    const grid = container.firstChild
    expect(grid).toHaveClass('grid')
  })

  it('applies custom className', () => {
    const { container } = render(<LoadingGrid className="custom-class" />)
    
    const grid = container.firstChild
    expect(grid).toHaveClass('custom-class')
  })

  it('uses default count of 12 when not specified', () => {
    const { container } = render(<LoadingGrid />)
    
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBe(12)
  })
})