import { Button } from '@ui';
import { FaRegSun, FaRegMoon } from 'react-icons/fa';
import { useCallback, useEffect, useMemo, useState } from 'react';

/**
 * Кастомный хук для управления темой приложения.
 */
const useTheme = () => {
  /**
   * Получает начальную тему из localStorage или возвращает 'light', если тема не установлена.
   * @returns {string} Начальная тема ('dark' или 'light').
   */
  const getInitialTheme = () => localStorage.getItem('theme') || 'light';

  // Состояние для хранения текущей темы
  const [currentTheme, setCurrentTheme] = useState(getInitialTheme);

  useEffect(() => {
    // Переключение класса 'dark' на элементе documentElement
    document.documentElement.classList.toggle('dark', currentTheme === 'dark');
    // Сохранение текущей темы в localStorage
    localStorage.setItem('theme', currentTheme);
  }, [currentTheme]);

  /**
   * Функция для переключения темы.
   * Мемоизирована с помощью useCallback для оптимизации производительности.
   */
  const toggleTheme = useCallback(() => {
    setCurrentTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  }, []);

  return [currentTheme, toggleTheme];
};

/**
 * Корневой компонент приложения.
 * Отображает кнопку для переключения темы.
 * @returns {JSX.Element} Кнопка переключения темы.
 */
const Root = () => {
  // Использование кастомного хука для управления темой
  const [theme, toggleTheme] = useTheme();

  /**
   * Мемоизированное значение, определяющее, активен ли темный режим.
   * Пересчитывается только при изменении темы.
   */
  const isDarkMode = useMemo(() => theme === 'dark', [theme]);

  return (
    <Button
      darkMode={isDarkMode}
      variant={isDarkMode ? 'secondary' : 'primary'}
      onClick={toggleTheme}
      className="inline-flex gap-2 items-center"
    >
      {isDarkMode ? 'Light Theme' : 'Dark Theme'}
      {isDarkMode ? <FaRegSun /> : <FaRegMoon />}
    </Button>
  );
};

export default Root;
