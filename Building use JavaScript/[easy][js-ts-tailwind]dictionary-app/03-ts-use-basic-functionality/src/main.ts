/**
 * Этот код представляет собой приложение "Английский словарь".
 * Оно позволяет пользователям искать значения слов, примеры использования,
 * синонимы и прослушивать произношение. Приложение использует API
 * для получения информации о словах и отображает результаты на странице.
 */

import './style.css';
import { icons } from 'feather-icons';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

/**
 * Интерфейс для конфигурации приложения
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента
 * @property {Object.<string, string>} selectors - Объект с селекторами элементов
 * @property {string} apiUrl - URL API словаря
 */
interface AppConfig {
  root: string;
  selectors: {
    [key: string]: string;
  };
  apiUrl: string;
}

/**
 * Интерфейс для состояния приложения
 * @typedef {Object} AppState
 * @property {Object.<string, HTMLElement | null>} elements - Объект с элементами DOM
 * @property {HTMLAudioElement | null} audio - Аудио элемент для произношения
 */
interface AppState {
  elements: {
    [key: string]: HTMLElement | null;
  };
  audio: HTMLAudioElement | null;
}

/**
 * Интерфейс для утилит приложения
 * @typedef {Object} AppUtils
 * @property {function(string): string} renderDataAttributes - Функция для рендеринга data-атрибутов
 * @property {Object} toastConfig - Конфигурация для уведомлений
 * @property {function(string): void} showToast - Функция для отображения уведомлений
 * @property {function(string, any?): void} handleError - Функция для обработки ошибок
 */
interface AppUtils {
  renderDataAttributes: (element: string) => string;
  toastConfig: {
    className: string;
    duration: number;
    gravity: string;
    position: string;
  };
  showToast: (message: string) => void;
  handleError: (message: string, error?: any) => void;
}

/**
 * Конфигурация приложения
 * @type {AppConfig}
 */
const APP_CONFIG: AppConfig = {
  root: '#app',
  selectors: {
    form: '[data-dictionary-form]',
    input: '[data-dictionary-input]',
    clear: '[data-dictionary-clear]',
    info: '[data-dictionary-info]',
    result: '[data-dictionary-result]',
    word: '[data-dictionary-word]',
    speech: '[data-dictionary-speech]',
    meaning: '[data-dictionary-meaning]',
    example: '[data-dictionary-example]',
    synonyms: '[data-dictionary-synonyms]',
  },
  apiUrl: 'https://api.dictionaryapi.dev/api/v2/entries/en/',
};

/**
 * Состояние приложения
 * @type {AppState}
 */
const APP_STATE: AppState = {
  elements: {
    form: null,
    input: null,
    clear: null,
    info: null,
    result: null,
    word: null,
    speech: null,
    meaning: null,
    example: null,
    synonyms: null,
  },
  audio: null,
};

/**
 * Утилиты приложения
 * @type {AppUtils}
 */
const APP_UTILS: AppUtils = {
  renderDataAttributes: (element: string) => element.slice(1, -1),
  toastConfig: {
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  },
  showToast: (message: string) => {
    // @ts-ignore
    Toastify({
      text: message,
      ...APP_UTILS.toastConfig,
    }).showToast();
  },
  handleError: (message: string, error: any = null) => {
    APP_UTILS.showToast(message);
    if (error) console.error(message, error);
  },
};

/**
 * Создает HTML-структуру приложения
 */
function createAppHTML(): void {
  const {
    root,
    selectors: {
      form,
      input,
      clear,
      info,
      result,
      word,
      speech,
      meaning,
      example,
      synonyms,
    },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='grid max-w-md w-full gap-4 rounded border bg-white p-3 shadow'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>English Dictionary</h1>
      <form ${renderDataAttributes(form)}>
        <label class='relative w-full'>
          <input
            class='w-full rounded border bg-slate-50 px-3 py-2 pl-9 pr-8 focus:border-blue-400 focus:outline-none'
            type='text'
            placeholder='Search a word'
            name='word'
            spellcheck='false'
            ${renderDataAttributes(input)}
          >
          <div class='absolute left-2 top-1/2 -translate-y-1/2'>${icons.search.toSvg()}</div>
          <button
            class='absolute right-2 top-1/2 -translate-y-1/2 hidden'
            type='button'
            ${renderDataAttributes(clear)}
          >
            ${icons.x.toSvg()}
          </button>
        </label>
      </form>
      <p ${renderDataAttributes(info)}>Type any existing word and press enter to get meaning, example, synonyms, etc.</p>
      <div class='hidden' ${renderDataAttributes(result)}>
        <div class='mb-3 flex items-center justify-between gap-2'>
          <div ${renderDataAttributes(word)}>
            <span class='text-xl font-bold'>car</span>
            <p class='text-gray-500'>noun //kɑː//</p>
          </div>
          <button class='border p-3 hover:bg-slate-50' ${renderDataAttributes(speech)}>
            ${icons['volume-2'].toSvg()}
          </button>
        </div>
        <div class='mb-2 rounded border-2 p-2' ${renderDataAttributes(meaning)}>
          <h3 class='text-lg font-bold'>Meaning</h3>
          <p></p>
        </div>
        <div class='mb-2 rounded border-2 p-2' ${renderDataAttributes(example)}>
          <h3 class='text-lg font-bold'>Example</h3>
          <p></p>
        </div>
        <div class='rounded border-2 p-2' ${renderDataAttributes(synonyms)}>
          <h3 class='text-lg font-bold'>Synonyms</h3>
          <ul class='flex flex-wrap gap-1.5'></ul>
        </div>
      </div>
    </div>
  `;
}

/**
 * Инициализирует DOM-элементы приложения
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    form: document.querySelector<HTMLFormElement>(APP_CONFIG.selectors.form),
    input: document.querySelector<HTMLInputElement>(APP_CONFIG.selectors.input),
    clear: document.querySelector<HTMLButtonElement>(APP_CONFIG.selectors.clear),
    info: document.querySelector<HTMLParagraphElement>(APP_CONFIG.selectors.info),
    result: document.querySelector<HTMLDivElement>(APP_CONFIG.selectors.result),
    word: document.querySelector<HTMLDivElement>(APP_CONFIG.selectors.word),
    speech: document.querySelector<HTMLButtonElement>(APP_CONFIG.selectors.speech),
    meaning: document.querySelector<HTMLDivElement>(APP_CONFIG.selectors.meaning),
    example: document.querySelector<HTMLDivElement>(APP_CONFIG.selectors.example),
    synonyms: document.querySelector<HTMLDivElement>(APP_CONFIG.selectors.synonyms),
  };
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();
  APP_STATE.elements.input?.addEventListener('input', handleInput);
  APP_STATE.elements.form?.addEventListener('submit', handleFormSubmit);
  APP_STATE.elements.clear?.addEventListener('click', handleClearClick);
  APP_STATE.elements.speech?.addEventListener('click', () => APP_STATE.audio && APP_STATE.audio.play());
  APP_STATE.elements.synonyms?.addEventListener('click', handleSynonymClick);
}

/**
 * Обрабатывает ввод в поле поиска
 * @param {Event} event - Событие ввода
 */
function handleInput({ target }: Event): void {
  const inputElement = target as HTMLInputElement;
  if (APP_STATE.elements.clear) {
    APP_STATE.elements.clear.className = `${inputElement.value.trim().length !== 0 ? 'absolute right-2 top-1/2 -translate-y-1/2' : 'hidden'}`;
  }
}

/**
 * Обрабатывает отправку формы поиска
 * @param {Event} event - Событие отправки формы
 */
function handleFormSubmit(event: Event): void {
  event.preventDefault();
  const formElement = event.target as HTMLFormElement;
  const word = (formElement.word as HTMLInputElement).value.trim();

  if (!word || word.length === 0) {
    APP_UTILS.showToast('Please enter a valid word');
    return;
  }
  getWord(word);
}

/**
 * Получает информацию о слове из API
 * @param {string} term - Искомое слово
 */
async function getWord(term: string): Promise<void> {
  if (APP_STATE.elements.info) {
    APP_STATE.elements.info.innerHTML = `Searching the meaning of <span class='font-bold'>"${term}"</span>`;
  }

  try {
    const {
      data: [{ phonetics, word, meanings }],
    } = await axios.get(`${APP_CONFIG.apiUrl}${term}`);
    const { partOfSpeech, definitions, synonyms } = meanings[0];
    const { definition, example } = definitions[0];

    updateWordInfo(word, partOfSpeech, phonetics[0]?.text);
    updateMeaning(definition);
    updateExample(example);
    updateSynonyms(synonyms);
    updateAudio(phonetics[0]?.audio);

    APP_STATE.elements.result?.classList.remove('hidden');
  } catch (error) {
    APP_UTILS.handleError(
      `Can't find the meaning of "${term}". Please, try to search for another word.`,
      error,
    );
    if (APP_STATE.elements.info) {
      APP_STATE.elements.info.innerHTML = `Can't find the meaning of <span class='font-bold'>"${term}"</span>. Please, try to search for another word.`;
    }
    APP_STATE.elements.result?.classList.add('hidden');
  }
}

/**
 * Обновляет информацию о слове на странице
 * @param {string} word - Слово
 * @param {string} partOfSpeech - Часть речи
 * @param {string} phoneticText - Фонетическая транскрипция
 */
function updateWordInfo(word: string, partOfSpeech: string, phoneticText: string): void {
  const wordElement = APP_STATE.elements.word;
  if (wordElement) {
    const spanElement = wordElement.querySelector('span');
    const pElement = wordElement.querySelector('p');
    if (spanElement) spanElement.textContent = word;
    if (pElement) pElement.textContent = `${partOfSpeech}  /${phoneticText}/`;
  }
}

/**
 * Обновляет значение слова на странице
 * @param {string} definition - Определение слова
 */
function updateMeaning(definition: string): void {
  const meaningElement = APP_STATE.elements.meaning;
  if (meaningElement) {
    const pElement = meaningElement.querySelector('p');
    if (pElement) pElement.textContent = definition;
  }
}

/**
 * Обновляет пример использования слова на странице
 * @param {string | undefined} example - Пример использования слова
 */
function updateExample(example: string | undefined): void {
  const exampleElement = APP_STATE.elements.example;
  if (exampleElement) {
    if (example === undefined) {
      exampleElement.classList.add('hidden');
    } else {
      exampleElement.classList.remove('hidden');
      const pElement = exampleElement.querySelector('p');
      if (pElement) pElement.textContent = example;
    }
  }
}

/**
 * Обновляет список синонимов на странице
 * @param {string[]} synonyms - Массив синонимов
 */
function updateSynonyms(synonyms: string[]): void {
  const synonymsElement = APP_STATE.elements.synonyms;
  if (synonymsElement) {
    if (synonyms.length !== 0) {
      const ulElement = synonymsElement.querySelector('ul');
      if (ulElement) {
        ulElement.innerHTML = synonyms
          .map(
            (i) =>
              `<li class='border bg-slate-50 rounded px-2 py-1.5 cursor-pointer' data-term='${i}'>${i}</li>`,
          )
          .join('');
      }
      synonymsElement.classList.remove('hidden');
    } else {
      synonymsElement.classList.add('hidden');
    }
  }
}

/**
 * Обновляет аудио элемент для произношения слова
 * @param {string | undefined} audioSrc - URL аудио файла
 */
function updateAudio(audioSrc: string | undefined): void {
  APP_STATE.audio = audioSrc ? new Audio(audioSrc) : null;
  if (APP_STATE.elements.speech) {
    APP_STATE.audio === null
      ? APP_STATE.elements.speech.classList.add('hide')
      : APP_STATE.elements.speech.classList.remove('hidden');
  }
}

/**
 * Обрабатывает клик по кнопке очистки формы
 */
function handleClearClick(): void {
  APP_STATE.elements.form?.reset();
  APP_STATE.elements.input?.focus();

  APP_STATE.elements.clear?.classList.add('hidden');
  if (APP_STATE.elements.info) {
    APP_STATE.elements.info.textContent =
      'Type any existing word and press enter to get meaning, example, synonyms, etc.';
  }
  APP_STATE.elements.result?.classList.add('hidden');
}

/**
 * Обрабатывает клик по синониму
 * @param {MouseEvent} event - Событие клика мыши
 */
async function handleSynonymClick(event: MouseEvent): Promise<void> {
  const target = event.target as HTMLElement;
  const term = target.dataset.term;
  if (!term) return;
  try {
    await getWord(term);
    if (APP_STATE.elements.input) {
      APP_STATE.elements.input.value = term;
      APP_STATE.elements.input.focus();
    }
  } catch (error) {
    APP_UTILS.handleError(
      `Can't find the meaning of synonym "${term}". Please, try to search for another word`,
      error,
    );
  }
}

initApp();
