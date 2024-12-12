import { createSelector, createSlice } from '@reduxjs/toolkit';
import { characters } from '@utils';

/**
 * @typedef {Object} PasswordOption
 * @property {string} id - Уникальный идентификатор опции
 * @property {string} label - Текстовое описание опции
 * @property {boolean} checked - Флаг, указывающий, выбрана ли опция
 */

/**
 * @typedef {Object} PasswordState
 * @property {string} password - Сгенерированный пароль
 * @property {string} strength - Сила пароля ('none', 'weak', 'medium', 'strong')
 * @property {PasswordOption[]} options - Массив опций для генерации пароля
 */

/** @type {PasswordState} */
const initialState = {
  password: '',
  strength: '',
  options: [
    { id: 'lowercase', label: 'Lowercase (a-z)', checked: true },
    { id: 'uppercase', label: 'Uppercase (A-Z)', checked: false },
    { id: 'numbers', label: 'Numbers (0-9)', checked: false },
    { id: 'symbols', label: 'Symbols (!-$^+)', checked: false },
  ],
};

/**
 * Создание slice для управления состоянием пароля
 */
const passwordSlice = createSlice({
  name: 'password',
  initialState,
  reducers: {
    /**
     * Переключение состояния опции генерации пароля
     * @param {PasswordState} state - Текущее состояние
     * @param {Object} action - Action с payload, содержащим id опции
     */
    optionToggle: (state, { payload }) => {
      state.options = state.options.map(option => option.id === payload ? {
        ...option,
        checked: !option.checked,
      } : option);
    },

    /**
     * Генерация нового пароля
     * @param {PasswordState} state - Текущее состояние
     * @param {Object} action - Action с payload, содержащим длину пароля
     */
    generatePassword: (state, { payload }) => {
      const selectedOptions = state.options.filter((option) => option.checked);
      if (selectedOptions.length === 0) {
        state.password = '';
        return;
      }
      state.password = Array.from({ length: payload }, () => {
        const randomOption = selectedOptions[Math.floor(Math.random() * selectedOptions.length)];
        return characters[randomOption.id].generate();
      }).join('');
    },

    /**
     * Оценка силы пароля
     * @param {PasswordState} state - Текущее состояние
     * @param {Object} action - Action с payload, содержащим пароль для оценки
     */
    passwordStrength: (state, { payload }) => {
      if (!payload) {
        state.strength = 'none';
        return;
      }

      const checks = {
        length: payload.length,
        hasLowercase: /[a-z]/.test(payload),
        hasUppercase: /[A-Z]/.test(payload),
        hasDigits: /\d/.test(payload),
        hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(payload),
      };

      // Вычисляем разнообразие символов в пароле
      const varietyScore = Object.values(checks).filter(Boolean).length - 1; // Исключаем length из подсчета

      let strength;
      if (checks.length < 8) {
        strength = 'weak';
      } else if (checks.length < 12) {
        strength = varietyScore >= 3 ? 'medium' : 'weak';
      } else {
        strength = varietyScore >= 3 ? 'strong' : 'medium';
      }
      state.strength = strength;
    },
  },
});

const passwordReducer = passwordSlice.reducer;

export const { optionToggle, generatePassword, passwordStrength } = passwordSlice.actions;

/**
 * Селектор для получения состояния пароля
 * @param {Object} state - Корневое состояние Redux
 * @returns {PasswordState} Состояние пароля
 */
const selectPassword = createSelector(
  [({ password }) => password],
  ({ password, strength, options }) => ({ password, strength, options }),
);

const passwordSelectors = {
  selectPassword,
};

export { passwordReducer, passwordSelectors };
