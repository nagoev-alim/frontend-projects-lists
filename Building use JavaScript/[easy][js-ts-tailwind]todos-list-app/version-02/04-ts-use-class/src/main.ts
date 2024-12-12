import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';
import { icons } from 'feather-icons';

/**
 * Приложение TodoList
 * 
 * Это приложение представляет собой список задач с возможностью добавления, удаления и изменения статуса задач.
 * Оно использует внешний API для получения и обновления данных о задачах и пользователях.
 * Основные функции включают:
 * - Отображение списка задач
 * - Добавление новых задач
 * - Удаление задач
 * - Изменение статуса выполнения задачи
 * - Отображение пользователей, связанных с задачами
 */

/**
 * Интерфейс, описывающий структуру задачи
 */
interface TodoItem {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

/**
 * Интерфейс, описывающий структуру пользователя
 */
interface User {
  id: number;
  name: string;
}

/**
 * Интерфейс, описывающий конфигурацию приложения
 */
interface Config {
  root: string;
  selectors: {
    form: string;
    select: string;
    list: string;
  };
  url: string;
}

/**
 * Интерфейс, описывающий состояние приложения
 */
interface State {
  elements: {
    form: HTMLFormElement | null;
    select: HTMLSelectElement | null;
    list: HTMLUListElement | null;
  };
  todosCollection: TodoItem[];
  usersCollection: User[];
  userNameCache: Map<number, string>;
}

/**
 * Интерфейс, описывающий вспомогательные утилиты
 */
interface Utils {
  renderDataAttributes: (element: string) => string;
  toastConfig: {
    className: string;
    duration: number;
    gravity: string;
    position: string;
  };
  showToast: (message: string) => void;
  handleError: (message: string, error?: unknown) => void;
}

class TodoList {
  private readonly config: Config;
  private readonly state: State;
  private readonly utils: Utils;

  /**
   * Конструктор класса TodoList
   * Инициализирует конфигурацию, состояние и утилиты приложения
   */
  constructor() {
    this.config = {
      root: '#app',
      selectors: {
        form: '[data-todo-form]',
        select: '[data-todo-select]',
        list: '[data-todo-list]',
      },
      url: 'https://jsonplaceholder.typicode.com/',
    };

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

    this.utils = {
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
          ...this.utils.toastConfig,
        }).showToast();
      },
      handleError: (message: string, error: unknown = null): void => {
        this.utils.showToast(message);
        if (error) console.error(message, error);
      },
    };

    this.init();
  }

  /**
   * Создает HTML структуру приложения
   */
  private createAppHTML(): void {
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
   * Инициализирует DOM элементы
   */
  private initDOMElements(): void {
    this.state.elements = {
      form: document.querySelector<HTMLFormElement>(this.config.selectors.form),
      select: document.querySelector<HTMLSelectElement>(this.config.selectors.select),
      list: document.querySelector<HTMLUListElement>(this.config.selectors.list),
    };
  }

  /**
   * Инициализирует приложение
   */
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();
    (async () => {
      await this.getTodos();
      this.state.elements.form?.addEventListener('submit', this.handleFormSubmit.bind(this));
      this.state.elements.list?.addEventListener('click', (event: Event) => {
        const target = event.target as HTMLElement;
        if (target.matches('[data-todo-delete]')) {
          this.handleListClick(event);
        } else if (target.matches('[data-todo-checkbox]')) {
          this.handleListChange(event);
        }
      });
    })();
  }

  /**
   * Получает задачи и пользователей с сервера
   */
  private async getTodos(): Promise<void> {
    try {
      const [{ data: todos }, { data: users }] = await Promise.all([
        axios.get<TodoItem[]>(`${this.config.url}todos`, { params: { _limit: 15 } }),
        axios.get<User[]>(`${this.config.url}users`),
      ]);

      Object.assign(this.state, { todosCollection: todos, usersCollection: users });

      this.renderTodosUI(todos);
      this.renderUsersUI(users);

    } catch (error) {
      this.utils.handleError('Error fetching tasks or users', error);
    }
  }

  /**
   * Получает имя пользователя по его ID
   * @param id - ID пользователя
   * @returns Имя пользователя
   */
  private getUserName(id: number): string {
    if (!this.state.userNameCache.has(id)) {
      const user = this.state.usersCollection.find(user => user.id === id);
      if (user) {
        this.state.userNameCache.set(id, user.name);
      } else {
        return 'Unknown user';
      }
    }
    return this.state.userNameCache.get(id) || 'Unknown user';
  }

  /**
   * Отрисовывает UI для задач
   * @param todosCollection - Коллекция задач
   */
  private renderTodosUI(todosCollection: TodoItem[]): void {
    if (this.state.elements.list) {
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
  }

  /**
   * Отрисовывает UI для пользователей
   * @param usersCollection - Коллекция пользователей
   */
  private renderUsersUI(usersCollection: User[]): void {
    if (this.state.elements.select) {
      const options = usersCollection.map(({ id, name }) => `<option value='${id}'>${name}</option>`).join('');
      this.state.elements.select.innerHTML = `
      <option disabled selected>Select user</option>
      ${options}
    `;
    }
  }

  /**
   * Обрабатывает отправку формы
   * @param event - Событие отправки формы
   */
  private async handleFormSubmit(event: Event): Promise<void> {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const user = formData.get('user') as string;
    const todo = formData.get('todo') as string;
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

    form.reset();
  }

  /**
   * Создает новую задачу
   * @param newItem - Новая задача
   */
  private async createTodoItem(newItem: Omit<TodoItem, 'id'>): Promise<void> {
    try {
      const { data } = await axios.post<TodoItem>(`${this.config.url}todos`, newItem);
      const createdTodo: TodoItem = { ...newItem, id: data.id };
      this.renderTodoItemUI(createdTodo);
      this.state.todosCollection.unshift(createdTodo);
      this.utils.showToast('Task successfully created');
    } catch (error) {
      this.utils.handleError('Error creating task', error);
    }
  }

  /**
   * Отрисовывает UI для отдельной задачи
   * @param param0 - Объект задачи
   */
  private renderTodoItemUI({ id, title, userId }: TodoItem): void {
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
    this.state.elements.list?.prepend(todo);
  }
  /**
   * Обрабатывает изменение статуса задачи (выполнено/не выполнено)
   * @param {Event} event - Событие изменения чекбокса
   * @returns {Promise<void>}
   */
  private async handleListChange(event: Event): Promise<void> {
    const target = event.target as HTMLInputElement;
    if (!target.matches('[data-todo-checkbox]')) return;

    const todoItem = target.closest('li');
    if (!todoItem) return;

    const id = todoItem.dataset.todoId;
    if (!id) return;

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
   * Отправляет запрос на обновление статуса задачи на сервере
   * @param {string} id - Идентификатор задачи
   * @param {boolean} completed - Новый статус задачи
   * @returns {Promise<void>}
   */
  private async updateTodoStatus(id: string, completed: boolean): Promise<void> {
    await axios.patch(`${this.config.url}todos/${id}`, { completed });
  }

  /**
   * Обновляет статус задачи в локальной коллекции
   * @param {string} id - Идентификатор задачи
   * @param {boolean} completed - Новый статус задачи
   */
  private updateLocalTodoStatus(id: string, completed: boolean): void {
    const todoIndex = this.state.todosCollection.findIndex(todo => todo.id === Number(id));
    if (todoIndex !== -1) {
      this.state.todosCollection[todoIndex].completed = completed;
    }
  }

  /**
   * Обрабатывает клик по кнопке удаления задачи
   * @param {Event} event - Событие клика
   * @returns {Promise<void>}
   */
  private async handleListClick(event: Event): Promise<void> {
    const target = event.target as HTMLElement;
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
   * Проверяет, является ли действие удаления допустимым
   * @param {HTMLElement} target - Целевой элемент клика
   * @returns {boolean} - true, если действие допустимо, иначе false
   */
  private isValidDeleteAction(target: HTMLElement): boolean {
    return target.matches('[data-todo-delete]') && confirm('Are you sure you want to delete?');
  }

  /**
   * Отправляет запрос на удаление задачи на сервере
   * @param {number} todoId - Идентификатор задачи
   * @returns {Promise<void>}
   * @throws {Error} - Если удаление не удалось
   */
  private async deleteTodoItem(todoId: number): Promise<void> {
    const { status } = await axios.delete(`${this.config.url}todos/${todoId}`);
    if (status !== 200) {
      throw new Error('Failed to delete todo item');
    }
  }

  /**
   * Обновляет локальный список задач после удаления
   * @param {number} todoId - Идентификатор удаленной задачи
   */
  private updateTodoList(todoId: number): void {
    this.state.todosCollection = this.state.todosCollection.filter(({ id }) => id !== todoId);
    this.renderTodosUI(this.state.todosCollection);
  }
}

new TodoList();
