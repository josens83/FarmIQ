import '@testing-library/jest-dom';
import { vi, beforeEach, afterEach } from 'vitest';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
vi.stubGlobal('localStorage', localStorageMock);

// Mock requestAnimationFrame
vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
  return setTimeout(() => cb(performance.now()), 16);
});

vi.stubGlobal('cancelAnimationFrame', (id: number) => {
  clearTimeout(id);
});

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  localStorageMock.getItem.mockReturnValue(null);
});

// Cleanup after each test
afterEach(() => {
  vi.restoreAllMocks();
});

// Mock performance.now if needed
if (typeof performance === 'undefined') {
  vi.stubGlobal('performance', {
    now: vi.fn(() => Date.now()),
  });
}
