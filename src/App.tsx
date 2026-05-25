import { useState, useEffect } from 'react'
import { useDifficulty } from '@/hooks/useDifficulty'
import { usePuzzle } from '@/hooks/usePuzzle'
import { useValidation } from '@/hooks/useValidation'
import { useGamePersistence } from '@/hooks/useGamePersistence'
import { ApiClient } from '@/lib/api'
import { generatePuzzle } from '@/lib/puzzleGenerator'
import type { Puzzle } from '@/types'

// Import components
import ApiKeyInput from '@/components/ApiKeyInput'
import { PuzzlePrompt } from '@/components/PuzzlePrompt'
import { GameBoard } from '@/components/GameBoard'
import { CompletionScreen } from '@/components/CompletionScreen'

/**
 * Main App Component - Orchestrates the entire game flow
 *
 * Flow phases:
 * 1. API Key Setup - Show ApiKeyInput if no API key
 * 2. Puzzle Prompt - Show PuzzlePrompt to get text prompt from user
 * 3. Active Gameplay - Show GameBoard with current puzzle
 * 4. Completion - Show CompletionScreen when puzzle is solved
 */
function App() {
  // Core state
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [apiClient, setApiClient] = useState<ApiClient | null>(null)
  const [currentPrompt, setCurrentPrompt] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [previousLevel, setPreviousLevel] = useState<number>(1)

  // Puzzle state
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null)

  // Custom hooks
  const { profile, recordCompletion, currentLevel, currentGridSize } = useDifficulty()
  const { savedState, saveState, clearState } = useGamePersistence()

  // Only use usePuzzle when puzzle exists
  const puzzleHooks = usePuzzle(puzzle!)
  const { validationResult, isComplete, isValid } = useValidation(puzzle)

  // Initialize from saved state on mount
  useEffect(() => {
    if (savedState) {
      // Restore API key
      if (savedState.apiKey) {
        try {
          const client = new ApiClient(savedState.apiKey)
          setApiClient(client)
          setApiKey(savedState.apiKey)
        } catch (err) {
          console.error('Failed to restore API client:', err)
        }
      }

      // Restore puzzle
      if (savedState.currentPuzzle) {
        setPuzzle(savedState.currentPuzzle)
        setStartTime(savedState.currentPuzzle.startTime)
        setCurrentPrompt(savedState.currentPuzzle.prompt)
      }
    }
  }, []) // Run once on mount

  // Save state whenever puzzle changes
  useEffect(() => {
    if (puzzle && apiKey) {
      saveState({
        apiKey,
        currentPuzzle: puzzle,
        difficultyProfile: profile
      })
    }
  }, [puzzle, apiKey, profile, saveState])

  // Handle puzzle completion
  useEffect(() => {
    if (puzzle && isComplete && isValid) {
      // Calculate solve time
      const solveTime = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0

      // Store previous level for level-up detection
      setPreviousLevel(currentLevel)

      // Record completion in difficulty engine
      recordCompletion(solveTime, puzzle.hintsUsed, puzzle.errors)

      // Clear saved state since puzzle is complete
      clearState()
    }
  }, [puzzle, isComplete, isValid, startTime, currentLevel, recordCompletion, clearState])

  /**
   * Handle API key submission
   * Note: ApiKeyInput component validates the key format before calling this
   */
  const handleApiKeySubmit = (key: string) => {
    try {
      const client = new ApiClient(key)
      setApiClient(client)
      setApiKey(key)
      setError(null)
    } catch (err) {
      setError('Invalid API key')
    }
  }

  /**
   * Handle puzzle generation from prompt
   */
  const handleGeneratePuzzle = async (prompt: string) => {
    if (!apiClient) {
      setError('API client not initialized')
      return
    }

    setIsGenerating(true)
    setError(null)
    setCurrentPrompt(prompt)

    try {
      const generatedPuzzle = await generatePuzzle(
        apiClient,
        prompt,
        currentLevel,
        currentGridSize
      )
      setPuzzle(generatedPuzzle)
      setStartTime(Date.now())
    } catch (err) {
      setError('Failed to generate puzzle. Please try again.')
      console.error('Puzzle generation error:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  /**
   * Handle cell clicks during gameplay
   */
  const handleCellClick = (row: number, col: number) => {
    if (puzzle && puzzleHooks) {
      puzzleHooks.toggleCell(row, col)
      // Update puzzle state to trigger re-render and persistence
      setPuzzle({ ...puzzleHooks.puzzle })
    }
  }

  /**
   * Generate new puzzle with same prompt
   */
  const handleNewPuzzle = () => {
    if (currentPrompt) {
      setPuzzle(null)
      setStartTime(null)
      handleGeneratePuzzle(currentPrompt)
    }
  }

  /**
   * Reset to prompt entry phase
   */
  const handleNewPrompt = () => {
    setPuzzle(null)
    setStartTime(null)
    setCurrentPrompt('')
    clearState()
  }

  /**
   * Calculate current solve time
   */
  const calculateSolveTime = (): number => {
    if (!startTime) return 0
    return Math.floor((Date.now() - startTime) / 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#5a85be] via-[#6b95c9] to-[#7ca5d4] p-4">
      <header className="text-white text-center mb-8">
        <h1 className="text-5xl font-bold mb-2 drop-shadow-lg">Pixlogic</h1>
        <p className="text-xl drop-shadow-md">AI-Powered Nonogram Puzzles</p>
      </header>

      <main className="max-w-4xl mx-auto">
        {/* Phase 1: API Key Setup */}
        {!apiKey && (
          <ApiKeyInput onKeySubmit={handleApiKeySubmit} />
        )}

        {/* Phase 2: Puzzle Prompt */}
        {apiKey && !puzzle && !isGenerating && (
          <PuzzlePrompt
            onGeneratePuzzle={handleGeneratePuzzle}
            difficultyLevel={currentLevel}
            gridSize={currentGridSize}
            isGenerating={false}
            hasApiKey={true}
          />
        )}

        {/* Loading Indicator */}
        {isGenerating && (
          <div className="glass-card rounded-2xl p-8 text-center shadow-2xl">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-xl font-semibold">Generating your puzzle...</p>
            <p className="text-white/80 mt-2">This may take a few moments</p>
          </div>
        )}

        {/* Phase 3: Active Gameplay */}
        {puzzle && !isComplete && (
          <div data-testid="game-board">
            <GameBoard
              puzzle={puzzle}
              validationResult={validationResult}
              onCellClick={handleCellClick}
            />
          </div>
        )}

        {/* Phase 4: Completion */}
        {puzzle && isComplete && isValid && (
          <CompletionScreen
            solveTime={calculateSolveTime()}
            hintsUsed={puzzle.hintsUsed}
            errors={puzzle.errors}
            currentLevel={currentLevel}
            previousLevel={previousLevel}
            onNewPuzzle={handleNewPuzzle}
            onNewPrompt={handleNewPrompt}
          />
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-500 text-white rounded-lg p-4 mt-4 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-4 text-white hover:text-gray-200 font-bold text-xl"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
