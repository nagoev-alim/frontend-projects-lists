/**
 * Этот файл содержит реализацию эффекта печатающейся машинки.
 * Класс TypeWritingEffect создает HTML-структуру, инициализирует
 * необходимые элементы DOM и управляет анимацией текста, создавая
 * иллюзию печати и удаления слов.
 */

import './style.css';

/**
 * Интерфейс для конфигурации приложения
 */
interface Config {
  /** Селектор корневого элемента */
  root: string;
  /** Объект с селекторами */
  selectors: {
    /** Селектор для целевого элемента эффекта печатающейся машинки */
    typewriterTarget: string;
  };
}

/**
 * Интерфейс для состояния приложения
 */
interface State {
  /** Объект с элементами DOM */
  elements: {
    /** Целевой элемент для эффекта печатающейся машинки */
    typewriterTarget: HTMLElement | null;
  };
  /** Текущий отображаемый текст */
  currentText: string;
  /** Индекс текущего слова */
  wordIndex: number;
  /** Флаг, указывающий, происходит ли удаление текста */
  isDeleting: boolean;
}

/**
 * Класс, реализующий эффект печатающейся машинки
 */
class TypeWritingEffect {
  /** Конфигурация приложения */
  private readonly config: Config;
  /** Состояние приложения */
  private readonly state: State;

  /**
   * Конструктор класса
   */
  constructor() {
    this.config = {
      root: '#app',
      selectors: {
        typewriterTarget: '[data-typewriter-target]',
      },
    };

    this.state = {
      elements: {
        typewriterTarget: null,
      },
      currentText: '',
      wordIndex: 0,
      isDeleting: false,
    };

    this.init();
  }

  /**
   * Создает HTML-структуру приложения
   */
  private createAppHTML(): void {
    const { root } = this.config;
    const rootElement = document.querySelector<HTMLElement>(root);

    if (!rootElement) return;

    rootElement.innerHTML = `
    <div class='max-w-md w-full rounded border bg-white p-3 shadow grid gap-4'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Typewriter Effect</h1>
      <h3 class='text-center text-2xl'>
        John Doe The
        <span 
          data-typewriter-target 
          data-typewriter-pause='1000' 
          data-typewriter-words='["Developer", "Designer", "Creator"]'
        ></span>
      </h3>
    </div>
  `;
  }

  /**
   * Инициализирует элементы DOM
   */
  private initDOMElements(): void {
    this.state.elements = {
      typewriterTarget: document.querySelector<HTMLElement>(this.config.selectors.typewriterTarget),
    };
  }

  /**
   * Инициализирует приложение
   */
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();
    this.handleTyping();
  }

  /**
   * Обрабатывает эффект печати
   */
  private handleTyping(): void {
    const { currentText, wordIndex, isDeleting } = this.state;
    const { typewriterTarget } = this.state.elements;

    if (!typewriterTarget) return;

    const words: string[] = JSON.parse(typewriterTarget.dataset.typewriterWords || '[]');
    const pause: number = parseInt(typewriterTarget.dataset.typewriterPause || '0', 10);

    const currentWord = words[wordIndex % words.length];
    this.state.currentText = currentWord.substring(0, isDeleting ? currentText.length - 1 : currentText.length + 1);
    typewriterTarget.innerHTML = `<span class='txt'>${this.state.currentText}</span>`;

    const typeSpeed = isDeleting ? 150 : (this.state.currentText === currentWord ? pause : 300);

    if (!isDeleting && this.state.currentText === currentWord) {
      this.state.isDeleting = true;
    } else if (isDeleting && this.state.currentText === '') {
      this.state.isDeleting = false;
      this.state.wordIndex++;
    }

    requestAnimationFrame(() => setTimeout(this.handleTyping.bind(this), typeSpeed));
  }
}

new TypeWritingEffect();