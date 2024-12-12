import { useCallback, useEffect, useState } from 'react';
import { Button, Input } from '../ui/index.js';
import { useBreweryContext } from '../../hooks/index.js';
import { showToast } from '../../utils/index.js';
import { LANG } from '../../lang/index';

/**
 * @description Компонент Controls предоставляет элементы управления для поиска и фильтрации пивоварен.
 * @returns {JSX.Element} Возвращает JSX элемент с элементами управления.
 */
const Controls = () => {
  // Извлекаем необходимые функции и данные из контекста пивоварни
  const {
    breweryList,
    fetchRandomBreweries,
    filterBreweriesByQuery,
    searchByQuery,
    searchByCountry,
    searchByCountryAndQuery,
  } = useBreweryContext();

  // Состояние формы для хранения значений поиска и фильтрации
  const [formState, setFormState] = useState({
    search: '',
    country: '',
    filter: '',
  });

  // Список доступных стран для поиска
  const countries = [
    'Austria', 'England', 'France', 'Isle of Man', 'Ireland',
    'Poland', 'Portugal', 'Scotland', 'Singapore', 'South Korea', 'United States',
  ];

  /**
   * @description Обработчик изменения значений в полях ввода.
   * @param {Event} e - Событие изменения input.
   */
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormState(prevState => ({ ...prevState, [name]: value }));
  }, []);

  // Эффект для фильтрации пивоварен при изменении списка или строки фильтра
  useEffect(() => {
    filterBreweriesByQuery(breweryList, formState.filter);
  }, [breweryList, filterBreweriesByQuery, formState.filter]);

  /**
   * @description Обработчик отправки формы поиска.
   * @param {Event} e - Событие отправки формы.
   */
  const handleSearchSubmit = useCallback(async (e) => {
    e.preventDefault();
    const { search, country } = formState;
    const trimmedSearch = search.trim();
    const trimmedCountry = country.trim();

    // Проверка наличия поискового запроса или выбранной страны
    if (!trimmedSearch && !trimmedCountry) {
      showToast(LANG.controls.errorMessage, 'error');
      return;
    }

    // Выполнение соответствующего поиска в зависимости от заполненных полей
    if (trimmedSearch && !trimmedCountry) {
      await searchByQuery(trimmedSearch);
    } else if (trimmedCountry && !trimmedSearch) {
      await searchByCountry(trimmedCountry);
    } else {
      searchByCountryAndQuery(trimmedCountry, trimmedSearch);
    }
  }, [formState, searchByQuery, searchByCountry, searchByCountryAndQuery]);

  /**
   * @description Обработчик сброса поиска и получения случайных пивоварен.
   */
  const handleResetSearch = useCallback(async () => {
    setFormState({ search: '', country: '', filter: '' });
    await fetchRandomBreweries();
  }, [fetchRandomBreweries]);

  return (
    <div className="grid gap-2">
      <h2 className="font-bold text-lg lg:text-2xl">{LANG.controls.title}</h2>
      <form className="grid gap-2" onSubmit={handleSearchSubmit}>
        <label>
          <span className="font-medium">{LANG.controls.searchCountryLabel}</span>
          <Input
            type="text"
            name="search"
            className="bg-white"
            placeholder={LANG.controls.searchQueryPlaceholder}
            value={formState.search}
            onChange={handleInputChange}
          />
        </label>

        <label>
          <span className="font-medium">{LANG.controls.searchCountryLabel}</span>
          <select
            name="country"
            className="border rounded p-2 w-full cursor-pointer"
            value={formState.country}
            onChange={handleInputChange}
          >
            <option value="">{LANG.controls.searchCountryPlaceholder}</option>
            {countries.map((country) => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </label>
        <Button type="submit">{LANG.controls.searchButton}</Button>
      </form>
      <label>
        <span className="font-medium">{LANG.controls.filterLabel}</span>
        <Input
          type="text"
          name="filter"
          className="bg-white"
          placeholder={LANG.controls.filterPlaceholder}
          value={formState.filter}
          onChange={handleInputChange}
        />
      </label>
      <Button onClick={handleResetSearch}>{LANG.controls.resetButton}</Button>
    </div>
  );
};

export default Controls;
