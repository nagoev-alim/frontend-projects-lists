import { useSelector } from 'react-redux';
import { Controls, Pagination } from '../components/functional';
import { CountriesList } from '../components/layout';
import { usePagination } from '../hooks';
import { countriesSelectors } from '../features/countries';
import { LANG } from '../lang';

/**
 * Компонент домашней страницы.
 * Отображает список стран с пагинацией и элементами управления.
 *
 * @returns {JSX.Element} Отрендеренный компонент домашней страницы.
 */
const HomePage = () => {
  // Получаем отфильтрованный список стран из Redux store
  const countriesFiltered = useSelector(countriesSelectors.selectCountriesFiltered);

  // Используем хук пагинации для управления страницами
  const {
    currentPage,
    paginatedData,
    handlePaginationClick,
    handlePaginationNumberClick,
  } = usePagination(countriesFiltered, 20);

  // Проверяем, пуст ли список стран
  const isDataEmpty = !countriesFiltered.length || !paginatedData || !paginatedData[currentPage];
  // Определяем, нужно ли показывать пагинацию
  const shouldShowPagination = countriesFiltered.length >= 20;

  return (
    <div className="grid gap-2">
      {/* Компонент с элементами управления */}
      <Controls onPaginationClick={handlePaginationNumberClick} />
      {isDataEmpty ? (
        // Если данных нет, показываем сообщение
        <p className="font-medium text-lg text-center xl:text-xl">{LANG.homePage.noCountries}</p>
      ) : (
        // Иначе отображаем список стран
        <CountriesList items={paginatedData[currentPage]} />
      )}
      {/* Показываем пагинацию, если необходимо */}
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
