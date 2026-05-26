import { useState, useCallback } from 'react'
import type { Hint } from '@/types'
import type { ApiClient } from '@/lib/api'

interface UseHintsReturn {
  currentHint: Hint | null
  isOnCooldown: boolean
  cooldownRemaining: number
  isLoading: boolean
  requestHint: () => Promise<void>
  dismissHint: () => void
  error: string | null
}

/**
 * Custom hook for managing AI hint requests
 *
 * Features:
 * - 30-second cooldown between hints
 * - Automatic escalation from "guidance" to "specific" if requested within 2 minutes
 * - Tracks last hint time for escalation logic
 */
export function useHints(
  apiClient: ApiClient | null,
  currentGrid: string[][],
  rowClues: number[][],
  columnClues: number[][],
  solution: boolean[][],
  onHintUsed: () => void
): UseHintsReturn {
  const [currentHint, setCurrentHint] = useState<Hint | null>(null)
  const [lastHintTime, setLastHintTime] = useState<number>(0)
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const COOLDOWN_MS = 30000 // 30 seconds
  const ESCALATION_THRESHOLD_MS = 120000 // 2 minutes

  const isOnCooldown = cooldownRemaining > 0

  const requestHint = useCallback(async () => {
    if (!apiClient) {
      setError('API client not initialized')
      return
    }

    // Check cooldown
    const now = Date.now()
    const timeSinceLastHint = now - lastHintTime
    if (timeSinceLastHint < COOLDOWN_MS) {
      return // Still on cooldown
    }

    // Determine hint type based on escalation logic
    const hintType: 'guidance' | 'specific' =
      timeSinceLastHint < ESCALATION_THRESHOLD_MS ? 'specific' : 'guidance'

    setIsLoading(true)

    try {
      setError(null)
      const hint = await apiClient.getHint(hintType, currentGrid, rowClues, columnClues, solution)
      setCurrentHint(hint)
      setLastHintTime(now)

      // Start cooldown countdown
      setCooldownRemaining(COOLDOWN_MS)
      const countdown = setInterval(() => {
        setCooldownRemaining(prev => {
          const next = prev - 1000
          if (next <= 0) {
            clearInterval(countdown)
            return 0
          }
          return next
        })
      }, 1000)

      // Increment hint counter
      onHintUsed()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get hint')
      console.error('Hint request error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [apiClient, currentGrid, rowClues, columnClues, solution, lastHintTime, onHintUsed])

  const dismissHint = useCallback(() => {
    setCurrentHint(null)
    setError(null)
  }, [])

  return {
    currentHint,
    isOnCooldown,
    cooldownRemaining,
    isLoading,
    requestHint,
    dismissHint,
    error
  }
}
