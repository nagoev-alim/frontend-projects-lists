/**
 * Этот модуль реализует приложение Pokedex, которое загружает и отображает информацию о покемонах.
 * Приложение использует API PokeAPI для получения данных, разбивает их на страницы и отображает
 * с помощью пользовательского интерфейса с возможностью пагинации.
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

/**
 * Интерфейс, описывающий структуру данных покемона.
 */
interface PokemonData {
  /** Уникальный идентификатор покемона */
  id: number;
  /** Имя покемона */
  name: string;
  /** Строковое представление ID покемона с ведущими нулями */
  pokemonId: string;
  /** Тип покемона */
  type: string;
  /** Цвет, ассоциированный с типом покемона */
  color: string;
}

/**
 * Интерфейс, описывающий конфигурацию приложения.
 */
interface Config {
  /** Селектор корневого элемента приложения */
  root: string;
  /** Объект с селекторами для различных элементов DOM */
  selectors: {
    pokemonList: string;
    paginationControls: string;
  };
  /** Количество покемонов для загрузки */
  count: number;
  /** Объект, сопоставляющий типы покемонов с цветами */
  color: { [key: string]: string };
  /** URL API для получения данных о покемонах */
  apiUrl: string;
  /** URL для получения изображений покемонов */
  spritesUrl: string;
}

/**
 * Интерфейс, описывающий состояние приложения.
 */
interface State {
  /** Объект с ссылками на элементы DOM */
  elements: {
    pokemonList: HTMLElement | null;
    paginationControls: HTMLElement | null;
  };
  /** Индекс текущей страницы */
  index: number;
  /** Массив страниц с данными о покемонах */
  pages: PokemonData[][];
}

/**
 * Интерфейс, описывающий вспомогательные утилиты.
 */
interface Utils {
  /** Функция для рендеринга data-атрибутов */
  renderDataAttributes: (element: string) => string;
  /** Конфигурация для тостов */
  toastConfig: {
    className: string;
    duration: number;
    gravity: string;
    position: string;
  };
  /** Функция для отображения тоста */
  showToast: (message: string) => void;
  /** Функция для обработки ошибок */
  handleError: (message: string, error?: Error) => void;
}

/**
 * Класс, реализующий функциональность Pokedex.
 */
class Pokedex {
  private config: Config;
  private state: State;
  private utils: Utils;

  /**
   * Создает экземпляр класса Pokedex.
   */
  constructor() {
    this.config = {
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

    this.state = {
      elements: {
        pokemonList: null,
        paginationControls: null,
      },
      index: 0,
      pages: [],
    };

    this.utils = {
      renderDataAttributes: (element: string): string => element.slice(1, -1),
      toastConfig: {
        className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
        duration: 3000,
        gravity: 'bottom',
        position: 'center',
      },
      showToast: (message: string): void => {
        Toastify({
          text: message,
          ...this.utils.toastConfig,
        }).showToast();
      },
      handleError: (message: string, error: Error | null = null): void => {
        this.utils.showToast(message);
        if (error) console.error(message, error);
      },
    };

    this.init();
  }

  /**
   * Создает HTML-разметку приложения.
   */
  private createAppHTML(): void {
    const { root, selectors: { pokemonList, paginationControls } } = this.config;
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
   * Инициализирует DOM-элементы.
   */
  private initDOMElements(): void {
    this.state.elements = {
      pokemonList: document.querySelector(this.config.selectors.pokemonList),
      paginationControls: document.querySelector(this.config.selectors.paginationControls),
    };
  }

  /**
   * Инициализирует приложение.
   */
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();

    (async () => {
      this.state.pages = this.paginate(await this.fetchPokemons());
      this.renderPokemons();
      this.state.elements.paginationControls?.addEventListener('click', this.handlePaginationControlsClick.bind(this));
    })();
  }

  /**
   * Загружает данные о покемонах с API.
   * @returns Массив данных о покемонах.
   */
  private async fetchPokemons(): Promise<PokemonData[]> {
    try {
      const promises = Array.from({ length: this.config.count - 1 }, (_, i) =>
        axios.get(`${this.config.apiUrl}/${i + 1}`)
      );
      const responses = await Promise.all(promises);
      return responses.map(({ data: { id, name, types } }) => {
        const pokemonTypes = types.map(({ type: { name } }: { type: { name: string } }) => name);
        const type = Object.keys(this.config.color).find((type) =>
          pokemonTypes.includes(type)
        ) || 'normal';

        return {
          id,
          name: name.charAt(0).toUpperCase() + name.slice(1),
          pokemonId: id.toString().padStart(3, '0'),
          type,
          color: this.config.color[type],
        };
      });
    } catch (error) {
      this.utils.handleError('Error loading pokemons', error as Error);
      return [];
    }
  }

  /**
   * Разбивает массив данных на страницы.
   * @param data Массив данных для разбивки.
   * @param itemsPerPage Количество элементов на странице.
   * @returns Массив страниц с данными.
   */
  private paginate(data: PokemonData[], itemsPerPage: number = 9): PokemonData[][] {
    return data.reduce((pages: PokemonData[][], item: PokemonData, index: number) => {
      const pageIndex = Math.floor(index / itemsPerPage);
      pages[pageIndex] = pages[pageIndex] || [];
      pages[pageIndex].push(item);
      return pages;
    }, []);
  }

  /**
   * Отрисовывает покемонов и кнопки пагинации.
   */
  private renderPokemons(): void {
    this.renderPokemonsList(this.state.pages[this.state.index]);
    this.renderButtons(this.state.elements.paginationControls, this.state.pages, this.state.index);
  }

  /**
   * Отрисовывает список покемонов.
   * @param items Массив данных о покемонах для отрисовки.
   */
  private renderPokemonsList(items: PokemonData[]): void {
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
        `
      )
      .join('');
  }

  /**
   * Отрисовывает кнопки пагинации.
   * @param container Контейнер для кнопок.
   * @param pages Массив страниц.
   * @param activeIndex Индекс активной страницы.
   */
  private renderButtons(container: HTMLElement | null, pages: PokemonData[][], activeIndex: number): void {
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
      `
    );

    const prevButton = `<li>${createButton('Prev', 'prev', activeIndex <= 0)}</li>`;
    const nextButton = `<li>${createButton(
      'Next',
      'next',
      activeIndex >= pages.length - 1
    )}</li>`;

    container.innerHTML = [prevButton, ...pageButtons, nextButton].join('');
  }
  /**
   * Обрабатывает клики по элементам управления пагинацией.
   * @param {MouseEvent} event - Событие клика мыши.
   */
  private handlePaginationControlsClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const dataset = target.dataset;

    if (dataset.pagination) return;

    if (dataset.index) {
      this.state.index = parseInt(dataset.index);
    } else if (dataset.type) {
      this.state.index += dataset.type === 'next' ? 1 : -1;
    }
    this.renderPokemons();
  }
}

/**
 * Создает новый экземпляр класса Pokedex.
 */
new Pokedex();