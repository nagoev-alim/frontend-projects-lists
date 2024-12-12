import { createContext } from 'react';

/**
 * @typedef {Object} HangmanContextType
 * @property {string} word - Текущее слово для угадывания
 * @property {string[]} correctLetters - Массив правильно угаданных букв
 * @property {string[]} wrongLetters - Массив неправильно угаданных букв
 * @property {boolean} playable - Флаг, указывающий, можно ли играть в данный момент
 * @property {function} handlePlayable - Функция для установки состояния игры (можно играть или нет)
 * @property {function} handleRestart - Функция для перезапуска игры
 */

/**
 * Контекст для игры "Виселица"
 * @type {React.Context<HangmanContextType|null>}
 */
const HangmanContext = createContext(null);

export default HangmanContext;
