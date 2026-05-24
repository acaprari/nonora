import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock as any

// Mock Anthropic API
vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn(() => ({
    messages: {
      create: vi.fn(),
    },
  })),
}))
