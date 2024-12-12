import { useCallback, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Button, Loader } from '@ui';
import axios from 'axios';
import { showToast } from '@utils';
import { ColorResult } from '@functional';

// Начальное значение цвета
const INITIAL_COLOR = '#1e88e5';

/**
 * Корневой компонент приложения Color Finder.
 * Позволяет пользователю выбрать цвет и получить информацию о нем.
 * @returns {JSX.Element} Корневой компонент приложения
 */
const Root = () => {
  // Состояние для хранения текущего выбранного цвета
  const [color, setColor] = useState(INITIAL_COLOR);
  // Состояние для отслеживания процесса загрузки
  const [isLoading, setIsLoading] = useState(false);
  // Состояние для хранения результата запроса информации о цвете
  const [result, setResult] = useState(null);

  /**
   * Обработчик изменения цвета.
   * Обновляет значение цвета и сбрасывает результат предыдущего запроса.
   * @param {string} newColor - Новое значение цвета
   */
  const handleColorChange = useCallback((newColor) => {
    setColor(newColor);
    setResult(null);
  }, []);

  /**
   * Обработчик нажатия кнопки получения информации о цвете.
   * Отправляет запрос к API и обновляет состояние результата.
   */
  const handleGetColorClick = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(`https://api.color.pizza/v1/?values=${color.slice(1)}`);
      setResult(data.colors[0]);
    } catch (error) {
      console.error('An error occurred:', error);
      showToast('Error fetching color data', 'error');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [color]);

  return (
    <div className="grid gap-4 rounded border bg-white p-3 shadow max-w-xl w-full">
      <h1 className="text-center font-bold text-2xl">Color Finder</h1>
      <div className="grid gap-3">
        {/* Компонент выбора цвета */}
        <HexColorPicker className="!w-full" color={color} onChange={handleColorChange} />
        {/* Поле отображения текущего выбранного цвета */}
        <input
          className="w-full rounded border bg-slate-50 px-3 py-2 text-center font-bold focus:border-blue-400 focus:outline-none"
          type="text"
          disabled
          value={color}
        />
        {/* Кнопка для отправки запроса */}
        <Button onClick={handleGetColorClick}>Submit</Button>
        {/* Индикатор загрузки */}
        {isLoading && <Loader />}
        {/* Компонент отображения результата */}
        {result && !isLoading && <ColorResult color={color} result={result} />}
      </div>
    </div>
  );
};

export default Root;
