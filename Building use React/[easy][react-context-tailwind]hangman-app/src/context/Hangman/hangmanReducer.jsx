import HangmanConstants from './HangmanConstants';

/**
 * Константы действий для игры "Виселица"
 * @type {Object}
 */
const {
  actions: {
    SET_LOADING,
    SET_ERROR,
    FETCH_WORD,
    SET_CORRECT_WORD,
    SET_WRONG_WORD,
    SET_RESTART,
    SET_PLAYABLE,
  },
} = HangmanConstants;

/**
 * Редьюсер для управления состоянием игры "Виселица"
 *
 * @param {Object} state - Текущее состояние
 * @param {Object} action - Объект действия
 * @param {string} action.type - Тип действия
 * @param {*} action.payload - Полезная нагрузка действия
 * @returns {Object} Новое состояние
 */
const hangmanReducer = (state, { type, payload }) => {
  switch (type) {
    case SET_LOADING:
      // Устанавливает состояние загрузки
      return { ...state, isLoading: payload, isError: false };
    case SET_ERROR:
      // Устанавливает состояние ошибки
      return { ...state, isLoading: false, isError: payload };
    case FETCH_WORD:
      // Обновляет слово и сбрасывает состояния загрузки и ошибки
      return { ...state, word: payload, isLoading: false, isError: false };
    case SET_CORRECT_WORD:
      // Добавляет правильно угаданную букву
      return { ...state, correctLetters: [...state.correctLetters, payload] };
    case SET_WRONG_WORD:
      // Добавляет неправильно угаданную букву
      return { ...state, wrongLetters: [...state.wrongLetters, payload] };
    case SET_PLAYABLE:
      // Устанавливает возможность игры
      return { ...state, playable: payload };
    case SET_RESTART:
      // Сбрасывает игру к начальному состоянию с новым словом
      return {
        ...state,
        correctLetters: [],
        wrongLetters: [],
        word: payload,
        isLoading: false,
        isError: false,
      };
    default:
      // Возвращает текущее состояние, если тип действия неизвестен
      return state;
  }
};

export default hangmanReducer;
