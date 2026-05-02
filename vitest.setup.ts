import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock implementation of scrollIntoView as it's not supported in jsdom
Element.prototype.scrollIntoView = vi.fn()
