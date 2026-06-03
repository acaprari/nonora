import { useState, useCallback } from 'react'
import type { DifficultyProfile, PerformanceMetrics } from '@/types'
import { createInitialProfile, updateProfile } from '@/lib/difficultyEngine'

/**
 * Hook to manage difficulty profile and adaptive difficulty adjustments
 *
 * Manages:
 * - Difficulty profile state (level, gridSize, recentPerformance)
 * - Recording puzzle completion metrics
 * - Calculating next difficulty based on performance
 * - Providing current difficulty info
 *
 * @returns Object with profile, recordCompletion function, and current level/gridSize
 */
export function useDifficulty() {
  const [profile, setProfile] = useState<DifficultyProfile>(() =>
    createInitialProfile()
  )

  const recordCompletion = useCallback(
    (solveTime: number, hintsUsed: number) => {
      const metrics: PerformanceMetrics = {
        solveTime,
        hintsUsed,
        struggled: solveTime > 600 || hintsUsed > 3
      }

      setProfile((prev) => updateProfile(prev, metrics))
    },
    []
  )

  const restoreProfile = useCallback((savedProfile: DifficultyProfile) => {
    setProfile(savedProfile)
  }, [])

  const resetToLevelOne = useCallback(() => {
    setProfile(createInitialProfile())
  }, [])

  return {
    profile,
    recordCompletion,
    restoreProfile,
    resetToLevelOne,
    currentLevel: profile.level,
    currentGridSize: profile.gridSize
  }
}
