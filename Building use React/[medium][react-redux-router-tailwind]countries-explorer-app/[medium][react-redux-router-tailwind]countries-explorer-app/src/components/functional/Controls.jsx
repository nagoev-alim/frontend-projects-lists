import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Input } from '../ui';
import { LANG } from '../../lang';
import { countriesSelectors } from '../../features/countries';
import { filterCountriesByQuery } from '../../features/countries/countriesSlice.js';

/**
 * Компонент Controls для управления фильтрацией и поиском стран.
 * @param {Object} props - Свойства компонента.
 * @param {Function} props.onPaginationClick - Функция обработки клика по пагинации.
 * @returns {JSX.Element} Возвращает JSX элемент с элементами управления.
 */
const Controls = ({ onPaginationClick }) => {
  const dispatch = useDispatch();
  const countries = useSelector(countriesSelectors.selectCountries);

  // Состояние формы для поиска и выбора региона
  const [formState, setFormState] = useState({
    search: '',
    region: '',
  });

  // Список доступных регионов
  const regions = ['Africa', 'America', 'Asia', 'Europe', 'Oceania'];

  /**
   * Обработчик изменения input полей.
   * Обновляет состояние формы при изменении значений полей.
   * @param {Event} e - Событие изменения input.
   */
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormState(prevState => ({ ...prevState, [name]: value }));
  }, []);

  /**
   * Эффект для фильтрации стран при изменении состояния формы или списка стран.
   * Также сбрасывает пагинацию на первую страницу.
   */
  useEffect(() => {
    dispatch(filterCountriesByQuery({ countries, formState }));
    onPaginationClick(0);
  }, [countries, dispatch, formState]);

  return (
    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-[250px_200px] md:justify-between">
      {/* Поле ввода для поиска */}
      <label>
        <Input
          type="text"
          name="search"
          className="border rounded p-2 w-full cursor-pointer dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
          placeholder={LANG.controls.searchQueryPlaceholder}
          value={formState.search}
          onChange={handleInputChange}
        />
      </label>
      {/* Выпадающий список для выбора региона */}
      <label>
        <select
          name="region"
          className="border rounded p-2 w-full cursor-pointer dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
          value={formState.region}
          onChange={handleInputChange}
        >
          <option value="">{LANG.controls.searchCountryPlaceholder}</option>
          {regions.map((region) => (
            <option key={region} value={region}>{region}</option>
          ))}
        </select>
      </label>
    </div>
  );
};

export default Controls;
