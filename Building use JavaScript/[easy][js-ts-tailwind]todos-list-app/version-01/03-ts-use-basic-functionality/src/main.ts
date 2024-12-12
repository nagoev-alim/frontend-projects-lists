import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import { icons } from 'feather-icons';
import { v4 as uuidv4 } from 'uuid';

/**
 * Это приложение представляет собой простой список задач (Todo list).
 * Оно позволяет пользователям добавлять, удалять, редактировать и отмечать задачи как выполненные.
 * Приложение также включает функционал фильтрации задач и очистки выполненных задач.
 * Данные сохраняются в локальном хранилище браузера.
 */

/**
 * Интерфейс конфигурации приложения
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента
 * @property {Object.<string, string>} selectors - Объект с селекторами элементов
 */
interface AppConfig {
  root: string;
  selectors: {
    [key: string]: string;
  };
}

/**
 * Константа с конфигурацией приложения
 * @type {AppConfig}
 */
const APP_CONFIG: AppConfig = {
  root: '#app',
  selectors: {
    todoCount: '[data-todo-count]',
    clearCompleted: '[data-clear-completed]',
    todoForm: '[data-todo-form]',
    filterInput: '[data-filter-input]',
    todoList: '[data-todo-list]',
    todoContainer: '[data-todo-container]',
  },
};

/**
 * Интерфейс состояния приложения
 * @typedef {Object} AppState
 * @property {Object.<string, HTMLElement | null>} elements - Объект с DOM элементами
 * @property {Todo[]} todosCollection - Массив задач
 */
interface AppState {
  elements: {
    [key: string]: HTMLElement | null;
  };
  todosCollection: Todo[];
}

/**
 * Интерфейс задачи
 * @typedef {Object} Todo
 * @property {string} id - Уникальный идентификатор задачи
 * @property {string} label - Текст задачи
 * @property {boolean} complete - Статус выполнения задачи
 */
interface Todo {
  id: string;
  label: string;
  complete: boolean;
}

/**
 * Состояние приложения
 * @type {AppState}
 */
const APP_STATE: AppState = {
  elements: {
    todoCount: null,
    clearCompleted: null,
    todoForm: null,
    filterInput: null,
    todoList: null,
    todoContainer: null,
  },
  todosCollection: [],
};

/**
 * Интерфейс конфигурации уведомлений
 * @typedef {Object} ToastConfig
 * @property {string} className - CSS классы для стилизации уведомления
 * @property {number} duration - Продолжительность показа уведомления в миллисекундах
 * @property {string} gravity - Позиция уведомления по вертикали
 * @property {string} position - Позиция уведомления по горизонтали
 */
interface ToastConfig {
  className: string;
  duration: number;
  gravity: string;
  position: string;
}

/**
 * Интерфейс утилит приложения
 * @typedef {Object} AppUtils
 * @property {function(string): string} renderDataAttributes - Функция для обработки data-атрибутов
 * @property {ToastConfig} toastConfig - Конфигурация уведомлений
 * @property {function(string): void} showToast - Функция для показа уведомления
 */
interface AppUtils {
  renderDataAttributes: (element: string) => string;
  toastConfig: ToastConfig;
  showToast: (message: string) => void;
}

/**
 * Утилиты приложения
 * @type {AppUtils}
 */
const APP_UTILS: AppUtils = {
  renderDataAttributes: (element: string): string => element.slice(1, -1),
  toastConfig: {
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  },
  showToast: (message: string): void => {
    // @ts-ignore
    Toastify({
      text: message,
      ...APP_UTILS.toastConfig,
    }).showToast();
  },
};

/**
 * Создает HTML структуру приложения
 */
function createAppHTML(): void {
  const {
    root,
    selectors: {
      todoCount,
      clearCompleted,
      todoForm,
      filterInput,
      todoList,
      todoContainer,
    },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='grid w-full max-w-md gap-4 rounded border bg-white p-3 shadow'>
      <header class='flex flex-wrap items-center justify-between gap-2'>
        <h2 class='w-full text-2xl font-bold md:text-4xl'>Todo</h2>
        <p class='min-h-[42px] flex items-center gap-1'>
          You have <span class='font-bold' ${renderDataAttributes(todoCount)}>0</span> items
        </p>
        <button class='hidden border px-3 py-2 hover:bg-slate-50' ${renderDataAttributes(clearCompleted)}>
          Clear Completed
        </button>
      </header>
      <form ${renderDataAttributes(todoForm)}>
        <label>
          <input class='w-full rounded border bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none'
                 type='text' name='todo' placeholder='Enter task name'>
        </label>
      </form>
      <div class='hidden grid gap-3 content' ${renderDataAttributes(todoContainer)}>
        <label>
          <input class='w-full rounded border bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none'
                 type='text' ${renderDataAttributes(filterInput)} placeholder='Filter tasks'>
        </label>
        <ul class='grid gap-3' ${renderDataAttributes(todoList)}></ul>
      </div>
    </div>
  `;
}

/**
 * Инициализирует DOM элементы в состоянии приложения
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    todoCount: document.querySelector(APP_CONFIG.selectors.todoCount),
    clearCompleted: document.querySelector(APP_CONFIG.selectors.clearCompleted),
    todoForm: document.querySelector(APP_CONFIG.selectors.todoForm),
    filterInput: document.querySelector(APP_CONFIG.selectors.filterInput),
    todoList: document.querySelector(APP_CONFIG.selectors.todoList),
    todoContainer: document.querySelector(APP_CONFIG.selectors.todoContainer),
  };
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();
  displayLocalStorageData();
  APP_STATE.elements.todoForm?.addEventListener('submit', handleTodoFormSubmit);
  APP_STATE.elements.todoList?.addEventListener('click', handleTodoListDelete);
  APP_STATE.elements.todoList?.addEventListener('change', handleTodoListChange);
  APP_STATE.elements.todoList?.addEventListener('dblclick', handleTodoListUpdate);
  APP_STATE.elements.filterInput?.addEventListener('input', handleFilterInputChange);
  APP_STATE.elements.clearCompleted?.addEventListener('click', handleClearCompletedClick);
}

/**
 * Отображает данные из локального хранилища
 */
function displayLocalStorageData(): void {
  APP_STATE.todosCollection = getLocalStorageData();
  renderTodosUI(APP_STATE.todosCollection);
}

/**
 * Получает данные из локального хранилища
 * @returns {Todo[]} Массив задач
 */
function getLocalStorageData(): Todo[] {
  return JSON.parse(localStorage.getItem('todos') || '[]') as Todo[];
}

/**
 * Сохраняет данные в локальное хранилище
 */
function setLocalStorageData(): void {
  localStorage.setItem('todos', JSON.stringify(APP_STATE.todosCollection));
}

/**
 * Отрисовывает UI списка задач
 * @param {Todo[]} todosCollection - Массив задач
 */
function renderTodosUI(todosCollection: Todo[]): void {
  const isTodosEmpty = todosCollection.length === 0;
  const incompleteTodosCount = todosCollection.filter((todo) => !todo.complete).length;
  const hasCompletedTodos = todosCollection.some((todo) => todo.complete);

  updateElementVisibility(isTodosEmpty, incompleteTodosCount, hasCompletedTodos);
  if (APP_STATE.elements.todoList) {
    APP_STATE.elements.todoList.innerHTML = todosCollection.map(createTodoItemHTML).join('');
  }
}

/**
 * Обновляет видимость элементов UI
 * @param {boolean} isTodosEmpty - Флаг пустого списка задач
 * @param {number} incompleteTodosCount - Количество невыполненных задач
 * @param {boolean} hasCompletedTodos - Флаг наличия выполненных задач
 */
function updateElementVisibility(isTodosEmpty: boolean, incompleteTodosCount: number, hasCompletedTodos: boolean): void {
  if (!APP_STATE.elements.todoContainer || !APP_STATE.elements.filterInput || !APP_STATE.elements.todoCount || !APP_STATE.elements.clearCompleted) return;
  APP_STATE.elements.todoContainer.className = isTodosEmpty ? 'content hidden' : 'content grid gap-3';
  APP_STATE.elements.filterInput.style.display = !isTodosEmpty && APP_STATE.todosCollection.length === 1 ? 'none' : 'block';
  APP_STATE.elements.todoCount.innerText = incompleteTodosCount.toString();
  APP_STATE.elements.clearCompleted.className = hasCompletedTodos ? 'px-3 py-2 border hover:bg-slate-50' : 'hidden';
}

/**
 * Создает HTML для элемента задачи
 * @param {Todo} todo - Объект задачи
 * @returns {string} HTML строка элемента задачи
 */
function createTodoItemHTML({ complete, label, id }: Todo): string {
  return `
    <li class='flex items-center gap-2 rounded border p-1 ${complete ? 'complete' : ''}'>
      <label class='flex' for='todo-${id}'>
        <input class='visually-hidden' type='checkbox' data-todo-checkbox='${id}' id='todo-${id}' ${complete ? 'checked' : ''}>
        <span class='checkbox'></span>
      </label>
      <span class='break-all flex-grow ${complete ? 'line-through' : ''}' data-todo-label='${id}'>${label}</span>
      <button data-todo-delete='${id}'>${icons.x.toSvg()}</button>
    </li>
  `;
}
/**
 * Обрабатывает отправку формы для добавления новой задачи.
 * @param {Event} event - Событие отправки формы.
 */
function handleTodoFormSubmit(event: Event): void {
  event.preventDefault();
  const target = event.target as HTMLFormElement;
  const todoInput = target.elements.namedItem('todo') as HTMLInputElement;
  const label = todoInput.value.trim();

  if (!label) {
    APP_UTILS.showToast('Пожалуйста, введите корректное название задачи');
    return;
  }

  const newTodo: Todo = { label, complete: false, id: uuidv4() };
  APP_STATE.todosCollection = [...APP_STATE.todosCollection, newTodo];
  updateTodosAndRender();
  target.reset();
}

/**
 * Обновляет данные в локальном хранилище и перерисовывает UI.
 */
function updateTodosAndRender(): void {
  setLocalStorageData();
  renderTodosUI(APP_STATE.todosCollection);
}

/**
 * Обрабатывает удаление задачи из списка.
 * @param {Event} event - Событие клика по кнопке удаления.
 */
function handleTodoListDelete(event: Event): void {
  const target = event.target as HTMLButtonElement;
  const id = target.dataset.todoDelete;
  if (!id || !confirm('Вы уверены, что хотите удалить эту задачу?')) return;

  APP_STATE.todosCollection = APP_STATE.todosCollection.filter(todo => todo.id !== id);
  updateTodosAndRender();
}

/**
 * Обрабатывает изменение статуса выполнения задачи.
 * @param {Event} event - Событие изменения чекбокса.
 */
function handleTodoListChange(event: Event): void {
  const target = event.target as HTMLInputElement;
  const id = target.dataset.todoCheckbox;
  const checked = target.checked;

  if (!id) return;

  APP_STATE.todosCollection = APP_STATE.todosCollection.map((todo) => todo.id === id ? {
    ...todo,
    complete: checked,
  } : todo);

  updateTodosAndRender();
}

/**
 * Обрабатывает двойной клик по задаче для её редактирования.
 * @param {Event} event - Событие двойного клика.
 */
function handleTodoListUpdate(event: Event): void {
  const target = event.target as HTMLElement;
  if (!target.matches('[data-todo-label]')) return;

  const todoId = target.dataset.todoLabel;
  if (!todoId) return;

  const todo = APP_STATE.todosCollection.find((todo) => todo.id === todoId);
  if (!todo) return;

  const input = createEditInput(todo.label);
  target.after(input);
  target.classList.add('hidden');

  input.addEventListener('change', (changeEvent: Event) =>
    handleEditInputChange(changeEvent, todoId, target, input, todo.label),
  );
  input.focus();
}

/**
 * Создает input элемент для редактирования задачи.
 * @param {string} value - Текущее значение задачи.
 * @returns {HTMLInputElement} Созданный input элемент.
 */
function createEditInput(value: string): HTMLInputElement {
  const input = document.createElement('input');
  input.classList.add('w-full');
  input.type = 'text';
  input.value = value;
  return input;
}

/**
 * Обрабатывает изменение текста задачи при редактировании.
 * @param {Event} event - Событие изменения input.
 * @param {string} todoId - ID редактируемой задачи.
 * @param {HTMLElement} target - Элемент с текстом задачи.
 * @param {HTMLInputElement} input - Input элемент для редактирования.
 * @param {string} originalLabel - Исходный текст задачи.
 */
function handleEditInputChange(event: Event, todoId: string, target: HTMLElement, input: HTMLInputElement, originalLabel: string): void {
  event.stopPropagation();
  const newLabel = (event.target as HTMLInputElement).value;

  if (newLabel !== originalLabel) {
    updateTodoLabel(todoId, newLabel);
  }

  target.classList.remove('hidden');
  input.remove();
}

/**
 * Обновляет текст задачи в коллекции и перерисовывает UI.
 * @param {string} todoId - ID обновляемой задачи.
 * @param {string} newLabel - Новый текст задачи.
 */
function updateTodoLabel(todoId: string, newLabel: string): void {
  APP_STATE.todosCollection = APP_STATE.todosCollection.map((todo) => todo.id === todoId ? {
    ...todo,
    label: newLabel,
  } : todo);
  updateTodosAndRender();
}

/**
 * Обрабатывает фильтрацию задач при вводе в поле фильтра.
 * @param {Event} event - Событие ввода в поле фильтра.
 */
function handleFilterInputChange(event: Event): void {
  const target = event.target as HTMLInputElement;
  const value = target.value;
  const todos = Array.from(APP_STATE.elements.todoList?.querySelectorAll('li') ?? []);
  const filterInput = value.trim().toLowerCase();

  todos.forEach((todo: Element) => {
    const labelElement = todo.querySelector('[data-todo-label]');
    if (labelElement && labelElement.textContent) {
      const labelText = labelElement.textContent.toLowerCase();
      (todo as HTMLElement).style.display =
        labelText.includes(filterInput) ? 'flex' : 'none';
    }
  });
}

/**
 * Обрабатывает очистку выполненных задач.
 */
function handleClearCompletedClick(): void {
  const count = APP_STATE.todosCollection.filter(({ complete }) => complete).length;

  if (count === 0 || !confirm(`Удалить ${count} выполненных задач?`)) return;

  APP_STATE.todosCollection = APP_STATE.todosCollection.filter(({ complete }) => !complete);

  setLocalStorageData();
  renderTodosUI(APP_STATE.todosCollection);
}

initApp();
