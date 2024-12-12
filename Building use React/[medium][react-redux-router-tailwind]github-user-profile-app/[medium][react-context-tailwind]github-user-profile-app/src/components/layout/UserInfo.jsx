/**
 * @module UserInfo
 * @description Модуль, предоставляющий компонент для отображения информации о пользователе GitHub.
 */
import { memo } from 'react';
import { useAppContext } from '../../hooks/index.js';
import { LANG_EN } from '../../lang/index.js';

/**
 * @function UserInfo
 * @description Компонент для отображения детальной информации о пользователе GitHub.
 * Использует React.memo для оптимизации производительности путем предотвращения ненужных ререндеров.
 *
 * @returns {JSX.Element} JSX элемент, представляющий информацию о пользователе.
 */
const UserInfo = memo(function UserInfo() {
  /**
   * @description Использует хук useAppContext для получения данных профиля пользователя.
   * Извлекает необходимую информацию о пользователе из объекта profileData.
   */
  const {
    profileData: {
      user: {
        login,
        avatar_url,
        html_url,
        bio,
        followers,
        following,
        public_repos,
        public_gists,
      },
    },
  } = useAppContext();

  return (
    <div className="grid gap-3 place-items-center text-center">
      {/* Заголовок с именем пользователя */}
      <h3 className="font-bold text-lg">{LANG_EN.user.about} <span>{login}</span></h3>

      {/* Аватар пользователя */}
      <img className="w-[200px] rounded-full" src={avatar_url} alt={login} />

      {/* Ссылка на профиль пользователя */}
      <a className="font-medium px-3 py-2 border rounded bg-white hover:bg-slate-100" href={html_url} target="_blank"
         rel="noopener noreferrer">{LANG_EN.user.viewProfile}</a>

      {/* Биография пользователя (если есть) */}
      {bio && <div>{bio}</div>}

      {/* Список с дополнительной информацией о пользователе */}
      <ul className="grid grid-cols-2 gap-2">
        <li className="font-medium px-3 py-2 border rounded bg-white hover:bg-slate-100">
          {LANG_EN.user.followers}: {followers}
        </li>
        <li className="font-medium px-3 py-2 border rounded bg-white hover:bg-slate-100">
          {LANG_EN.user.following}: {following}
        </li>
        <li className="font-medium px-3 py-2 border rounded bg-white hover:bg-slate-100">
          {LANG_EN.user.publicRepos}: {public_repos}
        </li>
        <li className="font-medium px-3 py-2 border rounded bg-white hover:bg-slate-100">
          {LANG_EN.user.publicGists}: {public_gists}
        </li>
      </ul>
    </div>
  );
});

export default UserInfo;
