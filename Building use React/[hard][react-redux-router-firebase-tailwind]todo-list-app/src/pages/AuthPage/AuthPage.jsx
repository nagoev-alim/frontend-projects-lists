/**
 * @module AuthPage
 * @description Модуль, отвечающий за страницу аутентификации в приложении.
 * Предоставляет функциональность для входа и регистрации пользователей.
 */

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { authSelectors } from '@features';
import { AuthForm, AuthToggle } from '@functional';

/**
 * @function AuthPage
 * @description Компонент страницы аутентификации.
 * @returns {JSX.Element} Возвращает JSX элемент, представляющий страницу аутентификации.
 */
const AuthPage = () => {
  /**
   * @description Состояние, определяющее текущий режим аутентификации (вход или регистрация).
   */
  const [isLogin, setIsLogin] = useState(true);

  /**
   * @description Состояние для хранения сообщения об ошибке.
   */
  const [errorMessage, setErrorMessage] = useState('');

  /**
   * @description Хук для программной навигации.
   */
  const navigate = useNavigate();

  /**
   * @description Селектор для получения данных аутентификации из Redux store.
   */
  const { error, message } = useSelector(authSelectors.selectAuthData);

  /**
   * @description Эффект для обработки ошибок аутентификации и установки соответствующего сообщения.
   */
  useEffect(() => {
    if (error) {
      if (message.includes('Firebase: Error (auth/invalid-credential)')) {
        setErrorMessage('Пользователь не существует или введены неверные данные');
      } else if (message.includes('This email is already registered')) {
        setErrorMessage('Этот email уже зарегистрирован. Используйте другой email или попробуйте войти.');
      } else {
        setErrorMessage(message);
      }
    } else {
      setErrorMessage('');
    }
  }, [error, message]);

  /**
   * @function handleAuthSuccess
   * @description Обработчик успешной аутентификации.
   * Перенаправляет пользователя на главную страницу.
   */
  const handleAuthSuccess = () => {
    navigate('/');
  };

  /**
   * @function toggleAuthMode
   * @description Переключает режим аутентификации между входом и регистрацией.
   */
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setErrorMessage('');
  };

  return (
    <div className="max-w-md w-full bg-white mx-auto mt-10 p-2 px-4 border-2 rounded-md grid gap-3 place-items-center">
      <h2 className="text-2xl font-bold text-center">
        {isLogin ? 'Вход' : 'Регистрация'}
      </h2>
      <AuthForm
        isLogin={isLogin}
        onAuthSuccess={handleAuthSuccess}
      />
      {errorMessage && <p className="text-red-500 text-center font-semibold">{errorMessage}</p>}
      <AuthToggle
        isLogin={isLogin}
        onToggle={toggleAuthMode}
      />
    </div>
  );
};

export default AuthPage;
