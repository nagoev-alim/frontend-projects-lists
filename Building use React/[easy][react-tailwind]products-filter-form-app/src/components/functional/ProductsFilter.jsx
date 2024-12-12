import { capitalizeFirstLetter } from '@utils';
import { Button } from '@ui';

/**
 * Компонент для отображения фильтра продуктов по компаниям.
 * @param {Object} props - Свойства компонента.
 * @param {string[]} props.companies - Массив названий компаний для фильтрации.
 * @param {function} props.setActiveCompany - Функция для установки активной компании.
 * @param {string} props.activeCompany - Текущая активная компания.
 * @returns {JSX.Element} Возвращает список кнопок для фильтрации по компаниям.
 */
const ProductsFilter = ({ companies, setActiveCompany, activeCompany }) => (
  <ul className="flex flex-wrap gap-2 xl:grid">
    {companies.map((company) => (
      <li key={company}>
        <Button
          fullWidth={true}
          variant={company.toLowerCase() === activeCompany.toLowerCase() ? 'primary' : 'secondary'}
          onClick={() => setActiveCompany(company)}
        >
          {capitalizeFirstLetter(company)}
        </Button>
      </li>
    ))}
  </ul>
);

export default ProductsFilter;
