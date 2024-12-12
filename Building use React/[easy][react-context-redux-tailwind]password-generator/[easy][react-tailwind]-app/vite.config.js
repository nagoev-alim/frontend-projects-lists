import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@ui': path.resolve(__dirname, 'src/components/ui'),
      '@functional': path.resolve(__dirname, 'src/components/functional'),
      '@utils': path.resolve(__dirname, 'src/utils'),
    },
  },
});
