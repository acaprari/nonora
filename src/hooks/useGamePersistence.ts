import { useState, useCallback } from 'react'
import type { GameState } from '@/types'

const STORAGE_KEY = 'nonora-game-state'
const OLD_STORAGE_KEY = 'pixlogic-game-state' // Migration support

export function useGamePersistence() {
  const [savedState, setSavedState] = useState<GameState | null>(() => {
    // Load from localStorage on mount
    try {
      // Try new key first
      let stored = localStorage.getItem(STORAGE_KEY)

      // If not found, try migrating from old key
      if (!stored) {
        const oldStored = localStorage.getItem(OLD_STORAGE_KEY)
        if (oldStored) {
          // Migrate data to new key
          localStorage.setItem(STORAGE_KEY, oldStored)
          localStorage.removeItem(OLD_STORAGE_KEY)
          stored = oldStored
        }
      }

      return stored ? JSON.parse(stored) : null
    } catch (error) {
      // Handle invalid JSON gracefully
      return null
    }
  })

  const saveState = useCallback((state: GameState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    setSavedState(state)
  }, [])

  const loadState = useCallback((): GameState | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const state = stored ? JSON.parse(stored) : null
      setSavedState(state)
      return state
    } catch (error) {
      // Handle invalid JSON gracefully
      setSavedState(null)
      return null
    }
  }, [])

  const clearState = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setSavedState(null)
  }, [])

  return {
    savedState,
    saveState,
    loadState,
    clearState
  }
}
