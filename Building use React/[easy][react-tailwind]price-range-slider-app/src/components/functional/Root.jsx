import React, { useState, useCallback, useMemo, Fragment } from 'react';
import { Input } from '@ui';

/**
 * Компонент Root для отображения слайдера цен.
 * @returns {JSX.Element} Компонент слайдера цен.
 */
const Root = () => {
  // Состояние для минимальной и максимальной цены
  const [minPrice, setMinPrice] = useState(1800);
  const [maxPrice, setMaxPrice] = useState(7800);

  /**
   * Конфигурация цен, мемоизированная для оптимизации производительности.
   * @type {Object}
   * @property {number} gap - Минимальный разрыв между минимальной и максимальной ценой.
   * @property {number} min - Минимально возможная цена.
   * @property {number} max - Максимально возможная цена.
   * @property {number} step - Шаг изменения цены.
   */
  const PRICE_CONFIG = useMemo(() => ({
    gap: 1000,
    min: 0,
    max: 10000,
    step: 100,
  }), []);

  /**
   * Обработчик изменения цены.
   * @param {number} newValue - Новое значение цены.
   * @param {boolean} isMin - Флаг, указывающий, изменяется ли минимальная цена.
   */
  const handlePriceChange = useCallback((newValue, isMin) => {
    const { min, max, gap } = PRICE_CONFIG;
    // Ограничиваем новое значение в пределах допустимого диапазона
    const limitedValue = Math.max(min, Math.min(max, newValue));

    if (isMin) {
      // Обновляем минимальную цену, не позволяя ей превысить (максимальная цена - gap)
      setMinPrice(Math.min(limitedValue, maxPrice - gap));
    } else {
      // Обновляем максимальную цену, не позволяя ей стать меньше (минимальная цена + gap)
      setMaxPrice(Math.max(limitedValue, minPrice + gap));
    }
  }, [maxPrice, minPrice, PRICE_CONFIG]);

  /**
   * Обработчик изменения значения в поле ввода.
   * @param {Event} event - Событие изменения.
   * @param {boolean} isMin - Флаг, указывающий, изменяется ли минимальная цена.
   */
  const handleInputChange = useCallback((event, isMin) => {
    handlePriceChange(Number(event.target.value), isMin);
  }, [handlePriceChange]);

  /**
   * Обработчик изменения значения ползунка.
   * @param {Event} event - Событие изменения.
   * @param {boolean} isMin - Флаг, указывающий, изменяется ли минимальная цена.
   */
  const handleRangeChange = useCallback((event, isMin) => {
    handlePriceChange(Number(event.target.value), isMin);
  }, [handlePriceChange]);

  /**
   * Вычисляет стиль для отображения прогресса на слайдере.
   * @returns {Object} Объект стилей с left и right свойствами в процентах.
   */
  const getProgressStyle = useCallback(() => {
    const { min, max } = PRICE_CONFIG;
    const minPercent = ((minPrice - min) / (max - min)) * 100;
    const maxPercent = 100 - ((maxPrice - min) / (max - min)) * 100;
    return { left: `${minPercent}%`, right: `${maxPercent}%` };
  }, [minPrice, maxPrice, PRICE_CONFIG]);

  return (
    <div className="price-slider bg-white border gap-2 grid max-w-md p-3 rounded w-full">
      <h1 className="font-bold text-2xl text-center">Price Slider</h1>
      <p className="text-center">Use slider or enter min and max price</p>
      <div className="grid sm:grid-cols-[1fr_30px_1fr] sm:gap-1 sm:place-items-center">
        {['Min', 'Max'].map((label, index) => (
          <Fragment key={label}>
            {index === 1 && <span className="block sm:h-0.5 sm:w-4 sm:bg-black sm:mt-5" />}
            <label className="gap-1 grid">
              <span className="text-sm font-semibold">{label}</span>
              <Input
                fullWidth={true}
                type="number"
                value={index === 0 ? minPrice : maxPrice}
                onChange={(e) => handleInputChange(e, index === 0)}
              />
            </label>
          </Fragment>
        ))}
      </div>

      <div className="slider">
        <div className="slider__progress" style={getProgressStyle()}></div>
      </div>

      <div className="ranges">
        {[minPrice, maxPrice].map((value, index) => (
          <input
            key={index}
            className="ranges__input"
            type="range"
            min={PRICE_CONFIG.min}
            max={PRICE_CONFIG.max}
            value={value}
            step={PRICE_CONFIG.step}
            onChange={(e) => handleRangeChange(e, index === 0)}
          />
        ))}
      </div>
    </div>
  );
};

export default Root;
