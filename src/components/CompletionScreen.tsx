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
    <div className="glass-card rounded-2xl p-8 shadow-2xl max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">
          🎉 Congratulations!
        </h2>
        <p className="text-lg text-white font-medium">{feedback}</p>
      </div>

      {leveledUp && (
        <div className="glass rounded-xl p-3 text-center">
          <div className="text-white font-semibold">Level {currentLevel}</div>
          <div className="text-green-300 text-sm">Level Up! 🎊</div>
        </div>
      )}

      <div className="glass rounded-xl p-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-white">{formatTime(solveTime)}</div>
          <div className="text-sm text-white/80">Solve Time</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-white">{hintsUsed}</div>
          <div className="text-sm text-white/80">Hints Used</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-white">{errors}</div>
          <div className="text-sm text-white/80">Errors</div>
        </div>
      </div>

      {!leveledUp && (
        <div className="text-center">
          <p className="text-lg font-semibold text-white">
            Level {currentLevel}
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <button
          onClick={onNewPuzzle}
          className="glass flex-1 py-3 px-6 rounded-lg text-white font-semibold hover:bg-white/20 transition-all shadow-lg"
        >
          New Puzzle
        </button>
        <button
          onClick={onNewPrompt}
          className="glass flex-1 py-3 px-6 rounded-lg text-white font-semibold hover:bg-white/20 transition-all shadow-lg"
        >
          New Prompt
        </button>
      </div>
    </div>
  )
}
