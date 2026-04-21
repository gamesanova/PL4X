import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';

export default defineConfig({
  base: './',

  server: {
    host: process.env.DEV_HOST || '0.0.0.0',
    port: process.env.DEV_PORT || 8080,
    public:
      process.env.VITE_URL_TEST ||
      '192.168.56.56:' + (process.env.DEV_PORT || 8080),
  },

  plugins: [
    checker({ typescript: true }),
  ],

  resolve: {
    alias: {
      '@': '/src',
      '@constants': '/src/constants',
      '@engine': '/src/engine',
      '@engine/models': '/src/engine/models',
      '@engine/initializers': '/src/engine/initializers',
      '@engine/managers': '/src/engine/managers',
      '@engine/maps': '/src/engine/maps',
      '@engine/phases': '/src/engine/phases',
      '@engine/systems': '/src/engine/systems',
      '@scenes': '/src/scenes',
      '@ui/components': '/src/ui/components',
      '@ui/ghosts': '/src/ui/ghosts',
      '@ui/objects': '/src/ui/objects',
      '@ui/systems': '/src/ui/systems',
      '@ui/views': '/src/ui/views',
      '@utils': '/src/utils',
    },
  },

  build: {
    // cssCodeSplit: false,
  },
});
