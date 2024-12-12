import { useEffect, useState, useCallback } from 'react';

/**
 * Хук для изменения размеров изображения.
 * @param {string} image - URL или Data URL изображения.
 * @returns {Object} Объект с состоянием и методами для изменения размеров изображения.
 * @property {Object} dimensions - Объект с текущими размерами изображения.
 * @property {number} dimensions.width - Ширина изображения.
 * @property {number} dimensions.height - Высота изображения.
 * @property {Object} options - Объект с опциями изменения размера.
 * @property {boolean} options.lock - Флаг блокировки соотношения сторон.
 * @property {boolean} options.reduce - Флаг уменьшения качества.
 * @property {Function} handleInputChange - Функция обработки изменений ввода.
 */
const useImageResize = (image) => {
  // Состояние для хранения размеров изображения
  const [dimensions, setDimensions] = useState({ width: '', height: '' });
  // Состояние для хранения опций изменения размера
  const [options, setOptions] = useState({ lock: true, reduce: false });

  // Эффект для установки начальных размеров изображения
  useEffect(() => {
    if (image) {
      const img = new Image();
      img.src = image;
      img.onload = () => {
        setDimensions({ width: img.width, height: img.height });
      };
    }
  }, [image]);

  /**
   * Обработчик изменений ввода для размеров и опций.
   * @param {Event} event - Событие изменения input элемента.
   */
  const handleInputChange = useCallback((event) => {
    const { name, value, type, checked } = event.target;
    if (type === 'checkbox') {
      // Обновление опций для чекбоксов
      setOptions(prev => ({ ...prev, [name]: checked }));
    } else {
      // Обновление размеров для числовых инпутов
      setDimensions(prev => {
        const newDimensions = { ...prev, [name]: Number(value) };
        if (options.lock) {
          // Сохранение соотношения сторон при заблокированной опции
          const ratio = prev.width / prev.height;
          if (name === 'width') {
            newDimensions.height = Math.round(newDimensions.width / ratio);
          } else {
            newDimensions.width = Math.round(newDimensions.height * ratio);
          }
        }
        return newDimensions;
      });
    }
  }, [options.lock]);

  return { dimensions, options, handleInputChange };
};

export default useImageResize;
