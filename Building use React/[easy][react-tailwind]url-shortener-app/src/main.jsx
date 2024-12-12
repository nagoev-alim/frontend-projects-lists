import './index.css';
import React, { StrictMode, useCallback, useState, useMemo } from 'react';
import { Toaster } from 'react-hot-toast';
import { createRoot } from 'react-dom/client';
import { persistor, shortenActions, shortenSelectors, store } from './redux';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { showToast } from './utils';
import { Head } from './components/layout';
import { Button, Loader } from './components/ui';
import { LANG } from './lang';

/**
 * Регулярное выражение для проверки валидности URL.
 * @type {RegExp}
 */
const URL_PATTERN = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;

/**
 * Основной компонент приложения для сокращения URL.
 * @returns {JSX.Element} Возвращает JSX элемент с формой для сокращения URL и отображением результата.
 */
const Main = () => {
  const dispatch = useDispatch();
  const shortenUrl = useSelector(shortenSelectors.selectShorten);
  const { status, error, message } = useSelector(shortenSelectors.selectRequest);
  const [query, setQuery] = useState('');

  /**
   * Проверяет валидность введенного URL.
   * @type {boolean}
   */
  const isValidUrl = useMemo(() => URL_PATTERN.test(query), [query]);

  /**
   * Обработчик отправки формы.
   * @param {React.FormEvent<HTMLFormElement>} e - Событие отправки формы.
   */
  const handleFormSubmit = useCallback((e) => {
    e.preventDefault();
    if (!isValidUrl) {
      showToast(LANG.invalidUrlError, 'error');
      return;
    }
    dispatch(shortenActions.fetchShorten(query));
    setQuery('');
  }, [isValidUrl, query, dispatch]);

  /**
   * Обработчик изменения значения в поле ввода.
   * @param {React.ChangeEvent<HTMLInputElement>} e - Событие изменения ввода.
   */
  const handleInputChange = useCallback((e) => setQuery(e.target.value), []);

  /**
   * Обработчик нажатия на кнопку копирования.
   * Копирует сокращенный URL в буфер обмена.
   */
  const handleCopyButton = useCallback(async () => {
    if (!shortenUrl || shortenUrl.length === 0) return;
    try {
      await navigator.clipboard.writeText(shortenUrl);
      showToast(LANG.copySuccess, 'success');
    } catch (error) {
      showToast(LANG.copyError, 'error');
    }
  }, [shortenUrl]);

  return (
    <div className="max-w-md w-full overflow-hidden rounded border bg-white p-3 shadow transition-all grid gap-4">
      <h1 className="text-center text-2xl font-bold md:text-4xl">{LANG.appTitle}</h1>
      <form className="grid gap-2" onSubmit={handleFormSubmit}>
        <input
          className="w-full rounded border bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none"
          type="text"
          name="url"
          value={query}
          onChange={handleInputChange}
          placeholder={LANG.invalidUrlError}
        />
        <button className="border px-3 py-2 hover:bg-slate-50" type="submit">{LANG.submitButton}</button>
      </form>
      {status === 'loading' && (<Loader isLoading={true} />)}
      {error && (
        <div className="text-red-500 text-center text-sm">{message}</div>
      )}
      {shortenUrl && status === 'success' && (
        <div className="grid grid-cols-[1fr_100px] gap-1.5">
          <input
            className="w-full rounded border bg-slate-50 px-3 py-2 text-gray-600 focus:border-blue-400 focus:outline-none"
            disabled
            type="text"
            value={shortenUrl || ''}
          />
          <Button onClick={handleCopyButton}>{LANG.copyButton}</Button>
        </div>)}
    </div>
  );
};

/**
 * Корневой компонент приложения.
 * Оборачивает основное приложение в необходимые провайдеры.
 * @returns {JSX.Element} Возвращает JSX элемент с настроенными провайдерами и основным компонентом.
 */
const App = () => (
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Head
          description={LANG.metaDescription}
          title={LANG.metaTitle}
          keywords={LANG.metaKeywords}
        />
        <div className="bg-neutral-100 min-h-screen w-full grid gap-3 place-items-center">
          <Main />
          <Toaster />
        </div>
      </PersistGate>
    </Provider>
  </StrictMode>
);

// Рендеринг приложения в DOM
createRoot(document.getElementById('root')).render(<App />);
