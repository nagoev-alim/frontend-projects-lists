import { useEffect, useMemo, useReducer } from 'react';
import PropTypes from 'prop-types';
import { hangmanActions, hangmanReducer, HangmanContext } from '../index';
import HangmanConstants from './HangmanConstants';
import { showToast } from '../../utils/index';

/**
 * Константы действий для игры "Виселица"
 * @type {{SET_CORRECT_WORD: string, SET_WRONG_WORD: string}}
 */
const {
  actions: {
    SET_CORRECT_WORD,
    SET_WRONG_WORD,
  },
} = HangmanConstants;

/**
 * Начальное состояние игры "Виселица"
 * @type {Object}
 */
const initialState = {
  isLoading: false,
  isError: false,
  playable: true,
  correctLetters: [],
  wrongLetters: [],
  word: null,
};

/**
 * Провайдер контекста для игры "Виселица"
 *
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} props.children - Дочерние элементы
 * @returns {React.ReactElement} Провайдер контекста HangmanContext
 */
const HangmanProvider = ({ children }) => {
  // Используем useReducer для управления состоянием игры
  const [state, dispatch] = useReducer(hangmanReducer, initialState);

  /**
   * Мемоизированные действия для игры
   * Оборачиваем каждое действие в функцию, которая вызывает dispatch
   */
  const actions = useMemo(() => {
    return Object.keys(hangmanActions).reduce((acc, key) => {
      acc[key] = (...args) => hangmanActions[key](dispatch, ...args);
      return acc;
    }, {});
  }, []);

  // Эффект для загрузки слова при монтировании компонента
  useEffect(() => {
    (async () => {
      await actions.fetchWord();
    })();
  }, [actions]);

  // Эффект для обработки нажатий клавиш
  useEffect(() => {
    /**
     * Обработчик нажатия клавиш
     * @param {KeyboardEvent} event - Событие нажатия клавиши
     */
    const handleKeydown = (event) => {
      const { word, correctLetters, wrongLetters, playable } = state;
      const { key, keyCode } = event;

      // Проверяем, что игра активна и нажата буква (A-Z)
      if (!playable || keyCode < 65 || keyCode > 90) return;

      const payload = key.toLowerCase();
      const isCorrectLetter = word.includes(payload);
      const letterSet = isCorrectLetter ? correctLetters : wrongLetters;
      const actionType = isCorrectLetter ? SET_CORRECT_WORD : SET_WRONG_WORD;

      // Если буква еще не была введена, диспетчеризуем соответствующее действие
      if (!letterSet.includes(payload)) {
        dispatch({ type: actionType, payload });
      } else {
        showTemporaryToast();
      }
    };

    /**
     * Показывает временное уведомление о повторном вводе буквы
     */
    const showTemporaryToast = () => {
      showToast('You have already entered this letter', 'error');
    };

    // Добавляем слушатель событий при монтировании и удаляем при размонтировании
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [state]);

  // Возвращаем провайдер контекста с текущим состоянием и действиями
  return (
    <HangmanContext.Provider value={{
      ...state,
      ...actions,
    }}>
      {children}
    </HangmanContext.Provider>
  );
};

// Проверка типов пропсов
HangmanProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default HangmanProvider;
