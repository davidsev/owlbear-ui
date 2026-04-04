import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import postcssLib from 'postcss';
import postcssImport from 'postcss-import';
import postcssNesting from 'postcss-nesting';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import serve from 'rollup-plugin-serve';

const watching = process.env.ROLLUP_WATCH === 'true';

function postcss(plugins) {
  const processor = postcssLib(plugins);
  return {
    name: 'postcss',
    async transform(code, id) {
      if (!id.endsWith('.css')) return null;
      const result = await processor.process(code, {
        from: id,
        to: id,
        map: { inline: false, annotation: false },
      });
      return {
        code: `export default ${JSON.stringify(result.css)};`,
        map: result.map?.toJSON() ?? { mappings: '' },
      };
    },
  };
}

export default {
  input: {
    index: 'src/index.ts',
    'color-picker': 'src/color-picker.ts',
  },
  output: {
    dir: 'dist',
    format: 'es',
    sourcemap: true,
    preserveModules: true,
    preserveModulesRoot: 'src',
    entryFileNames: '[name].js',
  },
  external: [
    'lit',
    /^@lit\//,
    /^lit\//,
    /^@owlbear-rodeo\/sdk/,
    'vanilla-colorful',
    /^vanilla-colorful\//,
    'tslib',
    /^tslib\//,
  ],
  plugins: [
    postcss([
      postcssImport(),
      postcssNesting(),
      autoprefixer(),
      ...watching ? [] : [cssnano()],
    ]),
    resolve(),
    typescript({
      tsconfig: './tsconfig.json',
    }),
    watching &&
      serve({
        open: false,
        contentBase: '.',
        port: 3000,
      }),
  ].filter(Boolean),
};
