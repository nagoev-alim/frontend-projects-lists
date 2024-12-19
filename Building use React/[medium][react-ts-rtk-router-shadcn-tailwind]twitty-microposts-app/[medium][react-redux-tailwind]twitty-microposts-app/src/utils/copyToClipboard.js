import { showToast } from '.';

/**
 * Копирует переданный текст в буфер обмена
 * @async
 * @param {string} textToCopy - Текст для копирования в буфер обмена
 * @throws {Error} Выбрасывает ошибку, если копирование не удалось
 * @returns {Promise<void>}
 */
const copyToClipboard = async (textToCopy) => {
  // Проверка на пустую строку или отсутствие текста
  if (!textToCopy || textToCopy.length === 0) {
    console.warn('Trying to copy an empty string');
    return;
  }

  try {
    // Попытка копирования текста в буфер обмена
    await navigator.clipboard.writeText(textToCopy);
    // Отображение уведомления об успешном копировании
    showToast('Successfully copied to clipboard', 'success');
  } catch (error) {
    // Логирование ошибки в консоль
    console.error('Error when copying to clipboard:', error);
    // Отображение уведомления об ошибке
    showToast('Error when copying to clipboard', 'error');
  }
};

export default copyToClipboard;
