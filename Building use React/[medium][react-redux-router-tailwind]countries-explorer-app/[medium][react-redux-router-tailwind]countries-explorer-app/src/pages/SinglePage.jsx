import { useCallback, useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { IoArrowBack } from 'react-icons/io5';
import { Button, Loader } from '../components/ui';
import { LANG } from '../lang';
import { countriesActions, countriesSelectors } from '../features/countries';

/**
 * Компонент для отображения информации о стране.
 * @param {Object} props - Свойства компонента.
 * @param {string} props.label - Метка информации.
 * @param {string|number} props.value - Значение информации.
 * @returns {JSX.Element} Отформатированная информация о стране.
 */
const CountryInfo = ({ label, value }) => (
  <p className="flex flex-wrap gap-1.5">
    <span className="font-bold">{label}:</span>{value}
  </p>
);

/**
 * Компонент для отображения списка граничащих стран.
 * @param {Object} props - Свойства компонента.
 * @param {string[]} props.borders - Массив кодов граничащих стран.
 * @returns {JSX.Element} Список граничащих стран или сообщение об их отсутствии.
 */
const BorderCountries = ({ borders }) => (
  <div className="grid gap-2 text-sm mt-4">
    <p className="font-bold">{LANG.singlePage.bordersTitle} </p>
    {borders && borders.length !== 0 ? (
      <ul className="flex flex-wrap gap-1.5">
        {borders.map(border => (
          <Button key={border}>
            <Link to={`/country/${border}`}>{border}</Link>
          </Button>
        ))}
      </ul>
    ) : LANG.singlePage.noBorders}
  </div>
);

/**
 * Компонент страницы с детальной информацией о стране.
 * @returns {JSX.Element|null} Отрендеренная страница с информацией о стране или null.
 */
const SinglePage = () => {
  const dispatch = useDispatch();
  const selectedCountry = useSelector(countriesSelectors.selectCountryDetails);
  const status = useSelector(countriesSelectors.selectCountriesStatus);
  const error = useSelector(countriesSelectors.selectCountriesError);
  const message = useSelector(countriesSelectors.selectCountriesMessage);

  const { name } = useParams();
  const navigate = useNavigate();

  // Загрузка данных о стране при монтировании компонента или изменении имени страны
  useEffect(() => {
    dispatch(countriesActions.fetchCountryByName(name));
  }, [dispatch, name]);

  // Обработчик для возврата на предыдущую страницу
  const handleGoBack = useCallback(() => navigate(-1), [navigate]);

  // Мемоизация данных о стране для оптимизации производительности
  const countryData = useMemo(() => {
    if (!selectedCountry) return null;
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
    } = selectedCountry;
    return { flag, nativeName, capital, population, region, subregion, topLevelDomain, currencies, languages, borders };
  }, [selectedCountry]);

  // Мемоизация основных информационных элементов страны
  const mainInfoItems = useMemo(() => [
    { label: 'Native Name', value: countryData?.nativeName },
    { label: 'Population', value: countryData?.population.toLocaleString() },
    { label: 'Region', value: countryData?.region },
    { label: 'Sub Region', value: countryData?.subregion },
    { label: 'Capital', value: countryData?.capital },
  ], [countryData]);

  // Отображение индикатора загрузки
  if (status === 'loading') return <Loader isLoading={true} />;

  // Отображение ошибки, если она есть
  if (error) return <p className="text-red-400 font-bold text-center">{message || LANG.singlePage.error}</p>;

  // Рендеринг информации о стране
  return countryData ? (
    <div className="grid gap-2">
      <Button className="flex gap-1 items-center max-w-max" onClick={handleGoBack}>
        <IoArrowBack /> {LANG.singlePage.goBackButtonLabel || 'Go Back'}
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
          <BorderCountries borders={countryData.borders} />
        </div>
      </div>
    </div>
  ) : null;
};

export default SinglePage;
