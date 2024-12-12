/**
 * @typedef {Object} CharacterSet
 * @property {string} chars - Строка, содержащая все символы набора
 * @property {Function} generate - Функция, генерирующая случайный символ из набора
 */

/**
 * @type {Object.<string, CharacterSet>}
 * Объект, содержащий наборы символов для генерации пароля
 */
const characters = {
  lowercase: {
    chars: 'abcdefghijklmnopqrstuvwxyz',
    generate: () => {
      const randomIndex = Math.floor(Math.random() * 26);
      return 'abcdefghijklmnopqrstuvwxyz'[randomIndex];
    },
  },
  uppercase: {
    chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    generate: () => {
      const randomIndex = Math.floor(Math.random() * 26);
      return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[randomIndex];
    },
  },
  numbers: {
    chars: '0123456789',
    generate: () => {
      const randomIndex = Math.floor(Math.random() * 10);
      return '0123456789'[randomIndex];
    },
  },
  symbols: {
    chars: '!@#$%^&*(){}[]=<>,.',
    generate: () => {
      const randomIndex = Math.floor(Math.random() * 19);
      return '!@#$%^&*(){}[]=<>,.'[randomIndex];
    },
  },
};

export default characters;
