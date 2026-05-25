import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ApiKeyInput from '../ApiKeyInput'

describe('ApiKeyInput', () => {
  describe('Rendering', () => {
    it('renders with default state', () => {
      const onKeySubmit = vi.fn()
      render(<ApiKeyInput onKeySubmit={onKeySubmit} />)

      expect(screen.getByLabelText(/anthropic api key/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /validate/i })).toBeInTheDocument()
    })

    it('renders with initial key pre-filled', () => {
      const onKeySubmit = vi.fn()
      const initialKey = 'sk-ant-test123456789012'
      render(<ApiKeyInput onKeySubmit={onKeySubmit} initialKey={initialKey} />)

      const input = screen.getByLabelText(/anthropic api key/i) as HTMLInputElement
      expect(input.value).toBe(initialKey)
    })

    it('shows show/hide toggle button', () => {
      const onKeySubmit = vi.fn()
      render(<ApiKeyInput onKeySubmit={onKeySubmit} />)

      expect(screen.getByRole('button', { name: /show.*api key|hide.*api key/i })).toBeInTheDocument()
    })
  })

  describe('Input Interaction', () => {
    it('updates input value when user types', () => {
      const onKeySubmit = vi.fn()
      render(<ApiKeyInput onKeySubmit={onKeySubmit} />)

      const input = screen.getByLabelText(/anthropic api key/i) as HTMLInputElement
      fireEvent.change(input, { target: { value: 'sk-ant-test' } })

      expect(input.value).toBe('sk-ant-test')
    })

    it('toggles password visibility when show/hide button is clicked', () => {
      const onKeySubmit = vi.fn()
      render(<ApiKeyInput onKeySubmit={onKeySubmit} />)

      const input = screen.getByLabelText(/anthropic api key/i) as HTMLInputElement
      const toggleButton = screen.getByRole('button', { name: /show api key|hide api key/i })

      // Initially should be password type (hidden)
      expect(input.type).toBe('password')

      // Click to show
      fireEvent.click(toggleButton)
      expect(input.type).toBe('text')

      // Click to hide again
      fireEvent.click(toggleButton)
      expect(input.type).toBe('password')
    })
  })

  describe('Validation', () => {
    it('shows error when API key does not start with "sk-ant-"', async () => {
      const onKeySubmit = vi.fn()
      render(<ApiKeyInput onKeySubmit={onKeySubmit} />)

      const input = screen.getByLabelText(/anthropic api key/i)
      const submitButton = screen.getByRole('button', { name: /validate/i })

      fireEvent.change(input, { target: { value: 'invalid-key-format123456' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/must start with "sk-ant-"/i)).toBeInTheDocument()
      })

      expect(onKeySubmit).not.toHaveBeenCalled()
    })

    it('shows error when API key is too short', async () => {
      const onKeySubmit = vi.fn()
      render(<ApiKeyInput onKeySubmit={onKeySubmit} />)

      const input = screen.getByLabelText(/anthropic api key/i)
      const submitButton = screen.getByRole('button', { name: /validate/i })

      fireEvent.change(input, { target: { value: 'sk-ant-short' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/at least 20 characters/i)).toBeInTheDocument()
      })

      expect(onKeySubmit).not.toHaveBeenCalled()
    })

    it('shows error when API key is empty', async () => {
      const onKeySubmit = vi.fn()
      render(<ApiKeyInput onKeySubmit={onKeySubmit} />)

      const submitButton = screen.getByRole('button', { name: /validate/i })

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/required|empty/i)).toBeInTheDocument()
      })

      expect(onKeySubmit).not.toHaveBeenCalled()
    })

    it('calls onKeySubmit with valid API key', async () => {
      const onKeySubmit = vi.fn()
      render(<ApiKeyInput onKeySubmit={onKeySubmit} />)

      const input = screen.getByLabelText(/anthropic api key/i)
      const submitButton = screen.getByRole('button', { name: /validate/i })
      const validKey = 'sk-ant-api03-valid-key-12345678901234567890'

      fireEvent.change(input, { target: { value: validKey } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(onKeySubmit).toHaveBeenCalledWith(validKey)
      })
    })

    it('does not call onKeySubmit with invalid format', async () => {
      const onKeySubmit = vi.fn()
      render(<ApiKeyInput onKeySubmit={onKeySubmit} />)

      const input = screen.getByLabelText(/anthropic api key/i)
      const submitButton = screen.getByRole('button', { name: /validate/i })

      fireEvent.change(input, { target: { value: 'not-an-anthropic-key-but-long-enough' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/must start with "sk-ant-"/i)).toBeInTheDocument()
      })

      expect(onKeySubmit).not.toHaveBeenCalled()
    })

    it('clears error message when user starts typing after error', async () => {
      const onKeySubmit = vi.fn()
      render(<ApiKeyInput onKeySubmit={onKeySubmit} />)

      const input = screen.getByLabelText(/anthropic api key/i)
      const submitButton = screen.getByRole('button', { name: /validate/i })

      // Submit invalid key to show error
      fireEvent.change(input, { target: { value: 'sk-ant-short' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/at least 20 characters/i)).toBeInTheDocument()
      })

      // Start typing to clear error
      fireEvent.change(input, { target: { value: 'sk-ant-shorte' } })

      await waitFor(() => {
        expect(screen.queryByText(/at least 20 characters/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('submits form on Enter key press with valid key', async () => {
      const onKeySubmit = vi.fn()
      render(<ApiKeyInput onKeySubmit={onKeySubmit} />)

      const input = screen.getByLabelText(/anthropic api key/i)
      const validKey = 'sk-ant-api03-valid-key-12345678901234567890'

      fireEvent.change(input, { target: { value: validKey } })
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

      await waitFor(() => {
        expect(onKeySubmit).toHaveBeenCalledWith(validKey)
      })
    })

    it('does not submit form on Enter key press with invalid key', async () => {
      const onKeySubmit = vi.fn()
      render(<ApiKeyInput onKeySubmit={onKeySubmit} />)

      const input = screen.getByLabelText(/anthropic api key/i)

      fireEvent.change(input, { target: { value: 'invalid' } })
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

      await waitFor(() => {
        expect(screen.getByText(/must start with "sk-ant-"/i)).toBeInTheDocument()
      })

      expect(onKeySubmit).not.toHaveBeenCalled()
    })
  })

  describe('Validation State', () => {
    it('disables submit button when isValidating is true', () => {
      const onKeySubmit = vi.fn()
      render(<ApiKeyInput onKeySubmit={onKeySubmit} isValidating={true} />)

      const submitButton = screen.getByRole('button', { name: /validate/i })
      expect(submitButton).toBeDisabled()
    })

    it('disables input when isValidating is true', () => {
      const onKeySubmit = vi.fn()
      render(<ApiKeyInput onKeySubmit={onKeySubmit} isValidating={true} />)

      const input = screen.getByLabelText(/anthropic api key/i)
      expect(input).toBeDisabled()
    })

    it('shows loading state when isValidating is true', () => {
      const onKeySubmit = vi.fn()
      render(<ApiKeyInput onKeySubmit={onKeySubmit} isValidating={true} />)

      // Check for loading indicator text or visual element
      expect(screen.getByText(/validating|loading/i)).toBeInTheDocument()
    })

    it('enables submit button when isValidating is false', () => {
      const onKeySubmit = vi.fn()
      render(<ApiKeyInput onKeySubmit={onKeySubmit} isValidating={false} />)

      const submitButton = screen.getByRole('button', { name: /validate/i })
      expect(submitButton).not.toBeDisabled()
    })
  })

  describe('Accessibility', () => {
    it('has proper label for input', () => {
      const onKeySubmit = vi.fn()
      render(<ApiKeyInput onKeySubmit={onKeySubmit} />)

      const input = screen.getByLabelText(/anthropic api key/i)
      expect(input).toHaveAttribute('id')
    })

    it('associates error message with input using aria-describedby', async () => {
      const onKeySubmit = vi.fn()
      render(<ApiKeyInput onKeySubmit={onKeySubmit} />)

      const input = screen.getByLabelText(/anthropic api key/i)
      const submitButton = screen.getByRole('button', { name: /validate/i })

      fireEvent.change(input, { target: { value: 'invalid' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-describedby')
        expect(input.getAttribute('aria-describedby')).toContain('error')
      })
    })

    it('marks input as invalid when error is present', async () => {
      const onKeySubmit = vi.fn()
      render(<ApiKeyInput onKeySubmit={onKeySubmit} />)

      const input = screen.getByLabelText(/anthropic api key/i)
      const submitButton = screen.getByRole('button', { name: /validate/i })

      fireEvent.change(input, { target: { value: 'invalid' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-invalid', 'true')
      })
    })
  })
})
