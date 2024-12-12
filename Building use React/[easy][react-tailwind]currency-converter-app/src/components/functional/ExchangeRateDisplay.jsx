/**
 * Компонент для отображения строки таблицы с информацией о курсе обмена.
 * @param {Object} props - Свойства компонента.
 * @param {string} props.label - Метка для отображения в первой ячейке строки.
 * @param {string|number} props.value - Значение для отображения во второй ячейке строки.
 * @returns {JSX.Element} JSX элемент, представляющий строку таблицы с информацией о курсе обмена.
 */
const ExchangeRateRow = ({ label, value }) => (
  <tr>
    <td className="border p-2 bg-neutral-50 font-medium">{label}</td>
    <td className="border p-2">{value}</td>
  </tr>
);

/**
 * Компонент для отображения информации об обменном курсе валют.
 * @param {Object} props - Свойства компонента.
 * @param {boolean} props.isFetched - Флаг, указывающий, идет ли процесс получения курса.
 * @param {Object|null} props.exchangeRate - Объект с данными об обменном курсе.
 * @param {string} props.fromCurrency - Код исходной валюты.
 * @param {string} props.toCurrency - Код целевой валюты.
 * @param {number} props.amount - Сумма для обмена.
 * @returns {JSX.Element} React-компонент для отображения информации об обменном курсе.
 */
const ExchangeRateDisplay = ({ isFetched, exchangeRate, fromCurrency, toCurrency, amount }) => (
  <div>
    {/* Отображаем сообщение, если идет процесс получения курса */}
    {isFetched && 'Getting exchange rate...'}
    
    {/* Отображаем таблицу с информацией, если данные о курсе получены */}
    {exchangeRate && (
      <table className="table-auto w-full">
        <tbody>
          {/* Строка с датой курса */}
          <ExchangeRateRow label="Date" value={exchangeRate.date} />
          
          {/* Строка с курсом обмена */}
          <ExchangeRateRow
            label="Rate"
            value={`1 ${fromCurrency} = ${exchangeRate.rate} ${toCurrency}`}
          />
          
          {/* Строка с результатом обмена для указанной суммы */}
          <ExchangeRateRow
            label="Exchange"
            value={`${amount} ${fromCurrency} = ${exchangeRate.result} ${toCurrency}`}
          />
        </tbody>
      </table>
    )}
  </div>
);

export default ExchangeRateDisplay;
