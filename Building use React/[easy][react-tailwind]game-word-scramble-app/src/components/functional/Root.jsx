/**
 * @fileoverview Компонент игры "Словесная путаница" (Word Scramble Game)
 *
 * Этот компонент реализует игру, в которой пользователь должен угадать слово
 * на основе перемешанных букв и подсказки. Игра включает в себя таймер,
 * возможность обновления слова и проверки введенного ответа.
 */

import { wordScrambleItems } from '../../mock/mock.js'
import { Toaster } from 'react-hot-toast';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { showToast } from '@utils';
import { Button } from '@ui';

/**
 * Объект с константами для игры
 * @typedef {Object} GameConstants
 * @property {number} MAX_TIME_LEFT - Максимальное время на угадывание слова в секундах
 * @property {Function} getSelectedWord - Функция для получения случайного слова из списка
 */
const CONSTANTS = {
  MAX_TIME_LEFT: 30,
  getSelectedWord: () => {
    const { hint, word } = wordScrambleItems[Math.floor(Math.random() * wordScrambleItems.length)];
    return {
      shuffleWord: word.split('').sort(() => Math.random() - 0.5).join(''),
      hint,
      word: word.toLowerCase(),
      maxLength: word.length,
    };
  },
};

/**
 * Основной компонент игры "Словесная путаница"
 * @returns {JSX.Element} Возвращает JSX элемент, представляющий интерфейс игры
 */
const Root = () => {
  // Оставшееся время в секундах и функция для его обновления
  const [timeLeft, setTimeLeft] = useState(CONSTANTS.MAX_TIME_LEFT);
  // Выбранное слово с сопутствующей информацией и функция для его обновления
  const [selectedWord, setSelectedWord] = useState(CONSTANTS.getSelectedWord);
  // Флаг завершения игры и функция для его изменения
  const [isFinished, setIsFinished] = useState(false);
  // Текст, введенный пользователем, и функция для его обновления
  const [inputText, setInputText] = useState('');
  // Флаг для принудительного перезапуска эффектов и функция для его изменения
  const [restartFlag, setRestartFlag] = useState(0);
  // Флаг работы таймера и функция для его изменения
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  // Флаг, указывающий на рендеринг на стороне клиента, и функция для его изменения
  const [isClient, setIsClient] = useState(false);
  // Ссылка на элемент ввода для управления фокусом
  const inputRef = useRef(null);

  /**
   * @function clientRenderingEffect
   * Эффект для установки флага клиентского рендеринга.
   * @description Этот эффект выполняется один раз при монтировании компонента и
   * устанавливает флаг isClient в true, что указывает на завершение начального
   * рендеринга на стороне клиента. Это помогает избежать проблем с гидратацией
   * и несоответствием серверного и клиентского рендеринга.
   */
  useEffect(() => {
    setIsClient(true);
  }, []);

  /**
   * @function handleTimeExpired
   * Обработчик истечения времени игры.
   * @description Эта функция вызывается, когда время игры истекает. Она выполняет следующие действия:
   * 1. Показывает уведомление с правильным словом, используя функцию showToast.
   * 2. Устанавливает флаг завершения игры (isFinished) в true.
   * 3. Останавливает таймер, устанавливая isTimerRunning в false.
   */
  const handleTimeExpired = useCallback(() => {
    showToast(`Time off! ${selectedWord.word.toUpperCase()} was the correct word`, 'error');
    setIsFinished(true);
    setIsTimerRunning(false);
  }, [selectedWord.word]);

  /**
   * @function timeExpirationEffect
   * Эффект для отслеживания истечения времени игры.
   * @description Этот эффект следит за оставшимся временем и статусом таймера.
   * Когда время истекает (timeLeft === 0) и таймер все еще работает (isTimerRunning === true),
   * вызывается функция handleTimeExpired для завершения игры.
   */
  useEffect(() => {
    if (timeLeft === 0 && isTimerRunning) handleTimeExpired();
  }, [timeLeft, isTimerRunning, handleTimeExpired]);

  /**
   * @function timerEffect
   * Эффект для управления таймером игры.
   * @description Этот эффект отвечает за управление таймером игры. Он создает и очищает
   * интервал, который уменьшает оставшееся время каждую секунду, пока игра активна.
   */
  useEffect(() => {
    let interval;
    if (isTimerRunning && !isFinished) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [restartFlag, isTimerRunning, isFinished]);

  /**
   * @function handleRefreshClick
   * Обработчик нажатия кнопки обновления игры.
   * @description Эта функция вызывается при нажатии на кнопку обновления игры.
   * Она выполняет следующие действия:
   * 1. Выбирает новое случайное слово для игры.
   * 2. Очищает поле ввода.
   * 3. Сбрасывает таймер до начального значения.
   * 4. Сбрасывает флаг завершения игры.
   * 5. Инкрементирует флаг перезапуска для триггера эффектов.
   * 6. Запускает таймер игры.
   */
  const handleRefreshClick = useCallback(() => {
    setSelectedWord(CONSTANTS.getSelectedWord());
    setInputText('');
    setTimeLeft(CONSTANTS.MAX_TIME_LEFT);
    setIsFinished(false);
    setRestartFlag(prevKey => prevKey + 1);
    setIsTimerRunning(true);
  }, []);

  /**
   * @function handleCheckWordClick
   * Обработчик проверки введенного слова.
   * @description Эта функция вызывается при нажатии на кнопку проверки слова.
   * Она выполняет следующие действия:
   * 1. Очищает и приводит к нижнему регистру введенное пользователем слово.
   * 2. Проверяет, не пустое ли введенное слово.
   * 3. Сравнивает введенное слово с правильным словом.
   * 4. Отображает соответствующее уведомление (ошибка или успех).
   * 5. В случае успеха останавливает таймер и завершает игру.
   */
  const handleCheckWordClick = useCallback(() => {
    const term = inputText.trim().toLowerCase();
    if (!term) {
      showToast('Please enter a valid word', 'error');
      return;
    }
    if (term !== selectedWord.word) {
      showToast(`Oops! ${term.toUpperCase()} is not a correct word`, 'error');
      return;
    }
    showToast(`Congrats! The correct word is: ${selectedWord.word.toUpperCase()}`, 'success');
    setIsTimerRunning(false);
    setIsFinished(true);
  }, [inputText, selectedWord.word]);

  const memoizedContent = useMemo(() => (
    <div className="grid gap-4 max-w-md w-full rounded border bg-white p-3 shadow">
      <h1 className="text-center text-2xl font-bold md:text-4xl">Word Scramble Game</h1>
      <div className="grid gap-3">
        <div className="grid gap-3">
          <p className="font-medium">
            Hint: <span className="rounded bg-gray-200 p-1 font-normal">{selectedWord.hint}</span>
          </p>
          <p className="font-medium">
            Time Left: <span className="rounded bg-gray-200 p-1 font-normal">{timeLeft}s</span>
          </p>
        </div>
        <input
          className="w-full rounded border bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none"
          type="text"
          spellCheck="false"
          placeholder="Enter a valid word"
          maxLength={selectedWord.maxLength}
          value={inputText}
          onChange={(e) => setInputText(e.target.value.toLowerCase())}
          ref={inputRef}
          disabled={isFinished}
        />
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={handleRefreshClick} aria-label="Refresh Word">
            Refresh Word
          </Button>

          <Button onClick={handleCheckWordClick} disabled={isFinished} ariaLabel="Check Word">
            Check Word
          </Button>
        </div>
      </div>
      <Toaster />
    </div>
  ), [timeLeft, selectedWord, inputText, isFinished, handleRefreshClick, handleCheckWordClick]);

  return !isClient ? <div>Loading...</div> : memoizedContent;
};

export default Root;
