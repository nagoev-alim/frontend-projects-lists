import './style.css';

/**
 * @fileoverview Приложение для сохранения текста в файл
 *
 * Это приложение позволяет пользователю ввести текст, выбрать имя файла и тип файла,
 * а затем сохранить этот текст в файл выбранного типа. Приложение использует
 * браузерные API для создания и скачивания файлов.
 */

/**
 * @interface AppConfig
 * @description Интерфейс для конфигурации приложения
 */
interface AppConfig {
  /** Корневой селектор приложения */
  root: string;
  /** Объект с селекторами элементов */
  selectors: {
    [key: string]: string;
  };
}

/**
 * @interface AppState
 * @description Интерфейс для состояния приложения
 */
interface AppState {
  /** Объект с ссылками на DOM элементы */
  elements: {
    /** Текстовая область для ввода контента */
    content: HTMLTextAreaElement | null;
    /** Поле ввода для имени файла */
    filename: HTMLInputElement | null;
    /** Выпадающий список для выбора типа файла */
    filetype: HTMLSelectElement | null;
    /** Кнопка сохранения */
    save: HTMLButtonElement | null;
  };
}

/**
 * @interface AppUtils
 * @description Интерфейс для утилит приложения
 */
interface AppUtils {
  /**
   * Функция для обработки data-атрибутов
   * @param {string} element - Строка с data-атрибутом
   * @returns {string} Обработанная строка без квадратных скобок
   */
  renderDataAttributes: (element: string) => string;
}

/**
 * @constant
 * @type {AppConfig}
 * @description Конфигурация приложения
 */
const APP_CONFIG: AppConfig = {
  root: '#app',
  selectors: {
    content: '[data-content]',
    filename: '[data-filename]',
    filetype: '[data-filetype]',
    save: '[data-save]',
  },
};

/**
 * @constant
 * @type {AppState}
 * @description Начальное состояние приложения
 */
const APP_STATE: AppState = {
  elements: {
    content: null,
    filename: null,
    filetype: null,
    save: null,
  },
};

/**
 * @constant
 * @type {AppUtils}
 * @description Утилиты приложения
 */
const APP_UTILS: AppUtils = {
  renderDataAttributes: (element: string): string => element.slice(1, -1),
};

/**
 * Создает HTML-разметку приложения
 */
function createAppHTML(): void {
  const {
    root,
    selectors: {
      content,
      filename,
      filetype,
      save,
    },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector<HTMLElement>(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='grid max-w-md gap-4 rounded border bg-white p-3 shadow w-full'>
      <h1 class='text-center font-bold text-2xl md:text-4xl'>Save Text As File</h1>
      <textarea
        class='min-h-[150px] w-full resize-none rounded border bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none'
        spellcheck='false'
        placeholder='Enter something to save'
        ${renderDataAttributes(content)}
      >It's Only After We've Lost Everything That We're Free To Do Anything.</textarea>
      <div class='grid grid-cols-2 gap-3'>
        <label>
          <span class='text-sm font-medium'>File name</span>
          <input
            class='w-full rounded border bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none'
            type='text'
            ${renderDataAttributes(filename)}
            placeholder='Enter file name'
          >
        </label>
        <label>
          <span class='text-sm font-medium'>Save as</span>
          <select
            class='w-full rounded border bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none'
            ${renderDataAttributes(filetype)}
          >
            <option value='text/plain'>Text File (.txt)</option>
            <option value='text/javascript'>JS File (.js)</option>
            <option value='text/html'>HTML File (.html)</option>
            <option value='image/svg+xml'>SVG File (.svg)</option>
            <option value='application/msword'>Doc File (.doc)</option>
            <option value='application/vnd.ms-powerpoint'>PPT File (.ppt)</option>
          </select>
        </label>
      </div>
      <button
        class='border px-3 py-2 hover:bg-slate-50'
        ${renderDataAttributes(save)}
      >Save As Text File</button>
    </div>
  `;
}

/**
 * Инициализирует DOM-элементы приложения
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    content: document.querySelector<HTMLTextAreaElement>(APP_CONFIG.selectors.content),
    filename: document.querySelector<HTMLInputElement>(APP_CONFIG.selectors.filename),
    filetype: document.querySelector<HTMLSelectElement>(APP_CONFIG.selectors.filetype),
    save: document.querySelector<HTMLButtonElement>(APP_CONFIG.selectors.save),
  };
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();
  APP_STATE.elements.save?.addEventListener('click', handleSaveClick);
  APP_STATE.elements.filetype?.addEventListener('change', handleFiletypeChange);
}

/**
 * Обрабатывает клик по кнопке сохранения
 * @description Получает содержимое, тип и имя файла из элементов формы,
 * создает Blob и URL для скачивания, затем вызывает функцию downloadFile
 */
function handleSaveClick(): void {
  const { content, filetype, filename } = APP_STATE.elements;
  if (!content || !filetype || !filename) return;

  const fileContent = content.value;
  const fileType = filetype.value;
  const fileName = filename.value || 'untitled';

  const blob = new Blob([fileContent], { type: fileType });
  const url = URL.createObjectURL(blob);
  downloadFile(url, fileName);

  URL.revokeObjectURL(url);
}

/**
 * Скачивает файл
 * @description Создает временный элемент <a>, устанавливает атрибуты для скачивания,
 * программно инициирует клик и удаляет элемент из DOM
 * @param {string} url - URL файла для скачивания
 * @param {string} fileName - Имя файла
 */
function downloadFile(url: string, fileName: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Обрабатывает изменение типа файла
 * @description Обновляет текст кнопки сохранения в соответствии с выбранным типом файла
 */
function handleFiletypeChange(): void {
  const filetypeElement = APP_STATE.elements.filetype;
  if (!filetypeElement) return;

  const selectedOption = filetypeElement.options[filetypeElement.selectedIndex];
  const selectedFileType = selectedOption.text.split(' ')[0];

  if (APP_STATE.elements.save) {
    APP_STATE.elements.save.innerText = `Save As ${selectedFileType} File`;
  }
}

initApp();
