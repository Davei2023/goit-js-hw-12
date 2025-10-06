import { defineConfig } from 'vite';
import { resolve } from 'path';
import glob from 'fast-glob';
import injectHTML from 'vite-plugin-html-inject';
import FullReload from 'vite-plugin-full-reload';

const htmlEntries = Object.fromEntries(
  glob.sync('src/*.html').map(p => [
    p.replace(/^src\/|\.html$/g, ''),
    resolve(__dirname, p),
  ])
);

export default defineConfig({
  root: 'src',
  define: {

    global: 'globalThis',
  },
  build: {
    sourcemap: true,
    outDir: '../dist',
    rollupOptions: {
      input: htmlEntries,
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) return 'vendor';
        },
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  plugins: [
    injectHTML(),
    FullReload(['src/**/*.html']),
  ],
});