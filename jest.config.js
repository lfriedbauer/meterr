// jest.config.js - Optimized for AMD Ryzen 9 9950X (32 threads)
module.exports = {
  // Use all 32 CPU threads for maximum performance
  maxWorkers: 32,
  workerThreads: true,

  // Caching for faster subsequent runs
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',

  // Use V8 coverage for better performance
  coverageProvider: 'v8',

  // Reasonable timeout for tests
  testTimeout: 30000,

  // Test environment
  testEnvironment: 'node',

  // Module paths
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@meterr/(.*)$': '<rootDir>/packages/$1/src',
  },

  // Transform TypeScript files
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        isolatedModules: true,
        tsconfig: {
          incremental: true,
        },
      },
    ],
  },

  // Test match patterns
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
    '**/*.spec.ts',
    '**/*.spec.tsx',
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    'packages/*/src/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/dist/**',
    '!**/coverage/**',
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],

  // Ignore patterns
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/dist/', '/coverage/'],

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Verbose output for debugging
  verbose: process.env.CI === 'true',

  // Globals
  globals: {
    'ts-jest': {
      isolatedModules: true,
      tsconfig: {
        incremental: true,
      },
    },
  },
};
