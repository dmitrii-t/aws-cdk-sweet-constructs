import path from 'path';
import webpack from 'webpack';
// import nodeExternals from 'webpack-node-externals';

const paths = {
  nodeModules: path.resolve(__dirname, 'node_modules'),
  dist: path.resolve(__dirname, 'dist')
};

function config(entry: string, output: string, isDevelopment: boolean = true, overrides: webpack.Configuration = {}): webpack.Configuration {
  return {
    mode: isDevelopment ? 'development' : 'production',
    target: 'node',
    entry: ['@babel/polyfill', entry],
    output: {
      path: paths.dist,
      filename: output,
      publicPath: '',
      ...overrides.output
    },
    resolve: {
      extensions: ['.js', '.ts'],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loaders: ['babel-loader'],
          exclude: [paths.nodeModules],
        },
      ],
    },
    devtool: isDevelopment ? 'inline-source-map' : false,
    // https://github.com/webpack/docs/wiki/webpack-dev-server
    // devServer: {},
    plugins: [
      // new WebpackManifestPlugin(),
      // new BundleAnalyzerPlugin(),
    ],
    externals: overrides.externals || undefined
  };
}

const isDevelopment = process.env.NODE_ENV !== 'production';

// Declares lambda bundle
// SHOULD BE IN A DIR FOR AWS CDK TO PACKAGE
const bundle = config('./src/bundle', 'bundle/index.js', isDevelopment, {
  output: {
    libraryTarget: 'commonjs2'
  }
});

export default [
  bundle
];
