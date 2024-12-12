import './style.css';

/**
 * @fileoverview Это приложение позволяет пользователям сохранять текст в файлы различных форматов.
 * Оно предоставляет интерфейс для ввода текста, выбора имени файла и типа файла, а затем
 * позволяет сохранить файл на устройстве пользователя.
 */

/**
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента приложения.
 * @property {Object} selectors - Объект с селекторами для различных элементов приложения.
 */

/**
 * @type {AppConfig}
 */
const APP_CONFIG = {
  root: '#app',
  selectors: {
    content: '[data-content]',
    filename: '[data-filename]',
    filetype: '[data-filetype]',
    save: '[data-save]',
  },
};

/**
 * @typedef {Object} AppState
 * @property {Object} elements - Объект, содержащий ссылки на DOM элементы.
 */

/**
 * @type {AppState}
 */
const APP_STATE = {
  elements: {
    content: null,
    filename: null,
    filetype: null,
    save: null,
  },
};

/**
 * @typedef {Object} AppUtils
 * @property {function(string): string} renderDataAttributes - Функция для обработки data-атрибутов.
 */

/**
 * @type {AppUtils}
 */
const APP_UTILS = {
  /**
   * Обрабатывает строку data-атрибута, удаляя квадратные скобки.
   * @param {string} element - Строка data-атрибута.
   * @returns {string} Обработанная строка без квадратных скобок.
   */
  renderDataAttributes: (element) => element.slice(1, -1),
};

/**
 * Создает HTML-разметку приложения и вставляет ее в корневой элемент.
 */
function createAppHTML() {
  const {
    root,
    selectors: { content, filename, filetype, save },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
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
 * Инициализирует ссылки на DOM элементы в APP_STATE.
 */
function initDOMElements() {
  APP_STATE.elements = {
    content: document.querySelector(APP_CONFIG.selectors.content),
    filename: document.querySelector(APP_CONFIG.selectors.filename),
    filetype: document.querySelector(APP_CONFIG.selectors.filetype),
    save: document.querySelector(APP_CONFIG.selectors.save),
  };
}

/**
 * Инициализирует приложение, создавая HTML, устанавливая DOM элементы и добавляя обработчики событий.
 */
function initApp() {
  createAppHTML();
  initDOMElements();
  APP_STATE.elements.save.addEventListener('click', handleSaveClick);
  APP_STATE.elements.filetype.addEventListener('change', handleFiletypeChange);
}

/**
 * Обрабатывает клик по кнопке сохранения, создавая и загружая файл.
 */
function handleSaveClick() {
  const { content, filetype, filename } = APP_STATE.elements;
  const fileContent = content.value;
  const fileType = filetype.value;
  const fileName = filename.value || 'untitled';

  const blob = new Blob([fileContent], { type: fileType });
  const url = URL.createObjectURL(blob);
  downloadFile(url, fileName);

  URL.revokeObjectURL(url);
}

/**
 * Создает и активирует ссылку для загрузки файла.
 * @param {string} url - URL объекта Blob.
 * @param {string} fileName - Имя файла для сохранения.
 */
function downloadFile(url, fileName) {
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
function handleFiletypeChange() {
  const filetypeElement = APP_STATE.elements.filetype;
  const selectedOption = filetypeElement.options[filetypeElement.selectedIndex];
  const selectedFileType = selectedOption.text.split(' ')[0];
  
  APP_STATE.elements.save.innerText = `Save As ${selectedFileType} File`;
}

initApp();
