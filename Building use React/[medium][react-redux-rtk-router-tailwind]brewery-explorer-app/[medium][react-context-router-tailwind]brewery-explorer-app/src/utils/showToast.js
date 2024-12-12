/**
 * @fileoverview Модуль для отображения уведомлений с использованием библиотеки react-hot-toast.
 * @module showToast
 */

import toast from 'react-hot-toast';

/**
 * Функция для отображения уведомления.
 *
 * @function
 * @param {string} message - Текст уведомления.
 * @param {('success'|'error'|'loading')} type - Тип уведомления.
 * @throws {Error} Выбрасывает ошибку, если тип уведомления не поддерживается.
 * 
 * @example
 * showToast('Операция выполнена успешно', 'success');
 * showToast('Произошла ошибка', 'error');
 */
const showToast = (message, type) => {
  if (!['success', 'error', 'loading'].includes(type)) {
    throw new Error(`Unsupported notification type: ${type}`);
  }

  toast[type](message, {
    duration: 3000,
    position: 'top-right',
  });
};

export default showToast;