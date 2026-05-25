import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { usePuzzle } from '../usePuzzle'
import * as puzzleGenerator from '@/lib/puzzleGenerator'
import type { Puzzle } from '@/types'

// Mock the puzzle generator module
vi.mock('@/lib/puzzleGenerator')
// Mock the API client (needed for ApiClient constructor in hook)
vi.mock('@/lib/api')

describe('usePuzzle', () => {
  const mockPuzzle: Puzzle = {
    id: 'test-puzzle-123',
    prompt: 'heart',
    solution: [
      [true, false],
      [false, true]
    ],
    rowClues: [[1], [1]],
    columnClues: [[1], [1]],
    currentGrid: [
      ['empty', 'empty'],
      ['empty', 'empty']
    ],
    startTime: 1234567890,
    hintsUsed: 0,
    errors: 0
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial state', () => {
    it('initializes with null puzzle', () => {
      const { result } = renderHook(() => usePuzzle())

      expect(result.current.puzzle).toBeNull()
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('provides all expected functions', () => {
      const { result } = renderHook(() => usePuzzle())

      expect(typeof result.current.generateNewPuzzle).toBe('function')
      expect(typeof result.current.updateCell).toBe('function')
      expect(typeof result.current.resetPuzzle).toBe('function')
    })
  })

  describe('generateNewPuzzle', () => {
    it('sets loading state during puzzle generation', async () => {
      vi.mocked(puzzleGenerator.generatePuzzle).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockPuzzle), 100))
      )

      const { result } = renderHook(() => usePuzzle())

      // Start generation
      act(() => {
        result.current.generateNewPuzzle('test-api-key', 'heart', 5)
      })

      // Should be loading
      expect(result.current.loading).toBe(true)
      expect(result.current.error).toBeNull()

      // Wait for completion
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })

    it('generates new puzzle successfully', async () => {
      vi.mocked(puzzleGenerator.generatePuzzle).mockResolvedValue(mockPuzzle)

      const { result } = renderHook(() => usePuzzle())

      await act(async () => {
        await result.current.generateNewPuzzle('test-api-key', 'heart', 5)
      })

      await waitFor(() => {
        expect(result.current.puzzle).toEqual(mockPuzzle)
        expect(result.current.loading).toBe(false)
        expect(result.current.error).toBeNull()
      })
    })

    it('calls generatePuzzle with ApiClient instance and parameters', async () => {
      vi.mocked(puzzleGenerator.generatePuzzle).mockResolvedValue(mockPuzzle)

      const { result } = renderHook(() => usePuzzle())

      await act(async () => {
        await result.current.generateNewPuzzle('test-api-key', 'heart', 5)
      })

      await waitFor(() => {
        expect(puzzleGenerator.generatePuzzle).toHaveBeenCalledTimes(1)

        // Check that first argument is an ApiClient instance
        const callArgs = vi.mocked(puzzleGenerator.generatePuzzle).mock.calls[0]
        expect(callArgs[0]).toBeDefined()
        expect(callArgs[1]).toBe('heart')
        expect(callArgs[2]).toBe(5)
      })
    })

    it('handles generation errors', async () => {
      const error = new Error('API rate limit exceeded')
      vi.mocked(puzzleGenerator.generatePuzzle).mockRejectedValue(error)

      const { result } = renderHook(() => usePuzzle())

      await act(async () => {
        await result.current.generateNewPuzzle('test-api-key', 'heart', 5)
      })

      await waitFor(() => {
        expect(result.current.puzzle).toBeNull()
        expect(result.current.loading).toBe(false)
        expect(result.current.error).toBe('API rate limit exceeded')
      })
    })

    it('clears previous error on new generation attempt', async () => {
      // First call fails
      vi.mocked(puzzleGenerator.generatePuzzle).mockRejectedValueOnce(new Error('First error'))

      const { result } = renderHook(() => usePuzzle())

      await act(async () => {
        await result.current.generateNewPuzzle('test-api-key', 'heart', 5)
      })

      await waitFor(() => {
        expect(result.current.error).toBe('First error')
      })

      // Second call succeeds
      vi.mocked(puzzleGenerator.generatePuzzle).mockResolvedValue(mockPuzzle)

      await act(async () => {
        await result.current.generateNewPuzzle('test-api-key', 'star', 7)
      })

      await waitFor(() => {
        expect(result.current.error).toBeNull()
        expect(result.current.puzzle).toEqual(mockPuzzle)
      })
    })

    it('replaces previous puzzle with new one', async () => {
      const firstPuzzle: Puzzle = { ...mockPuzzle, id: 'puzzle-1', prompt: 'heart' }
      const secondPuzzle: Puzzle = { ...mockPuzzle, id: 'puzzle-2', prompt: 'star' }

      vi.mocked(puzzleGenerator.generatePuzzle).mockResolvedValueOnce(firstPuzzle)

      const { result } = renderHook(() => usePuzzle())

      await act(async () => {
        await result.current.generateNewPuzzle('test-api-key', 'heart', 5)
      })

      await waitFor(() => {
        expect(result.current.puzzle?.id).toBe('puzzle-1')
      })

      vi.mocked(puzzleGenerator.generatePuzzle).mockResolvedValueOnce(secondPuzzle)

      await act(async () => {
        await result.current.generateNewPuzzle('test-api-key', 'star', 7)
      })

      await waitFor(() => {
        expect(result.current.puzzle?.id).toBe('puzzle-2')
      })
    })
  })

  describe('updateCell', () => {
    it('updates cell state immutably', async () => {
      vi.mocked(puzzleGenerator.generatePuzzle).mockResolvedValue(mockPuzzle)

      const { result } = renderHook(() => usePuzzle())

      await act(async () => {
        await result.current.generateNewPuzzle('test-api-key', 'heart', 5)
      })

      await waitFor(() => {
        expect(result.current.puzzle).not.toBeNull()
      })

      const originalGrid = result.current.puzzle!.currentGrid

      act(() => {
        result.current.updateCell(0, 1, 'filled')
      })

      // Check that the grid was updated
      expect(result.current.puzzle!.currentGrid[0][1]).toBe('filled')

      // Check that the original grid was not mutated
      expect(originalGrid[0][1]).toBe('empty')

      // Check other cells remain unchanged
      expect(result.current.puzzle!.currentGrid[0][0]).toBe('empty')
      expect(result.current.puzzle!.currentGrid[1][0]).toBe('empty')
      expect(result.current.puzzle!.currentGrid[1][1]).toBe('empty')
    })

    it('updates multiple cells independently', async () => {
      vi.mocked(puzzleGenerator.generatePuzzle).mockResolvedValue(mockPuzzle)

      const { result } = renderHook(() => usePuzzle())

      await act(async () => {
        await result.current.generateNewPuzzle('test-api-key', 'heart', 5)
      })

      await waitFor(() => {
        expect(result.current.puzzle).not.toBeNull()
      })

      // Update cells one at a time to avoid batching issues
      act(() => {
        result.current.updateCell(0, 0, 'filled')
      })

      act(() => {
        result.current.updateCell(0, 1, 'marked')
      })

      act(() => {
        result.current.updateCell(1, 1, 'filled')
      })

      expect(result.current.puzzle!.currentGrid[0][0]).toBe('filled')
      expect(result.current.puzzle!.currentGrid[0][1]).toBe('marked')
      expect(result.current.puzzle!.currentGrid[1][0]).toBe('empty')
      expect(result.current.puzzle!.currentGrid[1][1]).toBe('filled')
    })

    it('does nothing when puzzle is null', () => {
      const { result } = renderHook(() => usePuzzle())

      // Should not throw
      act(() => {
        result.current.updateCell(0, 0, 'filled')
      })

      expect(result.current.puzzle).toBeNull()
    })

    it('preserves puzzle metadata when updating cells', async () => {
      vi.mocked(puzzleGenerator.generatePuzzle).mockResolvedValue(mockPuzzle)

      const { result } = renderHook(() => usePuzzle())

      await act(async () => {
        await result.current.generateNewPuzzle('test-api-key', 'heart', 5)
      })

      await waitFor(() => {
        expect(result.current.puzzle).not.toBeNull()
      })

      act(() => {
        result.current.updateCell(0, 0, 'filled')
      })

      // Metadata should remain unchanged
      expect(result.current.puzzle!.id).toBe(mockPuzzle.id)
      expect(result.current.puzzle!.prompt).toBe(mockPuzzle.prompt)
      expect(result.current.puzzle!.solution).toEqual(mockPuzzle.solution)
      expect(result.current.puzzle!.rowClues).toEqual(mockPuzzle.rowClues)
      expect(result.current.puzzle!.columnClues).toEqual(mockPuzzle.columnClues)
      expect(result.current.puzzle!.startTime).toBe(mockPuzzle.startTime)
      expect(result.current.puzzle!.hintsUsed).toBe(mockPuzzle.hintsUsed)
      expect(result.current.puzzle!.errors).toBe(mockPuzzle.errors)
    })

    it('can clear a filled cell', async () => {
      vi.mocked(puzzleGenerator.generatePuzzle).mockResolvedValue(mockPuzzle)

      const { result } = renderHook(() => usePuzzle())

      await act(async () => {
        await result.current.generateNewPuzzle('test-api-key', 'heart', 5)
      })

      await waitFor(() => {
        expect(result.current.puzzle).not.toBeNull()
      })

      // Fill a cell
      act(() => {
        result.current.updateCell(0, 0, 'filled')
      })

      expect(result.current.puzzle!.currentGrid[0][0]).toBe('filled')

      // Clear it
      act(() => {
        result.current.updateCell(0, 0, 'empty')
      })

      expect(result.current.puzzle!.currentGrid[0][0]).toBe('empty')
    })
  })

  describe('resetPuzzle', () => {
    it('resets grid to all empty cells', async () => {
      vi.mocked(puzzleGenerator.generatePuzzle).mockResolvedValue(mockPuzzle)

      const { result } = renderHook(() => usePuzzle())

      await act(async () => {
        await result.current.generateNewPuzzle('test-api-key', 'heart', 5)
      })

      await waitFor(() => {
        expect(result.current.puzzle).not.toBeNull()
      })

      // Make some moves
      act(() => {
        result.current.updateCell(0, 0, 'filled')
        result.current.updateCell(0, 1, 'marked')
        result.current.updateCell(1, 1, 'filled')
      })

      // Reset
      act(() => {
        result.current.resetPuzzle()
      })

      // All cells should be empty
      expect(result.current.puzzle!.currentGrid).toEqual([
        ['empty', 'empty'],
        ['empty', 'empty']
      ])
    })

    it('resets startTime to current timestamp', async () => {
      vi.mocked(puzzleGenerator.generatePuzzle).mockResolvedValue(mockPuzzle)

      const { result } = renderHook(() => usePuzzle())

      await act(async () => {
        await result.current.generateNewPuzzle('test-api-key', 'heart', 5)
      })

      await waitFor(() => {
        expect(result.current.puzzle).not.toBeNull()
      })

      const originalStartTime = result.current.puzzle!.startTime

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 10))

      const beforeReset = Date.now()

      act(() => {
        result.current.resetPuzzle()
      })

      const afterReset = Date.now()

      // startTime should be updated
      expect(result.current.puzzle!.startTime).toBeGreaterThan(originalStartTime)
      expect(result.current.puzzle!.startTime).toBeGreaterThanOrEqual(beforeReset)
      expect(result.current.puzzle!.startTime).toBeLessThanOrEqual(afterReset)
    })

    it('resets hintsUsed to 0', async () => {
      const puzzleWithHints = { ...mockPuzzle, hintsUsed: 5 }
      vi.mocked(puzzleGenerator.generatePuzzle).mockResolvedValue(puzzleWithHints)

      const { result } = renderHook(() => usePuzzle())

      await act(async () => {
        await result.current.generateNewPuzzle('test-api-key', 'heart', 5)
      })

      await waitFor(() => {
        expect(result.current.puzzle).not.toBeNull()
      })

      expect(result.current.puzzle!.hintsUsed).toBe(5)

      act(() => {
        result.current.resetPuzzle()
      })

      expect(result.current.puzzle!.hintsUsed).toBe(0)
    })

    it('resets errors to 0', async () => {
      const puzzleWithErrors = { ...mockPuzzle, errors: 3 }
      vi.mocked(puzzleGenerator.generatePuzzle).mockResolvedValue(puzzleWithErrors)

      const { result } = renderHook(() => usePuzzle())

      await act(async () => {
        await result.current.generateNewPuzzle('test-api-key', 'heart', 5)
      })

      await waitFor(() => {
        expect(result.current.puzzle).not.toBeNull()
      })

      expect(result.current.puzzle!.errors).toBe(3)

      act(() => {
        result.current.resetPuzzle()
      })

      expect(result.current.puzzle!.errors).toBe(0)
    })

    it('preserves solution and clues', async () => {
      vi.mocked(puzzleGenerator.generatePuzzle).mockResolvedValue(mockPuzzle)

      const { result } = renderHook(() => usePuzzle())

      await act(async () => {
        await result.current.generateNewPuzzle('test-api-key', 'heart', 5)
      })

      await waitFor(() => {
        expect(result.current.puzzle).not.toBeNull()
      })

      act(() => {
        result.current.resetPuzzle()
      })

      // Solution and clues should remain unchanged
      expect(result.current.puzzle!.solution).toEqual(mockPuzzle.solution)
      expect(result.current.puzzle!.rowClues).toEqual(mockPuzzle.rowClues)
      expect(result.current.puzzle!.columnClues).toEqual(mockPuzzle.columnClues)
      expect(result.current.puzzle!.id).toBe(mockPuzzle.id)
      expect(result.current.puzzle!.prompt).toBe(mockPuzzle.prompt)
    })

    it('does nothing when puzzle is null', () => {
      const { result } = renderHook(() => usePuzzle())

      // Should not throw
      act(() => {
        result.current.resetPuzzle()
      })

      expect(result.current.puzzle).toBeNull()
    })

    it('works correctly with larger grids', async () => {
      const largePuzzle: Puzzle = {
        id: 'large-puzzle',
        prompt: 'large',
        solution: Array(5).fill(null).map(() => Array(5).fill(false)),
        rowClues: [[1], [1], [1], [1], [1]],
        columnClues: [[1], [1], [1], [1], [1]],
        currentGrid: Array(5).fill(null).map(() => Array(5).fill('empty' as const)),
        startTime: Date.now(),
        hintsUsed: 0,
        errors: 0
      }

      vi.mocked(puzzleGenerator.generatePuzzle).mockResolvedValue(largePuzzle)

      const { result } = renderHook(() => usePuzzle())

      await act(async () => {
        await result.current.generateNewPuzzle('test-api-key', 'large', 5)
      })

      await waitFor(() => {
        expect(result.current.puzzle).not.toBeNull()
      })

      // Fill some cells
      act(() => {
        result.current.updateCell(0, 0, 'filled')
        result.current.updateCell(2, 2, 'filled')
        result.current.updateCell(4, 4, 'marked')
      })

      act(() => {
        result.current.resetPuzzle()
      })

      // All cells should be empty
      const allEmpty = result.current.puzzle!.currentGrid.every(row =>
        row.every(cell => cell === 'empty')
      )
      expect(allEmpty).toBe(true)
    })
  })

  describe('Edge cases and integration', () => {
    it('handles rapid successive updates', async () => {
      vi.mocked(puzzleGenerator.generatePuzzle).mockResolvedValue(mockPuzzle)

      const { result } = renderHook(() => usePuzzle())

      await act(async () => {
        await result.current.generateNewPuzzle('test-api-key', 'heart', 5)
      })

      await waitFor(() => {
        expect(result.current.puzzle).not.toBeNull()
      })

      // Rapid updates to same cell
      act(() => {
        result.current.updateCell(0, 0, 'filled')
        result.current.updateCell(0, 0, 'marked')
        result.current.updateCell(0, 0, 'empty')
        result.current.updateCell(0, 0, 'filled')
      })

      expect(result.current.puzzle!.currentGrid[0][0]).toBe('filled')
    })

    it('maintains state correctly through generate -> update -> reset -> update cycle', async () => {
      vi.mocked(puzzleGenerator.generatePuzzle).mockResolvedValue(mockPuzzle)

      const { result } = renderHook(() => usePuzzle())

      // Generate
      await act(async () => {
        await result.current.generateNewPuzzle('test-api-key', 'heart', 5)
      })

      await waitFor(() => {
        expect(result.current.puzzle).not.toBeNull()
      })

      // Update
      act(() => {
        result.current.updateCell(0, 0, 'filled')
      })

      expect(result.current.puzzle!.currentGrid[0][0]).toBe('filled')

      // Reset
      act(() => {
        result.current.resetPuzzle()
      })

      expect(result.current.puzzle!.currentGrid[0][0]).toBe('empty')

      // Update again
      act(() => {
        result.current.updateCell(1, 1, 'marked')
      })

      expect(result.current.puzzle!.currentGrid[1][1]).toBe('marked')
      expect(result.current.puzzle!.currentGrid[0][0]).toBe('empty')
    })
  })
})
