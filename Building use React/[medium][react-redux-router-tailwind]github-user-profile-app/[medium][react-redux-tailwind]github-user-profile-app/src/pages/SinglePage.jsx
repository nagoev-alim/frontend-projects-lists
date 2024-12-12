import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaUserFriends } from 'react-icons/fa';
import { Button, Loader } from '../components/ui';
import { FaCodepen, FaEye, FaInfo, FaLink, FaStar, FaStore, FaUsers, FaUtensils } from 'react-icons/fa6';
import { LANG } from '../lang';
import { githubActions, githubSelectors } from '../features/github';

/**
 * @function UserProfile
 * @description Компонент для отображения профиля пользователя GitHub
 * @param {Object} props - Свойства компонента
 * @param {Object} props.user - Объект с данными пользователя
 * @returns {JSX.Element} JSX элемент с информацией о профиле пользователя
 */
const UserProfile = ({ user }) => (
  <div className='bg-white p-2 border-2 rounded dark:bg-neutral-700 dark:text-white dark:border-neutral-800'>
    <figure>
      <img className='max-w-[200px] rounded-full border-2 mx-auto' src={user.avatar_url} alt={user.login} />
    </figure>
    <div className='grid place-items-center gap-2 text-center'>
      <p className='text-center'>{user.login}</p>
      <span className='btn'>{user.type}</span>
      {user.hireable && <span className='btn'>Hireable</span>}
      <p>{user.bio}</p>
      <div className='grid gap-1.5'>
        <a href={user.html_url} target='_blank' rel='noreferrer' className='btn max-w-max mx-auto'>
          Visit Github Profile
        </a>
        {user.location && <p className='flex gap-1.5'><span className='font-bold'>Location:</span>{user.location}</p>}
        {user.blog && (
          <p className='flex gap-1.5'>
            <span className='font-bold'>Website:</span>
            <a href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`} target='_blank' rel='noreferrer'>
              {user.blog.startsWith('http') ? user.blog : `https://${user.blog}`}
            </a>
          </p>
        )}
        {user.twitter_username && (
          <p className='flex gap-1.5'>
            <span className='font-bold'>Twitter:</span>
            <a href={`https://twitter.com/${user.twitter_username}`} target='_blank' rel='noreferrer'>
              {user.twitter_username}
            </a>
          </p>
        )}
      </div>
    </div>
  </div>
);

/**
 * @function UserStats
 * @description Компонент для отображения статистики пользователя GitHub
 * @param {Object} props - Свойства компонента
 * @param {Object} props.user - Объект с данными пользователя
 * @returns {JSX.Element} JSX элемент со статистикой пользователя
 */
const UserStats = ({ user }) => {
  // Мемоизация массива статистики для оптимизации производительности
  const stats = useMemo(() => [
    { label: 'Followers', value: user.followers, src: <FaUsers size={20} /> },
    { label: 'Following', value: user.following, src: <FaUserFriends size={20} /> },
    { label: 'Public Repos', value: user.public_repos, src: <FaCodepen size={20} /> },
    { label: 'Public Gists', value: user.public_gists, src: <FaStore size={20} /> },
  ], [user]);

  return (
    <ul className='grid gap-2 sm:grid-cols-2 md:grid-cols-4 place-content-center'>
      {stats.map((stat, idx) => (
        <li key={idx} className='flex items-center gap-1.5 btn'>
          {stat.src}<span>{stat.label}:</span><span>{stat.value}</span>
        </li>
      ))}
    </ul>
  );
};

/**
 * @function RepositoryList
 * @description Компонент для отображения списка репозиториев пользователя
 * @param {Object} props - Свойства компонента
 * @param {Array} props.repos - Массив объектов с данными о репозиториях
 * @returns {JSX.Element} JSX элемент со списком репозиториев
 */
const RepositoryList = ({ repos }) => (
  <ul className='grid gap-2'>
    {repos.map(({ id, name, description, html_url, forks, open_issues, watchers_count, stargazers_count }) => (
      <li className='bg-white border-2 rounded p-2 grid gap-2 dark:bg-neutral-700 dark:text-white dark:border-neutral-800' key={id}>
        <a className='flex items-center gap-1.5 font-bold text-pink-400' href={html_url}><FaLink /> {name}</a>
        <p>{description}</p>
        <ul className='flex flex-wrap items-center gap-2'>
          {[
            { src: <FaEye />, value: watchers_count },
            { src: <FaStar />, value: stargazers_count },
            { src: <FaInfo />, value: open_issues },
            { src: <FaUtensils />, value: forks }
          ].map((item, idx) => (
            <li className='flex items-center gap-1.5' key={idx}>{item.src} {item.value}</li>
          ))}
        </ul>
      </li>
    ))}
  </ul>
);

/**
 * @function SinglePage
 * @description Основной компонент страницы с информацией о пользователе GitHub
 * @returns {JSX.Element} JSX элемент страницы с информацией о пользователе
 */
const SinglePage = () => {
  const dispatch = useDispatch();
  // Получение данных из Redux store
  const { user, status, error, message } = useSelector(state => ({
    user: githubSelectors.selectGithubUser(state),
    status: githubSelectors.selectGithubStatus(state),
    error: githubSelectors.selectGithubError(state),
    message: githubSelectors.selectGithubMessage(state),
  }));

  const { login } = useParams();
  const navigate = useNavigate();

  // Загрузка данных пользователя и репозиториев при монтировании компонента
  useEffect(() => {
    dispatch(githubActions.fetchUserAndRepos(login));
  }, [dispatch, login]);

  // Обработчик для кнопки "Назад"
  const handleGoBack = useCallback(() => navigate(-1), [navigate]);

  // Отображение индикатора загрузки
  if (status === 'loading') {
    return <Loader isLoading={true} />;
  }

  // Отображение ошибки
  if (error) {
    return <p className="text-red-400 font-bold text-center">{message || LANG.singlePage.error}</p>;
  }

  // Если данные еще не загружены или статус не успешный, не отображаем ничего
  if (!user || status !== 'success') {
    return null;
  }

  // Отображение информации о пользователе
  return (
    <div className='max-w-6xl mx-auto w-full my-4 grid gap-4'>
      <Button className='max-w-max' onClick={handleGoBack}>
        {LANG.singlePage.goBackButtonLabel}
      </Button>
      <div className='grid gap-3'>
        <h3 className='text-lg font-bold'>About: {login}</h3>
        <UserProfile user={user.user} />
        <UserStats user={user.user} />
        <h3 className='font-bold'>Latest Repositories</h3>
        <RepositoryList repos={user.repos} />
      </div>
    </div>
  );
};

export default SinglePage;
