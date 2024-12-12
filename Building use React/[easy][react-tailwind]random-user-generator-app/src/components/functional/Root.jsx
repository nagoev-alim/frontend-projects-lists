/**
 * @fileOverview Компонент Root
 *
 * Этот компонент представляет собой генератор случайных пользовательских данных.
 * Он отправляет запрос к API randomuser.me, получает данные случайного пользователя,
 * и отображает их в интерактивном интерфейсе. Пользователь может переключаться между
 * различными категориями информации (имя, email, возраст и т.д.) и генерировать новые
 * данные по нажатию кнопки.
 */

import { useCallback, useEffect, useState } from 'react';
import { FaAt, FaLock, FaPhone, FaRegCalendarCheck, FaRegCircleUser, FaRegMap } from 'react-icons/fa6';
import { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { showToast } from '@utils';
import { Button, Loader } from '@ui';
import { CategoryList } from '@functional';

/**
 * Массив категорий пользовательских данных.
 * Каждая категория представлена объектом с названием и соответствующей иконкой.
 */
const categories = [
  { name: 'name', src: <FaRegCircleUser /> },
  { name: 'email', src: <FaAt /> },
  { name: 'age', src: <FaRegCalendarCheck /> },
  { name: 'street', src: <FaRegMap /> },
  { name: 'phone', src: <FaPhone /> },
  { name: 'password', src: <FaLock /> },
];

/**
 * Компонент Root
 * Этот компонент отвечает за генерацию и отображение случайных пользовательских данных.
 * Он использует API randomuser.me для получения информации о случайном пользователе
 * и позволяет пользователю интерактивно просматривать различные категории данных.
 * @returns {JSX.Element} Возвращает JSX элемент, представляющий интерфейс генератора случайных пользователей.
 */
const Root = () => {
  // Состояние, отслеживающее статус загрузки данных
  const [fetchingStatus, setFetchingStatus] = useState({ loading: false, error: false });
  // Состояние, хранящее данные пользователя
  const [userData, setUserData] = useState(null);
  // Состояние, хранящее активную категорию и её значение
  const [activeCategory, setActiveCategory] = useState({ name: categories[0].name, value: '' });

  /**
   * @function handleFetchUserData
   * Функция для получения данных о случайном пользователе
   */
  const handleFetchUserData = useCallback(async () => {
    setFetchingStatus({ loading: true, error: false });
    try {
      // Отправка GET-запроса к API randomuser.me
      const { data: { results: [user] } } = await axios.get('https://randomuser.me/api/');

      // Формирование объекта с данными пользователя
      const newUserData = {
        phone: user.phone,
        email: user.email,
        image: user.picture.large,
        street: `${user.location.street.number} ${user.location.street.name}`,
        password: user.login.password,
        name: `${user.name.first} ${user.name.last}`,
        age: user.dob.age,
      };

      // Обновление состояний с новыми данными пользователя
      setUserData(newUserData);
      setActiveCategory(prev => ({ name: prev.name, value: newUserData[prev.name] }));
    } catch (error) {
      // Обработка ошибки
      showToast('Failed to fetch user data. Please try again later.', 'error');
      console.error('An error occurred:', error);
      setFetchingStatus({ loading: false, error: true });
      setUserData(null);
      setActiveCategory({ name: 'name', value: '' });
    } finally {
      // Сброс состояния загрузки
      setFetchingStatus(prev => ({ ...prev, loading: false }));
    }
  }, []);

  /**
   * Эффект для загрузки данных пользователя при монтировании компонента
   * @description Этот эффект вызывается при монтировании компонента и при изменении функции handleFetchUserData.
   * Он асинхронно вызывает функцию handleFetchUserData для получения данных о случайном пользователе.
   */
  useEffect(() => {
    (async () => {
      await handleFetchUserData();
    })();
  }, [handleFetchUserData]);

  /**
   * Условный рендеринг компонента загрузки
   * @description Если данные загружаются (fetchingStatus.loading === true),
   * возвращает компонент Loader для отображения индикатора загрузки.
   */
  if (fetchingStatus.loading) return <Loader/>;

  /**
   * Условный рендеринг сообщения об ошибке
   * @description Если произошла ошибка при загрузке данных (fetchingStatus.error === true),
   * возвращает параграф с сообщением об ошибке.
   */
  if (fetchingStatus.error) {
    return (
      <p className="text-red-500 text-center font-medium">
        Failed to fetch user data. Please try again later.
      </p>
    );
  }

  /**
   * Проверка наличия данных пользователя
   * @description Если данные пользователя отсутствуют (userData === null),
   * возвращает null, предотвращая рендеринг компонента.
   */
  if (!userData) return null;

  return (
    <div className="grid w-full max-w-md gap-4 rounded border bg-white p-3 shadow">
      <h1 className="text-center text-2xl font-bold">Random User Generator</h1>
      <img
        className="mx-auto h-[132px] w-[132px] rounded-full border-2 border-black"
        src={userData.image}
        alt="User avatar"
      />
      <p className="flex flex-wrap justify-center gap-1">
        <span>My {activeCategory.name} is</span>
        <span className="break-all font-medium">{activeCategory.value}</span>
      </p>
      <CategoryList
        categories={categories}
        onSetCategory={setActiveCategory}
        activeCategory={activeCategory}
        userData={userData}
      />
      <Button onClick={handleFetchUserData}>
        Generate
      </Button>
      <Toaster />
    </div>
  );
};

export default Root;
