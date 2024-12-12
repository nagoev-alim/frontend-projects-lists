import { v4 as uuidv4 } from 'uuid';
import { useCallback, useEffect, useState } from 'react';
import { AddTransaction, IncomeExpense, TransactionList } from '@functional';
import { showToast } from '@utils';

/**
 * Компонент Root для отслеживания расходов и доходов.
 * @returns {JSX.Element} Возвращает JSX элемент компонента Root.
 */
const Root = () => {
  // Состояние для хранения списка транзакций.
  const [transactions, setTransactions] = useState([]);

  // Состояние для хранения текущих сумм баланса, дохода и расхода.
  const [amount, setAmount] = useState({
    total: '$0.00',
    income: '+$0.00',
    expense: '-$0.00',
  });

  // Состояние для хранения введенного названия транзакции.
  const [inputName, setInputName] = useState('');

  // Состояние для хранения введенной суммы транзакции.
  const [inputAmount, setInputAmount] = useState('');

  /**
   * Получает массив транзакций из локального хранилища.
   * @returns {Array} Массив объектов транзакций. Возвращает пустой массив, если данных нет.
   */
  const localStorageGet = () => {
    return JSON.parse(localStorage.getItem('transactions') || '[]');
  };

  /**
   * Сохраняет массив транзакций в локальное хранилище.
   * @param {Array} transactions - Массив объектов транзакций для сохранения.
   */
  const localStorageSet = (transactions) => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  };

  /**
   * @function updateBalance
   * Обновляет баланс на основе текущих транзакций.
   * @description
   * Эта функция вычисляет общий баланс, доход и расход на основе текущих транзакций.
   * Она использует вспомогательную функцию calculateTotal для вычисления сумм.
   * После вычислений, функция обновляет состояние amount с новыми значениями.
   */
  const updateBalance = useCallback(() => {
    /**
     * @function calculateTotal
     * Вычисляет общую сумму транзакций, соответствующих заданному предикату.
     * @returns {string} Сумма транзакций, округленная до двух знаков после запятой.
     */
    const calculateTotal = (predicate = () => true) =>
      transactions
        .map(({ amount }) => amount)
        .filter(predicate)
        .reduce((acc, item) => acc + item, 0)
        .toFixed(2);

    const total = calculateTotal();
    const income = calculateTotal((item) => item > 0);
    const expense = Math.abs(calculateTotal((item) => item < 0));

    setAmount({
      total: `$${total}`,
      income: `+$${income}`,
      expense: `-$${expense}`,
    });
  }, [transactions]);

  /**
   * @function loadTransactionsEffect
   * Загружает транзакции из локального хранилища при монтировании компонента.
   * @description
   * Этот эффект выполняется только один раз при монтировании компонента.
   * Он извлекает сохраненные транзакции из локального хранилища с помощью
   * функции APP_UTILS.localStorageGet() и обновляет состояние transactions.
   */
  useEffect(() => {
    const storedTransactions = localStorageGet();
    setTransactions(storedTransactions);
  }, []);

  /**
   * @function updateBalanceEffect
   * Эффект для обновления баланса при изменении транзакций.
   * @description
   * Этот эффект вызывается каждый раз, когда изменяется массив транзакций
   * или функция updateBalance. Он обеспечивает актуальность отображаемого баланса.
   */
  useEffect(() => {
    updateBalance();
  }, [transactions, updateBalance]);


  /**
   * @function handleFieldChange
   * Создает обработчик изменения значения поля ввода.
   * @description
   * Эта функция создает и возвращает обработчик события изменения поля ввода.
   * Она использует переданную функцию setter для обновления соответствующего состояния.
   * Если тип поля ввода - число, значение преобразуется в Number перед обновлением состояния.
   */
  const handleFieldChange = useCallback((setter) => (event) => {
    const { value, type } = event.target;
    setter(type === 'number' ? Number(value) : value);
  }, []);

  /**
   * @function handleFormSubmit
   * Обрабатывает отправку формы добавления новой транзакции.
   * @description
   * Эта функция вызывается при отправке формы добавления новой транзакции.
   * Она выполняет валидацию введенных данных, создает новую транзакцию,
   * обновляет состояние приложения и очищает поля ввода.
   */
  const handleFormSubmit = useCallback((e) => {
    e.preventDefault();

    const trimmedName = inputName.trim();
    if (!trimmedName) {
      showToast('Please enter a valid transaction name.', 'error');
      return;
    }

    const amount = parseFloat(inputAmount);
    if (isNaN(amount) || amount === 0) {
      showToast('Please enter a valid non-zero amount.', 'error');
      return;
    }

    const newTransaction = {
      id: uuidv4(),
      text: trimmedName,
      amount: amount,
    };

    setTransactions(prevTransactions => {
      const updatedTransactions = [...prevTransactions, newTransaction];
      localStorageSet(updatedTransactions);
      return updatedTransactions;
    });

    setInputName('');
    setInputAmount('');
    showToast('Transaction added successfully', 'success');
  }, [inputName, inputAmount]);


  /**
   * @function handleDeleteButtonClick
   * Обрабатывает удаление транзакции.
   * @description
   * Эта функция вызывается при нажатии на кнопку удаления транзакции.
   * Она запрашивает подтверждение у пользователя, затем удаляет транзакцию
   * из списка, обновляет локальное хранилище и показывает уведомление об успешном удалении.
   */
  const handleDeleteButtonClick = useCallback((id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;

    setTransactions(prevTransactions => {
      const updatedTransactions = prevTransactions.filter(transaction => transaction.id !== id);
      localStorageSet(updatedTransactions);
      return updatedTransactions;
    });

    showToast('Transaction deleted successfully', 'success');
  }, []);

  return (
    <div className="bg-white border gap-4 grid max-w-md p-3 rounded shadow w-full">
      <h1 className="font-bold md:text-4xl text-2xl text-center">Expense Tracker</h1>
      <div className="gap-3 grid">
        <header className="bg-slate-50 border rounded p-4 text-center">
          <h2 className="text-2xl font-bold mb-2">Your Balance</h2>
          <p className="text-3xl font-bold">{amount.total}</p>
        </header>
        <IncomeExpense income={amount.income} expense={amount.expense} />
        <TransactionList
          transactions={transactions}
          onDeleteTransaction={handleDeleteButtonClick}
        />
        <AddTransaction
          onSubmit={handleFormSubmit}
          inputName={inputName}
          inputAmount={inputAmount}
          onNameChange={handleFieldChange(setInputName)}
          onAmountChange={handleFieldChange(setInputAmount)}
        />
      </div>
    </div>
  );
};

export default Root;
