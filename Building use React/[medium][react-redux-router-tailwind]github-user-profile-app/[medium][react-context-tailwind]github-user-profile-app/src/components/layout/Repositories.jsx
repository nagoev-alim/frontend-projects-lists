/**
 * @module Repositories
 * @description Модуль, предоставляющий компонент для отображения списка репозиториев пользователя GitHub.
 */

import { memo, useMemo } from 'react';
import { FiEye, FiGitMerge, FiStar } from 'react-icons/fi';
import { useAppContext } from '../../hooks/index.js';
import { LANG_EN } from '../../lang/index.js';

/**
 * @function Repositories
 * @description Компонент для отображения списка репозиториев пользователя GitHub.
 * Использует React.memo для оптимизации производительности путем предотвращения ненужных ререндеров.
 *
 * @returns {JSX.Element} JSX элемент, представляющий список репозиториев.
 */
const Repositories = memo(function Repositories() {
  /**
   * @description Использует хук useAppContext для получения данных о репозиториях пользователя.
   * Извлекает массив repos из объекта profileData.
   */
  const { profileData: { repos } } = useAppContext();

  /**
   * @description Использует useMemo для мемоизации списка репозиториев.
   * Создает JSX элементы для каждого репозитория, отображая его название, количество звезд, наблюдателей и форков.
   */
  const repoList = useMemo(() => repos.map(({ html_url, name, stargazers_count, watchers_count, forks_count }) => (
    <li className="bg-white border-2 rounded p-3" key={html_url}>
      <a className="grid gap-2" target="_blank" href={html_url} rel="noopener noreferrer">
        <h4 className="font-bold">{name}</h4>
        <div className="grid grid-cols-3 gap-2">
          <div className="flex items-center gap-1.5">
            <FiStar aria-label="Stars" />
            {stargazers_count}
          </div>
          <div className="flex items-center gap-1.5">
            <FiEye aria-label="Watchers" />
            {watchers_count}
          </div>
          <div className="flex items-center gap-1.5">
            <FiGitMerge aria-label="Forks" />
            {forks_count}
          </div>
        </div>
      </a>
    </li>
  )), [repos]);

  return (
    <div className="grid gap-3">
      {/* Заголовок списка репозиториев */}
      <h3 className="font-bold text-lg">{LANG_EN.repos.title}:</h3>
      {/* Список репозиториев */}
      <ul className="grid gap-3">{repoList}</ul>
    </div>
  );
});

export default Repositories;
