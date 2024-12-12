import './style.css';

/**
 * @fileoverview Этот файл содержит основную логику для управления согласием на использование куков на веб-сайте.
 * Он создает интерфейс для пользователя, позволяющий принять или отклонить использование куков,
 * и сохраняет выбор пользователя в куках браузера.
 */

/**
 * Конфигурация приложения
 * @interface
 */
interface AppConfig {
  /** Селектор корневого элемента приложения */
  root: string;
  /** Объект с селекторами для различных элементов интерфейса */
  selectors: {
    [key: string]: string;
  };
}

/**
 * Состояние приложения
 * @interface
 */
interface AppState {
  /** Объект, содержащий ссылки на DOM-элементы */
  elements: {
    [key: string]: HTMLElement | null;
  };
}

/**
 * Утилиты приложения
 * @interface
 */
interface AppUtils {
  /** Функция для обработки data-атрибутов */
  renderDataAttributes: (element: string) => string;
}

/**
 * Конфигурация приложения
 * @type {AppConfig}
 */
const APP_CONFIG: AppConfig = {
  root: '#app',
  selectors: {
    cookieConsent: '[data-cookie-consent]',
    cookieAccept: '[data-cookie-accept]',
    cookieDecline: '[data-cookie-decline]',
  },
};

/**
 * Состояние приложения
 * @type {AppState}
 */
const APP_STATE: AppState = {
  elements: {
    cookieConsent: null,
    cookieAccept: null,
    cookieDecline: null,
  },
};

/**
 * Утилиты приложения
 * @type {AppUtils}
 */
const APP_UTILS: AppUtils = {
  /**
   * Обрабатывает строку селектора для использования в качестве data-атрибута
   * @param {string} element - Строка селектора
   * @returns {string} Обработанная строка для использования в data-атрибуте
   */
  renderDataAttributes: (element: string): string => element.slice(1, -1),
};

/**
 * Создает HTML-разметку для интерфейса согласия на использование куков
 */
function createAppHTML(): void {
  const {
    root,
    selectors: {
      cookieConsent,
      cookieAccept,
      cookieDecline,
    },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector<HTMLElement>(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='fixed bottom-5 left-5 grid max-w-md gap-3 rounded-lg bg-white p-3 shadow' ${renderDataAttributes(cookieConsent)}>
      <h3 class='flex items-center gap-3 text-lg font-bold'>
        <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none' stroke-width='1.5'>
          <path stroke='currentColor' stroke-linecap='round' stroke-linejoin='round' d='M21.8 14c-.927 4.564-4.962 8-9.8 8-5.523 0-10-4.477-10-10 0-5.185 3.947-9.449 9-9.95'/>
          <path stroke='currentColor' stroke-linecap='round' stroke-linejoin='round' d='M6.5 10a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1ZM20.5 4a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1ZM12 19a1 1 0 1 1 0-2 1 1 0 0 1 0 2ZM7 15.01l.01-.011M17 15.01l.01-.011M11 12.01l.01-.011M21 9.01l.01-.011M17 6.01l.01-.011M11 2c-.5 1.5.5 3 2.085 3C11 8.5 13 12 18 11.5c0 2.5 2.5 3 3.7 2.514'/>
        </svg>
        Cookies Consent
      </h3>
      <p>This website use cookies to help you have a superior and more relevant browsing experience on the website.</p>
      <a class='text-purple-500' href='#'>Read more</a>
      <div class='flex items-center gap-2'>
        <button class='border bg-purple-500 px-3 py-2 text-white hover:bg-purple-400' ${renderDataAttributes(cookieAccept)}>Accept</button>
        <button class='border px-3 py-2 hover:bg-slate-50' ${renderDataAttributes(cookieDecline)}>Decline</button>
      </div>
    </div>
  `;
}

/**
 * Инициализирует DOM-элементы и сохраняет их в состоянии приложения
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    cookieConsent: document.querySelector<HTMLElement>(APP_CONFIG.selectors.cookieConsent),
    cookieAccept: document.querySelector<HTMLElement>(APP_CONFIG.selectors.cookieAccept),
    cookieDecline: document.querySelector<HTMLElement>(APP_CONFIG.selectors.cookieDecline),
  };
}

/**
 * Инициализирует функциональность управления куками
 */
function initCookies(): void {
  const { cookieConsent } = APP_STATE.elements;
  const hasConsent = document.cookie.includes('customCookies');

  if (cookieConsent) {
    cookieConsent.classList.toggle('hidden', hasConsent);

    if (!hasConsent) {
      [APP_STATE.elements.cookieAccept, APP_STATE.elements.cookieDecline].forEach(button => {
        if (button) {
          button.addEventListener('click', ({ target }) => {
            cookieConsent.classList.add('hidden');
            if (target instanceof HTMLElement && target.matches(APP_CONFIG.selectors.cookieAccept)) {
              document.cookie = `cookieBy=customCookies; max-age=${30 * 24 * 60 * 60}`;
            }
          });
        }
      });
    }
  }
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();
  window.addEventListener('load', initCookies);
}

// Запуск приложения
initApp();
