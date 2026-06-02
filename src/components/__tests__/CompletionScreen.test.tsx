import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { CompletionScreen } from '../CompletionScreen'

describe('CompletionScreen', () => {
  const defaultProps = {
    solveTime: 125,
    hintsUsed: 1,
    currentLevel: 5,
    previousLevel: 5,
    gridSize: 7,
    onNewPuzzle: vi.fn(),
    onNewPrompt: vi.fn(),
  }

  it('renders congratulations message', () => {
    render(<CompletionScreen {...defaultProps} />)
    expect(screen.getByText(/congratulations/i)).toBeInTheDocument()
  })

  it('displays solve time in MM:SS format', () => {
    render(<CompletionScreen {...defaultProps} solveTime={125} />)
    expect(screen.getByText(/2:05/)).toBeInTheDocument()
  })

  it('formats solve time with leading zero for seconds', () => {
    render(<CompletionScreen {...defaultProps} solveTime={45} />)
    expect(screen.getByText(/0:45/)).toBeInTheDocument()
  })

  it('formats solve time with two-digit minutes', () => {
    render(<CompletionScreen {...defaultProps} solveTime={625} />)
    expect(screen.getByText(/10:25/)).toBeInTheDocument()
  })

  it('formats zero time correctly', () => {
    render(<CompletionScreen {...defaultProps} solveTime={0} />)
    expect(screen.getByText(/0:00/)).toBeInTheDocument()
  })

  it('displays hints used', () => {
    render(<CompletionScreen {...defaultProps} hintsUsed={3} />)
    expect(screen.getByText(/hints/i)).toBeInTheDocument()
    expect(screen.getAllByText('3').length).toBeGreaterThan(0)
  })

  it('displays zero hints correctly', () => {
    render(<CompletionScreen {...defaultProps} hintsUsed={0} />)
    expect(screen.getByText(/hints/i)).toBeInTheDocument()
    expect(screen.getAllByText('0').length).toBeGreaterThan(0)
  })

  it('displays current level', () => {
    render(<CompletionScreen {...defaultProps} currentLevel={5} />)
    expect(screen.getByText(/level 5/i)).toBeInTheDocument()
  })

  it('shows level up message when currentLevel > previousLevel', () => {
    render(
      <CompletionScreen
        {...defaultProps}
        previousLevel={4}
        currentLevel={5}
      />
    )
    const harderMessage = screen.getByText(/next puzzle: harder/i)
    expect(harderMessage).toBeInTheDocument()
    // Should show the new level number in the detail message
    expect(screen.getByText(/moving to level 5/i)).toBeInTheDocument()
  })

  it('does not show level up message when currentLevel === previousLevel', () => {
    render(
      <CompletionScreen
        {...defaultProps}
        previousLevel={5}
        currentLevel={5}
      />
    )
    expect(screen.queryByText(/level up/i)).not.toBeInTheDocument()
  })

  it('shows excellent feedback for fast solve with no hints', () => {
    render(
      <CompletionScreen
        {...defaultProps}
        solveTime={120}
        hintsUsed={0}
      />
    )
    expect(screen.getByText(/excellent work/i)).toBeInTheDocument()
    expect(screen.getByText(/nonogram master/i)).toBeInTheDocument()
  })

  it('shows excellent feedback at exactly 179 seconds', () => {
    render(
      <CompletionScreen
        {...defaultProps}
        solveTime={179}
        hintsUsed={0}
      />
    )
    expect(screen.getByText(/excellent work/i)).toBeInTheDocument()
  })

  it('does not show excellent feedback at 180 seconds', () => {
    render(
      <CompletionScreen
        {...defaultProps}
        solveTime={180}
        hintsUsed={0}
      />
    )
    expect(screen.queryByText(/excellent work/i)).not.toBeInTheDocument()
  })

  it('does not show excellent feedback with any hints', () => {
    render(
      <CompletionScreen
        {...defaultProps}
        solveTime={120}
        hintsUsed={1}
      />
    )
    expect(screen.queryByText(/excellent work/i)).not.toBeInTheDocument()
  })

  it('shows good feedback for medium time with few hints', () => {
    render(
      <CompletionScreen
        {...defaultProps}
        solveTime={300}
        hintsUsed={2}
      />
    )
    expect(screen.getByText(/good job/i)).toBeInTheDocument()
    expect(screen.getByText(/getting better/i)).toBeInTheDocument()
  })

  it('shows good feedback at exactly 419 seconds', () => {
    render(
      <CompletionScreen
        {...defaultProps}
        solveTime={419}
        hintsUsed={2}
      />
    )
    expect(screen.getByText(/good job/i)).toBeInTheDocument()
  })

  it('does not show good feedback at 420 seconds', () => {
    render(
      <CompletionScreen
        {...defaultProps}
        solveTime={420}
        hintsUsed={2}
      />
    )
    expect(screen.queryByText(/good job/i)).not.toBeInTheDocument()
  })

  it('does not show good feedback with more than 2 hints', () => {
    render(
      <CompletionScreen
        {...defaultProps}
        solveTime={300}
        hintsUsed={3}
      />
    )
    expect(screen.queryByText(/good job/i)).not.toBeInTheDocument()
  })

  it('shows nice work feedback for longer solve times', () => {
    render(
      <CompletionScreen
        {...defaultProps}
        solveTime={500}
        hintsUsed={1}
      />
    )
    expect(screen.getByText(/nice work/i)).toBeInTheDocument()
    expect(screen.getByText(/keep practicing/i)).toBeInTheDocument()
  })

  it('shows nice work feedback for many hints', () => {
    render(
      <CompletionScreen
        {...defaultProps}
        solveTime={180}
        hintsUsed={5}
      />
    )
    expect(screen.getByText(/nice work/i)).toBeInTheDocument()
  })

  it('calls onNewPuzzle when New Puzzle button is clicked', () => {
    const onNewPuzzle = vi.fn()
    render(<CompletionScreen {...defaultProps} onNewPuzzle={onNewPuzzle} />)
    fireEvent.click(screen.getByRole('button', { name: /new puzzle/i }))
    expect(onNewPuzzle).toHaveBeenCalledTimes(1)
  })

  it('calls onNewPrompt when New Prompt button is clicked', () => {
    const onNewPrompt = vi.fn()
    render(<CompletionScreen {...defaultProps} onNewPrompt={onNewPrompt} />)
    fireEvent.click(screen.getByRole('button', { name: /new prompt/i }))
    expect(onNewPrompt).toHaveBeenCalledTimes(1)
  })

  it('renders both action buttons', () => {
    render(<CompletionScreen {...defaultProps} />)
    expect(screen.getByRole('button', { name: /new puzzle/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /new prompt/i })).toBeInTheDocument()
  })

  it('has proper styling for primary button', () => {
    render(<CompletionScreen {...defaultProps} />)
    const newPuzzleButton = screen.getByRole('button', { name: /new puzzle/i })
    expect(newPuzzleButton).toHaveClass('glass')
  })

  it('handles very long solve times', () => {
    render(<CompletionScreen {...defaultProps} solveTime={3599} />)
    expect(screen.getByText(/59:59/)).toBeInTheDocument()
  })

  it('displays metrics in a structured layout', () => {
    const { container } = render(<CompletionScreen {...defaultProps} />)
    expect(container.querySelector('.grid, [class*="grid"]')).toBeInTheDocument()
  })
})
