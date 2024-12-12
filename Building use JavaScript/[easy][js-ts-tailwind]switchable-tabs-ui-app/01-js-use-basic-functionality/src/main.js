import './style.css';

/**
 * Основная конфигурация приложения.
 * Содержит корневой элемент и селекторы для различных элементов табов.
 * @type {Object}
 */
const APP_CONFIG = {
  root: '#app',
  selectors: {
    tabControl: '[data-tab-control]',
    tabContent: '[data-tab-content]',
    tabsHorizontal: '.tabs-item--horizontal',
    tabsVertical: '.tabs-item--vertical',
  },
};

/**
 * Состояние приложения.
 * Хранит ссылки на DOM элементы.
 * @type {Object}
 */
const APP_STATE = {
  elements: {
    tabsHorizontal: null,
    tabsVertical: null,
  },
};

/**
 * Утилиты приложения.
 * @type {Object}
 */
const APP_UTILS = {
  /**
   * Обрабатывает строку для использования в качестве значения data-атрибута.
   * @param {string} element - Строка для обработки.
   * @returns {string} Обработанная строка.
   */
  renderDataAttributes: (element) => element.slice(1, -1),
};

/**
 * Создает HTML структуру приложения.
 * Генерирует горизонтальные и вертикальные табы.
 */
function createAppHTML() {
  const {
    root,
    selectors: { tabControl, tabContent },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='tabs gap-3 grid'>
      <h3 class='font-bold md:text-4xl text-2xl text-center'>Tabs Horizontal</h3>
      <div class='bg-white border grid rounded tabs-item--horizontal'>
        <ul class='grid sm:grid-cols-3'>
          ${Array.from({ length: 3 }).map((_, i) => `<li ${renderDataAttributes(tabControl)}='${i + 1}' class='border cursor-pointer font-bold p-3 ${i === 0 ? 'active bg-slate-900 text-white' : 'text-black'}'>Tab ${i + 1}</li>`).join('')}
        </ul>
        <ul class='relative tabs__body'>
          ${Array.from({ length: 3 }).map((_, i) => `
            <li ${renderDataAttributes(tabContent)}='${i + 1}' class='${i === 0 ? 'active' : ''}'>
              <h3 class='font-bold text-lg'>Tab ${i + 1}</h3>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quisquam, sequi!
            </li>
          `).join('')}
        </ul>
      </div>

      <h3 class='font-bold md:text-4xl text-2xl text-center'>Switchable Vertical</h3>
      <div class='bg-white border grid rounded sm:grid-cols-[200px_auto] sm:items-start tabs-item tabs-item--vertical'>
        <ul class='grid sm:border-r-2'>
         ${Array.from({ length: 3 }).map((_, i) => `<li ${renderDataAttributes(tabControl)}='${i + 1}' class='border-b cursor-pointer font-bold p-3 ${i === 0 ? 'active bg-slate-900 text-white' : 'text-black'}'>Tab ${i + 1}</li>`).join('')}
        </ul>
        <ul class='relative tabs__body'>
          ${Array.from({ length: 3 }).map((_, i) => `
            <li ${renderDataAttributes(tabContent)}='${i + 1}' class='${i === 0 ? 'active' : ''}'>
              <h3 class='font-bold text-lg'>Tab ${i + 1}</h3>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quisquam, sequi!
            </li>
          `).join('')}
        </ul>
      </div>
    </div>
  `;
}

/**
 * Инициализирует DOM элементы и сохраняет их в состоянии приложения.
 */
function initDOMElements() {
  APP_STATE.elements = {
    tabsHorizontal: document.querySelector(APP_CONFIG.selectors.tabsHorizontal),
    tabsVertical: document.querySelector(APP_CONFIG.selectors.tabsVertical),
  };
}

/**
 * Инициализирует приложение.
 * Создает HTML, инициализирует DOM элементы и добавляет обработчики событий.
 */
function initApp() {
  createAppHTML();
  initDOMElements();
  [APP_STATE.elements.tabsHorizontal, APP_STATE.elements.tabsVertical].forEach((tabs) => {
    tabs.addEventListener('click', handleTabControl);
  });
}

/**
 * Обрабатывает клик по табу.
 * Переключает активный таб и соответствующее содержимое.
 * @param {Event} event - Событие клика.
 */
function handleTabControl(event) {
  const target = event.target;
  if (!target.dataset.tabControl) return;

  const tabParent = target.closest('ul');
  const tabsContainer = tabParent.closest('.tabs-item--horizontal, .tabs-item--vertical');
  const currentTabControl = target.dataset.tabControl;
  const currentTabContent = tabsContainer.querySelector(`[data-tab-content='${currentTabControl}']`);

  const tabControls = tabsContainer.querySelectorAll(APP_CONFIG.selectors.tabControl);
  const tabContents = tabsContainer.querySelectorAll(APP_CONFIG.selectors.tabContent);

  tabControls.forEach(control => {
    control.classList.remove('active', 'bg-slate-900', 'text-white');
    control.classList.add('text-black');
  });

  tabContents.forEach(content => content.classList.remove('active'));

  target.classList.add('active', 'bg-slate-900', 'text-white');
  target.classList.remove('text-black');
  currentTabContent.classList.add('active');
}

initApp();
