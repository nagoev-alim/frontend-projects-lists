/**
 * @module WikiSearcher
 * @description Модуль для поиска информации в Wikipedia с использованием API Wikipedia.
 */
import axios from 'axios';
import DOMPurify from 'dompurify';
import { SiWikipedia } from 'react-icons/si';
import { useCallback, useState } from 'react';
import { Button, Input, Loader } from '@ui';
import { showToast } from '@utils';


// Создание экземпляра axios для запросов к API Wikipedia
const API = axios.create({
  baseURL: 'https://en.wikipedia.org/w/api.php',
  params: {
    action: 'query',
    list: 'search',
    srlimit: 20,
    format: 'json',
    origin: '*',
  },
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Корневой компонент приложения Wiki Searcher
 * @function Root
 * @description Основной компонент приложения, который управляет состоянием поиска и отображает результаты
 * @returns {JSX.Element} Возвращает JSX разметку корневого компонента
 */
const Root = () => {
  // Текущий поисковый запрос
  const [query, setQuery] = useState('');
  // Массив результатов поиска
  const [searchResults, setSearchResults] = useState([]);
  // Текущий статус запроса ('idle', 'loading', 'success', 'error')
  const [status, setStatus] = useState('idle');

  /**
   * Обработчик отправки формы поиска
   * @function handleFormSubmit
   * @param {Event} e - Объект события формы
   */
  const handleFormSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      showToast('Please enter your search term', 'error');
      return;
    }

    try {
      setStatus('loading');
      const { data: { query: { search } } } = await API.get('', { params: { srsearch: query } });
      setSearchResults(search);
      setStatus('success');
      setQuery('');
    } catch (error) {
      console.error('Error while searching:', error);
      showToast('An error occurred while searching', 'error');
      setStatus('error');
    }
  }, [query]);

  /**
   * Функция для очистки результатов поиска
   * @function handleClearResult
   * @description Сбрасывает результаты поиска и устанавливает статус в исходное состояние
   */
  const handleClearResult = useCallback(() => {
    setSearchResults([]);
    setStatus('idle');
  }, []);

  return (
    <div className="mx-auto grid w-full max-w-4xl items-start gap-4">
      <SearchForm query={query} setQuery={setQuery} onSubmit={handleFormSubmit} searchResults={searchResults}
                  onClearResult={handleClearResult} />
      {status === 'loading' && <Loader />}
      {status === 'error' && (
        <div className="text-center text-red-500">An error occurred while searching</div>
      )}
      {status === 'success' && <SearchResults results={searchResults} />}
    </div>
  );
};

/**
 * Компонент формы поиска
 * @function SearchForm
 * @description Отображает форму для ввода поискового запроса и кнопки управления
 * @param {Object} props - Свойства компонента
 * @param {string} props.query - Текущий поисковый запрос
 * @param {function} props.setQuery - Функция для обновления поискового запроса
 * @param {function} props.onSubmit - Функция обработки отправки формы
 * @param {Array} props.searchResults - Массив результатов поиска
 * @param {function} props.onClearResult - Функция для очистки результатов поиска
 * @returns {JSX.Element} JSX разметка формы поиска
 */
const SearchForm = ({ query, setQuery, onSubmit, searchResults, onClearResult }) => (
  <div className="mx-auto grid w-full max-w-xl place-items-center gap-3 rounded border bg-white p-3">
    <SiWikipedia size={40} />
    <h1 className="text-center text-2xl font-semibold">Wiki Searcher</h1>
    <form className="grid w-full gap-2" onSubmit={onSubmit}>
      <label>
        <Input
          fullWidth={true}
          name="query"
          placeholder="Enter something"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      <Button type="submit">Search</Button>
      {searchResults.length > 0 && (
        <Button variant="danger" type="button" onClick={onClearResult}>
          Clear
        </Button>
      )}
    </form>
  </div>
);

/**
 * Компонент для отображения результатов поиска
 * @function SearchResults
 * @param {Object} props - Свойства компонента
 * @param {Array} props.results - Массив результатов поиска
 * @returns {JSX.Element|null} Возвращает JSX разметку списка результатов или null, если результатов нет
 */
const SearchResults = ({ results }) => (
  results.length > 0 && (
    <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
      {results.map(({ title, pageid, snippet }) => (
        <SearchResultItem key={pageid} title={title} pageid={pageid} snippet={snippet} />
      ))}
    </ul>
  )
);

/**
 * Компонент отдельного элемента результата поиска
 * @function SearchResultItem
 * @param {Object} props - Свойства компонента
 * @param {string} props.title - Заголовок статьи
 * @param {number} props.pageid - ID страницы в Wikipedia
 * @param {string} props.snippet - Фрагмент текста статьи
 * @returns {JSX.Element} Возвращает JSX разметку элемента результата поиска
 */
const SearchResultItem = ({ title, pageid, snippet }) => (
  <li className="rounded border bg-white p-3">
    <a className="grid gap-2" href={`https://en.wikipedia.org/?curid=${pageid}`} target="_blank"
       rel="noopener noreferrer">
      <h4 className="text-lg font-bold uppercase">{title}</h4>
      <p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(snippet) }} />
    </a>
  </li>
);

export default Root;
