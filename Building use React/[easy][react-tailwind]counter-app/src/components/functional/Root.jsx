import { useState } from 'react';

/**
 * Приложение Root - простой счетчик с возможностью увеличения, уменьшения и сброса значения.
 * Использует React hooks для управления состоянием и компонент Button для создания кнопок управления.
 */

/**
 * Компонент кнопки с настраиваемыми стилями и обработчиком клика.
 * @param {Object} props - Свойства компонента.
 * @param {string} props.className - Дополнительные CSS классы для кнопки.
 * @param {React.ReactNode} props.children - Дочерние элементы кнопки.
 * @param {Function} props.onClick - Функция-обработчик клика по кнопке.
 * @returns {JSX.Element} Кнопка с заданными свойствами.
 */
function Button({ className, children, onClick }) {
  return (
    <button className={`border-4 rounded-md p-2 font-bold ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}


/**
 * Основной компонент счетчика.
 * @returns {JSX.Element} Компонент счетчика с кнопками управления.
 */
function Root() {
  /**
   * Состояние счетчика.
   * @type {[number, Function]}
   */
  const [count, setCount] = useState(0);

  /**
   * Увеличивает значение счетчика на 1.
   */
  const handleIncrement = () => setCount(prevCount => prevCount + 1);

  /**
   * Уменьшает значение счетчика на 1.
   */
  const handleDecrement = () => setCount(prevCount => prevCount - 1);

  /**
   * Сбрасывает значение счетчика на 0.
   */
  const handleReset = () => setCount(0);

  return (
    <div className="bg-white w-full max-w-md mx-auto border rounded-lg p-4 md:p-6 grid gap-4 text-center">
      <h1 className="text-2xl md:text-5xl font-bold">Counter</h1>
      <p className="text-6xl md:text-8xl font-bold">{count}</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <Button onClick={handleDecrement} className="border-red-400 text-red-400">
          DECREMENT
        </Button>
        <Button onClick={handleReset}>RESET</Button>
        <Button onClick={handleIncrement} className="border-green-400 text-green-400">
          INCREMENT
        </Button>
      </div>
    </div>
  );
}

export default Root;
