module.exports = {
  testEnvironment: 'jsdom',
  // setupFilesAfterEnv: ['<rootDir>/star-frontend/jest.setup.ts'],
  globals: {
    'babel-jest': {
      babelrc: false,
      configFile: '<rootDir>/star-frontend/babel.config.js'
    }
  },
  moduleNameMapper: {
    '\\.(css|less|scss)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/star-frontend/src/$1',
    '^canvas$': '<rootDir>/test/mocks/canvas-mock.js',
  },
  collectCoverageFrom: [
    'star-frontend/src/**/*.{ts,tsx}',
    '!star-frontend/src/**/*.d.ts',
  ],
  testMatch: [
    '<rootDir>/star-frontend/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/star-frontend/src/**/*.{test,spec}.{ts,tsx}',
    '<rootDir>/test/**/*.{test,spec}.{ts,tsx}',
  ],
  transformIgnorePatterns: [
    '/node_modules/(?!react-konva|konva)',
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
    '^.+\\.setup\\.(js|ts)$': 'babel-jest',
  },
};
