/**
 * @module MemoryMatchingGame
 * @description Этот модуль содержит компонент MemoryMatchingGame, реализующий игру "Мемори".
 */

import _ from 'lodash';
import { useEffect, useState, useCallback } from 'react';
import { Card, EndGameMessage, Header } from '../layout/index.js';

/**
 * Начальный набор карточек для игры
 * @constant {Array<Object>}
 */
const INITIAL_CARDS = [
  { id: 1, value: '🍎' }, { id: 2, value: '🍐' }, { id: 3, value: '🍋' },
  { id: 4, value: '🥝' }, { id: 5, value: '🍇' }, { id: 6, value: '🍉' },
];

/**
 * Компонент MemoryMatchingGame
 *
 * @function MemoryMatchingGame
 * @description Основной компонент игры "Мемори". Управляет состоянием игры, отображает карточки и обрабатывает действия пользователя.
 *
 * @returns {JSX.Element} Возвращает JSX элемент, представляющий игровое поле
 *
 *
 * @description
 * Компонент использует следующие хуки React:
 * - useState: для управления состоянием карточек, открытых и совпавших пар, количества ходов и окончания игры
 * - useEffect: для проверки совпадений и окончания игры
 * - useCallback: для оптимизации функций flipCard и handleRestart
 *
 * Структура данных:
 * - cards: массив объектов, представляющих карточки
 * - opened: массив индексов открытых карточек
 * - matched: массив идентификаторов совпавших карточек
 * - moves: число, представляющее количество сделанных ходов
 * - endGame: булево значение, указывающее на окончание игры
 *
 * Элементы пользовательского интерфейса:
 * - EndGameMessage: отображается при завершении игры
 * - Header: отображает количество ходов
 * - Card: представляет отдельную карточку в игре
 *
 * Оптимизация производительности:
 * - Использование useCallback для мемоизации функций flipCard и handleRestart
 * - Использование key при рендеринге списка карточек для оптимизации обновлений
 */
const MemoryMatchingGame = () => {
  const [cards, setCards] = useState(() => _.shuffle([...INITIAL_CARDS, ...INITIAL_CARDS]));
  const [opened, setOpened] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [endGame, setEndGame] = useState(false);

  /**
   * Функция для переворачивания карточки
   *
   * @function flipCard
   * @description Обрабатывает клик по карточке, переворачивая её, если это возможно.
   * Увеличивает счетчик ходов и добавляет индекс карточки в массив открытых карточек.
   *
   * @param {number} idx - Индекс карточки в массиве cards
   *
   * @returns {void}
   *
   * @description
   * Функция проверяет следующие условия перед выполнением:
   * - Карточка еще не открыта (не находится в массиве opened)
   * - Открыто менее двух карточек
   *
   * Если условия выполнены, функция:
   * 1. Увеличивает количество ходов на 1
   * 2. Добавляет индекс карточки в массив opened
   */
  const flipCard = useCallback((idx) => {
    if (opened.includes(idx) || opened.length === 2) return;
    setMoves(prevMoves => prevMoves + 1);
    setOpened(prevOpened => [...prevOpened, idx]);
  }, [opened]);

  /**
   * Функция для перезапуска игры
   *
   * @function handleRestart
   * @description Сбрасывает состояние игры к начальным значениям, подготавливая новую игровую сессию.
   *
   * @returns {void}
   *
   * @description
   * Функция выполняет следующие действия:
   * 1. Перемешивает карточки, создавая новый массив из дублированных INITIAL_CARDS
   * 2. Очищает массив открытых карточек
   * 3. Очищает массив совпавших карточек
   * 4. Сбрасывает количество ходов на 0
   * 5. Устанавливает флаг окончания игры в false
   */
  const handleRestart = useCallback(() => {
    setCards(_.shuffle([...INITIAL_CARDS, ...INITIAL_CARDS]));
    setOpened([]);
    setMatched([]);
    setMoves(0);
    setEndGame(false);
  }, []);

  /**
   * @description Эффект для проверки совпадения открытых карточек
   *
   * @effect
   * @listens opened, cards
   *
   * @description
   * Этот эффект срабатывает при изменении массивов `opened` или `cards`.
   * Он проверяет, открыты ли две карточки, и если да, то сравнивает их значения.
   * При совпадении, карточки добавляются в массив `matched`.
   * После проверки, открытые карточки закрываются через 800 мс.
   *
   * @returns {Function} Функция очистки, которая отменяет таймер закрытия карточек
   */
  useEffect(() => {
    if (opened.length !== 2) return;

    const [firstCard, secondCard] = opened.map(idx => cards[idx]);
    if (firstCard.value === secondCard.value) {
      setMatched(prevMatched => [...prevMatched, firstCard.id]);
    }

    const timer = setTimeout(() => setOpened([]), 800);
    return () => clearTimeout(timer);
  }, [opened, cards]);

  /**
   * @description Эффект для проверки завершения игры
   *
   * @effect
   * @listens matched
   *
   * @description
   * Этот эффект срабатывает при изменении массива `matched`.
   * Он проверяет, совпадает ли количество совпавших карточек с общим количеством уникальных карточек.
   * Если да, то игра считается завершенной, и устанавливается флаг `endGame`.
   */
  useEffect(() => {
    if (matched.length === INITIAL_CARDS.length) setEndGame(true);
  }, [matched]);

  return (
    <div className="bg-white border rounded p-4 max-w-4xl w-full grid gap-4">
      {endGame ?
        <EndGameMessage moves={moves} onRestart={handleRestart} /> :
        (
          <>
            <Header moves={moves} />
            <div className="grid grid-cols-4 gap-2 sm:gap-4 w-full">
              {cards.map((item, idx) => (
                <Card
                  key={idx}
                  item={item}
                  idx={idx}
                  isFlipped={opened.includes(idx) || matched.includes(item.id)}
                  onClick={() => flipCard(idx)}
                />
              ))}
            </div>
          </>
        )
      }
    </div>
  );
};

export default MemoryMatchingGame;
