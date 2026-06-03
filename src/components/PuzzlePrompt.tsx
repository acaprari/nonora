import React, { useState, KeyboardEvent, ChangeEvent } from 'react'

export interface PuzzlePromptProps {
  onGeneratePuzzle: (prompt: string) => void
  difficultyLevel: number
  gridSize: number
  isGenerating: boolean
  hasApiKey: boolean
}

export const PuzzlePrompt: React.FC<PuzzlePromptProps> = ({
  onGeneratePuzzle,
  difficultyLevel,
  gridSize,
  isGenerating,
  hasApiKey,
}) => {
  const [prompt, setPrompt] = useState('')

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value)
  }

  const handleSubmit = () => {
    const trimmedPrompt = prompt.trim()
    if (trimmedPrompt && hasApiKey && !isGenerating) {
      onGeneratePuzzle(trimmedPrompt)
      setPrompt('')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  const isDisabled = !prompt.trim() || !hasApiKey || isGenerating

  return (
    <div className="glass-card rounded-2xl p-8 shadow-2xl max-w-2xl mx-auto space-y-6">
      {/* Title and tagline */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-white">Pixlogic</h1>
        <p className="text-white/80 text-lg">AI-powered nonogram puzzles from your imagination</p>
      </div>

      {/* How to play section */}
      <div className="glass rounded-xl p-4 space-y-3">
        <h2 className="text-white font-semibold text-lg">How to Play</h2>
        <div className="text-white/90 text-sm space-y-2">
          <p><span className="font-medium">1. Enter a prompt</span> — Describe any simple image (cat, heart, tree, etc.)</p>
          <p><span className="font-medium">2. Solve the puzzle</span> — Click cells to fill them based on number clues</p>
          <p><span className="font-medium">3. Use logic</span> — Numbers show consecutive filled cells in each row/column</p>
          <p><span className="font-medium">4. Get hints</span> — Stuck? AI-powered hints guide you without spoiling the fun</p>
        </div>
      </div>

      {/* Difficulty indicator */}
      <div className="flex justify-center items-center gap-4 text-sm font-medium text-white">
        <span className="glass px-4 py-2 rounded-full">Level {difficultyLevel}/10</span>
        <span className="glass px-4 py-2 rounded-full">{gridSize}×{gridSize} grid</span>
      </div>

      {/* Input field for prompt */}
      <div className="space-y-2">
        <label htmlFor="prompt-input" className="block text-white font-medium text-sm">
          What should the AI draw?
        </label>
        <input
          id="prompt-input"
          type="text"
          value={prompt}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="e.g., cat, rocket, smiley face, tree..."
          className="glass-input w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-base text-gray-900 placeholder-gray-500 transition-all"
          disabled={isGenerating}
          maxLength={100}
        />
      </div>

      {/* Generate button */}
      <div>
        <button
          onClick={handleSubmit}
          disabled={isDisabled}
          className="glass w-full text-white font-semibold py-3 px-6 rounded-lg hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg text-lg"
        >
          {isGenerating ? 'Generating Puzzle...' : 'Generate Puzzle'}
        </button>
      </div>

      {/* Helper text */}
      <div className="text-xs text-white/70 text-center">
        {!hasApiKey && 'Please set your API key to generate puzzles'}
        {hasApiKey && !isGenerating && 'Press Enter to generate'}
      </div>
    </div>
  )
}
