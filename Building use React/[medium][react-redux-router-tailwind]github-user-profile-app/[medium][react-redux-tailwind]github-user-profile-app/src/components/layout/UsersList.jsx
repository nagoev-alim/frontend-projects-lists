import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { githubSelectors } from '../../features/github';
import { Loader } from '../ui';
import { LANG } from '../../lang';

/**
 * @description Компонент для отображения списка пользователей GitHub.
 * Использует Redux для получения данных о пользователях и состоянии загрузки.
 * @returns {JSX.Element} Возвращает JSX элемент, представляющий список пользователей или сообщения о состоянии.
 */
const UsersList = () => {
  // Получение данных из Redux store с использованием деструктуризации
  const { users, status, error, message } = useSelector(state => ({
    users: githubSelectors.selectGithubUsers(state),
    status: githubSelectors.selectGithubStatus(state),
    error: githubSelectors.selectGithubError(state),
    message: githubSelectors.selectGithubMessage(state),
  }));

  // Отображение индикатора загрузки
  if (status === 'loading') {
    return <Loader isLoading={true} />;
  }

  // Отображение сообщения об ошибке
  if (error) {
    return <p className="text-red-400 font-bold text-center">{message || LANG.usersList.error}</p>;
  }

  // Отображение сообщения, если пользователи не найдены
  if (status === 'success' && users.length === 0) {
    return <p className="text-center text-gray-500">{LANG.usersList.noUsers}</p>;
  }

  // Отображение списка пользователей
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {users.map(({ id, avatar_url, login }) => (
        <li
          key={id}
          className="bg-white border-2 rounded p-2 grid gap-2 dark:bg-neutral-700 dark:text-white dark:border-neutral-800"
        >
          <img className="rounded" src={avatar_url} alt={login} />
          <h3 className="font-bold uppercase text-center">{login}</h3>
          <Link
            to={`/users/${login}`}
            className="font-medium text-center px-3 py-2 border-2 rounded bg-white hover:bg-neutral-300 transition-colors dark:bg-neutral-700 dark:text-white dark:hover:bg-neutral-800 dark:border-neutral-800"
          >
            {LANG.usersList.viewDetail}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default UsersList;
