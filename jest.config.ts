/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from 'jest';

const config: Config = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/', '/coverage/'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/coverage/'],
  coverageProvider: 'v8',
  testEnvironment: 'node',
};

export default config;
