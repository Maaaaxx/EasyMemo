module.exports = {
    entry: './app.js',
    output: {
      filename: 'bundle.js'
    },
    resolve: {
      alias: {
        'vue$': 'vue/dist/vue.esm.js' // 用 webpack 1 时需用 'vue/dist/vue.common.js'
      }
    }
  };