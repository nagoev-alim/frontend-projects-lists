/**
 * Этот код реализует интерактивный барабанный набор (Drum Kit).
 * Пользователи могут играть на барабанах, кликая мышкой или нажимая клавиши на клавиатуре.
 * Каждый барабан представлен визуально и имеет соответствующий звук.
 */

import './style.css';
import w from '/images/tom1.png';
import a from '/images/tom2.png';
import s from '/images/tom3.png';
import d from '/images/tom4.png';
import j from '/images/snare.png';
import k from '/images/crash.png';
import l from '/images/kick.png';
import sound1 from '/sounds/tom-1.mp3';
import sound2 from '/sounds/tom-2.mp3';
import sound3 from '/sounds/tom-3.mp3';
import sound4 from '/sounds/tom-4.mp3';
import sound5 from '/sounds/crash.mp3';
import sound6 from '/sounds/snare.mp3';
import sound7 from '/sounds/kick-bass.mp3';

/**
 * Класс DrumKit представляет интерактивный барабанный набор.
 */
class DrumKit {
  /**
   * Создает экземпляр DrumKit.
   */
  constructor() {
    /**
     * Конфигурация приложения.
     * @type {Object}
     */
    this.config = {
      /** @type {string} Корневой элемент приложения */
      root: '#app',
      /** @type {Object} Селекторы для элементов DOM */
      selectors: {
        /** @type {string} Селектор для списка барабанов */
        drumList: '[data-drum-list]',
      },
    };

    /**
     * Состояние приложения.
     * @type {Object}
     */
    this.state = {
      /** @type {Object} Элементы DOM */
      elements: {
        /** @type {HTMLElement|null} Элемент списка барабанов */
        drumList: null,
      },
    };

    /**
     * Утилиты приложения.
     * @type {Object}
     */
    this.utils = {
      /**
       * Обрабатывает строку атрибута данных.
       * @param {string} element - Строка атрибута данных.
       * @returns {string} Обработанная строка.
       */
      renderDataAttributes: (element) => element.slice(1, -1),
    };

    this.init();
  }

  /**
   * Создает HTML-разметку приложения.
   */
  createAppHTML() {
    const {
      root,
      selectors: { drumList },
    } = this.config;
    const { renderDataAttributes } = this.utils;
    const rootElement = document.querySelector(root);

    if (!rootElement) return;

    rootElement.innerHTML = `
    <div class='drum-kit grid w-full max-w-8xl gap-4 rounded border bg-white p-3 shadow'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Drum 🥁 Kit</h1>
      <ul ${renderDataAttributes(drumList)}>
        <li class='w' style="background-image: url('${w}')" data-drum-key="w" data-drum-sound="sound1">w</li>
        <li class='a' style="background-image: url('${a}')" data-drum-key="a" data-drum-sound="sound2">a</li>
        <li class='s' style="background-image: url('${s}')" data-drum-key="s" data-drum-sound="sound3">s</li>
        <li class='d' style="background-image: url('${d}')" data-drum-key="d" data-drum-sound="sound4">d</li>
        <li class='j' style="background-image: url('${j}')" data-drum-key="j" data-drum-sound="sound5">j</li>
        <li class='k' style="background-image: url('${k}')" data-drum-key="k" data-drum-sound="sound6">k</li>
        <li class='l' style="background-image: url('${l}')" data-drum-key="l" data-drum-sound="sound7">l</li>
      </ul>
    </div>
  `;
  }

  /**
   * Инициализирует элементы DOM.
   */
  initDOMElements() {
    this.state.elements = {
      drumList: document.querySelector(this.config.selectors.drumList),
    };
  }

  /**
   * Инициализирует приложение.
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();
    this.state.elements.drumList.addEventListener('click', this.handleDrumKit.bind(this));
    window.addEventListener('keydown', this.handleDrumKit.bind(this));
  }

  /**
   * Обрабатывает взаимодействие с барабанным набором.
   * @param {Event} event - Событие взаимодействия.
   */
  handleDrumKit({ type, target, key: keyboardKey }) {
    if (type === 'click') {
      const key = target.closest('[data-drum-key]');
      const sound = target.dataset.drumSound;

      if (key) {
        this.animate(key);
        this.play(sound);
      }
    } else if (type === 'keydown') {
      const key = document.querySelector(
        `[data-drum-key="${keyboardKey.toLowerCase()}"]`,
      );
      if (key) {
        const sound = key.dataset.drumSound;
        this.animate(key);
        this.play(sound);
      }
    }
  }

  /**
   * Анимирует элемент барабана.
   * @param {HTMLElement} element - Элемент для анимации.
   */
  animate(element) {
    element.classList.add('pressed');
    setTimeout(() => element.classList.remove('pressed'), 300);
  }

  /**
   * Воспроизводит звук барабана.
   * @param {string} audioName - Имя аудиофайла для воспроизведения.
   */
  play(audioName) {
    const audioMap = {
      sound1,
      sound2,
      sound3,
      sound4,
      sound5,
      sound6,
      sound7,
    };
    const audio = audioMap[audioName];
    if (audio) {
      new Audio(audio).play();
    }
  }
}

new DrumKit();
