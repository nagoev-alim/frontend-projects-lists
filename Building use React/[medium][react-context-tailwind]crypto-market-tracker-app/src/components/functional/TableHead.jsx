/**
 * @module TableHead
 * @description Модуль, содержащий компонент TableHead для отображения заголовка таблицы с данными о криптовалютах.
 */

import { useCryptoMarketContext } from '../../hooks/index.js';
import { cryptoMarketActions } from '../../context/index.js';

/**
 * @function TableHead
 * @description Компонент для отображения заголовка таблицы с данными о криптовалютах.
 * 
 * @returns {React.ReactElement} Возвращает JSX элемент, представляющий заголовок таблицы.
 * 
 * @description
 * Компонент использует следующие хуки и данные:
 * - useCryptoMarketContext: для получения функции dispatch из контекста криптовалютного рынка.
 * - cryptoMarketActions: для получения функции handleSortType для обработки сортировки.
 * 
 * Структура отображаемых данных:
 * - Монета (Coin)
 * - Название (Name)
 * - Цена (Price)
 * - Изменение за 24 часа (24h)
 * - Объем (Volume)
 * - Рыночная капитализация (Mkt Cap)
 * - Тренд цены (Price Trend)
 * 
 * Каждый заголовок таблицы является кликабельным и при нажатии вызывает функцию сортировки.
 */
const TableHead = () => {
  const { dispatch } = useCryptoMarketContext();
  const { handleSortType } = cryptoMarketActions;

  /**
   * @constant {Array<Object>} headers
   * @description Массив объектов, представляющих заголовки таблицы.
   * @property {string} key - Ключ для идентификации столбца.
   * @property {string} label - Отображаемый текст заголовка.
   */
  const headers = [
    { key: 'id', label: 'Coin' },
    { key: 'name', label: 'Name' },
    { key: 'current_price', label: 'Price' },
    { key: 'price_change_percentage_24h', label: '24h' },
    { key: 'total_volume', label: 'Volume' },
    { key: 'market_cap', label: 'Mkt Cap' },
    { key: 'price_trend', label: 'Price Trend' },
  ];

  /**
   * @function renderHeaderCell
   * @description Функция для рендеринга отдельной ячейки заголовка.
   * @param {Object} props - Свойства ячейки заголовка.
   * @param {string} props.key - Ключ для идентификации столбца.
   * @param {string} props.label - Отображаемый текст заголовка.
   * @returns {React.ReactElement} Возвращает JSX элемент, представляющий ячейку заголовка.
   */
  const renderHeaderCell = ({ key, label }) => (
    <th
      key={key}
      className="p-3 text-sm font-semibold tracking-wide text-left uppercase cursor-pointer transition-all hover:bg-slate-400 hover:text-white"
      onClick={() => handleSortType(dispatch, key)}
    >
      {label}
    </th>
  );

  return (
    <thead className="bg-gray-200 bottom-b-2 border-gray-200">
      <tr className="divide-x divide-gray-300 text-slate-600">
        {headers.map(renderHeaderCell)}
      </tr>
    </thead>
  );
};

export default TableHead;
