import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useImageUpload } from '@hooks';
import { Button } from '@ui';
import { FaArrowRotateLeft, FaArrowRotateRight, FaArrowsLeftRight } from 'react-icons/fa6';

/**
 * Компонент кнопки фильтра.
 * @param {Object} props - Свойства компонента.
 * @param {string} props.filter - Название фильтра.
 * @param {string} props.activeFilter - Текущий активный фильтр.
 * @param {Function} props.onClick - Функция обработки клика.
 * @returns {JSX.Element} Кнопка фильтра.
 */
const FilterButton = ({ filter, activeFilter, onClick }) => (
  <Button
    onClick={() => onClick(filter)}
    variant={activeFilter === filter ? 'primary' : 'secondary'}
  >
    {filter.charAt(0).toUpperCase() + filter.slice(1)}
  </Button>
);

/**
 * Основной компонент редактора изображений.
 * @returns {JSX.Element} Компонент редактора изображений.
 */
const Root = () => {
  // Хук для загрузки изображения
  const { image, inputRef, handleImageClick, handleImageChange } = useImageUpload();

  // Состояние для хранения значений фильтров
  const [filters, setFilters] = useState({
    brightness: 100,
    saturation: 100,
    inversion: 0,
    grayscale: 0,
  });

  // Состояние для активного фильтра
  const [activeFilter, setActiveFilter] = useState('brightness');

  // Состояние для поворота изображения
  const [rotation, setRotation] = useState(0);

  // Состояние для отражения изображения
  const [flip, setFlip] = useState({ horizontal: 1, vertical: 1 });

  // Ссылка на canvas элемент
  const canvasRef = useRef(null);

  // Применение фильтров при изменении изображения или параметров
  useEffect(() => {
    if (image) {
      applyFilter();
    }
  }, [image, filters, rotation, flip]);

  /**
   * Обработчик изменения значения фильтра.
   * @param {Event} event - Событие изменения.
   */
  const handleFilterChange = useCallback((event) => {
    setFilters(prev => ({ ...prev, [activeFilter]: event.target.value }));
  }, [activeFilter]);

  /**
   * Обработчик клика по кнопке фильтра.
   * @param {string} filter - Название выбранного фильтра.
   */
  const handleFilterClick = useCallback((filter) => {
    setActiveFilter(filter);
  }, []);

  /**
   * Обработчик поворота изображения.
   * @param {string} direction - Направление поворота ('left' или 'right').
   */
  const handleRotate = useCallback((direction) => {
    setRotation(prev => direction === 'left' ? prev - 90 : prev + 90);
  }, []);

  /**
   * Обработчик отражения изображения.
   * @param {string} direction - Направление отражения ('horizontal' или 'vertical').
   */
  const handleFlip = useCallback((direction) => {
    setFlip(prev => ({ ...prev, [direction]: prev[direction] * -1 }));
  }, []);

  /**
   * Сброс всех фильтров и трансформаций к исходным значениям.
   */
  const resetFilters = useCallback(() => {
    setFilters({ brightness: 100, saturation: 100, inversion: 0, grayscale: 0 });
    setRotation(0);
    setFlip({ horizontal: 1, vertical: 1 });
  }, []);

  /**
   * Применение фильтров и трансформаций к изображению на canvas.
   */
  const applyFilter = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = image;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.filter = `brightness(${filters.brightness}%) saturate(${filters.saturation}%) invert(${filters.inversion}%) grayscale(${filters.grayscale}%)`;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flip.horizontal, flip.vertical);
      ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);
    };
  }, [image, filters, rotation, flip]);

  /**
   * Сохранение отредактированного изображения.
   */
  const saveImage = useCallback(() => {
    const link = document.createElement('a');
    link.download = 'edited_image.png';
    link.href = canvasRef.current.toDataURL();
    link.click();
  }, []);

  // Мемоизированные кнопки фильтров
  const filterButtons = useMemo(() => (
    Object.keys(filters).map((filter) => (
      <FilterButton
        key={filter}
        filter={filter}
        activeFilter={activeFilter}
        onClick={handleFilterClick}
      />
    ))
  ), [filters, activeFilter, handleFilterClick]);

  return (
    <div className="grid gap-4 w-full max-w-4xl rounded border bg-white p-3 shadow">
      <h1 className="text-center text-2xl font-bold">Image Editor</h1>
      <div className="grid gap-3 md:grid-cols-[0.3fr_0.7fr]">
        <div className="">
          {/* Секция фильтров */}
          <div className="grid gap-2">
            <p className="font-medium">Filters</p>
            <div className="grid grid-cols-2 gap-2">
              {filterButtons}
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <p className="font-medium">{activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}</p>
                <p className="font-bold">{filters[activeFilter]}%</p>
              </div>
              <input
                type="range"
                value={filters[activeFilter]}
                min="0"
                max="200"
                onChange={handleFilterChange}
              />
            </div>
          </div>
          {/* Секция поворота и отражения */}
          <div className="grid gap-2">
            <p className="font-medium">Rotate & Flip</p>
            <div className="grid grid-cols-4 gap-2">
              <Button className="p-2 py-4 inline-flex justify-center items-center"
                      onClick={() => handleRotate('left')}>
                <FaArrowRotateLeft />
              </Button>
              <Button className="p-2 py-4 inline-flex justify-center items-center"
                      onClick={() => handleRotate('right')}>
                <FaArrowRotateRight />
              </Button>
              <Button className="p-2 py-4 inline-flex justify-center items-center"
                      onClick={() => handleFlip('horizontal')}>
                <FaArrowsLeftRight />
              </Button>
              <Button className="p-2 py-4 inline-flex justify-center items-center"
                      onClick={() => handleFlip('vertical')}>
                <FaArrowsLeftRight className="rotate-90" />
              </Button>
            </div>
          </div>
        </div>

        {/* Область предпросмотра изображения */}
        <div
          className="relative overflow-auto grid h-full min-h-[400px] max-h-[600px] place-content-center rounded-md bg-gray-200">
          {image ? (
            <canvas ref={canvasRef} className="absolute h-full w-full object-contain" />
          ) : (
            <div className="grid place-items-center gap-2">
              <p>Choose Image Or Edit</p>
            </div>
          )}
        </div>
      </div>
      {/* Кнопки управления */}
      <div className="flex gap-3">
        <Button onClick={resetFilters}>Reset Filters</Button>
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          ref={inputRef}
          onChange={handleImageChange}
        />
        <Button onClick={handleImageClick}>Choose Image</Button>
        <Button onClick={saveImage}>Save Image</Button>
      </div>
    </div>
  );
};

export default Root;
