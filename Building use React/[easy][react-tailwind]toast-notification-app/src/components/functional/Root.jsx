import React, { useCallback, useMemo, useState } from 'react';
import { Button } from '@ui';
import { Toast } from './index.js';
import { TOAST_CONFIG } from '@utils';

/**
 * Корневой компонент для управления уведомлениями (тостами).
 * @returns {JSX.Element} Возвращает JSX элемент с интерфейсом управления уведомлениями.
 */
const Root = () => {
  // Состояние для хранения списка активных уведомлений
  const [toasts, setToasts] = useState([]);

  /**
   * Добавляет новое уведомление в список.
   * @param {string} type - Тип уведомления (например, 'success', 'error').
   */
  const addToast = useCallback((type) => {
    setToasts((prevToasts) => [...prevToasts, { id: Date.now(), type }]);
  }, []);

  /**
   * Удаляет уведомление из списка по его идентификатору.
   * @param {number} id - Уникальный идентификатор уведомления.
   */
  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  /**
   * Мемоизированный список кнопок для создания уведомлений разных типов.
   * @type {Array<JSX.Element>}
   */
  const toastButtons = useMemo(() =>
    Object.entries(TOAST_CONFIG.types).map(([key, value]) => (
      <Button variant={value.type} key={key} onClick={() => addToast(key)}>
        {key.charAt(0).toUpperCase() + key.slice(1)}
      </Button>
    )),
  [addToast]);

  return (
    <div className="t-notifications border bg-white gap-4 grid max-w-md p-3 rounded shadow w-full">
      <h1 className="font-bold text-2xl text-center">Toast Notification</h1>
      {/* Список активных уведомлений */}
      <ul>
        {toasts.map(({ id, type }) => (
          <Toast key={id} type={type} onClose={() => removeToast(id)} />
        ))}
      </ul>
      {/* Кнопки для создания уведомлений */}
      <div className="flex justify-center t-notifications__buttons">
        {toastButtons}
      </div>
    </div>
  );
};

export default Root;
