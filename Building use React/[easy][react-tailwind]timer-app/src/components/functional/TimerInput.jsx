import { Input } from '@ui';

/**
 * Компонент ввода времени для таймера.
 * @param {Object} props - Свойства компонента.
 * @param {string} props.inputTime - Текущее значение ввода времени.
 * @param {Function} props.setInputTime - Функция для обновления значения ввода времени.
 * @param {Function} props.handleFormSubmit - Обработчик отправки формы.
 * @returns {JSX.Element} JSX элемент компонента ввода времени.
 */
function TimerInput({ inputTime, setInputTime, handleFormSubmit }) {
  return (
    <>
      <h1 className="text-center font-bold text-2xl">Timer</h1>
      <form onSubmit={handleFormSubmit}>
        <label aria-label="Enter number of minutes">
          <Input
            autoComplete="off"
            type="number"
            name="time"
            placeholder="Enter number of minutes:"
            fullWidth={true}
            value={inputTime}
            onChange={(event) => setInputTime(event.target.value)}
          />
        </label>
      </form>
    </>
  );
}

export default TimerInput;
