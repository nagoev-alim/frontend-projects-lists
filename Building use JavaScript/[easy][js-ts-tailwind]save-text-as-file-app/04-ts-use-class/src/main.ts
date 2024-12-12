import './style.css';

/**
 * @fileoverview Приложение для сохранения текста в файл
 *
 * Это приложение позволяет пользователю ввести текст, выбрать имя файла и тип файла,
 * а затем сохранить этот текст в файл выбранного типа. Приложение использует
 * браузерные API для создания и скачивания файлов.
 */


/**
 * @interface Config
 * @description Интерфейс для конфигурации приложения
 */
interface Config {
  /** Корневой селектор приложения */
  root: string;
  /** Объект с селекторами элементов */
  selectors: {
    [key: string]: string;
  };
}

/**
 * @interface State
 * @description Интерфейс для состояния приложения
 */
interface State {
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
 * @interface Utils
 * @description Интерфейс для утилит приложения
 */
interface Utils {
  /**
   * Функция для обработки data-атрибутов
   * @param {string} element - Строка с data-атрибутом
   * @returns {string} Обработанная строка без квадратных скобок
   */
  renderDataAttributes: (element: string) => string;
}

/**
 * @class SaveTextToFile
 * @description Класс, представляющий приложение для сохранения текста в файл.
 */
class SaveTextToFile {
  private readonly config: Config;
  private state: State;
  private readonly utils: Utils;

  /**
   * Создает экземпляр приложения SaveTextToFile.
   */
  constructor() {
    /**
     * @type {Object} Конфигурация приложения
     * @property {string} root - Селектор корневого элемента
     * @property {Object} selectors - Селекторы для различных элементов DOM
     */
    this.config = {
      root: '#app',
      selectors: {
        content: '[data-content]',
        filename: '[data-filename]',
        filetype: '[data-filetype]',
        save: '[data-save]',
      },
    };

    /**
     * @type {Object} Состояние приложения
     * @property {Object} elements - Ссылки на элементы DOM
     */
    this.state = {
      elements: {
        content: null,
        filename: null,
        filetype: null,
        save: null,
      },
    };

    /**
     * @type {Object} Утилиты приложения
     */
    this.utils = {
      /**
       * Обрабатывает строку data-атрибута, удаляя квадратные скобки.
       * @param {string} element - Строка data-атрибута.
       * @returns {string} Обработанная строка без квадратных скобок.
       */
      renderDataAttributes: (element) => element.slice(1, -1),
    };

    this.init();
  }

  /**
   * Создает HTML-разметку приложения и вставляет ее в корневой элемент.
   */
  private createAppHTML(): void {
    const {
      root,
      selectors: { content, filename, filetype, save },
    } = this.config;
    const { renderDataAttributes } = this.utils;
    const rootElement = document.querySelector(root);

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
   * Инициализирует DOM элементы и сохраняет ссылки на них в состоянии приложения.
   */
  initDOMElements() {
    this.state.elements = {
      content: document.querySelector<HTMLTextAreaElement>(this.config.selectors.content),
      filename: document.querySelector<HTMLInputElement>(this.config.selectors.filename),
      filetype: document.querySelector<HTMLSelectElement>(this.config.selectors.filetype),
      save: document.querySelector<HTMLButtonElement>(this.config.selectors.save),
    };
  }

  /**
   * Инициализирует приложение, создавая HTML, устанавливая DOM элементы и добавляя обработчики событий.
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();
    this.state.elements.save?.addEventListener('click', this.handleSaveClick.bind(this));
    this.state.elements.filetype?.addEventListener('change', this.handleFiletypeChange.bind(this));
  }

  /**
   * Обрабатывает клик по кнопке сохранения
   * @description Получает содержимое, тип и имя файла из элементов формы,
   * создает Blob и URL для скачивания, затем вызывает функцию downloadFile
   */

  handleSaveClick(): void {
    const { content, filetype, filename } = this.state.elements;
    if (!content || !filetype || !filename) return;

    const fileContent = content.value;
    const fileType = filetype.value;
    const fileName = filename.value || 'untitled';

    const blob = new Blob([fileContent], { type: fileType });
    const url = URL.createObjectURL(blob);
    this.downloadFile(url, fileName);

    URL.revokeObjectURL(url);
  }

  /**
   * Скачивает файл
   * @description Создает временный элемент <a>, устанавливает атрибуты для скачивания,
   * программно инициирует клик и удаляет элемент из DOM
   * @param {string} url - URL файла для скачивания
   * @param {string} fileName - Имя файла
   */

  downloadFile(url: string, fileName: string): void {
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

  handleFiletypeChange(): void {
    const filetypeElement = this.state.elements.filetype;
    if (!filetypeElement) return;

    const selectedOption = filetypeElement.options[filetypeElement.selectedIndex];
    const selectedFileType = selectedOption.text.split(' ')[0];

    if (this.state.elements.save) {
      this.state.elements.save.innerText = `Save As ${selectedFileType} File`;
    }
  }
}

new SaveTextToFile();
