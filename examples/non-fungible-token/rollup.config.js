import { nodeResolve } from '@rollup/plugin-node-resolve';
import sourcemaps from 'rollup-plugin-sourcemaps';
import babel from '@rollup/plugin-babel';

// import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'index.js',
  output: {
    sourcemap: true,
    file: 'build/nft.js',
    format: 'es'
  },
  plugins: [
    nodeResolve(),
    sourcemaps(),
    // commonjs(),
    babel({ babelHelpers: "bundled" })
  ]
};