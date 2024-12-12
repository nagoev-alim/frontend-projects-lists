import './style.css';

/**
 * @fileoverview Это приложение позволяет пользователям сохранять текст в файлы различных форматов.
 * Оно предоставляет интерфейс для ввода текста, выбора имени файла и типа файла, а затем
 * позволяет сохранить файл на устройстве пользователя.
 */

/**
 * @class SaveTextToFile
 * @description Класс, представляющий приложение для сохранения текста в файл.
 */
class SaveTextToFile {
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
  createAppHTML() {
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
      content: document.querySelector(this.config.selectors.content),
      filename: document.querySelector(this.config.selectors.filename),
      filetype: document.querySelector(this.config.selectors.filetype),
      save: document.querySelector(this.config.selectors.save),
    };
  }

  /**
   * Инициализирует приложение, создавая HTML, устанавливая DOM элементы и добавляя обработчики событий.
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();
    this.state.elements.save.addEventListener('click', this.handleSaveClick.bind(this));
    this.state.elements.filetype.addEventListener('change', this.handleFiletypeChange.bind(this));
  }

  /**
   * Обрабатывает клик по кнопке сохранения, создавая и загружая файл.
   */
  handleSaveClick() {
    const { content, filetype, filename } = this.state.elements;
    const fileContent = content.value;
    const fileType = filetype.value;
    const fileName = filename.value || 'untitled';

    const blob = new Blob([fileContent], { type: fileType });
    const url = URL.createObjectURL(blob);
    this.downloadFile(url, fileName);

    URL.revokeObjectURL(url);
  }

  /**
   * Создает и активирует ссылку для загрузки файла.
   * @param {string} url - URL объекта Blob.
   * @param {string} fileName - Имя файла для сохранения.
   */
  downloadFile(url, fileName) {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Обрабатывает изменение типа файла, обновляя текст кнопки сохранения.
   */
  handleFiletypeChange() {
    const filetypeElement = this.state.elements.filetype;
    const selectedOption = filetypeElement.options[filetypeElement.selectedIndex];
    const selectedFileType = selectedOption.text.split(' ')[0];

    this.state.elements.save.innerText = `Save As ${selectedFileType} File`;
  }
}

new SaveTextToFile();
