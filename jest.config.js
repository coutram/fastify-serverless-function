export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest', // If you're using Babel
  },
  moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx', 'node'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
};