/**
 * @module ModalContext
 * @description Модуль, содержащий контекст для управления модальными окнами в приложении.
 */

import { createContext } from 'react';

/**
 * @constant {React.Context} ModalContext
 * @description Контекст React для управления состоянием и функциональностью модальных окон.
 * 
 * @remarks
 * Этот контекст используется для передачи данных и функций, связанных с модальными окнами,
 * через дерево компонентов без необходимости передавать пропсы на каждом уровне.
 * 
 * Начальное значение контекста установлено как null. Фактические данные и функции
 * будут предоставлены через ModalProvider (не показан в данном фрагменте кода).
 */
const ModalContext = createContext(null);

export default ModalContext;
