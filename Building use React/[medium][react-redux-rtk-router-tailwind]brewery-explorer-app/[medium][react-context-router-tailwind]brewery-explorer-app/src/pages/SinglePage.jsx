/**
 * @module SinglePage
 * @description Модуль, отвечающий за отображение подробной информации о выбранной пивоварне.
 * Он использует контекст для получения данных о пивоварне и отображает их в структурированном виде.
 */

import { useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeftLong, FaPhone, FaGlobe } from 'react-icons/fa6';
import { SiHomebrew } from 'react-icons/si';
import { TbCategory } from 'react-icons/tb';
import { MdMyLocation } from 'react-icons/md';
import { Button, Loader } from '../components/ui/index';
import { useBreweryContext } from '../hooks/index';
import { LANG } from '../lang/index';

/**
 * @function SinglePage
 * @description Компонент для отображения подробной информации о выбранной пивоварне.
 * @returns {JSX.Element} Возвращает JSX разметку страницы с детальной информацией о пивоварне
 */
const SinglePage = () => {
  // Извлечение функций и состояний из контекста пивоварни
  const { fetchById, selectedBrewery, isLoading, isError } = useBreweryContext();
  // Получение id пивоварни из параметров URL
  const { id } = useParams();
  // Инициализация функции навигации для управления маршрутизацией
  const navigate = useNavigate();

  /**
   * @function
   * @name fetchBreweryEffect
   * @description Этот эффект вызывает функцию fetchById для получения данных о пивоварне по её id.
   * Эффект запускается при первом рендере компонента и при изменении id или fetchById.
   *
   *  @param {Array} deps - Массив зависимостей, при изменении которых эффект будет перезапущен.
   *   - {string} id - Идентификатор пивоварни, полученный из параметров URL.
   *   - {Function} fetchById - Функция для получения данных о пивоварне по id.
   */
  useEffect(() => {
    fetchById(id);
  }, [id, fetchById]);

  /**
   * @function
   * @name handleGoBack
   * @description Эта функция использует хук useCallback для создания мемоизированной версии
   * функции, которая осуществляет навигацию на одну страницу назад в истории браузера.
   * Мемоизация предотвращает ненужные ререндеры компонента.
   *
   * @returns {Function} Возвращает функцию, которая при вызове осуществляет навигацию назад.
   */
  const handleGoBack = useCallback(() => navigate(-1), [navigate]);

  /**
   * @function renderBreweryDetails
   * @description Функция для отрисовки детальной информации о выбранной пивоварне.
   * Эта функция извлекает данные из объекта selectedBrewery и возвращает JSX разметку
   * с отформатированной информацией о пивоварне.
   *
   * @returns {JSX.Element|null} Возвращает JSX элемент с информацией о пивоварне или null,
   * если информация о пивоварне отсутствует.
   */
  const renderBreweryDetails = () => {
    if (!selectedBrewery) return null;

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
    } = selectedBrewery;

    return (
      <div className="bg-white p-4 rounded-md shadow-md grid gap-2">
        <h1 className="text-3xl font-bold inline-flex gap-1">
          <SiHomebrew size={30} /> {name}
        </h1>

        <p className="text-gray-600 flex gap-2 items-center">
          <TbCategory size={20} />
          {brewery_type} {LANG.singlePage.breweryType}
        </p>

        <div className="grid gap-3">
          <p className="flex items-center gap-2">
            <MdMyLocation size={20} />
            <span>
              {street}, {city}, {state_province} {postal_code}, {country}
            </span>
          </p>

          {phone && (
            <p className="flex items-center gap-2">
              <FaPhone size={20} />
              <a href={`tel:${phone}`} className="text-blue-600 hover:underline">
                {phone}
              </a>
            </p>
          )}

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

      {isLoading && <Loader isLoading={isLoading} />}

      {isError && (
        <p className="text-center font-medium text-lg text-red-500">{LANG.singlePage.errorMessage}</p>
      )}

      {selectedBrewery && !isLoading && !isError && renderBreweryDetails()}
    </div>
  );
};

export default SinglePage;
