import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';
import { icons } from 'feather-icons';

/**
 * Этот код представляет собой приложение для управления списком задач (Todo list).
 * Основные функции включают:
 * - Получение списка задач и пользователей с сервера
 * - Отображение задач и пользователей в интерфейсе
 * - Добавление новых задач
 * - Изменение статуса выполнения задач
 * - Удаление задач
 * Приложение использует axios для HTTP-запросов и Toastify для уведомлений.
 */

/** Конфигурация приложения */
interface AppConfig {
  root: string;
  selectors: {
    form: string;
    select: string;
    list: string;
  };
  url: string;
}

/** Состояние приложения */
interface AppState {
  elements: {
    form: HTMLFormElement | null;
    select: HTMLSelectElement | null;
    list: HTMLUListElement | null;
  };
  todosCollection: Todo[];
  usersCollection: User[];
  userNameCache: Map<number, string>;
}

/** Интерфейс задачи */
interface Todo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

/** Интерфейс пользователя */
interface User {
  id: number;
  name: string;
}

/** Конфигурация приложения */
const APP_CONFIG: AppConfig = {
  root: '#app',
  selectors: {
    form: '[data-todo-form]',
    select: '[data-todo-select]',
    list: '[data-todo-list]',
  },
  url: 'https://jsonplaceholder.typicode.com/',
};

/** Состояние приложения */
const APP_STATE: AppState = {
  elements: {
    form: null,
    select: null,
    list: null,
  },
  todosCollection: [],
  usersCollection: [],
  userNameCache: new Map(),
};

/** Утилиты приложения */
const APP_UTILS = {
  renderDataAttributes: (element: string): string => element.slice(1, -1),
  toastConfig: {
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  },
  /**
   * Показывает уведомление
   * @param {string} message - Сообщение для отображения
   */
  showToast: (message: string): void => {
    // @ts-ignore
    Toastify({
      text: message,
      ...APP_UTILS.toastConfig,
    }).showToast();
  },
  /**
   * Обрабатывает ошибку
   * @param {string} message - Сообщение об ошибке
   * @param {Error | null} error - Объект ошибки (необязательно)
   */
  handleError: (message: string, error: Error | null = null): void => {
    APP_UTILS.showToast(message);
    if (error) console.error(message, error);
  },
};

/**
 * Создает HTML-разметку приложения
 */
function createAppHTML(): void {
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
 * Инициализирует DOM-элементы
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    form: document.querySelector<HTMLFormElement>(APP_CONFIG.selectors.form),
    select: document.querySelector<HTMLSelectElement>(APP_CONFIG.selectors.select),
    list: document.querySelector<HTMLUListElement>(APP_CONFIG.selectors.list),
  };
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();
  (async () => {
    await getTodos();
    APP_STATE.elements.form?.addEventListener('submit', handleFormSubmit);
    APP_STATE.elements.list?.addEventListener('click', (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.matches('[data-todo-delete]')) {
        handleListClick(event);
      } else if (target.matches('[data-todo-checkbox]')) {
        handleListChange(event);
      }
    });
  })();
}

/**
 * Получает задачи и пользователей с сервера
 */
async function getTodos(): Promise<void> {
  try {
    const [{ data: todos }, { data: users }] = await Promise.all([
      axios.get<Todo[]>(`${APP_CONFIG.url}todos`, { params: { _limit: 15 } }),
      axios.get<User[]>(`${APP_CONFIG.url}users`),
    ]);

    Object.assign(APP_STATE, { todosCollection: todos, usersCollection: users });

    renderTodosUI(todos);
    renderUsersUI(users);

  } catch (error) {
    APP_UTILS.handleError('Error fetching tasks or users', error as Error);
  }
}

/**
 * Получает имя пользователя по ID
 * @param {number} id - ID пользователя
 * @returns {string} Имя пользователя
 */
function getUserName(id: number): string {
  if (!APP_STATE.userNameCache.has(id)) {
    const user = APP_STATE.usersCollection.find(user => user.id === id);
    if (user) {
      APP_STATE.userNameCache.set(id, user.name);
    } else {
      return 'Unknown user';
    }
  }
  return APP_STATE.userNameCache.get(id) || 'Unknown user';
}

/**
 * Отображает задачи в интерфейсе
 * @param {Todo[]} todosCollection - Массив задач
 */
function renderTodosUI(todosCollection: Todo[]): void {
  if (APP_STATE.elements.list) {
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
}

/**
 * Отображает пользователей в выпадающем списке
 * @param {User[]} usersCollection - Массив пользователей
 */
function renderUsersUI(usersCollection: User[]): void {
  const options = usersCollection.map(({ id, name }) => `<option value='${id}'>${name}</option>`).join('');
  if (APP_STATE.elements.select) {
    APP_STATE.elements.select.innerHTML = `
    <option disabled selected>Select user</option>
    ${options}
  `;
  }
}

/**
 * Обрабатывает отправку формы
 * @param {Event} event - Событие отправки формы
 */
async function handleFormSubmit(event: Event): Promise<void> {
  event.preventDefault();
  const formData = new FormData(event.target as HTMLFormElement);
  const { user, todo } = Object.fromEntries(formData) as { user: string; todo: string };
  const trimmedTodo = todo.trim();

  if (!trimmedTodo || !user) {
    APP_UTILS.showToast('Please fill in all fields');
    return;
  }

  await createTodoItem({
    userId: Number(user),
    title: trimmedTodo,
    completed: false,
  });

  (event.target as HTMLFormElement).reset();
}

/**
 * Создает новую задачу
 * @param {Omit<Todo, 'id'>} newItem - Новая задача без ID
 */
async function createTodoItem(newItem: Omit<Todo, 'id'>): Promise<void> {
  try {
    const { data } = await axios.post<{ id: number }>(`${APP_CONFIG.url}todos`, newItem);
    const createdTodo: Todo = { ...newItem, id: data.id };
    renderTodoItemUI(createdTodo);
    APP_STATE.todosCollection.unshift(createdTodo);
    APP_UTILS.showToast('Task successfully created');
  } catch (error) {
    APP_UTILS.handleError('Error creating task', error as Error);
  }
}

/**
 * Отображает новую задачу в интерфейсе
 * @param {Todo} todo - Новая задача
 */
function renderTodoItemUI({ id, title, userId }: Todo): void {
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
  APP_STATE.elements.list?.prepend(todo);
}

/**
 * Обрабатывает изменение статуса задачи
 * @param {Event} event - Событие изменения чекбокса
 */
async function handleListChange({ target }: Event): Promise<void> {
  if (!(target instanceof HTMLInputElement) || !target.matches('[data-todo-checkbox]')) return;

  const todoItem = target.closest('li');
  if (!todoItem) return;

  const id = todoItem.dataset.todoId;
  const completed = target.checked;

  if (!id) return;

  try {
    await updateTodoStatus(id, completed);
    updateLocalTodoStatus(id, completed);
    APP_UTILS.showToast('Task status successfully updated');
  } catch (error) {
    APP_UTILS.handleError('Error updating task status', error as Error);
    target.checked = !completed;
  }
}

/**
 * Обновляет статус задачи на сервере
 * @param {string} id - Идентификатор задачи
 * @param {boolean} completed - Новый статус выполнения задачи
 * @returns {Promise<void>}
 */
async function updateTodoStatus(id: string, completed: boolean): Promise<void> {
  await axios.patch(`${APP_CONFIG.url}todos/${id}`, { completed });
}

/**
 * Обновляет статус задачи в локальном хранилище
 * @param {string} id - Идентификатор задачи
 * @param {boolean} completed - Новый статус выполнения задачи
 */
function updateLocalTodoStatus(id: string, completed: boolean): void {
  const todoIndex = APP_STATE.todosCollection.findIndex(todo => todo.id === Number(id));
  if (todoIndex !== -1) {
    APP_STATE.todosCollection[todoIndex].completed = completed;
  }
}

/**
 * Обрабатывает клик по кнопке удаления задачи
 * @param {Event} event - Событие клика
 * @returns {Promise<void>}
 */
async function handleListClick(event: Event): Promise<void> {
  const target = event.target as HTMLElement;
  if (!isValidDeleteAction(target)) return;

  const todoId = Number(target.dataset.todoDelete);

  try {
    await deleteTodoItem(todoId);
    updateTodoList(todoId);
    APP_UTILS.showToast('Task successfully deleted');
  } catch (error) {
    APP_UTILS.handleError('Error deleting task', error as Error);
  }
}

/**
 * Проверяет, является ли действие удаления допустимым
 * @param {HTMLElement} target - Целевой элемент клика
 * @returns {boolean} - true, если действие допустимо, иначе false
 */
function isValidDeleteAction(target: HTMLElement): boolean {
  return target.matches('[data-todo-delete]') && confirm('Are you sure you want to delete?');
}

/**
 * Удаляет задачу на сервере
 * @param {number} todoId - Идентификатор задачи для удаления
 * @throws {Error} Если удаление не удалось
 * @returns {Promise<void>}
 */
async function deleteTodoItem(todoId: number): Promise<void> {
  const { status } = await axios.delete(`${APP_CONFIG.url}todos/${todoId}`);
  if (status !== 200) {
    throw new Error('Failed to delete todo item');
  }
}

/**
 * Обновляет список задач после удаления
 * @param {number} todoId - Идентификатор удаленной задачи
 */
function updateTodoList(todoId: number): void {
  APP_STATE.todosCollection = APP_STATE.todosCollection.filter(({ id }) => id !== todoId);
  renderTodosUI(APP_STATE.todosCollection);
}

// Инициализация приложения
initApp();
