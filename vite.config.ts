import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const page = (name: string) => fileURLToPath(new URL(name, import.meta.url));

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: page('./index.html'),
        functionPoints: page('./function-points.html'),
        cocomo: page('./cocomo.html')
      }
    }
  }
});
