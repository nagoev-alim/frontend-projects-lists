import React, { useCallback, useState } from 'react';
import { getRandomNumber } from '@utils';
import { MdInfo } from 'react-icons/md';
import { Button } from '@ui';

// Константы
const WINNING_SCORE = 100;
const INITIAL_SCORES = [0, 0];
const PLAYERS = [0, 1];

/**
 * Корневой компонент игры в кости.
 * @returns {JSX.Element} Возвращает JSX разметку игры.
 */
const Root = () => {
  // Состояния игры
  const [scores, setScores] = useState(INITIAL_SCORES);
  const [currentScore, setCurrentScore] = useState(0);
  const [activePlayer, setActivePlayer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [diceValue, setDiceValue] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);

  /**
   * Возвращает строку стилей для контейнера игрока.
   * @param {number} player - Индекс игрока (0 или 1).
   * @returns {string} Строка классов CSS для стилизации контейнера игрока.
   */
  const getPlayerContainerStyle = (player) => `
    min-h-[300px] border-4 rounded-md p-4 flex flex-col text-center transition-all
    ${activePlayer === player ? 'border-red-500' : ''}
    ${!isPlaying && activePlayer === player ? 'border-green-500' : ''}
  `;

  /**
   * Возвращает строку стилей для текущего счета игрока.
   * @param {number} player - Индекс игрока (0 или 1).
   * @returns {string} Строка классов CSS для стилизации текущего счета.
   */
  const getCurrentScoreStyle = (player) => `
    border-4 rounded-md grid place-items-center transition-all p-3
    ${activePlayer === player ? 'border-red-500' : ''}
    ${!isPlaying && activePlayer === player ? 'border-green-500' : ''}
  `;

  /**
   * Инициализирует новую игру, сбрасывая все состояния к начальным значениям.
   */
  const initGame = () => {
    setScores(INITIAL_SCORES);
    setCurrentScore(0);
    setActivePlayer(0);
    setIsPlaying(true);
    setDiceValue(null);
  };

  /**
   * Обрабатывает бросок кости.
   * Если выпадает 1, ход переходит к другому игроку.
   * В противном случае, текущий счет увеличивается на выпавшее значение.
   */
  const handleRollDiceClick = useCallback(() => {
    if (!isPlaying) return;

    const dice = getRandomNumber(1, 6);
    setDiceValue(dice);

    if (dice !== 1) {
      setCurrentScore(prev => prev + dice);
    } else {
      switchPlayer();
    }
  }, [isPlaying]);

  /**
   * Переключает активного игрока и сбрасывает текущий счет.
   */
  const switchPlayer = () => {
    setCurrentScore(0);
    setActivePlayer(prev => 1 - prev);
  };

  /**
   * Обрабатывает нажатие кнопки "Hold".
   * Добавляет текущий счет к общему счету игрока и проверяет условие победы.
   */
  const handleHoldClick = useCallback(() => {
    if (!isPlaying) return;

    setScores(prev => {
      const newScores = [...prev];
      newScores[activePlayer] += currentScore;
      return newScores;
    });

    if (scores[activePlayer] + currentScore >= WINNING_SCORE) {
      setIsPlaying(false);
    } else {
      switchPlayer();
    }
  }, [isPlaying, activePlayer, currentScore, scores]);

  /**
   * Переключает отображение оверлея с правилами игры.
   */
  const toggleOverlay = () => setShowOverlay(prev => !prev);

  return (
    <div className="max-w-2xl w-full bg-white p-4 rounded-md">
      <h1 className="text-center font-bold text-3xl">Roll Dice</h1>
      <div className="grid gap-4 sm:grid-cols-3 md:max-w-4xl">
        {PLAYERS.map(player => (
          <div key={player} className={getPlayerContainerStyle(player)}>
            <h3 className="font-bold text-2xl uppercase mb-2">Player {player + 1}</h3>
            <p className="font-bold text-4xl mb-auto">{scores[player]}</p>
            <div className={getCurrentScoreStyle(player)}>
              <p className="font-bold uppercase">Current</p>
              <p className="font-bold text-4xl">{activePlayer === player ? currentScore : 0}</p>
            </div>
          </div>
        ))}
        <div className="grid place-items-start gap-2 sm:col-start-2 sm:col-end-3 sm:row-start-1 sm:row-end-2">
          {diceValue && <img alt="Playing dice" className="border-4 rounded-md max-w-sm mx-auto w-full"
                             src={`dice-${diceValue}.png`} />}
          <div className="grid gap-2 place-items-baseline w-full mt-auto">
            <Button onClick={initGame} fullWidth={true}>New game</Button>
            <Button variant="danger" fullWidth={true} onClick={handleRollDiceClick}>Roll dice</Button>
            <Button variant="secondary" fullWidth={true} onClick={handleHoldClick}>Hold</Button>
            <Button onClick={toggleOverlay} variant="outline" className="inline-flex max-w-max mx-auto justify-center">
              <MdInfo size={25} className="text-blue-500" />
            </Button>
          </div>
        </div>
        {showOverlay && (
          <div className="sm:col-span-3">
            <h4 className="font-bold text-lg">Game Rules</h4>
            <p>On a turn, a player rolls the die repeatedly. The goal is to accumulate as many points as possible,
              adding
              up the numbers rolled on the die. However, if a player rolls a 1, the player's turn is over and any points
              they have accumulated during this turn are forfeited. Rolling a 1 doesn't wipe out your entire score from
              previous turns, just the total earned during that particular roll.</p>
            <p>A player can also choose to hold (stop rolling the die) if they do not want to take a chance of rolling a
              1
              and losing all of their points from this turn. If the player chooses to hold, all of the points rolled
              during that turn are added to his or her score.</p>
            <p>When a player reaches a total of 100 or more points, the game ends and that player is the winner.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Root;
