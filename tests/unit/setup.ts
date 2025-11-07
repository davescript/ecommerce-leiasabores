import { expect, afterEach, vi, beforeEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock localStorage - Must be defined before any imports that use it
let localStorageStore: Record<string, string> = {}

const localStorageMock = {
  getItem: (key: string): string | null => {
    return localStorageStore[key] || null
  },
  setItem: (key: string, value: string): void => {
    localStorageStore[key] = String(value)
  },
  removeItem: (key: string): void => {
    delete localStorageStore[key]
  },
  clear: (): void => {
    localStorageStore = {}
  },
  get length(): number {
    return Object.keys(localStorageStore).length
  },
  key: (index: number): string | null => {
    const keys = Object.keys(localStorageStore)
    return keys[index] || null
  },
}

// Define localStorage on window and global BEFORE any tests run
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
    configurable: true,
  })
}

if (typeof global !== 'undefined') {
  Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
    writable: true,
    configurable: true,
  })
}

beforeEach(() => {
  // Clear store before each test
  localStorageStore = {}
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
interface IntersectionObserverConstructor {
  new (callback: IntersectionObserverCallback, options?: IntersectionObserverInit): IntersectionObserver
}

global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
} as unknown as IntersectionObserverConstructor

