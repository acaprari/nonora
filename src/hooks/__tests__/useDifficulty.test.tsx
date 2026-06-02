import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDifficulty } from '../useDifficulty'

describe('useDifficulty', () => {
  it('initializes with initial profile (level 1, gridSize 5)', () => {
    const { result } = renderHook(() => useDifficulty())

    expect(result.current.profile.level).toBe(1)
    expect(result.current.profile.gridSize).toBe(5)
    expect(result.current.profile.recentPerformance).toEqual([])
    expect(result.current.currentLevel).toBe(1)
    expect(result.current.currentGridSize).toBe(5)
  })

  it('records puzzle completion with metrics', () => {
    const { result } = renderHook(() => useDifficulty())

    act(() => {
      result.current.recordCompletion(120, 1)
    })

    expect(result.current.profile.recentPerformance.length).toBe(1)
    expect(result.current.profile.recentPerformance[0]).toEqual({
      solveTime: 120,
      hintsUsed: 1,
      struggled: false
    })
  })

  it('increases level on good performance', () => {
    const { result } = renderHook(() => useDifficulty())

    // Clean solve: fast time, minimal hints
    act(() => {
      result.current.recordCompletion(120, 1)
    })

    expect(result.current.profile.level).toBe(2)
    expect(result.current.currentLevel).toBe(2)
  })

  it('decreases level on poor performance', () => {
    const { result } = renderHook(() => useDifficulty())

    // First increase to level 2
    act(() => {
      result.current.recordCompletion(120, 1)
    })

    // Then struggle: slow time, many hints
    act(() => {
      result.current.recordCompletion(700, 5)
    })

    expect(result.current.profile.level).toBe(1)
    expect(result.current.currentLevel).toBe(1)
  })

  it('updates gridSize when level changes', () => {
    const { result } = renderHook(() => useDifficulty())

    // Level 1: gridSize 5
    expect(result.current.profile.gridSize).toBe(5)
    expect(result.current.currentGridSize).toBe(5)

    // Clean solve 3 times to reach level 4
    act(() => {
      result.current.recordCompletion(120, 1)
      result.current.recordCompletion(120, 1)
      result.current.recordCompletion(120, 1)
    })

    // Level 4: gridSize 8 (linear progression: 4 + 4 = 8)
    expect(result.current.profile.level).toBe(4)
    expect(result.current.profile.gridSize).toBe(8)
    expect(result.current.currentGridSize).toBe(8)
  })

  it('tracks recent performance history (max 5 records)', () => {
    const { result } = renderHook(() => useDifficulty())

    // Add 7 performance records
    act(() => {
      result.current.recordCompletion(100, 0)
      result.current.recordCompletion(200, 1)
      result.current.recordCompletion(300, 2)
      result.current.recordCompletion(400, 3)
      result.current.recordCompletion(500, 4)
      result.current.recordCompletion(600, 5)
      result.current.recordCompletion(700, 6)
    })

    // Should keep only last 5
    expect(result.current.profile.recentPerformance.length).toBe(5)
    expect(result.current.profile.recentPerformance[0].solveTime).toBe(300)
    expect(result.current.profile.recentPerformance[4].solveTime).toBe(700)
  })

  it('correctly marks struggle flag', () => {
    const { result } = renderHook(() => useDifficulty())

    // Not struggled: good performance
    act(() => {
      result.current.recordCompletion(120, 1)
    })
    expect(result.current.profile.recentPerformance[0].struggled).toBe(false)

    // Struggled: slow time
    act(() => {
      result.current.recordCompletion(700, 1)
    })
    expect(result.current.profile.recentPerformance[1].struggled).toBe(true)

    // Struggled: many hints
    act(() => {
      result.current.recordCompletion(120, 5)
    })
    expect(result.current.profile.recentPerformance[2].struggled).toBe(true)
  })

  it('maintains same level on average performance', () => {
    const { result } = renderHook(() => useDifficulty())

    const initialLevel = result.current.profile.level

    // Average performance: not fast enough, not slow enough
    act(() => {
      result.current.recordCompletion(300, 2)
    })

    expect(result.current.profile.level).toBe(initialLevel)
  })

  it('does not go below level 1', () => {
    const { result } = renderHook(() => useDifficulty())

    // Try to decrease below level 1
    act(() => {
      result.current.recordCompletion(700, 5)
    })

    expect(result.current.profile.level).toBe(1)
  })
})
