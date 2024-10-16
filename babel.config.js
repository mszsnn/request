function resolve(moduleName) {
  return require.resolve(moduleName);
}

module.exports = {
  presets: [
    resolve('@babel/preset-react'),
    resolve('@babel/preset-typescript'),
    [
      resolve('@babel/preset-env'),
      {
        targets: {
          browsers: [
            'last 2 versions',
            'Firefox ESR',
            '> 1%',
            'ie >= 9',
            'iOS >= 8',
            'Android >= 4'
          ],
          node: 'current'
        }
      }
    ]
  ],
  plugins: [
    ['@babel/plugin-transform-runtime'],
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-private-methods', { loose: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    '@babel/plugin-proposal-export-default-from',
    ['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }],
    'lodash'
  ]
};
