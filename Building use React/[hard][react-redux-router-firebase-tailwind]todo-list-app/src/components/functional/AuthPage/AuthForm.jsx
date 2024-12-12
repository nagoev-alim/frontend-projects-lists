/**
 * @module AuthForm
 * @description Модуль, предоставляющий компонент формы аутентификации для входа и регистрации пользователей.
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authActions, authSelectors } from '@features';
import { Button, Input } from '@ui';
import { authSchema } from '@utils';

/**
 * @function AuthForm
 * @description Компонент формы аутентификации. Обеспечивает функциональность входа и регистрации пользователей.
 * @param {Object} props - Свойства компонента
 * @param {boolean} props.isLogin - Флаг, указывающий, находится ли форма в режиме входа (true) или регистрации (false)
 * @param {Function} props.onAuthSuccess - Функция обратного вызова, вызываемая при успешной аутентификации
 * @returns {JSX.Element} Возвращает JSX элемент, представляющий форму аутентификации
 */
const AuthForm = ({ isLogin, onAuthSuccess }) => {
  /**
   * @description Хук для отправки действий в Redux store
   */
  const dispatch = useDispatch();

  /**
   * @description Селектор для получения статуса аутентификации из Redux store
   */
  const { status } = useSelector(authSelectors.selectAuthData);

  /**
   * @description Хук react-hook-form для управления формой и валидации
   */
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  /**
   * @function onSubmit
   * @description Обработчик отправки формы
   * @param {Object} data - Данные формы (email и password)
   */
  const onSubmit = async (data) => {
    const action = isLogin ? authActions.login : authActions.register;
    const result = await dispatch(action(data));
    if (result.meta.requestStatus === 'fulfilled') {
      onAuthSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-2 w-full">
      <div>
        <Input
          type="email"
          placeholder="Email"
          {...register('email')}
          fullWidth={true}
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <Input
          type="password"
          placeholder="Пароль"
          {...register('password')}
          fullWidth={true}
        />
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
      </div>
      <Button type="submit" disabled={status === 'loading'} className="w-full">
        {status === 'loading' ? 'Загрузка...' : isLogin ? 'Войти' : 'Зарегистрироваться'}
      </Button>
    </form>
  );
};

export default AuthForm;
