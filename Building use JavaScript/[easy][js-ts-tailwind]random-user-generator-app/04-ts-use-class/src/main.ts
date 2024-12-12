/**
 * Этот код представляет собой реализацию генератора случайных пользователей.
 * Он использует API randomuser.me для получения данных о случайном пользователе,
 * отображает эту информацию на веб-странице и позволяет пользователю
 * генерировать новых случайных пользователей и просматривать различные
 * аспекты информации о пользователе.
 */

import './style.css';
import { icons } from 'feather-icons';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

/**
 * Интерфейс для описания иконки
 * @interface
 */
interface Icon {
  /** Название иконки */
  name: string;
  /** SVG-представление иконки */
  src: string;
}

/**
 * Интерфейс для конфигурации приложения
 * @interface
 */
interface Config {
  /** Селектор корневого элемента */
  root: string;
  /** Объект с селекторами элементов */
  selectors: {
    /** Селектор изображения пользователя */
    userImage: string;
    /** Селектор метки информации о пользователе */
    userInfoLabel: string;
    /** Селектор значения информации о пользователе */
    userInfoValue: string;
    /** Селектор типа информации о пользователе */
    userInfoType: string;
    /** Селектор кнопки генерации пользователя */
    generateUser: string;
  };
  /** Массив иконок */
  icons: Icon[];
  /** URL API для получения данных о случайном пользователе */
  url: string;
}

/**
 * Интерфейс для состояния приложения
 * @interface
 */
interface State {
  /** Объект с элементами DOM */
  elements: {
    /** Элемент изображения пользователя */
    userImage: HTMLImageElement | null;
    /** Элемент метки информации о пользователе */
    userInfoLabel: HTMLSpanElement | null;
    /** Элемент значения информации о пользователе */
    userInfoValue: HTMLSpanElement | null;
    /** Коллекция кнопок типа информации о пользователе */
    userInfoType: NodeListOf<HTMLButtonElement> | null;
    /** Кнопка генерации пользователя */
    generateUser: HTMLButtonElement | null;
  };
  /** Объект с данными пользователя */
  userData: {
    [key: string]: string | number;
  };
}

/**
 * Интерфейс для утилит приложения
 * @interface
 */
interface Utils {
  /** Функция для рендеринга data-атрибутов */
  renderDataAttributes: (element: string) => string;
  /** Конфигурация для Toast-уведомлений */
  toastConfig: Toastify.Options;
  /** Функция для отображения Toast-уведомления */
  showToast: (message: string) => void;
  /** Функция для обработки ошибок */
  handleError: (message: string, error?: Error | null) => void;
}

/**
 * Класс генератора случайных пользователей
 */
class RandomUserGenerator {
  /** Конфигурация приложения */
  private config: Config;
  /** Состояние приложения */
  private state: State;
  /** Утилиты приложения */
  private utils: Utils;

  /**
   * Конструктор класса RandomUserGenerator
   */
  constructor() {
    this.config = {
      root: '#app',
      selectors: {
        userImage: '[data-user-image]',
        userInfoLabel: '[data-user-info-label]',
        userInfoValue: '[data-user-info-value]',
        userInfoType: '[data-user-info-type]',
        generateUser: '[data-generate-user]',
      },
      icons: [
        { name: 'name', src: icons.user.toSvg() },
        { name: 'email', src: icons['at-sign'].toSvg() },
        { name: 'age', src: icons.calendar.toSvg() },
        { name: 'street', src: icons.map.toSvg() },
        { name: 'phone', src: icons.phone.toSvg() },
        { name: 'password', src: icons.lock.toSvg() },
      ],
      url: 'https://randomuser.me/api/',
    };

    this.state = {
      elements: {
        userImage: null,
        userInfoLabel: null,
        userInfoValue: null,
        userInfoType: null,
        generateUser: null,
      },
      userData: {},
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
        Toastify({
          text: message,
          ...this.utils.toastConfig,
        }).showToast();
      },
      handleError: (message: string, error: Error | null = null): void => {
        this.utils.showToast(message);
        if (error) console.error(message, error);
      },
    };

    this.init();
  }

  /**
   * Создает HTML-разметку приложения
   */
  private createAppHTML(): void {
    const {
      root,
      selectors: {
        userImage,
        userInfoLabel,
        userInfoValue,
        userInfoType,
        generateUser,
      },
    } = this.config;
    const { renderDataAttributes } = this.utils;
    const rootElement = document.querySelector<HTMLDivElement>(root);

    if (!rootElement) return;

    rootElement.innerHTML = `
    <div class='grid w-full max-w-md gap-4 rounded border bg-white p-3 shadow'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Random User Generator</h1>
      <img class='mx-auto h-[132px] w-[132px] rounded-full border-2 border-black' src='#' alt='User' ${renderDataAttributes(userImage)}>
      <p class='flex flex-wrap justify-center gap-1'>
        <span ${renderDataAttributes(userInfoLabel)}></span>
        <span class='break-all font-medium' ${renderDataAttributes(userInfoValue)}></span>
      </p>
      <ul class='flex flex-wrap items-center justify-center gap-2'>
        ${this.config.icons.map(
      ({ name, src }) => `
          <li>
            <button class='border bg-white px-3 py-3 hover:bg-slate-300 transition-colors' ${renderDataAttributes(userInfoType)}='${name}'>
              <span class='pointer-events-none'>${src}</span>
            </button>
          </li>
        `,
    ).join('')}
      </ul>
      <button class='border px-3 py-2.5 hover:bg-slate-50' ${renderDataAttributes(generateUser)}>Generate</button>
    </div>
  `;
  }

  /**
   * Инициализирует DOM-элементы
   */
  private initDOMElements(): void {
    this.state.elements = {
      userImage: document.querySelector<HTMLImageElement>(this.config.selectors.userImage),
      userInfoLabel: document.querySelector<HTMLSpanElement>(this.config.selectors.userInfoLabel),
      userInfoValue: document.querySelector<HTMLSpanElement>(this.config.selectors.userInfoValue),
      userInfoType: document.querySelectorAll<HTMLButtonElement>(this.config.selectors.userInfoType),
      generateUser: document.querySelector<HTMLButtonElement>(this.config.selectors.generateUser),
    };
  }

  /**
   * Инициализирует приложение
   */
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();

    (async () => {
      await this.getUser();
      this.state.elements.userInfoType?.forEach((button) =>
        button.addEventListener('click', this.handleUserInfoTypeClick.bind(this)),
      );
      this.state.elements.generateUser?.addEventListener('click', this.getUser.bind(this));
    })();
  }

  /**
   * Получает данные о случайном пользователе
   */
  private async getUser(): Promise<void> {
    try {
      const {
        data: {
          results: [user],
        },
      } = await axios.get(this.config.url);
      this.state.userData = {
        phone: user.phone,
        email: user.email,
        image: user.picture.large,
        street: `${user.location.street.number} ${user.location.street.name}`,
        password: user.login.password,
        name: `${user.name.first} ${user.name.last}`,
        age: user.dob.age,
      };
      this.renderUI();
    } catch (error) {
      this.utils.handleError('Failed to fetch user data.', error as Error);
    }
  }

  /**
   * Обрабатывает клик на кнопку типа информации о пользователе
   * @param {MouseEvent} event - Событие клика
   */
  private handleUserInfoTypeClick(event: MouseEvent): void {
    const currentTarget = event.currentTarget as HTMLButtonElement;
    const type = currentTarget.dataset.userInfoType as string;
    if (this.state.elements.userInfoLabel && this.state.elements.userInfoValue && this.state.elements.userImage) {
      this.state.elements.userInfoLabel.textContent = `My ${type} is`;
      this.state.elements.userInfoValue.textContent = String(this.state.userData[type]);
      this.state.elements.userImage.src = this.state.userData.image as string;
    }
    this.state.elements.userInfoType?.forEach((button) => {
      button.classList.remove('bg-white');
      button.classList.toggle('bg-slate-200', button === currentTarget);
    });
  }

  /**
   * Отрисовывает пользовательский интерфейс
   */
  private renderUI(): void {
    if (this.state.elements.userImage && this.state.elements.userInfoLabel && this.state.elements.userInfoValue) {
      this.state.elements.userImage.src = this.state.userData.image as string;
      const firstKey = Object.keys(this.state.userData)[0];
      this.state.elements.userInfoLabel.textContent = `My ${firstKey} is`;
      this.state.elements.userInfoValue.textContent = String(this.state.userData[firstKey]);
    }
    this.state.elements.userInfoType?.forEach((button, index) => {
      button.classList.remove('bg-white');
      button.classList.toggle('bg-slate-200', index === 0);
    });
  }
}

new RandomUserGenerator();
