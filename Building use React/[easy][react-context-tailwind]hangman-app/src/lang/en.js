/**
 * @module LANG
 * @description Модуль, содержащий константы с текстовыми строками на английском языке для интерфейса приложения GitHub User Search.
 */
const LANG = {
  hangman: {
    title: 'Hangman',
    instruction: 'Find the hidden word - enter a letter',
    errorMessage: 'An error occurred. Please try again later.',
  },
  endGame: {
    winMessage: 'Congratulations! You won! 😃',
    loseMessage: 'Unfortunately you lost. 😕',
    revealWord: '...the word was:',
    playAgain: 'Play Again',
  },
  actions: {
    fetchBreweryFailed: 'Failed to fetch brewery. Please try again later.',
    occurred: 'An error occurred:',
  },
  wrongLetters: {
    title: 'Wrong letters:',
  },

};

export default LANG;
