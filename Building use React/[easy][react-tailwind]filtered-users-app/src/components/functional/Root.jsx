import { faker } from '@faker-js/faker';
import { debounce } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';

/**
 * Компонент Root для отображения и фильтрации списка пользователей.
 * @returns {JSX.Element} Отрендеренный компонент Root.
 */
const Root = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');


  /**
   * @function generateUsersEffect
   * Эффект для генерации и установки начального списка пользователей.
   * @description
   * Этот эффект выполняется один раз при монтировании компонента.
   * Он генерирует список из 100 случайных пользователей, используя библиотеку faker,
   * и устанавливает этот список как для всех пользователей, так и для отфильтрованных пользователей.
   */
  useEffect(() => {
    const generatedUsers = Array.from({ length: 100 }, () => ({
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      jobArea: faker.person.jobArea(),
    }));
    setUsers(generatedUsers);
    setFilteredUsers(generatedUsers);
  }, []);

  /**
   * @function filterUsers
   * Фильтрует список пользователей на основе введенного значения.
   * @description
   * Эта функция фильтрует список пользователей на основе введенного значения.
   * Если значение пустое, возвращается исходный список.
   * В противном случае, функция ищет совпадения в имени, фамилии и области работы пользователя.
   */
  const filterUsers = useCallback((value, userList) => {
    const trimmedValue = value.trim().toLowerCase();

    if (trimmedValue === '') {
      return userList;
    }

    return userList.filter((user) => {
      const userInfo = `${user.firstName} ${user.lastName} ${user.jobArea}`.toLowerCase();
      return userInfo.includes(trimmedValue);
    });
  }, []);

  /**
   * @function debouncedFilterUsers
   * Мемоизированная функция для отложенной фильтрации пользователей.
   * @description
   * Эта функция создает отложенную (debounced) версию функции фильтрации пользователей.
   * Она использует useMemo для оптимизации производительности и debounce из lodash
   * для ограничения частоты вызовов функции фильтрации.
   */
  const debouncedFilterUsers = useMemo(
    () => debounce((value) => {
      setSearchTerm(value);
      setFilteredUsers(filterUsers(value, users));
    }, 300),
    [filterUsers, users],
  );

  /**
   * @function handleSearchTermChange
   * Обработчик изменения значения в поле поиска.
   * @description
   * Эта функция вызывается при каждом изменении значения в поле поиска.
   * Она передает новое значение в функцию debouncedFilterUsers для отложенной фильтрации пользователей.
   */
  const handleSearchTermChange = useCallback((e) => {
    debouncedFilterUsers(e.target.value);
  }, [debouncedFilterUsers]);

  return (
    <div className="bg-white grid justify-self-center max-w-xl w-full gap-4 rounded border p-3 shadow">
      <h1 className="text-center text-2xl font-bold">A Filterable List</h1>
      <input
        className="rounded border-2 px-3 py-2.5 focus:border-blue-400 focus:outline-none"
        type="text"
        placeholder="Search by name"
        value={searchTerm}
        onChange={handleSearchTermChange}
      />
      {filteredUsers.length > 0 && (
        <ul className='max-h-[600px] overflow-auto'>
          {filteredUsers.map((user, index) => (
            <li key={`user-${index}`} className="flex justify-between items-center gap-1 border p-2">
          <span className="text-lg">
            {`${user.firstName} ${user.lastName}`}
          </span>
              <span className="font-medium">{user.jobArea}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Root;
