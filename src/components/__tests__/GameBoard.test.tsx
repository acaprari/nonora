import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { GameBoard } from '../GameBoard'
import { Puzzle, ValidationResult } from '../../types'

const createMockPuzzle = (size: number): Puzzle => {
  const solution = Array(size).fill(null).map(() => Array(size).fill(false))
  const currentGrid = Array(size).fill(null).map(() => Array(size).fill('empty'))
  const rowClues = Array(size).fill(null).map(() => [1])
  const columnClues = Array(size).fill(null).map(() => [1])

  return {
    id: 'test-puzzle',
    prompt: 'Test puzzle',
    solution,
    rowClues,
    columnClues,
    currentGrid,
    startTime: Date.now(),
    hintsUsed: 0
  }
}

const createMockValidation = (size: number): ValidationResult => {
  return {
    rows: Array(size).fill('in-progress'),
    columns: Array(size).fill('in-progress'),
    isComplete: false,
    isValid: false
  }
}

// Default props for GameBoard tests
const defaultGameBoardProps = {
  apiClient: null,
  onHintUsed: vi.fn(),
  currentLevel: 1,
  currentGridSize: 10
}

describe('GameBoard', () => {
  describe('Cell Rendering', () => {
    it('renders correct number of cells for 2x2 grid', () => {
      const puzzle = createMockPuzzle(2)
      const validation = createMockValidation(2)

      render(<GameBoard puzzle={puzzle} validationResult={validation} onCellClick={() => {}} {...defaultGameBoardProps} />)

      const cells = screen.getAllByRole('button', { name: /Cell/ })
      expect(cells).toHaveLength(4) // 2x2 = 4 cells
    })

    it('renders correct number of cells for 5x5 grid', () => {
      const puzzle = createMockPuzzle(5)
      const validation = createMockValidation(5)

      render(<GameBoard puzzle={puzzle} validationResult={validation} onCellClick={() => {}} {...defaultGameBoardProps} />)

      const cells = screen.getAllByRole('button', { name: /Cell/ })
      expect(cells).toHaveLength(25) // 5x5 = 25 cells
    })

    it('renders correct number of cells for 10x10 grid', () => {
      const puzzle = createMockPuzzle(10)
      const validation = createMockValidation(10)

      render(<GameBoard puzzle={puzzle} validationResult={validation} onCellClick={() => {}} {...defaultGameBoardProps} />)

      const cells = screen.getAllByRole('button', { name: /Cell/ })
      expect(cells).toHaveLength(100) // 10x10 = 100 cells
    })
  })

  describe('Clues Rendering', () => {
    it('renders row clues for each row', () => {
      const puzzle = createMockPuzzle(2)
      puzzle.rowClues = [[1], [2]]
      const validation = createMockValidation(2)

      const { container } = render(
        <GameBoard puzzle={puzzle} validationResult={validation} onCellClick={() => {}} {...defaultGameBoardProps} />
      )

      expect(container.textContent).toContain('1')
      expect(container.textContent).toContain('2')
    })

    it('renders column clues for each column', () => {
      const puzzle = createMockPuzzle(2)
      puzzle.columnClues = [[3], [4]]
      const validation = createMockValidation(2)

      const { container } = render(
        <GameBoard puzzle={puzzle} validationResult={validation} onCellClick={() => {}} {...defaultGameBoardProps} />
      )

      expect(container.textContent).toContain('3')
      expect(container.textContent).toContain('4')
    })

    it('renders multiple clues per row', () => {
      const puzzle = createMockPuzzle(2)
      puzzle.rowClues = [[1, 2], [3]]
      const validation = createMockValidation(2)

      const { container } = render(
        <GameBoard puzzle={puzzle} validationResult={validation} onCellClick={() => {}} {...defaultGameBoardProps} />
      )

      expect(container.textContent).toContain('1')
      expect(container.textContent).toContain('2')
      expect(container.textContent).toContain('3')
    })

    it('renders multiple clues per column', () => {
      const puzzle = createMockPuzzle(2)
      puzzle.columnClues = [[1, 2], [3, 4]]
      const validation = createMockValidation(2)

      const { container } = render(
        <GameBoard puzzle={puzzle} validationResult={validation} onCellClick={() => {}} {...defaultGameBoardProps} />
      )

      expect(container.textContent).toContain('1')
      expect(container.textContent).toContain('2')
      expect(container.textContent).toContain('3')
      expect(container.textContent).toContain('4')
    })
  })

  describe('Cell Interactions', () => {
    it('calls onCellClick with correct coordinates when cell is clicked', () => {
      const puzzle = createMockPuzzle(2)
      const validation = createMockValidation(2)
      const handleClick = vi.fn()

      render(<GameBoard puzzle={puzzle} validationResult={validation} onCellClick={handleClick} {...defaultGameBoardProps} />)

      const cells = screen.getAllByRole('button', { name: /Cell/ })
      fireEvent.click(cells[0])

      expect(handleClick).toHaveBeenCalledWith(0, 0)
    })

    it('calls onCellClick with correct coordinates for bottom-right cell', () => {
      const puzzle = createMockPuzzle(2)
      const validation = createMockValidation(2)
      const handleClick = vi.fn()

      render(<GameBoard puzzle={puzzle} validationResult={validation} onCellClick={handleClick} {...defaultGameBoardProps} />)

      const cells = screen.getAllByRole('button', { name: /Cell/ })
      fireEvent.click(cells[3]) // Last cell in 2x2 grid

      expect(handleClick).toHaveBeenCalledWith(1, 1)
    })

    it('calls onCellClick with correct coordinates for middle cell in 3x3 grid', () => {
      const puzzle = createMockPuzzle(3)
      const validation = createMockValidation(3)
      const handleClick = vi.fn()

      render(<GameBoard puzzle={puzzle} validationResult={validation} onCellClick={handleClick} {...defaultGameBoardProps} />)

      const cells = screen.getAllByRole('button', { name: /Cell/ })
      fireEvent.click(cells[4]) // Center cell in 3x3 grid (index 4 = row 1, col 1)

      expect(handleClick).toHaveBeenCalledWith(1, 1)
    })
  })

  describe('Validation States', () => {
    it('applies validation state to cells after debounce delay', async () => {
      const puzzle = createMockPuzzle(2)
      const validation = createMockValidation(2)
      validation.rows[0] = 'valid'

      render(<GameBoard puzzle={puzzle} validationResult={validation} onCellClick={() => {}} {...defaultGameBoardProps} />)

      const cells = screen.getAllByRole('button', { name: /Cell/ })

      // Wait for debounced validation to appear (1.5s delay)
      await waitFor(() => {
        expect(cells[0]).toHaveClass('border-success')
        expect(cells[1]).toHaveClass('border-success')
      }, { timeout: 2000 })
    })

    it('applies error validation state to cells after debounce delay', async () => {
      const puzzle = createMockPuzzle(2)
      const validation = createMockValidation(2)
      validation.rows[1] = 'error'

      render(<GameBoard puzzle={puzzle} validationResult={validation} onCellClick={() => {}} {...defaultGameBoardProps} />)

      const cells = screen.getAllByRole('button', { name: /Cell/ })

      // Wait for debounced validation to appear (1.5s delay)
      await waitFor(() => {
        expect(cells[2]).toHaveClass('border-error')
        expect(cells[3]).toHaveClass('border-error')
      }, { timeout: 2000 })
    })

    it('applies validation state to row clues after debounce delay', async () => {
      const puzzle = createMockPuzzle(2)
      puzzle.rowClues = [[1], [2]]
      const validation = createMockValidation(2)
      validation.rows[0] = 'valid'

      const { container } = render(
        <GameBoard puzzle={puzzle} validationResult={validation} onCellClick={() => {}} {...defaultGameBoardProps} />
      )

      // Wait for debounced validation to appear (1.5s delay)
      await waitFor(() => {
        // Check for success background color class (enhanced contrast)
        const clueElements = container.querySelectorAll('.bg-green-700')
        expect(clueElements.length).toBeGreaterThan(0)
      }, { timeout: 2000 })
    })

    it('applies validation state to column clues after debounce delay', async () => {
      const puzzle = createMockPuzzle(2)
      puzzle.columnClues = [[1], [2]]
      const validation = createMockValidation(2)
      validation.columns[0] = 'error'

      const { container } = render(
        <GameBoard puzzle={puzzle} validationResult={validation} onCellClick={() => {}} {...defaultGameBoardProps} />
      )

      // Wait for debounced validation to appear (1.5s delay)
      await waitFor(() => {
        // Check for error text color class
        const clueElements = container.querySelectorAll('.text-error')
        expect(clueElements.length).toBeGreaterThan(0)
      }, { timeout: 2000 })
    })
  })

  describe('Layout and Structure', () => {
    it('renders with proper layout structure', () => {
      const puzzle = createMockPuzzle(2)
      const validation = createMockValidation(2)

      const { container } = render(
        <GameBoard puzzle={puzzle} validationResult={validation} onCellClick={() => {}} {...defaultGameBoardProps} />
      )

      expect(container.querySelector('.flex.flex-col')).toBeInTheDocument()
    })

    it('renders cells with proper state', () => {
      const puzzle = createMockPuzzle(2)
      puzzle.currentGrid = [
        ['filled', 'empty'],
        ['marked', 'filled']
      ]
      const validation = createMockValidation(2)

      render(<GameBoard puzzle={puzzle} validationResult={validation} onCellClick={() => {}} {...defaultGameBoardProps} />)

      const cells = screen.getAllByRole('button', { name: /Cell/ })
      expect(cells[0]).toHaveClass('bg-cell-filled')
      expect(cells[1]).toHaveClass('bg-white')
      expect(cells[2].textContent).toBe('×') // marked cell
      expect(cells[3]).toHaveClass('bg-cell-filled')
    })
  })

  describe('Grid Sizing', () => {
    it('handles small grid (3x3)', () => {
      const puzzle = createMockPuzzle(3)
      const validation = createMockValidation(3)

      render(<GameBoard puzzle={puzzle} validationResult={validation} onCellClick={() => {}} {...defaultGameBoardProps} />)

      const cells = screen.getAllByRole('button', { name: /Cell/ })
      expect(cells).toHaveLength(9)
    })

    it('handles medium grid (7x7)', () => {
      const puzzle = createMockPuzzle(7)
      const validation = createMockValidation(7)

      render(<GameBoard puzzle={puzzle} validationResult={validation} onCellClick={() => {}} {...defaultGameBoardProps} />)

      const cells = screen.getAllByRole('button', { name: /Cell/ })
      expect(cells).toHaveLength(49)
    })

    it('handles large grid (15x15)', () => {
      const puzzle = createMockPuzzle(15)
      const validation = createMockValidation(15)

      render(<GameBoard puzzle={puzzle} validationResult={validation} onCellClick={() => {}} {...defaultGameBoardProps} />)

      const cells = screen.getAllByRole('button', { name: /Cell/ })
      expect(cells).toHaveLength(225)
    })
  })

  describe('Hint Button Loading State', () => {
    it('shows loading indicator in hint button while requesting hint', async () => {
      const mockApiClient = {
        getHint: vi.fn(() => new Promise(resolve => setTimeout(resolve, 1000)))
      }

      const puzzle = createMockPuzzle(5)
      const validation = createMockValidation(5)

      render(
        <GameBoard
          puzzle={puzzle}
          validationResult={validation}
          onCellClick={() => {}}
          apiClient={mockApiClient as any}
          onHintUsed={vi.fn()}
          currentLevel={1}
          currentGridSize={10}
        />
      )

      const hintButton = screen.getByTestId('hint-button')

      // Before click: shows "Get Hint"
      expect(hintButton.textContent).toContain('Get Hint')

      // Click button
      fireEvent.click(hintButton)

      // During loading: button is disabled and shows indicator
      await waitFor(() => {
        expect(hintButton).toBeDisabled()
        // AiLoadingIndicator renders sparkle SVG icons
        const sparkleIcons = hintButton.querySelectorAll('svg')
        expect(sparkleIcons.length).toBeGreaterThan(0)
      })
    })
  })
})
