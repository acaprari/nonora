import { describe, it, expect } from 'vitest';
import { validatePuzzle } from './validator';
import type { CellState } from '@/types';

describe('validatePuzzle', () => {
  describe('Row validation', () => {
    it('returns valid for completed matching row', () => {
      const currentGrid: CellState[][] = [
        ['filled', 'filled', 'empty', 'filled', 'empty']
      ];
      const solution = [
        [true, true, false, true, false]
      ];

      const result = validatePuzzle(currentGrid, solution);
      expect(result.rows[0]).toBe('valid');
    });

    it('returns error for overfilled row', () => {
      const currentGrid: CellState[][] = [
        ['filled', 'filled', 'filled', 'empty', 'empty']
      ];
      const solution = [
        [true, true, false, false, false]
      ];

      const result = validatePuzzle(currentGrid, solution);
      expect(result.rows[0]).toBe('error');
    });

    it('returns in-progress for partial row that could still match', () => {
      const currentGrid: CellState[][] = [
        ['filled', 'empty', 'empty', 'empty', 'empty']
      ];
      const solution = [
        [true, true, false, true, false]
      ];

      const result = validatePuzzle(currentGrid, solution);
      expect(result.rows[0]).toBe('in-progress');
    });

    it('returns in-progress for empty row with clues', () => {
      const currentGrid: CellState[][] = [
        ['empty', 'empty', 'empty']
      ];
      const solution = [
        [true, true, false]
      ];

      const result = validatePuzzle(currentGrid, solution);
      expect(result.rows[0]).toBe('in-progress');
    });

    it('returns valid for empty row with no clues', () => {
      const currentGrid: CellState[][] = [
        ['empty', 'empty', 'empty']
      ];
      const solution = [
        [false, false, false]
      ];

      const result = validatePuzzle(currentGrid, solution);
      expect(result.rows[0]).toBe('valid');
    });

    it('ignores marked cells (treats them as empty)', () => {
      const currentGrid: CellState[][] = [
        ['filled', 'filled', 'marked', 'empty', 'empty']
      ];
      const solution = [
        [true, true, false, false, false]
      ];

      const result = validatePuzzle(currentGrid, solution);
      expect(result.rows[0]).toBe('valid');
    });

    it('detects error when a group is too large', () => {
      const currentGrid: CellState[][] = [
        ['filled', 'filled', 'filled', 'empty', 'filled']
      ];
      const solution = [
        [true, true, false, false, true]
      ];

      const result = validatePuzzle(currentGrid, solution);
      expect(result.rows[0]).toBe('error');
    });

    it('detects error when there are too many groups', () => {
      const currentGrid: CellState[][] = [
        ['filled', 'empty', 'filled', 'empty', 'filled']
      ];
      const solution = [
        [true, true, false, false, false]
      ];

      const result = validatePuzzle(currentGrid, solution);
      expect(result.rows[0]).toBe('error');
    });
  });

  describe('Column validation', () => {
    it('returns valid for completed matching column', () => {
      const currentGrid: CellState[][] = [
        ['filled', 'empty', 'empty'],
        ['filled', 'empty', 'empty'],
        ['empty', 'empty', 'empty']
      ];
      const solution = [
        [true, false, false],
        [true, false, false],
        [false, false, false]
      ];

      const result = validatePuzzle(currentGrid, solution);
      expect(result.columns[0]).toBe('valid');
      expect(result.columns[1]).toBe('valid');
      expect(result.columns[2]).toBe('valid');
    });

    it('returns error for overfilled column', () => {
      const currentGrid: CellState[][] = [
        ['filled', 'empty', 'empty'],
        ['filled', 'empty', 'empty'],
        ['filled', 'empty', 'empty']
      ];
      const solution = [
        [true, false, false],
        [true, false, false],
        [false, false, false]
      ];

      const result = validatePuzzle(currentGrid, solution);
      expect(result.columns[0]).toBe('error');
    });

    it('returns in-progress for partial column', () => {
      const currentGrid: CellState[][] = [
        ['filled', 'empty', 'empty'],
        ['empty', 'empty', 'empty'],
        ['empty', 'empty', 'empty']
      ];
      const solution = [
        [true, false, false],
        [true, false, false],
        [true, false, false]
      ];

      const result = validatePuzzle(currentGrid, solution);
      expect(result.columns[0]).toBe('in-progress');
    });
  });

  describe('Complete puzzle validation', () => {
    it('detects incomplete grid (has empty cells)', () => {
      const currentGrid: CellState[][] = [
        ['filled', 'empty', 'empty'],
        ['empty', 'empty', 'empty'],
        ['empty', 'empty', 'empty']
      ];
      const solution = [
        [true, false, false],
        [false, false, false],
        [false, false, false]
      ];

      const result = validatePuzzle(currentGrid, solution);
      expect(result.isComplete).toBe(false);
      expect(result.isValid).toBe(false);
    });

    it('detects complete and valid grid', () => {
      const currentGrid: CellState[][] = [
        ['filled', 'filled', 'marked'],
        ['marked', 'marked', 'marked'],
        ['filled', 'marked', 'filled']
      ];
      const solution = [
        [true, true, false],
        [false, false, false],
        [true, false, true]
      ];

      const result = validatePuzzle(currentGrid, solution);
      expect(result.isComplete).toBe(true);
      expect(result.isValid).toBe(true);
      expect(result.rows.every(r => r === 'valid')).toBe(true);
      expect(result.columns.every(c => c === 'valid')).toBe(true);
    });

    it('detects complete but invalid grid', () => {
      const currentGrid: CellState[][] = [
        ['filled', 'filled', 'filled'],
        ['marked', 'marked', 'marked'],
        ['filled', 'marked', 'filled']
      ];
      const solution = [
        [true, true, false],
        [false, false, false],
        [true, false, true]
      ];

      const result = validatePuzzle(currentGrid, solution);
      expect(result.isComplete).toBe(true);
      expect(result.isValid).toBe(false);
      expect(result.rows[0]).toBe('error');
    });

    it('handles grid with marked cells as complete', () => {
      const currentGrid: CellState[][] = [
        ['filled', 'filled', 'marked'],
        ['marked', 'marked', 'marked'],
        ['filled', 'marked', 'filled']
      ];
      const solution = [
        [true, true, false],
        [false, false, false],
        [true, false, true]
      ];

      const result = validatePuzzle(currentGrid, solution);
      expect(result.isComplete).toBe(true);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Mixed validation states', () => {
    it('handles puzzle with some valid, some in-progress, some error', () => {
      const currentGrid: CellState[][] = [
        ['filled', 'filled', 'marked'],      // Valid: [2] matches [2]
        ['marked', 'marked', 'marked'],      // Valid: [] matches []
        ['filled', 'filled', 'filled']       // Error: [3] doesn't match [1,1]
      ];
      const solution = [
        [true, true, false],
        [false, false, false],
        [true, false, true]
      ];

      const result = validatePuzzle(currentGrid, solution);
      expect(result.rows[0]).toBe('valid');
      expect(result.rows[1]).toBe('valid');
      expect(result.rows[2]).toBe('error');
      expect(result.isComplete).toBe(true);
      expect(result.isValid).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('handles single cell grid - valid', () => {
      const currentGrid: CellState[][] = [
        ['filled']
      ];
      const solution = [
        [true]
      ];

      const result = validatePuzzle(currentGrid, solution);
      expect(result.rows[0]).toBe('valid');
      expect(result.columns[0]).toBe('valid');
      expect(result.isComplete).toBe(true);
      expect(result.isValid).toBe(true);
    });

    it('handles single cell grid - empty with no clues', () => {
      const currentGrid: CellState[][] = [
        ['marked']
      ];
      const solution = [
        [false]
      ];

      const result = validatePuzzle(currentGrid, solution);
      expect(result.rows[0]).toBe('valid');
      expect(result.columns[0]).toBe('valid');
      expect(result.isComplete).toBe(true);
      expect(result.isValid).toBe(true);
    });

    it('handles single cell grid - in-progress', () => {
      const currentGrid: CellState[][] = [
        ['empty']
      ];
      const solution = [
        [true]
      ];

      const result = validatePuzzle(currentGrid, solution);
      expect(result.rows[0]).toBe('in-progress');
      expect(result.columns[0]).toBe('in-progress');
      expect(result.isComplete).toBe(false);
      expect(result.isValid).toBe(false);
    });

    it('handles all marked cells', () => {
      const currentGrid: CellState[][] = [
        ['marked', 'marked'],
        ['marked', 'marked']
      ];
      const solution = [
        [false, false],
        [false, false]
      ];

      const result = validatePuzzle(currentGrid, solution);
      expect(result.rows[0]).toBe('valid');
      expect(result.rows[1]).toBe('valid');
      expect(result.columns[0]).toBe('valid');
      expect(result.columns[1]).toBe('valid');
      expect(result.isComplete).toBe(true);
      expect(result.isValid).toBe(true);
    });

    it('handles empty grid', () => {
      const currentGrid: CellState[][] = [
        ['empty', 'empty'],
        ['empty', 'empty']
      ];
      const solution = [
        [true, false],
        [false, true]
      ];

      const result = validatePuzzle(currentGrid, solution);
      expect(result.rows.every(r => r === 'in-progress')).toBe(true);
      expect(result.columns.every(c => c === 'in-progress')).toBe(true);
      expect(result.isComplete).toBe(false);
      expect(result.isValid).toBe(false);
    });

    it('handles larger 10x10 grid', () => {
      const currentGrid: CellState[][] = Array(10).fill(null).map(() =>
        Array(10).fill('empty') as CellState[]
      );
      const solution: boolean[][] = Array(10).fill(null).map(() =>
        Array(10).fill(false)
      );

      // Fill first row completely
      for (let i = 0; i < 10; i++) {
        currentGrid[0][i] = 'marked';
        solution[0][i] = false;
      }

      const result = validatePuzzle(currentGrid, solution);
      expect(result.rows[0]).toBe('valid');
      expect(result.rows.length).toBe(10);
      expect(result.columns.length).toBe(10);
    });
  });

  describe('Complex validation scenarios', () => {
    it('validates partial progress correctly', () => {
      const currentGrid: CellState[][] = [
        ['filled', 'filled', 'empty', 'empty', 'empty'],
        ['empty', 'empty', 'empty', 'empty', 'empty'],
        ['filled', 'empty', 'empty', 'empty', 'empty']
      ];
      const solution = [
        [true, true, false, true, true],
        [false, false, false, false, false],
        [true, false, true, false, true]
      ];

      const result = validatePuzzle(currentGrid, solution);
      // Row 0: has [2] but needs [2, 2] - in progress
      expect(result.rows[0]).toBe('in-progress');
      // Row 1: empty with no clues - valid
      expect(result.rows[1]).toBe('valid');
      // Row 2: has [1] but needs [1, 1, 1] - in progress
      expect(result.rows[2]).toBe('in-progress');
    });

    it('detects when current groups cannot possibly match', () => {
      const currentGrid: CellState[][] = [
        ['filled', 'empty', 'filled', 'filled', 'filled', 'filled']
      ];
      const solution = [
        [true, false, true, true, false, false]
      ];

      const result = validatePuzzle(currentGrid, solution);
      // Current: [1, 4], Target: [1, 2] - error (second group too large)
      expect(result.rows[0]).toBe('error');
    });

    it('correctly validates when groups are still buildable', () => {
      const currentGrid: CellState[][] = [
        ['filled', 'empty', 'filled', 'empty', 'empty']
      ];
      const solution = [
        [true, false, true, true, false]
      ];

      const result = validatePuzzle(currentGrid, solution);
      // Current: [1, 1], Target: [1, 2] - in progress (can add to second group)
      expect(result.rows[0]).toBe('in-progress');
    });
  });
});
