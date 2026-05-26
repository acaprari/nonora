/**
 * API Client - Class-based interface with Anthropic API for puzzle generation and hints
 *
 * Provides methods to:
 * 1. Generate puzzles from text prompts with difficulty levels
 * 2. Generate adaptive hints (guidance or specific) based on current grid state
 *
 * Uses the Anthropic SDK to communicate with Claude AI.
 * Handles API errors, malformed responses, and retries.
 */

import Anthropic from '@anthropic-ai/sdk'
import type { Hint } from '@/types'

// Model configuration
// Using Claude Sonnet 4.6 - latest Sonnet model (best speed/intelligence balance)
const MODEL = 'claude-sonnet-4-6'

/**
 * Response structure for puzzle generation
 */
interface PuzzleResponse {
  matrix: boolean[][]
}

/**
 * Response structure for specific hints
 */
interface SpecificHintResponse {
  row: number
  col: number
  action: 'fill' | 'mark'
  reasoning: string
}

/**
 * ApiClient - Class-based API client for Anthropic Claude
 */
export class ApiClient {
  private client: Anthropic

  /**
   * Creates a new ApiClient instance
   * @param apiKey - Anthropic API key
   */
  constructor(apiKey: string) {
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('API key is required')
    }

    this.client = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true  // CRITICAL for browser usage
    })
  }

  /**
   * Generates a nonogram puzzle from a text prompt.
   *
   * @param prompt - User's text prompt describing desired pixel art (e.g., "a cat")
   * @param difficulty - Difficulty level from 1-10 (1=very simple, 10=expert)
   * @param size - Size of the puzzle grid (default: 10 for 10x10)
   * @returns Promise resolving to a 2D boolean matrix representing the puzzle solution
   * @throws Error if API call fails, response is malformed, or grid validation fails
   */
  async generatePuzzle(prompt: string, difficulty: number, size: number = 10): Promise<boolean[][]> {
    // Input validation
    if (!prompt || prompt.trim() === '') {
      throw new Error('Prompt cannot be empty')
    }

    if (difficulty < 1 || difficulty > 10) {
      throw new Error('Difficulty must be between 1 and 10')
    }

    if (size < 5 || size > 20) {
      throw new Error('Size must be between 5 and 20')
    }

    try {
      const systemPrompt = `Generate a ${size}x${size} nonogram puzzle representing "${prompt}" as pixel art.

Requirements:
- Return a JSON object with a "matrix" field containing a 2D boolean array
- true = filled cell, false = empty cell
- Create a recognizable shape that works as pixel art
- **IMPORTANT: Avoid perfectly symmetric designs** - add natural variation, asymmetric poses, or dynamic positioning
- Vary the composition: don't always center the subject, try different angles or poses
- Ensure the puzzle has clear, unambiguous clues
- Difficulty level: ${difficulty}/10 (1=very simple shapes, 10=expert complexity)
- The puzzle should be solvable using logic alone (no guessing required)

Return ONLY valid JSON, no other text.

Example format:
{
  "matrix": [
    [false, true, true, false, ...],
    [true, true, true, true, ...],
    ...
  ]
}`

      const message = await this.client.messages.create({
        model: MODEL,
        max_tokens: 2048,
        temperature: 0.0,  // Low temperature for consistent structured output
        messages: [{
          role: 'user',
          content: systemPrompt
        }]
      })

      // Extract text content from response
      const content = message.content[0]
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from API')
      }

      const responseText = content.text

      // Parse JSON from response
      let parsed: PuzzleResponse
      try {
        // Try to extract JSON object from response
        // Handle cases where AI might wrap it in markdown or add extra text
        const jsonMatch = responseText.match(/\{[\s\S]*"matrix"[\s\S]*\}/)
        if (!jsonMatch) {
          throw new Error('No JSON object with matrix field found in response')
        }

        parsed = JSON.parse(jsonMatch[0])
      } catch (parseError) {
        throw new Error(
          `Failed to parse puzzle response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`
        )
      }

      // Validate response structure
      if (!parsed.matrix || !Array.isArray(parsed.matrix)) {
        throw new Error('Response does not contain a valid matrix field')
      }

      // Validate grid structure
      this.validateGridStructure(parsed.matrix, size)

      return parsed.matrix
    } catch (error) {
      // Handle different error types
      if (error instanceof Anthropic.APIError) {
        if (error.status === 401) {
          throw new Error('Invalid API key. Please check your Anthropic API key.')
        } else if (error.status === 429) {
          throw new Error('API rate limit reached. Please wait a moment and try again.')
        } else if (error.status >= 500) {
          throw new Error('Anthropic API is temporarily unavailable. Please try again later.')
        } else {
          throw new Error(`API error: ${error.message}`)
        }
      }

      // Re-throw validation and parsing errors as-is
      if (error instanceof Error) {
        throw error
      }

      // Unknown error
      throw new Error('Failed to generate puzzle. Please try again.')
    }
  }

  /**
   * Generates a hint for the current puzzle state.
   *
   * @param type - Type of hint: 'guidance' for strategic hints, 'specific' for exact cell coordinates
   * @param currentGrid - Current grid state as string[][] (values: 'filled', 'marked', 'empty')
   * @param rowClues - Row clues for the puzzle
   * @param columnClues - Column clues for the puzzle
   * @returns Promise resolving to a Hint object
   * @throws Error if API call fails or response is malformed
   */
  async getHint(
    type: 'guidance' | 'specific',
    currentGrid: string[][],
    rowClues: number[][],
    columnClues: number[][]
  ): Promise<Hint> {
    // Input validation
    if (!currentGrid || !Array.isArray(currentGrid) || currentGrid.length === 0) {
      throw new Error('Current grid cannot be empty')
    }

    if (!rowClues || !Array.isArray(rowClues)) {
      throw new Error('Row clues are required')
    }

    if (!columnClues || !Array.isArray(columnClues)) {
      throw new Error('Column clues are required')
    }

    try {
      // Format grid using symbols: ■ for filled, × for marked, · for empty
      const gridRepresentation = currentGrid.map(row =>
        row.map(cell => cell === 'filled' ? '■' : cell === 'marked' ? '×' : '·').join(' ')
      ).join('\n')

      let prompt: string

      if (type === 'guidance') {
        prompt = `You are helping someone solve a nonogram puzzle. Current state:

Row clues: ${JSON.stringify(rowClues)}
Column clues: ${JSON.stringify(columnClues)}
Current grid:
${gridRepresentation}

Provide strategic guidance about which row or column to focus on next.
Don't give exact cell coordinates - help them think through the logic.
Keep it brief (1-2 sentences).`
      } else {
        prompt = `You are helping someone solve a nonogram puzzle. Current state:

Row clues: ${JSON.stringify(rowClues)}
Column clues: ${JSON.stringify(columnClues)}
Current grid:
${gridRepresentation}

Analyze the grid and provide the next logical cell to fill or mark.

IMPORTANT: In your "reasoning" field, use 1-based numbering (rows and columns start at 1, not 0).
Example: "Row 1, Column 3" instead of "Row 0, Column 2".

However, the "row" and "col" fields in the JSON must still be 0-based for internal use.

Return ONLY valid JSON in this format:
{
  "row": <number 0-${currentGrid.length - 1}>,
  "col": <number 0-${currentGrid[0].length - 1}>,
  "action": "fill" | "mark",
  "reasoning": "<brief explanation using 1-based row/column numbers>"
}`
      }

      const message = await this.client.messages.create({
        model: MODEL,
        max_tokens: 1024,
        temperature: 0.0,  // Low temperature for consistent structured output
        messages: [{
          role: 'user',
          content: prompt
        }]
      })

      // Extract text content from response
      const content = message.content[0]
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from API')
      }

      const responseText = content.text

      if (type === 'guidance') {
        // For guidance, return the text directly
        return {
          type: 'guidance',
          message: responseText.trim()
        }
      } else {
        // For specific hints, parse JSON response
        let parsed: SpecificHintResponse
        try {
          // Extract JSON from response
          const jsonMatch = responseText.match(/\{[\s\S]*\}/)
          if (!jsonMatch) {
            throw new Error('No JSON object found in response')
          }

          parsed = JSON.parse(jsonMatch[0])
        } catch (parseError) {
          throw new Error(
            `Failed to parse hint response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`
          )
        }

        // Validate specific hint structure
        if (
          typeof parsed.row !== 'number' ||
          typeof parsed.col !== 'number' ||
          typeof parsed.reasoning !== 'string'
        ) {
          throw new Error('Invalid specific hint format from API')
        }

        // Validate coordinate boundaries
        if (parsed.row < 0 || parsed.row >= currentGrid.length) {
          throw new Error(`Hint row coordinate out of bounds: ${parsed.row}. Valid range: 0-${currentGrid.length - 1}`)
        }
        if (parsed.col < 0 || parsed.col >= currentGrid[0].length) {
          throw new Error(`Hint column coordinate out of bounds: ${parsed.col}. Valid range: 0-${currentGrid[0].length - 1}`)
        }

        // Validate action field
        if (parsed.action !== 'fill' && parsed.action !== 'mark') {
          throw new Error(`Invalid hint action: ${parsed.action}. Expected 'fill' or 'mark'`)
        }

        return {
          type: 'specific',
          message: parsed.reasoning,
          cell: {
            row: parsed.row,
            col: parsed.col
          }
        }
      }
    } catch (error) {
      // Handle different error types
      if (error instanceof Anthropic.APIError) {
        if (error.status === 401) {
          throw new Error('Invalid API key. Please check your Anthropic API key.')
        } else if (error.status === 429) {
          throw new Error('API rate limit reached. Please wait a moment and try again.')
        } else if (error.status >= 500) {
          throw new Error('Anthropic API is temporarily unavailable. Please try again later.')
        } else {
          throw new Error(`API error: ${error.message}`)
        }
      }

      // Re-throw validation and parsing errors as-is
      if (error instanceof Error) {
        throw error
      }

      // Unknown error
      throw new Error('Failed to generate hint. Please try again.')
    }
  }

  /**
   * Validates that a grid has the correct structure and dimensions.
   *
   * @param grid - Grid to validate
   * @param expectedSize - Expected size (e.g., 10 for 10x10)
   * @throws Error if grid is invalid
   */
  private validateGridStructure(grid: any, expectedSize: number): void {
    // Check if grid is an array
    if (!Array.isArray(grid)) {
      throw new Error('Generated grid is not an array')
    }

    // Check row count
    if (grid.length !== expectedSize) {
      throw new Error(
        `Generated grid has ${grid.length} rows, expected ${expectedSize}`
      )
    }

    // Check each row
    for (let i = 0; i < grid.length; i++) {
      const row = grid[i]

      // Check if row is an array
      if (!Array.isArray(row)) {
        throw new Error(`Row ${i} is not an array`)
      }

      // Check column count
      if (row.length !== expectedSize) {
        throw new Error(
          `Row ${i} has ${row.length} columns, expected ${expectedSize}`
        )
      }

      // Check all values are boolean
      for (let j = 0; j < row.length; j++) {
        if (typeof row[j] !== 'boolean') {
          throw new Error(
            `Cell at row ${i}, column ${j} is not a boolean (got ${typeof row[j]})`
          )
        }
      }
    }

    // Check for entirely empty rows or columns (invalid puzzles)
    const hasEmptyRow = grid.some((row: boolean[]) => row.every(cell => !cell))
    if (hasEmptyRow) {
      throw new Error('Generated grid has entirely empty rows (invalid puzzle)')
    }

    // Check for empty columns
    const numCols = grid[0].length
    for (let col = 0; col < numCols; col++) {
      const isEmpty = grid.every((row: boolean[]) => !row[col])
      if (isEmpty) {
        throw new Error(
          'Generated grid has entirely empty columns (invalid puzzle)'
        )
      }
    }
  }
}
