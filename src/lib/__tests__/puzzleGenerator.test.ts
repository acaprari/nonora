import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generatePuzzle } from '../puzzleGenerator'
import type { ApiClient } from '@/lib/api'

describe('generatePuzzle', () => {
  let mockApiClient: ApiClient

  beforeEach(() => {
    // Create a fresh mock API client for each test
    mockApiClient = {
      generatePuzzle: vi.fn(),
      getHint: vi.fn()
    } as unknown as ApiClient
  })

  it('generates complete puzzle from API response', async () => {
    // Mock a simple 2x2 puzzle
    const mockSolution = [
      [true, false],
      [false, true]
    ]
    vi.mocked(mockApiClient.generatePuzzle).mockResolvedValue(mockSolution)

    const result = await generatePuzzle(mockApiClient, 'test prompt', 5, 2)

    // Verify API was called correctly
    expect(mockApiClient.generatePuzzle).toHaveBeenCalledWith('test prompt', 5, 2)

    // Verify puzzle structure
    expect(result.id).toBeDefined()
    expect(typeof result.id).toBe('string')
    expect(result.id.length).toBeGreaterThan(0)

    expect(result.prompt).toBe('test prompt')
    expect(result.solution).toEqual(mockSolution)

    // Verify clues are calculated correctly
    expect(result.rowClues).toEqual([[1], [1]])
    expect(result.columnClues).toEqual([[1], [1]])

    // Verify initial grid is all empty
    expect(result.currentGrid).toEqual([
      ['empty', 'empty'],
      ['empty', 'empty']
    ])

    // Verify metadata
    expect(result.startTime).toBeGreaterThan(0)
    expect(result.hintsUsed).toBe(0)
    expect(result.errors).toBe(0)
  })

  it('generates puzzle with default size when not specified', async () => {
    const mockSolution = Array(10).fill(null).map(() => Array(10).fill(false))
    vi.mocked(mockApiClient.generatePuzzle).mockResolvedValue(mockSolution)

    await generatePuzzle(mockApiClient, 'test', 5)

    // Should call API with default size of 10
    expect(mockApiClient.generatePuzzle).toHaveBeenCalledWith('test', 5, 10)
  })

  it('calculates clues correctly for complex puzzle', async () => {
    const mockSolution = [
      [true, true, false, true],
      [false, false, false, false],
      [true, true, true, false]
    ]
    vi.mocked(mockApiClient.generatePuzzle).mockResolvedValue(mockSolution)

    const result = await generatePuzzle(mockApiClient, 'complex', 7, 4)

    expect(result.rowClues).toEqual([
      [2, 1],  // Row 0: two filled, gap, one filled
      [],      // Row 1: all empty
      [3]      // Row 2: three filled
    ])
    expect(result.columnClues).toEqual([
      [1, 1],  // Col 0: filled, gap, filled
      [1, 1],  // Col 1: filled, gap, filled
      [1],     // Col 2: one filled
      [1]      // Col 3: one filled
    ])
  })

  it('creates initial grid with correct dimensions', async () => {
    const mockSolution = [
      [true, true, true],
      [true, false, true],
      [false, false, false]
    ]
    vi.mocked(mockApiClient.generatePuzzle).mockResolvedValue(mockSolution)

    const result = await generatePuzzle(mockApiClient, 'test', 5, 3)

    // Verify dimensions
    expect(result.currentGrid).toHaveLength(3)
    expect(result.currentGrid[0]).toHaveLength(3)

    // Verify all cells are empty
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        expect(result.currentGrid[row][col]).toBe('empty')
      }
    }
  })

  it('generates unique IDs for different puzzles', async () => {
    const mockSolution = [[true]]
    vi.mocked(mockApiClient.generatePuzzle).mockResolvedValue(mockSolution)

    const puzzle1 = await generatePuzzle(mockApiClient, 'test1', 5, 1)
    const puzzle2 = await generatePuzzle(mockApiClient, 'test2', 5, 1)

    expect(puzzle1.id).not.toBe(puzzle2.id)
  })

  it('sets startTime to current timestamp', async () => {
    const mockSolution = [[true]]
    vi.mocked(mockApiClient.generatePuzzle).mockResolvedValue(mockSolution)

    const before = Date.now()
    const result = await generatePuzzle(mockApiClient, 'test', 5, 1)
    const after = Date.now()

    expect(result.startTime).toBeGreaterThanOrEqual(before)
    expect(result.startTime).toBeLessThanOrEqual(after)
  })

  it('initializes counters to zero', async () => {
    const mockSolution = [[true, false], [false, true]]
    vi.mocked(mockApiClient.generatePuzzle).mockResolvedValue(mockSolution)

    const result = await generatePuzzle(mockApiClient, 'test', 5, 2)

    expect(result.hintsUsed).toBe(0)
    expect(result.errors).toBe(0)
  })

  it('propagates API errors', async () => {
    const apiError = new Error('API connection failed')
    vi.mocked(mockApiClient.generatePuzzle).mockRejectedValue(apiError)

    await expect(
      generatePuzzle(mockApiClient, 'test', 5, 2)
    ).rejects.toThrow('API connection failed')
  })

  it('handles large puzzles correctly', async () => {
    // Create a 15x15 puzzle
    const mockSolution = Array(15).fill(null).map((_, row) =>
      Array(15).fill(null).map((_, col) => (row + col) % 2 === 0)
    )
    vi.mocked(mockApiClient.generatePuzzle).mockResolvedValue(mockSolution)

    const result = await generatePuzzle(mockApiClient, 'checkerboard', 8, 15)

    expect(result.solution).toHaveLength(15)
    expect(result.solution[0]).toHaveLength(15)
    expect(result.currentGrid).toHaveLength(15)
    expect(result.currentGrid[0]).toHaveLength(15)
    expect(result.rowClues).toHaveLength(15)
    expect(result.columnClues).toHaveLength(15)
  })

  it('handles puzzle with no filled cells', async () => {
    const mockSolution = [
      [false, false],
      [false, false]
    ]
    vi.mocked(mockApiClient.generatePuzzle).mockResolvedValue(mockSolution)

    const result = await generatePuzzle(mockApiClient, 'empty', 1, 2)

    expect(result.rowClues).toEqual([[], []])
    expect(result.columnClues).toEqual([[], []])
    expect(result.currentGrid).toEqual([
      ['empty', 'empty'],
      ['empty', 'empty']
    ])
  })

  it('handles puzzle with all filled cells', async () => {
    const mockSolution = [
      [true, true],
      [true, true]
    ]
    vi.mocked(mockApiClient.generatePuzzle).mockResolvedValue(mockSolution)

    const result = await generatePuzzle(mockApiClient, 'solid', 1, 2)

    expect(result.rowClues).toEqual([[2], [2]])
    expect(result.columnClues).toEqual([[2], [2]])
    expect(result.currentGrid).toEqual([
      ['empty', 'empty'],
      ['empty', 'empty']
    ])
  })
})
