import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePuzzle } from '../usePuzzle'
import type { Puzzle } from '@/types'

const createMockPuzzle = (): Puzzle => ({
  id: 'test-123',
  prompt: 'a cat',
  solution: Array(10).fill(null).map(() => Array(10).fill(false)),
  rowClues: Array(10).fill([]),
  columnClues: Array(10).fill([]),
  currentGrid: Array(10).fill(null).map(() => Array(10).fill('empty')),
  startTime: Date.now(),
  hintsUsed: 0
})

describe('usePuzzle', () => {
  it('initializes with provided puzzle', () => {
    const mockPuzzle = createMockPuzzle()
    const { result } = renderHook(() => usePuzzle(mockPuzzle))

    expect(result.current.puzzle).toEqual(mockPuzzle)
  })

  it('toggles cell from empty to filled', () => {
    const mockPuzzle = createMockPuzzle()
    const { result } = renderHook(() => usePuzzle(mockPuzzle))

    act(() => {
      result.current.toggleCell(0, 0)
    })

    expect(result.current.puzzle!.currentGrid[0][0]).toBe('filled')
  })

  it('toggles cell from filled to marked', () => {
    const mockPuzzle = createMockPuzzle()
    const { result } = renderHook(() => usePuzzle(mockPuzzle))

    act(() => {
      result.current.toggleCell(0, 0)
      result.current.toggleCell(0, 0)
    })

    expect(result.current.puzzle!.currentGrid[0][0]).toBe('marked')
  })

  it('toggles cell from marked to empty', () => {
    const mockPuzzle = createMockPuzzle()
    const { result } = renderHook(() => usePuzzle(mockPuzzle))

    act(() => {
      result.current.toggleCell(0, 0)
      result.current.toggleCell(0, 0)
      result.current.toggleCell(0, 0)
    })

    expect(result.current.puzzle!.currentGrid[0][0]).toBe('empty')
  })

  it('increments hints count', () => {
    const mockPuzzle = createMockPuzzle()
    const { result } = renderHook(() => usePuzzle(mockPuzzle))

    act(() => {
      result.current.incrementHints()
    })

    expect(result.current.puzzle!.hintsUsed).toBe(1)
  })
})
