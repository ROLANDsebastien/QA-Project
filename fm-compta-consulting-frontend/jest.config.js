module.exports = {
  testEnvironment: "jsdom",
  testEnvironmentOptions: {
    url: "https://example.com",
  },
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverage: true,
  coverageDirectory: "<rootDir>/coverage",
  coverageReporters: ["json", "lcov", "text", "clover"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/_app.tsx",
    "!src/**/_document.tsx",
    "!src/**/_error.tsx",
  ],
  transform: {
    "^.+\\.(ts|tsx)$": "babel-jest",
  },
};
