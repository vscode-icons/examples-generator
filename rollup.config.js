import builtins from 'builtin-modules';
import { preserveShebangs } from 'rollup-plugin-preserve-shebangs';
import { terser } from 'rollup-plugin-terser';
import ts from '@rollup/plugin-typescript';
import typescript from 'typescript';
import pkg from './package.json';

export default [
  {
    input: 'src/cli.ts',
    output: [
      {
        dir: '.',
        entryFileNames: pkg.main,
        format: 'cjs',
      }
    ],
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
      ...builtins,
    ],
    plugins: [
      ts({
        typescript,
      }),
      preserveShebangs(),
      terser()
    ],
  }
]
