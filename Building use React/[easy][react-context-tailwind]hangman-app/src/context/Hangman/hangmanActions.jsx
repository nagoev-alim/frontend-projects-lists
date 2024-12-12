import axios from 'axios';
import HangmanConstants from './HangmanConstants';
import { LANG } from '../../lang/index';
import { showToast } from '../../utils/index';

/**
 * Константы для действий и API, извлеченные из HangmanConstants.
 */
const {
  actions: {
    SET_LOADING,
    SET_ERROR,
    FETCH_WORD,
    SET_PLAYABLE,
    SET_RESTART,
  },
  api: {
    baseURL,
  },
} = HangmanConstants;

/**
 * Создание экземпляра axios с предустановленными параметрами.
 */
const axiosInstance = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
  validateStatus: (status) => status >= 200 && status < 300,
});

/**
 * Объект, содержащий действия для игры "Виселица".
 * @type {Object}
 */
const hangmanActions = {
  /**
   * Получает новое слово с сервера.
   * @param {Function} dispatch - Функция dispatch для отправки действий в Redux.
   * @returns {Promise<void>}
   */
  fetchWord: async (dispatch) => {
    await performApiRequest(dispatch, () => axiosInstance.get('word'), FETCH_WORD);
  },

  /**
   * Устанавливает состояние игры (можно играть или нет).
   * @param {Function} dispatch - Функция dispatch для отправки действий в Redux.
   * @param {boolean} payload - Флаг, указывающий, можно ли играть.
   */
  handlePlayable: (dispatch, payload) => dispatch({ type: SET_PLAYABLE, payload }),

  /**
   * Перезапускает игру, устанавливая состояние "можно играть" и получая новое слово.
   * @param {Function} dispatch - Функция dispatch для отправки действий в Redux.
   * @returns {Promise<void>}
   */
  handleRestart: async (dispatch) => {
    dispatch({ type: SET_PLAYABLE, payload: true });
    await performApiRequest(dispatch, () => axiosInstance.get('word'), SET_RESTART);
  },
};

/**
 * Выполняет API-запрос с обработкой загрузки и ошибок.
 * @param {Function} dispatch - Функция dispatch для отправки действий в Redux.
 * @param {Function} apiCall - Функция для выполнения API-запроса.
 * @param {string} successActionType - Тип действия, которое нужно отправить при успешном запросе.
 * @returns {Promise<void>}
 */
const performApiRequest = async (dispatch, apiCall, successActionType) => {
  try {
    dispatch({ type: SET_LOADING, payload: true });
    const { data: [payload] } = await apiCall();
    dispatch({ type: successActionType, payload });
  } catch (error) {
    handleApiError(dispatch, error);
  }
};

/**
 * Обрабатывает ошибки API-запросов.
 * @param {Function} dispatch - Функция dispatch для отправки действий в Redux.
 * @param {Error} error - Объект ошибки.
 */
const handleApiError = (dispatch, error) => {
  console.error(LANG.actions.occurred, error);
  showToast(LANG.actions.fetchBreweryFailed, 'error');
  dispatch({ type: SET_ERROR, payload: true });
};

export default hangmanActions;
