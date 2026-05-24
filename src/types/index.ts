// Cell states
export type CellState = 'empty' | 'filled' | 'marked';

// A single puzzle
export interface Puzzle {
  id: string;
  prompt: string;
  solution: boolean[][];
  rowClues: number[][];
  columnClues: number[][];
  currentGrid: CellState[][];
  startTime: number;
  hintsUsed: number;
  errors: number;
}

// Difficulty tracking
export interface DifficultyProfile {
  level: number;
  gridSize: number;
  recentPerformance: PerformanceMetrics[];
}

// Performance metrics per puzzle
export interface PerformanceMetrics {
  solveTime: number;
  hintsUsed: number;
  errors: number;
  struggled: boolean;
}

// Hint response from AI
export interface Hint {
  type: 'guidance' | 'specific';
  message: string;
  cell?: { row: number; col: number };
}

// Persisted state in localStorage
export interface GameState {
  apiKey?: string;
  currentPuzzle?: Puzzle;
  difficultyProfile: DifficultyProfile;
}

// Validation state for a row/column
export type ValidationState = 'valid' | 'error' | 'in-progress';

export interface ValidationResult {
  rows: ValidationState[];
  columns: ValidationState[];
  isComplete: boolean;
  isValid: boolean;
}
