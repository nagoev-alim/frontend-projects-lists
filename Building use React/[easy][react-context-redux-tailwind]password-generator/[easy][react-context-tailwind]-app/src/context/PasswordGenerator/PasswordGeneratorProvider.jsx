/**
 * @fileoverview Провайдер контекста для генератора паролей
 * @module PasswordGeneratorProvider
 */
import { useCallback, useContext, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { PasswordGeneratorContext } from '@context';
import { characters } from '@utils';

/**
 * Объект с константами для типов действий редьюсера
 * @constant
 * @type {Object}
 */
const ACTIONS = {
  UPDATE_OPTION: 'UPDATE_OPTION',
  SET_PASSWORD: 'SET_PASSWORD',
  SET_PASSWORD_STRENGTH: 'SET_PASSWORD_STRENGTH',
};

/**
 * Начальное состояние для редьюсера
 * @constant
 * @type {Object}
 */
const initialState = {
  password: '',
  strength: '',
  options: [
    { id: 'lowercase', label: 'Lowercase (a-z)', checked: true },
    { id: 'uppercase', label: 'Uppercase (A-Z)', checked: false },
    { id: 'numbers', label: 'Numbers (0-9)', checked: false },
    { id: 'symbols', label: 'Symbols (!-$^+)', checked: false },
  ],
};

/**
 * Редьюсер для управления состоянием генератора паролей
 * @function
 * @param {Object} state - Текущее состояние
 * @param {Object} action - Действие для изменения состояния
 * @param {string} action.type - Тип действия
 * @param {*} action.payload - Данные для действия
 * @returns {Object} Новое состояние
 */
const reducer = (state, { type, payload }) => {
  switch (type) {
    case ACTIONS.UPDATE_OPTION:
      return {
        ...state,
        options: state.options.map(option =>
          option.id === payload ? { ...option, checked: !option.checked } : option,
        ),
      };
    case ACTIONS.SET_PASSWORD:
      return { ...state, password: payload };
    case ACTIONS.SET_PASSWORD_STRENGTH:
      return { ...state, strength: payload };
    default:
      return state;
  }
};

/**
 * Компонент-провайдер для контекста генератора паролей
 * @function
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} props.children - Дочерние элементы
 * @returns {JSX.Element} Провайдер контекста с дочерними элементами
 */
const PasswordGeneratorProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  /**
   * Обработчик изменения опций генератора паролей
   * @function
   * @param {string} optionId - Идентификатор опции
   */
  const handleOptionChange = useCallback((optionId) => {
    dispatch({ type: ACTIONS.UPDATE_OPTION, payload: optionId });
  }, []);

  /**
   * Генерация нового пароля
   * @function
   * @param {number} length - Длина генерируемого пароля
   */
  const handleGenerateClick = useCallback((length) => {
    const selectedOptions = state.options.filter((option) => option.checked);
    if (selectedOptions.length === 0) {
      dispatch({ type: ACTIONS.SET_PASSWORD, payload: '' });
      return;
    }

    const generatedPassword = Array.from({ length }, () => {
      const randomOption = selectedOptions[Math.floor(Math.random() * selectedOptions.length)];
      return characters[randomOption.id].generate();
    }).join('');

    dispatch({ type: ACTIONS.SET_PASSWORD, payload: generatedPassword });
  }, [state.options]);

  /**
   * Определение силы пароля
   * @function
   * @param {string} password - Пароль для проверки
   */
  const getPasswordStrength = useCallback((password) => {
    if (!password) return 'none';

    const checks = {
      length: password.length,
      hasLowercase: /[a-z]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasDigits: /\d/.test(password),
      hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const varietyScore = Object.values(checks).filter(Boolean).length - 1; // Исключаем length из подсчета

    let strength;
    if (checks.length < 8) {
      strength = 'weak';
    } else if (checks.length < 12) {
      strength = varietyScore >= 3 ? 'medium' : 'weak';
    } else {
      strength = varietyScore >= 3 ? 'strong' : 'medium';
    }

    dispatch({ type: ACTIONS.SET_PASSWORD_STRENGTH, payload: strength });
  }, []);

  // Эффект для обновления силы пароля при его изменении
  useEffect(() => {
    getPasswordStrength(state.password);
  }, [getPasswordStrength, state.password]);

  // Значение контекста, предоставляемое провайдером
  const contextValue = {
    ...state,
    handleOptionChange,
    handleGenerateClick,
  };

  return (
    <PasswordGeneratorContext.Provider value={contextValue}>
      {children}
    </PasswordGeneratorContext.Provider>
  );
};

PasswordGeneratorProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Хук для использования контекста генератора паролей
 * @function
 * @returns {Object} Значение контекста генератора паролей
 * @throws {Error} Если хук используется вне провайдера
 */
const usePasswordGeneratorContext = () => {
  const context = useContext(PasswordGeneratorContext);
  if (context === undefined) {
    throw new Error('usePasswordGeneratorContext must be used within a PasswordGeneratorProvider');
  }
  return context;
};

export { usePasswordGeneratorContext };
export default PasswordGeneratorProvider;
