import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { textData } from '@mock';
import { showToast } from '@utils';
import { Button, Loader } from '@ui';

/**
 * Конфигурация приложения
 * @constant
 * @type {Object}
 */
const APP_CONFIG = {
  /** Массив с текстовыми данными для тестирования */
  MOCK_DATA: textData,
  /** Массив меток для отображения статистики */
  LABELS: [
    { label: 'Time Left', value: '60s', data: 'typing-time' },
    { label: 'Mistakes', value: 0, data: 'typing-mistake' },
    { label: 'WPM', value: 0, data: 'typing-wpm' },
    { label: 'CPM', value: 0, data: 'typing-cpm' },
  ],
  /** Конечная точка API для получения текста */
  API_ENDPOINT: 'https://fish-text.ru/get?format=json&type=sentence&number=4&self=true',
};

/**
 * Корневой компонент приложения для теста скорости печати
 * @returns {JSX.Element} Возвращает JSX элемент
 */
const Root = () => {
  // Состояния компонента
  const [text, setText] = useState(''); // Текст для набора
  const [timeLeft, setTimeLeft] = useState(60); // Оставшееся время
  const [charIndex, setCharIndex] = useState(0); // Индекс текущего символа
  const [mistakes, setMistakes] = useState(0); // Количество ошибок
  const [isTyping, setIsTyping] = useState(false); // Флаг начала набора
  const [wpm, setWpm] = useState(0); // Слов в минуту
  const [cpm, setCpm] = useState(0); // Символов в минуту

  // Ссылки
  const inputRef = useRef(null); // Ссылка на input элемент
  const timerRef = useRef(null); // Ссылка на таймер

  /**
   * Эффект для инициализации теста при монтировании компонента
   */
  useEffect(() => {
    initializeTypingTest();
    return () => clearInterval(timerRef.current);
  }, []);

  /**
   * Инициализирует тест набора текста
   */
  const initializeTypingTest = async () => {
    try {
      const typingText = await fetchTypingText();
      setText(typingText);
      setTimeLeft(60);
      setCharIndex(0);
      setMistakes(0);
      setIsTyping(false);
      setWpm(0);
      setCpm(0);
      if (inputRef.current) inputRef.current.value = '';
    } catch (error) {
      showToast('Failed to load paragraph', 'error');
    }
  };

  /**
   * Получает текст для набора из API или использует случайный текст из MOCK_DATA
   * @returns {Promise<string>} Текст для набора
   */
  const fetchTypingText = async () => {
    const randomMockText = APP_CONFIG.MOCK_DATA[Math.floor(Math.random() * APP_CONFIG.MOCK_DATA.length)];
    try {
      const { data: { status, text } } = await axios.get(APP_CONFIG.API_ENDPOINT);
      return status === 'success' ? text : randomMockText;
    } catch {
      return randomMockText;
    }
  };

  /**
   * Обрабатывает изменение ввода пользователя
   * @param {React.ChangeEvent<HTMLInputElement>} event - Событие изменения
   */
  const handleInputChange = (event) => {
    const value = event.target.value;
    if (!isTyping) {
      setIsTyping(true);
      timerRef.current = setInterval(initTimer, 1000);
    }

    if (charIndex < text.length && timeLeft > 0) {
      const typedChar = value[value.length - 1];
      processTypedCharacter(typedChar);
      updateStatistics();
    } else {
      clearInterval(timerRef.current);
    }
  };

  /**
   * Инициализирует таймер обратного отсчета
   */
  const initTimer = () => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        clearInterval(timerRef.current);
        return 0;
      }
      return prev - 1;
    });
  };

  /**
   * Обрабатывает введенный символ
   * @param {string} typedChar - Введенный символ
   */
  const processTypedCharacter = (typedChar) => {
    const isCorrect = text[charIndex] === typedChar;
    if (!isCorrect) setMistakes(prev => prev + 1);
    setCharIndex(prev => prev + 1);
  };

  /**
   * Обновляет статистику теста
   */
  const updateStatistics = () => {
    setCpm(charIndex - mistakes);
    const minutes = (60 - timeLeft) / 60;
    if (minutes > 0) {
      const wordsTyped = (charIndex - mistakes) / 5;
      setWpm(Math.round(wordsTyped / minutes));
    }
  };

  /**
   * Обработчик нажатия кнопки сброса
   */
  const handleResetClick = () => {
    clearInterval(timerRef.current);
    initializeTypingTest();
  };

  return (
    <div className="grid gap-4 max-w-xl w-full rounded border bg-white p-3 shadow">
      <h1 className="text-center font-bold text-2xl md:text-3xl">Typing Speed Test</h1>
      <input
        ref={inputRef}
        className="visually-hidden"
        type="text"
        onChange={handleInputChange}
        autoFocus
      />
      {text.length === 0 && (<Loader />)}
      <p className="rounded border p-1 tracking-widest">
        {text.split('').map((char, idx) => (
          <span
            key={idx}
            className={`${idx === charIndex ? 'active border-b-2 border-orange-500 text-orange-500' : ''}
                        ${idx < charIndex ? (text[idx] === inputRef.current?.value[idx] ? 'text-green-500' : 'text-red-500') : ''}`}
          >
            {char}
          </span>
        ))}
      </p>
      <ul className="grid grid-cols-4 gap-2">
        {APP_CONFIG.LABELS.map(({ label, data }) => (
          <li key={data} className="grid gap-1.5">
            <p className="font-medium">{label}:</p>
            <span className="rounded bg-gray-200 p-1">
              {data === 'typing-time' ? timeLeft :
                data === 'typing-mistake' ? mistakes :
                  data === 'typing-wpm' ? wpm :
                    data === 'typing-cpm' ? cpm : 0}
            </span>
          </li>
        ))}
      </ul>
      <Button onClick={handleResetClick}>Try Again</Button>
    </div>
  );
};

export default Root;
