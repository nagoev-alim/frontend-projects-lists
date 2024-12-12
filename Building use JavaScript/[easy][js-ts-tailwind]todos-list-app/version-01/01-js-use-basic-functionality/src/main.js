import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import { icons } from 'feather-icons';
import { v4 as uuidv4 } from 'uuid';

/**
 * Это приложение представляет собой простой список задач (Todo List).
 * Оно позволяет пользователям добавлять, удалять, редактировать и отмечать задачи как выполненные.
 * Приложение также поддерживает фильтрацию задач и очистку выполненных задач.
 * Данные сохраняются в локальном хранилище браузера.
 */

/**
 * Конфигурация приложения
 * @type {Object}
 */
const APP_CONFIG = {
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
 * Состояние приложения
 * @type {Object}
 */
const APP_STATE = {
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
 * Утилиты приложения
 * @type {Object}
 */
const APP_UTILS = {
  renderDataAttributes: (element) => element.slice(1, -1),
  toastConfig: {
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  },
  /**
   * Показывает уведомление
   * @param {string} message - Текст уведомления
   */
  showToast: (message) => {
    Toastify({
      text: message,
      ...APP_UTILS.toastConfig,
    }).showToast();
  },
};

/**
 * Создает HTML структуру приложения
 */
function createAppHTML() {
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
 * Инициализирует DOM элементы
 */
function initDOMElements() {
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
function initApp() {
  createAppHTML();
  initDOMElements();
  displayLocalStorageData();
  APP_STATE.elements.todoForm.addEventListener('submit', handleTodoFormSubmit);
  APP_STATE.elements.todoList.addEventListener('click', handleTodoListDelete);
  APP_STATE.elements.todoList.addEventListener('change', handleTodoListChange);
  APP_STATE.elements.todoList.addEventListener('dblclick', handleTodoListUpdate);
  APP_STATE.elements.filterInput.addEventListener('input', handleFilterInputChange);
  APP_STATE.elements.clearCompleted.addEventListener('click', handleClearCompletedClick);
}

/**
 * Отображает данные из локального хранилища
 */
function displayLocalStorageData() {
  APP_STATE.todosCollection = getLocalStorageData();
  renderTodosUI(APP_STATE.todosCollection);
}

/**
 * Получает данные из локального хранилища
 * @returns {Array} Массив задач
 */
function getLocalStorageData() {
  return JSON.parse(localStorage.getItem('todos')) || [];
}

/**
 * Сохраняет данные в локальное хранилище
 */
function setLocalStorageData() {
  return localStorage.setItem('todos', JSON.stringify(APP_STATE.todosCollection));
}

/**
 * Отображает задачи в UI
 * @param {Array} todosCollection - Массив задач
 */
function renderTodosUI(todosCollection) {
  const isTodosEmpty = todosCollection.length === 0;
  const incompleteTodosCount = todosCollection.filter((todo) => !todo.complete).length;
  const hasCompletedTodos = todosCollection.some((todo) => todo.complete);

  updateElementVisibility(isTodosEmpty, incompleteTodosCount, hasCompletedTodos);
  APP_STATE.elements.todoList.innerHTML = todosCollection.map(createTodoItemHTML).join('');
}

/**
 * Обновляет видимость элементов UI
 * @param {boolean} isTodosEmpty - Флаг пустого списка задач
 * @param {number} incompleteTodosCount - Количество незавершенных задач
 * @param {boolean} hasCompletedTodos - Флаг наличия завершенных задач
 */
function updateElementVisibility(isTodosEmpty, incompleteTodosCount, hasCompletedTodos) {
  APP_STATE.elements.todoContainer.className = isTodosEmpty ? 'content hidden' : 'content grid gap-3';
  APP_STATE.elements.filterInput.style.display = !isTodosEmpty && APP_STATE.todosCollection.length === 1 ? 'none' : 'block';
  APP_STATE.elements.todoCount.innerText = incompleteTodosCount.toString();
  APP_STATE.elements.clearCompleted.className = hasCompletedTodos ? 'px-3 py-2 border hover:bg-slate-50' : 'hidden';
}

/**
 * Создает HTML для элемента задачи
 * @param {Object} todo - Объект задачи
 * @param {boolean} todo.complete - Статус завершенности задачи
 * @param {string} todo.label - Текст задачи
 * @param {string} todo.id - Уникальный идентификатор задачи
 * @returns {string} HTML строка для элемента задачи
 */
function createTodoItemHTML({ complete, label, id }) {
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
 * Обрабатывает отправку формы добавления задачи
 * @param {Event} event - Событие отправки формы
 */
function handleTodoFormSubmit(event) {
  event.preventDefault();
  const label = event.target.elements.todo.value.trim();

  if (!label || label.length === 0) {
    APP_UTILS.showToast('Please enter a valid task name');
    return;
  }

  APP_STATE.todosCollection = [...APP_STATE.todosCollection, { label, complete: false, id: uuidv4() }];
  updateTodosAndRender();
  event.target.reset();
}

/**
 * Обновляет состояние и перерисовывает UI
 */
function updateTodosAndRender() {
  setLocalStorageData(APP_STATE.todosCollection);
  renderTodosUI(APP_STATE.todosCollection);
}

/**
 * Обрабатывает удаление задачи
 * @param {Event} event - Событие клика
 */
function handleTodoListDelete({ target }) {
  const id = target.dataset.todoDelete;
  if (!id || !confirmDeletion()) return;

  deleteTodoItem(id);
  updateTodosAndRender();
}

/**
 * Запрашивает подтверждение удаления
 * @returns {boolean} Результат подтверждения
 */
function confirmDeletion() {
  return confirm('Are you sure you want to delete this task?');
}

/**
 * Удаляет задачу из коллекции
 * @param {string} id - ID задачи для удаления
 */
function deleteTodoItem(id) {
  APP_STATE.todosCollection = APP_STATE.todosCollection.filter(todo => todo.id !== id);
}

/**
 * Обрабатывает изменение статуса задачи
 * @param {Event} event - Событие изменения
 */
function handleTodoListChange({
                                target: {
                                  dataset: { todoCheckbox: id },
                                  checked,
                                },
                              }) {
  APP_STATE.todosCollection = APP_STATE.todosCollection.map((todo) =>
    todo.id === id ? { ...todo, complete: checked } : todo,
  );

  updateTodosAndRender();
}

/**
 * Обрабатывает обновление текста задачи
 * @param {Event} event - Событие двойного клика
 */
function handleTodoListUpdate({ target }) {
  if (!target.matches('[data-todo-label]')) return;

  const todoId = target.dataset.todoLabel;
  const todo = APP_STATE.todosCollection.find((todo) => todo.id === todoId);
  if (!todo) return;

  const input = createEditInput(todo.label);
  target.after(input);
  target.classList.add('hidden');

  input.addEventListener('change', (event) =>
    handleEditInputChange(event, todoId, target, input, todo.label),
  );
  input.focus();
}

/**
 * Создает поле ввода для редактирования задачи
 * @param {string} value - Текущий текст задачи
 * @returns {HTMLInputElement} Элемент input для редактирования
 */
function createEditInput(value) {
  const input = document.createElement('input');
  input.classList.add('w-full');
  input.type = 'text';
  input.value = value;
  return input;
}

/**
 * Обрабатывает изменение текста задачи
 * @param {Event} event - Событие изменения
 * @param {string} todoId - ID задачи
 * @param {HTMLElement} target - Целевой элемент
 * @param {HTMLInputElement} input - Поле ввода
 * @param {string} originalLabel - Исходный текст задачи
 */
function handleEditInputChange(event, todoId, target, input, originalLabel) {
  event.stopPropagation();
  const newLabel = event.target.value;

  if (newLabel !== originalLabel) {
    updateTodoLabel(todoId, newLabel);
  }

  target.classList.remove('hidden');
  input.remove();
}

/**
 * Обновляет текст задачи
 * @param {string} todoId - ID задачи
 * @param {string} newLabel - Новый текст задачи
 */
function updateTodoLabel(todoId, newLabel) {
  APP_STATE.todosCollection = APP_STATE.todosCollection.map((todo) =>
    todo.id === todoId ? { ...todo, label: newLabel } : todo,
  );
  updateTodosAndRender();
}


/**
 * Обрабатывает изменение в поле фильтрации задач.
 * Фильтрует задачи на основе введенного текста.
 *
 * @param {Object} param0 - Объект события.
 * @param {string} param0.target.value - Значение введенное в поле фильтра.
 */
function handleFilterInputChange({ target: { value } }) {
  const todos = Array.from(APP_STATE.elements.todoList.querySelectorAll('li'));
  const filterInput = value.trim().toLowerCase();

  todos.forEach((todo) => {
    const labelElement = todo
      .querySelector('[data-todo-label]')
      .textContent.toLowerCase();
    todo.style.display =
      labelElement.includes(filterInput) ? 'flex' : 'none';
  });
}

/**
 * Обрабатывает нажатие на кнопку "Clear Completed".
 * Удаляет все завершенные задачи после подтверждения пользователем.
 */
function handleClearCompletedClick() {
  const count = APP_STATE.todosCollection.filter(({ complete }) => complete).length;

  if (count === 0 || !confirm(`Удалить ${count} завершенных задач?`)) return;

  APP_STATE.todosCollection = APP_STATE.todosCollection.filter(({ complete }) => !complete);

  setLocalStorageData(APP_STATE.todosCollection);
  renderTodosUI(APP_STATE.todosCollection);
}

// Инициализация приложения
initApp();
