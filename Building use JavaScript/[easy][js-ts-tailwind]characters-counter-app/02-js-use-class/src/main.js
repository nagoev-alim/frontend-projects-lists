/**
 * Этот код реализует функциональность счетчика слов и символов.
 * Он создает пользовательский интерфейс с текстовым полем для ввода
 * и отображает количество введенных слов и символов в реальном времени.
 */

import './style.css';

class WordCounter {
  /**
   * Создает экземпляр WordCounter.
   * Инициализирует конфигурацию, состояние и утилиты.
   * Запускает инициализацию приложения.
   */
  constructor() {
    this.config = {
      root: '#app',
      selectors: {
        input: '[data-word-counter-textarea]',
        output: '[data-word-counter-result]',
      },
    };
    this.state = {
      elements: {
        input: null,
        output: null,
      },
    };
    this.utils = {
      /**
       * Обрабатывает строку атрибута данных, удаляя квадратные скобки.
       * @param {string} element - Строка атрибута данных.
       * @returns {string} Обработанная строка атрибута данных.
       */
      renderDataAttributes: (element) => element.slice(1, -1),
      /**
       * Создает отложенную версию функции.
       * @param {Function} func - Функция для отложенного выполнения.
       * @param {number} delay - Задержка в миллисекундах.
       * @returns {Function} Отложенная функция.
       */
      debounce: (func, delay) => {
        let timeoutId;
        return function (...args) {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
      },
    };
    this.init();
  }

  /**
   * Создает HTML-разметку приложения и вставляет ее в корневой элемент.
   */
  createAppHTML() {
    const { root, selectors: { input, output } } = this.config;
    const { renderDataAttributes } = this.utils;
    const rootElement = document.querySelector(root);

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
   * Инициализирует DOM-элементы, сохраняя ссылки на них в состоянии.
   */
  initDOMElements() {
    this.state.elements = {
      input: document.querySelector(this.config.selectors.input),
      output: document.querySelector(this.config.selectors.output),
    };
  }

  /**
   * Инициализирует приложение, создавая HTML, инициализируя DOM-элементы
   * и добавляя обработчик события ввода.
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();
    this.state.elements.input.addEventListener('input', this.utils.debounce(this.handleInputChange.bind(this), 300));
  }

  /**
   * Подсчитывает количество слов и символов в тексте.
   * @param {string} text - Текст для анализа.
   * @returns {{words: number, chars: number}} Объект с количеством слов и символов.
   */
  countWordsAndChars(text) {
    const words = text.match(/\S+/g) || [];
    return { words: words.length, chars: text.length };
  }

  /**
   * Создает HTML для вывода результатов подсчета.
   * @param {{words: number, chars: number}} param0 - Объект с количеством слов и символов.
   * @returns {string} HTML-строка для вывода результатов.
   */
  createOutputHTML({ words, chars }) {
    return `You've written <span class='font-bold'>${words}</span> words and <span class='font-bold'>${chars}</span> characters.`;
  }

  /**
   * Обрабатывает изменение ввода, обновляя вывод с новыми подсчетами.
   * @param {Event} param0 - Объект события ввода.
   */
  handleInputChange({ target: { value } }) {
    const counts = this.countWordsAndChars(value.trim());
    this.state.elements.output.innerHTML = this.createOutputHTML(counts);
  }
}

new WordCounter();