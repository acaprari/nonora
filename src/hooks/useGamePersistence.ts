import { useState, useCallback } from 'react'
import type { GameState } from '@/types'

const STORAGE_KEY = 'pixlogic-game-state'

export function useGamePersistence() {
  const [savedState, setSavedState] = useState<GameState | null>(() => {
    // Load from localStorage on mount
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
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
