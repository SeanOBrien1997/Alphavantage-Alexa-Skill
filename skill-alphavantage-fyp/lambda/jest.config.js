/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/test/**/.ts',
    '!src/**/*test.ts',
    '!src/model/*.ts',
    '!src/test/mocks/*.ts',
    '!src/model/alphavantage/api/*.ts',
  ],
};
