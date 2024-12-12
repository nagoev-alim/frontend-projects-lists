/**
 * @module ModalProvider
 * @description Модуль, предоставляющий провайдер контекста для управления модальным окном в приложении.
 */

import { useReducer } from 'react';
import { ModalContext, modalReducer } from '../index.js';
import PropTypes from 'prop-types';

/**
 * @typedef {Object} ModalState
 * @property {boolean} isOpen - Флаг, указывающий, открыто ли модальное окно.
 * @property {*} content - Содержимое модального окна.
 */

/**
 * @type {ModalState}
 * @description Начальное состояние модального окна.
 */
const initialState = {
  isOpen: false,
  content: null,
};

/**
 * @function ModalProvider
 * @description Компонент-провайдер, предоставляющий контекст для управления модальным окном.
 * Использует хук useReducer для управления состоянием модального окна.
 * 
 * @param {Object} props - Свойства компонента.
 * @param {React.ReactNode} props.children - Дочерние компоненты, которые будут обернуты провайдером.
 * 
 * @returns {JSX.Element} Провайдер контекста модального окна, содержащий дочерние компоненты.
 */
const ModalProvider = ({ children }) => {
  /**
   * @type {[ModalState, function]}
   * @description Хук useReducer для управления состоянием модального окна.
   * state содержит текущее состояние, а dispatch - функцию для отправки действий.
   */
  const [state, dispatch] = useReducer(modalReducer, initialState);

  return (
    <ModalContext.Provider value={{
      isOpen: state.isOpen,
      content: state.content,
      dispatch,
    }}>
      {children}
    </ModalContext.Provider>
  );
};

ModalProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ModalProvider;
