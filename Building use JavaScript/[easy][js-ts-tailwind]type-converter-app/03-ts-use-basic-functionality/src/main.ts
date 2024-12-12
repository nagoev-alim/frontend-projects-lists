/**
 * Этот код представляет собой приложение для конвертации различных единиц измерения.
 * Он позволяет пользователю вводить значения в различных единицах измерения
 * (вес, температура, длина, скорость) и автоматически конвертирует их в другие
 * единицы измерения той же категории.
 */

import './style.css';

/**
 * Интерфейс для типа конверсии
 * @typedef {Object} ConversionType
 * @property {string} name - Название типа конверсии
 * @property {string[]} values - Массив возможных единиц измерения
 */
interface ConversionType {
  name: string;
  values: string[];
}

/**
 * Интерфейс для конфигурации приложения
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента
 * @property {ConversionType[]} data - Массив типов конверсий
 */
interface AppConfig {
  root: string;
  data: ConversionType[];
}

/**
 * Конфигурация приложения
 * @type {AppConfig}
 */
const APP_CONFIG: AppConfig = {
  root: '#app',
  data: [
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
};

/**
 * Объект с утилитарными функциями
 * @type {Object}
 */
const APP_UTILS = {
  /**
   * Преобразует первую букву строки в заглавную
   * @param {string} str - Исходная строка
   * @returns {string} Строка с заглавной первой буквой
   */
  capitalStr: (str: string): string => str.length === 0 ? str : str[0].toUpperCase() + str.substring(1),
};

/**
 * Создает HTML структуру приложения
 */
function createAppHTML(): void {
  const { root, data } = APP_CONFIG;
  const { capitalStr } = APP_UTILS;
  const rootElement = document.querySelector<HTMLElement>(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='mx-auto grid max-w-5xl gap-4'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Type Converter</h1>
      <div class='grid gap-4 items-start md:grid-cols-2'>
        ${data.map(
    ({ name, values }) => `
          <section class='grid gap-3 rounded border p-4 shadow ${name}-converters'>
            <h3 class='text-2xl font-bold'>${capitalStr(name)} Converter</h3>
            <p>Type a value in any of the fields to convert between ${name} measurements:</p>
            <form class='grid gap-2'>
              ${values
      .map(
        (item) => `
                <label class='grid gap-1'>
                  <span class='font-medium'>${capitalStr(item)}</span>
                  <input 
                    class='rounded border-2 bg-gray-50 px-3 py-2.5 focus:border-blue-400 focus:outline-none' 
                    type='number' 
                    placeholder='${capitalStr(item)}' 
                    data-unit='${item.toLowerCase()}'
                    data-type='${name}'
                  >
                </label>
              `,
      )
      .join('')}
            </form>
          </section>
        `,
  ).join('')}
      </div>
    </div>
  `;
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();

  APP_CONFIG.data.forEach(({ name }) => {
    const inputs = document.querySelectorAll<HTMLInputElement>(`[data-type="${name}"]`);
    inputs.forEach((input) => {
      ['input', 'change'].forEach((eventType) => {
        input.addEventListener(eventType, () => handleValueConverter(input as InputElement));
      });
    });
  });
}

/**
 * Интерфейс для элемента ввода с дополнительными атрибутами
 * @typedef {Object} InputElement
 * @property {Object} dataset - Объект с данными элемента
 * @property {string} dataset.unit - Единица измерения
 * @property {string} dataset.type - Тип конвертации
 */
interface InputElement extends HTMLInputElement {
  dataset: {
    unit: string;
    type: string;
  };
}

/**
 * Обрабатывает конвертацию значений
 * @param {InputElement} param0 - Элемент ввода
 */
function handleValueConverter({ value: inputValue, dataset }: InputElement): void {
  const value = parseFloat(inputValue);
  const { unit, type } = dataset;
  const inputs = Array.from(document.querySelectorAll<InputElement>(`[data-type="${type}"]`));

  type ConverterFunction = (v: number) => number;
  type ConverterValue = number | ConverterFunction;

  interface Converters {
    [key: string]: {
      [key: string]: {
        [key: string]: ConverterValue;
      };
    };
  }

  const converters: Converters = {
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
        celsius: (v: number) => (v - 32) / 1.8,
        kelvin: (v: number) => (v - 32) / 1.8 + 273.15,
      },
      celsius: { fahrenheit: (v) => v * 1.8 + 32, kelvin: (v) => v + 273.15 },
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
  };

  const converter = converters[type]?.[unit];
  if (!converter) return;

  inputs.forEach((input) => {
    if (input.dataset.unit !== unit) {
      const conversion = converter[input.dataset.unit];
      input.value = (
        typeof conversion === 'function'
          ? conversion(value)
          : value * (conversion as number)
      ).toFixed(6);
    }
  });
}

initApp();