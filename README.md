# NonoGen

An AI-powered nonogram puzzle game built with React, TypeScript, and Claude AI. Generate unique picture puzzles from text prompts and solve them using logic!

## Live Demo

[Play NonoGen](https://acaprari.github.io/nonogen/)

## What is a Nonogram?

Nonograms (also known as Picross or Griddlers) are logic puzzles where you fill in cells on a grid to reveal a hidden picture. Numbers on the edges tell you how many consecutive cells to fill in each row and column.

## Features

- **AI-Generated Puzzles**: Create unique puzzles from any text prompt using Anthropic's Claude API
- **Adaptive Difficulty**: Progressive difficulty system from Level 1-10
- **Linear Grid Progression**: Grids grow with each level (5×5 at level 1, 6×6 at level 2, up to 14×14 at level 10)
- **Real-Time Validation**: Instant feedback with green (correct) and red (error) indicators
- **Smart Hint System**: Three-tier progressive hint system to help when you're stuck
- **Game State Persistence**: Your progress is automatically saved locally
- **Performance Tracking**: Track completion time, hints used, and errors made
- **Mobile-Friendly**: Fully responsive design works on desktop and mobile
- **Level Progression**: Complete puzzles to advance through difficulty levels

## Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **AI Integration**: Anthropic Claude API (Sonnet 4.6)
- **Testing**:
  - Unit/Component: Vitest + React Testing Library (231 tests)
  - End-to-End: Playwright (49 tests)
- **Deployment**: GitHub Pages

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Anthropic API Key ([Get one here](https://console.anthropic.com/))

### Installation

```bash
# Clone the repository
git clone https://github.com/acaprari/nonogen.git
cd nonogen

# Install dependencies
npm install

# Set up your API key
# Create a .env.local file (optional, or enter key in the app)
echo "VITE_ANTHROPIC_API_KEY=your_api_key_here" > .env.local

# Start the development server
npm run dev
```

The application will open at `http://localhost:5173`

### Environment Variables

The app requires an Anthropic API key. You can either:

1. **Enter in-app**: The game prompts you to enter your API key, which is stored securely in localStorage
2. **Use .env file**: Create a `.env.local` file with `VITE_ANTHROPIC_API_KEY=your_key`

Your API key is never sent to any server except Anthropic's official API endpoints.

## How to Play

1. **Enter API Key**: On first launch, enter your Anthropic API key. It's stored locally in your browser.

2. **Create a Puzzle**:
   - Enter a text prompt describing what you want to draw (e.g., "a cat", "a rocket ship", "a heart")
   - Click "Generate Puzzle"
   - Wait for Claude AI to create your unique puzzle

3. **Solve the Puzzle**:
   - Look at the numbers on the edges of the grid
   - Numbers indicate how many consecutive cells are filled in that row/column
   - Click cells to fill them (black), click again to mark them (X), click once more to clear
   - Use logic to deduce which cells must be filled or empty

4. **Get Feedback**:
   - Correct cells turn green when you complete a valid row/column
   - Errors turn red when you make a mistake
   - The game validates in real-time

5. **Complete**:
   - Finish the puzzle to see your completion stats
   - View your time, errors, and hints used
   - Level up and try harder puzzles!

### Nonogram Rules & Tips

**Basic Rules:**
- Numbers on edges show consecutive filled cells in that row/column
- Multiple numbers mean multiple groups separated by at least one empty cell
- Example: "3 1" means 3 filled cells, a gap, then 1 filled cell

**Solving Tips:**
- Start with rows/columns that have large numbers
- Look for cells that must be filled regardless of positioning
- Use process of elimination for tricky spots
- Mark cells you know are empty with X
- Complete easier rows first to narrow down harder ones

## Development

### Project Structure

```
nonogen/
├── src/
│   ├── components/          # React components
│   │   ├── ApiKeyInput.tsx      # API key entry screen
│   │   ├── PuzzlePrompt.tsx     # Prompt input component
│   │   ├── GameBoard.tsx        # Main game board
│   │   ├── Cell.tsx             # Individual grid cell
│   │   ├── Clues.tsx            # Number clues display
│   │   └── CompletionScreen.tsx # Victory screen
│   ├── hooks/               # Custom React hooks
│   │   ├── usePuzzle.ts         # Puzzle generation & state
│   │   ├── useDifficulty.ts     # Difficulty management
│   │   └── useGamePersistence.ts # LocalStorage persistence
│   ├── lib/                 # Core game logic
│   │   ├── nonogramGenerator.ts # AI puzzle generation
│   │   ├── puzzleSolver.ts      # Puzzle validation
│   │   └── difficultySystem.ts  # Level progression
│   ├── types/               # TypeScript type definitions
│   └── test/                # Test setup
├── e2e/                     # Playwright E2E tests
├── docs/                    # Documentation
└── public/                  # Static assets
```

### Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run preview         # Preview production build

# Testing
npm test                # Run unit tests
npm run test:ui         # Run tests with UI
npm run test:coverage   # Generate coverage report
npm run test:e2e        # Run E2E tests
npm run test:e2e:headed # Run E2E tests with browser

# Deployment
npm run deploy          # Deploy to GitHub Pages
```

### Running Tests

**Unit & Component Tests:**
```bash
npm test                # Run all tests
npm run test:ui         # Interactive test UI
npm run test:coverage   # Coverage report
```

- 231 unit and component tests
- Testing Library best practices
- Comprehensive coverage of game logic

**End-to-End Tests:**
```bash
npm run test:e2e        # Headless E2E tests
npm run test:e2e:headed # Watch tests run
```

- 49 E2E tests covering complete user flows
- Tests game creation, solving, level progression
- Validates API integration and error handling

### Testing Strategy

1. **Unit Tests**: Core game logic (puzzle generation, validation, difficulty)
2. **Component Tests**: UI components with user interactions
3. **Integration Tests**: Hook behavior with state management
4. **E2E Tests**: Complete user workflows from start to finish

See [E2E_TEST_README.md](./E2E_TEST_README.md) for detailed E2E test documentation.

## Building for Production

```bash
# Build the application
npm run build

# Preview the build locally
npm run preview
```

The build outputs to the `dist/` directory and is optimized for production with:
- Code splitting
- Minification
- Asset optimization
- Tree shaking

## Deployment

### Deploy to GitHub Pages

The project is configured for automatic deployment to GitHub Pages.

**Automatic Deployment:**
1. Push to the `main` branch
2. GitHub Actions automatically builds and deploys
3. Site is live at `https://acaprari.github.io/nonogen/`

**Manual Deployment:**
```bash
npm run deploy
```

This builds the app and pushes to the `gh-pages` branch.

### Configuring Your Own Deployment

If you fork this repository:

1. Update `vite.config.ts` with your repository name:
   ```typescript
   export default defineConfig({
     base: '/your-repo-name/',
     // ...
   })
   ```

2. Enable GitHub Pages in repository settings:
   - Go to Settings > Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages` / root
   - Save

3. Push to `main` or run `npm run deploy`

### Environment Variables for Production

For production deployment with GitHub Actions, you can set secrets:

1. Go to repository Settings > Secrets and variables > Actions
2. Add `VITE_ANTHROPIC_API_KEY` (optional - users can enter their own key)

**Note**: It's recommended to have users enter their own API keys rather than embedding one in the deployed app.

## API Usage & Costs

This game uses the Anthropic Claude API to generate puzzles. Each puzzle generation makes one API call:

- **Model**: Claude Sonnet 4.6 (claude-sonnet-4-6)
- **Approximate cost**: ~$0.01-0.02 per puzzle
- **Rate limits**: Depends on your Anthropic account tier

API keys are required to play. Users should obtain their own key from [Anthropic Console](https://console.anthropic.com/).

## Contributing

Contributions are welcome! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Write tests** for new features
4. **Ensure all tests pass**: `npm test && npm run test:e2e`
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Development Guidelines

- Write tests for new features
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Ensure mobile responsiveness
- Add JSDoc comments for complex logic
- Keep components small and focused

## Roadmap

Potential future features:

- [ ] Puzzle difficulty ratings and filtering
- [ ] Save and share custom puzzles
- [ ] Leaderboards and achievements
- [ ] Puzzle collections and themes
- [ ] Color nonograms (multi-color puzzles)
- [ ] Puzzle editor for manual creation
- [ ] Social features (share results, compete)
- [ ] Undo/redo functionality

## License

MIT License

Copyright (c) 2026 Alessio Caprari

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Acknowledgments

- **[Anthropic Claude AI](https://www.anthropic.com/)** - Powers the intelligent puzzle generation
- **[Nonograms.org](https://www.nonograms.org/)** - Inspiration for game mechanics
- **React Team** - For the excellent React framework
- **Vite Team** - For the blazingly fast build tool
- **Tailwind CSS** - For the utility-first CSS framework

Built with care by [Alessio Caprari](https://github.com/acaprari)

---

**Enjoy solving puzzles!** If you encounter any issues or have suggestions, please [open an issue](https://github.com/acaprari/nonogen/issues).
