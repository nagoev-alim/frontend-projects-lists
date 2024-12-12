/**
 * Этот код реализует интерактивное приложение для отображения информации о нажатых клавишах.
 * Он создает пользовательский интерфейс, который показывает код клавиши и ее название при нажатии любой клавиши на клавиатуре.
 */

import './style.css';

/**
 * Интерфейс для конфигурации приложения
 * @interface
 */
interface Config {
  /** Селектор корневого элемента */
  root: string;
  /** Объект с селекторами для различных элементов интерфейса */
  selectors: {
    /** Селектор для элемента с инструкцией */
    instruction: string;
    /** Селектор для контейнера с результатами */
    resultContainer: string;
    /** Селектор для отображения нажатой клавиши */
    keyDisplay: string;
    /** Селектор для отображения кода клавиши */
    keycodeDisplay: string;
  };
}

/**
 * Интерфейс для состояния приложения
 * @interface
 */
interface State {
  /** Объект с элементами DOM */
  elements: {
    /** Элемент с инструкцией */
    instruction: HTMLElement | null;
    /** Контейнер с результатами */
    resultContainer: HTMLElement | null;
    /** Элементы для отображения нажатой клавиши */
    keyDisplay: NodeListOf<HTMLElement> | null;
    /** Элементы для отображения кода клавиши */
    keycodeDisplay: NodeListOf<HTMLElement> | null;
  };
}

/**
 * Интерфейс для утилит приложения
 * @interface
 */
interface Utils {
  /** Функция для рендеринга data-атрибутов */
  renderDataAttributes: (element: string) => string;
}

/**
 * Класс для обнаружения и отображения информации о нажатых клавишах
 */
class KeyPressDetector {
  /** Конфигурация приложения */
  private readonly config: Config;
  /** Состояние приложения */
  private state: State;
  /** Утилиты приложения */
  private readonly utils: Utils;

  /**
   * Создает экземпляр KeyPressDetector
   */
  constructor() {
    this.config = {
      root: '#app',
      selectors: {
        instruction: '[data-instruction]',
        resultContainer: '[data-result-container]',
        keyDisplay: '[data-key-display]',
        keycodeDisplay: '[data-keycode-display]',
      },
    };

    this.state = {
      elements: {
        instruction: null,
        resultContainer: null,
        keyDisplay: null,
        keycodeDisplay: null,
      },
    };

    this.utils = {
      renderDataAttributes: (element: string): string => element.slice(1, -1),
    };

    this.init();
  }

  /**
   * Создает HTML-структуру приложения
   */
  private createAppHTML(): void {
    const { root, selectors: { instruction, resultContainer, keyDisplay, keycodeDisplay } } = this.config;
    const { renderDataAttributes } = this.utils;
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
   * Инициализирует элементы DOM
   */
  private initDOMElements(): void {
    this.state.elements = {
      instruction: document.querySelector<HTMLElement>(this.config.selectors.instruction),
      resultContainer: document.querySelector<HTMLElement>(this.config.selectors.resultContainer),
      keyDisplay: document.querySelectorAll<HTMLElement>(this.config.selectors.keyDisplay),
      keycodeDisplay: document.querySelectorAll<HTMLElement>(this.config.selectors.keycodeDisplay),
    };
  }

  /**
   * Инициализирует приложение
   */
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    if (this.state.elements.resultContainer) this.state.elements.resultContainer.classList.add('hidden');
  }

  /**
   * Обрабатывает событие нажатия клавиши
   * @param {KeyboardEvent} event - Событие клавиатуры
   */
  private handleKeyDown({ key, keyCode }: KeyboardEvent): void {
    if (this.state.elements.instruction && this.state.elements.resultContainer) {
      this.state.elements.instruction.classList.add('hidden');
      this.state.elements.resultContainer.classList.remove('hidden');
    }
    if (this.state.elements.keyDisplay) {
      this.state.elements.keyDisplay.forEach(
        (k) => (k.textContent = key === ' ' ? 'Space' : key)
      );
    }
    if (this.state.elements.keycodeDisplay) {
      this.state.elements.keycodeDisplay.forEach((k) => (k.textContent = keyCode.toString()));
    }
  }
}

new KeyPressDetector();