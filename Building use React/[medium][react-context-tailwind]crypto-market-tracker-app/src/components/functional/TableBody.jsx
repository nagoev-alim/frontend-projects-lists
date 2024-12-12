/**
 * @module TableBody
 * @description Модуль, содержащий компонент TableBody для отображения данных о криптовалютах в табличном формате.
 */
import { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useCryptoMarketContext, useModalContext } from '../../hooks/index.js';
import { cryptoMarketActions, modalActions } from '../../context/index.js';

/**
 * @function TableBody
 * @description Компонент для отображения тела таблицы с данными о криптовалютах.
 *
 * @returns {React.ReactElement} Возвращает JSX элемент, представляющий тело таблицы.
 *
 * @description
 * Компонент использует следующие хуки и данные:
 * - useCryptoMarketContext: для получения списка криптовалют (items) и функции dispatch.
 * - useModalContext: для получения функции dispatch для управления модальным окном.
 * - useCallback: для оптимизации функции handleGetItemClick.
 * - useMemo: для оптимизации рендеринга строк таблицы.
 *
 * Структура отображаемых данных для каждой криптовалюты:
 * - Символ и изображение криптовалюты
 * - Название
 * - Текущая цена
 * - Процент изменения цены за 24 часа
 * - Общий объем торгов
 * - Рыночная капитализация
 * - Индикатор тренда (рост/падение)
 *
 * Компонент также включает обработку клика по символу криптовалюты для открытия модального окна с подробной информацией.
 *
 * Оптимизация производительности:
 * - Использование useCallback для мемоизации функции handleGetItemClick.
 * - Использование useMemo для мемоизации компонента строки таблицы (RowComponent).
 * - Использование key для оптимизации рендеринга списка элементов.
 */
const TableBody = () => {
  /**
   * @typedef {Object} CryptoMarketContextProps
   * @property {Array} items - Массив объектов с данными о криптовалютах.
   * @property {Function} dispatch - Функция для отправки действий в контекст криптовалютного рынка.
   */

  /** @type {CryptoMarketContextProps} */
  const { items, dispatch: cryptoDispatch } = useCryptoMarketContext();

  /**
   * @typedef {Object} ModalContextProps
   * @property {Function} dispatch - Функция для отправки действий в контекст модального окна.
   */

  /** @type {ModalContextProps} */
  const { dispatch: modalDispatch } = useModalContext();

  /** @type {Function} Функция для получения данных о криптовалюте по ID */
  const { fetchById } = cryptoMarketActions;

  /** @type {Function} Функция для управления состоянием модального окна */
  const { handleToggleModal } = modalActions;

  /**
   * @function handleGetItemClick
   * @description Обработчик клика по элементу криптовалюты. Получает подробные данные и открывает модальное окно.
   * @param {string} id - Идентификатор криптовалюты.
   */
  const handleGetItemClick = useCallback(async (id) => {
    const content = await fetchById(cryptoDispatch, id);
    handleToggleModal(modalDispatch, { isOpen: true, content });
  }, [cryptoDispatch, fetchById, handleToggleModal, modalDispatch]);

  /**
   * @function renderTableRow
   * @description Мемоизированная функция для рендеринга строки таблицы с данными о криптовалюте.
   * @returns {Function} Возвращает компонент RowComponent для рендеринга строки таблицы.
   *
   * @memoized Использует useMemo для оптимизации производительности.
   */
  const renderTableRow = useMemo(() => {
    /**
     * @function RowComponent
     * @description Компонент для отображения строки таблицы с данными о криптовалюте.
     *
     * @param {Object} props - Свойства компонента.
     * @param {string} props.id - Уникальный идентификатор криптовалюты.
     * @param {string} props.name - Название криптовалюты.
     * @param {string} props.image - URL изображения криптовалюты.
     * @param {number} props.current_price - Текущая цена криптовалюты.
     * @param {number} props.price_change_percentage_24h - Процентное изменение цены за 24 часа.
     * @param {number} props.total_volume - Общий объем торгов.
     * @param {number} props.market_cap - Рыночная капитализация.
     * @param {string} props.symbol - Символ криптовалюты.
     *
     * @returns {React.ReactElement} JSX элемент, представляющий строку таблицы.
     */
    const RowComponent = ({
                            id,
                            name,
                            image,
                            current_price,
                            price_change_percentage_24h,
                            total_volume,
                            market_cap,
                            symbol,
                          }) => (
      <tr key={id} className="bg-white divide-x divide-gray-200">
        <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <img className="w-5 h-5 md:w-10 md:h-10" src={image} alt={name} />
            <button
              className="text-blue-500 transition-all hover:text-blue-400"
              onClick={() => handleGetItemClick(id)}
            >
              {symbol.toUpperCase()}
            </button>
          </div>
        </td>
        <td className="p-3 text-sm text-gray-700 whitespace-nowrap font-semibold">{name}</td>
        <td className="p-3 text-sm text-gray-700 whitespace-nowrap">${current_price.toLocaleString()}</td>
        <td className="p-3 text-sm text-gray-700 whitespace-nowrap">{price_change_percentage_24h.toFixed(2)}%</td>
        <td className="p-3 text-sm text-gray-700 whitespace-nowrap">${total_volume.toLocaleString()}</td>
        <td className="p-3 text-sm text-gray-700 whitespace-nowrap">${market_cap.toLocaleString()}</td>
        <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
        <span
          className={`p-1.5 text-xs font-semibold uppercase tracking-wider rounded-lg ${price_change_percentage_24h > 0 ? 'text-green-800 bg-green-200' : 'text-red-800 bg-red-200'}`}>
          {price_change_percentage_24h > 0 ? 'Upward Trend' : 'Downward Trend'}
        </span>
        </td>
      </tr>
    );
    /**
     * @constant {Object} RowComponent.propTypes
     * @description Определение типов свойств для компонента RowComponent с использованием PropTypes.
     */
    RowComponent.propTypes = {
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      image: PropTypes.string.isRequired,
      current_price: PropTypes.number.isRequired,
      price_change_percentage_24h: PropTypes.number.isRequired,
      total_volume: PropTypes.number.isRequired,
      market_cap: PropTypes.number.isRequired,
      symbol: PropTypes.string.isRequired,
    };

    return RowComponent;
  }, [handleGetItemClick]);

  return (
    <tbody className="divide-y divide-gray-200">
    {items.map(renderTableRow)}
    </tbody>
  );
};

export default TableBody;
