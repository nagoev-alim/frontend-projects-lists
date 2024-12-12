/**
 * Этот код реализует эффект печатной машинки для текста на веб-странице.
 * Он создает HTML-разметку, инициализирует необходимые элементы DOM и
 * запускает анимацию печати и удаления текста. Весь функционал
 * инкапсулирован в классе TypeWritingEffect.
 */

import './style.css';

/**
 * Класс, реализующий эффект печатной машинки
 */
class TypeWritingEffect {
  /**
   * Создает экземпляр TypeWritingEffect
   */
  constructor() {
    /**
     * Конфигурация приложения
     * @type {{root: string, selectors: {typewriterTarget: string}}}
     */
    this.config = {
      root: '#app',
      selectors: {
        typewriterTarget: '[data-typewriter-target]',
      },
    };

    /**
     * Состояние приложения
     * @type {{elements: {typewriterTarget: null}, currentText: string, wordIndex: number, isDeleting: boolean}}
     */
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
   * Создает HTML-разметку приложения
   */
  createAppHTML() {
    const { root } = this.config;
    const rootElement = document.querySelector(root);

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
  initDOMElements() {
    this.state.elements = {
      typewriterTarget: document.querySelector(this.config.selectors.typewriterTarget),
    };
  }

  /**
   * Инициализирует приложение
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();
    this.handleTyping();
  }

  /**
   * Обрабатывает эффект печатной машинки
   */
  handleTyping() {
    const { currentText, wordIndex, isDeleting } = this.state;
    const { typewriterTarget } = this.state.elements;

    const words = JSON.parse(typewriterTarget.dataset.typewriterWords);
    const pause = parseInt(typewriterTarget.dataset.typewriterPause, 10);

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