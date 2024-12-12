import { IoCloseSharp } from 'react-icons/io5';

/**
 * Компонент TransactionList отображает список транзакций.
 * @param {Object} props - Свойства компонента.
 * @param {Array} props.transactions - Массив объектов транзакций для отображения.
 * @param {Function} props.onDeleteTransaction - Функция обратного вызова для удаления транзакции.
 * @returns {JSX.Element} Возвращает JSX элемент, отображающий список транзакций или пустой фрагмент, если транзакций нет.
 * @description
 * Этот компонент отображает список транзакций, если они есть. Каждая транзакция представлена
 * в виде элемента списка с текстом, суммой и кнопкой удаления. Положительные и отрицательные
 * транзакции стилизуются по-разному. Компонент использует условный рендеринг для отображения
 * содержимого только при наличии транзакций.
 */
const TransactionList = ({ transactions, onDeleteTransaction }) => (
  <>
    {transactions.length > 0 && (
      <>
        <h5 className="bg-slate-50 border font-bold p-2 rounded">History</h5>
        <ul className="gap-2 grid max-h-[200px] overflow-auto">
          {transactions.map(({ id, text, amount }) => {
            const isNegative = amount < 0;
            const itemClass = `border-2 flex p-2 gap-2 rounded ${
              isNegative ? 'bg-red-50 border-red-500' : 'bg-green-50 border-green-500'
            }`;
            const amountText = `${isNegative ? '-' : '+'}$${Math.abs(amount).toFixed(2)}`;
            const amountClass = `ml-auto font-bold ${isNegative ? 'text-red-400' : 'text-green-400'}`;

            return (
              <li key={id} className={itemClass}>
                <p className="flex-grow">{text}</p>
                <span className={amountClass}>{amountText}</span>
                <button
                  onClick={() => onDeleteTransaction(id)}
                  aria-label="Delete transaction"
                  className="focus:outline-none focus:ring-2 focus:ring-blue-300 rounded"
                >
                  <span className="pointer-events-none">
                    <IoCloseSharp size={25} />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </>
    )}
  </>
);


export default TransactionList;
