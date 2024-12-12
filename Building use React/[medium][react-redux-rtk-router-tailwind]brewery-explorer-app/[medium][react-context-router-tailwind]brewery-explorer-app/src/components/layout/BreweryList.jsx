import { Link } from 'react-router-dom';
import { SiHomebrew } from 'react-icons/si';
import { RxExternalLink } from 'react-icons/rx';
import { useBreweryContext } from '../../hooks/index';
import { Loader } from '../ui/index';
import { LANG } from '../../lang/index';

/**
 * Компонент для отображения списка пивоварен.
 *
 * @component
 * @returns {JSX.Element} Отрендеренный список пивоварен или сообщение о состоянии.
 *
 * @description
 * Этот компонент отображает список пивоварен, полученный из контекста.
 * Он обрабатывает различные состояния: загрузка, ошибка, пустой список.
 * Для каждой пивоварни отображается подробная информация в отдельной карточке.
 */
const BreweryList = () => {
  // Получаем необходимые данные из контекста
  const { filteredList, isLoading, isError } = useBreweryContext();

  // Отображаем индикатор загрузки, если данные загружаются
  if (isLoading) {
    return (
      <div className="flex justify-center items-center">
        <Loader isLoading={isLoading} />
      </div>
    );
  }

  // Отображаем сообщение об ошибке, если произошла ошибка при загрузке
  if (isError) {
    return <p className="text-center font-medium text-lg text-red-500">{LANG.breweryList.error}</p>;
  }

  // Отображаем сообщение, если список пивоварен пуст
  if (filteredList.length === 0) {
    return <p className="text-center font-medium text-lg">{LANG.breweryList.noResults}</p>;
  }

  // Отображаем список пивоварен
  return (
    <div className="grid gap-2">
      <h2 className="font-bold text-lg lg:text-2xl">{LANG.breweryList.title}</h2>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 items-start">
        {filteredList.map(({
                             id,
                             name,
                             brewery_type,
                             address_1,
                             address_2,
                             address_3,
                             city,
                             state_province,
                             postal_code,
                             country,
                             phone,
                             website_url,
                           }) => (
          <div key={id}
               className="grid gap-1.5 justify-start bg-white shadow-md rounded-lg p-4 hover:shadow-xl transition-shadow">
            {/* Заголовок с названием пивоварни и ссылкой на детальную страницу */}
            <h3 className="text-xl font-bold inline-flex gap-1">
              <Link className="text-xl font-bold inline-flex gap-1" to={`brewery/${id}`}>
                <SiHomebrew size={20} />{name}
              </Link>
            </h3>
            {/* Тип пивоварни */}
            <p className="text-sm text-gray-600">
              <span className="font-bold">{LANG.breweryList.type}</span>{' '}{brewery_type}
            </p>
            {/* Адрес пивоварни */}
            <p>
              <span className="font-bold">{LANG.breweryList.address}</span>{' '}
              {address_1}
              {address_2 && <>, {address_2}</>}
              {address_3 && <>, {address_3}</>}
            </p>
            {/* Город, штат/провинция и почтовый индекс */}
            <p>
              <span className="font-bold">{LANG.breweryList.city}</span>{' '}
              {city}, {state_province} {postal_code}
            </p>
            {/* Страна */}
            <p>
              <span className="font-bold">{LANG.breweryList.country}</span>{' '}
              {country}
            </p>
            {/* Телефон (если есть) */}
            {phone && <p>
              <span className="font-bold">{LANG.breweryList.phone}</span>{' '}
              {phone}
            </p>}
            {/* Ссылка на веб-сайт (если есть) */}
            {website_url && (
              <p className=" inline-flex gap-1">
                <span className="font-bold">{LANG.breweryList.website}</span>{' '}
                <a href={website_url} target="_blank" rel="noopener noreferrer"
                   className="text-blue-500 hover:underline inline-flex gap-1 items-center">
                  <RxExternalLink /> <span>{LANG.breweryList.websiteLink}</span>
                </a>
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BreweryList;
