import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * Этот код представляет собой приложение для генерации случайных цветов.
 * Пользователь может генерировать новые цвета, нажимая на кнопку или клавишу пробела.
 * Также есть возможность копировать сгенерированный цвет в буфер обмена.
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

/** Конфигурация приложения */
const APP_CONFIG: AppConfig = {
  root: '#app',
  selectors: {
    colorDisplay: '[data-color-display]',
    colorValue: '[data-color-value]',
    generateColor: '[data-generate-color]',
    copyColor: '[data-copy-color]',
  },
  hexChars: '123456789ABCDEF',
};

/** Состояние приложения */
const APP_STATE: AppState = {
  elements: {
    colorDisplay: null,
    colorValue: null,
    generateColor: null,
    copyColor: null,
  },
};

/** Утилиты приложения */
const APP_UTILS: AppUtils = {
  renderDataAttributes: (element: string): string => element.slice(1, -1),

  toastConfig: {
    className: 'bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  },

  showToast: (message: string): void => {
    // @ts-ignore
    Toastify({ text: message, ...APP_UTILS.toastConfig }).showToast();
  },

  handleError: (message: string, error: Error | null = null): void => {
    APP_UTILS.showToast(message);
    if (error) console.error(message, error);
  },
};

/**
 * Создает HTML-разметку приложения
 */
function createAppHTML(): void {
  const { root, selectors } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector<HTMLElement>(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='color-generator grid w-full max-w-md gap-4 p-3'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Color Generator</h1>
      <div class='mx-auto grid max-w-max place-content-center gap-2 rounded border bg-white p-2 text-center shadow'>
        <div class='h-[170px] w-[170px] border bg-[#A1B5C1]' ${renderDataAttributes(selectors.colorDisplay)}></div>
        <p class='font-bold' ${renderDataAttributes(selectors.colorValue)}>#A1B5C1</p>
      </div>
      <div class='grid place-items-center gap-3'>
        <button class='rounded bg-purple-500 px-3 py-2 font-medium text-white hover:bg-purple-400' ${renderDataAttributes(selectors.generateColor)}>Generate color</button>
        <button class='rounded bg-green-500 px-3 py-2 font-medium text-white hover:bg-green-400' ${renderDataAttributes(selectors.copyColor)}>Click to copy</button>
      </div>
      <p class='text-center'>Or just press the <span class='font-bold'>"Spacebar"</span> to generate new palettes.</p>
    </div>
  `;
}

/**
 * Инициализирует DOM-элементы приложения
 */
function initDOMElements(): void {
  APP_STATE.elements = Object.fromEntries(
    Object.entries(APP_CONFIG.selectors).map(([key, selector]) => [key, document.querySelector<HTMLElement>(selector)])
  );
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();
  const { generateColor, copyColor } = APP_STATE.elements;
  if (generateColor instanceof HTMLElement) {
    generateColor.addEventListener('click', handleGenerateColorClick);
  }
  if (copyColor instanceof HTMLElement) {
    copyColor.addEventListener('click', handleCopyColorClick);
  }
  document.addEventListener('keydown', ({ code }: KeyboardEvent) => {
    if (code === 'Space') handleGenerateColorClick();
  });
}

/**
 * Обработчик клика по кнопке генерации цвета
 */
function handleGenerateColorClick(): void {
  const newColor = generateRandomColor();
  const { colorValue, colorDisplay } = APP_STATE.elements;
  if (colorValue instanceof HTMLElement && colorDisplay instanceof HTMLElement) {
    colorValue.textContent = newColor;
    colorDisplay.style.backgroundColor = newColor;
  }
}

/**
 * Генерирует случайный цвет в формате HEX
 * @returns {string} Строка с HEX-кодом цвета
 */
function generateRandomColor(): string {
  const { hexChars } = APP_CONFIG;
  return '#' + Array.from({ length: 6 }, () => hexChars[Math.floor(Math.random() * hexChars.length)]).join('');
}

/**
 * Обработчик клика по кнопке копирования цвета
 */
async function handleCopyColorClick(): Promise<void> {
  const { colorValue } = APP_STATE.elements;
  if (!(colorValue instanceof HTMLElement)) return;
  const color = colorValue.textContent;
  if (!color) return;

  try {
    await navigator.clipboard.writeText(color);
    APP_UTILS.showToast('Color copied to clipboard');
  } catch (error) {
    APP_UTILS.handleError('Failed to copy color', error instanceof Error ? error : new Error(String(error)));
  }
}

initApp();
