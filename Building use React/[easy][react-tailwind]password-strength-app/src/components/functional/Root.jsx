/**
 * @fileoverview Компонент для проверки силы пароля
 *
 * Этот компонент предоставляет интерфейс для ввода пароля,
 * отображает его силу и позволяет переключать видимость пароля.
 * Сила пароля оценивается на основе нескольких критериев,
 * таких как длина, наличие различных типов символов и т.д.
 */

import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import { useCallback, useMemo, useState } from 'react';
import { Input } from '@ui';

/**
 * Объект для маппинга числовой оценки силы пароля на текстовое представление.
 * Ключи представляют собой количество выполненных критериев силы пароля,
 * а значения - соответствующую текстовую оценку.
 */
const strengthMap = {
  0: 'weak',
  1: 'weak',
  2: 'weak',
  3: 'medium',
  4: 'strong',
  5: 'strong',
};

/**
 * Компонент Root
 * Этот компонент отвечает за отображение интерфейса проверки силы пароля.
 * Он включает в себя поле ввода пароля, кнопку переключения видимости пароля,
 * и визуальное отображение силы введенного пароля.
 * @returns {JSX.Element} Возвращает JSX элемент, представляющий интерфейс
 * проверки силы пароля.
 */
const Root = () => {
  // Состояние видимости пароля
  const [isVisible, setIsVisible] = useState(false);
  // Состояние введенного пароля
  const [inputPassword, setInputPassword] = useState('');

  /**
   * @function toggleVisibility
   * Функция для переключения видимости пароля
   * @description Эта функция обновляет состояние видимости пароля, инвертируя его текущее значение.
   * Она оптимизирована с использованием useCallback для предотвращения ненужных повторных рендерингов.
   */
  const toggleVisibility = useCallback(() => setIsVisible(prev => !prev), []);

  /**
   * @function strength
   * Вычисление силы пароля
   * @description Эта функция вычисляет силу введенного пароля на основе заданных критериев.
   * Она использует useMemo для оптимизации производительности, пересчитывая значение
   * только при изменении inputPassword.
   */
  const strength = useMemo(() => {
    if (!inputPassword) return '';

    const criteria = [
      inputPassword.length > 8,
      /[a-z]/.test(inputPassword),
      /[A-Z]/.test(inputPassword),
      /\d/.test(inputPassword),
      /[^A-Za-z0-9]/.test(inputPassword),
    ];
    const score = criteria.filter(Boolean).length;
    return strengthMap[score];
  }, [inputPassword]);

  /**
   * @function handlePasswordChange
   * Обработчик изменения пароля
   * @description Эта функция обновляет состояние пароля при изменении значения в поле ввода.
   * Она оптимизирована с использованием useCallback для предотвращения ненужных повторных рендерингов.
   */
  const handlePasswordChange = useCallback((e) => {
    setInputPassword(e.target.value);
  }, []);

  return (
    <div className="grid gap-4 max-w-md w-full rounded border bg-white p-3 shadow">
      <h1 className="text-center text-2xl font-bold">Password Strength Check</h1>

      <div className="relative">
        <Input
          type={isVisible ? 'text' : 'password'}
          placeholder="Type password"
          value={inputPassword}
          onChange={handlePasswordChange}
          fullWidth={true}
        />
        <button className="absolute right-2 top-1/2 -translate-y-1/2" onClick={toggleVisibility}>
          {isVisible ? <FaRegEyeSlash size={20} /> : <FaRegEye size={20} />}
        </button>
      </div>

      {inputPassword && (
        <div className="grid gap-2">
          <ul className={`grid grid-cols-3 gap-2 ${strength}`}>
            {[...Array(3)].map((_, index) => (
              <li key={index} className="h-2 border-2 transition-colors" />
            ))}
          </ul>
          <p className="text-center">Your password is <span className="font-bold">{strength}</span></p>
        </div>
      )}
    </div>
  );
};

export default Root;
