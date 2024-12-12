/**
 * @function AuthToggle
 * @description Компонент для переключения между режимами входа и регистрации.
 * Отображает текст и кнопку, позволяющую пользователю переключаться между формами входа и регистрации.
 * @param {Object} props - Свойства компонента
 * @param {boolean} props.isLogin - Флаг, указывающий, находится ли форма в режиме входа (true) или регистрации (false)
 * @param {Function} props.onToggle - Функция обратного вызова для переключения режима аутентификации
 * @returns {JSX.Element} Возвращает JSX элемент, представляющий переключатель режима аутентификации
 */
const AuthToggle = ({ isLogin, onToggle }) => (
  <p className="text-center">
    {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
    <button
      onClick={onToggle}
      className="text-blue-500 hover:text-blue-700 ml-1 font-semibold"
    >
      {isLogin ? 'Зарегистрироваться' : 'Войти'}
    </button>
  </p>
);

export default AuthToggle;
