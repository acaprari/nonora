/**
 * CelebrationOverlay - Shows completed puzzle with Continue button
 *
 * Displays when puzzle is complete, overlays the grid with:
 * - Confetti/celebration animation
 * - "Continue" button to proceed to stats
 * - User must click to advance (no auto-advance)
 */

interface CelebrationOverlayProps {
  onContinue: () => void
}

export function CelebrationOverlay({ onContinue }: CelebrationOverlayProps) {
  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 animate-fade-in"
      style={{ zIndex: 100 }}
      data-testid="celebration-overlay"
    >
      {/* Celebration Content */}
      <div className="text-center relative" style={{ zIndex: 101 }}>
        {/* Success Message */}
        <div className="mb-6 animate-bounce-in">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-4xl font-bold text-white drop-shadow-lg mb-2">
            Puzzle Complete!
          </h2>
          <p className="text-xl text-white/90 drop-shadow-md">
            Great job! Enjoy your completed pixel art
          </p>
        </div>

        {/* Continue Button */}
        <button
          onClick={onContinue}
          className="glass-card px-8 py-4 rounded-xl text-white font-bold text-xl hover:bg-white/25 transition-all shadow-2xl transform hover:scale-105 cursor-pointer"
          data-testid="continue-button"
          type="button"
        >
          Continue to Stats →
        </button>
      </div>

      {/* Confetti animation using CSS */}
      <div className="confetti-container">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="confetti"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][
                Math.floor(Math.random() * 5)
              ],
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes bounce-in {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes confetti-fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .confetti-container {
          position: fixed;
          top: -10px;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 99;
        }

        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          top: -10px;
          opacity: 1;
          animation: confetti-fall 3s linear infinite;
        }

        /* Respect reduced motion preference */
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in,
          .animate-bounce-in,
          .confetti {
            animation-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  )
}
