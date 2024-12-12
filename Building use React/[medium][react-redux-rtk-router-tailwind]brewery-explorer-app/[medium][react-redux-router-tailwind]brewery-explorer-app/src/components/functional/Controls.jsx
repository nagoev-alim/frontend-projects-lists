import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Input } from '../ui';
import { showToast } from '../../utils';
import { LANG } from '../../lang';
import { breweryActions, brewerySelectors } from '../../features/brewery';
import { filterBreweriesByQuery } from '../../features/brewery/brewerySlice';

/**
 * Компонент управления поиском и фильтрацией пивоварен.
 * @component
 * @returns {JSX.Element} Элемент React с элементами управления.
 */
const Controls = () => {
  const dispatch = useDispatch();
  const items = useSelector(brewerySelectors.selectBreweryList);

  /**
   * Состояние формы поиска и фильтрации.
   * @type {{search: string, country: string, filter: string}}
   */
  const [formState, setFormState] = useState({
    search: '',
    country: '',
    filter: '',
  });

  /**
   * Список доступных стран для поиска.
   * @type {string[]}
   */
  const countries = [
    'Austria', 'England', 'France', 'Isle of Man', 'Ireland',
    'Poland', 'Portugal', 'Scotland', 'Singapore', 'South Korea', 'United States',
  ];

  /**
   * Обработчик изменения значений в полях ввода.
   * @type {(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void}
   */
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormState(prevState => ({ ...prevState, [name]: value }));
  }, []);

  /**
   * Эффект для фильтрации пивоварен при изменении списка или строки фильтра.
   */
  useEffect(() => {
    dispatch(filterBreweriesByQuery({ items, query: formState.filter }));
  }, [items, dispatch, formState.filter]);

  /**
   * Обработчик отправки формы поиска.
   * @function
   * @param {React.FormEvent} e - Событие отправки формы.
   * @returns {Promise<void>}
   *
   * @description
   * Эта функция выполняет следующие действия:
   * 1. Предотвращает стандартное поведение отправки формы.
   * 2. Извлекает и обрабатывает данные из состояния формы.
   * 3. Проверяет наличие введенных данных.
   * 4. В зависимости от введенных данных, отправляет соответствующий запрос на поиск.
   */
  const handleSearchSubmit = useCallback(async (e) => {
    e.preventDefault();
    const { search, country } = formState;
    const trimmedSearch = search.trim();
    const trimmedCountry = country.trim();

    // Проверка на пустой ввод
    if (!trimmedSearch && !trimmedCountry) {
      showToast(LANG.controls.errorMessage, 'error');
      return;
    }

    // Выбор действия в зависимости от введенных данных
    if (trimmedSearch && !trimmedCountry) {
      // Поиск только по запросу
      await dispatch(breweryActions.searchByQuery(trimmedSearch));
    } else if (trimmedCountry && !trimmedSearch) {
      // Поиск только по стране
      await dispatch(breweryActions.searchByCountry(trimmedCountry));
    } else {
      // Поиск по стране и запросу
      dispatch(breweryActions.searchByCountryAndQuery(trimmedCountry, trimmedSearch));
    }
  }, [formState]);

  /**
   * Обработчик сброса поиска и загрузки случайных пивоварен.
   * @type {() => Promise<void>}
   */
  const handleResetSearch = useCallback(async () => {
    setFormState({ search: '', country: '', filter: '' });
    await dispatch(breweryActions.fetchRandom());
  }, []);

  return (
    <div className="grid gap-2">
      <h2 className="font-bold text-lg lg:text-2xl">{LANG.controls.title}</h2>
      <form className="grid gap-2" onSubmit={handleSearchSubmit}>
        {/* Поле ввода для поиска */}
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
        {/* Выпадающий список для выбора страны */}
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
      {/* Поле ввода для фильтрации */}
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
