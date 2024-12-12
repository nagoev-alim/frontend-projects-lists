/**
 * Компонент для отображения информации о цвете.
 *
 * @param {Object} props - Свойства компонента.
 * @param {Object} props.result - Объект с результатами анализа цвета.
 * @param {string} props.result.name - Название цвета.
 * @param {Object} props.result.rgb - RGB значения цвета.
 * @param {number} props.result.rgb.r - Значение красного канала (0-255).
 * @param {number} props.result.rgb.g - Значение зеленого канала (0-255).
 * @param {number} props.result.rgb.b - Значение синего канала (0-255).
 * @param {Object} props.result.hsl - HSL значения цвета.
 * @param {number} props.result.hsl.h - Оттенок (0-360).
 * @param {number} props.result.hsl.s - Насыщенность (0-100).
 * @param {number} props.result.hsl.l - Светлота (0-100).
 * @param {Object} props.result.lab - LAB значения цвета.
 * @param {number} props.result.lab.l - Светлота.
 * @param {number} props.result.lab.a - Положение между красным и зеленым.
 * @param {number} props.result.lab.b - Положение между желтым и синим.
 * @param {number} props.result.luminance - Яркость цвета.
 * @param {number} props.result.luminanceWCAG - Яркость цвета по стандарту WCAG.
 * @returns {JSX.Element} Таблица с информацией о цвете.
 */
const ColorInfo = ({ result: { name, rgb, hsl, lab, luminance, luminanceWCAG } }) => (
  <div className="table">
    {[
      // Массив объектов с метками и значениями для отображения
      { label: 'Color Name', value: name },
      { label: 'RGB Values', value: `(${rgb.r}, ${rgb.g}, ${rgb.b})` },
      { label: 'HSL Values', value: `(${hsl.h.toFixed(0)}, ${hsl.s.toFixed(0)}%, ${hsl.l.toFixed(0)}%)` },
      { label: 'LAB Values', value: `(${lab.l}, ${lab.a}, ${lab.b})` },
      { label: 'Luminances', value: `(${luminance})` },
      { label: 'Luminance WCAG', value: `(${luminanceWCAG})` },
    ].map(({ label, value }) => (
      // Создание строки таблицы для каждой пары метка-значение
      <p className="grid grid-cols-2" key={label}>
        <span className="p-3 border font-semibold bg-neutral-100">{label}</span>
        <span className="p-3 border">{value}</span>
      </p>
    ))}
  </div>
);

export default ColorInfo;
