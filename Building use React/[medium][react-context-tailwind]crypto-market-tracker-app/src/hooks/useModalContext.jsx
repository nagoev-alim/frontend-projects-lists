/**
 * @module useModalContext
 * @description Модуль, содержащий пользовательский хук для доступа к контексту модальных окон.
 */

import { useContext } from 'react';
import { ModalContext } from '../context/index.js';

/**
 * @function useModalContext
 * @description Пользовательский хук для получения доступа к контексту модальных окон.
 * 
 * @throws {Error} Выбрасывает ошибку, если хук используется вне провайдера ModalProvider.
 * 
 * @returns {Object} Объект контекста модальных окон.
 * @property {boolean} isOpen - Флаг, указывающий, открыто ли модальное окно.
 * @property {function} openModal - Функция для открытия модального окна.
 * @property {function} closeModal - Функция для закрытия модального окна.
 * @property {React.ReactNode} modalContent - Содержимое модального окна.
 *
 * @description
 * Этот хук использует useContext для получения данных из ModalContext.
 * Он также проверяет, используется ли хук внутри соответствующего провайдера контекста.
 * 
 * Оптимизация производительности:
 * - Использование useContext позволяет избежать излишней передачи пропсов через компоненты.
 * - Проверка на undefined помогает быстро выявить ошибки в структуре приложения.
 * - Централизованное управление состоянием модальных окон позволяет избежать ненужных ререндеров.
 */
const useModalContext = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('ModalContext must be used within an ModalProvider');
  }
  return context;
};

export default useModalContext;
