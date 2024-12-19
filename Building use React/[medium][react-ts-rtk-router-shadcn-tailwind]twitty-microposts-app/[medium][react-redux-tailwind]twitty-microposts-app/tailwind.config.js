/**
 * @file tailwind.config.js
 * @description Конфигурационный файл для Tailwind CSS.
 * @exports {Object} Объект конфигурации Tailwind CSS
 */

export default {
  /**
   * Указывает, где Tailwind должен искать классы для включения в финальный CSS.
   * @property {Array<string>} content - Массив путей к файлам, которые нужно сканировать.
   */
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],

  /**
   * Настройки темы Tailwind CSS.
   * @property {Object} theme - Объект с настройками темы.
   */
  theme: {
    /**
     * Расширение существующей темы Tailwind.
     * @property {Object} extend - Объект с дополнительными настройками.
     */
    extend: {
      /**
       * Настройки шрифтов.
       * @property {Object} fontFamily - Объект с настройками семейств шрифтов.
       */
      fontFamily: {
        /**
         * Устанавливает 'Poppins' как основной шрифт sans-serif.
         * @property {Array<string>} sans - Массив названий шрифтов для семейства sans-serif.
         */
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },

  /**
   * Массив плагинов Tailwind CSS.
   * @property {Array} plugins - Пустой массив, так как плагины не используются.
   */
  plugins: [],
};
