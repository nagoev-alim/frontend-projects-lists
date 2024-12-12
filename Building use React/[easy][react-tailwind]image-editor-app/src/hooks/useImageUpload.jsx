import { useCallback, useRef, useState } from 'react';

/**
 * Хук для управления загрузкой изображения.
 * @returns {Object} Объект с состоянием и методами для управления загрузкой изображения.
 * @property {string|null} image - URL данных загруженного изображения или null, если изображение не загружено.
 * @property {React.RefObject} inputRef - Ссылка на input элемент для загрузки файла.
 * @property {Function} handleImageClick - Функция для программного клика по input элементу.
 * @property {Function} handleImageChange - Функция обработки изменения input элемента (загрузки файла).
 */
const useImageUpload = () => {
  // Состояние для хранения URL данных загруженного изображения
  const [image, setImage] = useState(null);
  // Реф для доступа к input элементу
  const inputRef = useRef(null);

  /**
   * Обработчик клика по области загрузки изображения.
   * Программно вызывает клик по скрытому input элементу.
   */
  const handleImageClick = useCallback(() => {
    inputRef.current.click();
  }, []);

  /**
   * Обработчик изменения input элемента (загрузки файла).
   * @param {Event} event - Событие изменения input элемента.
   */
  const handleImageChange = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target.result);
    reader.readAsDataURL(file);
  }, []);

  return { image, inputRef, handleImageClick, handleImageChange };
};

export default useImageUpload;
