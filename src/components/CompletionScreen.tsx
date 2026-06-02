import { Icon } from './Icon'

export interface CompletionScreenProps {
  solveTime: number // in seconds
  hintsUsed: number
  currentLevel: number
  previousLevel: number
  gridSize: number
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
  hintsUsed: number
): string {
  // Excellent: Fast, no hints
  if (solveTime < 180 && hintsUsed === 0) {
    return "Excellent work! You're a nonogram master!"
  }
  // Good: Medium time, few hints
  else if (solveTime < 420 && hintsUsed <= 2) {
    return "Good job! You're getting better!"
  }
  // Nice work: Everyone else
  else {
    return 'Nice work! Keep practicing!'
  }
}

function getPerformanceColor(
  solveTime: number,
  hintsUsed: number
): string {
  // Green: Excellent performance
  if (solveTime < 180 && hintsUsed <= 1) {
    return 'text-green-300'
  }
  // Red: Struggled
  else if (solveTime > 600 || hintsUsed > 3) {
    return 'text-red-300'
  }
  // Yellow: Okay
  return 'text-yellow-300'
}

function getDifficultyChangeMessage(
  currentLevel: number,
  previousLevel: number,
  gridSize: number
): { icon: string; message: string; detail: string } {
  if (currentLevel > previousLevel) {
    return {
      icon: '↑',
      message: 'Next puzzle: Harder',
      detail: `Great solve! Moving to Level ${currentLevel} (${gridSize}x${gridSize} grid).`
    }
  } else if (currentLevel < previousLevel) {
    return {
      icon: '↓',
      message: 'Next puzzle: Easier',
      detail: `Let's dial it back to Level ${currentLevel} (${gridSize}x${gridSize} grid) to keep it fun.`
    }
  } else {
    return {
      icon: '→',
      message: 'Next puzzle: Same difficulty',
      detail: `You're doing well! Staying at Level ${currentLevel} (${gridSize}x${gridSize} grid).`
    }
  }
}

export function CompletionScreen({
  solveTime,
  hintsUsed,
  currentLevel,
  previousLevel,
  gridSize,
  onNewPuzzle,
  onNewPrompt,
}: CompletionScreenProps) {
  const feedback = getPerformanceFeedback(solveTime, hintsUsed)
  const performanceColor = getPerformanceColor(solveTime, hintsUsed)
  const difficultyChange = getDifficultyChangeMessage(currentLevel, previousLevel, gridSize)

  return (
    <div className="glass-card rounded-2xl p-8 shadow-2xl max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
          <Icon name="celebration" size={32} />
          Congratulations!
        </h2>
        <p className={`text-lg font-medium ${performanceColor}`}>{feedback}</p>
      </div>

      <div className="glass rounded-xl p-4 text-center">
        <div className="text-xl font-bold text-white mb-2">
          {difficultyChange.message} {difficultyChange.icon}
        </div>
        <div className="text-sm text-white/80">{difficultyChange.detail}</div>
      </div>

      <div className="glass rounded-xl p-4 grid grid-cols-2 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-white">{formatTime(solveTime)}</div>
          <div className="text-sm text-white/80">Solve Time</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-white">{hintsUsed}</div>
          <div className="text-sm text-white/80">Hints Used</div>
        </div>
      </div>

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
