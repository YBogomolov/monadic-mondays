module.exports = {
  automock: false,
  cacheDirectory: './.cache/jest',
  testEnvironment: 'jsdom',
  preset: "ts-jest",
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json",
    "node",
  ],
};
