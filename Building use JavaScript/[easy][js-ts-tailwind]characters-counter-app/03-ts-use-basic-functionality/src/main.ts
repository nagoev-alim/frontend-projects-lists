/**
 * Этот код реализует простое веб-приложение для подсчета слов и символов.
 * Пользователь может вводить текст в текстовую область, и приложение
 * автоматически обновляет количество слов и символов при вводе.
 */

import './style.css';

/**
 * Интерфейс для конфигурации приложения
 * @interface
 */
interface AppConfig {
  /** Селектор корневого элемента */
  root: string;
  /** Объект с селекторами элементов */
  selectors: {
    [key: string]: string
  };
}

/**
 * Конфигурация приложения
 * @type {AppConfig}
 */
const APP_CONFIG: AppConfig = {
  root: '#app',
  selectors: {
    input: '[data-word-counter-textarea]',
    output: '[data-word-counter-result]',
  },
};

/**
 * Интерфейс для состояния приложения
 * @interface
 */
interface AppState {
  /** Объект с элементами DOM */
  elements: {
    input: HTMLTextAreaElement | null;
    output: HTMLDivElement | null;
  };
}

/**
 * Состояние приложения
 * @type {AppState}
 */
const APP_STATE: AppState = {
  elements: {
    input: null,
    output: null,
  },
};

/**
 * Интерфейс для утилит приложения
 * @interface
 */
interface AppUtils {
  /** Функция для обработки атрибутов данных */
  renderDataAttributes: (element: string) => string;
  /** Функция для создания отложенного вызова */
  debounce: <T extends (...args: any[]) => void>(func: T, delay: number) => (...args: Parameters<T>) => void;
}

/**
 * Утилиты приложения
 * @type {AppUtils}
 */
const APP_UTILS: AppUtils = {
  /**
   * Удаляет квадратные скобки с начала и конца строки
   * @param {string} element - Строка для обработки
   * @returns {string} Обработанная строка
   */
  renderDataAttributes: (element: string): string => element.slice(1, -1),

  /**
   * Создает функцию, которая откладывает вызов другой функции
   * @param {Function} func - Функция для отложенного вызова
   * @param {number} delay - Задержка в миллисекундах
   * @returns {Function} Функция с отложенным вызовом
   */
  debounce: <T extends (...args: any[]) => void>(func: T, delay: number): (...args: Parameters<T>) => void => {
    let timeoutId: number;
    return function(this: ThisParameterType<T>, ...args: Parameters<T>): void {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  },
};

/**
 * Создает HTML структуру приложения
 */
function createAppHTML(): void {
  const { root, selectors: { input, output } } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector<HTMLElement>(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='grid w-full max-w-md gap-4 rounded border p-3 shadow'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Word Counter</h1>
      <label aria-label='Enter some text below'>
        <textarea class='min-h-[160px] w-full resize-none rounded border-2 p-2 focus:border-blue-400 focus:outline-none' ${renderDataAttributes(input)} placeholder='Enter some text below:'></textarea>
      </label>
      <div class='text-center' ${renderDataAttributes(output)}>You've written <span class='font-bold'>0</span> words and <span class='font-bold'>0</span> characters.</div>
    </div>
  `;
}

/**
 * Инициализирует DOM элементы
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    input: document.querySelector(APP_CONFIG.selectors.input),
    output: document.querySelector(APP_CONFIG.selectors.output),
  };
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();
  APP_STATE.elements.input?.addEventListener('input', APP_UTILS.debounce(handleInputChange, 300));
}

/**
 * Подсчитывает количество слов и символов в тексте
 * @param {string} text - Текст для анализа
 * @returns {{ words: number; chars: number }} Объект с количеством слов и символов
 */
function countWordsAndChars(text: string): { words: number; chars: number } {
  const words = text.match(/\S+/g) || [];
  return { words: words.length, chars: text.length };
}

/**
 * Создает HTML для вывода результатов подсчета
 * @param {{ words: number; chars: number }} param0 - Объект с количеством слов и символов
 * @returns {string} HTML строка с результатами
 */
function createOutputHTML({ words, chars }: { words: number; chars: number }): string {
  return `You've written <span class='font-bold'>${words}</span> words and <span class='font-bold'>${chars}</span> characters.`;
}

/**
 * Обработчик изменения ввода
 * @param {Event} param0 - Событие ввода
 */
function handleInputChange({ target }: Event): void {
  if (target instanceof HTMLTextAreaElement) {
    const counts = countWordsAndChars(target.value.trim());
    if (APP_STATE.elements.output) {
      APP_STATE.elements.output.innerHTML = createOutputHTML(counts);
    }
  }
}

initApp();