/**
 * Компонент AddTransaction для добавления новой транзакции.
 * @param {Object} props - Свойства компонента.
 * @param {Function} props.onSubmit - Функция-обработчик отправки формы.
 * @param {string} props.inputName - Значение поля ввода для названия транзакции.
 * @param {string|number} props.inputAmount - Значение поля ввода для суммы транзакции.
 * @param {Function} props.onNameChange - Функция-обработчик изменения названия транзакции.
 * @param {Function} props.onAmountChange - Функция-обработчик изменения суммы транзакции.
 * @returns {JSX.Element} JSX элемент формы для добавления новой транзакции.
 *
 * @description
 * Этот компонент отображает форму для добавления новой транзакции.
 * Форма содержит поля ввода для текста и суммы транзакции, а также кнопку отправки.
 * Компонент использует переданные через пропсы функции для обработки изменений в полях ввода и отправки формы.
 */
const AddTransaction = ({ onSubmit, inputName, inputAmount, onNameChange, onAmountChange }) => (
  <>
    <h5 className="bg-slate-50 border font-bold p-2 rounded">Add new transaction</h5>
    <form className="gap-3 grid" onSubmit={onSubmit}>
      <label className="grid gap-1">
        <span className="font-medium text-sm">Text</span>
        <input
          className="border-2 focus:border-blue-400 focus:outline-none px-3 py-2.5 rounded"
          autoComplete="off"
          type="text"
          id="text"
          name="text"
          placeholder="Enter text"
          value={inputName}
          onChange={onNameChange}
          required
        />
      </label>
      <label className="grid gap-1">
        <span className="font-medium text-sm">Amount</span>
        <input
          className="border-2 focus:border-blue-400 focus:outline-none px-3 py-2.5 rounded"
          autoComplete="off"
          type="number"
          id="amount"
          name="amount"
          placeholder="Amount (negative - expense, positive - income)"
          value={inputAmount}
          onChange={onAmountChange}
          required
        />
      </label>
      <button
        className="bg-slate-100 border hover:bg-slate-200 px-3 py-2.5 transition duration-300 ease-in-out"
        type="submit"
      >
        Add transaction
      </button>
    </form>
  </>
);

export default AddTransaction;
