import { describe, it, expect } from 'vitest';
import { calculateRowClues, calculateColumnClues } from './clueCalculator';

describe('calculateRowClues', () => {
  it('calculates clues for a simple row with two groups', () => {
    const solution = [[true, true, false, true]];
    const result = calculateRowClues(solution);
    expect(result).toEqual([[2, 1]]);
  });

  it('returns [0] for empty row', () => {
    const solution = [[false, false, false]];
    const result = calculateRowClues(solution);
    expect(result).toEqual([[0]]);
  });

  it('calculates clues for all filled row', () => {
    const solution = [[true, true, true]];
    const result = calculateRowClues(solution);
    expect(result).toEqual([[3]]);
  });

  it('calculates clues for single filled cell', () => {
    const solution = [[false, true, false]];
    const result = calculateRowClues(solution);
    expect(result).toEqual([[1]]);
  });

  it('handles multiple rows independently', () => {
    const solution = [
      [true, true, false, true],
      [false, false, false, false],
      [true, true, true, true],
      [false, true, false, true]
    ];
    const result = calculateRowClues(solution);
    expect(result).toEqual([
      [2, 1],
      [0],
      [4],
      [1, 1]
    ]);
  });

  it('handles complex patterns with multiple groups', () => {
    const solution = [[true, false, true, false, true, true]];
    const result = calculateRowClues(solution);
    expect(result).toEqual([[1, 1, 2]]);
  });

  it('handles single cell grid', () => {
    const solution = [[true]];
    const result = calculateRowClues(solution);
    expect(result).toEqual([[1]]);
  });

  it('handles empty single cell grid', () => {
    const solution = [[false]];
    const result = calculateRowClues(solution);
    expect(result).toEqual([[0]]);
  });

  it('handles empty grid', () => {
    const solution: boolean[][] = [];
    const result = calculateRowClues(solution);
    expect(result).toEqual([]);
  });
});

describe('calculateColumnClues', () => {
  it('calculates clues for columns in a simple 2x2 grid', () => {
    const solution = [
      [true, false],
      [true, true]
    ];
    const result = calculateColumnClues(solution);
    expect(result).toEqual([
      [2],    // Column 0: both true
      [1]     // Column 1: one true
    ]);
  });

  it('calculates clues for columns in a 3x3 grid', () => {
    const solution = [
      [true, true, false],
      [false, true, false],
      [true, true, true]
    ];
    const result = calculateColumnClues(solution);
    expect(result).toEqual([
      [1, 1],  // Column 0: true, false, true
      [3],     // Column 1: all true
      [1]      // Column 2: false, false, true
    ]);
  });

  it('handles all empty columns', () => {
    const solution = [
      [false, false],
      [false, false]
    ];
    const result = calculateColumnClues(solution);
    expect(result).toEqual([[0], [0]]);
  });

  it('handles all filled columns', () => {
    const solution = [
      [true, true],
      [true, true]
    ];
    const result = calculateColumnClues(solution);
    expect(result).toEqual([[2], [2]]);
  });

  it('handles single cell grid', () => {
    const solution = [[true]];
    const result = calculateColumnClues(solution);
    expect(result).toEqual([[1]]);
  });

  it('handles empty single cell grid', () => {
    const solution = [[false]];
    const result = calculateColumnClues(solution);
    expect(result).toEqual([[0]]);
  });

  it('handles complex column patterns', () => {
    const solution = [
      [true],
      [false],
      [true],
      [false],
      [true],
      [true]
    ];
    const result = calculateColumnClues(solution);
    expect(result).toEqual([[1, 1, 2]]);
  });

  it('handles empty grid', () => {
    const solution: boolean[][] = [];
    const result = calculateColumnClues(solution);
    expect(result).toEqual([]);
  });

  it('handles 10x10 grid (typical use case)', () => {
    const solution = [
      [true, true, true, true, true, true, true, true, true, true],
      [true, false, false, false, false, false, false, false, false, true],
      [true, false, false, false, false, false, false, false, false, true],
      [true, false, false, false, false, false, false, false, false, true],
      [true, false, false, false, false, false, false, false, false, true],
      [true, false, false, false, false, false, false, false, false, true],
      [true, false, false, false, false, false, false, false, false, true],
      [true, false, false, false, false, false, false, false, false, true],
      [true, false, false, false, false, false, false, false, false, true],
      [true, true, true, true, true, true, true, true, true, true]
    ];
    const result = calculateColumnClues(solution);
    // First column: 10 filled cells
    expect(result[0]).toEqual([10]);
    // Middle columns: 1 filled, gap, 1 filled
    expect(result[1]).toEqual([1, 1]);
    // Last column: 10 filled cells
    expect(result[9]).toEqual([10]);
  });
});
