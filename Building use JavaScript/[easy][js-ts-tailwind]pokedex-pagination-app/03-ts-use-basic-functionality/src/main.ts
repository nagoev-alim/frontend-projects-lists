/**
 * Этот код представляет собой приложение Pokedex, которое загружает и отображает информацию о покемонах.
 * Он использует API PokeAPI для получения данных, разбивает их на страницы и отображает с помощью
 * пользовательского интерфейса с возможностью пагинации.
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

/**
 * Интерфейс конфигурации приложения
 */
interface AppConfig {
  /** Селектор корневого элемента */
  root: string;
  /** Селекторы для элементов DOM */
  selectors: {
    pokemonList: string;
    paginationControls: string;
  };
  /** Количество покемонов для загрузки */
  count: number;
  /** Цвета для типов покемонов */
  color: { [key: string]: string };
  /** URL для API покемонов */
  apiUrl: string;
  /** URL для спрайтов покемонов */
  spritesUrl: string;
}

/**
 * Конфигурация приложения
 */
const APP_CONFIG: AppConfig = {
  root: '#app',
  selectors: {
    pokemonList: '[data-pokemon-list]',
    paginationControls: '[data-pagination-controls]',
  },
  count: 40,
  color: {
    fire: '#FDDFDF',
    grass: '#DEFDE0',
    electric: '#FCF7DE',
    water: '#DEF3FD',
    ground: '#f4e7da',
    rock: '#d5d5d4',
    fairy: '#fceaff',
    poison: '#98d7a5',
    bug: '#f8d5a3',
    dragon: '#97b3e6',
    psychic: '#eaeda1',
    flying: '#F5F5F5',
    fighting: '#E6E0D4',
    normal: '#F5F5F5',
  },
  apiUrl: 'https://pokeapi.co/api/v2/pokemon',
  spritesUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon',
};

/**
 * Интерфейс состояния приложения
 */
interface AppState {
  /** Элементы DOM */
  elements: {
    pokemonList: HTMLElement | null;
    paginationControls: HTMLElement | null;
  };
  /** Индекс текущей страницы */
  index: number;
  /** Массив страниц с покемонами */
  pages: Pokemon[][];
}

/**
 * Состояние приложения
 */
const APP_STATE: AppState = {
  elements: {
    pokemonList: null,
    paginationControls: null,
  },
  index: 0,
  pages: [],
};

/**
 * Интерфейс утилит приложения
 */
interface AppUtils {
  /** Функция для рендеринга data-атрибутов */
  renderDataAttributes: (element: string) => string;
  /** Конфигурация для toast-уведомлений */
  toastConfig: {
    className: string;
    duration: number;
    gravity: string;
    position: string;
  };
  /** Функция для отображения toast-уведомления */
  showToast: (message: string) => void;
  /** Функция для обработки ошибок */
  handleError: (message: string, error?: Error) => void;
}

/**
 * Утилиты приложения
 */
const APP_UTILS: AppUtils = {
  renderDataAttributes: (element: string) => element.slice(1, -1),
  toastConfig: {
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  },
  showToast: (message: string) => {
    // @ts-ignore
    Toastify({
      text: message,
      ...APP_UTILS.toastConfig,
    }).showToast();
  },
  handleError: (message: string, error: Error | null = null) => {
    APP_UTILS.showToast(message);
    if (error) console.error(message, error);
  },
};

/**
 * Создает HTML-структуру приложения
 */
function createAppHTML(): void {
  const {
    root,
    selectors: {
      pokemonList,
      paginationControls,
    },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='gap-4 grid items-start max-w-3xl mx-auto w-full'>
      <h1 class='font-bold md:text-4xl text-2xl text-center'>Pokedex</h1>
      <ul class='gap-3 grid md:grid-cols-3 sm:grid-cols-2' ${renderDataAttributes(pokemonList)}></ul>
      <ul class='flex gap-3 items-center justify-center' ${renderDataAttributes(paginationControls)}></ul>
    </div>
  `;
}

/**
 * Инициализирует элементы DOM
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    pokemonList: document.querySelector(APP_CONFIG.selectors.pokemonList),
    paginationControls: document.querySelector(APP_CONFIG.selectors.paginationControls),
  };
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();

  (async () => {
    APP_STATE.pages = paginate(await fetchPokemons());
    renderPokemons();
    if (APP_STATE.elements.paginationControls) {
      APP_STATE.elements.paginationControls.addEventListener(
        'click',
        handlePaginationControlsClick,
      );
    }
  })();
}

/**
 * Интерфейс для объекта покемона
 */
interface Pokemon {
  /** ID покемона */
  id: number;
  /** Имя покемона */
  name: string;
  /** ID покемона в виде строки с ведущими нулями */
  pokemonId: string;
  /** Тип покемона */
  type: string;
  /** Цвет, соответствующий типу покемона */
  color: string;
}

/**
 * Загружает данные о покемонах с API
 * @returns Промис с массивом объектов Pokemon
 */
async function fetchPokemons(): Promise<Pokemon[]> {
  try {
    const promises = Array.from({ length: APP_CONFIG.count - 1 }, (_, i) =>
      axios.get(`${APP_CONFIG.apiUrl}/${i + 1}`),
    );
    const responses = await Promise.all(promises);
    return responses.map(({ data }) => {
      const pokemonTypes = data.types.map((t: any) => t.type.name);
      const type = Object.keys(APP_CONFIG.color).find((t) =>
        pokemonTypes.includes(t),
      ) || 'normal';

      return {
        id: data.id,
        name: data.name.charAt(0).toUpperCase() + data.name.slice(1),
        pokemonId: data.id.toString().padStart(3, '0'),
        type,
        color: APP_CONFIG.color[type],
      };
    });
  } catch (error) {
    APP_UTILS.handleError('Error loading pokemons', error as Error);
    return [];
  }
}

/**
 * Разбивает массив покемонов на страницы
 * @param data Массив покемонов
 * @param itemsPerPage Количество элементов на странице
 * @returns Массив страниц с покемонами
 */
function paginate(data: Pokemon[], itemsPerPage: number = 9): Pokemon[][] {
  return data.reduce((pages: Pokemon[][], item: Pokemon, index: number) => {
    const pageIndex = Math.floor(index / itemsPerPage);
    pages[pageIndex] = pages[pageIndex] || [];
    pages[pageIndex].push(item);
    return pages;
  }, []);
}

/**
 * Отрисовывает покемонов и кнопки пагинации
 */
function renderPokemons(): void {
  renderPokemonsList(APP_STATE.pages[APP_STATE.index]);
  renderButtons(APP_STATE.elements.paginationControls, APP_STATE.pages, APP_STATE.index);
}

/**
 * Отрисовывает список покемонов
 * @param items Массив покемонов для отрисовки
 */
function renderPokemonsList(items: Pokemon[]): void {
  if (!APP_STATE.elements.pokemonList) return;
  APP_STATE.elements.pokemonList.innerHTML = items
    .map(
      ({ id, name, pokemonId, type, color }) => `
    <li class='border rounded-lg overflow-hidden min-h-[248px]'>
      <div class='flex justify-center items-center p-2' style='background-color: ${color}'>
        <img src='${APP_CONFIG.spritesUrl}/${id}.png' alt='${name}'>
      </div>
      <div class='bg-white grid gap-2 place-items-center p-3'>
        <span class='rounded-xl bg-neutral-500 p-1.5 font-medium text-white'>#${pokemonId}</span>
        <h3 class='h5'>${name}</h3>
        <div class='flex'><p class='font-bold'>Type</p>: ${type}</div>
      </div>
    </li>
  `,
    )
    .join('');
}

/**
 * Отрисовывает кнопки пагинации
 * @param container HTML-элемент для размещения кнопок
 * @param pages Массив страниц с покемонами
 * @param activeIndex Индекс активной страницы
 */
function renderButtons(container: HTMLElement | null, pages: Pokemon[][], activeIndex: number): void {
  if (!container) return;
  const createButton = (text: string, type: string, disabled: boolean) => `
    <button class='px-2 py-1.5 border rounded ${
    disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:bg-slate-50'
  }' 
            data-type='${type}' ${disabled ? 'disabled' : ''}>
      ${text}
    </button>
  `;

  const pageButtons = pages.map(
    (_, pageIndex) => `
    <li>
      <button class='px-4 py-1.5 border rounded hover:bg-slate-50 ${
      activeIndex === pageIndex ? 'bg-slate-100' : 'bg-white'
    }' 
              data-index='${pageIndex}'>
        ${pageIndex + 1}
      </button>
    </li>
  `,
  );

  const prevButton = `<li>${createButton('Prev', 'prev', activeIndex <= 0)}</li>`;
  const nextButton = `<li>${createButton(
    'Next',
    'next',
    activeIndex >= pages.length - 1,
  )}</li>`;

  container.innerHTML = [prevButton, ...pageButtons, nextButton].join('');
}

/**
 * Обрабатывает клики по элементам управления пагинацией.
 * Обновляет индекс текущей страницы и перерисовывает список покемонов.
 *
 * @param {MouseEvent} event - Объект события клика мыши
 */
function handlePaginationControlsClick(event: MouseEvent): void {
  const target = event.target as HTMLElement;
  const dataset = target.dataset;

  if (dataset.pagination) return;

  if (dataset.index) {
    APP_STATE.index = parseInt(dataset.index);
  } else if (dataset.type) {
    APP_STATE.index += dataset.type === 'next' ? 1 : -1;
  }
  renderPokemons();
}

/**
 * Инициализирует приложение, вызывая функцию initApp.
 */
initApp();