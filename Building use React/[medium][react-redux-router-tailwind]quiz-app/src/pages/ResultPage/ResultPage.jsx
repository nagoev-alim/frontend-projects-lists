import { resetQuiz } from '@features/quiz/quizSlice.js';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { quizSelectors } from '@features';
import { Button } from '@ui';

/**
 * Компонент страницы результатов квиза.
 * Отображает итоговый счет пользователя и предоставляет возможность начать новую игру.
 * @returns {JSX.Element} Возвращает JSX элемент страницы результатов
 */
const ResultPage = () => {
  const dispatch = useDispatch();
  // Получение данных о счете и вопросах из Redux store.
  const { score, questions } = useSelector(quizSelectors.selectQuizData);

  return (
    <div className="max-w-max mx-auto p-3 bg-white rounded-md grid gap-2 place-items-center">
      <h2 className="text-2xl font-bold">Quiz Completed 🎉</h2>
      {/* Отображение итогового счета */}
      <p>Your Score: {score} / {questions.length}</p>
      <Link to="/">
        {/* Кнопка для начала новой игры с одновременным сбросом состояния квиза */}
        <Button onClick={() => dispatch(resetQuiz())}>Start New Game</Button>
      </Link>
    </div>
  );
};

export default ResultPage;
