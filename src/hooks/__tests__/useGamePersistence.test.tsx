import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGamePersistence } from '../useGamePersistence'
import type { GameState, Puzzle, DifficultyProfile } from '@/types'

const createMockGameState = (): GameState => ({
  apiKey: 'test-api-key',
  currentPuzzle: {
    id: 'test-123',
    prompt: 'a cat',
    solution: Array(10).fill(null).map(() => Array(10).fill(false)),
    rowClues: Array(10).fill([]),
    columnClues: Array(10).fill([]),
    currentGrid: Array(10).fill(null).map(() => Array(10).fill('empty')),
    startTime: Date.now(),
    hintsUsed: 0,
    errors: 0
  } as Puzzle,
  difficultyProfile: {
    level: 1,
    gridSize: 10,
    recentPerformance: []
  } as DifficultyProfile
})

describe('useGamePersistence', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('initializes with null when no saved state exists', () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null)

    const { result } = renderHook(() => useGamePersistence())

    expect(result.current.savedState).toBeNull()
    expect(localStorage.getItem).toHaveBeenCalledWith('pixlogic-game-state')
  })

  it('loads saved state from localStorage on mount', () => {
    const mockState = createMockGameState()
    vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockState))

    const { result } = renderHook(() => useGamePersistence())

    expect(result.current.savedState).toEqual(mockState)
    expect(localStorage.getItem).toHaveBeenCalledWith('pixlogic-game-state')
  })

  it('saves state to localStorage', () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null)
    const { result } = renderHook(() => useGamePersistence())
    const mockState = createMockGameState()

    act(() => {
      result.current.saveState(mockState)
    })

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'pixlogic-game-state',
      JSON.stringify(mockState)
    )
  })

  it('updates savedState when saveState is called', () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null)
    const { result } = renderHook(() => useGamePersistence())
    const mockState = createMockGameState()

    act(() => {
      result.current.saveState(mockState)
    })

    expect(result.current.savedState).toEqual(mockState)
  })

  it('loads state and updates savedState', () => {
    const mockState = createMockGameState()
    vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockState))

    const { result } = renderHook(() => useGamePersistence())

    let loadedState: GameState | null = null
    act(() => {
      loadedState = result.current.loadState()
    })

    expect(loadedState).toEqual(mockState)
    expect(result.current.savedState).toEqual(mockState)
    expect(localStorage.getItem).toHaveBeenCalledWith('pixlogic-game-state')
  })

  it('clears state from localStorage', () => {
    const mockState = createMockGameState()
    vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockState))

    const { result } = renderHook(() => useGamePersistence())

    act(() => {
      result.current.clearState()
    })

    expect(localStorage.removeItem).toHaveBeenCalledWith('pixlogic-game-state')
  })

  it('clears savedState when clearState is called', () => {
    const mockState = createMockGameState()
    vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockState))

    const { result } = renderHook(() => useGamePersistence())

    expect(result.current.savedState).toEqual(mockState)

    act(() => {
      result.current.clearState()
    })

    expect(result.current.savedState).toBeNull()
  })

  it('handles invalid JSON gracefully', () => {
    vi.mocked(localStorage.getItem).mockReturnValue('invalid-json{')

    const { result } = renderHook(() => useGamePersistence())

    expect(result.current.savedState).toBeNull()
  })

  it('handles invalid JSON gracefully in loadState', () => {
    vi.mocked(localStorage.getItem).mockReturnValue('invalid-json{')

    const { result } = renderHook(() => useGamePersistence())

    let loadedState: GameState | null = null
    act(() => {
      loadedState = result.current.loadState()
    })

    expect(loadedState).toBeNull()
    expect(result.current.savedState).toBeNull()
  })

  it('maintains function reference stability with useCallback', () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null)

    const { result, rerender } = renderHook(() => useGamePersistence())

    const firstSaveState = result.current.saveState
    const firstLoadState = result.current.loadState
    const firstClearState = result.current.clearState

    rerender()

    expect(result.current.saveState).toBe(firstSaveState)
    expect(result.current.loadState).toBe(firstLoadState)
    expect(result.current.clearState).toBe(firstClearState)
  })
})
