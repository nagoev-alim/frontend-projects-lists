import { UsersList } from '../components/layout';
import { Form } from '../components/functional';

/**
 * @function HomePage
 * @description Компонент главной страницы приложения
 * @returns {JSX.Element} Возвращает JSX разметку главной страницы
 */
const HomePage = () => (
  // Контейнер с сеткой и отступом между элементами
  <div className="grid gap-2">
    {/* Компонент формы для поиска пользователей */}
    <Form />
    {/* Компонент для отображения списка пользователей */}
    <UsersList />
  </div>
);

export default HomePage;
