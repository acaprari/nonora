import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AiLoadingIndicator } from '../AiLoadingIndicator'

describe('AiLoadingIndicator', () => {
  it('renders three sparkle icons', () => {
    const { container } = render(<AiLoadingIndicator />)
    const stars = container.querySelectorAll('span')
    expect(stars.length).toBe(3)
    // Check that each span contains an SVG icon
    const svgs = container.querySelectorAll('svg')
    expect(svgs.length).toBe(3)
    // Verify they're sparkle icons
    svgs.forEach(svg => {
      const use = svg.querySelector('use')
      expect(use?.getAttribute('href')).toContain('#sparkle')
    })
  })

  it('applies large size classes by default', () => {
    const { container } = render(<AiLoadingIndicator />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('gap-3')
    // Check for large icon size (32px)
    const svgs = container.querySelectorAll('svg')
    expect(svgs[0]).toHaveAttribute('width', '32')
    expect(svgs[0]).toHaveAttribute('height', '32')
  })

  it('applies small size classes when size="small"', () => {
    const { container } = render(<AiLoadingIndicator size="small" />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('gap-1.5')
    // Check for small icon size (16px)
    const svgs = container.querySelectorAll('svg')
    expect(svgs[0]).toHaveAttribute('width', '16')
    expect(svgs[0]).toHaveAttribute('height', '16')
  })

  it('accepts and applies custom className', () => {
    const { container } = render(<AiLoadingIndicator className="custom-class" />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('custom-class')
  })

  it('has correct ARIA attributes', () => {
    render(<AiLoadingIndicator />)
    const indicator = screen.getByRole('status')
    expect(indicator).toBeInTheDocument()
    expect(indicator).toHaveAttribute('aria-label', 'AI is thinking')
    expect(indicator).toHaveAttribute('aria-live', 'polite')
  })

  it('applies animation class to all stars', () => {
    const { container } = render(<AiLoadingIndicator />)
    const stars = container.querySelectorAll('span')
    stars.forEach(star => {
      expect(star.className).toContain('animate-ai-pulse')
    })
  })

  it('applies staggered animation delays', () => {
    const { container } = render(<AiLoadingIndicator />)
    const stars = container.querySelectorAll('span')

    // First star has no delay class
    expect(stars[0].className).not.toContain('animation-delay')

    // Second star has 200ms delay
    expect(stars[1].className).toContain('animation-delay-200')

    // Third star has 400ms delay
    expect(stars[2].className).toContain('animation-delay-400')
  })

  it('displays stars inline-block for transform support', () => {
    const { container } = render(<AiLoadingIndicator />)
    const stars = container.querySelectorAll('span')
    stars.forEach(star => {
      expect(star.className).toContain('inline-block')
    })
  })
})
