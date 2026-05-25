import { describe, it, expect } from 'vitest';
import { validateRow, validateGrid } from '../validator';
import type { CellState } from '@/types';

describe('validateRow', () => {
  it('returns valid for completed matching row', () => {
    const currentRow: CellState[] = ['filled', 'filled', 'empty', 'filled', 'empty'];
    const targetClue = [2, 1];
    expect(validateRow(currentRow, targetClue)).toBe('valid');
  });

  it('returns error for overfilled row', () => {
    const currentRow: CellState[] = ['filled', 'filled', 'filled', 'empty', 'empty'];
    const targetClue = [2];
    expect(validateRow(currentRow, targetClue)).toBe('error');
  });

  it('returns in-progress for partial row', () => {
    const currentRow: CellState[] = ['filled', 'empty', 'empty', 'empty', 'empty'];
    const targetClue = [2, 1];
    expect(validateRow(currentRow, targetClue)).toBe('in-progress');
  });

  it('returns in-progress for empty row', () => {
    const currentRow: CellState[] = ['empty', 'empty', 'empty'];
    const targetClue = [2];
    expect(validateRow(currentRow, targetClue)).toBe('in-progress');
  });

  it('returns valid for empty row with no clues', () => {
    const currentRow: CellState[] = ['empty', 'empty', 'empty'];
    const targetClue: number[] = [];
    expect(validateRow(currentRow, targetClue)).toBe('valid');
  });

  it('ignores marked cells', () => {
    const currentRow: CellState[] = ['filled', 'filled', 'marked', 'empty', 'empty'];
    const targetClue = [2];
    expect(validateRow(currentRow, targetClue)).toBe('valid');
  });

  it('detects error when a group is too large', () => {
    const currentRow: CellState[] = ['filled', 'filled', 'filled', 'empty', 'filled'];
    const targetClue = [2, 1];
    expect(validateRow(currentRow, targetClue)).toBe('error');
  });

  it('detects error when there are too many groups', () => {
    const currentRow: CellState[] = ['filled', 'empty', 'filled', 'empty', 'filled'];
    const targetClue = [2];
    expect(validateRow(currentRow, targetClue)).toBe('error');
  });

  it('returns valid for completed row with all marked cells', () => {
    const currentRow: CellState[] = ['marked', 'marked', 'marked'];
    const targetClue: number[] = [];
    expect(validateRow(currentRow, targetClue)).toBe('valid');
  });

  it('returns valid for completed row mixing filled and marked', () => {
    const currentRow: CellState[] = ['filled', 'filled', 'marked', 'filled', 'marked'];
    const targetClue = [2, 1];
    expect(validateRow(currentRow, targetClue)).toBe('valid');
  });
});

describe('validateGrid', () => {
  it('detects incomplete grid', () => {
    const grid: CellState[][] = [
      ['filled', 'empty', 'empty'],
      ['empty', 'empty', 'empty'],
      ['empty', 'empty', 'empty']
    ];
    const rowClues = [[2], [], []];  // Expects 2 filled, only has 1
    const colClues = [[1], [], []];

    const result = validateGrid(grid, rowClues, colClues);
    // Incomplete because row 0 needs 2 filled cells but only has 1
    expect(result.isComplete).toBe(false);
    expect(result.isValid).toBe(false);
    expect(result.rows[0]).toBe('in-progress');
  });

  it('detects complete valid grid', () => {
    const grid: CellState[][] = [
      ['filled', 'filled', 'marked'],
      ['marked', 'marked', 'marked'],
      ['filled', 'marked', 'filled']
    ];
    const rowClues = [[2], [], [1, 1]];
    const colClues = [[1, 1], [1], [1]];

    const result = validateGrid(grid, rowClues, colClues);
    expect(result.isComplete).toBe(true);
    expect(result.isValid).toBe(true);
  });

  it('validates individual rows and columns', () => {
    const grid: CellState[][] = [
      ['filled', 'filled', 'filled'],
      ['empty', 'empty', 'empty']
    ];
    const rowClues = [[2], []];
    const colClues = [[1], [1], [1]];

    const result = validateGrid(grid, rowClues, colClues);
    expect(result.rows[0]).toBe('error'); // 3 filled, expect 2
    expect(result.rows[1]).toBe('valid'); // empty row, no clues
  });

  it('detects filled but invalid grid', () => {
    const grid: CellState[][] = [
      ['filled', 'filled', 'filled'],
      ['marked', 'marked', 'marked'],
      ['filled', 'marked', 'filled']
    ];
    const rowClues = [[2], [], [1, 1]];
    const colClues = [[1, 1], [1], [1]];

    const result = validateGrid(grid, rowClues, colClues);
    // All cells filled but doesn't match clues = not complete, not valid
    expect(result.isComplete).toBe(false);
    expect(result.isValid).toBe(false);
    expect(result.rows[0]).toBe('error');
  });

  it('handles grid with all marked cells', () => {
    const grid: CellState[][] = [
      ['marked', 'marked'],
      ['marked', 'marked']
    ];
    const rowClues = [[], []];
    const colClues = [[], []];

    const result = validateGrid(grid, rowClues, colClues);
    expect(result.isComplete).toBe(true);
    expect(result.isValid).toBe(true);
    expect(result.rows.every(r => r === 'valid')).toBe(true);
    expect(result.columns.every(c => c === 'valid')).toBe(true);
  });

  it('validates partial progress correctly', () => {
    const grid: CellState[][] = [
      ['filled', 'filled', 'empty', 'empty', 'empty'],
      ['empty', 'empty', 'empty', 'empty', 'empty'],
      ['filled', 'empty', 'empty', 'empty', 'empty']
    ];
    const rowClues = [[2, 2], [], [1, 1, 1]];
    const colClues = [[1, 1], [1], [], [], []];

    const result = validateGrid(grid, rowClues, colClues);
    expect(result.rows[0]).toBe('in-progress'); // has [2] but needs [2, 2]
    expect(result.rows[1]).toBe('valid'); // empty with no clues
    expect(result.rows[2]).toBe('in-progress'); // has [1] but needs [1, 1, 1]
  });

  it('handles single cell grid - valid', () => {
    const grid: CellState[][] = [
      ['filled']
    ];
    const rowClues = [[1]];
    const colClues = [[1]];

    const result = validateGrid(grid, rowClues, colClues);
    expect(result.rows[0]).toBe('valid');
    expect(result.columns[0]).toBe('valid');
    expect(result.isComplete).toBe(true);
    expect(result.isValid).toBe(true);
  });

  it('handles single cell grid - in-progress', () => {
    const grid: CellState[][] = [
      ['empty']
    ];
    const rowClues = [[1]];
    const colClues = [[1]];

    const result = validateGrid(grid, rowClues, colClues);
    expect(result.rows[0]).toBe('in-progress');
    expect(result.columns[0]).toBe('in-progress');
    expect(result.isComplete).toBe(false);
    expect(result.isValid).toBe(false);
  });

  it('validates columns independently', () => {
    const grid: CellState[][] = [
      ['filled', 'empty', 'empty'],
      ['filled', 'empty', 'empty'],
      ['filled', 'empty', 'empty']
    ];
    const rowClues = [[1], [1], [1]];
    const colClues = [[2], [], []];

    const result = validateGrid(grid, rowClues, colClues);
    expect(result.columns[0]).toBe('error'); // 3 filled, expect 2
    expect(result.columns[1]).toBe('valid'); // empty column, no clues
    expect(result.columns[2]).toBe('valid'); // empty column, no clues
  });

  it('detects when current groups cannot possibly match', () => {
    const grid: CellState[][] = [
      ['filled', 'empty', 'filled', 'filled', 'filled', 'filled']
    ];
    const rowClues = [[1, 2]];
    const colClues = [[1], [], [1], [1], [1], [1]];

    const result = validateGrid(grid, rowClues, colClues);
    // Current: [1, 4], Target: [1, 2] - error (second group too large)
    expect(result.rows[0]).toBe('error');
  });

  it('correctly validates when groups are still buildable', () => {
    const grid: CellState[][] = [
      ['filled', 'empty', 'filled', 'empty', 'empty']
    ];
    const rowClues = [[1, 2]];
    const colClues = [[1], [], [1], [], []];

    const result = validateGrid(grid, rowClues, colClues);
    // Current: [1, 1], Target: [1, 2] - in progress (can add to second group)
    expect(result.rows[0]).toBe('in-progress');
  });
});
