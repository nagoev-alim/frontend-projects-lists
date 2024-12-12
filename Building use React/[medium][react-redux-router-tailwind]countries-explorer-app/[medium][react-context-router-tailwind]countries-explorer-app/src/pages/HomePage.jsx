/**
 * @module HomePage
 * @description Модуль, содержащий компонент домашней страницы приложения.
 * Отвечает за отображение списка стран с элементами управления и пагинацией.
 */

import { CountriesList } from '../components/layout/index.js';
import { Controls, Pagination } from '../components/functional/index.js';
import { useCountriesContext, usePagination } from '../hooks/index.js';
import { LANG } from '../lang/index.js';

/**
 * @function HomePage
 * @description Компонент домашней страницы, отображающий список стран с возможностью фильтрации и пагинации.
 *
 * @returns {JSX.Element} Возвращает JSX элемент, представляющий домашнюю страницу.
 */
const HomePage = () => {
  /**
   * @description Использование хуков:
   * - useCountriesContext: Получает отфильтрованный список стран из контекста.
   * - usePagination: Управляет пагинацией данных.
   */
  const { filteredItems } = useCountriesContext();
  const {
    currentPage,
    paginatedData,
    handlePaginationClick,
    handlePaginationNumberClick,
  } = usePagination(filteredItems, 20);

  /**
   * @description Вычисляемые значения для управления отображением компонентов.
   */
  const isDataEmpty = !filteredItems.length || !paginatedData || !paginatedData[currentPage];
  const shouldShowPagination = filteredItems.length >= 20;

  /**
   * @description Отображение основного содержимого страницы.
   * @returns {JSX.Element} Возвращает JSX элемент с компонентами страницы.
   */
  return (
    <div className="grid gap-2">
      <Controls onPaginationClick={handlePaginationNumberClick} />
      {isDataEmpty ?
        <p className="font-medium text-lg text-center xl:text-xl">{LANG.noCountries}</p> :
        <CountriesList items={paginatedData[currentPage]} />
      }
      {shouldShowPagination && (
        <Pagination
          currentPage={currentPage}
          totalPages={paginatedData.length}
          onNumberClick={handlePaginationNumberClick}
          onPageChange={handlePaginationClick}
        />
      )}
    </div>
  );
};

export default HomePage;
