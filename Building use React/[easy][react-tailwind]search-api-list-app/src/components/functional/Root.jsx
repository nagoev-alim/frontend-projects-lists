import CATEGORIES from '../../mock/categories.json';
import RESOURCES from '../../mock/resources.json';
import { Button, Input, Loader } from '@ui';
import { useCallback, useState, useMemo } from 'react';
import { showToast } from '@utils';

/**
 * Корневой компонент приложения для поиска API
 * @returns {JSX.Element} Корневой компонент
 */
const Root = () => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [status, setStatus] = useState('idle');
  const [activeCategory, setActiveCategory] = useState(null);

  /**
   * Мемоизированный объект с категоризированными результатами
   */
  const categorizedResults = useMemo(() => {
    return RESOURCES.entries.reduce((acc, entry) => {
      const { Category } = entry;
      if (!acc[Category]) {
        acc[Category] = [];
      }
      acc[Category].push(entry);
      return acc;
    }, {});
  }, []);

  /**
   * Фильтрует результаты по заданному запросу
   * @param {string} searchQuery - Поисковый запрос
   * @returns {Array} Отфильтрованный массив результатов
   */
  const filterResults = useCallback((searchQuery) => {
    return Object.values(categorizedResults).flatMap(category =>
      category.filter(({ API, Description, Category }) =>
        [API, Description, Category].some(field =>
          field.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      ),
    );
  }, [categorizedResults]);

  /**
   * Получает категории API
   * @param {string} searchQuery - Поисковый запрос
   * @param {boolean} isSearchForm - Флаг, указывающий, что запрос из формы поиска
   */
  const fetchCategories = useCallback((searchQuery, isSearchForm = false) => {
    let results;
    try {
      setStatus('loading');

      if (isSearchForm) {
        results = filterResults(searchQuery);
        setActiveCategory(null);
      } else {
        setActiveCategory(searchQuery);
        results = categorizedResults[searchQuery] || [];
      }
      setSearchResults(results);
      setStatus('success');
    } catch (error) {
      console.error('Error getting categories:', error);
      showToast('An error occurred while retrieving categories. Try again.', 'error');
      setStatus('error');
    }
  }, [categorizedResults, filterResults]);

  /**
   * Обработчик для получения конкретной категории
   * @param {string} name - Название категории
   */
  const handleGetCategory = useCallback((name) => {
    fetchCategories(name);
  }, [fetchCategories]);

  /**
   * Обработчик отправки формы поиска
   * @param {Event} e - Событие отправки формы
   */
  const handleFormSubmit = useCallback((e) => {
    e.preventDefault();
    if (!query.trim()) {
      showToast('The request field must not be empty', 'error');
      return;
    }
    try {
      fetchCategories(query, true);
      showToast('Search completed successfully', 'success');
    } catch (error) {
      console.error('Error when searching for categories:', error);
      showToast('An error occurred while searching. Try again.', 'error');
    }
  }, [query, fetchCategories]);

  /**
   * Отрисовывает список API
   * @returns {JSX.Element} Список API
   */
  const renderApiList = () => (
    <ul className="grid gap-3 place-items-start sm:grid-cols-2 md:grid-cols-3">
      {searchResults.map(({ Title, Link, API, Description, Auth, Cors, Category }) => (
        <li className="bg-slate-100 rounded p-2 border-2 h-full w-full" key={Title}>
          <a href={Link} target="_blank" rel="noopener noreferrer">
            {[
              { key: API, label: 'Title' },
              { key: Description, label: 'Description' },
              { key: Auth, label: 'Authentication' },
              { key: Cors, label: 'CORS' },
              { key: Category, label: 'Category' },
            ].map(({ key, label }) => (
              <p key={label}>
                <span className="font-bold">{label}:</span>{' '}
                <span>{key || '-'}</span>
              </p>
            ))}
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="mx-auto max-w-5xl p-3 space-y-4">
      <div className="bg-white border-2 rounded-md p-3 space-y-2">
        <h1 className="text-center text-2xl font-semibold">API Search</h1>
        <form onSubmit={handleFormSubmit}>
          <label>
            <Input
              fullWidth={true}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              name="category"
              placeholder="Enter keywords"
            />
          </label>
        </form>
      </div>
      <div className="space-y-2">
        <div className="border-2 rounded-md bg-white p-3 space-y-4">
          <h3 className="font-medium text-lg">
            Total categories:
            <span className="font-bold">{CATEGORIES.count}</span>
          </h3>
          <ul className="flex flex-wrap justify-center gap-3">
            {CATEGORIES.entries.map(({ name, slug }) => (
              <li key={slug}>
                <Button
                  variant={activeCategory === name ? 'secondary' : 'primary'}
                  onClick={() => handleGetCategory(name)}
                >
                  {name}
                </Button>
              </li>
            ))}
          </ul>
        </div>
        {status === 'loading' && <Loader />}
        {status === 'success' && searchResults.length === 0 && (
          <p className="text-center">No results found.</p>
        )}
        {status === 'success' && searchResults.length > 0 && (
          <div className="border-2 rounded-md bg-white p-3 space-y-4">
            <h3 className="font-medium text-lg">List of APIs</h3>
            {renderApiList()}
          </div>
        )}
        {status === 'error' && (
          <p className="text-center text-red-500">An error occurred while retrieving data.</p>
        )}
      </div>
    </div>
  );
};

export default Root;
