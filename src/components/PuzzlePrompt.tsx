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
    <div className="w-full max-w-2xl mx-auto p-4 space-y-4">
      {/* Header with difficulty and grid size */}
      <div className="flex justify-between items-center text-sm font-medium text-gray-700">
        <span>Level {difficultyLevel}/10</span>
        <span>Grid: {gridSize}x{gridSize}</span>
      </div>

      {/* Textarea for prompt input */}
      <div>
        <textarea
          value={prompt}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows={5}
          placeholder="Describe what you'd like to draw... (e.g., a cat, a rocket ship, a smiley face, a house)"
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 resize-none text-base"
          disabled={isGenerating}
        />
      </div>

      {/* Generate button */}
      <div>
        <button
          onClick={handleSubmit}
          disabled={isDisabled}
          className="w-full bg-primary text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isGenerating ? 'Generating...' : 'Generate Puzzle'}
        </button>
      </div>

      {/* Helper text */}
      <div className="text-xs text-gray-500 text-center">
        {!hasApiKey && 'Please set your API key to generate puzzles'}
        {hasApiKey && !isGenerating && 'Tip: Press Ctrl+Enter (Cmd+Enter on Mac) to generate'}
      </div>
    </div>
  )
}
