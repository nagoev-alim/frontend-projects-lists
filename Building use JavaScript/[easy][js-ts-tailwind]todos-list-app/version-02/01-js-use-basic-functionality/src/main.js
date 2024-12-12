/**
 * Приложение для управления списком задач (Todo).
 * Позволяет создавать, отмечать выполненными и удалять задачи.
 * Использует JSONPlaceholder API для имитации серверного взаимодействия.
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';
import { icons } from 'feather-icons';

/**
 * Конфигурация приложения
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента
 * @property {Object} selectors - Селекторы элементов приложения
 * @property {string} url - Базовый URL для API
 */
const APP_CONFIG = {
  root: '#app',
  selectors: {
    form: '[data-todo-form]',
    select: '[data-todo-select]',
    list: '[data-todo-list]',
  },
  url: 'https://jsonplaceholder.typicode.com/',
};

/**
 * Состояние приложения
 * @typedef {Object} AppState
 * @property {Object} elements - DOM элементы
 * @property {Array} todosCollection - Коллекция задач
 * @property {Array} usersCollection - Коллекция пользователей
 * @property {Map} userNameCache - Кэш имен пользователей
 */
const APP_STATE = {
  elements: {
    form: null,
    select: null,
    list: null,
  },
  todosCollection: [],
  usersCollection: [],
  userNameCache: new Map(),
};

/**
 * Утилиты приложения
 * @typedef {Object} AppUtils
 * @property {Function} renderDataAttributes - Функция для рендеринга data-атрибутов
 * @property {Object} toastConfig - Конфигурация для уведомлений
 * @property {Function} showToast - Функция для отображения уведомлений
 * @property {Function} handleError - Функция для обработки ошибок
 */
const APP_UTILS = {
  renderDataAttributes: (element) => element.slice(1, -1),
  toastConfig: {
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  },
  showToast: (message) => {
    Toastify({
      text: message,
      ...APP_UTILS.toastConfig,
    }).showToast();
  },
  handleError: (message, error = null) => {
    APP_UTILS.showToast(message);
    if (error) console.error(message, error);
  },
};

/**
 * Создает HTML структуру приложения
 */
function createAppHTML() {
  const {
    root,
    selectors: { form, select, list },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='grid w-full max-w-lg gap-4 rounded border bg-white p-3 shadow'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Todo</h1>
      <div class='grid gap-3'>
        <form autocomplete='off' class='grid gap-3' ${renderDataAttributes(form)}>
          <label>
            <input class='w-full rounded border bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none' name='todo' placeholder='New todo' type='text'>
          </label>
          <select class='w-full rounded border bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none' ${renderDataAttributes(select)} name='user'>
            <option disabled selected>Select user</option>
          </select>
          <button class='border px-3 py-2 hover:bg-slate-50' type='submit'>Add Todo</button>
        </form>
        <ul class='grid gap-3' ${renderDataAttributes(list)}></ul>
      </div>
    </div>
  `;
}

/**
 * Инициализирует DOM элементы
 */
function initDOMElements() {
  APP_STATE.elements = {
    form: document.querySelector(APP_CONFIG.selectors.form),
    select: document.querySelector(APP_CONFIG.selectors.select),
    list: document.querySelector(APP_CONFIG.selectors.list),
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();
  (async () => {
    await getTodos();
    APP_STATE.elements.form.addEventListener('submit', handleFormSubmit);
    APP_STATE.elements.list.addEventListener('click', handleListClick);
    APP_STATE.elements.list.addEventListener('change', handleListChange);
  })();
}

/**
 * Получает задачи и пользователей с сервера
 */
async function getTodos() {
  try {
    const [{ data: todos }, { data: users }] = await Promise.all([
      axios.get(`${APP_CONFIG.url}todos`, { params: { _limit: 15 } }),
      axios.get(`${APP_CONFIG.url}users`),
    ]);

    Object.assign(APP_STATE, { todosCollection: todos, usersCollection: users });

    renderTodosUI(todos);
    renderUsersUI(users);
    
  } catch (error) {
    APP_UTILS.handleError('Error fetching tasks or users', error);
  }
}

/**
 * Получает имя пользователя по ID
 * @param {number} id - ID пользователя
 * @returns {string} Имя пользователя
 */
function getUserName(id) {
  if (!APP_STATE.userNameCache.has(id)) {
    const user = APP_STATE.usersCollection.find(user => user.id === id);
    if (user) {
      APP_STATE.userNameCache.set(id, user.name);
    } else {
      return 'Unknown user';
    }
  }
  return APP_STATE.userNameCache.get(id);
}

/**
 * Отображает задачи в UI
 * @param {Array} todosCollection - Коллекция задач
 */
function renderTodosUI(todosCollection) {
  APP_STATE.elements.list.innerHTML = todosCollection
    .map(({ userId, id, title, completed }) => `
    <li class='flex items-start gap-1.5 rounded border p-1' data-todo-id='${id}'>
      <label class='flex'>
        <input class='visually-hidden' type='checkbox' ${completed ? 'checked' : ''} data-todo-checkbox>
        <span class='checkbox'></span>
      </label>
      <div class='flex-grow grid gap-1'>
        <p>${title}</p>
        <span class='text-sm font-bold'>(${getUserName(userId)})</span>
      </div>
      <button class='shrink-0' data-todo-delete='${id}'>${icons.x.toSvg()}</button>
    </li>
  `)
    .join('');
}

/**
 * Отображает пользователей в выпадающем списке
 * @param {Array} usersCollection - Коллекция пользователей
 */
function renderUsersUI(usersCollection) {
  const options = usersCollection.map(({ id, name }) => `<option value='${id}'>${name}</option>`).join('');
  APP_STATE.elements.select.innerHTML = `
    <option disabled selected>Select user</option>
    ${options}
  `;
}

/**
 * Обрабатывает отправку формы
 * @param {Event} event - Событие отправки формы
 */
async function handleFormSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const { user, todo } = Object.fromEntries(formData);
  const trimmedTodo = todo.trim();

  if (!trimmedTodo || !user) {
    APP_UTILS.showToast('Please fill in all fields');
    return;
  }

  await createTodoItem({
    userId: Number(user),
    title: trimmedTodo,
    completed: false
  });

  event.target.reset();
}

/**
 * Создает новую задачу
 * @param {Object} newItem - Новая задача
 */
async function createTodoItem(newItem) {
  try {
    const { data } = await axios.post(`${APP_CONFIG.url}todos`, newItem);
    const createdTodo = { ...newItem, id: data.id };
    renderTodoItemUI(createdTodo);
    APP_STATE.todosCollection.unshift(createdTodo);
    APP_UTILS.showToast('Task successfully created');
  } catch (error) {
    APP_UTILS.handleError('Error creating task', error);
  }
}

/**
 * Отображает новую задачу в UI
 * @param {Object} todo - Задача для отображения
 */
function renderTodoItemUI({ id, title, userId }) {
  const todo = document.createElement('li');
  todo.className = 'flex items-start gap-1.5 rounded border p-1';
  todo.dataset.todoId = id.toString();
  todo.innerHTML = `
    <label class='flex'>
      <input class='visually-hidden' type='checkbox' data-todo-checkbox>
      <span class='checkbox'></span>
    </label>
    <p class='flex-grow grid gap-1'>
      ${title}
      <span class='text-sm font-bold'>${getUserName(userId)}</span>
    </p>
    <button class='shrink-0' data-todo-delete='${id}'>${icons.x.toSvg()}</button>
  `;
  APP_STATE.elements.list.prepend(todo);
}

/**
 * Обрабатывает изменение статуса задачи
 * @param {Event} event - Событие изменения
 */
async function handleListChange(event) {
  const target = event.target;
  if (!target.matches('[data-todo-checkbox]')) return;

  const todoItem = target.closest('li');
  const id = todoItem.dataset.todoId;
  const completed = target.checked;

  try {
    await updateTodoStatus(id, completed);
    updateLocalTodoStatus(id, completed);
    APP_UTILS.showToast('Task status successfully updated');
  } catch (error) {
    APP_UTILS.handleError('Error updating task status', error);
    target.checked = !completed;
  }
}

/**
 * Обновляет статус задачи на сервере
 * @param {string} id - ID задачи
 * @param {boolean} completed - Новый статус задачи
 */
async function updateTodoStatus(id, completed) {
  await axios.patch(`${APP_CONFIG.url}todos/${id}`, { completed });
}

/**
 * Обновляет статус задачи локально
 * @param {string} id - ID задачи
 * @param {boolean} completed - Новый статус задачи
 */
function updateLocalTodoStatus(id, completed) {
  const todoIndex = APP_STATE.todosCollection.findIndex(todo => todo.id === Number(id));
  if (todoIndex !== -1) {
    APP_STATE.todosCollection[todoIndex].completed = completed;
  }
}

/**
 * Обрабатывает клик по списку задач
 * @param {Event} event - Событие клика
 */
async function handleListClick(event) {
  const target = event.target;
  if (!isValidDeleteAction(target)) return;

  const todoId = Number(target.dataset.todoDelete);

  try {
    await deleteTodoItem(todoId);
    updateTodoList(todoId);
    APP_UTILS.showToast('Task successfully deleted');
  } catch (error) {
    APP_UTILS.handleError('Error deleting task', error);
  }
}

/**
 * Проверяет, является ли действие удаления допустимым
 * @param {Element} target - Целевой элемент
 * @returns {boolean} Результат проверки
 */
function isValidDeleteAction(target) {
  return target.matches('[data-todo-delete]') && confirm('Are you sure you want to delete?');
}

/**
 * Удаляет задачу на сервере
 * @param {number} todoId - ID задачи для удаления
 */
async function deleteTodoItem(todoId) {
  const { status } = await axios.delete(`${APP_CONFIG.url}todos/${todoId}`);
  if (status !== 200) {
    throw new Error('Failed to delete todo item');
  }
}

/**
 * Обновляет список задач после удаления
 * @param {number} todoId - ID удаленной задачи
 */
function updateTodoList(todoId) {
  APP_STATE.todosCollection = APP_STATE.todosCollection.filter(({ id }) => id !== todoId);
  renderTodosUI(APP_STATE.todosCollection);
}

initApp();
