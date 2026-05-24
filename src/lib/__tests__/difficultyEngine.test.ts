import { describe, it, expect } from 'vitest'
import { calculateNextDifficulty, createInitialProfile, updateProfile, getGridSize } from '../difficultyEngine'
import type { PerformanceMetrics, DifficultyProfile } from '@/types'

describe('calculateNextDifficulty', () => {
  it('increases difficulty on fast clean solve', () => {
    const metrics: PerformanceMetrics = {
      solveTime: 120,
      hintsUsed: 0,
      errors: 0,
      struggled: false
    }
    expect(calculateNextDifficulty(5, metrics)).toBe(6)
  })

  it('decreases difficulty on slow solve', () => {
    const metrics: PerformanceMetrics = {
      solveTime: 700,
      hintsUsed: 5,
      errors: 10,
      struggled: true
    }
    expect(calculateNextDifficulty(5, metrics)).toBe(4)
  })

  it('maintains difficulty on moderate performance', () => {
    const metrics: PerformanceMetrics = {
      solveTime: 300,
      hintsUsed: 2,
      errors: 4,
      struggled: false
    }
    expect(calculateNextDifficulty(5, metrics)).toBe(5)
  })

  it('clamps difficulty at minimum 1', () => {
    const metrics: PerformanceMetrics = {
      solveTime: 800,
      hintsUsed: 10,
      errors: 20,
      struggled: true
    }
    expect(calculateNextDifficulty(1, metrics)).toBe(1)
  })

  it('clamps difficulty at maximum 10', () => {
    const metrics: PerformanceMetrics = {
      solveTime: 60,
      hintsUsed: 0,
      errors: 0,
      struggled: false
    }
    expect(calculateNextDifficulty(10, metrics)).toBe(10)
  })

  it('decreases difficulty on many hints used', () => {
    const metrics: PerformanceMetrics = {
      solveTime: 200,
      hintsUsed: 5,
      errors: 2,
      struggled: true
    }
    expect(calculateNextDifficulty(5, metrics)).toBe(4)
  })

  it('decreases difficulty on many errors', () => {
    const metrics: PerformanceMetrics = {
      solveTime: 200,
      hintsUsed: 1,
      errors: 10,
      struggled: true
    }
    expect(calculateNextDifficulty(5, metrics)).toBe(4)
  })
})

describe('createInitialProfile', () => {
  it('creates profile starting at level 1', () => {
    const profile = createInitialProfile()
    expect(profile.level).toBe(1)
    expect(profile.gridSize).toBe(5)
    expect(profile.recentPerformance).toEqual([])
  })
})

describe('updateProfile', () => {
  it('updates profile with new metrics', () => {
    const profile: DifficultyProfile = {
      level: 5,
      gridSize: 10,
      recentPerformance: []
    }

    const metrics: PerformanceMetrics = {
      solveTime: 120,
      hintsUsed: 0,
      errors: 0,
      struggled: false
    }

    const updated = updateProfile(profile, metrics)
    expect(updated.level).toBe(6)
    expect(updated.recentPerformance).toHaveLength(1)
    expect(updated.recentPerformance[0]).toEqual(metrics)
  })

  it('keeps last 5 performance records', () => {
    const profile: DifficultyProfile = {
      level: 5,
      gridSize: 10,
      recentPerformance: [
        { solveTime: 100, hintsUsed: 0, errors: 0, struggled: false },
        { solveTime: 120, hintsUsed: 1, errors: 1, struggled: false },
        { solveTime: 150, hintsUsed: 0, errors: 2, struggled: false },
        { solveTime: 180, hintsUsed: 1, errors: 0, struggled: false },
        { solveTime: 200, hintsUsed: 0, errors: 1, struggled: false }
      ]
    }

    const metrics: PerformanceMetrics = {
      solveTime: 130,
      hintsUsed: 0,
      errors: 0,
      struggled: false
    }

    const updated = updateProfile(profile, metrics)
    expect(updated.recentPerformance).toHaveLength(5)
    // First item should be removed, new item at end
    expect(updated.recentPerformance[0].solveTime).toBe(120)
    expect(updated.recentPerformance[4].solveTime).toBe(130)
  })

  it('does not mutate original profile', () => {
    const profile: DifficultyProfile = {
      level: 5,
      gridSize: 10,
      recentPerformance: []
    }

    const metrics: PerformanceMetrics = {
      solveTime: 120,
      hintsUsed: 0,
      errors: 0,
      struggled: false
    }

    const updated = updateProfile(profile, metrics)

    // Original profile should be unchanged
    expect(profile.level).toBe(5)
    expect(profile.recentPerformance).toHaveLength(0)

    // Updated profile should have changes
    expect(updated.level).toBe(6)
    expect(updated.recentPerformance).toHaveLength(1)
  })

  it('updates gridSize when difficulty level changes', () => {
    const profile: DifficultyProfile = {
      level: 3,
      gridSize: 5,
      recentPerformance: []
    }

    // Fast, clean solve should increase difficulty from 3 to 4
    const metrics: PerformanceMetrics = {
      solveTime: 120,  // 2 minutes - fast
      hintsUsed: 0,
      errors: 0,
      struggled: false
    }

    const updated = updateProfile(profile, metrics)
    expect(updated.level).toBe(4)
    expect(updated.gridSize).toBe(7)  // Should change from 5 to 7
  })

  it('updates gridSize when crossing from medium to hard', () => {
    const profile: DifficultyProfile = {
      level: 6,
      gridSize: 7,
      recentPerformance: []
    }

    // Fast, clean solve should increase difficulty from 6 to 7
    const metrics: PerformanceMetrics = {
      solveTime: 120,
      hintsUsed: 1,
      errors: 1,
      struggled: false
    }

    const updated = updateProfile(profile, metrics)
    expect(updated.level).toBe(7)
    expect(updated.gridSize).toBe(10)  // Should change from 7 to 10
  })
})

describe('getGridSize', () => {
  it('returns 5 for levels 1-3', () => {
    expect(getGridSize(1)).toBe(5)
    expect(getGridSize(2)).toBe(5)
    expect(getGridSize(3)).toBe(5)
  })

  it('returns 7 for levels 4-6', () => {
    expect(getGridSize(4)).toBe(7)
    expect(getGridSize(5)).toBe(7)
    expect(getGridSize(6)).toBe(7)
  })

  it('returns 10 for levels 7-10', () => {
    expect(getGridSize(7)).toBe(10)
    expect(getGridSize(8)).toBe(10)
    expect(getGridSize(9)).toBe(10)
    expect(getGridSize(10)).toBe(10)
  })

  it('handles edge cases gracefully', () => {
    expect(getGridSize(0)).toBe(5)  // Below minimum, default to smallest
    expect(getGridSize(11)).toBe(10) // Above maximum, default to largest
  })
})
