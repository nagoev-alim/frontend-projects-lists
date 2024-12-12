import { Input } from '@ui';

/**
 * Компонент управления параметрами изменения размера изображения.
 *
 * @param {Object} props - Свойства компонента.
 * @param {Object} props.dimensions - Объект с размерами изображения.
 * @param {number} props.dimensions.width - Ширина изображения.
 * @param {number} props.dimensions.height - Высота изображения.
 * @param {Object} props.options - Объект с дополнительными опциями.
 * @param {boolean} props.options.lock - Флаг блокировки соотношения сторон.
 * @param {boolean} props.options.reduce - Флаг уменьшения качества.
 * @param {Function} props.handleInputChange - Функция-обработчик изменения ввода.
 * @returns {JSX.Element} Компонент управления параметрами изменения размера.
 */
const ResizeControls = ({ dimensions, options, handleInputChange }) => (
  <div className="grid gap-2 grid-cols-2">
    {/* Ввод ширины */}
    <label className="grid gap-1">
      <span className="text-sm font-medium">Width</span>
      <Input
        fullWidth={true}
        type="number"
        name="width"
        value={dimensions.width}
        onChange={handleInputChange}
      />
    </label>
    {/* Ввод высоты */}
    <label className="grid gap-1">
      <span className="text-sm font-medium">Height</span>
      <Input
        fullWidth={true}
        type="number"
        name="height"
        value={dimensions.height}
        onChange={handleInputChange}
      />
    </label>
    {/* Переключатель блокировки соотношения сторон */}
    <label className="flex flex-wrap items-center gap-1">
      <input
        className="sr-only"
        type="checkbox"
        name="lock"
        checked={options.lock}
        onChange={handleInputChange}
      />
      <span className="checkbox" />
      <span className="text-sm font-medium">Lock aspect ratio</span>
    </label>
    {/* Переключатель уменьшения качества */}
    <label className="flex flex-wrap items-center gap-1">
      <input
        className="sr-only"
        type="checkbox"
        name="reduce"
        checked={options.reduce}
        onChange={handleInputChange}
      />
      <span className="checkbox" />
      <span className="text-sm font-medium">Reduce quality</span>
    </label>
  </div>
);

export default ResizeControls;
