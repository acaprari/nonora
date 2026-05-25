export interface CompletionScreenProps {
  solveTime: number // in seconds
  hintsUsed: number
  errors: number
  currentLevel: number
  previousLevel: number
  onNewPuzzle: () => void
  onNewPrompt: () => void
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

function getPerformanceFeedback(
  solveTime: number,
  hintsUsed: number,
  errors: number
): string {
  // Excellent: Fast, no hints, very few errors
  if (solveTime < 180 && hintsUsed === 0 && errors <= 2) {
    return "Excellent work! You're a nonogram master!"
  }
  // Good: Medium time, few hints, some errors
  else if (solveTime < 420 && hintsUsed <= 2 && errors <= 5) {
    return "Good job! You're getting better!"
  }
  // Nice work: Everyone else
  else {
    return 'Nice work! Keep practicing!'
  }
}

export function CompletionScreen({
  solveTime,
  hintsUsed,
  errors,
  currentLevel,
  previousLevel,
  onNewPuzzle,
  onNewPrompt,
}: CompletionScreenProps) {
  const feedback = getPerformanceFeedback(solveTime, hintsUsed, errors)
  const leveledUp = currentLevel > previousLevel

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-success mb-2">
          Congratulations!
        </h2>
        <p className="text-lg text-gray-700">{feedback}</p>
      </div>

      {leveledUp && (
        <div className="bg-success/10 border-2 border-success rounded-lg p-4 text-center">
          <p className="text-xl font-semibold text-success">
            Level Up! Level {currentLevel}
          </p>
        </div>
      )}

      <div className="w-full max-w-md grid grid-cols-3 gap-4 bg-gray-50 rounded-lg p-6">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Time</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatTime(solveTime)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Hints</p>
          <p className="text-2xl font-bold text-gray-900">{hintsUsed}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Errors</p>
          <p className="text-2xl font-bold text-gray-900">{errors}</p>
        </div>
      </div>

      <div className="text-center">
        <p className="text-lg font-semibold text-gray-700">
          Level {currentLevel}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <button
          onClick={onNewPuzzle}
          className="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
        >
          New Puzzle
        </button>
        <button
          onClick={onNewPrompt}
          className="flex-1 bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
        >
          New Prompt
        </button>
      </div>
    </div>
  )
}
