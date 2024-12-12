/**
 * @fileoverview Корневой компонент приложения Pokedex
 * @author Your Name
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Loader } from '@ui';
import { Pagination, PokemonCard, PokemonModal } from './index.js';
import { showToast } from '@utils';
import { usePagination } from '@hooks';

/**
 * Объект с константами приложения
 * @constant
 * @type {Object}
 */
const CONSTANTS = {
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
 * Корневой компонент приложения Pokedex
 * @returns {JSX.Element} Корневой компонент приложения
 */
const Root = () => {
  // Состояние для отслеживания статуса загрузки и ошибок
  const [fetchStatus, setFetchStatus] = useState({ loading: false, error: null });

  // Состояние для хранения данных о покемонах
  const [pokemonStore, setPokemonStore] = useState({
    collection: [],
    selectedPokemon: null,
  });

  // Состояние для управления модальным окном
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Реф для модального окна
  const modalRef = useRef(null);

  // Хук пагинации
  const {
    currentPage,
    paginatedData,
    handlePaginationClick,
    handlePaginationNumberClick,
  } = usePagination(pokemonStore.collection, 10);

  /**
   * Асинхронная функция для загрузки данных о покемонах
   * @function
   * @async
   */
  const fetchPokemons = useCallback(async () => {
    setFetchStatus({ ...fetchStatus, loading: true });

    try {
      // Загрузка данных о покемонах параллельно
      const responses = await Promise.all(
        Array.from({ length: CONSTANTS.count - 1 }, (_, i) =>
          axios.get(`${CONSTANTS.apiUrl}/${i + 1}`),
        ),
      );

      // Форматирование полученных данных
      const formattedData = responses.map(({ data: { id, name, types } }) => ({
        id,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        pokemonId: id.toString().padStart(3, '0'),
        type: types[0].type.name,
        color: CONSTANTS.color[types[0].type.name] || CONSTANTS.color.normal,
      }));

      // Обновление состояния с отформатированными данными
      setPokemonStore({
        ...pokemonStore,
        collection: formattedData,
      });
    } catch (error) {
      showToast('Failed to fetch pokemons from API.', 'error');
      console.error('Error fetching pokemons:', error.message);
    } finally {
      setFetchStatus({ ...fetchStatus, loading: false });
    }
  }, []);

  /**
   * Функция для переключения состояния модального окна
   * @function
   */
  const handleToggleModal = useCallback(() => {
    setIsModalOpen(prevState => !prevState);
    setPokemonStore(prevState => ({
      ...prevState,
      selectedPokemon: prevState.selectedPokemon ? prevState.selectedPokemon : null,
    }));
  }, []);

  /**
   * Функция для обработки клика вне модального окна
   * @function
   * @param {Event} e - Объект события клика
   */
  const handleOverlayClick = useCallback((e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      handleToggleModal();
    }
  }, [handleToggleModal]);

  // Эффект для загрузки данных при монтировании компонента
  useEffect(() => {
    (async () => {
      await fetchPokemons();
    })();
  }, [fetchPokemons]);

  // Эффект для обработки нажатия клавиши Escape
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isModalOpen) handleToggleModal();
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isModalOpen, handleToggleModal]);

  return (
    <div className="grid max-w-3xl w-full gap-4 mx-auto p-3">
      <h1 className="text-2xl md:text-3xl font-bold text-center">Pokedex</h1>
      {fetchStatus.loading && <Loader />}

      {!fetchStatus.loading && (
        <>
          {paginatedData.length === 0 && (<p className="text-center text-gray-600">No pokemons found.</p>)}
          <ul className="gap-3 grid md:grid-cols-3 sm:grid-cols-2">
            {paginatedData[currentPage]?.map((pokemon) => (
              <PokemonCard
                key={pokemon.id}
                {...pokemon}
                constants={CONSTANTS}
                onClick={handleToggleModal}
                setPokemonStore={setPokemonStore}
              />
            ))}
          </ul>

          <Pagination
            currentPage={currentPage}
            totalPages={paginatedData.length}
            onNumberClick={handlePaginationNumberClick}
            onPageChange={handlePaginationClick}
          />

          {isModalOpen && pokemonStore.selectedPokemon && (
            <PokemonModal
              pokemonData={pokemonStore.selectedPokemon}
              onClose={handleToggleModal}
              modalRef={modalRef}
              handleOverlayClick={handleOverlayClick}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Root;
