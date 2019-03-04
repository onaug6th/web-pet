const path = require('path')

module.exports = {
    verbose: true,
    collectCoverage: true,
    globals: {
        NODE_ENV: 'test',
    },
    testEnvironment: "jsdom",
    rootDir: path.resolve(__dirname, '../'),
    moduleFileExtensions: [
        "ts",
        "js"
    ],
    transform: {
        '^.+\\.js$': '<rootDir>/node_modules/babel-jest',
        '.*\\.(ts)$': '<rootDir>/node_modules/ts-jest/preprocessor.js',
        '^.+\\.(scss)$': "<rootDir>/node_modules/jest-css-modules-transform"
    },
    setupFiles: ["jest-localstorage-mock"]
};
