// jest.config.js
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  // Specify the file extensions Jest should process
  moduleFileExtensions: ['ts', 'js'],
  // Pattern to find test files
  testMatch: ['**/tests/**/*.test.ts'],
  // Transform settings
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
};
