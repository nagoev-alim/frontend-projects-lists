/**
 * Этот код представляет собой класс WaterTracker, который реализует функциональность
 * трекера потребления воды. Он позволяет пользователю устанавливать цель потребления воды,
 * отмечать выпитые стаканы и отслеживать прогресс. Класс управляет интерфейсом,
 * обрабатывает пользовательский ввод и сохраняет данные в локальном хранилище.
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * Интерфейс для конфигурации приложения
 */
interface AppConfig {
  /** Селектор корневого элемента */
  root: string;
  /** Объект с селекторами элементов */
  selectors: {
    [key: string]: string;
  };
  /** Массив доступных размеров стаканов */
  sizes: number[];
}

/**
 * Интерфейс для состояния приложения
 */
interface AppState {
  /** Объект с элементами DOM */
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
  /** Объект с данными трекера */
  trackerData: {
    goal?: number;
    size?: number;
    count?: number;
    cupDisplayHeight?: number;
    fulledCups?: number;
    totalCups?: number;
  };
}

/**
 * Интерфейс для утилит приложения
 */
interface AppUtils {
  /** Функция для рендеринга data-атрибутов */
  renderDataAttributes: (element: string) => string;
  /** Конфигурация для тостов */
  toastConfig: {
    [key: string]: string | number;
  };
  /** Функция для показа тоста */
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
 * Класс WaterTracker для отслеживания потребления воды
 */
class WaterTracker {
  /** Конфигурация приложения */
  private readonly config: AppConfig;
  /** Состояние приложения */
  private state: AppState;
  /** Утилиты приложения */
  private readonly utils: AppUtils;

  /**
   * Конструктор класса WaterTracker
   */
  constructor() {
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
      trackerData: {},
    };

    this.utils = {
      renderDataAttributes: (element) => element.slice(1, -1),
      toastConfig: {
        className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
        duration: 3000,
        gravity: 'bottom',
        position: 'center',
      },
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
   * Создает HTML структуру приложения
   */
  private createAppHTML(): void {
    const {
      root,
      selectors: { form, tracker, goal, remained, liters, percentage, cups, reset },
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
   * Инициализирует DOM элементы
   */
  private initDOMElements(): void {
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
   * Инициализирует приложение
   */
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();
    this.state.trackerData = this.getStoredWaterConfig();
    this.displayStoredWaterConfig();
    if (this.state.elements.form && this.state.elements.reset) {
      this.state.elements.form.addEventListener('submit', this.handleFormSubmit.bind(this));
      this.state.elements.reset.addEventListener('click', this.handleResetClick.bind(this));
    }
  }

  /**
   * Получает сохраненную конфигурацию воды из localStorage
   */
  private getStoredWaterConfig(): WaterConfig {
    return JSON.parse(localStorage.getItem('waterConfig') || '{}') as WaterConfig;
  }

  /**
   * Сохраняет текущую конфигурацию воды в localStorage
   */
  private setStoredWaterConfig(): void {
    localStorage.setItem('waterConfig', JSON.stringify(this.state.trackerData));
  }

  /**
   * Отображает сохраненную конфигурацию воды
   */
  private displayStoredWaterConfig(): void {
    const { goal, size, count, fulledCups } = this.getStoredWaterConfig();
    if (!goal || !size || !fulledCups) return;

    Object.assign(this.state.trackerData, { goal, size, count });
    this.renderCups(size);
    this.toggleUIElements();
    this.updateBigCup();
    this.markFilledSmallCups(fulledCups);
  }

  /**
   * Переключает отображение элементов UI
   */
  private toggleUIElements() {
    if (this.state.elements.form && this.state.elements.tracker) {
      this.state.elements.form.classList.add('hidden');
      this.state.elements.tracker.classList.replace('hidden', 'grid');
    }
  }

  /**
   * Отмечает заполненные маленькие стаканы
   * @param filledCount - количество заполненных стаканов
   */
  private markFilledSmallCups(filledCount: number): void {
    const cupsList = Array.from(document.querySelectorAll('[data-cups-item]')) as HTMLLIElement[];
    cupsList.forEach((cup, index) => cup.classList.toggle('full', index < filledCount));
  }

  /**
   * Рендерит стаканы
   * @param size - размер стакана
   */
  private renderCups(size: number): void {
    if (this.state.elements.goal && this.state.elements.liters && this.state.elements.cups && this.state.trackerData) {
      if (this.state.trackerData.goal !== undefined) {
        this.state.elements.goal.textContent = this.state.trackerData.goal.toString();
        this.state.elements.liters.textContent = `${this.state.trackerData.goal}L`;
      }
      this.state.elements.cups.innerHTML = Array(this.state.trackerData.count)
        .fill(`<li class="drink-water__cup" data-cups-item>${size} ml</li>`)
        .join('');

      const cupsList = Array.from(document.querySelectorAll('[data-cups-item]')) as HTMLLIElement[];
      cupsList.forEach((cup, index) => cup.addEventListener('click', () => this.fillCups(index)));
    }
  }

  /**
   * Заполняет стаканы
   * @param index - индекс стакана
   */
  private fillCups(index: number): void {
    const cupsItems = Array.from(document.querySelectorAll('[data-cups-item]')) as HTMLLIElement[];
    index = this.adjustIndex(index, cupsItems);
    this.updateCupStates(index, cupsItems);
    this.updateConfigs(cupsItems);
    this.setStoredWaterConfig();
    this.updateBigCup();
  }

  /**
   * Корректирует индекс стакана
   * @param index - индекс стакана
   * @param cupsItems - список стаканов
   */
  private adjustIndex(index: number, cupsItems: HTMLLIElement[]): number {
    return this.isLastCupFull(index, cupsItems) ||
    this.isCurrentCupFullAndNextEmpty(index, cupsItems)
      ? index - 1
      : index;
  }

  /**
   * Проверяет, является ли последний стакан заполненным
   * @param {number} index - Индекс проверяемого стакана
   * @param {HTMLLIElement[]} cupsItems - Массив элементов стаканов
   * @returns {boolean | void} - true, если последний стакан заполнен, иначе undefined
   */
  private isLastCupFull(index: number, cupsItems: HTMLLIElement[]): boolean | void {
    if (!this.state.trackerData.count) return;
    return index === this.state.trackerData.count - 1 &&
      cupsItems[index].classList.contains('full');
  }

  /**
   * Проверяет, является ли текущий стакан заполненным, а следующий - пустым
   * @param {number} index - Индекс проверяемого стакана
   * @param {HTMLLIElement[]} cupsItems - Массив элементов стаканов
   * @returns {boolean} - true, если текущий стакан заполнен, а следующий пуст
   */
  private isCurrentCupFullAndNextEmpty(index: number, cupsItems: HTMLLIElement[]): boolean {
    return cupsItems[index]?.classList.contains('full') &&
      cupsItems[index + 1] &&
      !cupsItems[index + 1].classList.contains('full');
  }

  /**
   * Обновляет состояние заполнения стаканов
   * @param {number} index - Индекс, до которого нужно заполнить стаканы
   * @param {HTMLLIElement[]} cupsItems - Массив элементов стаканов
   */
  private updateCupStates(index: number, cupsItems: HTMLLIElement[]): void {
    cupsItems.forEach((cup, idx) => cup.classList.toggle('full', idx <= index));
  }

  /**
   * Обновляет конфигурацию трекера
   * @param {HTMLLIElement[]} cupsItems - Массив элементов стаканов
   */
  private updateConfigs(cupsItems: HTMLLIElement[]): void {
    Object.assign(this.state.trackerData, {
      cupDisplayHeight: (document.querySelector('.drink-water__cup--big') as HTMLElement)?.offsetHeight || 0,
      fulledCups: document.querySelectorAll('.drink-water__cup.full').length,
      totalCups: cupsItems.length,
    });
  }

  /**
   * Обновляет отображение большого стакана
   */
  private updateBigCup(): void {
    this.updatePercentageDisplay();
    this.updateRemainedDisplay();
  }

  /**
   * Обновляет отображение процента заполнения
   */
  private updatePercentageDisplay(): void {
    const { fulledCups, totalCups, cupDisplayHeight } = this.state.trackerData;
    if (!fulledCups || !totalCups || !cupDisplayHeight || !this.state.elements.percentage) return;
    const percentageFilled = fulledCups / totalCups;
    this.state.elements.percentage.style.visibility = fulledCups === 0 ? 'hidden' : 'visible';
    this.state.elements.percentage.style.height = `${percentageFilled * cupDisplayHeight}px`;
    this.state.elements.percentage.innerText = fulledCups === 0 ? '' : `${(percentageFilled * 100).toFixed(1)}%`;
  }

  /**
   * Обновляет отображение оставшегося количества воды
   */
  private updateRemainedDisplay(): void {
    const { fulledCups, totalCups, goal, size } = this.state.trackerData;
    if (!this.state.elements.remained || !this.state.elements.liters || !fulledCups || !goal || !size) return;
    const isFullyFilled = fulledCups === totalCups && fulledCups !== 0;

    this.state.elements.remained.style.visibility = isFullyFilled ? 'hidden' : 'visible';
    this.state.elements.remained.style.height = isFullyFilled ? '0' : 'auto';

    if (!isFullyFilled) {
      const remainedLiters = goal - (size * fulledCups) / 1000;
      this.state.elements.liters.innerText = `${remainedLiters.toFixed(1)}L`;
    }
  }

  /**
   * Обрабатывает отправку формы
   * @param {Event} event - Событие отправки формы
   */
  private handleFormSubmit(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const goal = Number(formData.get('goal'));
    const size = Number(formData.get('size'));

    if (!goal || isNaN(goal) || !size || isNaN(size)) {
      this.utils.showToast('Please enter valid numbers');
      return;
    }

    this.state.trackerData = {
      goal: Number(goal),
      size: Number(size),
      count: Math.round((goal / size) * 1000),
      cupDisplayHeight: (document.querySelector('.drink-water__cup--big') as HTMLElement)?.offsetHeight || 0,
      fulledCups: 0,
      totalCups: 0,
    };
    this.renderCups(Number(size));
    form.reset();
    this.toggleUIElements();
    this.setStoredWaterConfig();
  }

  /**
   * Обрабатывает нажатие кнопки сброса
   */
  private handleResetClick(): void {
    localStorage.clear();
    location.reload();
  }
}

new WaterTracker();
