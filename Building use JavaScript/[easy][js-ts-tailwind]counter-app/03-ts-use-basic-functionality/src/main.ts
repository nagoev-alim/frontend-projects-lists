/**
 * Этот код реализует простое приложение-счетчик.
 * Пользователь может увеличивать, уменьшать значение счетчика или сбрасывать его.
 * Приложение использует TypeScript для манипуляций с DOM и управления состоянием.
 */

import './style.css';

/**
 * Конфигурация приложения
 */
interface AppConfig {
  root: string;
  selectors: {
    count: string;
    buttons: string;
  };
  step: number;
  operations: {
    INCREMENT: string;
    DECREMENT: string;
    RESET: string;
  };
}

/**
 * Состояние приложения
 */
interface AppState {
  counter: number;
  elements: {
    count: HTMLElement | null;
    buttons: NodeListOf<HTMLElement> | null;
  };
}

const APP_CONFIG: AppConfig = {
  root: '#app',
  selectors: {
    count: '[data-counter]',
    buttons: '[data-operation]',
  },
  step: 1,
  operations: {
    INCREMENT: 'increment',
    DECREMENT: 'decrement',
    RESET: 'reset',
  },
};

const APP_STATE: AppState = {
  counter: 0,
  elements: {
    count: null,
    buttons: null,
  },
};

/**
 * Создает HTML структуру приложения
 */
function createAppHTML(): void {
  const { selectors: { count }, operations: { INCREMENT, DECREMENT, RESET }, root } = APP_CONFIG;
  const { counter } = APP_STATE;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  /**
   * Создает HTML кнопки
   * @param text - Текст кнопки
   * @param className - CSS классы кнопки
   * @param operation - Тип операции
   * @returns HTML разметка кнопки
   */
  function createButton(text: string, className: string, operation: string): string {
    return `<button class='${className}' data-operation="${operation}">${text}</button>`;
  }

  rootElement.innerHTML = `
    <div class='w-full max-w-sm mx-auto border rounded-lg p-4 md:p-6 grid gap-4 text-center'>
      <h1 class='text-2xl md:text-5xl font-bold'>Counter</h1>
      <p class='text-6xl md:text-8xl font-bold' ${count.slice(1, -1)}>${counter}</p>
      <div class='grid grid-cols-1 sm:grid-cols-3 gap-2'>
        ${createButton('Decrement', 'border-2 border-red-400 rounded-md p-2 text-red-400', DECREMENT)}
        ${createButton('Reset', 'border-2 rounded-md p-2', RESET)}
        ${createButton('Increment', 'border-2 border-green-400 rounded-md p-2 text-green-400', INCREMENT)}
      </div>
    </div>`;
}

/**
 * Инициализирует DOM элементы в состоянии приложения
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    count: document.querySelector(APP_CONFIG.selectors.count),
    buttons: document.querySelectorAll(APP_CONFIG.selectors.buttons),
  };
}

/**
 * Обновляет значение счетчика в состоянии и на странице
 * @param value - Новое значение счетчика
 */
function updateCounter(value: number): void {
  if (!APP_STATE.elements.count) return;
  APP_STATE.counter = value;
  APP_STATE.elements.count.textContent = APP_STATE.counter.toString();
}

/**
 * Обрабатывает клик по кнопке операции
 * @param event - Объект события клика
 */
function handleOperationClick(event: Event): void {
  const target = event.target as HTMLElement;
  const operation = target.dataset.operation;
  const { operations: { INCREMENT, DECREMENT, RESET }, step } = APP_CONFIG;

  const operationsList: Record<string, () => void> = {
    [INCREMENT]: () => updateCounter(APP_STATE.counter + step),
    [DECREMENT]: () => updateCounter(APP_STATE.counter - step),
    [RESET]: () => updateCounter(0),
  };

  if (!operation || !(operation in operationsList)) return;

  operationsList[operation]();
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();
  APP_STATE.elements.buttons?.forEach(button => button.addEventListener('click', handleOperationClick));
}

initApp();