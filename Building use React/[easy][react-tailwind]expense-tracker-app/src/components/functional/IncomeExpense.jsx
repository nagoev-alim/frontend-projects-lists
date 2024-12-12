/**
 * Компонент IncomeExpense отображает информацию о доходах и расходах.
 * @param {Object} props - Свойства компонента.
 * @param {string} props.income - Строка, представляющая общий доход.
 * @param {string} props.expense - Строка, представляющая общий расход.
 * @returns {JSX.Element} Возвращает JSX элемент, отображающий доходы и расходы в виде списка.
 * @description
 * Этот компонент создает список с двумя элементами: доходы и расходы.
 * Каждый элемент содержит метку и соответствующее значение.
 * Компонент использует классы Tailwind CSS для стилизации и динамически
 * определяет цвет текста для значений (зеленый для дохода, красный для расхода).
 */
const IncomeExpense = ({ income, expense }) => (
  <ul className="grid grid-cols-2">
    {[
      { type: 'plus', label: 'Income', value: income },
      { type: 'minus', label: 'Expense', value: expense },
    ].map(({ type, label, value }, index) => (
      <li key={index} className="flex flex-col">
        <p className="border flex font-bold items-center justify-center p-3">{label}</p>
        <p
          className={`border flex font-bold items-center justify-center p-3 text-lg ${
            type === 'plus' ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {value}
        </p>
      </li>
    ))}
  </ul>
);

export default IncomeExpense;
