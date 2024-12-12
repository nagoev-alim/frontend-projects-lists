/**
 * Компонент для отображения карточки пользователя GitHub.
 *
 * @param {Object} props - Свойства компонента.
 * @param {string} props.login - Логин пользователя GitHub.
 * @param {string} props.avatar_url - URL аватара пользователя.
 * @param {string} props.html_url - URL профиля пользователя на GitHub.
 * @returns {JSX.Element} Элемент карточки пользователя.
 */
const UserCard = ({ login, avatar_url, html_url }) => (
  <li className="border bg-white min-h-[324px] overflow-hidden rounded shadow-sm transition-shadow hover:shadow-md">
    <img className="object-cover w-full h-48" src={avatar_url} alt={`Avatar of ${login}`} />
    <div className="flex flex-col items-center gap-2 p-4">
      <h4 className="font-bold text-lg text-gray-800">{login}</h4>
      <a
        className="bg-blue-500 border text-white font-semibold hover:bg-blue-400 px-4 py-2 rounded transition-colors"
        href={html_url}
        target="_blank"
        rel="noopener noreferrer"
      >
        View profile
      </a>
    </div>
  </li>
);

export default UserCard;
