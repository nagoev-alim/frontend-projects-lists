/**
 * Этот код реализует функциональность счетчика слов и символов.
 * Он создает пользовательский интерфейс с текстовым полем для ввода
 * и отображает количество введенных слов и символов в реальном времени.
 */

import './style.css';

/**
 * Интерфейс для конфигурации приложения.
 */
interface Config {
  /** Селектор корневого элемента */
  root: string;
  /** Селекторы для элементов ввода и вывода */
  selectors: {
    input: string;
    output: string;
  };
}

/**
 * Интерфейс для состояния приложения.
 */
interface State {
  /** Элементы DOM */
  elements: {
    input: HTMLTextAreaElement | null;
    output: HTMLDivElement | null;
  };
}

/**
 * Интерфейс для утилит приложения.
 */
interface Utils {
  /** Функция для обработки атрибутов данных */
  renderDataAttributes: (element: string) => string;
  /** Функция для создания отложенного выполнения */
  debounce: <T extends (...args: any[]) => void>(func: T, delay: number) => (...args: Parameters<T>) => void;
}

/**
 * Класс WordCounter реализует функциональность счетчика слов и символов.
 */
class WordCounter {
  /** Конфигурация приложения */
  private config: Config;
  /** Состояние приложения */
  private state: State;
  /** Утилиты приложения */
  private utils: Utils;

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
      renderDataAttributes: (element: string): string => element.slice(1, -1),
      debounce: <T extends (...args: any[]) => void>(func: T, delay: number): (...args: Parameters<T>) => void => {
        let timeoutId: number;
        return (...args: Parameters<T>): void => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
      },
    };
    this.init();
  }

  /**
   * Создает HTML-разметку приложения и вставляет ее в DOM.
   */
  private createAppHTML(): void {
    const { root, selectors: { input, output } } = this.config;
    const { renderDataAttributes } = this.utils;
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
   * Инициализирует элементы DOM и сохраняет их в состоянии.
   */
  private initDOMElements(): void {
    this.state.elements = {
      input: document.querySelector<HTMLTextAreaElement>(this.config.selectors.input),
      output: document.querySelector<HTMLDivElement>(this.config.selectors.output),
    };
  }

  /**
   * Инициализирует приложение: создает HTML, инициализирует элементы DOM и добавляет обработчики событий.
   */
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();
    this.state.elements.input?.addEventListener('input', this.utils.debounce(this.handleInputChange.bind(this), 300));
  }

  /**
   * Подсчитывает количество слов и символов в тексте.
   * @param {string} text - Текст для анализа.
   * @returns {{words: number, chars: number}} Объект с количеством слов и символов.
   */
  private countWordsAndChars(text: string): { words: number; chars: number } {
    const words = text.match(/\S+/g) || [];
    return { words: words.length, chars: text.length };
  }

  /**
   * Создает HTML-строку для вывода результата подсчета.
   * @param {{words: number, chars: number}} param0 - Объект с количеством слов и символов.
   * @returns {string} HTML-строка с результатом подсчета.
   */
  private createOutputHTML({ words, chars }: { words: number; chars: number }): string {
    return `You've written <span class='font-bold'>${words}</span> words and <span class='font-bold'>${chars}</span> characters.`;
  }

  /**
   * Обработчик события ввода текста.
   * @param {Event} param0 - Объект события.
   */
  private handleInputChange({ target }: Event): void {
    const input = target as HTMLTextAreaElement;
    const counts = this.countWordsAndChars(input.value.trim());
    if (this.state.elements.output) {
      this.state.elements.output.innerHTML = this.createOutputHTML(counts);
    }
  }
}

new WordCounter();