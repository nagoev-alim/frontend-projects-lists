/**
 * @module GitHubUserSearcher
 * @description Модуль, предоставляющий основной компонент для поиска пользователей GitHub и отображения их информации.
 */

import { useCallback, useState } from 'react';
import { Button, Input, Loader } from '../ui/index.js';
import { Repositories, UserInfo } from '../layout/index.js';
import { Toaster } from 'react-hot-toast';
import { showToast } from '../../utils/index.js';
import { useAppContext } from '../../hooks/index.js';
import { LANG_EN } from '../../lang/index.js';

/**
 * @function GitHubUserSearcher
 * @description Основной компонент приложения для поиска пользователей GitHub и отображения их данных.
 * 
 * @returns {JSX.Element} JSX элемент, представляющий интерфейс поиска и отображения данных пользователя GitHub.
 */
const GitHubUserSearcher = () => {
  /**
   * @description Использует хук useAppContext для получения данных и функций из контекста приложения.
   * @property {Object} fetchingStatus - Объект, содержащий статус загрузки и ошибки.
   * @property {Object} profileData - Данные профиля пользователя.
   * @property {Function} fetchProfileData - Функция для получения данных профиля.
   */
  const { fetchingStatus, profileData, fetchProfileData } = useAppContext();

  /**
   * @description Локальное состояние для хранения текущего значения поискового запроса.
   */
  const [inputQuery, setInputQuery] = useState('');

  /**
   * @function handleFormSubmit
   * @description Обработчик отправки формы поиска.
   * Проверяет валидность ввода, отправляет запрос на получение данных профиля и очищает поле ввода.
   * Использует useCallback для оптимизации производительности.
   * 
   * @param {Event} e - Объект события отправки формы.
   */
  const handleFormSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!inputQuery || inputQuery.trim().length === 0) {
      showToast(LANG_EN.errors.invalidInput, 'error');
      return;
    }

    await fetchProfileData(inputQuery);
    setInputQuery('');
  }, [inputQuery, fetchProfileData]);

  return (
    <div className="bg-white border-2 shadow rounded max-w-2xl w-full p-3 grid gap-5">
      <h1 className="text-center font-bold text-4xl">{LANG_EN.title}</h1>
      {/* Форма поиска */}
      <form className="grid gap-2" onSubmit={handleFormSubmit}>
        <Input
          type="text"
          name="query"
          placeholder={LANG_EN.form.searchPlaceholder}
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
        />
        <Button type="submit">{LANG_EN.form.submit}</Button>
      </form>
      {/* Индикатор загрузки */}
      {fetchingStatus.loading && <Loader isLoading={fetchingStatus.loading} />}
      {/* Отображение ошибки */}
      {fetchingStatus.error && (
        <p className="text-red-400 font-bold text-center">{fetchingStatus.error}</p>)}
      {/* Отображение данных пользователя */}
      {profileData && (
        <>
          <UserInfo />
          <Repositories />
        </>
      )}
      {/* Компонент для отображения уведомлений */}
      <Toaster />
    </div>
  );
};

export default GitHubUserSearcher;
