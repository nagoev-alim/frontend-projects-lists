/**
 * @fileoverview Компонент Root представляет собой интерактивные флэш-карточки для изучения React.
 * Пользователи могут кликать на карточки, чтобы переключаться между вопросом и ответом.
 */
import { useState } from 'react';

/**
 * @typedef {Object} FlashCard
 * @property {number} id - Уникальный идентификатор карточки
 * @property {string} question - Вопрос, отображаемый на карточке
 * @property {string} answer - Ответ на вопрос
 */
const FLASH_CARDS = [
  { id: 3457, question: 'What language is React based on?', answer: 'JavaScript' },
  { id: 7336, question: 'What are the building blocks of React apps?', answer: 'Components' },
  { id: 8832, question: 'What\'s the name of the syntax we use to describe a UI in React?', answer: 'JSX' },
  { id: 1297, question: 'How to pass data from parent to child components?', answer: 'Props' },
  { id: 9103, question: 'How to give components memory?', answer: 'useState hook' },
  {
    id: 2002,
    question: 'What do we call an input element that is completely synchronised with state?',
    answer: 'Controlled element',
  },
];


/**
 * @function Root
 * @description Компонент для отображения и взаимодействия с флэш-карточками.
 * @returns {JSX.Element} JSX элемент, представляющий интерфейс флэш-карточек.
 */
const Root = () => {
  // Состояние, хранящее ID выбранной карточки или null, если ни одна не выбрана.
  const [selectedId, setSelectedId] = useState(null);

  /**
   * @function handleCardClick
   * @description Обрабатывает клик по карточке, переключая ее состояние (выбрана/не выбрана).
   * @param {number} id - ID карточки, по которой был совершен клик.
   */
  const handleCardClick = (id) => {
    setSelectedId((prevId) => (prevId === id ? null : id));
  };

  return (
    <div className="max-w-5xl w-full p-3 grid gap-3">
      <h1 className="text-center font-bold text-4xl">Flash Cards</h1>
      <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {FLASH_CARDS.map(({ id, question, answer }) => (
          <li
            key={id}
            onClick={() => handleCardClick(id)}
            className={`cursor-pointer p-3 border-2 border-gray-500 rounded bg-white flex justify-center items-center text-center ${id === selectedId ? 'bg-green-100' : ''}`}
          >
            <p className="text-lg font-medium text-center">
              {id === selectedId ? answer : question}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Root;
