import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

/**
 * App Integration Tests
 *
 * These tests verify the App component renders and integrates properly.
 * Full integration testing would require mocking the Anthropic API, which
 * is better suited for E2E tests.
 */
describe('App Integration Tests', () => {
  describe('Initial Render', () => {
    it('renders without crashing', () => {
      render(<App />)
      expect(screen.getByText('Pixlogic')).toBeInTheDocument()
      expect(screen.getByText('AI-Powered Nonogram Puzzles')).toBeInTheDocument()
    })

    it('shows ApiKeyInput when no API key is set', () => {
      render(<App />)
      // Check for API key input field
      expect(screen.getByText(/anthropic api key/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/sk-ant-/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /validate.*key/i })).toBeInTheDocument()
    })

    it('has proper heading and branding', () => {
      render(<App />)
      const heading = screen.getByRole('heading', { name: /pixlogic/i })
      expect(heading).toBeInTheDocument()
      expect(heading.tagName).toBe('H1')
    })

    it('renders main content area', () => {
      render(<App />)
      const main = screen.getByRole('main')
      expect(main).toBeInTheDocument()
    })
  })

  describe('Component Structure', () => {
    it('has header with title and description', () => {
      render(<App />)
      expect(screen.getByText('Pixlogic')).toBeInTheDocument()
      expect(screen.getByText('AI-Powered Nonogram Puzzles')).toBeInTheDocument()
    })

    it('applies correct styling classes', () => {
      const { container } = render(<App />)
      const appDiv = container.querySelector('.min-h-screen')
      expect(appDiv).toBeInTheDocument()
      expect(appDiv).toHaveClass('bg-primary')
    })
  })
})
