import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AiLoadingIndicator } from '../AiLoadingIndicator'

describe('AiLoadingIndicator', () => {
  it('renders three star emojis', () => {
    const { container } = render(<AiLoadingIndicator />)
    const stars = container.querySelectorAll('span')
    expect(stars.length).toBe(3)
    expect(stars[0].textContent).toBe('✨')
    expect(stars[1].textContent).toBe('✨')
    expect(stars[2].textContent).toBe('✨')
  })

  it('applies large size classes by default', () => {
    const { container } = render(<AiLoadingIndicator />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('text-4xl')
    expect(wrapper.className).toContain('gap-3')
  })

  it('applies small size classes when size="small"', () => {
    const { container } = render(<AiLoadingIndicator size="small" />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('text-base')
    expect(wrapper.className).toContain('gap-1.5')
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
