/**
 * Этот код реализует интерактивное приложение для отображения информации о нажатых клавишах.
 * Он создает пользовательский интерфейс, который показывает код клавиши и ее название при нажатии любой клавиши на клавиатуре.
 */

import './style.css';

/**
 * Интерфейс для конфигурации приложения
 * @interface
 */
interface AppConfig {
  /** Селектор корневого элемента */
  root: string;
  /** Объект с селекторами для различных элементов интерфейса */
  selectors: {
    /** Селектор для инструкции */
    instruction: string;
    /** Селектор для контейнера результатов */
    resultContainer: string;
    /** Селектор для отображения клавиши */
    keyDisplay: string;
    /** Селектор для отображения кода клавиши */
    keycodeDisplay: string;
  };
}

/**
 * Конфигурация приложения
 * @type {AppConfig}
 */
const APP_CONFIG: AppConfig = {
  root: '#app',
  selectors: {
    instruction: '[data-instruction]',
    resultContainer: '[data-result-container]',
    keyDisplay: '[data-key-display]',
    keycodeDisplay: '[data-keycode-display]',
  },
};

/**
 * Интерфейс для состояния приложения
 * @interface
 */
interface AppState {
  /** Объект, содержащий ссылки на DOM элементы */
  elements: {
    /** Элемент инструкции */
    instruction: HTMLElement | null;
    /** Элемент контейнера результатов */
    resultContainer: HTMLElement | null;
    /** Коллекция элементов отображения клавиши */
    keyDisplay: NodeListOf<HTMLElement> | null;
    /** Коллекция элементов отображения кода клавиши */
    keycodeDisplay: NodeListOf<HTMLElement> | null;
  };
}

/**
 * Состояние приложения
 * @type {AppState}
 */
const APP_STATE: AppState = {
  elements: {
    instruction: null,
    resultContainer: null,
    keyDisplay: null,
    keycodeDisplay: null,
  },
};

/**
 * Объект с утилитами приложения
 */
const APP_UTILS = {
  /**
   * Обрезает квадратные скобки с начала и конца строки
   * @param {string} element - Строка для обработки
   * @returns {string} Обработанная строка
   */
  renderDataAttributes: (element: string): string => element.slice(1, -1),
};

/**
 * Создает HTML структуру приложения
 */
function createAppHTML(): void {
  const { root, selectors: { instruction, resultContainer, keyDisplay, keycodeDisplay } } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector<HTMLElement>(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='border shadow rounded max-w-md w-full p-3 grid gap-4'>
      <p class='font-bold text-center text-2xl md:text-3xl' ${renderDataAttributes(instruction)}>Press any key</p>
      <div class='grid gap-4' ${renderDataAttributes(resultContainer)}>
        <div class='grid gap-2 place-items-center'>
          <span class='inline-flex justify-center items-center text-red-400 uppercase font-bold text-4xl border-4 border-red-400 rounded-full w-[70px] h-[70px] md:w-[90px] md:h-[90px]' ${renderDataAttributes(keycodeDisplay)}></span>
          <span class='uppercase font-bold text-2xl text-red-400 md:text-4xl' ${renderDataAttributes(keyDisplay)}></span>
        </div>
        <div class='grid grid-cols-2 place-items-center'>
          <p class='font-bold text-2xl text-center w-full'>Key: <span class='font-normal' ${renderDataAttributes(keyDisplay)}></span></p>
          <p class='font-bold text-2xl text-center border-l-2 border-slate-900 w-full'>Code: <span class='font-normal' ${renderDataAttributes(keycodeDisplay)}></span></p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Инициализирует DOM элементы и сохраняет их в состоянии приложения
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    instruction: document.querySelector<HTMLElement>(APP_CONFIG.selectors.instruction),
    resultContainer: document.querySelector<HTMLElement>(APP_CONFIG.selectors.resultContainer),
    keyDisplay: document.querySelectorAll<HTMLElement>(APP_CONFIG.selectors.keyDisplay),
    keycodeDisplay: document.querySelectorAll<HTMLElement>(APP_CONFIG.selectors.keycodeDisplay),
  };
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();
  window.addEventListener('keydown', handleKeyDown);
  if (APP_STATE.elements.resultContainer) APP_STATE.elements.resultContainer.classList.add('hidden');
}

/**
 * Обрабатывает событие нажатия клавиши
 * @param {KeyboardEvent} param0 - Объект события клавиатуры
 */
function handleKeyDown({ key, keyCode }: KeyboardEvent): void {
  if (APP_STATE.elements.instruction && APP_STATE.elements.resultContainer) {
    APP_STATE.elements.instruction.classList.add('hidden');
    APP_STATE.elements.resultContainer.classList.remove('hidden');
  }
  if (APP_STATE.elements.keyDisplay) {
    APP_STATE.elements.keyDisplay.forEach(
      (k) => (k.textContent = key === ' ' ? 'Space' : key),
    );
  }
  if (APP_STATE.elements.keycodeDisplay) {
    APP_STATE.elements.keycodeDisplay.forEach((k) => (k.textContent = keyCode.toString()));
  }
}

initApp();