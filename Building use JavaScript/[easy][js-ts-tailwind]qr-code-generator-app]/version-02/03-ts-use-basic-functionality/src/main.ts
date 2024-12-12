/**
 * Этот файл содержит код для генератора QR-кодов.
 * Он позволяет пользователям вводить текст или URL, выбирать размер и цвет QR-кода,
 * а затем генерировать и сохранять QR-код как изображение.
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * Интерфейс для конфигурации приложения
 */
interface AppConfig {
  /** Корневой селектор для приложения */
  root: string;
  /** Объект, содержащий селекторы для различных элементов */
  selectors: {
    qrContainer: string;
    qrForm: string;
    qrCode: string;
    qrGenerate: string;
    qrSave: string;
  };
  /** Массив доступных размеров QR-кода */
  sizes: number[];
  /** Размер QR-кода по умолчанию */
  defaultSize: number;
}

/**
 * Интерфейс для состояния приложения
 */
interface AppState {
  /** Объект, содержащий ссылки на DOM элементы */
  elements: {
    qrContainer: HTMLElement | null;
    qrForm: HTMLFormElement | null;
    qrCode: HTMLCanvasElement | null;
    qrGenerate: HTMLButtonElement | null;
    qrSave: HTMLAnchorElement | null;
  };
}

/**
 * Интерфейс для утилит приложения
 */
interface AppUtils {
  /** Функция для рендеринга data-атрибутов */
  renderDataAttributes: (element: string) => string;
  /** Функция для отображения toast-уведомления */
  showToast: (message: string) => void;
}

/**
 * Конфигурация приложения
 */
const APP_CONFIG: AppConfig = {
  root: '#app',
  selectors: {
    qrContainer: '[data-qr-container]',
    qrForm: '[data-qr-form]',
    qrCode: '#qrcode',
    qrGenerate: '[data-qr-generate]',
    qrSave: '[data-qr-save]',
  },
  sizes: [100, 200, 300, 400, 500, 600, 700],
  defaultSize: 300,
};

/**
 * Состояние приложения
 */
const APP_STATE: AppState = {
  elements: {
    qrContainer: null,
    qrForm: null,
    qrCode: null,
    qrGenerate: null,
    qrSave: null,
  },
};

/**
 * Утилиты приложения
 */
const APP_UTILS: AppUtils = {
  renderDataAttributes: (element: string): string => element.slice(1, -1),
  showToast: (message: string): void => {
    Toastify({
      text: message,
      className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
      duration: 3000,
      gravity: 'bottom',
      position: 'center',
    }).showToast();
  },
};

/**
 * Создает HTML структуру приложения
 */
function createAppHTML(): void {
  const {
    root,
    selectors: { qrContainer, qrForm, qrGenerate, qrSave },
    sizes,
    defaultSize,
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='max-h-[340px] max-w-md w-full overflow-hidden rounded border p-3 shadow transition-all grid gap-4' ${renderDataAttributes(qrContainer)}>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>QR Code Generator</h1>
      <p class='text-center'>Paste a url or enter text to create QR code</p>
      <form class='grid gap-3' ${renderDataAttributes(qrForm)}>
        <input class='cursor-pointer rounded border-2 px-3 py-2.5' type='text' name='text' placeholder='Enter text or url' />
        <input class='h-10 w-full cursor-pointer rounded' type='color' name='color' value='#000'>
        <select class='cursor-pointer border-2 px-3 py-2.5' name='size'>
          ${sizes.map((index) => `<option ${index === defaultSize ? 'selected' : ''} value='${index}'>${index}x${index}</option>`).join('')}
        </select>
        <button class='hover:bg-neutral-100 border px-3 py-2.5' type='submit' ${renderDataAttributes(qrGenerate)}>Generate QR Code</button>
      </form>
      <div class='grid gap-3'>
        <canvas class='mx-auto' id='qrcode'></canvas>
        <a class='flex items-center justify-center hover:bg-neutral-100 border px-3 py-2.5' href='#' download='qrcode' ${renderDataAttributes(qrSave)}>Save Image</a>
      </div>
    </div>
  `;
}

/**
 * Инициализирует DOM элементы в состоянии приложения
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    qrContainer: document.querySelector<HTMLElement>(APP_CONFIG.selectors.qrContainer),
    qrForm: document.querySelector<HTMLFormElement>(APP_CONFIG.selectors.qrForm),
    qrCode: document.querySelector<HTMLCanvasElement>(APP_CONFIG.selectors.qrCode),
    qrGenerate: document.querySelector<HTMLButtonElement>(APP_CONFIG.selectors.qrGenerate),
    qrSave: document.querySelector<HTMLAnchorElement>(APP_CONFIG.selectors.qrSave),
  };
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();
  APP_STATE.elements.qrForm?.addEventListener('submit', handleQrFormSubmit);
}

/**
 * Обрабатывает отправку формы для генерации QR-кода
 * @param event - Событие отправки формы
 */
function handleQrFormSubmit(event: Event): void {
  event.preventDefault();
  if (APP_STATE.elements.qrCode) APP_STATE.elements.qrCode.innerHTML = '';
  APP_STATE.elements.qrContainer?.classList.remove('max-h-[730px]', 'overflow-auto');
  const formData = new FormData(event.target as HTMLFormElement);
  const text = formData.get('text') as string;
  const size = formData.get('size') as string;
  const color = formData.get('color') as string;
  if (text.trim().length === 0) {
    APP_UTILS.showToast('Please enter a text or URL');
    return;
  }
  updateUIButtonText('Generating QR Code...');
  const qrData = generateQRCode({ text, size, color });
  updateQRCodeUI(qrData);
}

/**
 * Обновляет текст кнопки генерации QR-кода
 * @param text - Новый текст для кнопки
 */
function updateUIButtonText(text: string): void {
  if (APP_STATE.elements.qrGenerate) APP_STATE.elements.qrGenerate.textContent = text;
}

/**
 * Генерирует QR-код
 * @param params - Параметры для генерации QR-кода
 * @returns Объект QRious с сгенерированным QR-кодом
 */
function generateQRCode({ text, size, color }: { text: string; size: string; color: string }): QRious {
  return new QRious({
    element: APP_STATE.elements.qrCode || undefined,
    backgroundAlpha: 1,
    foreground: color,
    foregroundAlpha: 0.8,
    level: 'H',
    size: Number(size),
    value: text,
  });
}

/**
 * Обновляет UI после генерации QR-кода
 * @param qrCode - Объект QRious с сгенерированным QR-кодом
 */
function updateQRCodeUI(qrCode: QRious): void {
  setTimeout(() => {
    if (APP_STATE.elements.qrSave) APP_STATE.elements.qrSave.href = qrCode.toDataURL();
    APP_STATE.elements.qrContainer?.classList.add('max-h-[730px]', 'overflow-auto');
    updateUIButtonText('Generate QR Code');
  }, 1000);
}

initApp();