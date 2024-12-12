/**
 * @fileoverview Компонент Root предоставляет интерфейс для конвертации различных единиц измерения.
 * Поддерживает конвертацию веса, температуры, длины и скорости.
 * Использует предопределенные константы для типов конвертации и коэффициентов преобразования.
 */
import { useState } from 'react';
import { capitalizeFirstLetter } from '@utils';

/**
 * @description Объект, содержащий константы для конвертации различных единиц измерения.
 */
const CONSTANTS = {
  /**
   * @type {Array<Object>}
   * @description Массив объектов, описывающих типы конвертации и их допустимые значения.
   */
  TYPES: [
    {
      name: 'weight',
      values: ['pounds', 'ounces', 'stones', 'kilograms', 'grams'],
    },
    {
      name: 'temperature',
      values: ['fahrenheit', 'celsius', 'kelvin'],
    },
    {
      name: 'length',
      values: ['feet', 'inches', 'yards', 'miles', 'meters', 'cm', 'kilometers'],
    },
    {
      name: 'speed',
      values: ['MPH', 'KPH', 'Knots', 'Mach'],
    },
  ],

  /**
   * @type {Object}
   * @description Объект, содержащий функции и коэффициенты для конвертации различных единиц измерения.
   */
  CONVERTERS: {
    weight: {
      pounds: {
        kilograms: 1 / 2.2046,
        ounces: 16,
        grams: 1 / 0.0022046,
        stones: 0.071429,
      },
      ounces: {
        pounds: 0.0625,
        kilograms: 1 / 35.274,
        grams: 1 / 0.035274,
        stones: 0.0044643,
      },
      stones: {
        pounds: 14,
        kilograms: 1 / 0.15747,
        ounces: 224,
        grams: 1 / 0.00015747,
      },
      kilograms: {
        pounds: 2.2046,
        ounces: 35.274,
        grams: 1000,
        stones: 0.1574,
      },
      grams: {
        pounds: 0.0022046,
        kilograms: 1 / 1000,
        ounces: 0.035274,
        stones: 0.00015747,
      },
    },
    temperature: {
      fahrenheit: {
        celsius: (v) => (v - 32) / 1.8,
        kelvin: (v) => (v - 32) / 1.8 + 273.15,
      },
      celsius: {
        fahrenheit: (v) => v * 1.8 + 32,
        kelvin: (v) => v + 273.15,
      },
      kelvin: {
        fahrenheit: (v) => (v - 273.15) * 1.8 + 32,
        celsius: (v) => v - 273.15,
      },
    },
    speed: {
      mph: { kph: 1.609344, knots: 1 / 1.150779, mach: 1 / 761.207 },
      kph: { mph: 1 / 1.609344, knots: 1 / 1.852, mach: 1 / 1225.044 },
      knots: { mph: 1.150779, kph: 1.852, mach: 1 / 661.4708 },
      mach: { mph: 761.207, kph: 1225.044, knots: 661.4708 },
    },
    length: {
      feet: {
        meters: 1 / 3.2808,
        inches: 12,
        cm: 1 / 0.032808,
        yards: 0.33333,
        kilometers: 1 / 3280.8,
        miles: 0.00018939,
      },
      inches: {
        feet: 0.083333,
        meters: 1 / 39.37,
        cm: 1 / 0.3937,
        yards: 0.027778,
        kilometers: 1 / 39370,
        miles: 0.000015783,
      },
      yards: {
        feet: 3,
        meters: 1 / 1.0936,
        inches: 36,
        cm: 1 / 0.010936,
        kilometers: 1 / 1093.6,
        miles: 0.00056818,
      },
      miles: {
        feet: 5280,
        meters: 1 / 0.00062137,
        inches: 63360,
        cm: 1 / 0.0000062137,
        yards: 1760,
        kilometers: 1 / 0.62137,
      },
      meters: {
        feet: 3.2808,
        inches: 39.37,
        cm: 100,
        yards: 1.0936,
        kilometers: 1 / 1000,
        miles: 0.00062137,
      },
      cm: {
        feet: 0.032808,
        meters: 1 / 100,
        inches: 0.3937,
        yards: 0.010936,
        kilometers: 1 / 100000,
        miles: 0.0000062137,
      },
      kilometers: {
        feet: 3280.8,
        meters: 1000,
        inches: 39370,
        cm: 100000,
        yards: 1093.6,
        miles: 0.62137,
      },
    },
  },
};

/**
 * Компонент Root для конвертации различных типов величин.
 * @returns {JSX.Element} Возвращает JSX элемент компонента Root.
 */
const Root = () => {
  /**
   * Состояние для хранения значений конвертации.
   */
  const [values, setValues] = useState({});

  /**
   * Обрабатывает изменение значения в поле ввода и выполняет конвертацию.
   * @param {string} type - Тип конвертации (например, 'weight', 'temperature').
   * @param {string} unit - Единица измерения (например, 'kg', 'lbs').
   * @param {string} value - Введенное значение.
   * @description
   * Эта функция выполняет следующие действия:
   * 1. Создает новый объект значений на основе текущего состояния.
   * 2. Обновляет значение для указанного типа и единицы измерения.
   * 3. Находит соответствующий конвертер из CONSTANTS.CONVERTERS.
   * 4. Если конвертер найден, выполняет конвертацию для всех целевых единиц измерения.
   * 5. Обновляет состояние с новыми значениями.
   *
   * @throws {Error} Может выбросить исключение, если CONSTANTS.CONVERTERS не содержит нужный тип или единицу измерения.
   */
  const handleValueChange = (type, unit, value) => {
    const newValues = { ...values };
    newValues[type] = newValues[type] || {};
    newValues[type][unit] = value;

    const converter = CONSTANTS.CONVERTERS[type]?.[unit];
    if (converter) {
      Object.entries(converter).forEach(([targetUnit, conversion]) => {
        const parsedValue = parseFloat(value);
        newValues[type][targetUnit] = (
          typeof conversion === 'function'
            ? conversion(parsedValue)
            : parsedValue * conversion
        ).toFixed(6);
      });
    }

    setValues(newValues);
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-4 p-3">
      <h1 className="text-center text-2xl font-bold">Type Converter</h1>
      <div className="grid gap-4 items-start md:grid-cols-2">
        {CONSTANTS.TYPES.map(({ name, values: units }) => (
          <section key={name} className={`bg-white grid gap-3 rounded border p-4 shadow ${name}-converters`}>
            <h3 className="text-2xl font-bold">{capitalizeFirstLetter(name)} Converter</h3>
            <p>Type a value in any of the fields to convert between {name} measurements:</p>
            <form className="grid gap-2">
              {units.map((unit) => (
                <label key={unit} className="grid gap-1">
                  <span className="font-medium">{capitalizeFirstLetter(unit)}</span>
                  <input
                    className="rounded border-2 bg-gray-50 px-3 py-2.5 focus:border-blue-400 focus:outline-none"
                    type="number"
                    placeholder={capitalizeFirstLetter(unit)}
                    value={values[name]?.[unit.toLowerCase()] || ''}
                    onChange={(e) => handleValueChange(name, unit.toLowerCase(), e.target.value)}
                  />
                </label>
              ))}
            </form>
          </section>
        ))}
      </div>
    </div>
  );
};


export default Root;
