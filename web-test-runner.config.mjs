import { esbuildPlugin } from '@web/dev-server-esbuild';

export default {
  files: 'test/**/*.test.ts',
  nodeResolve: true,
  // Tests run against Lit's dev build (web-test-runner defaults exportConditions
  // to ['development']), which keeps useful runtime warnings. Pre-seed the
  // dev-mode warning code before Lit loads to mute only the noisy banner.
  testRunnerHtml: (testFramework) => `
    <html>
      <body>
        <script>globalThis.litIssuedWarnings = new Set(['dev-mode']);</script>
        <script type="module" src="${testFramework}"></script>
      </body>
    </html>
  `,
  plugins: [
    esbuildPlugin({ ts: true, target: 'es2021' }),
  ],
};
