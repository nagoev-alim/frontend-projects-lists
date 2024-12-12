import { useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaArrowLeftLong, FaPhone, FaGlobe } from 'react-icons/fa6';
import { SiHomebrew } from 'react-icons/si';
import { TbCategory } from 'react-icons/tb';
import { MdMyLocation } from 'react-icons/md';
import { Button, Loader } from '../components/ui';
import { LANG } from '../lang';
import { breweryActions, brewerySelectors } from '../features/brewery';

/**
 * Компонент страницы с детальной информацией о пивоварне.
 * @component
 * @returns {JSX.Element} Отрендеренный компонент SinglePage
 */
const SinglePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Селекторы для получения данных из состояния Redux
  const breweryDetails = useSelector(brewerySelectors.selectBreweryDetails);
  const loading = useSelector(brewerySelectors.selectBreweryStatus);
  const error = useSelector(brewerySelectors.selectBreweryError);
  const message = useSelector(brewerySelectors.selectBreweryMessage);

  /**
   * Загружает информацию о пивоварне при монтировании компонента или изменении id.
   */
  useEffect(() => {
    dispatch(breweryActions.fetchById(id));
  }, [id, dispatch]);

  /**
   * Обработчик для возврата на предыдущую страницу.
   */
  const handleGoBack = useCallback(() => navigate(-1), [navigate]);

  /**
   * Рендерит детальную информацию о пивоварне.
   * @returns {JSX.Element|null} Отрендеренные детали пивоварни или null, если данные отсутствуют.
   */
  const renderBreweryDetails = () => {
    if (!breweryDetails) return null;

    const {
      name,
      brewery_type,
      street,
      city,
      state_province,
      postal_code,
      country,
      phone,
      website_url,
    } = breweryDetails;

    return (
      <div className="bg-white p-4 rounded-md shadow-md grid gap-2">
        {/* Название пивоварни */}
        <h1 className="text-3xl font-bold inline-flex gap-1">
          <SiHomebrew size={30} /> {name}
        </h1>

        {/* Тип пивоварни */}
        <p className="text-gray-600 flex gap-2 items-center">
          <TbCategory size={20} />
          {brewery_type} {LANG.singlePage.breweryType}
        </p>

        <div className="grid gap-3">
          {/* Адрес пивоварни */}
          <p className="flex items-center gap-2">
            <MdMyLocation size={20} />
            <span>
          {street}, {city}, {state_province} {postal_code}, {country}
        </span>
          </p>

          {/* Телефон пивоварни (если есть) */}
          {phone && (
            <p className="flex items-center gap-2">
              <FaPhone size={20} />
              <a href={`tel:${phone}`} className="text-blue-600 hover:underline">
                {phone}
              </a>
            </p>
          )}

          {/* Веб-сайт пивоварни (если есть) */}
          {website_url && (
            <p className="flex items-center gap-2">
              <FaGlobe size={20} />
              <a href={website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {website_url}
              </a>
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="grid gap-4">
      <Button className="inline-flex gap-1 items-center max-w-max" onClick={handleGoBack}>
        <FaArrowLeftLong />
        {LANG.singlePage.goBack}
      </Button>
      {loading === 'loading' && <Loader isLoading={true} />}
      {error && (<p className="text-center font-medium text-lg text-red-500">{message}</p>)}
      {loading === 'success' && !error && renderBreweryDetails()}
    </div>
  );
};

export default SinglePage;
