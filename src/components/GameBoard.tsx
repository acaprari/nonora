import { Puzzle, ValidationResult } from '../types'
import { Cell } from './Cell'
import { Clues } from './Clues'

export interface GameBoardProps {
  puzzle: Puzzle
  validationResult: ValidationResult
  onCellClick: (row: number, col: number) => void
}

export function GameBoard({ puzzle, validationResult, onCellClick }: GameBoardProps) {
  const gridSize = puzzle.solution.length

  return (
    <div className="glass-card rounded-2xl p-6 shadow-2xl max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
      {/* Column clues */}
      <div className="flex">
        <div className="w-16" /> {/* Spacer for row clues */}
        <div className="flex flex-1">
          {puzzle.columnClues.map((clues, colIdx) => (
            <div key={colIdx} className="flex-1">
              <Clues
                clues={clues}
                orientation="column"
                validationState={validationResult.columns[colIdx]}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Grid rows with row clues */}
      {puzzle.currentGrid.map((row, rowIdx) => (
        <div key={rowIdx} className="flex gap-2">
          <div className="w-16">
            <Clues
              clues={puzzle.rowClues[rowIdx]}
              orientation="row"
              validationState={validationResult.rows[rowIdx]}
            />
          </div>
          <div className={`grid gap-1 flex-1`} style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
            {row.map((cellState, colIdx) => (
              <Cell
                key={`${rowIdx}-${colIdx}`}
                state={cellState}
                validationState={validationResult.rows[rowIdx]}
                onClick={() => onCellClick(rowIdx, colIdx)}
                row={rowIdx}
                col={colIdx}
              />
            ))}
          </div>
        </div>
      ))}
      </div>
    </div>
  )
}
