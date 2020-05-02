const config = {
  preset: 'ts-jest',
  testMatch: [
    "<rootDir>/test/**/*.(test|spec).ts",
    "<rootDir>/integration/**/*.(test|spec).ts"
  ]
};

module.exports = config;
