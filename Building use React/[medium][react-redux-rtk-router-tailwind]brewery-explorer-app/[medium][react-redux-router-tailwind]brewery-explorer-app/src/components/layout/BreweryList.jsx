import { Link } from 'react-router-dom';
import { SiHomebrew } from 'react-icons/si';
import { RxExternalLink } from 'react-icons/rx';
import { Loader } from '../ui';
import { LANG } from '../../lang';
import { brewerySelectors } from '../../features/brewery';
import { useSelector } from 'react-redux';

/**
 * Компонент для отображения списка пивоварен.
 * @component
 * @returns {JSX.Element} Отрендеренный список пивоварен или сообщение о состоянии.
 *
 * @description
 * Этот компонент отвечает за отображение списка пивоварен. Он обрабатывает
 * различные состояния (загрузка, ошибка, пустой список) и отображает
 * соответствующую информацию для каждой пивоварни.
 */
const BreweryList = () => {
  // Получение данных из Redux store
  const filteredList = useSelector(brewerySelectors.selectFilteredList);
  const status = useSelector(brewerySelectors.selectBreweryStatus);
  const error = useSelector(brewerySelectors.selectBreweryError);
  const message = useSelector(brewerySelectors.selectBreweryMessage);

  // Отображение индикатора загрузки
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center">
        <Loader isLoading={true} />
      </div>
    );
  }

  // Отображение сообщения об ошибке
  if (error) {
    return <p className="text-center font-medium text-lg text-red-500">{message}</p>;
  }

  // Отображение сообщения о пустом списке
  if (filteredList.length === 0) {
    return <p className="text-center font-medium text-lg">{LANG.breweryList.noResults}</p>;
  }

  // Отображение списка пивоварен
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
            {/* Название пивоварни */}
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
            {/* Город и почтовый индекс */}
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
            {/* Веб-сайт (если есть) */}
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
