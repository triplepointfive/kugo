module.exports = {
  roots: ["<rootDir>/test"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  // "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
  testRegex: "integration",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  collectCoverageFrom: ["src/**/*.{ts,js}"],
};
