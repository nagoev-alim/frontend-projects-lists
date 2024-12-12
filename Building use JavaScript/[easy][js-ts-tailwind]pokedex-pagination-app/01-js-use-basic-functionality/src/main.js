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
 * Объект конфигурации приложения
 * @type {Object}
 */
const APP_CONFIG = {
  /** Селектор корневого элемента */
  root: '#app',
  /** Селекторы для элементов DOM */
  selectors: {
    pokemonList: '[data-pokemon-list]',
    paginationControls: '[data-pagination-controls]',
  },
  /** Количество покемонов для загрузки */
  count: 40,
  /** Цвета для различных типов покемонов */
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
  /** URL API для получения данных о покемонах */
  apiUrl: 'https://pokeapi.co/api/v2/pokemon',
  /** URL для получения изображений покемонов */
  spritesUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon',
};

/**
 * Объект состояния приложения
 * @type {Object}
 */
const APP_STATE = {
  /** Элементы DOM */
  elements: {
    pokemonList: null,
    paginationControls: null,
  },
  /** Индекс текущей страницы */
  index: 0,
  /** Массив страниц с данными о покемонах */
  pages: [],
};

/**
 * Объект с утилитарными функциями
 * @type {Object}
 */
const APP_UTILS = {
  /**
   * Преобразует строку селектора в атрибут данных
   * @param {string} element - Селектор элемента
   * @returns {string} Строка атрибута данных
   */
  renderDataAttributes: (element) => element.slice(1, -1),
  
  /** Конфигурация для toast-уведомлений */
  toastConfig: {
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  },
  
  /**
   * Отображает toast-уведомление
   * @param {string} message - Сообщение для отображения
   */
  showToast: (message) => {
    Toastify({
      text: message,
      ...APP_UTILS.toastConfig,
    }).showToast();
  },
  
  /**
   * Обрабатывает ошибки и отображает уведомление
   * @param {string} message - Сообщение об ошибке
   * @param {Error} [error=null] - Объект ошибки
   */
  handleError: (message, error = null) => {
    APP_UTILS.showToast(message);
    if (error) console.error(message, error);
  },
};

/**
 * Создает HTML-структуру приложения
 */
function createAppHTML() {
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
function initDOMElements() {
  APP_STATE.elements = {
    pokemonList: document.querySelector(APP_CONFIG.selectors.pokemonList),
    paginationControls: document.querySelector(APP_CONFIG.selectors.paginationControls),
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();

  (async () => {
    APP_STATE.pages = paginate(await fetchPokemons());
    renderPokemons();
    APP_STATE.elements.paginationControls.addEventListener(
      'click',
      handlePaginationControlsClick,
    );
  })();
}

/**
 * Загружает данные о покемонах из API
 * @returns {Promise<Array>} Массив данных о покемонах
 */
async function fetchPokemons() {
  try {
    const promises = Array.from({ length: APP_CONFIG.count - 1 }, (_, i) =>
      axios.get(`${APP_CONFIG.apiUrl}/${i + 1}`),
    );
    const responses = await Promise.all(promises);
    return responses.map(({ data: { id, name, types } }) => {
      const pokemonTypes = types.map(({ type: { name } }) => name);
      const type = Object.keys(APP_CONFIG.color).find((type) =>
        pokemonTypes.includes(type),
      );

      return {
        id,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        pokemonId: id.toString().padStart(3, '0'),
        type,
        color: APP_CONFIG.color[type],
      };
    });
  } catch (error) {
    APP_UTILS.handleError('Error loading pokemons', error);
    return [];
  }
}

/**
 * Разбивает массив данных на страницы
 * @param {Array} data - Массив данных для разбивки
 * @param {number} [itemsPerPage=9] - Количество элементов на странице
 * @returns {Array} Массив страниц
 */
function paginate(data, itemsPerPage = 9) {
  return data.reduce((pages, item, index) => {
    const pageIndex = Math.floor(index / itemsPerPage);
    pages[pageIndex] = pages[pageIndex] || [];
    pages[pageIndex].push(item);
    return pages;
  }, []);
}

/**
 * Отрисовывает покемонов и кнопки пагинации
 */
function renderPokemons() {
  renderPokemonsList(APP_STATE.pages[APP_STATE.index]);
  renderButtons(APP_STATE.elements.paginationControls, APP_STATE.pages, APP_STATE.index);
}

/**
 * Отрисовывает список покемонов
 * @param {Array} items - Массив покемонов для отрисовки
 */
function renderPokemonsList(items) {
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
 * @param {HTMLElement} container - Контейнер для кнопок
 * @param {Array} pages - Массив страниц
 * @param {number} activeIndex - Индекс активной страницы
 */
function renderButtons(container, pages, activeIndex) {
  if (!container) return;
  const createButton = (text, type, disabled) => `
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
 * Обработчик клика по кнопкам пагинации
 * @param {Event} event - Объект события
 */
function handlePaginationControlsClick({ target: { dataset } }) {
  if (dataset.pagination) return;

  if (dataset.index) {
    APP_STATE.index = parseInt(dataset.index);
  } else if (dataset.type) {
    APP_STATE.index += dataset.type === 'next' ? 1 : -1;
  }
  renderPokemons();
}

initApp();