/**
 * @module ModalActions
 * @description Модуль, содержащий действия для управления модальным окном в приложении.
 */

import { LANG } from '../../lang/index.js';

const { actions: { SET_MODAL } } = LANG;

/**
 * @typedef {Object} ModalActions
 * @description Объект, содержащий действия для управления модальным окном.
 */
const modalActions = {
  /**
   * @function handleToggleModal
   * @description Функция для отправки действия по переключению состояния модального окна.
   * @param {Function} dispatch - Функция dispatch из useReducer или Redux для отправки действий.
   * @param {Object} payload - Данные для обновления состояния модального окна.
   * @param {boolean} payload.isOpen - Флаг, указывающий, должно ли модальное окно быть открытым.
   * @param {*} payload.content - Содержимое модального окна.
   */
  handleToggleModal: (dispatch, payload) => {
    dispatch({ type: SET_MODAL, payload });
  },
};

export default modalActions;
