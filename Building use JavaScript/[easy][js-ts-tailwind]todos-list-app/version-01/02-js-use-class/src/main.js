import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import { icons } from 'feather-icons';
import { v4 as uuidv4 } from 'uuid';

/**
 * Класс TodoList представляет собой приложение для управления списком задач (todo list).
 * Он обеспечивает функциональность создания, удаления, редактирования и фильтрации задач,
 * а также сохранение данных в локальном хранилище браузера.
 */
class TodoList {
  /**
   * Создает экземпляр TodoList и инициализирует приложение.
   */
  constructor() {
    this.config = {
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

    this.state = {
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

    this.utils = {
      renderDataAttributes: (element) => element.slice(1, -1),
      toastConfig: {
        className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
        duration: 3000,
        gravity: 'bottom',
        position: 'center',
      },
      /**
       * Отображает уведомление с заданным сообщением.
       * @param {string} message - Текст уведомления.
       */
      showToast: (message) => {
        Toastify({
          text: message,
          ...this.utils.toastConfig,
        }).showToast();
      },
    };

    this.init();
  }

  /**
   * Создает HTML-разметку приложения и вставляет ее в DOM.
   */
  createAppHTML() {
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
    } = this.config;
    const { renderDataAttributes } = this.utils;
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
   * Инициализирует DOM-элементы приложения.
   */
  initDOMElements() {
    this.state.elements = {
      todoCount: document.querySelector(this.config.selectors.todoCount),
      clearCompleted: document.querySelector(this.config.selectors.clearCompleted),
      todoForm: document.querySelector(this.config.selectors.todoForm),
      filterInput: document.querySelector(this.config.selectors.filterInput),
      todoList: document.querySelector(this.config.selectors.todoList),
      todoContainer: document.querySelector(this.config.selectors.todoContainer),
    };
  }

  /**
   * Инициализирует приложение, создавая HTML, устанавливая обработчики событий и загружая данные.
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();
    this.displayLocalStorageData();
    this.state.elements.todoForm.addEventListener('submit', this.handleTodoFormSubmit.bind(this));
    this.state.elements.todoList.addEventListener('click', this.handleTodoListDelete.bind(this));
    this.state.elements.todoList.addEventListener('change', this.handleTodoListChange.bind(this));
    this.state.elements.todoList.addEventListener('dblclick', this.handleTodoListUpdate.bind(this));
    this.state.elements.filterInput.addEventListener('input', this.handleFilterInputChange.bind(this));
    this.state.elements.clearCompleted.addEventListener('click', this.handleClearCompletedClick.bind(this));
  }

  /**
   * Загружает данные из локального хранилища и отображает их.
   */
  displayLocalStorageData() {
    this.state.todosCollection = this.getLocalStorageData();
    this.renderTodosUI(this.state.todosCollection);
  }

  /**
   * Получает данные из локального хранилища.
   * @returns {Array} Массив задач.
   */
  getLocalStorageData() {
    return JSON.parse(localStorage.getItem('todos')) || [];
  }

  /**
   * Сохраняет данные в локальное хранилище.
   */
  setLocalStorageData() {
    return localStorage.setItem('todos', JSON.stringify(this.state.todosCollection));
  }

  /**
   * Отображает задачи в интерфейсе.
   * @param {Array} todosCollection - Массив задач для отображения.
   */
  renderTodosUI(todosCollection) {
    const isTodosEmpty = todosCollection.length === 0;
    const incompleteTodosCount = todosCollection.filter((todo) => !todo.complete).length;
    const hasCompletedTodos = todosCollection.some((todo) => todo.complete);

    this.updateElementVisibility(isTodosEmpty, incompleteTodosCount, hasCompletedTodos);
    this.state.elements.todoList.innerHTML = todosCollection.map(this.createTodoItemHTML).join('');
  }

  /**
   * Обновляет видимость элементов интерфейса в зависимости от состояния задач.
   * @param {boolean} isTodosEmpty - Флаг, указывающий на отсутствие задач.
   * @param {number} incompleteTodosCount - Количество незавершенных задач.
   * @param {boolean} hasCompletedTodos - Флаг, указывающий на наличие завершенных задач.
   */
  updateElementVisibility(isTodosEmpty, incompleteTodosCount, hasCompletedTodos) {
    this.state.elements.todoContainer.className = isTodosEmpty ? 'content hidden' : 'content grid gap-3';
    this.state.elements.filterInput.style.display = !isTodosEmpty && this.state.todosCollection.length === 1 ? 'none' : 'block';
    this.state.elements.todoCount.innerText = incompleteTodosCount.toString();
    this.state.elements.clearCompleted.className = hasCompletedTodos ? 'px-3 py-2 border hover:bg-slate-50' : 'hidden';
  }

  /**
   * Создает HTML-разметку для отдельной задачи.
   * @param {Object} todo - Объект задачи.
   * @param {boolean} todo.complete - Статус завершенности задачи.
   * @param {string} todo.label - Текст задачи.
   * @param {string} todo.id - Уникальный идентификатор задачи.
   * @returns {string} HTML-разметка задачи.
   */
  createTodoItemHTML({ complete, label, id }) {
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
   * Обработчик отправки формы добавления новой задачи.
   * @param {Event} event - Объект события отправки формы.
   */
  handleTodoFormSubmit(event) {
    event.preventDefault();
    const label = event.target.elements.todo.value.trim();

    if (!label || label.length === 0) {
      this.utils.showToast('Please enter a valid task name');
      return;
    }

    this.state.todosCollection = [...this.state.todosCollection, { label, complete: false, id: uuidv4() }];
    this.updateTodosAndRender();
    event.target.reset();
  }

  /**
   * Обновляет данные в локальном хранилище и перерисовывает интерфейс.
   */
  updateTodosAndRender() {
    this.setLocalStorageData(this.state.todosCollection);
    this.renderTodosUI(this.state.todosCollection);
  }

  /**
   * Обработчик удаления задачи.
   * @param {Event} event - Объект события клика.
   */
  handleTodoListDelete({ target }) {
    const id = target.dataset.todoDelete;
    if (!id || !this.confirmDeletion()) return;

    this.deleteTodoItem(id);
    this.updateTodosAndRender();
  }

  /**
   * Запрашивает подтверждение удаления задачи.
   * @returns {boolean} Результат подтверждения.
   */
  confirmDeletion() {
    return confirm('Are you sure you want to delete this task?');
  }

  /**
   * Удаляет задачу из коллекции.
   * @param {string} id - Идентификатор задачи для удаления.
   */
  deleteTodoItem(id) {
    this.state.todosCollection = this.state.todosCollection.filter(todo => todo.id !== id);
  }

  /**
   * Обработчик изменения статуса завершенности задачи.
   * @param {Event} event - Объект события изменения.
   */
  handleTodoListChange({
                         target: {
                           dataset: { todoCheckbox: id },
                           checked,
                         },
                       }) {
    this.state.todosCollection = this.state.todosCollection.map((todo) =>
      todo.id === id ? { ...todo, complete: checked } : todo,
    );

    this.updateTodosAndRender();
  }

  /**
   * Обработчик двойного клика для редактирования задачи.
   * @param {Event} event - Объект события двойного клика.
   */
  handleTodoListUpdate({ target }) {
    if (!target.matches('[data-todo-label]')) return;

    const todoId = target.dataset.todoLabel;
    const todo = this.state.todosCollection.find((todo) => todo.id === todoId);
    if (!todo) return;

    const input = this.createEditInput(todo.label);
    target.after(input);
    target.classList.add('hidden');

    input.addEventListener('change', (event) =>
      this.handleEditInputChange(event, todoId, target, input, todo.label),
    );
    input.focus();
  }

  /**
   * Создает поле ввода для редактирования задачи.
   * @param {string} value - Текущий текст задачи.
   * @returns {HTMLInputElement} Элемент input для редактирования.
   */
  createEditInput(value) {
    const input = document.createElement('input');
    input.classList.add('w-full');
    input.type = 'text';
    input.value = value;
    return input;
  }

  /**
   * Обрабатывает изменение текста задачи при редактировании.
   * @param {Event} event - Событие изменения input.
   * @param {string} todoId - Идентификатор редактируемой задачи.
   * @param {HTMLElement} target - Элемент с текстом задачи.
   * @param {HTMLInputElement} input - Поле ввода для редактирования.
   * @param {string} originalLabel - Исходный текст задачи.
   */
  handleEditInputChange(event, todoId, target, input, originalLabel) {
    event.stopPropagation();
    const newLabel = event.target.value;

    if (newLabel !== originalLabel) {
      this.updateTodoLabel(todoId, newLabel);
    }

    target.classList.remove('hidden');
    input.remove();
  }

  /**
   * Обновляет текст задачи в коллекции и перерисовывает интерфейс.
   * @param {string} todoId - Идентификатор задачи для обновления.
   * @param {string} newLabel - Новый текст задачи.
   */
  updateTodoLabel(todoId, newLabel) {
    this.state.todosCollection = this.state.todosCollection.map((todo) =>
      todo.id === todoId ? { ...todo, label: newLabel } : todo,
    );
    this.updateTodosAndRender();
  }

  /**
   * Обрабатывает изменение в поле фильтрации задач.
   * @param {Event} event - Событие изменения input.
   */
  handleFilterInputChange({ target: { value } }) {
    const todos = Array.from(this.state.elements.todoList.querySelectorAll('li'));
    const filterInput = value.trim().toLowerCase();

    todos.forEach((todo) => {
      const labelElement = todo
        .querySelector('[data-todo-label]')
        .textContent.toLowerCase();
      todo.style.display =
        labelElement.indexOf(filterInput) !== -1 ? 'flex' : 'none';
    });
  }

  /**
   * Обрабатывает нажатие на кнопку очистки завершенных задач.
   * Запрашивает подтверждение и удаляет все завершенные задачи.
   */
  handleClearCompletedClick() {
    const count = this.state.todosCollection.filter(({ complete }) => complete).length;

    if (count === 0 || !confirm(`Delete ${count} completed tasks?`)) return;

    this.state.todosCollection = this.state.todosCollection.filter(({ complete }) => !complete);

    this.setLocalStorageData(this.state.todosCollection);
    this.renderTodosUI(this.state.todosCollection);
  }
}

new TodoList();
