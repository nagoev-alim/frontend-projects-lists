import { useState, useCallback, useMemo, useEffect } from 'react';

/**
 * Компонент калькулятора.
 * @returns {JSX.Element} Возвращает JSX элемент калькулятора.
 */
const Root = () => {
  // Состояния для управления калькулятором
  const [output, setOutput] = useState('0');
  const [currentTotal, setCurrentTotal] = useState(0);
  const [currentOperator, setCurrentOperator] = useState('');
  const [isNewInputExpected, setIsNewInputExpected] = useState(false);

  /**
   * Объект с функциями для выполнения математических операций.
   * Использует useMemo для оптимизации производительности.
   */
  const calculate = useMemo(() => ({
    calculate: {
      '/': (a, b) => b !== 0 ? strip(a / b) : 'Error',
      '*': (a, b) => strip(a * b),
      '+': (a, b) => strip(a + b),
      '-': (a, b) => strip(a - b),
      '=': (_, b) => strip(b),
    },
  }), []);

  /**
   * Функция для округления числа до 12 значащих цифр.
   * @param {number} value - Число для округления.
   * @returns {number} Округленное число.
   */
  const strip = useCallback((value) => {
    return Number(value.toPrecision(12));
  }, []);

  /**
   * Обработчик нажатия на цифровую кнопку.
   * @param {string} digit - Нажатая цифра.
   */
  const handleDigitClick = useCallback((digit) => {
    if (isNewInputExpected) {
      setOutput(digit);
      setIsNewInputExpected(false);
    } else {
      setOutput(prevOutput => prevOutput === '0' ? digit : prevOutput + digit);
    }
  }, [isNewInputExpected]);

  /**
   * Обработчик нажатия на кнопку операции.
   * @param {string} operation - Выбранная операция.
   */
  const handleOperationClick = useCallback((operation) => {
    const currentOutput = Number(output);

    if (currentOperator && isNewInputExpected) {
      setCurrentOperator(operation);
      return;
    }

    if (currentTotal) {
      const calculation = calculate.calculate[currentOperator](currentTotal, currentOutput);
      setOutput(calculation.toString());
      setCurrentTotal(calculation);
    } else {
      setCurrentTotal(currentOutput);
    }

    setIsNewInputExpected(true);
    setCurrentOperator(operation || '');
  }, [output, currentOperator, isNewInputExpected, currentTotal, calculate.calculate]);

  /**
   * Обработчик нажатия на кнопку десятичной точки.
   */
  const handleDecimalClick = useCallback(() => {
    if (isNewInputExpected || output.includes('.')) return;
    setOutput(prevOutput => prevOutput + '.');
  }, [isNewInputExpected, output]);

  /**
   * Обработчик нажатия на кнопку очистки.
   */
  const handleClearClick = useCallback(() => {
    setCurrentTotal(0);
    setCurrentOperator('');
    setIsNewInputExpected(false);
    setOutput('0');
  }, []);

  /**
   * Эффект для обработки нажатий клавиш калькулятора.
   * Реагирует только на цифры, операторы и специальные клавиши калькулятора.
   */
  useEffect(() => {
    /**
     * Обработчик нажатия клавиш.
     * @param {KeyboardEvent} event - Событие нажатия клавиши.
     */
    const handleKeyPress = (event) => {
      const key = event.key;
      
      // Предотвращаем обработку клавиш, когда фокус на элементе ввода
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      // Массив допустимых клавиш
      const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '-', '*', '/', '.', 'Enter', 'Escape'];

      // Проверяем, является ли нажатая клавиша допустимой
      if (allowedKeys.includes(key)) {
        event.preventDefault(); // Предотвращаем стандартное поведение клавиши

        if (/[0-9]/.test(key)) {
          handleDigitClick(key);
        } else if (['+', '-', '*', '/'].includes(key)) {
          handleOperationClick(key);
        } else if (key === '.') {
          handleDecimalClick();
        } else if (key === 'Enter') {
          handleOperationClick('=');
        } else if (key === 'Escape') {
          handleClearClick();
        }
      }
    };

    // Добавляем слушатель события при монтировании компонента
    window.addEventListener('keydown', handleKeyPress);

    // Удаляем слушатель события при размонтировании компонента
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleDigitClick, handleOperationClick, handleDecimalClick, handleClearClick]);

  // JSX разметка калькулятора
  return (
    <div className='calculator grid w-full max-w-md gap-4 rounded border p-3 shadow'>
      <h1 className='text-center text-2xl font-bold'>Calculator</h1>
      <div className='container'>
        <div className='display'>
          <span className='text-3xl font-medium'>{output}</span>
        </div>
        <div className='body'>
          {['+', '-', '*', '/'].map(op => (
            <button key={op} className='operator' onClick={() => handleOperationClick(op)} aria-label={op === '*' ? 'multiply' : op === '/' ? 'divide' : op}>
              {op === '*' ? '×' : op === '/' ? '÷' : op}
            </button>
          ))}
          {[7, 8, 9, 4, 5, 6, 1, 2, 3, 0].map(digit => (
            <button key={digit} className='number' onClick={() => handleDigitClick(digit.toString())} aria-label={digit.toString()}>
              {digit}
            </button>
          ))}
          <button className='decimal' onClick={handleDecimalClick} aria-label="decimal">.</button>
          <button className='clear' onClick={handleClearClick} aria-label="clear">C</button>
          <button className='equal operator' onClick={() => handleOperationClick('=')} aria-label="equals">=</button>
        </div>
      </div>
    </div>
  );
};

export default Root;
