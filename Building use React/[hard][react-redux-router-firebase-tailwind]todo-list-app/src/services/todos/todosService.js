/**
 * @module todosService
 * @description Модуль, предоставляющий сервис для работы с задачами (todos) в Firebase Firestore.
 * Включает в себя функции для создания, чтения, обновления, переключения статуса и удаления задач.
 */
import { db } from '../../firebase/firebaseConfig';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  getDocs,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';

/**
 * @type {Object} TodoService - Сервис для работы с задачами
 * @property {Function} create - Создает новую задачу
 * @property {Function} read - Читает все задачи пользователя
 * @property {Function} update - Обновляет существующую задачу
 * @property {Function} toggle - Переключает статус выполнения задачи
 * @property {Function} delete - Удаляет задачу
 */
const todosService = {
  /**
   * Создает новую задачу для пользователя
   * @param {Object} params - Параметры для создания задачи
   * @param {string} params.userId - ID пользователя
   * @param {string} params.text - Текст задачи
   * @param {string} params.description - Описание задачи
   * @param {string} params.priority - Приоритет задачи
   * @returns {Promise<Object>} Созданная задача с ID и временными метками
   * @throws {Error} Ошибка при создании задачи
   */
  create: async ({ userId, text, description, priority }) => {
    try {
      // Создаем ссылку на коллекцию todos для конкретного пользователя
      const todosCollectionRef = collection(db, 'users', userId, 'todos');

      // Формируем объект с данными новой задачи
      const newTodoData = {
        text,
        priority,
        description,
        completed: false,
        createdAt: serverTimestamp(), // Используем серверную метку времени для создания
        updatedAt: serverTimestamp(), // Изначально время обновления совпадает со временем создания
      };

      // Добавляем новую задачу в коллекцию и получаем ссылку на созданный документ
      const newTodoRef = await addDoc(todosCollectionRef, newTodoData);
      const newTodoId = newTodoRef.id; // Получаем ID созданной задачи

      // Возвращаем объект с данными созданной задачи
      return {
        id: newTodoId,
        ...newTodoData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error creating todo:', error);
      throw error;
    }
  },
  /**
   * Читает все задачи пользователя
   * @param {Object} params - Параметры для чтения задач
   * @param {string} params.userId - ID пользователя
   * @returns {Promise<Array>} Массив задач пользователя
   * @throws {Error} Ошибка при получении задач
   */
  read: async ({ userId }) => {
    try {
      // Создаем ссылку на коллекцию todos для конкретного пользователя
      const todosCollectionRef = collection(db, 'users', userId, 'todos');

      // Формируем запрос, сортируя задачи по времени создания в убывающем порядке
      const q = query(todosCollectionRef, orderBy('createdAt', 'desc'));

      // Выполняем запрос и получаем снимок данных
      const querySnapshot = await getDocs(q);

      // Преобразуем полученные документы в массив объектов задач
      return querySnapshot.docs.map(doc => ({
        id: doc.id, // Извлекаем ID документа
        ...doc.data(), // Разворачиваем все поля документа
        // Преобразуем серверные метки времени в строки ISO
        // Используем опциональную цепочку (?.) для безопасного доступа к свойствам
        createdAt: doc.data().createdAt?.toDate().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate().toISOString(),
      }));
    } catch (error) {
      console.error('Error fetching todos:', error);
      throw error;
    }
  },
  /**
   * Обновляет существующую задачу
   * @param {Object} params - Параметры для обновления задачи
   * @param {string} params.userId - ID пользователя
   * @param {string} params.id - ID задачи
   * @param {string} [params.text] - Новый текст задачи
   * @param {boolean} [params.completed] - Новый статус выполнения
   * @param {string} [params.priority] - Новый приоритет задачи
   * @param {string} [params.description] - Новое описание задачи
   * @returns {Promise<Object>} Обновленная задача
   * @throws {Error} Ошибка при обновлении задачи
   */
  update: async ({ userId, id, text, completed, priority, description }) => {
    try {
      // Создаем ссылку на документ задачи в Firestore
      const todoDocRef = doc(db, 'users', userId, 'todos', id);

      // Формируем объект с данными для обновления
      const updateData = {
        // Обновляем временную метку последнего изменения
        updatedAt: serverTimestamp(),
        // Используем оператор расширения для условного добавления полей
        // Поле добавляется только если соответствующий параметр не undefined
        ...(text !== undefined && { text }),
        ...(completed !== undefined && { completed }),
        ...(priority !== undefined && { priority }),
        ...(description !== undefined && { description }),
      };

      // Выполняем обновление документа в Firestore
      await updateDoc(todoDocRef, updateData);

      // Возвращаем объект с обновленными данными
      return {
        id, // ID задачи остается неизменным
        ...updateData, // Разворачиваем все обновленные поля
        // Преобразуем серверную метку времени в строку ISO
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error updating todo:', error);
      throw error;
    }
  },
  /**
   * Переключает статус выполнения задачи
   * @param {Object} params - Параметры для переключения статуса задачи
   * @param {string} params.userId - ID пользователя
   * @param {string} params.id - ID задачи
   * @returns {Promise<Object>} Обновленная задача с новым статусом выполнения
   * @throws {Error} Ошибка при переключении статуса задачи или если задача не найдена
   */
  toggle: async ({ userId, id }) => {
    try {
      // Создаем ссылку на документ задачи в Firestore
      const todoDocRef = doc(db, 'users', userId, 'todos', id);

      // Получаем текущее состояние задачи
      const currentTodo = await getDoc(todoDocRef);

      // Проверяем, существует ли задача
      if (!currentTodo.exists()) {
        throw new Error('Todo not found');
      }

      // Инвертируем текущий статус выполнения задачи
      const newCompletedStatus = !currentTodo.data().completed;

      // Формируем объект с обновленными данными
      const updateData = {
        completed: newCompletedStatus,
        updatedAt: serverTimestamp(), // Обновляем временную метку
      };

      // Обновляем документ в Firestore
      await updateDoc(todoDocRef, updateData);

      // Возвращаем объект с обновленными данными
      return {
        id, // ID задачи
        ...updateData, // Разворачиваем обновленные данные
        updatedAt: new Date().toISOString(), // Преобразуем серверную метку времени в строку ISO
      };
    } catch (error) {
      console.error('Error toggling todo:', error);
      throw error;
    }
  },
  /**
   * Удаляет задачу
   * @param {Object} params - Параметры для удаления задачи
   * @param {string} params.userId - ID пользователя
   * @param {string} params.id - ID задачи
   * @returns {Promise<Object>} Объект с ID удаленной задачи
   * @throws {Error} Ошибка при удалении задачи
   */
  delete: async ({ userId, id }) => {
    try {
      // Создаем ссылку на документ задачи в Firestore
      const todoDocRef = doc(db, 'users', userId, 'todos', id);

      // Удаляем документ задачи из Firestore
      await deleteDoc(todoDocRef);

      // Возвращаем объект с ID удаленной задачи
      return { id };
    } catch (error) {
      console.error('Error deleting todo:', error);
      throw error;
    }
  },
};

export default todosService;
