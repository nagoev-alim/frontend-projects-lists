/**
 * @module ModalReducer
 * @description Модуль, содержащий редюсер для управления состоянием модального окна в приложении.
 */

import { LANG } from '../../lang/index.js';

const { actions: { SET_MODAL } } = LANG;

/**
 * @function modalReducer
 * @description Редюсер для обработки действий, связанных с модальным окном.
 * Этот редюсер обрабатывает действие SET_MODAL для обновления состояния модального окна.
 *
 * @param {Object} state - Текущее состояние модального окна.
 * @param {Object} action - Объект действия для обработки.
 * @param {string} action.type - Тип действия (например, SET_MODAL).
 * @param {Object} action.payload - Данные, связанные с действием.
 * @param {boolean} action.payload.isOpen - Флаг, указывающий, открыто ли модальное окно.
 * @param {*} action.payload.content - Содержимое модального окна.
 *
 * @returns {Object} Новое состояние модального окна.
 */
const modalReducer = (state, { type, payload }) => {
  switch (type) {
    case SET_MODAL:
      return {
        ...state,
        isOpen: payload.isOpen,
        content: payload.content,
      };
    default:
      return state;
  }
};

export default modalReducer;
