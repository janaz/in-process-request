const config = {
  preset: 'ts-jest',
  testMatch: [
    "<rootDir>/test/**/*.(test|spec).ts",
    "<rootDir>/integration/**/*.(test|spec).ts"
  ]
};

if (process.env.NODE_6 === 'yes') {
  // disable Koa integration in node 6
  config.testPathIgnorePatterns = [
    "/node_modules/", "/integration-koa/"
  ];
}

module.exports = config;
