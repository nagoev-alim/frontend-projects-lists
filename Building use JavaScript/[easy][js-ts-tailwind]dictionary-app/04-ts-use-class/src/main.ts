/**
 * Этот файл содержит класс Dictionary, который реализует функциональность
 * английского словаря. Он позволяет пользователям искать слова, получать
 * их значения, примеры использования, синонимы и произношение. Класс
 * использует API для получения данных о словах и предоставляет
 * интерактивный пользовательский интерфейс для взаимодействия со словарем.
 */

import './style.css';
import { icons } from 'feather-icons';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

/**
 * Интерфейс для конфигурации словаря
 */
interface Config {
  /** Корневой селектор для приложения */
  root: string;
  /** Объект с селекторами для различных элементов DOM */
  selectors: {
    [key: string]: string;
  };
  /** URL API словаря */
  apiUrl: string;
}

/**
 * Интерфейс для хранения состояния приложения
 */
interface State {
  /** Объект с элементами DOM */
  elements: {
    [key: string]: HTMLElement | null;
  };
  /** Аудио элемент для произношения слова */
  audio: HTMLAudioElement | null;
}

/**
 * Интерфейс для вспомогательных утилит
 */
interface Utils {
  /** Функция для рендеринга data-атрибутов */
  renderDataAttributes: (element: string) => string;
  /** Конфигурация для всплывающих уведомлений */
  toastConfig: {
    className: string;
    duration: number;
    gravity: string;
    position: string;
  };
  /** Функция для отображения всплывающего уведомления */
  showToast: (message: string) => void;
  /** Функция для обработки ошибок */
  handleError: (message: string, error?: any) => void;
}

/**
 * Интерфейс для данных, получаемых от API словаря
 */
interface DictionaryData {
  phonetics: Array<{ text?: string; audio?: string }>;
  word: string;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{ definition: string; example?: string }>;
    synonyms: string[];
  }>;
}

/**
 * Класс, реализующий функциональность английского словаря
 */
class Dictionary {
  private config: Config;
  private state: State;
  private utils: Utils;

  /**
   * Создает экземпляр класса Dictionary
   */
  constructor() {
    this.config = {
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

    this.state = {
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

    this.utils = {
      renderDataAttributes: (element: string): string => element.slice(1, -1),
      toastConfig: {
        className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
        duration: 3000,
        gravity: 'bottom',
        position: 'center',
      },
      showToast: (message: string): void => {
        // @ts-ignore
        Toastify({
          text: message,
          ...this.utils.toastConfig,
        }).showToast();
      },
      handleError: (message: string, error: any = null): void => {
        this.utils.showToast(message);
        if (error) console.error(message, error);
      },
    };

    this.init();
  }

  /**
   * Создает HTML структуру приложения
   */
  private createAppHTML(): void {
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
   * Инициализирует DOM элементы
   */
  private initDOMElements(): void {
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
   * Инициализирует приложение
   */
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();
    this.state.elements.input?.addEventListener('input', this.handleInput.bind(this));
    this.state.elements.form?.addEventListener('submit', this.handleFormSubmit.bind(this));
    this.state.elements.clear?.addEventListener('click', this.handleClearClick.bind(this));
    this.state.elements.speech?.addEventListener('click', () => this.state.audio && this.state.audio.play());
    this.state.elements.synonyms?.addEventListener('click', this.handleSynonymClick.bind(this));
  }

  /**
   * Обрабатывает ввод в поле поиска
   * @param event - Событие ввода
   */
  private handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (this.state.elements.clear) {
      this.state.elements.clear.className = `${target.value.trim().length !== 0 ? 'absolute right-2 top-1/2 -translate-y-1/2' : 'hidden'}`;
    }
  }

  /**
   * Обрабатывает отправку формы поиска
   * @param event - Событие отправки формы
   */
  private handleFormSubmit(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const word = (form.word as HTMLInputElement).value.trim();

    if (!word || word.length === 0) {
      this.utils.showToast('Please enter a valid word');
      return;
    }
    this.getWord(word);
  }

  /**
   * Получает информацию о слове из API
   * @param term - Искомое слово
   */
  private async getWord(term: string): Promise<void> {
    if (this.state.elements.info) {
      this.state.elements.info.innerHTML = `Searching the meaning of <span class='font-bold'>"${term}"</span>`;
    }

    try {
      const { data } = await axios.get<DictionaryData[]>(`${this.config.apiUrl}${term}`);
      const [{ phonetics, word, meanings }] = data;
      const { partOfSpeech, definitions, synonyms } = meanings[0];
      const { definition, example } = definitions[0];

      this.updateWordInfo(word, partOfSpeech, phonetics[0]?.text);
      this.updateMeaning(definition);
      this.updateExample(example);
      this.updateSynonyms(synonyms);
      this.updateAudio(phonetics[0]?.audio);

      this.state.elements.result?.classList.remove('hidden');
    } catch (error) {
      this.utils.handleError(
        `Can't find the meaning of "${term}". Please, try to search for another word.`,
        error,
      );
      if (this.state.elements.info) {
        this.state.elements.info.innerHTML = `Can't find the meaning of <span class='font-bold'>"${term}"</span>. Please, try to search for another word.`;
      }
      this.state.elements.result?.classList.add('hidden');
    }
  }

  /**
   * Этот код представляет собой часть класса Dictionary, который реализует
   * функциональность английского словаря. Здесь представлены методы для
   * обновления различных частей пользовательского интерфейса, включая
   * информацию о слове, его значение, примеры использования, синонимы и
   * аудио произношение. Также включены методы для обработки очистки формы
   * и клика по синонимам.
   */

  /**
   * Обновляет информацию о слове в пользовательском интерфейсе
   * @param word - Слово
   * @param partOfSpeech - Часть речи
   * @param phoneticText - Фонетическая транскрипция (опционально)
   */
  private updateWordInfo(word: string, partOfSpeech: string, phoneticText?: string): void {
    const wordElement = this.state.elements.word;
    if (wordElement) {
      const spanElement = wordElement.querySelector('span');
      const pElement = wordElement.querySelector('p');
      if (spanElement) spanElement.textContent = word;
      if (pElement) pElement.textContent = `${partOfSpeech}  /${phoneticText || ''}`;
    }
  }

  /**
   * Обновляет значение слова в пользовательском интерфейсе
   * @param definition - Определение слова
   */
  private updateMeaning(definition: string): void {
    const meaningElement = this.state.elements.meaning;
    if (meaningElement) {
      const pElement = meaningElement.querySelector('p');
      if (pElement) pElement.textContent = definition;
    }
  }

  /**
   * Обновляет пример использования слова в пользовательском интерфейсе
   * @param example - Пример использования слова (опционально)
   */
  private updateExample(example?: string): void {
    const exampleElement = this.state.elements.example;
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
   * Обновляет список синонимов в пользовательском интерфейсе
   * @param synonyms - Массив синонимов
   */
  private updateSynonyms(synonyms: string[]): void {
    const synonymsElement = this.state.elements.synonyms;
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
   * @param audioSrc - URL аудио файла (опционально)
   */
  private updateAudio(audioSrc?: string): void {
    this.state.audio = audioSrc ? new Audio(audioSrc) : null;
    if (this.state.elements.speech) {
      this.state.audio === null
        ? this.state.elements.speech.classList.add('hide')
        : this.state.elements.speech.classList.remove('hidden');
    }
  }

  /**
   * Обрабатывает клик по кнопке очистки формы
   */
  private handleClearClick(): void {
    if (this.state.elements.form) {
      this.state.elements.form.reset();
    }
    (this.state.elements.input as HTMLInputElement)?.focus();

    this.state.elements.clear?.classList.add('hidden');
    if (this.state.elements.info) {
      this.state.elements.info.textContent =
        'Type any existing word and press enter to get meaning, example, synonyms, etc.';
    }
    this.state.elements.result?.classList.add('hidden');
  }

  /**
   * Обрабатывает клик по синониму
   * @param event - Событие клика мыши
   */
  private async handleSynonymClick(event: MouseEvent): Promise<void> {
    const target = event.target as HTMLElement;
    const term = target.dataset.term;
    if (!term) return;
    try {
      await this.getWord(term);
      if (this.state.elements.input instanceof HTMLInputElement) {
        this.state.elements.input.value = term;
        this.state.elements.input.focus();
      }
    } catch (error) {
      this.utils.handleError(
        `Can't find the meaning of synonym "${term}". Please, try to search for another word`,
        error,
      );
    }
  }
}

new Dictionary();
