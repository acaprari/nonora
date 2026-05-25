import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useValidation } from '../useValidation'
import type { Puzzle } from '@/types'
import * as validator from '@/lib/validator'
import * as clueCalculator from '@/lib/clueCalculator'

vi.mock('@/lib/validator')
vi.mock('@/lib/clueCalculator')

describe('useValidation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null state when puzzle is null', () => {
    const { result } = renderHook(() => useValidation(null))

    expect(result.current.validationResult).toEqual({
      rows: [],
      columns: [],
      isComplete: false,
      isValid: false
    })
    expect(result.current.isComplete).toBe(false)
    expect(result.current.isValid).toBe(false)
  })

  it('validates complete valid puzzle', () => {
    const mockPuzzle: Puzzle = {
      id: '1',
      prompt: 'Test puzzle',
      solution: [
        [true, true],
        [false, true]
      ],
      rowClues: [[2], [1]],
      columnClues: [[1], [2]],
      currentGrid: [
        ['filled', 'filled'],
        ['marked', 'filled']
      ],
      startTime: Date.now(),
      hintsUsed: 0,
      errors: 0
    }

    vi.mocked(clueCalculator.calculateRowClues).mockReturnValue([[2], [1]])
    vi.mocked(clueCalculator.calculateColumnClues).mockReturnValue([[1], [2]])
    vi.mocked(validator.validateGrid).mockReturnValue({
      rows: ['valid', 'valid'],
      columns: ['valid', 'valid'],
      isComplete: true,
      isValid: true
    })

    const { result } = renderHook(() => useValidation(mockPuzzle))

    expect(clueCalculator.calculateRowClues).toHaveBeenCalledWith(mockPuzzle.solution)
    expect(clueCalculator.calculateColumnClues).toHaveBeenCalledWith(mockPuzzle.solution)
    expect(validator.validateGrid).toHaveBeenCalledWith(
      mockPuzzle.currentGrid,
      [[2], [1]],
      [[1], [2]]
    )

    expect(result.current.isComplete).toBe(true)
    expect(result.current.isValid).toBe(true)
    expect(result.current.validationResult).toEqual({
      rows: ['valid', 'valid'],
      columns: ['valid', 'valid'],
      isComplete: true,
      isValid: true
    })
  })

  it('validates incomplete puzzle', () => {
    const mockPuzzle: Puzzle = {
      id: '2',
      prompt: 'Test puzzle',
      solution: [
        [true, true],
        [false, true]
      ],
      rowClues: [[2], [1]],
      columnClues: [[1], [2]],
      currentGrid: [
        ['filled', 'empty'],
        ['empty', 'filled']
      ],
      startTime: Date.now(),
      hintsUsed: 0,
      errors: 0
    }

    vi.mocked(clueCalculator.calculateRowClues).mockReturnValue([[2], [1]])
    vi.mocked(clueCalculator.calculateColumnClues).mockReturnValue([[1], [2]])
    vi.mocked(validator.validateGrid).mockReturnValue({
      rows: ['in-progress', 'in-progress'],
      columns: ['in-progress', 'in-progress'],
      isComplete: false,
      isValid: false
    })

    const { result } = renderHook(() => useValidation(mockPuzzle))

    expect(result.current.isComplete).toBe(false)
    expect(result.current.isValid).toBe(false)
    expect(result.current.validationResult).toEqual({
      rows: ['in-progress', 'in-progress'],
      columns: ['in-progress', 'in-progress'],
      isComplete: false,
      isValid: false
    })
  })

  it('validates puzzle with errors', () => {
    const mockPuzzle: Puzzle = {
      id: '3',
      prompt: 'Test puzzle',
      solution: [
        [true, true],
        [false, true]
      ],
      rowClues: [[2], [1]],
      columnClues: [[1], [2]],
      currentGrid: [
        ['filled', 'filled'],
        ['filled', 'filled']
      ],
      startTime: Date.now(),
      hintsUsed: 0,
      errors: 0
    }

    vi.mocked(clueCalculator.calculateRowClues).mockReturnValue([[2], [1]])
    vi.mocked(clueCalculator.calculateColumnClues).mockReturnValue([[1], [2]])
    vi.mocked(validator.validateGrid).mockReturnValue({
      rows: ['valid', 'error'],
      columns: ['error', 'valid'],
      isComplete: true,
      isValid: false
    })

    const { result } = renderHook(() => useValidation(mockPuzzle))

    expect(result.current.isComplete).toBe(true)
    expect(result.current.isValid).toBe(false)
    expect(result.current.validationResult.rows).toEqual(['valid', 'error'])
    expect(result.current.validationResult.columns).toEqual(['error', 'valid'])
  })

  it('returns correct ValidationResult structure', () => {
    const mockPuzzle: Puzzle = {
      id: '4',
      prompt: 'Test puzzle',
      solution: [
        [true, false, true],
        [false, true, false],
        [true, true, true]
      ],
      rowClues: [[1, 1], [1], [3]],
      columnClues: [[2], [2], [2]],
      currentGrid: [
        ['filled', 'empty', 'filled'],
        ['empty', 'filled', 'empty'],
        ['filled', 'filled', 'filled']
      ],
      startTime: Date.now(),
      hintsUsed: 0,
      errors: 0
    }

    vi.mocked(clueCalculator.calculateRowClues).mockReturnValue([[1, 1], [1], [3]])
    vi.mocked(clueCalculator.calculateColumnClues).mockReturnValue([[2], [2], [2]])
    vi.mocked(validator.validateGrid).mockReturnValue({
      rows: ['valid', 'valid', 'valid'],
      columns: ['valid', 'valid', 'valid'],
      isComplete: true,
      isValid: true
    })

    const { result } = renderHook(() => useValidation(mockPuzzle))

    expect(result.current.validationResult).toHaveProperty('rows')
    expect(result.current.validationResult).toHaveProperty('columns')
    expect(result.current.validationResult).toHaveProperty('isComplete')
    expect(result.current.validationResult).toHaveProperty('isValid')
    expect(Array.isArray(result.current.validationResult.rows)).toBe(true)
    expect(Array.isArray(result.current.validationResult.columns)).toBe(true)
  })

  it('recomputes when puzzle changes', () => {
    const mockPuzzle1: Puzzle = {
      id: '5',
      prompt: 'Test puzzle',
      solution: [[true, true], [false, true]],
      rowClues: [[2], [1]],
      columnClues: [[1], [2]],
      currentGrid: [
        ['filled', 'empty'],
        ['empty', 'filled']
      ],
      startTime: Date.now(),
      hintsUsed: 0,
      errors: 0
    }

    const mockPuzzle2: Puzzle = {
      ...mockPuzzle1,
      currentGrid: [
        ['filled', 'filled'],
        ['marked', 'filled']
      ]
    }

    vi.mocked(clueCalculator.calculateRowClues).mockReturnValue([[2], [1]])
    vi.mocked(clueCalculator.calculateColumnClues).mockReturnValue([[1], [2]])

    // First render - incomplete
    vi.mocked(validator.validateGrid).mockReturnValueOnce({
      rows: ['in-progress', 'in-progress'],
      columns: ['in-progress', 'in-progress'],
      isComplete: false,
      isValid: false
    })

    const { result, rerender } = renderHook(
      ({ puzzle }) => useValidation(puzzle),
      { initialProps: { puzzle: mockPuzzle1 } }
    )

    expect(result.current.isComplete).toBe(false)
    expect(validator.validateGrid).toHaveBeenCalledTimes(1)

    // Second render - complete
    vi.mocked(validator.validateGrid).mockReturnValueOnce({
      rows: ['valid', 'valid'],
      columns: ['valid', 'valid'],
      isComplete: true,
      isValid: true
    })

    rerender({ puzzle: mockPuzzle2 })

    expect(result.current.isComplete).toBe(true)
    expect(result.current.isValid).toBe(true)
    expect(validator.validateGrid).toHaveBeenCalledTimes(2)
  })

  it('memoizes validation and does not recompute on same input', () => {
    const mockPuzzle: Puzzle = {
      id: '6',
      prompt: 'Test puzzle',
      solution: [[true, true], [false, true]],
      rowClues: [[2], [1]],
      columnClues: [[1], [2]],
      currentGrid: [
        ['filled', 'filled'],
        ['marked', 'filled']
      ],
      startTime: Date.now(),
      hintsUsed: 0,
      errors: 0
    }

    vi.mocked(clueCalculator.calculateRowClues).mockReturnValue([[2], [1]])
    vi.mocked(clueCalculator.calculateColumnClues).mockReturnValue([[1], [2]])
    vi.mocked(validator.validateGrid).mockReturnValue({
      rows: ['valid', 'valid'],
      columns: ['valid', 'valid'],
      isComplete: true,
      isValid: true
    })

    const { rerender } = renderHook(() => useValidation(mockPuzzle))

    expect(validator.validateGrid).toHaveBeenCalledTimes(1)

    // Rerender with same puzzle object - should not call validateGrid again
    rerender()

    expect(validator.validateGrid).toHaveBeenCalledTimes(1)
  })
})
