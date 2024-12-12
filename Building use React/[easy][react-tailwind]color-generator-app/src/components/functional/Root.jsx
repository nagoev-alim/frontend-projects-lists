/**
 * @module ColorGenerator
 * @description Модуль, предоставляющий компонент для генерации и копирования случайных цветов.
 */

import { useCallback, useEffect, useState } from 'react';
import { copyToClipboard } from '@utils';

const INITIAL_COLOR = '#A1B5C1';
const HEX_CHARS = '0123456789ABCDEF';

/**
 * @function Root
 * @description Основной компонент генератора цветов.
 * @returns {JSX.Element} Возвращает JSX элемент, представляющий интерфейс генератора цветов.
 */
const Root = () => {
  /**
   * @description Состояние для хранения текущего цвета
   */
  const [color, setColor] = useState(INITIAL_COLOR);

  /**
   * @description Генерирует случайный цвет в формате HEX
   * @returns {string} Строка, представляющая цвет в формате HEX (например, '#A1B5C1')
   */
  const generateRandomColor = useCallback(() => {
    // Создаем массив из 6 элементов и заполняем его случайными символами из HEX_CHARS
    return '#' + Array(6)
      .fill()
      .map(() => HEX_CHARS[Math.floor(Math.random() * HEX_CHARS.length)])
      .join('');
  }, []);

  /**
   * @description Обработчик для генерации нового цвета
   */
  const handleGenerateColor = useCallback(() => {
    setColor(generateRandomColor());
  }, [generateRandomColor]);

  /**
   * @description Эффект для добавления обработчика нажатия клавиши пробел
   */
  useEffect(() => {
    /**
     * @description Обработчик нажатия клавиши
     * @param {KeyboardEvent} event - Объект события клавиатуры
     */
    const handleKeyDown = (event) => {
      if (event.code === 'Space') {
        copyToClipboard(color);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [color]);

  return (
    <div className="color-generator grid w-full max-w-md gap-4 p-3">
      <h1 className="text-center text-2xl font-bold">Color Generator</h1>
      <div className="mx-auto grid max-w-max place-content-center gap-2 rounded border bg-white p-2 text-center shadow">
        <div className="h-[170px] w-[170px] border" style={{ backgroundColor: color }} />
        <p className="font-bold uppercase">{color}</p>
      </div>
      <div className="grid place-items-center gap-3">
        <button
          className="rounded bg-purple-500 px-3 py-2 font-medium text-white hover:bg-purple-400"
          onClick={handleGenerateColor}
        >
          Generate
        </button>
        <button
          className="rounded bg-green-500 px-3 py-2 font-medium text-white hover:bg-green-400"
          onClick={() => copyToClipboard(color)}
        >
          Copy to clipboard
        </button>
      </div>
      <p className="text-center">
        Or copy the color <span className="font-bold">"SPACE"</span> to your clipboard.
      </p>
    </div>
  );
};

export default Root;
