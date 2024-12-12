/**
 * Этот модуль реализует функциональность Todo-листа.
 * Он позволяет пользователям добавлять, удалять, редактировать и фильтровать задачи,
 * а также отмечать их как выполненные. Данные сохраняются в локальном хранилище браузера.
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import { icons } from 'feather-icons';
import { v4 as uuidv4 } from 'uuid';

/** Интерфейс для конфигурации приложения */
interface Config {
  root: string;
  selectors: {
    [key: string]: string;
  };
}

/** Интерфейс для состояния приложения */
interface State {
  elements: {
    [key: string]: HTMLElement | null;
  };
  todosCollection: Todo[];
}

/** Интерфейс для отдельной задачи */
interface Todo {
  id: string;
  label: string;
  complete: boolean;
}

/** Интерфейс для конфигурации уведомлений */
interface ToastConfig {
  className: string;
  duration: number;
  gravity: string;
  position: string;
}

/** Интерфейс для вспомогательных функций */
interface Utils {
  renderDataAttributes: (element: string) => string;
  toastConfig: ToastConfig;
  showToast: (message: string) => void;
}

class TodoList {
  private readonly config: Config;
  private state: State;
  private readonly utils: Utils;

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
      showToast: (message) => {
        // @ts-ignore
        Toastify({
          text: message,
          ...this.utils.toastConfig,
        }).showToast();
      },
    };

    this.init();
  }

  /**
   * Создает HTML-разметку приложения
   */
  private createAppHTML(): void {
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
   * Инициализирует DOM-элементы
   */
  private initDOMElements(): void {
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
   * Инициализирует приложение
   */
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();
    this.displayLocalStorageData();
    this.state.elements.todoForm?.addEventListener('submit', this.handleTodoFormSubmit.bind(this));
    this.state.elements.todoList?.addEventListener('click', this.handleTodoListDelete.bind(this));
    this.state.elements.todoList?.addEventListener('change', this.handleTodoListChange.bind(this));
    this.state.elements.todoList?.addEventListener('dblclick', this.handleTodoListUpdate.bind(this));
    this.state.elements.filterInput?.addEventListener('input', this.handleFilterInputChange.bind(this));
    this.state.elements.clearCompleted?.addEventListener('click', this.handleClearCompletedClick.bind(this));
  }

  /**
   * Отображает данные из локального хранилища
   */
  private displayLocalStorageData(): void {
    this.state.todosCollection = this.getLocalStorageData();
    this.renderTodosUI(this.state.todosCollection);
  }

  /**
   * Получает данные из локального хранилища
   * @returns {Todo[]} Массив задач
   */
  private getLocalStorageData(): Todo[] {
    const storedData = localStorage.getItem('todos');
    return storedData ? JSON.parse(storedData) : [];
  }

  /**
   * Сохраняет данные в локальное хранилище
   */
  private setLocalStorageData(): void {
    localStorage.setItem('todos', JSON.stringify(this.state.todosCollection));
  }

  /**
   * Отрисовывает UI задач
   * @param {Todo[]} todosCollection - Массив задач
   */
  private renderTodosUI(todosCollection: Todo[]): void {
    const isTodosEmpty = todosCollection.length === 0;
    const incompleteTodosCount = todosCollection.filter((todo) => !todo.complete).length;
    const hasCompletedTodos = todosCollection.some((todo) => todo.complete);

    this.updateElementVisibility(isTodosEmpty, incompleteTodosCount, hasCompletedTodos);
    if (this.state.elements.todoList) {
      this.state.elements.todoList.innerHTML = todosCollection.map(this.createTodoItemHTML).join('');
    }
  }

  /**
   * Обновляет видимость элементов UI
   * @param {boolean} isTodosEmpty - Флаг пустого списка задач
   * @param {number} incompleteTodosCount - Количество незавершенных задач
   * @param {boolean} hasCompletedTodos - Флаг наличия завершенных задач
   */
  private updateElementVisibility(isTodosEmpty: boolean, incompleteTodosCount: number, hasCompletedTodos: boolean): void {
    if (this.state.elements.todoContainer instanceof HTMLElement) {
      this.state.elements.todoContainer.className = isTodosEmpty ? 'content hidden' : 'content grid gap-3';
    }
    if (this.state.elements.filterInput instanceof HTMLElement) {
      this.state.elements.filterInput.style.display = !isTodosEmpty && this.state.todosCollection.length === 1 ? 'none' : 'block';
    }
    if (this.state.elements.todoCount instanceof HTMLElement) {
      this.state.elements.todoCount.innerText = incompleteTodosCount.toString();
    }
    if (this.state.elements.clearCompleted instanceof HTMLElement) {
      this.state.elements.clearCompleted.className = hasCompletedTodos ? 'px-3 py-2 border hover:bg-slate-50' : 'hidden';
    }
  }

  /**
   * Создает HTML для отдельной задачи
   * @param {Todo} todo - Объект задачи
   * @returns {string} HTML-разметка задачи
   */
  private createTodoItemHTML({ complete, label, id }: Todo): string {
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
   * Обработчик отправки формы добавления задачи
   * @param {Event} event - Событие отправки формы
   */
  private handleTodoFormSubmit(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const todoInput = form.elements.namedItem('todo') as HTMLInputElement;
    const label = todoInput.value.trim();

    if (!label || label.length === 0) {
      this.utils.showToast('Please enter a valid task name');
      return;
    }

    this.state.todosCollection = [...this.state.todosCollection, { label, complete: false, id: uuidv4() }];
    this.updateTodosAndRender();
    form.reset();
  }

  /**
   * Обновляет задачи и перерисовывает UI
   */
  private updateTodosAndRender(): void {
    this.setLocalStorageData();
    this.renderTodosUI(this.state.todosCollection);
  }

  /**
   * Обработчик удаления задачи
   * @param {MouseEvent} event - Событие клика
   */
  private handleTodoListDelete(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const id = target.dataset.todoDelete;
    if (!id || !confirm('Are you sure you want to delete this task?')) return;

    this.state.todosCollection = this.state.todosCollection.filter(todo => todo.id !== id);
    this.updateTodosAndRender();
  }

  /**
   * Обрабатывает изменение состояния задачи (выполнена/не выполнена)
   * @param {Event} event - Событие изменения состояния чекбокса
   */
  private handleTodoListChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const id = target.dataset.todoCheckbox;
    const checked = target.checked;

    if (id) {
      this.state.todosCollection = this.state.todosCollection.map((todo) =>
        todo.id === id ? { ...todo, complete: checked } : todo,
      );

      this.updateTodosAndRender();
    }
  }

  /**
   * Обрабатывает двойной клик по задаче для её редактирования
   * @param {Event} event - Событие двойного клика
   */
  private handleTodoListUpdate(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.matches('[data-todo-label]')) return;

    const todoId = target.dataset.todoLabel;
    if (!todoId) return;

    const todo = this.state.todosCollection.find((todo) => todo.id === todoId);
    if (!todo) return;

    this.createAndSetupEditInput(target, todo);
  }

  /**
   * Создает и настраивает поле ввода для редактирования задачи
   * @param {HTMLElement} target - Элемент, по которому был произведен двойной клик
   * @param {Todo} todo - Объект задачи
   */
  private createAndSetupEditInput(target: HTMLElement, todo: Todo): void {
    const input = this.createEditInput(todo.label);
    target.after(input);
    target.classList.add('hidden');

    input.addEventListener('change', (event: Event) =>
      this.handleEditInputChange(event, todo.id, target, input, todo.label),
    );
    input.addEventListener('blur', () => this.finishEditing(target, input));
    input.focus();
  }

  /**
   * Создает поле ввода для редактирования задачи
   * @param {string} value - Текущее значение задачи
   * @returns {HTMLInputElement} Созданное поле ввода
   */
  private createEditInput(value: string): HTMLInputElement {
    const input = document.createElement('input');
    input.classList.add('w-full');
    input.type = 'text';
    input.value = value;
    return input;
  }

  /**
   * Обрабатывает изменение текста задачи
   * @param {Event} event - Событие изменения
   * @param {string} todoId - Идентификатор задачи
   * @param {HTMLElement} target - Целевой элемент
   * @param {HTMLInputElement} input - Поле ввода
   * @param {string} originalLabel - Исходный текст задачи
   */
  private handleEditInputChange(event: Event, todoId: string, target: HTMLElement, input: HTMLInputElement, originalLabel: string): void {
    event.stopPropagation();
    const newLabel = (event.target as HTMLInputElement).value.trim();

    if (newLabel !== originalLabel && newLabel !== '') {
      this.updateTodoLabel(todoId, newLabel);
    } else {
      target.textContent = originalLabel;
    }

    this.finishEditing(target, input);
  }

  /**
   * Завершает редактирование задачи
   * @param {HTMLElement} target - Целевой элемент
   * @param {HTMLInputElement} input - Поле ввода
   */
  private finishEditing(target: HTMLElement, input: HTMLInputElement): void {
    target.classList.remove('hidden');
    input.remove();
  }

  /**
   * Обновляет текст задачи
   * @param {string} todoId - Идентификатор задачи
   * @param {string} newLabel - Новый текст задачи
   */
  private updateTodoLabel(todoId: string, newLabel: string): void {
    this.state.todosCollection = this.state.todosCollection.map((todo) =>
      todo.id === todoId ? { ...todo, label: newLabel } : todo,
    );
    this.updateTodosAndRender();
  }

  /**
   * Обрабатывает изменение в поле фильтрации задач
   * @param {Event} event - Событие изменения
   */
  private handleFilterInputChange(event: Event): void {
    const { value } = event.target as HTMLInputElement;
    const todos = Array.from(this.state.elements.todoList?.querySelectorAll('li') || []);
    const filterInput = value.trim().toLowerCase();

    todos.forEach((todo) => {
      const labelElement = todo.querySelector('[data-todo-label]');
      if (labelElement) {
        const labelText = labelElement.textContent?.toLowerCase() || '';
        todo.style.display = labelText.includes(filterInput) ? 'flex' : 'none';
      }
    });
  }

  /**
   * Обрабатывает клик по кнопке очистки завершенных задач
   */
  private handleClearCompletedClick(): void {
    const completedCount = this.state.todosCollection.filter(({ complete }) => complete).length;

    if (completedCount === 0 || !confirm(`Delete ${completedCount} completed item${completedCount !== 1 ? 's' : ''}?`)) return;

    this.state.todosCollection = this.state.todosCollection.filter(({ complete }) => !complete);
    this.updateTodosAndRender();
  }
}

new TodoList();
