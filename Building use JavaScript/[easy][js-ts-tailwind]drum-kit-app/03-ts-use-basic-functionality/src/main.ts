/**
 * Этот код реализует функциональность барабанной установки в веб-приложении.
 * Пользователи могут воспроизводить звуки барабанов, кликая на визуальные элементы
 * или нажимая соответствующие клавиши на клавиатуре. Код обрабатывает пользовательский ввод,
 * воспроизводит соответствующие звуки и добавляет визуальные эффекты при активации барабанов.
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
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента приложения
 * @property {Object} selectors - Объект с селекторами элементов
 * @property {string} selectors.drumList - Селектор списка барабанов
 */
interface AppConfig {
  root: string;
  selectors: {
    drumList: string;
  };
}

/**
 * Конфигурация приложения
 * @type {AppConfig}
 */
const APP_CONFIG: AppConfig = {
  root: '#app',
  selectors: {
    drumList: '[data-drum-list]',
  },
};

/**
 * Интерфейс для состояния приложения
 * @typedef {Object} AppState
 * @property {Object} elements - Объект с DOM элементами
 * @property {HTMLUListElement | null} elements.drumList - Элемент списка барабанов
 */
interface AppState {
  elements: {
    drumList: HTMLUListElement | null;
  };
}

/**
 * Состояние приложения
 * @type {AppState}
 */
const APP_STATE: AppState = {
  elements: {
    drumList: null,
  },
};

/**
 * Интерфейс для утилит приложения
 * @typedef {Object} AppUtils
 * @property {function(string): string} renderDataAttributes - Функция для обработки data-атрибутов
 */
interface AppUtils {
  renderDataAttributes: (element: string) => string;
}

/**
 * Утилиты приложения
 * @type {AppUtils}
 */
const APP_UTILS: AppUtils = {
  renderDataAttributes: (element: string) => element.slice(1, -1),
};

/**
 * Интерфейс для представления элемента барабанной установки.
 * @interface DrumItem
 * @property {string} key - Клавиша, соответствующая барабану.
 * @property {string} image - URL изображения барабана.
 * @property {string} sound - Идентификатор звука барабана.
 */
interface DrumItem {
  key: string;
  image: string;
  sound: string;
}


/**
 * Создает HTML структуру приложения
 */
function createAppHTML(): void {
  const {
    root,
    selectors: { drumList },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
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
 * Инициализирует DOM элементы в состоянии приложения
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    drumList: document.querySelector(APP_CONFIG.selectors.drumList),
  };
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();
  APP_STATE.elements.drumList?.addEventListener('click', handleDrumKit);
  window.addEventListener('keydown', handleDrumKit);
}

/**
 * Обрабатывает события барабанной установки (клик мыши или нажатие клавиши)
 * @param {MouseEvent | KeyboardEvent} event - Событие мыши или клавиатуры
 */
function handleDrumKit(event: MouseEvent | KeyboardEvent): void {
  if (event.type === 'click' && event instanceof MouseEvent) {
    const target = event.target as HTMLElement;
    const key = target.closest<HTMLElement>('[data-drum-key]');
    const sound = key?.dataset.drumSound;

    if (key && sound) {
      animate(key);
      play(sound);
    }
  } else if (event.type === 'keydown' && event instanceof KeyboardEvent) {
    const keyboardKey = event.key.toLowerCase();
    const key = document.querySelector<HTMLElement>(
      `[data-drum-key="${keyboardKey}"]`,
    );
    if (key) {
      const sound = key.dataset.drumSound;
      if (sound) {
        animate(key);
        play(sound);
      }
    }
  }
}

/**
 * Добавляет анимацию к элементу барабана
 * @param {HTMLElement} element - Элемент барабана для анимации
 */
function animate(element: HTMLElement): void {
  element.classList.add('pressed');
  setTimeout(() => element.classList.remove('pressed'), 300);
}

/**
 * Интерфейс для карты аудио файлов
 * @typedef {Object} AudioMap
 * @property {string} [key: string] - Путь к аудио файлу
 */
interface AudioMap {
  [key: string]: string;
}

/**
 * Воспроизводит звук барабана
 * @param {string} audioName - Имя звукового файла для воспроизведения
 */
function play(audioName: string): void {
  const audioMap: AudioMap = {
    sound1,
    sound2,
    sound3,
    sound4,
    sound5,
    sound6,
    sound7,
  };
  const audio: string | undefined = audioMap[audioName];
  if (audio) {
    new Audio(audio).play();
  }
}

initApp();
