/**
 * Этот код реализует приложение Pokedex, которое загружает и отображает информацию о покемонах.
 * Приложение использует API PokeAPI для получения данных, разбивает их на страницы и отображает
 * с помощью пользовательского интерфейса с возможностью пагинации.
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

/**
 * Класс Pokedex представляет основную функциональность приложения для отображения покемонов
 */
class Pokedex {
  /**
   * Создает экземпляр Pokedex
   */
  constructor() {
    /**
     * Конфигурация приложения
     * @type {Object}
     */
    this.config = {
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
     * Состояние приложения
     * @type {Object}
     */
    this.state = {
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
     * Утилитарные функции
     * @type {Object}
     */
    this.utils = {
      /**
       * Преобразует строку селектора в атрибут данных
       * @param {string} element - Селектор элемента
       * @returns {string} Строка атрибута данных
       */
      renderDataAttributes: (element) => element.slice(1, -1),

      /**
       * Конфигурация для toast-уведомлений
       * @type {Object}
       */
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
          ...this.utils.toastConfig,
        }).showToast();
      },

      /**
       * Обрабатывает ошибки и отображает уведомление
       * @param {string} message - Сообщение об ошибке
       * @param {Error} [error=null] - Объект ошибки
       */
      handleError: (message, error = null) => {
        this.utils.showToast(message);
        if (error) console.error(message, error);
      },
    };

    this.init();
  }

  /**
   * Создает HTML-структуру приложения
   */
  createAppHTML() {
    const {
      root,
      selectors: {
        pokemonList,
        paginationControls,
      },
    } = this.config;
    const { renderDataAttributes } = this.utils;
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
  initDOMElements() {
    this.state.elements = {
      pokemonList: document.querySelector(this.config.selectors.pokemonList),
      paginationControls: document.querySelector(this.config.selectors.paginationControls),
    };
  }

  /**
   * Инициализирует приложение
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();

    (async () => {
      this.state.pages = this.paginate(await this.fetchPokemons());
      this.renderPokemons();
      this.state.elements.paginationControls.addEventListener('click', this.handlePaginationControlsClick.bind(this));
    })();
  }

  /**
   * Загружает данные о покемонах из API
   * @returns {Promise<Array>} Массив данных о покемонах
   */
  async fetchPokemons() {
    try {
      const promises = Array.from({ length: this.config.count - 1 }, (_, i) =>
        axios.get(`${this.config.apiUrl}/${i + 1}`),
      );
      const responses = await Promise.all(promises);
      return responses.map(({ data: { id, name, types } }) => {
        const pokemonTypes = types.map(({ type: { name } }) => name);
        const type = Object.keys(this.config.color).find((type) =>
          pokemonTypes.includes(type),
        );

        return {
          id,
          name: name.charAt(0).toUpperCase() + name.slice(1),
          pokemonId: id.toString().padStart(3, '0'),
          type,
          color: this.config.color[type],
        };
      });
    } catch (error) {
      this.utils.handleError('Error loading pokemons', error);
      return [];
    }
  }

  /**
   * Разбивает данные на страницы
   * @param {Array} data - Массив данных для разбивки
   * @param {number} [itemsPerPage=9] - Количество элементов на странице
   * @returns {Array} Массив страниц
   */
  paginate(data, itemsPerPage = 9) {
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
  renderPokemons() {
    this.renderPokemonsList(this.state.pages[this.state.index]);
    this.renderButtons(this.state.elements.paginationControls, this.state.pages, this.state.index);
  }

  /**
   * Отрисовывает список покемонов
   * @param {Array} items - Массив покемонов для отображения
   */
  renderPokemonsList(items) {
    if (!this.state.elements.pokemonList) return;
    this.state.elements.pokemonList.innerHTML = items
      .map(
        ({ id, name, pokemonId, type, color }) => `
    <li class='border rounded-lg overflow-hidden min-h-[248px]'>
      <div class='flex justify-center items-center p-2' style='background-color: ${color}'>
        <img src='${this.config.spritesUrl}/${id}.png' alt='${name}'>
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
  renderButtons(container, pages, activeIndex) {
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
  handlePaginationControlsClick({ target: { dataset } }) {
    if (dataset.pagination) return;

    if (dataset.index) {
      this.state.index = parseInt(dataset.index);
    } else if (dataset.type) {
      this.state.index += dataset.type === 'next' ? 1 : -1;
    }
    this.renderPokemons();
  }
}

new Pokedex();