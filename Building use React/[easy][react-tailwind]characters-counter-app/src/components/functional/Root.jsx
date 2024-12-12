import { useCallback, useEffect, useState } from 'react';
import { debounce } from 'lodash';
import { Textarea } from '@ui';

/**
 * @typedef {Object} Stats
 * @property {string} text - Введенный текст
 * @property {number} chars - Количество символов
 * @property {number} words - Количество слов
 * @property {number} spaces - Количество пробелов
 * @property {number} letters - Количество букв
 */

/**
 * Корневой компонент для подсчета статистики текста
 * @returns {JSX.Element} Возвращает JSX разметку компонента
 */
const Root = () => {
  // Состояние для хранения статистики текста
  const [stats, setStats] = useState({
    text: '',
    chars: 0,
    words: 0,
    spaces: 0,
    letters: 0,
  });
  // Состояние для хранения введенного текста
  const [inputText, setInputText] = useState('');

  /**
   * Обновляет статистику на основе введенного текста
   * @param {string} text - Введенный текст
   */
  const updateStats = useCallback((text) => {
    const chars = text.length;
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const spaces = (text.match(/\s/g) || []).length;
    const letters = (text.match(/\p{L}/gu) || []).length;
    setStats({ text, chars, words, spaces, letters });
  }, []);

  // Создание отложенной версии функции обновления статистики
  const debouncedUpdateStats = useCallback(
    debounce(updateStats, 300),
    [updateStats],
  );

  // Эффект для обновления статистики при изменении введенного текста
  useEffect(() => {
    if (inputText !== '') {
      debouncedUpdateStats(inputText);
    }
  }, [inputText, debouncedUpdateStats]);

  /**
   * Обработчик изменения текста в textarea
   * @param {React.ChangeEvent<HTMLTextAreaElement>} e - Событие изменения
   */
  const handleTextareaChange = useCallback((e) => {
    setInputText(e.target.value);
  }, []);

  return (
    <div className="bg-white border-2 shadow rounded max-w-md w-full p-3 grid gap-3">
      <h1 className="text-center font-bold text-2xl">Characters Counter</h1>
      <Textarea placeholder="Enter some text below" onChange={handleTextareaChange} value={inputText} />
      <div className="grid grid-cols-4">
        {/* Отображение статистики */}
        {Object.entries(stats).slice(1).map(([key, value]) => (
          <p className="border flex justify-center items-center p-2 gap-1" key={key}>
            {key.charAt(0).toUpperCase() + key.slice(1)}: <span className="font-bold">{value}</span>
          </p>
        ))}
      </div>
    </div>
  );
};

export default Root;
