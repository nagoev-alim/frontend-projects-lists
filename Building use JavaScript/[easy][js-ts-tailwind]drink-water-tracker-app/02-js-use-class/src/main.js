/**
 * Этот код реализует функциональность трекера потребления воды.
 * Он позволяет пользователю устанавливать цель по количеству выпитой воды,
 * отслеживать прогресс и визуализировать результаты.
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * Класс WaterTracker управляет функциональностью трекера потребления воды.
 */
class WaterTracker {
  /**
   * Создает экземпляр WaterTracker.
   */
  constructor() {
    /**
     * Конфигурация приложения.
     * @type {Object}
     */
    this.config = {
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
     * Состояние приложения.
     * @type {Object}
     */
    this.state = {
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
     * Вспомогательные функции.
     * @type {Object}
     */
    this.utils = {
      /**
       * Преобразует строку селектора в атрибут данных.
       * @param {string} element - Строка селектора.
       * @returns {string} Строка атрибута данных.
       */
      renderDataAttributes: (element) => element.slice(1, -1),

      /**
       * Конфигурация для уведомлений.
       * @type {Object}
       */
      toastConfig: {
        className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
        duration: 3000,
        gravity: 'bottom',
        position: 'center',
      },

      /**
       * Показывает уведомление.
       * @param {string} message - Текст уведомления.
       */
      showToast: (message) => {
        Toastify({
          text: message,
          ...this.utils.toastConfig,
        }).showToast();
      },
    };

    this.init();
  }

  /**
   * Создает HTML структуру приложения.
   */
  createAppHTML() {
    const {
      root,
      selectors: {
        form,
        tracker,
        goal,
        remained,
        liters,
        percentage,
        cups,
        reset,
      },
    } = this.config;
    const { renderDataAttributes } = this.utils;
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
            ${this.config.sizes.map((i) => `<option value='${i}'>${i}ml</option>`).join('')}
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
   * Инициализирует DOM элементы.
   */
  initDOMElements() {
    this.state.elements = {
      form: document.querySelector(this.config.selectors.form),
      tracker: document.querySelector(this.config.selectors.tracker),
      goal: document.querySelector(this.config.selectors.goal),
      remained: document.querySelector(this.config.selectors.remained),
      liters: document.querySelector(this.config.selectors.liters),
      percentage: document.querySelector(this.config.selectors.percentage),
      cups: document.querySelector(this.config.selectors.cups),
      reset: document.querySelector(this.config.selectors.reset),
    };
  }

  /**
   * Инициализирует приложение.
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();
    this.state.trackerData = this.getStoredWaterConfig();
    this.displayStoredWaterConfig();
    this.state.elements.form.addEventListener('submit', this.handleFormSubmit.bind(this));
    this.state.elements.reset.addEventListener('click', this.handleResetClick.bind(this));
  }

  /**
   * Получает сохраненную конфигурацию воды из localStorage.
   * @returns {Object} Сохраненная конфигурация воды.
   */
  getStoredWaterConfig() {
    return JSON.parse(localStorage.getItem('waterConfig')) ?? {};
  }

  /**
   * Сохраняет текущую конфигурацию воды в localStorage.
   */
  setStoredWaterConfig() {
    localStorage.setItem('waterConfig', JSON.stringify(this.state.trackerData));
  }

  /**
   * Отображает сохраненную конфигурацию воды.
   */
  displayStoredWaterConfig() {
    const { goal, size, count, fulledCups } = this.getStoredWaterConfig();
    if (!goal) return;

    Object.assign(this.state.trackerData, { goal, size, count });
    this.renderCups(size);
    this.toggleUIElements();
    this.updateBigCup();
    this.markFilledSmallCups(fulledCups);
  }

  /**
   * Переключает видимость элементов пользовательского интерфейса.
   */
  toggleUIElements() {
    this.state.elements.form.classList.add('hidden');
    this.state.elements.tracker.classList.replace('hidden', 'grid');
  }

  /**
   * Отмечает заполненные маленькие стаканы.
   * @param {number} filledCount - Количество заполненных стаканов.
   */
  markFilledSmallCups(filledCount) {
    document
      .querySelectorAll('[data-cups-item]')
      .forEach((cup, index) => cup.classList.toggle('full', index < filledCount));
  }

  /**
   * Отрисовывает стаканы на странице.
   * @param {number} size - Размер стакана.
   */
  renderCups(size) {
    this.state.elements.goal.textContent = this.state.trackerData.goal;
    this.state.elements.liters.textContent = `${this.state.trackerData.goal}L`;

    this.state.elements.cups.innerHTML = Array(this.state.trackerData.count)
      .fill(`<li class="drink-water__cup" data-cups-item>${size} ml</li>`)
      .join('');

    document
      .querySelectorAll('[data-cups-item]')
      .forEach((cup, index) =>
        cup.addEventListener('click', () => this.fillCups(index)),
      );
  }

  /**
   * Обрабатывает заполнение стаканов.
   * @param {number} index - Индекс кликнутого стакана.
   */
  fillCups(index) {
    const cupsItems = document.querySelectorAll('[data-cups-item]');
    index = this.adjustIndex(index, cupsItems);
    this.updateCupStates(index, cupsItems);
    this.updateConfigs(cupsItems);
    this.setStoredWaterConfig();
    this.updateBigCup();
  }

  /**
   * Корректирует индекс стакана в зависимости от текущего состояния.
   * @param {number} index - Текущий индекс.
   * @param {NodeList} cupsItems - Список элементов стаканов.
   * @returns {number} Скорректированный индекс.
   */
  adjustIndex(index, cupsItems) {
    return this.isLastCupFull(index, cupsItems) ||
    this.isCurrentCupFullAndNextEmpty(index, cupsItems)
      ? index - 1
      : index;
  }

  /**
   * Проверяет, является ли последний стакан полным.
   * @param {number} index - Индекс стакана.
   * @param {NodeList} cupsItems - Список элементов стаканов.
   * @returns {boolean} True, если последний стакан полный.
   */
  isLastCupFull(index, cupsItems) {
    return index === this.state.trackerData.count - 1 &&
      cupsItems[index].classList.contains('full');
  }

  /**
   * Проверяет, является ли текущий стакан полным, а следующий пустым.
   * @param {number} index - Индекс стакана.
   * @param {NodeList} cupsItems - Список элементов стаканов.
   * @returns {boolean} True, если текущий стакан полный, а следующий пустой.
   */
  isCurrentCupFullAndNextEmpty(index, cupsItems) {
    return cupsItems[index].classList.contains('full') &&
      cupsItems[index].nextElementSibling &&
      !cupsItems[index].nextElementSibling.classList.contains('full');
  }

  /**
   * Обновляет состояния стаканов.
   * @param {number} index - Индекс последнего заполненного стакана.
   * @param {NodeList} cupsItems - Список элементов стаканов.
   */
  updateCupStates(index, cupsItems) {
    cupsItems.forEach((cup, idx) => cup.classList.toggle('full', idx <= index));
  }

  /**
   * Обновляет конфигурацию трекера.
   * @param {NodeList} cupsItems - Список элементов стаканов.
   */
  updateConfigs(cupsItems) {
    Object.assign(this.state.trackerData, {
      cupDisplayHeight: document.querySelector('.drink-water__cup--big')
        .offsetHeight,
      fulledCups: document.querySelectorAll('.drink-water__cup.full').length,
      totalCups: cupsItems.length,
    });
  }

  /**
   * Обновляет отображение большого стакана.
   */
  updateBigCup() {
    this.updatePercentageDisplay();
    this.updateRemainedDisplay();
  }

  /**
   * Обновляет отображение процента заполнения.
   */
  updatePercentageDisplay() {
    const { fulledCups, totalCups, cupDisplayHeight } = this.state.trackerData;
    const percentageFilled = fulledCups / totalCups;

    this.state.elements.percentage.style.visibility =
      fulledCups === 0 ? 'hidden' : 'visible';
    this.state.elements.percentage.style.height = `${percentageFilled * cupDisplayHeight}px`;
    this.state.elements.percentage.innerText =
      fulledCups === 0 ? '' : `${(percentageFilled * 100).toFixed(1)}%`;
  }

  /**
   * Обновляет отображение оставшегося количества воды.
   */
  updateRemainedDisplay() {
    const { fulledCups, totalCups, goal, size } = this.state.trackerData;
    const isFullyFilled = fulledCups === totalCups && fulledCups !== 0;

    this.state.elements.remained.style.visibility = isFullyFilled ? 'hidden' : 'visible';
    this.state.elements.remained.style.height = isFullyFilled ? '0' : 'auto';

    if (!isFullyFilled) {
      const remainedLiters = goal - (size * fulledCups) / 1000;
      this.state.elements.liters.innerText = `${remainedLiters.toFixed(1)}L`;
    }
  }

  /**
   * Обрабатывает отправку формы.
   * @param {Event} event - Событие отправки формы.
   */
  handleFormSubmit(event) {
    event.preventDefault();
    const { goal, size } = Object.fromEntries(new FormData(event.target));

    if (!goal || isNaN(goal) || !size || isNaN(size)) {
      this.utils.showToast('Please enter valid numbers');
      return;
    }

    this.state.trackerData = {
      goal: Number(goal),
      size: Number(size),
      count: Math.round((goal / size) * 1000),
      cupDisplayHeight: document.querySelector('.drink-water__cup--big')
        .offsetHeight,
      fulledCups: 0,
      totalCups: 0,
    };
    this.renderCups(Number(size));
    event.target.reset();
    this.toggleUIElements();
    this.setStoredWaterConfig();
  }

  /**
   * Обработчик нажатия кнопки сброса.
   * Очищает локальное хранилище и перезагружает страницу,
   * что приводит к сбросу всех настроек трекера воды.
   */
  handleResetClick() {
    localStorage.clear();
    location.reload();
  }
}

new WaterTracker();
