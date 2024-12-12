import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';
import { icons } from 'feather-icons';

/**
 * @fileoverview Этот файл содержит класс TodoList, который реализует функциональность списка задач.
 * Приложение позволяет пользователям создавать, удалять и обновлять задачи, а также отображает
 * список пользователей. Используется API JSONPlaceholder для имитации серверных операций.
 */

class TodoList {
  /**
   * Создает экземпляр TodoList.
   * Инициализирует конфигурацию, состояние и утилиты.
   */
  constructor() {
    /** @type {Object} Конфигурация приложения */
    this.config = {
      root: '#app',
      selectors: {
        form: '[data-todo-form]',
        select: '[data-todo-select]',
        list: '[data-todo-list]',
      },
      url: 'https://jsonplaceholder.typicode.com/',
    };

    /** @type {Object} Состояние приложения */
    this.state = {
      elements: {
        form: null,
        select: null,
        list: null,
      },
      todosCollection: [],
      usersCollection: [],
      userNameCache: new Map(),
    };

    /** @type {Object} Утилиты приложения */
    this.utils = {
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
          ...this.utils.toastConfig,
        }).showToast();
      },
      handleError: (message, error = null) => {
        this.utils.showToast(message);
        if (error) console.error(message, error);
      },
    };

    this.init();
  }

  /**
   * Создает HTML структуру приложения.
   */
  createAppHTML() {
    const {
      root,
      selectors: { form, select, list },
    } = this.config;
    const { renderDataAttributes } = this.utils;
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
   * Инициализирует DOM элементы.
   */
  initDOMElements() {
    this.state.elements = {
      form: document.querySelector(this.config.selectors.form),
      select: document.querySelector(this.config.selectors.select),
      list: document.querySelector(this.config.selectors.list),
    };
  }

  /**
   * Инициализирует приложение.
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();
    (async () => {
      await this.getTodos();
      this.state.elements.form.addEventListener('submit', this.handleFormSubmit.bind(this));
      this.state.elements.list.addEventListener('click', (event) => {
        if (event.target.matches('[data-todo-delete]')) {
          this.handleListClick(event);
        } else if (event.target.matches('[data-todo-checkbox]')) {
          this.handleListChange(event);
        }
      });
    })();
  }

  /**
   * Получает задачи и пользователей с сервера.
   */
  async getTodos() {
    try {
      const [{ data: todos }, { data: users }] = await Promise.all([
        axios.get(`${this.config.url}todos`, { params: { _limit: 15 } }),
        axios.get(`${this.config.url}users`),
      ]);

      Object.assign(this.state, { todosCollection: todos, usersCollection: users });

      this.renderTodosUI(todos);
      this.renderUsersUI(users);

    } catch (error) {
      this.utils.handleError('Error fetching tasks or users', error);
    }
  }

  /**
   * Получает имя пользователя по его ID.
   * @param {number} id - ID пользователя
   * @returns {string} Имя пользователя
   */
  getUserName(id) {
    if (!this.state.userNameCache.has(id)) {
      const user = this.state.usersCollection.find(user => user.id === id);
      if (user) {
        this.state.userNameCache.set(id, user.name);
      } else {
        return 'Unknown user';
      }
    }
    return this.state.userNameCache.get(id);
  }

  /**
   * Отображает задачи в UI.
   * @param {Array} todosCollection - Массив задач
   */
  renderTodosUI(todosCollection) {
    this.state.elements.list.innerHTML = todosCollection
      .map(({ userId, id, title, completed }) => `
    <li class='flex items-start gap-1.5 rounded border p-1' data-todo-id='${id}'>
      <label class='flex'>
        <input class='visually-hidden' type='checkbox' ${completed ? 'checked' : ''} data-todo-checkbox>
        <span class='checkbox'></span>
      </label>
      <div class='flex-grow grid gap-1'>
        <p>${title}</p>
        <span class='text-sm font-bold'>(${this.getUserName(userId)})</span>
      </div>
      <button class='shrink-0' data-todo-delete='${id}'>${icons.x.toSvg()}</button>
    </li>
  `)
      .join('');
  }

  /**
   * Отображает пользователей в UI.
   * @param {Array} usersCollection - Массив пользователей
   */
  renderUsersUI(usersCollection) {
    const options = usersCollection.map(({ id, name }) => `<option value='${id}'>${name}</option>`).join('');
    this.state.elements.select.innerHTML = `
    <option disabled selected>Select user</option>
    ${options}
  `;
  }

  /**
   * Обрабатывает отправку формы.
   * @param {Event} event - Событие отправки формы
   */
  async handleFormSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const { user, todo } = Object.fromEntries(formData);
    const trimmedTodo = todo.trim();

    if (!trimmedTodo || !user) {
      this.utils.showToast('Please fill in all fields');
      return;
    }

    await this.createTodoItem({
      userId: Number(user),
      title: trimmedTodo,
      completed: false,
    });

    event.target.reset();
  }

  /**
   * Создает новую задачу.
   * @param {Object} newItem - Новая задача
   */
  async createTodoItem(newItem) {
    try {
      const { data } = await axios.post(`${this.config.url}todos`, newItem);
      const createdTodo = { ...newItem, id: data.id };
      this.renderTodoItemUI(createdTodo);
      this.state.todosCollection.unshift(createdTodo);
      this.utils.showToast('Task successfully created');
    } catch (error) {
      this.utils.handleError('Error creating task', error);
    }
  }

  /**
   * Отображает новую задачу в UI.
   * @param {Object} param0 - Объект с данными задачи
   * @param {number} param0.id - ID задачи
   * @param {string} param0.title - Заголовок задачи
   * @param {number} param0.userId - ID пользователя
   */
  renderTodoItemUI({ id, title, userId }) {
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
      <span class='text-sm font-bold'>${this.getUserName(userId)}</span>
    </p>
    <button class='shrink-0' data-todo-delete='${id}'>${icons.x.toSvg()}</button>
  `;
    this.state.elements.list.prepend(todo);
  }

  /**
   * Обрабатывает изменение статуса задачи.
   * @param {Event} param0 - Объект события
   */
  async handleListChange({ target }) {
    if (!target.matches('[data-todo-checkbox]')) return;

    const todoItem = target.closest('li');
    const id = todoItem.dataset.todoId;
    const completed = target.checked;

    try {
      await this.updateTodoStatus(id, completed);
      this.updateLocalTodoStatus(id, completed);
      this.utils.showToast('Task status successfully updated');
    } catch (error) {
      this.utils.handleError('Error updating task status', error);
      target.checked = !completed;
    }
  }

  /**
   * Обновляет статус задачи на сервере.
   * @param {string} id - ID задачи
   * @param {boolean} completed - Статус выполнения
   */
  async updateTodoStatus(id, completed) {
    await axios.patch(`${this.config.url}todos/${id}`, { completed });
  }

  /**
   * Обновляет локальный статус задачи.
   * @param {string} id - ID задачи
   * @param {boolean} completed - Статус выполнения
   */
  updateLocalTodoStatus(id, completed) {
    const todoIndex = this.state.todosCollection.findIndex(todo => todo.id === Number(id));
    if (todoIndex !== -1) {
      this.state.todosCollection[todoIndex].completed = completed;
    }
  }

  /**
   * Обрабатывает клик по кнопке удаления задачи.
   * @param {Event} param0 - Объект события
   */
  async handleListClick({ target }) {
    if (!this.isValidDeleteAction(target)) return;

    const todoId = Number(target.dataset.todoDelete);

    try {
      await this.deleteTodoItem(todoId);
      this.updateTodoList(todoId);
      this.utils.showToast('Task successfully deleted');
    } catch (error) {
      this.utils.handleError('Error deleting task', error);
    }
  }

  /**
   * Проверяет, является ли действие удаления валидным.
   * @param {HTMLElement} target - Целевой элемент
   * @returns {boolean} Валидность действия удаления
   */
  isValidDeleteAction(target) {
    return target.matches('[data-todo-delete]') && confirm('Are you sure you want to delete?');
  }

  /**
   * Удаляет задачу на сервере.
   * @param {number} todoId - ID задачи
   */
  async deleteTodoItem(todoId) {
    const { status } = await axios.delete(`${this.config.url}todos/${todoId}`);
    if (status !== 200) {
      throw new Error('Failed to delete todo item');
    }
  }

  /**
   * Обновляет локальный список задач после удаления.
   * @param {number} todoId - ID удаленной задачи
   */
  updateTodoList(todoId) {
    this.state.todosCollection = this.state.todosCollection.filter(({ id }) => id !== todoId);
    this.renderTodosUI(this.state.todosCollection);
  }
}

new TodoList();
