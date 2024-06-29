/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/feedback.test.ts"],
  testPathIgnorePatterns: ["/node_modules/"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  verbose: true,
  forceExit: true,
  clearMocks: true,
};
