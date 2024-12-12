import { MdOutlinePause, MdPlayArrow } from 'react-icons/md';
import { addLeadingZero } from '@utils';
import { Button } from '@ui';

/**
 * Компонент отображения таймера.
 * @param {Object} props - Свойства компонента.
 * @param {number} props.minutes - Количество оставшихся минут.
 * @param {number} props.seconds - Количество оставшихся секунд.
 * @param {boolean} props.isRunning - Флаг, указывающий, запущен ли таймер.
 * @param {Function} props.handleControlButton - Обработчик нажатия кнопки управления (старт/пауза).
 * @param {Function} props.handleResetButton - Обработчик нажатия кнопки сброса.
 * @returns {JSX.Element} JSX элемент компонента отображения таймера.
 */
function TimerDisplay({ minutes, seconds, isRunning, handleControlButton, handleResetButton }) {
  return (
    <div className="grid gap-3 place-items-center">
      <div className="font-bold text-3xl md:text-6xl">
        <span>{addLeadingZero(minutes)}</span>:<span>{addLeadingZero(seconds)}</span>
      </div>
      <Button variant='secondary' onClick={handleControlButton}>
        {isRunning ? <MdOutlinePause /> : <MdPlayArrow />}
      </Button>
      <Button variant='secondary' onClick={handleResetButton}>
        Reset Timer
      </Button>
    </div>
  );
}

export default TimerDisplay;
