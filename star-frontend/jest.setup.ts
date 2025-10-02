import '@testing-library/jest-dom';
import fetchMock from 'jest-fetch-mock';

// Enable fetch mocking
fetchMock.enableMocks();

// Mock Konva Stage for canvas testing
jest.mock('konva', () => ({
  Stage: jest.fn().mockImplementation(() => ({
    toDataURL: jest.fn().mockReturnValue('data:image/png;base64,mock_image_data'),
  })),
}));

// Mock navigator clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve()),
  },
});

// Mock HTMLAnchorElement click
Object.defineProperty(HTMLAnchorElement.prototype, 'click', {
  writable: true,
  value: jest.fn(),
});

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-object-url');
global.URL.revokeObjectURL = jest.fn();

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
}));

// Mock window.alert in jsdom environment to avoid 'Not implemented: window.alert' errors
if (typeof window !== 'undefined') {
  // Replace any existing alert (jsdom's placeholder throws) with a no-op jest mock
  // so tests can call alert without causing an exception.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.alert = jest.fn();
}

// Suppress specific console.error messages that are expected in jsdom/test env
const originalError = console.error;
console.error = (...args: any[]) => {
  if (typeof args[0] === 'string') {
    const msg: string = args[0];
    if (
      msg.includes('Not implemented: window.alert') ||
      msg.includes('not wrapped in act(') ||
      msg.includes('Function components cannot be given refs')
    ) {
      return;
    }
  }
  originalError.call(console, ...args);
};

// Suppress console warnings during tests
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render is deprecated') ||
     args[0].includes('Warning: ReactDOMTestUtils has been moved'))
  ) {
    return;
  }
  originalWarn.call(console, ...args);
};
