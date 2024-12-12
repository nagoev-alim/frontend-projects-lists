/**
 * Этот код реализует функциональность английского словаря.
 * Он позволяет пользователю искать значения слов, примеры использования,
 * синонимы и прослушивать произношение. Используется API для получения
 * информации о словах и интерфейс построен с использованием HTML и CSS.
 */

import './style.css';
import { icons } from 'feather-icons';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

/**
 * Класс, представляющий функциональность английского словаря.
 */
class Dictionary {
  /**
   * Создает экземпляр класса Dictionary.
   */
  constructor() {
    /**
     * Конфигурация приложения.
     * @type {Object}
     */
    this.config = {
      /** Корневой элемент приложения. */
      root: '#app',
      /** Селекторы для различных элементов DOM. */
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
      /** URL API словаря. */
      apiUrl: 'https://api.dictionaryapi.dev/api/v2/entries/en/',
    };

    /**
     * Состояние приложения.
     * @type {Object}
     */
    this.state = {
      /** Элементы DOM. */
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
      /** Аудио объект для произношения. */
      audio: null,
    };

    /**
     * Утилитарные функции.
     * @type {Object}
     */
    this.utils = {
      /**
       * Преобразует строку селектора в строку для data-атрибута.
       * @param {string} element - Строка селектора.
       * @returns {string} Строка для data-атрибута.
       */
      renderDataAttributes: (element) => element.slice(1, -1),
      
      /**
       * Конфигурация для toast-уведомлений.
       * @type {Object}
       */
      toastConfig: {
        className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
        duration: 3000,
        gravity: 'bottom',
        position: 'center',
      },
      
      /**
       * Показывает toast-уведомление.
       * @param {string} message - Сообщение для отображения.
       */
      showToast: (message) => {
        Toastify({
          text: message,
          ...this.utils.toastConfig,
        }).showToast();
      },
      
      /**
       * Обрабатывает ошибки и показывает уведомление.
       * @param {string} message - Сообщение об ошибке.
       * @param {Error} [error=null] - Объект ошибки.
       */
      handleError: (message, error = null) => {
        this.utils.showToast(message);
        if (error) console.error(message, error);
      },
    };

    this.init();
  }

  /**
   * Создает HTML-структуру приложения.
   */
  createAppHTML() {
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
    } = this.config;
    const { renderDataAttributes } = this.utils;
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
   * Инициализирует DOM-элементы.
   */
  initDOMElements() {
    this.state.elements = {
      form: document.querySelector(this.config.selectors.form),
      input: document.querySelector(this.config.selectors.input),
      clear: document.querySelector(this.config.selectors.clear),
      info: document.querySelector(this.config.selectors.info),
      result: document.querySelector(this.config.selectors.result),
      word: document.querySelector(this.config.selectors.word),
      speech: document.querySelector(this.config.selectors.speech),
      meaning: document.querySelector(this.config.selectors.meaning),
      example: document.querySelector(this.config.selectors.example),
      synonyms: document.querySelector(this.config.selectors.synonyms),
    };
  }

  /**
   * Инициализирует приложение.
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();
    this.state.elements.input.addEventListener('input', this.handleInput.bind(this));
    this.state.elements.form.addEventListener('submit', this.handleFormSubmit.bind(this));
    this.state.elements.clear.addEventListener('click', this.handleClearClick.bind(this));
    this.state.elements.speech.addEventListener('click', () => this.state.audio && this.state.audio.play());
    this.state.elements.synonyms.addEventListener('click', this.handleSynonymClick.bind(this));
  }

  /**
   * Обрабатывает ввод в поле поиска.
   * @param {Event} event - Событие ввода.
   */
  handleInput({ target: { value } }) {
    this.state.elements.clear.className = `${value.trim().length !== 0 ? 'absolute right-2 top-1/2 -translate-y-1/2' : 'hidden'}`;
  }

  /**
   * Обрабатывает отправку формы поиска.
   * @param {Event} event - Событие отправки формы.
   */
  handleFormSubmit(event) {
    event.preventDefault();
    const word = event.target.word.value.trim();

    if (!word || word.length === 0) {
      this.utils.showToast('Please enter a valid word');
      return;
    }
    this.getWord(word);
  }

  /**
   * Получает информацию о слове из API.
   * @param {string} term - Искомое слово.
   */
  async getWord(term) {
    this.state.elements.info.innerHTML = `Searching the meaning of <span class='font-bold'>"${term}"</span>`;

    try {
      const {
        data: [{ phonetics, word, meanings }],
      } = await axios.get(`${this.config.apiUrl}${term}`);
      const { partOfSpeech, definitions, synonyms } = meanings[0];
      const { definition, example } = definitions[0];

      this.updateWordInfo(word, partOfSpeech, phonetics[0]?.text);
      this.updateMeaning(definition);
      this.updateExample(example);
      this.updateSynonyms(synonyms);
      this.updateAudio(phonetics[0]?.audio);

      this.state.elements.result.classList.remove('hidden');
    } catch (error) {
      this.utils.handleError(
        `Can't find the meaning of "${term}". Please, try to search for another word.`,
        error,
      );
      this.state.elements.info.innerHTML = `Can't find the meaning of <span class='font-bold'>"${term}"</span>. Please, try to search for another word.`;
      this.state.elements.result.classList.add('hidden');
    }
  }

  /**
   * Обновляет информацию о слове на странице.
   * @param {string} word - Слово.
   * @param {string} partOfSpeech - Часть речи.
   * @param {string} phoneticText - Фонетическая транскрипция.
   */
  updateWordInfo(word, partOfSpeech, phoneticText) {
    this.state.elements.word.querySelector('span').textContent = word;
    this.state.elements.word.querySelector('p').textContent =
      `${partOfSpeech}  /${phoneticText}/`;
  }

  /**
   * Обновляет значение слова на странице.
   * @param {string} definition - Определение слова.
   */
  updateMeaning(definition) {
    this.state.elements.meaning.querySelector('p').textContent = definition;
  }

  /**
   * Обновляет пример использования слова на странице.
   * @param {string} example - Пример использования.
   */
  updateExample(example) {
    if (example === undefined) {
      this.state.elements.example.classList.add('hidden');
    } else {
      this.state.elements.example.classList.remove('hidden');
      this.state.elements.example.querySelector('p').textContent = example;
    }
  }

  /**
   * Обновляет список синонимов на странице.
   * @param {string[]} synonyms - Массив синонимов.
   */
  updateSynonyms(synonyms) {
    if (synonyms.length !== 0) {
      this.state.elements.synonyms.querySelector('ul').innerHTML = synonyms
        .map(
          (i) =>
            `<li class='border bg-slate-50 rounded px-2 py-1.5 cursor-pointer' data-term='${i}'>${i}</li>`,
        )
        .join('');
      this.state.elements.synonyms.classList.remove('hidden');
    } else {
      this.state.elements.synonyms.classList.add('hidden');
    }
  }

  /**
   * Обновляет аудио произношения слова.
   * @param {string} audioSrc - URL аудиофайла.
   */
  updateAudio(audioSrc) {
    this.state.audio = audioSrc ? new Audio(audioSrc) : null;
    this.state.audio === null
      ? this.state.elements.speech.classList.add('hide')
      : this.state.elements.speech.classList.remove('hidden');
  }

  /**
   * Обрабатывает клик по кнопке очистки.
   */
  handleClearClick() {
    this.state.elements.form.reset();
    this.state.elements.input.focus();

    this.state.elements.clear.classList.add('hidden');
    this.state.elements.info.textContent =
      'Type any existing word and press enter to get meaning, example, synonyms, etc.';
    this.state.elements.result.classList.add('hidden');
  }

  /**
   * Обрабатывает клик по синониму.
   * @param {Event} event - Событие клика.
   */
  async handleSynonymClick({
    target: {
      dataset: { term },
    },
  }) {
    if (!term) return;
    try {
      await this.getWord(term);
      this.state.elements.input.value = term;
      this.state.elements.input.focus();
    } catch (error) {
      this.utils.handleError(
        `Can't find the meaning of synonym "${term}". Please, try to search for another word`,
        error,
      );
    }
  }
}

new Dictionary();
