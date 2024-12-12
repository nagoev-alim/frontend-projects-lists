import { useEffect, useMemo } from 'react';
import { useHangmanContext } from '../../hooks/index';
import { Button } from '../ui/index';
import { LANG } from '../../lang/index';

/**
 * Компонент EndGame отображает сообщение о завершении игры и кнопку для перезапуска.
 * Он использует контекст игры "Виселица" для получения состояния игры и управления ею.
 *
 * @returns {JSX.Element|null} Возвращает JSX элемент с сообщением о завершении игры или null, если игра не завершена.
 */
const EndGame = () => {
  // Получаем необходимые данные и функции из контекста игры
  const { correctLetters, wrongLetters, word, handlePlayable, handleRestart } = useHangmanContext();

  /**
   * Проверяет, выиграна или проиграна игра.
   * @type {string|null}
   */
  const checkWin = useMemo(() => {
    if (!word) return null;
    const isWin = word.split('').every(letter => correctLetters.includes(letter));
    const isLose = wrongLetters.length === 6;
    return isWin ? 'win' : isLose ? 'lose' : null;
  }, [word, correctLetters, wrongLetters]);

  /**
   * Формирует финальное сообщение и определяет, можно ли продолжать игру.
   * @type {{finalMessage: string, finalMessageRevealWord: string, playable: boolean}}
   */
  const { finalMessage, finalMessageRevealWord, playable } = useMemo(() => {
    if (!checkWin) return { playable: true };

    if (checkWin === 'win') {
      return {
        finalMessage: LANG.endGame.winMessage,
        playable: false,
      };
    }

    if (checkWin === 'lose') {
      return {
        finalMessage: LANG.endGame.loseMessage,
        finalMessageRevealWord: LANG.endGame.revealWord,
        playable: false,
      };
    }

    return { playable: true };
  }, [checkWin]);

  // Обновляем состояние игры (можно играть или нет)
  useEffect(() => {
    handlePlayable(playable);
  }, [handlePlayable, playable]);

  // Если нет финального сообщения, не рендерим компонент
  if (!finalMessage) return null;

  // Рендерим сообщение о завершении игры и кнопку для перезапуска
  return (
    <div className="grid gap-1.5 text-lg">
      <h2 className="font-bold">{finalMessage}</h2>
      {finalMessageRevealWord && <p>{finalMessageRevealWord} <span className="font-bold text-red-500">{word}</span></p>}
      <Button onClick={handleRestart}>{LANG.endGame.playAgain}</Button>
    </div>
  );
};

export default EndGame;
