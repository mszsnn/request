const { configure } = require('sensors-jest');

module.exports = configure({
  setup: false,
  includes: ['src/**/*{js,ts}'],
  excludes: ['src/utils/'],
  reporter: {
    debug: true, // debug 模式不上报
    coverageIcon: true, // 生成覆盖率 svg icon
  },
}, {
  setupFilesAfterEnv: ['./jest.setup.js'],
});
