import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PuzzlePrompt } from '../PuzzlePrompt'

describe('PuzzlePrompt', () => {
  const defaultProps = {
    onGeneratePuzzle: vi.fn(),
    difficultyLevel: 5,
    gridSize: 10,
    isGenerating: false,
    hasApiKey: true,
  }

  it('renders with default props', () => {
    render(<PuzzlePrompt {...defaultProps} />)

    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /generate puzzle/i })).toBeInTheDocument()
  })

  it('displays difficulty level correctly', () => {
    render(<PuzzlePrompt {...defaultProps} />)

    expect(screen.getByText('Level 5/10')).toBeInTheDocument()
  })

  it('displays grid size correctly', () => {
    render(<PuzzlePrompt {...defaultProps} />)

    expect(screen.getByText('10×10 grid')).toBeInTheDocument()
  })

  it('displays different difficulty levels', () => {
    const { rerender } = render(<PuzzlePrompt {...defaultProps} difficultyLevel={1} />)
    expect(screen.getByText('Level 1/10')).toBeInTheDocument()

    rerender(<PuzzlePrompt {...defaultProps} difficultyLevel={10} />)
    expect(screen.getByText('Level 10/10')).toBeInTheDocument()
  })

  it('displays different grid sizes', () => {
    const { rerender } = render(<PuzzlePrompt {...defaultProps} gridSize={15} />)
    expect(screen.getByText('15×15 grid')).toBeInTheDocument()

    rerender(<PuzzlePrompt {...defaultProps} gridSize={20} />)
    expect(screen.getByText('20×20 grid')).toBeInTheDocument()
  })

  it('input field accepts and updates input', () => {
    render(<PuzzlePrompt {...defaultProps} />)

    const input = screen.getByRole('textbox') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'a cute cat' } })

    expect(input.value).toBe('a cute cat')
  })

  it('has placeholder text with suggestions', () => {
    render(<PuzzlePrompt {...defaultProps} />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('placeholder')
    expect(input.getAttribute('placeholder')).toContain('cat')
  })

  it('generate button calls onGeneratePuzzle with trimmed prompt', () => {
    const mockOnGenerate = vi.fn()
    render(<PuzzlePrompt {...defaultProps} onGeneratePuzzle={mockOnGenerate} />)

    const input = screen.getByRole('textbox')
    const button = screen.getByRole('button', { name: /generate puzzle/i })

    fireEvent.change(input, { target: { value: '  a rocket ship  ' } })
    fireEvent.click(button)

    expect(mockOnGenerate).toHaveBeenCalledWith('a rocket ship')
    expect(mockOnGenerate).toHaveBeenCalledTimes(1)
  })

  it('generate button is disabled when prompt is empty', () => {
    render(<PuzzlePrompt {...defaultProps} />)

    const button = screen.getByRole('button', { name: /generate puzzle/i })
    expect(button).toBeDisabled()
  })

  it('generate button is disabled when prompt contains only whitespace', () => {
    render(<PuzzlePrompt {...defaultProps} />)

    const input = screen.getByRole('textbox')
    const button = screen.getByRole('button', { name: /generate puzzle/i })

    fireEvent.change(input, { target: { value: '   ' } })
    expect(button).toBeDisabled()

    fireEvent.change(input, { target: { value: '\n\t  ' } })
    expect(button).toBeDisabled()
  })

  it('generate button is enabled when prompt has valid text', () => {
    render(<PuzzlePrompt {...defaultProps} />)

    const input = screen.getByRole('textbox')
    const button = screen.getByRole('button', { name: /generate puzzle/i })

    fireEvent.change(input, { target: { value: 'a cat' } })
    expect(button).not.toBeDisabled()
  })

  it('generate button is disabled when hasApiKey is false', () => {
    render(<PuzzlePrompt {...defaultProps} hasApiKey={false} />)

    const input = screen.getByRole('textbox')
    const button = screen.getByRole('button', { name: /generate puzzle/i })

    fireEvent.change(input, { target: { value: 'a cat' } })
    expect(button).toBeDisabled()
  })

  it('generate button is disabled during generation', () => {
    render(<PuzzlePrompt {...defaultProps} isGenerating={true} />)

    const input = screen.getByRole('textbox')
    const button = screen.getByRole('button', { name: /generating/i })

    fireEvent.change(input, { target: { value: 'a cat' } })
    expect(button).toBeDisabled()
  })

  it('shows loading state text when generating', () => {
    render(<PuzzlePrompt {...defaultProps} isGenerating={true} />)

    expect(screen.getByText(/generating/i)).toBeInTheDocument()
  })

  it('does not call onGeneratePuzzle when button is disabled', () => {
    const mockOnGenerate = vi.fn()
    render(<PuzzlePrompt {...defaultProps} onGeneratePuzzle={mockOnGenerate} />)

    const button = screen.getByRole('button', { name: /generate puzzle/i })
    fireEvent.click(button)

    expect(mockOnGenerate).not.toHaveBeenCalled()
  })

  it('clears input after successful generation', () => {
    const mockOnGenerate = vi.fn()
    render(<PuzzlePrompt {...defaultProps} onGeneratePuzzle={mockOnGenerate} />)

    const input = screen.getByRole('textbox') as HTMLInputElement
    const button = screen.getByRole('button', { name: /generate puzzle/i })

    fireEvent.change(input, { target: { value: 'a smiley face' } })
    fireEvent.click(button)

    expect(input.value).toBe('')
  })

  it('supports form submission with Enter key', () => {
    const mockOnGenerate = vi.fn()
    render(<PuzzlePrompt {...defaultProps} onGeneratePuzzle={mockOnGenerate} />)

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'a house' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(mockOnGenerate).toHaveBeenCalledWith('a house')
  })

  it('does not submit via keyboard when prompt is empty', () => {
    const mockOnGenerate = vi.fn()
    render(<PuzzlePrompt {...defaultProps} onGeneratePuzzle={mockOnGenerate} />)

    const input = screen.getByRole('textbox')
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(mockOnGenerate).not.toHaveBeenCalled()
  })

  it('does not submit via keyboard when disabled', () => {
    const mockOnGenerate = vi.fn()
    render(<PuzzlePrompt {...defaultProps} hasApiKey={false} onGeneratePuzzle={mockOnGenerate} />)

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'a cat' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(mockOnGenerate).not.toHaveBeenCalled()
  })

  it('input field has maxLength attribute', () => {
    render(<PuzzlePrompt {...defaultProps} />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('maxLength', '100')
  })

  it('maintains input when isGenerating changes to false', () => {
    const { rerender } = render(<PuzzlePrompt {...defaultProps} isGenerating={true} />)

    const input = screen.getByRole('textbox') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'a bird' } })

    rerender(<PuzzlePrompt {...defaultProps} isGenerating={false} />)

    expect(input.value).toBe('a bird')
  })
})
