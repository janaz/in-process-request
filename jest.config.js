const config = {
  preset: 'ts-jest',
  testMatch: [
    "<rootDir>/test/**/*.(test|spec).ts",
    "<rootDir>/integration/**/*.(test|spec).ts"
  ]
};

if (process.version.startsWith('v10.')) {
  // disable Hapi integration in node 10
  config.testPathIgnorePatterns = [
    "/node_modules/", "/integration-hapi/"
  ];
}

module.exports = config;
