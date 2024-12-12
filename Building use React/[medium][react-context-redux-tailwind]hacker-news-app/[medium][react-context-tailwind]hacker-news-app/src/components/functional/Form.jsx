import { useCallback, useState } from 'react';
import { Input } from '../ui/index.js';
import { useAppContext } from '../../hooks/index.js';
import { showToast } from '../../utils/index.js';
import { LANG } from '../../lang/index.js';
import { appActions } from '../../context/index.js';

/**
 * @function Form
 * @description Компонент формы поиска для ввода запросов пользователем.
 *
 * @requires react.useCallback
 * @requires react.useState
 * @requires Input - Компонент поля ввода
 * @requires useAppContext - Хук для доступа к глобальному состоянию приложения
 * @requires showToast - Функция для отображения уведомлений
 * @requires LANG - Объект с языковыми константами
 * @requires appActions - Объект с действиями для изменения состояния приложения
 *
 * @returns {JSX.Element} Возвращает JSX элемент, представляющий форму поиска.
 */
const Form = () => {
  // Получение текущего запроса и функции dispatch из глобального контекста
  const { query, dispatch } = useAppContext();
  // Получение функции поиска из объекта действий
  const { searchStory } = appActions;
  // Локальное состояние для управления вводом пользователя
  const [inputQuery, setInputQuery] = useState(query);

  /**
   * Обработчик отправки формы.
   * Проверяет валидность введенного запроса, отображает уведомление об ошибке при необходимости,
   * и запускает поиск, если запрос валиден.
   *
   * @function
   * @param {Event} e - Объект события отправки формы
   */
  const handleFormSubmit = useCallback((e) => {
    e.preventDefault();
    if (!inputQuery || inputQuery.trim().length === 0) {
      showToast(LANG.errors.queryValidation, 'error');
      return;
    }
    searchStory(dispatch, inputQuery);
    setInputQuery('');
  }, [dispatch, inputQuery, searchStory]);

  return (
    <form onSubmit={handleFormSubmit} className="border rounded shadow bg-white p-4">
      <label className="grid gap-2">
        <span className="font-medium">{LANG.form.label}</span>
        <Input value={inputQuery} onChange={(e) => setInputQuery(e.target.value)} />
      </label>
    </form>
  );
};

export default Form;
