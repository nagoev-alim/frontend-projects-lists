/**
 * Этот код реализует интерактивную барабанную установку.
 * Пользователи могут играть на барабанах, кликая мышкой или нажимая клавиши на клавиатуре.
 * Каждый барабан представлен изображением и соответствующим звуком.
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
 * Интерфейс для конфигурации приложения
 * @typedef {Object} Config
 * @property {string} root - Селектор корневого элемента
 * @property {Object} selectors - Объект с селекторами элементов
 * @property {string} selectors.drumList - Селектор списка барабанов
 */
interface Config {
  root: string;
  selectors: {
    drumList: string;
  };
}

/**
 * Интерфейс для состояния приложения
 * @typedef {Object} State
 * @property {Object} elements - Объект с элементами DOM
 * @property {HTMLUListElement | null} elements.drumList - Элемент списка барабанов
 */
interface State {
  elements: {
    drumList: HTMLUListElement | null;
  };
}

/**
 * Интерфейс для утилит приложения
 * @typedef {Object} Utils
 * @property {function} renderDataAttributes - Функция для рендеринга data-атрибутов
 */
interface Utils {
  renderDataAttributes: (element: string) => string;
}

/**
 * Интерфейс для элемента барабана
 * @typedef {Object} DrumItem
 * @property {string} key - Клавиша для активации барабана
 * @property {string} image - URL изображения барабана
 * @property {string} sound - Идентификатор звука барабана
 */
interface DrumItem {
  key: string;
  image: string;
  sound: string;
}

/**
 * Класс DrumKit представляет интерактивную барабанную установку
 */
class DrumKit {
  private readonly config: Config;
  private state: State;
  private readonly utils: Utils;

  /**
   * Создает экземпляр DrumKit
   */
  constructor() {
    this.config = {
      root: '#app',
      selectors: {
        drumList: '[data-drum-list]',
      },
    };

    this.state = {
      elements: {
        drumList: null,
      },
    };

    this.utils = {
      renderDataAttributes: (element: string) => element.slice(1, -1),
    };

    this.init();
  }

  /**
   * Создает HTML-разметку приложения
   * @private
   */
  private createAppHTML(): void {
    const {
      root,
      selectors: { drumList },
    } = this.config;
    const { renderDataAttributes } = this.utils;
    const rootElement = document.querySelector(root);
    const drumItems: DrumItem[] = [
      { key: 'w', image: w, sound: 'sound1' },
      { key: 'a', image: a, sound: 'sound2' },
      { key: 's', image: s, sound: 'sound3' },
      { key: 'd', image: d, sound: 'sound4' },
      { key: 'j', image: j, sound: 'sound5' },
      { key: 'k', image: k, sound: 'sound6' },
      { key: 'l', image: l, sound: 'sound7' },
    ];

    if (!rootElement) return;

    rootElement.innerHTML = `
    <div class='drum-kit grid w-full max-w-8xl gap-4 rounded border bg-white p-3 shadow'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Drum 🥁 Kit</h1>
      <ul ${renderDataAttributes(drumList)}>
        ${drumItems.map(item => `<li class='${item.key}' style="background-image: url('${item.image}')" data-drum-key='${item.key}' data-drum-sound='${item.sound}'>${item.key}</li>`).join('')}
      </ul>
    </div>
  `;
  }

  /**
   * Инициализирует элементы DOM
   * @private
   */
  private initDOMElements(): void {
    this.state.elements = {
      drumList: document.querySelector(this.config.selectors.drumList),
    };
  }

  /**
   * Инициализирует приложение
   * @private
   */
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();
    this.state.elements.drumList?.addEventListener('click', this.handleDrumKit.bind(this));
    window.addEventListener('keydown', this.handleDrumKit.bind(this));
  }

  /**
   * Обрабатывает взаимодействие с барабанной установкой
   * @param {MouseEvent | KeyboardEvent} event - Событие взаимодействия
   * @private
   */
  private handleDrumKit(event: MouseEvent | KeyboardEvent): void {
    const key = event instanceof MouseEvent
      ? (event.target as HTMLElement).closest<HTMLElement>('[data-drum-key]')
      : document.querySelector<HTMLElement>(`[data-drum-key="${event.key.toLowerCase()}"]`);

    if (key) {
      const sound = key.dataset.drumSound;
      this.animate(key);
      if (sound) this.play(sound);
    }
  }

  /**
   * Анимирует элемент барабана
   * @param {HTMLElement} element - Элемент для анимации
   * @private
   */
  private animate(element: HTMLElement): void {
    element.classList.add('pressed');
    setTimeout(() => element.classList.remove('pressed'), 300);
  }

  /**
   * Воспроизводит звук барабана
   * @param {string} audioName - Идентификатор звука
   * @private
   */
  private play(audioName: string): void {
    const audioMap: { [key: string]: string } = {
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
