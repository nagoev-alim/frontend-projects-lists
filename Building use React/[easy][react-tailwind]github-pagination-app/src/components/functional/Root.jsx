/**
 * @fileoverview Компонент для пагинации пользователей GitHub
 * Этот файл содержит реализацию пользовательского интерфейса для отображения
 * списка пользователей GitHub. Он включает в себя:
 * - Кастомный хук для пагинации
 * - Компонент для отображения карточки пользователя
 * - Компонент для элементов управления пагинацией
 * - Основной компонент, который объединяет все вышеперечисленное
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { showToast } from '@utils';
import { Loader } from '@ui';
import { Pagination, UserCard } from '@functional';
import { usePagination } from '@hooks';

/**
 * Основной компонент пагинации пользователей GitHub.
 * Отображает список пользователей с возможностью постраничной навигации.
 * @returns {JSX.Element} Компонент пагинации пользователей GitHub.
 */
const Root = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const { currentPage, paginatedData, handlePaginationClick, handlePaginationNumberClick } = usePagination(data, 10);

  /**
   * Асинхронная функция для загрузки пользователей GitHub.
   * Использует API GitHub для получения списка пользователей.
   */
  const fetchGitHubUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://api.github.com/users', {
        params: { since: 1, per_page: 40 },
      });
      setData(response.data);
    } catch (error) {
      showToast('Failed to fetch users from GitHub API.', 'error');
      console.error('Error fetching users:', error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGitHubUsers();
  }, [fetchGitHubUsers]);

  return (
    <div className="grid max-w-3xl w-full gap-4 mx-auto p-3">
      <h1 className="text-2xl font-bold text-center">Custom Pagination</h1>
      {loading ? (<Loader/>) : paginatedData.length > 0 ? (
        <>
          <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {paginatedData[currentPage]?.map(({ login, avatar_url, html_url }) => (
              <UserCard key={login} login={login} avatar_url={avatar_url} html_url={html_url} />
            ))}
          </ul>
          <Pagination
            currentPage={currentPage}
            totalPages={paginatedData.length}
            onNumberClick={handlePaginationNumberClick}
            onPageChange={handlePaginationClick}
          />
        </>
      ) : (
        <p className="text-center text-gray-600">No users found.</p>
      )}
    </div>
  );
};

export default Root;
