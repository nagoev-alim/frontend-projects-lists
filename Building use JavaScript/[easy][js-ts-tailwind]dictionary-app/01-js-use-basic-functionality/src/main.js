/**
 * Этот код представляет собой приложение "Английский словарь".
 * Он позволяет пользователям искать значения слов, примеры использования,
 * синонимы и прослушивать произношение. Приложение использует API
 * для получения информации о словах и отображает результаты на странице.
 */

import './style.css';
import { icons } from 'feather-icons';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

/**
 * Конфигурация приложения
 * @type {Object}
 */
const APP_CONFIG = {
  /** @type {string} Корневой элемент приложения */
  root: '#app',
  /** @type {Object} Селекторы для элементов DOM */
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
  /** @type {string} URL API словаря */
  apiUrl: 'https://api.dictionaryapi.dev/api/v2/entries/en/',
};

/**
 * Состояние приложения
 * @type {Object}
 */
const APP_STATE = {
  /** @type {Object} Элементы DOM */
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
  /** @type {Audio|null} Аудио объект для произношения */
  audio: null,
};

/**
 * Утилиты приложения
 * @type {Object}
 */
const APP_UTILS = {
  /**
   * Обрабатывает строку атрибута данных
   * @param {string} element - Строка атрибута данных
   * @returns {string} Обработанная строка
   */
  renderDataAttributes: (element) => element.slice(1, -1),

  /** @type {Object} Конфигурация для toast-уведомлений */
  toastConfig: {
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  },

  /**
   * Показывает toast-уведомление
   * @param {string} message - Сообщение для отображения
   */
  showToast: (message) => {
    Toastify({
      text: message,
      ...APP_UTILS.toastConfig,
    }).showToast();
  },

  /**
   * Обрабатывает ошибки
   * @param {string} message - Сообщение об ошибке
   * @param {Error|null} error - Объект ошибки
   */
  handleError: (message, error = null) => {
    APP_UTILS.showToast(message);
    if (error) console.error(message, error);
  },
};

/**
 * Создает HTML структуру приложения
 */
function createAppHTML() {
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
 * Инициализирует элементы DOM
 */
function initDOMElements() {
  APP_STATE.elements = {
    form: document.querySelector(APP_CONFIG.selectors.form),
    input: document.querySelector(APP_CONFIG.selectors.input),
    clear: document.querySelector(APP_CONFIG.selectors.clear),
    info: document.querySelector(APP_CONFIG.selectors.info),
    result: document.querySelector(APP_CONFIG.selectors.result),
    word: document.querySelector(APP_CONFIG.selectors.word),
    speech: document.querySelector(APP_CONFIG.selectors.speech),
    meaning: document.querySelector(APP_CONFIG.selectors.meaning),
    example: document.querySelector(APP_CONFIG.selectors.example),
    synonyms: document.querySelector(APP_CONFIG.selectors.synonyms),
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();
  APP_STATE.elements.input.addEventListener('input', handleInput);
  APP_STATE.elements.form.addEventListener('submit', handleFormSubmit);
  APP_STATE.elements.clear.addEventListener('click', handleClearClick);
  APP_STATE.elements.speech.addEventListener('click', () => APP_STATE.audio && APP_STATE.audio.play());
  APP_STATE.elements.synonyms.addEventListener('click', handleSynonymClick);
}

/**
 * Обрабатывает ввод в поле поиска
 * @param {Event} event - Событие ввода
 */
function handleInput({ target: { value } }) {
  APP_STATE.elements.clear.className = `${value.trim().length !== 0 ? 'absolute right-2 top-1/2 -translate-y-1/2' : 'hidden'}`;
}

/**
 * Обрабатывает отправку формы
 * @param {Event} event - Событие отправки формы
 */
function handleFormSubmit(event) {
  event.preventDefault();
  const word = event.target.word.value.trim();

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
async function getWord(term) {
  APP_STATE.elements.info.innerHTML = `Searching the meaning of <span class='font-bold'>"${term}"</span>`;

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

    APP_STATE.elements.result.classList.remove('hidden');
  } catch (error) {
    APP_UTILS.handleError(
      `Can't find the meaning of "${term}". Please, try to search for another word.`,
      error,
    );
    APP_STATE.elements.info.innerHTML = `Can't find the meaning of <span class='font-bold'>"${term}"</span>. Please, try to search for another word.`;
    APP_STATE.elements.result.classList.add('hidden');
  }
}

/**
 * Обновляет информацию о слове
 * @param {string} word - Слово
 * @param {string} partOfSpeech - Часть речи
 * @param {string} phoneticText - Фонетическая транскрипция
 */
function updateWordInfo(word, partOfSpeech, phoneticText) {
  APP_STATE.elements.word.querySelector('span').textContent = word;
  APP_STATE.elements.word.querySelector('p').textContent =
    `${partOfSpeech}  /${phoneticText}/`;
}

/**
 * Обновляет значение слова
 * @param {string} definition - Определение слова
 */
function updateMeaning(definition) {
  APP_STATE.elements.meaning.querySelector('p').textContent = definition;
}

/**
 * Обновляет пример использования слова
 * @param {string|undefined} example - Пример использования
 */
function updateExample(example) {
  if (example === undefined) {
    APP_STATE.elements.example.classList.add('hidden');
  } else {
    APP_STATE.elements.example.classList.remove('hidden');
    APP_STATE.elements.example.querySelector('p').textContent = example;
  }
}

/**
 * Обновляет список синонимов
 * @param {string[]} synonyms - Массив синонимов
 */
function updateSynonyms(synonyms) {
  if (synonyms.length !== 0) {
    APP_STATE.elements.synonyms.querySelector('ul').innerHTML = synonyms
      .map(
        (i) =>
          `<li class='border bg-slate-50 rounded px-2 py-1.5 cursor-pointer' data-term='${i}'>${i}</li>`,
      )
      .join('');
    APP_STATE.elements.synonyms.classList.remove('hidden');
  } else {
    APP_STATE.elements.synonyms.classList.add('hidden');
  }
}

/**
 * Обновляет аудио произношение
 * @param {string|undefined} audioSrc - URL аудио файла
 */
function updateAudio(audioSrc) {
  APP_STATE.audio = audioSrc ? new Audio(audioSrc) : null;
  APP_STATE.audio === null
    ? APP_STATE.elements.speech.classList.add('hide')
    : APP_STATE.elements.speech.classList.remove('hidden');
}

/**
 * Обрабатывает клик по кнопке очистки
 */
function handleClearClick() {
  APP_STATE.elements.form.reset();
  APP_STATE.elements.input.focus();

  APP_STATE.elements.clear.classList.add('hidden');
  APP_STATE.elements.info.textContent =
    'Type any existing word and press enter to get meaning, example, synonyms, etc.';
  APP_STATE.elements.result.classList.add('hidden');
}

/**
 * Обрабатывает клик по синониму
 * @param {Event} event - Событие клика
 */
async function handleSynonymClick({
                                    target: {
                                      dataset: { term },
                                    },
                                  }) {
  if (!term) return;
  try {
    await getWord(term);
    APP_STATE.elements.input.value = term;
    APP_STATE.elements.input.focus();
  } catch (error) {
    APP_UTILS.handleError(
      `Can't find the meaning of synonym "${term}". Please, try to search for another word`,
      error,
    );
  }
}

initApp();
