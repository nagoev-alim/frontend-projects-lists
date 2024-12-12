/**
 * URL Shortener Application
 *
 * Это приложение предоставляет функциональность для сокращения URL-адресов.
 * Оно использует API TinyURL для создания коротких ссылок и позволяет
 * пользователям копировать сокращенные URL в буфер обмена.
 *
 * Основные функции:
 * - Создание сокращенных URL
 * - Копирование сокращенных URL в буфер обмена
 * - Отображение уведомлений пользователю
 * - Обработка ошибок
 *
 * @module URLShortener
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios, { AxiosResponse } from 'axios';
import { icons } from 'feather-icons';

/**
 * Интерфейс конфигурации приложения
 * @interface
 */
interface AppConfig {
  /** Селектор корневого элемента */
  root: string;
  /** Селекторы элементов DOM */
  selectors: {
    container: string;
    form: string;
    shortenedUrl: string;
    copyButton: string;
  };
  /** Настройки API */
  api: {
    endpoint: string;
    key: string;
  };
}

/**
 * Интерфейс состояния приложения
 * @interface
 */
interface AppState {
  /** Элементы DOM */
  elements: {
    container: HTMLElement | null;
    form: HTMLFormElement | null;
    shortenedUrl: HTMLInputElement | null;
    copyButton: HTMLButtonElement | null;
    formButton: HTMLButtonElement | null;
  };
}

/**
 * Интерфейс утилит приложения
 * @interface
 */
interface AppUtils {
  /** Функция для рендеринга data-атрибутов */
  renderDataAttributes: (element: string) => string;
  /** Конфигурация для уведомлений */
  toastConfig: {
    className: string;
    duration: number;
    gravity: string;
    position: string;
  };
  /** Функция для отображения уведомлений */
  showToast: (message: string) => void;
  /** Функция для обработки ошибок */
  handleError: (message: string, error?: Error | null) => void;
}

/**
 * Интерфейс ответа API TinyURL
 * @interface
 */
interface TinyUrlResponse {
  data: {
    tiny_url: string;
  };
  errors?: string[];
}

/**
 * Класс URLShortener реализует функциональность сокращения URL-адресов
 */
class URLShortener {
  private readonly config: AppConfig;
  private readonly state: AppState;
  private readonly utils: AppUtils;

  /**
   * Создает экземпляр URLShortener
   */
  constructor() {
    this.config = {
      root: '#app',
      selectors: {
        container: '[data-shortener-container]',
        form: '[data-shortener-form]',
        shortenedUrl: '[data-shortened-url]',
        copyButton: '[data-copy-button]',
      },
      api: {
        endpoint: 'https://api.tinyurl.com/create',
        key: 'Wl2gadYaQ1kxXvyrscpipz5ThB6rg5euC0FGoPH1L5IqkLrnxALD7D0N7Hef',
      },
    };

    this.state = {
      elements: {
        container: null,
        form: null,
        shortenedUrl: null,
        copyButton: null,
        formButton: null,
      },
    };

    this.utils = {
      renderDataAttributes: (element) => element.slice(1, -1),
      toastConfig: {
        className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
        duration: 3000,
        gravity: 'bottom',
        position: 'center',
      },
      showToast: (message) => {
        // @ts-ignore
        Toastify({
          text: message,
          ...this.utils.toastConfig,
        }).showToast();
      },
      handleError: (message, error = null) => {
        this.utils.showToast(message);
        if (error) console.error(message, error);
      },
    };

    this.init();
  }

  /**
   * Создает HTML-структуру приложения
   */
  private createAppHTML(): void {
    const {
      root,
      selectors: { container, form, shortenedUrl, copyButton },
    } = this.config;
    const { renderDataAttributes } = this.utils;
    const rootElement = document.querySelector(root);

    if (!rootElement) return;

    rootElement.innerHTML = `
    <div class='max-h-[175px] max-w-md w-full overflow-hidden rounded border bg-white p-3 shadow transition-all grid gap-4' ${renderDataAttributes(container)}>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>URL Shortener</h1>
      <form class='grid gap-2' ${renderDataAttributes(form)}>
        <input 
          class='w-full rounded border bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none' 
          type='text' 
          name='url' 
          placeholder='Paste a link to shorten it'
        >
        <button class='border px-3 py-2 hover:bg-slate-50' type='submit'>Submit</button>
      </form>
      <div class='result grid grid-cols-[1fr_60px] gap-1.5'>
        <input 
          class='w-full rounded border bg-slate-50 px-3 py-2 text-gray-600 focus:border-blue-400 focus:outline-none' 
          disabled 
          type='text' 
          ${renderDataAttributes(shortenedUrl)}
        >
        <button class='border px-3 py-2 hover:bg-slate-50 flex justify-center' ${renderDataAttributes(copyButton)}>${icons.clipboard.toSvg()}</button>
      </div>
    </div>
  `;
  }

  /**
   * Инициализирует элементы DOM
   */
  private initDOMElements(): void {
    this.state.elements = {
      container: document.querySelector(this.config.selectors.container),
      copyButton: document.querySelector(this.config.selectors.copyButton),
      form: document.querySelector(this.config.selectors.form),
      formButton: document.querySelector(`${this.config.selectors.form} button[type="submit"]`),
      shortenedUrl: document.querySelector(this.config.selectors.shortenedUrl),
    };
  }

  /**
   * Инициализирует приложение
   */
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();
    this.state.elements.form?.addEventListener('submit', this.handleFormSubmit.bind(this));
    this.state.elements.copyButton?.addEventListener('click', this.handleCopyButtonClick.bind(this));
  }

  /**
   * Обрабатывает отправку формы
   * @param {Event} event - Событие отправки формы
   */
  private async handleFormSubmit(event: Event): Promise<void> {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const url = (form.elements.namedItem('url') as HTMLInputElement).value.trim();

    if (!this.isValidUrl(url)) {
      this.utils.showToast('Please enter the correct URL.');
      return;
    }

    try {
      this.setLoadingState(true);
      const shortenedUrl = await this.shortenUrl(url);
      this.updateUI(shortenedUrl);
    } catch (error) {
      this.utils.handleError('Failed to shorten the URL.', error as Error);
    } finally {
      this.setLoadingState(false);
    }
  }

  /**
   * Проверяет, является ли строка допустимым URL
   * @param {string} url - URL для проверки
   * @returns {boolean} - Результат проверки
   */
  private isValidUrl(url: string): boolean {
    const urlPattern =
      /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;
    return urlPattern.test(url);
  }

  /**
   * Отправляет запрос на сокращение URL
   * @param {string} url - URL для сокращения
   * @returns {Promise<string>} - Сокращенный URL
   * @throws {Error} - Ошибка при выполнении запроса или обработке ответа
   */
  private async shortenUrl(url: string): Promise<string> {
    const response: AxiosResponse<TinyUrlResponse> = await axios.post(
      this.config.api.endpoint,
      { url },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.api.key}`,
        },
      },
    );

    const { data: { tiny_url }, errors } = response.data;

    if (errors && errors.length > 0) {
      throw new Error(errors[0]);
    }

    return tiny_url;
  }

  /**
   * Устанавливает состояние загрузки
   * @param {boolean} isLoading - Флаг загрузки
   */
  private setLoadingState(isLoading: boolean): void {
    if (this.state.elements.formButton) {
      this.state.elements.formButton.textContent = isLoading ? 'Loading...' : 'Submit';
    }
  }

  /**
   * Обновляет UI после получения сокращенного URL
   * @param {string} shortenedUrl - Сокращенный URL
   */
  private updateUI(shortenedUrl: string): void {
    if (this.state.elements.shortenedUrl) {
      this.state.elements.shortenedUrl.value = shortenedUrl;
    }
    this.state.elements.container?.classList.add('max-h-[235px]');
  }

  /**
   * Обрабатывает клик по кнопке копирования
   */
  private async handleCopyButtonClick(): Promise<void> {
    const url = this.state.elements.shortenedUrl?.value.trim() ?? '';
    if (url.length === 0) return;

    try {
      await navigator.clipboard.writeText(url);
      this.utils.showToast('URL copied to clipboard');
    } catch (error) {
      this.utils.handleError('Failed to copy URL', error as Error);
    }
  }

}

new URLShortener();
