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

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value)
  }

  const handleSubmit = () => {
    const trimmedPrompt = prompt.trim()
    if (trimmedPrompt && hasApiKey && !isGenerating) {
      onGeneratePuzzle(trimmedPrompt)
      setPrompt('')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const isDisabled = !prompt.trim() || !hasApiKey || isGenerating

  return (
    <div className="glass-card rounded-2xl p-6 shadow-2xl max-w-2xl mx-auto space-y-4">
      {/* Header with difficulty and grid size */}
      <div className="flex justify-between items-center text-sm font-medium text-white">
        <span className="glass px-3 py-1 rounded-full">Level {difficultyLevel}/10</span>
        <span className="glass px-3 py-1 rounded-full">Grid: {gridSize}x{gridSize}</span>
      </div>

      {/* Textarea for prompt input */}
      <div>
        <textarea
          value={prompt}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows={5}
          placeholder="Describe what you'd like to draw... (e.g., a cat, a rocket ship, a smiley face, a house)"
          className="glass-input w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 resize-none text-base text-gray-900 placeholder-gray-500 transition-all"
          disabled={isGenerating}
        />
      </div>

      {/* Generate button */}
      <div>
        <button
          onClick={handleSubmit}
          disabled={isDisabled}
          className="glass w-full text-white font-semibold py-3 px-6 rounded-lg hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
        >
          {isGenerating ? 'Generating...' : 'Generate Puzzle'}
        </button>
      </div>

      {/* Helper text */}
      <div className="text-xs text-white/80 text-center">
        {!hasApiKey && 'Please set your API key to generate puzzles'}
        {hasApiKey && !isGenerating && 'Tip: Press Ctrl+Enter (Cmd+Enter on Mac) to generate'}
      </div>
    </div>
  )
}
