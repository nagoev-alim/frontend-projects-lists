/**
 * Этот код представляет собой приложение для отслеживания употребления воды.
 * Он позволяет пользователю устанавливать цель по потреблению воды,
 * выбирать размер стакана и отмечать выпитые стаканы.
 * Приложение визуально отображает прогресс и сохраняет данные в localStorage.
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * Интерфейс для конфигурации приложения
 */
interface AppConfig {
  /** Корневой элемент приложения */
  root: string;
  /** Селекторы для различных элементов DOM */
  selectors: {
    [key: string]: string;
  };
  /** Доступные размеры стаканов */
  sizes: number[];
}

/**
 * Интерфейс для состояния приложения
 */
interface AppState {
  /** Элементы DOM */
  elements: {
    form: HTMLFormElement | null;
    tracker: HTMLDivElement | null;
    goal: HTMLSpanElement | null;
    remained: HTMLDivElement | null;
    liters: HTMLSpanElement | null;
    percentage: HTMLDivElement | null;
    cups: HTMLUListElement | null;
    reset: HTMLButtonElement | null;
  };
  /** Данные трекера */
  trackerData: any | null;
}

/**
 * Интерфейс для утилит приложения
 */
interface AppUtils {
  /** Функция для рендеринга атрибутов данных */
  renderDataAttributes: (element: string) => string;
  /** Конфигурация для toast-уведомлений */
  toastConfig: {
    className: string;
    duration: number;
    gravity: string;
    position: string;
  };
  /** Функция для показа toast-уведомления */
  showToast: (message: string) => void;
}

/**
 * Интерфейс для конфигурации воды
 */
interface WaterConfig {
  goal?: number;
  size?: number;
  count?: number;
  fulledCups?: number;
}

/**
 * Конфигурация приложения
 */
const APP_CONFIG: AppConfig = {
  root: '#app',
  selectors: {
    form: '[data-water-form]',
    tracker: '[data-water-tracker]',
    goal: '[data-water-goal]',
    remained: '[data-water-remained]',
    liters: '[data-water-liters]',
    percentage: '[data-water-percentage]',
    cups: '[data-water-cups]',
    reset: '[data-water-reset]',
  },
  sizes: [100, 200, 300, 400, 500, 1000],
};

/**
 * Состояние приложения
 */
const APP_STATE: AppState = {
  elements: {
    form: null,
    tracker: null,
    goal: null,
    remained: null,
    liters: null,
    percentage: null,
    cups: null,
    reset: null,
  },
  trackerData: null,
};

/**
 * Утилиты приложения
 */
const APP_UTILS: AppUtils = {
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
      ...APP_UTILS.toastConfig,
    }).showToast();
  },
};

/**
 * Создает HTML-структуру приложения
 */
function createAppHTML(): void {
  const {
    root,
    selectors: { form, tracker, goal, remained, liters, percentage, cups, reset },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='grid max-w-xl w-full gap-4 rounded border bg-white p-3 shadow drink-water'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Drink Water Tracker</h1>
      <form class='grid gap-3' ${renderDataAttributes(form)}>
        <input class='w-full rounded border bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none' 
               type='number' name='goal' min='1' max='4' step='1' placeholder='Goal Liters'>
        <select class='w-full rounded border bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none' 
                name='size'>
          <option value>Select cup size</option>
          ${APP_CONFIG.sizes.map((i) => `<option value='${i}'>${i}ml</option>`).join('')}
        </select>
        <button class='border px-3 py-2 hover:bg-slate-50' type='submit'>Submit</button>
      </form>
    
      <div class='hidden gap-3' ${renderDataAttributes(tracker)}>
        <h2 class='text-lg'>Goal: <span class='font-bold' ${renderDataAttributes(goal)}>0</span> Liters</h2>
        <div class='drink-water__cup drink-water__cup--big'>
          <div class='drink-water__remained' ${renderDataAttributes(remained)}>
            <span ${renderDataAttributes(liters)}>1.5L</span>
            <small>Remained</small>
          </div>
          <div class='drink-water__percentage' ${renderDataAttributes(percentage)}></div>
        </div>
        <p class='drink-water__text'>Select how many glasses of water that you have drank</p>
        <ul class='grid grid-cols-6 gap-3' ${renderDataAttributes(cups)}></ul>
        <button class='border px-3 py-2 hover:bg-slate-50' ${renderDataAttributes(reset)}>Reset</button>
      </div>
    </div>
  `;
}

/**
 * Инициализирует DOM-элементы
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    form: document.querySelector(APP_CONFIG.selectors.form),
    tracker: document.querySelector(APP_CONFIG.selectors.tracker),
    goal: document.querySelector(APP_CONFIG.selectors.goal),
    remained: document.querySelector(APP_CONFIG.selectors.remained),
    liters: document.querySelector(APP_CONFIG.selectors.liters),
    percentage: document.querySelector(APP_CONFIG.selectors.percentage),
    cups: document.querySelector(APP_CONFIG.selectors.cups),
    reset: document.querySelector(APP_CONFIG.selectors.reset),
  };
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();
  APP_STATE.trackerData = getStoredWaterConfig();
  displayStoredWaterConfig();
  APP_STATE.elements.form?.addEventListener('submit', handleFormSubmit);
  APP_STATE.elements.reset?.addEventListener('click', handleResetClick);
}

/**
 * Получает сохраненную конфигурацию воды из localStorage
 * @returns {WaterConfig} Сохраненная конфигурация воды
 */
const getStoredWaterConfig = (): WaterConfig =>
  JSON.parse(localStorage.getItem('waterConfig') || '{}') as WaterConfig;

/**
 * Сохраняет текущую конфигурацию воды в localStorage
 */
const setStoredWaterConfig = (): void =>
  localStorage.setItem('waterConfig', JSON.stringify(APP_STATE.trackerData));

/**
 * Отображает сохраненную конфигурацию воды
 */
function displayStoredWaterConfig(): void {
  const { goal, size, count, fulledCups } = getStoredWaterConfig();
  if (!goal || !size) return;

  Object.assign(APP_STATE.trackerData, { goal, size, count });
  renderCups(size);
  toggleUIElements();
  updateBigCup();
  markFilledSmallCups(fulledCups ?? 0);
}

/**
 * Переключает отображение UI элементов
 */
const toggleUIElements = (): void => {
  APP_STATE.elements.form?.classList.add('hidden');
  APP_STATE.elements.tracker?.classList.replace('hidden', 'grid');
};

/**
 * Отмечает заполненные маленькие стаканы
 * @param {number} filledCount - Количество заполненных стаканов
 */
const markFilledSmallCups = (filledCount: number): void => {
  const cupsList = Array.from(document.querySelectorAll('[data-cups-item]')) as HTMLLIElement[];
  cupsList.forEach((cup, index) => cup.classList.toggle('full', index < filledCount));
};

/**
 * Отрисовывает стаканы
 * @param {number} size - Размер стакана
 */
function renderCups(size: number): void {
  APP_STATE.elements.goal!.textContent = APP_STATE.trackerData.goal;
  APP_STATE.elements.liters!.textContent = `${APP_STATE.trackerData.goal}L`;

  APP_STATE.elements.cups!.innerHTML = Array(APP_STATE.trackerData.count)
    .fill(`<li class="drink-water__cup" data-cups-item>${size} ml</li>`)
    .join('');

  const cupsList = Array.from(document.querySelectorAll('[data-cups-item]')) as HTMLLIElement[];
  cupsList.forEach((cup, index) => cup.addEventListener('click', () => fillCups(index)));
}

/**
 * Заполняет стаканы
 * @param {number} index - Индекс стакана
 */
function fillCups(index: number): void {
  const cupsItems = Array.from(document.querySelectorAll('[data-cups-item]')) as HTMLLIElement[];
  index = adjustIndex(index, cupsItems);
  updateCupStates(index, cupsItems);
  updateConfigs(cupsItems);
  setStoredWaterConfig();
  updateBigCup();
}

/**
 * Корректирует индекс заполняемого стакана
 * @param {number} index - Индекс стакана
 * @param {HTMLLIElement[]} cupsItems - Список стаканов
 * @returns {number} Скорректированный индекс
 */
const adjustIndex = (index: number, cupsItems: HTMLLIElement[]): number => {
  return isLastCupFull(index, cupsItems) ||
  isCurrentCupFullAndNextEmpty(index, cupsItems)
    ? index - 1
    : index;
};

/**
 * Проверяет, является ли последний стакан полным
 * @param {number} index - Индекс стакана
 * @param {HTMLLIElement[]} cupsItems - Список стаканов
 * @returns {boolean} Результат проверки
 */
const isLastCupFull = (index: number, cupsItems: HTMLLIElement[]): boolean => {
  return index === APP_STATE.trackerData.count - 1 &&
    cupsItems[index].classList.contains('full');
};

/**
 * Проверяет, является ли текущий стакан полным, а следующий пустым
 * @param {number} index - Индекс текущего стакана
 * @param {HTMLLIElement[]} cupsItems - Массив элементов стаканов
 * @returns {boolean} Результат проверки
 */
const isCurrentCupFullAndNextEmpty = (index: number, cupsItems: HTMLLIElement[]): boolean =>
  cupsItems[index]?.classList.contains('full') &&
  cupsItems[index + 1] &&
  !cupsItems[index + 1].classList.contains('full');

/**
 * Обновляет состояние стаканов
 * @param {number} index - Индекс, до которого нужно заполнить стаканы
 * @param {HTMLLIElement[]} cupsItems - Массив элементов стаканов
 */
const updateCupStates = (index: number, cupsItems: HTMLLIElement[]): void =>
  cupsItems.forEach((cup, idx) => cup.classList.toggle('full', idx <= index));

/**
 * Обновляет конфигурацию трекера
 * @param {HTMLLIElement[]} cupsItems - Массив элементов стаканов
 */
function updateConfigs(cupsItems: HTMLLIElement[]): void {
  Object.assign(APP_STATE.trackerData, {
    cupDisplayHeight: (document.querySelector('.drink-water__cup--big') as HTMLLIElement)?.offsetHeight ?? 0,
    fulledCups: document.querySelectorAll('.drink-water__cup.full').length,
    totalCups: cupsItems.length,
  });
}

/**
 * Обновляет отображение большого стакана
 */
const updateBigCup = (): void => {
  updatePercentageDisplay();
  updateRemainedDisplay();
};

/**
 * Обновляет отображение процента заполнения
 */
function updatePercentageDisplay(): void {
  const { fulledCups, totalCups, cupDisplayHeight } = APP_STATE.trackerData;
  const percentageFilled = fulledCups / totalCups;

  APP_STATE.elements.percentage!.style.visibility = fulledCups === 0 ? 'hidden' : 'visible';
  APP_STATE.elements.percentage!.style.height = `${percentageFilled * cupDisplayHeight}px`;
  APP_STATE.elements.percentage!.innerText = fulledCups === 0 ? '' : `${(percentageFilled * 100).toFixed(1)}%`;
}

/**
 * Обновляет отображение оставшегося количества воды
 */
function updateRemainedDisplay(): void {
  const { fulledCups, totalCups, goal, size } = APP_STATE.trackerData;
  const isFullyFilled = fulledCups === totalCups && fulledCups !== 0;

  APP_STATE.elements.remained!.style.visibility = isFullyFilled ? 'hidden' : 'visible';
  APP_STATE.elements.remained!.style.height = isFullyFilled ? '0' : 'auto';

  if (!isFullyFilled) {
    const remainedLiters = goal - (size * fulledCups) / 1000;
    APP_STATE.elements.liters!.innerText = `${remainedLiters.toFixed(1)}L`;
  }
}

/**
 * Обрабатывает отправку формы
 * @param {Event} event - Событие отправки формы
 */
function handleFormSubmit(event: Event): void {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  const formData = new FormData(form);
  const goal = formData.get('goal');
  const size = formData.get('size');

  if (!goal || isNaN(Number(goal)) || !size || isNaN(Number(size))) {
    APP_UTILS.showToast('Please enter valid numbers');
    return;
  }

  APP_STATE.trackerData = {
    goal: Number(goal),
    size: Number(size),
    count: Math.round((Number(goal) / Number(size)) * 1000),
    cupDisplayHeight: (document.querySelector('.drink-water__cup--big') as HTMLElement)?.offsetHeight ?? 0,
    fulledCups: 0,
    totalCups: 0,
  };
  renderCups(Number(size));
  form.reset();
  toggleUIElements();
  setStoredWaterConfig();
}

/**
 * Обрабатывает нажатие кнопки сброса
 */
const handleResetClick = (): void => {
  localStorage.clear();
  location.reload();
};
initApp();
