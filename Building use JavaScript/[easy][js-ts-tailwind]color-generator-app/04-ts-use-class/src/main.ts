import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * Этот код представляет собой приложение для генерации случайных цветов.
 * Пользователь может генерировать новый цвет, нажимая на кнопку или клавишу пробела.
 * Также есть возможность скопировать сгенерированный цвет в буфер обмена.
 */

/** Интерфейс для конфигурации приложения */
interface AppConfig {
  /** Селектор корневого элемента */
  root: string;
  /** Селекторы для различных элементов приложения */
  selectors: {
    [key: string]: string;
  };
  /** Символы, используемые для генерации HEX-кода цвета */
  hexChars: string;
}

/** Интерфейс для состояния приложения */
interface AppState {
  /** Объект, содержащий ссылки на DOM-элементы */
  elements: {
    [key: string]: HTMLElement | null;
  };
}

/** Интерфейс для утилит приложения */
interface AppUtils {
  /** Функция для рендеринга data-атрибутов */
  renderDataAttributes: (element: string) => string;
  /** Конфигурация для toast-уведомлений */
  toastConfig: {
    className: string;
    duration: number;
    gravity: string;
    position: string;
  };
  /** Функция для отображения toast-уведомления */
  showToast: (message: string) => void;
  /** Функция для обработки ошибок */
  handleError: (message: string, error?: Error) => void;
}

class ColorGenerator {
  private readonly config: AppConfig;
  private readonly state: AppState;
  private readonly utils: AppUtils;

  constructor() {
    this.config = {
      root: '#app',
      selectors: {
        colorDisplay: '[data-color-display]',
        colorValue: '[data-color-value]',
        generateColor: '[data-generate-color]',
        copyColor: '[data-copy-color]',
      },
      hexChars: '123456789ABCDEF',
    };

    this.state = {
      elements: {
        colorDisplay: null,
        colorValue: null,
        generateColor: null,
        copyColor: null,
      },
    };

    this.utils = {
      renderDataAttributes: (element: string): string => element.slice(1, -1),

      toastConfig: {
        className: 'bg-orange-100 text-black border border-orange-200',
        duration: 3000,
        gravity: 'bottom',
        position: 'center',
      },

      showToast: (message: string): void => {
        // @ts-ignore
        Toastify({ text: message, ...this.utils.toastConfig }).showToast();
      },

      handleError: (message: string, error: Error | null = null): void => {
        this.utils.showToast(message);
        if (error) console.error(message, error);
      },
    };

    this.init();
  }

  /**
   * Создает HTML-разметку приложения
   */
  private createAppHTML(): void {
    const {
      root,
      selectors: {
        colorDisplay,
        colorValue,
        generateColor,
        copyColor,
      },
    } = this.config;
    const { renderDataAttributes } = this.utils;
    const rootElement = document.querySelector<HTMLElement>(root);

    if (!rootElement) return;

    rootElement.innerHTML = `
    <div class='color-generator grid w-full max-w-md gap-4 p-3'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Color Generator</h1>
      <div class='mx-auto grid max-w-max place-content-center gap-2 rounded border bg-white p-2 text-center shadow'>
        <div class='h-[170px] w-[170px] border bg-[#A1B5C1]' ${renderDataAttributes(colorDisplay)}></div>
        <p class='font-bold' ${renderDataAttributes(colorValue)}>#A1B5C1</p>
      </div>
      <div class='grid place-items-center gap-3'>
        <button class='rounded bg-purple-500 px-3 py-2 font-medium text-white hover:bg-purple-400' ${renderDataAttributes(generateColor)}>Generate color</button>
        <button class='rounded bg-green-500 px-3 py-2 font-medium text-white hover:bg-green-400' ${renderDataAttributes(copyColor)}>Click to copy</button>
      </div>
      <p class='text-center'>Or just press the <span class='font-bold'>"Spacebar"</span> to generate new palettes.</p>
    </div>
  `;
  }

  /**
   * Инициализирует DOM-элементы
   */
  private initDOMElements(): void {
    this.state.elements = Object.fromEntries(
      Object.entries(this.config.selectors).map(([key, selector]) => [key, document.querySelector<HTMLElement>(selector)]),
    );
  }

  /**
   * Инициализирует приложение
   */
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();
    const { generateColor, copyColor } = this.state.elements;
    if (generateColor instanceof HTMLElement) {
      generateColor.addEventListener('click', this.handleGenerateColorClick.bind(this));
    }
    if (copyColor instanceof HTMLElement) {
      copyColor.addEventListener('click', this.handleCopyColorClick.bind(this));
    }
    document.addEventListener('keydown', ({ code }: KeyboardEvent) => {
      if (code === 'Space') this.handleGenerateColorClick();
    });
  }

  /**
   * Обработчик клика по кнопке генерации цвета
   */
  private handleGenerateColorClick(): void {
    const newColor = this.generateRandomColor();
    const { colorValue, colorDisplay } = this.state.elements;
    if (colorValue instanceof HTMLElement && colorDisplay instanceof HTMLElement) {
      colorValue.textContent = newColor;
      colorDisplay.style.backgroundColor = newColor;
    }
  }

  /**
   * Генерирует случайный цвет
   * @returns {string} Случайный HEX-код цвета
   */
  private generateRandomColor(): string {
    const { hexChars } = this.config;
    return '#' + Array.from({ length: 6 }, () => hexChars[Math.floor(Math.random() * hexChars.length)]).join('');
  }

  /**
   * Обработчик клика по кнопке копирования цвета
   */
  private async handleCopyColorClick(): Promise<void> {
    const { colorValue } = this.state.elements;
    if (!(colorValue instanceof HTMLElement)) return;
    const color = colorValue.textContent;
    if (!color) return;

    try {
      await navigator.clipboard.writeText(color);
      this.utils.showToast('Color copied to clipboard');
    } catch (error) {
      this.utils.handleError('Failed to copy color', error instanceof Error ? error : new Error(String(error)));
    }
  }
}

new ColorGenerator();
