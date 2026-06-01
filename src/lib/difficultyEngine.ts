import type { PerformanceMetrics, DifficultyProfile } from '@/types'

/**
 * Calculate next difficulty level based on performance metrics
 *
 * @param currentLevel - Current difficulty level (1-10)
 * @param metrics - Performance metrics from completed puzzle
 * @returns New difficulty level (1-10)
 */
export function calculateNextDifficulty(
  currentLevel: number,
  metrics: PerformanceMetrics
): number {
  let newLevel = currentLevel

  // Clean solve: fast + minimal hints + few errors
  if (
    metrics.solveTime < 180 &&  // < 3 minutes
    metrics.hintsUsed <= 1 &&
    metrics.errors <= 2
  ) {
    newLevel += 1
  }

  // Struggled: slow OR many hints OR many errors
  else if (
    metrics.solveTime > 600 ||  // > 10 minutes
    metrics.hintsUsed > 3 ||
    metrics.errors > 8
  ) {
    newLevel -= 1
  }

  // Otherwise: keep same difficulty

  // Clamp to valid range [1, 10]
  return Math.max(1, Math.min(10, newLevel))
}

/**
 * Create initial difficulty profile for new player
 * Starts at level 1 with 10x10 grid and empty performance history
 *
 * @returns Initial difficulty profile
 */
export function createInitialProfile(): DifficultyProfile {
  return {
    level: 1,
    gridSize: getGridSize(1),
    recentPerformance: []
  }
}

/**
 * Update difficulty profile with new performance metrics
 * Immutable - returns new profile without mutating input
 *
 * @param profile - Current difficulty profile
 * @param metrics - Performance metrics from completed puzzle
 * @returns Updated difficulty profile
 */
export function updateProfile(
  profile: DifficultyProfile,
  metrics: PerformanceMetrics
): DifficultyProfile {
  const newLevel = calculateNextDifficulty(profile.level, metrics)

  // Keep last 5 performance records (FIFO)
  const recentPerformance = [
    ...profile.recentPerformance,
    metrics
  ].slice(-5)

  return {
    ...profile,
    level: newLevel,
    gridSize: getGridSize(newLevel),
    recentPerformance
  }
}

/**
 * Get grid size for a given difficulty level
 *
 * Linear progression: each level has its own grid size
 * Level 1: 5×5, Level 2: 6×6, ..., Level 10: 14×14
 *
 * @param level - Difficulty level (1-10)
 * @returns Grid size (5 to 14)
 */
export function getGridSize(level: number): number {
  return level + 4
}
