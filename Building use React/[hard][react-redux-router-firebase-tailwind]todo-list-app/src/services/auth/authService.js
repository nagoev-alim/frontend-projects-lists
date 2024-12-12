/**
 * @module authService
 * @description Модуль для управления аутентификацией пользователей с использованием Firebase.
 * Предоставляет функции для регистрации, входа и выхода пользователей.
 */

import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebaseConfig.js';

/**
 * @constant {Object} ERROR_MESSAGES
 * @description Объект, содержащий сообщения об ошибках для различных сценариев аутентификации.
 */
const ERROR_MESSAGES = {
  EMAIL_IN_USE: 'This email is already registered. Please use a different email or try logging in.',
  INVALID_EMAIL: 'The email address is not valid.',
  OPERATION_NOT_ALLOWED: 'Email/password accounts are not enabled. Please contact support.',
  WEAK_PASSWORD: 'The password is too weak. Please choose a stronger password.',
  GENERIC_REGISTER: 'Failed to register user',
  GENERIC_LOGIN: 'Failed to login user',
  GENERIC_LOGOUT: 'Failed to logout user',
};

/**
 * @constant {Object} ERROR_CODE_MAP
 * @description Объект, сопоставляющий коды ошибок Firebase с соответствующими сообщениями об ошибках.
 */
const ERROR_CODE_MAP = {
  'auth/email-already-in-use': ERROR_MESSAGES.EMAIL_IN_USE,
  'auth/invalid-email': ERROR_MESSAGES.INVALID_EMAIL,
  'auth/operation-not-allowed': ERROR_MESSAGES.OPERATION_NOT_ALLOWED,
  'auth/weak-password': ERROR_MESSAGES.WEAK_PASSWORD,
};

/**
 * @function handleAuthError
 * @description Обрабатывает ошибки аутентификации и выбрасывает соответствующее исключение.
 * @param {Error} error - Объект ошибки, полученный от Firebase.
 * @param {string} genericMessage - Общее сообщение об ошибке для использования, если конкретная ошибка не найдена.
 * @throws {Error} Выбрасывает ошибку с соответствующим сообщением.
 */
const handleAuthError = (error, genericMessage) => {
  console.error(`Error: ${genericMessage}`, error);
  const errorMessage = ERROR_CODE_MAP[error.code] || `${genericMessage}: ${error.message}`;
  throw new Error(errorMessage);
};

/**
 * @constant {Object} authService
 * @description Объект, предоставляющий методы для аутентификации пользователей.
 */
const authService = {
  /**
   * @function register
   * @description Регистрирует нового пользователя с помощью email и пароля.
   * @param {Object} params - Параметры для регистрации.
   * @param {string} params.email - Email пользователя.
   * @param {string} params.password - Пароль пользователя.
   * @returns {Promise<Object>} Объект с uid и email зарегистрированного пользователя.
   * @throws {Error} Выбрасывает ошибку, если регистрация не удалась.
   */
  register: async ({ email, password }) => {
    try {
      // Создаем нового пользователя с помощью Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;

      // Создаем документ пользователя в Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,  // Уникальный идентификатор пользователя
        email: user.email,  // Email пользователя
        createdAt: new Date().toISOString(),  // Дата и время создания аккаунта
      });

      // Возвращаем основную информацию о пользователе
      return { uid: user.uid, email: user.email };
    } catch (error) {
      handleAuthError(error, ERROR_MESSAGES.GENERIC_REGISTER);
    }
  },

  /**
   * @function login
   * @description Выполняет вход пользователя с помощью email и пароля.
   * @param {Object} params - Параметры для входа.
   * @param {string} params.email - Email пользователя.
   * @param {string} params.password - Пароль пользователя.
   * @returns {Promise<Object>} Объект с uid и email вошедшего пользователя.
   * @throws {Error} Выбрасывает ошибку, если вход не удался.
   */
  login: async ({ email, password }) => {
    try {
      // Попытка аутентификации пользователя с помощью Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Извлечение информации о пользователе из результата аутентификации
      const { user } = userCredential;

      // Возврат основной информации о пользователе (uid и email)
      return { uid: user.uid, email: user.email };
    } catch (error) {
      handleAuthError(error, ERROR_MESSAGES.GENERIC_LOGIN);
    }
  },

  /**
   * @function logout
   * @description Выполняет выход текущего пользователя из системы.
   * @throws {Error} Выбрасывает ошибку, если выход не удался.
   */
  logout: async () => {
    try {
      // Выполнение выхода пользователя из системы с использованием Firebase Authentication
      await signOut(auth);
    } catch (error) {
      handleAuthError(error, ERROR_MESSAGES.GENERIC_LOGOUT);
    }
  },
};

export default authService;
