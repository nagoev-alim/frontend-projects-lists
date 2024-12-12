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
      '@ui': path.resolve(__dirname, 'src/components/ui'),
      '@functional': path.resolve(__dirname, 'src/components/functional'),
      '@layout': path.resolve(__dirname, 'src/components/layout'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@context': path.resolve(__dirname, 'src/context'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@redux': path.resolve(__dirname, 'src/redux'),
      '@features': path.resolve(__dirname, 'src/features'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@mock': path.resolve(__dirname, 'src/mock'),
      '@store': path.resolve(__dirname, 'src/store'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@routes': path.resolve(__dirname, 'src/routes.jsx'),
    },
  },
});
