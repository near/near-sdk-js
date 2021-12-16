import { nodeResolve } from '@rollup/plugin-node-resolve';
// import commonjs from '@rollup/plugin-commonjs';

export default {
    input: 'index.js',
    output: {
      file: 'build/project.js',
      format: 'es'
    },
    plugins: [
        nodeResolve(), 
        // commonjs(),
    ]
};