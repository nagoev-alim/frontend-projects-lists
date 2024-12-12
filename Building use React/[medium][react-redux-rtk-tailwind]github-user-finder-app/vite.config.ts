import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  // Подключаем плагин React
  plugins: [react()],
  resolve: {
    // Настраиваем алиасы для упрощения импортов
    alias: {
      "@": path.resolve(__dirname, "src"),
      '@components': path.resolve(__dirname, 'src/components'),
      '@components/ui': path.resolve(__dirname, 'src/components/ui'),
      '@components/layout': path.resolve(__dirname, 'src/components/layout'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@helpers': path.resolve(__dirname, 'src/helpers'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
    },
  },
});
