import React, { useCallback, useMemo, useState } from 'react';
import { showToast } from '@utils';
import { Button, Input } from '@ui';

/**
 * Хук для создания функции расчета кредита.
 * @returns {Function} Функция для расчета кредита.
 */
const useLoanCalculator = () => {
  return useCallback((amount, interest, repay) => {
    // Расчет параметров кредита
    const principal = amount;
    const monthlyInterest = interest / 100 / 12;
    const totalPayments = repay * 12;

    // Расчет ежемесячного платежа
    const x = Math.pow(1 + monthlyInterest, totalPayments);
    const monthlyPayment = (principal * x * monthlyInterest) / (x - 1);

    // Возвращаем результаты расчета
    return {
      monthly: monthlyPayment,
      total: monthlyPayment * totalPayments,
      totalInterest: (monthlyPayment * totalPayments) - principal,
    };
  }, []);
};

/**
 * Корневой компонент калькулятора кредита.
 * @returns {JSX.Element} Разметка компонента калькулятора кредита.
 */
const Root = () => {
  // Состояние для хранения данных формы
  const [formData, setFormData] = useState({
    amount: '',
    interest: '',
    repay: '',
  });

  // Состояние для хранения результатов расчета
  const [results, setResults] = useState({ monthly: 0, total: 0, totalInterest: 0 });

  // Состояние для отображения индикатора загрузки
  const [isLoading, setIsLoading] = useState(false);

  // Состояние для управления отображением результатов
  const [showResults, setShowResults] = useState(false);

  // Получаем функцию расчета кредита из хука
  const calculateLoan = useLoanCalculator();

  /**
   * Обработчик отправки формы.
   * @param {Event} event - Событие отправки формы.
   */
  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    const { amount, interest, repay } = formData;

    // Валидация введенных данных
    if (!amount || !interest || !repay || !/^\d+(\.\d{1,2})?$/.test(amount) || !/^\d+(\.\d{1,2})?$/.test(interest) || !/^\d+$/.test(repay)) {
      showToast('Please fill in all fields correctly', 'error');
      return;
    }

    // Установка состояния загрузки и отображения результатов
    setIsLoading(true);
    setShowResults(true);

    // Расчет кредита и обновление результатов
    const result = calculateLoan(Number(amount), Number(interest), Number(repay));
    setResults(result);
    setIsLoading(false);
    event.target.reset();
  }, [calculateLoan, formData]);

  // Мемоизация результатов для оптимизации производительности
  const memoizedResults = useMemo(() => ({
    monthly: results.monthly,
    total: results.total,
    totalInterest: results.totalInterest,
  }), [results]);

  /**
   * Обработчик изменения данных формы.
   * @param {Event} event - Событие изменения input.
   */
  const handleChangeFormData = useCallback((event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  }, [formData]);

  return (
    <div className="grid max-w-md w-full gap-4 rounded border bg-white p-3 shadow">
      <h1 className="text-center text-2xl font-bold">Loan Calculator</h1>
      <form className="grid gap-3" onSubmit={handleSubmit}>
        <Input type="number" name="amount" placeholder="Loan amount" value={formData.amount}
               onChange={handleChangeFormData} />
        <Input type="number" name="interest" placeholder="Interest" value={formData.interest}
               onChange={handleChangeFormData} />
        <Input type="number" name="repay" placeholder="Years to repay" value={formData.repay}
               onChange={handleChangeFormData} />
        <Button type="submit">
          {isLoading ? 'Loading...' : 'Loan Calculator'}
        </Button>
      </form>
      {showResults && (
        <ul
          className={`grid items-start gap-2 overflow-hidden place-items-center transition-all ${showResults ? 'h-[210px]' : 'h-0'}`}>
          {[
            { label: 'Monthly Payments', value: memoizedResults.monthly },
            { label: 'Total Principal Paid', value: memoizedResults.total },
            { label: 'Total Interest Paid', value: memoizedResults.totalInterest },
          ].map(({ label, value }) => (
            <li className="grid gap-2 text-center" key={label}>
              <p className="font-medium">{label}:</p>
              <p className="text-2xl font-bold"><sup>$</sup>{value.toFixed(2)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Root;
