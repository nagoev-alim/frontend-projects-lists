/**
 * @module CountriesList
 * @description Модуль, содержащий компонент для отображения списка стран.
 */

import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * @function CountriesList
 * @description Компонент для отображения списка стран в виде сетки карточек.
 * 
 * @param {Object} props - Свойства компонента.
 * @param {Array} props.items - Массив объектов с данными о странах.
 * 
 * @returns {JSX.Element} Возвращает JSX элемент, представляющий список стран.
 */
const CountriesList = ({ items }) => {
  /**
   * @description Хук для программной навигации.
   * Используется для перехода на страницу отдельной страны при клике на карточку.
   */
  const navigate = useNavigate();

  return (
    <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map(({ name, flags: { svg: image } }) => (
        <li className="grid gap-2 border rounded shadow bg-white cursor-pointer hover:shadow-lg transition-shadow dark:bg-neutral-600 dark:border-neutral-800"
            key={name} onClick={() => navigate(`/country/${name}`)}>
          <img className="w-full h-[200px] object-cover" src={image} alt={name} />
          <h3 className="font-medium text-xl p-2">{name}</h3>
        </li>
      ))}
    </ul>
  );
};

/**
 * @description Проверка типов свойств компонента.
 */
CountriesList.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      flags: PropTypes.shape({
        svg: PropTypes.string.isRequired
      }).isRequired
    })
  )
};

export default CountriesList;
