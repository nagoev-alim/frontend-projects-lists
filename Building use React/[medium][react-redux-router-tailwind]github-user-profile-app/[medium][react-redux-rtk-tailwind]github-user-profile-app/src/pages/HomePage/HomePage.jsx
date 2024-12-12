import Form from '@pages/HomePage/Form.jsx';
import UsersList from '@pages/HomePage/UsersList.jsx';

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
