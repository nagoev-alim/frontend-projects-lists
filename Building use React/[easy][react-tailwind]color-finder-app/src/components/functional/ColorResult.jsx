import { ColorInfo } from '@functional';

/**
 * Компонент для отображения результата анализа цвета.
 * 
 * @param {Object} props - Свойства компонента.
 * @param {string} props.color - Значение цвета (в формате HEX).
 * @param {Object} props.result - Объект с результатами анализа цвета.
 * @param {string} props.result.name - Название цвета.
 * @returns {JSX.Element} Компонент с информацией о цвете.
 */
const ColorResult = ({ color, result }) => (
  <div className="grid gap-2">
    {/* Заголовок с указанием анализируемого цвета */}
    <h3 className="text-center font-bold text-lg">
      About: <span className='uppercase'>{color}</span>
    </h3>
    {/* Контейнер для изображения цвета и детальной информации */}
    <div className="grid gap-2 md:gap-3 md:grid-cols-[200px_1fr]">
      {/* Изображение образца цвета */}
      <img
        className="border-2 max-w-[200px] mx-auto"
        src={`https://api.color.pizza/v1/swatch/?color=${color.slice(1)}&name=${result.name}`}
        alt={result.name}
      />
      {/* Компонент с детальной информацией о цвете */}
      <ColorInfo result={result} />
    </div>
  </div>
);

export default ColorResult;
