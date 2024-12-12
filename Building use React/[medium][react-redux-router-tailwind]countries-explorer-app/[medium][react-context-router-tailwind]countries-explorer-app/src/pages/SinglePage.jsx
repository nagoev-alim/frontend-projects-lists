/**
 * @module SinglePage
 * @description Модуль, отвечающий за отображение детальной информации о выбранной стране.
 * Он использует контекст приложения для получения данных о стране и её границах.
 */

import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { IoArrowBack } from 'react-icons/io5';
import { countriesActions } from '../context/index.js';
import { useCountriesContext } from '../hooks/index.js';
import { Button } from '../components/ui/index.js';
import { LANG } from '../lang/index.js';

/**
 * @function CountryInfo
 * @description Компонент для отображения отдельного информационного поля о стране.
 * @param {Object} props - Свойства компонента.
 * @param {string} props.label - Метка поля.
 * @param {string|number} props.value - Значение поля.
 * @returns {JSX.Element} Параграф с меткой и значением.
 */
const CountryInfo = ({ label, value }) => (
  <p className="flex flex-wrap gap-1.5">
    <span className="font-bold">{label}:</span>{value}
  </p>
);

/**
 * @function BorderCountries
 * @description Компонент для отображения списка граничащих стран.
 * @param {Object} props - Свойства компонента.
 * @param {string[]} props.borders - Массив кодов граничащих стран.
 * @param {string[]} props.itemBorders - Массив названий граничащих стран.
 * @returns {JSX.Element} Блок с списком граничащих стран или сообщением об их отсутствии.
 */
const BorderCountries = ({ borders, itemBorders }) => (
  <div className="grid gap-2 text-sm mt-4">
    <p className="font-bold">{LANG.bordersTitle} </p>
    {borders && borders.length !== 0 ? (
      <ul className="flex flex-wrap gap-1.5">
        {itemBorders.map(border => (
          <Button key={border}>
            <Link to={`/country/${border}`}>{border}</Link>
          </Button>
        ))}
      </ul>
    ) : LANG.noBorders}
  </div>
);

/**
 * @function SinglePage
 * @description Основной компонент страницы, отображающий детальную информацию о выбранной стране.
 *
 * @returns {JSX.Element|null} Возвращает JSX разметку страницы с информацией о стране или null, если данные отсутствуют.
 *
 * Компонент использует следующие хуки:
 * - useCountriesContext: для получения данных о стране и её границах из контекста приложения.
 * - useParams: для получения параметра 'name' из URL.
 * - useNavigate: для навигации по истории браузера.
 * - useEffect: для загрузки данных о стране при монтировании компонента или изменении параметра 'name'.
 * - useMemo: для оптимизации вычислений данных страны и основных информационных элементов.
 * - useCallback: для оптимизации функции возврата на предыдущую страницу.
 *
 * Отображаемые элементы пользовательского интерфейса:
 * 1. Кнопка "Go Back" для возврата на предыдущую страницу.
 * 2. Изображение флага страны.
 * 3. Название страны.
 * 4. Основная информация о стране (родное название, население, регион, субрегион, столица).
 * 5. Дополнительная информация (домен верхнего уровня, валюта, языки).
 * 6. Список граничащих стран (если есть).
 */
const SinglePage = () => {
  const { item, itemBorders, dispatch } = useCountriesContext();
  const { name } = useParams();
  const { fetchCountryByName } = countriesActions;
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      await fetchCountryByName(dispatch, name);
    })();
  }, [dispatch, fetchCountryByName, name]);

  const handleGoBack = useCallback(() => navigate(-1), [navigate]);

  const countryData = useMemo(() => {
    if (!item) return null;
    const {
      flag,
      nativeName,
      capital,
      population,
      region,
      subregion,
      topLevelDomain,
      currencies = [],
      languages = [],
      borders = [],
    } = item;
    return { flag, nativeName, capital, population, region, subregion, topLevelDomain, currencies, languages, borders };
  }, [item]);

  const mainInfoItems = useMemo(() => [
    { label: 'Native Name', value: countryData?.nativeName },
    { label: 'Population', value: countryData?.population.toLocaleString() },
    { label: 'Region', value: countryData?.region },
    { label: 'Sub Region', value: countryData?.subregion },
    { label: 'Capital', value: countryData?.capital },
  ], [countryData]);

  return countryData ? (
    <div className="grid gap-2">
      <Button className="flex gap-1 items-center max-w-max" onClick={handleGoBack}>
        <IoArrowBack /> {LANG.goBackButtonLabel  || 'Go Back'  }
      </Button>
      <div className="grid gap-4 sm:grid-cols-[40%_1fr] sm:items-center lg:grid-cols-[50%_1fr] lg:gap-10">
        <div className="rounded border-2">
          <img className="border" src={countryData.flag} alt={name} />
        </div>
        <div>
          <h1 className="text-lg font-bold mb-3">{name}</h1>
          <div className="grid sm:grid-cols-2 text-sm">
            <div>
              {mainInfoItems.map(({ label, value }) => (
                <CountryInfo key={label} label={label} value={value} />
              ))}
            </div>
            <div>
              <CountryInfo label="Top Level Domain" value={countryData.topLevelDomain.join(', ')} />
              <CountryInfo label="Currency" value={countryData.currencies[0]?.name || 'Not found'} />
              <CountryInfo label="Languages" value={countryData.languages.map(lang => lang.name).join(', ')} />
            </div>
          </div>
          <BorderCountries borders={countryData.borders} itemBorders={itemBorders} />
        </div>
      </div>
    </div>
  ) : null;
};

CountryInfo.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

BorderCountries.propTypes = {
  borders: PropTypes.arrayOf(PropTypes.string).isRequired,
  itemBorders: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default SinglePage;
