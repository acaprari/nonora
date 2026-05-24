/**
 * API Client - Interface with Anthropic API for puzzle generation and hints
 *
 * Provides functions to:
 * 1. Generate puzzles from text prompts
 * 2. Generate adaptive hints based on current grid state
 *
 * Uses the Anthropic SDK to communicate with Claude AI.
 * Handles API errors, malformed responses, and retries.
 */

import Anthropic from '@anthropic-ai/sdk';
import type { Puzzle, Hint } from '@/types';

// Model configuration
const MODEL = 'claude-3-5-sonnet-20241022';
const PUZZLE_MAX_TOKENS = 1024;
const HINT_MAX_TOKENS = 512;
const TEMPERATURE = 1.0;

/**
 * Generates a nonogram puzzle from a text prompt.
 *
 * @param apiKey - Anthropic API key
 * @param prompt - User's text prompt describing desired pixel art (e.g., "a cat")
 * @param gridSize - Size of the puzzle grid (e.g., 10 for 10x10)
 * @returns Promise resolving to a 2D boolean matrix representing the puzzle solution
 * @throws Error if API call fails, response is malformed, or grid validation fails
 */
export async function generatePuzzle(
  apiKey: string,
  prompt: string,
  gridSize: number
): Promise<boolean[][]> {
  try {
    const client = new Anthropic({ apiKey });

    const systemPrompt = `You are generating a nonogram puzzle. Create a ${gridSize}x${gridSize} binary grid that represents pixel art matching this description: "${prompt}".

Return ONLY a JSON array of arrays with true/false values. No explanations, no markdown, no code blocks.
Example format: [[true, false], [false, true]]

The grid should:
- Be exactly ${gridSize}x${gridSize} in size
- Create a recognizable shape as pixel art
- Be solvable as a nonogram puzzle (have clear, unambiguous clues)
- Not have entirely empty rows or columns`;

    const message = await client.messages.create({
      model: MODEL,
      max_tokens: PUZZLE_MAX_TOKENS,
      temperature: TEMPERATURE,
      messages: [
        {
          role: 'user',
          content: `Generate a ${gridSize}x${gridSize} nonogram puzzle for: "${prompt}"`
        }
      ],
      system: systemPrompt
    });

    // Extract text content from response
    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from API');
    }

    const responseText = content.text;

    // Parse JSON from response
    let grid: boolean[][];
    try {
      // Try to extract JSON array from response
      // Handle cases where AI might wrap it in markdown or add extra text
      const jsonMatch = responseText.match(/\[\s*\[[\s\S]*\]\s*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }

      grid = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      throw new Error(
        `Failed to parse puzzle response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`
      );
    }

    // Validate grid structure
    validateGridStructure(grid, gridSize);

    return grid;
  } catch (error) {
    // Handle different error types
    if (error instanceof Anthropic.APIError) {
      if (error.status === 401) {
        throw new Error('Invalid API key. Please check your Anthropic API key.');
      } else if (error.status === 429) {
        throw new Error('API rate limit reached. Please wait a moment and try again.');
      } else if (error.status >= 500) {
        throw new Error('Anthropic API is temporarily unavailable. Please try again later.');
      } else {
        throw new Error(`API error: ${error.message}`);
      }
    }

    // Re-throw validation and parsing errors as-is
    if (error instanceof Error) {
      throw error;
    }

    // Unknown error
    throw new Error('Failed to generate puzzle. Please try again.');
  }
}

/**
 * Generates a hint for the current puzzle state.
 *
 * @param apiKey - Anthropic API key
 * @param puzzle - Current puzzle state including grid and clues
 * @returns Promise resolving to a Hint object
 * @throws Error if API call fails or response is malformed
 */
export async function generateHint(
  apiKey: string,
  puzzle: Puzzle
): Promise<Hint> {
  try {
    const client = new Anthropic({ apiKey });

    // Determine hint type based on number of hints already used
    // More hints = more specific guidance
    const isSpecific = puzzle.hintsUsed >= 2;

    // Format current grid state for the AI
    const gridState = formatGridState(puzzle.currentGrid);
    const rowCluesStr = JSON.stringify(puzzle.rowClues);
    const columnCluesStr = JSON.stringify(puzzle.columnClues);

    let systemPrompt: string;
    let userPrompt: string;

    if (isSpecific) {
      // Specific hint: provide exact cell to fill/mark
      systemPrompt = `You are helping someone solve a nonogram puzzle. Analyze the current grid state and provide the next logical cell to fill or mark.

Return ONLY valid JSON in this exact format:
{
  "row": <number 0-${puzzle.solution.length - 1}>,
  "col": <number 0-${puzzle.solution[0].length - 1}>,
  "action": "fill",
  "reasoning": "<brief explanation why this cell is the next logical move>"
}

Use "fill" action for cells that should be filled (true).
Provide the single best next move based on logical deduction.`;

      userPrompt = `Current grid state (. = empty, X = filled, M = marked):
${gridState}

Row clues: ${rowCluesStr}
Column clues: ${columnCluesStr}

What is the next logical cell to fill?`;
    } else {
      // Gentle guidance: strategic hint without exact coordinates
      systemPrompt = `You are helping someone solve a nonogram puzzle. Provide strategic guidance about which row or column to focus on next.

Return ONLY valid JSON in this exact format:
{
  "message": "<your hint here>"
}

Keep hints brief (1-2 sentences). Help them think through the logic without giving exact cell coordinates.
Example good hint: "Look at row 5 - with a clue of '8', you can deduce several cells must be filled."`;

      userPrompt = `Current grid state (. = empty, X = filled, M = marked):
${gridState}

Row clues: ${rowCluesStr}
Column clues: ${columnCluesStr}

Provide strategic guidance for the next move.`;
    }

    const message = await client.messages.create({
      model: MODEL,
      max_tokens: HINT_MAX_TOKENS,
      temperature: TEMPERATURE,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ],
      system: systemPrompt
    });

    // Extract text content from response
    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from API');
    }

    const responseText = content.text;

    // Parse JSON from response
    let hintData: any;
    try {
      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON object found in response');
      }

      hintData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      throw new Error(
        `Failed to parse hint response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`
      );
    }

    // Build hint object based on type
    if (isSpecific) {
      // Validate specific hint structure
      if (
        typeof hintData.row !== 'number' ||
        typeof hintData.col !== 'number' ||
        typeof hintData.reasoning !== 'string'
      ) {
        throw new Error('Invalid specific hint format from API');
      }

      return {
        type: 'specific',
        message: hintData.reasoning,
        cell: {
          row: hintData.row,
          col: hintData.col
        }
      };
    } else {
      // Validate guidance hint structure
      if (typeof hintData.message !== 'string') {
        throw new Error('Invalid guidance hint format from API');
      }

      return {
        type: 'guidance',
        message: hintData.message
      };
    }
  } catch (error) {
    // Handle different error types
    if (error instanceof Anthropic.APIError) {
      if (error.status === 401) {
        throw new Error('Invalid API key. Please check your Anthropic API key.');
      } else if (error.status === 429) {
        throw new Error('API rate limit reached. Please wait a moment and try again.');
      } else if (error.status >= 500) {
        throw new Error('Anthropic API is temporarily unavailable. Please try again later.');
      } else {
        throw new Error(`API error: ${error.message}`);
      }
    }

    // Re-throw validation and parsing errors as-is
    if (error instanceof Error) {
      throw error;
    }

    // Unknown error
    throw new Error('Failed to generate hint. Please try again.');
  }
}

/**
 * Validates that a grid has the correct structure and dimensions.
 *
 * @param grid - Grid to validate
 * @param expectedSize - Expected size (e.g., 10 for 10x10)
 * @throws Error if grid is invalid
 */
function validateGridStructure(grid: any, expectedSize: number): void {
  // Check if grid is an array
  if (!Array.isArray(grid)) {
    throw new Error('Generated grid is not an array');
  }

  // Check row count
  if (grid.length !== expectedSize) {
    throw new Error(
      `Generated grid has ${grid.length} rows, expected ${expectedSize}`
    );
  }

  // Check each row
  for (let i = 0; i < grid.length; i++) {
    const row = grid[i];

    // Check if row is an array
    if (!Array.isArray(row)) {
      throw new Error(`Row ${i} is not an array`);
    }

    // Check column count
    if (row.length !== expectedSize) {
      throw new Error(
        `Row ${i} has ${row.length} columns, expected ${expectedSize}`
      );
    }

    // Check all values are boolean
    for (let j = 0; j < row.length; j++) {
      if (typeof row[j] !== 'boolean') {
        throw new Error(
          `Cell at row ${i}, column ${j} is not a boolean (got ${typeof row[j]})`
        );
      }
    }
  }

  // Check for entirely empty rows or columns (invalid puzzles)
  const hasEmptyRow = grid.some((row: boolean[]) => row.every(cell => !cell));
  if (hasEmptyRow) {
    throw new Error('Generated grid has entirely empty rows (invalid puzzle)');
  }

  // Check for empty columns
  const numCols = grid[0].length;
  for (let col = 0; col < numCols; col++) {
    const isEmpty = grid.every((row: boolean[]) => !row[col]);
    if (isEmpty) {
      throw new Error(
        'Generated grid has entirely empty columns (invalid puzzle)'
      );
    }
  }
}

/**
 * Formats the current grid state as a visual representation for AI analysis.
 *
 * @param grid - Current grid state
 * @returns String representation of the grid
 */
function formatGridState(grid: any[][]): string {
  return grid
    .map(row =>
      row
        .map(cell => {
          if (cell === 'filled') return 'X';
          if (cell === 'marked') return 'M';
          return '.';
        })
        .join(' ')
    )
    .join('\n');
}
