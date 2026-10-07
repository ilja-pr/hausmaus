import nextJest from 'next/jest.js';

// Tests laufen mit Jest über Nexts eigenen SWC-Transformer (kein zusätzlicher Bundler).
const createJestConfig = nextJest({ dir: './' });

export default createJestConfig({
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.test.ts'],
});
