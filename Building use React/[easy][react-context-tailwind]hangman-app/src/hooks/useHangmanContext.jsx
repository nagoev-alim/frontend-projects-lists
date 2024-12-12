import { useContext } from 'react';
import { HangmanContext } from '../context/index';

/**
 * Пользовательский хук для доступа к контексту игры "Виселица"
 *
 * @function useHangmanContext
 * @returns {Object} Объект контекста игры "Виселица"
 * @throws {Error} Если хук используется вне провайдера HangmanProvider
 */
const useHangmanContext = () => {
  // Получаем контекст с помощью хука useContext
  const context = useContext(HangmanContext);

  // Проверяем, определен ли контекст
  if (context === undefined) {
    // Если контекст не определен, выбрасываем ошибку
    throw new Error('useHangmanContext must be used within an HangmanProvider');
  }

  // Возвращаем контекст
  return context;
};

export default useHangmanContext;
